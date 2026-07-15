# Documentation webpage

## Purpose

Create a structured webpage for reviewing project migration notes before commit.

## Changes made

- Renamed the tracking folder from `Changes Track` to `Documentation`.
- Added a local webpage at `/change-log`.
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
http://localhost:3000/change-log
HTTP 200
```

## Review URL

```text
http://localhost:3000/change-log
```

## Follow-up: Document-style reading layout

Updated the `/change-log` page so each Markdown file reads like an independent document instead of a compact app panel.

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
- kept `/change-log` available as a compatibility route
- updated `/change-log` to recursively read markdown files from `Documentation`
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
