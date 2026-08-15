import React from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { LayoutDashboard, Kanban, Users, LogOut, CheckSquare } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser } = useDevTask();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'PM', 'DevLeader', 'QALeader', 'Developer', 'QA'] },
    { id: 'kanban', label: 'Papan Kanban', icon: Kanban, roles: ['Admin', 'PM', 'DevLeader', 'QALeader', 'Developer', 'QA'] },
    { id: 'admin', label: 'Admin Panel', icon: Users, roles: ['Admin'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/80 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-200/80 flex items-center gap-3">
        <div className="bg-brand-500 p-2 rounded-lg glow-primary">
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900 m-0 leading-none">DevTaskMan</h1>
          <span className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider">Internal Workspace</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-100/30">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full border border-slate-200 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate m-0">{currentUser.name}</p>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5">{currentUser.email}</span>
          </div>
        </div>
        <button
          onClick={() => setCurrentTab('login')}
          className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-100 text-slate-600 hover:text-red-600 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
};
