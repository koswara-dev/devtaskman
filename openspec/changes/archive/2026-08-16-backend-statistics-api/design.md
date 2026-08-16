## Context

`backend/src/db/db.ts` exposes a single `query(text, params)` function that either hits real PostgreSQL or a hand-rolled in-memory mock parser (`isUsingPostgres` fallback). The mock parser only recognizes a fixed set of literal SQL strings (`SELECT * FROM TASKS`, `INSERT INTO USERS`, etc. — see `db.ts` lines 270-339). Any new query shape used by the statistics endpoint must either match an existing recognized pattern or add a new one to the mock parser, or the endpoint must compute aggregates in application code after a plain `SELECT * FROM tasks` / `SELECT * FROM users` (both already supported by the mock parser).

## Goals / Non-Goals

**Goals:**
- Provide accurate aggregate counts usable by the dashboard without requiring the client to download and scan the full task list.
- Work identically whether the backend is running against real Postgres or the in-memory fallback.

**Non-Goals:**
- No caching, memoization, or scheduled pre-aggregation — data volume in this app (dozens of tasks) doesn't warrant it.
- No new SSE/real-time push for statistics (unlike notifications) — dashboards are refreshed on navigation/polling, not push.
- No historical/time-series trend data (e.g. burndown over time) — only current-state snapshots, matching BRD FR-006's stated scope ("persentase tugas per status", "jumlah tugas selesai vs sisa waktu rilis").

## Decisions

- **Aggregate in application code, not SQL.** Given the mock-parser constraint above, the controller will run `SELECT * FROM tasks` and `SELECT * FROM users` (both already supported unmodified) and compute all groupings (status, priority, per-assignee) in TypeScript. This keeps behavior identical across the Postgres/in-memory split without touching `db.ts`'s query parser. Real-Postgres deployments could instead use `GROUP BY` for efficiency, but at this data scale the difference is immaterial and consistency across both backends is worth more than the micro-optimization.
- **Role gating reuses `authorizeRoles`.** No new access-control mechanism; this mirrors the pattern already used in `userRoutes.ts` for Admin-only routes.
- **`dueSoonCount` window is a query param (`?dueSoonDays=3`), defaulting to 3.** Keeps the "sisa waktu rilis" framing flexible without hardcoding a business rule into the endpoint contract.

## Risks / Trade-offs

- Computing aggregates in-process over the full task list doesn't scale to very large datasets, but the existing in-memory fallback and the app's internal-tool scope (BRD: internal Dev/QA tracking) make this an acceptable trade-off for now. If task volume grows significantly, this should move to SQL `GROUP BY` queries against real Postgres only.
