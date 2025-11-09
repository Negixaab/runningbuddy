import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

const DailyChallengeCard = ({ challenge }) => {
    // This component receives the 'challenge' data as a prop.
    if (!challenge) {
        return <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center">Loading Challenge...</div>;
    }
    
    // Calculate the progress percentage for the progress bar
    const progressPercentage = (challenge.progress / challenge.goal) * 100;
    
    // Format the text differently for distance vs. duration challenges
    let progressText = challenge.progress.toFixed(1);
    let goalText = challenge.goal;
    if (challenge.unit === 'seconds') {
        progressText = `${Math.floor(challenge.progress / 60)} min`;
        goalText = `${challenge.goal / 60} min`;
    } else {
         goalText = `${challenge.goal} ${challenge.unit}`;
    }

    // Display a special card if the challenge is completed
    if (challenge.completed) {
        return (
             <div className="bg-green-50 dark:bg-green-900/50 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="text-green-500" size={48}/>
                <h3 className="font-bold text-lg mt-4 text-green-600 dark:text-green-300">Challenge Completed!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.name}</p>
            </div>
        )
    }

    // Display the standard in-progress card
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-full"><Target className="text-orange-500" size={24} /></div>
                <div><h3 className="font-bold text-lg">Daily Challenge</h3><p className="text-sm text-gray-500 dark:text-gray-400">{challenge.name}</p></div>
            </div>
            <p className="mb-4 text-gray-600 dark:text-gray-300">{challenge.description}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-orange-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div>
            <p className="text-right mt-2 font-semibold text-sm">{progressText} / {goalText}</p>
        </div>
    );
};

export default DailyChallengeCard;

