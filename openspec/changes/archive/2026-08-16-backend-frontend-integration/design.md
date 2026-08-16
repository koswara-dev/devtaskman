## Context

The frontend (`frontend/src/context/DevTaskContext.tsx`) is a single React context that owns all app state (`users`, `tasks`, `notifications`, `currentUser`) as `useState`, seeded from hardcoded `DEFAULT_USERS`/`DEFAULT_TASKS` arrays and mirrored to `localStorage`. Every component (`KanbanBoard`, `AdminPanel`, `Dashboard`, `TaskModal`, `SlackDrawer`) reads/writes through this context's functions, which currently mutate state synchronously and return `{ success, error? }` objects. The backend already exposes matching REST endpoints under `/api/v1/*` requiring a `Bearer` JWT (see `backend/src/routes/*`), and a working SSE notification stream (added in a prior change) that the frontend already partially consumes via `useNotificationStream`.

## Goals / Non-Goals

**Goals:**
- Make `DevTaskContext` the single place that talks to the backend, so components don't change their call signatures where avoidable.
- Preserve the existing synchronous-feeling UX as much as possible (optimistic-ish updates, clear loading/error states) without a full rewrite of every component.
- Keep the change reviewable: no backend changes, no new capabilities — purely wiring plus spec-drift correction.

**Non-Goals:**
- Not implementing the statistics dashboard endpoint consumption (tracked separately in `backend-statistics-api`; `Dashboard.tsx` keeps computing client-side from fetched tasks until that lands and is wired in a follow-up).
- Not redesigning the UI/UX of Login or Admin screens beyond what's required to use real credentials instead of role-clicking.
- Not adding offline support, request retries/backoff, or a data-fetching library (React Query, SWR) — plain `fetch` + `useEffect`/`useState` matches the codebase's current simplicity level; revisit only if this proves insufficient in review.

## Decisions

- **Session storage**: JWT stored in `localStorage` under a new `dtm_token` key (mirrors the existing `dtm_*` naming convention already used for tasks/users/notifications). Decoding the JWT client-side (already signed, no need to re-verify) recovers `{ id, email, role, name }` for `currentUser` without an extra `/me` round-trip — matches what `authController` already encodes into the token payload.
- **Login credentials for existing demo users**: all seeded users share the password `password123` (already true in `backend/src/db/db.ts`'s seed data). The login form can keep a "quick pick" convenience list of seeded emails to avoid typing, but must submit real credentials through `POST /api/v1/auth/login` rather than bypassing auth — this preserves the demo-friendliness of the current UI while making it real.
- **Role switcher**: `RoleSwitcher.tsx`'s "impersonate any role" affordance has no backend equivalent (a logged-in user's role is a server-side fact, not a client toggle) and doesn't correspond to any BRD requirement — role changes are an Admin action on other users (FR-001), not self-service. This component is repurposed into a quick "switch demo account" login shortcut (still going through real `/api/v1/auth/login`) rather than removed outright, since the seeded multi-role demo data has product value for showing the app to stakeholders.
- **Error handling**: API client throws on non-2xx; call sites catch and surface the existing `{ success: false, error }` shape the components already expect, so component-level error handling (e.g. `TaskModal` showing a validation error) needs minimal changes.

## Risks / Trade-offs

- **Scope size**: this touches nearly every context function and several components; recommend landing it as a few sequential PRs (auth+client → tasks → users/admin → notifications backlog) rather than one giant diff, tracked as task groups below.
- **Seeded-password demo convenience vs. realism**: keeping a visible "quick pick" login list is slightly less realistic than a bare login form, but matches the BRD's internal-tool, low-friction intent and the existing demo-first UX; flagged here in case reviewers want it dropped.
- **In-memory DB fallback**: if Postgres isn't running, `backend/src/db/db.ts` falls back to in-memory storage that resets on server restart. This is pre-existing backend behavior, not something this change introduces, but it means frontend integration testing should note that task/user data won't survive a backend restart unless Postgres is actually configured.
