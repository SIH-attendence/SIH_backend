import express from 'express';
import {
  markAttendance,
  getTodaysAttendance,
  getMyAttendanceRecords,
  syncOfflineAttendance,
  markAbsentees,
  getAttendanceSummary,
  manualUpdateAttendance,
  getManualOverrides,
} from '../controllers/attendanceController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / hardware endpoints
router.post('/mark', markAttendance);
router.post('/sync-logs', syncOfflineAttendance);
router.post("/mark-absentees/:schoolId", markAbsentees);

// Protected endpoints
router.get('/today/:schoolId?', protect, getTodaysAttendance);
router.get("/summary/:schoolId?", protect, getAttendanceSummary);
router.get("/student", protect, getMyAttendanceRecords);
// routes/attendanceRoutes.js
router.post("/manual-update", protect, manualUpdateAttendance);
router.get("/manual-overrides", protect, getManualOverrides);
export default router;
