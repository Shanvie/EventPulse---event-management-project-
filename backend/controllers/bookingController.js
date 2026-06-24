import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import QRCode from 'qrcode';

// @desc    Create a new booking (mock payment flow)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  const { eventId, ticketCount } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const requestedTickets = Number(ticketCount) || 1;

    // Check capacity
    const availableTickets = event.capacity - event.ticketsSold;
    if (availableTickets < requestedTickets) {
      return res.status(400).json({
        message: `Only ${availableTickets} tickets are available for this event.`
      });
    }

    const totalPaid = event.price * requestedTickets;

    const booking = new Booking({
      event: eventId,
      user: req.user._id,
      ticketCount: requestedTickets,
      totalPaid,
      paymentStatus: 'paid' // Marked paid in this simulation
    });

    const createdBooking = await booking.save();

    // Increment tickets sold
    event.ticketsSold += requestedTickets;
    await event.save();

    // Pre-generate QR Code for response
    const qrCodeDataUrl = await QRCode.toDataURL(createdBooking.bookingCode);

    res.status(201).json({
      booking: createdBooking,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    // Generate QR codes for each booking
    const bookingsWithQR = await Promise.all(
      bookings.map(async (booking) => {
        let qrCodeDataUrl = '';
        try {
          qrCodeDataUrl = await QRCode.toDataURL(booking.bookingCode);
        } catch (err) {
          console.error('Failed to generate QR code', err);
        }
        return {
          ...booking.toObject(),
          qrCode: qrCodeDataUrl
        };
      })
    );

    res.json(bookingsWithQR);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify ownership or organizer status
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isOrganizer = booking.event.organizer.toString() === req.user._id.toString();

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(booking.bookingCode);

    res.json({
      booking,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify booking code & check-in attendee
// @route   POST /api/bookings/verify/:code
// @access  Private/Organizer
export const verifyBookingCode = async (req, res) => {
  const { code } = req.params;

  try {
    const booking = await Booking.findOne({ bookingCode: code.toUpperCase() })
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Invalid booking code.' });
    }

    // Verify organizer owns the event
    if (booking.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized. You do not own this event.' });
    }

    if (booking.checkedIn) {
      return res.status(400).json({
        message: 'Attendee is already checked in!',
        booking
      });
    }

    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.json({
      message: 'Attendee checked in successfully!',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
