import { useState, useEffect } from 'react';
import { subClaimsApi } from '../../../services/api';
import GenAIInsightButton from '../../../components/GenAIInsightButton';

export default function LegalTab({ sc, subTab, aiContext }) {
  return (
    <div className="max-w-3xl">
      {subTab === 'Litigation' && <LitigationSection sc={sc} />}
      {subTab === 'Subrogation' && <SubrogationSection sc={sc} />}
      {subTab === 'SIU' && <SIUSection sc={sc} />}
    </div>
  );
}

function LitigationSection({ sc }) {
  const [data, setData] = useState(null);
  const [locked, setLocked] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    subClaimsApi.getLitigation(sc.sub_claim_id).then(d => { setData(d); setLocked(d.is_locked); }).catch(() => { });
  }, [sc.sub_claim_id]);

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await subClaimsApi.updateLitigation(sc.sub_claim_id, data);
    } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
  }

  function update(k, v) { setData(d => ({ ...d, [k]: v })); }

  const fields = [
    { label: 'Litigation ID', key: 'litigation_id' },
    { label: 'Complainant', key: 'complainant' },
    { label: 'Jurisdiction', key: 'jurisdiction' },
    { label: 'Date of Complainant', key: 'date_of_complainant' },
    { label: 'Date Complaint Received', key: 'date_complaint_received' },
    { label: 'Total Complaint Received', key: 'total_complaint_received' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Litigation</h2>
          <p className="text-sm text-gray-500">Information regarding any legal proceedings related to the claim, including current status and involved parties.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setLocked(false); update('is_locked', false); }}
            className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50">
            LITIGATION SPECIALIST
          </button>
          <GenAIInsightButton context="Litigation" />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="text-xs font-semibold text-gray-500 flex items-center justify-between">
          General
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
              <input
                value={data?.[f.key] || ''}
                onChange={e => update(f.key, e.target.value)}
                readOnly={locked}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${locked ? 'border-gray-100 bg-gray-50 text-gray-400' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description of Complaint</label>
          <textarea value={data?.description_of_complaint || ''} onChange={e => update('description_of_complaint', e.target.value)}
            readOnly={locked} rows={3}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${locked ? 'border-gray-100 bg-gray-50 text-gray-400' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`} />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">Legal Actions</div>
          <textarea value={data?.legal_actions || ''} onChange={e => update('legal_actions', e.target.value)}
            readOnly={locked} rows={2}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${locked ? 'border-gray-100 bg-gray-50 text-gray-400' : 'border-gray-200 focus:ring-2 focus:ring-blue-400'}`} />
        </div>
      </div>

      {!locked && (
        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

function SubrogationSection({ sc }) {
  const [locked, setLocked] = useState(true);
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    subClaimsApi.getStakeholders(sc.sub_claim_id, 'Subrogation').then(setParties).catch(() => { });
  }, [sc.sub_claim_id]);

  const filtered = parties.filter(p => !search || p.party_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Subrogation</h2>
          <p className="text-sm text-gray-500">Details on recovery efforts from third parties responsible for the loss, including status updates.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLocked(false)} className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50">
            SUBROGATION SPECIALIST
          </button>
          <GenAIInsightButton context="Subrogation" />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="font-medium text-sm text-gray-700">Recovery From</div>
        <div className="flex">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…" className="flex-1 border border-gray-200 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button className="px-3 border border-l-0 border-gray-200 rounded-r-lg bg-gray-50">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 border-b">
            {['Party Name', 'Party Role', 'Party Type', 'Assigned To', 'Third Party Category'].map(h => <th key={h} className="pb-2">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.party_name}</td>
                <td className="py-2 text-gray-500">{p.party_role}</td>
                <td className="py-2 text-gray-500">{p.party_type}</td>
                <td className="py-2 text-xs text-gray-500 truncate max-w-[120px]">{p.assigned_to}</td>
                <td className="py-2 text-xs text-gray-400">{p.third_party_code}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-400 text-xs">No parties found.</td></tr>}
          </tbody>
        </table>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Total Subrogation Amount</label>
          <input value="£" readOnly={locked} className="w-32 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function SIUSection({ sc }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    subClaimsApi.getSIU(sc.sub_claim_id).then(setData).catch(() => { });
  }, [sc.sub_claim_id]);

  function update(k, v) { setData(d => ({ ...d, [k]: v })); }

  async function flagForSIU() {
    setSaving(true);
    try {
      const updated = await subClaimsApi.updateSIU(sc.sub_claim_id, { ...data, siu_status: 'Flagged' });
      setData(updated);
    } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">SIU</h2>
          <p className="text-sm text-gray-500">Refer the sub-claim for special investigation if fraud is suspected.</p>
        </div>
        <GenAIInsightButton context="SIU" />
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">SIU Status</label>
            <input value={data?.siu_status || ''} onChange={e => update('siu_status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Investigator Assigned</label>
            <input value={data?.investigator_assigned || ''} onChange={e => update('investigator_assigned', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Investigator Start Date</label>
            <input value={data?.investigator_start_date || ''} onChange={e => update('investigator_start_date', e.target.value)}
              type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Reason For SIU Involvement</label>
            <textarea value={data?.reason_for_involvement || ''} onChange={e => update('reason_for_involvement', e.target.value)}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea value={data?.notes || ''} onChange={e => update('notes', e.target.value)}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-between">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm">CANCEL</button>
          {data?.siu_status === 'Flagged' && (
            <button onClick={flagForSIU} disabled={saving}
              className="px-5 py-2 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-60">
              {saving ? '…' : 'FLAG FOR SIU'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
