import React from 'react';

/* ─── helpers ─── */
const getStepStatus = (index, leave) => {
    if (index === 0) return 'completed';

    const isFaculty = leave?.applicantRole === 'Faculty';
    const order = isFaculty 
        ? ['Pending_HOD', 'Pending_Registrar', 'Pending_Principal', 'Approved']
        : ['Pending_HOD', 'Pending_Dean', 'Pending_Principal', 'Approved'];
    
    const currentIdx = order.indexOf(leave?.status);

    if (leave?.status === 'Rejected') {
        const reason = leave.rejectionReason?.toLowerCase() || '';
        let rejStep = 1; // Default HOD
        if (isFaculty) {
            if (reason.includes('registrar')) rejStep = 2;
        } else {
            if (reason.includes('dean')) rejStep = 2;
        }
        if (reason.includes('principal')) rejStep = 3;
        
        if (index === rejStep) return 'rejected';
        if (index < rejStep) return 'completed';
        return 'inactive';
    }

    if (index === currentIdx + 1) return 'active';
    if (index < currentIdx + 1 || leave?.status === 'Approved') return 'completed';
    return 'inactive';
};

const statusColorMap = {
    completed: { bg: '#6366f1', border: 'rgba(165,180,252,0.8)', text: 'text-white', icon: 'check_circle', label: 'Approved', color: '#34d399' },
    active:    { bg: 'rgba(15,23,42,0.9)', border: 'rgba(251,191,36,0.8)', text: 'text-amber-400', icon: 'hourglass_top', label: 'Pending', color: '#fbbf24' },
    rejected:  { bg: 'rgba(15,23,42,0.9)', border: 'rgba(239,68,68,0.6)', text: 'text-red-400', icon: 'cancel', label: 'Rejected', color: '#f87171' },
    inactive:  { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: 'text-slate-600', icon: 'radio_button_unchecked', label: 'Waiting', color: '#64748b' },
};

/* ─── component ─── */
const LeaveTrackingModal = ({ leave, onClose }) => {
    if (!leave) return null;

    const isFaculty = leave.applicantRole === 'Faculty';
    const steps = [
        { id: 'applicant', label: isFaculty ? 'Faculty' : 'Student', sub: 'Submitted',          icon: 'person' },
        { id: 'hod',       label: 'HOD',                              sub: 'Dept. Verification', icon: 'account_balance' },
        { 
            id: isFaculty ? 'registrar' : 'dean', 
            label: isFaculty ? 'Registrar' : 'Dean', 
            sub: isFaculty ? 'Office Audit' : 'Institutional Audit', 
            icon: isFaculty ? 'shield_person' : 'verified' 
        },
        { id: 'principal', label: 'Principal',                        sub: 'Final Sanction',     icon: 'verified_user' },
    ];

    const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={onClose}
        >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* modal */}
            <div
                className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden animation-fade-in-up"
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(8,9,15,0.98))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
                     style={{ background: 'rgba(99,102,241,0.15)' }} />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
                     style={{ background: 'rgba(139,92,246,0.1)' }} />

                {/* header */}
                <div className="relative flex items-center justify-between p-6 pb-4 border-b border-white/5">
                    <div>
                        <h2 className="text-lg font-extrabold text-white tracking-tight">Leave Tracking</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Applied {formatDate(leave.appliedOn)} &middot; {leave.durationDays} day{leave.durationDays > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* leave info */}
                <div className="relative px-6 pt-4 pb-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Period</span>
                            <p className="text-slate-200 font-semibold mt-1">{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Category</span>
                            <p className="text-slate-200 font-semibold mt-1 capitalize">
                                {leave.category === 'yes' ? 'Medical' : leave.category === 'official' ? 'Official' : 'Personal'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Purpose</span>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">{leave.purpose}</p>
                    </div>
                </div>

                {/* vertical timeline */}
                <div className="relative px-6 py-5">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 text-center">Approval Timeline</h3>

                    <div className="relative ml-6">
                        {steps.map((step, i) => {
                            const status = getStepStatus(i, leave);
                            const colors = statusColorMap[status];
                            const isLast = i === steps.length - 1;

                            return (
                                <div key={step.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                    {/* vertical line */}
                                    {!isLast && (
                                        <div
                                            className="absolute left-[17px] top-[38px] w-[2px] h-[calc(100%-30px)]"
                                            style={{
                                                background: status === 'completed' || getStepStatus(i + 1, leave) !== 'inactive'
                                                    ? 'linear-gradient(to bottom, #6366f1, rgba(99,102,241,0.3))'
                                                    : 'rgba(255,255,255,0.06)',
                                            }}
                                        />
                                    )}

                                    {/* icon circle */}
                                    <div
                                        className="relative z-10 w-[34px] h-[34px] shrink-0 rounded-xl flex items-center justify-center transition-all duration-300"
                                        style={{
                                            background: colors.bg,
                                            border: `2px solid ${colors.border}`,
                                            boxShadow: status !== 'inactive' ? `0 0 12px ${colors.border}` : 'none',
                                        }}
                                    >
                                        <span className={`material-symbols-outlined text-base ${colors.text}`}>{step.icon}</span>
                                    </div>

                                    {/* text */}
                                    <div className="pt-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${status === 'inactive' ? 'text-slate-500' : 'text-slate-100'}`}>
                                                {step.label}
                                            </span>
                                            <span
                                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: colors.color,
                                                    background: `${colors.color}15`,
                                                    border: `1px solid ${colors.color}30`,
                                                }}
                                            >
                                                {colors.label}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{step.sub}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* rejection reason */}
                {leave.status === 'Rejected' && leave.rejectionReason && (
                    <div className="mx-6 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Rejection Reason</span>
                        </div>
                        <p className="text-xs text-red-300/80 leading-relaxed">{leave.rejectionReason}</p>
                    </div>
                )}

                {/* overall footer status */}
                <div className="px-6 pb-5 pt-1 flex flex-col items-center gap-3">
                    <div
                        className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                        style={
                            leave.status === 'Approved'
                                ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }
                                : leave.status === 'Rejected'
                                ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
                                : { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }
                        }
                    >
                        {leave.status === 'Approved' ? '✓ Fully Approved'
                         : leave.status === 'Rejected' ? '✗ Rejected'
                         : '⏳ Pending Final Sanction'}
                    </div>

                    {/* Registrar Cleared Hint for Faculty */}
                    {leave.applicantRole === 'Faculty' && leave.status === 'Pending_Principal' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-pulse">
                            <span className="material-symbols-outlined text-emerald-400 text-xs">verified</span>
                            <span className="text-[9px] font-black uppercase tracking-tight text-emerald-400">
                                Registrar Approved - You can proceed with leave
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaveTrackingModal;
