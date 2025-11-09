import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import DailyChallengeCard from './DailyChallengeCard.jsx';
import RecentActivity from './RecentActivity.jsx';
import StreakCard from './StreakCard.jsx';
import StatsCard from './StatsCard.jsx';
import ActiveChallengeCard from './ActiveChallengeCard.jsx';
import apiClient from '../../api/apiClient';

const Dashboard = ({ runs, streak, challenge, onStartRunClick, onViewRun }) => {
    const [activeChallenge, setActiveChallenge] = useState(null);

    const fetchActiveChallenge = async () => {
        try {
            const response = await apiClient.get('/challenges/active');
            setActiveChallenge(response.data);
        } catch (error) {
            console.error('Error fetching active challenge:', error);
        }
    };

    useEffect(() => {
        fetchActiveChallenge();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Your Dashboard</h2>
                <button onClick={onStartRunClick} className="flex items-center justify-center bg-orange-500 text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 transition-colors shadow-lg text-lg"><Play size={18} className="mr-2" /> Start Live Run</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <DailyChallengeCard challenge={challenge} />
                    {activeChallenge && (
                        <ActiveChallengeCard 
                            challenge={activeChallenge}
                            runs={runs}
                            onChallengeEnded={fetchActiveChallenge}
                        />
                    )}
                    <RecentActivity runs={runs} onViewRun={onViewRun} />
                </div>
                <div className="space-y-6">
                    <StreakCard streak={streak} />
                    <StatsCard runs={runs} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

