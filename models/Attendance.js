import mongoose from "mongoose";

// Define the schema for the Attendance model.
const attendanceSchema = new mongoose.Schema(
  {
    // A reference to the User who is being marked present.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // The school ID associated with the student and this attendance record.
    schoolId: {
      type: String,
      required: true,
    },
    // The date of the attendance record.
    date: {
      type: Date,
      required: true,
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' timestamp fields.
    timestamps: true,
  }
);

// This is a crucial database index. It ensures that the combination of a 'student'
// and a 'date' must be unique. This is the rule that prevents a student from
// being marked present more than once on the same day.
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Create the Attendance model from the schema.
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Export the Attendance model as the default export of this file.
export default Attendance;
