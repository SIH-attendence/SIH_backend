import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  attendance: { type: Number, required: true }, // % attendance
}, { timestamps: true });

export default mongoose.model('Performance', performanceSchema);
