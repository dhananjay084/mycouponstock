// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../Models/userModal.js'; // Assuming your User model path

export const protect = async (req, res, next) => {
  let token;

  // Check if access token cookie exists
  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request (without password)
    req.user = await User.findById(decoded.id).select('-password');
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Token verification error:', error);
    // If token is expired, send a specific message to trigger refresh on frontend
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired. Please refresh.' });
    }
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Optional: Middleware for role-based authorization (e.g., for admin routes)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};  