import express from 'express';
import { createBooking, getMyBookings, getBookingById, verifyBookingCode } from '../controllers/bookingController.js';
import { protect, organizer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);

router.route('/my')
  .get(protect, getMyBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/verify/:code')
  .post(protect, organizer, verifyBookingCode);

export default router;
