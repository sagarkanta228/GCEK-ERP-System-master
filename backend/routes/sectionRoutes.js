const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");

router.get("/", sectionController.getSections);
router.post("/", sectionController.saveSections);

module.exports = router;
