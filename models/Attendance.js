const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // A direct link to the student who is being marked present.
  // 'ref: 'User'' tells Mongoose that this ID corresponds to a document
  // in the 'User' collection. This is crucial for connecting the two models.
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The date of the attendance record. We store only the date part to ensure
  // that a student is marked present for the entire day, regardless of the time.
  date: {
    type: Date,
    required: true,
  },
  // The school this attendance record belongs to.
  // This is important for fetching attendance for a specific school.
  schoolId: {
    type: String,
    required: true,
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' timestamps
  timestamps: true
});

// --- Compound Unique Index ---
// This is a critical database rule. It ensures that the combination of a 'student' ID
// and a 'date' must be unique. This makes it physically impossible to create a duplicate
// attendance record for the same student on the same day.
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
