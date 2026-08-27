const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const AttendanceExtension = require('../models/AttendanceExtension');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Central function to check for missed attendances
exports.checkMissingAttendances = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });

        // Get all timetables
        const timetables = await Timetable.find();
        
        const missedFaculties = new Set();
        let checkedClasses = 0;

        for (const t of timetables) {
            const daySchedule = t.schedule?.find(day => day.day?.toLowerCase() === weekday.toLowerCase());
            if (!daySchedule) continue;

            for (const p of daySchedule.periods) {
                if (p.subject && p.faculty) {
                    checkedClasses++;
                    // Find actual faculty by name or ID. Usually Timetable period.faculty stores faculty name
                    const facultyUser = await User.findOne({ name: p.faculty, role: { $regex: /faculty/i } });
                    if (!facultyUser) continue;

                    // Check if they submitted attendance for this class today
                    const att = await Attendance.findOne({
                        subject: p.subject,
                        branch: t.branch,
                        semester: t.semester,
                        date: { $gte: today, $lt: new Date(today.getTime() + 24*60*60*1000) }
                    });

                    if (!att) {
                        missedFaculties.add(facultyUser._id.toString());
                    }
                }
            }
        }

        // For each missed faculty, generate an ExtensionRequest and a Notification to Principal
        const missedArr = Array.from(missedFaculties);
        let createdRequests = 0;

        for (const facultyId of missedArr) {
            const existingExt = await AttendanceExtension.findOne({ facultyId, date: today });
            if (!existingExt) {
                await AttendanceExtension.create({
                    facultyId,
                    date: today,
                    status: 'Pending',
                    scheduledDuration: 0 // Could calculate total duration here if needed
                });
                createdRequests++;

                const facUser = await User.findById(facultyId);
                
                // Notify Principal
                await Notification.create({
                    recipient: 'All_Principals', // Assumes frontend logic handles this recipient
                    title: 'Missed Attendance Deadline',
                    message: `Faculty ${facUser ? facUser.name : facultyId} missed the 6 PM deadline for student attendance today. React to allow or reject retroactive submission.`,
                    type: 'SYSTEM'
                });
            }
        }

        res.status(200).json({ 
            message: "Missing attendance check completed.", 
            checkedClasses,
            facultiesMissed: createdRequests 
        });

    } catch (error) {
        console.error("Error checking missing attendances:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all extensions for Principal
exports.getPendingExtensions = async (req, res) => {
    try {
        const extensions = await AttendanceExtension.find({ status: 'Pending' })
            .populate('facultyId', 'name department')
            .sort({ createdAt: -1 });
        
        res.status(200).json(extensions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching extensions" });
    }
};

// Resolve an extension request
exports.resolveExtension = async (req, res) => {
    try {
        const { extensionId, status } = req.body; // status: 'Approved' | 'Rejected'
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const ext = await AttendanceExtension.findByIdAndUpdate(extensionId, { status }, { new: true });
        if (!ext) return res.status(404).json({ message: "Request not found" });

        // Notify faculty
        const facUser = await User.findById(ext.facultyId);
        if (facUser) {
            await Notification.create({
                recipient: 'All', // or specifically facultyUser.email / regdNo equivalent
                title: `Attendance Request ${status}`,
                message: `Your request to submit retroactive attendance for ${new Date(ext.date).toLocaleDateString()} has been ${status}.`,
                type: 'SYSTEM'
            });
        }

        res.status(200).json({ message: `Extension ${status}`, extension: ext });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
