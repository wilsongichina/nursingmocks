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

## Generated Public Page Back Links

- Dynamic public generated pages should derive their back button from the previous breadcrumb item instead of hardcoding the parent pillar.
- Nested subject pages such as `/ati-teas-math-practice-test` should point back to their parent practice hub, such as `/ati-teas-practice-test`, with the label derived from the route slug.
- Keep category badges separate from back-link labels. A page can still belong to `Nursing Entrance Exams` while its back button points to the more specific parent hub.
