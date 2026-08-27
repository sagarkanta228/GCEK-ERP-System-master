import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Attendance = () => {
    const { user } = useUser();
    const [attendanceData, setAttendanceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?.regdNo) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/attendance/student/${user.regdNo}`);
                setAttendanceData(response.data);
            } catch (err) {
                console.error("Failed to fetch student attendance", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, [user]);

    const toggleSubject = (id) => {
        setExpandedSubject(expandedSubject === id ? null : id);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
                <span className="material-symbols-outlined text-4xl mb-4">hourglass_empty</span>
                <p className="font-medium text-lg">Loading your academic records...</p>
            </div>
        );
    }

    if (!attendanceData || attendanceData.totalClasses === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark text-slate-500 shadow-sm">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">event_busy</span>
                <h2 className="text-xl font-bold dark:text-white">No Attendance Records Yet</h2>
                <p className="mt-2 text-center max-w-sm">Once your faculty members start marking attendance for your subjects, your records will appear here.</p>
                <div className="mt-6 p-4 bg-primary/10 rounded-lg text-primary text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    REGD NO: {user?.regdNo || 'Checking...'}
                </div>
            </div>
        );
    }

    // Convert subjectStats object to array for mapping
    const subjects = Object.entries(attendanceData.subjectStats || {}).map(([name, stats], index) => {
        const percentage = stats.totalClasses === 0 ? 0 : Math.round((stats.presents / stats.totalClasses) * 100);
        return {
            id: index,
            name: name,
            totalClasses: stats.totalClasses,
            attended: stats.presents,
            percentage: percentage,
            status: percentage >= 85 ? 'Excellent' : percentage >= 75 ? 'On Track' : 'Needs Improvement',
            color: percentage >= 85 ? 'emerald' : percentage >= 75 ? 'blue' : 'amber'
        };
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Detailed Attendance</h2>
                    <p className="text-slate-500 dark:text-slate-400">Showing records for Regd No: <span className="font-bold text-primary">{user?.regdNo}</span></p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-border-dark flex flex-col items-center shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Avg</span>
                        <span className={`text-xl font-bold ${attendanceData.overallPercentage >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>{attendanceData.overallPercentage}%</span>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Total Classes</p>
                            <p className="text-2xl font-bold dark:text-white">{attendanceData.totalClasses}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <span className="material-symbols-outlined">how_to_reg</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Present</p>
                            <p className="text-2xl font-bold dark:text-white">{attendanceData.totalPresents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <span className="material-symbols-outlined">person_off</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Absent</p>
                            <p className="text-2xl font-bold dark:text-white">{attendanceData.totalClasses - attendanceData.totalPresents}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Subject Wise Attendance */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Subject-wise Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden transition-all duration-200 hover:shadow-md h-fit">
                                <div
                                    className="p-5 flex items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => toggleSubject(subject.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1 truncate">
                                        <div className={`size-10 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-white bg-${subject.color}-500 shadow-lg shadow-${subject.color}-500/20`}>
                                            {subject.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <h4 className="font-bold dark:text-white truncate">{subject.name}</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{subject.totalClasses} Classes Held</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-xl font-extrabold ${subject.percentage >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {subject.percentage}%
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{subject.status}</span>
                                        </div>
                                        <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSubject === subject.id ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedSubject === subject.id && (
                                    <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-border-dark/50 bg-slate-50/50 dark:bg-background-dark/30 animate-fade-in">
                                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                            <div className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-border-dark shadow-sm">
                                                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Total</p>
                                                <p className="font-extrabold text-lg dark:text-white">{subject.totalClasses}</p>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-border-dark shadow-sm">
                                                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1 font-bold text-emerald-500">Present</p>
                                                <p className="font-extrabold text-lg text-emerald-500">{subject.attended}</p>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-border-dark shadow-sm">
                                                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1 font-bold text-rose-500">Absent</p>
                                                <p className="font-extrabold text-lg text-rose-500">{subject.totalClasses - subject.attended}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 bg-primary/5 rounded-lg p-3 border border-primary/10">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Attendance Requirement (75%)</span>
                                                <span className={`font-bold ${subject.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {subject.percentage >= 75 ? 'ELIGIBLE' : 'INELIGIBLE'}
                                                </span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-500 ${subject.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                    style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;

