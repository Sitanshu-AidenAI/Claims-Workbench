import { useState } from 'react';
import { subClaimsApi } from '../../../services/api';

export default function SubClaimListTab({ claimId, claim, subClaims, onSubClaimsChange, onNavigate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSC, setNewSC] = useState({ coverage_name: '', sub_claim_type: '', damage_description: '', claimant_name: '' });
  const [saving, setSaving] = useState(false);

  async function createSubClaim() {
    setSaving(true);
    try {
      const sc = await subClaimsApi.create({ ...newSC, claim_id: claim.id || 1 });
      onSubClaimsChange([...subClaims, sc]);
      setShowAdd(false);
      setNewSC({ coverage_name: '', sub_claim_type: '', damage_description: '', claimant_name: '' });
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSC(scId) {
    if (!window.confirm('Delete this sub-claim?')) return;
    try {
      await subClaimsApi.delete(scId);
      onSubClaimsChange(subClaims.filter(s => s.sub_claim_id !== scId));
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  const typeColors = {
    'PP Vehicle': 'bg-blue-50 text-blue-700',
    'Bodily Injury': 'bg-purple-50 text-purple-700',
    'default': 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sub Claims</h2>
          <p className="text-sm text-gray-500">Detailed information regarding each sub-claim associated with the main claim, including descriptions and statuses.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-active-class w-40 text-sm">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          ADD SUB CLAIM
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b bg-gray-50">
              {['Sub Claim ID', 'Coverage Name', 'Type', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subClaims.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No sub-claims yet.</td></tr>
            ) : (
              subClaims.map(sc => (
                <tr key={sc.sub_claim_id} className="border-b last:border-0 hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3">
                    <button onClick={() => onNavigate(sc.sub_claim_id)} className="text-blue-600 font-medium hover:underline">
                      {sc.sub_claim_id}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{sc.coverage_name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${typeColors[sc.sub_claim_type] || typeColors.default}`}>
                      {sc.sub_claim_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="status-pill completed">{sc.status}</span>
                  </td>
                  <td className="px-5 py-3 flex items-center gap-3">
                    <button onClick={() => onNavigate(sc.sub_claim_id)} className="text-xs text-blue-500 hover:underline font-medium">EDIT</button>
                    <button onClick={() => deleteSC(sc.sub_claim_id)} className="text-xs text-red-400 hover:text-red-600 font-medium">DELETE</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[520px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Sub-Claim</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Coverage Name</label>
                  <input value={newSC.coverage_name} onChange={e => setNewSC(s => ({ ...s, coverage_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sub Claim Type</label>
                  <select value={newSC.sub_claim_type} onChange={e => setNewSC(s => ({ ...s, sub_claim_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Select type…</option>
                    <option>PP Vehicle</option>
                    <option>Bodily Injury</option>
                    <option>Third Party Liability</option>
                    <option>Medical Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Claimant Name</label>
                <input value={newSC.claimant_name} onChange={e => setNewSC(s => ({ ...s, claimant_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Damage Description</label>
                <textarea value={newSC.damage_description} onChange={e => setNewSC(s => ({ ...s, damage_description: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={createSubClaim} disabled={saving}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-40">
                {saving ? 'Creating…' : 'Create Sub-Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
