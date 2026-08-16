## Why

The backend already implements REST CRUD for tasks/users/comments, JWT auth, RBAC, OWASP hardening, and a live SSE notification stream. Despite that, the frontend was never wired to it: `DevTaskContext.tsx` held every entity as local React state seeded from hardcoded defaults and persisted to `localStorage`, `Login.tsx` "logged in" by letting the user click a name (no credentials, no request), and no `fetch`/`axios` calls existed anywhere in `frontend/src` outside the notification SSE hook. This blocked the BRD's core objective (a single centrally-tracked source of truth for Dev/QA task state) and left the backend's auth/RBAC/security work unused.

This is also the natural point to correct a previously flagged spec/implementation path drift: `backend-rest-api` and `jwt-user-authentication` documented unversioned paths (`/api/tasks`, `/api/auth/login`) while the backend has always served `/api/v1/...`.

## What Changes

- **API client module**: add `frontend/src/api/client.ts` — a thin fetch wrapper that resolves the base URL (`VITE_API_URL`, same convention as the `useNotificationStream` hook), attaches `Authorization: Bearer <token>` when a session exists, and normalizes error responses.
- **Real authentication**: replace `Login.tsx`'s click-to-impersonate flow with a real `POST /api/v1/auth/login` call (seeded users authenticate with `password123`); store the returned JWT and decoded user in memory + `localStorage` for session persistence across reloads; replace the mock `switchUser` "role switcher" concept accordingly (see Impact).
- **Tasks**: `DevTaskContext` fetches tasks from `GET /api/v1/tasks` on load and after mutations, and routes `addTask`/`updateTask`/`deleteTask`/`moveTask`/`addComment` through `POST/PUT/DELETE /api/v1/tasks...` instead of mutating local state directly.
- **Users/Admin**: `AdminPanel.tsx` operations (`updateUserRole`, create, delete, CSV import) call `GET/POST/PUT/DELETE /api/v1/users...` and `POST /api/v1/users/import`.
- **Notifications backlog**: on load, fetch existing history via `GET /api/v1/notifications` (the SSE stream added previously only carries new events going forward, not history) and merge with live stream events.
- **Data reset**: the existing "reset demo data" action (if retained in the UI) calls `POST /api/v1/reset` instead of clearing `localStorage`.
- **Spec corrections**: update `backend-rest-api` and `jwt-user-authentication` requirement text to reference the real `/api/v1/...` paths, closing the drift between spec and implementation.
- **`frontend-mock` retirement**: its requirements describing pure client-side simulation (data persisted only to `localStorage`, task creation calling it "the mock database") are superseded by backend-backed equivalents.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-mock`: role/session, task, user, and CSV-import behavior now source of truth from the backend API instead of local mock state; Slack notification simulation becomes the already-implemented backend notification/SSE feed instead of a client-only simulation.
- `backend-rest-api`: correct endpoint paths from `/api/tasks` / `/api/reset` to the actual `/api/v1/tasks` / `/api/v1/reset`, and broaden scope to note the endpoints this change makes the frontend actually depend on (comments, users).
- `jwt-user-authentication`: correct endpoint path from `/api/auth/login` to `/api/v1/auth/login`, and from guarding `/api/tasks` to guarding `/api/v1/tasks` (and note it also guards `/api/v1/users`, `/api/v1/notifications`).

## Impact

- `frontend/src/context/DevTaskContext.tsx`: state initialization and every mutator function change from synchronous local updates to async API calls (loading/error states need to be introduced).
- `frontend/src/components/Login.tsx`: becomes a real credential form (email + password) instead of a role-switcher list; the existing `RoleSwitcher.tsx` "switch role for demo purposes" affordance either is removed or is re-scoped to Admin-only role reassignment via the real `PUT /api/v1/users/:id` endpoint (needs a product decision — flagged in design.md).
- New file `frontend/src/api/client.ts`.
- `openspec/specs/backend-rest-api/spec.md` and `openspec/specs/jwt-user-authentication/spec.md` get path corrections (behavior-preserving; documentation catching up to already-shipped implementation).
- No backend code changes are required by this proposal — the REST/auth/notification endpoints it depends on already exist and were verified working during the SSE change.
