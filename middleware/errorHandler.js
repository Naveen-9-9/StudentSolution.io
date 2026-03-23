const logger = require('../libraries/logger');
const { AppError } = require('../libraries/errors');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = 'Server Error';
  let errorCode = 'SERVER_ERROR';

  // ── Custom AppError (our own error classes) ──
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
  }

  // ── Joi validation error (from Joi library directly) ──
  else if (err.isJoi) {
    statusCode = 400;
    message = err.details
      ? err.details.map(d => d.message).join('; ')
      : err.message;
    errorCode = 'VALIDATION_ERROR';
  }

  // ── Malformed JSON body ──
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
    errorCode = 'INVALID_JSON';
  }

  // ── Mongoose bad ObjectId ──
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
    errorCode = 'NOT_FOUND';
  }

  // ── Mongoose duplicate key ──
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
    errorCode = 'DUPLICATE_ERROR';
  }

  // ── Mongoose validation error ──
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    errorCode = 'VALIDATION_ERROR';
  }

  // ── JWT errors ──
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }

  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // ── Fallback: use err.message only for operational errors ──
  else if (err.message) {
    message = process.env.NODE_ENV === 'development' ? err.message : 'Server Error';
  }

  // Log all errors
  if (process.env.NODE_ENV !== 'production') {
    console.error('ERROR:', err);
  }
  
  logger.error({
    err,
    statusCode,
    errorCode,
    path: req.originalUrl,
    method: req.method
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;