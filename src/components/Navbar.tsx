import React from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { MessageSquare, RotateCcw } from 'lucide-react';
import type { Role } from '../types';

interface NavbarProps {
  onToggleSlackDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSlackDrawer }) => {
  const { currentUser, notifications, resetAllData } = useDevTask();

  // Get only unread slack notifications
  const slackCount = notifications.filter(n => n.type === 'slack').length;

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'PM': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'DevLeader': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'QALeader': return 'bg-pink-50 border-pink-200 text-pink-700';
      case 'Developer': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'QA': return 'bg-rose-50 border-rose-200 text-rose-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'Admin': return 'System Administrator';
      case 'PM': return 'Project Manager';
      case 'DevLeader': return 'Dev Leader';
      case 'QALeader': return 'QA Leader';
      case 'Developer': return 'Developer';
      case 'QA': return 'QA Engineer';
      default: return role;
    }
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang data sistem ke kondisi awal? Seluruh perubahan data tugas Anda akan dihapus.')) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md fixed top-0 right-0 left-64 z-20 px-6 flex items-center justify-between">
      {/* Search Bar / Context Status */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium">Peran Aktif:</span>
        <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold tracking-wide ${getRoleBadgeStyle(currentUser.role)}`}>
          {getRoleLabel(currentUser.role)}
        </span>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Reset Data Helper */}
        <button
          onClick={handleReset}
          title="Reset Seed Data"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-slate-100/60 hover:bg-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-all duration-300 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Data
        </button>

        {/* Slack notification Simulator Button */}
        <button
          onClick={onToggleSlackDrawer}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/65 rounded-xl transition-all duration-300 cursor-pointer"
          title="Buka Panel Slack Simulator"
        >
          <MessageSquare className="w-5 h-5" />
          {slackCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-[9px] text-white font-extrabold flex items-center justify-center rounded-full animate-pulse border border-white">
              {slackCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
