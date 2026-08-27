const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave'],
        default: 'Present'
    },
    verificationImage: {
        type: String, // Store base64 or URL
        default: null
    },
    verificationStatus: {
        type: String,
        enum: ['Verified', 'Pending', 'Rejected'],
        default: 'Pending'
    },
    metadata: {
        backgroundDetected: String,
        faceMatched: Boolean,
        timestamp: { type: Date, default: Date.now }
    }
}, { timestamps: true });

// Ensure only one record per staff per day
staffAttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
