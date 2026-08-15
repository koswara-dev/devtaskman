# frontend-mock Specification

## Purpose
Provides a responsive web interface mockup with mock data to simulate and validate user workflows, dashboards, role-based task transitions, and Slack notifications.
## Requirements
### Requirement: Role Selection and Dashboard Views
The web application SHALL support simulation of different user roles (Admin, PM, Dev/QA Leader, Developer, QA Engineer) and display customized metrics dashboards.

#### Scenario: Switching User Roles
- **WHEN** the user selects the "Developer" role from the login/role-switcher dropdown
- **THEN** the system SHALL update the navigation menu and dashboard metrics to reflect developer permissions and hide PM-only administrative controls

#### Scenario: PM Dashboard Overview
- **WHEN** the PM role is selected
- **THEN** the system SHALL display interactive charts representing task status distribution, remaining tasks vs deadline, and team performance metrics

### Requirement: Kanban Board and Role-Based Transitions
The system SHALL display tasks on a Kanban board categorized by status columns and enforce role-based constraints on status changes.

#### Scenario: Developer moving task to Ready for QA
- **WHEN** a Developer attempts to move a task from "In Progress" to "Ready for QA"
- **THEN** the system SHALL allow the state change and display the task in the "Ready for QA" column

#### Scenario: Developer blocked from moving task beyond Ready for QA
- **WHEN** a Developer attempts to move a task from "Ready for QA" to "Testing" or "Done"
- **THEN** the system SHALL block the transition, show an error alert, and revert the task position

#### Scenario: QA moving task to In Progress on failure
- **WHEN** a QA Engineer moves a task from "Testing" back to "In Progress" (marked as rework)
- **THEN** the system SHALL allow the transition, prompt for a brief description of the bug/reason, and update the task status

### Requirement: Task Administration
The system SHALL allow PMs and Leaders to create, update, and delete tasks.

#### Scenario: PM creates a new task
- **WHEN** the PM fills in the task form with title, description, priority (High/Medium/Low), due date, assignee, and clicks "Create"
- **THEN** the system SHALL add the task to the mock database with the initial status of "To Do" and render it in the Kanban board

### Requirement: Slack Notification Simulation
The system SHALL simulate sending automated messages to a Slack channel when specific task transitions occur.

#### Scenario: Notify QA when task is Ready for QA
- **WHEN** a task's status changes from "In Progress" to "Ready for QA"
- **THEN** the system SHALL generate and display a simulated Slack notification saying "Tugas [ID] - [Judul] siap diuji oleh tim QA"

#### Scenario: Notify Dev when task fails QA
- **WHEN** a task's status changes from "Testing" back to "In Progress"
- **THEN** the system SHALL generate and display a simulated Slack notification saying "Tugas [ID] - [Judul] gagal uji. Mohon periksa kembali"

### Requirement: Admin Settings and Access Control
The system SHALL allow Admins to manage users, assign roles, and import lists.

#### Scenario: Admin assigns role to a user
- **WHEN** the Admin changes a user's role using the role dropdown in the Admin console
- **THEN** the system SHALL persist the updated role in the local mock state and apply the permissions immediately

### Requirement: Import Users via CSV Template
The system SHALL provide a CSV template download and allow Admins to simulate uploading a CSV of employee roles.

#### Scenario: Admin downloads template and uploads CSV
- **WHEN** the Admin clicks the CSV template download and uploads a mock CSV containing employee names and roles
- **THEN** the system SHALL parse the CSV and populate the user list with the new accounts

