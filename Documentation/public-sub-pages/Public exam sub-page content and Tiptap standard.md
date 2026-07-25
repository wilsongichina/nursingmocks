# Public Exam Sub-Page Content and Tiptap Standard

## Purpose

This plan defines how NursingMocks should redesign high-value public generated sub-pages such as `/teas-practice-test` so they work for students, conversion, and search engines.

These sub-pages are money pages. They should not look like user dashboard pages, admin pages, pricing pages, or generic articles. They should be premium public exam hubs that are visually strong, easy to use, semantically structured, and supported by Tiptap content blocks that admins can reuse.

This applies first to the Nursing Entrance Exam sub-pages and should then be replicated across Nursing Test Bank and Nursing Exit Exam sub-pages.

Admin authoring for this public standard is documented separately in:

```text
Documentation/admin/Admin content management.md
```

The admin UI should make these public-page standards easy to manage through full-width content-management screens, advisory warnings, public previews, structured Tiptap blocks, and clear save states.

## Exam Access Product Source

Public sub-pages and their child content must use the admin-managed Exam Access Catalog as the source of truth for exam access products.

- Do not hardcode new exam products into the content editor.
- Nursing Entrance Exam content should load active `Nursing Entrance Exams` products from the read-only `/api/exam-access/catalog` endpoint.
- The four legacy product IDs remain fallback defaults only: `ati_teas_7`, `hesi_a2`, `nursing_test_bank`, and `nursing_exit_exams`.
- Newly added catalog products, such as a future entrance exam, must appear in content creation forms without code changes.
- Save logic should preserve explicit dynamic exam IDs selected by admins instead of forcing them back to TEAS or HESI.

## Core Strategy

Each sub-page should combine three goals:

- Help students quickly understand what practice path to choose.
- Convert qualified students into starting a free preview or paid exam access.
- Help search engines understand the page as the central hub for the ATI TEAS Practice Test topic.

The page should follow people-first content principles and semantic SEO principles inspired by Koray Tugberk-style topical authority:

- Rank the topic, not only isolated keywords.
- Build a network of meaning around the central entity.
- Connect parent, child, and sibling pages with clear internal links.
- Reduce retrieval cost by using clear hierarchy, semantic headings, structured data, and consistent entity labels.
- Create content as short as possible and as complete as necessary.

## Central Entity

Example central entity for the first implementation:

```text
ATI TEAS Practice Test
```

Source context:

```text
NursingMocks helps nursing students prepare for nursing entrance exams through subject-based practice questions, free previews, explanations, and paid fixed-term exam access.
```

Example central search intent:

```text
A nursing student wants to understand the ATI TEAS test, choose the correct subject practice path, try questions, and decide whether NursingMocks is useful enough to continue with paid access.
```

## Semantic Hierarchy

The public content tree should be easy for users and search engines to understand:

- Nursing Entrance Exams
- ATI TEAS 7
- ATI TEAS Practice Test
- ATI TEAS Reading Practice Test
- ATI TEAS Math Practice Test
- ATI TEAS Science Practice Test
- ATI TEAS English and Language Usage Practice Test
- Individual practice test sets

The page should link to child pages using exact page names, not generic labels such as `View`, `Open`, or `Click here`.

## Public Sub-Page Standard

The `/teas-practice-test` page should be the first implementation of the public money-page template for:

- ATI TEAS Practice Test
- HESI A2 Practice Test
- Nursing Test Bank landing pages
- Nursing Exit Exam landing pages

Each page can have content differences, but the structure should remain consistent.

## Where To Start

Start with the public output page before changing the admin editor.

First target:

```text
/teas-practice-test
```

Reason:

- It is a public money page.
- It is likely to receive broad search traffic.
- It is the page students see before choosing a subject or paying.
- It controls the visual standard for other sub-pages.
- It reveals what Tiptap content needs to support.

The first implementation should preserve existing Firestore data, route mapping, billing logic, quiz access rules, and admin content-saving behavior. The first goal is to improve the public sub-page template and make existing Tiptap content render better.

## Full Sub-Page Phase Outline

### Phase 1: Public Sub-Page Template

Start by redesigning the public generated sub-page output for `/teas-practice-test`.

Work includes:

- premium public hero with a strong left-side value proposition and a right-side practice-path panel
- one H1
- clean breadcrumb
- dynamic child subject cards
- better Tiptap article surface
- mobile-safe content layout
- improved table of contents
- removal of fake/static dashboard-style widgets
- subject-based CTA wording
- related exam links
- FAQ section styling

This phase should not change the admin form or Firestore schema.

Hero design standard:

- Use a polished exam hub layout instead of a plain article header.
- Let the main hero copy sit on the page background, not inside a heavy bordered container.
- Keep the main message, description, and primary CTA on the left.
- Keep dynamic subjects, counts, and first-step links on the right using subtle card surfaces.
- Use route-driven child pages and real question totals when available.
- Use NursingMocks typography tokens for buttons, badges, pills, spacing, and readable font sizes.
- Avoid static subject names, internal roadmap copy, or generic links such as `View` or `Click here`.

H1 highlight standard:

- Public generated sub-pages should use one semantic `<h1>`.
- The H1 may highlight the main exam or subject entity with the NursingMocks purple gradient.
- The highlighted phrase must be derived from dynamic page data such as heading, exam name, subject name, or exam badge.
- Do not hardcode ATI TEAS-only heading markup. The same heading treatment must work for ATI TEAS, HESI A2, Nursing Test Bank, Nursing Exit Exams, RN, and LPN pages.
- Strip saved editor HTML before rendering the hero H1 so Tiptap markup cannot break the heading structure.

