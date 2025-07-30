const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const requireAuth = require('../middleware/authMiddleware');

// Apply authentication to all notification routes
router.use(requireAuth);

// GET /api/v1/notifications
router.get('/', notificationController.listNotifications);

// GET /api/v1/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

// PATCH /api/v1/notifications/mark-all-read
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router; 