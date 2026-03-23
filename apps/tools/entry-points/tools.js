const express = require('express');
const toolService = require('../domain/toolService');
const { authenticateToken } = require('../../../middleware/jwt');
const { requireAuth } = require('../../../middleware/roles');
const { ValidationError } = require('../../../libraries/errors');
const { validate, validateQuery, validateParams, asyncHandler } = require('../../../middleware/validate');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createToolSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  url: Joi.string().uri().required(),
  category: Joi.string().valid('pdf-converter', 'ppt-maker', 'api', 'file-converter', 'productivity', 'education', 'other').required(),
  description: Joi.string().min(10).max(500).required(),
  tags: Joi.array().items(Joi.string().min(1).max(30)).optional()
});

const updateToolSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  url: Joi.string().uri().optional(),
  category: Joi.string().valid('pdf-converter', 'ppt-maker', 'api', 'file-converter', 'productivity', 'education', 'other').optional(),
  description: Joi.string().min(10).max(500).optional(),
  tags: Joi.array().items(Joi.string().min(1).max(30)).optional()
}).min(1); // At least one field required

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string().valid('pdf-converter', 'ppt-maker', 'api', 'file-converter', 'productivity', 'education', 'other'),
  sortBy: Joi.string().valid('popular', 'recent').default('recent'),
  search: Joi.string().min(1).max(100)
});

const objectIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid tool ID format'
  })
});

// @route   GET /tools
// @desc    Get all tools with optional filtering and pagination
// @access  Public
router.get('/', validateQuery(querySchema), asyncHandler(async (req, res) => {
  const { page, limit, category, sortBy, search } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (search) filters.search = search;

  const result = await toolService.getTools(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result
  });
}));

// @route   GET /tools/popular
// @desc    Get popular tools
// @access  Public
router.get('/popular', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const tools = await toolService.getPopularTools(limit);

  res.json({
    success: true,
    data: { tools }
  });
}));

// @route   GET /tools/categories/:category
// @desc    Get tools by category
// @access  Public
router.get('/categories/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  // Validate category
  const validCategories = ['pdf-converter', 'ppt-maker', 'api', 'file-converter', 'productivity', 'education', 'other'];
  if (!validCategories.includes(category)) {
    throw new ValidationError('Invalid category');
  }

  const tools = await toolService.getToolsByCategory(category, limit);

  res.json({
    success: true,
    data: { tools }
  });
}));

// @route   GET /tools/:id
// @desc    Get tool by ID
// @access  Public
router.get('/:id', validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const tool = await toolService.getToolById(req.params.id);

  res.json({
    success: true,
    data: { tool }
  });
}));

// @route   POST /tools
// @desc    Create a new tool
// @access  Private
router.post('/', authenticateToken, requireAuth, validate(createToolSchema), asyncHandler(async (req, res) => {
  const toolData = req.body;
  const userId = req.user.userId;

  const tool = await toolService.createTool(toolData, userId);

  res.status(201).json({
    success: true,
    message: 'Tool created successfully',
    data: { tool }
  });
}));

// @route   PUT /tools/:id
// @desc    Update tool
// @access  Private (owner only)
router.put('/:id', authenticateToken, requireAuth, validateParams(objectIdParamSchema), validate(updateToolSchema), asyncHandler(async (req, res) => {
  const toolId = req.params.id;
  const updateData = req.body;
  const userId = req.user.userId;

  const tool = await toolService.updateTool(toolId, updateData, userId);

  res.json({
    success: true,
    message: 'Tool updated successfully',
    data: { tool }
  });
}));

// @route   DELETE /tools/:id
// @desc    Delete tool
// @access  Private (owner only)
router.delete('/:id', authenticateToken, requireAuth, validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const toolId = req.params.id;
  const userId = req.user.userId;

  const result = await toolService.deleteTool(toolId, userId);

  res.json({
    success: true,
    data: result
  });
}));

// @route   POST /tools/:id/upvote
// @desc    Toggle upvote for a tool
// @access  Private
router.post('/:id/upvote', authenticateToken, requireAuth, validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const toolId = req.params.id;
  const userId = req.user.userId;

  const result = await toolService.toggleUpvote(toolId, userId);

  res.json({
    success: true,
    message: result.upvoted ? 'Tool upvoted' : 'Upvote removed',
    data: result
  });
}));

// @route   GET /tools/:id/upvote-status
// @desc    Get user's upvote status for a tool
// @access  Private
router.get('/:id/upvote-status', authenticateToken, requireAuth, validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const toolId = req.params.id;
  const userId = req.user.userId;

  const status = await toolService.getUpvoteStatus(toolId, userId);

  res.json({
    success: true,
    data: status
  });
}));

module.exports = router;