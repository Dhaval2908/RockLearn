const express = require('express');
const router = express.Router();
const { getRepoList, createLab } = require('../controllers/homepageController');
const multer = require('multer'); // Handle file uploads
const { protect } = require('../middlewares/authMiddleware');
const upload = multer({ dest: 'uploads/' });
const Lab = require('../models/Metadata');
const User = require('../models/userModel');

// GET route for paginated metadata
router.get('/home', protect, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 3; // Fixed limit of 3 items per page
    const skip = (page - 1) * limit;

    try {
        // Fetching metadata with pagination
        const metadata = await Lab.find().skip(skip).limit(limit);
        const total = await Lab.countDocuments();

        res.json({
            metadata,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching repositories' });
    }
});


// GET route for repo list and metadata
router.get('/', protect, getRepoList);

// POST route for creating a lab
router.post('/create-lab', protect, upload.array('folder'), createLab);

// POST route for liking a lab
router.post('/:id/like', protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // User ID is now available from middleware

    try {
        const lab = await Lab.findById(id);
        const user = await User.findById(userId);

        if (!lab || !user) {
            return res.status(404).json({ success: false, message: 'Lab or user not found' });
        }

        const alreadyLiked = lab.likedBy.includes(userId);

        if (alreadyLiked) {
            lab.likedBy.pull(userId);
            lab.totalLikes -= 1;
            user.likedLabs.pull(lab._id);
        } else {
            lab.likedBy.push(userId);
            lab.totalLikes += 1;
            user.likedLabs.push(lab._id);
        }

        await lab.save();
        await user.save();

        res.json({ success: true, liked: !alreadyLiked });
    } catch (error) {
        console.error('Error updating likes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST route for marking a lab as visited
router.post('/:id/visit', protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // User ID is now available from middleware

    try {
        const lab = await Lab.findById(id);
        const user = await User.findById(userId);

        if (!lab) {
            return res.status(404).json({ success: false, message: 'Lab not found' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.visitedLabs.includes(id)) {
            lab.visitedBy.push(userId);
            user.visitedLabs.push(id);
            await user.save();

            lab.totalVisits += 1;
            await lab.save();
        }

        res.json({ success: true, message: 'Lab marked as visited' });
    } catch (error) {
        console.error('Error marking lab as visited:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
