import { useState } from 'react';

export default function PolicyStep({ formData, policy, onSearch, onUpdate, onNext }) {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  async function handleSearch() {
    if (!formData.policy_number) return;
    setSearching(true);
    setError('');
    const p = await onSearch(formData.policy_number);
    setSearching(false);
    if (!p) setError(`Policy ${formData.policy_number} not found`);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Policy Details</h2>
          <p className="text-sm text-gray-500">Capturing key policy information and identifying the insured contact for claim initiation.</p>
        </div>
        {policy && (
          <button onClick={() => setShowSummary(true)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-full hover:bg-gray-50">
            VIEW POLICY SUMMARY
          </button>
        )}
      </div>

      <div className="card p-6 space-y-4">
        {/* Policy Number search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number <span className="text-red-500">*</span></label>
          <div className="flex flex-col gap-3">
            <input
              value={formData.policy_number}
              onChange={e => onUpdate({ policy_number: e.target.value })}
              placeholder="e.g. POL-1000"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !formData.policy_number}
              className="w-full px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
            >
              {searching ? 'Verifying...' : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  VERIFY POLICY
                </>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {policy && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input value={formData.company_name} onChange={e => onUpdate({ company_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <input value={policy.address || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Zip Code</label>
                <input value={policy.zip_code || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Preferred Method of Contact</label>
                <input value={policy.preferred_contact || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Preferred Contact Name</label>
                <input value={policy.preferred_contact_name || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input value={policy.email || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Preferred Time of Contact</label>
                <input value={policy.opening_hours || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                <input value={policy.phone || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">VAT Registered?</label>
                <div className="flex gap-4 py-2">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" checked={policy.vat_registered} readOnly className="accent-blue-600" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" checked={!policy.vat_registered} readOnly className="accent-blue-600" /> No
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onNext}
          disabled={!policy}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-40"
        >
          NEXT
        </button>
      </div>

      {/* Policy Summary popup */}
      {showSummary && policy && (
        <div className="fixed inset-0 bg-black/20 flex items-start justify-end z-50 p-6" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-xl shadow-xl w-72 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <span className="font-semibold text-sm">Summary</span>
              <span className="text-xs text-gray-400">Summary of Policy Details</span>
            </div>
            <div className="space-y-2 text-xs text-gray-600 border-b pb-3 mb-3">
              <p><span className="font-medium">Policy Status:</span> {policy.status}</p>
              <p><span className="font-medium">Coverage:</span> {policy.vehicles?.length} vehicles covered</p>
              <p><span className="font-medium">Location:</span> {policy.address}</p>
              <p><span className="font-medium">Policyholder:</span> {policy.preferred_contact_name} (Primary Contact)</p>
            </div>
            <div>
              <p className="font-medium text-xs mb-2">Suggestions</p>
              <ul className="text-xs text-gray-500 space-y-1.5">
                <li className="flex gap-1.5"><span className="text-accent-teal">•</span> Ensure the vehicle is covered under active policy to avoid discrepancies in claims processing.</li>
                <li className="flex gap-1.5"><span className="text-accent-teal">•</span> Contact Policyholder for any additional information or updates regarding the policyholder or incident details to expedite the claim.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
