const Notice = require('../models/Notice');
const User = require('../models/User');

// Create a new notice
exports.createNotice = async (req, res) => {
    try {
        const { title, content, recipients, targetBranches, targetSemesters, type, attachments } = req.body;
        const sender = req.user.id;
        const senderRole = req.user.role;

        // Validation of recipients based on sender role
        const allowedRecipients = {
            'Principal': ['Faculty', 'Student', 'HOD', 'Dean', 'Principal', 'All'],
            'Dean': ['HOD', 'Faculty', 'Student', 'Principal', 'All'],
            'HOD': ['Faculty', 'Student', 'Principal'],
            'Faculty': ['HOD', 'Student']
        };

        if (sender === 'null' || !sender) {
            return res.status(401).json({ message: "Invalid user session. Please log in again." });
        }

        if (senderRole === 'Student' || !['Principal', 'Dean', 'HOD', 'Faculty'].includes(senderRole)) {
            return res.status(403).json({ 
                message: `User with role ${senderRole} is not allowed to send notices.`,
                debug_role: senderRole
            });
        }

        const senderAllowed = allowedRecipients[senderRole] || [];
        const invalidRecipients = recipients.filter(r => !senderAllowed.includes(r) && r !== 'All');

        if (invalidRecipients.length > 0 && senderRole !== 'Admin') {
            return res.status(403).json({ 
                message: `You are not allowed to send notices to: ${invalidRecipients.join(', ')}` 
            });
        }

        const newNotice = new Notice({
            sender,
            senderRole,
            title,
            content,
            recipients,
            targetBranches: targetBranches && targetBranches.length > 0 ? targetBranches : ['All'],
            targetSemesters: targetSemesters && targetSemesters.length > 0 ? targetSemesters : ['All'],
            type: type || 'Notice',
            attachments: attachments || []
        });

        await newNotice.save();
        res.status(201).json({ success: true, data: newNotice });
    } catch (error) {
        console.error("Create Notice Error Details:", {
            error: error.message,
            stack: error.stack,
            body: req.body,
            user: req.user
        });
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get notices for the logged-in user
exports.getNotices = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let userBranch = req.user.department || req.user.branch;

        // Fallback for Faculty who might only have branch in teachingAssignments
        if (!userBranch && req.user.teachingAssignments?.length > 0) {
            userBranch = req.user.teachingAssignments[0].branch;
        }

        const userSemester = req.user.semester;

        const targetCriteria = {
            $or: [
                { recipients: 'All' },
                { recipients: userRole },
                { sender: userId }
            ]
        };

        let query = {};

        // If departmental staff or student, add department/branch restriction
        if (['HOD', 'Faculty', 'Student'].includes(userRole)) {
            const departmentalAnd = {
                $and: [
                    targetCriteria,
                    { targetBranches: { $in: ['All', userBranch] } }
                ]
            };

            if (userRole === 'Student' && userSemester) {
                departmentalAnd.$and.push({ targetSemesters: { $in: ['All', userSemester] } });
            }
            
            query = departmentalAnd;
        } else {
            // Admin/Principal/Dean see everything in the system
            // We use an empty query to fetch all, but ensure it's not restricted
            query = {};
        }



        const notices = await Notice.find(query)
            .populate('sender', 'fullName profileImage')
            .sort({ createdAt: -1 });

        // Add isRead status
        const noticesWithStatus = notices.map(notice => {
            const noticeObj = notice.toObject();
            noticeObj.isRead = notice.readBy.includes(userId);
            return noticeObj;
        });

        res.status(200).json({ success: true, data: noticesWithStatus });
    } catch (error) {
        console.error("Get Notices Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark notice as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        if (!notice.readBy.includes(userId)) {
            notice.readBy.push(userId);
            await notice.save();
        }

        res.status(200).json({ message: "Notice marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a notice
exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        // Only the sender can delete their notice (or Admin)
        if (notice.sender.toString() !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Not authorized to delete this notice" });
        }

        await Notice.findByIdAndDelete(id);
        res.status(200).json({ message: "Notice deleted successfully" });
    } catch (error) {
        console.error("Delete Notice Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
