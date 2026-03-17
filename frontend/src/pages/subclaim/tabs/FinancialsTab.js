import { useState, useEffect } from 'react';
import { subClaimsApi } from '../../../services/api';
import GenAIInsightButton from '../../../components/GenAIInsightButton';

const AUTHORITY_LIMIT = 100000;

// ─── Manage Deductibles ───────────────────────────────────────────────────────
function ManageDeductibles({ sc }) {
  const [deductibles, setDeductibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ deductible_type: '', amount: '', currency: 'GBP', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    subClaimsApi.getDeductibles(sc.sub_claim_id)
      .then(setDeductibles)
      .catch(() => setDeductibles([]))
      .finally(() => setLoading(false));
  }, [sc.sub_claim_id]);

  async function handleAdd() {
    if (!form.deductible_type || !form.amount) return;
    setSaving(true);
    try {
      const d = await subClaimsApi.addDeductible(sc.sub_claim_id, { ...form, amount: parseFloat(form.amount) });
      setDeductibles(prev => [...prev, d]);
      setForm({ deductible_type: '', amount: '', currency: 'GBP', description: '' });
      setShowAdd(false);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const total = deductibles.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Manage Deductibles</h3>
          <p className="text-xs text-gray-500 mt-0.5">Policy deductibles applied to this sub-claim before settlement.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-add-class text-sm gap-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ADD DEDUCTIBLE
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b bg-gray-50">
                {['Type', 'Amount', 'Currency', 'Description'].map(h => (
                  <th key={h} className="px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deductibles.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">No deductibles recorded.</td></tr>
              ) : (
                deductibles.map((d, i) => (
                  <tr key={d.deductible_id || i} className="border-b last:border-0 hover:bg-blue-50/20">
                    <td className="px-5 py-3 font-medium text-gray-800">{d.deductible_type}</td>
                    <td className="px-5 py-3 text-gray-700">£{Number(d.amount).toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{d.currency || 'GBP'}</td>
                    <td className="px-5 py-3 text-gray-500">{d.description || '—'}</td>
                  </tr>
                ))
              )}
              {deductibles.length > 0 && (
                <tr className="bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-800">Total</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">£{total.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Add Deductible</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Deductible Type <span className="text-red-500">*</span></label>
                  <select value={form.deductible_type} onChange={e => setForm(f => ({ ...f, deductible_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Select…</option>
                    <option>Standard Deductible</option>
                    <option>Compulsory Excess</option>
                    <option>Voluntary Excess</option>
                    <option>Age-Related Excess</option>
                    <option>Windscreen Excess</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option>GBP</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">£</span>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.deductible_type || !form.amount}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-40">
                {saving ? 'Saving…' : 'Add Deductible'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Manage Reserve ───────────────────────────────────────────────────────────
function ManageReserve({ sc }) {
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ reserve_type: '', initial_amount: '', currency: 'GBP', notes: '' });
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    subClaimsApi.getReserves(sc.sub_claim_id)
      .then(setReserves)
      .catch(() => setReserves([]))
      .finally(() => setLoading(false));
  }, [sc.sub_claim_id]);

  async function handleAdd() {
    if (!form.reserve_type || !form.initial_amount) return;
    setSaving(true);
    try {
      const r = await subClaimsApi.addReserve(sc.sub_claim_id, { ...form, initial_amount: parseFloat(form.initial_amount) });
      setReserves(prev => [...prev, r]);
      setForm({ reserve_type: '', initial_amount: '', currency: 'GBP', notes: '' });
      setShowAdd(false);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(reserveId) {
    setApproving(reserveId);
    try {
      const updated = await subClaimsApi.approveReserve(reserveId);
      setReserves(prev => prev.map(r => r.reserve_id === reserveId ? updated : r));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setApproving(null);
    }
  }

  const statusColor = {
    Approved: 'completed',
    Pending: 'new',
    Rejected: 'high',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Manage Reserve</h3>
          <p className="text-xs text-gray-500 mt-0.5">Set and approve financial reserves. Reinsurance splits are calculated automatically.</p>
        </div>
        <div className="flex gap-2">
          <GenAIInsightButton context="Reserve" />
          <button onClick={() => setShowAdd(true)} className="btn-add-class text-sm gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            ADD RESERVE
          </button>
        </div>
      </div>

      {reserves.some(r => r.initial_amount > AUTHORITY_LIMIT && r.status !== 'Approved') && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <span><strong>Authority Limit Alert:</strong> One or more reserves exceed £100,000 and require Manager Approval before they can be settled.</span>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b bg-gray-50">
                {['Reserve Type', 'Amount', 'Currency', 'Status', 'Reinsurance Split', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reserves.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No reserves added yet.</td></tr>
              ) : (
                reserves.map((r, i) => (
                  <tr key={r.reserve_id || i} className="border-b last:border-0 hover:bg-blue-50/20">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.reserve_type}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className={r.initial_amount > AUTHORITY_LIMIT ? 'text-amber-600 font-semibold' : ''}>
                        £{Number(r.initial_amount).toLocaleString()}
                      </span>
                      {r.initial_amount > AUTHORITY_LIMIT && (
                        <span className="ml-1 text-xs text-amber-500">⚠</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.currency || 'GBP'}</td>
                    <td className="px-4 py-3">
                      <span className={`status-pill ${statusColor[r.status] || 'new'}`}>{r.status || 'Pending'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.splits && r.splits.length > 0 ? (
                        <div className="space-y-0.5">
                          {r.splits.map((s, j) => (
                            <div key={j} className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="w-20 truncate font-medium text-gray-700">{s.reinsurer_name}</span>
                              <span className="text-gray-300">|</span>
                              <span>{s.percentage}%</span>
                              <span className="text-gray-300">|</span>
                              <span>£{Number(s.amount).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.status !== 'Approved' && (
                        <button
                          onClick={() => handleApprove(r.reserve_id)}
                          disabled={approving === r.reserve_id}
                          className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 disabled:opacity-40 font-medium"
                        >
                          {approving === r.reserve_id ? 'Approving…' : 'APPROVE'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Add Reserve</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reserve Type <span className="text-red-500">*</span></label>
                  <select value={form.reserve_type} onChange={e => setForm(f => ({ ...f, reserve_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Select…</option>
                    <option>Indemnity Reserve</option>
                    <option>Expense Reserve</option>
                    <option>Medical Reserve</option>
                    <option>Legal Reserve</option>
                    <option>IBNR Reserve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option>GBP</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reserve Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">£</span>
                  <input type="number" value={form.initial_amount} onChange={e => setForm(f => ({ ...f, initial_amount: e.target.value }))}
                    placeholder="0.00" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                {form.initial_amount && parseFloat(form.initial_amount) > AUTHORITY_LIMIT && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Amount exceeds £100,000 authority limit — Manager Approval will be required.</p>
                )}
                {form.initial_amount && parseFloat(form.initial_amount) > 0 && (
                  <div className="mt-2 p-2.5 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">Reinsurance Split Preview</p>
                    <div className="grid grid-cols-3 gap-1 text-xs text-blue-600">
                      <span>Our Share (50%): £{(parseFloat(form.initial_amount) * 0.5).toLocaleString()}</span>
                      <span>Munich Re (30%): £{(parseFloat(form.initial_amount) * 0.3).toLocaleString()}</span>
                      <span>Berkshire (20%): £{(parseFloat(form.initial_amount) * 0.2).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.reserve_type || !form.initial_amount}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-40">
                {saving ? 'Creating…' : 'Create Reserve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settlement ───────────────────────────────────────────────────────────────
function Settlement({ sc }) {
  const [reserves, setReserves] = useState([]);
  const [deductibles, setDeductibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ reserve_id: '', gross_amount: '', payment_method: 'Bank Transfer', payee_name: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [settlement, setSettlement] = useState(null);

  useEffect(() => {
    Promise.all([
      subClaimsApi.getReserves(sc.sub_claim_id),
      subClaimsApi.getDeductibles(sc.sub_claim_id),
    ]).then(([r, d]) => { setReserves(r); setDeductibles(d); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [sc.sub_claim_id]);

  const totalDeductible = deductibles.reduce((s, d) => s + (d.amount || 0), 0);
  const gross = parseFloat(form.gross_amount) || 0;
  const net = Math.max(0, gross - totalDeductible);
  const requiresApproval = net > AUTHORITY_LIMIT;

  const selectedReserve = reserves.find(r => String(r.reserve_id) === String(form.reserve_id));

  async function handleSubmit() {
    if (!form.reserve_id || !form.gross_amount || !form.payee_name) return;
    setSubmitting(true);
    try {
      const result = await subClaimsApi.createSettlement(sc.sub_claim_id, {
        reserve_id: parseInt(form.reserve_id),
        gross_amount: gross,
        deductible_amount: totalDeductible,
        net_amount: net,
        payment_method: form.payment_method,
        payee_name: form.payee_name,
        notes: form.notes,
      });
      setSettlement(result);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (settlement) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Settlement</h3>
        <div className="card p-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${settlement.requires_approval ? 'bg-amber-100' : 'bg-green-100'}`}>
            {settlement.requires_approval ? (
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" /></svg>
            ) : (
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </div>
          <h4 className="text-center font-semibold text-gray-900 mb-1">
            {settlement.requires_approval ? 'Pending Manager Approval' : 'Settlement Submitted'}
          </h4>
          <p className="text-center text-xs text-gray-500 mb-4">
            {settlement.requires_approval
              ? 'Net payment exceeds £100,000. A notification has been sent to the Claims Manager for approval.'
              : 'Settlement has been recorded and is being processed.'}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-gray-400 block">Gross Amount</span><span className="font-semibold">£{Number(settlement.gross_amount).toLocaleString()}</span></div>
            <div><span className="text-xs text-gray-400 block">Deductible</span><span className="font-semibold text-red-500">-£{Number(settlement.deductible_amount).toLocaleString()}</span></div>
            <div><span className="text-xs text-gray-400 block">Net Payment</span><span className={`font-bold text-lg ${settlement.requires_approval ? 'text-amber-600' : 'text-green-600'}`}>£{Number(settlement.net_amount).toLocaleString()}</span></div>
            <div><span className="text-xs text-gray-400 block">Status</span><span className={`status-pill ${settlement.requires_approval ? 'high' : 'completed'}`}>{settlement.status}</span></div>
          </div>
          <button onClick={() => setSettlement(null)} className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600">
            ← Create another settlement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Settlement</h3>
          <p className="text-xs text-gray-500 mt-0.5">Calculate net payment after deductibles. Settlements above £100,000 require Manager Approval.</p>
        </div>
        <GenAIInsightButton context="Settlement" />
      </div>

      {loading ? (
        <div className="card px-5 py-8 text-center text-sm text-gray-400">Loading reserves…</div>
      ) : reserves.length === 0 ? (
        <div className="card p-6 text-center text-sm text-gray-400">
          No approved reserves found. Please add and approve a reserve before creating a settlement.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Left: Form */}
          <div className="col-span-2 card p-5 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Reserve <span className="text-red-500">*</span></label>
              <select value={form.reserve_id} onChange={e => {
                const r = reserves.find(r => String(r.reserve_id) === e.target.value);
                setForm(f => ({ ...f, reserve_id: e.target.value, gross_amount: r ? String(r.initial_amount) : '' }));
              }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Choose a reserve…</option>
                {reserves.map(r => (
                  <option key={r.reserve_id} value={r.reserve_id}>
                    {r.reserve_type} — £{Number(r.initial_amount).toLocaleString()} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Gross Payment Amount <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 text-sm">£</span>
                <input type="number" value={form.gross_amount}
                  onChange={e => setForm(f => ({ ...f, gross_amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {selectedReserve && gross > selectedReserve.initial_amount && (
                <p className="text-xs text-red-500 mt-1">Amount exceeds the selected reserve value.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>BACS</option>
                  <option>CHAPS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payee Name <span className="text-red-500">*</span></label>
                <input value={form.payee_name} onChange={e => setForm(f => ({ ...f, payee_name: e.target.value }))}
                  placeholder="Enter payee name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* Right: Summary */}
          <div className="card p-5 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Amount</span>
                <span className="font-medium">£{gross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Deductible</span>
                <span>-£{totalDeductible.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span className="text-gray-700">Net Payment</span>
                <span className={requiresApproval ? 'text-amber-600' : 'text-green-600'}>£{net.toLocaleString()}</span>
              </div>
            </div>

            {requiresApproval && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <div className="font-semibold mb-0.5">Manager Approval Required</div>
                Net payment exceeds the £100,000 authority limit. This will be sent to the Claims Manager.
              </div>
            )}

            {deductibles.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-400 mb-1.5">Applied Deductibles</p>
                {deductibles.map((d, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                    <span>{d.deductible_type}</span>
                    <span>£{Number(d.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !form.reserve_id || !form.gross_amount || !form.payee_name}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition ${requiresApproval
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-accent-teal hover:opacity-90'
                }`}
            >
              {submitting ? 'Processing…' : requiresApproval ? 'SUBMIT FOR APPROVAL' : 'SUBMIT SETTLEMENT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main FinancialsTab ───────────────────────────────────────────────────────
const SUB_TABS = ['Manage Deductibles', 'Manage Reserve', 'Settlement'];

export default function FinancialsTab({ sc, claim, subTab }) {
  const [activeSubTab, setActiveSubTab] = useState(subTab || 'Manage Deductibles');

  useEffect(() => {
    if (subTab) setActiveSubTab(subTab);
  }, [subTab]);

  return (
    <div className="space-y-4">
      {/* Sub-tab nav */}
      <div className="flex gap-1 border-b border-gray-200">
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeSubTab === tab
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === 'Manage Deductibles' && <ManageDeductibles sc={sc} />}
      {activeSubTab === 'Manage Reserve' && <ManageReserve sc={sc} />}
      {activeSubTab === 'Settlement' && <Settlement sc={sc} />}
    </div>
  );
}
