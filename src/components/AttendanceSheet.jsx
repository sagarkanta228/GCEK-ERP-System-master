import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Edit2, Save, X } from 'lucide-react';

const AttendanceSheet = ({ branch, semester, subject }) => {
    const [sheetData, setSheetData] = useState({ dates: [], students: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCells, setEditedCells] = useState({}); // { "regdNo_date": newStatus }
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSheetData();
    }, [branch, semester, subject]);

    const fetchSheetData = async () => {
        if (!branch || !semester || !subject) return;
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/attendance/sheet', {
                params: { branch, semester, subject }
            });
            setSheetData(response.data);
        } catch (error) {
            console.error("Failed to fetch attendance sheet", error);
        } finally {
            setIsLoading(false);
            setEditedCells({});
            setIsEditing(false);
        }
    };

    const handleCellClick = (student, date) => {
        if (!isEditing) return;

        const cellKey = `${student.regdNo}_${date}`;
        let currentStatus;

        // Determine current status: check if edited first, else fallback to original
        if (editedCells[cellKey] !== undefined) {
            currentStatus = editedCells[cellKey];
        } else {
            currentStatus = student.records[date];
        }

        // Toggle logic. If currently undefined/no record, assume it was Absent and toggle to Present.
        const newStatus = currentStatus === false || currentStatus === undefined ? true : false;

        setEditedCells(prev => ({
            ...prev,
            [cellKey]: newStatus
        }));
    };

    const handleSave = async () => {
        const updates = Object.keys(editedCells);
        if (updates.length === 0) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            for (const key of updates) {
                const [regdNo, date] = key.split('_');
                const status = editedCells[key];

                await axios.put('http://localhost:5000/api/attendance/update', {
                    branch,
                    semester,
                    subject,
                    date,
                    regdNo,
                    status
                });
            }
            alert("Attendance updated successfully!");
            await fetchSheetData();
        } catch (error) {
            console.error("Failed to save attendance edits", error);
            alert("Errors occurred while saving. Please check connection.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedCells({});
        setIsEditing(false);
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/attendance/export', {
                params: { branch, semester, subject },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_Sheet_${branch}_${semester}_${subject}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to export attendance sheet:", error);
            alert("Failed to export. Either no records exist or network error.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Attendance Sheet...</div>;
    }

    if (!sheetData.dates.length || !sheetData.students.length) {
        return (
            <div className="p-12 text-center bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">event_busy</span>
                <p className="text-slate-500 font-medium">No attendance records found for this subject yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm flex flex-col h-full max-h-[600px]">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-border-dark flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-background-dark/30">
                <div>
                    <h3 className="font-bold text-lg dark:text-white">Attendance Register</h3>
                    <p className="text-xs text-slate-500">{branch} • {semester} • {subject}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-md text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-md text-sm font-medium flex items-center gap-1 shadow-sm transition-colors disabled:opacity-75"
                            >
                                {isSaving ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <Save size={16} />}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-3 py-1.5 border border-slate-200 dark:border-border-dark hover:border-primary text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-background-dark/50 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                <Edit2 size={16} /> Edit Sheet
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Editing Instructions Banner */}
            {isEditing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-900/50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-500">info</span>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Edit Mode Active: Click on any 'P' or 'A' cell to toggle attendance status, then click Save Changes.</span>
                </div>
            )}

            {/* Grid Area */}
            <div className="overflow-auto flex-1 custom-scrollbar relative">
                <table className="w-full text-left text-sm border-collapse min-w-max">
                    <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-surface-dark border-b-2 border-slate-300 dark:border-slate-700 shadow-sm shadow-black/5">
                        <tr>
                            <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-border-dark w-12 text-center">#</th>
                            <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-border-dark min-w-[120px]">Regd No</th>
                            <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-border-dark min-w-[200px]">Student Name</th>
                            {sheetData.dates.map((date, idx) => {
                                // Format date nicely: 2026-02-28 -> Feb 28
                                const [y, m, d] = date.split('-');
                                const dt = new Date(y, m - 1, d);
                                const niceDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                return (
                                    <th key={idx} className="px-2 py-3 font-semibold text-center text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-border-dark min-w-[60px]">
                                        {niceDate}
                                    </th>
                                );
                            })}
                            <th className="px-4 py-3 font-bold text-center text-slate-700 dark:text-slate-200">Total %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                        {sheetData.students.map((student, idx) => {
                            let totalPresent = 0;
                            let totalClasses = sheetData.dates.length;

                            return (
                                <tr key={student.regdNo} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                    <td className="px-4 py-2 text-center text-slate-400 text-xs border-r border-slate-100 dark:border-border-dark">{idx + 1}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-border-dark">{student.regdNo}</td>
                                    <td className="px-4 py-2 font-medium dark:text-slate-200 border-r border-slate-100 dark:border-border-dark">{student.name}</td>

                                    {sheetData.dates.map((date) => {
                                        const cellKey = `${student.regdNo}_${date}`;
                                        const isEdited = editedCells[cellKey] !== undefined;
                                        const status = isEdited ? editedCells[cellKey] : student.records[date];

                                        // Calculate total running internally
                                        if (status === true) totalPresent++;

                                        return (
                                            <td
                                                key={date}
                                                onClick={() => handleCellClick(student, date)}
                                                className={`
                                                    border-r border-slate-100 dark:border-border-dark text-center font-bold p-0 relative
                                                    ${isEditing ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
                                                    ${isEdited ? 'bg-amber-50 dark:bg-amber-900/10' : ''}
                                                `}
                                            >
                                                <div className="w-full h-full min-h-[40px] flex items-center justify-center">
                                                    {status === true ? (
                                                        <span className="text-emerald-500">P</span>
                                                    ) : status === false ? (
                                                        <span className="text-rose-500">A</span>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </div>
                                                {isEdited && <div className="absolute top-0 right-0 size-2 bg-amber-500 rounded-bl-sm pointer-events-none"></div>}
                                            </td>
                                        );
                                    })}

                                    <td className="px-4 py-2 text-center border-l border-slate-100 dark:border-border-dark">
                                        <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 dark:bg-background-dark text-xs font-bold w-12">
                                            {totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0}%
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceSheet;
