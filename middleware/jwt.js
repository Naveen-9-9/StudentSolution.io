const jwt = require('jsonwebtoken');
const { AuthError } = require('../libraries/errors');
const tokenBlacklist = require('./tokenBlacklist');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Fallback to query parameter for EventSource/SSE compatibility
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    throw new AuthError('Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
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

// Optional authentication - won't throw error if token is missing/invalid
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid or expired, we just treat them as guest
    next();
  }
};

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '10m',
      issuer: 'studentsolution-api',
      audience: 'studentsolution-client'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  const jti = tokenBlacklist.generateJti();
  return jwt.sign(
    { userId, type: 'refresh', jti },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'studentsolution-api',
      audience: 'studentsolution-client'
    }
  );
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  generateAccessToken,
  generateRefreshToken,
  tokenBlacklist
};