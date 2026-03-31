const express = require('express');
const collectionService = require('../domain/collectionService');
const { authenticateToken: authenticate } = require('../../../middleware/jwt');
const { validate, validateParams, asyncHandler } = require('../../../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const collectionSchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().allow('').max(500),
  isPublic: Joi.boolean().default(true)
});

const objectIdParams = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

const toggleToolParams = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  toolId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

// @route   GET /collections/me
// @desc    Get current user's collections
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const collections = await collectionService.getUserCollections(req.user.id);
  res.json({ success: true, data: { collections } });
}));

// @route   POST /collections
// @desc    Create a new collection
// @access  Private
router.post('/', authenticate, validate(collectionSchema), asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(req.user.id, req.body);
  res.status(201).json({ success: true, data: { collection } });
}));

// @route   POST /collections/:id/tools/:toolId
// @desc    Toggle a tool in/out of a collection
// @access  Private
router.post('/:id/tools/:toolId', authenticate, validateParams(toggleToolParams), asyncHandler(async (req, res) => {
  const { collection, action } = await collectionService.toggleToolInCollection(
    req.user.id, 
    req.params.id, 
    req.params.toolId
  );

  res.json({ 
    success: true, 
    message: `Tool ${action} successfully`,
    data: { collection } 
  });
}));

// @route   GET /collections/:id
// @desc    Get a single collection (Public/Private aware)
// @access  Public (with ownership check for private)
router.get('/:id', validateParams(objectIdParams), asyncHandler(async (req, res) => {
  // We use the optional user object if present (from an optional auth middleware if we had one)
  // For now, if unauthenticated, req.user will be null in service logic
  const collection = await collectionService.getCollectionById(req.user?.id, req.params.id);
  res.json({ success: true, data: { collection } });
}));

// @route   DELETE /collections/:id
// @desc    Delete a collection
// @access  Private
router.delete('/:id', authenticate, validateParams(objectIdParams), asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(req.user.id, req.params.id);
  res.json({ success: true, message: 'Collection deleted successfully' });
}));

module.exports = router;
