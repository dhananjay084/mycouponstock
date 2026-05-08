// backend/controllers/authController.js
import User from '../Models/userModal.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // For hashing refresh tokens

const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

// Function to generate an Access Token (short-lived)
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Access token expires in 15 minutes
  });
}; 

// Function to generate a Refresh Token (long-lived)
// This token will be hashed and stored in the database
const generateAndStoreRefreshToken = async (user) => {
  const refreshToken = user.getSignedRefreshToken(); // Generates and hashes, stores hash on user object
  await user.save({ validateBeforeSave: false }); // Save user with new hashed refresh token
  return refreshToken; // Return the unhashed token to be sent to the client
};
// Helper to set HTTP-only cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production' ;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,                   // Only secure in production
    sameSite: isProd ? 'None' : 'Lax', // 'Lax' for local development
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const verifyGoogleCredential = async (credential) => {
  const url = new URL(GOOGLE_TOKENINFO_URL);
  url.searchParams.set('id_token', credential);

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Google token verification failed');
  }

  const payload = await response.json();
  const validIssuers = new Set(['accounts.google.com', 'https://accounts.google.com']);

  if (!payload?.sub || !payload?.aud || !validIssuers.has(payload.iss)) {
    throw new Error('Invalid Google token payload');
  }

  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch');
  }

  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw new Error('Google account email is not verified');
  }

  return payload;
};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (no backend authentication check)
export const register = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, phone, password, role: 'user' }); // Default role 'user'

    if (user) {
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = await generateAndStoreRefreshToken(user);

      setAuthCookies(res, accessToken, refreshToken);

      res.status(201).json({
        ...serializeUser(user),
        message: 'Registration successful. You are logged in.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public (no backend authentication check)
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = await generateAndStoreRefreshToken(user);

      setAuthCookies(res, accessToken, refreshToken);

      res.json({
        ...serializeUser(user),
        message: 'Login successful.'
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Login/register with Google ID token
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const googleProfile = await verifyGoogleCredential(credential);

    let user = await User.findOne({
      $or: [
        { googleId: googleProfile.sub },
        ...(googleProfile.email ? [{ email: googleProfile.email }] : []),
      ],
    });

    if (!user) {
      user = await User.create({
        googleId: googleProfile.sub,
        email: googleProfile.email,
        name: googleProfile.name || googleProfile.given_name || 'Google User',
        role: 'user',
      });
    } else {
      let hasChanges = false;
      if (!user.googleId) {
        user.googleId = googleProfile.sub;
        hasChanges = true;
      }
      if (!user.email && googleProfile.email) {
        user.email = googleProfile.email;
        hasChanges = true;
      }
      if (!user.name && googleProfile.name) {
        user.name = googleProfile.name;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save({ validateBeforeSave: false });
      }
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await generateAndStoreRefreshToken(user);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      user: serializeUser(user),
      message: 'Google login successful.',
    });
  } catch (error) {
    console.error('Google login error:', error.stack || error.message);
    return res.status(401).json({ message: 'Google authentication failed.' });
  }
};



// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public (no backend authentication check, relies on refresh token cookie)
export const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const user = await User.findOne({
      refreshToken: crypto.createHash('sha256').update(incomingRefreshToken).digest('hex')
    });

    if (!user || !user.matchRefreshToken(incomingRefreshToken)) {
      res.clearCookie('accessToken', { path: '/' }); // Explicitly clear with path
      res.clearCookie('refreshToken', { path: '/' }); // Explicitly clear with path
      return res.status(403).json({ message: 'Invalid refresh token. Please log in again.' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = await generateAndStoreRefreshToken(user);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({ message: 'Access token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public (no backend authentication check, clears cookies and DB refresh token)
export const logout = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;
  
    if (!incomingRefreshToken) {
      return res.status(200).json({ message: 'Already logged out or no active session' });
    }
  
    try {
      const user = await User.findOne({
        refreshToken: crypto.createHash('sha256').update(incomingRefreshToken).digest('hex')
      });
  
      if (user) {
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
      }
  
      const isProd = process.env.NODE_ENV === 'production';
  
      // Must match the same options as when setting
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        path: '/',
      });
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        path: '/',
      });
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error during logout' });
    }
  };
  
// @desc    Get current user details (WARNING: Now public, no auth check)
// @route   GET /api/auth/current_user
// @access  Public (no backend authentication check)
// This route will now return user data based on the access token in the cookie,
// but it won't enforce that the token is valid or present.
// The frontend will need to handle the token verification.
export const getCurrentUser = async (req, res) => {
  const token = req.cookies.accessToken; // Attempt to get token from cookie

  if (!token) {
    return res.status(200).json({ user: null, message: 'No access token found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name email phone role');
    if (!user) {
      return res.status(200).json({ user: null, message: 'User not found.' });
    }
    res.json({
      user: serializeUser(user),
      message: 'User data retrieved from token.'
    });
  } catch (error) {
    // If token is invalid or expired, return null user
    res.status(200).json({ user: null, message: 'Invalid or expired access token.' });
  }
};
export { generateAndStoreRefreshToken };
export {setAuthCookies};
