const express = require('express');
const router = express.Router();
const { markAttendance, getTodaysAttendance } = require('../controllers/attendanceController');

// @route   POST api/attendance/mark
// @desc    Mark attendance from an RFID reader
// @access  Public (should be secured with an API key in a real product)
router.post('/mark', markAttendance);

// @route   GET api/attendance/today/:schoolId
// @desc    Get all attendance records for a specific school for the current day
// @access  Protected (should require a teacher's login)
router.get('/today/:schoolId', getTodaysAttendance);

module.exports = router;
