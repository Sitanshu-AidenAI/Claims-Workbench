import { useState, useEffect } from 'react';
import { subClaimsApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function TaskManagementTab({ claimId, subClaims }) {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ description: '', details: '', assigned_to: '', due_date: '', urgency: 'Standard' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      const tasks = await Promise.all(
        subClaims.map(sc =>
          subClaimsApi.getTasks(sc.sub_claim_id)
            .then(t => t.map(task => ({ ...task, sc_id: sc.sub_claim_id })))
            .catch(() => [])
        )
      );
      setAllTasks(tasks.flat());
    }
    if (subClaims.length) loadTasks();
  }, [subClaims]);

  async function addTask() {
    if (!newTask.description || !subClaims[0]) return;
    setSaving(true);
    try {
      const payload = {
        ...newTask,
        status: 'New',
        urgency: newTask.urgency || 'Standard',
        sub_claim_id: subClaims[0].id
      };
      const t = await subClaimsApi.addTask(subClaims[0].sub_claim_id, payload);
      setAllTasks(prev => [...prev, { ...t, sc_id: subClaims[0].sub_claim_id }]);
      setShowAdd(false);
      setNewTask({ description: '', details: '', assigned_to: '', due_date: '', urgency: 'Standard' });
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          <p className="text-sm text-gray-500">All relevant documents submitted for this claim, including forms, evidence, and correspondence.</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'handler' && (
            <button onClick={() => {
              setNewTask({ description: 'Missing File Request', details: 'Please provide the missing documents for this claim.', assigned_to: 'fnol@arch.com', due_date: new Date().toISOString().split('T')[0], urgency: 'Standard' });
              setShowAdd(true);
            }} className="px-4 py-2 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Request Missing File
            </button>
          )}
          <button onClick={() => {
            setNewTask({ description: '', details: '', assigned_to: '', due_date: '', urgency: 'Standard' });
            setShowAdd(true);
          }} className="btn-active-class w-32 text-sm">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            ADD TASK
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b bg-gray-50">
              {['Sub Claim ID', 'Description', 'Due Date', 'Assigned To', 'Details', 'Urgency', 'Status'].map(h => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTasks.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No tasks yet.</td></tr>
            ) : (
              allTasks.map(t => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3 text-blue-600 font-medium">{t.sc_id}</td>
                  <td className="px-5 py-3 text-gray-700">{t.description}</td>
                  <td className="px-5 py-3 text-gray-500">{t.due_date}</td>
                  <td className="px-5 py-3 text-gray-600">{t.assigned_to}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{t.details}</td>
                  <td className="px-5 py-3">
                    {t.urgency === 'SLA Priority' || t.urgency === 'High' ? (
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border 
                        ${t.urgency === 'SLA Priority' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                        {t.urgency}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">{t.urgency || 'Standard'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`status-pill ${t.status === 'New' ? 'new' : t.status === 'Completed' ? 'completed' : 'in-progress'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Task</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description *</label>
                <input value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Details</label>
                <textarea value={newTask.details} onChange={e => setNewTask(t => ({ ...t, details: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
                  <input value={newTask.assigned_to} onChange={e => setNewTask(t => ({ ...t, assigned_to: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                  <input type="date" value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                {user?.role === 'manager' && (
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Urgency / SLA Tier</label>
                    <select value={newTask.urgency} onChange={e => setNewTask(t => ({ ...t, urgency: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
                      <option value="Standard">Standard</option>
                      <option value="High">High</option>
                      <option value="SLA Priority">SLA Priority</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={addTask} disabled={saving || !newTask.description}
                className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-40">
                {saving ? 'Saving…' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
