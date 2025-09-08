import express from 'express';
import {
  markAttendance,
  getTodaysAttendance,
  syncOfflineAttendance, // Import the new function
} from '../controllers/attendanceController.js';

// Initialize a new Express router.
const router = express.Router();

// --- Public Routes for Hardware ---

// Endpoint for real-time, online attendance marking.
router.post('/mark', markAttendance);

// NEW: Endpoint for receiving a batch of offline logs.
router.post('/sync-logs', syncOfflineAttendance);


// --- Protected Route for Portals ---

// Endpoint for the teacher portal to get today's attendance for a specific school.
// Note: We will add protection to this route later.
router.get('/today/:schoolId', getTodaysAttendance);


// Export the router as the default export of this module.
export default router;

