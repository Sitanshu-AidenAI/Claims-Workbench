import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User, Settings, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_LABEL = {
  handler: 'Claims Handler',
  fnol: 'FNOL Specialist',
  manager: 'Claim Manager',
  admin: 'Administrator',
};

export default function TopBar({ title, subtitle, claimInfo, onOpenAI }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const aiRef = useRef(null);

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const isNested = location.pathname !== '/dashboard';

  return (
    <header
      className="h-14 flex items-center justify-between px-5 flex-shrink-0 bg-white sticky top-0 z-40"
      style={{
        borderBottom: '1px solid #E8EDF5',
        boxShadow: '0 1px 0 rgba(3,68,140,0.04)',
      }}
    >
      {/* ── LEFT ── */}
      <div className="flex items-center gap-2 min-w-0">
        {isNested && (
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        )}

        {claimInfo ? (
          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <button onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-700 transition-colors text-[12.5px] flex-shrink-0">
              Dashboard
            </button>
            <span className="text-gray-200 flex-shrink-0">/</span>
            <span className="font-semibold text-primary-600 tracking-tight">{claimInfo.claimId}</span>
            {claimInfo.policyNo && <>
              <span className="text-gray-200">·</span>
              <span className="text-gray-400 text-[12px]">
                Policy <span className="text-gray-600 font-medium">{claimInfo.policyNo}</span>
              </span>
            </>}
            {claimInfo.companyName && <>
              <span className="text-gray-200">·</span>
              <span className="font-medium text-gray-600 text-[12.5px] truncate max-w-[180px]">{claimInfo.companyName}</span>
            </>}
            {claimInfo.reportingStatus && (
              <span className={`status-pill ${claimInfo.reportingStatus === 'Late Report' ? 'high' : 'low'}`}>
                {claimInfo.reportingStatus}
              </span>
            )}
          </div>
        ) : title ? (
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-gray-900 leading-tight truncate">{title}</div>
            {subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}
          </div>
        ) : null}
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">

        {/* Ask AI — hero CTA */}
        <motion.button
          ref={aiRef}
          onClick={onOpenAI}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-[12.5px] font-semibold overflow-hidden border-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #2CC9A2 0%, #03448C 100%)',
            boxShadow: '0 2px 12px rgba(44,201,162,0.30)',
          }}
        >
          {/* Animated sheen */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
          />
          <Sparkles className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Ask AI</span>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer"
        >
          <Bell className="w-[14px] h-[14px]" />
          <span className="absolute top-1 right-1 w-[6px] h-[6px] rounded-full bg-red-500 border border-white" />
        </motion.button>

        <div className="w-px h-5 bg-gray-100 mx-0.5" />

        {/* User menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMenu(m => !m)}
            className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2CC9A2 0%, #03448C 100%)' }}
            >
              {initials}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                {user?.full_name?.split(' ')[0] || 'User'}
              </div>
              <div className="text-[10px] text-gray-400 whitespace-nowrap">
                {ROLE_LABEL[user?.role] || 'Handler'}
              </div>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-300 flex-shrink-0 transition-transform duration-200 ${menu ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="absolute right-0 top-[calc(100%+6px)] w-52 bg-white rounded-xl border border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.10)] py-1.5 z-[100]"
              >
                <div className="px-3.5 pb-2.5 pt-2 border-b border-gray-100 mb-1">
                  <div className="text-[12.5px] font-semibold text-gray-900">{user?.full_name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{user?.email}</div>
                </div>
                {[
                  { icon: <User className="w-3.5 h-3.5" />, label: 'My Profile' },
                  { icon: <Settings className="w-3.5 h-3.5" />, label: 'Settings' },
                ].map(item => (
                  <button key={item.label}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left">
                    <span className="text-gray-400">{item.icon}</span>{item.label}
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => { setMenu(false); logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
