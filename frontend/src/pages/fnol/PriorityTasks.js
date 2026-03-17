import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, Filter } from 'lucide-react';

export default function PriorityTasks() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.role === 'fnol') {
            setLoading(true);
            claimsApi.myTasks(user.email)
                .then(setTasks)
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const filteredTasks = tasks.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.claim_id?.toString().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-full bg-[#F4F6FA] flex flex-col">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 flex-shrink-0">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(251,146,60,0.4)]">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Priority Tasks</h1>
                                <p className="text-[13.5px] text-gray-500 mt-1">Manage and resolve action items assigned directly to you.</p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="px-4 py-1.5 rounded-full text-[13px] font-medium bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                                {filteredTasks.length} Pending Actions
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search tasks..."
                                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                                />
                            </div>
                            <button className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm bg-white">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content (Table) */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(3,68,140,0.04)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1 h-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Related Claim</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Task Description</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Urgency</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 right-0 bg-gray-50/90 z-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {[100, 200, 300, 80, 80, 50].map((w, j) => (
                                                <td key={j} className="px-6 py-4"><div className="skeleton h-4 rounded" style={{ width: w }} /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <AlertTriangle className="w-8 h-8 text-gray-300 mb-3" />
                                                <p className="text-sm font-medium text-gray-900">No priority tasks found.</p>
                                                <p className="text-sm text-gray-500 mt-1 mb-4">You're all caught up!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map((t, i) => (
                                        <motion.tr
                                            key={t.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => navigate(`/claims/${t.claim_id}`)}
                                            className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-primary-600 text-[13.5px]">{t.claim_id}</span>
                                                <div className="text-[11px] text-gray-500 mt-1">SubClaim: {t.sub_claim_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-[13px] text-gray-900">{t.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[12px] text-gray-600 truncate max-w-xs">{t.details || '—'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[11px] font-bold ${t.urgency === 'High' ? 'bg-red-50 text-red-600 border border-red-200'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                    }`}>
                                                    {t.urgency}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-bold px-2 py-1 rounded text-amber-700 bg-amber-100 border border-amber-200 uppercase">
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-600 transition-all shadow-sm">
                                                    Resolve
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
