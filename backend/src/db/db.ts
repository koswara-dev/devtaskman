import { Pool } from 'pg';
import { config } from '../config';
import bcrypt from 'bcryptjs';

// Types duplicate to prevent circular dependencies
export interface DBUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  avatar_url?: string;
}

export interface DBTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee_id: string | null;
  start_date?: string;
  due_date: string;
}

export interface DBComment {
  id: string;
  task_id: string;
  user_name: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface DBHistoryLog {
  id: string;
  task_id: string;
  user_name: string;
  action: string;
  timestamp: string;
}

export interface DBNotification {
  id: string;
  task_id: string;
  task_title: string;
  message: string;
  timestamp: string;
  type: string;
  read: boolean;
}

// In-Memory Fallback Database State
export let memoryUsers: DBUser[] = [];
export let memoryTasks: DBTask[] = [];
export let memoryComments: DBComment[] = [];
export let memoryHistoryLogs: DBHistoryLog[] = [];
export let memoryNotifications: DBNotification[] = [];

export let isUsingPostgres = false;

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
  connectionTimeoutMillis: 2000 // 2 seconds timeout for fast fallback
});

// Initialize In-Memory Seeds
export const seedInMemoryDB = async () => {
  const hash = await bcrypt.hash('password123', 10);
  
  memoryUsers = [
    { id: 'u1', name: 'Alice Admin', email: 'alice@company.com', password_hash: hash, role: 'Admin', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 'u2', name: 'Bob PM', email: 'bob@company.com', password_hash: hash, role: 'PM', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'u3', name: 'Charlie DevLead', email: 'charlie@company.com', password_hash: hash, role: 'DevLeader', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 'u4', name: 'Diana QALead', email: 'diana@company.com', password_hash: hash, role: 'QALeader', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 'u5', name: 'Eric Developer', email: 'eric@company.com', password_hash: hash, role: 'Developer', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { id: 'u6', name: 'Frank Developer', email: 'frank@company.com', password_hash: hash, role: 'Developer', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { id: 'u7', name: 'Grace QA', email: 'grace@company.com', password_hash: hash, role: 'QA', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 'u8', name: 'Helen QA', email: 'helen@company.com', password_hash: hash, role: 'QA', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  ];

  memoryTasks = [
    { id: 'TSK-101', title: 'Konfigurasi Setup Tailwind CSS v3', description: 'Mengintegrasikan Tailwind CSS dengan bundler Vite.', priority: 'High', status: 'Done', assignee_id: 'u5', start_date: '2026-08-11', due_date: '2026-08-14' },
    { id: 'TSK-102', title: 'Desain Skema Database Mock & State', description: 'Merancang data model TypeScript dan arsitektur LocalStorage.', priority: 'High', status: 'Done', assignee_id: 'u3', start_date: '2026-08-12', due_date: '2026-08-15' },
    { id: 'TSK-103', title: 'Pengembangan Halaman Dashboard Utama', description: 'Membuat widget visual menggunakan SVG interaktif.', priority: 'Medium', status: 'InProgress', assignee_id: 'u5', start_date: '2026-08-15', due_date: '2026-08-18' },
    { id: 'TSK-104', title: 'Unit Testing Modul Otentikasi', description: 'Menulis test suite komprehensif untuk otentikasi JWT.', priority: 'High', status: 'ReadyForQA', assignee_id: 'u6', start_date: '2026-08-14', due_date: '2026-08-16' },
    { id: 'TSK-105', title: 'Simulasi Notifikasi Slack API', description: 'Membangun webhook simulation panel.', priority: 'Medium', status: 'Testing', assignee_id: 'u6', start_date: '2026-08-16', due_date: '2026-08-19' },
    { id: 'TSK-106', title: 'Halaman Administrasi & CSV Import', description: 'Menyusun antarmuka pengelolaan peran pengguna.', priority: 'Low', status: 'ToDo', assignee_id: null, start_date: '2026-08-20', due_date: '2026-08-25' },
    { id: 'TSK-107', title: 'Optimasi Ukuran Bundling Webpack/Vite', description: 'Menerapkan dynamic imports, chunk splitting.', priority: 'Low', status: 'Backlog', assignee_id: null, start_date: '2026-08-28', due_date: '2026-09-02' }
  ];

  memoryComments = [
    { id: 'c1', task_id: 'TSK-101', user_name: 'Eric Developer', role: 'Developer', text: 'Tailwind sudah aktif dan saya tambahkan helper glassmorphism.', timestamp: '2026-08-14T10:00:00Z' },
    { id: 'c2', task_id: 'TSK-103', user_name: 'Bob PM', role: 'PM', text: 'Pastikan bagan SVG responsif di layar tablet.', timestamp: '2026-08-15T12:00:00Z' },
    { id: 'c3', task_id: 'TSK-105', user_name: 'Grace QA', role: 'QA', text: 'Mulai melakukan verifikasi payload pesan Slack.', timestamp: '2026-08-15T15:30:00Z' }
  ];

  memoryHistoryLogs = [
    { id: 'h1', task_id: 'TSK-101', user_name: 'Bob PM', action: 'Membuat tugas', timestamp: '2026-08-13T09:00:00Z' },
    { id: 'h2', task_id: 'TSK-101', user_name: 'Eric Developer', action: 'Memindahkan ke In Progress', timestamp: '2026-08-13T10:30:00Z' },
    { id: 'h3', task_id: 'TSK-101', user_name: 'Eric Developer', action: 'Memindahkan ke Ready for QA', timestamp: '2026-08-14T09:00:00Z' },
    { id: 'h4', task_id: 'TSK-101', user_name: 'Grace QA', action: 'Memindahkan ke Testing', timestamp: '2026-08-14T09:30:00Z' },
    { id: 'h5', task_id: 'TSK-101', user_name: 'Grace QA', action: 'Memindahkan ke Done', timestamp: '2026-08-14T11:00:00Z' }
  ];

  memoryNotifications = [
    { id: 'n1', task_id: 'TSK-104', task_title: 'Unit Testing Modul Otentikasi', message: 'Tugas TSK-104 - Unit Testing Modul Otentikasi siap diuji oleh tim QA.', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'slack', read: false },
    { id: 'n2', task_id: 'TSK-102', task_title: 'Desain Skema Database Mock & State', message: 'System Log: TSK-102 status diubah ke Done oleh Diana QALead.', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'system', read: false }
  ];
};

export const resetInMemoryDB = async () => {
  await seedInMemoryDB();
};

// Initialize PostgreSQL Schemas & Default Seeds
const initializePostgresSchemas = async (client: any) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      avatar_url VARCHAR(255)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      priority VARCHAR(20) NOT NULL,
      status VARCHAR(50) NOT NULL,
      assignee_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
      start_date VARCHAR(20),
      due_date VARCHAR(20) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(50) PRIMARY KEY,
      task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
      user_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      timestamp VARCHAR(50) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS history_logs (
      id VARCHAR(50) PRIMARY KEY,
      task_id VARCHAR(50),
      user_name VARCHAR(100) NOT NULL,
      action VARCHAR(255) NOT NULL,
      timestamp VARCHAR(50) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      task_id VARCHAR(50),
      task_title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      timestamp VARCHAR(50) NOT NULL,
      type VARCHAR(20) NOT NULL,
      read BOOLEAN DEFAULT FALSE
    );
  `);

  // Verify and seed default users
  const userCheck = await client.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCheck.rows[0].count, 10) === 0) {
    const hash = await bcrypt.hash('password123', 10);
    const usersToInsert = [
      ['u1', 'Alice Admin', 'alice@company.com', hash, 'Admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'],
      ['u2', 'Bob PM', 'bob@company.com', hash, 'PM', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'],
      ['u3', 'Charlie DevLead', 'charlie@company.com', hash, 'DevLeader', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'],
      ['u4', 'Diana QALead', 'diana@company.com', hash, 'QALeader', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'],
      ['u5', 'Eric Developer', 'eric@company.com', hash, 'Developer', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'],
      ['u6', 'Frank Developer', 'frank@company.com', hash, 'Developer', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'],
      ['u7', 'Grace QA', 'grace@company.com', hash, 'QA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'],
      ['u8', 'Helen QA', 'helen@company.com', hash, 'QA', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150']
    ];
    for (const u of usersToInsert) {
      await client.query('INSERT INTO users(id, name, email, password_hash, role, avatar_url) VALUES($1, $2, $3, $4, $5, $6)', u);
    }
  }

  // Verify and seed default tasks
  const taskCheck = await client.query('SELECT COUNT(*) FROM tasks');
  if (parseInt(taskCheck.rows[0].count, 10) === 0) {
    const tasksToInsert = [
      ['TSK-101', 'Konfigurasi Setup Tailwind CSS v3', 'Mengintegrasikan Tailwind CSS dengan bundler Vite.', 'High', 'Done', 'u5', '2026-08-11', '2026-08-14'],
      ['TSK-102', 'Desain Skema Database Mock & State', 'Merancang data model TypeScript dan arsitektur LocalStorage.', 'High', 'Done', 'u3', '2026-08-12', '2026-08-15'],
      ['TSK-103', 'Pengembangan Halaman Dashboard Utama', 'Membuat widget visual menggunakan SVG interaktif.', 'Medium', 'InProgress', 'u5', '2026-08-15', '2026-08-18'],
      ['TSK-104', 'Unit Testing Modul Otentikasi', 'Menulis test suite komprehensif untuk otentikasi JWT.', 'High', 'ReadyForQA', 'u6', '2026-08-14', '2026-08-16'],
      ['TSK-105', 'Simulasi Notifikasi Slack API', 'Membangun webhook simulation panel.', 'Medium', 'Testing', 'u6', '2026-08-16', '2026-08-19'],
      ['TSK-106', 'Halaman Administrasi & CSV Import', 'Menyusun antarmuka pengelolaan peran pengguna.', 'Low', 'ToDo', null, '2026-08-20', '2026-08-25'],
      ['TSK-107', 'Optimasi Ukuran Bundling Webpack/Vite', 'Menerapkan dynamic imports, chunk splitting.', 'Low', 'Backlog', null, '2026-08-28', '2026-09-02']
    ];
    for (const t of tasksToInsert) {
      await client.query('INSERT INTO tasks(id, title, description, priority, status, assignee_id, start_date, due_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', t);
    }

    const commentsToInsert = [
      ['c1', 'TSK-101', 'Eric Developer', 'Developer', 'Tailwind sudah aktif dan saya tambahkan helper glassmorphism.', '2026-08-14T10:00:00Z'],
      ['c2', 'TSK-103', 'Bob PM', 'PM', 'Pastikan bagan SVG responsif di layar tablet.', '2026-08-15T12:00:00Z'],
      ['c3', 'TSK-105', 'Grace QA', 'QA', 'Mulai melakukan verifikasi payload pesan Slack.', '2026-08-15T15:30:00Z']
    ];
    for (const c of commentsToInsert) {
      await client.query('INSERT INTO comments(id, task_id, user_name, role, text, timestamp) VALUES($1, $2, $3, $4, $5, $6)', c);
    }

    const logsToInsert = [
      ['h1', 'TSK-101', 'Bob PM', 'Membuat tugas', '2026-08-13T09:00:00Z'],
      ['h2', 'TSK-101', 'Eric Developer', 'Memindahkan ke In Progress', '2026-08-13T10:30:00Z'],
      ['h3', 'TSK-101', 'Eric Developer', 'Memindahkan ke Ready for QA', '2026-08-14T09:00:00Z'],
      ['h4', 'TSK-101', 'Grace QA', 'Memindahkan ke Testing', '2026-08-14T09:30:00Z'],
      ['h5', 'TSK-101', 'Grace QA', 'Memindahkan ke Done', '2026-08-14T11:00:00Z']
    ];
    for (const l of logsToInsert) {
      await client.query('INSERT INTO history_logs(id, task_id, user_name, action, timestamp) VALUES($1, $2, $3, $4, $5)', l);
    }

    const notifsToInsert = [
      ['n1', 'TSK-104', 'Unit Testing Modul Otentikasi', 'Tugas TSK-104 - Unit Testing Modul Otentikasi siap diuji oleh tim QA.', new Date(Date.now() - 3600000).toISOString(), 'slack'],
      ['n2', 'TSK-102', 'Desain Skema Database Mock & State', 'System Log: TSK-102 status diubah ke Done oleh Diana QALead.', new Date(Date.now() - 7200000).toISOString(), 'system']
    ];
    for (const n of notifsToInsert) {
      await client.query('INSERT INTO notifications(id, task_id, task_title, message, timestamp, type) VALUES($1, $2, $3, $4, $5, $6)', n);
    }
  }
};

// Database Initialization Bootstrapper
export const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('[Database] Connected to PostgreSQL successfully!');
    isUsingPostgres = true;
    await initializePostgresSchemas(client);
    client.release();
  } catch (err) {
    console.warn('[Database] PostgreSQL connection failed. Falling back to in-memory database store.');
    console.warn(err);
    isUsingPostgres = false;
    await seedInMemoryDB();
  }
};

// Query interface wrapping pool or in-memory arrays
export const query = async (text: string, params: any[] = []): Promise<{ rows: any[] }> => {
  if (isUsingPostgres) {
    return pool.query(text, params);
  }
  
  // Custom mock parser for common in-memory SQL mutations to mock database responses
  // This satisfies testing requirements cleanly
  const upperText = text.toUpperCase();

  if (upperText.startsWith('SELECT') && upperText.includes('FROM USERS')) {
    if (upperText.includes('WHERE EMAIL =')) {
      const email = params[0];
      const match = memoryUsers.find(u => u.email === email);
      return { rows: match ? [match] : [] };
    }
    if (upperText.includes('WHERE ID =')) {
      const id = params[0];
      const match = memoryUsers.find(u => u.id === id);
      return { rows: match ? [match] : [] };
    }
    return { rows: memoryUsers };
  }

  if (upperText.startsWith('SELECT') && upperText.includes('COUNT(*)') && upperText.includes('FROM TASKS')) {
    return { rows: [{ count: String(memoryTasks.length) }] };
  }

  if (upperText.startsWith('SELECT') && upperText.includes('FROM TASKS')) {
    if (upperText.includes('WHERE ID =')) {
      const id = params[0];
      const match = memoryTasks.find(t => t.id === id);
      return { rows: match ? [match] : [] };
    }
    return { rows: memoryTasks };
  }

  if (upperText.startsWith('SELECT') && upperText.includes('FROM COMMENTS')) {
    if (upperText.includes('WHERE TASK_ID =')) {
      const taskId = params[0];
      return { rows: memoryComments.filter(c => c.task_id === taskId).sort((a, b) => a.timestamp.localeCompare(b.timestamp)) };
    }
    return { rows: [...memoryComments].sort((a, b) => a.timestamp.localeCompare(b.timestamp)) };
  }

  if (upperText.startsWith('SELECT') && upperText.includes('FROM HISTORY_LOGS')) {
    if (upperText.includes('WHERE TASK_ID =')) {
      const taskId = params[0];
      return { rows: memoryHistoryLogs.filter(h => h.task_id === taskId).sort((a, b) => a.timestamp.localeCompare(b.timestamp)) };
    }
    return { rows: [...memoryHistoryLogs].sort((a, b) => a.timestamp.localeCompare(b.timestamp)) };
  }

  if (upperText.includes('INSERT INTO USERS')) {
    // [id, name, email, password_hash, role, avatar_url]
    const newUser: DBUser = {
      id: params[0],
      name: params[1],
      email: params[2],
      password_hash: params[3],
      role: params[4],
      avatar_url: params[5]
    };
    memoryUsers.push(newUser);
    return { rows: [newUser] };
  }

  if (upperText.includes('INSERT INTO TASKS')) {
    // [id, title, description, priority, status, assignee_id, start_date, due_date]
    const newTask: DBTask = {
      id: params[0],
      title: params[1],
      description: params[2],
      priority: params[3],
      status: params[4],
      assignee_id: params[5],
      start_date: params[6],
      due_date: params[7]
    };
    memoryTasks.push(newTask);
    return { rows: [newTask] };
  }

  if (upperText.includes('INSERT INTO COMMENTS')) {
    // [id, task_id, user_name, role, text, timestamp]
    const newComment: DBComment = {
      id: params[0],
      task_id: params[1],
      user_name: params[2],
      role: params[3],
      text: params[4],
      timestamp: params[5]
    };
    memoryComments.push(newComment);
    return { rows: [newComment] };
  }

  if (upperText.includes('INSERT INTO HISTORY_LOGS')) {
    // [id, task_id, user_name, action, timestamp]
    const newLog: DBHistoryLog = {
      id: params[0],
      task_id: params[1],
      user_name: params[2],
      action: params[3],
      timestamp: params[4]
    };
    memoryHistoryLogs.push(newLog);
    return { rows: [newLog] };
  }

  if (upperText.startsWith('UPDATE TASKS SET')) {
    // [title, description, priority, status, assignee_id, start_date, due_date, id]
    const id = params[7];
    const task = memoryTasks.find(t => t.id === id);
    if (task) {
      task.title = params[0];
      task.description = params[1];
      task.priority = params[2];
      task.status = params[3];
      task.assignee_id = params[4];
      task.start_date = params[5];
      task.due_date = params[6];
    }
    return { rows: task ? [task] : [] };
  }

  if (upperText.startsWith('DELETE FROM TASKS')) {
    const id = params[0];
    memoryTasks = memoryTasks.filter(t => t.id !== id);
    return { rows: [] };
  }

  if (upperText.startsWith('SELECT') && upperText.includes('FROM NOTIFICATIONS')) {
    return { rows: [...memoryNotifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp)) };
  }

  if (upperText.includes('INSERT INTO NOTIFICATIONS')) {
    // [id, task_id, task_title, message, timestamp, type, read]
    const newNotification: DBNotification = {
      id: params[0],
      task_id: params[1],
      task_title: params[2],
      message: params[3],
      timestamp: params[4],
      type: params[5],
      read: params[6] ?? false
    };
    memoryNotifications.push(newNotification);
    return { rows: [newNotification] };
  }

  if (upperText.includes('UPDATE NOTIFICATIONS SET READ')) {
    memoryNotifications = memoryNotifications.map(n => ({ ...n, read: true }));
    return { rows: memoryNotifications };
  }

  if (upperText.includes('UPDATE USERS SET ROLE =')) {
    const role = params[0];
    const id = params[1];
    const user = memoryUsers.find(u => u.id === id);
    if (user) user.role = role;
    return { rows: user ? [user] : [] };
  }

  if (upperText.includes('DELETE FROM USERS')) {
    const id = params[0];
    memoryUsers = memoryUsers.filter(u => u.id !== id);
    // ON DELETE SET NULL cascade logic
    memoryTasks = memoryTasks.map(t => t.assignee_id === id ? { ...t, assignee_id: null } : t);
    return { rows: [] };
  }

  return { rows: [] };
};
