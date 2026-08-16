## 1. Project Scaffold

- [x] 1.1 Create `e2e/package.json` with `@playwright/test` as a dev dependency and scripts `test` (`playwright test`) and `test:headed` (`playwright test --headed`).
- [x] 1.2 Create `e2e/playwright.config.ts`: `use: { channel: 'chrome', baseURL: 'http://localhost:5173' }`, `webServer` array for `backend` (`npm run dev`, port 5000, `reuseExistingServer: true`) and `frontend` (`npm run dev`, port 5173, `reuseExistingServer: true`), `globalSetup` pointing at `e2e/global-setup.ts`.
- [x] 1.3 Create `e2e/global-setup.ts`: `fetch('http://localhost:5000/api/v1/reset', { method: 'POST' })` once before the suite runs.
- [x] 1.4 Chrome channel already registered with Playwright on this machine (`npx playwright install chrome` reported it already installed) — no action needed; documented as a one-time local setup step for other machines via this task.

## 2. Login Flow Tests (scoped to the Admin role per instruction)

- [x] 2.1 `e2e/tests/login.spec.ts` — successful login via the credential form (`alice@company.com` / `password123`) navigates to `/dashboard` and shows "Alice Admin" in the sidebar.
- [x] 2.2 Successful login via the Admin quick-pick demo-account button navigates to `/dashboard` and shows the "System Administrator" role label in the navbar.
- [x] 2.3 Failed login (wrong password) shows the inline error banner and stays on `/login`.
- [x] 2.4 Session persists across reload: after login, reloading the page keeps the user on `/dashboard` (token restored from `localStorage`).
- [x] 2.5 Logout (Sidebar "Keluar (Logout)") clears the session and redirects to `/login`; a subsequent direct navigation to `/dashboard` redirects back to `/login`.

## 3. Verification

- [x] 3.1 Ran `npm test` from `e2e/` against the installed Chrome (`channel: 'chrome'`, confirmed via Playwright's own "already installed" notice) — all 5 scenarios passed, with both dev servers auto-started by Playwright's `webServer` config and torn down after the run.
- [x] 3.2 Fixed an ambiguous-locator issue found during the run: `getByText('Alice Admin', { exact: true })` matched both the Sidebar and the Dashboard's team-workload table, so assertions were scoped to the Sidebar landmark (`getByRole('complementary')`).
