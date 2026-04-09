const Collection = require('../data-access/collectionModel');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../../libraries/errors');
const logger = require('../../../libraries/logger');
const mongoose = require('mongoose');

class CollectionService {
  // Get all collections for a specific user (Dashboard View)
  async getUserCollections(userId) {
    try {
      return await Collection.find({ user: userId })
        .select('name description isPublic tools createdAt')
        .sort({ updatedAt: -1 });
    } catch (error) {
      logger.error('Error fetching user collections:', error);
      throw error;
    }
  }

  // Create a new empty collection
  async createCollection(userId, data) {
    try {
      const collection = new Collection({
        user: userId,
        name: data.name,
        description: data.description || '',
        isPublic: data.isPublic !== undefined ? data.isPublic : true
      });

      await collection.save();
      logger.info(`New collection created: ${collection.name} by ${userId}`);
      return collection;
    } catch (error) {
       logger.error('Error creating collection:', error);
       throw error;
    }
  }

  // Toggle tool in/out of a collection (Bookmarking logic)
  async toggleToolInCollection(userId, collectionId, toolId) {
    try {
      const collection = await Collection.findOne({ _id: collectionId, user: userId });
      if (!collection) {
         throw new NotFoundError('Collection not found');
      }

      const toolIdx = collection.tools.indexOf(toolId);
      let action = '';

      if (toolIdx > -1) {
        collection.tools.splice(toolIdx, 1);
        action = 'removed';
      } else {
        collection.tools.push(toolId);
        action = 'added';
      }

      await collection.save();
      logger.info(`Tool ${toolId} ${action} to collection ${collectionId}`);
      
      return { collection, action };
    } catch (error) {
      logger.error('Error toggling tool in collection:', error);
      throw error;
    }
  }

  // Get single collection with hydrated tool data
  async getCollectionById(userId, collectionId) {
    try {
      const collection = await Collection.findById(collectionId).populate({
        path: 'tools',
        match: { isActive: true, status: 'approved' },
        populate: {
          path: 'submittedBy',
          select: 'name'
        }
      });

      if (!collection) {
        throw new NotFoundError('Collection not found');
      }

      // Privacy check: If private, only owner can view
      if (!collection.isPublic && collection.user.toString() !== userId?.toString()) {
        throw new ForbiddenError('This collection is private');
      }

      return collection;
    } catch (error) {
      logger.error('Error fetching collection details:', error);
      throw error;
    }
  }

  // Delete a collection
  async deleteCollection(userId, collectionId) {
     try {
       const result = await Collection.deleteOne({ _id: collectionId, user: userId });
       if (result.deletedCount === 0) {
         throw new NotFoundError('Collection not found or access denied');
       }
       logger.info(`Collection deleted: ${collectionId}`);
     } catch (error) {
       logger.error('Error deleting collection:', error);
       throw error;
     }
  }

  // Get all tools saved by a user across all collections
  async getUserSavedTools(userId) {
    try {
      const collections = await Collection.find({ user: userId }).select('tools');
      const toolIds = [...new Set(collections.flatMap(collection => collection.tools))];

      if (toolIds.length === 0) {
        return [];
      }

      // Import Tool model here to avoid circular dependencies
      const Tool = require('../../tools/data-access/toolModel');

      const tools = await Tool.find({
        _id: { $in: toolIds },
        isActive: true,
        status: 'approved'
      }).populate('submittedBy', 'name');

      return tools;
    } catch (error) {
      logger.error('Error fetching user saved tools:', error);
      throw error;
    }
  }
}

module.exports = new CollectionService();
