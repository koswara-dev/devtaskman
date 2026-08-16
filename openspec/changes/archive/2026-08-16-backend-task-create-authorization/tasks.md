## 1. Backend: Task Creation Authorization

- [x] 1.1 In `backend/src/routes/taskRoutes.ts`, import `authorizeRoles` and apply `authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader'])` to `POST /` before `validateTaskPayload`/`createTask`.
- [x] 1.2 Manually verify: Admin/PM/DevLeader/QALeader tokens get 201 on `POST /api/v1/tasks`; Developer/QA tokens get 403.

## 2. Frontend: Mark Notifications Read

- [x] 2.1 Add `markNotificationsRead: () => Promise<void>` to `DevTaskContext`, calling `POST /api/v1/notifications/read`, then updating local `notifications` state to set `read: true` on all entries.
- [x] 2.2 Add a "Tandai Semua Dibaca" button to `SlackDrawer.tsx`'s header, wired to `markNotificationsRead`.
- [x] 2.3 Update `Navbar.tsx`'s `slackCount` to count unread slack notifications (`type === 'slack' && !n.read`) instead of all slack-type notifications.
- [x] 2.4 Manually verify via curl (login → fetch notifications → mark read → re-fetch, confirming `unread` count drops to 0); UI wiring type-checks cleanly (`tsc --noEmit` on frontend).

## 3. Spec Updates

- [x] 3.1 Update `openspec/specs/backend-rest-api/spec.md` to document the role restriction on task creation.
- [x] 3.2 Update `openspec/specs/notification-registry/spec.md` to document that the frontend surfaces a control for the mark-as-read endpoint.

## 4. Bug Found and Fixed Along the Way

- [x] 4.1 Discovered that `backend/src/db/db.ts`'s in-memory mock query parser had **no handling at all** for the `notifications` table (no `SELECT`/`INSERT`/`UPDATE` branch), so every notification read/write silently no-op'd under the in-memory fallback (i.e. whenever Postgres isn't running, which is this environment). This made the "mark all read" feature just built untestable and meant `GET /api/v1/notifications` always returned `[]` regardless of what was actually happening. Added the missing `SELECT * FROM notifications`, `INSERT INTO notifications`, and `UPDATE notifications SET read = true` branches to `query()`, mirroring the existing `users`/`tasks` handling. Verified end-to-end via curl: notifications now persist, task creation generates a new one, and mark-read correctly flips all `read` flags.

## Known Gap (discovered, not fixed — same class of bug, larger blast radius)

- The same in-memory mock parser also has no handling for the `comments` and `history_logs` tables. Under the in-memory fallback, `GET /api/v1/tasks`'s per-task `comments`/`history` arrays are always empty regardless of what was actually inserted (comment/history INSERTs silently no-op the same way notifications did). This predates this change and affects `task-comments-api`; worth a dedicated follow-up change since it's a distinct capability from task-creation authorization.
