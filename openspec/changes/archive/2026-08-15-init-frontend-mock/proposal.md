## Why

Currently, there is no user interface for the DevTaskMan platform. Creating a high-fidelity React + Vite frontend mockup with mock data will allow the team to validate the visual layout, Kanban board transitions, role-based workflows, and reporting dashboards before implementing the actual backend APIs.

## What Changes

- Initialize a new ReactJS + Vite project with TypeScript, TailwindCSS, React Router, and charting libraries.
- Implement UI components representing the DevTaskMan system:
  - **Login / Role Selector**: Allow switching between Admin, PM, Dev Leader / QA Leader, Developer, and QA Engineer to preview the system with different access levels.
  - **Dashboard**: High-fidelity reporting views showing task completion status, task distributions, and key performance charts.
  - **Kanban Board**: Drag-and-drop or state-transition interface for managing tasks across statuses (*Backlog*, *To Do*, *In Progress*, *Ready for QA*, *Testing*, *Done*) with RBAC restrictions enforced on screen.
  - **Task Form**: Interface for creating/editing tasks (PM/Leader roles only).
  - **User & Role Administration**: Interface for Admin to assign roles to users.
  - **Slack Notification Center**: Simulation panel showing Slack messages triggered by status changes.

## Capabilities

### New Capabilities
- `frontend-mock`: Initial React frontend application with comprehensive views, navigation, state management with mock data, and RBAC simulation.

### Modified Capabilities
<!-- None -->

## Impact

- Initializes a React application inside the workspace.
- Setup of build tools, TailwindCSS config, and styling guidelines.
