## Purpose

Defines functional REST API endpoints on the ExpressJS server to list and mutate tasks, retrieve active users list, fetch logs, and reset data sets.

## ADDED Requirements

### Requirement: Fetch Tasks Endpoint
The system SHALL expose a `GET /api/tasks` endpoint returning a collection of all active tasks.

#### Scenario: Retrieve Task Registry List
- **WHEN** the client triggers a GET request to `/api/tasks`
- **THEN** the server SHALL return a JSON array containing all tasks with HTTP status code 200

### Requirement: Create and Update Tasks Endpoints
The system SHALL support creating new tasks via `POST /api/tasks` and updating task parameters (including assignee, description, start dates, and status transitions) via `PUT /api/tasks/:id`.

#### Scenario: Creating a New Task Record
- **WHEN** the client submits a valid task data payload via POST to `/api/tasks`
- **THEN** the server SHALL persist the task, append creation history audit log, and return the new task item with HTTP status code 201

#### Scenario: Updating Existing Task Details
- **WHEN** the client submits partial task parameters via PUT to `/api/tasks/TSK-103`
- **THEN** the server SHALL update the task attributes, append history logs, and return the updated task object with HTTP status code 200

### Requirement: Reset Seed Data Endpoint
The system SHALL support resetting active task data memory to its original seed configuration via a `POST /api/reset` endpoint.

#### Scenario: Triggering Seed Reset
- **WHEN** the client issues a POST request to `/api/reset`
- **THEN** the server SHALL overwrite the tasks memory cache with default seeds and respond with HTTP status code 200
