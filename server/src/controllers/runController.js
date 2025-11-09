const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

// Helper function to update challenge progress
const updateChallengeOnRunCreate = async (userId) => {
    // Find the user's active, uncompleted challenge for today
    const challengeRes = await pool.query(
        `SELECT uc.id, c.type, c.goal_value 
         FROM user_challenges uc 
         JOIN challenges c ON uc.challenge_id = c.id 
         WHERE uc.user_id = $1 AND uc.assigned_date = CURRENT_DATE AND uc.completed = false`,
        [userId]
    );

    if (challengeRes.rows.length === 0) {
        return; // No active challenge, do nothing
    }

    const challenge = challengeRes.rows[0];

    // Get today's total run stats for the user
    const statsRes = await pool.query(
        `SELECT SUM(distance) as total_distance, SUM(duration) as total_duration 
         FROM runs 
         WHERE user_id = $1 AND DATE(start_time AT TIME ZONE 'UTC') = CURRENT_DATE`,
        [userId]
    );
    
    const stats = statsRes.rows[0];
    const totalDistance = parseFloat(stats.total_distance || 0);
    const totalDuration = parseInt(stats.total_duration || 0);

    let shouldComplete = false;
    if (challenge.type === 'distance' && totalDistance >= challenge.goal_value) {
        shouldComplete = true;
    } else if (challenge.type === 'duration' && totalDuration >= challenge.goal_value) {
        shouldComplete = true;
    }

    if (shouldComplete) {
        await pool.query(
            'UPDATE user_challenges SET completed = true, progress = $1 WHERE id = $2',
            [challenge.goal_value, challenge.id]
        );
    }
};


// @desc    Create a new run
// @route   POST /api/runs
// @access  Private
const createRun = asyncHandler(async (req, res) => {
    const { name, distance, duration, start_time, path_geojson } = req.body;

    if (typeof distance !== 'number' || typeof duration !== 'number' || duration <= 0 || !start_time) {
        res.status(400);
        throw new Error('Please provide a valid distance, duration, and start_time');
    }

    const newRunRes = await pool.query(
        'INSERT INTO runs (user_id, name, distance, duration, start_time, path) VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6)) RETURNING *',
        [req.user.id, name, distance, duration, start_time, path_geojson || null]
    );

    const newRun = newRunRes.rows[0];

    // After saving the run, check and update challenge progress
    await updateChallengeOnRunCreate(req.user.id);

    res.status(201).json(newRun);
});

// @desc    Get all runs for a user
// @route   GET /api/runs
// @access  Private
const getRuns = asyncHandler(async (req, res) => {
    const userRuns = await pool.query(
        "SELECT id, name, distance, duration, start_time, ST_AsGeoJSON(path) as path_geojson FROM runs WHERE user_id = $1 ORDER BY start_time DESC",
        [req.user.id]
    );
    res.status(200).json(userRuns.rows);
});

module.exports = {
    createRun,
    getRuns,
};

