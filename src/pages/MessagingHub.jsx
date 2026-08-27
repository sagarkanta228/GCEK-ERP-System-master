import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const MessagingHub = () => {
    const { user } = useUser();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    
    // Form state for new notice
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'Notice',
        recipients: [],
        targetBranches: [],
        targetSemesters: []
    });

    const branches = ['CSE', 'Mechanical', 'Electrical', 'Civil', 'Basic Science and Humanities'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const userRole = (user?.role || user?.assignedRole || '').toLowerCase();
    const canSendNotices = ['principal', 'dean', 'hod', 'faculty'].includes(userRole);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNotice = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Please provide both title and content for the notice.');
            return;
        }

        if (formData.recipients.length === 0) {
            alert('Please select at least one recipient role or "Everyone"');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (['HOD', 'Faculty'].includes(userRole)) {
                payload.targetBranches = user?.department ? [user.department] : [];
            }

            await axios.post('http://localhost:5000/api/notices', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsComposeOpen(false);
            setFormData({
                title: '',
                content: '',
                type: 'Notice',
                recipients: [],
                targetBranches: [],
                targetSemesters: []
            });
            fetchNotices();
        } catch (error) {
            console.error('Error creating notice:', error);
            alert(error.response?.data?.message || 'Failed to create notice');
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/notices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotices(); // Refresh list after deletion
        } catch (error) {
            console.error('Error deleting notice:', error);
            alert(error.response?.data?.message || 'Failed to delete notice');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            if (lines.length > 0) {
                const title = lines[0].trim();
                const content = lines.slice(1).join('\n').trim();
                setFormData(prev => ({
                    ...prev,
                    title: title || prev.title,
                    content: content || prev.content
                }));
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const toggleSelection = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            // If selecting "All", clear everything else
            if (value === 'All') {
                return { ...prev, [field]: current.includes('All') ? [] : ['All'] };
            }
            // If selecting something else, remove "All" if it's there
            const filtered = current.filter(item => item !== 'All');
            if (filtered.includes(value)) {
                return { ...prev, [field]: filtered.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...filtered, value] };
            }
        });
    };

    const getRecipientsForRole = () => {
        if (userRole === 'principal') return ['Dean', 'HOD', 'Faculty', 'Student'];
        if (userRole === 'dean') return ['Principal', 'HOD', 'Faculty', 'Student'];
        if (userRole === 'hod') return ['Principal', 'Faculty', 'Student'];
        if (userRole === 'faculty') return ['HOD', 'Student'];
        return [];
    };

    const filteredNotices = notices.filter(notice => {
        const matchesType = filter === 'All' || notice.type === filter;
        const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            notice.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full w-full bg-background-light dark:bg-background-dark font-display overflow-hidden rounded-xl">
            {/* Header / Filter Bar */}
            <div className="bg-white dark:bg-surface-dark p-6 border-b border-slate-200 dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>
                    <div>
                        <h1 className="text-xl xs:text-2xl font-black tracking-tight dark:text-white">Notice Board</h1>
                        <p className="text-[10px] xs:text-xs text-slate-500 font-medium lowercase xs:normal-case">Official institutional updates</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Search notices..."
                            className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {canSendNotices && (
                        <button
                            onClick={() => setIsComposeOpen(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Compose
                        </button>
                    )}
                </div>
            </div>

            {/* Type Filter Tab */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-border-dark bg-white/50 dark:bg-background-dark/50">
                {['All', 'Notice', 'Memo', 'Message'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                            filter === type 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-border-dark'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Content Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50 dark:bg-[#0b121f]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
                        <p className="text-slate-500 text-sm animate-pulse">Fetching updates...</p>
                    </div>
                ) : filteredNotices.length > 0 ? (
                    filteredNotices.map((notice) => (
                        <div key={notice._id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark hover:shadow-xl hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-background-dark flex items-center justify-center text-primary font-black shadow-inner">
                                        {notice.sender?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm dark:text-white leading-tight">{notice.sender?.fullName || 'Unknown User'}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold italic">
                                                {notice.senderRole}
                                            </span>
                                            <span className="text-[10px] text-slate-300">•</span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(notice.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                        notice.type === 'Notice' ? 'bg-blue-500/10 text-blue-500' :
                                        notice.type === 'Memo' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-purple-500/10 text-purple-500'
                                    }`}>
                                        {notice.type}
                                    </div>
                                    {notice.sender && notice.sender._id === user?.id && (
                                        <button 
                                            onClick={() => handleDeleteNotice(notice._id)} 
                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
                                            title="Delete Notice"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h2 className="text-lg xs:text-xl font-bold dark:text-white mb-2 group-hover:text-primary transition-colors">{notice.title}</h2>
                            <p className="text-[13px] xs:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                            
                            {(notice.recipients?.length > 0 || notice.targetBranches?.length > 0) && (
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-border-dark flex flex-wrap gap-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase w-full mb-1">Target Audience</span>
                                    {notice.recipients?.map(r => (
                                        <span key={r} className="px-2 py-0.5 bg-slate-100 dark:bg-background-dark text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
                                            {r}s
                                        </span>
                                    ))}
                                    {notice.targetBranches?.map(b => (
                                        <span key={b} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                                            {b} Dept.
                                        </span>
                                    ))}
                                    {notice.targetSemesters?.map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full">
                                            Sem {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-dark rounded-2xl border-2 border-dashed border-slate-200 dark:border-border-dark opacity-60">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 scale-125">auto_aware</span>
                        <h3 className="text-lg font-bold text-slate-400">No notices found</h3>
                        <p className="text-sm text-slate-400">Everything is quiet for now.</p>
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden animation-scale-in">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-primary/5">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">post_add</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white leading-none">Compose New Notice</h3>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Formal Institutional Broadcast</p>
                                </div>
                            </div>
                            <button onClick={() => setIsComposeOpen(false)} className="size-10 hover:bg-slate-100 dark:hover:bg-border-dark rounded-full flex items-center justify-center text-slate-400 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateNotice} className="p-4 xs:p-8 space-y-6 max-h-[85vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Type</label>
                                        <div className="flex gap-2">
                                            {['Notice', 'Memo', 'Message'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, type: t})}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                        formData.type === t 
                                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                                        : 'bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark text-slate-400'
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Recipients</label>
                                        <div className="flex flex-wrap gap-2">
                                            {getRecipientsForRole().map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => toggleSelection('recipients', r)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                        formData.recipients.includes(r)
                                                        ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                                        : 'bg-white dark:bg-background-dark border-slate-200 dark:border-border-dark text-slate-500'
                                                    }`}
                                                >
                                                    {r}s
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => toggleSelection('recipients', 'All')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                    formData.recipients.includes('All')
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                                    : 'bg-white dark:bg-background-dark border-slate-200 dark:border-border-dark text-slate-500'
                                                }`}
                                            >
                                                Everyone
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {['principal', 'dean'].includes(userRole) ? (
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Departments (Optional)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {branches.map(b => (
                                                    <button
                                                        key={b}
                                                        type="button"
                                                        onClick={() => toggleSelection('targetBranches', b)}
                                                        className={`py-1 rounded-md text-[10px] font-bold transition-all border ${
                                                            formData.targetBranches.includes(b)
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark text-slate-400'
                                                        }`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Target Department</label>
                                            <div className="py-2 px-3 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold inline-block">
                                                {user?.department || 'Your Department'}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Semesters (Optional)</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {semesters.map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => toggleSelection('targetSemesters', s)}
                                                    className={`py-1 rounded-md text-[10px] font-bold transition-all border ${
                                                        formData.targetSemesters.includes(s)
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark text-slate-400'
                                                    }`}
                                                >
                                                    Sem {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-border-dark space-y-4">
                                <div>
                                    <label className="flex justify-between items-center text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">
                                        <span>Title</span>
                                        <label className="text-[10px] bg-slate-100 dark:bg-background-dark text-slate-500 hover:text-primary px-2 py-1 rounded cursor-pointer transition-colors flex items-center gap-1 font-bold">
                                            <span className="material-symbols-outlined text-[12px]">upload_file</span>
                                            Import TXT
                                            <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </label>
                                    <input 
                                        required
                                        className="w-full bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-border-dark rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:border-primary transition-all dark:text-white font-bold" 
                                        placeholder="Enter a descriptive title..." 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Content</label>
                                    <textarea 
                                        required
                                        className="w-full bg-slate-50 dark:bg-background-dark border-2 border-slate-200 dark:border-border-dark rounded-2xl px-4 py-4 text-sm focus:ring-0 focus:border-primary transition-all dark:text-white min-h-[150px] resize-none" 
                                        placeholder="Write your announcement details here..."
                                        value={formData.content}
                                        onChange={e => setFormData({...formData, content: e.target.value})}
                                    />
                                </div>
                            </div>
                        </form>
                        
                        <div className="p-4 xs:p-6 border-t border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50 flex flex-wrap justify-end gap-3 items-center">
                            <p className="mr-auto text-[10px] text-slate-400 font-bold uppercase hidden sm:block">Draft auto-saved {new Date().toLocaleTimeString()}</p>
                            <button type="button" onClick={() => setIsComposeOpen(false)} className="px-6 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-all">Discard</button>
                            <button 
                                onClick={handleCreateNotice}
                                className="px-8 py-2.5 text-xs font-black text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-xl shadow-primary/30 uppercase tracking-widest flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">send</span>
                                Publish Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagingHub;
