const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    leaveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaveApplication',
        default: null
    },
    recipient: {
        type: String, // 'all' or student regdNo
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'SYSTEM'
    },
    semester: {
        type: String,
        default: 'all'
    },
    branch: {
        type: String,
        default: 'all'
    },
    readBy: [{
        type: String // array of student regdNo who have read this notification
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
