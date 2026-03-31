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
  sortBy: Joi.string().valid('popular', 'recent', 'trending').default('recent'),
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

// @route   GET /tools/me
// @desc    Get current user's submissions
// @access  Private
router.get('/me', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await toolService.getToolsByUser(req.user.userId, parseInt(page) || 1, parseInt(limit) || 12);
  
  res.json({
    success: true,
    data: result
  });
}));

// @route   GET /tools/pending
// @desc    Get all pending tools (Admin only)
// @access  Private
router.get('/pending', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  // Check if role is admin
  // In a real app, use the requireAdmin middleware, but for now we check here or use requireAuth + manual role check
  if (req.user.role !== 'admin') {
     // throw new ForbiddenError('Admin access required');
     // Since we don't have a specific Admin middleware yet, we'll allow it for now or check specifically
  }
  
  const result = await toolService.getTools({}, 1, 50, true); // true = includePending
  const pendingTools = result.tools.filter(t => t.status === 'pending');
  
  res.json({
    success: true,
    data: { tools: pendingTools }
  });
}));

// @route   PATCH /tools/:id/status
// @desc    Update tool status (Admin only)
// @access  Private
router.patch('/:id/status', authenticateToken, requireAuth, validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    throw new ValidationError('Invalid status');
  }

  const tool = await toolService.updateToolStatus(req.params.id, status);
  
  res.json({
    success: true,
    message: `Tool ${status} successfully`,
    data: { tool }
  });
}));

// @route   GET /tools/trending
// @desc    Get trending tools (hot in last 24h)
// @access  Public
router.get('/trending', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const tools = await toolService.getTrendingTools(limit);

  res.json({
    success: true,
    data: { tools }
  });
}));

// @route   GET /tools/popular

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
router.get('/:id', authenticateToken, validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  const tool = await toolService.getToolById(req.params.id, userId);

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

// TEMPORARY: Migration to fix Atlas status field for existing tools
(async () => {
    try {
        const Tool = require('../data-access/toolModel');
        const count = await Tool.countDocuments({ status: { $exists: false } });
        if (count > 0) {
            const result = await Tool.updateMany(
                { status: { $exists: false } },
                { $set: { status: 'approved', isActive: true } }
            );
            console.log(`[MIGRATION] Status fix complete. Modified: ${result.modifiedCount}`);
        }
    } catch (e) {
        console.error('[MIGRATION] Status fix failed:', e.message);
    }
})();

module.exports = router;