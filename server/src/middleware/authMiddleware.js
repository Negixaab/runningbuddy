// This file contains middleware for protecting routes that require authentication.
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    // Check if the request has an Authorization header, and if it starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get the token from the header (e.g., "Bearer eyJhbGci...")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get the user's ID from the decoded token payload.
            //    We can now use this ID to fetch the user from the database.
            //    We select everything EXCEPT the password hash for security.
            const userResult = await pool.query(
                'SELECT id, username, email, created_at, current_streak FROM users WHERE id = $1',
                [decoded.id]
            );

            if (userResult.rows.length === 0) {
                // This case handles if a user was deleted but their token is still valid.
                return res.status(401).json({ message: 'Not authorized, user not found.' });
            }

            // 4. Attach the user object to the request object (`req`).
            //    Now, any subsequent protected route handler will have access to `req.user`.
            req.user = userResult.rows[0];

            // 5. Call `next()` to pass control to the next middleware or the actual route handler.
            next();

        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

module.exports = { protect };

