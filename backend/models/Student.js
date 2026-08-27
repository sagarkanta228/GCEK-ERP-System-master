const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    regdNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
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
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phoneNumber: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    lastAttendance: { type: Date },
    section: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
