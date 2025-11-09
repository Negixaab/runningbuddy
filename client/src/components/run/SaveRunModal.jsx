import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../api/apiClient';

const SaveRunModal = ({ runData, onClose, onRunSaved }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            setError('Please give your run a name.');
            return;
        }
        const newRunData = {
            name,
            distance: runData.distance,
            duration: runData.duration,
            start_time: new Date(Date.now() - runData.duration * 1000).toISOString(),
            ...(runData.path && runData.path.length > 1 && {
                path_geojson: JSON.stringify({ type: "LineString", coordinates: runData.path })
            })
        };
        try {
            await apiClient.post('/runs', newRunData);
            onRunSaved();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save run.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                <h2 className="text-2xl font-bold text-center mb-2">Great Run!</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Give your run a name to save it.</p>
                {error && <p className="bg-red-500/20 text-red-500 text-sm font-semibold p-3 rounded-lg mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Run Name</label>
                        <input type="text" placeholder="e.g., Morning Park Loop" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div><p className="text-xs text-gray-500">Distance</p><p className="font-bold text-xl">{runData.distance} km</p></div>
                        <div><p className="text-xs text-gray-500">Duration</p><p className="font-bold text-xl">{Math.floor(runData.duration / 60)}m {runData.duration % 60}s</p></div>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">Save Run</button>
                </form>
            </div>
        </div>
    );
};

export default SaveRunModal;

