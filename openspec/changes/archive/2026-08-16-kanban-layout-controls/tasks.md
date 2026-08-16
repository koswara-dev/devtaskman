## 1. Collapsible Sidebar Layout

- [x] 1.1 Add `isSidebarCollapsed` state in `DashboardLayout` in `src/App.tsx` and adjust left padding of `DashboardLayout` wrapper container dynamically.
- [x] 1.2 Update `src/components/Sidebar.tsx` to handle `isSidebarCollapsed` prop, switching sidebar wrapper width classes (`w-64` vs `w-16`), toggle button layout, and hiding/showing typography details.
- [x] 1.3 Add sidebar collapse toggle trigger button to `src/components/Navbar.tsx` on the far-left of the active role status display.

## 2. Fullscreen Mode Trigger

- [x] 2.1 Add fullscreen icon button in `src/components/Navbar.tsx` next to the Slack alert trigger.
- [x] 2.2 Implement Fullscreen API request/exit handlers inside `Navbar.tsx`, tracking browser fullscreen state transitions.

## 3. Collapsible Kanban Columns

- [x] 3.1 Declare CSS utility styles for vertical text rendering (`.writing-vertical`) and rotated display adjustments in `src/index.css`.
- [x] 3.2 Add local collapse/expand state for each status column inside `src/components/KanbanBoard.tsx`.
- [x] 3.3 Update Kanban Board column rendering loop to support collapsed column lane styles (vertical text, small card counts, and expand icons) and expanded default columns.
