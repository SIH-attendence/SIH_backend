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
// GET /api/assignments
export const getAssignments = async (req, res) => {
  try {
    const { role, schoolId, classId } = req.user;

    console.log("Fetching assignments for user:", req.user);

    let assignments;

    if (role === "teacher") {
      // Teachers see all assignments they created for their school
      assignments = await Assignment.find({ schoolId }).sort({ dueDate: 1 });
    } else if (role === "student") {
      // Students see assignments assigned to their school or their class
      assignments = await Assignment.find({
        $or: [
          { studentIds: { $in: [schoolId] } }, // use schoolId here
          { classId: classId }
        ]
      }).sort({ dueDate: 1 });
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    console.log("Assignments found:", assignments.length);
    assignments.forEach(a =>
      console.log(`Assignment: ${a.title} Due: ${a.dueDate} Student IDs: ${a.studentIds} Class ID: ${a.classId}`)
    );

    // Convert each assignment to plain object and ensure dueDate is string
    const formattedAssignments = assignments.map(a => ({
      ...a.toObject(),
      dueDate: a.dueDate.toISOString(),
    }));

    res.json(formattedAssignments);

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
