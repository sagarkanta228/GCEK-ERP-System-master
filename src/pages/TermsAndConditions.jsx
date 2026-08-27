import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileText, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  useGSAP(() => {
    gsap.from('.terms-header', { opacity: 0, y: -20, duration: 1, ease: 'power3.out' });
    gsap.from('.terms-card', { opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
  });

  const sections = [
    {
      title: "User Conduct",
      icon: <UserCheck className="text-primary size-6" />, 
      content: "Users must adhere to the highest standards of academic integrity. Any attempt to bypass security measures or misrepresent data within the ERP module is strictly prohibited."
    },
    {
      title: "Data Privacy",
      icon: <Lock className="text-accent-neon size-6" />,
      content: "All personal and academic data is stored securely. Users are responsible for maintaining the confidentiality of their login credentials and must report any unauthorized access immediately."
    },
    {
      title: "System Usage",
      icon: <FileText className="text-primary size-6" />,
      content: "The ERP system is provided for official institutional use only. Unauthorized use for commercial purposes or data scraping is a violation of the GCEK digital policy."
    },
    {
      title: "Account Security",
      icon: <Shield className="text-accent-neon size-6" />,
      content: "Multi-factor authentication (OTP via registered email) is mandatory for all roles. Users must not share their OTP or session tokens with any third party."
    },
    {
      title: "Institutional Compliance",
      icon: <AlertCircle className="text-red-500 size-6" />,
      content: "All actions performed within the system are logged and may be subject to audit. Compliance with the Government College of Engineering, Kalahandi (GCEK) guidelines is mandatory."
    }
  ];

  return (
    <div className="min-h-screen bg-background-dark text-gray-400 font-sans selection:bg-primary/30 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 mb-8 text-sm font-bold text-gray-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="terms-header mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Terms and <span className="text-primary">Conditions</span></h1>
          <p className="text-lg text-gray-500 border-l-4 border-primary pl-4 leading-relaxed">
            Welcome to the GCEK ERP System. By accessing this portal, you agree to comply with the following terms and institutional policies.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="terms-card p-6 rounded-2xl glass-card border border-white/5 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">{section.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Last Updated: March 2024. For further inquiries, contact the IT administration at support@gcekbpatna.ac.in
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TermsAndConditions;
