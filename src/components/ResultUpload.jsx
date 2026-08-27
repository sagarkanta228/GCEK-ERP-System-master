import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ResultUpload = () => {
    const { user } = useUser();

    // State for assignments and students
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedResults, setUploadedResults] = useState([]);
    const [isLoadingResults, setIsLoadingResults] = useState(false);

    const examTypes = [
        { id: 'internal1', name: 'Internal Marks - I', maxMarks: 20 },
        { id: 'internal2', name: 'Internal Marks - II', maxMarks: 20 },
        { id: 'quiz1', name: 'Quiz Test 1', maxMarks: 10 },
        { id: 'quiz2', name: 'Quiz Test 2', maxMarks: 10 },
        { id: 'surprise', name: 'Surprise Test', maxMarks: 5 },
        { id: 'assignment', name: 'Assignment', maxMarks: 10 },
        { id: 'viva', name: 'Viva Record', maxMarks: 20 },
        { id: 'lab', name: 'Lab Practical', maxMarks: 50 }
    ];

    const [selectedExamType, setSelectedExamType] = useState(examTypes[0].id);
    const [editableMaxMarks, setEditableMaxMarks] = useState(examTypes[0].maxMarks);

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
                return;
            }

            const currentObj = assignments[selectedAssignmentIndex];
            if (!currentObj) return;

            setIsLoading(true);
            try {
                let formattedSemester = currentObj.semester;
                if (formattedSemester && !formattedSemester.toLowerCase().includes('sem')) {
                    formattedSemester = `${formattedSemester} Sem`;
                }

                const { branch, section } = currentObj;
                const response = await axios.get('http://localhost:5000/api/students', {
                    params: { branch, semester: formattedSemester, section }
                });

                setStudents(response.data || []);
            } catch (error) {
                console.error("Failed to fetch students from API:", error);
                setStudents([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [assignments, selectedAssignmentIndex]);

    // Fetch existing uploaded results for the class
    useEffect(() => {
        const fetchUploadedResults = async () => {
            if (assignments.length === 0) {
                setUploadedResults([]);
                return;
            }

            const currentObj = assignments[selectedAssignmentIndex];
            if (!currentObj) return;

            setIsLoadingResults(true);
            try {
                let formattedSemester = currentObj.semester;
                if (formattedSemester && !formattedSemester.toLowerCase().includes('sem')) {
                    formattedSemester = `${formattedSemester} Sem`;
                }

                const response = await axios.get('http://localhost:5000/api/result/uploaded', {
                    params: {
                        facultyId: user.id || user._id,
                        branch: currentObj.branch,
                        semester: formattedSemester,
                        subject: currentObj.subject,
                        section: currentObj.section
                    }
                });

                setUploadedResults(response.data || []);
            } catch (error) {
                console.error("Failed to fetch uploaded results:", error);
                setUploadedResults([]);
            } finally {
                setIsLoadingResults(false);
            }
        };

        fetchUploadedResults();
    }, [assignments, selectedAssignmentIndex, isSubmitting]); // re-fetch when form is submitted

    // State for marks
    // Map of studentId -> marks
    const [marks, setMarks] = useState({});

    // Handle class change
    const handleClassChange = (e) => {
        setSelectedAssignmentIndex(Number(e.target.value));
    };

    // Handle exam type change to show correct max marks
    const handleExamTypeChange = (e) => {
        setSelectedExamType(e.target.value);
        const newExam = examTypes.find(ex => ex.id === e.target.value);
        if (newExam) setEditableMaxMarks(newExam.maxMarks);
    };

    // Get current exam details
    const currentExamDetails = examTypes.find(e => e.id === selectedExamType) || examTypes[0];

    // Handle individual mark change
    const handleMarkChange = (studentId, value) => {
        // Validation: ensures marks are between 0 and editableMaxMarks
        let numValue = parseInt(value, 10);
        if (value === "") {
            setMarks(prev => ({ ...prev, [studentId]: '' }));
            return;
        }

        if (isNaN(numValue)) return;
        if (numValue < 0) numValue = 0;
        if (numValue > editableMaxMarks) numValue = editableMaxMarks;

        setMarks(prev => ({ ...prev, [studentId]: numValue }));
    };

    const handleDeleteResult = async (id) => {
        if (!window.confirm("Are you sure you want to delete this result? This action cannot be undone.")) return;

        try {
            await axios.delete(`http://localhost:5000/api/result/${id}`);
            setUploadedResults(prev => prev.filter(r => r._id !== id));
            alert("Result deleted successfully.");
        } catch (error) {
            console.error("Failed to delete result:", error);
            alert("Failed to delete result.");
        }
    };

    const handleEditResult = (res) => {
        // Set Exam Type and Max Marks
        const examTypeObj = examTypes.find(e => e.name === res.examType);
        if (examTypeObj) {
            setSelectedExamType(examTypeObj.id);
        }
        setEditableMaxMarks(res.maxMarks);

        // Prepopulate marks
        const newMarks = {};
        res.records.forEach(rec => {
            newMarks[rec.regdNo] = rec.marksObtained;
        });
        setMarks(newMarks);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        if (assignments.length === 0 || students.length === 0) return;
        const currentObj = assignments[selectedAssignmentIndex];

        let formattedSemester = currentObj.semester;
        if (formattedSemester && !formattedSemester.toLowerCase().includes('sem')) {
            formattedSemester = `${formattedSemester} Sem`;
        }

        const records = students.map(s => ({
            regdNo: s.regdNo,
            marksObtained: marks[s.regdNo] !== undefined && marks[s.regdNo] !== '' ? Number(marks[s.regdNo]) : 0
        }));

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/result/upload', {
                facultyId: user.id || user._id || 'faculty-unknown',
                subject: currentObj.subject,
                branch: currentObj.branch,
                semester: formattedSemester,
                section: currentObj.section || "",
                examType: currentExamDetails.name,
                maxMarks: editableMaxMarks,
                date: new Date(),
                records
            });
            alert("Results saved securely!");
        } catch (error) {
            console.error("Failed to save results:", error);
            alert("Failed to save results. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = async () => {
        if (assignments.length === 0) return;
        const currentObj = assignments[selectedAssignmentIndex];

        let formattedSemester = currentObj.semester;
        if (formattedSemester && !formattedSemester.toLowerCase().includes('sem')) {
            formattedSemester = `${formattedSemester} Sem`;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/result/export', {
                params: {
                    branch: currentObj.branch,
                    semester: formattedSemester,
                    subject: currentObj.subject,
                    section: currentObj.section || undefined,
                    examType: currentExamDetails.name
                },
                responseType: 'blob', // crucial for downloading files
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Results_${currentObj.subject.substring(0, 10)}_${currentExamDetails.name}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export Result failed:", error);
            alert("Failed to export results. Make sure they have been saved first.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Upload Results</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Upload marks for internals, quizzes, and surprise tests.</p>
            </div>

            {/* Filters / Selectors */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Class Selector */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Assigned Class / Subject</label>
                        <select
                            value={selectedAssignmentIndex}
                            onChange={handleClassChange}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
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



                    {/* Exam Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Exam Type</label>
                        <select
                            value={selectedExamType}
                            onChange={handleExamTypeChange}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                        >
                            {examTypes.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Max Marks Display / Editable */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Max Marks</label>
                        <div className="w-full bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark text-sm text-slate-500 dark:text-slate-400 rounded-lg px-2 flex items-center justify-between font-bold overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                            <input
                                type="number"
                                min="1"
                                value={editableMaxMarks}
                                onChange={(e) => setEditableMaxMarks(parseInt(e.target.value) || 0)}
                                className="w-full bg-transparent px-2 py-2.5 outline-none dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                            <span className="material-symbols-outlined text-sm px-2">edit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students Table Section */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/30">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">group</span>
                        <h3 className="font-bold text-sm dark:text-white">Student List</h3>
                        <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                            {students.length} Students
                        </span>
                    </div>
                    <button onClick={handleExport} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-all">
                        <span className="material-symbols-outlined text-sm">download</span> Export CSV
                    </button>
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
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse mobile-card-view">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-border-dark">
                                    <th className="px-6 py-4 font-bold w-20">No.</th>
                                    <th className="px-6 py-4 font-bold w-40">Roll Number</th>
                                    <th className="px-6 py-4 font-bold">Student Name</th>
                                    <th className="px-6 py-4 font-bold w-48 text-center">Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                {students.map((student, index) => (
                                    <tr key={student._id || student.regdNo} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors group">
                                        <td data-label="No." className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                                        <td data-label="Roll No." className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-background-dark px-2 py-1 rounded">
                                                {student.regdNo}
                                            </span>
                                        </td>
                                        <td data-label="Student" className="px-6 py-4">
                                            <div className="flex items-center gap-3 md:justify-start justify-end">
                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs hidden md:flex">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium dark:text-white">{student.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Marks" className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={editableMaxMarks}
                                                value={marks[student.regdNo] !== undefined ? marks[student.regdNo] : ''}
                                                onChange={(e) => handleMarkChange(student.regdNo, e.target.value)}
                                                className="w-20 h-10 bg-white dark:bg-background-dark border border-slate-300 dark:border-border-dark focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-center text-sm font-bold dark:text-white transition-all shadow-sm group-hover:border-primary/50 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                placeholder="--"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 dark:bg-background-dark/20 border-t border-slate-100 dark:border-border-dark flex justify-between items-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Marks automatically constrained to max ({editableMaxMarks})
                    </p>
                    <div className="flex gap-3">
                        <button onClick={handleExport} className="px-5 py-2.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-all">
                            Export CSV
                        </button>
                        <button onClick={handleSave} disabled={isSubmitting || students.length === 0} className={`px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg ${isSubmitting || students.length === 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-primary/20 hover:brightness-110'} flex items-center gap-2 transition-all`}>
                            <span className="material-symbols-outlined text-sm">publish</span>
                            {isSubmitting ? 'Saving...' : 'Final Submit'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Uploaded Results Section */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden flex flex-col mt-8">
                <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/30">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        <h3 className="font-bold text-sm dark:text-white">Previously Uploaded Results</h3>
                        <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                            {uploadedResults.length} Records
                        </span>
                    </div>
                </div>

                {isLoadingResults ? (
                    <div className="flex justify-center p-8 text-slate-400 animate-pulse flex-col items-center">
                        <span className="material-symbols-outlined text-3xl mb-2">hourglass_empty</span>
                        <p className="text-sm">Loading Results...</p>
                    </div>
                ) : uploadedResults.length === 0 ? (
                    <div className="flex justify-center p-8 text-slate-400 text-center flex-col items-center">
                        <span className="material-symbols-outlined text-3xl mb-2">inbox</span>
                        <p className="text-sm">No results uploaded for this class yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse mobile-card-view">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-border-dark">
                                    <th className="px-6 py-4 font-bold">Date Uploaded</th>
                                    <th className="px-6 py-4 font-bold">Exam Type</th>
                                    <th className="px-6 py-4 font-bold">Max Marks</th>
                                    <th className="px-6 py-4 font-bold text-center">Students Graded</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                {uploadedResults.map((res, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                        <td data-label="Date" className="px-6 py-4 text-sm font-medium dark:text-slate-300">
                                            {new Date(res.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td data-label="Exam" className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {res.examType}
                                        </td>
                                        <td data-label="Max Marks" className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                                            {res.maxMarks}
                                        </td>
                                        <td data-label="Students" className="px-6 py-4 text-center">
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                                                {res.records?.length || 0} Students
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="px-6 py-4 text-right">
                                            <div className="flex items-center md:justify-end justify-between w-full md:w-auto gap-2">
                                                <span className="md:hidden text-xs text-slate-500">Manage:</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditResult(res)}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                        title="Edit Marks"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResult(res._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        title="Delete Marks"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultUpload;