### Phase 2: Tiptap Public Rendering

Improve how saved Tiptap content appears on public sub-pages.

Work includes:

- paragraph typography
- heading spacing
- list styling
- table responsiveness
- callout styling
- dotted separator styling
- quiz card styling
- extra H1 handling
- fixed-width table cleanup
- body-content overflow prevention

This phase controls the output, even if existing Tiptap content is messy.

Implementation note:

- Public generated sub-pages now use the shared `public-tiptap-content` wrapper for read-only Tiptap output.
- The styling is scoped to public content so admin editor behavior remains unchanged.
- Public article output has stronger paragraph rhythm, heading spacing, mobile-safe tables, polished callouts, cleaner separators, styled links, and safer image rendering.
- Saved editor H1 content is still converted before rendering so public pages keep one main hero H1.
- The public read-only renderer uses a lightweight loading placeholder instead of the full admin editor loading frame, which prevents article layout jumps while the client editor mounts.
- The public guide shell now uses a clearer left navigation area and a more polished article panel while preserving one active section at a time.
- The Tiptap module sidebar now includes public-page authoring guardrails: use H2 for article sections, keep paragraphs scannable, use exact page names for internal links, and avoid fixed-width tables unless necessary.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

### Phase 3: Sub-Page Content Cleanup

Clean the actual content currently saved for the first sub-page.

For `/teas-practice-test`, remove or rewrite:

- internal planning notes
- fake CTA placeholders
- full-exam simulation claims if the product is subject-based
- duplicate H1 sections
- duplicate CTAs
- malformed punctuation
- old brand references
- unsupported official-affiliation claims
- awkward search-only wording

This phase can be done through admin content editing or a controlled Firestore content update, depending on what is safest.

Implementation note:

- The `/teas-practice-test` guide body content is important editorial content and was restored to the previous saved version after the cleanup pass.
- Future edits to the guide body should be made through the admin UI unless a controlled migration is explicitly approved.
- `npm run generate:sidebar` was run after restoring Firestore body content so `public/data/sidebar-data.json` and `src/lib/data/sidebar-data.ts` match the saved content.
- Phase 3 now starts with admin authoring safeguards instead of rewriting the saved ATI TEAS guide body.
- Parent sub-page editors and nested sub-page editors for Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams now show non-blocking content quality warnings before the Tiptap editor.
- This includes `/admin/nursing-entrance-exam/teas-practice-test` and equivalent parent sub-page editor routes.
- Warnings cover body H1 headings, empty headings, long paragraphs, generic link labels, fixed-width tables, missing heading IDs, missing card descriptions, and very short article bodies.
- These warnings are advisory only. They do not block saving, change published content, or alter Firestore data by themselves.
- Parent and nested sub-page editors now include a `Public Content Preview` toggle below the warnings and above the Tiptap editor.
- The preview uses the same public read-only Tiptap renderer and `public-tiptap-content` styling used by generated public pages.
- The preview intentionally shows article body styling only. Hero, subject cards, FAQ, and route-level layout remain controlled by the public page template.
- Parent and nested sub-page editors now track save state against the loaded or last-saved snapshot.
- The header shows `All changes saved`, `Unsaved changes`, or `Saving...`.
- The save button changes between `Saved`, `Save Changes`, and `Saving...`, and is disabled when no changes are pending.
- Browser tab/window navigation warns when unsaved changes are present.
- Newly initialized pages that do not yet exist in Firestore remain saveable until the first successful save.
- The Tiptap module library now includes a `CTA Block` and `Internal Link Card`.
- `CTA Block` is for conversion sections with an eyebrow, title, description, button label, and button URL.
- `Internal Link Card` is for exact-match internal links with a title, short description, link label, and URL.
- The first version asks for fields when inserted from the module sidebar. Drag-and-drop inserts the default version.
- These blocks render through the same Tiptap content pipeline and are styled for both public read-only content and admin preview.
- CTA and Internal Link Card blocks are editable in-place after insertion inside the admin Tiptap editor.
- Editing a block updates the saved Tiptap attributes directly, so admins do not need to delete and recreate a block just to change copy or URLs.
- Public preview and live read-only rendering still show the polished public block design, not the admin form controls.
- The Tiptap module library now includes an editable `FAQ Content Block` for inline article Q&A sections.
- `FAQ Content Block` is separate from the page-level FAQ editor and does not generate JSON-LD yet.
- Use inline FAQ blocks to break up long article sections and answer one focused student question inside the guide body.
- The Tiptap module library now includes an editable `Comparison Table` block.
- `Comparison Table` is for simple two-column comparisons with a title, column headings, and up to four paired rows.
- Use the comparison block instead of manual fixed-width Tiptap tables when the content is a simple comparison.
- The comparison block stacks rows on mobile so admins do not need to manage pixel widths manually.
- Content quality warnings now understand structured Tiptap blocks.
- Manual fixed-width table warnings now recommend replacing simple two-column tables with the Comparison Table block.
- CTA blocks warn when the button URL is empty or `#`, and they notice generic button labels.
- Internal Link Cards warn when the URL is empty or `#`, when the link label is generic, or when the label differs from the exact page name.
- FAQ Content Blocks warn for empty questions, very short answers, and duplicate questions.
- Comparison Table blocks warn for missing rows, missing title or column headings, and overly long row text.
- Structured Tiptap blocks now include admin-only `Duplicate` and `Delete` controls in the editor wrapper.
- Duplicate inserts a copy of the current block directly after the original block.
- Delete uses the admin confirmation dialog before removing the block to reduce accidental content loss.
- Structured Tiptap blocks also include `Move Up` and `Move Down` controls for reordering whole blocks inside long article content.
- These controls apply to CTA Block, Internal Link Card, FAQ Content Block, and Comparison Table Block.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

