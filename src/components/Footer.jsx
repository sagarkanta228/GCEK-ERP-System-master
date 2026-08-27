import React from 'react';
import { School } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-background-dark border-t border-gray-200 dark:border-white/5 py-12 px-6 transition-colors duration-300">
            <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-primary">
                            <School size={30} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-[#0d121b] dark:text-white transition-colors">GCEK ERP</h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[300px] leading-relaxed transition-colors">
                        Empowering the future engineers of Kalahandi with modern administrative tools.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-primary dark:text-accent-neon transition-colors">Quick Links</h4>
                        <nav className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {['Home', 'About Us', 'ERP Modules', 'Contact'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} className="hover:text-primary dark:hover:text-white transition-colors">
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-primary dark:text-accent-neon transition-colors">Resources</h4>
                        <nav className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {['Student Portal', 'Faculty Login', 'Academic Calendar', 'Circulars'].map((item) => (
                                <a key={item} href="#" className="hover:text-primary dark:hover:text-white transition-colors">
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-primary dark:text-accent-neon transition-colors">Support</h4>
                        <nav className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {['IT Desk', 'Feedback', 'Security', 'Privacy Policy'].map((item) => (
                                <a key={item} href="#" className="hover:text-primary dark:hover:text-white transition-colors">
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <p>© 2024 Government College of Engineering, Kalahandi. All rights reserved.</p>
                <div className="flex gap-6">
                    {['Twitter', 'LinkedIn', 'Facebook'].map((item) => (
                        <a key={item} href="#" className="hover:text-primary dark:hover:text-accent-neon transition-colors">
                            {item}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
