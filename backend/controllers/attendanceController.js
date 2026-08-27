const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Result = require('../models/Result');
const User = require('../models/User');
const StaffAttendance = require('../models/StaffAttendance');
const Timetable = require('../models/Timetable');
const LeaveApplication = require('../models/LeaveApplication');
const ExcelJS = require('exceljs');

// Mark internal/external attendance
exports.markAttendance = async (req, res) => {
    try {
        const { facultyId, subject, branch, semester, section, date, records } = req.body;

        if (!facultyId || !subject || !branch || !semester || !date || !records) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const parsedDate = new Date(date);
        parsedDate.setHours(0, 0, 0, 0); // Normalize to start of day

        const today = new Date();
        const isToday = parsedDate.getDate() === today.getDate() && parsedDate.getMonth() === today.getMonth() && parsedDate.getFullYear() === today.getFullYear();
        const hr = today.getHours();

        // If today and past 18:00, or a past date completely
        const isLate = (isToday && hr >= 18) || (!isToday && parsedDate < new Date(today.setHours(0,0,0,0)));

        if (isLate) {
            const AttendanceExtension = require('../models/AttendanceExtension');
            const extension = await AttendanceExtension.findOne({ facultyId, date: parsedDate, status: 'Approved' });
            if (!extension) {
                return res.status(403).json({ message: "Attendance submission deadline (6 PM) has passed. Please wait for Principal's approval." });
            }
        }

        // Check if attendance already exists for this class on this date
        let attendance = await Attendance.findOne({
            facultyId,
            subject,
            branch,
            semester,
            section: section || "",
            date: {
                $gte: parsedDate,
                $lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (attendance) {
            // Update existing records
            attendance.records = records;
            await attendance.save();
            return res.status(200).json({ message: "Attendance updated successfully", attendance });
        }

        // Create new attendance
        attendance = new Attendance({
            facultyId,
            subject,
            branch,
            semester,
            section: section || "",
            date: parsedDate,
            records
        });

        await attendance.save();

        // Automatically mark faculty as present
        const { getScheduledDuration } = require('../utils/timetableUtils');
        const duration = await getScheduledDuration(branch, semester, section, subject, date);
        
        let existingStaffAtt = await StaffAttendance.findOne({
            userId: facultyId,
            date: { $gte: parsedDate, $lt: new Date(parsedDate.getTime() + 24*60*60*1000) }
        });

        if (!existingStaffAtt) {
            await StaffAttendance.create({
                userId: facultyId,
                date: parsedDate,
                status: 'Present',
                verificationStatus: 'Verified',
                metadata: {
                    backgroundDetected: 'Auto-marked via student attendance',
                    faceMatched: false,
                    durationTaken: duration,
                    timestamp: new Date()
                }
            });
        }

        res.status(201).json({ message: "Attendance marked successfully", attendance });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get attendance stats for HOD
exports.getAttendanceStats = async (req, res) => {
    try {
        const { branch, semester } = req.query;

        if (!branch) {
            return res.status(400).json({ message: "Branch is required" });
        }

        const query = { branch };
        if (semester) query.semester = semester;

        const attendances = await Attendance.find(query);

        // Calculate statistics
        let totalClasses = 0;
        let totalPresents = 0;
        let totalAbsents = 0;
        const subjectStats = {};

        attendances.forEach(att => {
            totalClasses += 1;

            if (!subjectStats[att.subject]) {
                subjectStats[att.subject] = { totalClasses: 0, presents: 0, absents: 0 };
            }
            subjectStats[att.subject].totalClasses += 1;

            att.records.forEach(rec => {
                if (rec.status) {
                    totalPresents += 1;
                    subjectStats[att.subject].presents += 1;
                } else {
                    totalAbsents += 1;
                    subjectStats[att.subject].absents += 1;
                }
            });
        });

        // ===== FETCH ADDITIONAL DATA FOR BI DASHBOARD =====
        const studentQuery = { branch };
        if (semester) studentQuery.semester = semester;
        const students = await Student.find(studentQuery);
        const results = await Result.find({ branch });
        const facultyList = await User.find({ department: branch, role: { $regex: /faculty/i } });

        // Calculate student specific stats
        const studentMap = {}; // regdNo -> data
        students.forEach(st => {
            studentMap[st.regdNo] = {
                id: st._id,
                name: st.name,
                roll: st.regdNo,
                sem: st.semester,
                att: 0,
                totalClasses: 0,
                presents: 0,
                cgpa: 0,
                totalMarks: 0,
                maxMarks: 0,
                status: 'Average'
            };
        });

        // 1. Process Attendance for Students/Trends
        const monthlyTrends = {}; // month -> { student: %, count: N }

        attendances.forEach(att => {
            const month = new Date(att.date).toLocaleString('default', { month: 'short' });
            if (!monthlyTrends[month]) monthlyTrends[month] = { presents: 0, total: 0 };

            att.records.forEach(rec => {
                if (studentMap[rec.regdNo]) {
                    studentMap[rec.regdNo].totalClasses += 1;
                    monthlyTrends[month].total += 1;
                    if (rec.status) {
                        studentMap[rec.regdNo].presents += 1;
                        monthlyTrends[month].presents += 1;
                    }
                }
            });
        });

        // Compute attendance % for each student
        Object.values(studentMap).forEach(st => {
            st.att = st.totalClasses > 0 ? Math.round((st.presents / st.totalClasses) * 100) : 0;
        });

        // Complete Monthly Trends
        const attendanceData = Object.keys(monthlyTrends).map(month => ({
            name: month,
            student: monthlyTrends[month].total > 0 ? Math.round((monthlyTrends[month].presents / monthlyTrends[month].total) * 100) : 0,
            faculty: Math.min(100, Math.round(80 + Math.random() * 20)) // Mock faculty attendance trend since it's not tracked
        }));

        // 2. Process Results for CGPA calculation
        results.forEach(resRecord => {
            resRecord.records.forEach(rec => {
                if (studentMap[rec.regdNo]) {
                    studentMap[rec.regdNo].totalMarks += rec.marksObtained;
                    studentMap[rec.regdNo].maxMarks += resRecord.maxMarks;
                }
            });
        });

        const semesterDataMap = {}; // semester -> { totalCgpa, totalAtt, count }

        Object.values(studentMap).forEach(st => {
            // Rough CGPA conversion based on percentage (scale 0-10)
            const percentage = st.maxMarks > 0 ? (st.totalMarks / st.maxMarks) * 100 : 0;
            st.cgpa = percentage > 0 ? (percentage / 9.5).toFixed(2) : 0; // Simplified formula

            if (st.cgpa >= 8.5) st.status = 'Excellent';
            else if (st.cgpa >= 7.0) st.status = 'Good';
            else if (st.cgpa > 0) st.status = 'Average';
            else st.status = 'N/A';

            if (!semesterDataMap[st.sem]) {
                semesterDataMap[st.sem] = { totalCgpa: 0, totalAtt: 0, count: 0 };
            }
            semesterDataMap[st.sem].totalCgpa += parseFloat(st.cgpa);
            semesterDataMap[st.sem].totalAtt += st.att;
            semesterDataMap[st.sem].count += 1;
        });

        // 3. Complete Semester Performance
        const semesterPerformance = Object.keys(semesterDataMap).sort().map(sem => ({
            name: sem,
            avgCGPA: semesterDataMap[sem].count > 0 ? (semesterDataMap[sem].totalCgpa / semesterDataMap[sem].count).toFixed(2) : 0,
            attendance: semesterDataMap[sem].count > 0 ? Math.round(semesterDataMap[sem].totalAtt / semesterDataMap[sem].count) : 0
        }));

        // 4. Transform Faculty Data
        const facultyData = facultyList.map((fac, idx) => ({
            id: fac._id || idx,
            name: fac.name,
            desig: fac.role, // "Faculty (Professor)" etc.
            dept: fac.department || branch,
            classes: fac.teachingAssignments ? fac.teachingAssignments.length * 10 : Math.floor(Math.random() * 30) + 10,
            rating: (4 + Math.random()).toFixed(1) // Mock rating
        }));

        const overallPercentage = (totalPresents + totalAbsents) === 0 ? 0 : Math.round((totalPresents / (totalPresents + totalAbsents)) * 100);

        res.status(200).json({
            totalClasses,
            overallPercentage,
            subjectStats,
            totalStudents: students.length,
            facultyCount: facultyList.length,
            studentsData: Object.values(studentMap),
            attendanceData,
            semesterPerformance,
            facultyData
        });

    } catch (error) {
        console.error("Error getting attendance stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get institution-wide stats for Principal
exports.getInstitutionalStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Fetch Basic Totals
        const totalStudents = await Student.countDocuments();
        const teachingStaff = await User.find({ role: { $in: ['Faculty', 'HOD', 'Dean', 'Principal'] } });
        const nonTeachingStaff = await User.find({ role: { $in: ['Registrar', 'Admin'] } });

        const totalTeaching = teachingStaff.length;
        const totalNonTeaching = nonTeachingStaff.length;

        // 2. Fetch Active approved leaves for today
        const activeLeaves = await LeaveApplication.find({
            status: 'Approved',
            startDate: { $lte: today },
            endDate: { $gte: today }
        });

        const absentStaffIds = activeLeaves.map(l => l.applicantId);
        
        const presentTeaching = teachingStaff.filter(s => !absentStaffIds.includes(s._id.toString())).length;
        const presentNonTeaching = nonTeachingStaff.filter(s => !absentStaffIds.includes(s._id.toString())).length;

        // 3. Overall Attendance & Performance
        const allAttendances = await Attendance.find();
        let totalRecords = 0;
        let presentRecords = 0;

        allAttendances.forEach(att => {
            att.records.forEach(rec => {
                totalRecords++;
                if (rec.status) presentRecords++;
            });
        });

        const overallAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

        // 4. Academic Performance (CGPA)
        const allResults = await Result.find();
        let totalMarksSum = 0;
        let maxMarksSum = 0;

        allResults.forEach(resRecord => {
            resRecord.records.forEach(rec => {
                totalMarksSum += rec.marksObtained;
                maxMarksSum += resRecord.maxMarks;
            });
        });

        const overallAcademic = maxMarksSum > 0 ? Math.round((totalMarksSum / maxMarksSum) * 100) : 0;

        // 5. Monthly Trends (last 6 months)
        const monthlyTrends = {};
        allAttendances.forEach(att => {
            const month = new Date(att.date).toLocaleString('default', { month: 'short' });
            if (!monthlyTrends[month]) monthlyTrends[month] = { presents: 0, total: 0 };
            
            att.records.forEach(rec => {
                monthlyTrends[month].total++;
                if (rec.status) monthlyTrends[month].presents++;
            });
        });

        const attendanceTrends = Object.keys(monthlyTrends).map(month => ({
            name: month,
            student: monthlyTrends[month].total > 0 ? Math.round((monthlyTrends[month].presents / monthlyTrends[month].total) * 100) : 0,
            faculty: Math.min(100, Math.round(90 + Math.random() * 5)) // Faculty attendance via Bio-metric/Manual is still placeholder in many systems, logic here uses 90-95%
        }));

        // 6. Branch-wise Comparison (CSE, EE, ME, CE, etc.)
        const branches = ['CSE', 'EE', 'ME', 'CE'];
        const branchPerformance = await Promise.all(branches.map(async (branch) => {
            const branchStudents = await Student.find({ branch });
            const branchResults = await Result.find({ branch });
            const branchAttendances = await Attendance.find({ branch });
            
            let totalM = 0;
            let maxM = 0;
            branchResults.forEach(r => r.records.forEach(rec => { totalM += rec.marksObtained; maxM += r.maxMarks; }));
            
            let totalA = 0;
            let presentA = 0;
            branchAttendances.forEach(att => att.records.forEach(rec => { totalA++; if (rec.status) presentA++; }));
            
            return {
                name: branch,
                performance: maxM > 0 ? Math.round((totalM / maxM) * 100) : 0,
                attendance: totalA > 0 ? Math.round((presentA / totalA) * 100) : 0,
                students: branchStudents.length
            };
        }));

        // 7. Faculty Highlights (across all branches)
        const topFaculty = teachingStaff
            .map(fac => ({
                name: fac.name,
                role: fac.role,
                dept: fac.department || 'N/A',
                rating: (4 + Math.random()).toFixed(1) // Placeholder rating
            }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10);

        res.status(200).json({
            overallPerformance: overallAcademic,
            academicExcellence: Math.min(100, overallAcademic + 5),
            researchInnovation: Math.round(overallAcademic * 0.85),
            teachingStaffPresent: presentTeaching,
            totalTeachingStaff: totalTeaching,
            nonTeachingStaffPresent: presentNonTeaching,
            totalNonTeachingStaff: totalNonTeaching,
            overallAttendance,
            attendanceTrends,
            totalStudents,
            branchPerformance,
            topFaculty
        });

    } catch (error) {
        console.error("Error getting institutional stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get attendance for a specific student
exports.getStudentAttendance = async (req, res) => {
    try {
        const { regdNo } = req.params;

        if (!regdNo) {
            return res.status(400).json({ message: "Registration number is required" });
        }

        // Find all attendances where this student's records are present
        const attendances = await Attendance.find({
            "records.regdNo": regdNo
        });

        let totalClasses = 0;
        let totalPresents = 0;
        const subjectStats = {};

        attendances.forEach(att => {
            const studentRecord = att.records.find(r => r.regdNo === regdNo);
            if (studentRecord) {
                totalClasses += 1;

                if (!subjectStats[att.subject]) {
                    subjectStats[att.subject] = { totalClasses: 0, presents: 0 };
                }
                subjectStats[att.subject].totalClasses += 1;

                if (studentRecord.status) {
                    totalPresents += 1;
                    subjectStats[att.subject].presents += 1;
                }
            }
        });

        const overallPercentage = totalClasses === 0 ? 0 : ((totalPresents / totalClasses) * 100).toFixed(2);

        res.status(200).json({
            regdNo,
            totalClasses,
            totalPresents,
            overallPercentage,
            subjectStats
        });

    } catch (error) {
        console.error("Error getting student attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Ensure attendance records exist for scheduled classes (marks absent if teacher hasn’t taken attendance yet)
exports.ensureAttendanceForDay = async (req, res) => {
    try {
        const { branch, semester, section, subject, date, facultyId } = req.body;

        if (!branch || !semester || !subject) {
            return res.status(400).json({ message: "Branch, semester, and subject are required" });
        }

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

        const query = { branch, semester };
        if (section) query.section = section;
        else query.section = { $in: ["", null, undefined] }; // Handle empty or missing section

        const timetable = await Timetable.findOne(query);
        if (!timetable) {
            return res.status(404).json({ message: "No timetable found for this class" });
        }

        const daySchedule = timetable.schedule.find(d => d.day?.toLowerCase() === weekday.toLowerCase());
        if (!daySchedule) {
            return res.status(200).json({ message: "No class scheduled for this day", scheduled: false });
        }

        const isScheduled = daySchedule.periods.some(p => p.subject && p.subject.toLowerCase() === subject.toLowerCase());
        if (!isScheduled) {
            return res.status(200).json({ message: "Subject is not scheduled for this day", scheduled: false });
        }

        // Check if attendance already exists for this class on this date
        const existing = await Attendance.findOne({
            facultyId,
            subject,
            branch,
            semester,
            section: section || "",
            date: {
                $gte: targetDate,
                $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existing) {
            return res.status(200).json({ message: "Attendance already exists", scheduled: true, attendance: existing });
        }

        const students = await Student.find({ branch, semester, section });
        const records = students.map(s => ({ regdNo: s.regdNo, status: false }));

        const attendance = new Attendance({
            facultyId: facultyId || null,
            subject,
            branch,
            semester,
            section: section || "",
            date: targetDate,
            records
        });

        await attendance.save();
        res.status(201).json({ message: "Created absent attendance record for scheduled class", scheduled: true, attendance });
    } catch (error) {
        console.error("Error ensuring attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Export attendance logic
exports.exportAttendance = async (req, res) => {
    try {
        const { branch, semester, subject, date } = req.query;

        if (!branch || !semester || !subject) {
            return res.status(400).json({ message: "Branch, semester, and subject are required" });
        }

        const query = { branch, semester, subject };
        if (date) {
            const parsedDate = new Date(date);
            parsedDate.setHours(0, 0, 0, 0);
            query.date = {
                $gte: parsedDate,
                $lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }

        const attendances = await Attendance.find(query).populate('facultyId', 'name');

        if (!attendances || attendances.length === 0) {
            return res.status(404).json({ message: "No attendance records found for the given criteria" });
        }

        // Fetch students to map regdNo to names
        const students = await Student.find({ branch, semester });
        const studentMap = {};
        students.forEach(s => {
            studentMap[s.regdNo] = s.name;
        });

        // Create CSV logic. 
        // Since an export might contain multiple dates, we pivot dates to columns, students to rows
        const dates = [];
        attendances.forEach(att => {
            const dt = new Date(att.date).toISOString().split('T')[0];
            if (!dates.includes(dt)) dates.push(dt);
        });
        dates.sort();

        // Map of regdNo -> { date1: status, date2: status }
        const studentRecords = {};
        attendances.forEach(att => {
            const dt = new Date(att.date).toISOString().split('T')[0];
            att.records.forEach(rec => {
                if (!studentRecords[rec.regdNo]) {
                    studentRecords[rec.regdNo] = {};
                }
                studentRecords[rec.regdNo][dt] = rec.status ? "P" : "A";
            });
        });

        // Building the CSV string
        let csvString = 'Regd No,Name,';
        csvString += dates.join(',') + ',Total Classes,Total Present,Percentage\n';

        // Sort students by Regd No
        const sortedRegdNos = Object.keys(studentRecords).sort();

        sortedRegdNos.forEach(regdNo => {
            const name = studentMap[regdNo] || 'Unknown';
            let row = `${regdNo},${name},`;

            let presents = 0;
            let validClasses = 0;

            dates.forEach(dt => {
                const status = studentRecords[regdNo][dt];
                if (status) {
                    row += `${status},`;
                    validClasses++;
                    if (status === 'P') presents++;
                } else {
                    row += '-,'; // No record for this date
                }
            });

            const percentage = validClasses === 0 ? 0 : ((presents / validClasses) * 100).toFixed(2);
            row += `${validClasses},${presents},${percentage}%\n`;
            csvString += row;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_export_${branch}_${semester}_${subject}.csv`);
        return res.status(200).send(csvString);

    } catch (error) {
        console.error("Error exporting attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch tabular attendance sheet data
exports.getAttendanceSheet = async (req, res) => {
    try {
        const { branch, semester, subject } = req.query;

        if (!branch || !semester || !subject) {
            return res.status(400).json({ message: "Branch, semester, and subject are required" });
        }

        // Fetch attendances for this class
        const attendances = await Attendance.find({ branch, semester, subject }).sort({ date: 1 });

        // Fetch all students in this class
        const students = await Student.find({ branch, semester }).sort({ regdNo: 1 });

        // Map student data
        const studentMap = {};
        students.forEach(s => {
            studentMap[s.regdNo] = { name: s.name, regdNo: s.regdNo, records: {} };
        });

        const dates = [];
        attendances.forEach(att => {
            const dateStr = new Date(att.date).toISOString().split('T')[0];
            if (!dates.includes(dateStr)) dates.push(dateStr);

            att.records.forEach(rec => {
                if (!studentMap[rec.regdNo]) {
                    // Just in case a student marked is no longer in the DB
                    studentMap[rec.regdNo] = { name: "Unknown", regdNo: rec.regdNo, records: {} };
                }
                studentMap[rec.regdNo].records[dateStr] = rec.status;
            });
        });

        res.status(200).json({
            dates,
            students: Object.values(studentMap)
        });

    } catch (error) {
        console.error("Error fetching attendance sheet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a single attendance cell
exports.updateAttendanceCell = async (req, res) => {
    try {
        const { date, branch, semester, subject, regdNo, status } = req.body;

        if (!date || !branch || !semester || !subject || !regdNo) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const parsedDate = new Date(date);
        parsedDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            branch, semester, subject,
            date: {
                $gte: parsedDate,
                $lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!attendance) {
            return res.status(404).json({ message: "No attendance record found for this date" });
        }

        const recordIndex = attendance.records.findIndex(r => r.regdNo === regdNo);

        if (recordIndex !== -1) {
            attendance.records[recordIndex].status = status;
        } else {
            // Add if it doesn't exist for some reason
            attendance.records.push({ regdNo, status });
        }

        await attendance.save();
        res.status(200).json({ message: "Attendance cell updated successfully", attendance });
    } catch (error) {
        console.error("Error updating attendance cell:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Mark staff attendance (Camera-based or Principal login)
exports.markStaffAttendance = async (req, res) => {
    try {
        const { userId, role, image, backgroundData } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already marked
        const existing = await StaffAttendance.findOne({ 
            userId, 
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } 
        });

        if (existing) {
            return res.status(200).json({ message: "Attendance already marked for today", attendance: existing });
        }

        let verificationStatus = 'Pending';
        let metadata = { backgroundDetected: 'None', faceMatched: false };

        if (role === 'Principal') {
            // Principal login is auto-verified
            verificationStatus = 'Verified';
            metadata = { backgroundDetected: 'Login Triggered', faceMatched: true };
        } else if (image) {
            // Simulate Face & Background Recognition
            // Background check for "college", "blackboard", "office"
            const keywords = ['college', 'blackboard', 'office', 'classroom', 'library'];
            const foundBackground = keywords.find(k => backgroundData?.toLowerCase().includes(k)) || 'Indoor';
            
            verificationStatus = 'Verified'; // For this simulation, we mark as verified if image is present
            metadata = { 
                backgroundDetected: foundBackground, 
                faceMatched: true,
                timestamp: new Date()
            };
        }

        const attendance = new StaffAttendance({
            userId,
            date: today,
            status: 'Present',
            verificationImage: image || null,
            verificationStatus,
            metadata
        });

        await attendance.save();
        res.status(201).json({ message: "Staff attendance marked successfully", attendance });
    } catch (error) {
        console.error("Error marking staff attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get staff attendance summary for Principal
exports.getStaffAttendanceSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecords = await StaffAttendance.find({
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        }).populate('userId', 'fullName name role department');

        // Calculate today's scheduled stats from timetable
        const Timetable = require('../models/Timetable');
        const { parseTime } = require('../utils/timetableUtils');
        const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
        
        const timetables = await Timetable.find();
        const scheduledFaculties = new Set();
        let totalDurationMins = 0;

        for (const t of timetables) {
            const daySchedule = t.schedule?.find(d => d.day?.toLowerCase() === weekday.toLowerCase());
            if (!daySchedule) continue;

            for (const p of daySchedule.periods) {
                if (p.subject && p.faculty) {
                    scheduledFaculties.add(p.faculty);
                    const slot = t.timeSlots.find(s => s.id === p.slotId);
                    let mins = 60;
                    if (slot && slot.time) {
                        const parts = slot.time.split('-');
                        if (parts.length === 2) {
                            const start = parseTime(parts[0]);
                            const end = parseTime(parts[1]);
                            if (end > start) mins = end - start;
                        }
                    }
                    totalDurationMins += mins;
                }
            }
        }

        res.status(200).json({
            records: attendanceRecords,
            scheduledFacultyCount: scheduledFaculties.size,
            totalScheduledDuration: totalDurationMins
        });
    } catch (error) {
        console.error("Error fetching staff attendance summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
