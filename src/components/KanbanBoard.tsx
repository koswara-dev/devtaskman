import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import type { TaskStatus, Task, Priority } from '../types';
import { TaskModal } from './TaskModal';
import { Plus, AlertOctagon, MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { tasks, users, currentUser, moveTask } = useDevTask();

  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialColStatus, setInitialColStatus] = useState<TaskStatus>('ToDo');

  const [reworkTaskId, setReworkTaskId] = useState<string | null>(null);
  const [reworkComment, setReworkComment] = useState('');
  const [reworkTargetStatus, setReworkTargetStatus] = useState<TaskStatus>('InProgress');

  const [errorToast, setErrorToast] = useState<string | null>(null);

  const columns: { id: TaskStatus; label: string; description: string; color: string }[] = [
    { id: 'Backlog', label: 'Backlog', description: 'Rencana Tugas', color: 'border-slate-200 bg-slate-100/30' },
    { id: 'ToDo', label: 'To Do', description: 'Siap Dikerjakan', color: 'border-sky-200 bg-sky-50/30' },
    { id: 'InProgress', label: 'In Progress', description: 'Sedang Didevelop', color: 'border-indigo-200 bg-indigo-50/30' },
    { id: 'ReadyForQA', label: 'Ready for QA', description: 'Antrean Testing', color: 'border-pink-200 bg-pink-50/30' },
    { id: 'Testing', label: 'Testing', description: 'Sedang Diuji QA', color: 'border-amber-200 bg-amber-50/30' },
    { id: 'Done', label: 'Done', description: 'Lolos Pengujian', color: 'border-emerald-200 bg-emerald-50/30' }
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

  const processMove = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

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

    const res = moveTask(taskId, targetStatus);
    if (!res.success) {
      triggerToast(res.error || 'Perpindahan status ditolak.');
    }
  };

  const submitRework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkTaskId) return;

    if (reworkComment.trim() === '') {
      triggerToast('Komentar alasan rework wajib dimasukkan.');
      return;
    }

    const res = moveTask(reworkTaskId, reworkTargetStatus, reworkComment);
    if (res.success) {
      setReworkTaskId(null);
    } else {
      triggerToast(res.error || 'Perpindahan status ditolak.');
    }
  };

  const triggerToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => {
      setErrorToast(null);
    }, 4500);
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch (p) {
      case 'High': return 'text-red-650 bg-red-50 border-red-200/60';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200/65';
      case 'Low': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const openCreateModal = (status: TaskStatus) => {
    const allowed = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
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
    <div className="space-y-4 select-none relative h-full flex flex-col text-slate-700">
      {/* Top Banner and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 m-0">Papan Kanban</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan drag-and-drop untuk memindahkan tugas. Sistem akan memvalidasi perpindahan status berdasarkan peran Anda.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorToast && (
          <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/35 text-red-600 text-xs rounded-xl flex items-center gap-2 max-w-md animate-in slide-in-from-top-3 duration-300">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold leading-snug">{errorToast}</span>
          </div>
        )}
      </div>

      {/* Kanban Board Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4 h-[72vh]">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const allowedToCreate = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className={`h-full min-w-[200px] border border-slate-200 rounded-2xl p-3 flex flex-col ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/60 flex-shrink-0">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase m-0 flex items-center gap-1.5">
                    {col.label}
                    <span className="text-[10px] bg-slate-200/60 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{col.description}</span>
                </div>

                {allowedToCreate && (
                  <button
                    onClick={() => openCreateModal(col.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    title={`Buat tugas baru di ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Cards Loop */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 kanban-column-scroll">
                {colTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onClick={() => openEditModal(task.id)}
                      className="bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-slate-350 p-3 rounded-xl shadow-sm hover:shadow cursor-grab active:cursor-grabbing transition-all duration-300 group relative"
                    >
                      {/* Priority and ID */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-slate-500 tracking-wide">{task.id}</span>
                        <span className={`px-2 py-0.5 border rounded-full text-[8px] font-extrabold tracking-wider uppercase ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-slate-900 mb-3">
                        {task.title}
                      </h4>

                      {/* Card Footer: Assignee & Date */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                        <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                          Tenggat: {task.dueDate}
                        </span>

                        <div className="flex items-center gap-1.5">
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
                            className="w-5.5 h-5.5 rounded-full border border-slate-200 bg-slate-100 object-cover flex-shrink-0"
                          />
                        </div>
                      </div>

                      {/* Mobile Arrow Selectors (FR-004 Accessibility support) */}
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5 bg-white border border-slate-200 rounded p-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); shiftCard(task, 'left'); }}
                          className="p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Pindah Kiri"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); shiftCard(task, 'right'); }}
                          className="p-0.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Pindah Kanan"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-200/60 rounded-xl flex items-center justify-center text-[10px] text-slate-455 italic">
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
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition resize-none leading-relaxed"
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
