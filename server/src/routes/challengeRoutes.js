const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getAllChallenges, 
    getActiveChallenge, 
    startChallenge, 
    getTodayChallenge,
    endChallenge 
} = require('../controllers/challengeController');

router.get('/', protect, getAllChallenges);
router.get('/active', protect, getActiveChallenge);
router.get('/today', protect, getTodayChallenge);
router.post('/:id/start', protect, startChallenge);
router.post('/:id/end', protect, endChallenge);

module.exports = router;

