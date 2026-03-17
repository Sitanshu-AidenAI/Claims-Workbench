import { useState } from 'react';

export default function SubjectStep({ formData, policy, onUpdate, onNext, onPrev }) {
  const [vinSearch, setVinSearch] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState(formData.vehicles || []);
  const [showSummary, setShowSummary] = useState(false);

  const filteredVehicles = policy?.vehicles?.filter(v =>
    !vinSearch || v.vin.toLowerCase().includes(vinSearch.toLowerCase())
  ) || [];

  function selectVehicle(vehicle) {
    if (!selectedVehicles.find(v => v.vin === vehicle.vin)) {
      const updated = [...selectedVehicles, vehicle];
      setSelectedVehicles(updated);
      onUpdate({ vehicles: updated });
    }
  }

  function removeVehicle(vin) {
    const updated = selectedVehicles.filter(v => v.vin !== vin);
    setSelectedVehicles(updated);
    onUpdate({ vehicles: updated });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vehicle Details</h2>
          <p className="text-sm text-gray-500">Fetching vehicle-specific data to assess relevance and coverage for the reported loss.</p>
        </div>
        <button onClick={() => setShowSummary(true)} className="px-4 py-1.5 text-sm border border-gray-200 rounded-full hover:bg-gray-50">VIEW VEHICLE SUMMARY</button>
      </div>

      <div className="card p-6 space-y-4">
        {/* VIN search */}
        <div className="flex items-center gap-2">
          <input
            value={vinSearch}
            onChange={e => setVinSearch(e.target.value)}
            placeholder="Search by VIN…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {selectedVehicles.length > 0 && (
            <button onClick={() => { setSelectedVehicles([]); onUpdate({ vehicles: [] }); }} className="text-xs text-gray-400 hover:text-red-500">Clear All</button>
          )}
        </div>

        {/* Vehicle list from policy */}
        {vinSearch && filteredVehicles.length > 0 && (
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            {filteredVehicles.map(v => (
              <div key={v.vin} onClick={() => selectVehicle(v)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm">
                <span className="font-mono text-gray-600">{v.vin}</span>
                <span>{v.vehicle_make}</span>
                <span>{v.vehicle_model}</span>
                <span>{v.year_of_manufacture}</span>
                {v.is_covered && <span className="ml-auto text-accent-teal text-xs font-medium">Covered ✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* File upload area */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-300 mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p className="text-sm text-gray-500">Drag & drop your files here, or <span className="text-blue-500 cursor-pointer hover:underline">browse</span></p>
        </div>

        {/* Selected vehicles table */}
        {selectedVehicles.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b">
                <th className="pb-2">VIN</th><th className="pb-2">Vehicle Make</th><th className="pb-2">Vehicle Model</th><th className="pb-2">Year</th><th className="pb-2">Covered</th><th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {selectedVehicles.map(v => (
                <tr key={v.vin} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{v.vin}</td>
                  <td className="py-2">{v.vehicle_make}</td>
                  <td className="py-2">{v.vehicle_model}</td>
                  <td className="py-2">{v.year_of_manufacture}</td>
                  <td className="py-2">{v.is_covered ? '✓' : '—'}</td>
                  <td className="py-2"><button onClick={() => removeVehicle(v.vin)} className="text-red-400 hover:text-red-600 text-xs">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {policy && !vinSearch && (
          <p className="text-xs text-gray-400">Type a VIN to search from {policy.vehicles?.length} insured vehicles</p>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={onPrev} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50">PREVIOUS</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600">NEXT</button>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black/20 flex items-start justify-end z-50 p-6" onClick={() => setShowSummary(false)}>
          <div className="bg-white rounded-xl shadow-xl w-72 p-5" onClick={e => e.stopPropagation()}>
            <div className="font-semibold text-sm mb-3">Vehicle Summary</div>
            <p className="text-xs text-gray-500">Selected: {selectedVehicles.length} vehicle(s)</p>
            {selectedVehicles.map(v => (
              <div key={v.vin} className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <p className="font-medium">{v.vehicle_make} {v.vehicle_model} ({v.year_of_manufacture})</p>
                <p className="text-gray-400 font-mono">{v.vin}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
