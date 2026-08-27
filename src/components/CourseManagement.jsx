import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const CourseManagement = () => {
    const { user } = useUser();
    const department = user?.department || 'Computer Science Engineering'; // Fallback if not set

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [semesterFilter, setSemesterFilter] = useState('6');

    // Form state corresponding to backend model
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        faculty: '',
        credits: 4,
        semester: '6',
        color: 'bg-blue-500',
        lightColor: 'bg-blue-500/10',
        textColor: 'text-blue-500'
    });

    // Theme preset colors for the UI selection
    const colorPresets = [
        { name: 'Blue', color: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-500' },
        { name: 'Purple', color: 'bg-purple-500', light: 'bg-purple-500/10', text: 'text-purple-500' },
        { name: 'Emerald', color: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500' },
        { name: 'Amber', color: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-500' },
        { name: 'Rose', color: 'bg-rose-500', light: 'bg-rose-500/10', text: 'text-rose-500' },
        { name: 'Indigo', color: 'bg-indigo-500', light: 'bg-indigo-500/10', text: 'text-indigo-500' },
    ];

    useEffect(() => {
        fetchCourses();
    }, [semesterFilter]);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/api/courses?department=${department}&semester=${semesterFilter}`);
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleColorSelect = (preset) => {
        setFormData(prev => ({
            ...prev,
            color: preset.color,
            lightColor: preset.light,
            textColor: preset.text
        }));
    };

    const handleEdit = (course) => {
        setFormData({
            code: course.code,
            name: course.name,
            faculty: course.faculty,
            credits: course.credits,
            semester: course.semester,
            color: course.color,
            lightColor: course.lightColor,
            textColor: course.textColor
        });
        setCurrentCourseId(course._id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
        } catch (err) {
            console.error('Error deleting course:', err);
            alert('Failed to delete course');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const payload = {
            ...formData,
            department
        };

        try {
            if (isEditing) {
                const response = await axios.put(`http://localhost:5000/api/courses/${currentCourseId}`, payload);
                setCourses(courses.map(c => c._id === currentCourseId ? response.data : c));
            } else {
                const response = await axios.post(`http://localhost:5000/api/courses`, payload);
                if (payload.semester === semesterFilter) {
                    setCourses([response.data, ...courses]);
                }
            }
            resetForm();
        } catch (err) {
            console.error('Error saving course:', err);
            setError(err.response?.data?.message || 'Failed to save course');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentCourseId(null);
        setFormData({
            code: '',
            name: '',
            faculty: '',
            credits: 4,
            semester: semesterFilter,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-500/10',
            textColor: 'text-blue-500'
        });
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold dark:text-white">Course Management</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage subjects and curriculum for {department}</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Course
                </button>
            </div>

            {error && !showForm && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark flex gap-4">
                <div className="flex-1 max-w-xs">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Semester</label>
                    <select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={String(sem)}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-lg animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-border-dark pb-4">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <BookOpen size={20} className="text-primary" />
                            {isEditing ? 'Edit Course' : 'Create New Course'}
                        </h3>
                        <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                            <AlertCircle size={18} />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. PCC-CS-601"
                                    className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Compiler Design"
                                    className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty</label>
                                <input
                                    type="text"
                                    name="faculty"
                                    value={formData.faculty}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Prof. A. K. Das"
                                    className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
                                    <input
                                        type="number"
                                        name="credits"
                                        min="1"
                                        max="6"
                                        value={formData.credits}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                                    <select
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={String(sem)}>Sem {sem}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Theme Color Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subject Card Theme</label>
                            <div className="flex gap-3">
                                {colorPresets.map(preset => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => handleColorSelect(preset)}
                                        className={`size-10 rounded-full flex items-center justify-center transition-all shadow-sm
                                            ${preset.color} ${formData.color === preset.color ? 'ring-4 ring-offset-2 ring-primary dark:ring-offset-background-dark scale-110' : 'hover:scale-110'}`}
                                        title={preset.name}
                                    >
                                        {formData.color === preset.color && <Check size={16} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border-dark">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-background-dark transition-colors rounded-xl border border-slate-200 dark:border-border-dark"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                            >
                                <Check size={18} />
                                {isEditing ? 'Save Changes' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Course List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark border-dashed rounded-2xl p-12 text-center">
                    <div className="size-16 bg-slate-100 dark:bg-background-dark text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold dark:text-white mb-2">No Courses Found</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                        There are no courses assigned for Semester {semesterFilter} in {department}.
                    </p>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-all inline-flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add First Course
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course._id} className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-12 h-12 rounded-xl ${course.lightColor} ${course.textColor} flex items-center justify-center font-bold text-lg`}>
                                            {course.code.split('-').pop()?.substring(0, 1) || 'C'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1" title={course.name}>{course.name}</h3>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{course.code} • {course.credits} Credits</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                                        <span className="truncate">{course.faculty}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-border-dark">
                                    <button
                                        onClick={() => handleEdit(course)}
                                        className="flex-1 py-2 bg-slate-50 dark:bg-background-dark/50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-background-dark transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-border-dark"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course._id)}
                                        className="flex-1 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-500/20"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
