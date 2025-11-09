import React, { useState, useEffect } from 'react';
import { Timer, Award, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

const ChallengesPage = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeChallenge, setActiveChallenge] = useState(null);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const [challengesRes, activeRes] = await Promise.all([
                apiClient.get('/challenges'),
                apiClient.get('/challenges/active')
            ]);
            setChallenges(challengesRes.data);
            setActiveChallenge(activeRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            setError('Failed to load challenges');
            setLoading(false);
        }
    };

    const startChallenge = async (challengeId) => {
        try {
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + 24); // 24-hour deadline

            const response = await apiClient.post(`/challenges/${challengeId}/start`, {
                deadline: deadline.toISOString()
            });

            if (response.data) {
                setActiveChallenge(response.data);
                await fetchChallenges(); // Refresh the challenges list
            }
        } catch (error) {
            console.error('Error starting challenge:', error);
            setError(error.response?.data?.message || 'Failed to start challenge');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Available Challenges</h2>
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4 flex items-center">
                        <AlertCircle className="mr-2" />
                        {error}
                    </div>
                )}
                
                {activeChallenge && (
                    <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg mb-6">
                        <h3 className="font-bold flex items-center text-green-700 dark:text-green-300">
                            <Timer className="mr-2" />
                            Active Challenge
                        </h3>
                        <p className="text-green-600 dark:text-green-200 mt-2">{activeChallenge.title}</p>
                        <p className="text-sm text-green-500 dark:text-green-400 mt-1">
                            Deadline: {new Date(activeChallenge.deadline).toLocaleString()}
                        </p>
                    </div>
                )}

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {challenges.map(challenge => (
                        <div key={challenge.id} 
                             className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold">{challenge.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {challenge.description}
                                    </p>
                                    <div className="mt-3 text-sm">
                                        <span className="inline-flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                                            <Award className="w-4 h-4 mr-1" />
                                            {challenge.goal_value} {challenge.goal_unit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => startChallenge(challenge.id)}
                                disabled={!!activeChallenge}
                                className={`mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium
                                    ${activeChallenge 
                                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                            >
                                {activeChallenge ? 'Complete Active Challenge First' : 'Start Challenge'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChallengesPage;

