import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const MyClasses = () => {
    const { user } = useUser();

    const [classHistories, setClassHistories] = useState({});
    const [newTopic, setNewTopic] = useState("");
    const [isTracking, setIsTracking] = useState(false);

    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editingTopic, setEditingTopic] = useState("");

    // Fetch histories
    useEffect(() => {
        if (!user?.id || !user?.teachingAssignments) return;

        user.teachingAssignments.forEach(async (assignment) => {
            try {
                const res = await fetch(`http://localhost:5000/api/class-sessions?facultyId=${user.id}&subject=${encodeURIComponent(assignment.subject)}`);
                const data = await res.json();
                setClassHistories(prev => ({ ...prev, [assignment.subject]: data }));
            } catch (err) {
                console.error("Failed to fetch sessions for", assignment.subject);
            }
        });
    }, [user]);

    // Build dynamic userClasses based on assignments + fetched history
    const userClasses = user?.teachingAssignments?.length > 0
        ? user.teachingAssignments.map((assignment, index) => {
            const history = classHistories[assignment.subject] || [];
            return {
                id: assignment.subject.substring(0, 5).toUpperCase(),
                name: assignment.subject,
                branch: assignment.branch,
                semester: assignment.semester,
                section: `${assignment.branch} - ${assignment.semester}`,
                type: 'Lecture',
                totalTaken: history.length,
                totalSem: 40,
                history: history.map((sess, i) => ({
                    id: String(sess._id || i),
                    _id: sess._id,
                    date: sess.date,
                    topic: sess.topic,
                    status: sess.status
                }))
            };
        })
        : [];

    const dynamicData = {
        totalClassesTakenThisSemester: userClasses.reduce((acc, curr) => acc + curr.totalTaken, 0),
        totalClassesScheduledThisSemester: userClasses.reduce((acc, curr) => acc + curr.totalSem, 0),
        activeSubjects: userClasses.length,
        classes: userClasses.length > 0 ? userClasses : [{ id: 'NONE', name: 'No Subjects', section: '-', totalTaken: 0, totalSem: 1, history: [] }]
    };

    const [selectedClassId, setSelectedClassId] = useState(dynamicData.classes[0]?.id || '');

    useEffect(() => {
        if (!dynamicData.classes.find(c => c.id === selectedClassId) && dynamicData.classes.length > 0) {
            setSelectedClassId(dynamicData.classes[0].id);
        }
    }, [dynamicData.classes, selectedClassId]);

    const selectedClass = dynamicData.classes.find(c => c.id === selectedClassId) || dynamicData.classes[0];

    const calculateProgress = (taken, total) => {
        if (total === 0) return 0;
        return Math.round((taken / total) * 100);
    };

    const handleAddSession = async () => {
        if (!newTopic.trim() || !user?.id) return;
        setIsTracking(true);
        try {
            const res = await fetch(`http://localhost:5000/api/class-sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyId: user.id,
                    subject: selectedClass.name,
                    branch: selectedClass.branch || "Unknown",
                    semester: selectedClass.semester || "Unknown",
                    topic: newTopic
                })
            });
            const data = await res.json();
            if (data.session) {
                const sessionWithId = { ...data.session, id: String(data.session._id) };
                setClassHistories(prev => ({
                    ...prev,
                    [selectedClass.name]: [sessionWithId, ...(prev[selectedClass.name] || [])]
                }));
                setNewTopic("");
            }
        } catch (e) {
            console.error(e);
        }
        setIsTracking(false);
    };

    const handleEditSession = (session) => {
        const sessionId = String(session._id || session.id);
        setEditingSessionId(sessionId);
        setEditingTopic(session.topic);
    };

    const handleCancelEdit = () => {
        setEditingSessionId(null);
        setEditingTopic("");
    };

    const handleSaveEdit = async (session) => {
        if (!editingTopic.trim() || !user?.id) return;

        const sessionId = String(session._id || session.id);

        try {
            const res = await fetch(`http://localhost:5000/api/class-sessions/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyId: user.id,
                    topic: editingTopic,
                    date: session.date
                })
            });
            const data = await res.json();
            if (data.session) {
                const updatedSession = { ...data.session, id: String(data.session._id) };
                setClassHistories(prev => ({
                    ...prev,
                    [selectedClass.name]: prev[selectedClass.name].map((s) =>
                        String(s._id || s.id) === sessionId ? updatedSession : s
                    )
                }));
                setEditingSessionId(null);
                setEditingTopic("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteSession = async (session) => {
        const confirmDelete = window.confirm("Delete this session? This cannot be undone.");
        if (!confirmDelete) return;

        const sessionId = String(session._id || session.id);

        try {
            const res = await fetch(`http://localhost:5000/api/class-sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ facultyId: user.id })
            });
            const data = await res.json();
            if (data.id) {
                setClassHistories(prev => ({
                    ...prev,
                    [selectedClass.name]: prev[selectedClass.name].filter((s) => String(s._id || s.id) !== sessionId)
                }));
                if (editingSessionId === sessionId) {
                    handleCancelEdit();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Title */}
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">My Classes</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor your teaching progress and class history.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Classes Taken</p>
                        <h3 className="text-2xl font-bold dark:text-white">{dynamicData.totalClassesTakenThisSemester}</h3>
                    </div>
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Classes Scheduled (Sem)</p>
                        <h3 className="text-2xl font-bold dark:text-white">{dynamicData.totalClassesScheduledThisSemester}</h3>
                    </div>
                    <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <span className="material-symbols-outlined text-2xl">event_note</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Subjects</p>
                        <h3 className="text-2xl font-bold dark:text-white">{dynamicData.activeSubjects}</h3>
                    </div>
                    <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <span className="material-symbols-outlined text-2xl">library_books</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden flex flex-col lg:flex-row">
                {/* Left Sidebar for Subject Selection */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30">
                    <div className="p-4 border-b border-slate-200 dark:border-border-dark flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">list_alt</span>
                        <h3 className="font-bold text-sm dark:text-white uppercase tracking-wider">Select Subject</h3>
                    </div>
                    <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {dynamicData.classes.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedClassId(c.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all border ${selectedClassId === c.id
                                    ? 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/50'
                                    : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold text-sm leading-tight ${selectedClassId === c.id ? 'text-primary dark:text-primary-light' : 'text-slate-800 dark:text-slate-200'}`}>{c.id} - {c.name}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${c.type === 'Lecture' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400'
                                        }`}>
                                        {c.type}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{c.section}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content Area for Subject Details */}
                <div className="w-full lg:w-2/3 flex flex-col">
                    {/* Header for Selected Subject */}
                    <div className="p-6 border-b border-slate-200 dark:border-border-dark">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white mb-1">{selectedClass.name}</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{selectedClass.section}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-slate-100 dark:bg-background-dark text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 dark:border-border-dark">
                                    {selectedClass.id}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-xl border border-slate-200 dark:border-border-dark">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold dark:text-slate-200">Syllabus Coverage</span>
                                <span className="text-sm font-bold text-primary">{calculateProgress(selectedClass.totalTaken, selectedClass.totalSem)}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200 dark:bg-border-dark rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${calculateProgress(selectedClass.totalTaken, selectedClass.totalSem)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <span>{selectedClass.totalTaken} Classes Taken</span>
                                <span>{selectedClass.totalSem} Total Classes Planned</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Topics History */}
                    <div className="flex-1 p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">history</span>
                                Topics Taught Overview
                            </h4>
                            {selectedClass.id !== 'NONE' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter topic taught today..."
                                        value={newTopic}
                                        onChange={(e) => setNewTopic(e.target.value)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                                    />
                                    <button
                                        onClick={handleAddSession}
                                        disabled={isTracking || !newTopic.trim()}
                                        className="px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
                                    >
                                        Log Session
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-border-dark">
                            {selectedClass.history.map((record, index) => (
                                <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                    {/* Marker */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-surface-dark bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-1">
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md self-start md:self-auto">Class {selectedClass.totalTaken - index}</span>
                                            <div className="flex items-center gap-2">
                                                <time className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-surface-dark px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                                    {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </time>

                                                <button
                                                    onClick={() => handleEditSession(record)}
                                                    className="p-1 rounded-md text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-surface-dark"
                                                    title="Edit session"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(record)}
                                                    className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-surface-dark"
                                                    title="Delete session"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        {editingSessionId === record.id ? (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                                <input
                                                    value={editingTopic}
                                                    onChange={(e) => setEditingTopic(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(record)}
                                                    disabled={!editingTopic.trim()}
                                                    className="px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <h5 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                                                {record.topic}
                                            </h5>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Start point marker */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-surface-dark bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <span className="material-symbols-outlined text-sm">flag</span>
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] text-xs font-medium text-slate-400 text-left md:text-right md:group-odd:text-left pr-4 md:pr-0 md:pl-4 md:group-odd:pl-0 md:group-odd:pr-4">
                                    Start of Semester
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyClasses;
