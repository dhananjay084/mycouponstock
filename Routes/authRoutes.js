// backend/routes/authRoutes.js
import express from 'express';
import * as authController from '../Controllers/authController.js'; // Import all exports from authController
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (generates access & refresh tokens, sets cookies)
// @access  Public (no backend authentication check)
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens (generates access & refresh tokens, sets cookies)
// @access  Public (no backend authentication check)
router.post('/login', authController.login);

// @route   POST /api/auth/social-login
// @desc    Login/register using frontend social auth payload
// @access  Public
router.post('/social-login', authController.socialLogin);

// @route   POST /api/auth/refresh-token
// @desc    Get a new access token using refresh token from cookie
// @access  Public (no backend authentication check, relies on refresh token cookie logic)
router.post('/refresh-token', authController.refreshAccessToken);

// @route   POST /api/auth/logout
// @desc    Logout user (clears cookies and invalidates refresh token in DB)
// @access  Public (no backend authentication check)
router.post('/logout', authController.logout);

// @route   GET /api/auth/current_user
// @desc    Get current user details (WARNING: Now public, no backend auth check)
// @access  Public (no backend authentication check)
// This route will now attempt to read the token and decode it, but won't enforce validity.
// The frontend is responsible for interpreting the response and managing authentication state.
router.get('/current_user', authController.getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, authController.updateProfile);

// @route   PUT /api/auth/password
// @desc    Update current user password
// @access  Private
router.put('/password', protect, authController.updatePassword);

// Removed: /api/admin/dashboard and /api/admin/login-specific routes
// As per your request, routes implying backend authentication/authorization are removed from here.
// Access control for /admin routes will now be managed solely in server.js (if any middleware is applied there)
// and primarily on the frontend.

export default router;
