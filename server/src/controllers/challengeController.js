const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    End a challenge for a user
// @route   POST /api/challenges/:id/end
// @access  Private
const endChallenge = asyncHandler(async (req, res) => {
    const { status } = req.body; // status can be 'completed' or 'abandoned'
    
    // First verify the challenge exists and is active for this user
    const activeChallenge = await pool.query(
        `SELECT * FROM user_challenges 
         WHERE user_id = $1 AND challenge_id = $2 AND status = 'active'`,
        [req.user.id, req.params.id]
    );

    if (activeChallenge.rows.length === 0) {
        res.status(404);
        throw new Error('No active challenge found');
    }

    // Update the challenge status
    await pool.query(
        `UPDATE user_challenges 
         SET status = $1, 
             completed_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2 
         AND challenge_id = $3`,
        [status, req.user.id, req.params.id]
    );

    res.json({ message: `Challenge ${status}` });
});

// @desc    Get all available challenges
// @route   GET /api/challenges
// @access  Private
const getAllChallenges = asyncHandler(async (req, res) => {
    const challenges = await pool.query(
        `SELECT c.* 
         FROM challenges c 
         WHERE c.is_active = true 
         AND c.id NOT IN (
             SELECT challenge_id 
             FROM user_challenges 
             WHERE user_id = $1 
             AND (status = 'completed' OR status = 'active')
         )`,
        [req.user.id]
    );
    res.json(challenges.rows);
});

// @desc    Get active challenge for a user
// @route   GET /api/challenges/active
// @access  Private
const getActiveChallenge = asyncHandler(async (req, res) => {
    const activeChallenge = await pool.query(
        `SELECT c.*, uc.deadline, uc.start_time, uc.progress
         FROM user_challenges uc
         JOIN challenges c ON c.id = uc.challenge_id
         WHERE uc.user_id = $1 AND uc.status = 'active'`,
        [req.user.id]
    );

    if (activeChallenge.rows.length === 0) {
        return res.json(null);
    }

    // Check if deadline has passed
    const challenge = activeChallenge.rows[0];
    if (challenge.deadline && new Date() > new Date(challenge.deadline)) {
        // Mark challenge as failed if deadline passed
        await pool.query(
            `UPDATE user_challenges 
             SET status = 'failed', 
                 completed_at = CURRENT_TIMESTAMP 
             WHERE user_id = $1 
             AND challenge_id = $2 
             AND status = 'active'`,
            [req.user.id, challenge.id]
        );
        return res.json(null);
    }

    res.json(challenge);
});

// @desc    Start a challenge
// @route   POST /api/challenges/:id/start
// @access  Private
const startChallenge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { deadline } = req.body;

    // Verify no active challenges
    const activeCheck = await pool.query(
        `SELECT 1 FROM user_challenges 
         WHERE user_id = $1 AND status = 'active'`,
        [req.user.id]
    );

    if (activeCheck.rows.length > 0) {
        res.status(400);
        throw new Error('You already have an active challenge');
    }

    // Start new challenge
    const result = await pool.query(
        `INSERT INTO user_challenges 
         (user_id, challenge_id, status, start_time, deadline) 
         VALUES ($1, $2, 'active', CURRENT_TIMESTAMP, $3)
         RETURNING *`,
        [req.user.id, id, deadline]
    );

    // Get challenge details
    const challenge = await pool.query(
        `SELECT c.*, uc.deadline, uc.start_time, uc.progress
         FROM challenges c
         JOIN user_challenges uc ON uc.challenge_id = c.id
         WHERE c.id = $1 AND uc.user_id = $2`,
        [id, req.user.id]
    );

    res.status(201).json(challenge.rows[0]);
});

// @desc    Get or create today's challenge for a user
// @route   GET /api/challenges/today
// @access  Private
const getTodayChallenge = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Check if a challenge is already assigned for today
    let challengeRes = await pool.query(
        `SELECT uc.id, uc.status, c.title as name, c.description, c.type, c.goal_value as goal, c.goal_unit as unit 
         FROM user_challenges uc 
         JOIN challenges c ON uc.challenge_id = c.id 
         WHERE uc.user_id = $1 AND uc.assigned_date = CURRENT_DATE`,
        [userId]
    );

    // 2. If no challenge exists, create one
    if (challengeRes.rows.length === 0) {
        let challengeToAssign;

        // Try to find a random challenge not completed in the last 7 days
        const randomChallengeRes = await pool.query(
            `SELECT id FROM challenges 
             WHERE id NOT IN (
                SELECT challenge_id FROM user_challenges WHERE user_id = $1 AND assigned_date > CURRENT_DATE - INTERVAL '7 days'
             )
             ORDER BY random() LIMIT 1`,
            [userId]
        );
        
        if (randomChallengeRes.rows.length > 0) {
            challengeToAssign = randomChallengeRes.rows[0];
        } else {
            // --- NEW FALLBACK LOGIC ---
            // If all challenges were completed recently, try to assign the specific 10k challenge.
            console.log("User has completed all recent challenges. Assigning 10k fallback.");
            const fallbackRes = await pool.query("SELECT id FROM challenges WHERE title = 'The Ten-K' LIMIT 1");
            
            if (fallbackRes.rows.length > 0) {
                challengeToAssign = fallbackRes.rows[0];
            } else {
                // Super fallback: If 'The Ten-K' doesn't exist, just grab any challenge.
                console.log("10k fallback not found. Assigning any random challenge.");
                const superFallbackRes = await pool.query('SELECT id FROM challenges ORDER BY random() LIMIT 1');
                if (superFallbackRes.rows.length === 0) {
                    throw new Error("No challenges exist in the database.");
                }
                challengeToAssign = superFallbackRes.rows[0];
            }
        }

        // Assign this challenge to the user for today
        await pool.query(
            'INSERT INTO user_challenges (user_id, challenge_id, assigned_date, status) VALUES ($1, $2, CURRENT_DATE, $3)',
            [userId, challengeToAssign.id, 'active']
        );
        
        // Refetch the newly created challenge with its details
         challengeRes = await pool.query(
            `SELECT uc.id, uc.status, c.title as name, c.description, c.type, c.goal_value as goal, c.goal_unit as unit
             FROM user_challenges uc 
             JOIN challenges c ON uc.challenge_id = c.id 
             WHERE uc.user_id = $1 AND uc.assigned_date = CURRENT_DATE`,
            [userId]
        );
    }
    
    const finalChallenge = challengeRes.rows[0];

    // 3. Calculate today's progress
    const statsRes = await pool.query(
        `SELECT SUM(distance) as total_distance, SUM(duration) as total_duration 
         FROM runs 
         WHERE user_id = $1 AND DATE(start_time AT TIME ZONE 'UTC') = CURRENT_DATE`,
        [userId]
    );
    
    const stats = statsRes.rows[0];
    let progress = 0;
    if (finalChallenge.type === 'distance') {
        progress = parseFloat(stats.total_distance || 0);
    } else if (finalChallenge.type === 'duration') {
        progress = parseInt(stats.total_duration || 0);
    }
    
    // 4. Add progress and a 'completed' boolean to the response
    finalChallenge.progress = Math.min(progress, finalChallenge.goal);
    finalChallenge.completed = finalChallenge.status === 'completed';

    res.status(200).json(finalChallenge);
});

module.exports = {
    getTodayChallenge,
    getAllChallenges,
    getActiveChallenge,
    startChallenge,
    endChallenge
};

