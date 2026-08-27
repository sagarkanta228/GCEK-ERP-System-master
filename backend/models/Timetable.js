const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
    id: String,
    time: String,
    label: String,
    isBreak: Boolean,
});

const periodSchema = new mongoose.Schema({
    slotId: String,
    time: String,
    subject: String,
    room: String,
    faculty: String,
});

const daySchema = new mongoose.Schema({
    day: String,
    periods: [periodSchema],
});

const timetableSchema = new mongoose.Schema(
    {
        branch: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
        section: {
            type: String,
            required: true,
        },
        timeSlots: [slotSchema],
        schedule: [daySchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
