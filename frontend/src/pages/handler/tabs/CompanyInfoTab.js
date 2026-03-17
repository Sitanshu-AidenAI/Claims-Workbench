import { useState } from 'react';
import { claimsApi, policiesApi } from '../../../services/api';

export default function CompanyInfoTab({ claim, onUpdate }) {
  const [form, setForm] = useState({
    company_name: claim.company_name || '',
    address: '',
    zip_code: '',
    preferred_contact: '',
    preferred_contact_name: '',
    email: '',
    opening_hours: '',
    phone: '',
    vat_registered: true,
  });
  const [saving, setSaving] = useState(false);

  // Load policy details for pre-fill
  useState(() => {
    if (claim.policy_number) {
      policiesApi.getByNumber(claim.policy_number)
        .then(p => setForm(f => ({
          ...f,
          address: p.address || '',
          zip_code: p.zip_code || '',
          preferred_contact: p.preferred_contact || '',
          preferred_contact_name: p.preferred_contact_name || '',
          email: p.email || '',
          opening_hours: p.opening_hours || '',
          phone: p.phone || '',
          vat_registered: p.vat_registered ?? true,
        })))
        .catch(() => {});
    }
  }, []);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    try {
      await claimsApi.update(claim.claim_id, { company_name: form.company_name });
      onUpdate({ company_name: form.company_name });
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Company Info</h2>
        <p className="text-sm text-gray-500">Details about the insurance company managing the claim, including contact information and support resources.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Company Name <span className="text-red-500">*</span></label>
            <input value={form.company_name} onChange={e => update('company_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address</label>
            <input value={form.address} onChange={e => update('address', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Zip Code</label>
            <input value={form.zip_code} onChange={e => update('zip_code', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Preferred Method of Contact</label>
            <input value={form.preferred_contact} onChange={e => update('preferred_contact', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Preferred Contact Name</label>
            <input value={form.preferred_contact_name} onChange={e => update('preferred_contact_name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email Address</label>
            <input value={form.email} onChange={e => update('email', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Preferred Time of Contact / Opening Hours</label>
            <input value={form.opening_hours} onChange={e => update('opening_hours', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
            <input value={form.phone} onChange={e => update('phone', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">VAT Registered?</label>
            <div className="flex gap-4 py-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" checked={form.vat_registered} onChange={() => update('vat_registered', true)} className="accent-blue-600" /> Yes
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" checked={!form.vat_registered} onChange={() => update('vat_registered', false)} className="accent-blue-600" /> No
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-60">
          {saving ? 'Saving…' : 'NEXT'}
        </button>
      </div>
    </div>
  );
}
