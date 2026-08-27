const Timetable = require("../models/Timetable");

exports.getTimetable = async (req, res) => {
    try {
        const { branch, semester, section } = req.query;
        if (!branch || !semester || !section) {
            return res.status(400).json({ message: "Branch, semester, and section required" });
        }

        const timetable = await Timetable.findOne({ branch, semester, section });
        if (!timetable) {
            return res.json({ message: "No timetable found", schedule: [], timeSlots: [] });
        }

        res.json({ schedule: timetable.schedule, timeSlots: timetable.timeSlots });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.saveTimetable = async (req, res) => {
    try {
        const { branch, semester, section, schedule, timeSlots } = req.body;
        if (!branch || !semester || !section || !schedule || !timeSlots) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let timetable = await Timetable.findOne({ branch, semester, section });

        if (!timetable) {
            timetable = new Timetable({ branch, semester, section, schedule, timeSlots });
        } else {
            timetable.schedule = schedule;
            timetable.timeSlots = timeSlots;
        }

        await timetable.save();
        res.json({ message: "Timetable saved successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadTimetable = async (req, res) => {
    try {
        // Very basic dummy upload handler since frontend doesn't actually process 
        // real files right now and expects data in return.
        // Ideally use multer to parse the file and read it.
        res.json({ message: "Uploaded but file parsing disabled", schedule: null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
