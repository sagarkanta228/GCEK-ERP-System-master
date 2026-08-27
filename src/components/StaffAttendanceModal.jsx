import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCcw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const StaffAttendanceModal = ({ user, onClose, onShowDashboard }) => {
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [status, setStatus] = useState('ready'); // ready, capturing, verifying, success, error
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: 1280, height: 720 } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access denied. Please enable camera permissions.");
            setStatus('error');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            setStatus('verifying');
            handleVerify(dataUrl);
        }
    };

    const handleVerify = async (image) => {
        setVerifying(true);
        try {
            // Simulated AI Analysis for background Check
            // In a real app, this would be a multi-part form data or AI API call
            const backgroundData = "College Blackboard Office Classroom"; // Simulated detection
            
            const res = await axios.post('http://localhost:5000/api/attendance/staff-mark', {
                userId: user.id,
                role: user.role,
                image,
                backgroundData
            });

            if (res.status === 201 || res.status === 200) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (err) {
            console.error("Verification failed:", err);
            setError(err.response?.data?.message || "Verification failed. Please try again in an appropriate environment.");
            setStatus('error');
        } finally {
            setVerifying(false);
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setStatus('ready');
        setError('');
        startCamera();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-border-dark animate-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Staff Attendance Portal</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Face & Environment Verification</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-background-dark rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {status !== 'success' && (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block hover:scale-105 transition-transform duration-700'}`} 
                        />
                    )}
                    
                    {capturedImage && (
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    )}

                    {/* Overlay Guides */}
                    {status === 'ready' && (
                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
                            <div className="size-64 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center">
                                <div className="size-48 border-2 border-primary rounded-full animate-pulse"></div>
                            </div>
                            <div className="absolute bottom-10 text-white text-xs font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                Align your face within the circle
                            </div>
                        </div>
                    )}

                    {verifying && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <div className="size-16 border-4 border-t-white border-white/20 rounded-full animate-spin mb-4"></div>
                            <p className="font-bold tracking-widest text-sm uppercase">Verifying Identity & Environment...</p>
                            <p className="text-[10px] mt-2 opacity-80 italic">Checking for College Background...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
                            <CheckCircle2 size={80} className="mb-4 animate-bounce" />
                            <h3 className="text-2xl font-black mb-1 italic">Attendance Marked!</h3>
                            <p className="text-sm font-medium opacity-90">Verification Successful • {new Date().toLocaleTimeString()}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="absolute inset-0 bg-rose-500/90 flex flex-col items-center justify-center text-white p-8 text-center">
                            <AlertCircle size={64} className="mb-4" />
                            <h3 className="text-xl font-bold mb-2">Verification Error</h3>
                            <p className="text-sm opacity-90">{error}</p>
                            <button onClick={reset} className="mt-6 px-6 py-2 bg-white text-rose-500 rounded-full font-bold text-sm hover:bg-rose-50 transition-colors flex items-center gap-2">
                                <RefreshCcw size={16} /> Try Again
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 flex flex-col items-center">
                    {status === 'ready' && (
                        <button 
                            onClick={capturePhoto}
                            className="group size-20 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 transition-all hover:scale-110 active:scale-95 border-4 border-white dark:border-surface-dark outline outline-1 outline-primary"
                        >
                            <Camera size={32} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    )}
                    
                    <div className="mt-6 grid grid-cols-2 gap-8 w-full">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-tighter">Current User</p>
                            <p className="text-sm font-bold dark:text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase">{user.role}</p>
                        </div>
                        <div className="text-center border-l border-slate-100 dark:border-border-dark">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-tighter">Requirement</p>
                            <p className="text-[10px] dark:text-slate-300 leading-tight">Face Recognition +<br/>College Environment</p>
                        </div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default StaffAttendanceModal;
