import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import LeaveApprovals from '../components/LeaveApprovals';
import StudentPerformance from '../components/StudentPerformance';
import Timetable from '../components/Timetable';
import ProfileSettings from '../components/ProfileSettings';
import AIAssistant from '../components/AIAssistant';
import DashboardHeader from '../components/DashboardHeader';
import MessagingHub from './MessagingHub';
import HierarchyManagement from '../components/HierarchyManagement';
import ReportsAnalytics from '../components/ReportsAnalytics';
import FacultySenate from '../components/FacultySenate';
import { Camera, Clock, UserCheck, AlertTriangle } from 'lucide-react';

const PrincipalDashboard = () => {
    const { user, loading: authLoading } = useUser();
    const [activeSection, setActiveSection] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [staffAttendance, setStaffAttendance] = useState([]);
    const [staffStats, setStaffStats] = useState({ scheduledFacultyCount: 0, totalScheduledDuration: 0 });
    const [pendingExtensions, setPendingExtensions] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchPendingExtensions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/attendance/extensions/pending');
            if (res.ok) {
                const data = await res.json();
                setPendingExtensions(data);
            }
        } catch(e) {}
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/attendance/institutional-stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
                
                // Fetch staff attendance summary
                const staffRes = await fetch('http://localhost:5000/api/attendance/staff-summary');
                if (staffRes.ok) {
                    const staffData = await staffRes.json();
                    if (staffData.records) {
                        setStaffAttendance(staffData.records);
                        setStaffStats({
                            scheduledFacultyCount: staffData.scheduledFacultyCount || 0,
                            totalScheduledDuration: staffData.totalScheduledDuration || 0
                        });
                    } else {
                        setStaffAttendance(staffData); // fallback
                    }
                }
                
                await fetchPendingExtensions();
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        if (!authLoading && user.id && user.role !== 'Principal' && user.assignedRole !== 'Principal') {
            // Guarding Principal Dashboard
            window.location.href = '/login';
        }
    }, [user, authLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0d121b] flex flex-col items-center justify-center">
                <div className="size-12 border-4 border-primary border-t-transparent animate-spin rounded-full mb-4"></div>
                <p className="text-slate-400 font-bold animate-pulse">Restoring Session...</p>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
            <div className="flex h-screen overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" 
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 flex-shrink-0 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-border-dark flex flex-col h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative'}`}>
                    <div className="p-6 flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">GCEK ERP</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Administration Portal</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar no-scrollbar">
                        <div
                            onClick={() => { setActiveSection('overview'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined fill-[1]">analytics</span>
                            <p className="text-sm font-semibold">Institution Analytics</p>
                        </div>
                        <div
                            onClick={() => { setActiveSection('timetable'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'timetable' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">calendar_today</span>
                            <p className="text-sm font-medium">Time Table Master</p>
                        </div>
                        <div
                            onClick={() => { setActiveSection('notice-board'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'notice-board' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">campaign</span>
                            <p className="text-sm font-medium">Notice Board</p>
                        </div>
                        <div 
                            onClick={() => { setActiveSection('reports'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'reports' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">assessment</span>
                            <p className="text-sm font-medium">Reports</p>
                        </div>
                        <div
                            onClick={() => { setActiveSection('ai-assistant'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'ai-assistant' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">smart_toy</span>
                            <p className="text-sm font-medium">AI Assistant</p>
                        </div>
                        <div
                            onClick={() => { setActiveSection('performance'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'performance' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">bar_chart</span>
                            <p className="text-sm font-medium">Student Performance</p>
                        </div>
                        <div
                            onClick={() => { setActiveSection('leaves'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'leaves' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <p className="text-sm font-medium">Leave Approvals</p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-border-dark">
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Institutional Hierarchy</p>
                            <div
                                onClick={() => { setActiveSection('hierarchy'); setIsSidebarOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'hierarchy' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                            >
                                <span className="material-symbols-outlined">account_tree</span>
                                <p className="text-sm font-medium">Institutional Hierarchy</p>
                            </div>
                            <div 
                                onClick={() => { setActiveSection('faculty-senate'); setIsSidebarOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400 ${activeSection === 'faculty-senate' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                            >
                                <span className="material-symbols-outlined">group_work</span>
                                <p className="text-sm font-medium">Faculty Senate</p>
                            </div>
                        </div>
                    </nav>
                    <div className="p-4 transition-all">
                        <div className="bg-surface-dark/50 dark:bg-surface-dark p-4 rounded-xl border border-border-dark">
                            <div 
                                className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => { setActiveSection('profile'); setIsSidebarOpen(false); }}
                            >
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary"
                                    style={{ backgroundImage: `url("${user?.profileImage}")` }}
                                ></div>
                                <div className="flex flex-col overflow-hidden">
                                    <h1 className="text-white text-sm font-semibold truncate">{user?.name}</h1>
                                    <p className="text-[#92a4c9] text-[10px] font-medium uppercase tracking-tight">{user?.role}, GCEK</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setActiveSection('profile'); setIsSidebarOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                Admin Settings
                                </button>
                            <button 
                                onClick={async () => { 
                                    const res = await fetch('http://localhost:5000/api/attendance/check-missing');
                                    if (res.ok) {
                                        alert("Missing attendance check completed and notifications sent.");
                                        fetchPendingExtensions();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all mt-2"
                            >
                                <span className="material-symbols-outlined text-sm">alarm_on</span>
                                Run 6 PM Check
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
                    <DashboardHeader
                        title={activeSection === 'overview' ? 'Principal Oversight' : activeSection.replace('-', ' ')}
                        onNavigate={setActiveSection}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar relative bg-background-light dark:bg-background-dark">
                        <div className="p-4 md:p-8 min-h-full transition-all duration-300">
                            {activeSection === 'timetable' ? (
                                <Timetable />
                            ) : activeSection === 'performance' ? (
                                <StudentPerformance />
                            ) : activeSection === 'leaves' ? (
                                <LeaveApprovals role="Principal" />
                            ) : activeSection === 'notice-board' ? (
                                <MessagingHub />
                            ) : activeSection === 'reports' ? (
                                <ReportsAnalytics />
                            ) : activeSection === 'faculty-senate' ? (
                                <FacultySenate />
                            ) : activeSection === 'ai-assistant' ? (
                                <div className="h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-border-dark shadow-sm">
                                    <AIAssistant />
                                </div>
                            ) : activeSection === 'hierarchy' ? (
                                <HierarchyManagement />
                            ) : activeSection === 'profile' ? (
                                <ProfileSettings />
                            ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-gradient-to-br from-primary/20 to-surface-dark p-8 rounded-2xl border border-primary/30 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 text-primary/10">
                                            <span className="material-symbols-outlined text-9xl">insights</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="material-symbols-outlined text-primary font-bold">show_chart</span>
                                                <h3 className="text-xl font-bold dark:text-white">Overall College Performance</h3>
                                            </div>
                                            <div className="flex items-baseline gap-4 mb-6">
                                                <h4 className="text-5xl font-black dark:text-white">{statsLoading ? '...' : (stats?.overallPerformance || 0) + '%'}</h4>
                                                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                                                    <span className="material-symbols-outlined text-sm">trending_up</span> +2.1%
                                                </span>
                                            </div>
                                            <div className="space-y-4 max-w-sm">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Academic Excellence</span>
                                                    <span className="font-bold dark:text-white">{statsLoading ? '...' : (stats?.academicExcellence || 0) + '%'}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-700/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats?.academicExcellence || 0}%` }}></div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Research & Innovation</span>
                                                    <span className="font-bold dark:text-white">{statsLoading ? '...' : (stats?.researchInnovation || 0) + '%'}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-700/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats?.researchInnovation || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark shadow-xl overflow-hidden flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-amber-500 font-bold">how_to_reg</span>
                                                <h3 className="text-xl font-bold dark:text-white">Daily Staff Attendance</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full uppercase tracking-widest cursor-help" title="Based on Timetable Scheduled Faculties">
                                                    Scheduled Today: {staffStats.scheduledFacultyCount} 
                                                    ({Math.round(staffStats.totalScheduledDuration / 60)} hrs)
                                                </div>
                                                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">Live Census</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                                            <div className="space-y-3">
                                                {staffAttendance.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-400">
                                                        <Clock size={40} className="mx-auto mb-2 opacity-20" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">No staff present yet today</p>
                                                    </div>
                                                ) : (
                                                    staffAttendance.map((record) => (
                                                        <div key={record._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-background-dark/50 rounded-xl border border-slate-100 dark:border-border-dark hover:scale-[1.01] transition-transform">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden">
                                                                    {record.verificationImage ? (
                                                                        <img src={record.verificationImage} className="size-full object-cover" alt="Verified" />
                                                                    ) : record.userId?.fullName?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold dark:text-white leading-tight">{record.userId?.fullName}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-surface-dark text-slate-500 dark:text-slate-400 text-[8px] font-black rounded uppercase tracking-tighter">
                                                                            {record.userId?.role}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400">{new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${record.verificationStatus === 'Verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                    {record.verificationStatus === 'Verified' ? <UserCheck size={12} /> : <AlertTriangle size={12} />}
                                                                    {record.verificationStatus}
                                                                </span>
                                                                <p className="text-[8px] text-slate-400 mt-1 italic">
                                                                    {record.metadata?.durationTaken ? `${Math.round(record.metadata.durationTaken)} mins` : (record.metadata?.backgroundDetected || 'Unknown Bg')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-dark grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Teaching Staff</p>
                                                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{staffAttendance.filter(r => ['Faculty', 'HOD', 'Dean', 'Principal'].includes(r.userId?.role)).length}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Support Staff</p>
                                                <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{staffAttendance.filter(r => ['Registrar', 'Staff'].includes(r.userId?.role) && r.verificationStatus === 'Verified').length}</p>
                                            </div>
                                        </div>

                                        {/* Pending Extensions Alert Box */}
                                        {pendingExtensions.length > 0 && (
                                            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl space-y-3">
                                                <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">warning</span> 
                                                    Pending Missed Attendance ({pendingExtensions.length})
                                                </h4>
                                                {pendingExtensions.map(ext => (
                                                    <div key={ext._id} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-background-dark/50 rounded shadow-sm border border-slate-100 dark:border-border-dark">
                                                        <span className="font-bold">{ext.facultyId?.fullName || ext.facultyId?.name}</span>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={async () => {
                                                                    await fetch('http://localhost:5000/api/attendance/extensions/resolve', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ extensionId: ext._id, status: 'Approved' })
                                                                    });
                                                                    fetchPendingExtensions();
                                                                }}
                                                                className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded"
                                                            >Allow</button>
                                                            <button 
                                                                onClick={async () => {
                                                                    await fetch('http://localhost:5000/api/attendance/extensions/resolve', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ extensionId: ext._id, status: 'Rejected' })
                                                                    });
                                                                    fetchPendingExtensions();
                                                                }}
                                                                className="px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded"
                                                            >Reject</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-bold dark:text-white">Time Table Master Control</h3>
                                                    <p className="text-xs text-slate-400">Centralized Oversight & Conflict Resolution</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setActiveSection('timetable')} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                        Edit Master
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                                                            <th className="px-6 py-4 font-black">Department</th>
                                                            <th className="px-6 py-4 font-black">Status</th>
                                                            <th className="px-6 py-4 font-black">Last Updated</th>
                                                            <th className="px-6 py-4 font-black">Conflict Check</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                                        {['CSE', 'EE', 'ME', 'CE'].map((dept, idx) => (
                                                            <tr key={dept} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors cursor-pointer" onClick={() => setActiveSection('timetable')}>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm font-semibold dark:text-white">{dept}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${idx === 0 ? 'bg-emerald-500/10 text-emerald-500' : idx === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                        {idx === 0 ? 'FINALIZED' : idx === 1 ? 'IN REVIEW' : 'PENDING'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-[11px] text-slate-400 font-medium">Oct {23-idx}, 2023 • {10+idx}:15 AM</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`flex items-center gap-1 text-sm font-bold ${idx === 0 ? 'text-emerald-500' : idx === 1 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                        <span className="material-symbols-outlined text-sm">{idx === 0 ? 'check_circle' : idx === 1 ? 'warning' : 'info'}</span> 
                                                                        {idx === 0 ? '0 Conflicts' : idx === 1 ? '2 Conflicts' : 'N/A'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold dark:text-white">Institutional Hub</h3>
                                                <button 
                                                    onClick={() => setActiveSection('notice-board')}
                                                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-bold"
                                                >
                                                    <span className="material-symbols-outlined">campaign</span>
                                                </button>
                                            </div>
                                            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar no-scrollbar pr-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Directives & Memos</p>
                                                {[
                                                    { title: "Annual Budget Submission", tag: "Urgent", color: "red", time: "2m ago" },
                                                    { title: "NAAC Peer Team Visit", tag: "Policy", color: "blue", time: "4h ago" },
                                                    { title: "Academic Calendar Update", tag: "General", color: "emerald", time: "1d ago" }
                                                ].map((directive, i) => (
                                                    <div key={i} className="p-4 border border-slate-100 dark:border-border-dark rounded-xl hover:bg-slate-50 dark:hover:bg-background-dark/30 transition-all cursor-pointer border-l-4" style={{ borderColor: `var(--color-${directive.color}-500)` }} onClick={() => setActiveSection('notice-board')}>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className={`text-[10px] font-black text-${directive.color}-500 uppercase tracking-tighter bg-${directive.color}-500/10 px-2 py-0.5 rounded`}>{directive.tag}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold ml-auto">{directive.time}</span>
                                                        </div>
                                                        <p className="text-sm font-bold dark:text-white leading-tight">{directive.title}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setActiveSection('notice-board')}
                                                className="w-full mt-6 py-3 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
                                            >
                                                Compose Notice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PrincipalDashboard;
