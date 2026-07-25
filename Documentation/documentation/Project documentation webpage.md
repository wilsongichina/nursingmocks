# Documentation webpage

## Purpose

Create one structured Documentation webpage for reviewing project notes, implementation decisions, standards, and migration history.

## Changes made

- Renamed the tracking folder from `Changes Track` to `Documentation`.
- Added the local Documentation webpage at `/documentation`.
- The page reads Markdown files from `Documentation` and renders them as structured documents.
- Added summary counts for documents and sections.
- Added document navigation.
- Rendered headings, paragraphs, bullet lists, inline code, and code blocks.
- Set page metadata to `index: false` and `follow: false` so the page is not intended for search indexing.

## Validation

- TypeScript check passed:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

- Direct Next.js production build passed:

```text
.\node_modules\.bin\next.cmd build
```

- Local page check passed:

```text
http://localhost:3000/documentation
HTTP 200
```

## Review URL

```text
http://localhost:3000/documentation
```

## Follow-up: Document-style reading layout

Updated the Documentation page so each Markdown file reads like an independent document instead of a compact app panel.

Changed:

- widened the page shell independently from admin page width standards
- added a document-style header with summary counts
- kept document navigation in a sticky side index
- centered each rendered Markdown file in a readable paper-width column
- gave every Markdown document its own article container
- gave every `##` section its own bordered section block
- preserved `###` subheadings as sub-section headings instead of flattening them into normal paragraphs
- improved list, code block, and inline code styling for easier scanning

Reason:

- documentation files are not dense admin data
- each file should feel like a real document page
- section boundaries should be clear when reviewing long migration notes

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm run build
```

## Follow-up: Documentation search

Added a search bar to the Documentation page.

Changed:

- added a search form to the top of `/documentation`
- search supports the `q` query parameter
- search checks document titles, file names, folder paths, group names, headings, lists, code blocks, and body text
- document and section counts now reflect the filtered result set
- added a clear action to return to the full documentation view
- added a polished empty state when no documents match the search

Reason:

- the documentation library has grown large enough that folder navigation alone is not enough
- admins should be able to quickly find billing stages, dashboard notes, route names, field names, and implementation decisions
- search should reuse the existing documentation reader instead of creating another documentation surface

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Dynamic documentation visibility

Updated the Documentation route so newly added Markdown files are read at request time.

Changed:

- marked `/documentation` as dynamic so it reads Markdown at request time
- kept the page reading Markdown files from `Documentation/`
- preserved the grouped folder navigation and single-open document behavior

Reason:

- newly created documentation files should appear on the documentation page without requiring a production rebuild
- planning documents such as `Documentation/user-dashboard/Exam mode simulation plan.md` must be visible from the local documentation viewer

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Single Documentation Route

Merged the visible change-log and documentation concepts into one Documentation page.

Changed:

- moved the full Markdown reader implementation to `/documentation`
- made `/change-log` redirect to `/documentation` for compatibility with older links
- updated the search form and clear-search links to use `/documentation`
- kept all Markdown content under the `Documentation/` folder
- kept today's Exam Mode simulation plan under `Documentation/user-dashboard/Exam mode simulation plan.md`
- kept today's Documentation search, request-time visibility, and route consolidation notes in this file

Reason:

- the project uses these files for standards, plans, implementation history, billing stages, migration records, and UI decisions
- keeping separate visible change-log and documentation pages would duplicate the same source of truth
- `/documentation` is clearer for long-term use, while `/change-log` remains safe for old bookmarks

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Single-open document accordion

Updated the documentation page so document bodies do not all stay expanded at once.

Changed:

- only the first rendered documentation file is open by default
- every other documentation file starts collapsed
- document headers remain visible for scanning
- opening one document closes the previously open document
- folder sections remain visible so admins can still find Billing, Admin, User Dashboard, Email, Migration, and Documentation groups

Reason:

- long documentation pages are easier to manage when only one document body is visible at a time
- the first document gives immediate content without forcing the full page to expand
- collapsed documents reduce scrolling while keeping the full library accessible

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Grouped documentation folders

Renamed the markdown source folder and organized documentation into topic-specific folders.

Changed:

- renamed `Project Change Log` to `Documentation`
- moved billing markdown files into `Documentation/billing`
- moved admin markdown files into `Documentation/admin`
- moved transactional email markdown files into `Documentation/email`
- moved migration phase markdown files into `Documentation/migration`
- moved user dashboard markdown files into `Documentation/user-dashboard`
- moved this page documentation into `Documentation/documentation`
- added `/documentation` as the documentation route
- kept `/change-log` available as a compatibility redirect
- updated the Documentation page to recursively read markdown files from `Documentation`
- grouped the rendered page by documentation folder
- added grouped navigation so Billing, Admin, User Dashboard, Email, Migration, and Documentation each have their own section
- updated repository instructions to reference `Documentation/`
- mechanically updated markdown path references from `Project Change Log/...` to `Documentation/...`

Reason:

- each markdown file should live under its own subject area
- billing documentation should be managed separately from admin, email, migration, and user-dashboard notes
- the documentation page should reflect the folder structure clearly

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
