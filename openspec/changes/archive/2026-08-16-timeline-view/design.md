## Context

The application needs a Gantt chart style view. Currently, the `Task` definition in `src/types.ts` has `dueDate` but no `startDate`. We will extend the domain types, add mock seeds, and build a custom timeline grid in React. See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/timeline-view/proposal.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Extend the `Task` interface with an optional `startDate?: string` and update creation modals.
- Create [src/components/TimelineView.tsx](file:///c:/Projects/fullstack/devtaskman/src/components/TimelineView.tsx) displaying a lightweight, responsive calendar grid.
- Map tasks onto the calendar grid horizontally by computing relative column spans from their durations.
- Add assignee and priority dropdown filters to search timeline records.

**Non-Goals:**
- Integrating bulky, external Gantt chart libraries. A custom lightweight CSS Grid representation is lighter and fits the design theme perfectly.

## Decisions

### 1. Task start Date Attribute & Fallbacks
- **Chosen Option**: Add `startDate?: string` to `Task` in [src/types.ts](file:///c:/Projects/fullstack/devtaskman/src/types.ts). If undefined, the mockup renders it starting 3 days before `dueDate`. The task modal is updated to allow setting start dates.
- **Alternatives Considered**: Automatically generating and forcing start date creation in context. Optional parameters are more robust.

### 2. Custom HTML CSS Gantt Grid
- **Chosen Option**: Render a 14-day scrolling grid dynamically starting from 7 days before today. Calculate horizontal offsets by counting date differences:
  - `const dayDiff = (dateStr - gridStart) / (1000 * 60 * 60 * 24)`
  - Use these offsets as CSS Grid properties (`gridColumnStart`, `gridColumnEnd`) on task bars.
- **Alternatives Considered**: Flexbox blocks with absolute position margins. Grid offsets align automatically with calendar day columns and support responsive resizing.

### 3. Navigation Hookup
- **Chosen Option**: Add route `/timeline` in [src/App.tsx](file:///c:/Projects/fullstack/devtaskman/src/App.tsx) and menu button inside [src/components/Sidebar.tsx](file:///c:/Projects/fullstack/devtaskman/src/components/Sidebar.tsx) using the `Calendar` icon from Lucide.

## Risks / Trade-offs

- **[Risk]** Time zone offsets shifting date calculations.
  → **Mitigation**: Standardize all date inputs to `YYYY-MM-DD` strings and parse using midnight time references.
