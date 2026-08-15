import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

// Helper function to parse expire time from env
const parseExpireTime = (timeString) => {
  const match = timeString.match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 60 * 1000; // Default 1 hour
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000; // seconds
    case 'm': return value * 60 * 1000; // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    default: return 60 * 60 * 1000; // Default 1 hour
  }
};

// Helper function to check if a date is a weekend (Friday or Saturday)
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
};

// Helper to check whether a room is free for a date range (used by both
// the public availability-check endpoint and booking creation/edits, so
// double-booking is prevented no matter which path is used)
const isRoomAvailable = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const query = {
    room_id: roomId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      // New booking starts during existing booking
      { check_in: { $lte: checkInDate }, check_out: { $gt: checkInDate } },
      // New booking ends during existing booking
      { check_in: { $lt: checkOutDate }, check_out: { $gte: checkOutDate } },
      // New booking completely contains existing booking
      { check_in: { $gte: checkInDate }, check_out: { $lte: checkOutDate } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  return !conflict;
};

// Helper function to calculate total price based on weekday/weekend pricing
export const calculateTotalPrice = (room, checkIn, checkOut, bedroomsUsed = null) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  let totalPrice = 0;
  let currentDate = new Date(checkInDate);
  
  // Calculate price for each night
  while (currentDate < checkOutDate) {
    let nightPrice;
    
    // Use discount prices as the actual prices
    if (isWeekend(currentDate)) {
      // For weekend: use discount price if set, otherwise use regular weekend price
      nightPrice = (room.weekend_discount_price && room.weekend_discount_price > 0) 
        ? room.weekend_discount_price 
        : room.weekend_price;
    } else {
      // For weekday: use discount price if set, otherwise use regular weekday price
      nightPrice = (room.weekday_discount_price && room.weekday_discount_price > 0) 
        ? room.weekday_discount_price 
        : room.weekday_price;
    }
    
    totalPrice += nightPrice;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Apply bedroom reduction if specified
  if (bedroomsUsed !== null && bedroomsUsed < room.bedrooms && room.price_reduction_per_bedroom) {
    const bedroomsNotUsed = room.bedrooms - bedroomsUsed;
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalReduction = bedroomsNotUsed * room.price_reduction_per_bedroom * nights;
    totalPrice -= totalReduction;
  }
  
  return Math.max(0, totalPrice); // Ensure price is never negative
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const {
      room_id,
      check_in,
      check_out,
      guests,
      bedrooms_used,
      guest_name,
      guest_email,
      guest_phone
      // Note: total_price is intentionally NOT read from the request body.
      // It is always recalculated server-side below so a guest can't submit
      // an arbitrary price for their booking.
    } = req.body;

    if (!room_id || !check_in || !check_out || !guests || !guest_name || !guest_email || !guest_phone) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Validate room exists
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    if (guests > room.capacity) {
      return res.status(400).json({ error: `This room accommodates a maximum of ${room.capacity} guests` });
    }

    const bedroomsUsedRaw = bedrooms_used !== undefined ? parseInt(bedrooms_used) : NaN;
    const bedroomsUsed = Number.isFinite(bedroomsUsedRaw)
      ? Math.min(Math.max(bedroomsUsedRaw, room.min_bedrooms || 1), room.bedrooms)
      : null;

    // Prevent double-booking: reject if the room is already held/confirmed
    // for an overlapping range (previously unchecked at creation time)
    const available = await isRoomAvailable(room_id, checkInDate, checkOutDate);
    if (!available) {
      return res.status(409).json({ error: 'This room is no longer available for the selected dates' });
    }

    const totalPrice = calculateTotalPrice(room, check_in, check_out, bedroomsUsed);

    // Calculate expiration time
    const expireTimeMs = parseExpireTime(process.env.EXPIRE_TIME || '1h');
    const expiresAt = new Date(Date.now() + expireTimeMs);

    // Create booking
    const booking = new Booking({
      room_id,
      check_in: checkInDate,
      check_out: checkOutDate,
      guests,
      bedrooms_used: bedroomsUsed,
      guest_name,
      guest_email: guest_email.toLowerCase().trim(),
      guest_phone,
      total_price: totalPrice,
      payment_method: '',
      payment_status: 'pending',
      status: 'pending',
      expires_at: expiresAt
    });

    await booking.save();

    // Populate room details
    await booking.populate('room_id');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room_id')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room_id');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking by reference
export const getBookingByReference = async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      booking_reference: req.params.reference 
    }).populate('room_id');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if booking is expired and delete it immediately
    if (booking.isExpired()) {
      await Booking.findByIdAndDelete(booking._id);
      return res.status(410).json({ 
        error: 'Booking has expired and has been deleted',
        expired: true 
      });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookings by email
export const getBookingsByEmail = async (req, res) => {
  try {
    // This lookup only requires knowing the guest's email (no proof of
    // ownership), so keep the response minimal — never include payment
    // card data here even though only a masked last-4 is ever stored.
    const bookings = await Booking.find({
      guest_email: req.params.email.toLowerCase()
    })
      .select('-card_details')
      .populate('room_id')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking.
// - Admin callers (valid Bearer token, via optionalAdminAuth) may edit any
//   booking detail, same as before.
// - Public/guest callers may ONLY set the payment method and (for card
//   payments) a masked card summary on their own still-pending booking.
//   Guest identity/dates/room/price can no longer be rewritten by anyone
//   who simply knows a booking's ID.
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room_id');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking is expired and delete it immediately
    if (booking.isExpired()) {
      await Booking.findByIdAndDelete(booking._id);
      return res.status(410).json({
        error: 'Booking has expired and has been deleted',
        expired: true
      });
    }

    if (req.admin) {
      const {
        guest_name,
        guest_email,
        guest_phone,
        guests,
        check_in,
        check_out,
        room_id,
        total_price
      } = req.body;

      // If the stay itself is changing, re-check for conflicts against the
      // new room/dates (excluding this booking) before applying anything
      if (check_in !== undefined || check_out !== undefined || room_id !== undefined) {
        const newRoomId = room_id !== undefined ? room_id : booking.room_id._id;
        const newCheckIn = check_in !== undefined ? new Date(check_in) : booking.check_in;
        const newCheckOut = check_out !== undefined ? new Date(check_out) : booking.check_out;

        if (isNaN(newCheckIn) || isNaN(newCheckOut) || newCheckOut <= newCheckIn) {
          return res.status(400).json({ error: 'Check-out date must be after check-in date' });
        }

        const available = await isRoomAvailable(newRoomId, newCheckIn, newCheckOut, booking._id);
        if (!available) {
          return res.status(409).json({ error: 'This room is already booked for the selected dates' });
        }
      }

      if (guest_name !== undefined) booking.guest_name = guest_name;
      if (guest_email !== undefined) booking.guest_email = guest_email.toLowerCase().trim();
      if (guest_phone !== undefined) booking.guest_phone = guest_phone;
      if (guests !== undefined) booking.guests = guests;
      if (check_in !== undefined) booking.check_in = check_in;
      if (check_out !== undefined) booking.check_out = check_out;
      if (room_id !== undefined) booking.room_id = room_id;
      if (total_price !== undefined) booking.total_price = total_price;
    } else {
      // A guest can only act on their own booking while it's still pending —
      // once confirmed/cancelled/completed, this endpoint refuses further changes.
      if (booking.status !== 'pending') {
        return res.status(400).json({ error: 'This booking has already been processed and can no longer be modified' });
      }

      const { payment_method, card_details } = req.body;

      if (payment_method !== undefined) {
        if (!['bank_transfer', 'promptpay', 'card', ''].includes(payment_method)) {
          return res.status(400).json({ error: 'Invalid payment method' });
        }
        booking.payment_method = payment_method;
      }

      // Card "payment": only ever persist a masked last-4 summary. The full
      // card number, CVV, and OTP are validated in the browser and never
      // transmitted to or stored by the server.
      if (payment_method === 'card' && card_details) {
        const last4 = (card_details.card_last4 || '').replace(/\D/g, '').slice(-4);
        booking.card_details = {
          card_last4: last4 || null,
          card_holder_name: card_details.card_holder_name || null,
          card_expiry: card_details.card_expiry || null
        };
        booking.payment_status = 'completed';
        booking.status = 'confirmed';
      }
    }

    await booking.save();

    // Populate room_id before sending response
    await booking.populate('room_id');

    res.json(booking);
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, payment_status },
      { new: true, runValidators: true }
    ).populate('room_id');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Booking status update error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('room_id');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check room availability
export const checkAvailability = async (req, res) => {
  try {
    const { room_id, check_in, check_out } = req.query;

    const available = await isRoomAvailable(room_id, new Date(check_in), new Date(check_out));

    res.json({ available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload payment slip
export const uploadPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Store the slip for admin review — do NOT auto-confirm. Anyone can
    // upload any image here, so payment/status stay 'pending' until an
    // admin actually verifies the transfer and confirms the booking.
    booking.payment_slip_url = `/uploads/payment-slips/${req.file.filename}`;
    booking.payment_slip_uploaded_at = new Date();
    await booking.save();

    res.json({
      message: 'Payment slip uploaded successfully',
      payment_slip_url: booking.payment_slip_url,
      payment_status: booking.payment_status,
      status: booking.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete booking (admin only)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate price for a booking
export const calculatePrice = async (req, res) => {
  try {
    const { room_id, check_in, check_out, bedrooms_used } = req.query;

    // Validate room exists
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Calculate total price
    const bedroomsUsed = bedrooms_used ? parseInt(bedrooms_used) : null;
    const totalPrice = calculateTotalPrice(room, check_in, check_out, bedroomsUsed);

    res.json({ 
      total_price: totalPrice,
      room_name: room.name,
      bedrooms: room.bedrooms,
      bedrooms_used: bedroomsUsed,
      weekday_price: room.weekday_price || room.price_per_night,
      weekend_price: room.weekend_price || room.price_per_night,
      price_reduction_per_bedroom: room.price_reduction_per_bedroom || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
