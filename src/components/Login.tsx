import React from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { CheckSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import type { User, Role } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { users, switchUser } = useDevTask();

  const handleLogin = (userId: string) => {
    switchUser(userId);
    onLoginSuccess();
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'border-purple-200 text-purple-700 bg-purple-50';
      case 'PM': return 'border-blue-200 text-blue-700 bg-blue-50';
      case 'DevLeader': return 'border-indigo-200 text-indigo-700 bg-indigo-50';
      case 'QALeader': return 'border-pink-200 text-pink-700 bg-pink-50';
      case 'Developer': return 'border-emerald-200 text-emerald-700 bg-emerald-50';
      case 'QA': return 'border-rose-200 text-rose-700 bg-rose-50';
      default: return 'border-slate-200 text-slate-700 bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand */}
        <div className="flex justify-center mb-4">
          <div className="bg-brand-500 p-3.5 rounded-2xl glow-primary">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold font-sans text-slate-800 tracking-tight m-0">
          DevTaskMan Portal
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Sistem Pelacakan Tugas Internal & Kolaborasi Tim Developer & QA.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="glass-panel p-8 rounded-3xl glow-primary">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">
              Pilih Akun Simulasi (Role-Based Access)
            </h3>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Pilih pengguna dengan peran tertentu untuk masuk ke aplikasi. Anda dapat mengubah peran kapan saja secara instan menggunakan tombol <strong>Simulasikan Peran</strong> yang melayang di sudut kanan bawah dashboard.
          </p>

          {/* User Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((user: User) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-brand-500/50 bg-white hover:bg-brand-50/10 text-left transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={user.name}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="min-w-0">
                    <span className="block font-semibold text-slate-700 text-sm truncate group-hover:text-slate-900">
                      {user.name}
                    </span>
                    <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-bold mt-1 tracking-wide uppercase ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-500 flex items-center justify-center border border-slate-200 group-hover:border-brand-400 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <span>DevTaskMan Prototype v0.1 • Powering Dev-QA Collaboration</span>
        </div>
      </div>
    </div>
  );
};
