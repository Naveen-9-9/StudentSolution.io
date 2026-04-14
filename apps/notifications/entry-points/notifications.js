const express = require('express');
const notificationService = require('../domain/notificationService');
const { authenticateToken } = require('../../../middleware/jwt');
const { requireAuth } = require('../../../middleware/roles');
const { asyncHandler } = require('../../../middleware/validate');

const router = express.Router();

// SSE stream — real-time notifications
router.get('/stream', authenticateToken, requireAuth, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable nginx buffering
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Register this client
  notificationService.addSSEClient(req.user.userId, res);

  // Keepalive every 30 seconds
  const keepalive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepalive);
  });
});

// Get notifications (paginated)
router.get('/', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await notificationService.getUserNotifications(req.user.userId, page, limit);
  
  res.json({ success: true, data: result });
}));

// Mark single notification as read
router.patch('/:id/read', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.userId);
  res.json({ success: true, message: 'Notification marked as read' });
}));

// Mark all notifications as read
router.patch('/read-all', authenticateToken, requireAuth, asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.userId);
  res.json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