### Phase 4: Dynamic Child Navigation

Make child page navigation dynamic.

Work includes:

- subject cards from existing Firestore/route mapping data
- exact internal link labels
- public route-aware filtering
- reliable set counts where available
- reliable question counts where available
- graceful fallback when counts are missing

This is where the page becomes a true semantic hub instead of a static article.

Implementation note:

- The public sub-page template now treats a child page with an existing public route mapping as displayable, even when legacy nested-page records still carry a `Draft` status.
- Archived child pages remain hidden.
- This keeps pages such as `/teas-practice-test` aligned with the actual public route tree and prevents the hero from showing an empty practice-path state when child pages already exist.
- Question totals are still based on existing quizzes/questions. Child pages without quiz content can appear as practice paths while showing a missing/empty question count until content is added.
- The output template keeps the dynamic centered hero and subject cards as the primary top-of-page conversion path. A soft blurred divider separates the hero from the body so the page has a clear transition without adding another heavy card.
- Subject cards should use `cardDescription` first, then `shortDescription`, then a cleaned first sentence from the main description. This prevents long SEO/page-intro copy from stretching card layouts.
- Existing subject pages can be backfilled with `npm run content:card-descriptions:dry-run` and then `npm run content:card-descriptions:apply`. The script only fills missing, generated, or unusable card descriptions and preserves manually written short card copy.
- The tabbed guide is built from saved Tiptap headings. The guide section header can stay centered, but article body content remains left-aligned for readability.
- Guide navigation uses a left-side tab panel so students can move between content sections without turning the page into one long scroll.
- The FAQ block uses the homepage-style accordion treatment without an outer border or colored section background so it reads as part of the page flow rather than another heavy card.

### Phase 5: Sub-Page Schema

Generate schema from visible public content.

Work includes:

- WebPage schema
- BreadcrumbList schema
- ItemList schema for visible child cards
- FAQPage schema only for visible FAQs
- canonical production URLs
- no unsupported schema properties
- no hidden answers
- no locked content
- no localhost values

This phase should use shared schema helpers instead of manual JSON-LD fields where possible.

### Phase 6: Admin Sub-Page Editor Redesign

After the public output standard is stable, improve the admin sub-page editor.

Work includes:

- full-width admin layout
- better page details section
- better SEO section
- better content editor section
- better FAQ section
- schema preview
- public preview link
- status and route summary
- save confirmation
- notices for slug, status, and exam access product changes

This phase should be replicated for Nursing Entrance, Nursing Test Bank, and Nursing Exit sub-page editors.

### Phase 7: Tiptap Authoring Blocks

Add structured Tiptap blocks that help admins create rich semantic content.

Work includes:

- Semantic Section block
- Entity Definition block
- Subject Grid block
- Practice Set Grid block
- Internal Link block
- CTA block
- Comparison block
- Exam Structure Table block
- Callout block
- FAQ block

These blocks should store references where possible instead of duplicating dynamic data manually.

### Phase 8: Admin Validation Guardrails

Add validation before save.

Work includes:

- warn about extra H1s
- warn about duplicate heading IDs
- warn about fixed-width tables
- warn about broken links
- warn about empty quiz cards
- warn about no child subject links
- warn about internal notes or placeholder content
- warn about unavailable feature claims

Risky fields should explain consequences before save.

### Phase 9: Replication Across Sub-Pages

Apply the pattern to:

- HESI A2 Practice Test
- Nursing Test Bank parent pages
- Nursing Exit Exam parent pages

Each page should keep its own entity, attributes, child pages, and search intent. Do not hardcode ATI TEAS assumptions into shared components.

### Phase 10: Measurement

Measure whether the work improves:

- mobile usability
- PageSpeed
- Core Web Vitals
- search impressions
- search clicks
- subject-page clicks
- free preview starts
- checkout starts
- paid conversions

## Complete Sub-Page Work List

This section lists everything that should be handled specifically for top-level generated sub-pages such as:

- `/teas-practice-test`
- `/hesi-a2-practice-test`
- Nursing Test Bank parent pages
- Nursing Exit Exam parent pages

These pages are different from nested subject pages and quiz-set pages. They are public money hubs and should be treated as the primary acquisition pages.

Start here because these pages receive broad search traffic, pass internal relevance to child pages, and shape the first impression for many students.

### Sub-Page Data Requirements

Each sub-page should have:

- page name
- page heading
- slug
- status
- exam access product
- short description
- meta title
- meta description
- OG title
- OG description
- OG image
- canonical URL
- Tiptap body content
- FAQs
- child page references
- schema generated from visible content

### Sub-Page Visual Requirements

Each sub-page should include:

- premium marketing-quality hero
- one visible H1
- exam/category badge
- concise value statement
- primary CTA
- secondary CTA
- dynamic subject/category cards
- article/content section
- sticky or compact table of contents where useful
- FAQ section
- related exam paths
- final CTA

### Sub-Page Dynamic Elements

The following should be generated from Firestore or route mapping data where possible:

