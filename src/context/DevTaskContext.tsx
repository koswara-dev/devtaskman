import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, User, Notification, Role, TaskStatus, Comment, HistoryLog } from '../types';

interface DevTaskContextType {
  currentUser: User;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, role: Role) => void;
  addTask: (task: Omit<Task, 'id' | 'comments' | 'history'>) => { success: boolean; error?: string };
  updateTask: (taskId: string, updatedTask: Partial<Task>) => { success: boolean; error?: string };
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus, qaComment?: string) => { success: boolean; error?: string };
  addComment: (taskId: string, text: string) => void;
  importUsersCSV: (csvText: string) => { success: boolean; count: number; error?: string };
  resetAllData: () => void;
}

const DevTaskContext = createContext<DevTaskContextType | undefined>(undefined);

// Initial Mock Users
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@company.com', role: 'Admin', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'u2', name: 'Bob PM', email: 'bob@company.com', role: 'PM', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'u3', name: 'Charlie DevLead', email: 'charlie@company.com', role: 'DevLeader', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'u4', name: 'Diana QALead', email: 'diana@company.com', role: 'QALeader', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: 'u5', name: 'Eric Developer', email: 'eric@company.com', role: 'Developer', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: 'u6', name: 'Frank Developer', email: 'frank@company.com', role: 'Developer', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
  { id: 'u7', name: 'Grace QA', email: 'grace@company.com', role: 'QA', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'u8', name: 'Helen QA', email: 'helen@company.com', role: 'QA', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
];

