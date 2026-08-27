import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
const SECTIONS  = ['Section A', 'Section B', 'Section C', 'None'];
const BRANCHES  = ['CSE', 'Mechanical', 'Electrical', 'Civil', 'Basic Science and Humanities'];

const API = 'http://localhost:5000/api/students';

// ── Inline CSS tokens ──────────────────────────────────────────
const cls = {
    label: 'block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1',
    input: 'w-full px-3 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all',
};

// ════════════════════════════════════════════════════════
//  Edit / Add Modal (shared)
// ════════════════════════════════════════════════════════
const StudentModal = ({ student, hodBranch, onClose, onDone }) => {
    const isEdit = !!student?._id;
    const [f, setF] = useState({
        regdNo:      student?.regdNo      || '',
        name:        student?.name        || '',
        branch:      student?.branch      || hodBranch || 'CSE',
        semester:    student?.semester    || '1st Sem',
        section:     student?.section     || 'None',
        email:       student?.email       || '',
        phoneNumber: student?.phoneNumber || '',
    });
    const [saving, setSaving] = useState(false);
    const [err,    setErr]    = useState('');

    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!f.name.trim()) { setErr('Name is required.'); return; }
        if (!isEdit && !f.regdNo.trim()) { setErr('Registration No. is required.'); return; }
        setSaving(true); setErr('');
        try {
            let res;
            if (isEdit) {
                res = await axios.put(`${API}/${student._id}`, f);
                onDone('edit', res.data.student);
            } else {
                res = await axios.post(`${API}/add`, f);
                onDone('add', res.data.student);
            }
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to save.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
                    <h3 className="font-bold dark:text-white">{isEdit ? 'Edit Student' : 'Add New Student'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl leading-none cursor-pointer">&times;</button>
                </div>

                {/* Body */}
                <div className="p-5 grid grid-cols-2 gap-4">
                    {err && <p className="col-span-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</p>}

                    {!isEdit && (
                        <div className="col-span-2">
                            <label className={cls.label}>Registration No. *</label>
                            <input className={`${cls.input} font-mono`} value={f.regdNo}
                                onChange={e => set('regdNo', e.target.value)} placeholder="e.g. 2301110025" />
                        </div>
                    )}
                    {isEdit && (
                        <div className="col-span-2">
                            <label className={cls.label}>Registration No.</label>
                            <input className={`${cls.input} font-mono opacity-60`} value={f.regdNo} readOnly />
                        </div>
                    )}

                    <div className="col-span-2">
                        <label className={cls.label}>Full Name *</label>
                        <input className={cls.input} value={f.name}
                            onChange={e => set('name', e.target.value)} placeholder="Student's full name" />
                    </div>

                    <div>
                        <label className={cls.label}>Branch</label>
                        <select className={cls.input} value={f.branch}
                            onChange={e => set('branch', e.target.value)} disabled={!!hodBranch}>
                            {BRANCHES.map(b => <option key={b}>{b}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cls.label}>Semester</label>
                        <select className={cls.input} value={f.semester}
                            onChange={e => set('semester', e.target.value)}>
                            {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cls.label}>Section</label>
                        <select className={cls.input} value={f.section}
                            onChange={e => set('section', e.target.value)}>
                            {SECTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={cls.label}>Phone</label>
                        <input className={cls.input} value={f.phoneNumber}
                            onChange={e => set('phoneNumber', e.target.value)} placeholder="Phone number" />
                    </div>

                    <div className="col-span-2">
                        <label className={cls.label}>Email (required for OTP login)</label>
                        <input className={cls.input} type="email" value={f.email}
                            onChange={e => set('email', e.target.value)} placeholder="student@example.com" />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 pb-5 justify-end">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className={`px-5 py-2 rounded-lg text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-60 ${isEdit ? 'bg-primary hover:brightness-110' : 'bg-emerald-500 hover:brightness-110'}`}>
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Student'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════════════
const StudentManagement = ({ branch: hodBranch }) => {
    const [activeTab, setActiveTab] = useState('records');

    // ── Records state ──
    const [students, setStudents]       = useState([]);
    const [loading,  setLoading]        = useState(false);
    const [fetchErr, setFetchErr]       = useState('');
    const [search,   setSearch]         = useState('');
    const [filterSem, setFilterSem]     = useState('');
    const [filterSec, setFilterSec]     = useState('');
    const [modalData, setModalData]     = useState(null); // null | {student} | {}
    const [delTarget, setDelTarget]     = useState(null);
    const [deleting,  setDeleting]      = useState(false);
    const [bulkDelShown, setBulkDelShown] = useState(false);
    const [bulkDeleting,  setBulkDeleting]  = useState(false);
    const [bulkConfirmText, setBulkConfirmText] = useState('');

    // ── Import state ──
    const [impBranch,   setImpBranch]   = useState(hodBranch || 'CSE');
    const [impSemester, setImpSemester] = useState('5th Sem');
    const [impSection,  setImpSection]  = useState('Section A');
    const [csvData,     setCsvData]     = useState('');
    const [file,        setFile]        = useState(null);
    const [importing,   setImporting]   = useState(false);
    const [impMsg,      setImpMsg]      = useState('');

    // ── Fetch students from DB ──
    const fetchStudents = async () => {
        setLoading(true);
        setFetchErr('');
        try {
            // Use the branch exactly as stored — no regex needed
            const branch = hodBranch || impBranch;
            const params = new URLSearchParams({ branch });
            if (filterSem) params.append('semester', filterSem);
            if (filterSec) params.append('section', filterSec === 'None' ? 'None' : filterSec);

            const res = await axios.get(`${API}?${params.toString()}`);
            setStudents(res.data || []);
        } catch (e) {
            setFetchErr(e.response?.data?.message || 'Failed to load students. Check server connection.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch whenever tab becomes 'records' or filters change
    useEffect(() => {
        if (activeTab === 'records') fetchStudents();
    }, [activeTab, filterSem, filterSec]);

    // ── Client-side search filter ──
    const visible = students.filter(s => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            s.name?.toLowerCase().includes(q) ||
            s.regdNo?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        );
    });

    // ── Delete ──
    const handleDelete = async () => {
        if (!delTarget) return;
        setDeleting(true);
        try {
            await axios.delete(`${API}/${delTarget._id}`);
            setStudents(prev => prev.filter(s => s._id !== delTarget._id));
            setDelTarget(null);
        } catch (e) {
            alert(e.response?.data?.message || 'Delete failed.');
        } finally { setDeleting(false); }
    };

    // ── Modal done callback ──
    const handleModalDone = (type, student) => {
        if (type === 'edit') {
            setStudents(prev => prev.map(s => s._id === student._id ? student : s));
        } else {
            setStudents(prev => [...prev, student]);
        }
        setModalData(null);
    };

    // ── Bulk Delete All ──
    const handleBulkDelete = async () => {
        setBulkDeleting(true);
        try {
            const branch = hodBranch || impBranch;
            const params = new URLSearchParams({ branch });
            if (filterSem) params.append('semester', filterSem);
            if (filterSec) params.append('section', filterSec);

            const res = await axios.delete(`${API}/bulk?${params.toString()}`);
            setStudents([]);
            setBulkDelShown(false);
            setBulkConfirmText('');
            alert(`✅ ${res.data.message}`);
        } catch (e) {
            console.error('Bulk delete error:', e);
            alert(e.response?.data?.message || 'Bulk delete failed.');
        } finally { setBulkDeleting(false); }
    };

    // ── Bulk Import ──
    const handleImport = async () => {
        if (!file && !csvData.trim()) { setImpMsg('❌ Please select a file or paste CSV data.'); return; }
        setImporting(true); setImpMsg('');
        try {
            let res;
            if (file) {
                const fd = new FormData();
                fd.append('branch', impBranch);
                fd.append('semester', impSemester);
                fd.append('section', impSection);
                fd.append('file', file);
                res = await axios.post(`${API}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                const lines = csvData.split('\n').filter(l => l.trim());
                const parsed = lines.map(line => {
                    const p = line.split(',').map(x => x.trim());
                    return { regdNo: p[0], name: p[1] || '', phoneNumber: p[2] || '', email: p[3] || '' };
                }).filter(s => s.regdNo && !s.regdNo.toLowerCase().includes('reg'));
                res = await axios.post(`${API}/import`, { branch: impBranch, semester: impSemester, section: impSection, students: parsed });
            }
            setImpMsg(`✅ ${res.data.message} — ${res.data.count} students imported.`);
            setFile(null); setCsvData('');
            // Auto-switch to records view
            setActiveTab('records');
        } catch (e) {
            setImpMsg(`❌ ${e.response?.data?.message || 'Import failed.'}`);
        } finally { setImporting(false); }
    };

    return (
        <div className="space-y-5">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Student Records</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {hodBranch ? `Branch: ${hodBranch}` : 'All branches'} — student data used for login & attendance
                    </p>
                </div>
                {activeTab === 'records' && (
                    <button onClick={() => setModalData({})}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:brightness-110 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20 cursor-pointer">
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Add Student
                    </button>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-surface-dark rounded-xl w-fit">
                {[
                    { key: 'records', icon: 'group', label: 'Student Records' },
                    { key: 'import',  icon: 'upload_file', label: 'Bulk Import' },
                ].map(({ key, icon, label }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                            activeTab === key
                                ? 'bg-white dark:bg-background-dark text-primary dark:text-accent-neon shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                        }`}>
                        <span className="material-symbols-outlined text-base">{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* ════════════ RECORDS TAB ════════════ */}
            {activeTab === 'records' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">

                    {/* Filter bar */}
                    <div className="flex flex-wrap gap-3 items-center p-3 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-background-dark/30">
                        <div className="relative flex-1 min-w-44">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search name, regd no, email…"
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white outline-none cursor-pointer">
                            <option value="">All Semesters</option>
                            {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <select value={filterSec} onChange={e => setFilterSec(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white outline-none cursor-pointer">
                            <option value="">All Sections</option>
                            {SECTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={fetchStudents} disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-primary dark:text-accent-neon bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50">
                            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
                            {loading ? 'Loading…' : 'Refresh'}
                        </button>
                        {students.length > 0 && (
                            <button onClick={() => { setBulkDelShown(true); setBulkConfirmText(''); }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer">
                                <span className="material-symbols-outlined text-base">delete_sweep</span>
                                Delete All
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                            <p className="text-sm font-medium">Fetching from database…</p>
                        </div>
                    ) : fetchErr ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-500">
                            <span className="material-symbols-outlined text-4xl">error</span>
                            <p className="text-sm font-medium">{fetchErr}</p>
                            <button onClick={fetchStudents}
                                className="text-xs underline text-primary cursor-pointer">Try again</button>
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                            <span className="material-symbols-outlined text-5xl opacity-20">group_off</span>
                            <p className="font-medium text-sm">No students found</p>
                            <p className="text-xs">Use "Bulk Import" to add students, or click "Add Student"</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-background-dark/60 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            <th className="px-4 py-3 text-left">#</th>
                                            <th className="px-4 py-3 text-left">Regd No.</th>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Semester</th>
                                            <th className="px-4 py-3 text-left">Section</th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">Phone</th>
                                            <th className="px-4 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                        {visible.map((s, i) => (
                                            <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group">
                                                <td className="px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                                                <td className="px-4 py-2.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{s.regdNo}</td>
                                                <td className="px-4 py-2.5 font-medium dark:text-white">{s.name}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-neon">
                                                        {s.semester}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">{s.section || '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    {s.email ? (
                                                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                            <span className="material-symbols-outlined text-xs">mark_email_read</span>
                                                            {s.email}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-xs text-amber-500">
                                                            <span className="material-symbols-outlined text-xs">warning</span>
                                                            No email
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">{s.phoneNumber || '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setModalData(s)}
                                                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer" title="Edit">
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button onClick={() => setDelTarget(s)}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer" title="Delete">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-border-dark text-xs text-slate-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Showing {visible.length} of {students.length} students
                                {hodBranch && <span className="font-bold text-primary ml-1">· {hodBranch}</span>}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ════════════ IMPORT TAB ════════════ */}
            {activeTab === 'import' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={cls.label}>Branch</label>
                            <select value={impBranch} onChange={e => setImpBranch(e.target.value)}
                                disabled={!!hodBranch}
                                className={`${cls.input} ${hodBranch ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                {BRANCHES.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={cls.label}>Semester</label>
                            <select value={impSemester} onChange={e => setImpSemester(e.target.value)} className={`${cls.input} cursor-pointer`}>
                                {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={cls.label}>Section</label>
                            <select value={impSection} onChange={e => setImpSection(e.target.value)} className={`${cls.input} cursor-pointer`}>
                                {SECTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`${cls.label} flex justify-between`}>
                                <span>Upload File (Excel / CSV / PDF)</span>
                                {file && <span className="text-rose-500 cursor-pointer" onClick={() => setFile(null)}>Clear</span>}
                            </label>
                            <input type="file" accept=".xlsx,.xls,.csv,application/pdf"
                                onChange={e => setFile(e.target.files[0])}
                                className="w-full text-sm rounded-lg border border-slate-200 dark:border-border-dark p-2 bg-slate-50 dark:bg-background-dark dark:text-white file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:brightness-110 cursor-pointer" />
                        </div>
                        <div>
                            <label className={cls.label}>Or Paste CSV Data</label>
                            <textarea
                                value={csvData}
                                disabled={!!file}
                                onChange={e => setCsvData(e.target.value)}
                                placeholder={file ? 'File selected. Clear to type.' : 'RegdNo, Name, PhoneNumber, Email\n2301110025, Ravi Kumar, 9876543210, ravi@gcek.ac.in'}
                                className="w-full h-28 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-sm rounded-lg p-3 outline-none font-mono dark:text-white resize-none disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            {impMsg && (
                                <p className={`text-sm font-bold ${impMsg.startsWith('✅') ? 'text-emerald-500' : 'text-red-500'}`}>{impMsg}</p>
                            )}
                        </div>
                        <button onClick={handleImport} disabled={importing}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:brightness-110 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-60">
                            <span className={`material-symbols-outlined text-base ${importing ? 'animate-spin' : ''}`}>
                                {importing ? 'progress_activity' : 'upload_file'}
                            </span>
                            {importing ? 'Importing…' : 'Import Students'}
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-lg text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <p className="font-bold">CSV Format Guide:</p>
                        <code className="block font-mono">RegistrationNo, StudentName, PhoneNumber, EmailId</code>
                        <p>The <strong>Email</strong> column is required for OTP login. Importing the same Branch + Semester + Section will <strong>overwrite</strong> existing data.</p>
                    </div>
                </div>
            )}

            {/* ── Bulk Delete Confirmation ── */}
            {bulkDelShown && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-xl text-red-500">delete_sweep</span>
                            </div>
                            <div>
                                <h3 className="font-bold dark:text-white">Delete All Students?</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {filterSem || filterSec
                                        ? `Scope: ${hodBranch || impBranch}${filterSem ? ' · ' + filterSem : ''}${filterSec ? ' · ' + filterSec : ''}`
                                        : `Entire branch: ${hodBranch || impBranch}`}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            This will permanently delete <strong className="text-red-500">{students.length} student(s)</strong> and their login access. This cannot be undone.
                        </p>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                Type <span className="text-red-500 font-mono">DELETE ALL</span> to confirm
                            </label>
                            <input
                                value={bulkConfirmText}
                                onChange={e => setBulkConfirmText(e.target.value)}
                                placeholder="DELETE ALL"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-background-dark border border-red-300 dark:border-red-800/50 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-red-500/30 font-mono"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setBulkDelShown(false); setBulkConfirmText(''); }}
                                className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkConfirmText !== 'DELETE ALL' || bulkDeleting}
                                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                                {bulkDeleting ? 'Deleting…' : `Delete ${students.length} Students`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit / Add Modal ── */}
            {modalData !== null && (
                <StudentModal
                    student={modalData?._id ? modalData : null}
                    hodBranch={hodBranch}
                    onClose={() => setModalData(null)}
                    onDone={handleModalDone}
                />
            )}

            {/* ── Delete Confirm ── */}
            {delTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-2xl text-red-500">delete_forever</span>
                        </div>
                        <h3 className="text-base font-bold dark:text-white mb-2">Delete Student?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                            <strong className="dark:text-white">{delTarget.name}</strong> ({delTarget.regdNo}) will be permanently removed along with their login access.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDelTarget(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-60">
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
