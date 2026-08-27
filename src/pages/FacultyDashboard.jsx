import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { useUser } from '../context/UserContext';
import StudentPerformance from '../components/StudentPerformance';
import MyClasses from '../components/MyClasses';
import ResultUpload from '../components/ResultUpload';
import FacultyAttendance from '../components/FacultyAttendance';
import AIAssistant from '../components/AIAssistant';
import Timetable from '../components/Timetable';
import FeedbackManager from '../components/FeedbackManager';
import MessagingHub from './MessagingHub';
import ProfileSettings from '../components/ProfileSettings';
import ReportsAnalytics from '../components/ReportsAnalytics';
import LeaveApplication from '../components/LeaveApplication';
import LeaveApprovals from '../components/LeaveApprovals';
import axios from 'axios';

const FacultyDashboard = () => {
    const { user, loading: authLoading } = useUser();
    const [activeSection, setActiveSection] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && user.id && (user.role !== 'Faculty' && user.role !== 'HOD')) {
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

    // Use /dashboard as base title if overview


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
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight uppercase tracking-tight">GCEK ERP</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">FACULTY PORTAL</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                        <div
                            onClick={() => setActiveSection('dashboard')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined fill-[1]">dashboard</span>
                            <p className="text-sm font-semibold">Dashboard</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('myclasses')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'myclasses' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">calendar_month</span>
                            <p className="text-sm font-medium">My Classes</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('attendance')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'attendance' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">how_to_reg</span>
                            <p className="text-sm font-medium">Mark Attendance</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('result_upload')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'result_upload' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                            <p className="text-sm font-medium">Result Upload</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('timetable')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'timetable' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">calendar_month</span>
                            <p className="text-sm font-medium">Time Table</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('feedback')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'feedback' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">feedback</span>
                            <p className="text-sm font-medium">Feedback</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('performance')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'performance' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">bar_chart</span>
                            <p className="text-sm font-medium">Student Performance</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('notice-board')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400 ${activeSection === 'notice-board' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                        >
                            <span className="material-symbols-outlined">campaign</span>
                            <p className="text-sm font-medium">Notice Board</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('ai-assistant')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'ai-assistant' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">smart_toy</span>
                            <p className="text-sm font-medium">AI Assistant</p>
                        </div>
                        {(user?.role?.includes('Registrar') || user?.assignedRole?.includes('Registrar')) && (
                            <div
                                onClick={() => setActiveSection('registrar_approvals')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'registrar_approvals' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                            >
                                <span className="material-symbols-outlined">verified_user</span>
                                <p className="text-sm font-bold">Leave Approvals (Registrar)</p>
                            </div>
                        )}
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-border-dark">
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Personal</p>
                            <div
                                onClick={() => setActiveSection('attendance-stats')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400 ${activeSection === 'attendance-stats' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                            >
                                <span className="material-symbols-outlined">analytics</span>
                                <p className="text-sm font-medium">Attendance Stats</p>
                            </div>
                            <div
                                onClick={() => setActiveSection('academic-leave')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400 ${activeSection === 'academic-leave' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                            >
                                <span className="material-symbols-outlined">event_busy</span>
                                <p className="text-sm font-medium">Academic Leave</p>
                            </div>
                            <div
                                onClick={() => setActiveSection('settings')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400 ${activeSection === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                            >
                                <span className="material-symbols-outlined">settings</span>
                                <p className="text-sm font-medium">Settings</p>
                            </div>
                        </div>
                    </nav>
                    <div className="p-4">
                        <div className="bg-surface-dark/50 dark:bg-surface-dark p-4 rounded-xl border border-border-dark/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA72mIiUi8Kuy-TGJSnozxpAbOJBI_RQJLU0Ee8hefgRxkM0jdBjoUekPcXfAQ4fiaWpiZJDm1NekyUXmouJiykqw7GI_sU4mh24DuYGafli2RXnWmb55D9KKkrFj3y422Bz_Y-DZsbGeMp0X-hUN-knoT2SXfn275TYussvYYv1WBks4PFPZPgHoPmyoeLAdu8wJCSGSnwfTV5Ob3Qi6G0H_EQ1nzFzJ7Bv2QAloIYiUPUHGSGBmXfncJoWdUIQl1i6hpOpWeZtAE")' }}
                                ></div>
                                <div className="flex flex-col overflow-hidden">
                                    <h1 className="text-white text-sm font-semibold truncate">{user?.name}</h1>
                                    <p className="text-[#92a4c9] text-[10px] font-medium uppercase tracking-tight">{user?.assignedRole && user.assignedRole !== 'None' ? `${user?.role} (${user?.assignedRole})` : user?.role}</p>
                                </div>
                            </div>
                            <button onClick={() => window.location.href = '/login'} className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all">
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <DashboardHeader
                        title={activeSection === 'dashboard' ? `Faculty ${user?.role && !user.role.includes('Professor') && !user.role.includes('Lecturer') ? `(${user.role})` : ''} Dashboard` : activeSection.replace('-', ' ')}
                        onNavigate={setActiveSection}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background-light dark:bg-background-dark">
                        <div className="p-4 md:p-8 min-h-full">
                            {activeSection === 'performance' ? (
                                <StudentPerformance />
                            ) : activeSection === 'attendance-stats' ? (
                                <ReportsAnalytics />
                            ) : activeSection === 'myclasses' ? (
                                <MyClasses />
                            ) : activeSection === 'result_upload' ? (
                                <ResultUpload />
                            ) : activeSection === 'attendance' ? (
                                <FacultyAttendance />
                            ) : activeSection === 'timetable' ? (
                                <Timetable />
                            ) : activeSection === 'feedback' ? (
                                <FeedbackManager />
                            ) : activeSection === 'notice-board' ? (
                                <MessagingHub />
                            ) : activeSection === 'settings' ? (
                                <ProfileSettings />
                            ) : activeSection === 'ai-assistant' ? (
                                <div className="h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-border-dark shadow-sm">
                                    <AIAssistant />
                                </div>
                            ) : activeSection === 'academic-leave' ? (
                                <LeaveApplication viewRole="Faculty" />
                            ) : activeSection === 'registrar_approvals' && (user?.role?.includes('Registrar') || user?.assignedRole?.includes('Registrar')) ? (
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold dark:text-white mb-2">Faculty Leave Approvals</h3>
                                        <p className="text-slate-500 dark:text-slate-400">As Registrar, you can review and audit faculty leave applications before final Principal approval.</p>
                                    </div>
                                    <LeaveApprovals role="Registrar" />
                                </div>
                            ) : (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold dark:text-white">Good morning, {user?.name || 'Faculty'}</h2>
                                        <p className="text-slate-500 dark:text-slate-400">You are assigned to cover {user?.teachingAssignments?.length || 0} subjects this semester.</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white dark:bg-surface-dark p-3 rounded-xl border border-slate-200 dark:border-border-dark">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Day Access</span>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-emerald-500 text-sm">lock_open</span>
                                                <span className="text-sm font-semibold text-emerald-500">ENABLED BY HOD</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 space-y-8">
                                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-background-dark/30">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-primary">how_to_reg</span>
                                                    <h3 className="font-bold dark:text-white">Mark Daily Attendance</h3>
                                                </div>
                                                <div className="flex gap-2">
                                                    <select className="bg-white dark:bg-background-dark border-slate-200 dark:border-border-dark text-xs rounded-lg px-3 py-1.5 focus:ring-primary dark:text-slate-200">
                                                        {user?.teachingAssignments?.length > 0 ? (
                                                            user.teachingAssignments.map((assignment, idx) => (
                                                                <option key={idx} value={assignment.subject}>
                                                                    {assignment.subject} ({assignment.branch} - {assignment.semester})
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option>No Subjects Assigned</option>
                                                        )}
                                                    </select>
                                                    <button onClick={() => setActiveSection('attendance')} className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-primary/90">Take Attendance</button>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-background-dark/50 border border-slate-100 dark:border-border-dark">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Subject</p>
                                                        <p className="text-sm font-bold dark:text-white">{user?.teachingAssignments?.[0]?.subject || "N/A"}</p>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-background-dark/50 border border-slate-100 dark:border-border-dark">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Branch & Sem</p>
                                                        <p className="text-sm font-bold dark:text-white">
                                                            {user?.teachingAssignments?.[0] ? `${user.teachingAssignments[0].branch} - ${user.teachingAssignments[0].semester}` : "N/A"}
                                                        </p>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-background-dark/50 border border-slate-100 dark:border-border-dark">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Room No.</p>
                                                        <button onClick={() => setActiveSection('timetable')} className="text-sm font-bold dark:text-white hover:underline text-left">Check Timetable</button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        <span className="font-medium">All past attendance records are completely up to date.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-primary">analytics</span>
                                                    <h3 className="font-bold dark:text-white">Upload Marks (Internal/Assignment)</h3>
                                                </div>
                                                <button onClick={() => setActiveSection('result_upload')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">upload_file</span> Go to Result Upload
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left mobile-card-view">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">
                                                            <th className="px-6 py-4 font-bold">Student Name</th>
                                                            <th className="px-6 py-4 font-bold">Roll Number</th>
                                                            <th className="px-6 py-4 font-bold">Internal-I (20)</th>
                                                            <th className="px-6 py-4 font-bold">Assignment (10)</th>
                                                            <th className="px-6 py-4 font-bold">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                                        <tr>
                                                            <td data-label="Status" colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                                <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">group_off</span>
                                                                No student data currently available for this section.
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-background-dark/20 border-t border-slate-100 dark:border-border-dark flex justify-end">
                                                <button onClick={() => setActiveSection('result_upload')} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Go to Result Upload</button>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                            <h3 className="text-lg font-bold mb-6 dark:text-white">Personal Attendance</h3>
                                            <div className="flex items-end gap-4 mb-6">
                                                <div className="text-4xl font-bold text-slate-400">--%</div>
                                                <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1">
                                                    Pending
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-slate-500 dark:text-slate-400">Monthly Target</span>
                                                        <span className="font-bold dark:text-white">--/-- Days</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                        <div className="h-full bg-slate-200 dark:bg-border-dark" style={{ width: '0%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-slate-50 dark:bg-background-dark/50 rounded-lg">
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Casual Leaves</p>
                                                        <p className="text-lg font-bold dark:text-white">--/--</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-background-dark/50 rounded-lg">
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Bio-Metric Sync</p>
                                                        <p className="text-lg font-bold text-slate-500">OFFLINE</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col h-[400px]">
                                            <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary">campaign</span>
                                                    <h3 className="font-bold dark:text-white">Notice Board</h3>
                                                </div>
                                                <span className="bg-slate-200 dark:bg-border-dark text-[10px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">New</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-border-dark mb-2">campaign</span>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">No active notices or messages right now.</p>
                                            </div>
                                            <div className="p-4 border-t border-slate-200 dark:border-border-dark">
                                                <button
                                                    onClick={() => setActiveSection('notice-board')}
                                                    className="w-full py-2 bg-slate-100 dark:bg-background-dark text-xs font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all dark:text-slate-300"
                                                >
                                                    Go to Communication Hub
                                                </button>
                                            </div>
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

export default FacultyDashboard;
