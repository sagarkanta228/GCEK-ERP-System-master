import React, { useState } from 'react';
import axios from 'axios';

const StudentPerformance = () => {
    const [selectedBatch, setSelectedBatch] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
    const [batchStats, setBatchStats] = useState(null);
    const [isSearchingStudent, setIsSearchingStudent] = useState(false);
    const [studentReport, setStudentReport] = useState(null);

    const handleGenerateBatchReport = () => {
        if (!selectedBatch) {
            alert("Please select a batch first.");
            return;
        }
        setIsGeneratingBatch(true);
        // Simulate API call with different data based on batch
        setTimeout(() => {
            setIsGeneratingBatch(false);

            // Mock Data Logic
            if (selectedBatch === "Batch of 2023" || selectedBatch === "Batch of 2022") {
                // Passout Batch Data
                setBatchStats({
                    type: "Passout",
                    batchName: selectedBatch,
                    totalStudents: 240,
                    noCareerBacklogs: 180,
                    clearedBacklogs: 45,
                    tenureExceeded: 15,
                    totalPendingBacklogs: 42, // Still pending after graduation
                    passoutAnalysis: [
                        { regNo: "GCEK19CS012", name: "Rahul Verma", pendingSubjects: ["Maths-IV", "CN"], contact: "9876543211" },
                        { regNo: "GCEK19CS045", name: "Amit Singh", pendingSubjects: ["TOC"], contact: "9876543212" },
                        // ... more data
                    ]
                });
            } else {
                // Active Batch Data (Default for 2024, 2025, 2026, 2027)
                setBatchStats({
                    type: "Active",
                    batchName: selectedBatch,
                    totalStudents: 252,
                    noCareerBacklogs: 150,
                    activeBacklogs: 85, // Students with currently active backlogs
                    tenureExceeded: selectedBatch === "Batch of 2024" ? 17 : 5, // Higher for final year
                    totalBatchBacklogs: 134, // Total exam papers pending for the whole batch
                    completionRate: "92%"
                });
            }
            // alert(`Batch Report for ${selectedBatch} generated successfully!`);
        }, 1500);
    };

    const handleViewDetailedReport = async () => {
        if (!registrationNumber) {
            alert("Please enter a registration number.");
            return;
        }
        setIsSearchingStudent(true);
        try {
            // First find student info
            const studentRes = await axios.get(`http://localhost:5000/api/students/regdNo/${registrationNumber}`);
            const studentInfo = studentRes.data;

            if (!studentInfo) {
                alert("Student not found");
                setIsSearchingStudent(false);
                return;
            }

            // Then find their uploaded semester results
            const resultsRes = await axios.get(`http://localhost:5000/api/semester-results/student/${studentInfo._id}`);
            const uploadedResults = resultsRes.data;

            // Map results to the report object
            const sgpaArray = new Array(8).fill(0);
            const backlogHistory = Array.from({ length: 8 }, (_, i) => ({
                semester: i + 1,
                backlogs: 0,
                subjects: [] // Note: Currently we don't store individual subjects in SemesterResult
            }));

            let totalBacklogs = 0;
            uploadedResults.forEach(r => {
                if (r.semester >= 1 && r.semester <= 8) {
                    sgpaArray[r.semester - 1] = r.sgpa;
                    backlogHistory[r.semester - 1].backlogs = r.backlogs;
                    totalBacklogs += r.backlogs;
                }
            });

            // Calculate overall CGPA from the SGPA array (simple average for now)
            const activeSems = uploadedResults.length;
            const currentCGPA = activeSems > 0 
                ? (uploadedResults.reduce((acc, curr) => acc + curr.sgpa, 0) / activeSems).toFixed(2)
                : "N/A";

            setStudentReport({
                name: studentInfo.name,
                regNumber: studentInfo.regdNo,
                branch: studentInfo.branch || "N/A",
                batch: studentInfo.batch || "N/A",
                cgpa: currentCGPA,
                sgpa: sgpaArray,
                attendance: studentInfo.attendance ? `${studentInfo.attendance}%` : "N/A",
                activeBacklogs: totalBacklogs,
                examsPending: [], // Placeholder
                semesterBacklogs: backlogHistory,
                status: totalBacklogs > 0 ? "Review Needed" : "Active - All Clear",
                email: studentInfo.email || "N/A",
                phone: studentInfo.phoneNumber || "N/A",
                uploadedResults: uploadedResults // Keep full objects for marksheet links
            });
        } catch (error) {
            console.error("Failed to fetch student report:", error);
            alert("Error fetching data. Check Console.");
        } finally {
            setIsSearchingStudent(false);
        }
    };

    const handleDownloadCSV = () => {
        const headers = ["Category,Count,Description"];
        const rows = [
            ["Flawless Career", "184", "0 Career Backlogs"],
            ["Cleared Progress", "56", "Backlogs Cleared (4yr)"],
            ["Extended Study", "12", "Not Completed (4yr)"],
            ["Total Enrollment", "252", ""],
            ["Completion Rate", "95.2%", ""],
            ["Avg. Semesters to Clear Backlogs", "1.4", ""]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join("\n") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_performance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div id="printable-area" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 print:hidden">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase text-primary bg-primary/10 rounded-full">
                    Reporting Portal
                </span>
                <h1 className="text-2xl xs:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 dark:text-white">
                    Student <span className="text-primary">Performance</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
                    Access comprehensive academic analytics, generate detailed batch reports, and track individual student progress through our unified ERP reporting interface.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 print:hidden">
                <section className="glass-card p-8 rounded-2xl transition-all hover:border-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-9xl">groups</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-primary border border-blue-500/20">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">Batch Wise Analytics</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Generate aggregated reports for entire academic batches.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="batch-select">Select Batch</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer text-white placeholder-slate-400"
                                        id="batch-select"
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                    >
                                        <option value="" disabled className="bg-slate-900 text-slate-400">Select Academic Year</option>
                                        <optgroup label="Current Batches" className="bg-slate-900 text-slate-300">
                                            <option value="Batch of 2027" className="bg-slate-900 text-white">First Year (Batch of 2027)</option>
                                            <option value="Batch of 2026" className="bg-slate-900 text-white">Second Year (Batch of 2026)</option>
                                            <option value="Batch of 2025" className="bg-slate-900 text-white">Third Year (Batch of 2025)</option>
                                            <option value="Batch of 2024" className="bg-slate-900 text-white">Fourth Year (Batch of 2024)</option>
                                        </optgroup>
                                        <optgroup label="Alumni / Passout" className="bg-slate-900 text-slate-300">
                                            <option value="Batch of 2023" className="bg-slate-900 text-white">Batch of 2023 (Passout)</option>
                                            <option value="Batch of 2022" className="bg-slate-900 text-white">Batch of 2022 (Passout)</option>
                                        </optgroup>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateBatchReport}
                                disabled={isGeneratingBatch}
                                className={`w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group ${isGeneratingBatch ? 'opacity-75 cursor-wait' : ''}`}
                            >
                                {isGeneratingBatch ? (
                                    <>
                                        <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                        Generating Report...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">picture_as_pdf</span>
                                        Generate Batch Report
                                    </>
                                )}
                            </button>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-border-dark">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Active Batches</p>
                                    <p className="text-2xl font-bold dark:text-white">12</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-border-dark">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Reports Sent</p>
                                    <p className="text-2xl font-bold dark:text-white">450+</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="glass-card p-8 rounded-2xl transition-all hover:border-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-9xl">badge</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <span className="material-symbols-outlined">badge</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">Individual Student Report</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Lookup academic records by registration ID.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="reg-number">Registration Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white placeholder:text-slate-500"
                                        id="reg-number"
                                        placeholder="Enter Roll Number (e.g. GCEK20CS042)"
                                        type="text"
                                        value={registrationNumber}
                                        onChange={(e) => setRegistrationNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleViewDetailedReport}
                                disabled={isSearchingStudent}
                                className={`w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group ${isSearchingStudent ? 'opacity-75 cursor-wait' : ''}`}
                            >
                                {isSearchingStudent ? (
                                    <>
                                        <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">insights</span>
                                        View Detailed Report
                                    </>
                                )}
                            </button>
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-border-dark">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Inquiries</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold dark:text-white">JD</div>
                                            <span className="text-sm font-medium dark:text-white">John Doe (GCEK20CS001)</span>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">8.9 CGPA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Batch Analytics Results */}
            {batchStats && (
                <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:hidden" id="results-area">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white">Report Summary: <span className="text-primary">{batchStats.batchName}</span></h2>
                            <p className="text-slate-500 text-sm mt-1">Detailed analysis based on career progression and backlog status.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadCSV}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors dark:text-white"
                            >
                                Download CSV
                            </button>
                            <button
                                onClick={handlePrintPDF}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors"
                            >
                                Print PDF
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-card p-6 rounded-2xl shadow-sm group hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">No Backlogs</p>
                                    <p className="text-xl font-bold dark:text-white">{batchStats.noCareerBacklogs}</p>
                                </div>
                            </div>
                            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clean Career Record</h3>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-3">
                                <div className="bg-green-500 h-full w-[70%] rounded-full"></div>
                            </div>
                        </div>

                        {batchStats.type === "Active" ? (
                            <div className="glass-card p-6 rounded-2xl shadow-sm group hover:border-primary/50 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                        <span className="material-symbols-outlined text-2xl">warning</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Backlogs</p>
                                        <p className="text-xl font-bold dark:text-white">{batchStats.activeBacklogs}</p>
                                    </div>
                                </div>
                                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Students with Arrears</h3>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-3">
                                    <div className="bg-amber-500 h-full w-[40%] rounded-full"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-6 rounded-2xl shadow-sm group hover:border-primary/50 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                        <span className="material-symbols-outlined text-2xl">history_edu</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cleared</p>
                                        <p className="text-xl font-bold dark:text-white">{batchStats.clearedBacklogs}</p>
                                    </div>
                                </div>
                                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Successfully Cleared</h3>
                            </div>
                        )}

                        <div className="glass-card p-6 rounded-2xl shadow-sm group hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                    <span className="material-symbols-outlined text-2xl">timer_off</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tenure Exceeded</p>
                                    <p className="text-xl font-bold dark:text-white">{batchStats.tenureExceeded}</p>
                                </div>
                            </div>
                            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Course Incomplete (4yr)</h3>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-3">
                                <div className="bg-red-500 h-full w-[15%] rounded-full"></div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl shadow-sm group hover:border-primary/50 transition-all bg-slate-50 dark:bg-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                                    <span className="material-symbols-outlined text-2xl">assignment_late</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Backlogs</p>
                                    <p className="text-xl font-bold dark:text-white">
                                        {batchStats.type === "Active" ? batchStats.totalBatchBacklogs : batchStats.totalPendingBacklogs}
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Pending Matches</h3>
                        </div>
                    </div>

                    {/* Passout Logic / Additional Details */}
                    {batchStats.type === "Passout" && (
                        <div className="glass-card rounded-2xl shadow-lg overflow-hidden border border-red-200 dark:border-red-900/30">
                            <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/10 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
                                <h3 className="font-bold text-lg text-red-700 dark:text-red-400">Passout Student Backlog Analysis</h3>
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest border border-red-200 px-2 py-1 rounded">Action Required</span>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left mobile-card-view">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-black/20">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Registration No</th>
                                                <th className="px-4 py-3">Student Name</th>
                                                <th className="px-4 py-3">Pending Subjects</th>
                                                <th className="px-4 py-3 rounded-r-lg">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                            {batchStats.passoutAnalysis.map((student, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                    <td data-label="Reg No." className="px-4 py-3 font-mono font-medium dark:text-white md:justify-start justify-end">{student.regNo}</td>
                                                    <td data-label="Name" className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 md:justify-start justify-end">{student.name}</td>
                                                    <td data-label="Subjects" className="px-4 py-3 text-red-600 dark:text-red-400 font-medium md:justify-start justify-end">
                                                        {student.pendingSubjects.join(", ")}
                                                    </td>
                                                    <td data-label="Contact" className="px-4 py-3 text-slate-500 md:justify-start justify-end">{student.contact}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Detailed Student Report Section - Only visible when studentReport is populated */}
            {studentReport && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 print:mt-0">
                    <div className="glass-card rounded-2xl overflow-hidden border border-primary/20 shadow-xl shadow-primary/5 print:shadow-none print:border-2 print:border-black print:bg-white">
                        <div className="bg-primary/10 px-8 py-6 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:border-b-2 print:border-black">
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3 print:text-black">
                                    <span className="material-symbols-outlined text-primary text-3xl print:text-black">school</span>
                                    Student Performance Report
                                </h2>
                                <p className="text-slate-500 text-sm mt-1 print:text-black">Confidential Academic Record • Generated via ERP Portal</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm border border-amber-200 dark:border-amber-800 print:border-black print:text-black print:bg-transparent overflow-visible">
                                    {studentReport.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 print:p-8">
                            {/* Bio Data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-white/5 print:border-black">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 print:text-black">Student Name</p>
                                    <p className="font-bold text-lg dark:text-white print:text-black">{studentReport.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 print:text-black">Registration No.</p>
                                    <p className="font-mono font-bold text-lg dark:text-white print:text-black">{studentReport.regNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 print:text-black">Branch / Batch</p>
                                    <p className="font-bold text-lg dark:text-white line-clamp-1 print:text-black">{studentReport.branch}</p>
                                    <p className="text-xs text-slate-400 print:text-black">{studentReport.batch}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 print:text-black">Contact Info</p>
                                    <p className="text-sm font-medium dark:text-white truncate print:text-black">{studentReport.email}</p>
                                    <p className="text-sm text-slate-500 print:text-black">{studentReport.phone}</p>
                                </div>
                            </div>

                            {/* Academic Highlights */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 print:bg-white print:border-black print:border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary print:hidden">
                                            <span className="material-symbols-outlined text-sm">grade</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black">CGPA (Overall)</p>
                                    </div>
                                    <p className="text-3xl font-black dark:text-white print:text-black">{studentReport.cgpa}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 print:bg-white print:border-black print:border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 print:hidden">
                                            <span className="material-symbols-outlined text-sm">event_available</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black">Attendance</p>
                                    </div>
                                    <p className="text-3xl font-black dark:text-white print:text-black">{studentReport.attendance}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 print:bg-white print:border-black print:border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 print:hidden">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black">Active Backlogs</p>
                                    </div>
                                    <p className="text-3xl font-black dark:text-white print:text-black">{studentReport.activeBacklogs}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 print:bg-white print:border-black print:border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 print:hidden">
                                            <span className="material-symbols-outlined text-sm">assignment_late</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black">Exams Pending</p>
                                    </div>
                                    <p className="text-3xl font-black dark:text-white print:text-black">{studentReport.examsPending.length}</p>
                                </div>
                            </div>

                            {/* Exams Pending Detail */}
                            {studentReport.examsPending.length > 0 && (
                                <div className="mb-10 p-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 print:bg-white print:border-black print:border">
                                    <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-3 print:text-black uppercase tracking-wider">⚠️ Exams Pending (Immediate Action)</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {studentReport.examsPending.map((exam, i) => (
                                            <li key={i} className="flex items-center gap-2 text-red-600 dark:text-red-300 print:text-black font-medium">
                                                <span className="material-symbols-outlined text-base">circle</span>
                                                {exam}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Semester Wise Performance & Backlogs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-4 dark:text-white print:text-black border-b border-slate-200 pb-2">Semester-wise Performance (SGPA)</h3>
                                    <div className="space-y-3">
                                        {studentReport.sgpa.map((score, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border-b border-slate-50 dark:border-white/5 print:border-slate-200">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black">Semester {index + 1}</span>
                                                <div className="flex items-center gap-2 xs:gap-4 flex-1 justify-end md:justify-start">
                                                    <div className="w-16 xs:w-32 h-2 rounded-full bg-slate-100 dark:bg-white/10 print:bg-slate-200 overflow-hidden">
                                                        <div className="h-full bg-primary print:bg-black" style={{ width: `${(score / 10) * 100}%` }}></div>
                                                    </div>
                                                    <span className="font-mono font-bold text-slate-800 dark:text-white print:text-black w-8 xs:w-10 text-right">{score}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-4 dark:text-white print:text-black border-b border-slate-200 pb-2">Semester-wise Backlog History</h3>
                                    <div className="space-y-3">
                                        {studentReport.semesterBacklogs.map((semData, index) => {
                                            const originalResult = studentReport.uploadedResults?.find(r => r.semester === semData.semester);
                                            return (
                                                <div key={index} className="p-3 rounded-lg border border-slate-100 dark:border-white/5 print:border-black group relative">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 print:text-black">Semester {semData.semester}</span>
                                                        <div className="flex items-center gap-2">
                                                            {originalResult && (
                                                                <button 
                                                                    onClick={() => window.open(`http://localhost:5000${originalResult.marksheetUrl}`, '_blank')}
                                                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1"
                                                                >
                                                                    <span className="material-symbols-outlined text-xs">file_download</span>
                                                                    Marksheet
                                                                </button>
                                                            )}
                                                            {semData.backlogs > 0 ? (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 print:bg-transparent print:text-black border print:border-black">{semData.backlogs} Backlogs</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 print:bg-transparent print:text-black border print:border-black">Cleared</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {semData.subjects.length > 0 && (
                                                        <p className="text-xs text-slate-500 print:text-black mt-1 pl-2 border-l-2 border-red-200 print:border-black">
                                                            {semData.subjects.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 text-xs text-slate-400 print:text-black text-center print:bg-white print:border-black print:border-t-2">
                            This is a computer-generated document and does not require a signature. • GCEK ERP System
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPerformance;
