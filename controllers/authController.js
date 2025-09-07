import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

/**
 * @desc    Register a new user (student or teacher)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, username, password, role, schoolId, uid } = req.body;

  try {
    // Check if the username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(400); // Bad Request
      throw new Error('User with this username already exists');
    }

    // Create a new user in the database
    const user = await User.create({
      name,
      username,
      password, // The password will be hashed by the pre-save hook in the User model
      role,
      schoolId,
      uid, // This will be present for students, null for teachers
    });

    // If user creation is successful, send back user data and a token
    if (user) {
      res.status(201).json({ // 201 Created
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by their username
    const user = await User.findOne({ username });

    // Check if user exists and if the provided password matches the stored hashed password
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
      res.status(401); // Unauthorized
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/portal/me
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  // The 'protect' middleware has already fetched the user and attached it to the request object (req.user)
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
    });
  } else {
    res.status(404); // Not Found
    throw new Error('User not found');
  }
};

export { registerUser, loginUser, getUserProfile };

