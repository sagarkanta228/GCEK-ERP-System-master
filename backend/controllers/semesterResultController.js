const SemesterResult = require('../models/SemesterResult');
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');

// Upload a new semester result
exports.uploadResult = async (req, res) => {
    try {
        const { studentId, semester, sgpa, credits, backlogs, branch, status } = req.body;

        if (!studentId || !semester || !sgpa || !credits || !branch) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Marksheet file is required" });
        }

        const marksheetUrl = `/uploads/marksheets/${req.file.filename}`;

        // Check if result already exists for this semester
        let result = await SemesterResult.findOne({ studentId, semester });

        if (result) {
            // Update existing result (optional: maybe delete the old file?)
            const oldPath = path.join(__dirname, '..', result.marksheetUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            result.sgpa = sgpa;
            result.credits = credits;
            result.backlogs = backlogs || 0;
            result.marksheetUrl = marksheetUrl;
            result.branch = branch;
            result.status = status || 'Pass';
            await result.save();
            return res.status(200).json({ message: "Result updated successfully", result });
        }

        // Create new semester result
        result = new SemesterResult({
            studentId,
            semester,
            sgpa,
            credits,
            backlogs: backlogs || 0,
            marksheetUrl,
            branch,
            status: status || 'Pass'
        });

        await result.save();
        res.status(201).json({ message: "Result uploaded successfully", result });

    } catch (error) {
        console.error("Upload Semester Result Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get results for a specific student (used by student themselves or staff)
exports.getStudentResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const results = await SemesterResult.find({ studentId }).sort({ semester: 1 });
        res.status(200).json(results);
    } catch (error) {
        console.error("Get Student Results Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get results for a specific branch (used by HOD/Faculty)
exports.getBranchResults = async (req, res) => {
    try {
        const { branch } = req.params;
        const results = await SemesterResult.find({ branch }).populate('studentId', 'name regdNo semester').sort({ createdAt: -1 });
        res.status(200).json(results);
    } catch (error) {
        console.error("Get Branch Results Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all results (Admin/Superuser)
exports.getAllResults = async (req, res) => {
    try {
        const results = await SemesterResult.find().populate('studentId', 'name regdNo branch semester').sort({ createdAt: -1 });
        res.status(200).json(results);
    } catch (error) {
        console.error("Get All Results Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
