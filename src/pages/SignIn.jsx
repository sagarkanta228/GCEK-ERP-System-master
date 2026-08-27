import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from "axios";

const SignIn = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accessTier, setAccessTier] = useState('Student Portal');
    const [department, setDepartment] = useState('CSE'); // Default department/branch
    const [semester, setSemester] = useState('1'); // Default semester
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP State
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!termsAccepted) {
            setError("Please accept the Terms & Conditions to create an account.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const roleMap = {
                "Student Portal": "Student",
                "Faculty Portal": "Faculty",
                "Dean Portal": "Dean",
                "Hod Portal": "HOD",
                "Principal Portal": "Principal"
            };

            const backendRole = roleMap[accessTier];

            await axios.post(
                "http://localhost:5000/api/auth/signup",
                {
                    fullName,
                    email,
                    password,
                    role: backendRole,
                    department: (backendRole === 'Faculty' || backendRole === 'HOD' || backendRole === 'Student') ? department : undefined,
                    semester: backendRole === 'Student' ? semester : undefined
                }
            );

            alert("OTP sent to your email!");
            setShowOtp(true);

        } catch (error) {
            setError(
                error.response?.data?.message || "Signup failed"
            );
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    email,
                    otp
                }
            );

            alert("Account verified successfully! Please login.");
            navigate("/login");

        } catch (error) {
            setError(
                error.response?.data?.message || "OTP Verification failed"
            );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark text-[#0d121b] dark:text-gray-400 font-sans selection:bg-primary/30 transition-colors duration-300 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-primary/10 to-accent-neon/10 dark:from-primary/20 dark:to-accent-neon/20 rounded-t-2xl flex items-center justify-center p-6">
                    <div className="flex flex-col gap-1 text-center">
                        <h2 className="text-3xl font-black text-[#0d121b] dark:text-white">GCEK Portal</h2>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-accent-neon">Enterprise ERP Environment</p>
                    </div>
                </div>

                {/* Tab Indicator */}
                {!showOtp && (
                    <div className="px-6 pt-6">
                        <div className="flex gap-0 relative">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex-1 pb-3 font-bold text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors relative z-10 cursor-pointer"
                            >
                                Login
                            </button>
                            <button
                                className="flex-1 pb-3 font-bold text-sm uppercase tracking-wider text-primary dark:text-accent-neon relative z-10"
                            >
                                Sign In
                            </button>

                            {/* Blue Line Indicator */}
                            <div
                                className="absolute bottom-0 right-0 h-1 w-1/2 bg-gradient-to-r from-primary to-accent-neon transition-all duration-300 ease-in-out"
                            />
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500">
                        <AlertCircle size={18} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Form Content */}
                {!showOtp ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="username@gcek.ac.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Access Tier */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                Access Tier
                            </label>
                            <select
                                value={accessTier}
                                onChange={(e) => setAccessTier(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                            >
                                <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Student Portal</option>
                                <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Dean Portal</option>
                                <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Hod Portal</option>
                                <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Principal Portal</option>
                            </select>
                        </div>

                        {/* Department / Branch Dropdown (Conditional) */}
                        {(accessTier === 'Hod Portal' || accessTier === 'Student Portal') && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                    Department / Branch
                                </label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                                >
                                    <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">CSE</option>
                                    <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Mechanical</option>
                                    <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Electrical</option>
                                    <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Civil</option>
                                    <option className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">Basic Science and Humanities</option>
                                </select>
                            </div>
                        )}

                        {/* Semester Dropdown (Conditional) */}
                        {accessTier === 'Student Portal' && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                    Current Semester
                                </label>
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <option key={sem} value={sem} className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">
                                            Semester {sem}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="w-4 h-4 cursor-pointer accent-primary"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer font-medium">
                                I agree to the Terms & Conditions
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!termsAccepted}
                            className={`w-full h-12 font-bold rounded-lg transition-all mt-6 cursor-pointer ${termsAccepted
                                ? 'bg-gradient-to-r from-primary to-accent-neon text-white hover:brightness-110'
                                : 'bg-gray-300 dark:bg-white/10 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Create Account
                        </button>

                        {/* Google OAuth Button */}
                        <div className="relative flex items-center justify-center mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-white/10"></div>
                            </div>
                            <div className="relative px-4 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white dark:bg-[#0F1419]">
                                Or
                            </div>
                        </div>

                        <a
                            href="http://localhost:5000/api/auth/google"
                            className="w-full h-12 mt-6 bg-white dark:bg-[#1a1f24] border border-gray-300 dark:border-white/10 text-[#0d121b] dark:text-white font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </a>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="p-6 space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">Verify Your Email</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                We've sent a 6-digit OTP to {email}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-bold bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-primary to-accent-neon text-white font-bold rounded-lg hover:brightness-110 transition-all mt-6 cursor-pointer"
                        >
                            Verify & Complete Signup
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowOtp(false)}
                            className="w-full h-12 bg-transparent border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all mt-4 cursor-pointer"
                        >
                            Back to Signup
                        </button>
                    </form>
                )}

                {/* Footer Note */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-500">
                        © 2024 GCEK ERP System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
