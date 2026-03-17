import { useState, useEffect } from 'react';
import { subClaimsApi } from '../../../services/api';
import GenAIInsightButton from '../../../components/GenAIInsightButton';

export default function StakeholderTab({ sc, subTab }) {
  return (
    <div className="max-w-3xl">
      {subTab === 'Salvage' && <SalvageSection sc={sc} aiContext="Salvage" />}
      {subTab === 'Ext Vehicle Manage' && <ExtVehicleSection sc={sc} aiContext="Vehicle Management" />}
      {subTab === 'Assign Vendor' && <AssignVendorSection sc={sc} aiContext="Vendor" />}
      {subTab === 'Loss Adjuster Report' && <LossAdjusterSection sc={sc} aiContext="Document" />}
      {subTab === 'Add Party' && <AddPartySection sc={sc} />}
      {subTab === 'Collaborate' && <CollaborateSection sc={sc} />}
    </div>
  );
}

function SectionHeader({ title, description, onSpecialist, specialistLabel, aiContext }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex gap-2">
        {specialistLabel && <button onClick={onSpecialist} className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50">{specialistLabel}</button>}
        {aiContext && <GenAIInsightButton context={aiContext} />}
      </div>
    </div>
  );
}

function SalvageSection({ sc, aiContext }) {
  const [locked, setLocked] = useState(true);
  const [parties, setParties] = useState([]);
  const [signOff] = useState({ request: '', status: '', total: '' });

  useEffect(() => {
    subClaimsApi.getStakeholders(sc.sub_claim_id, 'Salvage').then(setParties).catch(() => { });
  }, [sc.sub_claim_id]);

  return (
    <div className="space-y-4">
      <SectionHeader title="Salvage" description="Information regarding the salvage process for damaged property." specialistLabel="Salvage Specialist" onSpecialist={() => setLocked(false)} aiContext={aiContext} />
      <div className="card p-6 space-y-4">
        <div className="font-medium text-sm text-gray-700">Accident Management</div>
        <div className="flex">
          <input placeholder="Search…" className="flex-1 border border-gray-200 rounded-l-lg px-3 py-2 text-sm" />
          <button className="px-3 border border-l-0 border-gray-200 rounded-r-lg bg-gray-50">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 border-b">
            <th className="pb-2">Party Name</th><th className="pb-2">Party Role</th><th className="pb-2">Party Type</th><th className="pb-2">Assigned To</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {parties.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.party_name}</td>
                <td className="py-2 text-gray-500">{p.party_role}</td>
                <td className="py-2 text-gray-500">{p.party_type}</td>
                <td className="py-2 text-xs text-gray-500">{p.assigned_to}</td>
                <td className="py-2"><button className="text-xs text-red-400 hover:text-red-600">DELETE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div><label className="block text-xs text-gray-400 mb-1">Total Subrogation Amount</label><input readOnly={locked} value="£" className="w-32 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm" /></div>
        <div className="font-medium text-sm text-gray-700 border-t pt-4">Customer Sign-Off</div>
        <p className="text-xs text-gray-500">Documentation and approval process for salvaged property, including customer consent and agreements.</p>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs text-gray-400 mb-1">Sign-Off Request</label><input readOnly={locked} value={signOff.request} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Sign-Off Status</label><input readOnly={locked} value={signOff.status} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Total Salvage Amount</label><input readOnly={locked} value={signOff.total || '£'} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
      </div>
    </div>
  );
}

