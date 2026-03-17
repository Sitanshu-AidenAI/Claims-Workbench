import { useState } from 'react';

export default function LossStep({ formData, onUpdate, onNext, onPrev }) {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Loss Details</h2>
          <p className="text-sm text-gray-500">Documenting the incident, involved parties, and available evidence for initial claim setup.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSummary(true)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-full hover:bg-gray-50">VIEW LOSS SUMMARY</button>
          <button
            onClick={() => onUpdate({
              date_of_loss: '2023-10-25',
              time_of_loss: '14:30',
              description_of_loss: 'Rear-ended at a stoplight while heading to the delivery site. Weather was clear.',
              type_of_incident: 'Collision',
              cause_of_loss: 'Third-party negligence',
              police_officer_name: 'Louis Taylor',
              police_station: 'City Police Station',
              police_telephone: '+44 7485 123456',
              incident_reference: 'MET-123456',
            })}
            className="px-4 py-1.5 text-sm text-blue-600 hover:underline"
          >
            Prefill
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date of Loss <span className="text-red-500">*</span></label>
            <input type="date" value={formData.date_of_loss} onChange={e => onUpdate({ date_of_loss: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time of Loss <span className="text-red-500">*</span></label>
            <input type="time" value={formData.time_of_loss} onChange={e => onUpdate({ time_of_loss: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description of Loss <span className="text-red-500">*</span></label>
            <input value={formData.description_of_loss} onChange={e => onUpdate({ description_of_loss: e.target.value })}
              placeholder="Accident"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type of Incident</label>
            <input value={formData.type_of_incident} onChange={e => onUpdate({ type_of_incident: e.target.value })}
              placeholder="Collision"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cause of Loss</label>
            <input value={formData.cause_of_loss} onChange={e => onUpdate({ cause_of_loss: e.target.value })}
              placeholder="Collision"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Police Officer Name</label>
            <input value={formData.police_officer_name} onChange={e => onUpdate({ police_officer_name: e.target.value })}
              placeholder="Louis Taylor"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Police Station</label>
            <input value={formData.police_station} onChange={e => onUpdate({ police_station: e.target.value })}
              placeholder="Polizeipräsidium Berlin"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Telephone Number</label>
            <input value={formData.police_telephone} onChange={e => onUpdate({ police_telephone: e.target.value })}
              placeholder="+44 7485 123456"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Incident Reference</label>
          <input value={formData.incident_reference} onChange={e => onUpdate({ incident_reference: e.target.value })}
            placeholder="INC 1370"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={onPrev} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50">PREVIOUS</button>
        <button onClick={onNext} disabled={!formData.date_of_loss || !formData.time_of_loss || !formData.description_of_loss} className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-40">NEXT</button>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black/20 flex items-start justify-end z-50 p-6" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-xl shadow-xl w-72 p-5" onClick={e => e.stopPropagation()}>
            <div className="font-semibold text-sm mb-3">Loss Summary</div>
            <div className="space-y-2 text-xs text-gray-600">
              <p><span className="font-medium">Date of Loss:</span> {formData.date_of_loss || 'Not set'}</p>
              <p><span className="font-medium">Type:</span> {formData.type_of_incident || '—'}</p>
              <p><span className="font-medium">Cause:</span> {formData.cause_of_loss || '—'}</p>
              <p><span className="font-medium">Description:</span> {formData.description_of_loss || '—'}</p>
              <p><span className="font-medium">Police Ref:</span> {formData.incident_reference || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
