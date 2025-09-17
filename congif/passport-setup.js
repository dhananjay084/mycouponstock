// backend/config/passport-setup.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // Import Strategy directly
import User from '../Models/userModal.js'; // Use .js extension for ES modules
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Serialize user into the session
// This function determines which user data should be stored in the session.
// Here, we store the user's ID. This ID will be used to retrieve the full user object later.
passport.serializeUser((user, done) => {
  done(null, user.id); // 'user.id' refers to the MongoDB document's _id
});

// Deserialize user from the session
// This function retrieves the user object based on the ID stored in the session.
// It's called on every subsequent request to retrieve the user from the database.
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user); // Attach the full user object to req.user
    })
    .catch(err => {
      done(err, null);
    });
});

// Configure Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // The callback URL where Google will redirect after authentication.
      // This must match the authorized redirect URI configured in your Google Cloud Console.
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
    },
   async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile:', profile);
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      console.log('User found:', user.email);
      done(null, user);
    } else {
      user = new User({
        googleId: profile.id,
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
        name: profile.displayName,
      });
      await user.save();
      console.log('New user created:', user.email);
      done(null, user);
    }
  } catch (err) {
    console.error('Google strategy error:', err);
    done(err, null);
  }
}

  )
);
