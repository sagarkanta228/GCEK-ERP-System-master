const User = require("../models/User");
const { adminCreateUserHelper } = require("./authController");

exports.getUsers = async (req, res) => {
    try {
        const { role, department } = req.query;
        let query = {};
        if (role) {
            query.role = role;
        }
        if (department) {
            query.department = department;
        }

        const users = await User.find(query).select("-password -otp -otpExpires");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignFacultyRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedRole, teachingAssignments, designation, department, qualification } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (assignedRole !== undefined) user.assignedRole = assignedRole;
        if (teachingAssignments !== undefined) user.teachingAssignments = teachingAssignments;
        if (designation !== undefined) user.designation = designation;
        if (department !== undefined) user.department = department;
        if (qualification !== undefined) user.qualification = qualification;

        await user.save();
        res.json({ message: "Faculty details updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * PATCH /api/users/:id/profile
 * Allows a user to update only their editable profile fields:
 * phone, bio, profileImage
 * Non-editable fields (name, email, role, department, semester) are ignored.
 */
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, bio, profileImage } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();
        res.json({
            message: "Profile updated successfully",
            phone: user.phone,
            bio: user.bio,
            profileImage: user.profileImage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adminCreateUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await adminCreateUserHelper(userData);
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.bulkImportUsers = async (req, res) => {
    try {
        const { users } = req.body;
        if (!users || !Array.isArray(users)) {
            return res.status(400).json({ message: "Invalid users data" });
        }

        const results = [];
        for (const userData of users) {
            const user = await adminCreateUserHelper(userData);
            results.push(user);
        }

        res.status(201).json({ message: `${results.length} users imported successfully`, count: results.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

