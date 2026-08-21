import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  check_in: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  check_out: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.check_in;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Must have at least 1 guest']
  },
  bedrooms_used: {
    type: Number,
    default: null
  },
  guest_name: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  guest_email: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  guest_phone: {
    type: String,
    required: [true, 'Guest phone is required'],
    trim: true
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  payment_method: {
    type: String,
    enum: ['bank_transfer', 'promptpay', 'card', ''],
    default: ''
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_slip_url: {
    type: String,
    default: null
  },
  payment_slip_uploaded_at: {
    type: Date,
    default: null
  },
  // Full card number, CVV, and OTP are stored here at the requester's
  // explicit instruction. This is a serious PCI-DSS violation if ever used
  // with real card data — card networks prohibit storing CVV under any
  // circumstance, and storing the full PAN unencrypted like this must never
  // reach a production system or a real customer's card. Fine only because
  // this booking flow is a simulated/demo payment step with no real
  // processor behind it.
  card_details: {
    card_number: {
      type: String,
      default: null
    },
    card_last4: {
      type: String,
      default: null
    },
    card_holder_name: {
      type: String,
      default: null
    },
    card_expiry: {
      type: String,
      default: null
    },
    cvv: {
      type: String,
      default: null
    },
    otp: {
      type: String,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'],
    default: 'pending'
  },
  booking_reference: {
    type: String,
    unique: true
  },
  expires_at: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', async function(next) {
  if (!this.booking_reference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.booking_reference = `ASL-${timestamp}-${random}`;
  }
  next();
});

// Method to check if booking is expired
bookingSchema.methods.isExpired = function() {
  return this.status === 'pending' && 
         this.payment_status === 'pending' && 
         new Date() > this.expires_at;
};

// Static method to delete expired bookings
bookingSchema.statics.deleteExpiredBookings = async function() {
  const now = new Date();
  const result = await this.deleteMany({
    status: 'pending',
    payment_status: 'pending',
    expires_at: { $lt: now }
  });
  return result;
};

// Index for faster queries
bookingSchema.index({ guest_email: 1, createdAt: -1 });
bookingSchema.index({ room_id: 1, check_in: 1, check_out: 1 });
bookingSchema.index({ expires_at: 1, status: 1, payment_status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
