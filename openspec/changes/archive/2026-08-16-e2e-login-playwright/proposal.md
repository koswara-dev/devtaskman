## Why

The repo has zero automated tests — every verification so far (including the recent `backend-frontend-integration` change that rewrote `Login.tsx` from click-to-impersonate to real `POST /api/v1/auth/login` credential auth) has been manual curl checks against a running backend. Login is the correct first target: it's the gate every other flow sits behind, and it just changed from a fake to a real auth flow, which is exactly the kind of change a regression could silently break. The user asked to start with login only, using Playwright driven by the Google Chrome already installed on this machine (`C:\Program Files\Google\Chrome\Application\chrome.exe`, confirmed present) rather than Playwright's bundled Chromium.

## What Changes

- **New `e2e/` project** (sibling to `frontend/` and `backend/`, matching the repo's existing per-concern folder layout): a standalone Playwright + TypeScript test package with its own `package.json`.
- **Playwright config** targeting the installed Chrome via `channel: 'chrome'` (not the Playwright-managed Chromium), with a `webServer` array that boots both the backend (`backend`, port 5000) and frontend (`frontend`, port 5173) dev servers automatically when running tests locally.
- **Deterministic test data**: a global setup step calls `POST /api/v1/reset` before the suite runs, so login tests always see the known seeded accounts (`alice@company.com` / `password123`, etc.) regardless of what earlier manual testing left in the store.
- **Login test coverage only** (explicitly scoped — other flows are follow-up changes):
  - Successful login via the credential form.
  - Successful login via the "quick sign-in" demo-account grid.
  - Failed login (wrong password) shows an inline error and does not navigate away from `/login`.
  - Session persists across a page reload (token restored from `localStorage`, user stays on `/dashboard`).
  - Logout clears the session and redirects back to `/login`.

## Capabilities

### New Capabilities
- `e2e-login-tests`: automated browser test coverage for the login/logout flow.

### Modified Capabilities
- None

## Impact

- New directory `e2e/` with its own `package.json`, `playwright.config.ts`, and `tests/login.spec.ts` — does not touch `frontend/` or `backend/` source.
- Requires Google Chrome to be installed on any machine running these tests (CI or local); `playwright.config.ts` will fail fast with a clear error if the `chrome` channel isn't found.
- Running the suite starts real backend + frontend dev servers and calls the real reset endpoint — it is an integration-level E2E suite, not a mocked/unit test.
