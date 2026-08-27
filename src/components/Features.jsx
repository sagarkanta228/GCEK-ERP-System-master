import React from 'react';
import { ArrowRight, CheckCircle2, User, GraduationCap, BarChart3 } from 'lucide-react';

const Features = () => {
    return (
        <section className="py-20 px-6 bg-white dark:bg-background-dark transition-colors duration-300" id="modules">
            <div className="max-w-[1280px] mx-auto">
                <div className="mb-16 text-center max-w-[700px] mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0d121b] dark:text-white transition-colors">Tailored for Every User</h2>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">Comprehensive tools designed to meet the unique needs of our entire academic community.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Student Module */}
                    <div className="group p-8 rounded-xl border border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 dark:glass-card hover:border-primary/50 dark:hover:border-accent-neon/30 transition-all hover:shadow-xl dark:hover:shadow-primary/10">
                        <div className="size-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                            <User size={30} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#0d121b] dark:text-white transition-colors">Student Module</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors">
                            Access attendance records, manage fee payments, and view exam results with a single click. Stay updated with real-time notifications.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {["Attendance Tracker", "Fee Payment Gateway", "Exam Portal"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <CheckCircle2 size={16} className="text-primary dark:text-accent-neon" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <a href="#" className="text-primary dark:text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                            Access Portal <ArrowRight size={14} />
                        </a>
                    </div>

                    {/* Faculty Module */}
                    <div className="group p-8 rounded-xl border border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 dark:glass-card hover:border-primary/50 dark:hover:border-accent-neon/30 transition-all hover:shadow-xl dark:hover:shadow-primary/10">
                        <div className="size-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap size={30} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#0d121b] dark:text-white transition-colors">Faculty Module</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors">
                            Manage lesson plans, entry marks, and process student leave requests effortlessly. Simplified administrative workflows for teaching staff.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {["Digital Attendance Register", "Mark Entry System", "Leave Management"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <CheckCircle2 size={16} className="text-primary dark:text-accent-neon" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <a href="#" className="text-primary dark:text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                            Staff Login <ArrowRight size={14} />
                        </a>
                    </div>

                    {/* HOD Module */}
                    <div className="group p-8 rounded-xl border border-gray-200 dark:border-white/10 bg-background-light dark:bg-white/5 dark:glass-card hover:border-primary/50 dark:hover:border-accent-neon/30 transition-all hover:shadow-xl dark:hover:shadow-primary/10">
                        <div className="size-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                            <BarChart3 size={30} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#0d121b] dark:text-white transition-colors">HOD Module</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors">
                            Oversee departmental analytics, manage faculty scheduling, and track overall academic performance through intuitive dashboards.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {["Departmental Reports", "Scheduling & Timetables", "Performance Oversight"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <CheckCircle2 size={16} className="text-primary dark:text-accent-neon" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <a href="#" className="text-primary dark:text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                            Admin Access <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
