import React, { useState, useEffect, useRef } from 'react';
import { Square } from 'lucide-react';
import { haversineDistance } from '../../utils/helpers';

const LiveRunTracker = ({ onFinish }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [distance, setDistance] = useState(0);
    const [path, setPath] = useState([]);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [permissionError, setPermissionError] = useState(false);
    const timerIntervalRef = useRef(null);
    const watchIdRef = useRef(null);
    const lastPosRef = useRef(null);

    useEffect(() => {
        timerIntervalRef.current = setInterval(() => setElapsedTime(time => time + 1), 1000);
        if (!navigator.geolocation) {
            setPermissionError(true);
            return;
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, speed, accuracy } = position.coords;
                
                // Only process positions with good accuracy (less than 20 meters)
                if (accuracy > 20) {
                    return;
                }

                const newPos = { latitude, longitude };
                
                // Calculate time since last position
                const now = Date.now();
                const timeDiff = lastPosRef.current?.timestamp ? (now - lastPosRef.current.timestamp) / 1000 : 0;
                
                if (lastPosRef.current?.position) {
                    // Calculate distance
                    const segmentDistance = haversineDistance(lastPosRef.current.position, newPos);
                    
                    // Validate the segment (filter out GPS jumps)
                    // If speed is more than 25 m/s (90 km/h), it's probably a GPS error
                    const segmentSpeed = segmentDistance / timeDiff;
                    if (timeDiff > 0 && segmentSpeed < 25) {
                        setDistance(d => d + segmentDistance);
                        setPath(currentPath => [...currentPath, [longitude, latitude]]);
                    }
                }

                // Update last position with timestamp
                lastPosRef.current = {
                    position: newPos,
                    timestamp: now
                };

                // Update current speed (if available from GPS, otherwise calculate)
                if (speed !== null && speed !== undefined) {
                    setCurrentSpeed((speed * 3.6).toFixed(1));
                } else if (timeDiff > 0) {
                    const calculatedSpeed = (segmentDistance / timeDiff) * 3.6;
                    setCurrentSpeed(calculatedSpeed.toFixed(1));
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setPermissionError(true);
            },
            { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 0
            }
        );
        return () => {
            clearInterval(timerIntervalRef.current);
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    const handleStopRun = () => {
        onFinish({
            distance: parseFloat(distance.toFixed(2)),
            duration: elapsedTime,
            path
        });
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    if (permissionError) {
        return (
            <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-3xl font-bold text-red-500 mb-4">Location Access Denied</h2>
                <p className="max-w-md">RunSphere needs access to your location to track your run. Please enable location services for this site in your browser settings.</p>
                <button onClick={() => window.location.reload()} className="mt-8 bg-orange-500 text-white font-bold py-3 px-6 rounded-full hover:bg-orange-600 transition-colors">Retry</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm text-center">
                <div className="mb-12"><p className="text-lg text-gray-400">TIME</p><p className="text-8xl font-mono font-bold tracking-tighter">{formatTime(elapsedTime)}</p></div>
                <div className="flex justify-around mb-12">
                    <div><p className="text-lg text-gray-400">DISTANCE</p><p className="text-5xl font-bold">{distance.toFixed(2)}<span className="text-2xl text-gray-400 ml-1">km</span></p></div>
                    <div><p className="text-lg text-gray-400">SPEED</p><p className="text-5xl font-bold">{currentSpeed}<span className="text-2xl text-gray-400 ml-1">km/h</span></p></div>
                </div>
                <button onClick={handleStopRun} className="bg-red-600 text-white font-bold py-4 px-8 rounded-full hover:bg-red-700 transition-colors flex items-center justify-center w-48 h-48 mx-auto text-2xl border-4 border-red-500"><Square size={48} className="mr-3" /> STOP</button>
            </div>
        </div>
    );
};

export default LiveRunTracker;

