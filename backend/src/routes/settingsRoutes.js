import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateAdmin } from '../middleware/auth.js';
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting
} from '../controllers/settingsController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for hero image uploads
const heroDir = path.join(__dirname, '../../uploads/hero');

// Ensure directory exists
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists at upload time
    if (!fs.existsSync(heroDir)) {
      try {
        fs.mkdirSync(heroDir, { recursive: true });
      } catch (err) {
        return cb(err);
      }
    }
    cb(null, heroDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Public routes
router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);

// Admin routes (protected)
router.post('/', authenticateAdmin, upload.single('file'), upsertSetting);
router.put('/:key', authenticateAdmin, upload.single('file'), upsertSetting);
router.delete('/:key', authenticateAdmin, deleteSetting);

// Multer error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
