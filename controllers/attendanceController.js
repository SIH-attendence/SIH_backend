import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

/**
 * @desc    Mark a student's attendance via a real-time RFID scan
 * @route   POST /api/attendance/mark
 * @access  Public (for hardware)
 */
const markAttendance = async (req, res) => {
  const { uid, timestamp, status } = req.body;

  if (!uid) return res.status(400).json({ message: 'UID is required.' });

  try {
    const uidTrimmed = uid.trim();
    const timestampTrimmed = timestamp?.trim();

    const student = await User.findOne({ uid: uidTrimmed, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not registered.' });

    const now = new Date();
    const attendanceDate = timestampTrimmed ? new Date(timestampTrimmed) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const cutOffTime = new Date(attendanceDate);
    cutOffTime.setHours(12, 0, 0, 0);

    if (now > cutOffTime) {
      return res.status(403).json({ message: 'Attendance for today is closed.' });
    }

    const newAttendance = new Attendance({
      student: student._id,
      schoolId: student.schoolId,
      teacherSchoolId: student.teacherSchoolId,
      date: attendanceDate,
      status: status || "Absent",
    });

    await newAttendance.save();

    res.status(200).json({ message: `Present: ${student.name}` });
  } catch (error) {
    if (error.code === 11000) return res.status(200).json({ message: 'Already marked present.' });
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error while marking attendance.' });
  }
};

/**
 * @desc    Sync offline attendance logs
 * @route   POST /api/attendance/sync-logs
 * @access  Public (for hardware)
 */
const syncOfflineAttendance = async (req, res) => {
  const logs = req.body;
  if (!Array.isArray(logs) || logs.length === 0) return res.status(400).json({ message: 'Log data is empty or invalid.' });

  const results = await Promise.all(logs.map(async log => {
    try {
      const uidTrimmed = log.uid?.trim();
      const timestampTrimmed = log.timestamp?.trim();

      const student = await User.findOne({ uid: uidTrimmed, role: 'student' });
      if (!student) return { success: false };

      const attendanceDate = timestampTrimmed ? new Date(timestampTrimmed) : new Date();
      attendanceDate.setHours(0, 0, 0, 0);

      await Attendance.updateOne(
        { student: student._id, date: attendanceDate },
        { $setOnInsert: { schoolId: student.schoolId, teacherSchoolId: student.teacherSchoolId, student: student._id, date: attendanceDate, status: "Present" } },
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
 * @desc    Get today's attendance
 * @route   GET /api/attendance/today/:schoolId?
 * @access  Private (teacher/admin)
 */
const getTodaysAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = { date: today };

    if (req.user.role === "teacher") {
      query.teacherSchoolId = req.user.teacherSchoolId;
    } else if (req.params.schoolId) {
      query.schoolId = req.params.schoolId;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("student", "name  class schoolId username uid");

    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ message: 'Server error while fetching attendance.' });
  }
};

/**
 * @desc    Manual override attendance
 * @route   POST /api/attendance/manual-update
 * @access  Private (teacher/admin)
 */
const manualUpdateAttendance = async (req, res) => {
  const { uid, status, note } = req.body;
  if (!uid || !status) return res.status(400).json({ message: "UID and status are required" });

  try {
    const student = await User.findOne({ uid, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.updateOne(
      { student: student._id, date: today },
      { $set: { status, note: note || "", teacherSchoolId: student.teacherSchoolId, schoolId: student.schoolId } },
      { upsert: true }
    );

    const updatedAttendance = await Attendance.findOne({ student: student._id, date: today });

    res.status(200).json({ message: `${student.name} marked ${status}`, attendance: updatedAttendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating attendance" });
  }
};

/**
 * @desc    Get student's own attendance records
 */
const getMyAttendanceRecords = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({ student: studentId })
      .sort({ date: 1 })
      .populate("student", "name  class schoolId username uid");

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const absentDays = records.filter(r => r.status === "Absent").length;

    res.json({
      name: req.user.name,
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

// Mark absentees for school
const markAbsenteesForSchool = async (schoolId, teacherSchoolId = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = { schoolId, role: "student" };
  if (teacherSchoolId) query.teacherSchoolId = teacherSchoolId;

  const students = await User.find(query);
  const marked = await Attendance.find({ schoolId, teacherSchoolId, date: today });

  const absentStudents = students.filter(
    (s) => !marked.some((m) => m.student.toString() === s._id.toString())
  );

  if (absentStudents.length > 0) {
    const absentRecords = absentStudents.map((s) => ({
      student: s._id,
      schoolId: s.schoolId,
      teacherSchoolId: s.teacherSchoolId,
      date: today,
      status: "Absent",
    }));

    await Attendance.insertMany(absentRecords);
  }

  return {
    totalStudents: students.length,
    presentCount: marked.length,
    absentCount: absentStudents.length,
  };
};


const markAbsentees = async (req, res) => {
  try {
    const result = await markAbsenteesForSchool(req.params.schoolId);
    res.json({ message: "Absentees marked successfully", ...result });
  } catch (error) {
    console.error("Error marking absentees:", error);
    res.status(500).json({ message: "Server error while marking absentees." });
  }
};

/**
 * @desc    Attendance summary for today
 */
const getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = { date: today };

    if (req.user.role === "teacher") query.teacherSchoolId = req.user.teacherSchoolId;
    else if (req.params.schoolId) query.schoolId = req.params.schoolId;

    const summary = await Attendance.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get recent manual overrides
 * @route   GET /api/attendance/manual-overrides
 * @access  Private (teacher/admin)
 */
const getManualOverrides = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's attendance records that were manually overridden
    const overrides = await Attendance.find({
      date: today,
      note: { $exists: true, $ne: "" } // Only records with a note indicate manual override
    })
      .populate("student", "name rollNumber schoolId") // include student info
      .sort({ updatedAt: -1 }); // latest overrides first

    res.json(overrides);
  } catch (err) {
    console.error("Error fetching manual overrides:", err);
    res.status(500).json({ message: "Failed to fetch manual overrides" });
  }
};


export {
  markAttendance,
  getTodaysAttendance,
  syncOfflineAttendance,
  getMyAttendanceRecords,
  markAbsenteesForSchool,
  markAbsentees,
  getAttendanceSummary,
  manualUpdateAttendance,
  getManualOverrides
};
