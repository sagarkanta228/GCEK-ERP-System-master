const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Faculty Routes
router.post('/create', feedbackController.createForm);
router.patch('/:formId/publish', feedbackController.publishForm);
router.get('/faculty/:facultyId', feedbackController.getFacultyForms);
router.get('/branch/:branch', feedbackController.getBranchForms);
router.get('/:formId/responses', feedbackController.getFormResponses);
router.get('/performance-metrics', feedbackController.getFacultyPerformanceMetrics);
router.delete('/:formId', feedbackController.deleteForm);

// Student Routes
router.get('/student/available', feedbackController.getStudentForms);
router.get('/student/check', feedbackController.checkSubmission);
router.post('/submit', feedbackController.submitResponse);
router.delete('/student/submit', feedbackController.deleteSubmission);

module.exports = router;
