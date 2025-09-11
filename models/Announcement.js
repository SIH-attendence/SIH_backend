import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['important','info','opportunity'], default: 'info' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Announcement', announcementSchema);
