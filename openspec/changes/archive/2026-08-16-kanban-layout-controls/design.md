## Context

The application has fixed layouts (`w-64` sidebar, `pl-64` margin, and standard horizontal scrollable columns). To resolve visual clutter on smaller screens, we will introduce collapsible sidebar state and collapsible columns, plus a navbar fullscreen trigger. See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/kanban-layout-controls/proposal.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Add sidebar minimize state toggles adjusting layout column grids from `w-64`/`pl-64` to `w-16`/`pl-16`.
- Add column-level collapsed toggles inside Kanban board component state.
- Add browser fullscreen API triggers in the top navbar.

**Non-Goals:**
- Syncing visual layout preferences to the backend database.
- Storing column collapse state in database (local React component state is sufficient).

## Decisions

### 1. Sidebar Collapse State in App.tsx (DashboardLayout)
- **Chosen Option**: Declare `[isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)` inside `DashboardLayout` in `src/App.tsx`. Navbar and Sidebar will receive props to display and trigger the toggle.
- **Alternatives Considered**: Storing in `DevTaskContext`. Keeping it in `DashboardLayout` keeps layout states separate from domain tasks state.

### 2. Collapsed Kanban Columns Representation
- **Chosen Option**: Declare `[collapsedColumns, setCollapsedColumns] = useState<Record<TaskStatus, boolean>>({...})` in `src/components/KanbanBoard.tsx`.
  - When collapsed, a column is styled with `min-w-[50px] w-[50px] items-center`. The header title is rotated using standard CSS `writing-mode: vertical-rl;` and transform offsets.
  - When expanded, it uses `min-w-[250px] flex-1`.
- **Alternatives Considered**: Grid CSS template columns dynamic fraction adjustments. Standard state checks with toggled tailwind width classes (`w-12` vs `min-w-[250px]`) are more robust and performant.

### 3. Native Fullscreen API Integration
- **Chosen Option**: In `src/components/Navbar.tsx`, add a toggle button that calls `document.documentElement.requestFullscreen()` or `document.exitFullscreen()` depending on the active state, tracking it using standard window state event listeners (`fullscreenchange`).

## Risks / Trade-offs

- **[Risk]** Fullscreen API might not be supported on certain mobile devices or sandboxed environments.
  → **Mitigation**: Add feature capability checking (`document.fullscreenEnabled`) before rendering the navbar toggle button.
