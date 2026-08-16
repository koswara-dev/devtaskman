## Context

`frontend/src/components/Login.tsx` (rewritten in `backend-frontend-integration`) offers two login paths: a manual email/password form, and a grid of demo-account buttons that log in with a hardcoded seed password (`password123`). Both call `DevTaskContext.login()`, which calls `POST /api/v1/auth/login`, stores the JWT + user in `localStorage` (`dtm_token`, `dtm_current_user`), and loads workspace data. `App.tsx` redirects to `/login` whenever `currentUser` is `null` and shows a "Memuat sesi..." screen while `isBootstrapping`. The backend has no seed-data isolation between test runs beyond `POST /api/v1/reset`, and no auth rate limiting beyond the general `apiLimiter` (100 req/15 min per IP) already in front of `/api/v1`.

## Goals / Non-Goals

**Goals:**
- Cover the login/logout flow end-to-end against real running services (no network mocking) using the Chrome already installed on the machine.
- Make the suite runnable with a single command and deterministic (reset seed data first).

**Non-Goals:**
- Not covering Kanban, Admin, Dashboard, or notification flows in this change — those are natural follow-ups once the login foundation exists.
- Not setting up CI wiring (GitHub Actions, etc.) in this change — local runnability first, per the user's "login dulu" (login first) framing.
- Not testing against Postgres specifically — the suite runs against whatever the backend falls back to (Postgres if configured, in-memory otherwise); both should behave identically for login given `backend-postgresql-database-integration`'s fallback design.

## Decisions

- **`channel: 'chrome'`, not bundled Chromium.** Per explicit user choice. Playwright's `channel` option locates the system-installed Google Chrome instead of downloading its own browser binary — trades hermetic version pinning for using what's already on the machine. `playwright.config.ts` sets this once at the `use` level so every test inherits it without per-test wiring.
- **`webServer` array boots both dev servers.** Playwright's `webServer` config accepts an array (supported since Playwright ~1.40); one entry runs `npm run dev` in `backend/` (port 5000), another runs `npm run dev` in `frontend/` (port 5173), both with `reuseExistingServer: true` locally so a developer who already has them running doesn't get a second instance.
- **Global setup resets backend state.** A `globalSetup` script calls `POST http://localhost:5000/api/v1/reset` once before the suite runs (after `webServer` has started the backend), so tests always see the known seeded accounts and aren't polluted by whatever a previous manual session left behind.
- **New top-level `e2e/` package, not inside `frontend/`.** Keeps Playwright's browser downloads/config isolated from the Vite app's `node_modules` and build tooling, matching the existing `frontend/` + `backend/` split rather than nesting a second test toolchain inside either.
- **Test data via the login UI only, not by hitting the API directly in tests.** These are meant to be true E2E checks of the rendered login screen (form fields, quick-pick buttons, error banner, redirect), so tests drive the browser rather than asserting on API responses directly (that's already covered by the manual verification done during `backend-frontend-integration`, and by any future `backend` unit/integration tests).

## Risks / Trade-offs

- **Machine-dependent**: requires Google Chrome installed at a standard location; a CI runner without Chrome pre-installed would need either Chrome installed as a setup step or a switch to the bundled-Chromium config — flagged here rather than silently assumed solved.
- **Two dev servers + reset call add startup latency** (~5-10s) to every local test run compared to hitting a pre-built/production bundle; acceptable for a first E2E suite prioritizing realism over speed.
- **In-memory fallback vs Postgres**: if Postgres isn't running, `POST /api/v1/reset` reseeds the in-memory store (see `backend/src/db/db.ts`'s `resetInMemoryDB`); if Postgres *is* running but has no seed rows yet, `initializePostgresSchemas` only seeds on first boot — the reset endpoint does not currently reseed a non-empty Postgres users table. This is a pre-existing backend gap (not introduced here); flagged as a known limitation for the E2E suite when run against a previously-used Postgres instance.
