## 1. Mock Parser Fixes

- [x] 1.1 Add `SELECT COUNT(*) FROM tasks` branch, distinguished from generic `FROM TASKS` handling, returning `{ rows: [{ count: String(memoryTasks.length) }] }`.
- [x] 1.2 Add `UPDATE tasks SET ... WHERE id=$8` branch, mutating the matching `memoryTasks` entry in place using the exact param order `taskController.updateTask` sends.
- [x] 1.3 Add `DELETE FROM tasks WHERE id = $1` branch, filtering `memoryTasks`.
- [x] 1.4 Add `SELECT * FROM comments [WHERE task_id = $1]` and `INSERT INTO comments` branches against `memoryComments`.
- [x] 1.5 Add `SELECT * FROM history_logs [WHERE task_id = $1]` and `INSERT INTO history_logs` branches against `memoryHistoryLogs`.

## 2. Verification

- [x] 2.1 `tsc --noEmit` clean on backend.
- [x] 2.2 Manually verified via curl against the in-memory fallback: created two tasks back-to-back got distinct sequential IDs (no more `TSK-101` collision); added a comment and updated status on a task, then re-fetched `GET /api/v1/tasks` and confirmed the status change, comment, and history entry all persisted; deleted the task and confirmed it no longer appears on re-fetch.

## 3. Bonus: Verified Real Postgres Path Too

- [x] 3.1 While testing, the user pointed the backend at a real running Postgres container (`devtaskmandb` on port 5433) via `backend/.env`. Confirmed `[Database] Connected to PostgreSQL successfully!` on boot and that `GET /api/v1/users` (8 rows) / `GET /api/v1/tasks` (7 rows, with comments present) work correctly against the real database — both storage backends now behave consistently, which was the whole point of this fix.
