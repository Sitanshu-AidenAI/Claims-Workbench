import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsApi, policiesApi } from '../../services/api';
import AIFnolCopilot from './AIFnolCopilot';
import PolicyStep from './steps/PolicyStep';
import LossStep from './steps/LossStep';
import SubjectStep from './steps/SubjectStep';
import DocumentStep from './steps/DocumentStep';

const STEPS = [
  { id: 'policy', label: 'Policy Details', icon: 'M9 12h6M9 16h4M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z' },
  { id: 'loss', label: 'Loss Details', icon: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
  { id: 'subject', label: 'Subject Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'docs', label: 'Document Details', icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z' },
];

export default function NewClaim() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [policy, setPolicy] = useState(null);
  const [claimId, setClaimId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    policy_number: '',
    company_name: '',
    insured_name: '',
    date_of_loss: '',
    time_of_loss: '',
    description_of_loss: '',
    type_of_incident: '',
    cause_of_loss: '',
    police_officer_name: '',
    police_station: '',
    police_telephone: '',
    incident_reference: '',
    location_of_loss: '',
    severity: 'Medium',
    priority: 'High',
    vehicles: [],
    documents: [],
  });

  function update(fields) {
    setFormData(f => ({ ...f, ...fields }));
  }

  async function handlePolicySearch(policyNumber) {
    try {
      const p = await policiesApi.getByNumber(policyNumber);
      setPolicy(p);
      update({ policy_number: p.policy_number, company_name: p.company_name, insured_name: p.insured_name });
      return p;
    } catch {
      setPolicy(null);
      return null;
    }
  }

  async function handleSubmit(documents) {
    try {
      const payload = { ...formData, documents: undefined };
      const created = await claimsApi.create(payload);
      setClaimId(created.claim_id);
      setSubmitted(true);
      setTimeout(() => navigate(`/claims/${created.claim_id}`), 2500);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-[#F2F6FB] overflow-hidden">

      {/* ── Header & Horizontal Stepper ── */}
      <div className="bg-white px-8 py-6 border-b border-gray-100 flex flex-col gap-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Register New Claim</h1>
            <p className="text-[13.5px] text-gray-500 mt-1">Complete the details below to initiate the First Notice of Loss (FNOL).</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const isActive = step === i;
            const isCompleted = step > i;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-300 ${isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold ring-1 ring-primary-500/30'
                    : isCompleted
                      ? 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer border border-gray-200 shadow-sm'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed border-transparent'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isActive ? 'bg-primary-600 text-white shadow-md' : isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-gray-200/50 text-gray-400'
                    }`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <span className="text-[13px]">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${isCompleted ? 'bg-primary-300' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center relative">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px] h-fit">
          {step === 0 && <PolicyStep formData={formData} policy={policy} onSearch={handlePolicySearch} onUpdate={update} onNext={() => setStep(1)} />}
          {step === 1 && <LossStep formData={formData} onUpdate={update} onNext={() => setStep(2)} onPrev={() => setStep(0)} />}
          {step === 2 && <SubjectStep formData={formData} policy={policy} onUpdate={update} onNext={() => setStep(3)} onPrev={() => setStep(1)} />}
          {step === 3 && <DocumentStep formData={formData} onUpdate={update} onSubmit={handleSubmit} onPrev={() => setStep(2)} submitted={submitted} />}
        </div>
      </div>

      {/* AI Co-Pilot Floating Widget */}
      <AIFnolCopilot
        currentStep={step}
        formData={formData}
        onAutoFill={() => {
          handlePolicySearch('POL-1000');
          update({
            date_of_loss: '2023-10-25',
            time_of_loss: '14:30',
            description_of_loss: 'Rear-ended at a stoplight while heading to the delivery site. Weather was clear.',
            type_of_incident: 'Collision',
            cause_of_loss: 'Third-party negligence',
            location_of_loss: 'Junction of High St and Broad St, London',
            incident_reference: 'MET-123456',
          });
          setTimeout(() => setStep(1), 500);
        }}
      />

      {policy && <PolicyModal policy={policy} />}
    </div>
  );
}

function PolicyModal({ policy }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('policy');

  // listen for trigger event
  useState(() => {
    const handler = () => setOpen(true);
    window.addEventListener('showPolicyModal', handler);
    return () => window.removeEventListener('showPolicyModal', handler);
  });

  if (!open) return null;

  const tabs = ['Policy Details', 'Insured Details', 'Insured Object', 'Coverage & Deductibles', 'Reinsurance'];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Policy Overview</h2>
          <div className="flex items-center gap-3">
            <button className="px-4 py-1.5 border border-gray-300 rounded-full text-sm hover:bg-gray-50">VIEW POLICY DOCUMENT</button>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(['policy', 'insured', 'object', 'coverage', 'reinsurance'][i])}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition ${tab === ['policy', 'insured', 'object', 'coverage', 'reinsurance'][i]
                ? 'border-accent-400 text-accent-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {tab === 'policy' && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-400 text-xs">Policy Number</div><div className="font-medium">{policy.policy_number}</div></div>
              <div><div className="text-gray-400 text-xs">Insured / Policy Holder Name</div><div className="font-medium">{policy.insured_name}</div></div>
              <div><div className="text-gray-400 text-xs">Policy Start Date</div><div className="font-medium">{policy.policy_start_date}</div></div>
              <div><div className="text-gray-400 text-xs">Policy End Date</div><div className="font-medium">{policy.policy_end_date}</div></div>
              <div><div className="text-gray-400 text-xs">Total Sum Insured</div><div className="font-medium">£{policy.total_sum_insured?.toLocaleString()}</div></div>
              <div><div className="text-gray-400 text-xs">Address</div><div className="font-medium">{policy.address}</div></div>
            </div>
          )}
          {tab === 'insured' && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-400 text-xs">Company Name</div><div className="font-medium">{policy.company_name}</div></div>
              <div><div className="text-gray-400 text-xs">Zip Code</div><div className="font-medium">{policy.zip_code}</div></div>
              <div><div className="text-gray-400 text-xs">Preferred Method of Contact</div><div className="font-medium">{policy.preferred_contact}</div></div>
              <div><div className="text-gray-400 text-xs">Landline Telephone Number</div><div className="font-medium">{policy.phone}</div></div>
              <div><div className="text-gray-400 text-xs">Email Address</div><div className="font-medium">{policy.email}</div></div>
              <div><div className="text-gray-400 text-xs">Address</div><div className="font-medium">{policy.address}</div></div>
              <div><div className="text-gray-400 text-xs">Preferred Contact Name</div><div className="font-medium">{policy.preferred_contact_name}</div></div>
              <div><div className="text-gray-400 text-xs">Preferred Time of Contact</div><div className="font-medium">{policy.opening_hours}</div></div>
              <div><div className="text-gray-400 text-xs">VAT Registered?</div><div className="font-medium">{policy.vat_registered ? 'Yes' : 'No'}</div></div>
            </div>
          )}
          {tab === 'object' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b">
                <th className="pb-2">VIN</th><th className="pb-2">Vehicle Make</th><th className="pb-2">Vehicle Model</th><th className="pb-2">Year</th><th className="pb-2">Covered</th>
              </tr></thead>
              <tbody>
                {policy.vehicles?.map(v => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-2 text-gray-600">{v.vin}</td>
                    <td className="py-2">{v.vehicle_make}</td>
                    <td className="py-2">{v.vehicle_model}</td>
                    <td className="py-2">{v.year_of_manufacture}</td>
                    <td className="py-2">{v.is_covered ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'coverage' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b">
                <th className="pb-2">Coverage Type</th><th className="pb-2">Coverage Limit</th><th className="pb-2">Deductible</th>
              </tr></thead>
              <tbody>
                {policy.coverages?.map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2">{c.coverage_type}</td>
                    <td className="py-2">£{c.coverage_limit?.toLocaleString()}</td>
                    <td className="py-2">£{c.deductible?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'reinsurance' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b">
                <th className="pb-2">Reinsurer Name</th><th className="pb-2">Agreement Type</th><th className="pb-2">Share %</th><th className="pb-2">Coded Amount</th><th className="pb-2">Payment Amount</th>
              </tr></thead>
              <tbody>
                {policy.reinsurers?.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{r.reinsurer_name}</td>
                    <td className="py-2">{r.agreement_type}</td>
                    <td className="py-2">{r.share_percentage}%</td>
                    <td className="py-2">£{r.coded_amount?.toLocaleString()}</td>
                    <td className="py-2">£{r.payment_amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Policy Modal */}
      {policy && <PolicyModal policy={policy} />}
    </div>
  );
}
