import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

/**
 * @desc    Mark a student's attendance via RFID scan
 * @route   POST /api/attendance/mark
 * @access  Public (intended for hardware, but should be secured in production)
 */
const markAttendance = async (req, res) => {
  const { uid } = req.body;

  // Basic validation
  if (!uid) {
    return res.status(400).json({ message: 'Error: UID is required.' });
  }

  try {
    // 1. Find the student by their RFID card UID
    const student = await User.findOne({ uid: uid, role: 'student' });

    if (!student) {
      return res.status(404).send('Student not registered.'); // 404 Not Found
    }

    // 2. Get today's date at the beginning of the day (midnight) for consistency
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Attempt to create a new attendance record
    const newAttendance = new Attendance({
      student: student._id,
      schoolId: student.schoolId,
      date: today,
    });
    await newAttendance.save();

    // 4. Send success response back to the ESP8266
    res.status(200).send(`Present: ${student.name}`);

  } catch (error) {
    // This specifically checks for the 'duplicate key' error from MongoDB
    if (error.code === 11000) {
      // It's not a server error, it's just a duplicate scan.
      return res.status(200).send('Already marked present.');
    }
    // For any other unexpected errors
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance.' });
  }
};


/**
 * @desc    Get today's attendance for a specific school
 * @route   GET /api/attendance/today/:schoolId
 * @access  Private (should be protected by teacher role)
 */
const getTodaysAttendance = async (req, res) => {
  try {
    // Get today's date at the beginning of the day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all attendance records for the given schoolId and for today's date
    const attendanceRecords = await Attendance.find({
      schoolId: req.params.schoolId,
      date: today,
    }).populate('student', 'name'); // '.populate' fetches the student's name from the User collection

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: 'Server error while fetching attendance.' });
  }
};


export { markAttendance, getTodaysAttendance };

