import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

// @desc    Get analytics for organizer
// @route   GET /api/analytics
// @access  Private/Organizer
export const getOrganizerAnalytics = async (req, res) => {
  try {
    // 1. Get all events created by the organizer
    const events = await Event.find({ organizer: req.user._id });
    
    if (!events.length) {
      return res.json({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        checkInRate: 0,
        salesByCategory: [],
        eventBreakdown: [],
        recentBookings: []
      });
    }

    const eventIds = events.map(event => event._id);

    // 2. Get all bookings for these events
    const bookings = await Booking.find({ event: { $in: eventIds } })
      .populate('user', 'name email')
      .populate('event', 'title category price ticketsSold');

    // 3. General Statistics calculations
    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((acc, curr) => acc + curr.ticketsSold, 0);
    const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalPaid, 0);
    
    // Count actual checked-in tickets
    const checkedInCount = bookings.reduce((acc, curr) => acc + (curr.checkedIn ? curr.ticketCount : 0), 0);
    const checkInRate = totalTicketsSold > 0 ? Math.round((checkedInCount / totalTicketsSold) * 100) : 0;

    // 4. Sales by Category
    const categoryMap = {};
    events.forEach(event => {
      categoryMap[event.category] = (categoryMap[event.category] || 0) + event.ticketsSold;
    });
    const salesByCategory = Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat]
    }));

    // 5. Event Breakdown
    const eventBreakdown = events.map(event => {
      const eventBookings = bookings.filter(b => b.event._id.toString() === event._id.toString());
      const revenue = eventBookings.reduce((sum, b) => sum + b.totalPaid, 0);
      const checkIns = eventBookings.reduce((sum, b) => sum + (b.checkedIn ? b.ticketCount : 0), 0);

      return {
        _id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        price: event.price,
        capacity: event.capacity,
        ticketsSold: event.ticketsSold,
        revenue,
        checkedInCount: checkIns
      };
    });

    // 6. Recent bookings for organizer's events (top 5)
    const recentBookings = bookings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(b => ({
        _id: b._id,
        userName: b.user ? b.user.name : 'Deleted User',
        eventTitle: b.event ? b.event.title : 'Deleted Event',
        ticketCount: b.ticketCount,
        totalPaid: b.totalPaid,
        checkedIn: b.checkedIn,
        createdAt: b.createdAt
      }));

    res.json({
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      checkInRate,
      salesByCategory,
      eventBreakdown,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
