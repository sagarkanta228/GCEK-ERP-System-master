import React, { useState, useEffect } from 'react';
import { Users, Star, BookOpen, TrendingUp, Search, Download } from 'lucide-react';
import axios from 'axios';

const FacultySenate = () => {
    const [facultyData, setFacultyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('All');

    const branches = ['All', 'CSE', 'EE', 'ME', 'CE'];

    useEffect(() => {
        const fetchFacultyData = async () => {
            setLoading(true);
            try {
                // Fetching faculty performance metrics from the new backend endpoint
                const response = await axios.get('http://localhost:5000/api/feedback/performance-metrics');
                setFacultyData(response.data);
            } catch (error) {
                console.error("Failed to fetch faculty data:", error);
                setFacultyData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFacultyData();
    }, []);

    const filteredFaculty = facultyData.filter(fac => {
        const name = fac.name || "";
        const role = fac.role || "";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBranch = selectedBranch === 'All' || fac.dept === selectedBranch;
        return matchesSearch && matchesBranch;
    });

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-border-dark pb-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Faculty Senate</h1>
                    <p className="text-slate-500 text-sm">Institutional Faculty Performance & Oversight</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Total Faculty</p>
                            <h3 className="text-2xl font-bold dark:text-white">{facultyData.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Avg. Rating</p>
                            <h3 className="text-2xl font-bold dark:text-white">
                                {facultyData.length > 0 
                                    ? (facultyData.reduce((acc, fac) => acc + (fac.rating !== "N/A" ? parseFloat(fac.rating) : 0), 0) / 
                                       facultyData.filter(f => f.rating !== "N/A").length || 0).toFixed(1)
                                    : "0.0"}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Performance Index</p>
                            <h3 className="text-2xl font-bold dark:text-white">92%</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-border-dark flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search faculty..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {branches.map(branch => (
                            <button 
                                key={branch}
                                onClick={() => setSelectedBranch(branch)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedBranch === branch 
                                    ? 'bg-primary text-white' 
                                    : 'bg-slate-100 dark:bg-background-dark text-slate-500 hover:bg-slate-200 dark:hover:bg-surface-dark'}`}
                            >
                                {branch}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-background-dark/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Faculty Name</th>
                                <th className="px-6 py-4 font-bold">Role/Designation</th>
                                <th className="px-6 py-4 font-bold">Branch</th>
                                <th className="px-6 py-4 font-bold text-center">Classes Taken</th>
                                <th className="px-6 py-4 font-bold text-center">Student Rating</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {filteredFaculty.map((fac) => (
                                <tr key={fac.id} className="hover:bg-slate-50/50 dark:hover:bg-background-dark/30 transition-colors">
                                    <td className="px-6 py-4 font-medium dark:text-slate-200">{fac.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{fac.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            fac.dept === 'CSE' ? 'bg-blue-100 text-blue-700' :
                                            fac.dept === 'EE' ? 'bg-amber-100 text-amber-700' :
                                            fac.dept === 'ME' ? 'bg-purple-100 text-purple-700' :
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {fac.dept}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold dark:text-slate-300 text-center">{fac.classes}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-sm">
                                            <span>{fac.rating}</span>
                                            {fac.rating !== "N/A" && <Star size={14} className="fill-orange-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            fac.status === 'Outstanding' ? 'bg-emerald-100 text-emerald-700' :
                                            fac.status === 'Excellent' ? 'bg-blue-100 text-blue-700' :
                                            fac.status === 'Good' ? 'bg-indigo-100 text-indigo-700' :
                                            fac.status === 'Standard' ? 'bg-slate-100 text-slate-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {fac.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultySenate;