// Initial Mock Tasks
const DEFAULT_TASKS: Task[] = [
  {
    id: 'TSK-101',
    title: 'Konfigurasi Setup Tailwind CSS v3',
    description: 'Mengintegrasikan Tailwind CSS dengan bundler Vite, mengonfigurasi postcss, dan menyiapkan variabel warna tema premium untuk visualisasi dashboard.',
    priority: 'High',
    status: 'Done',
    assigneeId: 'u5',
    dueDate: '2026-08-14',
    comments: [
      { id: 'c1', userName: 'Eric Developer', role: 'Developer', text: 'Tailwind sudah aktif dan saya tambahkan helper glassmorphism.', timestamp: '2026-08-14T10:00:00Z' }
    ],
    history: [
      { id: 'h1', userName: 'Bob PM', action: 'Membuat tugas', timestamp: '2026-08-13T09:00:00Z' },
      { id: 'h2', userName: 'Eric Developer', action: 'Memindahkan ke In Progress', timestamp: '2026-08-13T10:30:00Z' },
      { id: 'h3', userName: 'Eric Developer', action: 'Memindahkan ke Ready for QA', timestamp: '2026-08-14T09:00:00Z' },
      { id: 'h4', userName: 'Grace QA', action: 'Memindahkan ke Testing', timestamp: '2026-08-14T09:30:00Z' },
      { id: 'h5', userName: 'Grace QA', action: 'Memindahkan ke Done', timestamp: '2026-08-14T11:00:00Z' },
    ]
  },
  {
    id: 'TSK-102',
    title: 'Desain Skema Database Mock & State',
    description: 'Merancang data model TypeScript dan arsitektur LocalStorage untuk memfasilitasi audit history tugas, pendelegasian, dan simulasi Slack.',
    priority: 'High',
    status: 'Done',
    assigneeId: 'u3',
    dueDate: '2026-08-15',
    comments: [],
    history: [
      { id: 'h1', userName: 'Charlie DevLead', action: 'Membuat tugas', timestamp: '2026-08-14T08:00:00Z' },
      { id: 'h2', userName: 'Charlie DevLead', action: 'Memindahkan ke In Progress', timestamp: '2026-08-14T09:00:00Z' },
      { id: 'h3', userName: 'Charlie DevLead', action: 'Memindahkan ke Ready for QA', timestamp: '2026-08-15T08:00:00Z' },
      { id: 'h4', userName: 'Diana QALead', action: 'Memindahkan ke Testing', timestamp: '2026-08-15T09:00:00Z' },
      { id: 'h5', userName: 'Diana QALead', action: 'Memindahkan ke Done', timestamp: '2026-08-15T11:30:00Z' }
    ]
  },
  {
    id: 'TSK-103',
    title: 'Pengembangan Halaman Dashboard Utama',
    description: 'Membuat widget visual menggunakan SVG interaktif untuk menyajikan bagan status tugas (Backlog, To Do, In Progress, Ready for QA, Testing, Done) dan rasio prioritas.',
    priority: 'Medium',
    status: 'InProgress',
    assigneeId: 'u5',
    dueDate: '2026-08-18',
    comments: [
      { id: 'c1', userName: 'Bob PM', role: 'PM', text: 'Pastikan bagan SVG responsif di layar tablet.', timestamp: '2026-08-15T12:00:00Z' }
    ],
    history: [
      { id: 'h1', userName: 'Bob PM', action: 'Membuat tugas', timestamp: '2026-08-15T08:00:00Z' },
      { id: 'h2', userName: 'Eric Developer', action: 'Memindahkan ke In Progress', timestamp: '2026-08-15T10:00:00Z' }
    ]
  },
  {
    id: 'TSK-104',
    title: 'Unit Testing Modul Otentikasi',
    description: 'Menulis test suite komprehensif untuk memastikan token JWT dengan expiry 24 jam berfungsi aman dan skenario error terlayani baik.',
    priority: 'High',
    status: 'ReadyForQA',
    assigneeId: 'u6',
    dueDate: '2026-08-16',
    comments: [],
    history: [
      { id: 'h1', userName: 'Charlie DevLead', action: 'Membuat tugas', timestamp: '2026-08-14T11:00:00Z' },
      { id: 'h2', userName: 'Frank Developer', action: 'Memindahkan ke In Progress', timestamp: '2026-08-14T13:00:00Z' },
      { id: 'h3', userName: 'Frank Developer', action: 'Memindahkan ke Ready for QA', timestamp: '2026-08-15T14:00:00Z' }
    ]
  },
  {
    id: 'TSK-105',
    title: 'Simulasi Notifikasi Slack API',
    description: 'Membangun webhook simulation panel yang memantau trigger perubahan status tugas (terutama handover ke QA dan reject QA).',
    priority: 'Medium',
    status: 'Testing',
    assigneeId: 'u6',
    dueDate: '2026-08-19',
    comments: [
      { id: 'c1', userName: 'Grace QA', role: 'QA', text: 'Mulai melakukan verifikasi payload pesan Slack.', timestamp: '2026-08-15T15:30:00Z' }
    ],
    history: [
      { id: 'h1', userName: 'Bob PM', action: 'Membuat tugas', timestamp: '2026-08-15T09:00:00Z' },
      { id: 'h2', userName: 'Frank Developer', action: 'Memindahkan ke In Progress', timestamp: '2026-08-15T10:00:00Z' },
      { id: 'h3', userName: 'Frank Developer', action: 'Memindahkan ke Ready for QA', timestamp: '2026-08-15T14:30:00Z' },
      { id: 'h4', userName: 'Grace QA', action: 'Memindahkan ke Testing', timestamp: '2026-08-15T15:00:00Z' }
    ]
  },
  {
    id: 'TSK-106',
    title: 'Halaman Administrasi & CSV Import',
    description: 'Menyusun antarmuka pengelolaan peran pengguna, download templat CSV, serta formulir import nama anggota baru.',
    priority: 'Low',
    status: 'ToDo',
    assigneeId: null,
    dueDate: '2026-08-25',
    comments: [],
    history: [
      { id: 'h1', userName: 'Bob PM', action: 'Membuat tugas', timestamp: '2026-08-15T11:00:00Z' }
    ]
  },
  {
    id: 'TSK-107',
    title: 'Optimasi Ukuran Bundling Webpack/Vite',
    description: 'Menerapkan dynamic imports, chunk splitting, dan meninjau tree shaking untuk mempercepat load time aplikasi agar di bawah 1 detik.',
    priority: 'Low',
    status: 'Backlog',
    assigneeId: null,
    dueDate: '2026-09-02',
    comments: [],
    history: [
      { id: 'h1', userName: 'Charlie DevLead', action: 'Membuat tugas', timestamp: '2026-08-15T11:30:00Z' }
    ]
  }
];

