import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { query } from '../db/db';
import { addClient, removeClient } from '../utils/sseHub';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM notifications ORDER BY timestamp DESC');
    const notifications = result.rows.map(n => ({
      id: n.id,
      taskId: n.task_id,
      taskTitle: n.task_title,
      message: n.message,
      timestamp: n.timestamp,
      type: n.type,
      read: n.read
    }));
    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat notifikasi.' });
  }
};

// Server-Sent Events stream: pushes newly created notifications to connected clients in real time.
export const streamNotifications = (req: AuthenticatedRequest, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.write(': connected\n\n');

  addClient(res);

  // Keep intermediary proxies/browsers from timing out an idle connection.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(res);
  });
};

export const markNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Relational update or memory update is handled by the mock query parser in db.ts
    await query('UPDATE notifications SET read = true');
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memperbarui status baca notifikasi.' });
  }
};
