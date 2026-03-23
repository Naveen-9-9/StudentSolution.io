const { ValidationError } = require('../libraries/errors');

/**
 * Validate request body against a Joi schema.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map(d => d.message).join('; ');
      throw new ValidationError(message);
    }
    next();
  };
};

/**
 * Validate query parameters against a Joi schema.
 * Replaces req.query with validated/defaulted values.
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      const message = error.details.map(d => d.message).join('; ');
      throw new ValidationError(message);
    }
    req.query = value;
    next();
  };
};

/**
 * Validate route params against a Joi schema.
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      const message = error.details.map(d => d.message).join('; ');
      throw new ValidationError(message);
    }
    next();
  };
};

/**
 * Wrap async route handlers to catch rejected promises
 * and forward them to the Express error handler.
 *
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  asyncHandler
};
