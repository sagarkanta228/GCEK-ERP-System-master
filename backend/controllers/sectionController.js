const Section = require("../models/Section");

exports.getSections = async (req, res) => {
    try {
        const { branch, semester } = req.query;
        if (!branch || !semester) {
            return res.status(400).json({ message: "Branch and semester required" });
        }

        let sectionDoc = await Section.findOne({ branch, semester });
        if (!sectionDoc) {
            return res.json({ sections: ["A"] });
        }

        res.json({ sections: sectionDoc.sections });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.saveSections = async (req, res) => {
    try {
        const { branch, semester, sections } = req.body;
        if (!branch || !semester || !sections) {
            return res.status(400).json({ message: "Branch, semester, and sections required" });
        }

        let sectionDoc = await Section.findOne({ branch, semester });
        if (!sectionDoc) {
            sectionDoc = new Section({ branch, semester, sections });
        } else {
            sectionDoc.sections = sections;
        }

        await sectionDoc.save();
        res.json({ message: "Sections saved successfully", sections: sectionDoc.sections });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
