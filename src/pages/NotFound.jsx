import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 font-display">
            <div className="text-center space-y-8 animate-fade-in">
                {/* Visual Element */}
                <div className="relative">
                    <h1 className="text-[150px] md:text-[200px] font-black leading-none text-primary/10 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-7xl md:text-9xl text-primary animate-bounce">
                            error
                        </span>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        You are on wrong page
                    </h2>
                    <p className="text-slate-400 max-w-md mx-auto text-lg">
                        The page you are looking for doesn't exist or has been moved. 
                        Let's get you back on track.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 rounded-xl border border-slate-700 text-white font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined transition-transform group-hover:scale-110">home</span>
                        Back to Home
                    </button>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
};

export default NotFound;
