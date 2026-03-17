import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, Eye, TrendingUp, Clock, AlertTriangle,
    DollarSign, Shield, ChevronRight, BarChart2, Loader2, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { managerApi } from '../../services/api';

const COLORS = ['#03448C', '#2CC9A2', '#24C0E5', '#F59E0B'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

function StatCard({ label, value, icon: Icon, color, sub }) {
    return (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-[0_2px_20px_rgba(3,68,140,0.07)] border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div className="min-w-0">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const map = {
        'Pending Manager Approval': { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Approval' },
        'Approved': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved' },
        'Declined': { cls: 'bg-red-50 text-red-700 border-red-200', label: 'Declined' },
    };
    const s = map[status] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: status };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.cls}`}>
            {s.label}
        </span>
    );
}

function ApprovalModal({ item, onApprove, onDecline, onClose }) {
    const [notes, setNotes] = useState('');
    const [actioning, setActioning] = useState(null);

    const handle = async (type) => {
        setActioning(type);
        try {
            if (type === 'approve') await onApprove(item.id, notes);
            else await onDecline(item.id, notes);
            onClose();
        } finally {
            setActioning(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">Payment Approval Required</h2>
                        <p className="text-xs text-gray-500">Authority limit exceeded — Manager sign-off needed</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Settlement ID</span>
                        <span className="font-semibold text-gray-800">{item.settlement_id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Claim ID</span>
                        <span className="font-semibold text-gray-800">{item.claim_id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Policyholder</span>
                        <span className="font-semibold text-gray-800">{item.policy_holder}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Handler</span>
                        <span className="font-semibold text-gray-800">{item.handler || '—'}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2.5 mt-2.5">
                        <span className="text-gray-500">Payment Amount</span>
                        <span className="font-bold text-gray-900">£{item.payment_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Deductible Applied</span>
                        <span className="font-semibold text-gray-800">-£{item.deductible_applied?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Net Payable</span>
                        <span className="font-bold text-primary-600 text-base">£{item.net_payment?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Authority Limit</span>
                        <span className="font-semibold text-red-600">£{item.authority_limit?.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Add approval/decline notes..."
                        className="w-full input-field text-sm resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handle('decline')}
                        disabled={!!actioning}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors"
                    >
                        {actioning === 'decline' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Decline
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handle('approve')}
                        disabled={!!actioning}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm shadow-[0_4px_16px_rgba(3,68,140,0.3)]"
                    >
                        {actioning === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve Payment
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function ManagerDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [toast, setToast] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await managerApi.dashboard();
            setData(d);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = async (id, notes) => {
        await managerApi.approve(id, { approved_by: 'Claims Manager', notes });
        showToast('Payment approved successfully');
        load();
    };

    const handleDecline = async (id, notes) => {
        await managerApi.decline(id, { approved_by: 'Claims Manager', notes });
        showToast('Payment declined', 'error');
        load();
    };

    const stats = data?.stats || {};
    const pending = data?.pending_approvals || [];
    const claimTypeData = data?.chart_claim_type || [];
    const trendData = data?.chart_approval_trend || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader2 className="w-10 h-10 text-primary-500 mx-auto" />
                    </motion.div>
                    <p className="text-gray-400 mt-4 text-sm">Loading manager dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#F4F6FA]">
            {/* Header Banner */}
            <div
                className="px-8 pt-8 pb-7"
                style={{ background: 'linear-gradient(145deg, #022D5E 0%, #03448C 45%, #0558B0 70%, #065FC4 100%)' }}
            >
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-5 h-5 text-accent-400" />
                                <span className="text-accent-400 text-xs font-semibold tracking-widest uppercase">Claim Manager</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Approval Dashboard</h1>
                            <p className="text-white/50 text-sm mt-0.5">Review and action payments that exceed authority limits</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={load}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/70 text-sm hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <div className="px-7 py-6 space-y-6">
                {/* Stats Row */}
                <motion.div
                    variants={containerVariants} initial="hidden" animate="show"
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <StatCard label="Pending Approvals" value={stats.pending_approvals ?? 0} icon={Clock} color="#F59E0B" sub="Awaiting action" />
                    <StatCard label="Approved" value={stats.approved_count ?? 0} icon={CheckCircle} color="#10B981" sub="This period" />
                    <StatCard label="Declined" value={stats.declined_count ?? 0} icon={XCircle} color="#EF4444" sub="This period" />
                    <StatCard
                        label="Total Approved"
                        value={`£${((stats.total_approved_amount ?? 0) / 1000).toFixed(0)}k`}
                        icon={DollarSign}
                        color="#03448C"
                        sub="Payments processed"
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Approvals Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_20px_rgba(3,68,140,0.07)] border border-gray-100 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-gray-900 text-base">Pending Approvals</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Payments exceeding £100,000 authority limit</p>
                            </div>
                            {pending.length > 0 && (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                    {pending.length} pending
                                </span>
                            )}
                        </div>

                        {pending.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                                </div>
                                <p className="font-semibold text-gray-700">All clear!</p>
                                <p className="text-sm text-gray-400 mt-1">No pending approvals at this time.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {['Settlement', 'Claim', 'Policyholder', 'Handler', 'Net Payable', 'Status', ''].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {pending.map((item, i) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors"
                                                >
                                                    <td className="px-4 py-3 font-semibold text-primary-600">{item.settlement_id}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-700">{item.claim_id}</td>
                                                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{item.policy_holder}</td>
                                                    <td className="px-4 py-3 text-gray-500">{item.handler || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-gray-900">£{item.net_payment?.toLocaleString()}</span>
                                                        <div className="text-[10px] text-red-500 mt-0.5">Limit: £{item.authority_limit?.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                                    <td className="px-4 py-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                            onClick={() => setSelectedItem(item)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-semibold hover:bg-primary-100 transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> Review
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Charts Column */}
                    <div className="space-y-5">
                        {/* Claim Type Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(3,68,140,0.07)] border border-gray-100 p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart2 className="w-4 h-4 text-primary-500" />
                                <h3 className="font-semibold text-gray-800 text-sm">Claim Type Distribution</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={claimTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                                        {claimTypeData.map((e, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-2 mt-2">
                                {claimTypeData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Approval Time Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(3,68,140,0.07)] border border-gray-100 p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-accent-500" />
                                <h3 className="font-semibold text-gray-800 text-sm">Avg Approval Time (days)</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={130}>
                                <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="avg_days" stroke="#2CC9A2" strokeWidth={2} dot={{ r: 3, fill: '#2CC9A2' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <ApprovalModal
                        item={selectedItem}
                        onApprove={handleApprove}
                        onDecline={handleDecline}
                        onClose={() => setSelectedItem(null)}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl z-[400] text-white text-sm font-medium
              ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}
                    >
                        {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
