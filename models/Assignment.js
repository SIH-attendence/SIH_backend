import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  status: { type: String, enum: ["pending", "completed", "overdue"], default: "pending" },
  dueDate: { type: Date, required: true },
  estimatedTime: { type: String }, // e.g., '2 hours'
  assignedBy: { type: String }, 
  classId: { type: String }, 
 studentIds: [{ type: String }],// schoolId of student
  // teacher name
}, { timestamps: true });

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
