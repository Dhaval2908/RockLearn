const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Metadata = require('../models/Metadata'); // Adjust the path to your Metadata model


const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_UNAME;
const MONGODB_URI = process.env.MONGODB_URI;


// Function to get headers with the authentication token
const getAuthHeaders = () => ({
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
});

// Function to save metadata to MongoDB and remove outdated entries
const saveMetadata = async (newMetadata, isForFrontend = false) => {
  newMetadata = Array.isArray(newMetadata) ? newMetadata : [newMetadata];

  // console.log('New Metadata:', newMetadata);

  try {
    // Keep track of URLs in the new metadata
    const newUrls = newMetadata.map(data => data.url);

    for (let data of newMetadata) {
      // Ensure tags is always an array, even if it is passed as a string
      if (typeof data.tags === 'string') {
        data.tags = data.tags === 'No tags available' ? [] : data.tags.split(',').map(tag => tag.trim());
      }

      // Find existing document by title or URL and update if it exists
      const existing = await Metadata.findOneAndUpdate(
        { $or: [{ url: data.url }, { title: data.title }] },
        { $set: data },
        { new: true, upsert: true }
      );

      // If no existing document was updated, insert the new one
      if (!existing) {
        const metadata = new Metadata(data);
        await metadata.save();
      }
    }

    // Only remove outdated entries if the function is called for sending data to the frontend
    if (isForFrontend) {
      await Metadata.deleteMany({ url: { $nin: newUrls } });
      // console.log('Outdated entries removed from MongoDB');
    }

    // console.log('Metadata saved to MongoDB');
  } catch (error) {
    console.error('Error saving metadata to MongoDB:', error);
  }
};



async function getRepoList(req, res) {
  try {
    const userId = req.user?.id; // User ID from middleware (e.g., JWT)
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
      headers: getAuthHeaders(),
    });
    const repositories = response.data;

    // Fetch metadata from MongoDB
    const metadataEntries = await Metadata.find();

    const repoData = repositories.map((repo) => {
      const metadataEntry = metadataEntries.find((m) => m.title === repo.name);

      let tags = [];
      if (metadataEntry) {
        tags =
          Array.isArray(metadataEntry.tags) && metadataEntry.tags.length > 0
            ? metadataEntry.tags
            : ['No tags available'];
      } else {
        tags = ['No tags available'];
      }

      return {
        _id: metadataEntry ? metadataEntry._id : null, // Ensure _id is either null or valid
        title: repo.name,
        url: repo.html_url,
        description: repo.description || 'No description available',
        tags,
        totalLikes: metadataEntry ? metadataEntry.totalLikes : 0,
        totalVisits: metadataEntry ? metadataEntry.totalVisits : 0,
        likedByUser: metadataEntry && userId && Array.isArray(metadataEntry.likedBy)
          ? metadataEntry.likedBy.map(String).includes(userId.toString())
          : false, // Ensure userId matches
      };
    });

    // Filter out invalid repositories (missing _id)
    const validRepos = repoData.filter((repo) => repo._id !== null);

    // Save metadata and clean outdated entries
    await saveMetadata(validRepos, true);

    res.json({ repoNames: repositories.map((repo) => repo.name), metadata: validRepos });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ message: 'An error occurred while fetching repositories.', error: error.message });
  }
}




// Route to create a new repository and send JSON response
async function createLab(req, res) {
  const { labName } = req.body;
  const folderPath = req.files.folder;

  try {
    const repoResponse = await axios.post(
      `https://api.github.com/user/repos`,
      { name: labName, private: false },
      { headers: getAuthHeaders() }
    );

    const uploadFolder = async (folder, repoName, pathPrefix = '') => {
      for (let file of folder) {
        const filePath = path.join(__dirname, file.name);
        const content = fs.readFileSync(filePath, 'base64');

        await axios.put(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${pathPrefix}${file.name}`,
          { message: `add ${file.name}`, content: content },
          { headers: getAuthHeaders() }
        );
      }
    };

    await uploadFolder(folderPath, labName);

    res.json({ message: 'Repository created successfully', repoName: labName });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ message: 'An error occurred while creating the repository.', error: error.message });
  }
}

module.exports = { getRepoList, createLab, saveMetadata };
