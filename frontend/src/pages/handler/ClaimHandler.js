import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimsApi, subClaimsApi } from '../../services/api';
import AISidebar from '../../components/AISidebar';
import ClaimSummaryTab from './tabs/ClaimSummaryTab';
import CompanyInfoTab from './tabs/CompanyInfoTab';
import PolicyDetailsTab from './tabs/PolicyDetailsTab';
import TaskManagementTab from './tabs/TaskManagementTab';
import SubClaimListTab from './tabs/SubClaimListTab';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_ITEMS = [
  { id: 'claim', label: 'Claim Details', icon: 'M9 12h6M9 16h4M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z', badge: null },
  { id: 'company', label: 'Company Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', badge: null },
  { id: 'policy', label: 'Policy Details', icon: 'M9 12h6M9 8h6m-6 8h4M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z', badge: null },
  { id: 'tasks', label: 'Task Management', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', badge: 'tasks' },
  { id: 'subclaims', label: 'Sub Claims', icon: 'M4 6h16M4 10h16M4 14h10M4 18h6', badge: 'subclaims' },
];

export default function ClaimHandler() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [subClaims, setSubClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('claim');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([claimsApi.get(claimId), subClaimsApi.byClaim(claimId)])
      .then(([c, sc]) => { setClaim(c); setSubClaims(sc); })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [claimId, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-surface-bg">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-accent-400 flex items-center justify-center mx-auto mb-4 animate-spin-slow">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M9 12h6M9 16h4M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-[13px] text-gray-500">Loading claim…</div>
      </div>
    </div>
  );
  if (!claim) return null;

  const badges = {
    tasks: subClaims.reduce((n, sc) => n + (sc.open_tasks || 0), 0) || null,
    subclaims: subClaims.length || null,
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">

      {/* ── Left Tab Sidebar ── */}
      <aside className="w-[196px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col shadow-[2px_0_8px_rgba(3,68,140,0.04)]">
        {/* Claim mini-card */}
        <div className="p-3.5 border-b border-gray-100">
          <div className="p-3 rounded-[10px] bg-gradient-to-br from-blue-50 to-[#E7F1FC] border border-blue-200">
            <div className="text-[11px] text-gray-400 font-medium mb-0.5">Active Claim</div>
            <div className="text-[15px] font-extrabold text-primary-600 tracking-tight">{claim.claim_id}</div>
            <div className="text-[11.5px] text-gray-500 mt-0.5 font-medium">{claim.company_name || claim.policy_number}</div>
            <div className="mt-2">
              <span className={`status-pill ${claim.status === 'Completed' ? 'completed'
                  : claim.status === 'In Progress' ? 'in-progress'
                    : 'new'
                }`}>{claim.status}</span>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 tracking-[0.08em]">NAVIGATION</div>

        {/* Nav items */}
        <nav className="flex-1 px-2.5 flex flex-col gap-0.5 pb-2">
          {SIDEBAR_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const badgeCount = item.badge ? badges[item.badge] : null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item w-full text-left ${isActive ? 'active' : ''}`}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                  className={isActive ? 'text-accent-400' : 'text-current'}
                >
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="flex-1 text-[13px]">{item.label}</span>
                {badgeCount ? (
                  <span className={`min-w-[18px] h-[18px] rounded-full px-1.5 text-[10px] font-bold text-white flex items-center justify-center ${isActive ? 'bg-accent-400' : 'bg-primary-600'}`}>
                    {badgeCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* AI Sidebar at bottom */}
        <div className="p-2.5 pt-0 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 tracking-[0.08em] mb-2 pl-1">AI ASSISTANT</div>
          <AISidebar context="FNOL" claimId={claimId} label="ASK AI" subtitle="Claim analysis &amp; guidance" />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto p-6 animate-fadeIn">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'claim' && <ClaimSummaryTab claim={claim} subClaims={subClaims} />}
            {activeTab === 'company' && <CompanyInfoTab claim={claim} onUpdate={updated => setClaim({ ...claim, ...updated })} />}
            {activeTab === 'policy' && <PolicyDetailsTab claim={claim} />}
            {activeTab === 'tasks' && <TaskManagementTab claimId={claimId} subClaims={subClaims} />}
            {activeTab === 'subclaims' && (
              <SubClaimListTab
                claimId={claimId}
                claim={claim}
                subClaims={subClaims}
                onSubClaimsChange={setSubClaims}
                onNavigate={scId => navigate(`/claims/${claimId}/sub-claims/${scId}`)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
