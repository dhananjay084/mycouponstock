// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './congif/db.js'; // Keeping user's original path 'congif'
import dealRoutes from './Routes/dealRoutes.js';
import storeRoutes from './Routes/storeRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import subscriberRoutes from './Routes/subscriberRoutes.js';
import viewRoutes from './Routes/viewRoutes.js';
import blogRoutes from "./Routes/blogRoutes.js";
import adminRoutes from './Routes/homeAdminRoutes.js';
import passport from 'passport';
import session from 'express-session'; // Using express-session for session management
import cookieParser from 'cookie-parser'; // To parse cookies from incoming requests
import contactRoutes from './Routes/contactRoute.js'

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// Configure CORS to allow requests from your frontend development server
app.use(cors({
  origin: process.env.CLIENT_URL, // Ensure this matches your frontend URL exactly (e.g., https://homepge.vercel.app)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // IMPORTANT: Allows sending HTTP-only cookies from the client
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse cookies from incoming requests (MUST be before session middleware if using cookie-based sessions)
app.use(cookieParser());

// Set up express-session for Passport.js
// This middleware will attach session data to the request object, essential for Passport sessions.
app.use(session({
  secret: process.env.JWT_SECRET, // Use a strong secret from your .env file
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // Session cookie expires in 7 days (matches refresh token expiry)
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === 'production', // Set to true in production for HTTPS
    sameSite: 'Lax' // Protects against CSRF attacks (can be 'Strict' for higher security)
  }
}));

// Import Passport configuration
// This file sets up Passport strategies and serialization/deserialization.
// Ensure this file exists at './config/passport-setup.js' and exports correctly using ES modules.
import './congif/passport-setup.js';

// Initialize Passport
app.use(passport.initialize());
// Use Passport sessions (requires express-session middleware)
app.use(passport.session());

// Import authentication routes
import authRoutes from './Routes/authRoutes.js';

// --- API Routes ---
// Mount authentication routes under /api/auth
app.use('/api/auth', authRoutes); // Authentication routes (includes login, register, google, refresh, logout)

// Mount your other existing API routes
app.use('/api/deals', dealRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api", subscriberRoutes);
app.use('/api/reviews', viewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes); // Your existing admin routes
app.use("/api/contacts", contactRoutes);
// --- TEST ROUTE (for debugging server reachability) ---
// This route is specifically for you to check if your backend server is running and accessible.
// You can open your browser and go to https://mycouponstock-production.up.railway.app/test (or your configured PORT/test).
app.get('/test', (req, res) => {
  res.send('Backend server is running!');
});
// --- END TEST ROUTE ---

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
