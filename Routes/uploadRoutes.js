import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorizeRoles } from '../middleware/authmiddleware.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const mimeToExt = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const safeExt = mimeToExt[mime] || ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);
  const mime = String(file.mimetype || "").toLowerCase();
  if (!allowed.has(mime)) return cb(new Error("Only JPG/PNG/WEBP/GIF uploads are allowed"));
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(200).json({ success: true, url });
  }
);

export default router;
