import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { query } from '../db/db';
import { validationResult } from 'express-validator';
import { createNotification } from '../services/notificationService';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasksResult = await query('SELECT * FROM tasks ORDER BY id ASC');
    const commentsResult = await query('SELECT * FROM comments ORDER BY timestamp ASC');
    const logsResult = await query('SELECT * FROM history_logs ORDER BY timestamp ASC');

    const comments = commentsResult.rows;
    const logs = logsResult.rows;

    const tasks = tasksResult.rows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: t.status,
      assigneeId: t.assignee_id,
      startDate: t.start_date,
      dueDate: t.due_date,
      comments: comments.filter(c => c.task_id === t.id).map(c => ({
        id: c.id,
        userName: c.user_name,
        role: c.role,
        text: c.text,
        timestamp: c.timestamp
      })),
      history: logs.filter(l => l.task_id === t.id).map(l => ({
        id: l.id,
        userName: l.user_name,
        action: l.action,
        timestamp: l.timestamp
      }))
    }));

    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat data tugas.' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, priority, status, assigneeId, startDate, dueDate } = req.body;
  const creatorName = req.user?.name || 'Sistem';

  try {
    const tasksCount = await query('SELECT COUNT(*) FROM tasks');
    const count = parseInt(tasksCount.rows[0]?.count || '0', 10);
    const nextId = `TSK-${100 + count + 1}`;

    await query(
      'INSERT INTO tasks(id, title, description, priority, status, assignee_id, start_date, due_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
      [nextId, title, description || '', priority, status, assigneeId || null, startDate, dueDate]
    );

    const logId = `hist-${Date.now()}`;
    const logAction = `Tugas dibuat oleh ${creatorName} dengan status "${status}"`;
    const timestamp = new Date().toISOString();

    await query(
      'INSERT INTO history_logs(id, task_id, user_name, action, timestamp) VALUES($1, $2, $3, $4, $5)',
      [logId, nextId, creatorName, logAction, timestamp]
    );

    const newNotifId = `sys-${Date.now()}`;
    const notifMessage = `System Log: Tugas baru "${nextId} - ${title}" ditambahkan oleh ${creatorName}.`;
    await createNotification({
      id: newNotifId,
      taskId: nextId,
      taskTitle: title,
      message: notifMessage,
      timestamp,
      type: 'system'
    });

    const newTask = {
      id: nextId,
      title,
      description: description || '',
      priority,
      status,
      assigneeId: assigneeId || null,
      startDate,
      dueDate,
      comments: [],
      history: [{ id: logId, userName: creatorName, action: logAction, timestamp }]
    };

    return res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal membuat tugas baru.' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.role || 'Developer';
  const userName = req.user?.name || 'Sistem';

  try {
    const taskQuery = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    const activeTask = taskQuery.rows[0];
    const targetStatus = req.body.status;

    // Access control checks for specific role transition bounds
    if (targetStatus && targetStatus !== activeTask.status) {
      const isQA = userRole === 'QA';
      const isDeveloper = userRole === 'Developer';

      if (isDeveloper && !['InProgress', 'ReadyForQA'].includes(targetStatus)) {
        return res.status(403).json({ error: 'Akses ditolak: Developer hanya dapat memindahkan tugas ke In Progress atau Ready for QA.' });
      }

      if (isQA) {
        const allowedQATransitions = ['InProgress', 'ToDo', 'Done'];
        if (activeTask.status !== 'Testing' || !allowedQATransitions.includes(targetStatus)) {
          return res.status(403).json({ error: 'Akses ditolak: QA hanya dapat memverifikasi status Testing menuju Done atau menolak ke status pengerjaan.' });
        }

        const commentText = req.body.commentText;
        if ((targetStatus === 'InProgress' || targetStatus === 'ToDo') && (!commentText || commentText.trim() === '')) {
          return res.status(400).json({ error: 'Input komentar alasan rework wajib diisi ketika menolak pengerjaan.' });
        }
      }
    }

    // Process updates
    const title = req.body.title !== undefined ? req.body.title : activeTask.title;
    const description = req.body.description !== undefined ? req.body.description : activeTask.description;
    const priority = req.body.priority !== undefined ? req.body.priority : activeTask.priority;
    const status = targetStatus !== undefined ? targetStatus : activeTask.status;
    const assigneeId = req.body.assigneeId !== undefined ? req.body.assigneeId : activeTask.assignee_id;
    const startDate = req.body.startDate !== undefined ? req.body.startDate : activeTask.start_date;
    const dueDate = req.body.dueDate !== undefined ? req.body.dueDate : activeTask.due_date;

    await query(
      'UPDATE tasks SET title=$1, description=$2, priority=$3, status=$4, assignee_id=$5, start_date=$6, due_date=$7 WHERE id=$8',
      [title, description, priority, status, assigneeId || null, startDate, dueDate, id]
    );

    const changes: string[] = [];
    if (req.body.title && req.body.title !== activeTask.title) changes.push(`Judul diubah ke "${title}"`);
    if (req.body.priority && req.body.priority !== activeTask.priority) changes.push(`Prioritas diubah ke ${priority}`);
    if (req.body.startDate && req.body.startDate !== activeTask.start_date) changes.push(`Tanggal Mulai diubah ke ${startDate}`);
    if (req.body.dueDate && req.body.dueDate !== activeTask.due_date) changes.push(`Tenggat diubah ke ${dueDate}`);
    if (targetStatus && targetStatus !== activeTask.status) {
      changes.push(`Status diubah dari ${activeTask.status} ke ${status}`);
    }

    // Insert rework comment
    if (req.body.commentText) {
      const commentId = `c-${Date.now()}`;
      const timestamp = new Date().toISOString();
      await query(
        'INSERT INTO comments(id, task_id, user_name, role, text, timestamp) VALUES($1, $2, $3, $4, $5, $6)',
        [commentId, id, userName, userRole, req.body.commentText, timestamp]
      );
      changes.push(`Komentar rework ditambahkan: "${req.body.commentText}"`);
    }

    // Insert history logs
    const timestamp = new Date().toISOString();
    for (const act of changes) {
      const logId = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      await query(
        'INSERT INTO history_logs(id, task_id, user_name, action, timestamp) VALUES($1, $2, $3, $4, $5)',
        [logId, id, userName, act, timestamp]
      );
    }

    // System Notification Trigger
    if (targetStatus && targetStatus !== activeTask.status) {
      const sysNotifId = `sys-${Date.now()}`;
      const notifMsg = `System Log: ${id} status diubah ke ${status} oleh ${userName}.`;
      await createNotification({
        id: sysNotifId,
        taskId: id,
        taskTitle: title,
        message: notifMsg,
        timestamp,
        type: 'system'
      });
    }

    // Fetch updated model
    const commentsQ = await query('SELECT * FROM comments WHERE task_id = $1 ORDER BY timestamp ASC', [id]);
    const historyQ = await query('SELECT * FROM history_logs WHERE task_id = $1 ORDER BY timestamp ASC', [id]);

    const updatedTask = {
      id,
      title,
      description,
      priority,
      status,
      assigneeId: assigneeId || null,
      startDate,
      dueDate,
      comments: commentsQ.rows.map(c => ({
        id: c.id,
        userName: c.user_name,
        role: c.role,
        text: c.text,
        timestamp: c.timestamp
      })),
      history: historyQ.rows.map(h => ({
        id: h.id,
        userName: h.user_name,
        action: h.action,
        timestamp: h.timestamp
      }))
    };

    return res.json(updatedTask);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memperbarui detail tugas.' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userName = req.user?.name || 'Sistem';

  try {
    const taskQuery = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);

    const sysNotifId = `sys-${Date.now()}`;
    const timestamp = new Date().toISOString();
    await createNotification({
      id: sysNotifId,
      taskId: 'DELETE',
      taskTitle: 'Hapus Tugas',
      message: `System Log: Tugas ${id} telah dihapus oleh ${userName}.`,
      timestamp,
      type: 'system'
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menghapus tugas.' });
  }
};

export const addTaskComment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const userName = req.user?.name || 'Sistem';
  const userRole = req.user?.role || 'Developer';

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Komentar tidak boleh kosong.' });
  }

  try {
    const taskQuery = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    }

    const commentId = `cmt-${Date.now()}`;
    const timestamp = new Date().toISOString();

    await query(
      'INSERT INTO comments(id, task_id, user_name, role, text, timestamp) VALUES($1, $2, $3, $4, $5, $6)',
      [commentId, id, userName, userRole, text, timestamp]
    );

    const logId = `hist-${Date.now()}`;
    const logAction = `Menambahkan komentar: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
    await query(
      'INSERT INTO history_logs(id, task_id, user_name, action, timestamp) VALUES($1, $2, $3, $4, $5)',
      [logId, id, userName, logAction, timestamp]
    );

    const sysNotifId = `sys-${Date.now()}`;
    await createNotification({
      id: sysNotifId,
      taskId: id,
      taskTitle: taskQuery.rows[0].title,
      message: `System Log: ${userName} mengomentari tugas ${id}.`,
      timestamp,
      type: 'system'
    });

    return res.status(201).json({
      id: commentId,
      userName,
      role: userRole,
      text,
      timestamp
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menambahkan komentar tugas.' });
  }
};
