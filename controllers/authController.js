const User = require('../models/User');
const jwt = require('jsonwebtoken');

// A helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token will be valid for 30 days
  });
};

// @desc    Register a new user (student or teacher)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, username, password, role, schoolId, uid } = req.body;

  try {
    // Check if a user with this username already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user instance with the provided data
    const user = await User.create({
      name,
      username,
      password, // Password will be hashed by the pre-save middleware in User.js
      role,
      schoolId,
      uid,
    });

    // If the user was created successfully, send back their data and a login token
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user and get a token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by their username
    const user = await User.findOne({ username });

    // If user exists and the provided password matches the stored hashed password
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get the profile of the logged-in user
// @route   GET /api/portal/me
// @access  Private (protected)
const getUserProfile = async (req, res) => {
  // The 'protect' middleware has already found the user and attached it to the request object (req.user).
  // We can just send it back as the response.
  res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};

