const ClassSession = require("../models/ClassSession");

exports.getSessions = async (req, res) => {
    try {
        const { facultyId, subject, branch, semester } = req.query;

        if (!facultyId || !subject) {
            return res.status(400).json({ message: "FacultyId and subject are required" });
        }

        const sessions = await ClassSession.find({
            facultyId,
            subject,
            ...(branch && { branch }),
            ...(semester && { semester })
        }).sort({ date: -1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addSession = async (req, res) => {
    try {
        const { facultyId, subject, branch, semester, topic, date } = req.body;

        if (!facultyId || !subject || !topic) {
            return res.status(400).json({ message: "facultyId, subject, and topic are required" });
        }

        const newSession = new ClassSession({
            facultyId,
            subject,
            branch,
            semester,
            topic,
            date: date ? new Date(date) : new Date()
        });

        await newSession.save();
        res.status(201).json({ message: "Session added successfully", session: newSession });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { facultyId, topic, date } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Session id is required" });
        }

        const session = await ClassSession.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Optional: ensure only the faculty who created the session can edit it
        if (facultyId && session.facultyId.toString() !== facultyId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this session" });
        }

        if (topic !== undefined) session.topic = topic;
        if (date !== undefined) session.date = new Date(date);

        await session.save();
        res.json({ message: "Session updated successfully", session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { facultyId } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Session id is required" });
        }

        const session = await ClassSession.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Optional: ensure only the faculty who created the session can delete it
        if (facultyId && session.facultyId.toString() !== facultyId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this session" });
        }

        await session.deleteOne();
        res.json({ message: "Session deleted successfully", id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
