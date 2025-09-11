import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  instructor: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
