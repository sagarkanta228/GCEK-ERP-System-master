import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import Timetable from '../components/Timetable';
import ProfileSettings from '../components/ProfileSettings';
import FacultyManagement from '../components/FacultyManagement';
import ReportsAnalytics from '../components/ReportsAnalytics';
import StudentPerformance from '../components/StudentPerformance';
import StudentManagement from '../components/StudentManagement';
import AIAssistant from '../components/AIAssistant';
import FeedbackManager from '../components/FeedbackManager';
import LeaveApprovals from '../components/LeaveApprovals';
import LeaveApplication from '../components/LeaveApplication';
import CourseManagement from '../components/CourseManagement';
import DashboardHeader from '../components/DashboardHeader';
import MessagingHub from './MessagingHub';
import { X, Check } from 'lucide-react';
import axios from 'axios';
import StaffAttendanceModal from '../components/StaffAttendanceModal';

const HODDashboard = () => {
    const { user, loading: authLoading, logout } = useUser();
    const [activeSection, setActiveSection] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && user.id && user.role !== 'HOD') {
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

    // Overview Data States
    const [facultyList, setFacultyList] = useState([]);
    const [studentCount, setStudentCount] = useState('--');
    const [loadingOverview, setLoadingOverview] = useState(true);

    useEffect(() => {
        if (user?.department && activeSection === 'overview') {
            fetchOverviewData();
        }
    }, [user, activeSection]);

    const fetchOverviewData = async () => {
        setLoadingOverview(true);
        try {
            // Fetch Faculty for this passing HOD's department
            const facultyRes = await axios.get(`http://localhost:5000/api/users?role=Faculty&department=${user.department}`);
            setFacultyList(facultyRes.data);

            // Fetch Students for this passing HOD's department (branch)
            const studentsRes = await axios.get(`http://localhost:5000/api/students?branch=${user.department}`);
            setStudentCount(studentsRes.data.length);

        } catch (error) {
            console.error("Error fetching overview data:", error);
        } finally {
            setLoadingOverview(false);
        }
    };

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
                            <h1 className="text-lg font-bold leading-tight">GCEK ERP</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Govt. College of Engg.</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                        <div
                            onClick={() => setActiveSection('overview')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined fill-[1]">dashboard</span>
                            <p className="text-sm font-semibold">Department Overview</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('faculty')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'faculty' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">badge</span>
                            <p className="text-sm font-medium">Faculty Management</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('courses')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'courses' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">menu_book</span>
                            <p className="text-sm font-medium">Course Management</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('timetable')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'timetable' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">calendar_month</span>
                            <p className="text-sm font-medium">Time Table</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('students')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'students' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <p className="text-sm font-medium">Student Records</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('feedback')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'feedback' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">feedback</span>
                            <p className="text-sm font-medium">Feedback</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('leaves')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'leaves' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <p className="text-sm font-medium">Leave Approvals</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('academic-leave')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400 ${activeSection === 'academic-leave' ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
                        >
                            <span className="material-symbols-outlined">event_busy</span>
                            <p className="text-sm font-medium">Academic Leave</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('notice-board')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'notice-board' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
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
                        <div
                            onClick={() => {
                                console.log("Clicked Reports & Analytics");
                                setActiveSection('reports');
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'reports' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">description</span>
                            <p className="text-sm font-medium">Reports & Analytics</p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-border-dark">
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System</p>
                            <div
                                onClick={() => setActiveSection('settings')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                            >
                                <span className="material-symbols-outlined">settings</span>
                                <p className="text-sm font-medium">Settings</p>
                            </div>
                            <div
                                onClick={() => logout()}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors cursor-pointer text-rose-600"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                <p className="text-sm font-medium">Sign Out</p>
                            </div>
                        </div>
                    </nav>
                    <div className="p-4">
                        <div className="bg-surface-dark/50 dark:bg-surface-dark p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                    data-alt="HOD Profile Picture"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA72mIiUi8Kuy-TGJSnozxpAbOJBI_RQJLU0Ee8hefgRxkM0jdBjoUekPcXfAQ4fiaWpiZJDm1NekyUXmouJiykqw7GI_sU4mh24DuYGafli2RXnWmb55D9KKkrFj3y422Bz_Y-DZsbGeMp0X-hUN-knoT2SXfn275TYussvYYv1WBks4PFPZPgHoPmyoeLAdu8wJCSGSnwfTV5Ob3Qi6G0H_EQ1nzFzJ7Bv2QAloIYiUPUHGSGBmXfncJoWdUIQl1i6hpOpWeZtAE")' }}
                                ></div>
                                <div className="flex flex-col overflow-hidden">
                                    <h1 className="text-white text-sm font-semibold truncate">{user?.name}</h1>
                                    <p className="text-[#92a4c9] text-[10px] font-medium uppercase tracking-tight">HOD - DEPT. OF {user?.department || '...'}</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Generate Report
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
                    <DashboardHeader
                        title={activeSection === 'overview' ? 'HOD Dashboard' : activeSection === 'groups' ? 'Notice Board' : activeSection.replace('-', ' ')}
                        onNavigate={setActiveSection}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    {/* Dashboard Body Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background-light dark:bg-background-dark">
                        <div className="p-4 md:p-8 min-h-full">
                            {activeSection === 'timetable' ? (
                                <Timetable />
                            ) : activeSection === 'faculty' ? (
                            <FacultyManagement department={user?.department}/>
                        ) : activeSection === 'reports' ? (
                            <ReportsAnalytics />
                        ) : activeSection === 'students' ? (
                            <StudentManagement branch={user?.department}/>
                        ) : activeSection === 'feedback' ? (
                            <FeedbackManager />
                        ) : activeSection === 'courses' ? (
                            <CourseManagement />
                        ) : activeSection === 'leaves' ? (
                            <LeaveApprovals role="HOD" />
                        ) : activeSection === 'notice-board' ? (
                            <MessagingHub />
                        ) : activeSection === 'academic-leave' ? (
                            <LeaveApplication viewRole="HOD" />
                        ) : activeSection === 'settings' || activeSection === 'profile' ? (
                            <ProfileSettings />

                        ) : activeSection === 'ai-assistant' ? (
                            <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-border-dark shadow-sm">
                                <AIAssistant />
                            </div>
                        ) : (
                            <>
                                {/* Breadcrumbs */}
                                <div className="flex items-center gap-2 mb-6 text-sm">
                                    <a className="text-slate-400 hover:text-primary transition-colors cursor-pointer" onClick={() => setActiveSection('overview')}>Home</a>
                                    <span className="material-symbols-outlined text-sm text-slate-500">chevron_right</span>
                                    <span className="font-semibold text-primary">{activeSection === 'groups' ? 'Notice Board' : 'Department Overview'}</span>
                                </div>

                                {/* Stats Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {/* Stat 1 */}
                                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <span className="material-symbols-outlined">school</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">trending_up</span> +2%
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Faculty</p>
                                        <h3 className="text-3xl font-bold mt-1 dark:text-white">
                                            {loadingOverview ? '--' : facultyList.length}
                                        </h3>
                                    </div>

                                    {/* Stat 2 */}
                                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                                                <span className="material-symbols-outlined">groups</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">trending_up</span> +5%
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Student Strength</p>
                                        <h3 className="text-3xl font-bold mt-1 dark:text-white">
                                            {loadingOverview ? '--' : studentCount}
                                        </h3>
                                    </div>

                                    {/* Stat 3 */}
                                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                                                <span className="material-symbols-outlined">science</span>
                                            </div>
                                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">trending_down</span> -1%
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Projects</p>
                                        <h3 className="text-3xl font-bold mt-1 dark:text-white">--</h3>
                                    </div>

                                    {/* Stat 4 */}
                                    <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                                <span className="material-symbols-outlined">meeting_room</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">trending_up</span> +10%
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lab Occupancy</p>
                                        <h3 className="text-3xl font-bold mt-1 dark:text-white">--%</h3>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left: Faculty Status Table */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                                                <h3 className="text-lg font-bold dark:text-white">Faculty Status</h3>
                                                <button className="text-sm text-primary font-semibold hover:underline">View All</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left mobile-card-view">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                                            <th className="px-6 py-4 font-bold">Faculty Name</th>
                                                            <th className="px-6 py-4 font-bold">Designation</th>
                                                            <th className="px-6 py-4 font-bold">Current Status</th>
                                                            <th className="px-6 py-4 font-bold">Availability</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                                        {loadingOverview ? (
                                                            <tr>
                                                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                                    Loading faculty data...
                                                                </td>
                                                            </tr>
                                                        ) : facultyList.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                                    No faculty assigned to {user?.department} yet.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            facultyList.slice(0, 5).map(faculty => (
                                                                <tr key={faculty._id} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/50 transition-colors">
                                                                    <td data-label="Faculty" className="px-6 py-4">
                                                                        <div className="flex items-center gap-3 md:justify-start justify-end">
                                                                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs hidden md:flex">
                                                                                {faculty.fullName.charAt(0)}
                                                                            </div>
                                                                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                                                                {faculty.fullName}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td data-label="Designation" className="px-6 py-4">
                                                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                                                            {faculty.designation || 'Faculty'}
                                                                        </span>
                                                                    </td>
                                                                    <td data-label="Status" className="px-6 py-4 text-right md:text-left">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                                                                            Present
                                                                        </span>
                                                                    </td>
                                                                    <td data-label="Availability" className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 text-right md:text-left">
                                                                        Available
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <button className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl flex items-center gap-4 hover:border-primary/50 transition-all text-left">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                    <span className="material-symbols-outlined">person_add</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Action</p>
                                                    <p className="text-sm font-semibold dark:text-slate-200">Add Faculty</p>
                                                </div>
                                            </button>
                                            <button className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl flex items-center gap-4 hover:border-primary/50 transition-all text-left">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                    <span className="material-symbols-outlined">assignment_turned_in</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Action</p>
                                                    <p className="text-sm font-semibold dark:text-slate-200">Approve Leave</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setActiveSection('timetable')}
                                                className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl flex items-center gap-4 hover:border-primary/50 transition-all text-left"
                                            >
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                    <span className="material-symbols-outlined">edit_calendar</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Action</p>
                                                    <p className="text-sm font-semibold dark:text-slate-200">Modify Timetable</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right: Notifications & Resource Allocation */}
                                    <div className="space-y-6">
                                        {/* Resource Allocation Card */}
                                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                            <h3 className="text-lg font-bold mb-6 dark:text-white">Resource Usage</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-slate-500 dark:text-slate-400">Computing Lab I</span>
                                                        <span className="font-bold dark:text-slate-200">92%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: '92%' }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-slate-500 dark:text-slate-400">Smart Classroom 102</span>
                                                        <span className="font-bold dark:text-slate-200">45%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: '45%' }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-slate-500 dark:text-slate-400">Digital Library Seats</span>
                                                        <span className="font-bold dark:text-slate-200">60%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500" style={{ width: '60%' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-full mt-6 py-2.5 rounded-lg border border-slate-200 dark:border-border-dark text-xs font-bold hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors dark:text-slate-200">
                                                Detailed Resource Map
                                            </button>
                                        </div>

                                        {/* Recent Alerts */}
                                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                                            <h3 className="text-lg font-bold mb-4 dark:text-white">Pending Tasks</h3>
                                            <div className="space-y-4">
                                                <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/30 transition-colors cursor-pointer">
                                                    <div className="flex-shrink-0 size-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-xl">pending_actions</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold dark:text-slate-200">Verify Semester Results</p>
                                                        <p className="text-xs text-slate-500 mt-1">Due by EOD Today</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/30 transition-colors cursor-pointer">
                                                    <div className="flex-shrink-0 size-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold dark:text-slate-200">Budget Approval Request</p>
                                                        <p className="text-xs text-slate-500 mt-1">Submitted by Lab Technician</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/30 transition-colors cursor-pointer">
                                                    <div className="flex-shrink-0 size-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-xl">campaign</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold dark:text-slate-200">NAAC Visit Schedule</p>
                                                        <p className="text-xs text-slate-500 mt-1">Review finalized itinerary</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                        }
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HODDashboard;
