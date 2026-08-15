import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';

dotenv.config();

const rooms = [
  {
    name: 'One Bedroom Villa - 1',
    description: 'A cozy one-bedroom villa perfect for couples seeking a romantic getaway. Features a private pool, outdoor bathtub, and stunning garden views. The villa combines modern luxury with natural elements, creating a serene atmosphere for relaxation.',
    weekday_price: 6990,
    weekend_price: 8990,
    weekday_discount_price: 0,
    weekend_discount_price: 0,
    price_reduction_per_bedroom: 0,
    capacity: 2,
    bedrooms: 1,
    image_url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600',
    features: [
      'Private pool',
      'Outdoor bathtub',
      'King-size bed',
      'Air conditioning',
      'Free Wi-Fi',
      'Mini bar',
      'Garden view',
      'In-villa breakfast'
    ],
    available: true
  },
  {
    name: 'Two Bedroom Villa - 2',
    description: 'Spacious two-bedroom villa ideal for small families or groups of friends. Enjoy your own private pool, fully equipped kitchen, and expansive living area surrounded by lush tropical gardens.',
    weekday_price: 9990,
    weekend_price: 12990,
    weekday_discount_price: 0,
    weekend_discount_price: 0,
    price_reduction_per_bedroom: 1500,
    capacity: 4,
    bedrooms: 2,
    image_url: 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=1600',
    features: [
      'Private pool',
      'Full kitchen',
      'Two king-size beds',
      'Air conditioning',
      'Free Wi-Fi',
      'Living room',
      'Dining area',
      'Garden terrace',
      'In-villa breakfast',
      'BBQ facilities'
    ],
    available: true
  },
  {
    name: 'Three Bedroom Villa - 3',
    description: 'Luxurious three-bedroom villa perfect for larger families or groups. Features multiple living spaces, a large private pool, and breathtaking views of the surrounding nature. Each bedroom has an ensuite bathroom.',
    weekday_price: 14990,
    weekend_price: 18990,
    weekday_discount_price: 0,
    weekend_discount_price: 0,
    price_reduction_per_bedroom: 2000,
    capacity: 6,
    bedrooms: 3,
    image_url: 'https://images.pexels.com/photos/1457846/pexels-photo-1457846.jpeg?auto=compress&cs=tinysrgb&w=1600',
    features: [
      'Large private pool',
      'Full kitchen',
      'Three king-size beds',
      'Three ensuite bathrooms',
      'Air conditioning',
      'Free Wi-Fi',
      'Living room',
      'Dining area',
      'Garden terrace',
      'Outdoor shower',
      'In-villa breakfast',
      'BBQ facilities',
      'Yoga deck'
    ],
    available: true
  },
  {
    name: 'Honeymoon Suite Villa',
    description: 'An intimate and romantic villa designed specifically for honeymooners. Features a heart-shaped pool, outdoor bathtub with champagne service, and the most private location in the resort.',
    weekday_price: 8990,
    weekend_price: 10990,
    weekday_discount_price: 0,
    weekend_discount_price: 0,
    price_reduction_per_bedroom: 0,
    capacity: 2,
    bedrooms: 1,
    image_url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1600',
    features: [
      'Heart-shaped pool',
      'Outdoor bathtub',
      'King-size canopy bed',
      'Air conditioning',
      'Free Wi-Fi',
      'Mini bar',
      'Champagne on arrival',
      'Romantic dinner setup',
      'In-villa breakfast',
      'Couples spa treatment'
    ],
    available: true
  },
  {
    name: 'Family Garden Villa',
    description: 'Perfect for families with children, this villa offers a safe enclosed garden, children\'s play area, and family-friendly amenities while maintaining the luxury and comfort of Asili Village.',
    weekday_price: 11990,
    weekend_price: 14990,
    weekday_discount_price: 0,
    weekend_discount_price: 0,
    price_reduction_per_bedroom: 1500,
    capacity: 5,
    bedrooms: 2,
    image_url: 'https://images.pexels.com/photos/1457845/pexels-photo-1457845.jpeg?auto=compress&cs=tinysrgb&w=1600',
    features: [
      'Private pool with shallow area',
      'Children\'s play area',
      'Full kitchen',
      'Two bedrooms',
      'Air conditioning',
      'Free Wi-Fi',
      'Living room',
      'Dining area',
      'Enclosed garden',
      'Baby cot available',
      'High chair available',
      'In-villa breakfast',
      'BBQ facilities'
    ],
    available: true
  }
];

const seedRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('🗑️  Cleared existing rooms');

    // Insert new rooms
    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Successfully seeded ${createdRooms.length} rooms`);

    console.log('\n📋 Created Rooms:');
    createdRooms.forEach(room => {
      console.log(`  - ${room.name} (Weekday: ${room.weekday_price} / Weekend: ${room.weekend_price} THB/night)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
    process.exit(1);
  }
};

seedRooms();
