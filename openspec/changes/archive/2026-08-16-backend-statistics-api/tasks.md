## 1. Statistics Aggregation Endpoint

- [x] 1.1 Implement `backend/src/controllers/statisticsController.ts` with a `getStatistics` handler that queries `tasks` and `users`, then computes: counts per `status`, counts per `priority`, per-assignee `{ completed, total }`, and a `dueSoonCount` (tasks with `status != 'Done'` and `dueDate` within N days, default 3).
- [x] 1.2 Implement `backend/src/routes/statisticsRoutes.ts`: `router.use(verifyJWT)`, `router.use(authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader']))`, then `router.get('/', getStatistics)`.
- [x] 1.3 Mount the router at `/api/v1/statistics` in `backend/src/index.ts`.
- [x] 1.4 Add `@openapi` JSDoc annotations on the route consistent with the existing Swagger setup (`backend/src/docs/swagger.ts` glob already covers `src/routes/*`).

## 2. Verification

- [x] 2.1 Manually verify: Admin/PM/DevLeader/QALeader tokens get 200 with correct aggregate shape; Developer/QA tokens get 403; unauthenticated requests get 401.
- [x] 2.2 Confirm aggregate counts match a manual tally against the seeded mock/Postgres task data.
