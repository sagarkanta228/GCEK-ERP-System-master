const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    regdNo: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false // false for Absent, true for Present
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    records: [attendanceRecordSchema]
}, { timestamps: true });

// Compound index to ensure only one attendance record per class per date
attendanceSchema.index({ facultyId: 1, subject: 1, branch: 1, semester: 1, section: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
