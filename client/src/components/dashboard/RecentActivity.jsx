import React from 'react';
import { MapPin } from 'lucide-react';

const RecentActivity = ({ runs, onViewRun }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold text-xl mb-4">Recent Activity</h3>
            {runs && runs.length > 0 ? (
                <ul className="space-y-2">
                    {runs.slice(0, 3).map(run => (
                        <li key={run.id}>
                            <button onClick={() => onViewRun(run)} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between">
                                <div className="flex items-center">
                                    <MapPin className="text-green-500 mr-3 flex-shrink-0" size={20} />
                                    <div><p className="font-semibold">{run.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{run.distance} km</p></div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(run.start_time).toLocaleDateString()}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (<p className="text-center text-gray-500 dark:text-gray-400">No recent runs. Go log one!</p>)}
        </div>
    );
};

export default RecentActivity;

