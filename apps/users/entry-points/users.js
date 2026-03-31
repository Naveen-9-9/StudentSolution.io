const express = require('express');
const userService = require('../domain/userService');
const { validateParams, asyncHandler } = require('../../../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const objectIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid user ID format'
  })
});

// @route   GET /users/:id/profile
// @desc    Get user public profile
// @access  Public
router.get('/:id/profile', validateParams(objectIdParamSchema), asyncHandler(async (req, res) => {
  const profile = await userService.getUserPublicProfile(req.params.id);

  res.json({
    success: true,
    data: { profile }
  });
}));

// @route   GET /users/leaderboard
// @desc    Get site-wide contributor leaderboard
// @access  Public
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const leaderboard = await userService.getGlobalLeaderboard();
  res.json({ 
    success: true, 
    data: { leaderboard } 
  });
}));

// @route   GET /users/stats
// @desc    Get site-wide community stats
// @access  Public
router.get('/stats', asyncHandler(async (req, res) => {
  const toolService = require('../../tools/domain/toolService');
  const stats = await toolService.getGlobalStats();
  res.json({ 
    success: true, 
    data: { stats } 
  });
}));

module.exports = router;
