import React from 'react';
import { School, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-primary">
                        <School size={28} />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-[#0d121b] dark:text-white transition-colors">GCEK ERP</h2>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    {['About', 'Modules', 'Location'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent-neon transition-colors">
                            {item}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-200 dark:bg-white/5 text-[#0d121b] dark:text-white hover:bg-gray-300 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/10 cursor-pointer"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        aria-label="Login"
                        className="flex min-w-[100px] items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer">
                        <span>Login</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
