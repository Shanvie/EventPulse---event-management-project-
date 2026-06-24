import mongoose from 'mongoose';
import { execSync } from 'child_process';

// Synchronously check if MongoDB port is open on localhost
let isMongoAvailable = false;
try {
  // nc -z -w 1 checks if port 27017 is open with a 1-second timeout
  execSync('nc -z -w 1 127.0.0.1 27017', { stdio: 'ignore' });
  isMongoAvailable = true;
} catch (e) {
  isMongoAvailable = false;
}

global.useLocalDB = !isMongoAvailable;

if (global.useLocalDB) {
  console.log('--------------------------------------------------');
  console.log('⚠️ MongoDB port 27017 is closed.');
  console.log('⚠️ File-based Database Fallback (JSON) is ENABLED.');
  console.log('--------------------------------------------------');
}

const connectDB = async () => {
  if (global.useLocalDB) return;
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management';
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Connection Error: ${error.message}`);
    global.useLocalDB = true;
  }
};

export default connectDB;
