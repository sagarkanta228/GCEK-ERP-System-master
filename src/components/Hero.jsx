import React from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-6" id="about">
            <div className="absolute inset-0 hero-bg-overlay pointer-events-none"></div>
            <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary w-fit badge-glow transition-all duration-300">
                            Official Institutional Portal
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-[#0d121b] dark:text-white transition-colors duration-300">
                            Streamlining <br />
                            <span className="text-primary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-primary dark:to-accent-neon transition-colors duration-300">Academic Excellence</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-[500px] leading-relaxed transition-colors duration-300">
                            The official digital infrastructure for Government College of Engineering, Kalahandi. Empowering students and faculty with integrated academic management.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="h-12 px-8 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 hover:brightness-110 shadow-lg shadow-primary/20 dark:shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer">
                            <span>Get Started</span>
                            <ArrowRight size={20} />
                        </button>
                        <button className="h-12 px-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#0d121b] dark:text-white rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Right Visual: Swaps based on mode */}
                <div className="relative hidden md:block">
                    {/* Light Mode Visual */}
                    <div className="dark:hidden w-full aspect-square rounded-2xl bg-gradient-to-tr from-primary/25 to-blue-400/15 flex items-center justify-center border border-primary/20 transition-all duration-500 shadow-lg shadow-primary/10">
                        <div className="absolute inset-0 backdrop-blur-[2px] rounded-2xl"></div>
                        <div className="grid grid-cols-4 gap-4 p-8 opacity-50">
                            <div className="w-full aspect-square bg-primary/50 rounded-full blur-xl animate-pulse"></div>
                            <div className="w-full aspect-square bg-blue-400/40 rounded-full blur-xl"></div>
                            <div className="w-full aspect-square bg-primary/35 rounded-full blur-xl"></div>
                            <div className="w-full aspect-square bg-blue-600/40 rounded-full blur-xl animate-bounce"></div>
                        </div>
                        <Share2 size={160} className="text-primary/50 absolute" strokeWidth={1} />
                    </div>

                    {/* Dark Mode Visual */}
                    <div className="hidden dark:flex w-full aspect-square rounded-2xl bg-gradient-to-tr from-primary/10 to-transparent items-center justify-center border border-white/5 relative overflow-hidden transition-all duration-500">
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
                        <Share2 size={160} className="text-accent-neon/40 absolute drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]" strokeWidth={1} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
