import { useState } from 'react';
import { subClaimsApi } from '../../../services/api';

export default function SubClaimInfoTab({ sc, claim, onUpdate }) {
  const [form, setForm] = useState({
    coverage_name: sc.coverage_name || '',
    sub_claim_type: sc.sub_claim_type || '',
    damage_description: sc.damage_description || '',
    claim_owner: sc.claim_owner || '',
    claimant_name: sc.claimant_name || '',
    claimant_gender: sc.claimant_gender || '',
    claimant_dob: sc.claimant_dob || '',
    claimant_contact: sc.claimant_contact || '',
    part_of_body: sc.part_of_body || '',
    cause_of_injury: sc.cause_of_injury || '',
    nature_of_injury: sc.nature_of_injury || '',
    injury_key: sc.injury_key || '',
  });
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    try {
      const updated = await subClaimsApi.update(sc.sub_claim_id, form);
      onUpdate(updated);
    } catch (e) {
      alert('Save error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const isBodyInjury = form.sub_claim_type?.toLowerCase().includes('bodily') || form.sub_claim_type?.toLowerCase().includes('injury');

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sub Claims Information</h2>
          <p className="text-sm text-gray-500">List of actionable tasks associated with each sub-claim, including deadlines and responsible parties to ensure timely processing and resolution.</p>
        </div>
        <button onClick={() => setShowSummary(true)} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/></svg>
          View Summary
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sub Claim ID <span className="text-red-500">*</span></label>
            <input value={sc.sub_claim_id} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Coverage Name</label>
            <input value={form.coverage_name} onChange={e => update('coverage_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sub Claim Type</label>
            <input value={form.sub_claim_type} onChange={e => update('sub_claim_type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Damage Description</label>
          <textarea value={form.damage_description} onChange={e => update('damage_description', e.target.value)}
            rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Claim Owner</label>
            <input value={form.claim_owner} onChange={e => update('claim_owner', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Claimant Name</label>
            <input value={form.claimant_name} onChange={e => update('claimant_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Gender</label>
            <input value={form.claimant_gender} onChange={e => update('claimant_gender', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">DOB</label>
            <input value={form.claimant_dob} onChange={e => update('claimant_dob', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
            <input value={form.claimant_contact} onChange={e => update('claimant_contact', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Body Injury section */}
      {isBodyInjury && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Body Injury Information</h3>
          <div className="flex gap-6 items-start">
            {/* Body diagram placeholder */}
            <div className="w-32 h-48 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 relative">
              <svg width="60" height="120" viewBox="0 0 60 120" fill="none" className="text-gray-300">
                <circle cx="30" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="30" y1="22" x2="30" y2="70" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="30" y1="35" x2="8" y2="55" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="30" y1="35" x2="52" y2="55" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="30" y1="70" x2="15" y2="110" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="30" y1="70" x2="45" y2="110" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {/* Injury marker */}
              {form.part_of_body === 'Left Arm' && (
                <div className="absolute top-[40%] left-[15%] w-4 h-4 rounded-full bg-red-500 opacity-80" />
              )}
            </div>

            <div className="flex-1 space-y-3 text-sm">
              {[
                { label: 'Part of Body', key: 'part_of_body', value: form.part_of_body },
                { label: 'Cause of Injury', key: 'cause_of_injury', value: form.cause_of_injury },
                { label: 'Nature of Injury', key: 'nature_of_injury', value: form.nature_of_injury },
                { label: 'Key', key: 'injury_key', value: form.injury_key },
              ].map(field => (
                <div key={field.key} className="flex items-start justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 flex-shrink-0 w-36">{field.label}</span>
                  <input value={field.value} onChange={e => update(field.key, e.target.value)}
                    className="flex-1 text-right border-0 bg-transparent text-blue-500 text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black/20 flex items-start justify-end z-50 p-6" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-xl shadow-xl w-72 p-5" onClick={e => e.stopPropagation()}>
            <div className="font-semibold text-sm mb-3">Sub Claim Summary</div>
            <div className="space-y-2 text-xs text-gray-600">
              <p><span className="font-medium">ID:</span> {sc.sub_claim_id}</p>
              <p><span className="font-medium">Type:</span> {sc.sub_claim_type}</p>
              <p><span className="font-medium">Coverage:</span> {sc.coverage_name}</p>
              <p><span className="font-medium">Claimant:</span> {sc.claimant_name}</p>
              <p><span className="font-medium">Status:</span> {sc.status}</p>
              <p><span className="font-medium">Loss Estimate:</span> £{sc.loss_estimate?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
