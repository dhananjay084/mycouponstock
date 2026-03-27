import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './congif/db.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from "body-parser";


// Load environment variables
dotenv.config();

// Connect to database

const app = express();
app.set("trust proxy", 1); // Enable secure cookies behind proxy (like on Vercel or Render)
app.use(bodyParser.json());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g., https://mycouponstock.com
  credentials: true,              // Allow cookies to be sent
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// 🔐 Session configuration (needed for passport sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboardcat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  }
}));



import './congif/passport-setup.js';  // Make sure this is configured correctly
app.use(passport.initialize());
app.use(passport.session());

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
  res.send('Backend server is running!');
});

// Start server only after DB is connected
const PORT = process.env.PORT || 5000;
async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

startServer();
