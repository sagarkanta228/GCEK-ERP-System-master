const mongoose = require('mongoose');

const feedbackResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeedbackForm',
        required: true
    },
    studentRegdNo: {
        // Stored to prevent double submission, but will NOT be returned in API when fetching responses
        type: String,
        required: true
    },
    answers: [{
        question: String,
        answer: String
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

feedbackResponseSchema.index({ formId: 1, studentRegdNo: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackResponse', feedbackResponseSchema);
