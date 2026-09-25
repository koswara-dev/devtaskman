import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import type { TaskStatus } from '../types';
import { BarChart3, PieChart, Activity, CheckCircle2, ListTodo, AlertTriangle, Users, FileDown, AlertOctagon } from 'lucide-react';
import { downloadFile } from '../api/client';

const REPORTING_ROLES = ['Admin', 'PM', 'DevLeader', 'QALeader'];

const ROLE_GREETINGS: Record<string, string> = {
  Admin: 'Kontrol penuh sistem — pantau seluruh proyek dan tim.',
  PM: 'Pantau progres tim & prioritas rilis dari satu layar.',
  DevLeader: 'Awasi beban kerja developer dan kualitas kode.',
  QALeader: 'Kelola strategi pengujian dan status QA tim.',
  Developer: 'Fokus pada tugas aktif dan target penyelesaian.',
  QA: 'Cek antrian pengujian dan tugas siap divalidasi.'
};

export const Dashboard: React.FC = () => {
  const { tasks, users, currentUser } = useDevTask();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const canDownloadReport = !!currentUser && REPORTING_ROLES.includes(currentUser.role);

  const handleDownloadReport = async () => {
    setDownloadError(null);
    setIsDownloading(true);
    try {
      await downloadFile('/statistics/report.pdf', 'devtaskman-report.pdf');
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Gagal mengunduh laporan PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const inProgressCount = tasks.filter(t => t.status === 'InProgress').length;
  const testingCount = tasks.filter(t => t.status === 'Testing').length;
  const readyQaCount = tasks.filter(t => t.status === 'ReadyForQA').length;
  const todoCount = tasks.filter(t => t.status === 'ToDo').length;
  const backlogCount = tasks.filter(t => t.status === 'Backlog').length;

  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const reworkTasksCount = tasks.filter(t => 
    t.comments.some(c => c.text.includes('[QA REJECT/REWORK]'))
  ).length;

  // Priority Stats
  const highPriority = tasks.filter(t => t.priority === 'High').length;
  const mediumPriority = tasks.filter(t => t.priority === 'Medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'Low').length;

  // Status Colors for SVG Donut (adjusted for Light Mode vividness)
  const STATUS_COLORS: Record<TaskStatus, string> = {
    Backlog: '#64748b', // Slate
    ToDo: '#0ea5e9',    // Sky
    InProgress: '#4f46e5', // Indigo
    ReadyForQA: '#db2777', // Pink
    Testing: '#d97706',   // Amber
    Done: '#059669'       // Emerald
  };

  const statusList = [
    { label: 'Backlog', count: backlogCount, color: STATUS_COLORS.Backlog },
    { label: 'To Do', count: todoCount, color: STATUS_COLORS.ToDo },
    { label: 'In Progress', count: inProgressCount, color: STATUS_COLORS.InProgress },
    { label: 'Ready for QA', count: readyQaCount, color: STATUS_COLORS.ReadyForQA },
    { label: 'Testing', count: testingCount, color: STATUS_COLORS.Testing },
    { label: 'Done', count: doneCount, color: STATUS_COLORS.Done }
  ].filter(s => s.count > 0 || total === 0);

  // Donut SVG Calculations
  let accumulatedPercent = 0;
  const donutSegments = statusList.map(item => {
    const percent = total > 0 ? (item.count / total) * 100 : 0;
    const dashOffset = 100 - accumulatedPercent + 25;
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      dashOffset
    };
  });

  const maxPriorityCount = Math.max(highPriority, mediumPriority, lowPriority, 1);
  const getPriorityWidth = (count: number) => {
    return `${(count / maxPriorityCount) * 100}%`;
  };

  // User workload calculations
  const userWorkload = users.map(user => {
    const assignedTasks = tasks.filter(t => t.assigneeId === user.id);
    const completed = assignedTasks.filter(t => t.status === 'Done').length;
    const active = assignedTasks.length - completed;
    return {
      user,
      totalCount: assignedTasks.length,
      completed,
      active
    };
  }).sort((a, b) => b.totalCount - a.totalCount);

  return (
    <div className="space-y-6 select-none text-slate-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 m-0">Ringkasan Dasbor</h2>
          <p className="text-xs text-slate-500 mt-1">Status real-time proyek DevTaskMan, rasio prioritas, dan beban kerja tim.</p>
          {currentUser && (
            <p className="text-xs font-semibold text-brand-600 mt-1.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100">{currentUser.role}</span>
              <span className="text-slate-500 font-normal">{ROLE_GREETINGS[currentUser.role] ?? 'Selamat datang kembali.'}</span>
            </p>
          )}
        </div>

        {canDownloadReport && (
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow-lg shadow-brand-500/10 transition cursor-pointer flex-shrink-0"
          >
            <FileDown className="w-4 h-4" />
            {isDownloading ? 'Membuat PDF...' : 'Unduh Laporan PDF'}
          </button>
        )}
      </div>

      {downloadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-slate-350 hover:shadow-md transition-all duration-300">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Tugas</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{total}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-slate-350 hover:shadow-md transition-all duration-300">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Tugas Selesai (Done)</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{doneCount}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-slate-350 hover:shadow-md transition-all duration-300">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Penyelesaian (Rate)</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{completionRate}%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-slate-350 hover:shadow-md transition-all duration-300">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Tugas Rework (QA)</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{reworkTasksCount}</span>
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Status Distribution */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80">
            <PieChart className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Distribusi Status Tugas</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut */}
            <div className="relative w-44 h-44">
              {total === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  Tidak ada data
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="12"
                    />
                    {/* Segments */}
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="12"
                        pathLength="100"
                        strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
                        strokeDashoffset={seg.dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800">{total}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Tiket</span>
                  </div>
                </>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 max-w-[280px]">
              {statusList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 block truncate">{item.label}</span>
                    <span className="text-[10px] text-slate-500 block font-medium">{item.count} Tugas ({Math.round(total > 0 ? (item.count / total) * 100 : 0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Rasio Prioritas</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-5 text-slate-700">
            {/* High Priority */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  High Priority
                </span>
                <span>{highPriority} Tugas</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: getPriorityWidth(highPriority) }}
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  Medium Priority
                </span>
                <span>{mediumPriority} Tugas</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: getPriorityWidth(mediumPriority) }}
                />
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-405 rounded-full" />
                  Low Priority
                </span>
                <span>{lowPriority} Tugas</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: getPriorityWidth(lowPriority) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom workload list */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80">
          <Users className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Beban Kerja Anggota Tim</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Anggota Tim</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Peran</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Tugas Aktif</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Tugas Selesai</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Total Tiket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userWorkload.map(({ user, totalCount, completed, active }) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    {user.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200/60 uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-brand-600">{active}</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600">{completed}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800 text-right">{totalCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
