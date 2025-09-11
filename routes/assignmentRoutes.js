import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from "../controllers/assignmentController.js";

import protect from "../middleware/authMiddleware.js"; // optional auth

const router = express.Router();

// Public or protected routes
router.post("/", protect, createAssignment);
router.get("/", protect, getAssignments);
router.get("/:id", protect, getAssignmentById);
router.put("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);

export default router;
