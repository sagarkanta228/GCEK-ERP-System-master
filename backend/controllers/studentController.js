const Student = require('../models/Student');
const fs = require('fs');
const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const { adminCreateUserHelper } = require('./authController');

exports.uploadStudentsFile = async (req, res) => {
    try {
        const { branch, semester, section } = req.body;
        const file = req.file;

        if (!branch || !semester || !section || !file) {
            return res.status(400).json({ message: "Branch, semester, section, and file are required." });
        }

        let parsedStudents = [];

        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls') || file.originalname.endsWith('.csv')) {
            const workbook = xlsx.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                // Try grabbing at least two columns
                if (row.length >= 2 && row[0]) {
                    parsedStudents.push({ 
                        regdNo: String(row[0]).trim(), 
                        name: String(row[1]).trim(),
                        phoneNumber: row[2] ? String(row[2]).trim() : '',
                        email: row[3] ? String(row[3]).trim() : ''
                    });
                }
            }
        }
        else if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdfParse(dataBuffer);
            const lines = data.text.split('\n');
            // Assuming tabular data format extracting numbers like 210123001 Name
            const studentRegex = /(\d{8,15})\s+(.+)/;
            lines.forEach(line => {
                const match = line.match(studentRegex);
                if (match) {
                    parsedStudents.push({ 
                        regdNo: match[1].trim(), 
                        name: match[2].trim(),
                        phoneNumber: '' // PDF regex usually doesn't have phone
                    });
                }
            });
        } else {
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: "Unsupported file type. Please upload Excel (.xlsx) or PDF (.pdf)." });
        }

        if (parsedStudents.length === 0) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: "Could not extract student data. Ensure the document has Registration Number followed by Name." });
        }

        await Student.deleteMany({ branch, semester, section });

        const studentDocs = parsedStudents.map(s => ({
            name: s.name,
            regdNo: s.regdNo,
            phoneNumber: s.phoneNumber,
            email: s.email,
            branch,
            semester,
            section
        }));

        await Student.insertMany(studentDocs);

        // Create User records for these students so they can login
        for (const s of studentDocs) {
            await adminCreateUserHelper({
                fullName: s.name,
                email: s.email || `${s.regdNo}@gcekbpatna.ac.in`, // Use provided email or fallback
                role: 'Student',
                department: s.branch,
                regdNo: s.regdNo,
                phone: s.phoneNumber
            });
        }

        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        res.status(201).json({ message: "Students imported successfully via file.", count: studentDocs.length });
    } catch (error) {
        console.error("Error bulk importing students via file:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Server error during file import.", error: error.message });
    }
};

exports.bulkImportStudents = async (req, res) => {
    try {
        const { branch, semester, section, students } = req.body;

        if (!branch || !semester || !section || !students || !Array.isArray(students)) {
            return res.status(400).json({ message: "Invalid request payload. Ensure branch, semester, section, and an array of students are provided." });
        }

        // Delete existing students in this exact branch/semester/section pool to replace with the fresh list
        await Student.deleteMany({ branch, semester, section });

        // Map the payload to include branch, semester, and section for each student
        const studentDocs = students.map(s => ({
            name: s.name,
            regdNo: s.regdNo,
            phoneNumber: s.phoneNumber,
            email: s.email,
            branch,
            semester,
            section
        }));

        await Student.insertMany(studentDocs);

        // Create User records for these students so they can login
        for (const s of studentDocs) {
            await adminCreateUserHelper({
                fullName: s.name,
                email: s.email || `${s.regdNo}@gcekbpatna.ac.in`, // Use explicitly provided email or fallback
                role: 'Student',
                department: s.branch,
                regdNo: s.regdNo,
                phone: s.phoneNumber
            });
        }

        res.status(201).json({ message: "Students imported successfully.", count: studentDocs.length });
    } catch (error) {
        console.error("Error bulk importing students:", error);
        res.status(500).json({ message: "Server error during student import.", error: error.message });
    }
};

