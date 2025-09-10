import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

/**
 * @desc    Mark a student's attendance via a real-time RFID scan
 * @route   POST /api/attendance/mark
 * @access  Public (for hardware)
 */
const markAttendance = async (req, res) => {
  const { uid, timestamp,status } = req.body; // Now expecting timestamp as well

  if (!uid) {
    return res.status(400).json({ message: 'Error: UID is required.' });
  }

  try {
const uidTrimmed = uid?.trim();
const timestampTrimmed = timestamp?.trim();

const student = await User.findOne({ uid: uidTrimmed, role: 'student' });
if (!student) {
  return res.status(404).send('Student not registered.');
}

// Declare attendanceDate only once
const attendanceDate = timestampTrimmed ? new Date(timestampTrimmed) : new Date();
attendanceDate.setHours(0, 0, 0, 0);


    const newAttendance = new Attendance({
      student: student._id,
      schoolId: student.schoolId,
      date: attendanceDate,
       status: status || "Present",
    });
    await newAttendance.save();

    res.status(200).send(`Present: ${student.name}`);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).send('Already marked present.');
    }
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance.' });
  }
};

/**
 * @desc    Sync a batch of offline attendance logs from the hardware
 * @route   POST /api/attendance/sync-logs
 * @access  Public (for hardware)
 */
const syncOfflineAttendance = async (req, res) => {
  const logs = req.body; // Expecting JSON array

  if (!Array.isArray(logs) || logs.length === 0) {
    return res.status(400).json({ message: 'Log data is empty or invalid.' });
  }


const results = await Promise.all(logs.map(async log => {
  try {
    const uidTrimmed = log.uid?.trim();
    const timestampTrimmed = log.timestamp?.trim();

    const student = await User.findOne({ uid: uidTrimmed, role: 'student' });
    if (!student) {
      return { success: false };
    }

    const attendanceDate = timestampTrimmed ? new Date(timestampTrimmed) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    await Attendance.updateOne(
      { student: student._id, date: attendanceDate },
      { $setOnInsert: { schoolId: student.schoolId, student: student._id, date: attendanceDate } },
      { upsert: true }
    );

    return { success: true };
  } catch {
    return { success: false };
  }
}));


const successCount = results.filter(r => r.success).length;
const errorCount = results.filter(r => !r.success).length;

res.status(200).json({ message: 'Sync process finished.', successCount, errorCount });

};


/**
 * @desc    Get today's attendance for a specific school
 * @route   GET /api/attendance/today/:schoolId
 * @access  Private (should be protected by teacher role)
 */
const getTodaysAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      schoolId: req.params.schoolId,
      date: today,
    }).populate("student", "name rollNumber class schoolId username"); 

    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ message: 'Server error while fetching attendance.' });
  }
};
// getMyAttendanceRecords
const getMyAttendanceRecords = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({ student: studentId })
      .sort({ date: 1 })
      .populate("student", "name rollNumber class schoolId username");

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const absentDays = records.filter(r => r.status === "Absent").length;

    res.json({
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      class: req.user.class,
      schoolId: req.user.schoolId,
      username: req.user.username,
      totalDays,
      presentDays,
      absentDays,
      records,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Server error while fetching attendance." });
  }
};




export { markAttendance, getTodaysAttendance, syncOfflineAttendance,  getMyAttendanceRecords };

