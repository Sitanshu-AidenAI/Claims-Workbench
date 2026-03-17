import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Play, Sparkles, User, FileText, ShieldAlert,
    Coins, Activity, Maximize, CheckCircle2,
    ChevronDown, Cpu, Network, Zap, AlertTriangle,
    BarChart4, ArrowUpRight, Scale
} from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    // Agent pipeline — drives the live processing animation
    const AGENTS = [
        { id: 'orch',   name: 'Orchestrator',     Icon: Cpu,         action: 'Routing CL-2847 to agent pipeline…', done: 'Claim routed in 0.3 s',   time: '0.3s',  color: '#a855f7', bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.35)'  },
        { id: 'doc',    name: 'Doc Analyzer',      Icon: FileText,    action: 'Extracting entities from FNOL…',     done: '12 entities extracted',    time: '1.1s',  color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)'  },
        { id: 'risk',   name: 'Risk Assessor',     Icon: ShieldAlert, action: 'Scoring liability exposure…',        done: 'Risk: Moderate — 46%',      time: '0.8s',  color: '#6366f1', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.35)'  },
        { id: 'fraud',  name: 'Fraud Predictor',   Icon: AlertTriangle, action: 'Checking anomaly patterns…',      done: 'Fraud risk: Low — 18%',     time: '1.4s',  color: '#f43f5e', bg: 'rgba(244,63,94,0.15)',   border: 'rgba(244,63,94,0.35)'   },
        { id: 'settle', name: 'Settlement Engine', Icon: Coins,       action: 'Calculating reserve amount…',        done: '£42,500 reserve approved',  time: '0.6s',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)'  },
    ];

    const [activeStep, setActiveStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setActiveStep(s => (s >= 5 ? 0 : s + 1)), 1400);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

            {/* Dynamic Background Mesh */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl opacity-50 animate-blob" />
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-50/40 blur-3xl opacity-50 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-50/40 blur-3xl opacity-50 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navigation Bar */}
                <nav className="fixed top-0 inset-x-0 bg-white/60 backdrop-blur-md border-b border-white/20 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <svg width="122" height="28" viewBox="0 0 122 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.69776 9.26562C4.34183 9.26562 0 13.5204 0 18.7692C0 24.0179 4.34183 28.2723 9.69776 28.2723C9.85445 28.2723 10.0105 28.2682 10.1659 28.2614V24.6282C10.0109 24.6404 9.8555 24.6515 9.69776 24.6515C6.38241 24.6515 3.69468 22.0179 3.69468 18.7692C3.69468 15.5205 6.38241 12.8867 9.69776 12.8867C13.0129 12.8867 15.7006 15.5205 15.7006 18.7692V26.2303V28.2723H19.3957V18.7692C19.3957 13.5204 15.0539 9.26562 9.69776 9.26562Z" fill="#1e40af" />
                                <path d="M36.2717 28.273C30.9156 28.273 26.5737 24.0186 26.5737 18.7697C26.5737 13.5211 30.9156 9.26632 36.2717 9.26632C36.4284 9.26632 36.5845 9.27064 36.7399 9.27805V12.9106C36.5845 12.8985 36.4294 12.8874 36.2717 12.8874C32.9564 12.8874 30.2686 15.521 30.2686 18.7697C30.2686 22.0184 32.9564 24.6522 36.2717 24.6522C39.5868 24.6522 42.2746 22.0184 42.2746 18.7697V11.3086V0.273438H45.9692V18.7697C45.9692 24.0186 41.6276 28.273 36.2717 28.273Z" fill="#1e40af" />
                                <path d="M24.8321 9.26758H21.1372V28.2743H24.8321V9.26758Z" fill="#1e40af" />
                                <path d="M24.8321 4.17773H21.1372V7.79876H24.8321V4.17773Z" fill="#1e40af" />
                                <path d="M106.866 9.26562C101.51 9.26562 97.168 13.5204 97.168 18.7692C97.168 24.0179 101.51 28.2723 106.866 28.2723C107.023 28.2723 107.178 28.2682 107.334 28.2614V24.6282C107.179 24.6404 107.024 24.6515 106.866 24.6515C103.551 24.6515 100.863 22.0179 100.863 18.7692C100.863 15.5205 103.551 12.8867 106.866 12.8867C110.181 12.8867 112.868 15.5205 112.868 18.7692V26.2303V28.2723H116.564V18.7692C116.564 13.5204 112.222 9.26562 106.866 9.26562Z" fill="#1e40af" />
                                <path d="M122 9.26758H118.305V28.2743H122V9.26758Z" fill="#1e40af" />
                                <path d="M122 4.17773H118.305V7.79876H122V4.17773Z" fill="#1e40af" />
                                <path d="M67.5139 18.7694C67.5139 13.5204 63.1721 9.26562 57.8162 9.26562C52.46 9.26562 48.1184 13.5204 48.1184 18.7694C48.1184 24.0182 52.46 28.2729 57.8162 28.2729C57.9645 28.2729 58.1119 28.2686 58.2587 28.2616V24.6297C58.1119 24.64 57.9655 24.6515 57.8162 24.6515C54.5012 24.6515 51.8135 22.0179 51.8135 18.7692C51.8135 15.5203 54.5012 12.8867 57.8162 12.8867C60.6604 12.8867 63.037 14.8273 63.6565 17.4294H56.9667V21.0506H63.3504H67.231H67.5141V19.0876L67.5047 19.0767C67.5074 18.9744 67.5139 18.8725 67.5139 18.8725Z" fill="#1e40af" />
                                <path d="M78.9529 9.26562C73.597 9.26562 69.2551 13.5204 69.2551 18.7692V24.6297H72.9502V18.7692C72.9502 15.5205 75.6377 12.8867 78.9529 12.8867C82.268 12.8867 84.956 15.5205 84.956 18.7692V28.2723H88.6511V18.77V18.7692C88.6511 13.5204 84.3092 9.26562 78.9529 9.26562Z" fill="#1e40af" />
                            </svg>
                        </div>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {['Features', 'AI Agents', 'Workflow', 'Benefits'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')} `} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                    {item}
                                </a>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-5">
                            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/login" className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 pointer-events-auto">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full">

                        {/* Left Content */}
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[11px] font-bold tracking-wider mb-8 uppercase"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                AI-Powered Claims Platform
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6"
                            >
                                Resolve Claims <br className="hidden lg:block" />
                                <span className="text-[#0369a1]">Faster</span> with <br className="hidden lg:block" />
                                AI Agents
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl"
                            >
                                A multi-agent AI platform where specialized agents collaborate in real-time to analyze documents, assess risks, detect fraud, and automate settlements — accelerating your claims workflow by 10x.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200/60 pb-12 mb-10"
                            >
                                <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-900/10 hover:shadow-lg hover:-translate-y-0.5 group">
                                    Start Resolving
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-7 py-3.5 rounded-xl text-sm transition-all hover:bg-gray-50 shadow-sm">
                                    <Play className="w-4 h-4 text-gray-400" />
                                    See How It Works
                                </button>
                            </motion.div>

                            {/* Metrics */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                                className="grid grid-cols-3 gap-8"
                            >
                                {[
                                    { value: '10x', label: 'Faster Processing' },
                                    { value: '95%', label: 'Accuracy Rate' },
                                    { value: '60%', label: 'Cost Reduction' }
                                ].map((metric) => (
                                    <div key={metric.label}>
                                        <div className="text-3xl font-bold text-[#0369a1] mb-1 tracking-tight">{metric.value}</div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{metric.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Panel — Live Agent Orchestration card */}
                        <div className="hidden lg:flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, x: 32 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 180 }}
                                className="w-full max-w-[420px] xl:max-w-[460px]"
                            >
                                {/* Light processing card */}
                                <div className="rounded-[28px] overflow-hidden" style={{
                                    background: '#ffffff',
                                    border: '1px solid #E8EDF5',
                                    boxShadow: '0 24px 64px rgba(3,68,140,0.10), 0 4px 16px rgba(3,68,140,0.06)',
                                }}>
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: '#94a3b8' }}>
                                                Multi-Agent Orchestration
                                            </div>
                                            <div className="font-bold text-[16px] tracking-tight" style={{ color: '#0f172a' }}>Processing Claim CL-2847</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold tracking-wider text-emerald-600">LIVE</span>
                                        </div>
                                    </div>

                                    {/* Agent rows */}
                                    <div className="px-5 py-4 space-y-1">
                                        {AGENTS.map((agent, i) => {
                                            const isDone   = activeStep > i;
                                            const isActive = activeStep === i;
                                            return (
                                                <div key={agent.id} className="relative">
                                                    {/* Vertical connector between rows */}
                                                    {i < AGENTS.length - 1 && (
                                                        <div className="absolute left-[19px] top-[52px] w-[2px] h-[16px] rounded-full overflow-hidden"
                                                            style={{ background: isDone ? 'rgba(16,185,129,0.25)' : '#E8EDF5' }}>
                                                            {isActive && (
                                                                <motion.div
                                                                    className="absolute left-0 w-full rounded-full"
                                                                    style={{ height: '50%', background: '#10b981' }}
                                                                    animate={{ top: ['0%', '120%', '0%'] }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    <motion.div
                                                        className="flex items-center gap-3.5 py-3"
                                                        animate={{ opacity: isActive ? 1 : isDone ? 0.75 : 0.3 }}
                                                        transition={{ duration: 0.35 }}
                                                    >
                                                        {/* Icon bubble */}
                                                        <div className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0 transition-all duration-500"
                                                            style={{
                                                                background: (isDone || isActive) ? agent.bg : '#F8FAFC',
                                                                border: `1px solid ${(isDone || isActive) ? agent.border : '#E8EDF5'}`,
                                                                boxShadow: isActive ? `0 0 16px ${agent.color}30` : 'none',
                                                            }}>
                                                            {isDone ? (
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                            ) : isActive ? (
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                                    style={{ color: agent.color }}
                                                                >
                                                                    <agent.Icon className="w-5 h-5" />
                                                                </motion.div>
                                                            ) : (
                                                                <agent.Icon className="w-5 h-5" style={{ color: '#CBD5E1' }} />
                                                            )}
                                                        </div>

                                                        {/* Name + status text */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[13px] font-semibold leading-tight" style={{ color: (isDone || isActive) ? '#1e293b' : '#94a3b8' }}>
                                                                {agent.name}
                                                            </div>
                                                            <div className="text-[11px] mt-0.5 truncate" style={{ color: isDone ? '#10b981' : isActive ? '#64748b' : '#CBD5E1' }}>
                                                                {isDone ? `✓ ${agent.done}` : isActive ? agent.action : 'Awaiting handoff…'}
                                                            </div>
                                                        </div>

                                                        {/* Right — time or typing dots */}
                                                        <div className="flex-shrink-0 w-10 flex justify-end">
                                                            {isDone && (
                                                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono" style={{ color: '#10b981' }}>
                                                                    {agent.time}
                                                                </motion.span>
                                                            )}
                                                            {isActive && (
                                                                <div className="flex items-center gap-0.5">
                                                                    {[0, 1, 2].map(j => (
                                                                        <motion.div key={j} className="w-1 h-1 rounded-full" style={{ background: '#94a3b8' }}
                                                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                                                            transition={{ duration: 0.9, repeat: Infinity, delay: j * 0.22 }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="px-5 pb-5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10.5px] text-slate-400">Pipeline progress</span>
                                            <span className="text-[10.5px] font-bold text-slate-600">
                                                {Math.min(100, Math.round((activeStep / AGENTS.length) * 100))}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: 'linear-gradient(90deg, #3b82f6, #10b981)' }}
                                                animate={{ width: `${Math.min(100, Math.round((activeStep / AGENTS.length) * 100))}%` }}
                                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stat chips below card */}
                                <div className="flex gap-3 mt-4 justify-center">
                                    {[
                                        { label: 'Agents Active', value: `${Math.min(activeStep + 1, AGENTS.length)}/5` },
                                        { label: 'Avg Latency',   value: '0.84s' },
                                        { label: 'Accuracy',      value: '98.2%' },
                                    ].map(chip => (
                                        <div key={chip.label} className="flex flex-col items-center px-4 py-2.5 rounded-2xl"
                                            style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                                            <span className="text-[15px] font-black text-[#0369a1]">{chip.value}</span>
                                            <span className="text-[9.5px] text-gray-400 font-medium mt-0.5 whitespace-nowrap">{chip.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                    </div>

                    <div className="flex flex-col items-center justify-center mt-20 pb-10 text-gray-400 opacity-60 animate-bounce">
                        <span className="text-[10px] font-semibold uppercase tracking-widest mb-2">Scroll To Explore</span>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </main>

                {/* --- Section 2: Features Grid --- */}
                <section id="features" className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16 max-w-2xl mx-auto">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Everything You Need to Resolve with Confidence</h2>
                            <p className="text-gray-500 text-lg">Our suite of AI tools is designed to handle the heavy lifting, giving your handlers the insights they need to make faster, more accurate decisions.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Intelligent Triage', desc: 'Automatically classify and route incoming FNOLs to the right handler based on complexity and risk.' },
                                { icon: ShieldAlert, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Risk Assessment', desc: 'Evaluate liability and coverage details instantly by cross-referencing policy documents against incident reports.' },
                                { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', title: 'Fraud Detection', desc: 'Identify suspicious patterns and anomalies using historical data and deep learning models before payout.' },
                                { icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Automated Settlements', desc: 'Calculate accurate reserve recommendations and fast-track low-risk, low-complexity claims for immediate payout.' },
                                { icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', title: 'Real-time Monitoring', desc: 'Track your entire portfolio health with live operational metrics and predictive SLA breach warnings.' },
                                { icon: Network, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Multi-Agent Collaboration', desc: 'Watch specialized AI models work together in parallel to synthesize the most complete view of any claim.' }
                            ].map((f, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group cursor-pointer"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <f.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Section 3: Interactive AI Agents --- */}
                <section id="ai-agents" className="py-24 bg-[#03448C] text-white relative overflow-hidden">
                    {/* Visual accents for dark blue bg */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[120px]" />
                        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-300/10 blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Meet Your Digital Workforce</h2>
                            <p className="text-blue-100/70 text-lg max-w-2xl">Specialized agents working in harmony to process claims faster than ever before.</p>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
                            {/* Left List */}
                            <div className="lg:col-span-5 flex flex-col gap-3">
                                {[
                                    { id: 'doc', icon: FileText, title: 'Document Analyzer', active: true },
                                    { id: 'risk', icon: ShieldAlert, title: 'Risk Assessor', active: false },
                                    { id: 'fraud', icon: AlertTriangle, title: 'Fraud Predictor', active: false },
                                    { id: 'settle', icon: Coins, title: 'Settlement Engine', active: false }
                                ].map((agent) => (
                                    <div key={agent.id} className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${agent.active ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${agent.active ? 'bg-white text-[#03448C]' : 'bg-white/10 text-white/60'}`}>
                                                <agent.icon className="w-5 h-5" />
                                            </div>
                                            <span className={`font-semibold ${agent.active ? 'text-white' : 'text-white/60'}`}>{agent.title}</span>
                                        </div>
                                        {agent.active && <ChevronDown className="w-5 h-5 text-white -rotate-90" />}
                                    </div>
                                ))}
                            </div>

                            {/* Right Detail Card */}
                            <div className="lg:col-span-7">
                                <div className="h-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />

                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                                                <FileText className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Document Analyzer</h3>
                                                <span className="flex items-center gap-2 text-xs text-teal-300 font-medium tracking-wide mt-1 uppercase">
                                                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Agent Active & Processing
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-200/60 uppercase tracking-wider mb-4">Core Capabilities</h4>
                                            <ul className="space-y-3">
                                                {['Extracts entities from unstructured claim narratives', 'Validates policy numbers against external databases', 'Flags missing mandatory documents instantly'].map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-blue-50">
                                                        <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-white/10">
                                            <div className="flex justify-between text-xs text-blue-200/60 uppercase tracking-wider mb-2">
                                                <span>Processing Latest Batch</span>
                                                <span className="text-white">89%</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-teal-400 to-blue-400 w-[89%] rounded-full relative">
                                                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Section 4: Workflow --- */}
                <section id="workflow" className="py-24 bg-gray-50 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">The Automated Claim Journey</h2>
                            <p className="text-gray-500 text-lg">Watch how our agents transform a chaotic manual procedure into a streamlined pipeline.</p>
                        </div>

                        <div className="relative">
                            {/* Horizontal Line connecting steps (hidden on mobile) */}
                            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gray-200 z-0" />

                            <div className="grid md:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { num: '01', title: 'Submission', desc: 'FNOL data is ingested via web form or email.' },
                                    { num: '02', title: 'Analysis', desc: 'Doc Analyzer extracts entities and cross-checks policy.' },
                                    { num: '03', title: 'Scoring', desc: 'Risk Assessor & Fraud Predictor assign confidence scores.' },
                                    { num: '04', title: 'Resolution', desc: 'Settlement Engine auto-approves or routes to a Manager.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center text-center">
                                        <div className="w-14 h-14 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 shadow-xl shadow-blue-500/10">
                                            {step.num}
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                                        <p className="text-sm text-gray-500">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Section 5: Impact & Final CTA --- */}
                <section id="benefits" className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">

                        {/* Impact Metrics */}
                        <div className="grid md:grid-cols-2 gap-8 mb-32">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 lg:p-14 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
                                <h3 className="text-6xl font-black mb-4 tracking-tighter">40%</h3>
                                <p className="text-2xl font-semibold opacity-90 mb-2">Lower Expense Ratio</p>
                                <p className="opacity-70">By removing manual data entry and automating low-risk approvals.</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 lg:p-14 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
                                <h3 className="text-6xl font-black mb-4 tracking-tighter">3 Days</h3>
                                <p className="text-2xl font-semibold opacity-90 mb-2">Faster Cycle Times</p>
                                <p className="opacity-70 flex-1">Average reduction in time-to-settlement across all general liability claims.</p>
                            </div>
                        </div>

                        {/* Final CTA */}
                        <div className="text-center max-w-3xl mx-auto bg-blue-50/50 rounded-3xl border border-blue-100 p-12 lg:p-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Ready to Transform Your Workflow?</h2>
                            <p className="text-lg text-gray-600 mb-10">Stop managing claims manually. Unleash the power of AI agents and give your team the workbench they deserve.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    Get Started Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base transition-all hover:bg-gray-50 shadow-sm">
                                    Contact Sales
                                </button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- Footer --- */}
                <footer className="border-t border-gray-200 bg-white pt-16 pb-8">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                            <div className="flex items-center gap-2">
                                <svg width="122" height="28" viewBox="0 0 122 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.69776 9.26562C4.34183 9.26562 0 13.5204 0 18.7692C0 24.0179 4.34183 28.2723 9.69776 28.2723C9.85445 28.2723 10.0105 28.2682 10.1659 28.2614V24.6282C10.0109 24.6404 9.8555 24.6515 9.69776 24.6515C6.38241 24.6515 3.69468 22.0179 3.69468 18.7692C3.69468 15.5205 6.38241 12.8867 9.69776 12.8867C13.0129 12.8867 15.7006 15.5205 15.7006 18.7692V26.2303V28.2723H19.3957V18.7692C19.3957 13.5204 15.0539 9.26562 9.69776 9.26562Z" fill="#94a3b8" />
                                    <path d="M36.2717 28.273C30.9156 28.273 26.5737 24.0186 26.5737 18.7697C26.5737 13.5211 30.9156 9.26632 36.2717 9.26632C36.4284 9.26632 36.5845 9.27064 36.7399 9.27805V12.9106C36.5845 12.8985 36.4294 12.8874 36.2717 12.8874C32.9564 12.8874 30.2686 15.521 30.2686 18.7697C30.2686 22.0184 32.9564 24.6522 36.2717 24.6522C39.5868 24.6522 42.2746 22.0184 42.2746 18.7697V11.3086V0.273438H45.9692V18.7697C45.9692 24.0186 41.6276 28.273 36.2717 28.273Z" fill="#94a3b8" />
                                    <path d="M24.8321 9.26758H21.1372V28.2743H24.8321V9.26758Z" fill="#94a3b8" />
                                    <path d="M24.8321 4.17773H21.1372V7.79876H24.8321V4.17773Z" fill="#94a3b8" />
                                    <path d="M106.866 9.26562C101.51 9.26562 97.168 13.5204 97.168 18.7692C97.168 24.0179 101.51 28.2723 106.866 28.2723C107.023 28.2723 107.178 28.2682 107.334 28.2614V24.6282C107.179 24.6404 107.024 24.6515 106.866 24.6515C103.551 24.6515 100.863 22.0179 100.863 18.7692C100.863 15.5205 103.551 12.8867 106.866 12.8867C110.181 12.8867 112.868 15.5205 112.868 18.7692V26.2303V28.2723H116.564V18.7692C116.564 13.5204 112.222 9.26562 106.866 9.26562Z" fill="#94a3b8" />
                                    <path d="M122 9.26758H118.305V28.2743H122V9.26758Z" fill="#94a3b8" />
                                    <path d="M122 4.17773H118.305V7.79876H122V4.17773Z" fill="#94a3b8" />
                                    <path d="M67.5139 18.7694C67.5139 13.5204 63.1721 9.26562 57.8162 9.26562C52.46 9.26562 48.1184 13.5204 48.1184 18.7694C48.1184 24.0182 52.46 28.2729 57.8162 28.2729C57.9645 28.2729 58.1119 28.2686 58.2587 28.2616V24.6297C58.1119 24.64 57.9655 24.6515 57.8162 24.6515C54.5012 24.6515 51.8135 22.0179 51.8135 18.7692C51.8135 15.5203 54.5012 12.8867 57.8162 12.8867C60.6604 12.8867 63.037 14.8273 63.6565 17.4294H56.9667V21.0506H63.3504H67.231H67.5141V19.0876L67.5047 19.0767C67.5074 18.9744 67.5139 18.8725 67.5139 18.8725Z" fill="#94a3b8" />
                                    <path d="M78.9529 9.26562C73.597 9.26562 69.2551 13.5204 69.2551 18.7692V24.6297H72.9502V18.7692C72.9502 15.5205 75.6377 12.8867 78.9529 12.8867C82.268 12.8867 84.956 15.5205 84.956 18.7692V28.2723H88.6511V18.77V18.7692C88.6511 13.5204 84.3092 9.26562 78.9529 9.26562Z" fill="#94a3b8" />
                                </svg>
                            </div>
                            <div className="flex gap-8 text-sm font-medium text-gray-500">
                                <a href="#" className="hover:text-gray-900 transition-colors">Platform</a>
                                <a href="#" className="hover:text-gray-900 transition-colors">Resources</a>
                                <a href="#" className="hover:text-gray-900 transition-colors">Company</a>
                                <a href="#" className="hover:text-gray-900 transition-colors">Legal</a>
                            </div>
                        </div>
                        <div className="text-center text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} Aiden AI Workbench. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
