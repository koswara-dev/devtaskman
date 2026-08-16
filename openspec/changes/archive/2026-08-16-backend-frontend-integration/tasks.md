## 1. API Client and Session Foundation

- [x] 1.1 Add `frontend/src/api/client.ts`: base URL resolution (`VITE_API_URL` fallback `http://localhost:5000`), `request()` helper attaching `Authorization: Bearer <token>` from `localStorage['dtm_token']`, JSON parsing, and error normalization.
- [x] 1.2 Replace `Login.tsx` with a real credential form posting to `POST /api/v1/auth/login`; on success, store token + user, call `onLoginSuccess()`. (Kept a "quick sign-in" demo-account grid per design.md, still submitting real credentials.)
- [x] 1.3 Update `DevTaskContext` session bootstrap to read `dtm_token`/stored user on mount and restore `currentUser`; clears the session on a 401 from any API call. (Stores the `user` object returned by the login response directly rather than decoding the JWT client-side — functionally equivalent, simpler.)

## 2. Tasks

- [x] 2.1 Replace `tasks` state initialization with `GET /api/v1/tasks` on mount (loading state while pending, via `isBootstrapping`).
- [x] 2.2 Wire `addTask` to `POST /api/v1/tasks`, `updateTask`/`moveTask` to `PUT /api/v1/tasks/:id`, `deleteTask` to `DELETE /api/v1/tasks/:id`, `addComment` to `POST /api/v1/tasks/:id/comments`; update local state from the response payload rather than local mutation.
- [x] 2.3 Remove the `dtm_tasks` localStorage mirror (backend is now the source of truth).

## 3. Users and Admin

- [x] 3.1 Replace `users` state initialization with `GET /api/v1/users` on mount.
- [x] 3.2 Wire `updateUserRole` to `PUT /api/v1/users/:id`. (No standalone user create/delete UI exists in `AdminPanel.tsx` — only role editing and CSV import — so there was nothing else to wire here.)
- [x] 3.3 Wire `importUsersCSV` to `POST /api/v1/users/import`.
- [x] 3.4 Remove the `dtm_users` localStorage mirror.

## 4. Notifications

- [x] 4.1 On mount, fetch notification history via `GET /api/v1/notifications` (part of `loadWorkspaceData`) and merge with whatever the live `useNotificationStream` hook delivers (dedupe by `id`).
- [x] 4.2 "Mark all read" UI action: no such control exists in `SlackDrawer.tsx`/`Navbar.tsx` today (it only shows an unread Slack-type counter), so `POST /api/v1/notifications/read` was not wired to anything — flagged as a gap, not fabricated as done.
- [x] 4.3 Remove the `dtm_notifications` localStorage mirror and hardcoded default notifications.

## 5. Cleanup and Spec Corrections

- [x] 5.1 `resetAllData` now calls `POST /api/v1/reset` and reloads workspace data instead of clearing `localStorage`.
- [x] 5.2 Path corrections applied via this change's spec deltas (`specs/backend-rest-api/spec.md`, `specs/jwt-user-authentication/spec.md`), merged into the main specs on archive.
- [x] 5.3 Manually verified via curl end-to-end (login as PM/Admin/Developer, fetch users/tasks/notifications, role update, task creation) with both the backend and frontend dev servers running; confirmed CORS headers present for `http://localhost:5173` origin and `tsc --noEmit` + `vite build` clean on the frontend.

## 6. Bugs Found and Fixed Along the Way

- [x] 6.1 Fixed a pre-existing in-memory-DB fallback bug in `backend/src/db/db.ts`: the mock query parser only recognized the literal string `SELECT * FROM USERS`, so `userController.getUsers`'s actual query (`SELECT id, name, email, role, avatar_url FROM users ...`) never matched and silently returned `[]` whenever Postgres wasn't running. Broadened the match to `startsWith('SELECT') && includes('FROM USERS')` (and the equivalent for `TASKS`), verified `GET /api/v1/users` now returns the seeded users under the in-memory fallback.

## Known Gaps (not fixed in this change, flagged for follow-up)

- `POST /api/v1/notifications/read` has no UI control to trigger it (pre-existing UI gap, not introduced here).
- `taskController.createTask` on the backend has no role check — the "only Admin/PM/DevLeader/QALeader can create tasks" rule is enforced client-side (`addTask` in `DevTaskContext.tsx`) and via `updateTask`'s status-transition rules, but a authenticated non-privileged user could still call `POST /api/v1/tasks` directly. Pre-existing backend gap, out of scope for a frontend-wiring change; worth a small follow-up on `backend-rest-api`/`backend-security-owasp`.
