import React, { useEffect, useState } from 'react';
import { format, isAfter } from 'date-fns';
import apiClient from '../../api/apiClient.js';

const ActiveChallengeCard = ({ challenge, runs, onChallengeEnded }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Calculate progress based on challenge type and runs
        if (!runs || !challenge) return;

        const challengeStartTime = new Date(challenge.start_time);
        const relevantRuns = runs.filter(run => {
            const runDate = new Date(run.start_time);
            return isAfter(runDate, challengeStartTime);
        });

        let totalProgress = 0;
        switch (challenge.goal_unit) {
            case 'seconds':
                totalProgress = relevantRuns.reduce((acc, run) => acc + (run.duration || 0), 0);
                break;
            case 'km':
                totalProgress = relevantRuns.reduce((acc, run) => acc + (run.distance || 0), 0);
                break;
            default:
                totalProgress = 0;
        }

        setProgress(totalProgress);

        // Auto-complete challenge if goal is met
        if (totalProgress >= challenge.goal_value) {
            handleEndChallenge('completed');
        }
    }, [runs, challenge]);

    const handleEndChallenge = async (status) => {
        try {
            await apiClient.post(`/challenges/${challenge.id}/end`, { status });
            if (onChallengeEnded) {
                onChallengeEnded();
            }
        } catch (error) {
            console.error('Error ending challenge:', error);
        }
    };

    if (!challenge) return null;

    // Make sure we have a valid deadline
    const deadline = challenge.deadline ? new Date(challenge.deadline) : null;
    const now = new Date();
    const timeLeft = deadline ? deadline.getTime() - now.getTime() : 0;
    const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

    return (
        <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 p-8 rounded-xl shadow-lg mb-6 border border-emerald-800/20">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-emerald-50 mb-2">
                        {challenge.name}
                    </h3>
                    <p className="text-emerald-200/60 text-sm">{challenge.description}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
                {deadline && (
                    <div className="relative bg-emerald-950/30 p-6 rounded-lg border border-emerald-800/20">
                        <svg className="w-full h-32" viewBox="0 0 100 100">
                            {/* Outer glow */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b98110"
                                strokeWidth="12"
                            />
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#064e3c"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeDasharray={`${Math.min((24 - hoursLeft) / 24 * 283, 283)} 283`}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                            />
                            <text
                                x="50"
                                y="45"
                                textAnchor="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                            >
                                {hoursLeft}
                            </text>
                            <text
                                x="50"
                                y="65"
                                textAnchor="middle"
                                fill="#94a3b8"
                                fontSize="12"
                            >
                                hours
                            </text>
                        </svg>
                    </div>
                )}

                {challenge.goal_value && (
                    <div className="relative bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
                        <svg className="w-full h-32" viewBox="0 0 100 100">
                            {/* Outer glow */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b98120"
                                strokeWidth="12"
                            />
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#1f2937"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeDasharray={`${Math.min((progress / challenge.goal_value) * 283, 283)} 283`}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                            />
                            <text
                                x="50"
                                y="45"
                                textAnchor="middle"
                                fill="white"
                                fontSize="20"
                                fontWeight="bold"
                            >
                                {Math.round((progress / challenge.goal_value) * 100)}%
                            </text>
                            <text
                                x="50"
                                y="65"
                                textAnchor="middle"
                                fill="#94a3b8"
                                fontSize="12"
                            >
                                complete
                            </text>
                        </svg>
                    </div>
                )}
            </div>
            <div className="flex justify-center">
                <button
                    onClick={() => handleEndChallenge('abandoned')}
                    className="px-6 py-2.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 font-medium"
                >
                    Abandon Challenge
                </button>
            </div>
        </div>
    );
};

export default ActiveChallengeCard;