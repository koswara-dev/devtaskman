## MODIFIED Requirements

### Requirement: Create and Update Tasks Endpoints
The system SHALL support creating new tasks via `POST /api/v1/tasks`, restricted to users with role Admin, PM, DevLeader, or QALeader, and updating task parameters (including assignee, description, start dates, and status transitions) via `PUT /api/v1/tasks/:id`.

#### Scenario: Creating a New Task Record
- **WHEN** an authenticated user with role Admin, PM, DevLeader, or QALeader submits a valid task data payload via POST to `/api/v1/tasks`
- **THEN** the server SHALL persist the task, append creation history audit log, and return the new task item with HTTP status code 201

#### Scenario: Rejecting Task Creation From Non-Privileged Roles
- **WHEN** an authenticated user with role Developer or QA submits a POST request to `/api/v1/tasks`
- **THEN** the server SHALL reject the request with HTTP status code 403 and SHALL NOT create a task

#### Scenario: Updating Existing Task Details
- **WHEN** the client submits partial task parameters via PUT to `/api/v1/tasks/TSK-103`
- **THEN** the server SHALL update the task attributes, append history logs, and return the updated task object with HTTP status code 200
