import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './home.css';
import { useAuth } from '../context/AuthContext';
import { FaGithub, FaHeart, FaDownload } from 'react-icons/fa';


const HomePage = () => {
    const [repoDetails, setRepoDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Number of items per page
    const totalPages = Math.ceil(repoDetails.length / itemsPerPage);

    const getToken = () => localStorage.getItem('TOKEN');

    const fetchAllRepos = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const response = await fetch('http://localhost:3001/home', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data && Array.isArray(data.metadata)) {
                setRepoDetails(data.metadata);
            } else {
                setError('Invalid data format from server');
            }
        } catch (error) {
            setError('Error fetching repositories');
            console.error('Error fetching repositories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllRepos();
    }, []);

    const markRepoVisited = async (repoId) => {
        try {
            const token = getToken();
            await fetch(`http://localhost:3001/home/${repoId}/visit`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Error marking repository as visited:', error);
        }
    };

    const handleLike = async (repoId) => {
        if (!user?.id) {
            console.error('User ID is not available');
            return;
        }

        setRepoDetails((prevDetails) =>
            prevDetails.map((repo) =>
                repo._id === repoId
                    ? {
                          ...repo,
                          likedByUser: !repo.likedByUser,
                          totalLikes: repo.likedByUser ? repo.totalLikes - 1 : repo.totalLikes + 1,
                      }
                    : repo
            )
        );

        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3001/home/${repoId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!data.success) {
                fetchAllRepos(); // Revert on server error
            }
        } catch (error) {
            console.error('Error liking/unliking repository:', error);
            fetchAllRepos(); // Revert on error
        }
    };

    const fetchData = async (query) => {
        if (query.trim() === '') {
            fetchAllRepos();
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3001/api/metadata/search?q=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data && Array.isArray(data)) {
                setRepoDetails(data.filter((repo) => repo && repo._id));
            } else {
                setRepoDetails([]);
            }
        } catch (error) {
            setError('Error fetching repositories');
            console.error('Error fetching repositories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            fetchAllRepos();
        } else {
            fetchData(searchQuery);
        }
    }, [searchQuery]);

    const getInitials = (repoName) => {
        if (!repoName || typeof repoName !== 'string') return '';
        const words = repoName.trim().split(' ');
        return words.length > 1
            ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
            : repoName[0].toUpperCase();
    };
    

    // Get paginated data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRepos = repoDetails.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <Header />
            <div className="content-area w-11/12 md:w-4/5 p-6 mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-red-500">Repositories</h1>

                <div className="mb-6 flex justify-center">
                    <input
                        type="text"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border p-3 rounded-lg shadow-md w-full md:w-2/3 lg:w-1/2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                {loading && <div className="text-center text-lg">Loading...</div>}
                <div className="repo-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {currentRepos.map((repo) => (
                        <div
                            key={repo._id}
                            className="repo-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transform transition-transform hover:scale-105"
                        >
                            <Link
                                to={`/lab/${repo.title}`}
                                onClick={() => markRepoVisited(repo._id)}
                                className="block text-center"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 mb-4 mx-auto flex justify-center items-center rounded-full bg-red-500 text-white text-2xl font-bold">
                                    {getInitials(repo.title)}
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900">{repo.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {repo.tags?.length ? `Tags: ${repo.tags.join(', ')}` : 'No tags available'}
                                </p>
                            </Link>
                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    className={`flex items-center text-sm ${repo.likedByUser ? 'text-red-500' : 'text-gray-500'}`}
                                    onClick={() => handleLike(repo._id)}
                                >
                                    <FaHeart className="mr-2" />
                                    {repo.totalLikes}
                                </button>
                                <a
                                    href={`${repo.url}/archive/refs/heads/main.zip`}
                                    className="text-gray-500 hover:text-red-500"
                                    download
                                >
                                    <FaDownload className="w-5 h-5" />
                                </a>
                                <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <FaGithub className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 rounded-lg ${
                                currentPage === index + 1 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
