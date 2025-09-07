const express = require('express');
const router = express.Router();

// We will create these controller functions in a later step.
// For now, we are just defining the routes that will use them.
const { registerUser, loginUser } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register a new user (student or teacher)
// @access  Public (for now, could be made admin-only later)
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate a user and get a token
// @access  Public
router.post('/login', loginUser);

module.exports = router;
