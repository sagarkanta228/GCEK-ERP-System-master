import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Upload, Trash2, X, GraduationCap, Users, Edit2 } from 'lucide-react';

const HierarchyManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [importData, setImportData] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'HOD',
        designation: '',
        department: ''
    });

    const fetchManagementUsers = async () => {
        setLoading(true);
        try {
            const hodsRes = await axios.get('http://localhost:5000/api/users?role=HOD');
            const deansRes = await axios.get('http://localhost:5000/api/users?role=Dean');
            setUsers([...hodsRes.data, ...deansRes.data]);
        } catch (error) {
            console.error("Error fetching management users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagementUsers();
    }, []);

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!formData.fullName || !formData.email || !formData.phone) {
            alert("All fields are required.");
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return false;
        }
        if (!phoneRegex.test(formData.phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return false;
        }
        return true;
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editingUser) {
                await axios.patch(`http://localhost:5000/api/users/${editingUser._id}`, formData);
                alert(`${formData.role} updated successfully!`);
            } else {
                await axios.post('http://localhost:5000/api/users/admin-create', formData);
                alert(`${formData.role} added successfully!`);
            }
            setShowAddModal(false);
            setEditingUser(null);
            setFormData({ fullName: '', email: '', phone: '', role: 'HOD', designation: '', department: '' });
            fetchManagementUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${user._id}`);
                alert("User deleted successfully");
                fetchManagementUsers();
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'HOD',
            designation: user.designation || '',
            department: user.department || ''
        });
        setShowAddModal(true);
    };

    const handleImport = async () => {
        try {
            const lines = importData.split('\n').filter(l => l.trim());
            const usersToImport = lines.map(line => {
                const [fullName, email, phone, role, designation, department] = line.split(',').map(s => s.trim());
                return { fullName, email, phone, role: role || 'HOD', designation, department };
            });

            await axios.post('http://localhost:5000/api/users/bulk-import', { users: usersToImport });
            alert("Users imported successfully!");
            setShowImportModal(false);
            setImportData('');
            fetchManagementUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Import failed. Check formatting: Name, Email, Phone, Role, Designation, Department");
        }
    };

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                        type="text"
                        placeholder="Search HODs/Deans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-surface-dark text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-border-dark"
                    >
                        <Upload size={16} />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} />
                        Add Manually
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Name & Contact</th>
                                <th className="px-6 py-4 font-bold">Role</th>
                                <th className="px-6 py-4 font-bold">Designation</th>
                                <th className="px-6 py-4 font-bold">Department</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {u.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold dark:text-white">{u.fullName}</p>
                                                    <p className="text-xs text-slate-400">{u.email}</p>
                                                    <p className="text-[10px] text-slate-500">{u.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'Dean' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm dark:text-slate-300">{u.designation || '-'}</td>
                                        <td className="px-6 py-4 text-sm dark:text-slate-300">{u.department || 'All'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => startEdit(u)}
                                                    className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={16}/>
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

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-border-dark">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                            <h2 className="text-lg font-bold dark:text-white">{editingUser ? 'Edit' : 'Add'} HOD/Dean</h2>
                            <button onClick={() => { setShowAddModal(false); setEditingUser(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    New users will use their email as ID and 'Welcome@123' as default password.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input required type="email" className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                    <select className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="HOD">HOD</option>
                                        <option value="Dean">Dean</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                    <input placeholder="e.g. CSE" type="text" className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Designation</label>
                                <input placeholder="e.g. Professor" type="text" className="w-full p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm dark:text-white" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all mt-4">Save User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-border-dark">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                            <h2 className="text-lg font-bold dark:text-white">Bulk Import Users</h2>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-400">Format: Name, Email, Phone, Role, Designation, Department (One per line)</p>
                            <textarea 
                                value={importData}
                                onChange={e => setImportData(e.target.value)}
                                placeholder="John Doe, john@gcek.ac.in, 9876543210, HOD, HoD CSE, CSE"
                                className="w-full h-64 p-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm font-mono dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button onClick={handleImport} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">Import Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HierarchyManagement;
