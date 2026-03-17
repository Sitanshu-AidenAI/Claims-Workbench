import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, RotateCcw, Network } from 'lucide-react';
import { useState } from 'react';
import { aiApi } from '../services/api';

const QUICK_PROMPTS = [
    'Summarise this claim',
    'Check fraud indicators',
    'Reserve recommendation',
    'Coverage analysis',
];

function AIOrb() {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            {/* Rotating outer ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'conic-gradient(from 0deg, #2CC9A2, #03448C, #2CC9A2)',
                    padding: 2,
                }}
            >
                <div className="w-full h-full rounded-full" style={{ background: '#022D5E' }} />
            </motion.div>
            {/* Inner icon */}
            <Sparkles className="w-4 h-4 text-accent-400 relative z-10" />
        </div>
    );
}

export default function AIPanel({ open, onClose, context, claimId, scId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [convId, setConvId] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    async function send(text) {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setMessages(m => [...m, { role: 'user', text: msg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await aiApi.chat({ message: msg, conversation_id: convId, context, claim_id: claimId, sub_claim_id: scId });
            setConvId(res.conversation_id);
            setMessages(m => [...m, { role: 'ai', text: res.response }]);
        } catch (e) {
            setMessages(m => [...m, { role: 'ai', text: '⚠ ' + e.message }]);
        } finally {
            setLoading(false);
        }
    }

    function clear() { setMessages([]); setConvId(null); }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        className="fixed right-0 top-0 bottom-0 w-[440px] z-[201] flex flex-col"
                        style={{ background: 'linear-gradient(160deg, #022D5E 0%, #03448C 50%, #0558B0 100%)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07] flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <img src="/aidenlogo.svg" alt="Aiden AI" className="h-6 brightness-0 invert" />
                                <div>
                                    <div className="flex items-center gap-1.5 ml-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-400" />
                                        </span>
                                        <span className="text-[11px] text-accent-400 font-medium">Online &amp; Ready</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={clear}
                                    title="Clear chat"
                                    className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Context chips */}
                        {context && (
                            <div className="px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10.5px] text-white/30 font-medium tracking-wider">CONTEXT</span>
                                    <span className="px-2 py-0.5 rounded-full bg-accent-400/15 border border-accent-400/30 text-accent-400 text-[11px] font-semibold">
                                        {context}
                                    </span>
                                    {claimId && (
                                        <span className="px-2 py-0.5 rounded-full bg-primary-600/20 border border-primary-400/30 text-primary-300 text-[11px] font-medium">
                                            {claimId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Message thread */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">

                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center pb-8"
                                >
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                                        className="mb-6 mt-4 flex items-center justify-center will-change-transform"
                                    >
                                        <div className="flex items-center gap-2 select-none">
                                            {/* Neural Network Icon for Lex */}
                                            <div className="relative w-8 h-8 flex items-center justify-center mr-1">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-400/20 to-primary-400/20" />
                                                <motion.div
                                                    animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <Network className="w-5 h-5 text-accent-400 drop-shadow-[0_0_8px_rgba(44,201,162,0.8)]" />
                                                </motion.div>
                                            </div>
                                            <span
                                                className="text-3xl font-bold tracking-tight text-white/95"
                                                style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                                            >
                                                lex
                                            </span>
                                        </div>
                                    </motion.div>
                                    <div className="text-[16px] font-semibold text-white/90 mb-1">How can I help you today?</div>
                                    <div className="text-[12.5px] text-white/30 mb-8 leading-relaxed">
                                        {context ? `Specialised for ${context} queries` : 'Ask anything about your claims portfolio'}
                                    </div>

                                    {/* Quick prompts */}
                                    <div className="w-full space-y-2">
                                        {QUICK_PROMPTS.map((q, i) => (
                                            <motion.button
                                                key={q}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                                onClick={() => send(q)}
                                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(44,201,162,0.08)' }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-accent-400/30 text-[12.5px] text-white/60 hover:text-white/90 transition-all flex items-center gap-3"
                                            >
                                                <span className="w-5 h-5 rounded-md bg-accent-400/15 flex items-center justify-center flex-shrink-0">
                                                    <Sparkles className="w-3 h-3 text-accent-400" />
                                                </span>
                                                {q}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {m.role === 'ai' && (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400/20 to-primary-600/20 border border-accent-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Sparkles className="w-3 h-3 text-accent-400" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed ${m.role === 'user'
                                            ? 'rounded-[16px_4px_16px_16px] bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-[0_4px_16px_rgba(3,68,140,0.4)]'
                                            : 'rounded-[4px_16px_16px_16px] bg-white/[0.06] border border-white/[0.08] text-white/85'
                                            }`}
                                    >
                                        {m.text}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-accent-400/15 border border-accent-400/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-3 h-3 text-accent-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-[4px_16px_16px_16px] bg-white/[0.06] border border-white/[0.08] flex gap-1.5 items-center">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-accent-400"
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Quick reply chips when chat active */}
                        {messages.length > 0 && !loading && (
                            <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
                                {QUICK_PROMPTS.slice(0, 3).map(q => (
                                    <button
                                        key={q}
                                        onClick={() => send(q)}
                                        className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 text-[11px] hover:bg-white/[0.1] hover:text-white/80 hover:border-accent-400/30 transition-all whitespace-nowrap"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 pb-5 pt-3 flex-shrink-0 border-t border-white/[0.07]">
                            <div className="flex gap-2.5 items-end bg-white/[0.05] border border-white/[0.10] rounded-2xl px-4 py-3 focus-within:border-accent-400/40 transition-colors">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                    placeholder="Ask about this claim…"
                                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-white/85 placeholder-white/25 resize-none font-[inherit]"
                                />
                                <motion.button
                                    onClick={() => send()}
                                    disabled={loading || !input.trim()}
                                    whileHover={!loading && input.trim() ? { scale: 1.08 } : {}}
                                    whileTap={!loading && input.trim() ? { scale: 0.92 } : {}}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${loading || !input.trim()
                                        ? 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                                        : 'bg-gradient-to-br from-accent-400 to-primary-500 text-white shadow-[0_2px_12px_rgba(44,201,162,0.4)] cursor-pointer'
                                        }`}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                            <p className="text-center text-[10px] text-white/20 mt-2">Advisory only — verify with policy documents</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
