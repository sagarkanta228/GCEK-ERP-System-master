const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");
const { protect, authorize } = require('../middleware/authMiddleware');

router.get("/", protect, timetableController.getTimetable);
router.post("/", protect, authorize('Faculty', 'HOD', 'Principal'), timetableController.saveTimetable);
router.post("/upload", protect, authorize('Faculty', 'HOD', 'Principal'), timetableController.uploadTimetable);

module.exports = router;
