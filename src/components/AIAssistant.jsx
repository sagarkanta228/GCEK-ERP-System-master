import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const AIAssistant = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState([
        { role: 'model', text: `Hello ${user?.name?.split(' ')[0] || ''}! How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userApiKey, setUserApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    history: messages,
                    userRole: user?.role || 'User',
                    userName: user?.name || '',
                    apiKey: userApiKey
                }),
            });

            const data = await response.json();

            setMessages(prev => [
                ...prev,
                { role: 'model', text: data.reply }
            ]);

        } catch (error) {
            setMessages(prev => [
                ...prev,
                { role: 'model', text: "Server connection error." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full bg-slate-50 dark:bg-background-dark/50 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="size-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-2xl">smart_toy</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">AI Assistant</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online • Powered by Gemini
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-100 dark:bg-background-dark rounded-xl"
                    title="Set Custom API Key"
                >
                    <span className="material-symbols-outlined">key</span>
                </button>
            </div>

            {/* Custom API Key Input Panel */}
            {showKeyInput && (
                <div className="p-4 bg-slate-50 dark:bg-background-dark/80 border-b border-slate-200 dark:border-border-dark flex gap-3 items-center">
                    <span className="material-symbols-outlined text-amber-500 text-xl">vpn_key</span>
                    <input
                        type="password"
                        value={userApiKey}
                        onChange={(e) => setUserApiKey(e.target.value)}
                        placeholder="Enter your own Gemini API Key (Optional)"
                        className="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    />
                    <button
                        onClick={() => {
                            localStorage.setItem('geminiApiKey', userApiKey);
                            setShowKeyInput(false);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => {
                            setUserApiKey('');
                            localStorage.removeItem('geminiApiKey');
                        }}
                        className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-bold shadow-sm hover:bg-rose-500/20 transition"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`
                            max-w-[80%] lg:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                            ${msg.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-border-dark rounded-tl-none'}
                        `}>
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-primary dark:text-accent-neon uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    AI Assistant
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="flex gap-1">
                                <span className="size-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="size-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="size-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark">
                <div className="flex items-end gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 transition-colors shadow-none">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Inquire about academic schedules, fees, or college policies..."
                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 ring-0 text-slate-900 dark:text-white placeholder-slate-400 resize-none max-h-32 py-2 text-sm"
                        rows="1"
                        style={{ minHeight: '44px', boxShadow: 'none' }}
                        autoComplete="off"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`p-2 rounded-lg transition-all ${input.trim() && !isLoading
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
                            : 'bg-slate-200 dark:bg-surface-dark text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-3">
                    AI can make mistakes. Please verify important information with official college sources.
                </p>
            </div>
        </div>
    );
};

export default AIAssistant;
