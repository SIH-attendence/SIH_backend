import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ['student', 'teacher'], 
    },

    schoolId: {
      type: String,
      required: true,
    },

    uid: {
      type: String,
      unique: true,

      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model('User', userSchema);

export default User;

