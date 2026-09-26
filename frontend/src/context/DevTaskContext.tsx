import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, User, Notification, Role, TaskStatus } from '../types';
import { useNotificationStream } from '../hooks/useNotificationStream';
import { api, ApiError, getStoredToken, setStoredToken, clearStoredToken } from '../api/client';

interface ActionResult {
  success: boolean;
  error?: string;
}

interface DevTaskContextType {
  currentUser: User | null;
  isBootstrapping: boolean;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<ActionResult>;
  logout: () => void;
  switchUser: (userId: string) => Promise<ActionResult>;
  updateUserRole: (userId: string, role: Role) => Promise<ActionResult>;
  addTask: (task: Omit<Task, 'id' | 'comments' | 'history'>) => Promise<ActionResult>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<ActionResult>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, targetStatus: TaskStatus, qaComment?: string) => Promise<ActionResult>;
  addComment: (taskId: string, text: string) => Promise<void>;
  importUsersCSV: (csvText: string) => Promise<{ success: boolean; count: number; error?: string }>;
  resetAllData: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
}

const DevTaskContext = createContext<DevTaskContextType | undefined>(undefined);

// False positive: this is a localStorage key name, not a credential/username value.
const CURRENT_USER_KEY = 'dtm_current_user'; // nosemgrep: ajinabraham.njsscan.generic.hardcoded_secrets.node_username

const errorMessage = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

