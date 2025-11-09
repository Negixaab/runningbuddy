const express = require('express');
const router = express.Router();
const { createRun, getRuns } = require('../controllers/runController');
const { protect } = require('../middleware/authMiddleware');

// Defines the routes for /api/runs
// POST /api/runs will be handled by the createRun function
// GET /api/runs will be handled by the getRuns function
router.route('/').post(protect, createRun).get(protect, getRuns);

module.exports = router;

