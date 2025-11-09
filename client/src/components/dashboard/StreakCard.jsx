import React from 'react';
import { Zap } from 'lucide-react';

const StreakCard = React.memo(({ streak }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center items-center mb-2"><Zap className="text-yellow-400" size={32} /><h3 className="font-bold text-xl ml-2">Current Streak</h3></div>
        <p className="text-6xl font-bold text-yellow-400">{streak}</p>
        <p className="text-gray-500 dark:text-gray-400">days</p>
    </div>
));

export default StreakCard;

