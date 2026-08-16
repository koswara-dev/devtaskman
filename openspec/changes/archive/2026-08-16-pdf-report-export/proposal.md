## Why

BRD FR-006 already covers an in-app "Dasbor Laporan" for PM/Leader roles (implemented as `Dashboard.tsx` + the `backend-statistics-api` endpoint). The client now wants a **downloadable PDF** version of that report — the recurring business need behind this is sharing a snapshot with stakeholders who don't have system access (management review, release sign-off, email attachment), which an interactive in-browser dashboard can't serve on its own.

## What Changes

- **New endpoint `GET /api/v1/statistics/report.pdf`**: reuses the exact aggregation logic already in `statisticsController.getStatistics` (status/priority counts, per-assignee completion breakdown, due-soon count) and renders it into a PDF document instead of JSON, streamed back with `Content-Type: application/pdf`.
- **Role gating**: identical to `GET /api/v1/statistics` — `Admin`, `PM`, `DevLeader`, `QALeader` only (BRD FR-006 reporting audience), via the same `authorizeRoles` middleware.
- **PDF library**: `pdfkit` — a pure-Node PDF generator with no headless-browser dependency, chosen specifically to respect BRD constraint 7.1 ("kerangka kerja yang ringan" — a lightweight framework, explicitly so the app runs on standard office laptops without heavy memory overhead). Puppeteer/Chromium-based HTML-to-PDF rendering was considered and rejected on that basis.
- **Frontend**: a "Unduh Laporan PDF" button on `Dashboard.tsx`, visible to the same roles that can already see the dashboard's charts, downloading the generated file via an authenticated `fetch` + blob (plain `<a href>` can't carry the `Authorization` header this API requires).

## Capabilities

### New Capabilities
- `pdf-report-export`: downloadable PDF rendering of the dashboard statistics report, restricted to the BRD FR-006 reporting audience.

### Modified Capabilities
- None (the underlying statistics computation in `backend-statistics-api` is reused unchanged, not modified — this change adds a new rendering of the same data, not new aggregation logic).

## Impact

- New `backend/src/controllers/reportController.ts` (or a `generatePdf` function added to `statisticsController.ts`) and a route addition in `backend/src/routes/statisticsRoutes.ts`.
- New dependency: `pdfkit` (+ `@types/pdfkit`).
- `frontend/src/components/Dashboard.tsx`: new download button and a fetch-as-blob download handler; no changes to existing chart rendering.
