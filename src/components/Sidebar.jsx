import React from 'react';
import { useUser } from '../context/UserContext';

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
    const { user } = useUser();
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: 'dashboard', fill: true },
        { id: 'courses', label: 'My Courses', icon: 'auto_stories' },
        { id: 'attendance', label: 'Attendance', icon: 'how_to_reg' },
        { id: 'results', label: 'Results', icon: 'grade' },
        { id: 'timetable', label: 'Time Table', icon: 'calendar_month' },
        { id: 'leave', label: 'Academic Leave', icon: 'event_busy' },
        { id: 'chat', label: 'Notice Board', icon: 'campaign' },
        { id: 'feedback', label: 'Feedback', icon: 'feedback' },
    ];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
                    onClick={onClose}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 flex-shrink-0 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-border-dark flex flex-col h-full ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:relative'}`}>
            <div className="p-6 flex items-center gap-3">
                <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">GCEK ERP</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Student Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${activeTab === item.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${item.fill && activeTab === item.id ? 'fill-[1]' : ''}`}>
                            {item.icon}
                        </span>
                        <p className={`text-sm ${activeTab === item.id ? 'font-semibold' : 'font-medium'}`}>{item.label}</p>
                    </button>
                ))}


            </nav>

            <div className="p-4 space-y-4">
                <button
                    onClick={() => onTabChange('ai-assistant')}
                    className="w-full flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">smart_toy</span>
                        <span className="text-sm font-semibold">AI Assistant</span>
                    </div>
                    <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                </button>

                <div className="bg-surface-dark/50 dark:bg-surface-dark p-4 rounded-xl border border-border-dark/50">
                    <div className="flex items-center gap-3">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{ backgroundImage: `url("${user?.profileImage}")` }}
                        ></div>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-white text-sm font-semibold truncate">{user.name}</h1>
                            <p className="text-[#92a4c9] text-[10px] font-medium uppercase tracking-tight">{user.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
