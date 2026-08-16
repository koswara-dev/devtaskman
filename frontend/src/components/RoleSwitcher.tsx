import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { ShieldAlert, Users, Check } from 'lucide-react';
import type { Role } from '../types';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, users, switchUser } = useDevTask();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const handleSwitch = (userId: string) => {
    switchUser(userId).then(res => {
      if (res.success) setIsOpen(false);
    });
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-600';
      case 'PM': return 'bg-blue-600';
      case 'DevLeader': return 'bg-indigo-600';
      case 'QALeader': return 'bg-pink-600';
      case 'Developer': return 'bg-emerald-600';
      case 'QA': return 'bg-rose-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Selector Panel */}
      {isOpen && (
        <div className="mb-3 w-72 glass-panel shadow-2xl rounded-2xl border border-slate-200 p-4 max-h-[350px] overflow-y-auto glow-primary animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <Users className="w-3.5 h-3.5 text-brand-500" />
              Role Simulator Switcher
            </h4>
            <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200/60">
              {users.length} Users
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            Pilih pengguna di bawah untuk mensimulasikan otentikasi peran dan menguji pembatasan alur kerja Kanban.
          </p>

          <div className="space-y-1">
            {users.map(user => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSwitch(user.id)}
                  className={`w-full text-left flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500/30 text-brand-700 font-semibold'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={user.name}
                      className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <span className="block font-semibold truncate max-w-[130px]">{user.name}</span>
                      <span className="text-[9px] text-slate-500 font-normal">{user.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getRoleColor(user.role)}`} />
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-200 text-white rounded-full font-semibold shadow-lg shadow-slate-950/15 transition-all duration-300 transform active:scale-95 cursor-pointer text-xs"
      >
        <ShieldAlert className="w-4.5 h-4.5 animate-pulse text-brand-400 group-hover:text-white" />
        Simulasikan Peran ({currentUser.role})
      </button>
    </div>
  );
};
