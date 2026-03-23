const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const userService = require('../apps/users/domain/userService');
const { AuthError } = require('../libraries/errors');
const logger = require('../libraries/logger');

// Local Strategy (email/password)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    // Update last login
    await userService.updateLastLogin(user._id);

    return done(null, user);
  } catch (error) {
    logger.error('Local strategy error:', error);
    return done(error);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;

    const user = await userService.findOrCreateGoogleUser(googleId, email, name);

    return done(null, user);
  } catch (error) {
    logger.error('Google strategy error:', error);
    return done(error);
  }
}));

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await userService.getUserById(payload.userId);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    logger.error('JWT strategy error:', error);
    return done(error, false);
  }
}));

module.exports = passport;