function ExtVehicleSection({ sc, aiContext }) {
  const [locked, setLocked] = useState(true);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    subClaimsApi.getStakeholders(sc.sub_claim_id, 'Ext Vehicle Manage').then(setCompanies).catch(() => { });
  }, [sc.sub_claim_id]);

  return (
    <div className="space-y-4">
      <SectionHeader title="External Vehicle Management" description="Coordination of vehicle repairs and rentals, including service providers and booking information." specialistLabel="External Vehicle Management Specialist" onSpecialist={() => setLocked(false)} aiContext={aiContext} />
      <div className="card p-6 space-y-4">
        <div className="font-medium text-sm text-gray-700">Hire Companies</div>
        <p className="text-xs text-gray-500">Details of rental companies involved in providing replacement vehicles during the claim process.</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 border-b">
            <th className="pb-2 w-8"></th>
            <th className="pb-2">Party Name</th><th className="pb-2">Party Role</th><th className="pb-2">Party Type</th><th className="pb-2">Assigned To</th><th className="pb-2">Third Party Code</th><th className="pb-2"></th>
          </tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2"><input type="checkbox" className="accent-blue-600" /></td>
                <td className="py-2">{c.party_name}</td>
                <td className="py-2 text-gray-500">{c.party_role}</td>
                <td className="py-2 text-gray-500">{c.party_type}</td>
                <td className="py-2 text-xs text-gray-500 truncate max-w-[100px]">{c.assigned_to}</td>
                <td className="py-2 text-xs text-gray-400">{c.third_party_code}</td>
                <td className="py-2"><button className="text-xs text-red-400 hover:text-red-600">DELETE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div><label className="block text-xs text-gray-400 mb-1">Total Hire Cost</label><input readOnly={locked} value="£" className="w-32 border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm" /></div>
      </div>
    </div>
  );
}

