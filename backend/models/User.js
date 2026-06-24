import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createMockModel } from '../config/localDbHelper.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
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
      enum: ['attendee', 'organizer'],
      default: 'attendee',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

let User;

if (global.useLocalDB) {
  User = createMockModel('User', userSchema, {
    matchPassword: function (enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    }
  }, {
    preSave: async function () {
      if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
  });
} else {
  User = mongoose.model('User', userSchema);
}

export default User;
