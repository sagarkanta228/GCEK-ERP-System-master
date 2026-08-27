import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import ProfileSettings from '../components/ProfileSettings';
import LeaveApprovals from '../components/LeaveApprovals';
import DashboardHeader from '../components/DashboardHeader';
import { Bell, X, Check } from 'lucide-react';
import axios from 'axios';

const RegistrarDashboard = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading: authLoading } = useUser();


    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0d121b] flex flex-col items-center justify-center">
                <div className="size-12 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full mb-4"></div>
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
                        <div className="size-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <span className="material-symbols-outlined">shield_person</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">GCEK ERP</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Registrar Portal</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                        <div
                            onClick={() => setActiveSection('leaves')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'leaves' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <p className="text-sm font-medium">Leave Approvals</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('records')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'records' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">description</span>
                            <p className="text-sm font-medium">Official Records</p>
                        </div>
                        <div
                            onClick={() => setActiveSection('settings')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeSection === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <p className="text-sm font-medium">Profile Settings</p>
                        </div>
                    </nav>
                    <div className="p-4">
                        <div className="bg-slate-50 dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="size-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                    {user?.name?.[0] || 'R'}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <h1 className="text-sm font-semibold truncate">{user?.name || 'Registrar'}</h1>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Registrar, GCEK</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
                    <DashboardHeader
                        title={activeSection === 'overview' ? 'Registrar Oversight' : activeSection.replace('-', ' ')}
                        onNavigate={setActiveSection}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background-light dark:bg-background-dark">
                        <div className="p-4 md:p-8 min-h-full">
                            {activeSection === 'leaves' ? (
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Faculty Leave Approvals</h3>
                                        <p className="text-slate-500 dark:text-slate-400">Review and action pending leave applications from faculty members.</p>
                                    </div>
                                    <LeaveApprovals role="Registrar" />
                                </div>
                            ) : activeSection === 'settings' ? (
                                <ProfileSettings />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <span className="material-symbols-outlined text-6xl mb-4">construction</span>
                                    <p className="text-lg font-medium">This section is under construction.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RegistrarDashboard;
