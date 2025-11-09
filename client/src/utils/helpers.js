// This function calculates the distance between two GPS coordinates
export const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => x * Math.PI / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// This function swaps coordinate order from [lon, lat] to [lat, lon] for Leaflet
export const parseGeoJSONPath = (geojsonString) => {
    try {
        if (!geojsonString) return [];
        const geojson = JSON.parse(geojsonString);
        if (geojson.type === 'LineString' && Array.isArray(geojson.coordinates)) {
            const validCoords = geojson.coordinates.filter(
                (coord) => Array.isArray(coord) && typeof coord[0] === 'number' && typeof coord[1] === 'number'
            );
            if (validCoords.length > 1) {
                return validCoords.map((coord) => [coord[1], coord[0]]);
            }
        }
    } catch (e) {
        console.error("Error parsing GeoJSON", e);
    }
    return [];
};

