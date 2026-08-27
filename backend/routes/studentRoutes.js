const express = require('express');
const router = express.Router();
const multer = require('multer');
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/import', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), studentController.bulkImportStudents);
router.post('/upload', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), upload.single('file'), studentController.uploadStudentsFile);
router.post('/add', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), studentController.addSingleStudent);
router.get('/', protect, studentController.getStudentsByClass);
router.get('/list', protect, studentController.listStudentsByBranch);
router.put('/:id', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), studentController.updateStudent);
router.delete('/bulk', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), studentController.bulkDeleteStudents);
router.delete('/:id', protect, authorize('HOD', 'Principal', 'Dean', 'Registrar'), studentController.deleteStudent);

module.exports = router;
