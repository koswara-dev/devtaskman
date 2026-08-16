## Why

Currently, users can only track task states using cards on the Kanban board. Project managers and team leads require a visual "Timeline" view (Gantt chart) to see tasks scheduled over a chronological grid, understand task durations, track deadlines relative to start dates, and verify the schedule overlap of the team.

## What Changes

- **Timeline Navigation Menu**: A new menu item "Timeline" in the Sidebar.
- **Chronological Timeline Grid**: A Gantt chart style view displaying tasks grouped vertically by assignees (or columns) and laid out horizontally across daily calendar weeks.
- **Task Duration Bars**: Tasks are represented as horizontal bars spanning from their start date to their due date. Color coding represents their status (e.g. green for Done, blue for In Progress).
- **Interactive Filtering**: Dropdowns to filter timeline tasks by assignee or priority.
- **Rescheduling Simulation**: Ability to click a bar or edit due date to simulate timeline updates.

## Capabilities

### New Capabilities
- `timeline-view`: Chronological Gantt chart timeline interface for scheduling, filtering, and task tracking.

### Modified Capabilities
- None

## Impact

- `src/components/Sidebar.tsx`: Appends a "Timeline" link in the menu selection.
- `src/App.tsx`: Routes the `/timeline` page path.
- `src/components/TimelineView.tsx` [NEW]: Renders the timeline schedule grid, filters, and duration bars.
- `src/types.ts`: Adds optional `startDate` field to the `Task` definition, or calculates it relative to `dueDate`.
