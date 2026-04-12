const express = require('express');
const commentService = require('../domain/commentService');
const { authenticateToken } = require('../../../middleware/jwt');
const { requireAuth } = require('../../../middleware/roles');
const { ValidationError } = require('../../../libraries/errors');
const { validate, validateQuery, validateParams, asyncHandler } = require('../../../middleware/validate');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const addCommentSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  parentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Invalid parent comment ID format'
  })
});

const updateCommentSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).optional()
});

const commentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20)
});

const toolIdParamSchema = Joi.object({
  toolId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid tool ID format'
  })
});

const commentIdParamSchema = Joi.object({
  commentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid comment ID format'
  })
});

// ================================
// COMMENTS & REPLIES
// ================================

// @route   GET /comments/tools/:toolId
// @desc    Get all comments for a tool (with replies)
// @access  Public
router.get('/tools/:toolId', validateParams(toolIdParamSchema), validateQuery(commentQuerySchema), asyncHandler(async (req, res) => {
  const { toolId } = req.params;
  const { page, limit } = req.query;

  const result = await commentService.getCommentsForTool(toolId, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result
  });
}));

// @route   POST /comments/tools/:toolId
// @desc    Add a new comment to a tool
// @access  Private
router.post('/tools/:toolId', authenticateToken, requireAuth, validateParams(toolIdParamSchema), validate(addCommentSchema), asyncHandler(async (req, res) => {
  const { toolId } = req.params;
  const { text, rating, parentId } = req.body;
  const userId = req.user.userId;

  const comment = await commentService.addComment(toolId, userId, text, rating, parentId);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: { comment }
  });
}));

// @route   PUT /comments/:commentId
// @desc    Update a comment
// @access  Private (owner only)
router.put('/:commentId', authenticateToken, requireAuth, validateParams(commentIdParamSchema), validate(updateCommentSchema), asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text, rating } = req.body;
  const userId = req.user.userId;

  const comment = await commentService.updateComment(commentId, userId, text, rating);

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment }
  });
}));

// @route   DELETE /comments/:commentId
// @desc    Delete a comment
// @access  Private (owner only)
router.delete('/:commentId', authenticateToken, requireAuth, validateParams(commentIdParamSchema), asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  const result = await commentService.deleteComment(commentId, userId);

  res.json({
    success: true,
    data: result
  });
}));

// @route   POST /comments/:commentId/upvote
// @desc    Toggle upvote for a comment
// @access  Private
router.post('/:commentId/upvote', authenticateToken, requireAuth, validateParams(commentIdParamSchema), asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  const result = await commentService.toggleCommentUpvote(commentId, userId);

  res.json({
    success: true,
    message: result.upvoted ? 'Comment upvoted' : 'Upvote removed',
    data: result
  });
}));

// @route   GET /comments/:commentId/upvote-status
// @desc    Get user's upvote status for a comment
// @access  Private
router.get('/:commentId/upvote-status', authenticateToken, requireAuth, validateParams(commentIdParamSchema), asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  const status = await commentService.getCommentUpvoteStatus(commentId, userId);

  res.json({
    success: true,
    data: status
  });
}));

// @route   GET /comments/:commentId
// @desc    Get a single comment with details
// @access  Public
router.get('/:commentId', validateParams(commentIdParamSchema), asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await commentService.getCommentById(commentId);

  res.json({
    success: true,
    data: { comment }
  });
}));

module.exports = router;