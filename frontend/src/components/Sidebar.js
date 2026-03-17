import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FileText, Briefcase,
    Settings, ShieldCheck, Users, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['fnol', 'handler', 'manager'] },
    { path: '/priority-tasks', icon: ShieldCheck, label: 'Priority Tasks', roles: ['fnol'] },
    { path: '/claims/new', icon: FileText, label: 'New FNOL', roles: ['fnol', 'manager'] },
    { path: '/claims', icon: Briefcase, label: 'Claims', roles: ['handler', 'manager'] },
    { path: '/manager', icon: ShieldCheck, label: 'Manager Approval', roles: ['manager'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['manager'] },
];

const sidebarVariants = {
    expanded: { width: 228 },
    collapsed: { width: 64 },
};

export default function Sidebar({ collapsed, onToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [hoveredNavItem, setHoveredNavItem] = useState(null);
    const [isHoverExpanded, setIsHoverExpanded] = useState(false);

    // Keyboard shortcut to toggle sidebar lock (optional, but good for power users)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
                e.preventDefault();
                onToggle();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onToggle]);

    // Filter nav items by role
    const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

    // Determine effective expansion state: expanded if manually open OR hovered
    const effectivelyExpanded = !collapsed || isHoverExpanded;

    return (
        <div
            className="h-full relative flex-shrink-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ width: collapsed ? 64 : 228 }}
        >
            <motion.aside
                variants={sidebarVariants}
                animate={effectivelyExpanded ? 'expanded' : 'collapsed'}
                transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
                onMouseEnter={() => collapsed && setIsHoverExpanded(true)}
                onMouseLeave={() => collapsed && setIsHoverExpanded(false)}
                className="bg-white text-gray-700 flex flex-col h-full absolute top-0 left-0 bottom-0 overflow-hidden shadow-[1px_0_12px_rgba(3,68,140,0.04)]"
                style={{ borderRight: '1px solid #E8EDF5' }}
            >
                {/* ── Brand ── */}
                <div
                    role="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex flex-col px-5 pt-6 pb-5 cursor-pointer select-none border-b border-gray-100/60"
                >
                    <img
                        src="/aidenlogo.svg"
                        alt="Aiden AI"
                        className={`transition-all duration-400 ease-out flex-shrink-0 ${effectivelyExpanded ? 'w-[68px] opacity-100' : 'w-[42px] mx-auto opacity-70'}`}
                    />
                    <AnimatePresence>
                        {effectivelyExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden whitespace-nowrap w-full"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <div className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-[1px]">
                                        Product
                                    </div>
                                    <div className="text-[15.5px] font-light text-gray-900 tracking-[-0.02em]">
                                        Claims <span className="font-semibold text-primary-700">Workbench</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Divider ── */}
                <div className="mx-3 h-px bg-gray-100 mb-2" />

                {/* ── Navigation ── */}
                <nav className="flex-1 px-2 flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
                    {effectivelyExpanded && (
                        <div className="px-2 pb-1 pt-0.5 text-[9.5px] font-bold text-gray-300 tracking-[0.14em] uppercase transition-opacity duration-300">
                            Navigation
                        </div>
                    )}

                    {visibleNavItems.map(({ path, icon: Icon, label }) => {
                        const isNavActive = path === '/dashboard'
                            ? location.pathname === '/dashboard'
                            : path === '/claims'
                                ? location.pathname === '/claims' || (location.pathname.startsWith('/claims/') && !location.pathname.startsWith('/claims/new'))
                                : location.pathname.startsWith(path);

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                end={path === '/dashboard'}
                                onMouseEnter={() => setHoveredNavItem(path)}
                                onMouseLeave={() => setHoveredNavItem(null)}
                            >
                                {() => (
                                    <motion.div
                                        whileTap={{ scale: 0.97 }}
                                        className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${isNavActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                            }`}
                                    >
                                        {/* Active side bar */}
                                        {isNavActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute left-0 inset-y-[6px] w-[3px] rounded-r-full bg-primary-500"
                                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                            />
                                        )}

                                        <Icon className={`w-[17px] h-[17px] flex-shrink-0 ${isNavActive ? 'text-primary-600' : ''}`} />

                                        <AnimatePresence>
                                            {effectivelyExpanded && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.12 }}
                                                    className="text-[13px] font-medium whitespace-nowrap"
                                                >
                                                    {label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Tooltip when fully collapsed (not hovering over sidebar) */}
                                        <AnimatePresence>
                                            {!effectivelyExpanded && hoveredNavItem === path && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 4, scale: 0.95 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-xl pointer-events-none"
                                                >
                                                    {label}
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* ── Bottom: Settings & Toggle ── */}
                <div className="px-2 pb-4 pt-2 flex flex-col gap-1" style={{ borderTop: '1px solid #E8EDF5' }}>
                    <NavLink to="/settings">
                        {({ isActive }) => (
                            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                }`}>
                                <Settings className="w-[17px] h-[17px] flex-shrink-0 relative z-10" />
                                <AnimatePresence>
                                    {effectivelyExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.12 }}
                                            className="text-[13px] font-medium whitespace-nowrap overflow-hidden relative z-10"
                                        >
                                            Settings
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && effectivelyExpanded && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 inset-y-[6px] w-[3px] rounded-r-full bg-primary-500"
                                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                    />
                                )}
                            </div>
                        )}
                    </NavLink>

                    {/* Elegant Toggle Button */}
                    <button
                        onClick={onToggle}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 text-gray-400 hover:text-gray-700 hover:bg-gray-50 group focus:outline-none`}
                        title="Toggle Sidebar (Cmd + \)"
                    >
                        <div className="flex-shrink-0 w-[17px] h-[17px] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                            {collapsed ? <PanelLeftOpen className="w-full h-full" /> : <PanelLeftClose className="w-full h-full" />}
                        </div>
                        <AnimatePresence>
                            {effectivelyExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                                >
                                    Collapse Menu
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>
        </div >
    );
}
