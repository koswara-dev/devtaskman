## Context

We are establishing complete user profile CRUD capabilities for administrators on the Express backend, secured by RBAC middleware rules. See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/backend-user-management/design.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Expose administrative endpoints under `/api/users`:
  - `POST /api/users` (registers new accounts)
  - `PUT /api/users/:id` (updates user attributes)
  - `DELETE /api/users/:id` (removes user profiles from database cache)
- Configure access control middlewares so only the `Admin` role can request deletion or role updates.
- Structure routes under `backend/src/routes/userRoutes.ts` and controllers under `backend/src/controllers/userController.ts`.

**Non-Goals:**
- Uploading raw binary avatar image assets directly to the server filesystem. Simulation with Unsplash/image URLs is sufficient.

## Decisions

### 1. Cascade Deletion of Assigned Tasks
- **Chosen Option**: Configure database foreign key constraints with `ON DELETE SET NULL` on `tasks.assignee_id` inside `backend/src/db/db.ts`.
- **Rationale**: If an admin deletes a user, their assigned tasks automatically fallback to `null` (unassigned) in the database instead of throwing database constraint crash errors.

### 2. User Deletion Middleware Protection
- **Chosen Option**: Wrap `DELETE /api/users/:id` inside `userRoutes.ts` with `authorizeRoles(['Admin'])` defined in `backend/src/middlewares/auth.ts`.
- **Rationale**: Blocks non-administrators from terminating user records on the backend (mitigates A01:2021 Broken Access Control).

## Risks / Trade-offs

- **[Risk]** Deleting an active user might leave orphan references in comments or history logs.
  → **Mitigation**: Preserve comments and logs but display the author name as "Mantan Anggota" (former member) or similar, or clear comments via database cascades.
