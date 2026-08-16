## Context

`backend/src/middlewares/auth.ts` already exports `authorizeRoles(allowedRoles: string[])`, used today on `userRoutes.ts`'s create/import/delete routes. `taskRoutes.ts` currently only applies `verifyJWT` (any authenticated user) to all task routes; `updateTask` in `taskController.ts` does its own inline role/status-transition checks rather than using the shared middleware, because those checks depend on the *target status* (data in the request body), not just the caller's role — `authorizeRoles` alone can't express "Developer can move to ReadyForQA but not Testing". Task *creation* has no such data-dependent nuance — it's a flat role gate — so it can use the shared middleware directly.

On the frontend, `notifications` already carry a `read: boolean` field (`Notification` type, `types.ts`), populated from the backend, but nothing in the UI ever sets it to `true` or calls the read-endpoint.

## Goals / Non-Goals

**Goals:**
- Close the task-creation authorization gap using the existing, already-tested `authorizeRoles` middleware — no new access-control mechanism.
- Give users a way to actually reach the existing `POST /api/v1/notifications/read` endpoint.

**Non-Goals:**
- Not adding per-notification (individual) read/unread toggling — the existing endpoint is all-or-nothing (`UPDATE notifications SET read = true`), and this change doesn't redesign that; the UI control matches the endpoint's actual granularity.
- Not touching `updateTask`'s existing inline transition-rule logic — it already enforces role rules correctly for status changes, just via a different mechanism than `authorizeRoles`, and unifying those is out of scope here.

## Decisions

- **Middleware placement**: `router.post('/', authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader']), validateTaskPayload, createTask)` in `taskRoutes.ts` — authorization runs before payload validation, consistent with `userRoutes.ts`'s ordering (reject unauthorized callers before doing any work).
- **Navbar badge semantics change**: today `slackCount` counts *all* `type === 'slack'` notifications (never decreases). After this change it SHALL count unread ones (`type === 'slack' && !read`), which is the behavior a "mark as read" button implies — otherwise clicking "mark all read" would have no visible effect on the one piece of UI that surfaces unread state.

## Risks / Trade-offs

- **Frontend/backend now enforce task-creation rules in two places** (client-side check in `DevTaskContext.addTask` for instant UX feedback, server-side `authorizeRoles` as the actual guard) — this is the same defense-in-depth pattern already used for `moveTask`/`updateTask`, not a new pattern, but worth naming explicitly since it means two places to keep in sync if the allowed-role list ever changes.
