# User Typography Standards

## Purpose

This document records the shared typography and interface-element system for authenticated user pages.

Reference page:

```text
/typography
```

Source files:

```text
src/app/globals.css
src/app/typography/page.tsx
Documentation/user-dashboard/User typography standards.md
```

## Intent

`/typography` is an internal visual standard page. It should not be treated as a normal customer feature page.

Use it to standardize:

- page background and content width
- page header or hero structure
- tabs, breadcrumbs, and section navigation
- headings and readable text sizes
- cards, detail surfaces, and featured surfaces
- form labels, fields, hints, validation states, choice rows, toggles, and read-only states
- buttons and action hierarchy
- button sizes, states, grouping, and mobile behavior
- status pills
- compact badges and count labels
- alerts, notices, and empty states
- data rows and tables
- search, sort, and filtering controls
- pagination for repeated records
- loading, modal, destructive, summary, progress, and empty-state patterns
- spacing and layout rules

The examples on `/typography` must stay generic. Do not make the page specific to one product area, one workflow, or one screen.

## Visual Source

The authenticated-user theme now reuses the calm background and surface language from `/pricing`:

- Page background: `radial-gradient(circle at top left, #eef2ff, #f5f6fb 40%, #f9fafb 100%)`.
- Primary surfaces: translucent white cards with `#e3e5f0` borders and soft slate shadows.
- Featured surfaces: light indigo/cyan gradient surfaces for one high-priority account state.
- Accent language: indigo actions, muted slate text, cyan status dot, and dashed neutral pills.

Pricing uses tighter marketing typography in a few places. Authenticated user pages should reuse the background and surfaces, but keep the readable user-page typography scale below.

## Standard Classes

Use these classes on authenticated user pages:

- `user-page`
- `user-page-container`
- `user-page-header`
- `user-page-header-row`
- `user-page-header-copy`
- `user-page-header-actions`
- `user-page-header-meta`
- `user-eyebrow`
- `user-page-title`
- `user-section-title`
- `user-card-title`
- `user-body`
- `user-body-sm`
- `user-helper`
- `user-label`
- `user-control`
- `user-control-header`
- `user-required`
- `user-card`
- `user-detail-surface`
- `user-feature-surface`
- `user-divider`
- `user-field`
- `user-field-error`
- `user-field-success`
- `user-feedback`
- `user-feedback-error`
- `user-feedback-success`
- `user-choice`
- `user-toggle`
- `user-alert`
- `user-alert-icon`
- `user-alert-info`
- `user-alert-success`
- `user-alert-warning`
- `user-alert-error`
- `user-button-primary`
- `user-button-secondary`
- `user-button-cancel`
- `user-close-button`
- `user-search-panel`
- `user-search-row`
- `user-search-input`
- `user-search-icon`
- `user-filter-bar`
- `user-filter-chip`
- `user-active-filter`
- `user-pagination`
- `user-page-controls`
- `user-page-button`
- `user-page-ellipsis`
- `user-tabs`
- `user-tab`
- `user-breadcrumbs`
- `user-nav-list`
- `user-nav-pill`
- `user-subnav`
- `user-subnav-link`
- `user-skeleton`
- `user-stat-tile`
- `user-stat-value`
- `user-progress`
- `user-progress-bar`
- `user-steps`
- `user-step`
- `user-step-marker`
- `user-modal-backdrop`
- `user-modal`
- `user-modal-header`
- `user-modal-body`
- `user-modal-footer`
- `user-button-danger`
- `user-empty-page`
- `user-pill`
- `user-pill-purple`
- `user-pill-green`
- `user-pill-amber`
- `user-badge`
- `user-badge-count`
- `user-badge-purple`
- `user-badge-green`
- `user-badge-amber`
- `user-badge-red`
- `user-accent-dot`

## Typography Rules

- Page titles should use `user-page-title`.
- Major panel headings should use `user-section-title`.
- Compact card headings should use `user-card-title`.
- Normal explanatory copy should use `user-body` or `user-body-sm`.
- Form labels should use `user-label`.
- Field hints and consequence notes should use `user-helper`.
- The examples on `/typography` should use neutral labels such as `Learning Center`, `Recommended Actions`, `Status`, or `Recent Activity`.
- Avoid example text that makes the standard page look like it belongs only to one screen.

## Layout Rules

- Use `user-page` as the outer wrapper on authenticated user pages.
- Use `user-page-container` for the inner width and page padding.
- Authenticated user pages should use the same maximum width as the current profile page: `1360px`.
- The shared width token is `--user-page-max-width: 1360px`.
- The standard desktop page gutter is `--user-page-gutter: 32px`.
- The standard mobile page gutter is `--user-page-gutter-mobile: 28px`.
- Keep page sections in a clear vertical rhythm with predictable gaps.
- Use responsive grids for sidebars and summary panels.
- On narrow screens, stack content vertically and keep controls full width when needed.
- Do not nest cards inside cards unless the inner element is a true repeated item or compact detail surface.
- Use `user-detail-surface` inside a card when grouped secondary information needs its own boundary.
- Use `user-divider` to separate dense content without adding another heavy border.