- child subject pages
- nested category pages
- visible set counts
- question counts when reliable
- exact internal links
- published/draft visibility
- breadcrumb hierarchy
- related pages

### Sub-Page SEO Requirements

Each sub-page should enforce:

- one H1 only
- clean H2/H3 hierarchy
- canonical production URL
- visible breadcrumbs
- BreadcrumbList schema
- WebPage schema
- ItemList schema for visible child cards
- FAQPage schema only when FAQs are visible
- no localhost URLs
- no unsupported schema properties
- no locked or hidden quiz answers in schema

### Sub-Page Tiptap Requirements

Tiptap content inside sub-pages should support:

- semantic sections
- clean paragraphs
- mobile-safe tables
- callouts
- internal links
- CTA blocks
- subject grids
- practice set grids
- FAQ blocks

Tiptap content inside sub-pages should prevent or warn about:

- extra H1 headings
- duplicate heading IDs
- fixed-width tables
- broken links
- unsafe external links
- empty quiz cards
- internal planning notes
- duplicated CTA sections
- content that implies unavailable features

### Sub-Page Content Cleanup Requirements

Before a sub-page is treated as final, remove:

- internal roadmap notes
- placeholder wording
- fake statistics
- duplicate page names
- repeated CTAs with no purpose
- full-exam simulation copy where the exam is subject-based
- old brand references
- malformed punctuation or encoding artifacts
- unsupported claims about official affiliation or guaranteed outcomes

### Sub-Page Admin Requirements

Admin editing for sub-pages should eventually show:

- public preview link
- current URL
- current status
- parent pillar
- exam access product
- child page count
- SEO preview
- social preview
- schema preview
- content validation warnings
- save confirmation
- notices for risky fields such as slug, status, and exam access product

### Sub-Page Replication Rule

Once the ATI TEAS sub-page works correctly, the same sub-page standard should be applied to:

- HESI A2
- Nursing Test Bank parent pages
- Nursing Exit Exam parent pages

Do not hardcode ATI TEAS-specific assumptions into the shared sub-page template.

### Sub-Page Routes In Scope

Initial route:

- `/teas-practice-test`

Next Nursing Entrance Exam route:

- `/hesi-a2-practice-test`

Later replicated route families:

- Nursing Test Bank parent sub-pages
- Nursing Exit Exam parent sub-pages

Related but separate route types:

- nested subject pages
- quiz-set pages
- quiz-question pages
- knowledge base articles

These related route types can inherit visual and Tiptap rendering improvements, but the money-page sub-page plan starts with parent sub-pages.

### Sub-Page Source Files In Scope

Likely implementation areas:

- `src/app/[slug]/page.tsx`
- `src/components/editor/TiptapContentRenderer.tsx`
- `src/components/editor/TiptapEditor.tsx`
- `src/components/editor/extensions/*`
- `src/components/editor/QuizCardRenderer.tsx`
- `src/lib/firestore-operations.ts`
- `src/lib/seo/*`
- `src/lib/config.ts`

Admin editor areas for later phases:

- `src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx`
- nursing entrance nested editor routes
- nursing test bank editor routes
- nursing exit exam editor routes

## Recommended Public Page Structure

### Hero

The hero should be visually premium and student-focused.

Required elements:

- One H1 only.
- Exam badge, such as `ATI TEAS 7`.
- Short value statement.
- Primary CTA: `Start ATI TEAS Practice`.
- Secondary CTA: `View TEAS Subjects`.
- Trust chips for visible subjects or access features.

Avoid:

- Fake statistics.
- Dashboard-style widgets.
- Internal roadmap language.
- Pricing-table layout above the fold.
- Claims that full exam simulation exists when the product is subject-based.

### Subject Practice Paths

This section should appear near the top because it is the main student action path.

Cards should be generated from Firestore where possible.

Each card should show:

- Exact subject page name.
- Short subject description.
- Number of sets when available.
- Question count when available.
- Free preview badge when applicable.
- CTA with exact page name.

Example links:

- `Start ATI TEAS Reading Practice Test`
- `Start ATI TEAS Math Practice Test`
- `Start ATI TEAS Science Practice Test`
- `Start ATI TEAS English and Language Usage Practice Test`

### Exam Overview

This section should explain what the ATI TEAS is, who takes it, and how students should use practice questions.

The copy should be concise and student-facing.

### Subject Breakdown

This section should explain the four TEAS subject areas:

- Reading
- Mathematics
- Science
- English and Language Usage

Each subject should connect to its subject page.

### How Practice Works

Explain the NursingMocks practice flow:

- Choose a subject.
- Start a free preview or unlocked set.
- Answer questions.
- Review explanations where available.
- Continue progress from the dashboard after login.

This should not sound like internal product notes.

### Study Strategy

Include practical guidance for students:

- How to review missed questions.
- How to rotate subjects.
- How to use explanations.
- How to recognize weak areas.

### Related Exam Paths

Add compact internal links to related pages:

- HESI A2 Practice Test
- Nursing Entrance Exam Practice
- Nursing Test Bank
- Nursing Exit Exams

These should support topical PageRank flow without distracting from the ATI TEAS path.

### FAQ

FAQs should answer real student questions and should be visible on the page if FAQ schema is emitted.

FAQ answers should be concise, factual, and not stuffed with repeated keywords.

### Final CTA

End with a clear CTA:

```text
Start ATI TEAS Practice
```

## Visual Design Requirements

The page should be visually top notch because it is a public acquisition page.

Use:

