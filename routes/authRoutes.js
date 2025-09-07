import express from 'express';
import {
  registerUser,
  loginUser,
} from '../controllers/authController.js';

// Initialize a new Express router.
const router = express.Router();

// Define the routes and associate them with controller functions.
// When a POST request is made to the '/register' endpoint, the registerUser function will be called.
router.post('/register', registerUser);

// When a POST request is made to the '/login' endpoint, the loginUser function will be called.
router.post('/login', loginUser);

// Export the router as the default export of this module.
export default router;

