const mongoose = require("mongoose");

const classSessionSchema = new mongoose.Schema(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        branch: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },

        topic: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            default: "Completed",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ClassSession", classSessionSchema);
