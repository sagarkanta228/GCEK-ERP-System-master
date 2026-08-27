import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Star } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const FeedbackStudent = () => {
    const { user } = useUser();
    const [publishedForms, setPublishedForms] = useState([]);
    const [activeForm, setActiveForm] = useState(null);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAvailableForms = async () => {
            if (!user) return;
            try {
                // Fetch branch or simulate CSE
                const branch = user.department ? user.department.split(' ')[0] : 'CSE';
                const res = await axios.get(`http://localhost:5000/api/feedback/student/available?branch=${branch}`);

                // For each form, we should ideally check if already submitted.
                // We'll fetch them, and mark submitted if checked.
                const formsData = res.data;
                const formsWithStatus = await Promise.all(formsData.map(async (form) => {
                    const checkRes = await axios.get(`http://localhost:5000/api/feedback/student/check?formId=${form._id}&studentRegdNo=${user.regdNo || 'std-1'}`);
                    return {
                        ...form,
                        submitted: checkRes.data.submitted
                    };
                }));

                setPublishedForms(formsWithStatus);
            } catch (error) {
                console.error("Error fetching available forms:", error);
            }
        };
        fetchAvailableForms();
    }, [user]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const formDetails = publishedForms.find(f => f._id === activeForm);

            // Format answers array
            const answers = Object.keys(responses).map(qText => ({
                question: qText,
                answer: responses[qText].toString()
            }));

            const payload = {
                formId: activeForm,
                studentRegdNo: user?.regdNo || 'std-1',
                answers
            };

            await axios.post('http://localhost:5000/api/feedback/submit', payload);

            setPublishedForms(publishedForms.map(f => f._id === activeForm ? { ...f, submitted: true } : f));
            setActiveForm(null);
            setResponses({});
        } catch (error) {
            console.error("Error submitting response:", error);
            alert(error.response?.data?.message || 'Error submitting feedback.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubmission = async (formId) => {
        if (!window.confirm("Are you sure you want to delete your feedback submission?")) return;

        try {
            setLoading(true);
            await axios.delete(`http://localhost:5000/api/feedback/student/submit`, {
                params: {
                    formId: formId,
                    studentRegdNo: user?.regdNo || 'std-1'
                }
            });

            setPublishedForms(publishedForms.map(f => f._id === formId ? { ...f, submitted: false } : f));
            alert("Feedback submission deleted successfully.");
        } catch (error) {
            console.error("Error deleting submission:", error);
            alert(error.response?.data?.message || "Failed to delete submission.");
        } finally {
            setLoading(false);
        }
    };

    if (activeForm) {
        const formDetails = publishedForms.find(f => f._id === activeForm);
        return (
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark p-8 max-w-3xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold dark:text-white mb-2">{formDetails.title}</h2>
                    <p className="text-slate-500">{formDetails.description}</p>
                </div>

                <div className="p-4 mb-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl flex gap-3 text-blue-700 dark:text-blue-400 text-sm">
                    <span className="material-symbols-outlined shrink-0">info</span>
                    <p>Your responses are <strong>100% anonymous</strong>. Student names, roll numbers, or emails are not recorded with this submission.</p>
                </div>

                <div className="space-y-8">
                    {formDetails.questions && formDetails.questions.map((q, idx) => {
                        const isObject = typeof q === 'object' && q !== null;
                        const qText = isObject ? q.text : q;
                        const qType = isObject ? q.type : (qText.toLowerCase().includes('rate') || qText.toLowerCase().includes('rating') ? 'rating' : 'text');

                        return (
                        <div key={idx}>
                            <p className="font-semibold text-sm mb-3 dark:text-slate-200">{idx + 1}. {qText}</p>
                            {qType === 'rating' ? (
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setResponses({ ...responses, [qText]: rating })}
                                            className="focus:outline-none"
                                            title={`Rate ${rating} stars`}
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors duration-200 ${responses[qText] >= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-200'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full p-3 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-slate-200 custom-scrollbar"
                                    rows="4"
                                    placeholder="Enter your feedback here..."
                                    onChange={e => setResponses({ ...responses, [qText]: e.target.value })}
                                ></textarea>
                            )}
                        </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200 dark:border-border-dark">
                    <button onClick={() => setActiveForm(null)} className="px-6 py-2 bg-slate-100 dark:bg-background-dark text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors">
                        Cancel
                    </button>
                    <button disabled={loading} onClick={handleSubmit} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:brightness-110 flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                        {loading ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <Send size={16} />}
                        {loading ? 'Submitting...' : 'Submit Anonymously'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold dark:text-white">Student Feedback Portal</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Provide anonymous feedback on courses, facilities, and academic experiences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {publishedForms.map(form => (
                    <div key={form._id} className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg dark:text-white">{form.title}</h3>
                                {form.submitted && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full uppercase">
                                        <CheckCircle size={12} /> Submitted
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{form.description}</p>
                        </div>
                        {form.submitted ? (
                            <div className="flex gap-2 w-full mt-4">
                                <button disabled className="flex-1 py-2.5 bg-slate-100 dark:bg-background-dark text-slate-400 dark:text-slate-500 text-sm font-bold rounded-lg cursor-not-allowed">
                                    Already Submitted
                                </button>
                                <button
                                    onClick={() => handleDeleteSubmission(form._id)}
                                    className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-500 rounded-lg transition-colors font-bold flex items-center justify-center cursor-pointer"
                                    title="Delete Submission"
                                    disabled={loading}
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setActiveForm(form._id)} className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white text-sm font-bold rounded-lg transition-colors">
                                Fill Form
                            </button>
                        )}
                    </div>
                ))}

                {publishedForms.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-border-dark rounded-xl">
                        No feedback forms currently assigned to you.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackStudent;
