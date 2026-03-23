const express = require('express');
const searchService = require('../domain/searchService');
const { ValidationError } = require('../../../libraries/errors');
const { validateQuery, asyncHandler } = require('../../../middleware/validate');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const searchQuerySchema = Joi.object({
  q: Joi.string().max(200).allow('').default(''),
  category: Joi.string().valid(
    'pdf-converter', 'ppt-maker', 'api',
    'file-converter', 'productivity', 'education', 'other'
  ),
  tags: Joi.string().max(200),           // comma-separated tags
  sortBy: Joi.string().valid('relevant', 'popular', 'recent').default('relevant'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const suggestQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required(),
  limit: Joi.number().integer().min(1).max(20).default(5)
});

// @route   GET /search
// @desc    Search tools with full-text search and filters
// @access  Public
router.get('/', validateQuery(searchQuerySchema), asyncHandler(async (req, res) => {
  const { q, category, tags, sortBy, page, limit } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (sortBy) filters.sortBy = sortBy;
  if (tags) {
    filters.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  const result = await searchService.search(q, filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result
  });
}));

// @route   GET /search/suggest
// @desc    Get autocomplete suggestions for search
// @access  Public
router.get('/suggest', validateQuery(suggestQuerySchema), asyncHandler(async (req, res) => {
  const { q, limit } = req.query;

  const result = await searchService.suggest(q, parseInt(limit));

  res.json({
    success: true,
    data: result
  });
}));

// @route   GET /search/categories
// @desc    Get all categories with tool counts
// @access  Public
router.get('/categories', asyncHandler(async (req, res) => {
  const result = await searchService.getCategories();

  res.json({
    success: true,
    data: result
  });
}));

module.exports = router;
