import express from 'express';
import { getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Initialize a new Express router.
const router = express.Router();

// --- Protected Route for Web Portals ---
// When a GET request is made to the '/me' endpoint, it first goes through the 'protect' middleware.
// If the user is authenticated, the request is passed to the getUserProfile controller function.
// If not, the middleware will block the request.
router.get('/me', protect, getUserProfile);

// Export the router as the default export of this module.
export default router;

