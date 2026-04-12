const Comment = require('../data-access/commentModel');
const Tool = require('../../tools/data-access/toolModel');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../../libraries/errors');
const logger = require('../../../libraries/logger');

class CommentService {
  // Add a new comment or reply
  async addComment(toolId, userId, text, rating = null, parentId = null) {
    try {
      // Validate parent comment exists and belongs to the same tool
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment || !parentComment.isActive) {
          throw new NotFoundError('Parent comment not found');
        }
        if (parentComment.toolId.toString() !== toolId.toString()) {
          throw new ValidationError('Parent comment does not belong to this tool');
        }
        // Prevent deeply nested replies (limit to 2 levels)
        if (parentComment.parentId) {
          throw new ValidationError('Cannot reply to a reply');
        }
      }

      // Create the comment
      const comment = new Comment({
        toolId,
        userId,
        text: text.trim(),
        rating,
        parentId
      });

      await comment.save();

      // If this is a reply, add it to the parent's replies array
      if (parentId) {
        await Comment.findByIdAndUpdate(parentId, {
          $push: { replies: comment._id },
          $inc: { replyCount: 1 }
        });
      }

      // If this is a top-level review with a rating, update the tool's average rating
      if (!parentId && rating !== null) {
        await this._updateToolStats(toolId);
      }

      // Populate user data for response
      await comment.populate('userId', 'name');

      logger.info(`Comment added to tool ${toolId} by user ${userId}`);
      return comment;
    } catch (error) {
      logger.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get comments for a tool (with pagination and replies)
  async getCommentsForTool(toolId, page = 1, limit = 20) {
    try {
      const comments = await Comment.getCommentsForTool(toolId, page, limit);

      // Get total count for pagination
      const totalComments = await Comment.getCommentCountForTool(toolId);

      return {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalComments,
          pages: Math.ceil(totalComments / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting comments for tool:', error);
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId, userId, newText, newRating = null) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment || !comment.isActive) {
        throw new NotFoundError('Comment not found');
      }

      // Check if user owns the comment
      if (comment.userId.toString() !== userId.toString()) {
        throw new ForbiddenError('You can only edit your own comments');
      }

      // Update the comment
      comment.text = newText.trim();
      
      let ratingChanged = false;
      if (!comment.parentId && newRating !== null) {
        if (comment.rating !== newRating) {
          comment.rating = newRating;
          ratingChanged = true;
        }
      }

      await comment.save();

      // Recalculate tool stats if rating changed
      if (ratingChanged) {
        await this._updateToolStats(comment.toolId);
      }

      await comment.populate('userId', 'name');

      logger.info(`Comment updated: ${commentId}`);
      return comment;
    } catch (error) {
      logger.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete a comment (soft delete)
  async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment || !comment.isActive) {
        throw new NotFoundError('Comment not found');
      }

      // Check if user owns the comment
      if (comment.userId.toString() !== userId.toString()) {
        // TODO: Check if user is admin
        throw new ForbiddenError('You can only delete your own comments');
      }

      // Soft delete the comment
      comment.isActive = false;
      await comment.save();

      // If this was a reply, remove it from parent's replies array
      if (comment.parentId) {
        await Comment.findByIdAndUpdate(comment.parentId, {
          $pull: { replies: commentId },
          $inc: { replyCount: -1 }
        });
      }

      // Soft delete all replies to this comment
      await Comment.updateMany(
        { parentId: commentId },
        { isActive: false }
      );

      logger.info(`Comment deleted: ${commentId}`);

      // If this was a top-level review with a rating, update the tool's average rating
      if (!comment.parentId && comment.rating !== null) {
        await this._updateToolStats(comment.toolId);
      }

      return { message: 'Comment deleted successfully' };
    } catch (error) {
      logger.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Toggle upvote for a comment
  async toggleCommentUpvote(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment || !comment.isActive) {
        throw new NotFoundError('Comment not found');
      }

      const existingUpvoteIndex = comment.upvotes.findIndex(
        upvote => upvote.user.toString() === userId.toString()
      );

      if (existingUpvoteIndex > -1) {
        // Remove upvote
        comment.upvotes.splice(existingUpvoteIndex, 1);
        comment.upvoteCount = Math.max(0, comment.upvoteCount - 1);
        await comment.save();

        logger.info(`Comment upvote removed: ${commentId}`);
        return { upvoted: false, upvoteCount: comment.upvoteCount };
      } else {
        // Add upvote
        comment.upvotes.push({ user: userId });
        comment.upvoteCount += 1;
        await comment.save();

        logger.info(`Comment upvote added: ${commentId}`);
        return { upvoted: true, upvoteCount: comment.upvoteCount };
      }
    } catch (error) {
      logger.error('Error toggling comment upvote:', error);
      throw error;
    }
  }

  // Get user's upvote status for a comment
  async getCommentUpvoteStatus(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId).select('upvotes');

      if (!comment || !comment.isActive) {
        throw new NotFoundError('Comment not found');
      }

      const hasUpvoted = comment.upvotes.some(
        upvote => upvote.user.toString() === userId.toString()
      );

      return {
        upvoted: hasUpvoted,
        upvoteCount: comment.upvotes.length
      };
    } catch (error) {
      logger.error('Error getting comment upvote status:', error);
      throw error;
    }
  }

  // Get comment by ID
  async getCommentById(commentId) {
    try {
      const comment = await Comment.findById(commentId)
        .populate('userId', 'name')
        .populate('toolId', 'name');

      if (!comment || !comment.isActive) {
        throw new NotFoundError('Comment not found');
      }

      return comment;
    } catch (error) {
      logger.error('Error getting comment by ID:', error);
      throw error;
    }
  }
  // Update tool's average rating and review count
  async _updateToolStats(toolId) {
    try {
      const mongoose = require('mongoose');
      const toolObjectId = toolId instanceof mongoose.Types.ObjectId 
        ? toolId 
        : new mongoose.Types.ObjectId(toolId);

      const stats = await Comment.aggregate([
        { 
          $match: { 
            toolId: toolObjectId, 
            isActive: true, 
            parentId: null, 
            rating: { $ne: null } 
          } 
        },
        {
          $group: {
            _id: '$toolId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        await Tool.findByIdAndUpdate(toolId, {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          reviewCount: stats[0].reviewCount
        });
      } else {
        await Tool.findByIdAndUpdate(toolId, {
          averageRating: 0,
          reviewCount: 0
        });
      }
    } catch (error) {
      logger.error('Error updating tool stats:', error);
    }
  }
}

module.exports = new CommentService();