import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './congif/db.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';

// Load env vars
dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1); // ✅ allow secure cookies behind proxy

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g. https://mycouponstock.com
  credentials: true,              // ✅ send cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Passport
import './congif/passport-setup.js';
app.use(passport.initialize());

// Routes
import authRoutes from './Routes/authRoutes.js';
import dealRoutes from './Routes/dealRoutes.js';
import storeRoutes from './Routes/storeRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import subscriberRoutes from './Routes/subscriberRoutes.js';
import viewRoutes from './Routes/viewRoutes.js';
import blogRoutes from "./Routes/blogRoutes.js";
import adminRoutes from './Routes/homeAdminRoutes.js';
import contactRoutes from './Routes/contactRoute.js';

app.use('/api/auth', authRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api", subscriberRoutes);
app.use('/api/reviews', viewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contacts", contactRoutes);

app.get('/test', (req, res) => {
  res.send('Backend server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
