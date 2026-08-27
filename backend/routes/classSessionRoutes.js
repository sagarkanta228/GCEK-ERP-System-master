const express = require("express");
const router = express.Router();
const classSessionController = require("../controllers/classSessionController");

router.get("/", classSessionController.getSessions);
router.post("/", classSessionController.addSession);
router.put("/:id", classSessionController.updateSession);
router.delete("/:id", classSessionController.deleteSession);

module.exports = router;
