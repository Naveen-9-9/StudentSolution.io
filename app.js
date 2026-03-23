require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('./middleware/passport');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./libraries/errors');
const logger = require('./libraries/logger');
const dns = require("dns");

//Change DNS
dns.setServers(["1.1.1.1","8.8.8.8"]);

// Import routes
const authRoutes = require('./apps/users/entry-points/auth');
const toolRoutes = require('./apps/tools/entry-points/tools');
const ratingRoutes = require('./apps/ratings/entry-points/ratings');
const searchRoutes = require('./apps/search/entry-points/search');

// Database connection is handled by server.js or tests


// Initialize Passport
require('./middleware/passport');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT'
  }
});

// Strict rate limiter for auth routes: 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT'
  }
});

// Apply general rate limiter to all routes (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(generalLimiter);
}

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
// API routes
app.use('/auth', process.env.NODE_ENV === 'test' ? (req, res, next) => next() : authLimiter, authRoutes);
app.use('/tools', toolRoutes);
app.use('/comments', ratingRoutes);
app.use('/search', searchRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to StudentSolution.ai API',
    version: '1.0.0',
    status: 'Under development'
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;