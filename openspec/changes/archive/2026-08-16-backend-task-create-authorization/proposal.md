## Why

The `backend-frontend-integration` change's tasks.md flagged two gaps discovered while wiring the frontend to the real backend, deliberately left unfixed to keep that change scoped to frontend wiring:

1. **`POST /api/v1/tasks` has no server-side role check.** `backend/src/controllers/taskController.ts`'s `createTask` never inspects `req.user.role`. The "only Admin/PM/DevLeader/QALeader can create tasks" rule (BRD FR-002) is enforced only in the frontend (`DevTaskContext.tsx`'s `addTask`) and, indirectly, via `updateTask`'s status-transition rules once a task exists. Any authenticated user — including Developer or QA — can currently create a task by calling the API directly, bypassing the UI. This is an OWASP A01:2021 Broken Access Control gap in a codebase that otherwise takes OWASP compliance seriously (`backend-security-owasp`).
2. **No UI control calls `POST /api/v1/notifications/read`.** The endpoint exists and is spec'd (`notification-registry`), but `SlackDrawer.tsx`/`Navbar.tsx` only display an unread Slack-count badge — there's no "mark all read" button anywhere, so the endpoint is unreachable from the app.

## What Changes

- **Server-side authorization on task creation**: `taskController.createTask` gains the same role check pattern already used elsewhere (`authorizeRoles` middleware, matching `userRoutes.ts`'s Admin-only routes) — restricted to `Admin`, `PM`, `DevLeader`, `QALeader`, returning 403 for `Developer`/`QA`.
- **"Mark all read" control**: add a button to `SlackDrawer.tsx`'s header (both Slack and System tabs) that calls the already-existing `POST /api/v1/notifications/read` via a new `markNotificationsRead` context function, then reflects the cleared unread state in the Navbar's badge count.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `backend-rest-api`: task creation now requires an authorized role, matching the access-control pattern already documented for other mutation endpoints.
- `notification-registry`: adds a requirement that the frontend actually surfaces a control to mark notifications as read, closing the loop on the existing endpoint requirement.

## Impact

- `backend/src/routes/taskRoutes.ts`: add `authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader'])` before `createTask` (mirrors `userRoutes.ts`).
- `frontend/src/context/DevTaskContext.tsx`: new `markNotificationsRead()` function calling `POST /api/v1/notifications/read`, then refreshing local `read` flags.
- `frontend/src/components/SlackDrawer.tsx`: new "Tandai Semua Dibaca" button; `frontend/src/components/Navbar.tsx`'s slack-count badge reflects unread state instead of total slack-type count.
