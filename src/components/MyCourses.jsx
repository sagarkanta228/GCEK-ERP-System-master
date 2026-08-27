import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, FileText, BarChart, Download, Clock, User, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const MyCourses = () => {
    const { user } = useUser();
    const department = user?.department || user?.branch || 'Computer Science Engineering';

    // Ensure semester is just the number digit for the API query
    const rawSemester = user?.semester || '6';
    const semester = String(rawSemester).replace(/\D/g, '') || '6';

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Ensure the backend endpoint matches how the backend is structured
                // Assuming it runs on port 5000 based on standard setup
                const response = await axios.get(`http://localhost:5000/api/courses?department=${department}&semester=${semester}`);
                setCourses(response.data);
            } catch (err) {
                console.error("Error fetching student courses:", err);
                setError("Failed to load your enrolled courses.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [department, semester]);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0F1419] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Credits</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">22</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <BookOpen size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">+2</span>
                        from last semester
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0F1419] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Attendance</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">83%</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Good</span>
                        Maintained above 75%
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0F1419] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Assignments</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12/15</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                            <FileText size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">3 Pending</span>
                        Due this week
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Enrolled Courses</h2>
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                        <AlertCircle size={18} />
                        <p>{error}</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-white dark:bg-[#0F1419] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl p-12 text-center">
                        <div className="size-16 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white mb-2">No Enrolled Courses Found</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            It looks like there are no courses assigned to your current semester and department yet.
                            Your HOD must configure them.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {courses.map((course) => (
                            <div key={course._id || course.id} className="bg-white dark:bg-[#0F1419] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-12 h-12 rounded-xl ${course.lightColor || 'bg-blue-500/10'} ${course.textColor || 'text-blue-500'} flex items-center justify-center font-bold text-lg`}>
                                                {course.code.split('-').pop()?.substring(0, 1) || 'C'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{course.name}</h3>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{course.code} • {course.credits} Credits</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-primary transition-colors">
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-lg">
                                            <User size={16} className="text-slate-400" />
                                            <span>{course.faculty}</span>
                                        </div>

                                        {/* Mocked Progress & Attendance (Static UI for now as backend doesn't store this yet) */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-slate-500">Syllabus Completion</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">0%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${course.color || 'bg-blue-500'}`}
                                                    style={{ width: `0%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Attendance</p>
                                                <p className={`text-lg font-bold text-slate-700 dark:text-white`}>
                                                    Pending
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Resources</p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-white">
                                                    0
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button className="flex-1 py-2 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                                                <BookOpen size={14} />
                                                View Syllabus
                                            </button>
                                            <button className="flex-1 py-2 px-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                                <Download size={14} />
                                                Resources
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
