import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [likedLabs, setLikedLabs] = useState([]);
    const [visitedLabs, setVisitedLabs] = useState([]);
    const navigate = useNavigate();

    // Pagination states for liked labs
    const [likedPage, setLikedPage] = useState(1);
    const likedItemsPerPage = 6;
    const totalLikedPages = Math.ceil(likedLabs.length / likedItemsPerPage);

    // Pagination states for visited labs
    const [visitedPage, setVisitedPage] = useState(1);
    const visitedItemsPerPage = 6;
    const totalVisitedPages = Math.ceil(visitedLabs.length / visitedItemsPerPage);

    const getToken = () => {
        return localStorage.getItem('TOKEN');
    };

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

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = getToken();
                const response = await fetch('http://localhost:3001/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error(`Error: ${response.status}`);
                    return;
                }

                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                    setLikedLabs(data.user.likedLabs || []);
                    setVisitedLabs(data.user.visitedLabs || []);
                } else {
                    console.error('Error fetching profile:', data.message);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLabClick = async (repoId, title) => {
        await markRepoVisited(repoId);
        navigate(`/lab/${title}`);
    };

    // Pagination logic for liked labs
    const likedIndexOfLastItem = likedPage * likedItemsPerPage;
    const likedIndexOfFirstItem = likedIndexOfLastItem - likedItemsPerPage;
    const currentLikedLabs = likedLabs.slice(likedIndexOfFirstItem, likedIndexOfLastItem);

    const handleLikedPageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalLikedPages) {
            setLikedPage(pageNumber);
        }
    };

    // Pagination logic for visited labs
    const visitedIndexOfLastItem = visitedPage * visitedItemsPerPage;
    const visitedIndexOfFirstItem = visitedIndexOfLastItem - visitedItemsPerPage;
    const currentVisitedLabs = visitedLabs.slice(visitedIndexOfFirstItem, visitedIndexOfLastItem);

    const handleVisitedPageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalVisitedPages) {
            setVisitedPage(pageNumber);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                {/* Profile Info */}
                <div className="bg-white text-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
                    <p className="text-gray-600">Email: {user.email}</p>
                </div>

                {/* Liked Labs Section */}
                <section className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Liked Labs</h2>
                    {likedLabs.length === 0 ? (
                        <p className="text-gray-600">You have not liked any labs yet.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentLikedLabs.map((lab) => (
                                    <div
                                        key={lab._id}
                                        className="p-4 bg-white rounded-lg shadow-md"
                                        onClick={() => handleLabClick(lab._id, lab.title)}
                                    >
                                        <h3 className="font-semibold text-gray-800">{lab.title}</h3>
                                        <p className="text-gray-600">{lab.description}</p>
                                        <small className="text-xs sm:text-sm text-gray-500 block mb-2">
                                            Likes: {lab.totalLikes} | Visits: {lab.totalVisits}
                                        </small>
                                        <button
                                        onClick={() => handleLabClick(lab._id, lab.title)}
                                        className="inline-block bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-600 transition"
                                    >
                                        View Lab
                                    </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center items-center mt-4 space-x-2">
                                <button
                                    onClick={() => handleLikedPageChange(likedPage - 1)}
                                    disabled={likedPage === 1}
                                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalLikedPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handleLikedPageChange(index + 1)}
                                        className={`px-4 py-2 rounded ${
                                            likedPage === index + 1 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleLikedPageChange(likedPage + 1)}
                                    disabled={likedPage === totalLikedPages}
                                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>

                {/* Visited Labs Section */}
                <section className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Visited Labs</h2>
                    {visitedLabs.length === 0 ? (
                        <p className="text-gray-600">You have not visited any labs yet.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentVisitedLabs.map((lab) => (
                                    <div
                                        key={lab._id}
                                        className="p-4 bg-white rounded-lg shadow-md"
                                    >
                                        <h3 className="font-semibold text-gray-800">{lab.title}</h3>
                                        <p className="text-gray-600">{lab.description}</p>
                                        <small className="text-xs sm:text-sm text-gray-500 block mb-2">
                                            Likes: {lab.totalLikes} | Visits: {lab.totalVisits}
                                        </small>
                                        <button
                                        onClick={() => handleLabClick(lab._id, lab.title)}
                                        className="inline-block bg-green-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-600 transition"
                                    >
                                        View Lab
                                    </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center items-center mt-4 space-x-2">
                                <button
                                    onClick={() => handleVisitedPageChange(visitedPage - 1)}
                                    disabled={visitedPage === 1}
                                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalVisitedPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => handleVisitedPageChange(index + 1)}
                                        className={`px-4 py-2 rounded ${
                                            visitedPage === index + 1 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleVisitedPageChange(visitedPage + 1)}
                                    disabled={visitedPage === totalVisitedPages}
                                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Profile;
