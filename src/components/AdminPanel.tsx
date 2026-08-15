import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import type { Role } from '../types';
import { Download, Upload, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { users, currentUser, updateUserRole, importUsersCSV } = useDevTask();
  
  const [csvContent, setCsvContent] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const rolesList: Role[] = ['Admin', 'PM', 'DevLeader', 'QALeader', 'Developer', 'QA'];

  const handleRoleChange = (userId: string, newRole: Role) => {
    updateUserRole(userId, newRole);
  };

  const handleCSVDownload = () => {
    const csvRows = [
      'name,email,role',
      'Budi Santoso,budi@company.com,Developer',
      'Siti Aminah,siti@company.com,QA',
      'Roni Wijaya,roni@company.com,PM',
      'Linda Hartono,linda@company.com,QALeader'
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'templat_anggota_devtaskman.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    const res = importUsersCSV(csvContent);
    if (res.success) {
      setImportResult({ success: true, message: `Berhasil mengimpor ${res.count} pengguna baru!` });
      setCsvContent('');
    } else {
      setImportResult({ success: false, message: res.error || 'Terjadi kesalahan impor.' });
    }

    setTimeout(() => {
      setImportResult(null);
    }, 5000);
  };

  const handleLoadSampleCSV = () => {
    const sample = `name,email,role
Gunawan Dwi,gunawan@company.com,Developer
Dewi Lestari,dewi@company.com,QA
Hendra Wijaya,hendra@company.com,DevLeader`;
    setCsvContent(sample);
  };

  return (
    <div className="space-y-6 select-none text-slate-700">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 m-0">Admin Panel & Pengaturan</h2>
        <p className="text-xs text-slate-500 mt-1">Mengelola hak akses, peran pengguna, dan integrasi data csv.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Table */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <ShieldAlert className="w-4 h-4 text-purple-650" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Pengaturan Peran (RBAC)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-550 font-bold">
                  <th className="py-2.5 px-3">Nama Anggota</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3 text-right">Peran Pengguna</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-700 flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                      />
                      {u.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{u.email}</td>
                    <td className="py-3 px-3 text-right">
                      {currentUser.role === 'Admin' ? (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                          className="bg-slate-5 border border-slate-200 focus:border-brand-500 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none transition cursor-pointer"
                        >
                          {rolesList.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200/60">
                          {u.role}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSV Import */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Import CSV (FR-007)</h3>
            </div>
            
            <button
              onClick={handleCSVDownload}
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded transition cursor-pointer"
              title="Download templat CSV"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed m-0">
            Unggah/paste data karyawan untuk mendaftarkan akun baru secara massal. Pastikan baris pertama berisi header `name,email,role`.
          </p>

          {importResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              importResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-650'
                : 'bg-red-50 border border-red-200 text-red-650'
            }`}>
              {importResult.success ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{importResult.message}</span>
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="flex-1 flex flex-col space-y-3">
            <textarea
              value={csvContent}
              onChange={e => setCsvContent(e.target.value)}
              rows={6}
              className="w-full bg-slate-5 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-850 focus:outline-none transition resize-none leading-relaxed"
              placeholder="name,email,role&#10;John Doe,john@company.com,Developer&#10;Jane Doe,jane@company.com,QA"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleCSV}
                className="flex-1 py-2 border border-slate-250 hover:border-slate-350 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-650 rounded-xl transition cursor-pointer"
              >
                Gunakan Contoh
              </button>
              <button
                type="submit"
                disabled={!csvContent.trim()}
                className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:bg-slate-100 text-xs font-bold text-white rounded-xl shadow-lg shadow-brand-500/5 hover:shadow-brand-500/15 transition cursor-pointer"
              >
                Proses Impor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
