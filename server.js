import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './congif/db.js';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// Connect to database

const app = express();
app.set("trust proxy", 1); // Enable secure cookies behind proxy (like on Vercel or Render)

// Body parsing (keep limits sane to avoid memory spikes on large payloads)
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g., https://mycouponstock.com
  credentials: true,              // Allow cookies to be sent
}));

// Middleware
app.use(cookieParser());

// Routes
import authRoutes from './Routes/authRoutes.js';
import dealRoutes from './Routes/dealRoutes.js';
import storeRoutes from './Routes/storeRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import subscriberRoutes from './Routes/subscriberRoutes.js';
import viewRoutes from './Routes/viewRoutes.js';
import blogRoutes from './Routes/blogRoutes.js';
import adminRoutes from './Routes/homeAdminRoutes.js';
import contactRoutes from './Routes/contactRoute.js';
import paymentRoutes from './Routes/paymentRoutes.js';
import countryRoutes from './Routes/countryRoutes.js'
import referralRoutes from './Routes/referralRoutes.js';
import couponSubmissionRoutes from './Routes/couponSubmissionRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiresDatabase = (req) =>
  req.path.startsWith('/api/auth') ||
  req.path.startsWith('/api/deals') ||
  req.path.startsWith('/api/stores') ||
  req.path.startsWith('/api/categories') ||
  req.path.startsWith('/api/reviews') ||
  req.path.startsWith('/api/blogs') ||
  req.path.startsWith('/api/admin') ||
  req.path.startsWith('/api/countries') ||
  req.path.startsWith('/api/referral') ||
  req.path.startsWith('/api/coupon-submissions');

app.use((req, res, next) => {
  if (!requiresDatabase(req)) {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable. Please try again shortly.',
      code: 'DATABASE_UNAVAILABLE',
    });
  }

  return next();
});

app.use('/api/auth', authRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', subscriberRoutes);
app.use('/api/reviews', viewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/countries", countryRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/coupon-submissions', couponSubmissionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Backend server is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  connectDB().catch((error) => {
    console.error('❌ MongoDB background connection error:', error.message);
  });
});
