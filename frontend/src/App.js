import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AIPanel from './components/AIPanel';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewClaim from './pages/fnol/NewClaim';
import PriorityTasks from './pages/fnol/PriorityTasks';
import ClaimHandler from './pages/handler/ClaimHandler';
import SubClaimDetail from './pages/subclaim/SubClaimDetail';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ClaimsRegistry from './pages/ClaimsRegistry';
import Placeholder from './pages/Placeholder';
import Landing from './pages/Landing';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-surface-bg">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-primary-600 border-t-transparent"
      />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to default home page based on role
    if (user.role === 'fnol') return <Navigate to="/claims/new" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onOpenAI={() => setAiOpen(true)} />

        <main className="flex-1 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Global AI Panel */}
      <AIPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        context="Claims"
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['fnol', 'handler', 'manager']}><AppShell><Dashboard /></AppShell></ProtectedRoute>
          } />
          <Route path="/claims/new" element={
            <ProtectedRoute allowedRoles={['fnol', 'manager']}><AppShell><NewClaim /></AppShell></ProtectedRoute>
          } />
          <Route path="/priority-tasks" element={
            <ProtectedRoute allowedRoles={['fnol']}><AppShell><PriorityTasks /></AppShell></ProtectedRoute>
          } />
          <Route path="/claims/:claimId" element={
            <ProtectedRoute allowedRoles={['handler', 'manager']}><AppShell><ClaimHandler /></AppShell></ProtectedRoute>
          } />
          <Route path="/claims/:claimId/sub-claims/:scId" element={
            <ProtectedRoute allowedRoles={['handler', 'manager']}><AppShell><SubClaimDetail /></AppShell></ProtectedRoute>
          } />
          <Route path="/claims" element={
            <ProtectedRoute allowedRoles={['handler', 'manager']}><AppShell><ClaimsRegistry /></AppShell></ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['manager']}><AppShell><Placeholder title="User Management" /></AppShell></ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager']}><AppShell><ManagerDashboard /></AppShell></ProtectedRoute>
          } />
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
