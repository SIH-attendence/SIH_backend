import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Performance from '../models/Performance.js';

/**
 * @desc Get student profile and academic stats
 * @route GET /api/profile/me
 * @access Private
 */
const getMyProfile = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).select(
      'name schoolId class section email phone parentPhone address dateOfBirth admissionDate bloodGroup nationality religion motherTongue fatherName motherName fatherOccupation motherOccupation emergencyContact hobbies'
    );

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const studentData = {
      _id: student._id,
      name: student.name || '',
      schoolId: student.schoolId || '',
      class: student.class || '',
      section: student.section || '',
      email: student.email || '',
      phone: student.phone || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth || '',
      admissionDate: student.admissionDate || '',
      bloodGroup: student.bloodGroup || '',
      nationality: student.nationality || '',
      religion: student.religion || '',
      motherTongue: student.motherTongue || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      fatherOccupation: student.fatherOccupation || '',
      motherOccupation: student.motherOccupation || '',
      emergencyContact: student.emergencyContact || '',
      hobbies: student.hobbies || ''
    };

    // Attendance stats
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Assignment stats
    const assignments = await Assignment.find({ student: studentId });
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const totalAssignments = assignments.length;

    const avgGrade = assignments.length > 0
      ? Math.round(assignments.reduce((acc, a) => acc + (a.grade || 0), 0) / totalAssignments)
      : 0;

    // Achievements
    const achievements = await Performance.find({ student: studentId }).select('title').limit(10);

    res.json({
      student: studentData,
      academicStats: {
        attendance: attendancePercentage,
        completedAssignments,
        totalAssignments,
        avgGrade,
      },
      achievements: achievements.map(a => a.title)
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

/**
 * @desc Update student profile
 * @route PATCH /api/profile/me
 * @access Private
 */
const updateMyProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { email, phone, class: studentClass, section, password } = req.body;

    const student = await User.findById(studentId);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Update fields if provided
    if (email !== undefined) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (studentClass !== undefined) student.class = studentClass;
    if (section !== undefined) student.section = section;
    if (password !== undefined && password.trim() !== '') student.password = password; // will hash automatically via pre-save

    await student.save();

    res.json({
      message: 'Profile updated successfully',
      student: {
        _id: student._id,
        name: student.name || '',
        schoolId: student.schoolId || '',
        class: student.class || '',
        section: student.section || '',
        email: student.email || '',
        phone: student.phone || ''
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
export { getMyProfile, updateMyProfile };
