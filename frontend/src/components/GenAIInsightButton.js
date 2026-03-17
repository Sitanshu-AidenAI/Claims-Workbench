import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Lightbulb } from 'lucide-react';

const MOCK_INSIGHTS = {
    Litigation: "AI Analysis: The claimant's legal representation has a history of settling early in 78% of similar bodily injury cases. Recommended strategy: Initiate early settlement discussions around £45,000 to avoid prolonged defense costs.",
    Subrogation: "AI Analysis: Extremely high recovery probability (85%). The third-party involved has admitted partial fault in the police report. Recommended to pursue full subrogation for vehicle damage costs.",
    SIU: "AI Analysis: Fraud risk is currently low. However, the exact timestamp of the accident slightly conflicts with the initial weather report for that region. Continue standard processing but monitor for any injury exaggeration.",
    Salvage: "AI Analysis: Similar Mercedes C300 models with front-end damage are currently yielding high salvage returns in the London area. Recommended to list with Copart rather than independent buyers to maximize return.",
    Vendor: "AI Analysis: Based on to the location of loss (Camden) and vehicle make (Mercedes), 'Elite Auto Repairs NW1' has the fastest turnaround time and highest quality rating in our network for this specific claim profile.",
    Reserve: "AI Analysis: The current reserve of £25,000 may be inadequate. AI benchmarking against 400 similar D&O claims suggests an average total exposure of £35,000 due to rising legal fees in this jurisdiction.",
    Settlement: "AI Analysis: The requested settlement of £97,500 is within the expected range, but slightly higher than the AI-calculated optimal settlement of £88,000. Recommend a counter-offer at £85,000.",
    Document: "AI Analysis: The uploaded Loss Adjuster Report confirms front-end collision damage consistent with the insured's statement. Estimated repair parts list aligns with standard OEM pricing. No anomalies detected."
};

export default function GenAIInsightButton({ context = "Litigation" }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState(null);

    const handleGenerate = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            setInsight(MOCK_INSIGHTS[context] || "AI Insight successfully generated for this context.");
            setLoading(false);
        }, 1500);
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 text-indigo-700 text-xs font-semibold hover:shadow-sm transition-all group"
            >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:text-purple-600 transition-colors" />
                GEN AI INSIGHT
            </motion.button>

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                            <Lightbulb className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">AI Insight: {context}</h3>
                                    </div>
                                    <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 min-h-[100px] flex items-center">
                                    {loading ? (
                                        <div className="w-full flex flex-col items-center justify-center py-4 gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                            <span className="text-xs text-indigo-600/70 font-medium">Analyzing {context.toLowerCase()} data...</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                            {insight}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
