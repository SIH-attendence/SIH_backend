const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET api/portal/me
// @desc    Get the profile of the currently logged-in user
// @access  Private (requires a valid token)
router.get('/me', protect, getUserProfile);

module.exports = router;
