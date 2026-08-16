import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import type { TaskStatus, Task, Priority } from '../types';
import { TaskModal } from './TaskModal';
import { Plus, AlertOctagon, MessageSquare, ArrowRight, ArrowLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { tasks, users, currentUser, moveTask } = useDevTask();

  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialColStatus, setInitialColStatus] = useState<TaskStatus>('ToDo');

  const [reworkTaskId, setReworkTaskId] = useState<string | null>(null);
  const [reworkComment, setReworkComment] = useState('');
  const [reworkTargetStatus, setReworkTargetStatus] = useState<TaskStatus>('InProgress');

  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Column collapse states mapping
  const [collapsedCols, setCollapsedCols] = useState<Record<TaskStatus, boolean>>({
    Backlog: false,
    ToDo: false,
    InProgress: false,
    ReadyForQA: false,
    Testing: false,
    Done: false
  });

  const columns: { id: TaskStatus; label: string; description: string; topColor: string }[] = [
    { id: 'Backlog', label: 'Backlog', description: 'Rencana Tugas', topColor: 'border-t-slate-400' },
    { id: 'ToDo', label: 'To Do', description: 'Siap Dikerjakan', topColor: 'border-t-sky-500' },
    { id: 'InProgress', label: 'In Progress', description: 'Sedang Didevelop', topColor: 'border-t-indigo-500' },
    { id: 'ReadyForQA', label: 'Ready for QA', description: 'Antrean Testing', topColor: 'border-t-pink-500' },
    { id: 'Testing', label: 'Testing', description: 'Sedang Diuji QA', topColor: 'border-t-amber-500' },
    { id: 'Done', label: 'Done', description: 'Lolos Pengujian', topColor: 'border-t-emerald-500' }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    processMove(taskId, targetStatus);
  };

  const processMove = async (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !currentUser) return;

    const sourceStatus = task.status;
    if (sourceStatus === targetStatus) return;

    const role = currentUser.role;
    const isQA = role === 'QA';
    const isReworkTransition = sourceStatus === 'Testing' && (targetStatus === 'InProgress' || targetStatus === 'ToDo');

    if (isQA && isReworkTransition) {
      setReworkTaskId(taskId);
      setReworkTargetStatus(targetStatus);
      setReworkComment('');
      return;
    }

    const res = await moveTask(taskId, targetStatus);
    if (!res.success) {
      triggerToast(res.error || 'Perpindahan status ditolak.');
    }
  };

  const submitRework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkTaskId) return;

    if (reworkComment.trim() === '') {
      triggerToast('Komentar alasan rework wajib dimasukkan.');
      return;
    }

    const res = await moveTask(reworkTaskId, reworkTargetStatus, reworkComment);
    if (res.success) {
      setReworkTaskId(null);
    } else {
      triggerToast(res.error || 'Perpindahan status ditolak.');
    }
  };

  const toggleColumnCollapse = (status: TaskStatus) => {
    setCollapsedCols(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const triggerToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => {
      setErrorToast(null);
    }, 4500);
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch (p) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200/60';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200/65';
      case 'Low': return 'text-slate-650 bg-slate-100 border-slate-200';
      default: return 'text-slate-650 bg-slate-100 border-slate-200';
    }
  };

  const openCreateModal = (status: TaskStatus) => {
    const allowed = !!currentUser && ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) {
      triggerToast('Hanya PM, Admin, atau Team Leader yang dapat membuat tugas baru.');
      return;
    }
    setInitialColStatus(status);
    setSelectedTaskId(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const shiftCard = (task: Task, direction: 'left' | 'right') => {
    const currentIdx = columns.findIndex(col => col.id === task.status);
    let nextIdx = direction === 'left' ? currentIdx - 1 : currentIdx + 1;
    if (nextIdx >= 0 && nextIdx < columns.length) {
      processMove(task.id, columns[nextIdx].id);
    }
  };

  return (
    <div className="space-y-4 select-none relative h-full flex flex-col text-slate-700 min-h-0">
      {/* Top Banner and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 m-0">Papan Kanban</h2>
          <p className="text-xs text-slate-550 mt-1">
            Gunakan drag-and-drop untuk memindahkan tugas. Sistem akan memvalidasi perpindahan status berdasarkan peran Anda.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorToast && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl flex items-center gap-2 max-w-md animate-in slide-in-from-top-3 duration-300">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold leading-snug">{errorToast}</span>
          </div>
        )}
      </div>

      {/* Kanban Board Grid (using Flexbox to support collapsible column widths) */}
      <div className="flex-1 flex gap-4 items-stretch overflow-x-auto pb-2 min-h-0 pr-1">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const allowedToCreate = !!currentUser && ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
          const isCollapsed = collapsedCols[col.id];

          if (isCollapsed) {
            return (
              <div
                key={col.id}
                className={`h-full w-[48px] min-w-[48px] border border-slate-200 border-t-4 ${col.topColor} bg-slate-100/30 shadow-sm rounded-2xl py-4 flex flex-col items-center flex-shrink-0 transition-all duration-300`}
              >
                {/* Expand Trigger Button */}
                <button
                  onClick={() => toggleColumnCollapse(col.id)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer mb-4"
                  title={`Expand kolom ${col.label}`}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>

                {/* Vertical Title Lane */}
                <div className="flex-1 flex flex-col items-center justify-start gap-4 select-none pt-2">
                  <span className="text-[9px] bg-slate-205/60 text-slate-650 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    {colTasks.length}
                  </span>
                  <h3 className="writing-vertical rotate-180 text-xs font-extrabold text-slate-700 tracking-wider uppercase m-0 leading-none text-center">
                    {col.label}
                  </h3>
                </div>
              </div>
            );
          }

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className={`h-full flex-1 min-w-[250px] border border-slate-200 border-t-4 ${col.topColor} bg-slate-100/30 shadow-sm rounded-2xl p-4 flex flex-col transition-all duration-300`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/60 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase m-0 flex items-center gap-1.5 truncate">
                    {col.label}
                    <span className="text-[10px] bg-slate-200/60 text-slate-655 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </h3>
                  <span className="text-[9px] text-slate-400 font-semibold truncate hidden lg:block" title={col.description}>
                    {col.description}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {allowedToCreate && (
                    <button
                      onClick={() => openCreateModal(col.id)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer"
                      title={`Buat tugas baru di ${col.label}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleColumnCollapse(col.id)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer"
                    title={`Collapse kolom ${col.label}`}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards Loop */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 kanban-column-scroll max-h-[calc(100vh-230px)]">
                {colTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onClick={() => openEditModal(task.id)}
                      className="bg-white hover:bg-slate-50/30 border border-slate-200/80 hover:border-slate-350 p-4 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-300 group relative"
                    >
                      {/* Priority and ID */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wide">{task.id}</span>
                        <span className={`px-2 py-0.5 border rounded-full text-[8px] font-extrabold tracking-wider uppercase ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-white mb-4">
                        {task.title}
                      </h4>

                      {/* Card Footer: Assignee & Date */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                          Tenggat: {task.dueDate}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Mobile Arrow Selectors (FR-004 Accessibility support, integrated in footer) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-slate-105 border border-slate-200 rounded p-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); shiftCard(task, 'left'); }}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Pindah Kiri"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); shiftCard(task, 'right'); }}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Pindah Kanan"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Comments Counter */}
                          {task.comments.length > 0 && (
                            <span className="text-[9px] text-slate-500 flex items-center gap-0.5 mr-1">
                              <MessageSquare className="w-3 h-3 text-slate-455" />
                              {task.comments.length}
                            </span>
                          )}

                          {/* Avatar */}
                          <img
                            src={assignee?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={assignee?.name || 'Unassigned'}
                            title={assignee?.name || 'Belum Ditugaskan'}
                            className="w-5.5 h-5.5 rounded-full border border-white ring-2 ring-slate-100 object-cover flex-shrink-0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-200/50 rounded-xl flex items-center justify-center text-[10px] text-slate-400 italic bg-slate-50/20">
                    Kolom Kosong
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal (Create & Edit Dialog) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTaskId}
        initialStatus={initialColStatus}
      />

      {/* QA Rework Comment Modal Interceptor */}
      {reworkTaskId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={submitRework} className="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-amber-600">
              <AlertOctagon className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider m-0">Input Rejek Pengujian (Rework)</h3>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed">
              Anda memindahkan tugas **{reworkTaskId}** dari *Testing* kembali ke *{reworkTargetStatus}*. Berdasarkan aturan QA, Anda wajib memasukkan deskripsi bug atau alasan rework untuk memandu tim Developer.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alasan Rework / Deskripsi Bug</label>
              <textarea
                value={reworkComment}
                onChange={e => setReworkComment(e.target.value)}
                rows={3}
                required
                className="w-full bg-slate-5 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition resize-none leading-relaxed"
                placeholder="Jelaskan fungsionalitas yang gagal atau bug yang ditemukan secara detail..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReworkTaskId(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-500 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-900 rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer"
              >
                Tolak & Kirim Rework
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
