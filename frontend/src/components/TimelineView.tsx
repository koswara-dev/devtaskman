import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { Calendar, Filter, RotateCcw, MessageSquare } from 'lucide-react';
import type { TaskStatus, Priority } from '../types';
import { TaskModal } from './TaskModal';

export const TimelineView: React.FC = () => {
  const { tasks, users } = useDevTask();

  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate 14 timeline dates: starting from 7 days ago
  const getTimelineStartDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  };

  const timelineStartDate = getTimelineStartDate();
  
  const dates: Date[] = [];
  for (let i = 0; i < 14; i++) {
    dates.push(new Date(timelineStartDate.getTime() + i * 24 * 60 * 60 * 1000));
  }

  const parseDate = (dStr: string) => {
    const parts = dStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0);
  };

  const getColumnSpan = (taskStartDateStr: string | undefined, taskDueDateStr: string) => {
    const start = taskStartDateStr
      ? parseDate(taskStartDateStr)
      : new Date(parseDate(taskDueDateStr).getTime() - 3 * 24 * 60 * 60 * 1000);
    const end = parseDate(taskDueDateStr);

    const startOffset = Math.round((start.getTime() - timelineStartDate.getTime()) / (24 * 60 * 60 * 1000));
    const endOffset = Math.round((end.getTime() - timelineStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    // Grid columns are 1-indexed. We have 14 days, so tracks range from 1 to 15.
    const startCol = Math.max(1, Math.min(14, startOffset + 1));
    const endCol = Math.max(startCol + 1, Math.min(15, endOffset + 1));

    return { startCol, endCol };
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Done': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'Testing': return 'bg-amber-500 hover:bg-amber-600 text-slate-900';
      case 'ReadyForQA': return 'bg-pink-500 hover:bg-pink-600 text-white';
      case 'InProgress': return 'bg-indigo-500 hover:bg-indigo-600 text-white';
      case 'ToDo': return 'bg-sky-500 hover:bg-sky-600 text-white';
      default: return 'bg-slate-400 hover:bg-slate-500 text-white';
    }
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch (p) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesAssignee = filterAssignee === '' || task.assigneeId === filterAssignee;
    const matchesPriority = filterPriority === '' || task.priority === filterPriority;
    return matchesAssignee && matchesPriority;
  });

  const handleResetFilters = () => {
    setFilterAssignee('');
    setFilterPriority('');
  };

  const openEditModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 select-none relative h-full flex flex-col text-slate-700 min-h-0 pr-1">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 m-0">Timeline Penjadwalan</h2>
          <p className="text-xs text-slate-550 mt-1">
            Gantt chart representasi durasi tugas dari tanggal mulai hingga tenggat. Klik tugas untuk mengubah jadwal.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur border border-slate-200 p-2 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-2">
            <Filter className="w-3.5 h-3.5" />
            Saring:
          </div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none transition cursor-pointer"
          >
            <option value="">Semua Anggota</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none transition cursor-pointer"
          >
            <option value="">Semua Prioritas</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Reset button */}
          {(filterAssignee || filterPriority) && (
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-650 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Gantt Timeline Container Layout */}
      <div className="flex-1 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col overflow-hidden min-h-0">
        
        {/* Header Row: Column Headers (Day Calendars) */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
          {/* Left spacer column */}
          <div className="w-[300px] min-w-[300px] border-r border-slate-200 p-4 flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            <span>Daftar Tugas</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              {filteredTasks.length} Tugas
            </span>
          </div>

          {/* Right Days calendar grid */}
          <div className="flex-1 grid grid-cols-14 min-w-[600px] items-stretch text-center">
            {dates.map((date, idx) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
              const dateNum = date.getDate();
              return (
                <div
                  key={idx}
                  className={`py-3 border-r border-slate-100 flex flex-col justify-center items-center gap-0.5 text-[10px] font-bold ${
                    isToday ? 'bg-brand-50 text-brand-600 border-r-brand-100' : 'text-slate-500'
                  }`}
                >
                  <span className="uppercase text-[8px] tracking-wide font-extrabold opacity-75">{dayName}</span>
                  <span className={`w-5.5 h-5.5 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-500 text-white font-extrabold' : ''}`}>
                    {dateNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Timeline rows */}
        <div className="flex-1 overflow-y-auto min-h-0 timeline-rows-container">
          {filteredTasks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 italic gap-2 bg-slate-50/30">
              <Calendar className="w-8 h-8 opacity-40 text-slate-400" />
              <span className="text-xs">Tidak ada tugas terjadwal yang cocok dengan filter aktif.</span>
            </div>
          ) : (
            filteredTasks.map(task => {
              const assignee = users.find(u => u.id === task.assigneeId);
              const { startCol, endCol } = getColumnSpan(task.startDate, task.dueDate);
              
              return (
                <div
                  key={task.id}
                  className="flex border-b border-slate-100 hover:bg-slate-50/30 items-stretch transition-colors min-h-[58px]"
                >
                  {/* Left Column: Task details panel */}
                  <div
                    onClick={() => openEditModal(task.id)}
                    className="w-[300px] min-w-[300px] border-r border-slate-200 p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-slate-405 tracking-wide flex-shrink-0">{task.id}</span>
                        <span className={`px-1.5 py-0.5 border rounded-full text-[8px] font-extrabold tracking-wider uppercase flex-shrink-0 ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-750 truncate leading-snug m-0 hover:text-brand-650">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {task.comments.length > 0 && (
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <MessageSquare className="w-2.8 h-2.8" />
                          {task.comments.length}
                        </span>
                      )}
                      <img
                        src={assignee?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={assignee?.name || 'Unassigned'}
                        title={assignee?.name || 'Belum Ditugaskan'}
                        className="w-6.5 h-6.5 rounded-full border border-slate-200 object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Column: Dynamic CSS Grid scheduling bar */}
                  <div className="flex-1 grid grid-cols-14 min-w-[600px] relative items-center px-1 bg-slate-50/10">
                    
                    {/* Vertical background gridlines */}
                    <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className="border-r border-slate-100/70 h-full w-full" />
                      ))}
                    </div>

                    {/* Gantt Bar element */}
                    <div
                      onClick={() => openEditModal(task.id)}
                      style={{ gridColumnStart: startCol, gridColumnEnd: endCol }}
                      className={`h-8 rounded-xl shadow-sm px-3.5 flex items-center justify-between text-[11px] font-bold cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md z-10 overflow-hidden truncate ${getStatusColor(task.status)}`}
                      title={`${task.title} (${task.startDate || 'Default 3 days ago'} s/d ${task.dueDate})`}
                    >
                      <span className="truncate pr-2">{task.title}</span>
                      <span className="text-[9px] uppercase tracking-wide opacity-80 flex-shrink-0 hidden sm:inline">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Modal (Create & Edit Dialog) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
};
