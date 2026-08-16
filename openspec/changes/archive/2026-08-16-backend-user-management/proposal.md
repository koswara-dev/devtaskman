## Why

Currently, there are no endpoints to create, update, or delete user accounts on the backend. System administrators require a "User Management" API capability to manage active team member listings, control profile configurations, and safely terminate user access when employees leave the company.

## What Changes

- **User Accounts Registry Endpoints**: Add API endpoints to list users (`GET /api/users`), register new accounts (`POST /api/users`), edit user details (`PUT /api/users/:id`), and remove users (`DELETE /api/users/:id`).
- **Administrative Role Enforcement**: Apply authorization checks guaranteeing that only administrators (`Admin` role) can change roles or delete profiles.
- **Form Input Validations**: Sanitize and check format parameters (e.g. email validity, role values bounds) on user mutations.

## Capabilities

### New Capabilities
- `user-profile-management`: Endpoints and access controls to perform CRUD operations on user accounts.

### Modified Capabilities
- None

## Impact

- `backend/src/index.ts`: Exposes User CRUD endpoints and links validators/authorization checks.
- `backend/src/db.ts`: Modifies `users` table updates to support profile deletions and detail changes.
