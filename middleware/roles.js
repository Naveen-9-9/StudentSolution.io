const { ForbiddenError } = require('../libraries/errors');

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }
  next();
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const isOwner = req.user.userId === resourceUserId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Access denied: not owner or admin');
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin
};