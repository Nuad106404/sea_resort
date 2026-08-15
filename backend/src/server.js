import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/database.js';
import { seedDefaultAdmin } from './utils/seedAdmin.js';
import { seedDefaultSettings } from './utils/seedSettings.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import Booking from './models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Create uploads directories if they don't exist
const paymentSlipsDir = path.join(__dirname, '../uploads/payment-slips');
const qrCodesDir = path.join(__dirname, '../uploads/qr-codes');
const roomsDir = path.join(__dirname, '../uploads/rooms');
const heroDir = path.join(__dirname, '../uploads/hero');

if (!fs.existsSync(paymentSlipsDir)) {
  fs.mkdirSync(paymentSlipsDir, { recursive: true });
}

if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true });
}

if (!fs.existsSync(roomsDir)) {
  fs.mkdirSync(roomsDir, { recursive: true });
}

if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

// Build the CORS allowlist from env. Placeholder values like "https://" are
// truthy and would otherwise slip through .filter(Boolean) as junk origins,
// so each entry must parse as a URL with a real hostname.
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.PRODUCTION_CLIENT_URL,
  process.env.PRODUCTION_ADMIN_URL
]
  .filter(Boolean)
  .filter((url) => {
    try {
      const { hostname } = new URL(url);
      // reject empty/dangling hostnames ("https://", "https://admin.")
      return hostname.length > 0 && !hostname.endsWith('.');
    } catch {
      return false;
    }
  });

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Resort API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: {
      message: message,
      status: status
    }
  });
});

// Scheduled job to delete expired bookings
const deleteExpiredBookings = async () => {
  try {
    const result = await Booking.deleteExpiredBookings();
  } catch (error) {
    // Error deleting expired bookings
  }
};

// Boot sequence: connect DB first, then seed the default admin, then listen.
// connectDB is awaited so seeding never races an unestablished connection.
const startServer = async () => {
  await connectDB();

  // Ensure the default admin exists (idempotent — see utils/seedAdmin.js)
  try {
    const { created, username } = await seedDefaultAdmin();
    if (created) {
      console.log(`✅ Default admin created — username: ${username}`);
      console.log('🔐 Change this password after first login.');
    } else {
      console.log(`ℹ️  Admin account already exists — username: ${username}`);
    }
  } catch (error) {
    // Don't take the API down over a seeding failure; log loudly instead.
    console.error('⚠️  Failed to seed default admin:', error.message);
  }

  // Ensure site content rows exist so /api/settings/:key stops 404-ing.
  // Existing values are never overwritten (see utils/seedSettings.js).
  try {
    const { created, total } = await seedDefaultSettings();
    if (created > 0) {
      console.log(`✅ Seeded ${created} missing site setting(s) of ${total}`);
    } else {
      console.log(`ℹ️  Site settings already present (${total} keys)`);
    }
  } catch (error) {
    console.error('⚠️  Failed to seed site settings:', error.message);
  }

  // Run expiration check every minute
  setInterval(deleteExpiredBookings, 60 * 1000);

  // Run once on startup
  deleteExpiredBookings();

  app.listen(PORT, () => {
    console.log(`🚀 API listening on http://localhost:${PORT}`);
    console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ') || '(none — browsers will be blocked)'}`);

    // The frontends call BACKEND_URL, so a port mismatch here means every
    // request 404s/refuses while the API looks perfectly healthy.
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const configuredPort = new URL(backendUrl).port || '80';
        if (configuredPort !== String(PORT)) {
          console.warn(
            `⚠️  BACKEND_URL (${backendUrl}) points at port ${configuredPort}, but this server is on ${PORT}. ` +
            `The frontends will not reach it.`
          );
        }
      } catch {
        console.warn(`⚠️  BACKEND_URL is not a valid URL: ${backendUrl}`);
      }
    }
  });
};

startServer();
