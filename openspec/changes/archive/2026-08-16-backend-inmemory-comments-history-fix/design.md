## Context

`query()` in `backend/src/db/db.ts` dispatches on `text.toUpperCase()` substring checks, in this order: `SELECT...FROM USERS`, `SELECT...FROM TASKS`, `INSERT INTO USERS`, `INSERT INTO TASKS`, `SELECT...FROM NOTIFICATIONS`, `INSERT INTO NOTIFICATIONS`, `UPDATE NOTIFICATIONS SET READ`, `UPDATE USERS SET ROLE =`, `DELETE FROM USERS`, then a catch-all `{ rows: [] }`. Order matters because some checks are substring-based and could shadow each other (e.g. a naive `FROM USERS` check would also match `DELETE FROM USERS` if placed before the `DELETE` branch — this already bit the `USERS`/`TASKS` fix in `backend-frontend-integration`, which is why those checks are `startsWith('SELECT') && includes('FROM X')` rather than bare substring checks).

## Goals / Non-Goals

**Goals:**
- Make every SQL string the controllers actually send have a corresponding mock-parser branch, so in-memory mode behaves the same as real Postgres for all currently-implemented operations.

**Non-Goals:**
- Not building a general-purpose SQL parser or query builder — this stays a pragmatic literal-pattern dispatcher matching the existing style, scoped to the exact query strings the controllers currently send.
- Not adding new tables/columns or changing any controller/route code — purely filling gaps in the existing mock layer.

## Decisions

- **`SELECT COUNT(*) FROM tasks` must be checked before the generic `FROM TASKS` branch** (or made mutually exclusive via an explicit `COUNT(*)` check), returning `{ rows: [{ count: String(memoryTasks.length) }] }` to match Postgres's `COUNT(*)` row shape (`taskController.createTask` does `parseInt(tasksCount.rows[0]?.count || '0', 10)`, so the value must be a string-coercible count under the `count` key).
- **`UPDATE tasks SET ...`**: parse the 8 positional params in the exact order `taskController.updateTask` sends them (`title, description, priority, status, assignee_id, start_date, due_date, id` — note `id` is last, params[7]) and mutate the matching `memoryTasks` entry in place.
- **`DELETE FROM tasks WHERE id = $1`**: filter `memoryTasks` by `id !== params[0]`, matching the existing `DELETE FROM USERS` pattern (including cascading — tasks don't cascade to other tables on delete in this schema, so no extra cleanup needed beyond removing the task itself; comments/history rows for a deleted task simply become orphaned in memory, matching current Postgres behavior since there's no `ON DELETE CASCADE` on `comments`/`history_logs` either — confirmed via `initializePostgresSchemas`, which only declares `ON DELETE CASCADE` on `comments.task_id`, not `history_logs.task_id`; the in-memory fix reproduces exactly that column-by-column, not adding cleanup Postgres wouldn't also do).
- **`INSERT INTO comments`/`INSERT INTO history_logs`** and their **`SELECT ... WHERE task_id = $1`** counterparts: mirror the `notifications` pattern added in the prior change — push to `memoryComments`/`memoryHistoryLogs`, filter-and-sort by `task_id`/`timestamp` on read.

## Risks / Trade-offs

- This is the third time gaps in this same hand-rolled parser have surfaced (users/tasks path drift → notifications → now tasks mutation + comments/history). A more durable fix would replace the parser with a real embedded engine (e.g. `sql.js` or `better-sqlite3` in-memory mode) so it can't silently drift from the controllers' actual queries again. That's a larger, separate architectural change and out of scope here — flagged for consideration if another gap surfaces.
