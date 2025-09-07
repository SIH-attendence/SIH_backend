const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark a student's attendance via RFID card UID
// @route   POST /api/attendance/mark
// @access  Public (accessible by the hardware)
const markAttendance = async (req, res) => {
  const { uid } = req.body;

  // 1. Basic Validation: Ensure a UID was sent
  if (!uid) {
    return res.status(400).json({ message: 'Error: UID is required.' });
  }

  try {
    // 2. Identification: Find the student associated with this RFID card
    const student = await User.findOne({ uid: uid, role: 'student' });

    // 3. Authentication: If no student is found with that UID, it's an invalid card
    if (!student) {
      return res.status(404).json({ message: 'Student not registered with this card.' });
    }

    // 4. Duplication Check & Creation:
    // Get the start of today's date (in UTC for consistent database storage)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create a new attendance record
    const newAttendance = new Attendance({
      student: student._id, // Link to the student's unique ID
      schoolId: student.schoolId,
      date: today,
    });

    // Attempt to save the new record.
    // The unique index on the schema will automatically prevent duplicates.
    await newAttendance.save();

    // 5. Success Response: If save is successful, send back the student's name
    res.status(200).json({ message: `Present: ${student.name}` });

  } catch (error) {
    // This error (code 11000) specifically means the unique index was violated
    if (error.code === 11000) {
      // It's not a server failure, just a duplicate scan.
      return res.status(200).json({ message: 'Already marked present today.' });
    }
    // For any other unexpected errors
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance.' });
  }
};

// @desc    Get all attendance records for today for a specific school
// @route   GET /api/attendance/today/:schoolId
// @access  Public (for simplicity, but could be protected)
const getTodaysAttendance = async (req, res) => {
  try {
    // Get the start of today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all attendance records for the given schoolId that were created on or after the start of today
    const attendanceRecords = await Attendance.find({
      schoolId: req.params.schoolId,
      date: { $gte: today },
    }).populate('student', 'name'); // This is a powerful feature: it replaces the student ID with their name from the User collection.

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: 'Server error while fetching attendance.' });
  }
};

module.exports = {
  markAttendance,
  getTodaysAttendance,
};

