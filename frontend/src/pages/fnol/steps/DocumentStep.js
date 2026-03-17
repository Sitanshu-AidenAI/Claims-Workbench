import { useState } from 'react';

const MANDATORY_CATEGORIES = ['FIR', 'Images', 'Medical Documentation'];

export default function DocumentStep({ formData, onUpdate, onSubmit, onPrev, submitted }) {
  const [docs, setDocs] = useState(formData.documents || []);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ vin: '', file_name: '', file_category: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const uploaded = new Set(docs.map(d => d.file_category));
  const missingMandatory = MANDATORY_CATEGORIES.filter(c => !uploaded.has(c));

  function addDoc() {
    if (!newDoc.file_name || !newDoc.file_category) return;
    const updated = [...docs, { ...newDoc, id: Date.now() }];
    setDocs(updated);
    onUpdate({ documents: updated });
    setNewDoc({ vin: '', file_name: '', file_category: '' });
    setShowAddDoc(false);
  }

  function removeDoc(id) {
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    onUpdate({ documents: updated });
  }

  if (submitted) {
    return (
      <div className="max-w-3xl">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim Submitted Successfully!</h2>
          <p className="text-sm text-gray-500">An email notification will be sent to the assigned Claim Handler with the claim details.</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to Claim Handler Dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
          <p className="text-sm text-gray-500">Verifying that all required documents are submitted to proceed with claim processing.</p>
        </div>
        <button onClick={() => setShowSummary(true)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-full hover:bg-gray-50">VIEW DOCUMENT SUMMARY</button>
      </div>

      <div className="card p-6 space-y-4">
        {/* Documents table */}
        {docs.length > 0 && (
          <table className="w-full text-sm mb-2">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b">
                <th className="pb-2">VIN</th>
                <th className="pb-2">File Name</th>
                <th className="pb-2">File Category</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="py-2 text-xs font-mono text-gray-500">{d.vin || '—'}</td>
                  <td className="py-2">{d.file_name}</td>
                  <td className="py-2"><span className="status-pill new">{d.file_category}</span></td>
                  <td className="py-2 flex items-center gap-3">
                    <button className="text-xs text-green-600 hover:underline">Edit</button>
                    <button onClick={() => removeDoc(d.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                    <span className="text-xs text-blue-500 cursor-pointer hover:underline flex items-center gap-1">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      Download
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mandatory docs alert */}
        {missingMandatory.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>{docs.length}/3 Documents Uploaded — Please upload all Required files: {missingMandatory.join(', ')}</span>
          </div>
        )}

        <button onClick={() => setShowAddDoc(true)} className="btn-add-class gap-2 text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ADD DOCUMENT
        </button>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mt-4">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 accent-blue-600 w-4 h-4 flex-shrink-0" />
          <span className="text-xs text-gray-600">
            I hereby confirm that I have provided all accurate and complete details regarding this claim, and I understand that it will now be processed by the Claim Handler.
          </span>
        </label>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={onPrev} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50">PREVIOUS</button>
        <button
          onClick={() => onSubmit(docs)}
          disabled={!confirmed}
          className="px-8 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 shadow-sm disabled:opacity-40 disabled:transform-none disabled:shadow-none transition-all"
        >
          SUBMIT
        </button>
      </div>

      {/* Add Document Modal */}
      {showAddDoc && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAddDoc(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Document</h3>
              <button onClick={() => setShowAddDoc(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">VIN (optional)</label>
                <input value={newDoc.vin} onChange={e => setNewDoc(d => ({ ...d, vin: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Name <span className="text-red-500">*</span></label>
                <input value={newDoc.file_name} onChange={e => setNewDoc(d => ({ ...d, file_name: e.target.value }))}
                  placeholder="e.g. Police Report.pdf"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Category <span className="text-red-500">*</span></label>
                <select value={newDoc.file_category} onChange={e => setNewDoc(d => ({ ...d, file_category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select category…</option>
                  {MANDATORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAddDoc(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={addDoc} disabled={!newDoc.file_name || !newDoc.file_category}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-40">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black/20 flex items-start justify-end z-50 p-6" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-xl shadow-xl w-72 p-5" onClick={e => e.stopPropagation()}>
            <div className="font-semibold text-sm mb-3">Document Summary</div>
            <p className="text-xs text-gray-500 mb-2">{docs.length}/3 mandatory documents uploaded</p>
            {MANDATORY_CATEGORIES.map(c => (
              <div key={c} className="flex items-center gap-2 text-xs py-1">
                <span className={uploaded.has(c) ? 'text-primary-500' : 'text-red-400'}>
                  {uploaded.has(c) ? '✓' : '✗'}
                </span>
                <span className={uploaded.has(c) ? 'text-gray-700' : 'text-red-500'}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
