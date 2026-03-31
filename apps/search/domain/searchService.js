const Tool = require('../../tools/data-access/toolModel');
const { ValidationError } = require('../../../libraries/errors');
const logger = require('../../../libraries/logger');

class SearchService {
  /**
   * Internal Intent Parser: Maps natural language to technical categories
   */
  _parseIntent(query) {
    if (!query) return null;
    const q = query.toLowerCase();
    
    const intentMap = {
      writing: ['essay', 'paper', 'report', 'thesis', 'cite', 'citation', 'bibliography', 'reference', 'writing', 'grammar'],
      presentation: ['slides', 'ppt', 'powerpoint', 'deck', 'presentation', 'slideshow'],
      file: ['pdf', 'convert', 'compress', 'merge', 'word to pdf', 'image to pdf', 'lock', 'unlock'],
      math: ['calculator', 'math', 'equation', 'solve', 'formula', 'science', 'lab'],
      productivity: ['organize', 'todo', 'tasks', 'calendar', 'schedule', 'planning', 'time']
    };

    for (const [intent, keywords] of Object.entries(intentMap)) {
      if (keywords.some(k => q.includes(k))) {
        return intent;
      }
    }
    return null;
  }

  _getExpandedSynonyms(query) {
    if (!query) return [];
    const synonyms = {
      'ppt': ['presentation', 'slides', 'powerpoint'],
      'slides': ['ppt', 'presentation'],
      'cite': ['citation', 'bibliography', 'reference', 'writing'],
      'pdf': ['document', 'converter', 'file'],
      'convert': ['transform', 'change', 'file']
    };

    const words = query.toLowerCase().split(/\s+/);
    let expanded = [];
    words.forEach(w => {
      if (synonyms[w]) expanded = [...expanded, ...synonyms[w]];
    });
    return expanded;
  }

  /**
   * Full-text search across tools with filtering, sorting, and pagination.
   * AI-Powered: Uses intent parsing and synonym expansion for better relevance.
   */
  async search(query = '', filters = {}, page = 1, limit = 20) {
    try {
      const dbQuery = { isActive: true, status: 'approved' };
      const q = query.trim();

      // [Milestone 9] AI Intent Parsing
      const intent = this._parseIntent(q);
      const synonyms = this._getExpandedSynonyms(q);

      // Full-text search on name + description (uses MongoDB $text index)
      if (q.length > 0) {
        // Expand query with synonyms for wider reach
        const expandedQuery = synonyms.length > 0 ? `${q} ${synonyms.join(' ')}` : q;
        dbQuery.$text = { $search: expandedQuery };
      }

      // [Milestone 9] Semantic Intent Injection
      if (intent) {
        if (intent === 'writing') {
          dbQuery.$or = [{ category: 'education' }, { tags: { $in: ['writing', 'cite'] } }];
        } else if (intent === 'presentation') {
          dbQuery.category = 'ppt-maker';
        } else if (intent === 'file') {
          dbQuery.category = { $in: ['pdf-converter', 'file-converter'] };
        } else if (intent === 'math') {
          dbQuery.tags = { $in: ['math', 'science', 'calculator'] };
        } else if (intent === 'productivity') {
          dbQuery.category = 'productivity';
        }
      }

      // Manual Category filter (Overrides Intent if provided)
      if (filters.category) {
        dbQuery.category = filters.category;
      }

      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        dbQuery.tags = { $in: filters.tags };
      }

      // Build sort options
      let sort;
      if (q.length > 0) {
        // When searching by text, sort by relevance score first
        sort = { score: { $meta: 'textScore' }, upvoteCount: -1, createdAt: -1 };
      } else if (filters.sortBy === 'popular') {
        sort = { upvoteCount: -1, createdAt: -1 };
      } else {
        sort = { createdAt: -1 };
      }

      // When using text search, include the relevance score
      const projection = {};
      if (q.length > 0) {
        projection.score = { $meta: "textScore" };
      }

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
        query: q || null,
        intentMatched: intent,
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
        .select('name category url')
        .sort({ upvoteCount: -1 })
        .limit(limit)
        .lean();

      return {
        suggestions: tools.map(tool => ({
          id: tool._id,
          name: tool.name,
          category: tool.category,
          url: tool.url
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
