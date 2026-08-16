## Context

The application currently renders a Kanban board with distinct pastel backgrounds for each status column, thick default-styled scrollbars, a double scrollbar issue, and mobile transition arrow controls that overlap card details. The client requested layout improvements to make the UI look tidier and more premium. See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/tidy-ui-improvements/proposal.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Standardize all Kanban columns to use a uniform neutral background layout with a colored top indicator strip for column status.
- Fix height calculations to eliminate double scrollbars on the Kanban page.
- Clean up default scrollbar style to be thin, floating, and rounded.
- Relocate absolute-positioned mobile arrows on Kanban cards to prevent overlap with titles.

**Non-Goals:**
- Modifying task state transition rules, access control checks, or data operations in `DevTaskContext`.
- Adding new screens or role switching logic.

## Decisions

### 1. Unified Column Backgrounds with Status Top Borders
- **Chosen Option**: Standardize column background elements to `bg-slate-100/50` (or `bg-slate-50/50`) and add a `border-t-4` border indicator with color corresponding to status (e.g. `border-t-emerald-500` for Done).
- **Alternative Considered**: Full-column background colors (current state). Full-column fills degrade readability and clash visually. Solid color strip borders are cleaner and match professional layouts.

### 2. Main Page Layout Scroll Containment
- **Chosen Option**: Set height restrictions dynamically in the layout wrapper to ensure the Kanban column height adjusts to fit exactly within the viewport, using `h-[calc(100vh-170px)]` on column loops. Make the outer wrapper overflow-hidden for the Kanban view.
- **Alternative Considered**: Keeping static viewport heights. This causes double vertical scrollbars (both for the outer page and the column list).

### 3. Custom Webkit Scrollbar Styling
- **Chosen Option**: Use custom webkit scrollbar overrides in `src/index.css` with a transparent track background and a rounded thumb utilizing `background-clip: padding-box` so they look slim and floating.
- **Alternative Considered**: Default system scrollbars. These look bulky on Windows and clutter the page columns.

### 4. Card Interaction Optimization
- **Chosen Option**: Place mobile arrow controls inline inside the card footer next to the due date / comment count. They will toggle opacity on card hover.
- **Alternative Considered**: Retaining absolute positioning at the top-right of the card. This overlaps with the task priority badge and titles.

## Risks / Trade-offs

- **[Risk]** Very small screen sizes may squeeze columns horizontally. 
  → **Mitigation**: Define a minimum width of `min-w-[250px]` for columns and allow the Kanban board container to scroll horizontally.
