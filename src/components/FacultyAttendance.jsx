import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import AttendanceSheet from './AttendanceSheet';

const FacultyAttendance = () => {
    const { user } = useUser();

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'sheet'

    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClassScheduled, setIsClassScheduled] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState('success');

    // Initialize assignments from user context
    useEffect(() => {
        if (user?.teachingAssignments && user.teachingAssignments.length > 0) {
            setAssignments(user.teachingAssignments);
            setSelectedAssignmentIndex(0);
        } else {
            setAssignments([]);
        }
    }, [user]);

    // Fetch students when assignment changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (assignments.length === 0) {
                setStudents([]);
                setIsClassScheduled(true);
                return;
            }

            const currentObj = assignments[selectedAssignmentIndex];
            if (!currentObj) return;

            setIsLoading(true);
            try {
                // Normalize "5th" to "5th Sem" to match HOD student import format
                let formattedSemester = currentObj.semester;
                if (formattedSemester && !formattedSemester.toLowerCase().includes('sem')) {
                    formattedSemester = `${formattedSemester} Sem`;
                }

                const { branch, section, subject } = currentObj;

                let isClassScheduledForToday = true;
                // Ensure attendance exists for today if class is scheduled per timetable
                try {
                    const ensureRes = await axios.post('http://localhost:5000/api/attendance/ensure', {
                        branch,
                        semester: formattedSemester,
                        section: section || "",
                        subject,
                        date: selectedDate,
                        facultyId: user.id || user._id || null
                    });

                    if (ensureRes.data && ensureRes.data.scheduled === false) {
                        isClassScheduledForToday = false;
                    }
                } catch (ensureError) {
                    console.warn("Could not ensure attendance, class might not be scheduled or API error:", ensureError);
                }
                
                setIsClassScheduled(isClassScheduledForToday);

                const response = await axios.get('http://localhost:5000/api/students', {
                    params: { branch, semester: formattedSemester, section }
                });

                const fetchedStudents = response.data || [];
                setStudents(fetchedStudents);

                // Reset attendance map to all absent initially
                const initialMap = {};
                fetchedStudents.forEach(s => {
                    initialMap[s.regdNo] = false;
                });
                setAttendanceMap(initialMap);

            } catch (error) {
                console.error("Failed to fetch students from API:", error);
                setStudents([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [assignments, selectedAssignmentIndex, selectedDate, user]);

    const handleClassChange = (e) => {
        setSelectedAssignmentIndex(Number(e.target.value));
    };

    const toggleAttendance = (regdNo) => {
        setAttendanceMap(prev => ({
            ...prev,
            [regdNo]: !prev[regdNo]
        }));
    };

    const handleSubmit = async () => {
        if (assignments.length === 0 || students.length === 0) return;

        const currentObj = assignments[selectedAssignmentIndex];
        const records = students.map(s => ({
            regdNo: s.regdNo,
            status: !!attendanceMap[s.regdNo]
        }));

        let formattedSemester = currentObj.semester;
        if (formattedSemester && !formattedSemester.toLowerCase().includes('sem')) {
            formattedSemester = `${formattedSemester} Sem`;
        }

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/attendance/mark', {
                facultyId: user.id || user._id || 'faculty-unknown',
                subject: currentObj.subject,
                branch: currentObj.branch,
                semester: formattedSemester,
                section: currentObj.section || "",
                date: selectedDate,
                records
            });

            setToastType('success');
            setToastMessage("Attendance marked successfully");
            setShowToast(true);
        } catch (error) {
            console.error("Failed to mark attendance:", error);
            setToastType('error');
            const serverMsg = error.response?.data?.message || "Failed to mark attendance";
            setToastMessage(serverMsg);
            setShowToast(true);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleExport = async () => {
        if (assignments.length === 0) return;
        const currentObj = assignments[selectedAssignmentIndex];

        try {
            const response = await axios.get('http://localhost:5000/api/attendance/export', {
                params: {
                    branch: currentObj.branch,
                    semester: currentObj.semester,
                    subject: currentObj.subject
                    // Optionally pass date if we want export for a specific date
                },
                responseType: 'blob'
            });

            // Create a blob and download it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${currentObj.branch}_${currentObj.semester}_${currentObj.subject}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to export attendance:", error);
            setToastType('error');
            setToastMessage("Failed to export attendance or no records exist.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Toast Notification */}
            {showToast && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${toastType === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-down z-50`}>
                    <span className="material-symbols-outlined">{toastType === 'success' ? 'check_circle' : 'error'}</span>
                    <span className="font-bold">{toastMessage}</span>
                </div>
            )}

            {/* Header and View Toggles */}
            <div>
                <h2 className="text-xl xs:text-2xl font-bold dark:text-white mb-4">Subject Attendance</h2>
                <div className="flex flex-wrap gap-2 xs:gap-4 border-b border-slate-200 dark:border-border-dark">
                    <button
                        onClick={() => setViewMode('mark')}
                        className={`px-2 xs:px-4 py-2 font-bold text-[10px] xs:text-sm border-b-2 transition-colors ${viewMode === 'mark' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Mark Daily Attendance
                    </button>
                    <button
                        onClick={() => setViewMode('sheet')}
                        className={`px-2 xs:px-4 py-2 font-bold text-[10px] xs:text-sm border-b-2 transition-colors ${viewMode === 'sheet' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        View & Edit Register
                    </button>
                </div>
            </div>

            {/* Config & Selectors */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Class Selector (Matches User's Teaching Assignments) */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Assigned Class / Subject</label>
                        <select
                            value={selectedAssignmentIndex}
                            onChange={handleClassChange}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg px-4 py-2.5 outline-none transition-all dark:text-white"
                        >
                            {assignments.length > 0 ? assignments.map((a, idx) => (
                                <option key={idx} value={idx}>
                                    {a.branch} - {a.semester} {a.section ? `- ${a.section}` : ''} | {a.subject}
                                </option>
                            )) : (
                                <option value={0}>No Assignments Found</option>
                            )}
                        </select>
                    </div>

                    {/* Date Selector (Only in Mark mode) */}
                    {viewMode === 'mark' && (
                        <div className="space-y-2 lg:col-span-1 border-l-0 md:border-l md:pl-6 border-slate-100 dark:border-border-dark">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                disabled={true}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg px-4 py-2.5 outline-none transition-all dark:text-white opacity-70 cursor-not-allowed"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'sheet' ? (
                assignments.length > 0 ? (
                    <AttendanceSheet
                        branch={assignments[selectedAssignmentIndex].branch}
                        semester={assignments[selectedAssignmentIndex].semester && !assignments[selectedAssignmentIndex].semester.includes('Sem') ? `${assignments[selectedAssignmentIndex].semester} Sem` : assignments[selectedAssignmentIndex].semester}
                        subject={assignments[selectedAssignmentIndex].subject}
                    />
                ) : (
                    <div className="p-8 text-center text-slate-500">No active assignment selected.</div>
                )
            ) : (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm transition-opacity duration-300">
                    <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100 dark:border-border-dark">
                        <div>
                            <h3 className="font-bold dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">grid_view</span>
                                Student Registration Blocks
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                <div className="flex items-center gap-2 text-[10px] xs:text-xs font-medium text-slate-500">
                                    <div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Present
                                </div>
                                <div className="flex items-center gap-2 text-[10px] xs:text-xs font-medium text-slate-500">
                                    <div className="w-3 h-3 rounded-sm border-2 border-slate-300 dark:border-slate-600"></div> Absent
                                </div>
                                {isClassScheduled === false && (
                                    <div className="text-[10px] xs:text-xs font-bold text-amber-500 dark:text-amber-400">
                                        No class scheduled today.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                Total Present: <span className="text-emerald-500 text-xl">{Object.values(attendanceMap).filter(Boolean).length}</span> / {students.length}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12 text-slate-400 animate-pulse flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-2">hourglass_empty</span>
                            <p>Loading Students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex justify-center p-12 text-slate-400 text-center flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                            <p>No students found for this class.</p>
                            <p className="text-xs">Ask the HOD to import students for {assignments[selectedAssignmentIndex]?.branch} - {assignments[selectedAssignmentIndex]?.semester}{assignments[selectedAssignmentIndex]?.section ? ` - ${assignments[selectedAssignmentIndex].section}` : ''}.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {students.map(student => {
                                const isPresent = attendanceMap[student.regdNo];

                                return (
                                    <div
                                        key={student.regdNo}
                                        onClick={() => toggleAttendance(student.regdNo)}
                                        className={`
                                        relative cursor-pointer h-24 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-3 text-center
                                        ${isPresent
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 translate-y-[-2px]'
                                                : 'bg-white dark:bg-background-dark border-slate-200 dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                            }
                                    `}
                                        title={student.name}
                                    >
                                        <span className={`text-[13px] font-bold leading-tight line-clamp-2 w-full ${isPresent ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {student.name}
                                        </span>
                                        <span className={`text-[10px] mt-1 font-medium ${isPresent ? 'text-emerald-50' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {student.regdNo}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-dark flex justify-between">
                        <button
                            onClick={handleExport}
                            className="px-3 xs:px-6 py-2.5 rounded-lg text-xs xs:text-sm font-bold shadow-sm flex items-center gap-2 transition-all bg-slate-100 dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-border-dark hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span className="hidden xs:inline">Export to CSV</span>
                            <span className="xs:hidden">CSV</span>
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || students.length === 0 || !isClassScheduled}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${isSubmitting || students.length === 0 || !isClassScheduled ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:brightness-110 shadow-primary/20'} text-white`}
                            title={!isClassScheduled ? 'No scheduled class today' : undefined}
                        >
                            {isSubmitting ? (
                                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                            ) : (
                                <span className="material-symbols-outlined text-sm">backup</span>
                            )}
                            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAttendance;