export const DevTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dtm_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS[1]; // Default to Bob (PM) for starting testing
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dtm_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('dtm_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('dtm_notifications');
    const defaultNotifs: Notification[] = [
      {
        id: 'n1',
        taskId: 'TSK-104',
        taskTitle: 'Unit Testing Modul Otentikasi',
        message: 'Tugas TSK-104 - Unit Testing Modul Otentikasi siap diuji oleh tim QA.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'slack'
      },
      {
        id: 'n2',
        taskId: 'TSK-102',
        taskTitle: 'Desain Skema Database Mock & State',
        message: 'System Log: TSK-102 status diubah ke Done oleh Diana QALead.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'system'
      }
    ];
    return saved ? JSON.parse(saved) : defaultNotifs;
  });

  // Save states to local storage on change
  useEffect(() => {
    localStorage.setItem('dtm_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dtm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dtm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dtm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const updateUserRole = (userId: string, role: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role }));
    }
    
    // Log system activity
    const sysNotif: Notification = {
      id: `sys-${Date.now()}`,
      taskId: 'ADMIN',
      taskTitle: 'Manajemen Peran',
      message: `System Log: Peran pengguna ${users.find(u => u.id === userId)?.name} diubah ke ${role} oleh ${currentUser.name}.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [sysNotif, ...prev]);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'comments' | 'history'>) => {
    // Check permission
    const allowed = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) {
      return { success: false, error: 'Hanya Admin, PM, atau Team Leader yang dapat membuat tugas.' };
    }

    const nextId = `TSK-${100 + tasks.length + 1}`;
    const newTask: Task = {
      ...taskData,
      id: nextId,
      comments: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          userName: currentUser.name,
          action: `Membuat tugas dengan status "${taskData.status}"`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setTasks(prev => [...prev, newTask]);

    // System Log
    const sysNotif: Notification = {
      id: `sys-${Date.now()}`,
      taskId: nextId,
      taskTitle: taskData.title,
      message: `System Log: Tugas baru "${nextId} - ${taskData.title}" dibuat oleh ${currentUser.name}.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [sysNotif, ...prev]);

    return { success: true };
  };

  const updateTask = (taskId: string, updatedData: Partial<Task>) => {
    const allowed = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) {
      return { success: false, error: 'Hanya Admin, PM, atau Team Leader yang dapat mengedit detail tugas.' };
    }

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const changes: string[] = [];
        if (updatedData.title && updatedData.title !== t.title) changes.push(`Judul diubah ke "${updatedData.title}"`);
        if (updatedData.priority && updatedData.priority !== t.priority) changes.push(`Prioritas diubah ke ${updatedData.priority}`);
        if (updatedData.dueDate && updatedData.dueDate !== t.dueDate) changes.push(`Tenggat diubah ke ${updatedData.dueDate}`);
        if (updatedData.assigneeId !== undefined && updatedData.assigneeId !== t.assigneeId) {
          const assigneeName = users.find(u => u.id === updatedData.assigneeId)?.name || 'Unassigned';
          changes.push(`Assignee diubah ke ${assigneeName}`);
        }

        const newHistoryLogs = changes.map((actionText, index) => ({
          id: `hist-${Date.now()}-${index}`,
          userName: currentUser.name,
          action: actionText,
          timestamp: new Date().toISOString()
        }));

        return {
          ...t,
          ...updatedData,
          history: [...t.history, ...newHistoryLogs]
        };
      }
      return t;
    }));

    return { success: true };
  };

  const deleteTask = (taskId: string) => {
    const allowed = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));

    const sysNotif: Notification = {
      id: `sys-${Date.now()}`,
      taskId: 'DELETE',
      taskTitle: 'Hapus Tugas',
      message: `System Log: Tugas ${taskId} telah dihapus oleh ${currentUser.name}.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [sysNotif, ...prev]);
  };

  // Enforces Transition Rules
  const moveTask = (taskId: string, targetStatus: TaskStatus, qaComment?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Tugas tidak ditemukan.' };

    const currentStatus = task.status;
    if (currentStatus === targetStatus) return { success: true };

    const role = currentUser.role;

    // RULE 1: Admin, PM, DevLeader, QALeader can move anything, anywhere
    const isPrivileged = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(role);

    if (!isPrivileged) {
      // RULE 2: Developer rules
      if (role === 'Developer') {
        // Can only move to Backlog, ToDo, InProgress, ReadyForQA
        const allowedTargets: TaskStatus[] = ['Backlog', 'ToDo', 'InProgress', 'ReadyForQA'];
        if (!allowedTargets.includes(targetStatus)) {
          return {
            success: false,
            error: 'Sebagai Developer, Anda hanya dapat memindahkan tugas sampai status "Ready for QA". Kolom Testing dan Done hanya dapat diakses oleh QA.'
          };
        }
        // Cannot move tasks that are currently in Testing or Done
        if (['Testing', 'Done'].includes(currentStatus)) {
          return {
            success: false,
            error: 'Tugas sudah berada di tangan tim QA (Testing/Done). Anda tidak dapat mengubah statusnya secara manual.'
          };
        }
      }

      // RULE 3: QA Engineer rules
      if (role === 'QA') {
        // QA can pull from ReadyForQA into Testing, or from Testing into Done, or return to InProgress/ToDo (Rework)
        if (currentStatus === 'ReadyForQA' && targetStatus !== 'Testing') {
          return {
            success: false,
            error: 'Sebagai QA, Anda harus memindahkan tugas ke "Testing" terlebih dahulu sebelum menyelesaikannya.'
          };
        }
        
        // Block QA from dragging to Backlog directly
        if (targetStatus === 'Backlog') {
          return {
            success: false,
            error: 'QA Engineer tidak diizinkan memindahkan tugas kembali ke Backlog. Silakan kembalikan ke "In Progress" jika ada rework.'
          };
        }

        // Return from Testing to InProgress (Rework) requires a comment
        if (currentStatus === 'Testing' && (targetStatus === 'InProgress' || targetStatus === 'ToDo')) {
          if (!qaComment || qaComment.trim() === '') {
            return {
              success: false,
              error: 'QA REWORK REQUIRED: Anda wajib memasukkan deskripsi bug / alasan pengembalian tugas ke tim Developer.'
            };
          }
        }
      }
    }

    // Apply Move
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const historyLogs: HistoryLog[] = [
          {
            id: `hist-${Date.now()}`,
            userName: currentUser.name,
            action: `Memindahkan status dari "${currentStatus}" ke "${targetStatus}"`,
            timestamp: new Date().toISOString()
          }
        ];

        const comments: Comment[] = [...t.comments];
        // If QA added a rework comment, insert it as a comment
        if (qaComment && qaComment.trim() !== '') {
          comments.push({
            id: `cmt-${Date.now()}`,
            userName: currentUser.name,
            role: currentUser.role,
            text: `[QA REJECT/REWORK] Alasan: ${qaComment}`,
            timestamp: new Date().toISOString()
          });
        }

        return {
          ...t,
          status: targetStatus,
          comments,
          history: [...t.history, ...historyLogs]
        };
      }
      return t;
    }));

    // Trigger Notifications & Slack Simulator (FR-005)
    const newNotifications: Notification[] = [];

    // Slack: Hand-over to QA
    if (targetStatus === 'ReadyForQA') {
      newNotifications.push({
        id: `slack-${Date.now()}`,
        taskId,
        taskTitle: task.title,
        message: `Slack (Channel #team-qa): Tugas [${taskId}] - [${task.title}] siap diuji oleh tim QA.`,
        timestamp: new Date().toISOString(),
        type: 'slack'
      });
    }

    // Slack: QA Rework (Fail)
    if (currentStatus === 'Testing' && (targetStatus === 'InProgress' || targetStatus === 'ToDo')) {
      newNotifications.push({
        id: `slack-${Date.now()}-fail`,
        taskId,
        taskTitle: task.title,
        message: `Slack (Channel #team-dev): Tugas [${taskId}] - [${task.title}] gagal uji. Mohon periksa kembali. Alasan: ${qaComment || ''}`,
        timestamp: new Date().toISOString(),
        type: 'slack'
      });
    }

    // General System Log
    newNotifications.push({
      id: `sys-${Date.now()}-move`,
      taskId,
      taskTitle: task.title,
      message: `System Log: ${currentUser.name} memindahkan "${taskId}" ke "${targetStatus}" (dari "${currentStatus}").`,
      timestamp: new Date().toISOString(),
      type: 'system'
    });

    setNotifications(prev => [...newNotifications, ...prev]);

    return { success: true };
  };

  const addComment = (taskId: string, text: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newComment: Comment = {
          id: `cmt-${Date.now()}`,
          userName: currentUser.name,
          role: currentUser.role,
          text,
          timestamp: new Date().toISOString()
        };

        const newHistoryLog: HistoryLog = {
          id: `hist-${Date.now()}`,
          userName: currentUser.name,
          action: `Menambahkan komentar: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          timestamp: new Date().toISOString()
        };

        return {
          ...t,
          comments: [...t.comments, newComment],
          history: [...t.history, newHistoryLog]
        };
      }
      return t;
    }));

    // System Log
    const sysNotif: Notification = {
      id: `sys-${Date.now()}`,
      taskId,
      taskTitle: tasks.find(t => t.id === taskId)?.title || '',
      message: `System Log: ${currentUser.name} mengomentari tugas ${taskId}.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [sysNotif, ...prev]);
  };

  // CSV parsing simulation for admin import (FR-001/FR-007)
  const importUsersCSV = (csvText: string) => {
    // Check permission
    if (currentUser.role !== 'Admin') {
      return { success: false, count: 0, error: 'Hanya Admin yang diizinkan untuk mengimpor daftar pengguna.' };
    }

    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length <= 1) {
        return { success: false, count: 0, error: 'File CSV kosong atau tidak memiliki baris data.' };
      }

      // Check header format: name,email,role
      const header = lines[0].toLowerCase().split(',');
      const nameIdx = header.indexOf('name');
      const emailIdx = header.indexOf('email');
      const roleIdx = header.indexOf('role');

      if (nameIdx === -1 || emailIdx === -1 || roleIdx === -1) {
        return { success: false, count: 0, error: 'Format header CSV harus mengandung kolom: name, email, role' };
      }

      const importedUsers: User[] = [];
      const validRoles: Role[] = ['Admin', 'PM', 'DevLeader', 'QALeader', 'Developer', 'QA'];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 3) continue;

        const name = cols[nameIdx];
        const email = cols[emailIdx];
        let role = cols[roleIdx] as Role;

        // Map role aliases if needed
        if (role.toLowerCase() === 'developer' || role.toLowerCase() === 'dev') role = 'Developer';
        if (role.toLowerCase() === 'qa engineer' || role.toLowerCase() === 'qa') role = 'QA';
        if (role.toLowerCase() === 'project manager' || role.toLowerCase() === 'pm') role = 'PM';
        if (role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator') role = 'Admin';
        if (role.toLowerCase() === 'dev leader' || role.toLowerCase() === 'devleader') role = 'DevLeader';
        if (role.toLowerCase() === 'qa leader' || role.toLowerCase() === 'qaleader') role = 'QALeader';

        if (!validRoles.includes(role)) {
          return { success: false, count: 0, error: `Baris ${i + 1}: Peran "${role}" tidak valid. Harus salah satu dari: Admin, PM, DevLeader, QALeader, Developer, QA.` };
        }

        importedUsers.push({
          id: `u-import-${Date.now()}-${i}`,
          name,
          email,
          role,
          avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150`
        });
      }

      if (importedUsers.length === 0) {
        return { success: false, count: 0, error: 'Tidak ada data valid yang ditemukan untuk diimpor.' };
      }

      setUsers(prev => {
        // Filter out duplicates based on email
        const existingEmails = prev.map(u => u.email.toLowerCase());
        const newUnique = importedUsers.filter(u => !existingEmails.includes(u.email.toLowerCase()));
        return [...prev, ...newUnique];
      });

      // System Log
      const sysNotif: Notification = {
        id: `sys-${Date.now()}`,
        taskId: 'ADMIN',
        taskTitle: 'Import Anggota',
        message: `System Log: ${currentUser.name} mengimpor ${importedUsers.length} pengguna baru dari file CSV.`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      setNotifications(prev => [sysNotif, ...prev]);

      return { success: true, count: importedUsers.length };
    } catch (e: any) {
      return { success: false, count: 0, error: `Kesalahan saat membaca file CSV: ${e.message}` };
    }
  };

  const resetAllData = () => {
    localStorage.removeItem('dtm_current_user');
    localStorage.removeItem('dtm_users');
    localStorage.removeItem('dtm_tasks');
    localStorage.removeItem('dtm_notifications');
    setCurrentUser(DEFAULT_USERS[1]);
    setUsers(DEFAULT_USERS);
    setTasks(DEFAULT_TASKS);
    setNotifications([
      {
        id: 'n1',
        taskId: 'TSK-104',
        taskTitle: 'Unit Testing Modul Otentikasi',
        message: 'Tugas TSK-104 - Unit Testing Modul Otentikasi siap diuji oleh tim QA.',
        timestamp: new Date().toISOString(),
        type: 'slack'
      }
    ]);
  };

  return (
    <DevTaskContext.Provider value={{
      currentUser,
      users,
      tasks,
      notifications,
      switchUser,
      updateUserRole,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addComment,
      importUsersCSV,
      resetAllData
    }}>
      {children}
    </DevTaskContext.Provider>
  );
};

export const useDevTask = () => {
  const context = useContext(DevTaskContext);
  if (context === undefined) {
    throw new Error('useDevTask must be used within a DevTaskProvider');
  }
  return context;
};
