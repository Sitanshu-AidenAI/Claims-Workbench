import { useState, useEffect } from 'react';
import { policiesApi } from '../../../services/api';

export default function PolicyDetailsTab({ claim }) {
  const [policy, setPolicy] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (claim.policy_number) {
      policiesApi.getByNumber(claim.policy_number).then(setPolicy).catch(() => {});
    }
  }, [claim.policy_number]);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Policy Details</h2>
        <p className="text-sm text-gray-500">Information regarding the insurance policy associated with the claim, including coverage limits and terms.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Policy Number</label>
            <input value={claim.policy_number} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Insured or Policy Holder Name</label>
            <input value={policy?.insured_name || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input value={policy?.policy_start_date || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input value={policy?.policy_end_date || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total Sum Insured</label>
            <input value={policy ? `£${policy.total_sum_insured?.toLocaleString()}` : ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address</label>
            <input value={policy?.address || ''} readOnly className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
          </div>
        </div>
      </div>

      {/* Coverage accordions */}
      {policy?.coverages?.length > 0 && (
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Detailed Coverages And Deductibles</h3>
            <p className="text-xs text-gray-500">Overview of the specific coverages provided under the policy and the applicable deductibles for this claim.</p>
          </div>
          <div className="space-y-2">
            {policy.coverages.map((c, i) => (
              <div key={c.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>{c.coverage_type}</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className={`transition-transform ${expanded === i ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Coverage Limit</label>
                        <input value={`£${c.coverage_limit?.toLocaleString()}`} readOnly
                          className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Deductible</label>
                        <input value={`£${c.deductible?.toLocaleString()}`} readOnly
                          className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600" />
                      </div>
                    </div>
                    {/* Vehicle-level coverage for motor fleet */}
                    {policy.vehicles?.slice(0, 2).map(v => (
                      <div key={v.vin} className="grid grid-cols-5 gap-2 mt-2 text-xs">
                        <div className="font-mono text-gray-500">{v.vin}</div>
                        <div>{v.vehicle_make} {v.vehicle_model}</div>
                        <div>{v.year_of_manufacture}</div>
                        <div>£{(c.coverage_limit / 10)?.toLocaleString()}</div>
                        <div>£{(c.deductible / 10)?.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
