import express from 'express';
import {
  markAttendance,
  getTodaysAttendance,
} from '../controllers/attendanceController.js';

// Initialize a new Express router.
const router = express.Router();

// --- Public Route for Hardware ---
// When a POST request is made to '/mark', the markAttendance function will be called.
// This is the endpoint that the ESP8266 RFID reader will send data to.
router.post('/mark', markAttendance);

// --- Protected Route for Portals ---
// When a GET request is made to '/today/:schoolId', the getTodaysAttendance function is called.
// The ':schoolId' is a URL parameter that allows the teacher portal to specify which school's
// attendance data it wants to retrieve.
// Note: We will add protection to this route later.
router.get('/today/:schoolId', getTodaysAttendance);

// Export the router as the default export of this module.
export default router;

