import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import MessagingHub from './MessagingHub';
import AIAssistant from '../components/AIAssistant';
import ProfileSettings from '../components/ProfileSettings';
import Results from '../components/Results';
import Attendance from '../components/Attendance';
import Timetable from '../components/Timetable';
import MyCourses from '../components/MyCourses';
import LeaveApplication from '../components/LeaveApplication';
import FeedbackStudent from '../components/FeedbackStudent';
import { useUser } from '../context/UserContext';
import axios from 'axios';

// Placeholder Components for other sections
const ComingSoon = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">construction</span>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2">This module is under development.</p>
    </div>
);

const DashboardOverview = ({ user, onNavigate }) => {
    const [attendancePercent, setAttendancePercent] = useState('85');
    const [cgpa, setCgpa] = useState('N/A');

    React.useEffect(() => {
        const fetchCgpa = async () => {
            if (!user?.id) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/semester-results/student/${user.id}`);
                const results = response.data || [];
                if (results.length > 0) {
                    const avg = (results.reduce((acc, curr) => acc + curr.sgpa, 0) / results.length).toFixed(2);
                    setCgpa(avg);
                }
            } catch (err) {
                console.error("Failed to fetch student CGPA", err);
            }
        };
        fetchCgpa();
    }, [user]);

    React.useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?.regdNo) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/attendance/student/${user.regdNo}`);
                if (response.data && response.data.overallPercentage !== undefined) {
                    setAttendancePercent(response.data.overallPercentage);
                }
            } catch (err) {
                console.error("Failed to fetch student attendance", err);
            }
        };
        fetchAttendance();
    }, [user]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h2>
                    <p className="text-blue-100 mb-6 max-w-lg">Check your schedule and keep up the great work!</p>
                    <button
                        onClick={() => onNavigate('timetable')}
                        className="px-6 py-2 bg-white text-primary font-bold rounded-lg shadow-sm hover:translate-y-[-2px] transition-transform"
                    >
                        View Schedule
                    </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 bg-white/10 rounded-full w-64 h-64 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 bg-blue-500/20 rounded-full w-32 h-32 blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Attendance</p>
                                <p className="text-xl font-bold dark:text-white">{attendancePercent}%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">star</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">CGPA</p>
                                <p className="text-xl font-bold dark:text-white">{cgpa}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="size-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">assignment</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Assignments</p>
                                <p className="text-xl font-bold dark:text-white">N/A</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Recent Activity</h3>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">No recent activity found.</p>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Calendar & Notices */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Notice Board</h3>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">No notices at this time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useUser();

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <DashboardOverview user={user} onNavigate={setActiveTab} />;
            case 'chat': return <MessagingHub />;
            case 'ai-assistant': return <AIAssistant />;
            case 'profile': return <ProfileSettings />;
            case 'courses': return <MyCourses />;
            case 'attendance': return <Attendance />;
            case 'results': return <Results />;
            case 'timetable': return <Timetable />;
            case 'leave': return <LeaveApplication viewRole="Student" />;
            case 'feedback': return <FeedbackStudent />;
            default: return <DashboardOverview user={user} />;
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200 h-screen w-full overflow-hidden flex">
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    setIsSidebarOpen(false); // Close sidebar on mobile when tab changes
                }} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader
                    title={activeTab.replace('-', ' ')}
                    onNavigate={setActiveTab}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-background-light dark:bg-background-dark flex flex-col">
                    <div className={`p-4 md:p-8 flex-1 flex flex-col ${['ai-assistant', 'chat'].includes(activeTab) ? 'h-full' : 'min-h-full'}`}>
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
