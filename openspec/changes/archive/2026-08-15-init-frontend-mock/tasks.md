## 1. Setup and Environment Configuration

- [x] 1.1 Create Vite React + TypeScript project structure in workspace root.
- [x] 1.2 Install necessary dependencies: Tailwind CSS, PostCSS, Autoprefixer, Lucide React, and React Router DOM.
- [x] 1.3 Configure Tailwind CSS and PostCSS configuration files.
- [x] 1.4 Setup global styles and basic application shell with routing.

## 2. Mock Data and Context Setup

- [x] 2.1 Design TypeScript interfaces for Task, User, Notification, and History logs.
- [x] 2.2 Create Context provider for state management, localStorage persistence, and default data seeding.
- [x] 2.3 Populate initial mock data (users with different roles, sample tasks across all statuses).

## 3. UI Components and Shell Layout

- [x] 3.1 Build navigation bar, sidebar, and floating Role Switcher component.
- [x] 3.2 Implement simple Login page/simulation to select the active user profile.
- [x] 3.3 Create a simulated Slack Notification Feed drawer that triggers Toast updates.

## 4. Dashboard View

- [x] 4.1 Create responsive SVG dashboard widgets (donut charts, bar charts, progress meters).
- [x] 4.2 Build statistics showing total tasks, task completion rates, and breakdowns by priority and assignee.

## 5. Kanban Board View

- [x] 5.1 Implement columns for Backlog, To Do, In Progress, Ready for QA, Testing, and Done.
- [x] 5.2 Add Card components with priority indicators, due dates, assignee avatars, and action controls.
- [x] 5.3 Enforce role-based state transitions (revert and show warnings if unauthorized, e.g. Developer moving beyond Ready for QA).
- [x] 5.4 Build modal/dialog to view task details, list comments, and show historical audit logs.

## 6. Admin Panel and Management

- [x] 6.1 Create User Management table allowing Admin to assign/change user roles.
- [x] 6.2 Implement mock CSV template download and CSV upload parser to import employees.
- [x] 6.3 Add task creation and editing form modal accessible only to PMs and Leaders.
