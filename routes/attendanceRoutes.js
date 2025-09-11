import express from 'express';
import {
  markAttendance,
  getTodaysAttendance,
  getMyAttendanceRecords,
  syncOfflineAttendance,
  markAbsentees,
} from '../controllers/attendanceController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / hardware endpoints
router.post('/mark', markAttendance);
router.post('/sync-logs', syncOfflineAttendance);
router.post("/mark-absentees/:schoolId", markAbsentees);


// Protected endpoints
router.get('/student', protect, getMyAttendanceRecords);
router.get('/today/:schoolId', protect, getTodaysAttendance);

export default router;
