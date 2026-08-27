import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Results = () => {
    const { user } = useUser();
    const [liveResults, setLiveResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [semesterResults, setSemesterResults] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        semester: '',
        sgpa: '',
        credits: '',
        backlogs: '0',
        marksheet: null
    });

    useEffect(() => {
        fetchSemesterResults();
    }, [user]);

    const fetchSemesterResults = async () => {
        if (!user?.id) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/semester-results/student/${user.id}`);
            setSemesterResults(response.data || []);
        } catch (error) {
            console.error("Failed to fetch semester results:", error);
        }
    };

    useEffect(() => {
        const fetchLiveExamResults = async () => {
            if (!user?.regdNo) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/result/student/${user.regdNo}`);
                setLiveResults(response.data || []);
            } catch (error) {
                console.error("Failed to fetch live exam results:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLiveExamResults();
    }, [user]);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const data = new FormData();
            data.append('studentId', user.id);
            data.append('branch', user.department);
            data.append('semester', formData.semester);
            data.append('sgpa', formData.sgpa);
            data.append('credits', formData.credits);
            data.append('backlogs', formData.backlogs);
            data.append('marksheet', formData.marksheet);

            await axios.post('http://localhost:5000/api/semester-results', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsUploadModalOpen(false);
            setFormData({ semester: '', sgpa: '', credits: '', backlogs: '0', marksheet: null });
            fetchSemesterResults();
            alert("Result uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            alert(error.response?.data?.message || "Failed to upload result");
        } finally {
            setUploading(false);
        }
    };

    const currentCGPA = (semesterResults.reduce((acc, curr) => acc + curr.sgpa, 0) / semesterResults.length).toFixed(2);
    const totalBacklogs = semesterResults.reduce((acc, curr) => acc + curr.backlogs, 0);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        // Add a nice border around page
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277); 
        
        // Header Background
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(10, 10, 190, 30, 'F');
        doc.rect(10, 10, 190, 30, 'S'); // Top box border

        // Header Text
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("Government College of Engineering, Kalahandi", 105, 24, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("ACADEMIC PERFORMANCE REPORT", 105, 32, { align: "center" });

        // Divider
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.5);
        doc.line(10, 45, 200, 45);

        // Student Details Section
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont("helvetica", "bold");
        doc.text("STUDENT PROFILE", 15, 55);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Name:`, 15, 63);
        doc.setFont("helvetica", "bold");
        doc.text(`${user.name || 'N/A'}`, 40, 63);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Roll No:`, 15, 70);
        doc.setFont("helvetica", "bold");
        doc.text(`${user.regdNo || 'N/A'}`, 40, 70);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Program:`, 15, 77);
        doc.setFont("helvetica", "bold");
        doc.text(`B.Tech (${user.department || 'N/A'})`, 40, 77);

        // Stats Box (Right Side)
        doc.setFillColor(240, 249, 255); // sky-50
        doc.setDrawColor(186, 230, 253); // sky-200
        doc.rect(130, 52, 60, 28, 'FD'); // Fill and border

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`Overall CGPA:`, 135, 62);
        doc.setFontSize(14);
        doc.setTextColor(2, 132, 199); // sky-600
        doc.text(`${currentCGPA || 'N/A'}`, 170, 62);

        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Active Backlogs:`, 135, 74);
        doc.setFontSize(12);
        doc.setTextColor(totalBacklogs > 0 ? 220 : 16, totalBacklogs > 0 ? 38 : 185, totalBacklogs > 0 ? 38 : 129); // red or emerald
        doc.text(`${totalBacklogs}`, 170, 74);

        // Semester Records Table Header
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("SEMESTER RECORDS", 15, 95);

        // Table Data
        const tableColumn = ["Semester", "SGPA", "Credits", "Status", "Backlogs"];
        const tableRows = semesterResults.map((result) => [
            `Semester ${result.semester}`,
            result.sgpa,
            result.credits || '-',
            result.status,
            result.backlogs > 0 ? result.backlogs : '-'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 100,
            theme: 'striped',
            headStyles: { 
                fillColor: [15, 23, 42], // slate-900
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                textColor: [51, 65, 85], // slate-700
                halign: 'center',
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // slate-50
            },
            styles: {
                lineColor: [226, 232, 240], // slate-200
                lineWidth: 0.1,
            },
            margin: { left: 15, right: 15 }
        });

        // Footer
        const date = new Date().toLocaleDateString();
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`This is a computer-generated document and does not require a physical signature. Details retrieved on: ${date}`, 105, 280, { align: "center" });

        doc.save(`${user.name ? user.name.replace(' ', '_') : 'Student'}_Results.pdf`);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Results</h2>
                    <p className="text-slate-500 dark:text-slate-400">View your performance across all semesters.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Add Result
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20"
                    >
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Key Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <p className="text-blue-100 text-sm font-medium mb-1">Current CGPA</p>
                    <h3 className="text-4xl font-bold">{currentCGPA}</h3>
                    <p className="text-blue-100 text-xs mt-2">Aggregated up to 5th Sem</p>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Backlogs</p>
                            <h3 className={`text-4xl font-bold ${totalBacklogs > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {totalBacklogs}
                            </h3>
                            <p className="text-slate-400 text-xs mt-2">{totalBacklogs === 0 ? 'All Clear!' : 'Need attention'}</p>
                        </div>
                        <div className={`p-3 rounded-full ${totalBacklogs > 0 ? 'bg-red-50 dark:bg-red-900/10 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500'}`}>
                            <span className="material-symbols-outlined">{totalBacklogs > 0 ? 'warning' : 'verified'}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Credits</p>
                            <h3 className="text-4xl font-bold text-slate-900 dark:text-white">
                                {semesterResults.reduce((acc, curr) => acc + (Number(curr.credits) || 0), 0)}
                            </h3>
                            <p className="text-slate-400 text-xs mt-2">Earned so far</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/10 text-purple-500">
                            <span className="material-symbols-outlined">workspace_premium</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Upload Semester Result</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                                    >
                                        <option value="">Select</option>
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SGPA</label>
                                    <input 
                                        type="number" step="0.01" min="0" max="10" required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                        placeholder="e.g. 8.5"
                                        value={formData.sgpa}
                                        onChange={(e) => setFormData({...formData, sgpa: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Credits</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                        placeholder="e.g. 24"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({...formData, credits: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Backlogs</label>
                                    <input 
                                        type="number" min="0"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                        placeholder="0"
                                        value={formData.backlogs}
                                        onChange={(e) => setFormData({...formData, backlogs: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marksheet (PDF/Image)</label>
                                <div className="relative">
                                    <input 
                                        type="file" required accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setFormData({...formData, marksheet: e.target.files[0]})}
                                        className="hidden" id="marksheet-upload"
                                    />
                                    <label 
                                        htmlFor="marksheet-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-xl bg-slate-50 dark:bg-background-dark hover:bg-slate-100 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-primary">upload_file</span>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {formData.marksheet ? formData.marksheet.name : 'Click to select file'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Uploading...</>
                                ) : (
                                    <>Submit Result</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Semester Wise List */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-border-dark">
                    <h3 className="font-bold text-lg dark:text-white">Semester-wise Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Semester</th>
                                <th className="px-6 py-4 font-semibold">SGPA</th>
                                <th className="px-6 py-4 font-semibold">Credits</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Backlogs</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                            {semesterResults.map((result) => (
                                <tr key={result.semester} className="hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Semester {result.semester}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{result.sgpa}</td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{result.credits}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.status === 'Pass'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                            {result.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {result.backlogs > 0 ? (
                                            <span className="text-red-500 font-bold">{result.backlogs}</span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000${result.marksheetUrl}`, '_blank')}
                                            className="text-primary hover:text-primary/70 text-sm font-medium hover:underline flex items-center gap-1 justify-end ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            View Marksheet
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Live Exam Scores (Real Data) */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden mt-8">
                    <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Recent Exam Scores
                        </h3>
                    </div>
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 animate-pulse">Loading exam scores...</div>
                    ) : liveResults.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
                            <p>No individual exam scores uploaded for you yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Subject</th>
                                        <th className="px-6 py-4 font-semibold">Exam Type</th>
                                        <th className="px-6 py-4 font-semibold">Marks Obtained</th>
                                        <th className="px-6 py-4 font-semibold">Max Marks</th>
                                        <th className="px-6 py-4 font-semibold">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {liveResults.map((result, idx) => {
                                        const percentage = result.maxMarks > 0 ? ((result.marksObtained / result.maxMarks) * 100).toFixed(1) : 0;
                                        let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
                                        if (percentage < 40) badgeColor = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'; // Fail
                                        else if (percentage < 60) badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'; // Avg

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(result.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{result.subject}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{result.examType}</td>
                                                <td className="px-6 py-4 font-bold">{result.marksObtained}</td>
                                                <td className="px-6 py-4 text-slate-500">{result.maxMarks}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                                                        {percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;
