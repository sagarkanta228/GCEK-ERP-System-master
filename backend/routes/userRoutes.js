const express = require("express");
const { getUsers, assignFacultyRole, updateProfile, adminCreateUser, bulkImportUsers, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUsers);
router.put("/:id/assign", protect, authorize('Principal', 'Dean', 'Registrar', 'HOD'), assignFacultyRole);
router.patch("/:id/profile", protect, updateProfile);
router.post("/admin-create", protect, authorize('Principal', 'Dean', 'Registrar'), adminCreateUser);
router.post("/bulk-import", protect, authorize('Principal', 'Dean', 'Registrar'), bulkImportUsers);

// Admin/Principal Management
router.patch("/:id", protect, authorize('Principal', 'Dean', 'Registrar'), updateUser);
router.delete("/:id", protect, authorize('Principal', 'Dean', 'Registrar'), deleteUser);

module.exports = router;

