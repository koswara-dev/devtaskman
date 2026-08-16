import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { query } from '../db/db';

const DEFAULT_DUE_SOON_DAYS = 3;

export const getStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasksResult = await query('SELECT * FROM tasks');
    const usersResult = await query('SELECT * FROM users');

    const tasks = tasksResult.rows;
    const users = usersResult.rows;

    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    const dueSoonDaysParam = parseInt(String(req.query.dueSoonDays), 10);
    const dueSoonDays = Number.isFinite(dueSoonDaysParam) && dueSoonDaysParam > 0 ? dueSoonDaysParam : DEFAULT_DUE_SOON_DAYS;
    const dueSoonThreshold = new Date();
    dueSoonThreshold.setDate(dueSoonThreshold.getDate() + dueSoonDays);

    const assigneeTally = new Map<string, { completed: number; total: number }>();
    let dueSoonCount = 0;

    for (const t of tasks) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;

      if (t.assignee_id) {
        const entry = assigneeTally.get(t.assignee_id) || { completed: 0, total: 0 };
        entry.total += 1;
        if (t.status === 'Done') entry.completed += 1;
        assigneeTally.set(t.assignee_id, entry);
      }

      if (t.status !== 'Done' && t.due_date) {
        const dueDate = new Date(t.due_date);
        if (!Number.isNaN(dueDate.getTime()) && dueDate <= dueSoonThreshold) {
          dueSoonCount += 1;
        }
      }
    }

    const assigneeBreakdown = users
      .filter(u => assigneeTally.has(u.id))
      .map(u => ({
        userId: u.id,
        userName: u.name,
        completed: assigneeTally.get(u.id)!.completed,
        total: assigneeTally.get(u.id)!.total
      }));

    return res.json({
      totalTasks: tasks.length,
      statusCounts,
      priorityCounts,
      assigneeBreakdown,
      dueSoonCount,
      dueSoonDays
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat data statistik.' });
  }
};
