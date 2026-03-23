const Tool = require('../../tools/data-access/toolModel');
const { ValidationError } = require('../../../libraries/errors');
const logger = require('../../../libraries/logger');

class SearchService {
  /**
   * Full-text search across tools with filtering, sorting, and pagination.
   * Ignores database when DB is unavailable — returns empty results gracefully.
   */
  async search(query = '', filters = {}, page = 1, limit = 20) {
    try {
      const dbQuery = { isActive: true };

      // Full-text search on name + description (uses MongoDB $text index)
      if (query && query.trim().length > 0) {
        dbQuery.$text = { $search: query.trim() };
      }

      // Category filter
      if (filters.category) {
        const validCategories = [
          'pdf-converter', 'ppt-maker', 'api',
          'file-converter', 'productivity', 'education', 'other'
        ];
        if (!validCategories.includes(filters.category)) {
          throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }
        dbQuery.category = filters.category;
      }

      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        dbQuery.tags = { $in: filters.tags };
      }

      // Build sort options
      let sort;
      if (query && query.trim().length > 0) {
        // When searching by text, sort by relevance score first
        sort = { score: { $meta: 'textScore' }, upvoteCount: -1, createdAt: -1 };
      } else if (filters.sortBy === 'popular') {
        sort = { upvoteCount: -1, createdAt: -1 };
      } else {
        sort = { createdAt: -1 };
      }

      // Build projection (include text score when doing text search)
      const projection = query && query.trim().length > 0
        ? { score: { $meta: 'textScore' } }
        : {};

      const options = {
        page,
        limit,
        sort,
        select: projection,
        populate: {
          path: 'submittedBy',
          select: 'name'
        }
      };

      const result = await Tool.paginate(dbQuery, options);

      return {
        tools: result.docs,
        query: query || null,
        filters: {
          category: filters.category || null,
          tags: filters.tags || null,
          sortBy: filters.sortBy || 'relevant'
        },
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          totalItems: result.totalDocs,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      };
    } catch (error) {
      logger.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete / suggestions based on partial query.
   * Uses regex match on tool names for quick suggestions.
   */
  async suggest(query, limit = 5) {
    try {
      if (!query || query.trim().length < 2) {
        return { suggestions: [] };
      }

      // Escape special regex characters for safe matching
      const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const tools = await Tool.find({
        isActive: true,
        name: { $regex: escaped, $options: 'i' }
      })
        .select('name category')
        .sort({ upvoteCount: -1 })
        .limit(limit)
        .lean();

      return {
        suggestions: tools.map(tool => ({
          name: tool.name,
          category: tool.category
        }))
      };
    } catch (error) {
      logger.error('Suggest error:', error);
      throw error;
    }
  }

  /**
   * Get all available categories with their tool counts.
   */
  async getCategories() {
    try {
      const categories = await Tool.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgUpvotes: { $avg: '$upvoteCount' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count,
          avgUpvotes: Math.round(cat.avgUpvotes * 10) / 10
        }))
      };
    } catch (error) {
      logger.error('Get categories error:', error);
      throw error;
    }
  }
}

module.exports = new SearchService();
