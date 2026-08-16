## 1. Domain Types & Seeding Start Dates

- [x] 1.1 Add optional `startDate?: string` to the `Task` definition in `src/types.ts`.
- [x] 1.2 Modify initial mock task seeds in `src/context/DevTaskContext.tsx` to pre-populate custom `startDate` strings for active and completed tasks.
- [x] 1.3 Add a new `startDate` input field to the task creation form and task detail form in `src/components/TaskModal.tsx`.

## 2. Shell Navigation & Routing Setup

- [x] 2.1 Append "Timeline" (using Lucide's `Calendar` icon) to the sidebar nav lists in `src/components/Sidebar.tsx`.
- [x] 2.2 Register the `/timeline` page path route in `src/App.tsx`.

## 3. Timeline Gantt Grid Component

- [x] 3.1 Create the timeline component file `src/components/TimelineView.tsx` with calendar day calculations (rendering 14 days starting from 7 days before today).
- [x] 3.2 Add filter dropdowns (assignee selector, priority selector) inside `TimelineView.tsx` to search calendar items.
- [x] 3.3 Map tasks to CSS Grid tracks horizontally based on duration offsets, displaying color-coded scheduling bars.
