## Purpose
Defines a downloadable PDF rendering of the dashboard statistics report, per BRD FR-006's reporting requirement for PM and Leader roles.

## ADDED Requirements

### Requirement: Generate PDF Statistics Report
The system SHALL expose a `GET /api/v1/statistics/report.pdf` endpoint returning a PDF document containing total task count, task status distribution, priority breakdown, per-assignee completion breakdown, and due-soon count — the same figures returned by `GET /api/v1/statistics` for the same data.

#### Scenario: Download PDF Report
- **WHEN** an authenticated user with role Admin, PM, DevLeader, or QALeader sends a GET request to `/api/v1/statistics/report.pdf`
- **THEN** the server SHALL return HTTP 200 with `Content-Type: application/pdf` and a downloadable PDF document containing the current statistics

#### Scenario: Report Figures Match The JSON Statistics Endpoint
- **WHEN** a client requests `GET /api/v1/statistics/report.pdf` and `GET /api/v1/statistics` in immediate succession without any intervening task/user mutation
- **THEN** the numeric figures in the PDF SHALL match the JSON response exactly (same `statusCounts`, `priorityCounts`, `assigneeBreakdown`, `dueSoonCount`)

### Requirement: Restrict PDF Report Access By Role
The system SHALL restrict `GET /api/v1/statistics/report.pdf` to users with role Admin, PM, DevLeader, or QALeader, matching the access control already applied to `GET /api/v1/statistics`.

#### Scenario: Reject Non-Reporting Roles
- **WHEN** an authenticated user with role Developer or QA sends a GET request to `/api/v1/statistics/report.pdf`
- **THEN** the server SHALL return HTTP 403 and no PDF content

#### Scenario: Reject Unauthenticated Requests
- **WHEN** a request to `/api/v1/statistics/report.pdf` is sent without a valid JWT
- **THEN** the server SHALL return HTTP 401

### Requirement: Frontend PDF Download Control
The frontend SHALL provide a "Unduh Laporan PDF" control on the Dashboard, visible to Admin/PM/DevLeader/QALeader, that downloads the generated PDF report.

#### Scenario: User downloads the report
- **WHEN** an Admin, PM, DevLeader, or QALeader user clicks "Unduh Laporan PDF" on the Dashboard
- **THEN** the client SHALL fetch `/api/v1/statistics/report.pdf` with the authenticated session's JWT and trigger a browser download of the returned PDF
