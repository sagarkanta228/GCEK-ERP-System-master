const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply for leave (Student) with pdf document
router.post('/apply', protect, authorize('Student'), leaveController.uploadMiddleware, leaveController.applyLeave);

// Get student's leave history
router.get('/student/:regdNo', protect, leaveController.getStudentLeaves);

// Get pending leaves for authorities (HOD, Dean, Principal -> via ?role=... query parameter)
router.get('/pending', protect, authorize('HOD', 'Dean', 'Principal', 'Registrar'), leaveController.getPendingLeaves);

// Update leave status
router.patch('/:id/status', protect, authorize('HOD', 'Dean', 'Principal', 'Registrar'), leaveController.updateLeaveStatus);

// Get a single leave by ID
router.get('/:id', protect, leaveController.getLeaveById);

module.exports = router;
