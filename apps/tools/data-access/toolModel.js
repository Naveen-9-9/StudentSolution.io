const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tool name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  url: {
    type: String,
    required: [true, 'Tool URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL starting with http:// or https://'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['pdf-converter', 'ppt-maker', 'api', 'file-converter', 'productivity', 'education', 'other'],
      message: 'Category must be one of: pdf-converter, ppt-maker, api, file-converter, productivity, education, other'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by user is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be one of: pending, approved, rejected'
    },
    default: 'pending'
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
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add pagination plugin
toolSchema.plugin(mongoosePaginate);

// Indexes for performance
toolSchema.index({ category: 1, status: 1, isActive: 1 });
toolSchema.index({ submittedBy: 1 });
toolSchema.index({ name: 'text', description: 'text' }); // For text search
toolSchema.index({ tags: 1 });

// Virtual for comment count
toolSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'toolId',
  count: true
});

// Pre-save middleware to update upvoteCount
toolSchema.pre('save', function() {
  if (this.upvotes) {
    this.upvoteCount = this.upvotes.length;
  }
});

// Instance method to check if user has upvoted
toolSchema.methods.hasUserUpvoted = function(userId) {
  return this.upvotes.some(upvote => upvote.user.toString() === userId.toString());
};

// Static method to get popular tools
toolSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ upvoteCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('submittedBy', 'name');
};

// Static method to get tools by category
toolSchema.statics.getByCategory = function(category, limit = 20) {
  return this.find({ category, isActive: true })
    .sort({ upvoteCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('submittedBy', 'name');
};

module.exports = mongoose.model('Tool', toolSchema);