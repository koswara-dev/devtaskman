import React, { useState, useEffect } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { MessageSquare, RotateCcw, ChevronsLeft, ChevronsRight, Maximize2, Minimize2 } from 'lucide-react';
import type { Role } from '../types';

interface NavbarProps {
  onToggleSlackDrawer: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSlackDrawer, isSidebarCollapsed, onToggleSidebar }) => {
  const { currentUser, notifications, resetAllData } = useDevTask();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get only unread slack notifications
  const slackCount = notifications.filter(n => n.type === 'slack' && !n.read).length;

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  if (!currentUser) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

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

  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang data sistem ke kondisi awal? Seluruh perubahan data tugas Anda akan dihapus.')) {
      await resetAllData();
      window.location.reload();
    }
  };

  return (
    <header className={`h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md fixed top-0 right-0 z-20 px-6 flex items-center justify-between transition-all duration-300 ${isSidebarCollapsed ? 'left-16' : 'left-64'}`}>
      {/* Sidebar Toggle & Context Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          {isSidebarCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <span className="text-xs text-slate-500 font-medium">Peran Aktif:</span>
          <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold tracking-wide ${getRoleBadgeStyle(currentUser.role)}`}>
            {getRoleLabel(currentUser.role)}
          </span>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-3">
        {/* Reset Data Helper */}
        <button
          onClick={handleReset}
          title="Reset Seed Data"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-slate-100/60 hover:bg-slate-100 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-all duration-300 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Data
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/65 rounded-xl transition-all duration-300 cursor-pointer"
          title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
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
