// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // For password hashing
import crypto from 'crypto'; // For generating refresh tokens

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function() { return !this.googleId; },
    unique: true,
    sparse: true // Allows multiple null values for email if googleId is present
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values for googleId
  },
  name: {
    type: String,
    required: false
  },
  // New: Field to store the hashed refresh token
  refreshToken: {
    type: String,
    required: false // Not required initially, generated on login
  },
  // New: Role for access control (e.g., 'user', 'admin')
  role: {
    type: String,
    enum: ['user', 'admin'], // Only allow 'user' or 'admin'
    default: 'user' // Default role is 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash the password before saving a new user or updating password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's new or has been modified and is not null/undefined
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
  }
  next(); // Continue with the save operation
});

// Method to compare entered password with hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // Use bcrypt to compare the plain text password with the hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash a refresh token
UserSchema.methods.getSignedRefreshToken = function() {
  const refreshToken = crypto.randomBytes(64).toString('hex'); // Generate a random string
  // Hash the refresh token before saving it to the database
  this.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return refreshToken; // Return the unhashed token to the user (to be sent via cookie)
};

// Method to compare a provided refresh token (from cookie) with the hashed one in the database
UserSchema.methods.matchRefreshToken = function(providedToken) {
  if (!providedToken || !this.refreshToken) return false;
  const hashedProvidedToken = crypto.createHash('sha256').update(providedToken).digest('hex');
  return hashedProvidedToken === this.refreshToken;
};

export default mongoose.model('User', UserSchema);
