const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  tools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool'
  }],
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
collectionSchema.pre('save', function() {
  if (this.isModified('name')) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
});

module.exports = mongoose.model('Collection', collectionSchema);
