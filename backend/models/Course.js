const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    faculty: {
        type: String,
        required: true,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 1
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    // Optional fields for progress and styling currently static on frontend but good to have
    color: {
        type: String,
        default: 'bg-blue-500'
    },
    lightColor: {
        type: String,
        default: 'bg-blue-500/10'
    },
    textColor: {
        type: String,
        default: 'text-blue-500'
    }
}, { timestamps: true });

// Prevent duplicate course codes in the same department and semester
courseSchema.index({ code: 1, department: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
