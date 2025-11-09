import React from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { Map } from 'lucide-react';

const MapDisplay = React.memo(({ path, className }) => {
    const hasValidPath = path && path.length > 1;
    if (!hasValidPath) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 ${className}`}>
                <Map size={48} className="mb-2" />
                <p className="font-semibold">No Map Data</p>
                <p className="text-xs">This run was logged without GPS.</p>
            </div>
        );
    }
    return (
        <MapContainer bounds={path} scrollWheelZoom={true} className={className}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={path} color="#f97316" weight={5} />
        </MapContainer>
    );
});

export default MapDisplay;

