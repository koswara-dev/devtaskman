# backend-statistics-api Specification

## Purpose
Defines endpoint requirements to retrieve aggregate task statistics (by status, priority, and assignee) for dashboard reporting, per BRD FR-006.
## Requirements
### Requirement: Fetch Task Status and Priority Distribution
The system SHALL expose a `GET /api/v1/statistics` endpoint returning the count of tasks grouped by `status` and grouped by `priority`.

#### Scenario: Retrieve Status and Priority Counts
- **WHEN** an authenticated user with role Admin, PM, DevLeader, or QALeader sends a GET request to `/api/v1/statistics`
- **THEN** the server SHALL return HTTP 200 with a JSON object containing `statusCounts` (map of status to count) and `priorityCounts` (map of priority to count) covering all tasks currently in the store

### Requirement: Fetch Per-Assignee Completion Breakdown
The response of `GET /api/v1/statistics` SHALL include, for every user who is assigned at least one task, the number of tasks completed (`status = Done`) versus their total assigned task count.

#### Scenario: Retrieve Assignee Productivity
- **WHEN** an authenticated user with an allowed role requests `/api/v1/statistics`
- **THEN** the response SHALL include an `assigneeBreakdown` array of objects, each with `userId`, `userName`, `completed`, and `total` fields

### Requirement: Fetch Upcoming Deadline Count
The response of `GET /api/v1/statistics` SHALL include a count of tasks that are not yet `Done` and whose `dueDate` falls within a caller-configurable window.

#### Scenario: Retrieve Due-Soon Count With Default Window
- **WHEN** an authenticated user with an allowed role requests `/api/v1/statistics` without a `dueSoonDays` query parameter
- **THEN** the response SHALL include `dueSoonCount` computed using a default window of 3 days from the current date

#### Scenario: Retrieve Due-Soon Count With Custom Window
- **WHEN** an authenticated user with an allowed role requests `/api/v1/statistics?dueSoonDays=7`
- **THEN** the response SHALL include `dueSoonCount` computed using a 7-day window from the current date

### Requirement: Restrict Access By Role
The system SHALL restrict `GET /api/v1/statistics` to users with role Admin, PM, DevLeader, or QALeader, consistent with the BRD FR-006 reporting audience.

#### Scenario: Reject Non-Reporting Roles
- **WHEN** an authenticated user with role Developer or QA sends a GET request to `/api/v1/statistics`
- **THEN** the server SHALL return HTTP 403 with an error message and no statistics data

#### Scenario: Reject Unauthenticated Requests
- **WHEN** a request to `/api/v1/statistics` is sent without a valid JWT
- **THEN** the server SHALL return HTTP 401

