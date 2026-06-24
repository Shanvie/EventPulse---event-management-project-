import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Booking from './models/Booking.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // 1. Clear database
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();

    console.log('Database cleared!');

    // 2. Create Users
    const organizer = await User.create({
      name: 'Sarah Jenkins',
      email: 'organizer@event.com',
      password: 'password123',
      role: 'organizer'
    });

    const attendee = await User.create({
      name: 'Alex Rivera',
      email: 'attendee@event.com',
      password: 'password123',
      role: 'attendee'
    });

    console.log('Users seeded!');

    // 3. Create Events
    const events = [
      {
        title: 'Global Tech Summit 2026',
        description: 'Join top industry leaders, researchers, and developers to explore AI innovation, next-gen cloud architectures, and the roadmap of web engineering. Features workshops, panels, and networking lounges.',
        date: new Date('2026-10-15T09:00:00Z'),
        time: '09:00 AM - 05:00 PM',
        venue: 'Silicon Valley Convention Center, CA',
        category: 'Tech',
        price: 199,
        capacity: 250,
        ticketsSold: 0,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id
      },
      {
        title: 'Neon Summer Music Festival',
        description: 'Dance under the stars at the biggest electronic music beach party of the year. Featuring an international lineup of DJs, mesmerizing laser light shows, and premium food trucks.',
        date: new Date('2026-08-22T16:00:00Z'),
        time: '04:00 PM - 02:00 AM',
        venue: 'Sunset Sands Beachfront, FL',
        category: 'Music',
        price: 55,
        capacity: 500,
        ticketsSold: 0,
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id
      },
      {
        title: 'International Culinary Gala',
        description: 'Treat your taste buds to an exclusive evening of fine dining. Watch live demonstrations from Michelin-starred chefs, participate in wine pairing workshops, and sample gourmet cuisines from 12 countries.',
        date: new Date('2026-09-05T18:00:00Z'),
        time: '06:00 PM - 10:00 PM',
        venue: 'The Grand Ballroom, NY',
        category: 'Food',
        price: 85,
        capacity: 120,
        ticketsSold: 0,
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id
      },
      {
        title: 'Championship Charity Fun Run',
        description: 'Lace up your running shoes and join our 5K charity run! 100% of registration donations go towards supporting local children\'s hospitals. Free snacks, t-shirts, and participation medals included!',
        date: new Date('2026-07-12T07:30:00Z'),
        time: '07:30 AM - 11:00 AM',
        venue: 'Central Park Green Loop, NY',
        category: 'Sports',
        price: 0, // Free event
        capacity: 400,
        ticketsSold: 0,
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id
      },
      {
        title: 'Modern Digital Art Exhibition',
        description: 'Explore the boundaries of art and technology. This showcase highlights leading virtual reality sculptors, generative artificial intelligence canvas works, and interactive neon projection installations.',
        date: new Date('2026-11-02T10:00:00Z'),
        time: '10:00 AM - 08:00 PM',
        venue: 'Metropolis Contemporary Art Gallery',
        category: 'Arts',
        price: 15,
        capacity: 100,
        ticketsSold: 0,
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id
      }
    ];

    await Event.insertMany(events);
    console.log('Events seeded successfully!');

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
