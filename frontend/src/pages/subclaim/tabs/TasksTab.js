import { useState, useEffect } from 'react';
import { subClaimsApi } from '../../../services/api';

export default function TasksTab({ sc }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    subClaimsApi.getTasks(sc.sub_claim_id).then(setTasks).catch(() => {});
  }, [sc.sub_claim_id]);

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        <p className="text-sm text-gray-500">All relevant documents submitted for this claim, including forms, evidence, and correspondence.</p>
      </div>

      <div className="flex gap-4">
        {/* Task list */}
        <div className="w-72 flex-shrink-0 space-y-2">
          {tasks.map(t => (
            <div key={t.id} onClick={() => setSelectedTask(t)}
              className={`card p-4 cursor-pointer hover:shadow-md transition border-l-4 ${selectedTask?.id === t.id ? 'border-accent-teal' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{t.description}</span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
                Due Date {t.due_date}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No tasks yet.</div>}
        </div>

        {/* Task detail */}
        {selectedTask ? (
          <div className="flex-1 card p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tasks</label>
                <input defaultValue={selectedTask.description} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assigned To</label>
                <input defaultValue={selectedTask.assigned_to} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <input defaultValue={selectedTask.status} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                <input defaultValue={selectedTask.due_date} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Task Details</label>
                <textarea defaultValue={selectedTask.details} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 card p-8 flex items-center justify-center text-gray-400 text-sm">
            Select a task to view details
          </div>
        )}
      </div>
    </div>
  );
}
