## Why

`backend/src/db/db.ts`'s in-memory DB fallback (used whenever Postgres isn't reachable — the state of this dev environment) is a hand-rolled parser that only recognizes specific literal SQL substrings. The `backend-task-create-authorization` change found and fixed this for the `notifications` table; while writing that fix's follow-up note, the same gap was flagged for `comments` and `history_logs`. Investigating those two surfaced three more instances of the identical root cause on the `tasks` table itself:

- `SELECT COUNT(*) FROM tasks` (used by `createTask` to generate the next task ID) isn't distinguished from the generic `SELECT * FROM tasks` handling, so it returns the full task array instead of a count row — `tasksCount.rows[0]?.count` is always `undefined`, so every new task is assigned `TSK-101`, colliding with the seed data's real `TSK-101` (this was visible during earlier manual testing, previously assumed unrelated).
- `UPDATE tasks SET ... WHERE id=$8` has no matching branch, so status/field changes are never actually written to `memoryTasks` — a `PUT /api/v1/tasks/:id` response *looks* correct (it's built from the request body, not re-queried) but a subsequent `GET /api/v1/tasks` shows the task unchanged.
- `DELETE FROM tasks WHERE id = $1` has no matching branch, so deleted tasks reappear on the next fetch.
- `INSERT INTO comments`/`INSERT INTO history_logs` and their corresponding `SELECT * FROM comments WHERE task_id = ...`/`SELECT * FROM history_logs WHERE task_id = ...` have no matching branch, so a task's `comments`/`history` arrays are always empty on fetch, regardless of what was posted.

All of these are silent no-ops (they fall through to the parser's final `return { rows: [] }`), so nothing throws or logs — the bug is invisible unless you specifically compare a mutation's immediate response against a subsequent re-fetch.

## What Changes

- Add missing mock-parser branches in `backend/src/db/db.ts`'s `query()` for: `SELECT COUNT(*) FROM tasks`, `UPDATE tasks SET ...`, `DELETE FROM tasks WHERE id = ...`, `INSERT INTO comments`, `SELECT * FROM comments WHERE task_id = ...`, `INSERT INTO history_logs`, `SELECT * FROM history_logs WHERE task_id = ...` — mirroring the existing `users`/`tasks`/`notifications` branch style (mutate the corresponding `memory*` array, return matching rows).
- No API contract or spec changes: this restores behavior the endpoints already promise (`task-comments-api`, `backend-rest-api`) that was silently broken only under the in-memory fallback. Marked `skip_specs: true` accordingly.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None (bug fix restoring already-specified behavior; no requirement text changes)

## Impact

- `backend/src/db/db.ts` only — no controller, route, or frontend changes.
- Fixes: task IDs no longer collide, task edits/deletes persist across requests, and comments/history logs actually appear on subsequent fetches, all under the in-memory (no-Postgres) fallback path.
