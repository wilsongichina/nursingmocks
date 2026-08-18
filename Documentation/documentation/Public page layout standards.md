# Public Page Layout Standards

## Purpose

This document records the shared width standard for the public homepage and company/legal pages.

## Standard

- Public marketing and company pages should use `public-page-container` for their main page sections.
- The shared desktop width token is `--public-page-max-width: 1320px`.
- The shared desktop gutter token is `--public-page-gutter: 6vw`.
- The shared mobile gutter token is `--public-page-gutter-mobile: 28px`.
- Do not nest `public-page-container` inside another `public-page-container`; nested containers make sections narrower than the shared width.
- On the homepage, non-FAQ sections should align to the same public width. The FAQ section may stay centered and narrower for readability.
- Inner reading areas, such as long legal policy content, may stay narrower when readability is more important than full section width.
- Legal pages should use the same outer `public-page-container` width as the homepage. Avoid adding a second `980px` page wrapper around the hero or main legal content.

## Current Scope

The standard has been applied to:

- Homepage
- About
- Contact
- Guarantees
- Privacy Policy
- Terms & Conditions
- Cookie Policy
- Money-Back Guarantee

## Validation

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Footer Capitalization Follow-Up

- Standardized shared frontend footer labels to title case.
- Updated `NewFooter` company/legal links to `Privacy Policy`, `Terms & Conditions`, and `Money-Back Guarantee`.
- Updated the legacy `Footer` labels to `FAQs`, `How It Works`, `Terms & Conditions`, and `Money-Back Guarantee`.
- Updated footer body copy to use `Nursing Exit Exams` consistently.
- Standardized related shared frontend navigation and breadcrumb labels so `Terms & Conditions`, `Money-Back Guarantee`, and `Privacy Policy` match the footer.

## Homepage Mobile And Asset Follow-Up

- Added shared public-page guttering to the public header so the logo and mobile menu align with homepage content.
- Reduced the mobile logo height while preserving `object-contain` sizing so the logo fits the top-left header area.
- Updated the mobile menu panel to align with the header height and use the shared public page width.
- Tightened homepage mobile spacing, section padding, and CTA wrapping to reduce horizontal overflow risk.
- Cleaned broken homepage text encoding artifacts so separators and dashes render normally.
- Preferred `/favicon.ico` as the shortcut icon while keeping `/favicon.png` available for PNG and Apple icon metadata.

## Pricing Page Catalog Follow-Up

- Reworked `/pricing` as a public package-selection page that keeps the homepage background, public width, white card surfaces, rounded corners, purple accents, and compact marketing section rhythm.
- Pricing cards now load active public billing plans from `/api/billing/catalog` instead of hardcoded plan arrays.
- Plan labels, prices, featured state, package access, and checkout readiness now reflect admin billing configuration.
- Checkout buttons use the existing checkout session endpoint for authenticated users and send signed-out users through `/login?returnTo=...`.
- Removed subscription-first wording from the public pricing flow so one-time exam access remains the default user-facing assumption unless a plan is configured otherwise.
- Replaced the wide comparison table with compact package summaries to improve mobile scanning and reduce horizontal scrolling.
- Pricing page visual styling should follow the homepage aesthetic: `#f9fafb` page background, gradient hero band, `public-page-container`, compact `clamp(34px,4.2vw,44px)` hero title scale, 13-15px supporting copy, rounded `22px` white cards, and homepage-style pill buttons.
- Pricing page mobile rules: CTAs should stack full-width below `sm`, pricing cards should avoid fixed mobile heights, long plan names/package labels must wrap, and side-panel helper items should use compact rounded cards rather than single-line pills.
- Public page labels should avoid awkward capitalization of small words such as `and`, `or`, `to`, and `a` unless they begin the phrase or are part of a formal product name.

## Legal Page Width Follow-Up

- Removed extra `980px` wrappers from Privacy Policy, Terms & Conditions, Cookie Policy, and Money-Back Guarantee.
- Legal page heroes and main content now use the same shared public page width as the homepage.
- Content cards remain inside the shared container so spacing stays aligned with other public pages.

