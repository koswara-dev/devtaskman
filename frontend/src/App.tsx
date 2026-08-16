import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DevTaskProvider, useDevTask } from './context/DevTaskContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { RoleSwitcher } from './components/RoleSwitcher';
import { SlackDrawer } from './components/SlackDrawer';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { AdminPanel } from './components/AdminPanel';
import { TimelineView } from './components/TimelineView';

function DashboardLayout() {
  const { currentUser } = useDevTask();
  const [isSlackOpen, setIsSlackOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return <Navigate to="/login" replace />;

  const currentTab = location.pathname.substring(1) || 'dashboard';

  const handleSetTab = (tab: string) => {
    if (tab === 'login') {
      navigate('/login');
    } else {
      navigate(`/${tab}`);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 pt-16 text-slate-800 font-sans antialiased transition-all duration-300 ${isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <Navbar
        onToggleSlackDrawer={() => setIsSlackOpen(!isSlackOpen)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <SlackDrawer isOpen={isSlackOpen} onClose={() => setIsSlackOpen(false)} />

      <main className={`p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] ${['kanban', 'timeline'].includes(currentTab) ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/timeline" element={<TimelineView />} />
          {currentUser.role === 'Admin' && <Route path="/admin" element={<AdminPanel />} />}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <RoleSwitcher />
    </div>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onLoginSuccess={() => navigate('/dashboard')} />;
}

function AppContent() {
  const { isBootstrapping } = useDevTask();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Memuat sesi...
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="*" element={<DashboardLayout />} />
      </Routes>
    </HashRouter>
  );
}

export function App() {
  return (
    <DevTaskProvider>
      <AppContent />
    </DevTaskProvider>
  );
}

export default App;