## Page Header Rules

- Use `user-page-header` at the top of authenticated user pages.
- Use `user-page-header-row` to align title copy and optional actions.
- Use `user-page-header-copy` around the eyebrow, title, and description.
- Use `user-page-header-actions` for primary or secondary page-level actions.
- Use `user-page-header-meta` for small status pills, badges, or metadata below the intro copy.
- The header should have one `user-page-title`.
- The eyebrow should be short and category-like, not a sentence.
- The description should explain what the user can manage on the page in one concise paragraph.
- Keep page headers functional. Do not use marketing hero layouts for authenticated user management pages.
- On mobile, header actions should stack and become easy to tap.
- Use at most one primary action in the header.
- Do not put dense tables, forms, or large cards inside the page header.

## Navigation Rules

- Use `user-tabs` and `user-tab` for peer views within the same page.
- Mark the selected tab with `aria-selected="true"`.
- Use disabled tabs only when the locked state is meaningful and explained nearby.
- Use `user-breadcrumbs` for nested pages where users need a back path.
- Do not use breadcrumbs on shallow top-level user pages.
- Use `user-nav-list` and `user-nav-pill` for simple horizontal page navigation where a sidebar would be too heavy.
- Mark the current nav pill with `aria-current="page"` when it links to the current page.
- Use `user-subnav` and `user-subnav-link` for persistent section navigation.
- Mark the current subnav item with `aria-current="page"`.
- Keep navigation labels short and predictable.
- Avoid mixing tabs and subnav for the same level of navigation.

## Summary And Progress Rules

- Use `user-stat-tile` for compact metrics that summarize the page.
- Use `user-stat-value` for the main metric value.
- Use `user-progress` and `user-progress-bar` for completion percentages.
- Progress bars need nearby text or an accessible label that states the value.
- Use `user-steps`, `user-step`, and `user-step-marker` for ordered multi-step states.
- Do not use metric tiles for decorative numbers that do not help user decisions.

## Loading, Modal, And Destructive Rules

- Use `user-skeleton` for loading layouts when the final shape is known.
- Use plain loading text when the final shape is unknown or the wait is very short.
- Use `user-modal-backdrop`, `user-modal`, `user-modal-header`, `user-modal-body`, and `user-modal-footer` for dialogs.
- Dialogs should include `role="dialog"`, `aria-modal="true"`, and an accessible title.
- Use `user-button-danger` only for destructive or irreversible actions.
- Destructive actions should explain consequences before the user confirms.
- Use `user-empty-page` when the whole page has no content or no results.
- Empty states should include the next useful action when one exists.

## Surface Rules

- Use `user-card` for normal page sections.
- Use `user-detail-surface` for secondary grouped values, read-only blocks, compact detail rows, and empty states.
- Use `user-feature-surface` only when one item needs priority on the page.
- Do not use multiple featured surfaces in one viewport unless the page has a strong reason.
- Keep decorative effects subtle; surfaces should help management and scanning.

## Form Rules

- Inputs, selects, and textareas should use `user-field`.
- Labels should sit above fields.
- Use `user-control` to group a label, field, and helper or validation message.
- Use `user-control-header` when a label needs a required/optional marker.
- Use `user-required` for required markers, not punctuation-only labels.
- Helper text should explain format, consequences, or why a value is locked.
- Read-only fields should remain visually intentional and not look broken.
- Disabled fields should be used only when the user cannot interact with the value.
- Fields that affect access, billing, security, personalization, or saved progress need clear helper text.
- Use the correct input mode for numeric, email, phone, and date-like fields when possible.
- Use `user-field-success` and `user-feedback-success` when a field value has been validated successfully.
- Use `user-field-error` and `user-feedback-error` when the user must correct a value.
- Error text should explain the correction, not only say that something is invalid.
- Use `user-choice` for checkboxes and radio rows that need explanatory text.
- Use `user-toggle` as the visual standard for immediate on/off preferences.
- Do not use toggles for actions that require a separate save step unless the page makes that behavior clear.

## Action Rules

