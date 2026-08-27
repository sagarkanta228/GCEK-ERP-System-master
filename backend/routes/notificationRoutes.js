const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get notifications (generalized for all roles)
router.get('/', notificationController.getNotifications);

// Mark notification as read (generalized)
router.post('/:notificationId/read', notificationController.markAsRead);

module.exports = router;
