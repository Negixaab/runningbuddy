import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { parseGeoJSONPath } from '../../utils/helpers';
import MapDisplay from './MapDisplay';

const RunDetailModal = ({ run, onClose }) => {
    const path = useMemo(() => parseGeoJSONPath(run.path_geojson), [run.path_geojson]);
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-10"><X size={20} /></button>
                <h2 className="text-2xl font-bold mb-4">{run.name}</h2>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div><p className="text-xs text-gray-500">Distance</p><p className="font-bold text-xl">{run.distance} km</p></div>
                    <div><p className="text-xs text-gray-500">Duration</p><p className="font-bold text-xl">{Math.floor(run.duration / 60)}m {run.duration % 60}s</p></div>
                    <div><p className="text-xs text-gray-500">Date</p><p className="font-bold text-xl">{new Date(run.start_time).toLocaleDateString()}</p></div>
                </div>
                <MapDisplay path={path} className="h-64 md:h-80 w-full rounded-lg" />
            </div>
        </div>
    );
};

export default RunDetailModal;