- Premium public marketing quality.
- NursingMocks purple accent system.
- Soft modern background.
- Strong hero composition.
- Clear subject cards.
- White content surfaces.
- Generous spacing.
- Mobile-first layout.
- Fast-loading assets.

Avoid:

- Dull admin-style cards.
- User-dashboard widgets.
- Fake activity or fake stats.
- Pricing-page plan comparison above the fold.
- Excessive gradients or decorative clutter.
- Tables that overflow on mobile.

## SEO Requirements

Use:

- One H1 only.
- Logical H2 and H3 hierarchy.
- Breadcrumbs visible on page.
- Breadcrumb JSON-LD.
- WebPage schema.
- ItemList schema for visible subject cards.
- FAQPage schema only for visible FAQs.
- Canonical URLs from the canonical site helper.
- Exact internal anchor text.

Do not use:

- Quiz question schema on the money page unless questions are visibly rendered and public.
- Education Q&A flashcard markup for multiple-choice practice pages.
- Stored localhost schema.
- Unsupported JSON-LD properties.
- Hidden answers or locked content in schema.

## Tiptap Content System Requirements

Tiptap must support rich content creation without letting admins break SEO, layout, or page semantics.

The editor should evolve from a free-form body editor into a structured content authoring system.

Required Tiptap improvements:

- Prevent more than one H1.
- Auto-convert body H1s to H2 when rendered or warn admins before save.
- Auto-generate unique heading IDs.
- Remove or normalize fixed-width table styles.
- Warn about broken or unsafe links.
- Warn about duplicate section headings.
- Warn about empty quiz cards.
- Keep dynamic quiz and subject data as references, not duplicated manual content.

## Recommended Tiptap Blocks

### Semantic Section Block

Creates a controlled H2 section with a clean heading ID.

### Entity Definition Block

Used for sections such as:

```text
What is the ATI TEAS?
```

### Subject Grid Block

Pulls subject cards dynamically from Firestore.

This avoids hardcoding subject links in body content.

### Practice Set Grid Block

Pulls available sets dynamically from Firestore.

### Internal Link Block

Lets admins select a real route from the system instead of typing a URL manually.

### CTA Block

Creates consistent CTA sections.

### Comparison Block

Useful for pages such as:

```text
ATI TEAS vs HESI A2
```

### Exam Structure Table Block

Creates mobile-safe tables for subject, format, timing, and skill coverage.

### Callout Block

Used for tips, notices, and student guidance.

### FAQ Block

Keeps visible FAQ content aligned with FAQ schema.

## Phase 1: Public Template Foundation

Goal:

Redesign `/teas-practice-test` as the first premium semantic money page without changing the admin data model.

Scope:

- Remove static fake dashboard/KB snapshot content.
- Redesign the hero for ATI TEAS.
- Make the page use one H1.
- Add a polished subject-practice section.
- Pull subject/nested page links from existing Firestore route data where possible.
- Improve article card typography.
- Improve the table of contents.
- Make tables mobile-safe through rendering styles.
- Keep existing page content source as Tiptap `bodyContent`.
- Preserve existing routes and data loading.

Do not:

- Change quiz access rules.
- Change billing logic.
- Change Firestore schema.
- Rewrite all body copy yet.
- Build new Tiptap blocks yet.

Validation:

- Confirm `/teas-practice-test` renders.
- Confirm mobile layout does not overflow.
- Confirm only one visible H1.
- Confirm subject links use exact page names.
- Run TypeScript.

## Phase 2: Content Cleanup and Semantic Rendering

Goal:

Clean the visible output of Tiptap content so public pages look professional and semantically consistent.

Scope:

- Improve Tiptap renderer typography.
- Style paragraphs, lists, tables, headings, callouts, separators, and quiz cards.
- Automatically downgrade extra body H1s or flag them.
- Strip or normalize fixed table widths.
- Clean public-facing wording that sounds like internal notes.
- Add clear authoring rules for admins.

Validation:

- Check `/teas-practice-test`.
- Check one HESI page.
- Check one nursing test bank page.
- Check one nursing exit page.
- Run TypeScript.

## Phase 3: Dynamic Subject and Set Hubs

Goal:

Make subject and set cards dynamic so admins do not manually maintain money-page navigation.

Scope:

- Build reusable subject-card component.
- Build reusable set-card component.
- Pull child pages from Firestore or generated route mapping data.
- Show only published pages.
- Use exact names for internal links.
- Show counts only when reliable.

Validation:

- Add a new subject/set in admin and confirm it appears without code changes where expected.
- Confirm hidden/draft pages do not appear publicly.
- Run TypeScript.

## Phase 4: Tiptap Semantic Blocks

Goal:

Give admins structured blocks for rich, semantic content.

Scope:

- Add Semantic Section block.
- Add Subject Grid block.
- Add Practice Set Grid block.
- Add Internal Link block.
- Add CTA block.
- Add Exam Structure Table block.
- Add FAQ block if needed.

Validation:

- Confirm blocks save to Firestore.
- Confirm blocks render on public pages.
- Confirm mobile layout is safe.
- Confirm no duplicate H1s.
- Run TypeScript.

## Phase 5: Admin Authoring Guardrails

Goal:

Make the admin editor prevent errors before they reach public pages.

Scope:

- Add content validation panel.
- Warn about duplicate H1s.
- Warn about invalid links.
- Warn about fixed-width tables.
- Warn about empty quiz cards.
- Warn when no child subject links exist.
- Show SEO preview.
- Show schema preview.

Validation:

- Confirm warnings appear without blocking normal safe edits.
- Confirm risky changes explain consequences.
- Run TypeScript.

## Phase 6: Structured Data and Internal Link Graph

Goal:

Strengthen semantic understanding for Google and other crawlers.

Scope:

- Generate WebPage schema.
- Generate BreadcrumbList schema.
- Generate ItemList schema for visible subject cards.
- Generate FAQPage schema only for visible FAQs.
- Ensure all URLs use canonical production origin.
- Ensure no locked answers or hidden content appear in schema.

Validation:

- Inspect JSON-LD output.
- Confirm no localhost URLs.
- Validate representative pages in Schema.org Validator.
- Validate representative pages in Google Rich Results Test after deployment.

## Phase 7: Replicate Across Other Money Pages

Goal:

Apply the same pattern across NursingMocks public acquisition pages.

Pages:

- HESI A2 Practice Test
- Nursing Test Bank
- RN Exams
- LPN Exams
- Nursing Exit Exams
- RN Exit Exams
- LPN Exit Exams

Rules:

- Keep the same money-page structure.
- Adjust entity, intent, subjects, and internal links per exam.
- Do not force TEAS-specific wording onto other exams.
- Keep content generated from the correct Firestore tree.

## Phase 8: Measurement and Iteration

Goal:

Track whether the redesign improves usability and search performance.

Measure:

- PageSpeed mobile and desktop.
- Core Web Vitals.
- Search Console impressions and clicks.
- Indexed child pages.
- CTA clicks.
- Free preview starts.
- Checkout starts.
- Paid conversions.

Use findings to improve content sections, internal links, and CTA placement.

## Starting Point

Start with Phase 1 on `/teas-practice-test`.

The first implementation should focus on the public output template and preserve the current data model. Tiptap authoring improvements should begin after the public page structure is stable.

## Phase 1 Implementation Log

Date: 2026-07-18

Initial public sub-page template work started on the shared dynamic route renderer.

Files changed:

- `src/app/[slug]/page.tsx`
- `Documentation/public-sub-pages/Public exam sub-page content and Tiptap standard.md`

Completed:

- Added public sub-page presentation helpers for exam badge labels, CTA labels, parent pillar labels, and child practice cards.
- Reused existing nested child page data instead of adding a new Firestore schema.
- Updated the public generated sub-page wrapper to use a standard max width and soft public-page background.
- Aligned the public generated sub-page wrapper to the same `user-page` plus `user-page-container` structure used by quiz and user dashboard pages, including the shared `1360px` maximum width and gutters.
- Replaced the custom sub-page marketing hero with the shared `user-page-header` shell used by quiz pages so `/teas-practice-test` aligns visually with `/teas-math-practice-test-set-1`.
- Rebuilt the top-level public sub-page output as a dedicated fresh render branch for `pageType === "sub"`, preserving data loading while bypassing the old generic sub-page design.
- Started Step 1 hero polish by adding a stronger exam badge, richer header meta, total question summary when available, and a compact practice-path action panel using the shared user-card style.
- Reworked the hero styling for a more premium public money-page presentation.
- Removed visible fake dashboard-style hero metrics by replacing the right-side card with dynamic practice paths.
- Added a dynamic subject/practice path section below the hero for published child pages.
- Updated primary and secondary CTA behavior to point to the first available child practice path and the dynamic practice path section.
- Converted Tiptap body H1 headings to H2 in the public renderer so the page keeps one visible H1.
- Improved article content styling for rendered Tiptap body content.
- Added horizontal overflow handling for wide Tiptap tables.
- Made the desktop table of contents sticky.

Preserved:

