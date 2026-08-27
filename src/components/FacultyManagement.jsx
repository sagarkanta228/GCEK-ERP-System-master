import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, MoreVertical, Shield, ShieldOff, Eye, Trash2, X } from 'lucide-react';

const FacultyManagement = ({ department: hodDept }) => {
    const [initialFaculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    const [databaseFaculty, setDatabaseFaculty] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        facultyId: '',
        phone: '',
        qualification: '',
        designation: '',
        department: '',
        role: '',
        customRole: '',
        teachingAssignments: [{ subject: '', semester: '', branch: '' }]
    });

    const fetchFacultyProfiles = async () => {
        try {
            const url = hodDept 
                ? `http://localhost:5000/api/users?role=Faculty&department=${hodDept}`
                : 'http://localhost:5000/api/users?role=Faculty';
            const response = await axios.get(url);
            setDatabaseFaculty(response.data);
            setFaculty(response.data); 
        } catch (error) {
            console.error("Error fetching faculty users:", error);
        }
    };

    useEffect(() => {
        fetchFacultyProfiles();
        setLoading(false);
    }, []);

    const handleSelectFaculty = (e) => {
        const selectedId = e.target.value;
        const selected = databaseFaculty.find(f => f._id === selectedId);
        if (selected) {
            setFormData({
                ...formData,
                name: selected.fullName || selected.name,
                email: selected.email,
                facultyId: selected.facultyId || '',
                phone: selected.phone || '',
                qualification: selected.qualification || '',
                designation: selected.designation || '',
                department: selected.department || hodDept || ''
            });
        } else {
            setFormData({
                ...formData,
                name: '',
                email: '',
                facultyId: '',
                phone: '',
                qualification: '',
                designation: '',
                department: hodDept || ''
            });
        }
    };

    const handleRemoveAssignment = (index) => {
        const newAssignments = formData.teachingAssignments.filter((_, i) => i !== index);
        setFormData({ ...formData, teachingAssignments: newAssignments });
    };

    const toggleAccess = (id, currentStatus) => {
        setFaculty(faculty.map(f => f._id === id ? { ...f, portalAccess: !currentStatus } : f));
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
        setFaculty(faculty.filter(f => f._id !== id));
    };

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        const finalRole = formData.role === 'Custom' ? formData.customRole : (formData.role || 'Faculty');

        try {
            // Check if user already exists in our database list
            const existingUser = databaseFaculty.find(f => f.email === formData.email);
            
            if (existingUser) {
                // Update existing user assignments
                await axios.put(`http://localhost:5000/api/users/${existingUser._id}/assign`, {
                    assignedRole: finalRole,
                    teachingAssignments: formData.teachingAssignments,
                    designation: formData.designation,
                    department: formData.department,
                    qualification: formData.qualification
                });
            } else {
                // Create new user and assign details
                await axios.post('http://localhost:5000/api/users/admin-create', {
                    fullName: formData.name,
                    email: formData.email,
                    facultyId: formData.facultyId,
                    phone: formData.phone,
                    role: 'Faculty',
                    department: formData.department,
                    designation: formData.designation,
                    assignedRole: finalRole,
                    qualification: formData.qualification,
                    teachingAssignments: formData.teachingAssignments
                });
            }

            await fetchFacultyProfiles();
            setShowAddModal(false);
            alert(`Successfully processed faculty details for ${formData.name}.`);
            setFormData({
                name: '',
                email: '',
                qualification: '',
                designation: '',
                department: hodDept || '',
                role: '',
                customRole: '',
                teachingAssignments: [{ subject: '', semester: '', branch: '' }]
            });
        } catch (error) {
            console.error("Error adding/assigning faculty:", error);
            alert(error.response?.data?.message || "Failed to process faculty details.");
        }
    };

    const handleAddAssignment = () => {
        setFormData({
            ...formData,
            teachingAssignments: [...formData.teachingAssignments, { subject: '', semester: '', branch: '' }]
        });
    };

    const handleAssignmentChange = (index, field, value) => {
        const newAssignments = [...formData.teachingAssignments];
        newAssignments[index][field] = value;
        setFormData({ ...formData, teachingAssignments: newAssignments });
    };

    const filteredFaculty = initialFaculty.filter(f =>
        (f.fullName || f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                        type="text"
                        placeholder="Search faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    Add Faculty
                </button>
            </div>

            {/* Faculty List */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Faculty Name</th>
                                <th className="px-6 py-4 font-bold">Qualification</th>
                                <th className="px-6 py-4 font-bold">Role & Designation</th>
                                <th className="px-6 py-4 font-bold">Portal Access</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading faculty data...</td>
                                </tr>
                            ) : filteredFaculty.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No faculty found</td>
                                </tr>
                            ) : (
                                filteredFaculty.map((f) => (
                                    <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {(f.fullName || f.name || 'F').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium dark:text-slate-200">{f.fullName || f.name}</p>
                                                    <p className="text-xs text-slate-500">{f.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{f.qualification || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.assignedRole || f.role || 'Faculty'}</p>
                                            <p className="text-xs text-slate-500">{f.designation || 'Faculty'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleAccess(f._id, f.portalAccess !== false)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${f.portalAccess !== false
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                                    }`}
                                            >
                                                {f.portalAccess !== false ? <Shield size={12} /> : <ShieldOff size={12} />}
                                                {f.portalAccess !== false ? 'Granted' : 'Revoked'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedFaculty(f); setShowDetailsModal(true); }}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(f._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Remove Faculty"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Faculty Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center sticky top-0 bg-white dark:bg-surface-dark">
                            <h2 className="text-lg font-bold dark:text-white">Add New Faculty</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddFaculty} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Faculty from Database</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        onChange={handleSelectFaculty}
                                    >
                                        <option value="">-- Select or Enter Details Manually --</option>
                                        {databaseFaculty.map(f => (
                                            <option key={f._id} value={f._id}>{f.fullName || f.name} - {f.department || 'No Dept'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Qualification</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.qualification}
                                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Faculty ID (For OTP Login)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. FAC123"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                                        value={formData.facultyId}
                                        onChange={e => setFormData({ ...formData, facultyId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number (For OTP)</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Designation</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Assign Role</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="">None / Regular Faculty</option>
                                        <option value="TimeTable Management">TimeTable Management</option>
                                        <option value="Hostel Management">Hostel Management</option>
                                        <option value="Registrar">Registrar</option>
                                        <option value="Custom">Custom / Manual</option>
                                    </select>
                                </div>
                                {formData.role === 'Custom' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Custom Role Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter role manually..."
                                            className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                            value={formData.customRole}
                                            onChange={e => setFormData({ ...formData, customRole: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Teaching Assignments Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold dark:text-slate-200">Teaching Assignments</h3>
                                    <button type="button" onClick={handleAddAssignment} className="text-xs text-primary font-bold hover:underline">+ Add Subject</button>
                                </div>
                                {formData.teachingAssignments.map((assignment, index) => (
                                    <div key={index} className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-background-dark rounded-lg">
                                        <div className="grid grid-cols-3 gap-4 flex-1">
                                            <input
                                                required
                                                placeholder="Subject"
                                                className="p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded text-xs"
                                                value={assignment.subject}
                                                onChange={e => handleAssignmentChange(index, 'subject', e.target.value)}
                                            />
                                            <input
                                                required
                                                placeholder="Semester (e.g., 5th)"
                                                className="p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded text-xs"
                                                value={assignment.semester}
                                                onChange={e => handleAssignmentChange(index, 'semester', e.target.value)}
                                            />
                                            <input
                                                required
                                                placeholder="Branch (e.g., CSE)"
                                                className="p-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded text-xs"
                                                value={assignment.branch}
                                                onChange={e => handleAssignmentChange(index, 'branch', e.target.value)}
                                            />
                                        </div>
                                        {formData.teachingAssignments.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAssignment(index)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Remove Subject"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">
                                Add Faculty Member
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedFaculty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center sticky top-0 bg-white dark:bg-surface-dark">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {(selectedFaculty.fullName || selectedFaculty.name || 'F').charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold dark:text-white">{selectedFaculty.fullName || selectedFaculty.name}</h2>
                                    <p className="text-xs text-slate-500">{selectedFaculty.designation || 'Faculty'} • {selectedFaculty.department || 'N/A'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Assignments */}
                            <div>
                                <h3 className="text-sm font-bold dark:text-slate-200 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">book</span>
                                    Teaching Assignments
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedFaculty.teachingAssignments && selectedFaculty.teachingAssignments.length > 0 ? (
                                        selectedFaculty.teachingAssignments.map((assign, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-100 dark:border-border-dark/50">
                                                <p className="font-semibold text-sm dark:text-slate-200">{assign.subject}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="px-2 py-1 bg-white dark:bg-surface-dark text-xs text-slate-500 rounded border border-slate-200 dark:border-border-dark">{assign.semester} Sem</span>
                                                    <span className="px-2 py-1 bg-white dark:bg-surface-dark text-xs text-slate-500 rounded border border-slate-200 dark:border-border-dark">{assign.branch}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No subjects assigned.</p>
                                    )}
                                </div>
                            </div>

                            {/* Attendance History (Mocked for now as per plan) */}
                            <div>
                                <h3 className="text-sm font-bold dark:text-slate-200 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    Recent Attendance
                                </h3>
                                <div className="space-y-3">
                                    {[0, 1, 2].map((i) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() - i);
                                        return (
                                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-background-dark rounded-lg">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{date.toLocaleDateString()}</span>
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">Present</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyManagement;