export const DevTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistSession = useCallback((token: string, user: User) => {
    setStoredToken(token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    setUsers([]);
    setTasks([]);
    setNotifications([]);
  }, []);

  const loadWorkspaceData = useCallback(async () => {
    try {
      const [usersData, tasksData, notificationsData] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<Task[]>('/tasks'),
        api.get<Notification[]>('/notifications')
      ]);
      setUsers(usersData);
      setTasks(tasksData);
      setNotifications(notificationsData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
      }
      console.error('Gagal memuat data workspace:', err);
    }
  }, [clearSession]);

  // Bootstrap: restore session from a previously stored token and load workspace data.
  useEffect(() => {
    const bootstrap = async () => {
      if (getStoredToken() && currentUser) {
        await loadWorkspaceData();
      }
      setIsBootstrapping(false);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live updates from the backend's SSE notification feed, merged in ahead of fetched history.
  const handleStreamedNotification = useCallback((incoming: Notification) => {
    setNotifications(prev => (prev.some(n => n.id === incoming.id) ? prev : [incoming, ...prev]));
  }, []);

  useNotificationStream(handleStreamedNotification);

  const login = async (email: string, password: string): Promise<ActionResult> => {
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      persistSession(res.token, res.user);
      await loadWorkspaceData();
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err, 'Gagal melakukan proses login.') };
    }
  };

  const logout = () => {
    clearSession();
  };

  // Quick account switch for the demo/role-simulator UI: re-authenticates as another
  // seeded account (all seeded accounts share the same demo password).
  const switchUser = async (userId: string): Promise<ActionResult> => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'Pengguna tidak ditemukan.' };
    return login(target.email, 'password123');
  };

  const updateUserRole = async (userId: string, role: Role): Promise<ActionResult> => {
    try {
      const updated = await api.put<User>(`/users/${userId}`, { role });
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
      if (currentUser?.id === userId) {
        const refreshedUser = { ...currentUser, role: updated.role };
        setCurrentUser(refreshedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(refreshedUser));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err, 'Gagal memperbarui peran pengguna.') };
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'comments' | 'history'>): Promise<ActionResult> => {
    const allowed = !!currentUser && ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) {
      return { success: false, error: 'Hanya Admin, PM, atau Team Leader yang dapat membuat tugas.' };
    }

    try {
      const created = await api.post<Task>('/tasks', taskData);
      setTasks(prev => [...prev, created]);
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err, 'Gagal membuat tugas baru.') };
    }
  };

  const updateTask = async (taskId: string, updatedData: Partial<Task>): Promise<ActionResult> => {
    const allowed = !!currentUser && ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) {
      return { success: false, error: 'Hanya Admin, PM, atau Team Leader yang dapat mengedit detail tugas.' };
    }

    try {
      const updated = await api.put<Task>(`/tasks/${taskId}`, updatedData);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err, 'Gagal memperbarui detail tugas.') };
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const allowed = !!currentUser && ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(currentUser.role);
    if (!allowed) return;

    try {
      await api.del(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Gagal menghapus tugas:', err);
    }
  };

  // Enforces Transition Rules client-side for instant feedback; the backend re-validates
  // the same rules authoritatively (see backend/src/controllers/taskController.ts).
  const moveTask = async (taskId: string, targetStatus: TaskStatus, qaComment?: string): Promise<ActionResult> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !currentUser) return { success: false, error: 'Tugas tidak ditemukan.' };

    const currentStatus = task.status;
    if (currentStatus === targetStatus) return { success: true };

    const role = currentUser.role;
    const isPrivileged = ['Admin', 'PM', 'DevLeader', 'QALeader'].includes(role);

    if (!isPrivileged) {
      if (role === 'Developer') {
        const allowedTargets: TaskStatus[] = ['Backlog', 'ToDo', 'InProgress', 'ReadyForQA'];
        if (!allowedTargets.includes(targetStatus)) {
          return {
            success: false,
            error: 'Sebagai Developer, Anda hanya dapat memindahkan tugas sampai status "Ready for QA". Kolom Testing dan Done hanya dapat diakses oleh QA.'
          };
        }
        if (['Testing', 'Done'].includes(currentStatus)) {
          return {
            success: false,
            error: 'Tugas sudah berada di tangan tim QA (Testing/Done). Anda tidak dapat mengubah statusnya secara manual.'
          };
        }
      }

      if (role === 'QA') {
        if (currentStatus === 'ReadyForQA' && targetStatus !== 'Testing') {
          return {
            success: false,
            error: 'Sebagai QA, Anda harus memindahkan tugas ke "Testing" terlebih dahulu sebelum menyelesaikannya.'
          };
        }

        if (targetStatus === 'Backlog') {
          return {
            success: false,
            error: 'QA Engineer tidak diizinkan memindahkan tugas kembali ke Backlog. Silakan kembalikan ke "In Progress" jika ada rework.'
          };
        }

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

    try {
      const updated = await api.put<Task>(`/tasks/${taskId}`, { status: targetStatus, commentText: qaComment });
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err, 'Gagal memperbarui status tugas.') };
    }
  };

  const addComment = async (taskId: string, text: string): Promise<void> => {
    try {
      const comment = await api.post<Task['comments'][number]>(`/tasks/${taskId}/comments`, { text });
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)));
    } catch (err) {
      console.error('Gagal menambahkan komentar:', err);
    }
  };

  // CSV parsing happens client-side (unchanged); the parsed rows are then submitted to the backend.
  const importUsersCSV = async (csvText: string): Promise<{ success: boolean; count: number; error?: string }> => {
    if (currentUser?.role !== 'Admin') {
      return { success: false, count: 0, error: 'Hanya Admin yang diizinkan untuk mengimpor daftar pengguna.' };
    }

    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length <= 1) {
        return { success: false, count: 0, error: 'File CSV kosong atau tidak memiliki baris data.' };
      }

      const header = lines[0].toLowerCase().split(',');
      const nameIdx = header.indexOf('name');
      const emailIdx = header.indexOf('email');
      const roleIdx = header.indexOf('role');

      if (nameIdx === -1 || emailIdx === -1 || roleIdx === -1) {
        return { success: false, count: 0, error: 'Format header CSV harus mengandung kolom: name, email, role' };
      }

      const importedUsers: { name: string; email: string; role: Role }[] = [];
      const validRoles: Role[] = ['Admin', 'PM', 'DevLeader', 'QALeader', 'Developer', 'QA'];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 3) continue;

        const name = cols[nameIdx];
        const email = cols[emailIdx];
        let role = cols[roleIdx] as Role;

        if (role.toLowerCase() === 'developer' || role.toLowerCase() === 'dev') role = 'Developer';
        if (role.toLowerCase() === 'qa engineer' || role.toLowerCase() === 'qa') role = 'QA';
        if (role.toLowerCase() === 'project manager' || role.toLowerCase() === 'pm') role = 'PM';
        if (role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator') role = 'Admin';
        if (role.toLowerCase() === 'dev leader' || role.toLowerCase() === 'devleader') role = 'DevLeader';
        if (role.toLowerCase() === 'qa leader' || role.toLowerCase() === 'qaleader') role = 'QALeader';

        if (!validRoles.includes(role)) {
          return { success: false, count: 0, error: `Baris ${i + 1}: Peran "${role}" tidak valid. Harus salah satu dari: Admin, PM, DevLeader, QALeader, Developer, QA.` };
        }

        importedUsers.push({ name, email, role });
      }

      if (importedUsers.length === 0) {
        return { success: false, count: 0, error: 'Tidak ada data valid yang ditemukan untuk diimpor.' };
      }

      const res = await api.post<{ success: boolean; count: number }>('/users/import', { users: importedUsers });
      const refreshedUsers = await api.get<User[]>('/users');
      setUsers(refreshedUsers);

      return { success: true, count: res.count };
    } catch (e) {
      return { success: false, count: 0, error: errorMessage(e, 'Kesalahan saat memproses file CSV.') };
    }
  };

  const markNotificationsRead = async (): Promise<void> => {
    try {
      await api.post('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Gagal menandai notifikasi sebagai dibaca:', err);
    }
  };

  const resetAllData = async (): Promise<void> => {
    try {
      await api.post('/reset');
      await loadWorkspaceData();
    } catch (err) {
      console.error('Gagal mereset data:', err);
    }
  };

  return (
    <DevTaskContext.Provider value={{
      currentUser,
      isBootstrapping,
      users,
      tasks,
      notifications,
      login,
      logout,
      switchUser,
      updateUserRole,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addComment,
      importUsersCSV,
      resetAllData,
      markNotificationsRead
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