- Use one primary action per decision area.
- Secondary actions should cancel, navigate, preview, refresh, or support the primary action.
- Avoid showing several equally strong actions in one panel.
- Keep button labels short and action-oriented.
- Disabled actions should have helper text or nearby context when the reason is not obvious.
- Put the primary action first in grouped actions.
- Use `user-button-cancel` for backing out of forms, modals, or unsaved edit states.
- Use `user-close-button` only for dismissing panels, dialogs, popovers, alerts, and temporary UI.
- A close button needs an accessible label such as `aria-label="Close"` or `aria-label="Dismiss alert"`.
- Do not use a close icon when the action discards unsaved work without confirmation.
- Do not use a cancel button to hide an alert; use a close button when dismissal is safe.
- Use compact buttons inside tables, dense lists, and repeated rows.
- Use full-width buttons on mobile when a form or narrow layout needs easier tapping.
- Return buttons to content-width on larger screens when full-width would make the page harder to scan.
- Do not use primary styling for destructive, optional, or low-importance actions.
- Keyboard focus must remain visible on all buttons.
- Disabled buttons must not move or keep hover shadows.

## Status And Feedback Rules

- Status labels should use `user-pill` and the tone modifier when needed.
- Badges should use `user-badge` and a tone modifier when needed.
- Use pills for larger status states that need to be readable as standalone labels.
- Use badges for compact metadata, counts, nav labels, small table labels, and short inline tags.
- Use `user-badge-count` for numeric counts so the badge keeps a stable compact shape.
- Use green for active/ready/success states.
- Use purple for recommended/featured/current states.
- Use amber for review, warning, or attention states.
- Use red only for errors, failed states, or destructive attention.
- Use the neutral pill for optional, inactive, or metadata labels.
- Use `user-accent-dot` beside compact page badges or status labels when a visual anchor is helpful.
- Alerts should use `user-alert` plus a severity class.
- Use `user-alert-info` for neutral context, next steps, and non-blocking guidance.
- Use `user-alert-success` to confirm completed actions.
- Use `user-alert-warning` before a user changes something that may have consequences.
- Use `user-alert-error` when an action fails or the user must correct something.
- Alerts should explain what happened, what will happen next, or what the user needs to do.
- Do not use error alerts for minor helper text; use field-level validation instead.
- Do not use warning alerts as decoration. They should signal real attention.
- Notices should usually use the information alert style unless a stronger severity is needed.
- Empty states should tell the user what is missing and provide a next action when one exists.

## Data Display Rules

- Use data rows for label/value information that users need to scan quickly.
- Use tables for repeated comparable records.
- Table headers should stay compact and readable.
- Tables should allow horizontal scrolling on small screens.
- Do not force dense records into cards when a table is easier to compare.
- Do not use a table when only two or three static values are being shown.

## Search And Filter Rules

- Use search and filters when users need to narrow repeated records before scanning.
- Use `user-search-panel` to group search, sorting, quick filters, and active filters.
- Use `user-search-row` for the main search and sort row.
- Use `user-search-input` around a search field when showing a leading search indicator.
- Use `user-filter-bar` for quick filter chips.
- Use `user-filter-chip` for toggle-style filters and set `aria-pressed` to reflect the active state.
- Use `user-active-filter` to show applied filters that can be removed individually.
- Include a clear filters action when more than one filter can be active.
- Search inputs should use `type="search"`.
- Sort controls should use a select when the choices are mutually exclusive.
- Do not hide active filters after applying them; users need to see why a list changed.
- Keep filter labels short and predictable.

## Pagination Rules

- Use pagination for repeated records that should not load all at once.
- Use `user-pagination` to wrap the summary text and controls.
- Use `user-page-controls` for the button group.
- Use `user-page-button` for previous, next, and page number controls.
- Mark the current page with `aria-current="page"`.
- Disable unavailable previous/next controls instead of hiding them when position context matters.
- Use `user-page-ellipsis` when page ranges are collapsed.
- Use a compact previous/current/next pattern on narrow layouts.
- Pagination summary text should explain the visible range, such as `Showing 21-30 of 128 records`.
- Do not use pagination when infinite scroll or simple "Load more" would be easier for the user.

## Readability Rules

- Do not use viewport-scaled font sizes for user management pages.
- Do not use negative letter spacing in user management pages.
- Keep labels compact, but keep inputs and helper copy readable.
- Use helper text when a field changes access, billing, security, or personalization.
- Avoid large marketing-style hero typography on account management screens.
- Avoid one-off text sizes unless the standard scale cannot solve the layout.
- Reuse pricing backgrounds and surfaces, but do not copy pricing's compact marketing text sizes into account-management forms.

## Rollout Plan

1. Use `/typography` as the visual reference before changing authenticated user pages.
2. Prefer replacing local typography utilities with the shared classes when touching a page.
3. Keep page-specific layout decisions local, but keep typography, fields, cards, buttons, status pills, data rows, notices, and empty states shared.
4. When updating a user page, use `user-page` as the outer background wrapper and `user-page-container` for width.
5. Add new global classes only when a reusable pattern appears across multiple authenticated user pages.
6. If a page needs a special component, document whether it is page-specific or should become part of the shared standard.

## Validation

Completed:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.
