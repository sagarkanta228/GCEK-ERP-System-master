const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String, // 'Principal', 'Dean', 'HOD', 'Faculty'
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    recipients: [{
        type: String // 'All', 'Faculty', 'Student', 'HOD', 'Dean', 'Principal'
    }],
    targetBranches: [{
        type: String,
        default: ['All']
    }],
    targetSemesters: [{
        type: String,
        default: ['All']
    }],
    type: {
        type: String,
        enum: ['Notice', 'Memo', 'Message'],
        default: 'Notice'
    },
    attachments: [{
        name: String,
        url: String
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
