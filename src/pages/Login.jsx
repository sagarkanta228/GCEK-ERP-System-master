import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BRANCHES = ['CSE', 'Mechanical', 'Electrical', 'Civil', 'Basic Science and Humanities'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const ROLES = [
  { key: 'Student', icon: '🎓', label: 'Student' },
  { key: 'Faculty', icon: '👨‍🏫', label: 'Faculty' },
  { key: 'HOD', icon: '🏫', label: 'HOD' },
  { key: 'Principal', icon: '🏛️', label: 'Principal' },
  { key: 'Dean', icon: '⚖️', label: 'Dean' },
];

const ROLE_NAV = {
  Student: '/student',
  Faculty: '/faculty',
  HOD: '/hod',
  Principal: '/principal',
  Dean: '/dean',
  Registrar: '/registrar',
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useUser();
  const cardRef = useRef();

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 1,
      ease: 'power4.out',
    });
  }, { scope: cardRef });

  const [role, setRole] = useState('Student');

  useEffect(() => {
    // Wait until auth state is confirmed
    if (authLoading) return;

    // If user is already logged in, redirect them away from login page
    if (user && (user.id || user._id)) {
      const ROLE_PATHS = {
          'Student': '/student',
          'Faculty': '/faculty',
          'HOD': '/hod',
          'Principal': '/principal',
          'Dean': '/dean',
          'Registrar': '/registrar'
      };
      const destination = location.state?.from?.pathname || ROLE_PATHS[user.role] || '/student';
      navigate(destination, { replace: true });
    }

    if (location.state && location.state.role) {
      setRole(location.state.role);
    }
  }, [user, authLoading, location.state, navigate]);
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccess] = useState('');

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Student-only
  const [regdNo, setRegdNo] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState('1');
  // OTP
  const [otp, setOtp] = useState('');

  const resetForm = () => {
    setName(''); setEmail(''); setRegdNo('');
    setBranch('CSE'); setSemester('1');
    setError(''); setSuccess(''); setOtp('');
  };

  const handleRoleChange = (r) => {
    setRole(r);
    resetForm();
    setViewMode('form');
  };

  // ── Step 1: Verify details & send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const payload = { type: role, name: name.trim(), email: email.trim().toLowerCase() };
      if (role === 'Student') {
        payload.regdNo = regdNo.trim();
        payload.branch = branch;
        payload.semester = semester;
      }
      if (role === 'Faculty' || role === 'HOD') {
        payload.branch = branch;
      }

      const res = await axios.post('http://localhost:5000/api/auth/otp-login-request', payload);
      setSuccess(res.data.message || 'OTP sent to your email!');
      setViewMode('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & login ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { type: role, email: email.trim().toLowerCase(), otp: otp.trim() };
      if (role === 'Student') {
        payload.regdNo = regdNo.trim();
        payload.branch = branch;
        payload.semester = semester;
      }
      if (role === 'Faculty' || role === 'HOD') payload.branch = branch;

      const res = await axios.post('http://localhost:5000/api/auth/otp-login-verify', payload);

      localStorage.setItem('token', res.data.token);
      login({
        id: res.data.user.id,
        name: res.data.user.name,
        role: res.data.user.role,
        email: res.data.user.email,
        assignedRole: res.data.user.assignedRole,
        department: res.data.user.department,
        semester: res.data.user.semester,
        regdNo: res.data.user.regdNo,
        facultyId: res.data.user.facultyId,
        teachingAssignments: res.data.user.teachingAssignments,
        profileImage: res.data.user.profileImage || '',
        phone: res.data.user.phone || '',
        bio: res.data.user.bio || '',
      });
      
      const destination = location.state?.from?.pathname || ROLE_NAV[res.data.user.role] || '/student';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark text-[#0d121b] dark:text-gray-400 font-sans flex items-center justify-center p-2 xs:p-4">
      <div ref={cardRef} className="bg-white dark:bg-[#0F1419] rounded-2xl shadow-2xl w-full max-w-md">

        {/* ── Header ── */}
        <div className="h-32 bg-gradient-to-br from-primary/10 via-accent-neon/5 to-primary/20 dark:from-primary/20 dark:to-accent-neon/20 rounded-t-2xl flex flex-col items-center justify-center gap-1">
          <h2 className="text-2xl xs:text-3xl font-black text-[#0d121b] dark:text-white">GCEK Portal</h2>
          <p className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-primary dark:text-accent-neon">Enterprise ERP Environment</p>
        </div>

        {/* ── Role Tabs (only on form view) ── */}
        {viewMode === 'form' && (
          <div className="px-4 pt-5">
            <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-surface-dark rounded-xl p-1">
              {ROLES.map(({ key, icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleChange(key)}
                  className={`flex flex-col items-center py-2 px-0.5 rounded-lg text-[9px] xs:text-[10px] font-bold uppercase tracking-wide transition-all gap-0.5 ${role === key
                      ? 'bg-white dark:bg-background-dark text-primary dark:text-accent-neon shadow-sm'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Alert Messages ── */}
        <div className="px-6 mt-4 space-y-2">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg flex items-center gap-2 text-red-500">
              <AlertCircle size={16} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-500/10 border border-green-500/40 rounded-lg flex items-center gap-2 text-green-500">
              <CheckCircle2 size={16} />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
          )}
        </div>

        {/* ══════════ FORM VIEW ══════════ */}
        {viewMode === 'form' && (
          <form onSubmit={handleSendOtp} className="p-4 xs:p-6 space-y-4">

            {/* ── Student: Regd No ── */}
            {role === 'Student' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Registration No. <span className="text-red-400">*</span>
                </label>
                <input
                  required type="text"
                  placeholder="e.g. 210123001"
                  value={regdNo}
                  onChange={e => setRegdNo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                />
              </div>
            )}

            {/* ── Name (all roles) ── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required type="text"
                placeholder="As registered in the system"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* ── Branch (Student, Faculty, HOD) ── */}
            {(role === 'Student' || role === 'Faculty' || role === 'HOD') && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Branch / Department <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                >
                  {BRANCHES.map(b => (
                    <option key={b} className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* ── Semester (Student only) ── */}
            {role === 'Student' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Semester <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                >
                  {SEMESTERS.map(s => (
                    <option key={s} value={s} className="bg-white text-gray-900 dark:bg-surface-dark dark:text-white">
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ── Email (all roles) ── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Registered Email ID <span className="text-red-400">*</span>
              </label>
              <input
                required type="email"
                placeholder={role === 'Student' ? 'your.email@gcekbpatna.ac.in' : 'faculty@gcekbpatna.ac.in'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent-neon text-white font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? 'Verifying & Sending OTP…' : 'Send OTP via Email'}
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
              </div>
              <div className="relative px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white dark:bg-[#0F1419]">
                Or
              </div>
            </div>

            <a
              href="http://localhost:5000/api/auth/google"
              className="w-full h-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-[#0d121b] dark:text-white font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 cursor-pointer text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </a>

            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
              Your details will be verified against the registered database before sending the OTP.
            </p>
          </form>
        )}

        {/* ══════════ OTP VERIFY VIEW ══════════ */}
        {viewMode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-1">Check Your Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A 6-digit OTP has been sent to<br />
                <span className="font-semibold text-primary dark:text-accent-neon">{email}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                required
                type="text"
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-4 text-center tracking-[0.6em] text-2xl font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent-neon text-white font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => { setViewMode('form'); setError(''); setSuccess(''); setOtp(''); }}
              className="w-full h-11 bg-transparent border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer text-sm"
            >
              ← Back to Details
            </button>
          </form>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2024 GCEK ERP System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
