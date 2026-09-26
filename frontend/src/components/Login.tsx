import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { CheckSquare, ArrowRight, ShieldCheck, AlertOctagon, Eye, EyeOff } from 'lucide-react';
import type { Role } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
}

// Display-only seed of the demo accounts (email/name/role/avatar) so the login screen can
// offer one-click sign-in. Every seeded backend account shares the same demo password.
const DEMO_ACCOUNTS: { email: string; name: string; role: Role; avatarUrl: string }[] = [
  { email: 'alice@company.com', name: 'Alice Admin', role: 'Admin', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { email: 'bob@company.com', name: 'Bob PM', role: 'PM', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { email: 'charlie@company.com', name: 'Charlie DevLead', role: 'DevLeader', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { email: 'diana@company.com', name: 'Diana QALead', role: 'QALeader', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { email: 'eric@company.com', name: 'Eric Developer', role: 'Developer', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { email: 'frank@company.com', name: 'Frank Developer', role: 'Developer', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
  { email: 'grace@company.com', name: 'Grace QA', role: 'QA', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { email: 'helen@company.com', name: 'Helen QA', role: 'QA', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' }
];

// Intentional: shared password for the seeded demo accounts only (documented in README's
// Quick Sign-In section), not a real credential — never used for production/non-demo users.
const DEMO_PASSWORD = 'password123'; // nosemgrep: ajinabraham.njsscan.generic.hardcoded_secrets.node_password

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login } = useDevTask();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const attemptLogin = async (loginEmail: string, loginPassword: string) => {
    setError(null);
    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Gagal melakukan proses login.');
    }
  };

  const handleQuickLogin = (accountEmail: string) => {
    attemptLogin(accountEmail, DEMO_PASSWORD);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    attemptLogin(email.trim(), password);
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
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credential Form */}
        <form onSubmit={handleFormSubmit} className="glass-panel p-8 rounded-3xl glow-primary mb-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Masuk ke Akun Anda</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none transition"
                placeholder="nama@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 pr-10 text-xs font-medium text-slate-800 focus:outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg shadow-brand-500/10 transition cursor-pointer"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">
              Akun Demo (Quick Sign-In)
            </h3>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Klik salah satu akun untuk masuk langsung menggunakan kredensial demo bawaan sistem (password: <code>{DEMO_PASSWORD}</code>).
          </p>

          {/* User Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEMO_ACCOUNTS.map(account => (
              <button
                key={account.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin(account.email)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-brand-500/50 bg-white hover:bg-brand-50/10 text-left transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={account.avatarUrl}
                    alt={account.name}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="min-w-0">
                    <span className="block font-semibold text-slate-700 text-sm truncate group-hover:text-slate-900">
                      {account.name}
                    </span>
                    <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-bold mt-1 tracking-wide uppercase ${getRoleColor(account.role)}`}>
                      {account.role}
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
          <span>DevTaskMan v1.0 • Powering Dev-QA Collaboration</span>
        </div>
      </div>
    </div>
  );
};
