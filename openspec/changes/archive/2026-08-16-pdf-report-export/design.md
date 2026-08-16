## Context

`statisticsController.getStatistics` already computes everything a report needs (`totalTasks`, `statusCounts`, `priorityCounts`, `assigneeBreakdown`, `dueSoonCount`/`dueSoonDays`) by scanning `SELECT * FROM tasks` / `SELECT * FROM users` in application code (see `design.md` of the archived `backend-statistics-api` change for why aggregation happens in TypeScript rather than SQL — the in-memory DB fallback's mock query parser only recognizes specific literal query shapes). `statisticsRoutes.ts` already gates the JSON endpoint behind `verifyJWT` + `authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader'])`.

## Goals / Non-Goals

**Goals:**
- Produce a PDF that contains the same numbers the dashboard already shows, so there's no risk of the PDF and the live dashboard drifting apart.
- Keep the added dependency footprint minimal, consistent with BRD constraint 7.1.

**Non-Goals:**
- Not replicating the dashboard's SVG donut chart / bar visuals pixel-for-pixel in the PDF — a clean tabular report (counts, percentages, breakdown tables) is sufficient for the stated use case (sharing a snapshot with people who don't have system access) and is far simpler to generate with `pdfkit`, which has no built-in charting.
- Not adding a report-scheduling/emailing feature (e.g. "email me this report weekly") — out of scope, this change is on-demand download only.
- Not adding historical/point-in-time report snapshots (e.g. "PDF as of last Friday") — the report always reflects current live data, matching how the dashboard itself works today.

## Decisions

- **`pdfkit` over Puppeteer/HTML-to-PDF.** Puppeteer bundles/downloads a full Chromium binary (100+ MB) purely to render a report — directly at odds with BRD 7.1's lightweight-framework constraint, and overkill for a tabular report with no complex layout needs. `pdfkit` is a pure-Node, streaming PDF generator (~a few MB), already proven to run fine in this backend's dependency footprint style (small, focused packages like `helmet`, `express-rate-limit`).
- **Reuse aggregation logic, don't duplicate it.** The new endpoint calls the same aggregation code path as `getStatistics` (refactored into a shared helper if needed) rather than re-querying/re-computing independently — this is the change's core correctness guarantee: the PDF can never show different numbers than the live dashboard for the same underlying data.
- **Route**: `GET /api/v1/statistics/report.pdf`, nested under the existing `/statistics` router so it inherits the same `verifyJWT` + `authorizeRoles` middleware chain already applied there — no new authorization code path to get wrong.
- **Frontend download mechanism**: `fetch()` with the stored JWT in the `Authorization` header, response consumed as a `Blob`, then a synthetic `<a>` with `URL.createObjectURL` + `.click()` to trigger the browser's save dialog — necessary because a plain `<a href="/api/v1/statistics/report.pdf">` cannot attach an `Authorization` header, and this API is JWT-only (no cookie session to fall back on).

## Risks / Trade-offs

- **No visual charts in the PDF** (tables/numbers only) is a deliberate simplicity trade-off; if stakeholders specifically want the donut/bar charts reproduced in the PDF, that's a follow-up change (would likely require a charting library server-side or client-side canvas-to-image capture, both heavier than this change's scope).
- **Report reflects live data at request time**, not a fixed point-in-time snapshot — two people downloading the report minutes apart during active task updates could get slightly different numbers. Matches the dashboard's existing real-time framing, so not a new inconsistency, just worth naming.
