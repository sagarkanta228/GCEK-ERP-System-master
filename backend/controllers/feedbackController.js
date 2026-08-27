const FeedbackForm = require('../models/FeedbackForm');
const FeedbackResponse = require('../models/FeedbackResponse');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Create a new feedback form (Faculty)
exports.createForm = async (req, res) => {
    try {
        const { facultyId, facultyBranch, title, description, questions } = req.body;

        if (!facultyId || !title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const form = new FeedbackForm({
            facultyId,
            facultyBranch,
            title,
            description,
            questions: questions.filter(q => q.text && q.text.trim() !== '')
        });

        await form.save();
        res.status(201).json({ message: 'Form created successfully', form });
    } catch (error) {
        console.error('Error creating feedback form:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Publish a feedback form (Faculty)
exports.publishForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await FeedbackForm.findByIdAndUpdate(formId, { status: 'Published' }, { new: true });

        if (!form) return res.status(404).json({ message: 'Form not found' });

        res.status(200).json({ message: 'Form published successfully', form });
    } catch (error) {
        console.error('Error publishing form:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get forms for a specific faculty (Faculty)
exports.getFacultyForms = async (req, res) => {
    try {
        const { facultyId } = req.params;
        // Fetch forms 
        const forms = await FeedbackForm.find({ facultyId }).sort({ createdAt: -1 });

        // Fetch response counts for each form
        const formsWithCounts = await Promise.all(forms.map(async (form) => {
            const count = await FeedbackResponse.countDocuments({ formId: form._id });
            return {
                ...form._doc,
                responseCount: count
            };
        }));

        res.status(200).json(formsWithCounts);
    } catch (error) {
        console.error('Error fetching faculty forms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all forms for a branch (HOD)
exports.getBranchForms = async (req, res) => {
    try {
        const { branch } = req.params;
        const forms = await FeedbackForm.find({ facultyBranch: branch }).sort({ createdAt: -1 });

        const formsWithCounts = await Promise.all(forms.map(async (form) => {
            const count = await FeedbackResponse.countDocuments({ formId: form._id });
            return {
                ...form._doc,
                responseCount: count
            };
        }));

        res.status(200).json(formsWithCounts);
    } catch (error) {
        console.error('Error fetching branch forms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get anonymous responses for a specific form (Faculty)
exports.getFormResponses = async (req, res) => {
    try {
        const { formId } = req.params;
        // Notice we DO NOT select studentRegdNo to maintain anonymity
        const responses = await FeedbackResponse.find({ formId }).select('-studentRegdNo');
        res.status(200).json(responses);
    } catch (error) {
        console.error('Error fetching form responses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get published forms for a student branch (Student)
exports.getStudentForms = async (req, res) => {
    try {
        const { branch } = req.query; // e.g. CSE
        if (!branch) return res.status(400).json({ message: 'Branch is required' });

        const forms = await FeedbackForm.find({
            facultyBranch: branch,
            status: 'Published'
        }).sort({ createdAt: -1 });

        res.status(200).json(forms);
    } catch (error) {
        console.error('Error fetching student forms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if student already submitted (Student)
exports.checkSubmission = async (req, res) => {
    try {
        const { formId, studentRegdNo } = req.query;
        if (!formId || !studentRegdNo) return res.status(400).json({ message: 'Missing ids' });
        const existing = await FeedbackResponse.findOne({ formId, studentRegdNo });
        res.status(200).json({ submitted: !!existing });
    } catch (error) {
        console.error('Error checking submission:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit a form response (Student)
exports.submitResponse = async (req, res) => {
    try {
        const { formId, studentRegdNo, answers } = req.body;

        if (!formId || !studentRegdNo || !answers) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if already submitted
        const existing = await FeedbackResponse.findOne({ formId, studentRegdNo });
        if (existing) {
            return res.status(400).json({ message: 'You have already submitted feedback for this form.' });
        }

        const response = new FeedbackResponse({
            formId,
            studentRegdNo,
            answers
        });

        await response.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback response:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a form response (Student)
exports.deleteSubmission = async (req, res) => {
    try {
        const { formId, studentRegdNo } = req.query;

        if (!formId || !studentRegdNo) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const response = await FeedbackResponse.findOneAndDelete({ formId, studentRegdNo });

        if (!response) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.status(200).json({ message: 'Feedback submission deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback response:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a feedback form (HOD or Creator)
exports.deleteForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const { role, assignedRole, userId } = req.query;

        const isHOD = role === 'HOD' || (assignedRole && assignedRole.includes('HOD'));
        
        const form = await FeedbackForm.findById(formId);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Allow if HOD OR if the user is the creator
        if (!isHOD && form.facultyId !== userId) {
            return res.status(403).json({ message: 'Access denied: Only HOD or the creator can delete this form' });
        }

        await FeedbackForm.findByIdAndDelete(formId);

        // Also delete associated responses
        await FeedbackResponse.deleteMany({ formId });

        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get performance metrics for all faculty (Principal view)
exports.getFacultyPerformanceMetrics = async (req, res) => {
    try {
        const { branch } = req.query;
        let query = { role: { $regex: /faculty/i } };
        if (branch) query.department = branch;

        const facultyList = await User.find(query).select('fullName role department teachingAssignments');
        
        const metrics = await Promise.all(facultyList.map(async (fac) => {
            // 1. Calculate Ratings from Feedback
            const forms = await FeedbackForm.find({ facultyId: fac._id });
            const formIds = forms.map(f => f._id);
            const responses = await FeedbackResponse.find({ formId: { $in: formIds } });

            let totalScore = 0;
            let totalQuestions = 0;

            responses.forEach(resp => {
                resp.answers.forEach(ans => {
                    // Assuming star ratings are stored as numbers 1-5
                    if (typeof ans.answer === 'number') {
                        totalScore += ans.answer;
                        totalQuestions++;
                    } else if (!isNaN(parseInt(ans.answer))) {
                        totalScore += parseInt(ans.answer);
                        totalQuestions++;
                    }
                });
            });

            const avgRating = totalQuestions > 0 ? (totalScore / totalQuestions).toFixed(1) : "N/A";

            // 2. Count Classes Taken from Attendance
            const classesTaken = await Attendance.countDocuments({ facultyId: fac._id });

            // 3. Determine Status
            let status = 'Standard';
            if (avgRating >= 4.5) status = 'Outstanding';
            else if (avgRating >= 4.0) status = 'Excellent';
            else if (avgRating >= 3.0) status = 'Good';
            else if (avgRating !== "N/A") status = 'Needs Improvement';

            return {
                id: fac._id,
                name: fac.fullName,
                role: fac.role,
                dept: fac.department || "General",
                rating: avgRating,
                classes: classesTaken,
                status
            };
        }));

        res.status(200).json(metrics);
    } catch (error) {
        console.error('Error fetching faculty metrics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
