// This is the main file for the Express backend server.

// --- Imports ---
// Load environment variables from a .env file into process.env
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db'); // Import the database connection pool

// Import API routes
const userRoutes = require('./src/routes/userRoutes');
const runRoutes = require('./src/routes/runRoutes');
const trackRoutes = require('./src/routes/trackRoutes');
const challengeRoutes = require('./src/routes/challengeRoutes'); // <-- NEW: Import challenge routes

// --- App Initialization ---
const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors()); 
// Parse incoming JSON requests and put the parsed data in req.body
app.use(express.json()); 

// --- API Routes ---
// Mount the routes on their respective paths.
app.use('/api/users', userRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/challenges', challengeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (err.code === '23505') { // PostgreSQL unique violation
        return res.status(400).json({ message: 'Duplicate entry' });
    }
    
    if (err.code === '28P01') { // PostgreSQL wrong password
        return res.status(500).json({ message: 'Database connection error' });
    }
    
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
app.use('/api/challenges', challengeRoutes); // <-- NEW: Mount challenge routes

// --- Health Check & Database Test Routes ---
// A simple health-check route to verify the server is running.
app.get('/', (req, res) => {
    res.send('RunSphere API is up and running!');
});

// A route to test the database connection.
app.get('/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const time = await client.query('SELECT NOW()');
        client.release();
        res.send(`Database connection successful. Server time: ${time.rows[0].now}`);
    } catch (err) {
        res.status(500).send(`Database connection failed: ${err.message}`);
    }
});

// --- Server Startup ---
// Define the port to run the server on. Use the environment variable or default to 3001.
const PORT = process.env.PORT || 3001;

// Start listening for incoming requests.
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

