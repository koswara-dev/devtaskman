## Context

The DevTaskMan project currently has no code structure. We are creating a standalone React + Vite + TailwindCSS + TypeScript application to prototype the entire application with mock data. 

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Create a ReactJS application in the workspace root with Vite, Tailwind CSS, TypeScript, and React Router.
- Design a premium, highly aesthetic dashboard with interactive visual statistics and charts.
- Build a Kanban board enforcing role-based transitions (e.g. Developer cannot move tasks past *Ready for QA*).
- Implement persistent mock state using React Context and `localStorage` so edits and transitions persist across reloads.
- Add a simulated Slack feed component that shows real-time alerts when tasks move columns.
- Implement system administration views allowing role management, user additions, and CSV upload simulations.

**Non-Goals:**
- Actual backend or database connection (mock state only).
- Real integration with Slack API (simulated inside the UI).
- Time tracking or budgeting features (out of scope for BRD).

## Decisions

### 1. Technology Stack
- **Choice**: ReactJS (Vite) + TypeScript + Tailwind CSS.
- **Rationale**: Vite provides instant hot module reloading (HMR) and fast build times. TypeScript ensures robust typings for tasks, users, and roles. Tailwind CSS allows rapid creation of custom modern glassmorphic designs.

### 2. State & Persistence
- **Choice**: Custom React Context (`DevTaskManContext`) backed by `localStorage` persistence.
- **Rationale**: Keeps the prototype lightweight and fully standalone. Storing state in `localStorage` allows testing workflow continuity across refreshes, while a "Reset Data" action allows returning to the initial mock seed.

### 3. Data Model (TypeScript Types)
- **Roles**: `'Admin' | 'PM' | 'DevLeader' | 'QALeader' | 'Developer' | 'QA'`
- **Task Statuses**: `'Backlog' | 'ToDo' | 'InProgress' | 'ReadyForQA' | 'Testing' | 'Done'`
- **Task Priorities**: `'High' | 'Medium' | 'Low'`
- **Entities**:
  - `User`: `{ id: string, name: string, email: string, role: Role }`
  - `Task`: `{ id: string, title: string, description: string, priority: Priority, status: TaskStatus, assigneeId: string | null, dueDate: string, comments: Comment[], history: HistoryLog[] }`
  - `Notification`: `{ id: string, taskId: string, taskTitle: string, message: string, timestamp: string, type: 'slack' | 'system' }`

### 4. Kanban Interactions
- **Choice**: Click-to-move status selector plus HTML5 Drag-and-Drop capability.
- **Rationale**: Provides the best of both worlds: modern drag-and-drop for visual appeal, and explicit dropdown buttons for mobile usability and clean validation error messages (e.g., showing a modal dialog if a Developer tries to move a task past *Ready for QA*).

### 5. Visual Dashboard & Charts
- **Choice**: Custom SVG-based animated charts (donuts and bars).
- **Rationale**: Eliminates external charting library dependency issues and version conflicts while allowing total CSS control over gradients, hover states, animations, and responsive scaling.

## Risks / Trade-offs

- **[Risk]** Client-side role selection makes it easy to "cheat" security rules.
  - *Mitigation*: This is intended behavior for a high-fidelity prototype, allowing stakeholders to test all views using a floating "Role Switcher" panel.
- **[Risk]** Mock data could become corrupted if the JSON schema changes.
  - *Mitigation*: Implement safe schema parsing with fallback defaults and a prominent "Reset to Seed Data" button.
