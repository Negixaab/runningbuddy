const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CORRECTED: Inserts into 'password_hash' column
    const newUser = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
    );

    if (newUser.rows.length > 0) {
        res.status(201).json({
            ...newUser.rows[0],
            token: generateToken(newUser.rows[0].id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter an email and password.');
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const user = userResult.rows[0];

    // CORRECTED: Checks for 'password_hash' before comparing
    if (!user.password_hash) {
        res.status(500); 
        throw new Error('User account is corrupted, no password found.');
    }
    
    // CORRECTED: Compares with 'password_hash' from the database
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user's current streak
// @route   GET /api/users/streak
// @access  Private
const getUserStreak = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const runDatesRes = await pool.query(
        `SELECT DISTINCT DATE(start_time AT TIME ZONE 'UTC') as run_date 
         FROM runs 
         WHERE user_id = $1 
         ORDER BY run_date DESC`,
        [userId]
    );

    if (runDatesRes.rows.length === 0) {
        return res.json({ streak: 0 });
    }

    const runDates = runDatesRes.rows.map(row => row.run_date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let streak = 0;
    let lastRunDate = new Date(runDates[0]);

    if (lastRunDate.getTime() === today.getTime() || lastRunDate.getTime() === yesterday.getTime()) {
        streak = 1;
        for (let i = 0; i < runDates.length - 1; i++) {
            const currentRun = new Date(runDates[i]);
            const nextRun = new Date(runDates[i+1]);
            
            const expectedPreviousDay = new Date(currentRun);
            expectedPreviousDay.setDate(expectedPreviousDay.getDate() - 1);

            if (nextRun.getTime() === expectedPreviousDay.getTime()) {
                streak++;
            } else {
                break;
            }
        }
    }

    res.json({ streak });
});

module.exports = {
    registerUser,
    loginUser,
    getUserStreak,
};

