import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateAdmin, optionalAdminAuth } from '../middleware/auth.js';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingByReference,
  getBookingsByEmail,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  checkAvailability,
  uploadPaymentSlip,
  deleteBooking,
  calculatePrice
} from '../controllers/bookingController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for payment slip uploads
const paymentSlipsDir = path.join(__dirname, '../../uploads/payment-slips');

// Ensure directory exists
if (!fs.existsSync(paymentSlipsDir)) {
  fs.mkdirSync(paymentSlipsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists at upload time
    if (!fs.existsSync(paymentSlipsDir)) {
      try {
        fs.mkdirSync(paymentSlipsDir, { recursive: true });
      } catch (err) {
        return cb(err);
      }
    }
    cb(null, paymentSlipsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-slip-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Public routes
router.post('/', createBooking);
// optionalAdminAuth lets the controller distinguish an admin edit (full
// access) from a guest payment update (payment method only) — see
// updateBooking in bookingController.js
router.put('/:id', optionalAdminAuth, updateBooking);
router.get('/reference/:reference', getBookingByReference);
router.get('/email/:email', getBookingsByEmail);
router.get('/availability', checkAvailability);
router.get('/calculate-price', calculatePrice);

// Payment slip upload route
router.post('/:id/payment-slip', upload.single('paymentSlip'), uploadPaymentSlip);

// Admin routes (protected)
router.get('/', authenticateAdmin, getAllBookings);
router.get('/:id', authenticateAdmin, getBookingById);
router.put('/:id/status', authenticateAdmin, updateBookingStatus);
router.put('/:id/cancel', authenticateAdmin, cancelBooking);
router.delete('/:id', authenticateAdmin, deleteBooking);

// Multer error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