function AssignVendorSection({ sc, aiContext }) {
  const [serviceType, setServiceType] = useState('');
  const [form, setForm] = useState({ vendor_name: '', vendor_email: '', assignment_date: '' });
  // eslint-disable-next-line no-unused-vars
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-4">
      <SectionHeader title="Assign Vendor" description="Allocated a trusted vendor to handle specific services for the sub-claim." aiContext={aiContext} />
      <div className="card p-6 space-y-4">
        <div><label className="block text-xs text-gray-400 mb-1">Vendor Name</label><input value={form.vendor_name} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} placeholder="Search…" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">Vendor Email</label><input value={form.vendor_email} onChange={e => setForm(f => ({ ...f, vendor_email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">Assignment Date</label><input type="date" value={form.assignment_date} onChange={e => setForm(f => ({ ...f, assignment_date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Service Type</label>
          <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Select…</option>
            <option>Repair</option><option>Legal</option><option>Appraiser</option><option>Investigation</option>
            <option value="Loss Adjuster">Loss Adjuster</option>
          </select>
        </div>
        {serviceType === 'Loss Adjuster' && (
          <button onClick={() => setShowReport(true)} className="btn-active-class w-40 text-sm">
            ASSIGN VENDOR
          </button>
        )}
      </div>
    </div>
  );
}

function LossAdjusterSection({ sc, aiContext }) {
  const [analysed, setAnalysed] = useState(false);
  const [analysing, setAnalysing] = useState(false);

  function analyse() {
    setAnalysing(true);
    setTimeout(() => { setAnalysing(false); setAnalysed(true); }, 2000);
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Loss Adjuster Report" description="Upload the adjuster's report to extract financial impacts using AI." aiContext={aiContext} />
      <div className="card p-6 space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center text-center">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-300 mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <p className="text-sm text-gray-500">Drag & drop your files here, or <span className="text-blue-500 cursor-pointer">browse</span></p>
        </div>
        <div className="flex justify-end">
          <button onClick={analyse} disabled={analysing}
            className="btn-active-class w-48 text-sm">
            {analysing ? 'Analysing…' : 'GENERATE ANALYSIS'}
          </button>
        </div>

        {analysed && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg text-sm">
              <div className="flex gap-4 mb-3">
                <div><span className="text-xs text-gray-400">VIN: </span><span className="text-blue-500 font-mono">{sc.claimant_contact || '1AB7234588912345'}</span></div>
                <div><span className="text-xs text-gray-400">Make: </span><span className="font-medium">Toyota</span></div>
                <div><span className="text-xs text-gray-400">Model: </span><span className="font-medium">Camry</span></div>
                <div><span className="text-xs text-gray-400">Year: </span><span className="font-medium">2022</span></div>
                <div><span className="text-xs text-gray-400">Covered: </span><span className="text-green-600 font-medium">Yes</span></div>
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-700">Uploaded Images</div>
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-36 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  Vehicle Image {i}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddPartySection({ sc }) {
  const [partyType, setPartyType] = useState('Individual');
  const [form, setForm] = useState({ party_name: '', date_of_birth: '', contact_number: '', email: '', reference_number: '', relation_with_sub_claim: '', organization_name: '', contact_person: '', organization_type: '', registration_number: '' });
  const [sanctionCheck, setSanctionCheck] = useState(false);
  const [parties, setParties] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    subClaimsApi.getParties(sc.sub_claim_id).then(setParties).catch(() => { });
  }, [sc.sub_claim_id]);

  async function addParty() {
    setSaving(true);
    try {
      const p = await subClaimsApi.addParty(sc.sub_claim_id, { ...form, party_type: partyType, sanction_check: sanctionCheck });
      setParties(prev => [...prev, p]);
      setForm({ party_name: '', date_of_birth: '', contact_number: '', email: '', reference_number: '', relation_with_sub_claim: '', organization_name: '', contact_person: '', organization_type: '', registration_number: '' });
    } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Add Party" description="Include relevant individuals or entities involved in the sub-claim." />
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Party Type</label>
          <select value={partyType} onChange={e => setPartyType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>Individual</option><option>Organization</option>
          </select>
        </div>
        {partyType === 'Individual' ? (
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Party Name</label><input value={form.party_name} onChange={e => setForm(f => ({ ...f, party_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contact Number</label><input value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Reference Number</label><input value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Relation with Sub Claim</label><input value={form.relation_with_sub_claim} onChange={e => setForm(f => ({ ...f, relation_with_sub_claim: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Organization Name</label><input value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contact Person</label><input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Organization Type</label><input value={form.organization_type} onChange={e => setForm(f => ({ ...f, organization_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Contact Number</label><input value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Registration Number</label><input value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
        )}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="1.5" /></svg>
            <span className="text-xs font-semibold text-gray-700">Sanction Check</span>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={sanctionCheck} onChange={e => setSanctionCheck(e.target.checked)} className="accent-blue-600" />
            *Please check this box to perform a sanction check for this party.*
          </label>
          {sanctionCheck && <div className="mt-2 flex items-center gap-2 text-xs text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-400" />This party is flagged for potential sanctions; review before proceeding.</div>}
        </div>
        <div className="flex justify-between">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm">CANCEL</button>
          <button onClick={addParty} disabled={saving} className="btn-add-class w-32 text-sm">
            {saving ? '…' : 'ADD PARTY'}
          </button>
        </div>
        {parties.length > 0 && (
          <table className="w-full text-sm mt-4">
            <thead><tr className="text-left text-xs text-gray-400 border-b">
              <th className="pb-2">Name</th><th className="pb-2">Type</th><th className="pb-2">Contact</th>
            </tr></thead>
            <tbody>{parties.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.party_name || p.organization_name}</td>
                <td className="py-2 text-gray-500">{p.party_type}</td>
                <td className="py-2 text-gray-500">{p.contact_number || p.email}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CollaborateSection({ sc }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [taggedUsers] = useState(['Andrew Khalatov', 'Rithvika Parvathi']);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    subClaimsApi.getMessages(sc.sub_claim_id).then(setMessages).catch(() => { });
  }, [sc.sub_claim_id]);

  async function send() {
    if (!input.trim()) return;
    try {
      const msg = await subClaimsApi.postMessage(sc.sub_claim_id, {
        sender_name: 'Rithvika Parvathi',
        sender_initials: 'RP',
        tagged_users: selected ? [selected] : [],
        message: input,
      });
      setMessages(m => [...m, msg]);
      setInput('');
    } catch (e) { alert('Error: ' + e.message); }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Collaborate" description="Send messages to team members." />
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Select User(s) to Tag</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">— Select user —</option>
            {taggedUsers.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Start a conversation…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={send} className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">Send</button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {messages.map(m => (
            <div key={m.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 flex-shrink-0">{m.sender_initials || '?'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">{m.sender_name}</span>
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-700">{m.message}</div>
                <button className="text-xs text-blue-500 hover:underline mt-1">↩ REPLY</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
