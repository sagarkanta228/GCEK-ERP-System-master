const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const semesterResultController = require('../controllers/semesterResultController');

// Multer configuration for marksheets
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/marksheets/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'marksheet-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// Student routes
router.post('/', upload.single('marksheet'), semesterResultController.uploadResult);
router.get('/student/:studentId', semesterResultController.getStudentResults);

// Staff routes
router.get('/branch/:branch', semesterResultController.getBranchResults);
router.get('/all', semesterResultController.getAllResults);

module.exports = router;
