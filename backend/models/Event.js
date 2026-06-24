import mongoose from 'mongoose';
import { createMockModel } from '../config/localDbHelper.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Tech', 'Sports', 'Arts', 'Food', 'Other'],
      default: 'Other',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    capacity: {
      type: Number,
      required: true,
    },
    ticketsSold: {
      type: Number,
      required: true,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let Event;

if (global.useLocalDB) {
  Event = createMockModel('Event', eventSchema);
} else {
  Event = mongoose.model('Event', eventSchema);
}

export default Event;
