import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getMyProfile, updateMyProfile } from '../controllers/ProfileController.js';

const router = express.Router();

// Get logged-in student profile
router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);
export default router;
