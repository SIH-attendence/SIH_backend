import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc Register a new user (student or teacher)
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  const { name, username, password, role, schoolId, uid } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "User with this username already exists" });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.create({
      name,
      username,
      password,
      role,
      schoolId,
      uid: role === "student" ? uid : null,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

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
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get user profile
 * @route GET /api/portal/me
 * @access Private
 */
const getUserProfile = async (req, res) => {
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
    res.status(404).json({ message: "User not found" });
  }
};

/**
 * @desc Register teacher (shortcut route)
 * @route POST /api/auth/register-teacher
 * @access Public
 */
export const registerTeacher = async (req, res) => {
  try {
    const { name, username, password, schoolId } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const teacher = await User.create({
      name,
      username,
      password,
      role: "teacher",
      schoolId,
    });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      username: teacher.username,
      role: teacher.role,
      schoolId: teacher.schoolId,
      token: generateToken(teacher._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { registerUser, loginUser, getUserProfile };
