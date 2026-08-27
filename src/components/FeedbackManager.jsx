import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Download, BarChart2, Star } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const FeedbackManager = () => {
    const { user } = useUser();
    const [forms, setForms] = useState([]);
    const [activeView, setActiveView] = useState('list'); // list, create, results
    const [currentForm, setCurrentForm] = useState({ title: '', description: '', questions: [] });
    const [selectedForm, setSelectedForm] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch forms for this faculty
    useEffect(() => {
        const fetchForms = async () => {
            if (!user) return;
            try {
                const branch = user.department ? user.department.split(' ')[0] : 'CSE';
                const isHOD = user.role === 'HOD' || user?.assignedRole?.includes('HOD');
                const url = isHOD
                    ? `http://localhost:5000/api/feedback/branch/${branch}`
                    : `http://localhost:5000/api/feedback/faculty/${user.id || 'faculty-1'}`;
                const res = await axios.get(url);
                setForms(res.data);
            } catch (error) {
                console.error("Error fetching faculty forms:", error);
            }
        };
        fetchForms();
    }, [user, activeView]);

    const handleAddQuestion = () => {
        setCurrentForm({
            ...currentForm,
            questions: [...currentForm.questions, { id: Date.now(), text: '', type: 'rating' }]
        });
    };

    const handleQuestionTextChange = (id, text) => {
        setCurrentForm({
            ...currentForm,
            questions: currentForm.questions.map(q => q.id === id ? { ...q, text } : q)
        });
    };

    const handleQuestionTypeChange = (id, type) => {
        setCurrentForm({
            ...currentForm,
            questions: currentForm.questions.map(q => q.id === id ? { ...q, type } : q)
        });
    };

    const handleRemoveQuestion = (id) => {
        setCurrentForm({
            ...currentForm,
            questions: currentForm.questions.filter(q => q.id !== id)
        });
    };

    const handleSaveForm = async (publish = false) => {
        try {
            setLoading(true);
            const branch = user?.department ? user.department.split(' ')[0] : 'CSE';

            const questionData = currentForm.questions.map(q => ({
                text: q.text,
                type: q.type || 'rating'
            }));

            const payload = {
                facultyId: user?.id || 'faculty-1',
                facultyBranch: branch,
                title: currentForm.title || 'Untitled Form',
                description: currentForm.description || '',
                questions: questionData
            };

            const res = await axios.post('http://localhost:5000/api/feedback/create', payload);

            if (publish) {
                // Publish it immediately
                await axios.patch(`http://localhost:5000/api/feedback/${res.data.form._id}/publish`);
            }

            setActiveView('list');
            setCurrentForm({ title: '', description: '', questions: [] });
        } catch (error) {
            console.error("Error saving form:", error);
            const msg = error.response?.data?.message || "Failed to save form. Check server connection.";
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishExisting = async (formId) => {
        try {
            setLoading(true);
            await axios.patch(`http://localhost:5000/api/feedback/${formId}/publish`);
            // Refresh
            setActiveView('create');
            setActiveView('list');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteForm = async (formId) => {
        if (!window.confirm('Are you sure you want to delete this feedback form? All associated responses will also be deleted.')) {
            return;
        }
        try {
            setLoading(true);
            await axios.delete(`http://localhost:5000/api/feedback/${formId}`, {
                params: {
                    role: user?.role,
                    assignedRole: user?.assignedRole,
                    userId: user?.id || user?.regdNo
                }
            });
            setForms(forms.filter(f => f._id !== formId));
            if (selectedForm && selectedForm._id === formId) {
                setActiveView('list');
            }
        } catch (error) {
            console.error("Error deleting form:", error);
            alert("Failed to delete form.");
        } finally {
            setLoading(false);
        }
    };

    const loadResults = async (form) => {
        setSelectedForm(form);
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/feedback/${form._id}/responses`);
            // Calculate averages or just display responses
            // Let's aggregate answers per question
            const aggregated = form.questions.map(q => {
                const qText = typeof q === 'string' ? q : q.text;
                const qType = typeof q === 'string' ? 'text' : q.type;
                
                const answers = res.data.map(resp => resp.answers.find(a => a.question === qText)?.answer).filter(a => a);
                let avg = 'N/A';
                let type = qType;
                let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                
                if (answers.length > 0) {
                    const numericAnswers = answers.map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 5);
                    if (qType === 'rating') {
                        type = 'rating';
                        if (numericAnswers.length > 0) {
                            avg = (numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length).toFixed(1);
                            numericAnswers.forEach(n => {
                                distribution[n] = (distribution[n] || 0) + 1;
                            });
                        }
                    } else {
                        avg = answers[0] ? (answers[0].substring(0, 50) + (answers[0].length > 50 ? '...' : '')) : 'N/A';
                    }
                }
                const totalNumeric = distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5];
                return { q: qText, avg, type, distribution, allAnswers: answers, totalNumeric };
            });
            setResults(aggregated);
            setActiveView('results');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!selectedForm || results.length === 0) return;
        const header = "Question,Aggregated Response\n";
        const rows = results.map(r => `"${r.q.replace(/"/g, '""')}","${r.avg.replace(/"/g, '""')}"`).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + header + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `feedback_${selectedForm.title}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (activeView === 'create') {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Create Feedback Form</h2>
                    <button onClick={() => setActiveView('list')} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Cancel</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Form Title"
                            className="w-full text-2xl font-bold border-none bg-transparent focus:ring-0 outline-none dark:text-white placeholder-slate-300"
                            value={currentForm.title}
                            onChange={e => setCurrentForm({ ...currentForm, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Form Description"
                            className="w-full text-sm mt-2 border-none bg-transparent focus:ring-0 outline-none text-slate-500 placeholder-slate-400"
                            value={currentForm.description}
                            onChange={e => setCurrentForm({ ...currentForm, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        {currentForm.questions.map((q, index) => (
                            <div key={q.id} className="p-4 bg-slate-50 dark:bg-background-dark/50 rounded-xl border border-slate-200 dark:border-border-dark">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            placeholder={`Question ${index + 1}`}
                                            className="w-full p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm outline-none focus:border-primary"
                                            value={q.text}
                                            onChange={e => handleQuestionTextChange(q.id, e.target.value)}
                                        />
                                        <select
                                            className="p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm outline-none"
                                            value={q.type}
                                            onChange={e => handleQuestionTypeChange(q.id, e.target.value)}
                                        >
                                            <option value="rating">Star Rating (1-5)</option>
                                            <option value="text">Short Answer</option>
                                            <option value="paragraph">Paragraph</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleRemoveQuestion(q.id)} className="text-slate-400 hover:text-rose-500 mt-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddQuestion}
                        className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-xl text-slate-500 font-semibold hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2"
                    >
                        <Plus size={18} /> Add Question
                    </button>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-border-dark">
                        <button disabled={loading} onClick={() => handleSaveForm(false)} className="px-6 py-2 bg-slate-100 dark:bg-background-dark text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark">Save Draft</button>
                        <button disabled={loading} onClick={() => handleSaveForm(true)} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
                            {loading ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <Send size={16} />}
                            {loading ? 'Publishing...' : 'Publish Form'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeView === 'results') {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Form Results & Analytics</h2>
                        <p className="text-sm text-slate-500">{selectedForm?.title} ({selectedForm?.responseCount} Responses)</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV} className="px-4 py-2 border border-slate-200 dark:border-border-dark text-sm font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-background-dark/50 flex items-center gap-2">
                            <Download size={16} /> Export CSV
                        </button>
                        <button onClick={() => setActiveView('list')} className="px-4 py-2 bg-slate-100 dark:bg-background-dark text-sm font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-surface-dark">
                            Back
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Note on Anonymity */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-700 dark:text-emerald-400">
                        <span className="material-symbols-outlined mt-0.5">verified_user</span>
                        <div>
                            <h4 className="font-bold text-sm">Anonymous Responses Protected</h4>
                            <p className="text-xs opacity-80">Student identities are scrubbed from all feedback submissions as per institutional policy. Only aggregate data and generic text are visible.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.map((res, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm">
                                <h4 className="font-semibold text-sm mb-4 dark:text-white">{res.q}</h4>
                                {res.type === 'rating' ? (
                                    <>
                                        <div className="flex items-end gap-3 mb-6">
                                            <div className="text-4xl font-bold text-primary">{res.avg}</div>
                                            <div className="flex pb-1 gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={16} className={star <= Math.round(res.avg) ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"} />
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-500 pb-1 ml-auto">{res.totalNumeric} ratings</div>
                                        </div>
                                        <div className="space-y-2">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = res.distribution[star] || 0;
                                                const percentage = res.totalNumeric ? (count / res.totalNumeric) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-2 text-xs">
                                                        <span className="w-2 font-medium text-slate-600 dark:text-slate-400">{star}</span>
                                                        <Star size={10} className="fill-slate-400 text-slate-400" />
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-background-dark rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                        <span className="w-6 text-right text-slate-500">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-background-dark p-3 rounded-lg w-full border border-slate-100 dark:border-border-dark italic">
                                            "{res.avg}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Feedback Forms</h2>
                <button
                    onClick={() => setActiveView('create')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors"
                >
                    <Plus size={16} />
                    Create New Form
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {forms.map(form => (
                    <div key={form._id} className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/30 transition-colors">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg dark:text-white">{form.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${form.status === 'Published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                    {form.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{form.responseCount || 0} anonymous responses received</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            {form.status === 'Draft' ? (
                                <button disabled={loading} onClick={() => handlePublishExisting(form._id)} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-border-dark rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Send size={16} /> Publish
                                </button>
                            ) : (
                                <button
                                    onClick={() => loadResults(form)}
                                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-border-dark rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors flex items-center justify-center gap-2 dark:text-slate-300"
                                >
                                    <BarChart2 size={16} /> View Results
                                </button>
                            )}
                            <button
                                disabled={loading}
                                onClick={() => handleDeleteForm(form._id)}
                                className="px-3 py-2 border border-rose-200 dark:border-rose-800/30 text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center disabled:opacity-50"
                                title="Delete Form"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {forms.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-border-dark rounded-xl">
                        No feedback forms created yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackManager;