## Public Sidebar Exam Menu Follow-Up

- The shared public sidebar should show all exam pillar groups together in the expanded desktop and mobile views.
- Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams should not behave as mutually exclusive accordion sections.
- The collapsed desktop sidebar can remain icon-only to preserve the compact navigation width.
- Sidebar category data should continue to come from the existing static/sidebar data source and Firestore fallback; do not hardcode exam lists in the component.
- Sidebar question-pool modals should prioritize click response: open the modal immediately, render nested cards as soon as nested pages load, and cache results in memory for repeat clicks.
- Do not run live question-count aggregation from the sidebar modal. Show saved `questionCount` values when present; otherwise use a neutral view-sets state and let the destination page provide detailed counts.
- The build-time sidebar data generator should include nested modal page groups in `modalNestedPages` so common sidebar popups can render from static data before falling back to Firestore.
- For Nursing Test Bank sidebar modals, use lightweight saved totals or generated `topicCount`; do not walk from nested page to topics to quizzes to questions at click time.
- After large quiz imports or content cleanup, refresh saved nested-page sidebar totals with `npm run content:sidebar-counts:dry-run`, then `npm run content:sidebar-counts:apply`, then `npm run generate:sidebar`.
- Sidebar question-pool modals should act as subject selectors. Use a real destination action such as `Open Subject`; reserve `Review Mode`, `Exam Mode`, and set-specific actions for individual quiz/set cards or confirmed in-page anchors.
- Nursing Entrance sidebar modal cards should link to the saved nested page slug directly, such as `/teas-math-practice-test`; do not compose parent-plus-child URLs for these subject pages.

## Nursing Test Bank Public Page Model

- Nursing Test Bank pages are topic-driven, not practice-set-driven at the subject-card level.
- Public Test Bank sub-pages such as `/lpn-exams` and `/rn-exams` group users by exam vendor first, for example HESI vs ATI, then send users deeper into topics.
- Nursing Test Bank subject-card actions should use topic language such as `View Topics`; do not reuse Nursing Entrance or Nursing Exit wording such as `View Practice Sets` for these group cards.
- When a Nursing Test Bank sub-page has only two child groups, use the wider two-card layout so the page does not leave empty multi-column grid space.
- Vendor names such as HESI and ATI should be visually prominent on two-group Test Bank cards because they are the main difference between the options.
- Keep this behavior scoped to `pillarId === "nursing-test-bank"` so Nursing Entrance Exam and Nursing Exit Exam pages continue to use their existing subject and set-based layouts.
- Nursing Test Bank nested topic pages, such as `/ati-rn-exams` and `/ati-lpn-exams`, should display the official topic `pageName` for scannable navigation while topic page H1s, meta details, and URL slugs may continue to use the approved SEO fields.
- Nursing Test Bank nested topic cards use a compact selector layout with the official topic name on the left and the planned exam count badge on the right when that count exists; they should not show Review Mode or Exam Mode buttons at the topic-selector level.
- Nursing Test Bank nested topic pages hide the shared hero summary badge row and hero CTA buttons so the page can move users directly from the intro copy into the topic selector.
- Nursing Test Bank nested topic pages also hide the shared topic-section eyebrow/title block; the selector description should sit under the main page heading instead of repeating generic topic-section copy.

### 2026-08-01: Kaplan Admission Test Sidebar Cache

- Regenerated static sidebar data after adding the Kaplan Admission Test under Nursing Entrance Exam in Firestore.
- `public/data/sidebar-data.json` and `src/lib/data/sidebar-data.ts` now list `Kaplan Admission Test` as a Nursing Entrance Exam sub-page with slug `/kaplan-admission-test`.
- Firestore route mapping confirms `/kaplan-admission-test` points to the Nursing Entrance Exam sub-page document.
- Validation run: `.\node_modules\.bin\tsc.cmd --noEmit`.

### 2026-08-01: Kaplan Admission Test Subject Pages

