// backend/routes/authRoutes.js
import express from 'express';
import passport from 'passport'; // Import Passport (still used for Google OAuth initiation)
import * as authController from '../Controllers/authController.js'; // Import all exports from authController

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (generates access & refresh tokens, sets cookies)
// @access  Public (no backend authentication check)
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens (generates access & refresh tokens, sets cookies)
// @access  Public (no backend authentication check)
router.post('/login', authController.login);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth authentication
// @access  Public (no backend authentication check beyond Passport's initial redirect)
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'] // Request access to user's profile and email
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback route (generates access & refresh tokens, sets cookies)
// @access  Public (no backend authentication check beyond Passport's initial auth)
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`, // Redirect on failure
    session: true // Keep session after authentication
  }),
  authController.googleAuthCallback // Custom callback handler after successful authentication
);

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

// Removed: /api/admin/dashboard and /api/admin/login-specific routes
// As per your request, routes implying backend authentication/authorization are removed from here.
// Access control for /admin routes will now be managed solely in server.js (if any middleware is applied there)
// and primarily on the frontend.

export default router;
