import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Room description is required']
  },
  weekday_price: {
    type: Number,
    required: [true, 'Weekday price is required'],
    min: [0, 'Weekday price cannot be negative']
  },
  weekend_price: {
    type: Number,
    required: [true, 'Weekend price is required'],
    min: [0, 'Weekend price cannot be negative']
  },
  weekday_discount_price: {
    type: Number,
    default: 0,
    min: [0, 'Weekday discount price cannot be negative']
  },
  weekend_discount_price: {
    type: Number,
    default: 0,
    min: [0, 'Weekend discount price cannot be negative']
  },
  price_reduction_per_bedroom: {
    type: Number,
    default: 0,
    min: [0, 'Price reduction cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [1, 'Must have at least 1 bedroom']
  },
  min_bedrooms: {
    type: Number,
    default: 1,
    min: [1, 'Minimum bedrooms must be at least 1']
  },
  image_url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  images: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
roomSchema.index({ available: 1, weekday_price: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
