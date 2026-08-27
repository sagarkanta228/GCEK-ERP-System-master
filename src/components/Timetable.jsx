import React, { useState, useEffect } from "react";
import { Upload, Save, Edit, FileText, Check, X, Loader, Plus, Trash, Settings, MoreVertical } from "lucide-react";
import { useUser } from "../context/UserContext";

const Timetable = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("CSE");
    const [selectedSemester, setSelectedSemester] = useState("6th Semester");
    const [selectedSection, setSelectedSection] = useState("A");
    const [availableSections, setAvailableSections] = useState(["A"]);
    const [newSectionName, setNewSectionName] = useState("");
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState(null); // Track which slot is being edited

    // Configurable time slots default
    const defaultTimeSlots = [
        { id: "p1", time: "09:35 - 10:25", label: "Period 1" },
        { id: "p2", time: "10:25 - 11:15", label: "Period 2" },
        { id: "break1", time: "11:15 - 11:30", label: "Short Break", isBreak: true },
        { id: "p3", time: "11:30 - 12:20", label: "Period 3" },
        { id: "p4", time: "12:20 - 01:10", label: "Period 4" },
        { id: "lunch", time: "01:10 - 02:45", label: "Lunch Break", isBreak: true },
        { id: "lab", time: "02:45 - 05:15", label: "Lab / Practical" }
    ];

    const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);

    // Initial empty structure helper
    const createEmptySchedule = (slots) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days.map(day => ({
            day,
            periods: slots.map(s => ({
                slotId: s.id,
                time: s.time,
                subject: "",
                room: "",
                faculty: ""
            }))
        }));
    };

    // Everyone can change semesters and sections to view other schedules
    const canChangeFilters = true;

    // Check if user is HOD/Dean and set their branch
    const isHodOrDean = user?.accessInfo?.tier && ['Hod Portal', 'Dean Portal', 'Principal Portal'].includes(user.accessInfo.tier);
    const userRole = user?.role || "";

    // Faculty with TimeTable Management assignment: branch-scoped editor
    // They can only view/edit their OWN department's timetable
    const deptMap = {
        "Computer Science & Engineering": "CSE",
        "Electronics & Communication": "ECE",
        "Mechanical Engineering": "ME",
        "Electrical Engineering": "EE",
        "Civil Engineering": "CE",
        "Mining Engineering": "MinE",
        "CSE": "CSE",
        "ECE": "ECE",
        "ME": "ME",
        "EE": "EE",
        "CE": "CE",
        "MinE": "MinE",
        "Basic Science and Humanities": "BSH",
        "BSH": "BSH"
    };

    const isFacultyTimetableManager = (
        (user?.role === 'Faculty' || user?.role === 'HOD') &&
        user?.assignedRole === 'TimeTable Management'
    );

    // Dean and Principal have full cross-branch access; Faculty restricted to their own branch
    const isDeanOrPrincipal = user?.role === 'Dean' || user?.role === 'Principal';
    const isBranchScopedEditor = isFacultyTimetableManager && !isDeanOrPrincipal;
    const userBranch = deptMap[user?.department] || null;

    useEffect(() => {
        if (isHodOrDean || user?.role === 'Faculty' || user?.accessInfo?.tier === 'Faculty Portal') {
            if (user?.department && deptMap[user.department]) {
                setSelectedBranch(deptMap[user.department]);
            }
        } else if (user?.accessInfo?.tier === 'Student Portal') {
            const roleParts = user.role ? user.role.split(',') : [];
            if (roleParts.length > 1) {
                const userBranchPart = roleParts[1].trim();
                if (deptMap[userBranchPart]) setSelectedBranch(deptMap[userBranchPart]);
            }
            if (user.semester) setSelectedSemester(user.semester);
        }
    }, [user, isHodOrDean]);

    // Fetch Available Sections
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/sections?branch=${selectedBranch}&semester=${selectedSemester}`);
                const data = await response.json();
                if (data.sections) {
                    setAvailableSections(data.sections);
                    if (!data.sections.includes(selectedSection)) {
                        setSelectedSection(data.sections[0] || "A");
                    }
                }
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        };
        if (selectedBranch && selectedSemester) {
            fetchSections();
        }
    }, [selectedBranch, selectedSemester]);

    useEffect(() => {
        fetchTimetable();
    }, [selectedBranch, selectedSemester, selectedSection]);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/timetable?branch=${selectedBranch}&semester=${selectedSemester}&section=${selectedSection}`);
            const data = await response.json();

            if (data.timeSlots && data.timeSlots.length > 0) {
                setTimeSlots(data.timeSlots);
            } else {
                setTimeSlots(defaultTimeSlots);
            }

            if (data.schedule && data.schedule.length > 0) {
                // Merge with current time slots structure if needed, or just use it
                // For now, assume fetched schedule matches our structure or we map it
                // If the stored schedule has different periods, we might need to adapt.
                // For this implementation, we'll trust the stored data but fallback to default structure if empty.
                setSchedule(data.schedule);
            } else {
                setSchedule(createEmptySchedule(data.timeSlots || defaultTimeSlots));
            }
        } catch (error) {
            console.error("Error fetching timetable:", error);
            setSchedule(createEmptySchedule(timeSlots));
        }
        setLoading(false);
    };

    const handleAddSection = async () => {
        if (!newSectionName.trim()) return;
        const updatedSections = [...availableSections, newSectionName.trim()];
        setAvailableSections(updatedSections);
        setNewSectionName("");
        setIsAddingSection(false);
        setSelectedSection(newSectionName.trim());

        // Persist
        try {
            await fetch("http://localhost:5000/api/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ branch: selectedBranch, semester: selectedSemester, sections: updatedSections })
            });
        } catch (err) {
            console.error("Failed to save sections", err);
        }
    };

    const handleRemoveSection = async (sectionToRemove) => {
        if (!confirm(`Are you sure you want to remove Section ${sectionToRemove}?`)) return;
        const updatedSections = availableSections.filter(s => s !== sectionToRemove);
        setAvailableSections(updatedSections);
        if (selectedSection === sectionToRemove) setSelectedSection(updatedSections[0] || "");

        // Persist
        try {
            await fetch("http://localhost:5000/api/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ branch: selectedBranch, semester: selectedSemester, sections: updatedSections })
            });
        } catch (err) {
            console.error("Failed to save sections", err);
        }
    };

    const saveTimetable = async () => {
        setLoading(true);
        try {
            await fetch("http://localhost:5000/api/timetable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    branch: selectedBranch,
                    semester: selectedSemester,
                    section: selectedSection,
                    schedule: schedule,
                    timeSlots: timeSlots // Persist column config
                }),
            });
            setIsEditing(false);
            setEditingSlotId(null);
            alert("Timetable saved successfully!");
        } catch (error) {
            console.error("Error saving timetable:", error);
            alert("Failed to save timetable.");
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/timetable/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.schedule) {
                // Determine if uploaded schedule matches current slots or if we need to adapt our slots
                // For simplicity, if structure varies too much, we might need complex mapping.
                // Here we assume data.schedule follows a structure we can display.
                setSchedule(data.schedule);
                setIsEditing(true);
                alert("Timetable imported! Please review and save.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to import file.");
        }
        setLoading(false);
    };

    const updatePeriod = (dayIndex, slotId, field, value) => {
        const newSchedule = [...schedule];
        // Ensure day row exists
        if (!newSchedule[dayIndex]) return;

        // Find period in schedule or create if missing
        let periodIndex = newSchedule[dayIndex].periods.findIndex(p => p.slotId === slotId);

        if (periodIndex === -1) {
            // If checking against structure, maybe push a new period object
            // But we prefer strictly mapping to defined timeSlots
            newSchedule[dayIndex].periods.push({
                slotId: slotId,
                time: "",
                subject: "",
                room: "",
                faculty: ""
            });
            periodIndex = newSchedule[dayIndex].periods.length - 1;
        }

        newSchedule[dayIndex].periods[periodIndex][field] = value;
        setSchedule(newSchedule);
    };

    // canEdit: user has permission AND (is not branch-scoped, OR is on their own branch, OR their branch couldn't be determined)
    // New Requirement: Only 'Dean UG PG' can edit if the role is Dean.
    const isDeanUGPG = user?.role === 'Dean' && (user.fullName === 'Dean UG PG' || user.name === 'Dean UG PG');
    const isPrincipalRole = user?.role === 'Principal';
    
    // Deans who are NOT UG PG should be restricted to read-only even if they are 'Deans'
    const hasEditPermission = (user?.assignedRole === 'TimeTable Management' || user?.role === 'TimeTable Management' || isDeanUGPG || isPrincipalRole);
    
    const canEdit = hasEditPermission && (
        (user?.role === 'Dean' ? isDeanUGPG : true) && // If Dean, must be UG PG
        (!isBranchScopedEditor ||           // Dean/Principal: always allowed
        !userBranch ||                     // department not resolved: allow rather than silently block
        selectedBranch === userBranch      // Faculty/HOD: only their own branch
        )
    );
    // canChangeBranch: Only Dean and Principal can view cross-branch timetables freely
    const canChangeBranch = isDeanOrPrincipal;

    // Slot Management Logic
    const handleSlotUpdate = (id, field, value) => {
        setTimeSlots(prev => prev.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
    };

    const handleAddSlot = () => {
        const newId = `custom-${Date.now()}`;
        const newSlot = { id: newId, time: "00:00 - 00:00", label: "New Period" };
        setTimeSlots([...timeSlots, newSlot]);
        // Update schedule to include this new slot
        setSchedule(prev => prev.map(day => ({
            ...day,
            periods: [...day.periods, { slotId: newId, time: "00:00 - 00:00", subject: "", room: "", faculty: "" }]
        })));
    };

    const handleRemoveSlot = (id) => {
        if (!confirm("Delete this period column? Existing data in this column will be lost.")) return;
        setTimeSlots(prev => prev.filter(s => s.id !== id));
        // Remove from schedule
        setSchedule(prev => prev.map(day => ({
            ...day,
            periods: day.periods.filter(p => p.slotId !== id)
        })));
    };

    const getPeriodData = (dayRow, slotId) => {
        return dayRow.periods.find(p => p.slotId === slotId) || { slotId, time: "", subject: "", room: "", faculty: "" };
    };

    return (
        <div className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">Class Timetable</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View and manage academic schedules</p>
                </div>

                {/* Branch restriction notice for scoped timetable managers */}
                {isBranchScopedEditor && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Access limited to <strong>{userBranch}</strong> branch only</span>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Branch - Locked for Students and branch-scoped editors */}
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        disabled={!canChangeBranch}
                        className={`px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border-none text-sm text-gray-900 dark:text-white ${!canChangeBranch ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {!canChangeBranch && userBranch ? (
                            // Locked users only see their own branch
                            <option value={userBranch} className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">{userBranch}</option>
                        ) : (
                            <>
                                <option value="CSE" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">CSE</option>
                                <option value="ECE" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">ECE</option>
                                <option value="ME" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">ME</option>
                                <option value="EE" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">EE</option>
                                <option value="CE" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">CE</option>
                                <option value="MinE" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">MinE</option>
                            </>
                        )}
                    </select>

                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        disabled={!canChangeFilters}
                        className={`px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border-none text-sm text-gray-900 dark:text-white ${!canChangeFilters ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <option value="1st Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">1st Sem</option>
                        <option value="2nd Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">2nd Sem</option>
                        <option value="3rd Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">3rd Sem</option>
                        <option value="4th Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">4th Sem</option>
                        <option value="5th Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">5th Sem</option>
                        <option value="6th Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">6th Sem</option>
                        <option value="7th Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">7th Sem</option>
                        <option value="8th Semester" className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">8th Sem</option>
                    </select>

                    {/* Section Selector with Add/Remove */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="px-3 py-1.5 bg-transparent border-none text-sm text-gray-900 dark:text-white focus:ring-0"
                        >
                            {availableSections.map(sec => <option key={sec} value={sec} className="bg-white text-gray-900 dark:bg-[#0F1419] dark:text-white">Sec {sec}</option>)}
                        </select>
                        {canEdit && (
                            <>
                                <button
                                    onClick={() => setIsAddingSection(true)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md text-green-600 transition-colors"
                                    title="Add Section"
                                >
                                    <Plus size={14} />
                                </button>
                                {availableSections.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveSection(selectedSection)}
                                        className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md text-red-500 transition-colors"
                                        title="Remove Current Section"
                                    >
                                        <Trash size={14} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Adding Section Modal/Input */}
                {isAddingSection && (
                    <div className="absolute top-20 right-8 z-50 bg-white dark:bg-surface-dark p-4 shadow-xl rounded-xl border border-gray-200 dark:border-border-dark flex gap-2 animate-fade-in-up">
                        <input
                            autoFocus
                            placeholder="New Section (e.g. C)"
                            className="w-32 px-2 py-1 text-sm border rounded"
                            value={newSectionName}
                            onChange={e => setNewSectionName(e.target.value)}
                        />
                        <button onClick={handleAddSection} className="p-1 bg-primary text-white rounded"><Check size={16} /></button>
                        <button onClick={() => setIsAddingSection(false)} className="p-1 bg-gray-200 text-gray-600 rounded"><X size={16} /></button>
                    </div>
                )}

                {/* Action Buttons (Only for HOD/Dean/Principal) */}
                {canEdit && (
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleAddSlot}
                                    className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-2 text-xs"
                                >
                                    <Plus size={14} /> Add Period
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-white/20 transition-all flex items-center gap-2 text-sm"
                                >
                                    <X size={16} /> Cancel
                                </button>
                                <button
                                    onClick={saveTimetable}
                                    className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:brightness-110 transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <label className="cursor-pointer px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-2 text-sm font-medium">
                                    <Upload size={16} /> {loading ? "Importing..." : "Import"}
                                    <input type="file" className="hidden" accept=".pdf, .xlsx, .xls" onChange={handleFileUpload} disabled={loading} />
                                </label>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto p-6">
                {(loading && !schedule.length) ? (
                    <div className="flex justify-center p-8">
                        <Loader className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <table className="w-full min-w-[1000px] border-collapse relative">
                        <thead>
                            <tr>
                                <th className="p-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5 w-24 sticky left-0 bg-white dark:bg-[#0F1419] z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">Day</th>
                                {timeSlots.map((slot) => (
                                    <th key={slot.id} className={`p-3 text-center text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-white/5 min-w-[120px] relative group ${slot.isBreak ? 'bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 w-16 min-w-[60px]' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {isEditing ? (
                                            <div className="flex flex-col gap-1 relative">
                                                <input
                                                    value={slot.label}
                                                    onChange={(e) => handleSlotUpdate(slot.id, 'label', e.target.value)}
                                                    className="w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-primary outline-none"
                                                />
                                                <input
                                                    value={slot.time}
                                                    onChange={(e) => handleSlotUpdate(slot.id, 'time', e.target.value)}
                                                    className="w-full text-center text-[10px] bg-transparent outline-none"
                                                />
                                                <button
                                                    onClick={() => handleRemoveSlot(slot.id)}
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Column"
                                                >
                                                    <X size={10} />
                                                </button>
                                                <label className="flex items-center justify-center gap-1 text-[8px] text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={slot.isBreak || false}
                                                        onChange={(e) => handleSlotUpdate(slot.id, 'isBreak', e.target.checked)}
                                                    /> Break
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span>{slot.label}</span>
                                                <span className="text-[10px] opacity-70 normal-case">{slot.time}</span>
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {schedule.map((dayRow, dayIndex) => (
                                <tr key={dayIndex} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-sm font-bold text-[#0d121b] dark:text-white sticky left-0 bg-white dark:bg-[#0F1419] z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">{dayRow.day}</td>
                                    {timeSlots.map((slot) => {
                                        if (slot.isBreak) {
                                            return (
                                                <td key={slot.id} className="p-2 bg-orange-50/20 dark:bg-orange-900/5 border-l border-r border-dashed border-orange-200 dark:border-orange-800/30 text-center">
                                                    <span className="text-[10px] font-bold text-orange-400 uppercase -rotate-90 block whitespace-nowrap">Break</span>
                                                </td>
                                            );
                                        }

                                        const period = getPeriodData(dayRow, slot.id);

                                        return (
                                            <td key={slot.id} className="p-2">
                                                {isEditing ? (
                                                    <div className="space-y-1 min-w-[140px]">
                                                        <input
                                                            type="text"
                                                            placeholder="Subject"
                                                            value={period.subject || ""}
                                                            onChange={(e) => updatePeriod(dayIndex, slot.id, "subject", e.target.value)}
                                                            className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Room"
                                                            value={period.room || ""}
                                                            onChange={(e) => updatePeriod(dayIndex, slot.id, "room", e.target.value)}
                                                            className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Faculty"
                                                            value={period.faculty || ""}
                                                            onChange={(e) => updatePeriod(dayIndex, slot.id, "faculty", e.target.value)}
                                                            className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                ) : (
                                                    period.subject ? (
                                                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5 min-w-[140px] hover:shadow-md transition-shadow">
                                                            <div className="text-sm font-bold text-primary dark:text-accent-neon mb-1">{period.subject}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">person</span>
                                                                    <span>{period.faculty}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">location_on</span>
                                                                    <span className="opacity-70">{period.room}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-20 flex items-center justify-center text-xs text-gray-300 dark:text-gray-700 font-medium italic border border-dashed border-gray-200 dark:border-white/5 rounded-lg">
                                                            Free
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Timetable;
