import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

/* ─────────────── helpers ─────────────── */
const getProgressWidth = (leave) => {
    if (leave?.status === 'Rejected') return '0%';
    const role = leave?.applicantRole;
    
    let order = [];
    let widths = [];
    
    if (role === 'Dean') {
        order = ['Pending_Principal', 'Approved'];
        widths = ['50%', '100%'];
    } else if (role === 'HOD') {
        order = ['Pending_Registrar', 'Pending_Principal', 'Approved'];
        widths = ['25%', '75%', '100%'];
    } else if (role === 'Faculty') {
        order = ['Pending_HOD', 'Pending_Registrar', 'Pending_Principal', 'Approved'];
        widths = ['12.5%', '37.5%', '62.5%', '100%'];
    } else {
        order = ['Pending_HOD', 'Pending_Dean', 'Pending_Principal', 'Approved'];
        widths = ['12.5%', '37.5%', '62.5%', '100%'];
    }
    
    const idx = order.indexOf(leave?.status);
    if (idx === -1) return '0%';
    return widths[idx];
};

const getStepStatus = (index, leave) => {
    if (index === 0) return 'completed';

    const role = leave?.applicantRole;
    let order = [];
    
    if (role === 'Dean') {
        order = ['Pending_Principal', 'Approved'];
    } else if (role === 'HOD') {
        order = ['Pending_Registrar', 'Pending_Principal', 'Approved'];
    } else if (role === 'Faculty') {
        order = ['Pending_HOD', 'Pending_Registrar', 'Pending_Principal', 'Approved'];
    } else {
        order = ['Pending_HOD', 'Pending_Dean', 'Pending_Principal', 'Approved'];
    }
    
    const currentIdx = order.indexOf(leave?.status);

    if (leave?.status === 'Rejected') {
        const reason = leave.rejectionReason?.toLowerCase() || '';
        let rejStep = 1; // Default next level
        
        if (role === 'Dean') {
            rejStep = 1; // Principal
        } else if (role === 'HOD') {
            if (reason.includes('registrar')) rejStep = 1;
            if (reason.includes('principal')) rejStep = 2;
        } else if (role === 'Faculty') {
            if (reason.includes('registrar')) rejStep = 2;
            if (reason.includes('principal')) rejStep = 3;
        } else {
            if (reason.includes('dean')) rejStep = 2;
            if (reason.includes('principal')) rejStep = 3;
        }
        
        if (index === rejStep) return 'rejected';
        if (index < rejStep) return 'completed';
        return 'inactive';
    }

    if (index === currentIdx + 1) return 'active';
    if (index < currentIdx + 1 || leave?.status === 'Approved') return 'completed';
    return 'inactive';
};

