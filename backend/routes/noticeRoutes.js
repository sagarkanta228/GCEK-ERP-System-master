const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

// Get all notices relevant to the user
router.get('/', protect, noticeController.getNotices);

// Create a new notice
router.post('/', protect, noticeController.createNotice);

// Mark a notice as read
router.post('/:id/read', protect, noticeController.markAsRead);

// Delete a notice
router.delete('/:id', protect, noticeController.deleteNotice);

module.exports = router;
