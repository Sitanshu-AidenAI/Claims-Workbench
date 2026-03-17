import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Brain, Zap } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';

/* ── Design tokens ── */
const KPI = [
  {
    key: 'total', label: 'Total Claims', unit: '',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
    from: 'from-primary-600', to: 'to-primary-400', glow: 'rgba(3,68,140,0.4)',
    trend: +12,
  },
  {
    key: 'new', label: 'New Claims', unit: '',
    icon: <Plus className="w-[18px] h-[18px]" />,
    from: 'from-blue-500', to: 'to-blue-400', glow: 'rgba(59,130,246,0.4)',
    trend: +5,
  },
  {
    key: 'in_progress', label: 'In Progress', unit: '',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
    from: 'from-amber-400', to: 'to-orange-400', glow: 'rgba(251,146,60,0.4)',
    trend: -3,
  },
  {
    key: 'completed', label: 'Completed', unit: '',
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    from: 'from-emerald-500', to: 'to-emerald-400', glow: 'rgba(16,185,129,0.4)',
    trend: +18,
  },
];

const AI_INSIGHTS = [
  { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', text: '3 claims flagged for expedited review — Motor Fleet portfolio needs attention' },
  { icon: <Brain className="w-3.5 h-3.5" />, color: 'text-accent-400 bg-accent-400/10 border-accent-400/20', text: 'AI fraud score elevated on CL-238 → 67% risk — recommend SIU review' },
  { icon: <Zap className="w-3.5 h-3.5" />, color: 'text-primary-400 bg-primary-400/10 border-primary-400/20', text: 'Reserve strengthening recommended: BI frequency +22% this quarter' },
];

const PILL_MAP = { New: 'new', 'In Progress': 'in-progress', Completed: 'completed', Denied: 'denied' };

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [claims, setClaims] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeInsight, setActiveInsight] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    claimsApi.stats().then(setStats).catch(() => { }).finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    claimsApi.list({ page, page_size: 10, search: search || undefined })
      .then(d => { setClaims(d.items || []); setTotal(d.total || 0); setTotalPages(d.total_pages || 1); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    console.log('[DEBUG Dashboard] Current user:', user);
    if (user?.role === 'fnol') {
      console.log('[DEBUG Dashboard] User is FNOL, fetching my tasks for email:', user.email);
      claimsApi.myTasks(user.email)
        .then(res => {
          console.log('[DEBUG Dashboard] Tasks received:', res);
          setMyTasks(res);
        })
        .catch(err => console.error('[DEBUG Dashboard] Failed to fetch tasks:', err));
    }
  }, [user]);

  // Rotate AI insights
  useEffect(() => {
    const t = setInterval(() => setActiveInsight(i => (i + 1) % AI_INSIGHTS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const pieData = stats
    ? [
      { name: 'New', value: stats.new || 0, color: '#3B82F6' },
      { name: 'In Progress', value: stats.in_progress || 0, color: '#FB923C' },
      { name: 'Completed', value: stats.completed || 0, color: '#10B981' },
    ].filter(d => d.value > 0)
    : [];

  const barData = [
    { name: 'Motor', value: 4 }, { name: 'D&O', value: 2 },
    { name: 'Property', value: 3 }, { name: 'Marine', value: 1 }, { name: 'Cyber', value: 2 },
  ];

  const areaData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day, claims: [3, 5, 4, 8, 6, 2, 4][i], resolved: [2, 4, 3, 6, 5, 2, 3][i],
  }));

  return (
    <div className="min-h-full bg-[#F4F6FA] pb-8">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden px-7 pt-8 pb-7 mb-0"
        style={{ background: 'linear-gradient(145deg, #022D5E 0%, #03448C 45%, #0558B0 70%, #065FC4 100%)' }}
      >
        {/* Animated mesh orbs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(44,201,162,0.15) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(3,68,140,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-white/45 text-[12.5px] mb-1 font-medium"
            >
              {greeting},
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
              className="text-white text-[24px] font-bold tracking-tight mb-2"
            >
              {user?.full_name || 'Claims Handler'} 👋
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <span className="text-white/40 text-[12.5px] capitalize">{user?.role} · Arch Insurance</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-400/15 border border-accent-400/25 text-accent-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                AI Active
              </span>
              <span className="text-white/30 text-[12px]">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </motion.div>
          </div>

          {user?.role !== 'handler' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
              whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(44,201,162,0.55)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/claims/new')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 text-white text-[13px] font-bold cursor-pointer border-none shadow-[0_4px_20px_rgba(44,201,162,0.4)] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> NEW CLAIM
            </motion.button>
          )}
        </div>

        {/* AI Insights rotating ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="relative z-10 mt-5 flex items-center gap-3"
        >
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-[10.5px] font-bold text-accent-400 tracking-wider">AI INSIGHT</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex-1 overflow-hidden h-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeInsight}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="text-[12px] text-white/55"
              >
                {AI_INSIGHTS[activeInsight].text}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Dots */}
          <div className="flex gap-1 flex-shrink-0">
            {AI_INSIGHTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveInsight(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeInsight ? 'bg-accent-400 w-3' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="px-6 pt-6 flex flex-col gap-5">

        {/* ── KPI Cards ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-4"
        >
          {KPI.map(kpi => (
            <motion.div
              key={kpi.key}
              variants={fadeUp}
              whileHover={{ y: -5, boxShadow: `0 16px 40px ${kpi.glow}` }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-[0_2px_12px_rgba(3,68,140,0.05)] relative overflow-hidden cursor-default"
            >
              {/* Top grad bar */}
              <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${kpi.from} ${kpi.to} opacity-70`} />

              {/* Background watermark */}
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.from} ${kpi.to} opacity-[0.04]`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.from} ${kpi.to} flex items-center justify-center text-white shadow-[0_4px_12px_${kpi.glow}]`}>
                  {kpi.icon}
                </div>
                <div className={`flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-lg ${kpi.trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                  {kpi.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(kpi.trend)}%
                </div>
              </div>

              {statsLoading ? (
                <div className="skeleton h-9 w-16 rounded-lg mb-1.5" />
              ) : (
                <div className="text-[34px] font-black text-dark-900 leading-none tracking-tight tabular-nums">
                  {stats?.[kpi.key] ?? '—'}
                </div>
              )}
              <div className="text-[12px] text-gray-400 font-medium mt-1.5">{kpi.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Charts Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
          className="grid grid-cols-3 gap-4"
        >
          {/* Donut */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-[0_2px_12px_rgba(3,68,140,0.05)]">
            <div className="text-[13.5px] font-semibold text-dark-900 mb-0.5">Status Mix</div>
            <div className="text-[11.5px] text-gray-400 mb-4">Portfolio breakdown</div>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-3">
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={43} dataKey="value" paddingAngle={4}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-[11.5px] text-gray-500">{d.name}</span>
                      </div>
                      <span className="text-[12px] font-bold text-dark-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="skeleton h-[90px] rounded-xl" />
            )}
          </div>

          {/* Bar */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-[0_2px_12px_rgba(3,68,140,0.05)]">
            <div className="text-[13.5px] font-semibold text-dark-900 mb-0.5">Insurance Lines</div>
            <div className="text-[11.5px] text-gray-400 mb-3">Claims by product type</div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={barData} barSize={14}>
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2CC9A2" /><stop offset="100%" stopColor="#03448C" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5EAF2', fontSize: 12 }} cursor={{ fill: 'rgba(3,68,140,0.04)' }} />
                <Bar dataKey="value" fill="url(#bg)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-[0_2px_12px_rgba(3,68,140,0.05)]">
            <div className="text-[13.5px] font-semibold text-dark-900 mb-0.5">Weekly Activity</div>
            <div className="text-[11.5px] text-gray-400 mb-3">Filed vs resolved</div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#03448C" stopOpacity={0.25} /><stop offset="95%" stopColor="#03448C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2CC9A2" stopOpacity={0.25} /><stop offset="95%" stopColor="#2CC9A2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9.5, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5EAF2', fontSize: 12 }} />
                <Area type="monotone" dataKey="claims" stroke="#03448C" strokeWidth={2} fill="url(#ag1)" dot={false} />
                <Area type="monotone" dataKey="resolved" stroke="#2CC9A2" strokeWidth={2} fill="url(#ag2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-3.5 mt-1">
              {[{ c: '#03448C', l: 'Filed' }, { c: '#2CC9A2', l: 'Resolved' }].map(x => (
                <div key={x.l} className="flex items-center gap-1.5 text-[10.5px] text-gray-400">
                  <div className="w-2.5 h-0.5 rounded" style={{ background: x.c }} />{x.l}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Table + Activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 240 }}
          className="grid gap-4"
          style={{ gridTemplateColumns: '1fr 340px' }}
        >
          {/* Claims table */}
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(3,68,140,0.05)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <div className="text-[14.5px] font-bold text-dark-900">Claims Register</div>
                <div className="text-[11.5px] text-gray-400 mt-0.5">{total} total</div>
              </div>
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search…"
                  className="input-field pl-8 w-48 text-[12.5px]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {['Claim ID', 'Company', 'Policy No.', 'Date of Loss', 'Handler', 'Status', ''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {[70, 120, 80, 90, 90, 60, 40].map((w, j) => (
                          <td key={j}><div className="skeleton h-3.5 rounded" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))
                    : claims.length === 0
                      ? <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                        No claims.{' '}
                        <button onClick={() => navigate('/claims/new')} className="text-primary-600 font-semibold bg-transparent border-none cursor-pointer">
                          Create one →
                        </button>
                      </td></tr>
                      : claims.map((c, i) => (
                        <motion.tr
                          key={c.claim_id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
                          onClick={() => navigate(`/claims/${c.claim_id}`)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                        >
                          <td><span className="font-black text-primary-600 text-[13.5px] tracking-tight">{c.claim_id}</span></td>
                          <td>
                            <div className="font-semibold text-[12.5px] text-dark-900">{c.company_name || '—'}</div>
                            {c.insured_name && c.insured_name !== c.company_name && (
                              <div className="text-[11px] text-gray-400 mt-0.5">{c.insured_name}</div>
                            )}
                          </td>
                          <td>
                            <span className="text-[11.5px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-200">
                              {c.policy_number}
                            </span>
                          </td>
                          <td className="text-[12px] text-gray-500">
                            {c.date_of_loss ? new Date(c.date_of_loss).toLocaleDateString('en-GB') : '—'}
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-accent-400 flex items-center justify-center text-white text-[9.5px] font-bold flex-shrink-0">
                                {(c.assigned_handler || 'H').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[12px] text-gray-600">{c.assigned_handler || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td><span className={`status-pill ${PILL_MAP[c.status] || 'pending'}`}>{c.status}</span></td>
                          <td onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/claims/${c.claim_id}`)}
                              className="px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-blue-50 border border-blue-100 text-primary-600 hover:bg-primary-600 hover:text-white transition-all"
                            >
                              Open →
                            </button>
                          </td>
                        </motion.tr>
                      ))
                  }
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-[11.5px] text-gray-400">{total} claims</span>
                <div className="flex gap-1">
                  {[
                    { label: '← Prev', fn: () => setPage(p => Math.max(1, p - 1)), dis: page === 1 },
                    { label: 'Next →', fn: () => setPage(p => Math.min(totalPages, p + 1)), dis: page === totalPages },
                  ].map(b => (
                    <button
                      key={b.label}
                      onClick={b.fn}
                      disabled={b.dis}
                      className="px-3 py-1 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity + AI card */}
          <div className="flex flex-col gap-4">

            {/* FNOL Priority Tasks */}
            {user?.role === 'fnol' && (
              <div className="bg-white rounded-2xl p-5 border border-amber-100/80 shadow-[0_2px_12px_rgba(251,146,60,0.08)] flex-none">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(251,146,60,0.4)]">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold text-gray-900">My Priority Tasks</div>
                    <div className="text-[11px] text-gray-500">Action items assigned to you</div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {myTasks.length === 0 ? (
                    <div className="text-[12.5px] text-gray-400 py-3 text-center">You have no pending tasks!</div>
                  ) : (
                    myTasks.map(task => (
                      <div key={task.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-amber-200 transition-colors group cursor-pointer" onClick={() => navigate(`/claims/${task.claim_id}`)}>
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[12px] font-bold text-gray-900 line-clamp-1">{task.description}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 border border-amber-200 uppercase">{task.status}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[11px] font-medium text-primary-600 mb-0.5">{task.claim_id} • {task.sub_claim_id}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-[180px]">{task.details}</div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center cursor-pointer group-hover:text-primary-600 group-hover:border-primary-300 transition-colors">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Live Activity */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-[0_2px_12px_rgba(3,68,140,0.05)] flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13.5px] font-semibold text-dark-900">Live Activity</div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />LIVE
                </span>
              </div>
              {[
                { text: 'New claim filed — CL-242 (Motor Fleet)', time: '2m ago', dot: '#3B82F6' },
                { text: 'AI fraud score updated SC-167 → 24%', time: '15m ago', dot: '#2CC9A2' },
                { text: 'Reserve £85k approved on CL-238', time: '1h ago', dot: '#10B981' },
                { text: 'Loss adjuster report uploaded SC-168', time: '2h ago', dot: '#8B5CF6' },
              ].map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex gap-2.5 py-2.5 ${i < 3 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: `${a.dot}14`, border: `1.5px solid ${a.dot}30` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: a.dot }} />
                  </div>
                  <div>
                    <div className="text-[12px] text-dark-900 leading-snug">{a.text}</div>
                    <div className="text-[10.5px] text-gray-400 mt-0.5">{a.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Summary card */}
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(44,201,162,0.2)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #071836 0%, #0A2248 100%)', border: '1px solid rgba(44,201,162,0.2)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'conic-gradient(from 0deg, #2CC9A2, #03448C, #2CC9A2)' }}
              />
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-accent-400/20 border border-accent-400/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-accent-400 tracking-wider mb-1.5">AI PORTFOLIO SUMMARY</div>
                  <p className="text-[12px] text-white/60 leading-relaxed">
                    3 claims flagged for expedited review. Motor Fleet BI frequency is elevated +22% — reserve strengthening recommended.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