/* ─────────────── hierarchy step card ─────────────── */
const StepCard = ({ step, status }) => {
    const isCompleted = status === 'completed';
    const isActive    = status === 'active';
    const isRejected  = status === 'rejected';
    const isInactive  = status === 'inactive';

    return (
        <div className="flex flex-col items-center">
            <div className="relative mb-5">
                {/* Main icon box */}
                <div
                    className="w-24 h-24 rounded-[1.75rem] flex items-center justify-center transition-all duration-500"
                    style={
                        isCompleted
                            ? { background: '#6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.6), inset 0 0 10px rgba(99,102,241,0.4)', border: '2px solid rgba(165,180,252,0.8)' }
                            : isActive
                            ? { background: 'rgba(15,23,42,0.9)', boxShadow: '0 0 20px rgba(245,158,11,0.5), inset 0 0 10px rgba(245,158,11,0.3)', border: '2px solid rgba(251,191,36,0.8)' }
                            : isRejected
                            ? { background: 'rgba(15,23,42,0.9)', boxShadow: '0 0 20px rgba(239,68,68,0.4)', border: '2px solid rgba(239,68,68,0.6)' }
                            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                >
                    <span
                        className={`material-symbols-outlined text-5xl ${
                            isCompleted ? 'text-white' :
                            isActive    ? 'text-amber-400' :
                            isRejected  ? 'text-red-400' :
                            'text-slate-600'
                        }`}
                    >{step.icon}</span>
                </div>

                {/* Green check for completed */}
                {isCompleted && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#08090f] flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-[14px] text-white leading-none">check</span>
                    </div>
                )}

                {/* Pending badge */}
                {isActive && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-amber-400 text-[10px] font-black text-slate-900 uppercase tracking-tight rounded-full shadow-lg animate-pulse">
                        Pending
                    </div>
                )}

                {/* Rejected badge */}
                {isRejected && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-red-500 text-[10px] font-black text-white uppercase tracking-tight rounded-full shadow-lg">
                        Rejected
                    </div>
                )}
            </div>

            <div className="text-center">
                <span className={`block text-sm font-extrabold mb-1 ${isInactive ? 'text-slate-500' : 'text-slate-100'}`}>
                    {step.label}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    isCompleted ? 'text-indigo-400' :
                    isActive    ? 'text-amber-400' :
                    isRejected  ? 'text-red-400' :
                    'text-slate-600'
                }`}>{step.sub}</span>
            </div>
        </div>
    );
};

/* ─────────────── main component ─────────────── */
const LeaveApplication = ({ viewRole }) => {
    const { user } = useUser();
    const [purpose, setPurpose]                   = useState('');
    const [startDate, setStartDate]               = useState('');
    const [endDate, setEndDate]                   = useState('');
    const [category, setCategory]                 = useState('no');
    const [specialRecognition, setSpecialRecognition] = useState('none');
    const [documentFile, setDocumentFile]         = useState(null);
    const [documentName, setDocumentName]         = useState('');
    const [documentSize, setDocumentSize]         = useState('');
    const [duration, setDuration]                 = useState(0);
    const [isSubmitting, setIsSubmitting]         = useState(false);
    const [latestLeave, setLatestLeave]           = useState(null);

    /* date → duration */
    useEffect(() => {
        if (startDate && endDate) {
            const s = new Date(startDate), e = new Date(endDate);
            setDuration(e >= s ? Math.ceil(Math.abs(e - s) / 86400000) + 1 : 0);
        } else setDuration(0);
    }, [startDate, endDate]);

    /* fetch latest leave */
    const fetchLeaves = async () => {
        const id = user?.regdNo || user?.id || user?._id;
        if (!id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/leaves/student/${id}`);
            if (res.data.length > 0) setLatestLeave(res.data[0]);
        } catch (e) { console.error(e); }
    };
    useEffect(() => { fetchLeaves(); }, [user]);

    /* file handlers */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { alert('Only PDF files are allowed!'); e.target.value = ''; return; }
        setDocumentFile(file);
        setDocumentName(file.name);
        setDocumentSize((file.size / 1048576).toFixed(2) + ' MB');
    };
    const removeFile = () => { setDocumentFile(null); setDocumentName(''); setDocumentSize(''); };

    /* submit */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate || !purpose || !documentFile) {
            alert('Please fill out all mandatory fields and upload a PDF document.'); return;
        }
        if (duration <= 0) { alert('End date must be on or after start date.'); return; }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('applicantId',   user?.regdNo || user?.id || user?._id || 'user-1');
            fd.append('applicantName', user?.name || user?.fullName || 'User');
            fd.append('applicantRole', viewRole || user?.role || 'Student');
            fd.append('branch',        user?.department ? user.department.split(' ')[0] : 'CSE');
            fd.append('semester',      user?.semester || (user?.role === 'Faculty' ? 'N/A' : '1st Sem'));
            fd.append('startDate',     startDate);
            fd.append('endDate',       endDate);
            fd.append('category',      category);
            fd.append('specialRecognition', specialRecognition);
            fd.append('purpose',       purpose);
            fd.append('document',      documentFile);
            await axios.post('http://localhost:5000/api/leaves/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Leave application submitted successfully!');
            setStartDate(''); setEndDate(''); setPurpose('');
            setCategory('no'); setSpecialRecognition('none'); removeFile();
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit application.');
        } finally { setIsSubmitting(false); }
    };

    /* Hiding logic for live hierarchy */
    const isFormEdited = startDate !== '' || endDate !== '' || purpose !== '' || documentFile !== null;

    /* hierarchy steps */
    const role = viewRole || user?.role || latestLeave?.applicantRole;
    const isFacultyRole = role === 'Faculty';
    const isHODRole = role === 'HOD';
    const isDeanRole = role === 'Dean';

    let steps = [];
    if (isDeanRole) {
        steps = [
            { id: 'applicant', label: 'Dean', sub: 'SUBMITTED', icon: 'person' },
            { id: 'principal', label: 'Principal', sub: 'FINAL SANCTION', icon: 'verified_user' },
        ];
    } else if (isHODRole) {
        steps = [
            { id: 'applicant', label: 'HOD', sub: 'SUBMITTED', icon: 'account_box' },
            { id: 'registrar', label: 'Registrar', sub: 'OFFICE AUDIT', icon: 'shield_person' },
            { id: 'principal', label: 'Principal', sub: 'FINAL SANCTION', icon: 'verified_user' },
        ];
    } else {
        steps = [
            { 
                id: 'applicant', 
                label: isFacultyRole ? 'Faculty' : 'Student', 
                sub: 'SUBMITTED', 
                icon: 'person' 
            },
            { id: 'hod', label: 'HOD', sub: 'DEPT. VERIFICATION', icon: 'account_balance' },
            {
                id: isFacultyRole ? 'registrar' : 'dean',
                label: isFacultyRole ? 'Registrar' : 'Dean',
                sub: isFacultyRole ? 'OFFICE AUDIT' : 'INSTITUTIONAL AUDIT',
                icon: isFacultyRole ? 'shield_person' : 'verified'
            },
            { id: 'principal', label: 'Principal', sub: 'FINAL SANCTION', icon: 'verified_user' },
        ];
    }

    /* shared input classes */
    const inputCls = "w-full glass-input rounded-2xl text-slate-200 font-medium outline-none transition-all duration-300 py-4 px-4";
    const iconCls  = "material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-xl select-none pointer-events-none";

    return (
        <div
            className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative text-slate-200"
            style={{
                background: 'radial-gradient(at 0% 0%, rgba(99,102,241,0.14) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139,92,246,0.14) 0px, transparent 50%), #05070a',
            }}
        >
            {/* aurora blobs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]"
                     style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]"
                     style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12 pb-16 relative">

                {/* ── Header ── */}
                <header className="mb-12">
                    <h1 className="text-5xl font-extrabold tracking-tighter mb-3 text-white">
                        Leave{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Application
                        </span>{' '}
                        Portal
                    </h1>
                    <p className="text-slate-400 max-w-xl text-base font-light leading-relaxed">
                        Enterprise-grade {user?.role?.toLowerCase() ?? 'student'} leave management featuring adaptive
                        workflows and intelligent processing.
                    </p>
                </header>

                {/* ── Form card ── */}
                <section
                    className="p-10 rounded-[2.5rem] mb-10 relative overflow-hidden"
                    style={{
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(15,23,42,0.4)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* decorative glow */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
                         style={{ background: 'rgba(99,102,241,0.1)' }} />

                    <form className="space-y-10" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* ── Left: fields ── */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* App Date (readonly) */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Application Date</label>
                                        <div className="relative">
                                            <span className={iconCls} style={{ color: 'rgba(99,102,241,0.7)' }}>calendar_today</span>
                                            <input
                                                className={inputCls + " pl-12 text-slate-500"}
                                                style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                                                readOnly type="text"
                                                value={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            />
                                        </div>
                                    </div>
                                    <div className="hidden md:block" />

                                    {/* Start Date */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(99,102,241,0.9)' }}>Start Date</label>
                                        <div className="relative">
                                            <span className={iconCls}>event</span>
                                            <input type="date"
                                                className={inputCls + " pl-12"}
                                                style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">End Date</label>
                                        <div className="relative">
                                            <span className={iconCls}>event_busy</span>
                                            <input type="date"
                                                className={inputCls + " pl-12"}
                                                style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Leave Category */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Leave Category</label>
                                        <div className="relative">
                                            <span className={iconCls}>medical_services</span>
                                            <select
                                                className={inputCls + " pl-12 pr-10 appearance-none cursor-pointer"}
                                                style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                value={category} onChange={(e) => setCategory(e.target.value)}
                                            >
                                                <option value="no">Personal / Casual</option>
                                                <option value="yes">Medical Grounds</option>
                                                <option value="official">Official Leave</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>

                                    {/* Special Category */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Special Category</label>
                                        <div className="relative">
                                            <span className={iconCls}>verified</span>
                                            <select
                                                className={inputCls + " pl-12 pr-10 appearance-none cursor-pointer"}
                                                style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                value={specialRecognition} onChange={(e) => setSpecialRecognition(e.target.value)}
                                            >
                                                <option value="none">Not Applicable</option>
                                                {isFacultyRole ? (
                                                    <>
                                                        <option value="academic">Academic / Duty Leave</option>
                                                        <option value="annual">Annual Leave</option>
                                                        <option value="emergency">Emergency Leave</option>
                                                        <option value="institutional_duty">Institutional Duty</option>
                                                        <option value="sick">Sick Leave (SL)</option>
                                                        <option value="sports">University Sports Representation</option>
                                                        <option value="others">Others</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="academic">Academic / Duty Leave</option>
                                                        <option value="ncc">National Cadet Corps (NCC)</option>
                                                        <option value="sports">University Sports Representation</option>
                                                        <option value="others">Institutional Duty</option>
                                                    </>
                                                )}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end ml-1 mb-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Purpose of Leave</label>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{purpose.length} / 200 Characters</span>
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-5 text-indigo-400 text-xl pointer-events-none">description</span>
                                        <textarea
                                            className="w-full pl-12 pr-6 py-5 rounded-[1.5rem] min-h-[150px] resize-none custom-scrollbar text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-300"
                                            style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            maxLength="200"
                                            placeholder="State your reason with professional clarity..."
                                            value={purpose} onChange={(e) => setPurpose(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Right: duration widget ── */}
                            <div className="lg:col-span-4">
                                <div
                                    className="h-full rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                                        boxShadow: '0 0 40px rgba(99,102,241,0.35)',
                                        minHeight: '260px',
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-20" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-white/80 font-black text-xs tracking-[0.2em] uppercase">Total Duration</span>
                                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                                <span className="material-symbols-outlined text-white text-xl block">calculate</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-7xl font-black text-white tracking-tighter drop-shadow-xl">
                                                {String(Math.max(0, duration)).padStart(2, '0')}
                                            </span>
                                            <span className="text-xl font-bold text-white/70 uppercase tracking-wider">Days</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">Calculated</p>
                                            <span className="text-[10px] text-white/50 font-mono">100%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-full h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Documentation ── */}
                            <div className="lg:col-span-12 space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Documentation</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {!documentFile ? (
                                        <label
                                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-500 group"
                                            style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                                                     style={{ background: 'rgba(99,102,241,0.12)' }}>
                                                    <span className="material-symbols-outlined text-2xl text-indigo-400">cloud_upload</span>
                                                </div>
                                                <p className="text-sm text-slate-400"><span className="font-bold text-slate-200">Upload</span> or drag files</p>
                                                <p className="text-xs text-slate-600 mt-1">PDF only</p>
                                            </div>
                                            <input className="hidden" type="file" accept="application/pdf" onChange={handleFileChange} />
                                        </label>
                                    ) : (
                                        <div
                                            className="p-6 rounded-[2rem] flex items-center gap-5 h-40"
                                            style={{ background: 'rgba(2,6,23,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        >
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                                                 style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}>
                                                <span className="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-bold text-slate-200 truncate pr-3">{documentName}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{documentSize}</span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                    <div className="w-full h-full" style={{ background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />
                                                </div>
                                            </div>
                                            <button type="button" onClick={removeFile}
                                                className="p-2 rounded-xl text-slate-500 hover:bg-white/10 transition-colors">
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="pt-4">
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full text-white font-extrabold py-6 px-8 rounded-[1.5rem] flex items-center justify-center gap-4 group relative overflow-hidden transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(90deg, #6366f1, #a855f7, #6366f1)',
                                    backgroundSize: '200% auto',
                                    boxShadow: '0 15px 40px -10px rgba(99,102,241,0.55)',
                                }}
                            >
                                {isSubmitting
                                    ? <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                                    : <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                                }
                                <span className="text-xl tracking-tight">{isSubmitting ? 'Processing...' : 'Submit Leave Application'}</span>
                            </button>
                        </div>
                    </form>
                </section>

                {/* ── Approval Hierarchy ── */}
                {latestLeave && !isFormEdited && (
                    <section
                        className="p-10 rounded-[2.5rem] relative overflow-hidden mb-6"
                        style={{
                            backdropFilter: 'blur(30px)',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]"
                             style={{ background: 'rgba(99,102,241,0.1)' }} />

                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-14 text-center">
                            Live Approval Hierarchy
                        </h3>

                        {/* timeline */}
                        <div className="relative max-w-4xl mx-auto px-4">
                            {/* base track */}
                            <div className="absolute top-[48px] left-0 w-full h-[2px] hidden md:block"
                                 style={{ background: 'rgba(255,255,255,0.08)' }}>
                                {/* progress fill */}
                                <div
                                    className="h-full transition-all duration-1000"
                                    style={{
                                        width: getProgressWidth(latestLeave),
                                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                                        boxShadow: '0 0 12px rgba(99,102,241,0.6)',
                                    }}
                                />
                            </div>

                            <div className={`relative z-10 grid gap-6 ${isDeanRole ? 'grid-cols-2 max-w-xl mx-auto' : isHODRole ? 'grid-cols-3 max-w-3xl mx-auto' : 'grid-cols-2 md:grid-cols-4'}`}>
                                {steps.map((step, i) => (
                                    <StepCard key={step.id} step={step} status={getStepStatus(i, latestLeave)} />
                                ))}
                            </div>
                        </div>

                        {/* overall status badge */}
                        <div className="flex flex-col items-center mt-10 gap-3">
                            <div
                                className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest"
                                style={
                                    latestLeave.status === 'Approved'
                                        ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }
                                        : latestLeave.status === 'Rejected'
                                        ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
                                        : { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }
                                }
                            >
                                {latestLeave.status === 'Approved' ? '✓ Fully Approved'
                                 : latestLeave.status === 'Rejected' ? '✗ Rejected'
                                 : '⏳ Pending Approval'}
                            </div>

                            {/* Registrar Cleared Hint for Faculty */}
                            {latestLeave.applicantRole === 'Faculty' && latestLeave.status === 'Pending_Principal' && (
                                <div className="animate-bounce-subtle mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-400">
                                        Registrar Approved - You can proceed with your leave
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <footer className="text-center pt-2 pb-4">
                    <p className="text-slate-600 text-sm font-medium">
                        Need technical assistance?{' '}
                        <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-400/30">
                            ERP Support Services
                        </a>
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default LeaveApplication;
