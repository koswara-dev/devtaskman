import React, { useState, useEffect } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import type { Priority, TaskStatus, Role } from '../types';
import { X, Calendar, UserCheck, AlertOctagon, MessageSquare, ClipboardList, PlusCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  initialStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId, initialStatus = 'ToDo' }) => {
  const { currentUser, users, tasks, addTask, updateTask, addComment } = useDevTask();
  const task = taskId ? tasks.find(t => t.id === taskId) : undefined;
  const isEditMode = !!task;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('ToDo');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  const [commentText, setCommentText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate);
      setFormError(null);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus(initialStatus);
      setAssigneeId('');
      setDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setFormError(null);
    }
  }, [taskId, isOpen]);

  if (!isOpen) return null;

  const isAuthorized = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Judul tugas wajib diisi.');
      return;
    }

    const payload = {
      title,
      description,
      priority,
      status,
      assigneeId: assigneeId === '' ? null : assigneeId,
      dueDate
    };

    if (isEditMode && task) {
      const res = updateTask(task.id, payload);
      if (res.success) {
        onClose();
      } else {
        setFormError(res.error || 'Terjadi kesalahan.');
      }
    } else {
      const res = addTask(payload);
      if (res.success) {
        onClose();
      } else {
        setFormError(res.error || 'Terjadi kesalahan.');
      }
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (task) {
      addComment(task.id, commentText);
      setCommentText('');
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'Admin': return 'Admin';
      case 'PM': return 'PM';
      case 'DevLeader': return 'Dev Lead';
      case 'QALeader': return 'QA Lead';
      case 'Developer': return 'Dev';
      case 'QA': return 'QA';
      default: return role;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="glass-panel w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left Side: Form Fields */}
        <form onSubmit={handleSave} className="flex-1 p-6 flex flex-col overflow-y-auto border-r border-slate-200 text-slate-700">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4">
            <h3 className="text-base font-bold text-slate-850 uppercase tracking-wider flex items-center gap-2 m-0">
              {isEditMode ? <ClipboardList className="w-5 h-5 text-brand-500" /> : <PlusCircle className="w-5 h-5 text-brand-500" />}
              {isEditMode ? `Edit Tugas - ${task?.id}` : 'Buat Tugas Baru'}
            </h3>
            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Judul Tugas</label>
              <input
                type="text"
                disabled={!isAuthorized}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none transition disabled:opacity-50"
                placeholder="Masukkan judul tugas..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deskripsi Tugas</label>
              <textarea
                disabled={!isAuthorized}
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none transition disabled:opacity-50 resize-none leading-relaxed"
                placeholder="Tulis deskripsi detail tugas di sini..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prioritas</label>
                <select
                  disabled={!isAuthorized}
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-705 focus:outline-none transition disabled:opacity-50 cursor-pointer"
                >
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">⚪ Low</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  disabled={!isAuthorized}
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-705 focus:outline-none transition disabled:opacity-50 cursor-pointer"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="ReadyForQA">Ready for QA</option>
                  <option value="Testing">Testing</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Assignee (Penugasan)
                </label>
                <select
                  disabled={!isAuthorized}
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-705 focus:outline-none transition disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Belum Ditugaskan</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({getRoleLabel(u.role)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Tenggat Waktu (Due Date)
                </label>
                <input
                  type="date"
                  disabled={!isAuthorized}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-705 focus:outline-none transition disabled:opacity-50 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-550 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            {isAuthorized && (
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition cursor-pointer"
              >
                {isEditMode ? 'Simpan Perubahan' : 'Buat Tugas'}
              </button>
            )}
          </div>
        </form>

        {/* Right Side: Comments and History Logs */}
        {isEditMode ? (
          <div className="w-full md:w-[350px] p-6 bg-slate-100/40 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 flex-shrink-0">
              <span className="text-xs font-extrabold text-slate-750 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                Kolaborasi & Log
              </span>
              <button
                type="button"
                onClick={onClose}
                className="hidden md:block p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 flex flex-col pr-1">
              {/* Comment Thread */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">Komentar ({task?.comments.length})</h4>
                <div className="space-y-3">
                  {task?.comments.map(comment => (
                    <div key={comment.id} className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-[11px] leading-relaxed">
                      <div className="flex items-center justify-between mb-1 text-slate-500 font-bold">
                        <span className="text-slate-800">{comment.userName} ({getRoleLabel(comment.role)})</span>
                        <span className="text-[9px] font-normal">{new Date(comment.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-600 m-0 break-words whitespace-pre-wrap font-medium">{comment.text}</p>
                    </div>
                  ))}
                  {task?.comments.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic block py-2">Belum ada komentar</span>
                  )}
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="flex-shrink-0 border-t border-slate-200/60 pt-3">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-55 border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-1.5 text-[11px] text-slate-800 focus:outline-none transition resize-none leading-normal"
                  placeholder="Ketik komentar..."
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="mt-1 w-full py-1.5 bg-slate-100 hover:bg-brand-500 hover:text-white disabled:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-[10px] rounded-lg transition uppercase tracking-wider cursor-pointer"
                >
                  Kirim Komentar
                </button>
              </form>

              {/* Audit History Logs */}
              <div className="border-t border-slate-200/60 pt-4 pb-2">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  Log Riwayat
                </h4>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {task?.history.map(log => (
                    <div key={log.id} className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                      <span className="text-brand-500 font-bold flex-shrink-0 mt-0.5">•</span>
                      <span>
                        <strong className="text-slate-700 font-semibold">{log.userName}</strong> {log.action}
                        <span className="text-[9px] text-slate-400 font-normal block mt-0.5">{formatDate(log.timestamp)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:block w-80 p-6 bg-slate-100/40 flex-shrink-0 text-slate-600">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Informasi Peran</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Pembuatan tiket baru hanya dapat dilakukan oleh **Project Manager (PM)** atau **Team Leader (Dev/QA)**.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Secara default, status awal tugas baru diset ke **To Do** atau **Backlog** dengan prioritas menengah.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
