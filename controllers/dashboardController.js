// controllers/dashboardController.js
import Assignment from '../models/Assignment.js';
import Schedule from '../models/Schedule.js';
import Announcement from '../models/Announcement.js';
import Performance from '../models/Performance.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // --- Student Info ---
    const studentInfo = await User.findById(studentId).select('name studentId program');

    // --- Attendance ---
    const allAttendance = await Attendance.find({ student: studentId });

    const totalDays = allAttendance.length;
    const presentDays = allAttendance.filter(a => a.status === 'Present').length;
    const absentDays = totalDays - presentDays;

    // This week calculation
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weekRecords = allAttendance.filter(a => new Date(a.date) >= startOfWeek);
    const thisWeek = weekRecords.filter(a => a.status === 'Present').length;
    const thisWeekTotal = weekRecords.length;

    const attendance = {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      thisWeek,
      thisWeekTotal,
      thisWeekPercentage: thisWeekTotal > 0 ? Math.round((thisWeek / thisWeekTotal) * 100) : 0,
    };

    // --- Assignments (filtered by student) ---
    const assignments = await Assignment.find({ student: studentId });

    const completed = assignments.filter(a => a.status === 'completed').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const totalAssignments = assignments.length;

    // Calculate average grade (ignoring null/undefined grades)
    const gradedAssignments = assignments.filter(a => typeof a.grade === 'number');
    const avgGrade = gradedAssignments.length > 0
      ? Math.round(gradedAssignments.reduce((acc, a) => acc + a.grade, 0) / gradedAssignments.length)
      : 0;

    const homeworkStats = { completed, pending, total: totalAssignments, avgGrade };

    // --- Today's Classes ---
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const upcomingClasses = await Schedule.find({
      student: studentId,
      date: { $gte: today, $lt: tomorrow }
    });

    // --- Announcements ---
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(10);

    // --- Subject Performance ---
    const performance = await Performance.find({ student: studentId });

    // --- Return All Data ---
    res.json({
      studentInfo,
      attendance,
      assignments: homeworkStats,
      upcomingClasses,
      announcements,
      performance
    });

  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

export { getDashboard };
