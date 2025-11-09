const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Get all recommended tracks
// @route   GET /api/tracks
// @access  Private
const getTracks = asyncHandler(async (req, res) => {
    // Corrected the alias to 'path_geojson' to be consistent with the runs API
    const allTracks = await pool.query(
        "SELECT id, name, description, distance_km, ST_AsGeoJSON(route) as path_geojson FROM tracks ORDER BY name"
    );
    res.status(200).json(allTracks.rows);
});

// @desc    Create a new recommended track
// @route   POST /api/tracks
// @access  Private
const createTrack = asyncHandler(async (req, res) => {
    const { name, description, distance_km, route_geojson } = req.body;

    if (!name || !description || !distance_km || !route_geojson) {
        res.status(400);
        throw new Error('Please provide all required fields: name, description, distance_km, and route_geojson');
    }

    const newTrack = await pool.query(
        'INSERT INTO tracks (name, description, distance_km, route) VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4)) RETURNING *',
        [name, description, distance_km, route_geojson]
    );

    res.status(201).json(newTrack.rows[0]);
});


module.exports = {
    getTracks,
    createTrack,
};

