import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    schoolId: { type: String, required: true },
    teacherSchoolId: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent"], default: "Absent" },

    // New fields for manual overrides
    originalStatus: { type: String, enum: ["Present", "Absent"], default: "Absent" }, // stores previous status before manual update
    note: { type: String, default: "" }, // reason for manual override
    teacherName: { type: String, default: "" }, // teacher/admin who did the override
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
