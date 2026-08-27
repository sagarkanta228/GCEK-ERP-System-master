import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

// Fields that are locked from login/signup and cannot be changed
const LockBadge = ({ label }) => (
    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">lock</span>
        {label}
    </span>
);

const ReadonlyField = ({ label, value, badge, icon }) => (
    <div className="space-y-1.5">
        <div className="flex items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            {badge && <LockBadge label={badge} />}
        </div>
        <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed">
            {icon && <span className="material-symbols-outlined text-base text-slate-400">{icon}</span>}
            <span className="truncate">{value || <span className="italic text-slate-400">—</span>}</span>
        </div>
    </div>
);

const ProfileSettings = () => {
    const { user, updateUser } = useUser();

    const [formData, setFormData] = useState({
        phone: user.phone || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const isStudent = user?.role === 'Student';
    const isFaculty = user?.role === 'Faculty' || user?.role === 'HOD';

    useEffect(() => {
        setFormData({
            phone: user.phone || '',
            bio: user.bio || '',
            profileImage: user.profileImage || '',
        });
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(
                `http://localhost:5000/api/users/${user.id}/profile`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            updateUser({
                phone: res.data.phone,
                bio: res.data.bio,
                profileImage: res.data.profileImage,
            });

            setIsEditing(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const avatarInitials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl xs:text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
                    <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">Manage your personal information and account settings.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Success Banner */}
            {message && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined">check_circle</span>
                    {message}
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-800">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card (Left) */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-4 xs:p-6 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="size-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-border-dark/50">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-4xl font-black text-primary">{avatarInitials}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{user.name || '—'}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
                        {user.email && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate max-w-full">{user.email}</p>}

                        <div className="mt-6 w-full space-y-3">
                            {user.department && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-background-dark/50 rounded-lg text-left">
                                    <span className="material-symbols-outlined text-slate-400">school</span>
                                    <div>
                                        <p className="text-xs text-slate-500">Department</p>
                                        <p className="text-sm font-semibold dark:text-slate-200">{user.department}</p>
                                    </div>
                                </div>
                            )}
                            {isStudent && user.semester && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-background-dark/50 rounded-lg text-left">
                                    <span className="material-symbols-outlined text-slate-400">history_edu</span>
                                    <div>
                                        <p className="text-xs text-slate-500">Semester</p>
                                        <p className="text-sm font-semibold dark:text-slate-200">{user.semester}</p>
                                    </div>
                                </div>
                            )}
                            {isFaculty && user.assignedRole && user.assignedRole !== 'None' && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-background-dark/50 rounded-lg text-left">
                                    <span className="material-symbols-outlined text-slate-400">badge</span>
                                    <div>
                                        <p className="text-xs text-slate-500">Assigned Role</p>
                                        <p className="text-sm font-semibold dark:text-slate-200">{user.assignedRole}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Form (Right) */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-4 xs:p-6 space-y-6">

                        {/* Section: Account Details (Read-only) */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-slate-400">lock</span>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Details</h3>
                                <span className="text-xs text-slate-400 dark:text-slate-500">(set at signup — cannot be changed)</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadonlyField label="Full Name" value={user.name} badge="signup" icon="person" />
                                <ReadonlyField label="Role / Designation" value={user.role} badge="signup" icon="badge" />
                                <ReadonlyField label="Email Address" value={user.email} badge="signup" icon="email" />
                                <ReadonlyField label="Department" value={user.department} badge="account" icon="school" />
                                {isStudent && (
                                    <>
                                        <ReadonlyField label="Registration Number" value={user.regdNo} badge="account" icon="pin" />
                                        <ReadonlyField label="Semester" value={user.semester} badge="account" icon="history_edu" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-border-dark"></div>

                        {/* Section: Personal Details (Editable) */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">edit_note</span>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Personal Details</h3>
                                <span className="text-xs text-slate-400 dark:text-slate-500">(editable)</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder={isEditing ? "e.g. +91 98765 43210" : "Not set"}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm dark:text-slate-200"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Image URL</label>
                                    <input
                                        type="url"
                                        name="profileImage"
                                        value={formData.profileImage}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder={isEditing ? "https://..." : "Not set"}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm dark:text-slate-200"
                                    />
                                    {isEditing && formData.profileImage && (
                                        <p className="text-xs text-slate-400">Preview will update above after saving.</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows="3"
                                        placeholder={isEditing ? "Tell us a bit about yourself..." : "Not set"}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-none text-sm dark:text-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border-dark">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError('');
                                        setFormData({
                                            phone: user.phone || '',
                                            bio: user.bio || '',
                                            profileImage: user.profileImage || '',
                                        });
                                    }}
                                    className="px-6 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-background-dark rounded-lg transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:translate-y-[-1px] text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
