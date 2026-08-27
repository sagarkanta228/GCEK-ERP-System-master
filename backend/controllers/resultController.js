const Result = require('../models/Result');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { Parser } = require('json2csv');

exports.uploadResult = async (req, res) => {
    try {
        const { facultyId, subject, branch, semester, section, examType, maxMarks, date, records } = req.body;

        if (!facultyId || !subject || !branch || !semester || !examType || maxMarks === undefined || !records) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        // Find existing result for the same class and exam type
        let result = await Result.findOne({
            facultyId,
            subject,
            branch,
            semester,
            section: section || "",
            examType
        });

        if (result) {
            // Update existing Result
            result.records = records;
            result.maxMarks = maxMarks; // Allow updating the max marks
            result.date = dateObj;
            await result.save();

            // Trigger notification
            try {
                const notif = new Notification({
                    recipient: 'Student',
                    title: `Result Updated: ${subject}`,
                    message: `Marks for ${examType} have been updated.`,
                    type: 'RESULT_UPLOAD',
                    semester: semester,
                    branch: branch
                });
                await notif.save();
            } catch (err) {
                console.error("Failed to create notification:", err);
            }

            return res.status(200).json({ message: "Result updated successfully", result });
        } else {
            // Create new Result
            result = new Result({
                facultyId,
                subject,
                branch,
                semester,
                section: section || "",
                examType,
                maxMarks,
                date: dateObj,
                records
            });
            await result.save();

            // Trigger notification
            try {
                const notif = new Notification({
                    recipient: 'Student',
                    title: `New Result: ${subject}`,
                    message: `Marks for ${examType} have been published.`,
                    type: 'RESULT_UPLOAD',
                    semester: semester,
                    branch: branch
                });
                await notif.save();
            } catch (err) {
                console.error("Failed to create notification:", err);
            }

            return res.status(201).json({ message: "Result saved successfully", result });
        }
    } catch (error) {
        console.error("Upload Result Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.exportResult = async (req, res) => {
    try {
        const { branch, semester, subject, section, examType } = req.query;

        // Fetch the Result block
        const query = { branch, semester, subject };
        if (section) query.section = section;
        if (examType) query.examType = examType;

        const results = await Result.find(query).sort({ date: -1 });

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "No result records found for export" });
        }

        let exportData = [];

        for (let result of results) {
            // Fetch student names for context
            const studentIds = result.records.map(r => r.regdNo);
            const students = await Student.find({ regdNo: { $in: studentIds } });

            const studentMap = {};
            students.forEach(s => {
                studentMap[s.regdNo] = s.name;
            });

            const dateStr = result.date.toISOString().split('T')[0];
            const examStr = result.examType;
            const maxStr = result.maxMarks;

            result.records.forEach(rec => {
                exportData.push({
                    "Date": dateStr,
                    "Exam Type": examStr,
                    "Max Marks": maxStr,
                    "Branch": result.branch,
                    "Semester": result.semester,
                    "Section": result.section,
                    "Subject": result.subject,
                    "Roll No": rec.regdNo,
                    "Student Name": studentMap[rec.regdNo] || 'Unknown',
                    "Marks Obtained": rec.marksObtained
                });
            });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(exportData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`Result_Export_${examType || 'All'}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error("Export Result Error:", error);
        res.status(500).json({ message: "Server error during export" });
    }
};

exports.getUploadedResults = async (req, res) => {
    try {
        const { facultyId, branch, semester, subject, section } = req.query;

        let query = { facultyId, branch, semester, subject };
        if (section) query.section = section;

        const results = await Result.find(query).sort({ date: -1 });
        res.status(200).json(results);
    } catch (error) {
        console.error("Get Uploaded Results Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.deleteResult = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Result.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.status(200).json({ message: "Result deleted successfully" });
    } catch (error) {
        console.error("Delete Result Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getStudentResult = async (req, res) => {
    try {
        const { regdNo } = req.params;

        // Find all outcome records where this student is featured
        const allResults = await Result.find({ "records.regdNo": regdNo }).sort({ date: -1 });

        const myResults = [];

        allResults.forEach(r => {
            const myRecord = r.records.find(rec => rec.regdNo === regdNo);
            if (myRecord) {
                myResults.push({
                    date: r.date,
                    subject: r.subject,
                    examType: r.examType,
                    maxMarks: r.maxMarks,
                    marksObtained: myRecord.marksObtained
                });
            }
        });

        res.status(200).json(myResults);

    } catch (error) {
        console.error("Get Student Result Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
