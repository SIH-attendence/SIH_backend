const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'User name is required.']
  },
  // Unique username for portal login
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true
  },
  // Securely stored password
  password: {
    type: String,
    required: [true, 'Password is required.']
  },
  // Role can be either 'student' or 'teacher'
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  // The school this user belongs to
  schoolId: {
    type: String,
    required: [true, 'School ID is required.']
  },
  // The RFID card UID, unique to each student. Not required for teachers.
  uid: {
    type: String,
    unique: true,
    // This makes the 'uid' field optional.
    // It will still enforce uniqueness if a value is provided.
    sparse: true
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' timestamps
  timestamps: true
});

// --- Password Hashing Middleware ---
// This special function runs automatically *before* any 'save' operation on a User document.
userSchema.pre('save', async function(next) {
  // 'this' refers to the user document that is about to be saved.
  // We only want to hash the password if it's new or has been changed.
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a 'salt' - a random string to make the hash more secure.
    const salt = await bcrypt.genSalt(10);
    // Hash the user's plain-text password with the salt.
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


const User = mongoose.model('User', userSchema);
module.exports = User;
