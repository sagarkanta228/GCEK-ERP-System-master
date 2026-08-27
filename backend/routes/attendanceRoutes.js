const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const extensionController = require('../controllers/attendanceExtensionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/mark', protect, authorize('Faculty', 'HOD', 'Principal'), attendanceController.markAttendance);
router.post('/ensure', protect, attendanceController.ensureAttendanceForDay);
router.get('/stats', protect, attendanceController.getAttendanceStats);
router.get('/institutional-stats', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), attendanceController.getInstitutionalStats);
router.get('/student/:regdNo', protect, attendanceController.getStudentAttendance);
router.get('/export', protect, authorize('Faculty', 'HOD', 'Principal', 'Dean'), attendanceController.exportAttendance);
router.get('/sheet', protect, authorize('HOD', 'Principal', 'Dean'), attendanceController.getAttendanceSheet);
router.put('/update', protect, authorize('HOD', 'Principal'), attendanceController.updateAttendanceCell);

// Staff Attendance
router.post('/staff-mark', protect, attendanceController.markStaffAttendance);
router.get('/staff-summary', protect, authorize('Principal', 'Dean', 'Registrar'), attendanceController.getStaffAttendanceSummary);

// Attendance Extensions
router.get('/check-missing', protect, authorize('Faculty', 'HOD', 'Principal'), extensionController.checkMissingAttendances);
router.get('/extensions/pending', protect, authorize('HOD', 'Principal'), extensionController.getPendingExtensions);
router.post('/extensions/resolve', protect, authorize('HOD', 'Principal'), extensionController.resolveExtension);

module.exports = router;
