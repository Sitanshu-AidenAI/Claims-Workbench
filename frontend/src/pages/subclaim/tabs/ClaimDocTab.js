import { useState, useEffect } from 'react';
import { subClaimsApi } from '../../../services/api';

const MANDATORY_CATEGORIES = ['FIR', 'Images', 'Medical Documentation'];

export default function ClaimDocTab({ sc, onUpdate }) {
  const [docs, setDocs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ vin: '', file_name: '', file_category: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    subClaimsApi.getDocuments(sc.sub_claim_id).then(setDocs).catch(() => {});
  }, [sc.sub_claim_id]);

  const uploaded = new Set(docs.map(d => d.file_category));
  const missingMandatory = MANDATORY_CATEGORIES.filter(c => !uploaded.has(c));

  async function addDoc() {
    if (!newDoc.file_name || !newDoc.file_category) return;
    setSaving(true);
    try {
      const isMandatory = MANDATORY_CATEGORIES.includes(newDoc.file_category);
      const doc = await subClaimsApi.addDocument(sc.sub_claim_id, { ...newDoc, is_mandatory: isMandatory });
      setDocs(d => [...d, doc]);
      setShowAdd(false);
      setNewDoc({ vin: '', file_name: '', file_category: '' });
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeDoc(id) {
    try {
      await subClaimsApi.deleteDocument(id);
      setDocs(d => d.filter(doc => doc.id !== id));
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Claim Documents</h2>
        <p className="text-sm text-gray-500">All relevant documents submitted for this claim, including forms, evidence, and correspondence.</p>
      </div>

      <div className="card p-6 space-y-4">
        {docs.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b">
                {['VIN', 'File Name', 'File Category', 'Action'].map(h => <th key={h} className="pb-2 font-medium">{h}</th>)}
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
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      Download
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5"/></svg>
          {docs.length}/3 Documents Uploaded
        </div>

        {missingMandatory.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2"/></svg>
            Please upload all Required files: {missingMandatory.join(', ')}
          </div>
        )}

        <button onClick={() => setShowAdd(true)} className="btn-add-class gap-2 text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          ADD DOCUMENT
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Document</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">VIN (optional)</label>
                <input value={newDoc.vin} onChange={e => setNewDoc(d => ({ ...d, vin: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Name *</label>
                <input value={newDoc.file_name} onChange={e => setNewDoc(d => ({ ...d, file_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Category *</label>
                <select value={newDoc.file_category} onChange={e => setNewDoc(d => ({ ...d, file_category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select…</option>
                  {MANDATORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={addDoc} disabled={saving || !newDoc.file_name || !newDoc.file_category}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-40">
                {saving ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
