import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
 getDashboard 
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);

export default router;
