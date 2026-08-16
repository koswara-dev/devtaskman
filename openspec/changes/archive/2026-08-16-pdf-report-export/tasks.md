## 1. Backend

- [x] 1.1 Add `pdfkit` + `@types/pdfkit` to `backend/package.json`.
- [x] 1.2 Extract the aggregation logic already in `statisticsController.getStatistics` into a shared `computeStatistics(dueSoonDays)` helper (`backend/src/services/statisticsService.ts`) used by both the JSON endpoint and the new PDF endpoint.
- [x] 1.3 Add `generateReportPdf` handler: builds a `pdfkit` document (title, generated timestamp, total tasks, status distribution, priority breakdown, per-assignee completion, due-soon count), pipes it to the response with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="devtaskman-report-<date>.pdf"`.
- [x] 1.4 Add `router.get('/report.pdf', generateReportPdf)` in `backend/src/routes/statisticsRoutes.ts`, inside the existing `authorizeRoles(['Admin', 'PM', 'DevLeader', 'QALeader'])` gate.
- [x] 1.5 Add `@openapi` JSDoc for the new route (response content type `application/pdf`, binary format).

## 2. Frontend

- [x] 2.1 Add `downloadFile(path, fallbackFilename)` to `frontend/src/api/client.ts` — fetches with the stored JWT, reads the response as a `Blob`, and triggers a browser download via a synthetic `<a>` + `URL.createObjectURL` (reads the real filename from `Content-Disposition` when present).
- [x] 2.2 Add an "Unduh Laporan PDF" button to `Dashboard.tsx`'s header, visible only to Admin/PM/DevLeader/QALeader, calling `downloadFile('/statistics/report.pdf', ...)` with a loading state and inline error banner on failure.

## 3. Verification

- [x] 3.1 Manually verified via curl: PM token → 200, `Content-Type: application/pdf`, correct `Content-Disposition` filename; Developer token → 403; unauthenticated → 401.
- [x] 3.2 Verified the generated file is a real, non-corrupted PDF (`file` reports "PDF document, version 1.3, 1 page(s)") and extracted its text (`pdftotext`) to confirm every section (Ringkasan, Distribusi Status Tugas, Rasio Prioritas, Beban Kerja Anggota Tim) is present and legible.
- [x] 3.3 Confirmed the PDF's figures match `GET /api/v1/statistics`'s JSON response exactly for the same data (totalTasks: 7, dueSoonCount: 3, identical status/priority/assignee breakdowns) — the shared `computeStatistics` helper guarantees this by construction.
- [x] 3.4 `tsc --noEmit` clean on both backend and frontend.
