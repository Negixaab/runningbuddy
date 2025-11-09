import React, { useMemo } from 'react';

const StatDial = React.memo(({ percentage, size = 120, strokeWidth = 10, label, unit }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle className="text-gray-200 dark:text-gray-700" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle className="text-orange-500" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-out' }} />
            </svg>
            <div className="absolute text-center"><span className="text-2xl font-bold text-gray-800 dark:text-white">{label}</span><span className="block text-xs text-gray-500 dark:text-gray-400">{unit}</span></div>
        </div>
    );
});


const StatsCard = ({ runs }) => {
    const weeklyGoal = 25;
    const stats = useMemo(() => {
        if (!runs) return { distance: 0, runCount: 0, duration: '0h 0m', percentage: 0 };
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const runsThisWeek = runs.filter(run => new Date(run.start_time) >= startOfWeek);
        const totalDistance = runsThisWeek.reduce((sum, run) => sum + parseFloat(run.distance), 0);
        const totalDuration = runsThisWeek.reduce((sum, run) => sum + run.duration, 0);
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        return {
            distance: totalDistance.toFixed(1),
            runCount: runsThisWeek.length,
            duration: `${hours}h ${minutes}m`,
            percentage: Math.min((totalDistance / weeklyGoal) * 100, 100)
        };
    }, [runs]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h3 className="font-bold text-xl mb-4 text-center">Weekly Progress</h3>
            <StatDial percentage={stats.percentage} label={stats.distance} unit="km" />
            <div className="w-full mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-around text-center">
                <div><p className="font-bold text-lg">{stats.runCount}</p><p className="text-xs text-gray-500 dark:text-gray-400">Runs</p></div>
                <div><p className="font-bold text-lg">{stats.duration}</p><p className="text-xs text-gray-500 dark:text-gray-400">Time</p></div>
            </div>
        </div>
    );
};

export default StatsCard;

