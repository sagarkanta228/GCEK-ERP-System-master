import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import LeaveTrackingModal from './LeaveTrackingModal';
import axios from 'axios';

const DashboardHeader = ({ title, onNavigate, onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useUser();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveTrackingData, setLeaveTrackingData] = useState(null);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const userId = user?.regdNo || user?.id;
            if (userId) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/notifications`, {
                        params: { 
                            userId, 
                            roles: [user?.role, user?.assignedRole].filter(Boolean).join(','), 
                            branch: user?.department || user?.branch 
                        }
                    });
                    setNotifications(res.data);
                    setUnreadCount(res.data.filter(n => !n.isRead).length);
                } catch (err) {
                    console.error("Failed to fetch notifications:", err);
                }
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAsRead = async (notifId) => {
        try {
            await axios.post(`http://localhost:5000/api/notifications/${notifId}/read`, { 
                userId: user?.regdNo || user?.id 
            });
            setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        // Mark as read first
        if (!notif.isRead) handleMarkAsRead(notif._id);

        // If it's a leave notification, fetch the leave and open modal
        if (notif.leaveId) {
            try {
                const res = await axios.get(`http://localhost:5000/api/leaves/${notif.leaveId}`);
                setLeaveTrackingData(res.data);
                setShowLeaveModal(true);
                setIsNotifOpen(false);
            } catch (err) {
                console.error('Failed to fetch leave data', err);
            }
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = () => {
        // Clear any auth state here if needed
        navigate('/login');
    };

    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-2 xs:px-4 sm:px-8 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-border-dark relative z-20">
            {/* ... (search and left side remains same) */}
            <div className="flex items-center gap-3 sm:gap-6">
                {onMenuClick && (
                    <button 
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-lg transition-colors cursor-pointer"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                )}
                <h2 className="text-sm xs:text-lg font-bold tracking-tight capitalize text-slate-900 dark:text-white truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">{title}</h2>
                <div className="relative group hidden sm:block">
                    {/* ... Search Input ... */}
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">search</span>
                    <input
                        className="pl-10 pr-4 py-2 w-60 lg:w-80 bg-slate-100 dark:bg-surface-dark border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none text-slate-900 dark:text-slate-200 placeholder-slate-400"
                        placeholder="Search..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    {/* ... Notification Button ... */}
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-lg transition-colors relative"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-slate-200 dark:border-border-dark overflow-hidden animation-fade-in-up">
                            {/* ... Notifications Content ... */}
                            <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                                <h3 className="font-bold text-sm dark:text-white">Notifications</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? notifications.map((notif) => {
                                    const isLeaveNotif = !!notif.leaveId;
                                    const notifIcon = notif.type === 'RESULT_UPLOAD' ? 'grade'
                                        : isLeaveNotif ? 'description'
                                        : 'info';
                                    const notifIconBg = isLeaveNotif ? 'bg-indigo-500/10 text-indigo-500' : 'bg-blue-500/10 text-blue-500';

                                    return (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-3 border-b border-slate-100 dark:border-border-dark/50 transition-colors cursor-pointer last:border-0 group ${notif.isRead ? 'bg-white dark:bg-surface-dark' : 'bg-slate-50 dark:bg-background-dark/50'} ${isLeaveNotif ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10' : 'hover:bg-slate-100 dark:hover:bg-surface-dark/80'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${notifIconBg}`}>
                                                <span className="material-symbols-outlined text-sm">{notifIcon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-semibold dark:text-slate-200 truncate">{notif.title}</p>
                                                    {isLeaveNotif && (
                                                        <span className="material-symbols-outlined text-[11px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.date).toLocaleString('en-GB')}</p>
                                            </div>
                                            {!notif.isRead && <div className="size-2 bg-primary rounded-full mt-1 shrink-0"></div>}
                                        </div>
                                    </div>
                                    );
                                }) : (
                                    <div className="p-4 text-center text-sm text-slate-500">
                                        No notifications yet.
                                    </div>
                                )}
                            </div>
                            <div className="p-2 text-center border-t border-slate-200 dark:border-border-dark">
                                <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">View All</button>
                            </div>
                        </div>
                    )}

                    {/* Leave Tracking Modal */}
                    {showLeaveModal && leaveTrackingData && (
                        <LeaveTrackingModal
                            leave={leaveTrackingData}
                            onClose={() => { setShowLeaveModal(false); setLeaveTrackingData(null); }}
                        />
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-border-dark mx-2"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-lg transition-colors"
                    >
                        <div className="size-8 bg-primary/20 text-primary rounded-full flex items-center justify-center overflow-hidden">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-xl">person</span>
                            )}
                        </div>
                        <span className="text-sm font-medium dark:text-slate-200 hidden sm:block">Profile</span>
                        <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-slate-200 dark:border-border-dark overflow-hidden animation-fade-in-up">
                            <div className="p-4 border-b border-slate-200 dark:border-border-dark">
                                <p className="text-sm font-bold dark:text-white">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={() => {
                                        onNavigate('profile');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-background-dark rounded-lg flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">person</span>
                                    My Profile
                                </button>
                                <button
                                    onClick={() => {
                                        onNavigate('settings');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-background-dark rounded-lg flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                    Settings
                                </button>
                                <div className="h-px bg-slate-200 dark:bg-border-dark my-1 mx-2"></div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
