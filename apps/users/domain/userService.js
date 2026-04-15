const User = require('../data-access/userModel');
const crypto = require('crypto');
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
        name: name.trim(),
        isVerified: false,
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      await user.save();

      logger.info(`New user registered (unverified): ${user.email}`);
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
      const allowedUpdates = ['name', 'bio', 'socialLinks', 'avatarId', 'themePreference'];
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

  // Check if user has a password (for Google OAuth users who might not)
  async userHasPassword(userId) {
    try {
      const user = await User.findById(userId).select('password');
      return !!user?.password;
    } catch (error) {
      logger.error('Error checking user password:', error);
      return false;
    }
  }

  // Update password
  async updatePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password googleId email');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // If user has a password, verify the old one
      if (user.password) {
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
          throw new ValidationError('Incorrect current password');
        }
      } else if (!user.googleId) {
        // Non-Google user with no password — shouldn't happen, but handle it
        throw new ValidationError('Account state error — contact support');
      }
      // Google user with no password: allow setting password without oldPassword

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

  // Get user public profile data (safe for anyone to view)
  async getUserPublicProfile(userId) {
    try {
      const user = await User.findById(userId).select('name registeredAt');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // We late-require toolService to avoid circular dependencies
      const toolService = require('../../tools/domain/toolService');
      const stats = await toolService.getUserStats(userId);

      // Simple Reputation Score (Upvotes * 10) + (Tools * 50)
      const impactScore = (stats.totalUpvotes || 0) * 10 + (stats.totalTools || 0) * 50;

      return {
        _id: user._id,
        name: user.name,
        registeredAt: user.registeredAt,
        totalTools: stats.totalTools || 0,
        totalUpvotes: stats.totalUpvotes || 0,
        impactScore
      };
    } catch (error) {
       logger.error('Error getting public profile:', error);
       throw error;
    }
  }

  // Get site-wide leaderboard ranking top contributors
  async getGlobalLeaderboard() {
    try {
      // Late require to avoid cycles
      const Tool = require('../../tools/data-access/toolModel');
      
      const leaderboard = await Tool.aggregate([
        { $match: { status: 'approved', isActive: true } },
        {
          $group: {
            _id: '$submittedBy',
            toolCount: { $sum: 1 },
            upvoteCount: { $sum: '$upvoteCount' }
          }
        },
        { 
          $project: {
            user: '$_id',
            toolCount: 1,
            upvoteCount: 1,
            impactScore: { 
               $add: [
                  { $multiply: ['$upvoteCount', 10] },
                  { $multiply: ['$toolCount', 50] }
               ]
            }
          }
        },
        { $sort: { impactScore: -1 } },
        { $limit: 20 }
      ]);

      // Populate user names
      const result = await User.populate(leaderboard, { path: 'user', select: 'name' });
      
      return result.filter(entry => entry.user != null);
    } catch (error) {
       logger.error('Error getting global leaderboard:', error);
       throw error;
    }
  }

  // Generate a password reset token
  async createPasswordResetToken(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return null; // Silently return null for security

      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      logger.info('Password reset token created for: ' + email);
      return { user, token };
    } catch (error) {
      logger.error('Error creating password reset token:', error);
      throw error;
    }
  }

  // Reset password using token
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new ValidationError('Reset link is invalid or has expired');
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.info('Password reset successful for: ' + user.email);
      return user;
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }

  // Verify email using token
  async verifyEmail(token) {
    try {
      const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new ValidationError('Activation link is invalid or has expired');
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  // Generate a new verification token for resending
  async createVerificationToken(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError('User not found');
      if (user.isVerified) throw new ValidationError('Account is already established');

      user.verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      return user;
    } catch (error) {
       logger.error('Error creating verification token:', error);
       throw error;
    }
  }
}

module.exports = new UserService();