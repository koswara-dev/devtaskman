# e2e-login-tests Specification

## Purpose
Defines automated end-to-end browser test coverage for the login and logout flow, run against the installed Google Chrome via Playwright.
## Requirements
### Requirement: Automated Login Success Coverage
The project SHALL include an automated E2E test that logs in through the credential form with a seeded account and verifies the user lands on the dashboard.

#### Scenario: Login via credential form
- **WHEN** the E2E suite submits a seeded account's email and password on `/login`
- **THEN** the browser SHALL navigate to `/dashboard` and the sidebar SHALL display that account's name

#### Scenario: Login via quick-pick demo account
- **WHEN** the E2E suite clicks a demo-account button on the login screen's quick sign-in grid
- **THEN** the browser SHALL navigate to `/dashboard` and the navbar SHALL display that account's role

### Requirement: Automated Login Failure Coverage
The project SHALL include an automated E2E test that verifies invalid credentials are rejected with a visible error and no navigation.

#### Scenario: Wrong password
- **WHEN** the E2E suite submits a seeded account's email with an incorrect password
- **THEN** the browser SHALL remain on `/login` and display an inline error message

### Requirement: Automated Session Persistence Coverage
The project SHALL include an automated E2E test verifying that an authenticated session survives a page reload.

#### Scenario: Reload after login
- **WHEN** the E2E suite reloads the page after a successful login
- **THEN** the browser SHALL remain on `/dashboard` without redirecting to `/login`

### Requirement: Automated Logout Coverage
The project SHALL include an automated E2E test verifying that logging out clears the session and blocks access to authenticated routes.

#### Scenario: Logout redirects and blocks re-entry
- **WHEN** the E2E suite triggers the Sidebar logout action and then navigates to `/dashboard` directly
- **THEN** the browser SHALL redirect to `/login` in both cases

### Requirement: Deterministic Seed Data For Test Runs
The E2E suite SHALL reset backend seed data before running so login tests exercise the known seeded accounts regardless of prior state.

#### Scenario: Pre-suite reset
- **WHEN** the E2E test run starts
- **THEN** the suite SHALL call `POST /api/v1/reset` once before any test executes

