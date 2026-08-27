const Timetable = require('../models/Timetable');

const getScheduledDuration = async (branch, semester, section, subject, date) => {
    try {
        const query = { branch, semester };
        if (section) query.section = section;
        else query.section = { $in: ["", null, undefined] };
        
        const targetDate = new Date(date);
        const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

        const timetable = await Timetable.findOne(query);
        if (!timetable) return 60; // default 60 mins

        const daySchedule = timetable.schedule.find(d => d.day?.toLowerCase() === weekday.toLowerCase());
        if (!daySchedule) return 60;

        let totalMins = 0;
        daySchedule.periods.forEach(p => {
            if (p.subject && p.subject.toLowerCase() === subject.toLowerCase()) {
                // Find slot
                const slot = timetable.timeSlots.find(s => s.id === p.slotId);
                if (slot && slot.time) {
                    // example time: "10:00 - 11:00 AM" or "10:00-11:00"
                    const parts = slot.time.split('-');
                    if (parts.length === 2) {
                        const start = parseTime(parts[0]);
                        const end = parseTime(parts[1]);
                        if (end > start) totalMins += (end - start);
                        else totalMins += 60;
                    } else {
                        totalMins += 60;
                    }
                } else {
                    totalMins += 60;
                }
            }
        });

        return totalMins > 0 ? totalMins : 60;
    } catch (e) {
        return 60;
    }
};

const parseTime = (timeStr) => {
    // Basic parser for "10:00 AM" or "14:30"
    let [time, modifier] = timeStr.trim().split(' ');
    if (!time) return 0;
    let [hours, mins] = time.split(':');
    hours = parseInt(hours, 10) || 0;
    mins = parseInt(mins, 10) || 0;
    
    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + mins;
};

module.exports = { getScheduledDuration, parseTime };
