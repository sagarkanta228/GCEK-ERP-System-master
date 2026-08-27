const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    facultyId: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    section: {
        type: String,
        default: ""
    },
    examType: {
        type: String,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    records: [{
        regdNo: {
            type: String,
            required: true
        },
        marksObtained: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model('Result', resultSchema);
