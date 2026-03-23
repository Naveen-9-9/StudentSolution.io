const User = require('../data-access/userModel');
const { ValidationError, ConflictError, NotFoundError } = require('../../../libraries/errors');
const logger = require('../../../libraries/logger');

class UserService {
  // Register a new user with email and password
  async registerUser(email, password, name) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }]
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw new ConflictError('User with this email already exists');
        }
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password,
        name: name.trim()
      });

      await user.save();

      logger.info(`New user registered: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  // Find user by email
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find or create user from Google OAuth
  async findOrCreateGoogleUser(googleId, email, name) {
    try {
      let user = await User.findOne({ googleId });

      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return user;
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.lastLogin = new Date();
        await existingUser.save();
        logger.info(`Google account linked to existing user: ${existingUser.email}`);
        return existingUser;
      }

      // Create new user
      user = new User({
        email: email.toLowerCase(),
        googleId,
        name: name.trim()
      });

      await user.save();
      logger.info(`New user created via Google OAuth: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error with Google OAuth user:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUser(userId, updates) {
    try {
      const allowedUpdates = ['name'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw error for this non-critical operation
    }
  }

  // Update password
  async updatePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify old password
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        throw new ValidationError('Incorrect current password');
      }

      // Update password (pre-save hook will hash it)
      user.password = newPassword;
      await user.save();
      logger.info(`Password updated for user: ${user.email}`);
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  // Delete user account
  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      logger.info(`User account deleted: ${user.email}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();