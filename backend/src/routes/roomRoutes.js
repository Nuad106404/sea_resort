import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getAllRooms,
  getRoomById,
  getFeaturedRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability
} from '../controllers/roomController.js';
import { authenticateAdmin, optionalAdminAuth } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for room image uploads
const roomsDir = path.join(__dirname, '../../uploads/rooms');

// Ensure directory exists
if (!fs.existsSync(roomsDir)) {
  fs.mkdirSync(roomsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists at upload time
    if (!fs.existsSync(roomsDir)) {
      try {
        fs.mkdirSync(roomsDir, { recursive: true });
      } catch (err) {
        return cb(err);
      }
    }
    cb(null, roomsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Multiple images upload
const uploadMultiple = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Public routes (with optional admin auth for getAllRooms)
router.get('/', optionalAdminAuth, getAllRooms);
router.get('/featured', getFeaturedRooms);
router.get('/:id', getRoomById);

// Admin routes (protected)
router.post('/', authenticateAdmin, uploadMultiple.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), createRoom);
router.put('/:id', authenticateAdmin, uploadMultiple.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), updateRoom);
router.delete('/:id', authenticateAdmin, deleteRoom);
router.patch('/:id/toggle', authenticateAdmin, toggleRoomAvailability);

// Multer error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 10 images allowed' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
