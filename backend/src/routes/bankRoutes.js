import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateAdmin } from '../middleware/auth.js';
import {
  getAllBankAccounts,
  getActiveBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  toggleBankAccountStatus,
} from '../controllers/bankController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for QR code uploads
const qrCodesDir = path.join(__dirname, '../../uploads/qr-codes');

// Ensure directory exists
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists at upload time
    if (!fs.existsSync(qrCodesDir)) {
      try {
        fs.mkdirSync(qrCodesDir, { recursive: true });
      } catch (err) {
        return cb(err);
      }
    }
    cb(null, qrCodesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Public routes
router.get('/active', getActiveBankAccounts);

// Admin routes (protected)
router.get('/', authenticateAdmin, getAllBankAccounts);
router.get('/:id', authenticateAdmin, getBankAccountById);
router.post('/', authenticateAdmin, upload.single('qrCode'), createBankAccount);
router.put('/:id', authenticateAdmin, upload.single('qrCode'), updateBankAccount);
router.delete('/:id', authenticateAdmin, deleteBankAccount);
router.patch('/:id/toggle', authenticateAdmin, toggleBankAccountStatus);

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
