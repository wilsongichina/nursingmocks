# NursingMocks Codex Instructions

These instructions apply to all Codex work in this repository.

## Default Workflow

- Inspect the existing implementation before editing.
- Make the smallest safe change that satisfies the request.
- Preserve existing routes, data sources, permissions, loading states, and dynamic generation logic unless the task explicitly asks to change them.
- Do not redesign unrelated UI or refactor unrelated code.
- Do not hardcode data that already has a project source of truth.
- Update the relevant file in `Documentation/` when behavior, UI structure, data flow, or user-facing functionality changes.
- Run `.\node_modules\.bin\tsc.cmd --noEmit` after TypeScript or React changes.

## Code Comments

Use helpful comments as a standard, but avoid noisy comments.

Add comments when they explain:

- non-obvious business rules
- why a value is intentionally hardcoded
- why dynamic data must not be replaced
- persistence or database side effects
- permission, entitlement, or subscription logic
- route, slug, or build-time data assumptions
- complex UI state behavior such as mutually exclusive expansion

Do not add comments that only restate obvious code.

Good:

```ts
// Keep exam catalog sections mutually exclusive so the sidebar stays scannable.
```

Avoid:

```ts
// Set the state.
```

## UI Changes

- Match existing component patterns before introducing new UI patterns.
- Keep user dashboard, profile, billing, referrals, progress, and package screens visually consistent.
- Preserve mobile behavior when changing shared layout or sidebar code.
- For sidebar changes, keep catalog sections data-driven from the existing sidebar/catalog source of truth.

## Admin Page Layout

- Admin pages should use the full available content width after the admin sidebar, matching `/admin/nursing-entrance-exam`.
- Keep the shared admin sidebar offset at `md:ml-20` when collapsed and `md:ml-64` when expanded.
- Do not constrain admin workspaces with centered page caps such as `mx-auto max-w-7xl`; admin pages handle dense tables, forms, cards, and management data.
- Use full-width admin content containers such as `w-full max-w-none` inside the post-sidebar content area.
- Keep the desktop admin top bar full width with horizontal padding, commonly `px-8` on existing exam admin pages.
- Admin page bodies should preserve generous working padding while remaining full width, typically `px-4 py-6 sm:px-6 lg:px-8` unless the existing page pattern uses a more specific spacing system.
- Use responsive grids based on the available admin workspace, but avoid narrow multi-column form rows that cause labels or inputs to overlap.
- Prefer management-oriented layouts for admin tools: summary metrics, creation/editing panels, and full-width record lists/tables that can scale with data.

## Admin Visual Design

Use `/admin/users` as the default admin aesthetic reference.

- Admin page shell should use `min-h-screen bg-white overflow-x-hidden`.
- Admin content area should use `min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8`.
- Page eyebrow should use `text-sm font-semibold text-purple-700`.
- Page title should use `text-2xl font-bold text-gray-950`.
- Supporting text should use `text-sm text-gray-600` with a readable max width when appropriate.
- Primary admin buttons should use `rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700`.
- Secondary/admin table buttons should use bordered purple styling such as `border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`.
- Standard inputs should use `rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100`.
- Admin cards and panels should use `rounded-xl border border-gray-200 bg-white`; sections that contain tables should also use `overflow-hidden`.
- Section headers should use `border-b border-gray-200 px-4 py-3`, `text-sm font-semibold text-gray-950`, and count/helper text in `text-xs text-gray-500`.
- Admin tables should use `min-w-full divide-y divide-gray-200 text-sm`, `thead` with `bg-gray-50`, header cells with `px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500`, and body rows with `divide-y divide-gray-100 bg-white`.
- Status badges should use small rounded border pills, matching the tones used in `/admin/users`: green for enabled/active, red for destructive/disabled, gray for neutral, purple for admin/accent, and amber for warning/configuration status.
- Layout should prioritize dense management: main record tables on the left or primary column, detail/create/edit panels in a secondary side column when practical.
- For admin pages with several record types, use tabs or segmented controls so only one dense table is visible at a time.
- Long create/edit forms should be collapsible or placed in a side panel/drawer so the primary management table stays easy to scan and scrolling remains short.

## Documentation

- Record completed changes in the relevant documentation file.
- Include files changed, behavior updated, validation run, and any assumptions.
- If a change touches shared behavior, mention the affected scope.

## Git Safety

- Do not revert user changes unless explicitly asked.
- Do not run destructive git commands.
- Commit only when the user asks for a commit.
