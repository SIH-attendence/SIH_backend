import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema for the User model.
const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // Each username must be unique
    },
    password: {
      type: String,
      required: true,
    },
    // Role management to distinguish between students and teachers
    role: {
      type: String,
      required: true,
      enum: ['student', 'teacher'], // Role can only be one of these two values
    },
    // School identifier, useful for multi-school systems
    schoolId: {
      type: String,
      required: true,
    },
    // RFID Unique ID, only required if the user is a student
    uid: {
      type: String,
      unique: true,
      // 'sparse: true' allows multiple documents to have no 'uid' field (e.g., for teachers),
      // but if a 'uid' is present, it must be unique.
      sparse: true,
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' timestamp fields
    timestamps: true,
  }
);

// Mongoose middleware to run BEFORE a user document is saved ('pre-save hook').
// This is used to automatically hash the password if it's new or has been changed.
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a 'salt' to add randomness to the hash, making it more secure.
  const salt = await bcrypt.genSalt(10);
  // Hash the plain-text password with the salt and update the document.
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create the User model from the schema.
const User = mongoose.model('User', userSchema);

// Export the User model as the default export of this file.
export default User;

