import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import Timetable from '../components/Timetable';
import ProfileSettings from '../components/ProfileSettings';
import StudentPerformance from '../components/StudentPerformance';
import AIAssistant from '../components/AIAssistant';
import DashboardHeader from '../components/DashboardHeader';
import LeaveApprovals from '../components/LeaveApprovals';
import LeaveApplication from '../components/LeaveApplication';
import MessagingHub from './MessagingHub';
import { X, Check } from 'lucide-react';

const DeanDashboard = () => {
    const { user, loading: authLoading } = useUser();
    const [activeSection, setActiveSection] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && user.id && user.role !== 'Dean') {
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
                    <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                        <div 
                            onClick={() => setActiveSection('overview')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined fill-[1]">analytics</span>
                            <p className="text-sm font-semibold">Institution Analytics</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('timetable')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'timetable' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">calendar_today</span>
                            <p className="text-sm font-medium">Time Table Master</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('notices')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'notices' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">campaign</span>
                            <p className="text-sm font-medium">Notice Board</p>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors cursor-pointer text-slate-600 dark:text-slate-400">
                            <p className="text-sm font-medium">Reports</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('performance')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'performance' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">bar_chart</span>
                            <p className="text-sm font-medium">Student Performance</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('leaves')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'leaves' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">how_to_reg</span>
                            <p className="text-sm font-medium">Leave Approvals</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('academic-leave')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'academic-leave' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">event_busy</span>
                            <p className="text-sm font-medium">Academic Leave</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('ai-assistant')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'ai-assistant' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">smart_toy</span>
                            <p className="text-sm font-medium">AI Assistant</p>
                        </div>
                    </nav>
                    <div className="p-4">
                        <div className="bg-surface-dark/50 dark:bg-surface-dark p-4 rounded-xl border border-border-dark">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA72mIiUi8Kuy-TGJSnozxpAbOJBI_RQJLU0Ee8hefgRxkM0jdBjoUekPcXfAQ4fiaWpiZJDm1NekyUXmouJiykqw7GI_sU4mh24DuYGafli2RXnWmb55D9KKkrFj3y422Bz_Y-DZsbGeMp0X-hUN-knoT2SXfn275TYussvYYv1WBks4PFPZPgHoPmyoeLAdu8wJCSGSnwfTV5Ob3Qi6G0H_EQ1nzFzJ7Bv2QAloIYiUPUHGSGBmXfncJoWdUIQl1i6hpOpWeZtAE")' }}
                                ></div>
                                <div className="flex flex-col overflow-hidden">
                                    <h1 className="text-white text-sm font-semibold truncate">{user?.name}</h1>
                                    <p className="text-[#92a4c9] text-[10px] font-medium uppercase tracking-tight">{user?.role} {user?.department ? `- ${user.department}` : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveSection('settings')}
                                className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                Admin Settings
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
                    <DashboardHeader
                        title={activeSection === 'overview' ? 'Dean Oversight' : activeSection.replace('-', ' ')}
                        onNavigate={setActiveSection}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background-light dark:bg-background-dark">
                        <div className="p-4 md:p-8 min-h-full">
                            {activeSection === 'timetable' ? (
                                <Timetable />
                            ) : activeSection === 'performance' ? (
                                <StudentPerformance />
                            ) : activeSection === 'leaves' ? (
                                <LeaveApprovals role="Dean" />
                            ) : activeSection === 'academic-leave' ? (
                                <LeaveApplication viewRole="Dean" />
                            ) : activeSection === 'notices' ? (
                                <MessagingHub role="Dean" />
                            ) : activeSection === 'settings' || activeSection === 'profile' ? (
                                <ProfileSettings />

                            ) : activeSection === 'ai-assistant' ? (
                                <div className="h-[calc(100vh-8rem)] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-border-dark shadow-sm">
                                    <AIAssistant />
                                </div>
                            ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-gradient-to-br from-primary/20 to-surface-dark p-8 rounded-2xl border border-primary/30 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 text-primary/10">
                                            <span className="material-symbols-outlined text-9xl">insights</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="material-symbols-outlined text-primary">show_chart</span>
                                                <h3 className="text-xl font-bold dark:text-white">Overall College Performance</h3>
                                            </div>
                                            <div className="flex items-baseline gap-4 mb-6">
                                                <h4 className="text-5xl font-black dark:text-white">--%</h4>
                                                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                                                    Pending
                                                </span>
                                            </div>
                                            <div className="space-y-4 max-w-sm">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Academic Excellence</span>
                                                    <span className="font-bold dark:text-white">--%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Research & Innovation</span>
                                                    <span className="font-bold dark:text-white">--%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: '0%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark shadow-xl">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-amber-500">how_to_reg</span>
                                                <h3 className="text-xl font-bold dark:text-white">Staff Attendance</h3>
                                            </div>
                                            <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full">Real-time Data</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-slate-400 text-sm mb-1">Teaching Staff</p>
                                                <h4 className="text-3xl font-bold dark:text-white">--/--</h4>
                                                <p className="text-xs text-slate-500 font-bold mt-2">--% Presence</p>
                                            </div>
                                            <div className="border-l border-border-dark pl-8">
                                                <p className="text-slate-400 text-sm mb-1">Non-Teaching</p>
                                                <h4 className="text-3xl font-bold dark:text-white">--/--</h4>
                                                <p className="text-xs text-slate-500 font-bold mt-2">--% Presence</p>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-2">
                                            <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="h-1 flex-1 bg-amber-500 rounded-full"></div>
                                            <div className="h-1 flex-1 bg-slate-700 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 space-y-6">
                                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-bold dark:text-white">Time Table Management</h3>
                                                    <p className="text-xs text-slate-400">Centralized Oversight & Conflict Resolution</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {(user?.fullName === 'Dean UG PG' || user?.name === 'Dean UG PG') && (
                                                        <button 
                                                            onClick={() => setActiveSection('timetable')}
                                                            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                            Edit Master
                                                        </button>
                                                    )}
                                                    <button className="px-4 py-2 bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-600 transition-all">
                                                        Update Permissions
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                                            <th className="px-6 py-4 font-bold">Department</th>
                                                            <th className="px-6 py-4 font-bold">Status</th>
                                                            <th className="px-6 py-4 font-bold">Last Updated</th>
                                                            <th className="px-6 py-4 font-bold">Conflict Check</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-semibold dark:text-white">Computer Science (CSE)</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">FINALIZED</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="flex items-center gap-1 text-emerald-500 text-sm font-bold">
                                                                    <span className="material-symbols-outlined text-sm">check_circle</span> 0 Conflicts
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-semibold dark:text-white">Electrical Engineering (EE)</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded">IN REVIEW</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-400">Oct 23, 2023 • 04:15 PM</td>
                                                            <td className="px-6 py-4">
                                                                <span className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                                                    <span className="material-symbols-outlined text-sm">warning</span> 2 Conflicts
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-semibold dark:text-white">Mechanical Engineering (ME)</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded">PENDING</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-400">Oct 20, 2023 • 09:00 AM</td>
                                                            <td className="px-6 py-4">
                                                                <span className="flex items-center gap-1 text-slate-500 text-sm">
                                                                    <span className="material-symbols-outlined text-sm">hourglass_empty</span> Not Started
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                                                <h4 className="text-sm font-bold mb-4 uppercase text-slate-400 tracking-wider">Placement Conversion Rate</h4>
                                                <div className="flex items-end gap-2 h-24">
                                                    <div className="w-full bg-primary/20 rounded-t h-[60%] hover:bg-primary transition-all"></div>
                                                    <div className="w-full bg-primary/20 rounded-t h-[75%] hover:bg-primary transition-all"></div>
                                                    <div className="w-full bg-primary rounded-t h-[90%] transition-all"></div>
                                                    <div className="w-full bg-primary/20 rounded-t h-[65%] hover:bg-primary transition-all"></div>
                                                    <div className="w-full bg-primary/20 rounded-t h-[80%] hover:bg-primary transition-all"></div>
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500">
                                                    <span>2019</span><span>2020</span><span>2021</span><span>2022</span><span>2023</span>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark">
                                                <h4 className="text-sm font-bold mb-4 uppercase text-slate-400 tracking-wider">Research Publications</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="size-20 rounded-full border-8 border-primary border-t-transparent animate-spin-slow flex items-center justify-center">
                                                        <span className="text-xs font-bold text-primary">124</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">Total Scopus Indexed</p>
                                                        <p className="text-xl font-bold dark:text-white">+18% vs Last Year</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm h-full flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold dark:text-white">Notice Board</h3>
                                                <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">
                                                    <span className="material-symbols-outlined">add_comment</span>
                                                </button>
                                            </div>
                                            <div className="mb-6 p-4 bg-slate-100 dark:bg-background-dark/50 rounded-lg border border-border-dark/50">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Create Institutional Group</p>
                                                <input className="w-full bg-white dark:bg-surface-dark border-border-dark rounded-md text-sm mb-3 focus:ring-1 focus:ring-primary dark:text-white" placeholder="Group Name..." type="text" />
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <button className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full border border-blue-500/30 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">add</span> Deans
                                                    </button>
                                                    <button className="px-2 py-1 bg-purple-500/10 text-purple-500 text-[10px] font-bold rounded-full border border-purple-500/30 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">add</span> HODs
                                                    </button>
                                                    <button className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">add</span> Students
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setActiveSection('groups')}
                                                    className="w-full py-2 bg-primary text-white text-xs font-bold rounded shadow-lg hover:shadow-primary/20 transition-all font-display"
                                                >
                                                    Go to Notice Board
                                                </button>
                                            </div>
                                            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Active Directives</p>
                                                <div className="p-3 border border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/30 cursor-pointer">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="size-2 bg-red-500 rounded-full"></div>
                                                        <span className="text-xs font-bold text-red-500 uppercase">Urgent</span>
                                                        <span className="text-[10px] text-slate-500 ml-auto">2m ago</span>
                                                    </div>
                                                    <p className="text-sm font-semibold dark:text-white">Annual Budget Submission</p>
                                                    <p className="text-xs text-slate-400 mt-1">All Deans must submit the department budgets by friday.</p>
                                                </div>
                                                <div className="p-3 border border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/30 cursor-pointer">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="size-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-xs font-bold text-blue-500 uppercase">Policy</span>
                                                        <span className="text-[10px] text-slate-500 ml-auto">4h ago</span>
                                                    </div>
                                                    <p className="text-sm font-semibold dark:text-white">NAAC Peer Team Visit</p>
                                                    <p className="text-xs text-slate-400 mt-1">Institutional readiness protocols have been updated.</p>
                                                </div>
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

export default DeanDashboard;