- Added Kaplan Admission Test nested subject pages from `C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\REGULAR\8 - Kaplan Admission Tests`.
- Used each JSON filename as the public nested page name and slug source: Math, Reading, Science, and Writing.
- Created the nested pages through the same Firestore shape as the Nursing Entrance Exam admin flow: Draft status, auto document IDs, saved `contentPath`, and route mappings for the public slugs.
- Regenerated `public/data/sidebar-data.json` and `src/lib/data/sidebar-data.ts` so the Kaplan sidebar modal lists the four subject pages without hardcoded sidebar entries.
- Saved source filename/folder and JSON question counts on each nested page for sidebar display and later quiz import follow-up.
- Validation run: `.\node_modules\.bin\tsc.cmd --noEmit`.

### 2026-08-01: Kaplan Admission Test Question Import

- Imported the Kaplan Admission Test JSON question files into one Nursing Entrance Exam quiz per Kaplan nested subject page.
- Kept quiz display names from the source filenames and used unique quiz route slugs with a `-quiz-1` suffix so they do not conflict with the public subject page slugs and can support future sets.
- Set each Kaplan quiz to `setNumber: 1` and `examYear: "2026"`.
- Stored imported questions under the quiz `questions` subcollections using the same normalized fields as the admin bulk-upload flow: question HTML, options array, correct answer, explanation, question type, original source ID, source file, and published status.
- Regenerated `public/data/sidebar-data.json` and `src/lib/data/sidebar-data.ts` after import.
- Validation run: `.\node_modules\.bin\tsc.cmd --noEmit`.

### 2026-08-01: Nursing Test Bank Two-Group Layout

- Scoped a wider two-card subject layout to Nursing Test Bank sub-pages with exactly two child groups, such as `/lpn-exams` and `/rn-exams`.
- The shared generated public page keeps the existing compact multi-card grid for Nursing Entrance Exam, Nursing Exit Exam, and Nursing Test Bank pages with more than two children.
- The two-group layout uses the same Firestore-derived child cards and route mappings; no LPN or exam group names are hardcoded in the component.
- Nursing Test Bank subject-card actions should say `View Topics` instead of `View Practice Sets`; Entrance and Exit exam pages keep the existing set-based labels.
- In the Nursing Test Bank two-group layout, emphasize the leading vendor label in each card title, with distinct HESI and ATI accent colors so the main difference between the two group cards is immediately scannable.
- Validation run: `.\node_modules\.bin\tsc.cmd --noEmit`.

### 2026-08-02: Nursing Test Bank Static Render Optimization

- Updated `src/app/[slug]/page.tsx` so Nursing Test Bank hub pages such as `/rn-exams` and `/ati-rn-exams` no longer aggregate live question counts while statically rendering child cards.
- Test Bank sub-page and nested-topic selector pages now rely on saved child metadata, such as route mappings, topic names, `topicCount`, `questionCount`, and planned exam counts, instead of walking topics, quizzes, and question subcollections during page generation.
- Updated `src/app/nursing-exit-exam/[subPageId]/page.tsx` and the generated `[slug]` sub-page branch to avoid live nested-page count aggregation on high-level Nursing Entrance and Nursing Exit selector pages.
- Topic detail pages still load their quiz cards and quiz-level question counts so set-level practice pages keep their existing count display.
- Assumption: high-level selector cards should stay lightweight at build time; detailed question totals should come from saved metadata/backfill jobs or lower-level quiz views.
- Validation run: `.\node_modules\.bin\tsc.cmd --noEmit` and `npm run build`.

## Generated Public Page Back Links

- Dynamic public generated pages should derive their back button from the previous breadcrumb item instead of hardcoding the parent pillar.
- Nested subject pages such as `/ati-teas-math-practice-test` should point back to their parent practice hub, such as `/ati-teas-practice-test`, with the label derived from the route slug.
- Keep category badges separate from back-link labels. A page can still belong to `Nursing Entrance Exams` while its back button points to the more specific parent hub.
