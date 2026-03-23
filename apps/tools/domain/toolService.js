const Tool = require('../data-access/toolModel');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../../libraries/errors');
const logger = require('../../../libraries/logger');

class ToolService {
  // Create a new tool
  async createTool(toolData, userId) {
    try {
      const tool = new Tool({
        ...toolData,
        submittedBy: userId
      });

      await tool.save();

      // Populate the submittedBy field for the response
      await tool.populate('submittedBy', 'name');

      logger.info(`New tool created: ${tool.name} by user ${userId}`);
      return tool;
    } catch (error) {
      logger.error('Error creating tool:', error);
      throw error;
    }
  }

  // Get all tools with pagination and filtering
  async getTools(filters = {}, page = 1, limit = 20) {
    try {
      const query = { isActive: true };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const options = {
        page: page,
        limit: limit,
        sort: filters.sortBy === 'popular' ? { upvoteCount: -1, createdAt: -1 } : { createdAt: -1 },
        populate: {
          path: 'submittedBy',
          select: 'name'
        }
      };

      const result = await Tool.paginate(query, options);

      return {
        tools: result.docs,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          totalItems: result.totalDocs,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      };
    } catch (error) {
      logger.error('Error getting tools:', error);
      throw error;
    }
  }

  // Get tool by ID
  async getToolById(toolId) {
    try {
      const tool = await Tool.findById(toolId)
        .populate('submittedBy', 'name')
        .populate({
          path: 'upvotes.user',
          select: 'name',
          options: { limit: 10 } // Limit to prevent large responses
        });

      if (!tool || !tool.isActive) {
        throw new NotFoundError('Tool not found');
      }

      return tool;
    } catch (error) {
      logger.error('Error getting tool by ID:', error);
      throw error;
    }
  }

  // Update tool
  async updateTool(toolId, updateData, userId) {
    try {
      const tool = await Tool.findById(toolId);

      if (!tool || !tool.isActive) {
        throw new NotFoundError('Tool not found');
      }

      // Check if user is the owner or admin
      if (tool.submittedBy.toString() !== userId.toString()) {
        // TODO: Check if user is admin
        throw new ForbiddenError('You can only edit your own tools');
      }

      // Fields that can be updated
      const allowedFields = ['name', 'url', 'category', 'description', 'tags'];
      const updates = {};

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updates[key] = updateData[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      const updatedTool = await Tool.findByIdAndUpdate(
        toolId,
        updates,
        { new: true, runValidators: true }
      ).populate('submittedBy', 'name');

      logger.info(`Tool updated: ${updatedTool.name}`);
      return updatedTool;
    } catch (error) {
      logger.error('Error updating tool:', error);
      throw error;
    }
  }

  // Delete tool (soft delete)
  async deleteTool(toolId, userId) {
    try {
      const tool = await Tool.findById(toolId);

      if (!tool || !tool.isActive) {
        throw new NotFoundError('Tool not found');
      }

      // Check if user is the owner or admin
      if (tool.submittedBy.toString() !== userId.toString()) {
        // TODO: Check if user is admin
        throw new ForbiddenError('You can only delete your own tools');
      }

      // Soft delete
      tool.isActive = false;
      await tool.save();

      logger.info(`Tool deleted: ${tool.name}`);
      return { message: 'Tool deleted successfully' };
    } catch (error) {
      logger.error('Error deleting tool:', error);
      throw error;
    }
  }

  // Toggle upvote for a tool
  async toggleUpvote(toolId, userId) {
    try {
      const tool = await Tool.findById(toolId);

      if (!tool || !tool.isActive) {
        throw new NotFoundError('Tool not found');
      }

      const existingUpvoteIndex = tool.upvotes.findIndex(
        upvote => upvote.user.toString() === userId.toString()
      );

      if (existingUpvoteIndex > -1) {
        // Remove upvote
        tool.upvotes.splice(existingUpvoteIndex, 1);
        tool.upvoteCount = tool.upvotes.length;
        await tool.save();

        logger.info(`Upvote removed from tool: ${tool.name}`);
        return { upvoted: false, upvoteCount: tool.upvoteCount };
      } else {
        // Add upvote
        tool.upvotes.push({ user: userId });
        tool.upvoteCount = tool.upvotes.length;
        await tool.save();

        logger.info(`Upvote added to tool: ${tool.name}`);
        return { upvoted: true, upvoteCount: tool.upvoteCount };
      }
    } catch (error) {
      logger.error('Error toggling upvote:', error);
      throw error;
    }
  }

  // Get user's upvote status for a tool
  async getUpvoteStatus(toolId, userId) {
    try {
      const tool = await Tool.findById(toolId).select('upvotes');

      if (!tool || !tool.isActive) {
        throw new NotFoundError('Tool not found');
      }

      const hasUpvoted = tool.upvotes.some(
        upvote => upvote.user.toString() === userId.toString()
      );

      return {
        upvoted: hasUpvoted,
        upvoteCount: tool.upvotes.length
      };
    } catch (error) {
      logger.error('Error getting upvote status:', error);
      throw error;
    }
  }

  // Get popular tools
  async getPopularTools(limit = 10) {
    try {
      return await Tool.getPopular(limit);
    } catch (error) {
      logger.error('Error getting popular tools:', error);
      throw error;
    }
  }

  // Get tools by category
  async getToolsByCategory(category, limit = 20) {
    try {
      return await Tool.getByCategory(category, limit);
    } catch (error) {
      logger.error('Error getting tools by category:', error);
      throw error;
    }
  }

  // Search tools
  async searchTools(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getTools(searchFilters, page, limit);
    } catch (error) {
      logger.error('Error searching tools:', error);
      throw error;
    }
  }
}

module.exports = new ToolService();