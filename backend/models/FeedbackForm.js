const mongoose = require('mongoose');

const feedbackFormSchema = new mongoose.Schema({
    facultyId: {
        type: String,
        required: true
    },
    facultyBranch: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: [{
        text: { type: String, required: true },
        type: { type: String, default: 'rating' }
    }],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FeedbackForm', feedbackFormSchema);
