## 1. Global Layout & Scrollbar Refinement

- [x] 1.1 Refactor global and column scrollbars in `src/index.css` using slim webkit scrollbar overrides with transparent track and floating rounded thumb properties.
- [x] 1.2 Update container heights in `src/App.tsx` and main layout elements to set `overflow-hidden` on main layout when viewing the Kanban page, preventing double scrollbars.

## 2. Kanban Board Columns Design Standard

- [x] 2.1 Refactor `src/components/KanbanBoard.tsx` columns mapping to use a uniform background style (`bg-slate-100/40 border-slate-200`) for all columns.
- [x] 2.2 Add colored top border indicators (`border-t-4`) for each column based on status color maps in `src/components/KanbanBoard.tsx`.
- [x] 2.3 Refactor column header layouts: align task count badge (`bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full`) separated from the text, and style the `+` action button with a rounded background hover.

## 3. Kanban Cards Spacing & Interactivity

- [x] 3.1 Increase card padding to `p-4` and typography separation in card layouts.
- [x] 3.2 Relocate the absolute-positioned mobile arrows on cards to the bottom card footer next to the comments counter / due date text, toggling opacity on card group hover.
- [x] 3.3 Apply smooth transition and subtle shadows to card layouts to look premium.
