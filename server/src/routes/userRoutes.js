// This file defines the API endpoints related to users.
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { registerUser, loginUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import our new middleware

// @route   /api/users

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// Test route to check JWT secret
router.get('/test-auth', (req, res) => {
    const testToken = jwt.sign({ test: true }, process.env.JWT_SECRET);
    res.json({ 
        message: 'JWT secret test', 
        token: testToken,
        envVars: {
            hasJwtSecret: !!process.env.JWT_SECRET,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

// --- Protected Routes ---
// This route is protected. The `protect` middleware will run first.
// If the user's token is valid, it will proceed to the (req, res) function.
// If not, the middleware will send back a 401 Unauthorized error.
router.get('/profile', protect, (req, res) => {
    // Because the `protect` middleware ran successfully, we have access to `req.user`.
    // The middleware has already fetched the user's data for us.
    res.status(200).json(req.user);
});

// Get user's current streak
router.get('/streak/:id', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get the user's current streak from the users table
        const streakResult = await pool.query(
            'SELECT current_streak as streak FROM users WHERE id = $1',
            [userId]
        );
        
        if (streakResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(streakResult.rows[0]);
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
