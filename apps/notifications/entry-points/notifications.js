const express = require('express');
const notificationService = require('../domain/notificationService');
const { authenticateToken } = require('../../../middleware/jwt');
const { requireAuth } = require('../../../middleware/roles');
const { asyncHandler } = require('../../../middleware/validate');

const router = express.Router();

/**
 * SSE Notification Stream
 * 
 * SECURITY NOTE: The EventSource browser API does not support custom headers,
 * so the JWT token must be passed via query parameter (?token=XXX).
 * 
 * Mitigations in place:
 * 1. Morgan logs redact token= values (see app.js)
 * 2. Helmet CSP prevents cross-origin resource embedding
 * 3. Access tokens have short TTL (10 minutes)
 * 4. HTTPS encrypts tokens in transit (production)
 * 5. Tokens are never stored server-side beyond request lifecycle
 */
// SSE stream — real-time notifications
router.get('/stream', authenticateToken, requireAuth, (req, res) => {
  console.log(`[SSE] Client connected: ${req.user.userId}`);

  // Disable timeout for this long-running connection
  req.socket.setTimeout(0);
  req.socket.setKeepAlive(true);
  req.socket.setNoDelay(true);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Send 1KB padding to bypass browser/proxy buffering
  res.write(':' + ' '.repeat(1024) + '\n\n');

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
    notificationService.removeSSEClient(req.user.userId, res);
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
