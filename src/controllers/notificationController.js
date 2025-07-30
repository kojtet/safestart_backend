const notificationModel = require('../models/notificationModel');

// GET /api/v1/notifications
exports.listNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      is_read, 
      type 
    } = req.query;

    const filters = {};
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    if (type) filters.type = type;

    const notifications = await notificationModel.listNotifications(
      req.user.id, 
      filters, 
      page, 
      limit
    );
    
    res.json(notifications);
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/v1/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationModel.getUnreadCount(req.user.id);
    res.json({ unread_count: count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/v1/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists and belongs to user
    const notification = await notificationModel.findById(id, req.user.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    await notificationModel.markAsRead(id, req.user.id);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/v1/notifications/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationModel.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}; 