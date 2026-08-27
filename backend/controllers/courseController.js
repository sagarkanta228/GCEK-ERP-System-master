const Course = require('../models/Course');

// @desc    Get all courses for a specific department and semester
// @route   GET /api/courses
// @access  Public (or protected depending on auth middleware, going with public for now based on current app structure)
exports.getCourses = async (req, res) => {
    try {
        const { department, semester } = req.query;
        let query = {};

        if (department) {
            // Robust department mapping
            const deptMap = {
                'cse': ['CSE', 'Computer Science & Engineering', 'Computer Science Engineering', 'Computer Science and Engineering'],
                'computer science & engineering': ['CSE', 'Computer Science & Engineering', 'Computer Science Engineering', 'Computer Science and Engineering'],
                'computer science engineering': ['CSE', 'Computer Science & Engineering', 'Computer Science Engineering', 'Computer Science and Engineering'],
                'me': ['ME', 'Mechanical Engineering'],
                'mechanical engineering': ['ME', 'Mechanical Engineering'],
                'ee': ['EE', 'Electrical Engineering'],
                'electrical engineering': ['EE', 'Electrical Engineering'],
                'ce': ['CE', 'Civil Engineering'],
                'civil engineering': ['CE', 'Civil Engineering'],
                'mme': ['MME', 'Metallurgical & Materials Engineering', 'Metallurgical and Materials Engineering'],
                'metallurgical & materials engineering': ['MME', 'Metallurgical & Materials Engineering', 'Metallurgical and Materials Engineering']
            };

            const normalizedInput = department.toLowerCase().trim();
            const allowedDepts = deptMap[normalizedInput] || [department];

            // Match exactly against any of the variants, or fallback to regex
            query.$or = [
                { department: { $in: allowedDepts } },
                { department: { $regex: new RegExp(department.replace(/&/gi, '').replace(/and/gi, '').replace(/\\s+/g, ' ').trim().split(' ').join('.*'), 'i') } }
            ];
        }
        if (semester) query.semester = semester;

        const courses = await Course.find(query).sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Protected (HOD)
exports.createCourse = async (req, res) => {
    try {
        const { code, name, faculty, credits, department, semester, color, lightColor, textColor } = req.body;

        // Check if course code already exists for this dept/sem
        const existingCourse = await Course.findOne({ code, department, semester });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course code already exists for this department and semester.' });
        }

        const course = new Course({
            code,
            name,
            faculty,
            credits,
            department,
            semester,
            color,
            lightColor,
            textColor
        });

        const savedCourse = await course.save();

        // Notify students of the new course
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: 'all',
                title: 'New Course Added',
                message: `${name} (${code}) has been added to your curriculum by the HOD.`,
                type: 'ACADEMIC',
                semester: semester,
                branch: department
            });
        } catch (notifErr) {
            console.error("Error creating course notification:", notifErr);
        }

        res.status(201).json(savedCourse);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: 'Server error creating course' });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Protected (HOD)
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: 'Server error updating course' });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Protected (HOD)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.deleteOne();
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: 'Server error deleting course' });
    }
};
