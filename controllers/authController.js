import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";


const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/**
 * @desc Register a student or teacher
 */
const registerUser = async (req, res) => {
  try {
    const { name, username, password, role, schoolId, teacherSchoolId,  uid } = req.body;

    if (role === "student" && !schoolId) {
      return res.status(400).json({ message: "schoolId is required for students" });
    }

    if (role === "teacher" && !teacherSchoolId) {
      return res.status(400).json({ message: "teacherSchoolId is required for teachers" });
    }

const user = await User.create({
  name,
  username,
  password,
  role,
  schoolId: role === "student" ? schoolId : undefined,
  teacherSchoolId: teacherSchoolId || (role === "student" ? null : undefined), // assign for students if passed
  uid: uid || undefined,
});



    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
      teacherSchoolId: user.teacherSchoolId,
      uid: user.uid,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/**
 * @desc Login user
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        teacherSchoolId: user.teacherSchoolId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get user profile
 */
const getUserProfile = async (req, res) => {
  const user = req.user;
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
      teacherSchoolId: user.teacherSchoolId,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

/**
 * @desc Assign student to teacher
 */
const assignStudentToTeacher = async (req, res) => {
  const { studentId } = req.body; // student _id
  const teacher = req.user;

  if (teacher.role !== "teacher")
    return res.status(403).json({ message: "Only teachers can assign students" });

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    student.teacherSchoolId = teacher.teacherSchoolId; // 👈 assign same schoolId
    await student.save();

    res.json({ message: "Student assigned", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get students of logged-in teacher
 */
const getStudents = async (req, res) => {
  const teacher = req.user;
  try {
    const students = await User.find({
      teacherSchoolId: teacher.teacherSchoolId,
      role: "student",
    }).select("-password");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/**
 * @desc Update a student
 */
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role, schoolId, teacherSchoolId, uid } = req.body;

  try {
    const student = await User.findById(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update fields
    student.name = name || student.name;
    student.username = username || student.username;
    if (password) student.password = password; // assume pre-save hook hashes
    student.schoolId = schoolId || student.schoolId;
    student.teacherSchoolId = teacherSchoolId || student.teacherSchoolId;
    student.uid = uid || student.uid;

    const updatedStudent = await student.save();

    res.json({
      _id: updatedStudent._id,
      name: updatedStudent.name,
      username: updatedStudent.username,
      role: updatedStudent.role,
      schoolId: updatedStudent.schoolId,
      teacherSchoolId: updatedStudent.teacherSchoolId,
      uid: updatedStudent.uid,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a student
 */
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  // Check if ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  try {
    const student = await User.findById(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne(); // safer than remove()
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student error:", err); // log exact error
    res.status(500).json({ message: "Server error while deleting student" });
  }
};
export {
  registerUser,
  loginUser,
  getUserProfile,
  assignStudentToTeacher,
  getStudents,
  updateStudent, deleteStudent,
};
