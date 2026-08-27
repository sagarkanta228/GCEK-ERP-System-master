const LeaveApplication = require('../models/LeaveApplication');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save in backend/uploads directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'leave-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only accept PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
exports.uploadMiddleware = upload.single('document');

// Apply for leave (Student)
exports.applyLeave = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Document upload (PDF) is mandatory.' });
        }

        const { applicantId, applicantName, applicantRole, branch, semester, startDate, endDate, category, specialRecognition, purpose } = req.body;

        // Calculate duration on backend just to be safe
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start and end date

        const documentUrl = `/uploads/${req.file.filename}`;

        // 1. Determine Initial Status and Notification Recipient
        let initialStatus = 'Pending_HOD';
        let initialRecipient = 'HOD';

        if (applicantRole === 'Dean' || applicantRole === 'Registrar') {
            initialStatus = 'Pending_Principal';
            initialRecipient = 'Principal';
        } else if (applicantRole === 'HOD') {
            initialStatus = 'Pending_Registrar';
            initialRecipient = 'Registrar';
        }

        const leaveApp = new LeaveApplication({
            applicantId,
            applicantName,
            applicantRole: applicantRole || 'Student',
            branch,
            semester,
            startDate: start,
            endDate: end,
            durationDays,
            category: category || 'no',
            specialRecognition: specialRecognition || 'none',
            purpose,
            documentUrl,
            status: initialStatus
        });

        await leaveApp.save();

        // 2. Send initial notifications
        try {
            // Notify Approver
            await Notification.create({
                leaveId: leaveApp._id,
                recipient: initialRecipient, 
                title: `New Leave Application (${applicantRole})`,
                message: `${applicantName} applied for ${durationDays} days leave.`,
                type: 'LEAVE',
                branch: initialRecipient === 'HOD' ? branch : undefined
            });

            // Notify Applicant
            await Notification.create({
                leaveId: leaveApp._id,
                recipient: applicantId, 
                title: `Leave Application Submitted`,
                message: `Your leave application has been submitted and is pending with the ${initialRecipient}.`,
                type: 'LEAVE_INFO'
            });
        } catch (err) {
            console.error("Notif error", err);
        }

        res.status(201).json({ message: 'Leave application submitted successfully', leaveApp });
    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's own leaves (Student or Faculty)
exports.getStudentLeaves = async (req, res) => {
    try {
        const { regdNo } = req.params; // This parameter name is kept for route consistency but handles both
        const leaves = await LeaveApplication.find({ applicantId: regdNo }).sort({ appliedOn: -1 });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending leaves for authorities
exports.getPendingLeaves = async (req, res) => {
    try {
        const { role, branch } = req.query; // role can be 'HOD', 'Dean', 'Principal'

        let statusFilter = '';
        let query = {};

        if (role === 'HOD') {
            statusFilter = 'Pending_HOD';
            query = { status: statusFilter };
            if (branch) query.branch = branch; // HOD only sees their branch
        } else if (role === 'Dean') {
            statusFilter = 'Pending_Dean';
            query = { status: statusFilter };
        } else if (role === 'Registrar') {
            statusFilter = 'Pending_Registrar';
            query = { status: statusFilter };
        } else if (role === 'Principal') {
            statusFilter = 'Pending_Principal';
            query = { status: statusFilter };
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        const leaves = await LeaveApplication.find(query).sort({ appliedOn: 1 });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update leave status (Approve/Reject)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, role, reason } = req.body; // action: 'approve' | 'reject'

        const leaveApp = await LeaveApplication.findById(id);
        if (!leaveApp) return res.status(404).json({ message: 'Application not found' });

        if (action === 'reject') {
            leaveApp.status = 'Rejected';
            leaveApp.rejectionReason = reason || 'Rejected by ' + role;
            await leaveApp.save();

            // Notify Applicant
            await Notification.create({
                leaveId: leaveApp._id,
                recipient: leaveApp.applicantId,
                title: 'Leave Application Rejected',
                message: `Your leave application has been rejected by ${role}.`,
                type: 'LEAVE_REJECT'
            });

            // Special: If Registrar rejects faculty leave, notify Dean
            if (role === 'Registrar' && leaveApp.applicantRole === 'Faculty') {
                await Notification.create({
                    leaveId: leaveApp._id,
                    recipient: 'Dean',
                    title: 'Faculty Leave Rejected',
                    message: `Registrar rejected leave application for ${leaveApp.applicantName}.`,
                    type: 'LEAVE_INFO'
                });
            }

            return res.status(200).json({ message: 'Leave rejected.', leaveApp });
        }

        if (action === 'approve') {
            const oldStatus = leaveApp.status;
            let nextStatus = '';

            if (role === 'HOD' && leaveApp.status === 'Pending_HOD') {
                if (leaveApp.applicantRole === 'Student') {
                    nextStatus = 'Pending_Dean';
                } else {
                    nextStatus = 'Pending_Registrar';
                    // INFO Notification for Dean during Faculty Flow
                    await Notification.create({
                        leaveId: leaveApp._id,
                        recipient: 'Dean',
                        title: 'Faculty Leave Info',
                        message: `${leaveApp.applicantName}'s leave application (HOD Approved) has moved to Registrar for Audit.`,
                        type: 'LEAVE_INFO'
                    });
                }
            } else if (role === 'Dean' && leaveApp.status === 'Pending_Dean') {
                nextStatus = 'Pending_Principal';
            } else if (role === 'Registrar' && leaveApp.status === 'Pending_Registrar') {
                nextStatus = 'Pending_Principal';
            } else if (role === 'Principal' && leaveApp.status === 'Pending_Principal') {
                nextStatus = 'Approved';
            } else {
                return res.status(400).json({ message: 'Invalid state transition.' });
            }

            leaveApp.status = nextStatus;
            await leaveApp.save();

            // 1. Notify Applicant of Approval at current level
            await Notification.create({
                leaveId: leaveApp._id,
                recipient: leaveApp.applicantId,
                title: `Leave Approved by ${role}`,
                message: nextStatus === 'Approved' 
                    ? 'Your leave application has been fully accepted.' 
                    : `Your leave application has been approved by ${role} and moved to ${nextStatus.split('_')[1]}.`,
                type: nextStatus === 'Approved' ? 'LEAVE_APPROVE' : 'LEAVE_INFO'
            });

            // 2. Notify Next Authority in Chain
            if (nextStatus !== 'Approved') {
                const nextAuthority = nextStatus.split('_')[1]; // Dean, Registrar, or Principal
                await Notification.create({
                    leaveId: leaveApp._id,
                    recipient: nextAuthority,
                    title: `New Leave Approval Required (${leaveApp.applicantRole})`,
                    message: `${leaveApp.applicantName}'s leave application approved by ${role}. Your approval is now required.`,
                    type: 'LEAVE',
                    branch: nextAuthority === 'HOD' ? leaveApp.branch : undefined
                });
            }

            return res.status(200).json({ message: 'Leave approved successfully.', leaveApp });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single leave application by ID
exports.getLeaveById = async (req, res) => {
    try {
        const leave = await LeaveApplication.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave application not found' });
        res.status(200).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
