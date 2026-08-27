import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Twitter, Facebook, Linkedin, Heart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const container = useRef();

  useGSAP(() => {
    // Staggered reveal for text
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('#hero-badge', { opacity: 0, y: 30, duration: 0.8, delay: 0.2 })
      .from('#hero-title', { opacity: 0, y: 50, duration: 1, stagger: 0.2 }, '-=0.5')
      .from('#hero-description', { opacity: 0, y: 30, duration: 0.8 }, '-=0.6')
      .from('#hero-buttons', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('#hero-visual', { opacity: 0, scale: 0.8, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, '-=1');

    // Floating animation for decorative elements
    gsap.to('#hero-floating-icon', {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(['#hero-floating-dot-1', '#hero-floating-dot-2'], {
      y: 15,
      x: 10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.5
    });
  }, { scope: container });

  const openInMaps = () => {
    const lat = 19.9143817;
    const lng = 83.1046401;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const getDirections = () => {
    const collegeQuery = "Government College of Engineering Kalahandi Bhawanipatna";

    const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
      collegeQuery
    )}&travelmode=driving`;

    window.open(url, "_blank");
  };

  return (
    <div ref={container} className="bg-background-dark text-gray-400 min-h-screen font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 xs:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">GCEK ERP</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-gray-300 hover:text-accent-neon transition-colors">About</a>
            <a href="#modules" className="text-sm font-medium text-gray-300 hover:text-accent-neon transition-colors">Modules</a>
            <a href="#location" className="text-sm font-medium text-gray-300 hover:text-accent-neon transition-colors">Location</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">
              <span className="material-symbols-outlined text-xl">light_mode</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex min-w-[70px] xs:min-w-[100px] items-center justify-center rounded-lg h-9 xs:h-10 px-4 xs:px-6 bg-primary text-white text-xs xs:text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="about" className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-36 px-6">
          <div className="absolute inset-0 hero-bg-overlay pointer-events-none"></div>
          <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-accent-neon w-fit badge-glow">
                  Official Institutional Portal
                </span>
                <h1 className="text-3xl xs:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-white">
                  Streamlining <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-neon">Academic Excellence</span>
                </h1>
                <p className="text-base xs:text-lg text-gray-400 max-w-[500px] leading-relaxed">
                  The official digital infrastructure for Government College of Engineering, Kalahandi. Empowering students and faculty with integrated academic management.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="h-12 px-8 bg-primary text-white rounded-lg font-bold hover:brightness-110 shadow-xl shadow-primary/30 transition-all flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <button className="h-12 px-8 bg-white/5 border border-white/10 text-white rounded-lg font-bold hover:bg-white/10 transition-all">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent flex items-center justify-center border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent-neon/30 blur-3xl rounded-full"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
                </div>
                <div className="grid grid-cols-4 gap-8 p-12 opacity-30">
                  <div className="w-full aspect-square border border-accent-neon/40 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-accent-neon shadow-[0_0_10px_#00d4ff] rounded-full"></div>
                  </div>
                  <div className="w-full aspect-square border border-primary/20 rounded-lg"></div>
                  <div className="w-full aspect-square border border-accent-neon/20 rounded-lg"></div>
                  <div className="w-full aspect-square border border-primary/40 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary shadow-[0_0_10px_#135bec] rounded-full"></div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[160px] text-accent-neon/40 absolute drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">hub</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section id="modules" className="py-24 px-6 relative">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-12 md:mb-16 text-center max-w-[700px] mx-auto">
              <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold mb-4 text-white">Tailored for Every User</h2>
              <p className="text-gray-400">Comprehensive tools designed to meet the unique needs of our entire academic community.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 justify-center">
              {/* Student Module */}
              <div className="group p-8 rounded-2xl glass-card transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-pointer" onClick={() => navigate('/login', { state: { role: 'Student' } })}>
                <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Student Module</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Access attendance records, manage fee payments, and view exam results with a single click. Stay updated with real-time notifications.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Attendance Tracker', 'Fee Payment Gateway', 'Exam Portal'].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-accent-neon text-sm">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Access Portal <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {/* Faculty Module */}
              <div className="group p-8 rounded-2xl glass-card transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-pointer" onClick={() => navigate('/login', { state: { role: 'Faculty' } })}>
                <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Faculty Module</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Manage lesson plans, entry marks, and process student leave requests effortlessly. Simplified administrative workflows for teaching staff.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Digital Attendance Register', 'Mark Entry System', 'Leave Management'].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-accent-neon text-sm">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Staff Login <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {/* HOD Module */}
              <div className="group p-8 rounded-2xl glass-card transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-pointer" onClick={() => navigate('/login', { state: { role: 'HOD' } })}>
                <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">analytics</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">HOD Module</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Oversee departmental analytics, manage faculty scheduling, and track overall academic performance through intuitive dashboards.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Departmental Reports', 'Scheduling & Timetables', 'Performance Oversight'].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-accent-neon text-sm">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Admin Access <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {/* Principal Module */}
              <div className="group p-8 rounded-2xl glass-card transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-pointer" onClick={() => navigate('/login', { state: { role: 'Principal' } })}>
                <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Principal Module</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Comprehensive oversight of institution-wide operations, strategic planning, and policy tracking for top-level administration.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Strategic Dashboard', 'Staff Oversight', 'Institution Reports'].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-accent-neon text-sm">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Principal Access <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {/* Dean Module */}
              <div className="group p-8 rounded-2xl glass-card transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-pointer" onClick={() => navigate('/login', { state: { role: 'Dean' } })}>
                <div className="size-14 rounded-lg bg-primary/20 flex items-center justify-center text-accent-neon mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">supervisor_account</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Dean Module</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Manage academic affairs, curriculum development, and student welfare across all departments.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Curriculum Management', 'Academic Audit', 'Student Welfare'].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-accent-neon text-sm">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="text-accent-neon font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Dean Access <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="location" className="py-24 px-6 bg-white/5">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-full md:w-1/3">
                <h2 className="text-3xl font-bold mb-6 text-white">Campus Location</h2>
                <p className="text-gray-400 mb-8">
                  Visit us at our main campus in Bhawanipatna. Our campus provides state-of-the-art facilities for engineering excellence.
                </p>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-neon flex-shrink-0">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Address</h4>
                      <p className="text-sm text-gray-400">GCEK Bhawanipatna, Kalahandi, Odisha - 766002</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-neon flex-shrink-0">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Email</h4>
                      <p className="text-sm text-gray-400">info@gcekbpatna.ac.in</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group bg-[#111827]">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-[1px]">
                  <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-accent-neon border border-accent-neon/30 animate-pulse">
                    <span className="material-symbols-outlined text-5xl">location_on</span>
                  </div>
                  <div className="text-center px-6">
                    <p className="font-bold text-2xl text-white mb-2">Campus View</p>
                    <p className="text-gray-300">GCEK Kalahandi Campus, Bhawanipatna</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={openInMaps} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:brightness-110 shadow-lg shadow-primary/25">Open in Maps</button>
                    <button onClick={getDirections} className="px-6 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-bold rounded-full hover:bg-white/20">Get Directions</button>
                  </div>
                </div>
                <img
                  className="w-full h-full object-cover grayscale brightness-[0.3] contrast-125 opacity-60 group-hover:scale-105 transition-transform duration-1000"
                  alt="Satellite map view of GCEK campus in Bhawanipatna"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSoBlxZCiqbVroralVQ0VVMy2XoUQEyJl6--dRuZll2xrmuWtSc5pVm_xkP-27-PeIGBWuh5FbMq2eX5g3qws1Xrr36sSl2HiSTKOfZ7wTOR1_AIT3DLAsEEMOcnHjttAzmOwLAnAvZ8QGV27qhdiND2l-BCBZnP3NbM06FTxpMA45Fr0VhSEKx1167O89uvDNlyTSHG_wx5jYDSLtz-B63FOpqcJVOjCUn5AYoQ4dxIgQN3KaCL0SZWBq0ZNqbsKGOx9AGDpFX2Q"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-dark border-t border-white/5 py-16 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">GCEK ERP</h2>
            </div>
            <p className="text-sm text-gray-400 max-w-[300px] leading-relaxed">
              Empowering the future engineers of Kalahandi with modern administrative tools.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="flex flex-col gap-5">
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-accent-neon">Quick Links</h4>
              <nav className="flex flex-col gap-3 text-sm text-gray-400 font-medium">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#about" className="hover:text-white transition-colors">About Us</a>
                <a href="#modules" className="hover:text-white transition-colors">ERP Modules</a>
                <a href="#location" className="hover:text-white transition-colors">Location</a>
              </nav>
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-accent-neon">Portals</h4>
              <nav className="flex flex-col gap-3 text-sm text-gray-400 font-medium">
                <button onClick={() => navigate('/login', { state: { role: 'Student' } })} className="text-left hover:text-white transition-colors cursor-pointer">Student Portal</button>
                <button onClick={() => navigate('/login', { state: { role: 'Faculty' } })} className="text-left hover:text-white transition-colors cursor-pointer">Faculty Login</button>
                <button onClick={() => navigate('/login', { state: { role: 'HOD' } })} className="text-left hover:text-white transition-colors cursor-pointer">HOD Portal</button>
                <button onClick={() => navigate('/login', { state: { role: 'Principal' } })} className="text-left hover:text-white transition-colors cursor-pointer">Principal Office</button>
              </nav>
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-accent-neon">Support</h4>
              <nav className="flex flex-col gap-3 text-sm text-gray-400 font-medium">
                <a href="mailto:support@gcekbpatna.ac.in" className="hover:text-white transition-colors">IT Desk</a>
                <button onClick={() => navigate('/terms')} className="text-left hover:text-white transition-colors cursor-pointer">Terms and Conditions</button>
                <a href="#" className="hover:text-white transition-colors">Feedback</a>
                <button onClick={() => navigate('/terms')} className="text-left hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1 font-medium">
            <p>© 2024 GCEK, Kalahandi. Made with</p>
            <Heart className="size-3 text-red-500 fill-red-500" />
            <p>for Excellence.</p>
          </div>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
              <Twitter className="size-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
              <Linkedin className="size-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
              <Facebook className="size-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
