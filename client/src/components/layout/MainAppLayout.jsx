import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient.js';
import Header from './Header.jsx';
import Dashboard from '../dashboard/Dashboard.jsx';
import TrackRecommendations from '../../pages/TrackRecommendations.jsx';
import ChallengesPage from '../../pages/ChallengesPage.jsx';
import LiveRunTracker from '../run/LiveRunTracker.jsx';
import SaveRunModal from '../run/SaveRunModal.jsx';
import RunDetailModal from '../maps/RunDetailModal.jsx';

const MainAppLayout = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
    const [activePage, setActivePage] = useState('dashboard');
    const [runs, setRuns] = useState([]);
    const [isRunActive, setIsRunActive] = useState(false);
    const [finishedRunData, setFinishedRunData] = useState(null);
    const [streak, setStreak] = useState(0);
    const [selectedRun, setSelectedRun] = useState(null);
    const [challenge, setChallenge] = useState(null);

    const fetchAllData = useCallback(async () => {
        try {
            if (!user || !user.id) {
                console.error('No user ID available');
                return;
            }
            console.log('Fetching data for user:', user.id);
            const [runsRes, streakRes, challengeRes] = await Promise.all([
                apiClient.get('/runs'),
                apiClient.get(`/users/streak/${user.id}`),
                apiClient.get('/challenges/today')
            ]);
            console.log('Challenge response:', challengeRes.data);
            setRuns(runsRes.data);
            setStreak(streakRes.data.streak);
            setChallenge(challengeRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Set default challenge state to show error
            setChallenge({
                name: "Challenge Error",
                description: "Unable to load today's challenge. Please check your connection.",
                goal: 0,
                unit: "km",
                progress: 0,
                completed: false
            });
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleRunFinish = (runData) => {
        setIsRunActive(false);
        setFinishedRunData(runData);
    };

    const handleRunSaved = useCallback(() => {
        fetchAllData();
        setFinishedRunData(null);
    }, [fetchAllData]);

    if (isRunActive) {
        return <LiveRunTracker onFinish={handleRunFinish} />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'tracks': return <TrackRecommendations />;
            case 'challenges': return <ChallengesPage />;
            default: return <Dashboard 
                                runs={runs} 
                                streak={streak} 
                                challenge={challenge} // <-- This correctly passes the fetched challenge data
                                onStartRunClick={() => setIsRunActive(true)} 
                                onViewRun={setSelectedRun} 
                            />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
            <Header user={user} onNavigate={setActivePage} activePage={activePage} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onLogout={onLogout} />
            <main className="p-4 sm:p-6 max-w-4xl mx-auto">{renderPage()}</main>
            {finishedRunData && <SaveRunModal runData={finishedRunData} onClose={() => setFinishedRunData(null)} onRunSaved={handleRunSaved} />}
            {selectedRun && <RunDetailModal run={selectedRun} onClose={() => setSelectedRun(null)} />}
        </div>
    );
};

export default MainAppLayout;

