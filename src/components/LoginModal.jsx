import React, { useState } from 'react';
import { X, Eye, EyeOff, Chrome, Shield } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const LoginModal = () => {
    const { isLoginOpen, setIsLoginOpen } = useModal();
    const [accessTier, setAccessTier] = useState('Student Portal');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    if (!isLoginOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { accessTier, email, password });
        // Handle login logic here
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-primary/10 to-accent-neon/10 dark:from-primary/20 dark:to-accent-neon/20 rounded-t-2xl flex items-center justify-between p-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black text-[#0d121b] dark:text-white">GCEK Portal</h2>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent-neon">Enterprise ERP Environment</p>
                    </div>
                    <button
                        onClick={() => setIsLoginOpen(false)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Login/Sign Up Buttons */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            className="flex-1 h-10 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all cursor-pointer"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className="flex-1 h-10 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-[#0d121b] dark:text-white rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer"
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Access Tier Dropdown */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                            Access Tier
                        </label>
                        <select
                            value={accessTier}
                            onChange={(e) => setAccessTier(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                        >
                            <option>Student Portal</option>
                            <option>Faculty Portal</option>
                        </select>
                    </div>

                    {/* Identity Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                            Identity Email
                        </label>
                        <input
                            type="email"
                            placeholder="username@gcek.ac.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Credential Key */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Credential Key
                            </label>
                            <a href="#" className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">
                                Forgot Password?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Secure Access Button */}
                    <button
                        type="submit"
                        className="w-full h-12 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-6"
                    >
                        <Shield size={20} />
                        <span>SECURE ACCESS</span>
                    </button>

                    {/* Identity Providers */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 text-center mb-3">
                            Identity Providers
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="flex-1 h-10 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-[#0d121b] dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Chrome size={18} />
                                Google
                            </button>
                            <button
                                type="button"
                                className="flex-1 h-10 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-[#0d121b] dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Shield size={18} />
                                SAML SSO
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-white/10 px-6 py-4">
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                        © 2024 GOVT. COLLEGE OF ENGINEERING, KALAHANDI | 
                        <a href="#" className="text-primary hover:text-primary/80 mx-1">SECURITY</a>
                        <a href="#" className="text-primary hover:text-primary/80 mx-1">INFRASTRUCTURE</a>
                        <a href="#" className="text-primary hover:text-primary/80 mx-1">HELPDESK</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
