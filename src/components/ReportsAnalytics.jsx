import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { Download, TrendingUp, Users, BookOpen, FileSpreadsheet, Building2, GraduationCap, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import * as XLSX from 'xlsx';
import AttendanceSheet from './AttendanceSheet';

const ReportsAnalytics = () => {
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'students', 'faculty', 'attendance', 'hierarchy'
    const [selectedSemester, setSelectedSemester] = useState('All');
    const [selectedBranch, setSelectedBranch] = useState('CSE');
    const [realStats, setRealStats] = useState({ totalClasses: "0", overallPercentage: "0", totalStudents: "0", facultyCount: "0" });
    const [studentsData, setStudentsData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [semesterPerformance, setSemesterPerformance] = useState([]);
    const [facultyData, setFacultyData] = useState([]);
    const [hierarchyStats, setHierarchyStats] = useState([]);
    const [branchPerformance, setBranchPerformance] = useState([]);
    const [topFaculty, setTopFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    const branches = ['All', 'CSE', 'EE', 'ME', 'CE'];

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                if (selectedBranch === 'All') {
                    // Fetch Institutional Stats
                    const res = await axios.get('http://localhost:5000/api/attendance/institutional-stats');
                    setRealStats({
                        totalClasses: "N/A", 
                        overallPercentage: res.data.overallAttendance.toString(),
                        totalStudents: res.data.totalStudents.toString(),
                        facultyCount: res.data.totalTeachingStaff.toString()
                    });
                    setAttendanceData(res.data.attendanceTrends);
                    setBranchPerformance(res.data.branchPerformance);
                    setTopFaculty(res.data.topFaculty);
                    setFacultyData(res.data.topFaculty); // Use for the faculty tab when "All" is selected
                    setSemesterPerformance([]); 
                } else {
                    // Fetch Branch-specific Stats
                    const params = { branch: selectedBranch };
                    if (selectedSemester !== 'All') {
                        params.semester = `${selectedSemester} Sem`;
                    }
                    const response = await axios.get('http://localhost:5000/api/attendance/stats', { params });
                    setRealStats({
                        totalClasses: response.data.totalClasses.toString(),
                        overallPercentage: response.data.overallPercentage.toString(),
                        totalStudents: response.data.totalStudents.toString(),
                        facultyCount: response.data.facultyCount.toString()
                    });
                    if (response.data.studentsData) setStudentsData(response.data.studentsData);
                    if (response.data.attendanceData) setAttendanceData(response.data.attendanceData);
                    if (response.data.semesterPerformance) setSemesterPerformance(response.data.semesterPerformance);
                    if (response.data.facultyData) setFacultyData(response.data.facultyData);
                }

                // Fetch real Hierarchy Stats (HODs/Deans)
                const leaderResponse = await axios.get('http://localhost:5000/api/feedback/performance-metrics');
                const leaders = leaderResponse.data
                    .filter(f => f.role.includes('HOD') || f.role.includes('Dean'))
                    .map(l => ({
                        name: l.name,
                        role: l.role,
                        branch: l.dept,
                        attendance: 'Real-time',
                        academicPerf: l.rating !== "N/A" ? l.rating : "8.0", // Fallback for display
                        status: l.status
                    }));
                setHierarchyStats(leaders);

            } catch (error) {
                console.error("Failed to fetch real analytics stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedSemester, selectedBranch]);

    // --- Export Logic ---

    const exportToExcel = () => {
        let exportData = [];
        let sheetName = "Report";

        if (activeTab === 'students') {
            exportData = studentsData;
            sheetName = `Students_${selectedBranch}`;
        } else if (activeTab === 'faculty') {
            exportData = facultyData;
            sheetName = `Faculty_${selectedBranch}`;
        } else if (activeTab === 'analytics' && selectedBranch === 'All') {
            // Special case: Institutional BI Export
            exportData = branchPerformance.map(b => ({
                Branch: b.name,
                'Avg Attendance %': b.attendance,
                'Avg Performance %': b.performance,
                'Student Strength': b.students
            }));
            sheetName = "Institutional_Comparison";
        } else {
            exportData = studentsData.length > 0 ? studentsData : facultyData;
        }
        
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const exportStudentReport = () => {
        const doc = new jsPDF();
        doc.text("Student Performance Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Semester: ${selectedSemester} | Department: ${selectedBranch}`, 14, 22);

        const tableColumn = ["Roll No", "Name", "Semester", "Attendance (%)", "CGPA", "Status"];
        const tableRows = [];

        const filteredStudents = studentsData.filter(student =>
            (selectedSemester === 'All' || student.sem === selectedSemester)
        );

        filteredStudents.forEach(student => {
            const tableRow = [
                student.roll,
                student.name,
                student.sem,
                `${student.att}%`,
                student.cgpa,
                student.status
            ];
            tableRows.push(tableRow);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
        });

        doc.save(`Student_Report_${selectedBranch}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const exportFacultyReport = () => {
        const doc = new jsPDF();
        doc.text("Faculty Performance Report", 14, 15);
        doc.text(`Department: ${selectedBranch}`, 14, 22);

        const tableColumn = ["Name", "Designation", "Department", "Classes Taken", "Student Rating"];
        const tableRows = [];

        facultyData.forEach(fac => {
            const tableRow = [
                fac.name,
                fac.desig,
                fac.dept,
                fac.classes,
                fac.rating
            ];
            tableRows.push(tableRow);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'striped',
            headStyles: { fillColor: [66, 133, 244] }
        });

        doc.save(`Faculty_Report_${selectedBranch}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-12 text-center text-slate-500">
                <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-primary">progress_activity</span>
                    <p className="font-semibold">Loading real-time analytics data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-border-dark pb-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Reports & Analytics</h1>
                    <p className="text-slate-500 text-sm">Comprehensive insights and exportable reports</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-background-dark p-1 rounded-lg overflow-x-auto custom-scrollbar no-scrollbar">
                    {['analytics', 'students', 'faculty', 'attendance', 'hierarchy'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-white dark:bg-surface-dark shadow-sm text-primary'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab === 'attendance' ? 'Registers' : tab === 'hierarchy' ? 'HODs & Deans' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Branch Selection (for Principal viewpoint) */}
            {['analytics', 'students', 'faculty', 'attendance'].includes(activeTab) && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {branches.map(branch => (
                        <button 
                            key={branch}
                            onClick={() => setSelectedBranch(branch)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedBranch === branch 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-slate-100 dark:bg-background-dark text-slate-500 hover:bg-slate-200 dark:hover:bg-surface-dark'}`}
                        >
                            {branch}
                        </button>
                    ))}
                </div>
            )}

            {/* 1. Analytics Dashboard */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark flex items-center gap-4">
                            <div className="p-3 rounded-lg text-white bg-blue-500">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Total Students</p>
                                <h3 className="text-2xl font-bold dark:text-white">{realStats.totalStudents}</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark flex items-center gap-4">
                            <div className="p-3 rounded-lg text-white bg-emerald-500">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Avg Attendance</p>
                                <h3 className="text-2xl font-bold dark:text-white">{realStats.overallPercentage}%</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark flex items-center gap-4">
                            <div className="p-3 rounded-lg text-white bg-purple-500">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Classes Conducted</p>
                                <h3 className="text-2xl font-bold dark:text-white">{realStats.totalClasses}</h3>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark flex items-center gap-4">
                            <div className="p-3 rounded-lg text-white bg-orange-500">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Faculty Count</p>
                                <h3 className="text-2xl font-bold dark:text-white">{realStats.facultyCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark h-[350px]">
                            <h3 className="font-bold mb-4 dark:text-slate-200">Attendance Trends (Last 5 Months)</h3>
                            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="student" name="Student %" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="faculty" name="Faculty %" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-border-dark h-[350px]">
                            <h3 className="font-bold mb-4 dark:text-slate-200">
                                {selectedBranch === 'All' ? 'Branch-wise Performance Comparison' : 'Semester-wise Performance'}
                            </h3>
                            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {selectedBranch === 'All' ? (
                                        <BarChart data={branchPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend />
                                            <Bar dataKey="performance" name="Performance %" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="attendance" name="Attendance %" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <BarChart data={semesterPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend />
                                            <Bar dataKey="avgCGPA" name="Avg CGPA" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="attendance" name="Avg Attendance %" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    
                    {selectedBranch === 'All' && (
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-border-dark overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center">
                                <h3 className="font-bold dark:text-slate-200">Top Performing Faculty (Institution-wide)</h3>
                                <button onClick={() => setActiveTab('faculty')} className="text-xs font-bold text-primary hover:underline">View All Analysis</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 font-bold">Faculty Name</th>
                                            <th className="px-6 py-3 font-bold">Department</th>
                                            <th className="px-6 py-3 font-bold text-center">Rating</th>
                                            <th className="px-6 py-3 font-bold">Consistency</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                        {topFaculty.slice(0, 5).map((fac, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                                <td className="px-6 py-3 text-sm font-semibold dark:text-slate-200">{fac.name}</td>
                                                <td className="px-6 py-3 text-sm text-slate-500">{fac.dept}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-sm">
                                                        <span>{fac.rating}</span>
                                                        <Star size={12} className="fill-orange-400" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${fac.rating * 20}%` }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Attendance Register Tab content */}
            {activeTab === 'attendance' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Semester</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg px-4 py-2.5 outline-none dark:text-white"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                <option value="All">All Semesters</option>
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="3rd">3rd Semester</option>
                                <option value="4th">4th Semester</option>
                                <option value="5th">5th Semester</option>
                                <option value="6th">6th Semester</option>
                                <option value="7th">7th Semester</option>
                                <option value="8th">8th Semester</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Subject</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg px-4 py-2.5 outline-none dark:text-white"
                                id="hod-subject-select"
                            >
                                <option value="COA">Computer Organization & Architecture (COA)</option>
                                <option value="OS">Operating Systems (OS)</option>
                                <option value="CN">Computer Networks (CN)</option>
                            </select>
                        </div>
                    </div>

                    {selectedSemester !== 'All' ? (
                        <AttendanceSheet 
                            branch={selectedBranch}
                            semester={`${selectedSemester} Sem`}
                            subject={document.getElementById('hod-subject-select')?.value || 'COA'}
                        />
                    ) : (
                        <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                            Please select a semester to view the interactive attendance register.
                        </div>
                    )}
                </div>
            )}

            {/* 2. Student Reports */}
            {activeTab === 'students' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-border-dark overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="font-bold text-lg dark:text-white">Student Academic Records</h2>
                            <select 
                                className="p-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:outline-none"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                <option value="All">All Semesters</option>
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="3rd">3rd Semester</option>
                                <option value="4th">4th Semester</option>
                                <option value="5th">5th Semester</option>
                                <option value="6th">6th Semester</option>
                                <option value="7th">7th Semester</option>
                                <option value="8th">8th Semester</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                            >
                                <FileSpreadsheet size={16} /> Export Excel
                            </button>
                            <button 
                                onClick={exportStudentReport}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                            >
                                <Download size={16} /> Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Roll No</th>
                                    <th className="px-6 py-4 font-bold">Name</th>
                                    <th className="px-6 py-4 font-bold">Semester</th>
                                    <th className="px-6 py-4 font-bold">Attendance</th>
                                    <th className="px-6 py-4 font-bold">CGPA</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                {studentsData
                                    .filter(s => selectedSemester === 'All' || s.sem === selectedSemester)
                                    .map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{student.roll}</td>
                                        <td className="px-6 py-4 font-medium dark:text-slate-200">{student.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{student.sem}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${student.att >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                                        style={{ width: `${student.att}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold">{student.att}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold dark:text-slate-300">{student.cgpa}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                student.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : 
                                                student.status === 'Good' ? 'bg-blue-100 text-blue-700' : 
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. Faculty Reports */}
            {activeTab === 'faculty' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-border-dark overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center">
                        <h2 className="font-bold text-lg dark:text-white">Faculty Performance Benchmarking</h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                            >
                                <FileSpreadsheet size={16} /> Export Excel
                            </button>
                            <button 
                                onClick={exportFacultyReport}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                            >
                                <Download size={16} /> Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Faculty Name</th>
                                    <th className="px-6 py-4 font-bold">Designation</th>
                                    <th className="px-6 py-4 font-bold">Department</th>
                                    <th className="px-6 py-4 font-bold text-center">Classes Taken</th>
                                    <th className="px-6 py-4 font-bold text-center">Student Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                {facultyData.map((fac) => (
                                    <tr key={fac.id} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                        <td className="px-6 py-4 font-medium dark:text-slate-200">{fac.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{fac.desig}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{fac.dept}</td>
                                        <td className="px-6 py-4 text-sm font-bold dark:text-slate-300 text-center">{fac.classes}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-sm">
                                                <span>{fac.rating}</span>
                                                <Star className="text-sm fill-orange-400" size={14} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 4. Hierarchy Performance (Deans & HODs) */}
            {activeTab === 'hierarchy' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-border-dark overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-border-dark">
                            <h2 className="font-bold text-lg dark:text-white">Leadership Performance (Deans & HODs)</h2>
                            <p className="text-slate-500 text-sm">Oversight of departmental heads and academic deans</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Leader Name</th>
                                        <th className="px-6 py-4 font-bold">Role</th>
                                        <th className="px-6 py-4 font-bold">Branch Oversight</th>
                                        <th className="px-6 py-4 font-bold text-center">Dept. Attendance</th>
                                        <th className="px-6 py-4 font-bold text-center">Academic Index</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                    {hierarchyStats.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                            <td className="px-6 py-4 font-medium dark:text-slate-200">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{item.role}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-bold">{item.branch}</td>
                                            <td className="px-6 py-4 text-sm font-bold dark:text-slate-300 text-center">{item.attendance}</td>
                                            <td className="px-6 py-4 text-sm font-bold dark:text-slate-300 text-center">{item.academicPerf} / 10</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    item.status === 'Exceptional' ? 'bg-emerald-100 text-emerald-700' : 
                                                    item.status === 'Exceeding' ? 'bg-blue-100 text-blue-700' : 
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Hierarchy BI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Building2 size={24} />
                                <h3 className="font-bold">Institutional Health</h3>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-indigo-100 text-xs uppercase font-bold">Overall Dept. Score</p>
                                    <h4 className="text-3xl font-black">8.2 / 10</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-indigo-100 text-xs font-bold">+12% vs LY</p>
                                    <div className="w-24 h-1 bg-white/30 rounded-full mt-1">
                                        <div className="h-full bg-white rounded-full" style={{ width: '82%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <GraduationCap size={24} />
                                <h3 className="font-bold">Academic Readiness</h3>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-emerald-100 text-xs uppercase font-bold">Avg. Student Success</p>
                                    <h4 className="text-3xl font-black">88.5%</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-100 text-xs font-bold">+5.2% Trend</p>
                                    <div className="w-24 h-1 bg-white/30 rounded-full mt-1">
                                        <div className="h-full bg-white rounded-full" style={{ width: '88%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsAnalytics;
