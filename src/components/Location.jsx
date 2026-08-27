import React from 'react';
import { MapPin, Mail, Map } from 'lucide-react';

const Location = () => {
    return (
        <section className="py-20 px-6 bg-white dark:bg-background-dark transition-colors duration-300" id="location">
            <div className="max-w-[1280px] mx-auto">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="w-full md:w-1/3">
                        <h2 className="text-3xl font-bold mb-6 text-[#0d121b] dark:text-white transition-colors">Campus Location</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors">
                            Visit us at our main campus in Bhawanipatna. Our campus provides state-of-the-art facilities for engineering excellence.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="size-10 rounded-full bg-primary/10 dark:bg-white/5 dark:rounded-xl dark:size-12 dark:border dark:border-white/10 flex items-center justify-center text-primary dark:text-accent-neon flex-shrink-0 transition-all">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0d121b] dark:text-white transition-colors">Address</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">GCEK Bhawanipatna, Kalahandi, Odisha - 766002</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="size-10 rounded-full bg-primary/10 dark:bg-white/5 dark:rounded-xl dark:size-12 dark:border dark:border-white/10 flex items-center justify-center text-primary dark:text-accent-neon flex-shrink-0 transition-all">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0d121b] dark:text-white transition-colors">Email</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">info@gcekbpatna.ac.in</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 h-[450px] dark:h-[500px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative group bg-background-light dark:bg-background-dark transition-all duration-300">
                        {/* Light Mode Overlay content */}
                        <div className="absolute inset-0 bg-gray-50 dark:hidden flex flex-col items-center justify-center gap-4 z-10 opacity-90">
                            <Map className="text-primary text-6xl" size={64} />
                            <div className="text-center px-6">
                                <p className="font-semibold text-lg text-[#0d121b]">Interactive Map View</p>
                                <p className="text-sm text-gray-500">GCEK Kalahandi Campus, Bhawanipatna</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full cursor-pointer">Open in Maps</button>
                                <button className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold rounded-full cursor-pointer hover:bg-gray-50">Get Directions</button>
                            </div>
                        </div>

                        {/* Dark Mode Overlay content */}
                        <div className="hidden dark:flex absolute inset-0 z-10 flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-[1px]">
                            <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-accent-neon border border-accent-neon/30 animate-pulse">
                                <MapPin size={40} />
                            </div>
                            <div className="text-center px-6">
                                <p className="font-bold text-2xl text-white mb-2">Campus View</p>
                                <p className="text-gray-300">GCEK Kalahandi Campus, Bhawanipatna</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:brightness-110 shadow-lg shadow-primary/25 cursor-pointer">Open in Maps</button>
                                <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-bold rounded-full hover:bg-white/20 cursor-pointer">Get Directions</button>
                            </div>
                        </div>

                        <img
                            className="w-full h-full object-cover opacity-20 dark:opacity-60 dark:grayscale dark:brightness-[0.3] dark:contrast-125 group-hover:scale-105 transition-transform duration-1000"
                            alt="Satellite map view of GCEK campus in Bhawanipatna"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSoBlxZCiqbVroralVQ0VVMy2XoUQEyJl6--dRuZll2xrmuWtSc5pVm_xkP-27-PeIGBWuh5FbMq2eX5g3qws1Xrr36sSl2HiSTKOfZ7wTOR1_AIT3DLAsEEMOcnHjttAzmOwLAnAvZ8QGV27qhdiND2l-BCBZnP3NbM06FTxpMA45Fr0VhSEKx1167O89uvDNlyTSHG_wx5jYDSLtz-B63FOpqcJVOjCUn5AYoQ4dxIgQN3KaCL0SZWBq0ZNqbsKGOx9AGDpFX2Q"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Location;
