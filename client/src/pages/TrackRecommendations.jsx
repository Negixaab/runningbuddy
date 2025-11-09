import React, { useState, useEffect, useMemo } from 'react';
import { Footprints } from 'lucide-react';
import apiClient from '../api/apiClient';
import { parseGeoJSONPath } from '../utils/helpers';
import MapDisplay from '../components/maps/MapDisplay';

const TrackCard = React.memo(({ track }) => {
    const path = useMemo(() => parseGeoJSONPath(track.path_geojson), [track.path_geojson]);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
                <div className="flex items-center space-x-4 mb-2"><Footprints className="text-orange-500" size={24} /><h3 className="font-bold text-lg">{track.name}</h3></div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{track.distance_km} km</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{track.description}</p>
            </div>
            <div className="h-40 w-full rounded-lg overflow-hidden"><MapDisplay path={path} className="h-full w-full" /></div>
        </div>
    );
});

const TrackRecommendations = () => {
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await apiClient.get('/tracks');
                setTracks(res.data);
            } catch (error) { console.error("Failed to fetch tracks", error); }
            finally { setIsLoading(false); }
        };
        fetchTracks();
    }, []);

    if (isLoading) return <div className="text-center p-10">Loading tracks...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Recommended Tracks</h2>
            {tracks.length > 0
                ? <div className="grid grid-cols-1 gap-6">{tracks.map(track => <TrackCard key={track.id} track={track} />)}</div>
                : <p className="text-center text-gray-500 dark:text-gray-400">No recommended tracks available right now.</p>
            }
        </div>
    );
};

export default TrackRecommendations;

