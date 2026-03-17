import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsApi } from '../services/api';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus } from 'lucide-react';

const STATUS_FILTERS = ['All', 'New', 'In Progress', 'Completed', 'Denied'];

export default function ClaimsRegistry() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        claimsApi.list({
            page,
            page_size: 15,
            search: search || undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined
        })
            .then(d => { setClaims(d.items || []); setTotal(d.total || 0); setTotalPages(d.total_pages || 1); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [page, search, statusFilter]);

    const PILL_MAP = { New: 'new', 'In Progress': 'in-progress', Completed: 'completed', Denied: 'denied' };

    return (
        <div className="min-h-full bg-[#F4F6FA] flex flex-col">
            {/* ── Header Area ── */}
            <div className="bg-white border-b border-gray-100 flex-shrink-0">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Claims Registry</h1>
                            <p className="text-[13.5px] text-gray-500 mt-1">Comprehensive directory of all submitted and active claims.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                            <button
                                onClick={() => navigate('/claims/new')}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> New Claim
                            </button>
                        </div>
                    </div>

                    {/* ── Toolbar (Search & Filters) ── */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {STATUS_FILTERS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); setPage(1); }}
                                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${statusFilter === s
                                            ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search claims, insured..."
                                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                />
                            </div>
                            <button className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm bg-white">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content (Table) ── */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(3,68,140,0.04)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1 h-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Claim ID</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Insured / Company</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Policy Details</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Date of Loss</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Assigned Handler</th>
                                    <th className="px-6 py-4 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 right-0 bg-gray-50/90 z-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i}>
                                            {[100, 160, 110, 90, 140, 80, 50].map((w, j) => (
                                                <td key={j} className="px-6 py-4"><div className="skeleton h-4 rounded" style={{ width: w }} /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : claims.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="w-8 h-8 text-gray-300 mb-3" />
                                                <p className="text-sm font-medium text-gray-900">No claims found.</p>
                                                <p className="text-sm text-gray-500 mt-1 mb-4">Try adjusting your filters or search query.</p>
                                                <button
                                                    onClick={() => { setSearch(''); setStatusFilter('All'); }}
                                                    className="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    claims.map((c, i) => (
                                        <motion.tr
                                            key={c.claim_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => navigate(`/claims/${c.claim_id}`)}
                                            className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-primary-600 text-[13.5px]">{c.claim_id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-[13px] text-gray-900">{c.company_name || '—'}</div>
                                                {c.insured_name && c.insured_name !== c.company_name && (
                                                    <div className="text-[11.5px] text-gray-500 mt-0.5">{c.insured_name}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                    {c.policy_number}
                                                </span>
                                                <div className="text-[11px] text-gray-400 mt-1 capitalize">{c.type_of_incident?.toLowerCase() || 'Standard'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-gray-600">
                                                {c.date_of_loss ? new Date(c.date_of_loss).toLocaleDateString('en-GB') : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                                                        {(c.assigned_handler || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-[12px] text-gray-700">{c.assigned_handler || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`status-pill ${PILL_MAP[c.status] || 'pending'}`}>{c.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm">
                                                    View
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <span className="text-[13px] text-gray-500">
                                Showing <span className="font-medium text-gray-900">{(page - 1) * 15 + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * 15, total)}</span> of <span className="font-medium text-gray-900">{total}</span> claims
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
