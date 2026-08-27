const mongoose = require('mongoose');

const LeaveApplicationSchema = new mongoose.Schema({
    applicantId: { type: String, required: true }, // regdNo for students, _id for faculty
    applicantName: { type: String, required: true },
    applicantRole: { type: String, required: true, enum: ['Student', 'Faculty', 'HOD', 'Dean', 'Principal', 'Registrar'], default: 'Student' },
    branch: { type: String, required: true },
    semester: { type: String }, // Optional for faculty
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number, required: true },
    category: { type: String, required: true, enum: ['no', 'yes', 'official'] }, // matches personal/casual, medical, and official
    specialRecognition: { type: String, default: 'none' },
    purpose: { type: String, required: true, maxlength: 200 },
    documentUrl: { type: String, required: true }, // URL path to uploaded PDF
    status: {
        type: String,
        enum: ['Pending_HOD', 'Pending_Dean', 'Pending_Registrar', 'Pending_Principal', 'Approved', 'Rejected'],
        default: 'Pending_HOD'
    },
    rejectionReason: { type: String },
    appliedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaveApplication', LeaveApplicationSchema);
