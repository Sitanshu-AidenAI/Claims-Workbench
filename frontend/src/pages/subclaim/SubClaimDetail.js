import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subClaimsApi, claimsApi } from '../../services/api';
import AISidebar from '../../components/AISidebar';
import SubClaimInfoTab from './tabs/SubClaimInfoTab';
import TasksTab from './tabs/TasksTab';
import ClaimDocTab from './tabs/ClaimDocTab';
import LegalTab from './tabs/LegalTab';
import StakeholderTab from './tabs/StakeholderTab';
import FinancialsTab from './tabs/FinancialsTab';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_ITEMS = [
  { id: 'info', label: 'Sub Claim Info', icon: 'M4 6h16M4 10h16M4 14h16' },
  { id: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'docs', label: 'Claim Doc', icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z' },
  { id: 'legal', label: 'Legal', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  { id: 'stakeholders', label: 'Stakeholders', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'financials', label: 'Financials', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const PROGRESS_ITEMS = [
  { label: 'Initiation', score: 100, items: [] },
  { label: 'Sub-Claim Setup & Task Allocation', score: 100, items: [] },
  { label: 'Documentation & Legal Review', score: 6, items: ['Collect and organize claim documents.', 'Manage litigation, subrogation, and SIU investigations.'] },
  { label: 'Stakeholder Coordination', score: 6, items: ['Assign vendors and involved parties.', 'Facilitate collaboration among stakeholders.'] },
  { label: 'Financial Management', score: 6, items: ['Manage deductibles and reserves with reinsurance considerations.', 'Process settlements and finalize payments.'] },
];

function ProgressModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-dark-900">Progress Tracker</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          {PROGRESS_ITEMS.map(p => (
            <div key={p.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-gray-700">{p.label}</span>
                <span className="text-[11px] text-gray-400">{p.score}/100</span>
              </div>
              <div className="progress-bar-track mb-2">
                <div className="progress-bar-fill" style={{ width: `${p.score}%` }} />
              </div>
              {p.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11.5px] text-gray-500 ml-2 mb-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${p.score === 100 ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function SubClaimDetail() {
  const { claimId, scId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [sc, setSC] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [legalSubTab, setLegalSubTab] = useState('Litigation');
  const [stakeholderSubTab, setStakeholderSubTab] = useState('Salvage');
  const [finSubTab, setFinSubTab] = useState('Manage Deductibles');
  const [loading, setLoading] = useState(true);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    Promise.all([claimsApi.get(claimId), subClaimsApi.get(scId)])
      .then(([c, s]) => { setClaim(c); setSC(s); })
      .catch(() => navigate(`/claims/${claimId}`))
      .finally(() => setLoading(false));
  }, [claimId, scId, navigate]);

  const contextMap = { legal: 'Legal', docs: 'FNOL', financials: 'Financial', tasks: 'Medical' };
  const aiContext = contextMap[activeTab] || 'FNOL';

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
  if (!claim || !sc) return null;

  return (
    <div className="flex flex-1 overflow-hidden h-full">

      {/* ── Left Tab Sidebar ── */}
      <aside className="w-48 bg-white border-r border-gray-100 flex flex-col pt-4 px-3 flex-shrink-0">
        {SIDEBAR_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item mb-1 text-left w-full ${activeTab === item.id ? 'active' : ''}`}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className={activeTab === item.id ? 'text-accent-400' : ''}>
              <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11.5px]">{item.label}</span>
          </button>
        ))}

        {/* Legal sub-items */}
        {activeTab === 'legal' && (
          <div className="ml-4 mt-1 space-y-0.5">
            {['Litigation', 'Subrogation', 'SIU'].map(sub => (
              <button key={sub} onClick={() => setLegalSubTab(sub)}
                className={`w-full text-left text-[11px] px-3 py-1.5 rounded-lg transition-colors ${legalSubTab === sub ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}>
                — {sub}
              </button>
            ))}
          </div>
        )}

        {/* Stakeholder sub-items */}
        {activeTab === 'stakeholders' && (
          <div className="ml-4 mt-1 space-y-0.5">
            {['Salvage', 'Ext Vehicle Manage', 'Assign Vendor', 'Loss Adjuster Report', 'Add Party', 'Collaborate'].map(sub => (
              <button key={sub} onClick={() => setStakeholderSubTab(sub)}
                className={`w-full text-left text-[11px] px-3 py-1.5 rounded-lg transition-colors ${stakeholderSubTab === sub ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}>
                — {sub}
              </button>
            ))}
          </div>
        )}

        {/* Financials sub-items */}
        {activeTab === 'financials' && (
          <div className="ml-4 mt-1 space-y-0.5">
            {['Manage Deductibles', 'Manage Reserve', 'Settlement'].map(sub => (
              <button key={sub} onClick={() => setFinSubTab(sub)}
                className={`w-full text-left text-[11px] px-3 py-1.5 rounded-lg transition-colors ${finSubTab === sub ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}>
                — {sub}
              </button>
            ))}
          </div>
        )}

        {/* Progress + AI */}
        <div className="mt-auto pb-4 space-y-2">
          <button
            onClick={() => setShowProgress(true)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Progress Tracker
          </button>
          <AISidebar context={aiContext} claimId={claimId} scId={scId} />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (legalSubTab || '') + (stakeholderSubTab || '') + (finSubTab || '')}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'info' && <SubClaimInfoTab sc={sc} claim={claim} onUpdate={setSC} />}
            {activeTab === 'tasks' && <TasksTab sc={sc} />}
            {activeTab === 'docs' && <ClaimDocTab sc={sc} onUpdate={setSC} />}
            {activeTab === 'legal' && <LegalTab sc={sc} subTab={legalSubTab} aiContext={aiContext} />}
            {activeTab === 'stakeholders' && <StakeholderTab sc={sc} subTab={stakeholderSubTab} aiContext={aiContext} />}
            {activeTab === 'financials' && <FinancialsTab sc={sc} claim={claim} subTab={finSubTab} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgress && <ProgressModal onClose={() => setShowProgress(false)} />}
      </AnimatePresence>
    </div>
  );
}
