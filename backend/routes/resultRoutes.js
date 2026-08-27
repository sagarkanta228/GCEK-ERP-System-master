const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/upload', protect, authorize('Faculty', 'HOD', 'Principal'), resultController.uploadResult);
router.get('/export', protect, authorize('Faculty', 'HOD', 'Principal', 'Dean'), resultController.exportResult);
router.get('/uploaded', protect, authorize('Faculty', 'HOD', 'Principal'), resultController.getUploadedResults);
router.get('/student/:regdNo', protect, resultController.getStudentResult);
router.delete('/:id', protect, authorize('Faculty', 'HOD', 'Principal'), resultController.deleteResult);

module.exports = router;
