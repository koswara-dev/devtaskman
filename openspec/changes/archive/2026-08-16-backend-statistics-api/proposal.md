## Why

BRD FR-006 requires a reporting dashboard for PM/Leader roles showing task status distribution and completed-vs-remaining progress toward the release deadline. Today this is computed entirely client-side in `frontend/src/components/Dashboard.tsx` by filtering the full in-memory task array — it only works because the frontend still holds a complete mock copy of all tasks. Once the frontend is wired to the real backend (see the companion `backend-frontend-integration` change), that client-side aggregation either has to re-fetch and re-scan every task on every dashboard render, or the backend needs to expose the aggregates directly. No spec or endpoint currently governs this, so it needs to be proposed before implementation.

## What Changes

- **New `GET /api/v1/statistics` endpoint**: returns aggregate counts derived from the `tasks` and `users` tables — task counts per status, task counts per priority, per-assignee completed/total counts, and a count of tasks due within a configurable window (default 3 days) that are not yet `Done`.
- **Role gating**: matches BRD FR-006 — accessible to `Admin`, `PM`, `DevLeader`, `QALeader`. `Developer`/`QA` are not part of the reporting audience per the BRD personas, so the endpoint returns 403 for those roles (this mirrors the existing `authorizeRoles` middleware pattern already used on user-management routes).
- No new tables or columns — the endpoint computes aggregates from existing `tasks`/`users` data at request time; no caching layer is introduced in this change.

## Capabilities

### New Capabilities
- `backend-statistics-api`: REST endpoint exposing task-status, priority, and per-assignee aggregates for dashboard reporting.

### Modified Capabilities
- None

## Impact

- New route file `backend/src/routes/statisticsRoutes.ts` and controller `backend/src/controllers/statisticsController.ts`, mounted at `/api/v1/statistics` in `backend/src/index.ts`.
- No frontend changes in this proposal — `Dashboard.tsx` continues computing client-side until the companion `backend-frontend-integration` change lands and can be updated to call this endpoint instead.
