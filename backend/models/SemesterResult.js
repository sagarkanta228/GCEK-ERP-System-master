const mongoose = require('mongoose');

const semesterResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    sgpa: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    backlogs: {
        type: Number,
        default: 0
    },
    marksheetUrl: {
        type: String, // Path to the uploaded PDF/Image
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Pending'],
        default: 'Pass'
    }
}, { timestamps: true });

// A student can only have one summary result per semester
semesterResultSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('SemesterResult', semesterResultSchema);
