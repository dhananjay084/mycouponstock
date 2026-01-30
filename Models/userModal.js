// backend/Models/userModal.js (same file as before)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function () { return !this.googleId; },
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function () { return !this.googleId; }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: { type: String },
  refreshToken: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: { type: Date, default: Date.now },

  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
  
});

// Generate referral code before save if not set
UserSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex');
  }

  // Hash password if modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedRefreshToken = function () {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  this.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  return refreshToken;
};

UserSchema.methods.matchRefreshToken = function (providedToken) {
  if (!providedToken || !this.refreshToken) return false;
  const hashedProvidedToken = crypto.createHash('sha256').update(providedToken).digest('hex');
  return hashedProvidedToken === this.refreshToken;
};

export default mongoose.model('User', UserSchema);
