import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const LeaveApprovals = ({ role }) => {
    const { user } = useUser();
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const branch = user?.department ? user.department.split(' ')[0] : '';
            const res = await axios.get(`http://localhost:5000/api/leaves/pending`, {
                params: { role, branch }
            });
            setPendingLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch pending leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role) {
            fetchLeaves();
        }
    }, [role, user]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this leave application?`)) return;

        try {
            await axios.patch(`http://localhost:5000/api/leaves/${id}/status`, {
                action,
                role
            });
            alert(`Application ${action}d successfully.`);
            fetchLeaves();
        } catch (error) {
            console.error(`Failed to ${action} leave:`, error);
            alert(error.response?.data?.message || `Failed to ${action} leave application.`);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-500">Loading pending applications...</div>;
    }

    if (pendingLeaves.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">done_all</span>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No pending leave applications right now.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingLeaves.map((leave) => (
                <div key={leave._id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                {leave.applicantName}
                                <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 dark:bg-background-dark text-slate-500 rounded-md">
                                    {leave.applicantId}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md uppercase">
                                    {leave.applicantRole}
                                </span>
                            </h4>
                            <p className="text-sm text-slate-500">{leave.branch} {leave.semester && leave.semester !== 'N/A' ? `• ${leave.semester}` : ''}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                {leave.durationDays} Days
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-lg">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Dates</span>
                            <span className="text-slate-900 dark:text-slate-200 font-medium">
                                {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-background-dark p-3 rounded-lg">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category</span>
                            <span className="text-slate-900 dark:text-slate-200 font-medium">
                                {leave.category === 'yes' ? 'Medical Grounds' : 
                                 leave.category === 'official' ? 'Official Leave' : 'Personal / Casual'}
                                {leave.specialRecognition !== 'none' && (
                                    <>
                                        {' • '}
                                        {leave.specialRecognition === 'sick' ? 'Sick Leave (SL)' :
                                         leave.specialRecognition === 'annual' ? 'Annual Leave' :
                                         leave.specialRecognition === 'emergency' ? 'Emergency Leave' :
                                         leave.specialRecognition === 'institutional_duty' ? 'Institutional Duty' :
                                         leave.specialRecognition === 'ncc' ? 'National Cadet Corps (NCC)' :
                                         leave.specialRecognition === 'sports' ? 'University Sports Representation' :
                                         leave.specialRecognition === 'others' ? (leave.applicantRole === 'Faculty' ? 'Others' : 'Institutional Duty') : 
                                         leave.specialRecognition}
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Purpose</span>
                        <p className="text-slate-700 dark:text-slate-300 text-sm bg-slate-50 dark:bg-background-dark p-4 rounded-xl border border-slate-100 dark:border-border-dark">
                            {leave.purpose}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-border-dark">
                        <a
                            href={`http://localhost:5000${leave.documentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">description</span>
                            View Attached Document
                        </a>
                        <div className="flex w-full sm:w-auto gap-3">
                            <button
                                onClick={() => handleAction(leave._id, 'reject')}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-500 rounded-xl transition-colors font-bold text-sm"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction(leave._id, 'approve')}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/20 dark:hover:bg-emerald-500 rounded-xl transition-colors font-bold text-sm"
                            >
                                Approve ({role})
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LeaveApprovals;
