const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        branch: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
        sections: {
            type: [String],
            default: ["A"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);
