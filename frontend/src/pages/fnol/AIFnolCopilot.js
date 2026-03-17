import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldAlert, CheckCircle2, FileText, AlertTriangle, User, Car, Check } from 'lucide-react';

const STEP_INSIGHTS = {
    0: {
        title: "Policy Analysis",
        insights: [
            { type: 'info', text: 'Policy POL-1000 is active and covers comprehensive fleet damage.' },
            { type: 'warning', text: 'Exclusion: Acts of God are covered but subject to a higher 15% deductible.' },
            { type: 'success', text: 'Limits: Up to £5M liability per incident.' }
        ],
        action: "Extract Policy Details"
    },
    1: {
        title: "Loss Assessment",
        insights: [
            { type: 'warning', text: 'Fraud Risk: Low. However, the exact timestamp of the accident slightly conflicts with the initial weather report for that region (heavy rain reported 2 hours later).' },
            { type: 'info', text: 'Liability Prediction: Based on description ("rear-ended at stoplight"), our insured is likely 0% at fault.' },
            { type: 'info', text: 'Recommended Action: Fast-track third-party subrogation.' }
        ],
        action: "Analyze Liability"
    },
    2: {
        title: "Subject History",
        insights: [
            { type: 'warning', text: 'Driver "John Doe" has 2 prior claims in the last 3 years (both minor at-fault).' },
            { type: 'info', text: 'Vehicle Mercedes C300 has no prior reported damage or salvage history.' }
        ],
        action: "Run Background Check"
    },
    3: {
        title: "Document Verification",
        insights: [
            { type: 'info', text: 'Required Documents: Police Report (Missing), Photos (Uploaded), Driver License (Uploaded).' },
            { type: 'success', text: 'Damage photos analyzed: Consistent with rear-end collision described in step 2. Estimated initial severity: £4,500.' }
        ],
        action: "Verify Documents"
    }
};

export default function AIFnolCopilot({ currentStep = 0, formData, onAutoFill }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzedSteps, setAnalyzedSteps] = useState({});
    const [isOpen, setIsOpen] = useState(false);

    // Reset analysis when step changes (or keep it if already analyzed)
    useEffect(() => {
        // Optional: auto-analyze when step changes
    }, [currentStep]);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setAnalyzedSteps(prev => ({ ...prev, [currentStep]: true }));
        }, 1500);
    };

    const handleAutoFill = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            if (onAutoFill) {
                onAutoFill();
            }
        }, 2000);
    };

    const stepData = STEP_INSIGHTS[currentStep] || STEP_INSIGHTS[0];
    const isAnalyzed = analyzedSteps[currentStep];

    const renderIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0 drop-shadow-sm" />;
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0 drop-shadow-sm" />;
            case 'info':
            default: return <ShieldAlert className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 drop-shadow-sm" />;
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-[360px] h-[600px] max-h-[75vh] mb-5 bg-white/95 backdrop-blur-2xl border border-blue-50 shadow-2xl rounded-3xl flex flex-col overflow-hidden origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-blue-50/80 bg-gradient-to-br from-blue-50/60 to-white relative overflow-hidden flex-shrink-0">
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md border border-white/20">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 tracking-tight">AI Assistant</h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                            </span>
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Active</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>

                            {currentStep === 0 && (
                                <motion.button
                                    whileHover={{ y: -1, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAutoFill}
                                    disabled={analyzing}
                                    className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-blue-100 rounded-xl text-sm font-bold text-blue-700 shadow-sm hover:border-blue-200 hover:shadow-md hover:bg-blue-50/30 transition-all disabled:opacity-50 overflow-hidden relative group"
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                            <span>Scanning Documents...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            Auto-fill from Context
                                        </>
                                    )}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-100/30 to-transparent" />
                                </motion.button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide relative z-10 bg-slate-50/50">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-2">
                                        <div className="p-1 rounded bg-white shadow-sm border border-gray-100 text-gray-500">
                                            {currentStep === 0 && <FileText className="w-3 h-3" />}
                                            {currentStep === 1 && <AlertTriangle className="w-3 h-3" />}
                                            {currentStep === 2 && <User className="w-3 h-3" />}
                                            {currentStep === 3 && <Car className="w-3 h-3" />}
                                        </div>
                                        {stepData.title}
                                    </h3>
                                    <AnimatePresence>
                                        {isAnalyzed && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-1text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase"
                                            >
                                                ✓ Analyzed
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!isAnalyzed ? (
                                        <motion.div
                                            key="action"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white border border-blue-50 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                                <Sparkles className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed font-medium">
                                                Run AI analysis to detect fraud, extract entities, and surface risks.
                                            </p>
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={analyzing}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md disabled:opacity-80 relative overflow-hidden"
                                            >
                                                {analyzing ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Running Models...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 text-blue-300" />
                                                        {stepData.action}
                                                    </>
                                                )}
                                                {analyzing && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
                                                )}
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="insights"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-3"
                                        >
                                            {stepData.insights.map((insight, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    key={idx}
                                                    className={`p-3.5 rounded-xl border bg-white shadow-sm flex gap-3 text-sm font-medium text-gray-700 leading-snug relative overflow-hidden ${insight.type === 'warning' ? 'border-amber-100' :
                                                        insight.type === 'success' ? 'border-emerald-100' : 'border-blue-100'
                                                        }`}
                                                >
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.type === 'warning' ? 'bg-amber-400' :
                                                        insight.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                                                    {renderIcon(insight.type)}
                                                    <p>{insight.text}</p>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Global Progress or Metrics */}
                            {currentStep > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="pt-4 border-t border-gray-100"
                                >
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live Intelligence</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5 font-semibold">
                                                <span className="text-gray-600">Fraud Probability</span>
                                                <span className="text-emerald-600">12%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: '12%' }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-emerald-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5 font-semibold">
                                                <span className="text-gray-600">Complexity Score</span>
                                                <span className="text-amber-500">Medium</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: '66%' }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className="h-full bg-amber-400 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="py-3 px-5 bg-white border-t border-gray-50 flex flex-shrink-0 justify-center">
                            <p className="text-[10px] text-gray-400 font-medium">
                                AI generated insights. <span className="text-blue-500">Verify manually.</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Floating Action Button */}
            <div className="relative group flex items-center justify-center">
                {/* Animated Outer Glow (only when closed) */}
                {!isOpen && (
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"
                    />
                )}

                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.25)] transition-all duration-500 overflow-hidden ring-1 ring-white/50 ${isOpen
                            ? 'w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-900 text-white shadow-xl'
                            : 'h-16 pl-2 pr-6 rounded-full bg-white/95 backdrop-blur-xl border border-blue-100 hover:border-blue-300 shadow-2xl hover:bg-white'
                        }`}
                >
                    {isOpen ? (
                        <motion.svg
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </motion.svg>
                    ) : (
                        <div className="flex items-center gap-3 w-full h-full">
                            {/* Animated Background Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/60 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

                            {/* The Orb Icon */}
                            <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] overflow-hidden flex-shrink-0">
                                {/* Rotating gradient inside orb */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_280deg,rgba(255,255,255,0.6)_360deg)]"
                                />
                                <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-inner">
                                    <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                </div>
                            </div>

                            {/* The Text Layout */}
                            <div className="flex flex-col items-start justify-center pr-2 relative z-10">
                                <span className="text-[14.5px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 leading-tight">AI Co-Pilot</span>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Ask Anything</span>
                            </div>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
