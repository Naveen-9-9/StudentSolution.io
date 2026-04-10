const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const userService = require('../domain/userService');
const { authenticateToken, generateAccessToken, generateRefreshToken } = require('../../../middleware/jwt');
const { requireAuth } = require('../../../middleware/roles');
const { ValidationError } = require('../../../libraries/errors');
const { validate, asyncHandler } = require('../../../middleware/validate');
const logger = require('../../../libraries/logger');
const { sendVerificationEmail } = require('../../../libraries/email');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const user = await userService.registerUser(email, password, name);

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Send verification email (async)
  sendVerificationEmail(user, user.verificationToken).catch(err => {
    logger.error('Failed to send verification email during registration:', err);
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        bio: user.bio,
        socialLinks: user.socialLinks,
        avatarId: user.avatarId,
        themePreference: user.themePreference
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('Login error:', err);
      return next(err);
    }

    if (!user) {
      return next(new ValidationError(info.message || 'Login failed'));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          bio: user.bio,
          socialLinks: user.socialLinks,
          avatarId: user.avatarId,
          themePreference: user.themePreference
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  })(req, res, next);
});

// @route   GET /auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`
  }, (err, user, info) => {
    if (err) {
      logger.error('Google callback auth error:', err, info);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }

    if (!user) {
      logger.error('Google callback no user:', info);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }

    req.user = user;
    next();
  })(req, res, next);
},
(req, res) => {
    try {
      // Generate tokens
      const accessToken = generateAccessToken(req.user._id);
      const refreshToken = generateRefreshToken(req.user._id);

      // Redirect to frontend with tokens
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const encodedToken = encodeURIComponent(accessToken);
      const encodedRefreshToken = encodeURIComponent(refreshToken);
      res.redirect(`${clientUrl}/auth/success?token=${encodedToken}&refreshToken=${encodedRefreshToken}`);
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  }
);

// @route   POST /auth/refresh
// @desc    Refresh access token
// @access  Public (with refresh token)
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token required');
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  if (decoded.type !== 'refresh') {
    throw new ValidationError('Invalid refresh token');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(decoded.userId);
  const newRefreshToken = generateRefreshToken(decoded.userId);

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  });
}));

// @route   GET /auth/verify
// @desc    Verify email address
// @access  Public
router.get('/verify', asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ValidationError('Verification token required');
  }

  await userService.verifyEmail(token);

  res.json({
    success: true,
    message: 'Identity established and verified.'
  });
}));

// @route   POST /auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  const user = await userService.createVerificationToken(req.user.userId);
  
  await sendVerificationEmail(user, user.verificationToken);

  res.json({
    success: true,
    message: 'New verification link dispatched.'
  });
}));

// @route   POST /auth/logout
// @desc    Logout user (client should discard tokens)
// @access  Private
router.post('/logout', requireAuth, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // In the future, we could implement token blacklisting
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.userId);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        registeredAt: user.registeredAt,
        lastLogin: user.lastLogin,
        bio: user.bio,
        socialLinks: user.socialLinks,
        avatarId: user.avatarId,
        themePreference: user.themePreference
      }
    }
  });
}));

// @route   PUT /auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', authenticateToken, requireAuth, validate(updateProfileSchema), asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user.userId, req.body);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        bio: user.bio,
        socialLinks: user.socialLinks,
        avatarId: user.avatarId,
        themePreference: user.themePreference
      }
    }
  });
}));

// @route   POST /auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, requireAuth, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await userService.updatePassword(req.user.userId, oldPassword, newPassword);

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// @route   DELETE /auth/me
// @desc    Delete user account
// @access  Private
router.delete('/me', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user.userId);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

module.exports = router;