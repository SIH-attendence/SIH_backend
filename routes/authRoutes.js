import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  assignStudentToTeacher,
  getStudents,
  updateStudent, deleteStudent,
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.post('/assign-student', protect, assignStudentToTeacher);
router.get('/students', protect, getStudents);
router.put('/students/:id', protect, updateStudent);
router.delete('/students/:id', protect, deleteStudent);


export default router;
