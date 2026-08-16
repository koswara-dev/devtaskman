## Why

The client requested UI layout improvements to make the interface cleaner, tidier, and more premium. Currently, the board columns have distinct colored backgrounds that feel visually cluttered, column headers are tightly packed, card elements lack spatial breathing room, mobile transition arrows float awkwardly, and a double scrollbar is present on the Kanban page.

## What Changes

- **Kanban Column Styling**: Unify column backgrounds to a soft, consistent slate layout (`bg-slate-100/50` or similar), utilizing a colored border-top to signify status (gray for Backlog, sky-500 for ToDo, etc.).
- **Column Header Refinements**: Align headers horizontally, format the task counter to be a clean badge separated from text, and style the `+` action button with a rounded background hover.
- **Card Spacing & Padding**: Increase default card padding to `p-4` and improve the typography layout (separating task ID, priority tag, and title cleanly).
- **Relocated Mobile Controls**: Move absolute-positioned mobile shift buttons to the bottom of the card next to comments counter/due date, removing overlapping issues with title text.
- **Scrollbar & Layout Optimization**: Restructure global and nested webkit scrollbars to be thin, floating, and elegant. Adjust height properties inside `src/App.tsx` and parent wrappers to eliminate double vertical scrollbars on the Kanban page.

## Capabilities

### New Capabilities
- None (pure visual/UX refactor)

### Modified Capabilities
- None (pure visual/UX refactor)

## Impact

- `src/components/KanbanBoard.tsx`: Restructures columns, header alignments, card padding, and mobile shift controls.
- `src/components/Sidebar.tsx` & `src/components/Navbar.tsx`: Small padding and border alignment tweaks.
- `src/index.css`: Elegant custom webkit scrollbar overlay, new height rules, and theme helpers.
- `src/App.tsx`: Main page content container scrolling boundaries.
