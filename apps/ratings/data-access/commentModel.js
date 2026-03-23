const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: [true, 'Tool ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    minlength: [1, 'Comment cannot be empty']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // null for top-level comments, ObjectId for replies
  },
  isActive: {
    type: Boolean,
    default: true
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  replyCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
commentSchema.index({ toolId: 1, isActive: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ createdAt: -1 });

// Virtual for depth (to prevent deeply nested replies)
commentSchema.virtual('depth').get(function() {
  if (!this.parentId) return 0;
  // This would need to be calculated recursively, but for simplicity we'll limit to 2 levels
  return 1;
});

// Pre-save middleware to update upvoteCount and replyCount
commentSchema.pre('save', function() {
  if (this.upvotes) {
    this.upvoteCount = this.upvotes.length;
  }
  if (this.replies) {
    this.replyCount = this.replies.length;
  }
});

// Instance method to check if user has upvoted
commentSchema.methods.hasUserUpvoted = function(userId) {
  return this.upvotes.some(upvote => upvote.user.toString() === userId.toString());
};

// Static method to get comments for a tool (with replies)
commentSchema.statics.getCommentsForTool = async function(toolId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Get top-level comments only (no parent)
  const comments = await this.find({
    toolId,
    parentId: null,
    isActive: true
  })
  .populate('userId', 'name')
  .sort({ upvoteCount: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();

  // For each comment, get its replies
  for (let comment of comments) {
    comment.replies = await this.find({
      parentId: comment._id,
      isActive: true
    })
    .populate('userId', 'name')
    .sort({ createdAt: 1 })
    .lean();
  }

  return comments;
};

// Static method to get comment count for a tool
commentSchema.statics.getCommentCountForTool = function(toolId) {
  return this.countDocuments({ toolId, isActive: true });
};

module.exports = mongoose.model('Comment', commentSchema);