// middleware/notificationMiddleware.js
const Notification = require('../models/notification.model');

exports.sendNotification = async (userId, message) => {
  try {
    await Notification.create({ userId, message });
    // Optionally, emit a socket event for real-time updates
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    throw new Error('Failed to send notification');
  }
};

