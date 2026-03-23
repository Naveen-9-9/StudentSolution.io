const jwt = require('jsonwebtoken');
const { AuthError } = require('../libraries/errors');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new AuthError('Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthError('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new AuthError('Invalid token');
    } else {
      throw new AuthError('Token verification failed');
    }
  }
};

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );
};

module.exports = {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken
};