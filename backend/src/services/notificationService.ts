import { query } from '../db/db';
import { broadcastNotification } from '../utils/sseHub';

interface NewNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  timestamp: string;
  type: string;
}

export const createNotification = async (n: NewNotification) => {
  await query(
    'INSERT INTO notifications(id, task_id, task_title, message, timestamp, type, read) VALUES($1, $2, $3, $4, $5, $6, $7)',
    [n.id, n.taskId, n.taskTitle, n.message, n.timestamp, n.type, false]
  );

  broadcastNotification({
    id: n.id,
    taskId: n.taskId,
    taskTitle: n.taskTitle,
    message: n.message,
    timestamp: n.timestamp,
    type: n.type,
    read: false
  });
};