- Existing Firestore data model.
- Existing route mapping behavior.
- Existing billing and checkout logic.
- Existing quiz access rules.
- Existing admin save behavior.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`
- `npm run lint`
- `npm run build`
- Generated TEAS and HESI sub-page HTML checked for removed fake metric phrases and outdated `Full Exam` wording.

Next:

- Review `/teas-practice-test` visually on desktop and mobile.
- Preserve the restored ATI TEAS Practice Test Guide body unless a future edit explicitly targets that article content.
- Continue Phase 2 with deeper Tiptap rendering cleanup and admin-facing authoring guardrails.

## Safe Field Cleanup Log

Date: 2026-07-18

Scope:

- Public Nursing Entrance Exam pillar labels, meta fields, and trust indicators.
- TEAS practice test maintenance script safety.

Completed:

- Replaced outdated Nursing Entrance Exam hero wording that referred to `Teas Gurus`, `exam services`, and `full exam taking`.
- Replaced trust indicators that overpromised outcomes, including `Guaranteed Exam Results`.
- Updated Nursing Entrance Exam meta title, description, Open Graph title, Open Graph description, keywords, and canonical URL from the Firestore source.
- Regenerated `public/data/sidebar-data.json` and `src/lib/data/sidebar-data.ts` from Firestore.
- Updated the TEAS practice test cleanup script so it preserves existing `bodyContent` and only updates safe labels, meta, descriptions, and FAQs if it is run again.

Important rule:

- Do not overwrite public Tiptap article bodies with scripts after launch. Article body changes should be made through the admin editor unless a controlled migration is explicitly approved.
- Safe public fields such as page name, SEO label, heading, meta fields, FAQ copy, card descriptions, and pillar hero labels may be maintained separately when needed, but the update must preserve quiz access rules and dynamic child-page relationships.

Validation:

- `npm run content:nursing-entrance-safe-fields:dry-run`
- `npm run content:nursing-entrance-safe-fields:apply`
- `npm run generate:sidebar`
- Verified the generated Nursing Entrance Exam pillar no longer contains the stale hero/trust phrases.
- Verified the ATI TEAS Practice Test Guide body length remained unchanged at `15860` characters after regeneration.

## Final Section Testing Checklist

Use this checklist before committing or extending the public sub-page and Tiptap authoring phase.

## ATI TEAS And HESI Tiptap Parity Log

Date: 2026-07-20

Scope:

- `/teas-7-practice-test`
- `/hesi-a2-practice-test`
- Firestore-generated Nursing Entrance Exam sub-page data.
- Generated sidebar data consumed by public pages.

Completed:

- Standardized the ATI TEAS 7 Practice Test saved `bodyContent` to `<p></p>` so it matches the current HESI A2 Practice Test Tiptap body shape.
- Removed the TEAS-only long guide body and placeholder FAQ block from the saved sub-page body content as an intentional controlled migration.
- Updated `scripts/update-teas-practice-test-content.js` so future controlled runs write the standardized body content instead of preserving the prior TEAS article body.
- Applied the Firestore update and regenerated `public/data/sidebar-data.json` and `src/lib/data/sidebar-data.ts`.
- Preserved TEAS page metadata, route mapping, child subject cards, FAQs, and exam-access relationships.

Validation:

- `node --check scripts\update-teas-practice-test-content.js`
- `node scripts\update-teas-practice-test-content.js --apply`
- `npm run generate:sidebar`
- `.\node_modules\.bin\tsc.cmd --noEmit`

## Tiptap Admin Confirmation Dialog Log

Date: 2026-07-20

Scope:

- Tiptap structured content block deletion.
- Tiptap image deletion.
- Tiptap table deletion from the editor toolbar.

Completed:

- Replaced the browser confirmation prompt for structured block deletion with an admin-styled confirmation dialog.
- Added the same admin confirmation flow before deleting editor images and editor tables.
- Reused the shared admin modal/destructive dialog styling so Tiptap destructive actions match the rest of admin.
- Left non-destructive editor actions such as duplicate, move up, move down, alignment, and alt text edits unchanged.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Tiptap Module Text Copy Log

Date: 2026-07-20

Scope:

- Structured Tiptap block editor fields.
- Tiptap image alt-text editor field.

Completed:

- Preserved copy, cut, paste, mouse selection, and text-selection events inside structured block input and textarea fields.
- Added node-view event guards so ProseMirror does not intercept clipboard actions intended for block fields.
- Applied the same clipboard/selection guard to the image alt-text editor.
- Kept the existing Tiptap module library layout and visual styling unchanged.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Tiptap H2 Navigation Scope Log

Date: 2026-07-20

Scope:

- Generated public page article navigation.
- Knowledge base article navigation.
- Admin Tiptap section heading helper.

Completed:

- Restricted Tiptap-derived left menus and table-of-contents lists to saved `h2` headings only.
- Kept structured module headings, such as CTA, internal link, FAQ, and comparison table `h3` titles, inline inside their surrounding H2 section content.
- Preserved the existing public-page H1 protection by converting body `h1` output to `h2` while excluding converted headings from the Tiptap left menu.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Quiz Card Question Source Log

Date: 2026-07-20

Scope:

- Tiptap Quiz Card module.
- Quiz Card editor selection flow.
- Quiz Card public/read-only rendering.

Completed:

- Removed the Quiz Card dependency on `isCopyRight === true`.
- Quiz cards now load and display supported question types `1`, `2`, `3`, and `7` regardless of copyright flag.
- Updated admin helper and error copy to describe supported question types instead of copyright-protected questions.
- Preserved saved quiz-card attributes, selected question IDs, and existing render flow.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Quiz Card Selection And Title Log

Date: 2026-07-20

Scope:

- Tiptap Quiz Card module editor.
- Embedded quiz-card saved attributes.

Completed:

- Added a `Quiz Card Title` field so admins can name the embedded quiz card before saving it.
- Kept the manual question selection step and changed the default selection to the first five supported questions instead of every supported question.
- Preserved the `selectedQuestionIds` save path so each quiz card can render only the selected questions.
- Used existing admin typography and field classes for the title input and helper copy.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Tiptap Heading Placeholder ID Log

Date: 2026-07-20

Scope:

- Tiptap Section Heading module insertion.

Completed:

- Removed the placeholder `id: "dummy"` from inserted Section Heading blocks.
- New H2 headings now save without a fake ID; public rendering can generate stable IDs from real heading text when needed.
- Preserved the visible inserted heading text and existing module-library behavior.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Static Quiz Card Rendering Log

Date: 2026-07-20

Scope:

- Generated public sub-page Tiptap guide output.
- Embedded Tiptap Quiz Card modules.

Completed:

- Public generated sub-pages now parse saved Quiz Card placeholders during server rendering.
- Selected quiz-card questions are loaded on the server from the saved quiz-card attributes.
- Guide sections render Quiz Card components from preloaded questions, so embedded quizzes appear with the statically rendered page instead of waiting for the read-only Tiptap node view to fetch after hydration.
- Preserved saved Tiptap HTML, selected question IDs, supported question-type filtering, and existing Quiz Card interactivity after hydration.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

## Public Route Preview Log

Date: 2026-07-20

Scope:

- Admin `Preview Public Content` panel for generated parent and nested sub-page editors.

Completed:

- Changed the preview panel to load the saved public route in an iframe when a public slug is available.
- The preview now shows the same public page shell students see, including hero, subject cards, guide navigation, Tiptap modules, embedded quiz cards, FAQs, and route-level layout.
- Kept the body-only Tiptap preview as a fallback for records without a public route slug.
- Wired parent and nested generated page editors to pass `slug` before `seoSlug` into the preview because `slug` is the route-mapping value used by public pages.

Validation:

- `.\node_modules\.bin\tsc.cmd --noEmit`

Primary test routes:

- `/admin/nursing-entrance-exam/teas-practice-test`
- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]`
- `/admin/nursing-test-bank/[subPageId]`
- `/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]`
- `/admin/nursing-exit-exam/[subPageId]`
- `/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]`
- `/teas-practice-test`