exports.getStudentsByClass = async (req, res) => {
    try {
        const { branch, semester, section } = req.query;

        const query = {};
        if (branch) query.branch = branch;
        if (section) query.section = section;

        if (semester) {
            const sem = semester.trim();
            const semVariants = [sem];

            // Accept either "5th" or "5th Sem" (and vice-versa)
            if (!/\bsem\b$/i.test(sem)) {
                semVariants.push(`${sem} Sem`);
            } else {
                semVariants.push(sem.replace(/\s*sem$/i, '').trim());
            }

            // If semester includes digits, match any value containing that digit (e.g. "5" or "5th").
            const digitMatch = sem.match(/\d+/);
            if (digitMatch) {
                const digit = digitMatch[0];
                semVariants.push(new RegExp(`\\b${digit}\\b`, 'i'));
            }

            // Also allow substring matches so things like "Semester 5" still work.
            semVariants.push(new RegExp(sem.replace(/\s+/g, '.*'), 'i'));

            query.semester = { $in: semVariants };
        }

        const students = await Student.find(query).sort({ regdNo: 1 });
        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Server error fetching students.", error: error.message });
    }
};

// ── List all students by branch (for HOD records view) ──
exports.listStudentsByBranch = async (req, res) => {
    try {
        const { branch, semester, section } = req.query;
        const query = {};
        if (branch) query.branch = { $regex: new RegExp(`^${branch}$`, 'i') };
        if (semester) query.semester = semester;
        if (section) query.section = section;
        const students = await Student.find(query).sort({ semester: 1, regdNo: 1 });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Add a single student ──
exports.addSingleStudent = async (req, res) => {
    try {
        const { regdNo, name, branch, semester, section, email, phoneNumber } = req.body;
        if (!regdNo || !name || !branch || !semester) {
            return res.status(400).json({ message: 'RegdNo, Name, Branch, and Semester are required.' });
        }
        const existing = await Student.findOne({ regdNo: regdNo.trim() });
        if (existing) {
            return res.status(409).json({ message: `Student with RegdNo ${regdNo} already exists.` });
        }
        const student = await Student.create({
            regdNo: regdNo.trim(),
            name: name.trim(),
            branch, semester,
            section: section || 'None',
            email: email?.trim().toLowerCase() || '',
            phoneNumber: phoneNumber || ''
        });
        // Create/update User record for login
        await adminCreateUserHelper({
            fullName: student.name,
            email: student.email || `${student.regdNo}@gcekbpatna.ac.in`,
            role: 'Student',
            department: student.branch,
            regdNo: student.regdNo,
            phone: student.phoneNumber
        });
        res.status(201).json({ message: 'Student added successfully.', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Update a student record ──
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, branch, semester, section, email, phoneNumber } = req.body;
        const student = await Student.findByIdAndUpdate(
            id,
            { name, branch, semester, section, email: email?.toLowerCase(), phoneNumber },
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        // Sync User record
        const User = require('../models/User');
        await User.findOneAndUpdate(
            { regdNo: student.regdNo },
            { fullName: student.name, department: student.branch, semester: student.semester, email: student.email },
            { new: true }
        );

        res.status(200).json({ message: 'Student updated.', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Delete a student record ──
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndDelete(id);
        if (!student) return res.status(404).json({ message: 'Student not found.' });

        // Also remove their User auth record
        const User = require('../models/User');
        await User.findOneAndDelete({ regdNo: student.regdNo, role: 'Student' });

        res.status(200).json({ message: `Student ${student.name} deleted.` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Bulk delete all students by branch (+ optional semester/section) ──
exports.bulkDeleteStudents = async (req, res) => {
    try {
        const { branch, semester, section } = req.query;

        if (!branch) {
            return res.status(400).json({ message: 'Branch is required for bulk delete.' });
        }

        const query = { branch: { $regex: new RegExp(`^${branch}$`, 'i') } };
        if (semester) query.semester = semester;
        if (section)  query.section  = section;

        // Find matching students first (to remove their User records)
        const toDelete = await Student.find(query).select('regdNo');

        if (toDelete.length === 0) {
            return res.status(404).json({ message: 'No students found matching the given filters.' });
        }

        const regdNos = toDelete.map(s => s.regdNo);

        // Delete from Student collection
        const result = await Student.deleteMany(query);

        // Delete their User login records
        const User = require('../models/User');
        await User.deleteMany({ regdNo: { $in: regdNos }, role: 'Student' });

        res.status(200).json({
            message: `${result.deletedCount} student(s) deleted successfully.`,
            count: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during bulk delete.', error: error.message });
    }
};
