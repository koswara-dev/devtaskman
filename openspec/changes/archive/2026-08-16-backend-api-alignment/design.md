## Context

We are aligning the ExpressJS API endpoints with the React client's mocked behaviors under the modular v1 directory structure. See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/backend-api-alignment/proposal.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Implement `POST /api/v1/users/import` to register user listings in bulk.
- Implement `GET /api/v1/notifications` and `POST /api/v1/notifications/read` inside a modular notification router.
- Implement `POST /api/v1/tasks/:id/comments` to append standalone text comments.

**Non-Goals:**
- Direct CSV raw file parsing inside the Express routes. The client's React side parses CSV strings to arrays and posts JSON payloads, which is cleaner and safer.

## Decisions

### 1. Dedicated Notification Routers & Controllers
- **Chosen Option**: Create `backend/src/routes/notificationRoutes.ts` and `backend/src/controllers/notificationController.ts`.
- **Rationale**: Isolates alerts operations from other task/user resources.

### 2. Standalone Task Comments Endpoints
- **Chosen Option**: Create `POST /api/v1/tasks/:id/comments` inside `taskRoutes.ts` handled by `taskController.ts`.
- **Rationale**: Keeps task-related mutations consolidated under the task route controller namespace.

## Risks / Trade-offs

- **[Risk]** Large payload sizes during bulk imports causing rate limit throttling.
  → **Mitigation**: Bulk operations bypass rate counts or count as a single transaction under the 100/15-minute budget.
