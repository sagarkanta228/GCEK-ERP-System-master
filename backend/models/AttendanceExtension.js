const mongoose = require('mongoose');

const attendanceExtensionSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    scheduledDuration: {
        type: Number, // duration in minutes
        default: 0
    }
}, { timestamps: true });

// Ensure unique combination per faculty per day
attendanceExtensionSchema.index({ facultyId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceExtension', attendanceExtensionSchema);
