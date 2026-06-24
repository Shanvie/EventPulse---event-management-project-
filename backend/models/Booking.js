import mongoose from 'mongoose';
import { createMockModel } from '../config/localDbHelper.js';

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketCount: {
      type: Number,
      required: true,
      default: 1,
    },
    totalPaid: {
      type: Number,
      required: true,
    },
    bookingCode: {
      type: String,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate a unique booking code
bookingSchema.pre('save', async function (next) {
  if (!this.bookingCode) {
    this.bookingCode = 'EVM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

let Booking;

if (global.useLocalDB) {
  Booking = createMockModel('Booking', bookingSchema, {}, {
    preSave: async function () {
      if (!this.bookingCode) {
        this.bookingCode = 'EVM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
    }
  });
} else {
  Booking = mongoose.model('Booking', bookingSchema);
}

export default Booking;
