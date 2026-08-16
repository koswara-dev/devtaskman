## Why

The Kanban board can become horizontally crowded when all 6 columns are expanded. Users require the ability to maximize their workspace on standard screen sizes by minimizing the navigation sidebar, toggling browser fullscreen mode, and collapsing or expanding individual status columns (from Backlog to Done).

## What Changes

- **Collapsible Sidebar**: A button to collapse the navigation sidebar from its wide form (`w-64`) to a compact icon-only strip (`w-16`), automatically adjusting main content margins.
- **Fullscreen Trigger**: A header button to toggle standard HTML5 browser fullscreen mode for focused layout work.
- **Collapsible Kanban Columns**: Each status column (Backlog to Done) can be individually collapsed into a narrow vertical lane (showing rotated column label, card count, and expand icon), allocating the reclaimed space to active expanded columns.

## Capabilities

### New Capabilities
- `kanban-layout-controls`: Toggles for sidebar collapse, browser fullscreen, and column-level expand/collapse lanes.

### Modified Capabilities
- None

## Impact

- `src/components/Sidebar.tsx`: Handles compact vs expanded render states.
- `src/components/Navbar.tsx` & `src/App.tsx`: Layout sizing adjustments and fullscreen API toggles.
- `src/components/KanbanBoard.tsx`: Layout grid updates to support dynamic column widths and collapsed lanes.
- `src/index.css`: Styles vertical column headers and collapsed lanes.
