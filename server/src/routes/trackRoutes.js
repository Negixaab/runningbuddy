const express = require('express');
const router = express.Router();
const { getTracks, createTrack } = require('../controllers/trackController');
const { protect } = require('../middleware/authMiddleware');

// This line defines both the GET and POST routes for /api/tracks
// and connects them to the correct controller functions.
router.route('/').get(protect, getTracks).post(protect, createTrack);

module.exports = router;

