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
const hpp = require('hpp');
const { xssSanitizer, mongoSanitizer } = require('./middleware/sanitize');

//Change DNS
dns.setServers(["1.1.1.1","8.8.8.8"]);

// Import routes
const authRoutes = require('./apps/users/entry-points/auth');
const toolRoutes = require('./apps/tools/entry-points/tools');
const ratingRoutes = require('./apps/ratings/entry-points/ratings');
const searchRoutes = require('./apps/search/entry-points/search');
const userRoutes = require('./apps/users/entry-points/users');
const collectionRoutes = require('./apps/collections/entry-points/collections');
const notificationRoutes = require('./apps/notifications/entry-points/notifications');
const supportRoutes = require('./apps/support/entry-points/support');

// Database connection is handled by server.js or tests


// Initialize Passport
require('./middleware/passport');

const app = express();

// Security middleware
app.use(helmet());

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://studentsolution-io.vercel.app' // Fallback for your specific Vercel URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o) || o.startsWith(origin));
    
    if (isAllowed || origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    logger.warn(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
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
  },
  skip: (req) => {
    // Allow more frequent /auth/me requests since they're read-only and used for auth state checks
    return req.method === 'GET' && (req.path === '/me' || req.originalUrl.endsWith('/auth/me'));
  }
});

// Lenient rate limiter for /auth/me: 100 requests per 15 minutes
const authMeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication checks, please try again later',
    code: 'RATE_LIMIT'
  }
});

const isDevOrTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// Apply general rate limiter to all routes (skip in tests/dev)
if (!isDevOrTest) {
  app.use(generalLimiter);
}

// Logging
// Logging — redact sensitive tokens from URLs
morgan.token('redacted-url', (req) => {
  return (req.originalUrl || req.url).replace(/token=[^&]+/g, 'token=REDACTED');
});
app.use(morgan(':method :redacted-url :status :res[content-length] - :response-time ms'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security: Sanitize MongoDB query operators from user input
app.use(mongoSanitizer);

// Security: Prevent HTTP Parameter Pollution
app.use(hpp());

// Security: Strip XSS payloads from request bodies
app.use(xssSanitizer);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
// API routes
app.use('/auth', isDevOrTest ? (req, res, next) => next() : authLimiter, authRoutes);

// Apply more lenient rate limiting to /auth/me specifically
app.use('/auth/me', isDevOrTest ? (req, res, next) => next() : authMeLimiter);
app.use('/tools', toolRoutes);
app.use('/comments', ratingRoutes);
app.use('/search', searchRoutes);
app.use('/users', userRoutes);
app.use('/collections', collectionRoutes);
app.use('/notifications', notificationRoutes);
app.use('/support', supportRoutes);

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

//popup issue fixed 