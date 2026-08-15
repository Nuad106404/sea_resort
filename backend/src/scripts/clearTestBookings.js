import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

dotenv.config();

const clearTestBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('📦 Connected to MongoDB');

    // Get all bookings
    const bookings = await Booking.find().populate('room_id');
    console.log(`\n📋 Found ${bookings.length} bookings:\n`);
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.booking_reference}`);
      console.log(`   Room: ${booking.room_id?.name || 'Unknown'}`);
      console.log(`   Check-in: ${booking.check_in.toISOString().split('T')[0]}`);
      console.log(`   Check-out: ${booking.check_out.toISOString().split('T')[0]}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Guest: ${booking.guest_name}`);
      console.log('');
    });

    // Delete all bookings if --delete flag is passed
    if (process.argv.includes('--delete')) {
      const result = await Booking.deleteMany({});
      console.log(`\n🗑️  Deleted ${result.deletedCount} bookings`);
    } else {
      console.log('\n💡 To delete all bookings, run: npm run clear-bookings -- --delete');
    }

    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearTestBookings();