### Admin Editor Load

- Confirm parent sub-page editor loads existing content.
- Confirm nested sub-page editor loads existing content.
- Confirm no hydration or console errors appear when the editor loads.
- Confirm admin sidebar and full-width admin layout still behave normally.
- Confirm existing fields still populate: page name, slug, status, descriptions, SEO, schema, body content, and FAQs.

### Save State

- Confirm a loaded page starts with `All changes saved`.
- Edit a simple text field and confirm status changes to `Unsaved changes`.
- Confirm the save button changes from `Saved` to `Save Changes`.
- Save and confirm status returns to `All changes saved`.
- Refresh with unsaved changes and confirm the browser warning appears.
- Confirm a newly initialized page remains saveable before first save.
- Confirm slug-change redirect behavior still works on parent sub-page editors.

### Content Warnings

- Add an H1 inside body content and confirm the H1 warning appears.
- Add a generic link such as `click here` and confirm the generic-link warning appears.
- Add or retain a fixed-width manual table and confirm the warning recommends the Comparison Table block.
- Clear card description on nested pages and confirm the missing-card-description warning appears.
- Confirm warnings are advisory only and do not block saving.

### Public Preview

- Open `Preview Public Content`.
- Confirm the preview shows public article styling, not admin form controls.
- Confirm preview explains that hero, subject cards, FAQ, and route-level layout are handled by the public template.
- Confirm preview updates after editing Tiptap content.
- Confirm preview does not save content by itself.

### Structured Blocks

- Insert a CTA Block.
- Edit CTA eyebrow, title, description, button label, and URL.
- Insert an Internal Link Card.
- Edit exact page name, description, link label, and URL.
- Insert an FAQ Content Block.
- Edit question and answer.
- Insert a Comparison Table.
- Edit title, column headings, and row values.
- Confirm all blocks remain editable after saving and reloading.

### Block Controls

- Confirm `Duplicate` copies each structured block directly below the original.
- Confirm `Delete` asks for confirmation before removing a block.
- Confirm `Move Up` swaps the block with the previous top-level content block.
- Confirm `Move Down` swaps the block with the next top-level content block.
- Confirm block values are preserved after moving or duplicating.
- Confirm public preview never shows admin-only block controls.

### Block-Aware Warnings

- CTA Block with URL `#` should warn.
- CTA Block with a generic button label should show a notice.
- Internal Link Card with URL `#` should warn.
- Internal Link Card with generic link text should warn.
- Internal Link Card with link label different from exact page name should show a notice.
- FAQ Content Block with an empty question should warn.
- FAQ Content Block with a very short answer should show a notice.
- Duplicate FAQ Content Block questions should show a notice.
- Comparison Table with no rows should warn.
- Comparison Table missing title or column headings should warn.
- Comparison Table row text that is too long should show a notice.

### Public Page Rendering

- Confirm `/teas-practice-test` still renders the hero, subject cards, article guide, and FAQ section.
- Confirm the page keeps one visible H1.
- Confirm the restored ATI TEAS Practice Test Guide body content remains present.
- Confirm structured blocks render as polished public content.
- Confirm internal link card URLs are clickable.
- Confirm CTA URLs are clickable.
- Confirm manual Tiptap tables do not overflow the viewport.
- Confirm Comparison Table block stacks cleanly on mobile.

### Dynamic Data

- Confirm subject cards are still generated from Firestore child pages.
- Confirm page descriptions use `cardDescription` when present and avoid placeholder text such as `Content for ... under ...`.
- Confirm no child page route is hardcoded only for ATI TEAS.
- Confirm Nursing Test Bank and Nursing Exit Exam editors can use the same Tiptap block system.

### SEO and Semantics

- Confirm internal link labels use exact destination page names.
- Confirm article body H1 headings are converted or avoided so the route owns the only H1.
- Confirm page-level FAQ editor remains the controlled source for FAQ schema.
- Confirm inline FAQ Content Blocks do not generate JSON-LD yet.
- Confirm canonical URLs and schema output do not use localhost in production.

### Responsive Checks

- Test admin editor on desktop and tablet widths.
- Test public page on desktop, tablet, and mobile.
- Confirm structured block editor controls wrap cleanly on mobile.
- Confirm public CTA, Internal Link Card, FAQ Content Block, and Comparison Table are readable on mobile.
- Confirm no horizontal overflow appears from article content or block controls.

### Regression Checks

- Confirm existing quiz pages still load.
- Confirm quiz access and preview limits are unchanged.
- Confirm billing and entitlement logic is unchanged.
- Confirm `npm run generate:sidebar` still works after content edits when needed.
- Confirm `.\node_modules\.bin\tsc.cmd --noEmit` passes.
- Run lint/build before final commit if practical.
