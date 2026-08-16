export type Role = 'Admin' | 'PM' | 'DevLeader' | 'QALeader' | 'Developer' | 'QA';

export type TaskStatus = 'Backlog' | 'ToDo' | 'InProgress' | 'ReadyForQA' | 'Testing' | 'Done';

export type Priority = 'High' | 'Medium' | 'Low';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  userName: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface HistoryLog {
  id: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string | null;
  startDate?: string;
  dueDate: string;
  comments: Comment[];
  history: HistoryLog[];
}

export interface Notification {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  timestamp: string;
  type: 'slack' | 'system';
  read?: boolean;
}
