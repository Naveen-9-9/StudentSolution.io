const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const userService = require('../domain/userService');
const { authenticateToken, generateAccessToken, generateRefreshToken, tokenBlacklist } = require('../../../middleware/jwt');
const { requireAuth } = require('../../../middleware/roles');
const { ValidationError } = require('../../../libraries/errors');
const { validate, asyncHandler } = require('../../../middleware/validate');
const logger = require('../../../libraries/logger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../../libraries/email');
const { checkLockout, recordFailedAttempt, clearAttempts } = require('../../../middleware/loginLimiter');

const router = express.Router();

// Short-lived auth codes for OAuth token exchange (30-second TTL)
const authCodes = new Map();
const AUTH_CODE_TTL = 30 * 1000; // 30 seconds

// Cleanup expired codes every 60 seconds
const codeCleanup = setInterval(() => {
  const now = Date.now();
  for (const [code, data] of authCodes.entries()) {
    if (now - data.createdAt > AUTH_CODE_TTL) {
      authCodes.delete(code);
    }
  }
}, 60 * 1000);
if (codeCleanup.unref) codeCleanup.unref();

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
  name: Joi.string().min(1).max(50).optional(),
  bio: Joi.string().max(200).allow('').optional(),
  avatarId: Joi.string().optional(),
  themePreference: Joi.string().max(50).optional(),
  socialLinks: Joi.object({
    github: Joi.string().uri().allow('').optional(),
    linkedin: Joi.string().uri().allow('').optional(),
    twitter: Joi.string().uri().allow('').optional()
  }).optional()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().optional().allow(''),
  newPassword: Joi.string().min(6).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
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
  const { email } = req.body;
  
  // Check if account is locked
  const lockStatus = checkLockout(email);
  if (lockStatus.locked) {
    const minutesLeft = Math.ceil(lockStatus.remainingMs / 60000);
    return res.status(429).json({
      success: false,
      error: `Account temporarily locked. Try again in ${minutesLeft} minute(s).`,
      code: 'ACCOUNT_LOCKED'
    });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('Login error:', err);
      return next(err);
    }

    if (!user) {
      // Record failed attempt
      const result = recordFailedAttempt(email);
      const msg = result.locked 
        ? `Account locked after too many failed attempts. Try again in ${result.lockoutMinutes} minutes.`
        : (info.message || 'Login failed') + `. ${result.attemptsLeft} attempt(s) remaining.`;
      
      return res.status(401).json({
        success: false,
        error: msg,
        code: result.locked ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS'
      });
    }

    // Clear failed attempts on successful login
    clearAttempts(email);

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
      const crypto = require('crypto');
      const code = crypto.randomBytes(32).toString('hex');
      
      // Store the code with user data (short-lived)
      authCodes.set(code, {
        userId: req.user._id,
        createdAt: Date.now()
      });

      // Redirect with code only (not raw tokens)
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}/auth/success?code=${encodeURIComponent(code)}`);
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

  // Verify refresh token with refresh secret
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

  if (decoded.type !== 'refresh') {
    throw new ValidationError('Invalid refresh token');
  }

  // Check if this token has been blacklisted (logged out or already rotated)
  if (decoded.jti && tokenBlacklist.isBlacklisted(decoded.jti)) {
    throw new ValidationError('Token has been revoked');
  }

  // Blacklist the old refresh token to prevent reuse (Token Rotation)
  if (decoded.jti) {
    tokenBlacklist.add(decoded.jti, decoded.exp);
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

// @route   POST /auth/exchange
// @desc    Exchange short-lived auth code for JWT tokens (from OAuth callback)
// @access  Public
router.post('/exchange', asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    throw new ValidationError('Authorization code required');
  }

  const codeData = authCodes.get(code);
  
  if (!codeData) {
    throw new ValidationError('Invalid or expired authorization code');
  }

  // Check expiry
  if (Date.now() - codeData.createdAt > AUTH_CODE_TTL) {
    authCodes.delete(code);
    throw new ValidationError('Authorization code expired');
  }

  // Delete code immediately (single-use)
  authCodes.delete(code);

  // Generate tokens
  const accessToken = generateAccessToken(codeData.userId);
  const refreshToken = generateRefreshToken(codeData.userId);

  // Get user data
  const user = await userService.getUserById(codeData.userId);
  await userService.updateLastLogin(codeData.userId);

  res.json({
    success: true,
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

// @route   POST /auth/forgot-password
// @desc    Initiate forgot password flow
// @access  Public
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await userService.createPasswordResetToken(email);
  
  if (result) {
    sendPasswordResetEmail(result.user, result.token).catch(err => {
      logger.error('Failed to send password reset email:', err);
    });
  }
  
  // Always return success (don't reveal if email exists)
  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.'
  });
}));

// @route   POST /auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await userService.resetPassword(token, password);
  
  res.json({
    success: true,
    message: 'Password has been reset successfully.'
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
// @desc    Logout user (blacklist refresh token)
// @access  Private
router.post('/logout', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  // Blacklist the refresh token if provided
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      if (decoded.jti) {
        tokenBlacklist.add(decoded.jti, decoded.exp);
      }
    } catch (err) {
      // Token might be already expired or malformed — still allow logout to proceed
      logger.warn('Could not decode refresh token during logout blacklisting');
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   GET /auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.userId);
  
  // Check if user has a password set (for Google OAuth users who may not)
  const hasPassword = await userService.userHasPassword(req.user.userId);

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
        themePreference: user.themePreference,
        hasPassword
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