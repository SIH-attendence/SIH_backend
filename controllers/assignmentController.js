import Assignment from "../models/Assignment.js";

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const {
      studentIds,
      classId,
      title,
      description,
      subject,
      priority,
      status,
      dueDate,
      estimatedTime,
    } = req.body;

    if (!studentIds?.length && !classId) {
      return res
        .status(400)
        .json({ message: "Either studentIds or classId is required" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      priority,
      status: status || "pending", // default
      dueDate,
      estimatedTime,
      studentIds: studentIds || [],
      classId: classId || undefined,
      schoolId: req.user.schoolId, // ✅ save schoolId
      assignedBy: req.user?.name || "Teacher",
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res
      .status(500)
      .json({ message: "Server error while creating assignment." });
  }
};

// GET /api/assignments
// Get assignments for this user
export const getAssignments = async (req, res) => {
  try {
    const { role, schoolId, studentId, classId } = req.user;

    let assignments;

    if (role === "teacher") {
      // Teachers see all assignments they created (optionally filter by school)
      assignments = await Assignment.find({ schoolId }).sort({ dueDate: 1 });
    } else if (role === "student") {
      // Students see assignments assigned to them or their class
      assignments = await Assignment.find({
        $or: [
          { studentIds: studentId },  // directly assigned to student
          { classId: classId }        // assigned to entire class
        ]
      }).sort({ dueDate: 1 });
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single assignment
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });
    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching assignment." });
  }
};

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });
    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Server error while updating assignment." });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found." });
    res.json({ message: "Assignment deleted successfully." });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Server error while deleting assignment." });
  }
};
