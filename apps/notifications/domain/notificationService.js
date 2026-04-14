const Notification = require('../data-access/notificationModel');
const logger = require('../../../libraries/logger');

// SSE client connections stored per user
const sseClients = new Map(); // userId -> Set of response objects

class NotificationService {
  // Create and optionally push via SSE
  async createNotification(userId, type, message, relatedToolId = null) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        message,
        relatedTool: relatedToolId
      });

      // Populate for SSE push and response
      await notification.populate('relatedTool', 'name category');

      // Push to connected SSE clients
      this.pushToUser(userId.toString(), notification);
      
      logger.info(`Notification created: ${type} for user ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications (paginated)
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('relatedTool', 'name category')
        .lean(),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false })
    ]);
    return { notifications, total, unreadCount, page, limit };
  }

  // Mark single as read
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
  }

  // Mark all as read
  async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  // Get unread count
  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, read: false });
  }

  // SSE: register client
  addSSEClient(userId, res) {
    if (!sseClients.has(userId)) {
      sseClients.set(userId, new Set());
    }
    sseClients.get(userId).add(res);
    
    res.on('close', () => {
      const clients = sseClients.get(userId);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) sseClients.delete(userId);
      }
    });
  }

  // SSE: push to user
  pushToUser(userId, notification) {
    const clients = sseClients.get(userId);
    if (clients) {
      const data = JSON.stringify(notification);
      clients.forEach(res => {
        res.write(`data: ${data}\n\n`);
      });
    }
  }
}

module.exports = new NotificationService();
