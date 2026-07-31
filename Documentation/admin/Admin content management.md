# Admin Content Management

## TEAS Scan Bulk Import

Completed change:

- TEAS scan bulk import now normalizes alternate answer fields from scan records, including `correctAnswerLabels`, `correct_answer`, `review.selectedAnswer`, and `correctAnswerText`, before validating `correctAnswer`.
- Blocking scan issues still stop import; the confirmation checkbox only applies to non-blocking warnings and errors that can be saved for later review.
- Blocking issue rows link directly to the saved TEAS scan editor so admins can repair the exact record before retrying import.
- The saved TEAS scans list and individual scan view/edit screens now show stored parser review warnings so admins can see why a record is marked Needs Review.
- Added maintenance scripts for repairing split structured OCR pages and saving repaired structured OCR output back through the local scanned-questions API.
- Reran and repaired Set 9 OCR pages 12, 22, 100, and 101. Page 100 and 101 were the two halves of the same Science question, so the repaired Set 9 staging output saves 169 scan records.
- Set 9 page 22 remains intentionally marked Needs Review because the source screenshot shows the passage and choices but not the actual question prompt.
- Ordered-response scans no longer treat missing visible selected-answer markers as review issues when all ordered options are present; Set 10 `43_no-ati-logo.jpg` now saves as Type 6 with `correctAnswer: ["A","B","C","D","E"]` and no review warnings.
- Fill-in-the-blank scans no longer treat empty `selectedAnswer` parser wording as a review warning; the least-common-denominator scan `40_no-ati-logo.jpg` should only be blocked when its actual `correctAnswer` is missing.
- Multiple-select TEAS scans now allow more than four options and multiple selected labels without being marked for review; Set 12 `125_no-ati-logo.jpg` is a valid Type 2 record with five options and `correctAnswer: "A, B"`.
- Ordered-response scans also ignore the `No answer is visually selected in the screenshot` wording when the ordered answer includes every option; Set 12 `150_no-ati-logo.jpg` is a valid Type 6 record with five ordered options.
- Set 13 scan review cleanup cleared stale warning-only records: complete Type 6 ordered-response scans ignore `Selected answer is not visibly indicated`, and complete Type 2 multiple-select scans with five or six options remain import-ready.
- `/admin/nursing-entrance-exam` now selects the ATI TEAS 7 exam filter by default after sub-pages load, while still allowing admins to switch to All Exams or another entrance exam.
- `/admin/nursing-entrance-exam` tab order now places Quiz Metadata immediately after Nested Sub Pages.
- ATI TEAS Reading quiz questions for sets 1, 2, 3, and 6-16 now include `displayOrder` and passage grouping metadata so questions tied to the same passage display consecutively.
- Public Nursing Entrance Exam quiz question reads now sort by `displayOrder` first, then fall back to scan/import numbering when no display order exists.

Files changed:

- `src/app/admin/nursing-entrance-exam/page.tsx`
- `src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload/page.tsx`
- `src/app/admin/teas-image-import/scans/page.tsx`
- `src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx`
- `src/app/api/admin/teas-image-import/scanned-questions/route.ts`
- `src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts`
- `src/lib/admin/teas-structured-ocr-parser.ts`
- `src/lib/firestore-operations.ts`
- `scripts/repair-teas-structured-split-page.mjs`
- `scripts/save-teas-structured-scans.mjs`
- `Documentation/admin/Admin content management.md`

Validation run:

```text
cmd /c node scripts\tmp-order-reading-passage-groups.mjs --dry-run
cmd /c node scripts\tmp-order-reading-passage-groups.mjs
cmd /c node scripts\tmp-order-reading-passage-groups.mjs --dry-run
.\node_modules\.bin\tsc.cmd --noEmit
```

## Shared Admin UI Standard

Admin pages should apply the NursingMocks typography system while keeping the layout optimized for data management.

Applied main listing cleanup to:

- `/admin/nursing-exit-exam` now uses shared admin notification, page header, overview card, stat card, tab, and toolbar primitives for the main management screen.
- `/admin/nursing-exit-exam` now exposes `Edit Main Page` as a header action instead of a duplicated `Main Page Settings` tab.
- `/admin/nursing-exit-exam` now uses `Quiz Metadata` and `Knowledge Base Articles` naming in the main tab and toolbar labels.
- `/admin/nursing-exit-exam` keeps existing Firestore reads, route mappings, filters, pagination, create/delete handlers, and child admin routes unchanged during this UI alignment phase.

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Admin Editor Paste Style Normalization

Standardized rich content added through Nursing Entrance nested page editors so pasted content does not carry external font families, font sizes, colors, or Word/Docs styling into saved public page HTML.

Follow-up update:

- Word/Office HTML is now detected by the shared admin sanitizer before it reaches the editor.
- Word document shells, conditional comments, Office XML tags, `Mso` classes, namespace attributes, event handlers, font styles, margins, indentation, and pasted alignment styles are stripped by default.
- Semantic tables are preserved during Word paste cleanup, including table, row, header, cell, caption, colgroup, col, rowspan, colspan, scope, width, height, and alignment attributes where applicable.
- This prevents pasted Word content from overriding public page centering, font, size, and spacing while still allowing table-based content to remain structured.

## Follow-up: Public Practice Card Actions

Updated public nested practice cards so quiz/set cards stay action-focused:

- removed card description text from the public exam cards
- replaced the single text link with separate `Review Mode` and `Exam Mode` button controls
- preserved the existing card destination route; `Review Mode` opens the clean set URL and `Exam Mode` appends `mode=exam`
- show a quiet `Updated for {year}` badge on cards when the quiz record has `examYear` or `year`
- sort nested public quiz cards by set number descending so newer sets appear first
- parent subject cards, such as `/ati-teas-practice-test`, use one subject-specific action like `View Math Sets` instead of quiz-mode buttons or year badges

## Follow-up: Nested Nursing Entrance FAQ Copy Editor

Aligned the nested Nursing Entrance editor with the parent sub-page editor:

- separated the body `Content Editor` from the `FAQ Section`
- added editable FAQ title and description fields above the nested FAQ list
- kept the existing `displayCopy.faqTitle` and `displayCopy.faqDescription` storage keys so public rendering remains unchanged

Affected route:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
```

Changed:

- added a shared admin editor HTML sanitizer for pasted rich text
- stripped pasted font family, font size, line height, color/background styling, event handlers, and Word/Docs classes while preserving normal content structure
- made admin Tiptap and rich-text editors use the NursingMocks default Outfit font stack, body size, line height, and heading inheritance while editing
- applied the sanitizer to the shared Tiptap editor paste pipeline
- applied the sanitizer to the smaller rich text description editor paste/input flow
- sanitized nested page `description` and `bodyContent` again before save so existing pasted styling is cleaned on the next update
- added an `Edit Public Copy` header action on Nursing Entrance nested page editors that opens the same display-copy modal pattern used by parent Sub Page editors
- updated public page intro/description blocks to use the larger hero-style typography so long practice copy does not look squeezed above cards or inside page headers

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Nursing Entrance Content Strategy Modal

Added the first reusable admin content-strategy layer for Koray-style content planning.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]
```

Changed:

- added a `Content Strategy` header action beside `Edit Public Copy`
- added a completion badge that shows `Complete` when core strategy fields are filled and `Needs Work` otherwise
- stores internal planning data on the sub-page document as `contentStrategy`
- added reusable `ContentStrategyModal` for page role, primary intent, contextual vector/header/structure/connection, query terms, volume, coverage boundaries, internal links, CTA role, and publication phase
- kept public rendering unchanged; these fields are internal admin planning data for future brief and content generation

Affected files:

```text
src/components/admin/ContentStrategyModal.tsx
src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Topic Editor Optimization

Optimized the Test Bank topic editor used by routes such as:

```text
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]
```

Changed:

- kept the existing Firestore topic load/save behavior unchanged
- loaded the parent Sub Page and Nested Sub Page names so breadcrumbs and parent tiles show readable labels instead of raw IDs where Firestore data is available
- standardized the full topic editor form with shared `AdminFormSection`, `AdminFieldGroup`, `AdminSlugField`, and `AdminSelectField` components
- replaced the remaining custom topic form input, select, textarea, label, helper, card, and section-header classes with admin-standard controls
- improved mobile behavior by using stacked field groups, safer grid breakpoints, truncating parent tiles, and wrapping header actions cleanly
- corrected the `Back to Admin` action to return to the nested relationship manage page for this topic context

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Nested Sub Page Editor Optimization

Optimized the Test Bank nested sub-page editor used by routes such as:

```text
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]
```

Changed:

- kept the existing Firestore nested sub-page load/save behavior and document path unchanged
- loaded the parent Sub Page name so breadcrumbs and parent structure tiles show readable labels instead of raw IDs when available
- standardized the full nested sub-page editor with shared `AdminFormSection`, `AdminFieldGroup`, `AdminSlugField`, and `AdminSelectField` controls
- replaced the remaining custom nested-page form input, select, textarea, card, and section-header styling with admin-standard controls
- added automatic `CollectionPage` and `BreadcrumbList` JSON-LD generation when saved schema is blank
- added a `Regenerate Schema` action beside the schema field and a `Clean Legacy Branding` action in the page header
- sanitized legacy brand/domain/email/logo text on load and before save so old metadata does not continue to appear in the editor
- corrected breadcrumb and header actions to return to the correct Test Bank parent and nested manage routes
- improved mobile behavior with stacked field groups, wrapped header actions, stable slug controls, and safer editor containers

Validation run:

```text
rg -n 'https://nursingmocks.com|rounded-2xl|shadow-sm|bg-gradient|p-4\.5|py-2\.25|\[#|AdminLoadingState|useAuth|currentUser|label: "Home"|label: "Content"' 'src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/page.tsx'
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Sub Page Editor Optimization

Optimized the Test Bank sub-page editor used by routes such as:

```text
/admin/nursing-test-bank/[subPageId]
```

Changed:

- kept the existing Firestore sub-page load/save behavior, slug redirect behavior, and document path unchanged
- standardized the full sub-page editor with shared `AdminFormSection`, `AdminFieldGroup`, `AdminSlugField`, and `AdminSelectField` controls
- replaced the remaining custom sub-page form input, select, textarea, card, and section-header styling with admin-standard controls
- removed the stale route-context helper copy and old breadcrumb labels
- added automatic `CollectionPage` and `BreadcrumbList` JSON-LD generation when saved schema is blank
- added a `Regenerate Schema` action beside the schema field and a `Clean Legacy Branding` action in the page header
- sanitized legacy brand/domain/email/logo text on load and before save
- added a direct `Manage Nested Sub Pages` header action for the sub-page relationship screen
- improved mobile behavior with stacked field groups, wrapped header actions, stable slug controls, and safer editor containers

Validation run:

```text
rg -n 'rounded-2xl|shadow-sm|bg-gradient|p-4\.5|py-2\.25|\[#|AdminLoadingState|useAuth|currentUser|label: "Home"|label: "Content"|â|ATI TEAS|TEAS Reading' 'src/app/admin/nursing-test-bank/[subPageId]/page.tsx'
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Scoped Topic Manager Removal

Removed the duplicate scoped topic-management UI for routes such as:

```text
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/manage
```

Changed:

- replaced the scoped manage page implementation with a redirect to `/admin/nursing-test-bank?tab=topics`
- added `?tab=` URL support to the main Nursing Test Bank admin page so `/admin/nursing-test-bank?tab=topics` opens the global Topics tab directly
- changed nested sub-page editor topic navigation to the global Topics tab instead of the removed scoped manager
- changed topic editor breadcrumb/back navigation to the global Topics tab
- kept topic creation, editing, viewing, deleting, and quiz-metadata creation available through `/admin/nursing-test-bank`

Validation run:

```text
rg -n "Manage Topics" src/app/admin/nursing-test-bank -g "*.tsx"
rg -n "tab=topics|useSearchParams" src/app/admin/nursing-test-bank -g "*.tsx"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Topic Schema And Legacy Brand Cleanup

Completed a stricter pass after finding legacy TeasGurus traces and blank schema behavior.

Changed:

- added automatic JSON-LD schema generation for Test Bank topic editors when a topic has no saved schema
- added a `Regenerate Schema` action beside the schema field so admins can refresh the generated schema after editing topic metadata
- generated topic schema now includes `WebPage` and `BreadcrumbList` graph nodes using NursingMocks URLs and the topic hierarchy
- removed remaining TeasGurus/NursingMocks migration leftovers from live `src` and `public` files, including old domain, email, logo-path, and brand-name strings
- cleaned the non-shipped Test Bank backup page so repository scans no longer report TeasGurus under the Test Bank admin path

Validation run:

```text
rg -n "TeasGurus|Teas Gurus|teasgurus|teas-gurus|support@teasgurus|teas-gurus-logo" src public -g "*"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Saved Metadata Cleanup

Cleaned saved Firestore metadata after old branding still appeared in the admin meta fields.

Changed:

- added `scripts/clean-legacy-branding-firestore.js`
- the script defaults to a dry run and targets the Nursing Test Bank content tree
- `--apply` replaces legacy TeasGurus brand/domain/email/logo strings in top-level Firestore fields that contain saved legacy values
- added topic editor load/save sanitization so legacy branding is normalized before it appears in the editor and before future saves
- added a `Clean Legacy Branding` action to the topic editor header for one-click cleanup of the current topic form

Applied cleanup:

```text
UPDATE pillarPages/nursing-test-bank/subPages/SuT1noZoNGEjKGR1vTbi: meta
UPDATE pillarPages/nursing-test-bank/subPages/z0xzINtS3EohZNaKosBz: meta
UPDATE pillarPages/nursing-test-bank/subPages/z0xzINtS3EohZNaKosBz/nestedSubPages/ToLSmb6DG83NTZWXEJxt: meta
UPDATE pillarPages/nursing-test-bank/subPages/z0xzINtS3EohZNaKosBz/nestedSubPages/ToLSmb6DG83NTZWXEJxt/topics/dFodSKImOYmvFZmdWFMu: meta
UPDATE pillarPages/nursing-test-bank/subPages/z0xzINtS3EohZNaKosBz/nestedSubPages/lyrHg4RBzN6UafuymMFT: meta
UPDATE pillarPages/nursing-test-bank/subPages/z0xzINtS3EohZNaKosBz/nestedSubPages/lyrHg4RBzN6UafuymMFT/topics/84LuQWRglNeaT6Etsokn: meta
UPDATE pillarPages/nursing-test-bank/subPages/z0xzINtS3EohZNaKosBz/nestedSubPages/lyrHg4RBzN6UafuymMFT/topics/84LuQWRglNeaT6Etsokn/quizzes/3ctCY4m4antViEUTRNZA: meta
```

Validation run:

```text
node scripts/clean-legacy-branding-firestore.js
.\node_modules\.bin\tsc.cmd --noEmit
```

Post-apply dry run result:

```text
Dry run complete: 0 docs, 0 top-level fields.
```

## Follow-up: Test Bank And Exit Exam Loading Placement

Fixed loading states that appeared in the top-left corner before the admin page shell finished rendering.

Changed:

- added shared `AdminLoadingShell` in `src/components/admin/AdminUi.tsx`
- replaced bare `admin-page` loading wrappers in Nursing Test Bank and Nursing Exit Exam editor/manager routes with the centered loading shell
- covered sub-page, nested-page, topic, KB article, quiz manager, bulk upload, question create, and question edit loading states across Test Bank and Exit Exam
- kept the existing loading titles/descriptions and data-fetching behavior unchanged

Validation run:

```text
rg -n "<div className=\"admin-page\">\\s*$|<AdminLoadingState|AdminLoadingState" src/app/admin/nursing-test-bank src/app/admin/nursing-exit-exam -g "*.tsx"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Exit Exam Main Listing Shared Controls

Continued the Nursing Exit Exam admin page upgrade so the main listing uses the same shared controls as the refreshed Nursing Entrance Exam page.

Affected page:

```text
/admin/nursing-exit-exam
```

Changed:

- replaced the remaining custom pagination controls for Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles with `AdminPagination`
- replaced the four custom delete confirmation overlays with `AdminDestructiveDialog`
- kept existing Firestore reads, create/delete handlers, filters, sorting, route mappings, and child route links unchanged
- normalized remaining visible `KB article` text to `Knowledge Base Article`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Exit Exam Create Modal Cleanup

Converted the Nursing Exit Exam main listing create dialogs to the shared admin modal and form primitives.

Affected page:

```text
/admin/nursing-exit-exam
```

Changed:

- replaced custom create overlays for Sub Pages, Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles with `AdminModal`
- used `AdminFormSection`, `AdminFieldGroup`, `AdminSlugField`, `AdminModalFooter`, and `AdminValidationMessage` for consistent form layout, field spacing, validation styling, and footer actions
- kept existing submit handlers, required fields, slug change behavior, selected parent state, and reset behavior unchanged
- kept the Nursing Exit Exams access product display in the Sub Page create dialog

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Exit Exam Table Cell Cleanup

Continued the Nursing Exit Exam main listing polish by aligning table data cells with the shared admin table system.

Affected page:

```text
/admin/nursing-exit-exam
```

Changed:

- replaced inline table data cell wrappers with `AdminTableCell`
- preserved existing action buttons, action routes, row filters, sorting, pagination, and status badges
- kept slug cells in the monospace table style and retained existing minimum widths for dense name and slug columns
- replaced corrupted dash fallback text in table rows with `N/A`
- normalized remaining visible Sub Page loading and duplicate-slug validation messages

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Admin Table Long Title Truncation

Added a shared table title truncation utility for dense admin tables where long quiz, Sub Page, Nested Sub Page, or Knowledge Base Article names can push action buttons out of alignment.

Affected page:

```text
/admin/nursing-exit-exam
```

Changed:

- added `admin-table-title-truncate` in global admin styles
- applied it to long display-name columns on the Nursing Exit Exam main listing
- added native `title` attributes so hovering the truncated value shows the full text
- kept row actions, links, table ordering, and saved data unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Admin Table Slug And Action Containment

Tightened dense admin table rows so long slugs and action groups do not distort row height.

Affected page:

```text
/admin/nursing-exit-exam
```

Changed:

- added `admin-table-slug-truncate` for URL slug cells
- applied hover `title` attributes to truncated slug cells so admins can inspect the full URL
- changed admin content action groups from wrapping to a single-line button row
- kept table overflow behavior responsible for horizontal scrolling instead of pushing later records lower

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Exit Exam Nested Sub Page Editor UI

Updated the internal Nursing Exit Exam Nested Sub Page editor route to match the refreshed admin UI used by the Nursing Entrance Exam editor.

Affected page:

```text
/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]
```

Changed:

- replaced the old gradient/local editor shell with the standard admin sidebar, top bar, workspace, and content wrapper
- added `AdminPageHeader`, `AdminNotificationRegion`, `AdminCard`, `AdminFormSection`, `AdminFieldGroup`, `AdminSlugField`, `AdminSelectField`, `AdminStatusBadge`, and `AdminInfoTile`
- aligned loading state with the full admin shell and `AdminLoadingState`
- kept Nursing Exit Exam Firestore reads and saves on the exit exam collections
- added parent Sub Page lookup for clearer breadcrumbs and parent-structure display
- removed old visible encoding artifacts from the editor copy

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Exit Exam Sub Page Editor UI

Updated the Nursing Exit Exam Sub Page editor route to match the refreshed admin UI used by the Nursing Entrance Exam Sub Page editor.

Affected page:

```text
/admin/nursing-exit-exam/[subPageId]
```

Changed:

- replaced the old local editor shell with the standard admin sidebar, top bar, workspace, and content wrapper
- added shared admin components for header, notifications, cards, form sections, fields, slug field, status select, status badge, and parent-structure summary
- kept Nursing Exit Exam Firestore reads, saves, redirect behavior, public preview, content editor, FAQ editor, and schema editor intact
- normalized save-time names and slugs using the shared admin content naming helpers
- replaced remaining entrance-exam placeholders with nursing-exit examples

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Exit Exam Quiz Imports

Reset and reimported the Nursing Exit Exam quiz data from the local Naxlex source files after stale records were removed.

Source root:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Exit Exams
```

Import naming rule:

- Exit Exam and Test Bank quizzes use the source JSON file name as the quiz name.
- Exit Exam and Test Bank quiz metadata should not include `setNumber`, `year`, or `examYear`.

Imported mappings:

```text
lpn-exit-exams / ati-lpn-comprehensive-predictor
- ATI PN Comprehensive Predictor 2023 Proctored Exam: 168 questions
- ATI LPN Comprehensive Predictor 2023 Proctored Exam: 32 questions
- ATI PN Comprehensive Predictor 2023 Proctored Exam Form 2: 178 questions
- ATI LPN Comprehensive Predictor 2023 Proctored Exam Form 2: 178 questions

lpn-exit-exams / hesi-lpn-exit-exam
- HESI LPN Exit Proctored Exam: 291 questions
- HESI LPN Exit Proctored Exam Form 2: 110 questions
- HESI LPN Exit Exam IV Proctored Exam: 126 questions
- HESI LPN Exit Test 11 Proctored Exam: 71 questions

rn-exit-exams / ati-rn-comprehensive-predictor
- RN Comprehensive Predictor 2023 Proctored Exam - St. Joseph: 176 questions
- RN Comprehensive Predictor Proctored Exam (National U CA San Diego): 177 questions
- RN Comprehensive Predictor 2023 Proctored Exam: 145 questions
- ATI RN Comprehensive Predictor 2023 Retake Proctored Exam: 176 questions

rn-exit-exams / hesi-rn-exit-exam
- HESI RN Exit Proctored Exam: 127 questions
- HESI Compass B Exit Proctored Exam: 68 questions
- HESI RN Compass Exit B Proctored Exam: 121 questions
- HESI RN Exit Proctored Exam Form 2: 130 questions
```

Validation:

- existing Exit Exam quiz records, question subcollections, and quiz route mappings were removed before reimport
- each nested Sub Page has exactly four imported Naxlex quiz records
- each quiz has one route mapping
- each quiz `questionCount` matches the actual Firestore question document count
- no imported quiz has `setNumber`, `year`, or `examYear`
- leading numeric source prefixes such as `1-` and `2-` were removed from quiz display names
- duplicate names created by prefix removal were made unique with a `Form 2` suffix
- no blocking question issues were found for missing question text, options, or correct answers

## Follow-up: Public Nested Page Child Lists

Fixed the public dynamic `[slug]` page so nested exam pages render their direct children from the correct collection.

Affected public route:

```text
/ati-lpn-comprehensive-predictor
```

Changed:

- parent Sub Pages still list Nested Sub Pages as subjects
- nested Nursing Entrance Exam and Nursing Exit Exam pages now list their child quizzes as exams
- nested Nursing Test Bank pages now list their child topics
- quiz route slugs are read from route mappings instead of falling back only to quiz document slugs
- section labels now switch between Subject, Exam, and Topic based on the page type

Validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest http://localhost:3000/ati-lpn-comprehensive-predictor
```

The central source of truth for reusable admin UI primitives is:

```text
src/components/admin/AdminUi.tsx
src/app/globals.css
```

Use these shared components before adding page-local markup:

- `AdminPageHeader` for page title, eyebrow, description, and header actions
- `AdminTopBar` for the desktop admin breadcrumb bar, using the Nursing Entrance Exam chevron breadcrumb pattern across admin pages
- `AdminAlert` for success, error, warning, and informational messages
- `AdminTabs` for page sections that switch without navigation
- `AdminCard` for admin management surfaces
- `AdminStatCard` for compact operational metrics
- `AdminInfoTile` for labeled overview values inside admin cards
- `AdminBadgeList` for compact admin overview badges
- `AdminToolbar` for search, filters, and page-level create/actions
- `AdminTable` for scroll-safe table shells and shared table styling
- `AdminTableCell` for body cells that need shared nowrap or monospace treatment
- `AdminEmptyState` for card or section empty states
- `AdminDetailPanel` for contextual guidance, edit notes, and relationship explanations
- `AdminTableEmptyState` for empty rows inside admin tables
- `AdminStatusBadge` for admin status, readiness, and lifecycle badges
- `AdminPagination` for paginated admin tables and lists
- `AdminFormSection` for grouped admin form content
- `AdminFieldGroup` for labels, required markers, helper text, and field spacing
- `AdminSlugField` for canonical URL prefix plus editable slug inputs
- `AdminValidationMessage` for validation errors inside admin forms
- `AdminModal` and `AdminModalFooter` for focused create/edit dialogs
- `AdminDestructiveDialog` for delete confirmations and irreversible admin actions
- `AdminLoadingState` for admin loading screens with a consistent spinner, skeleton rows, and accessible status messaging

Page-specific admin UI should only add data logic, field content, and route-specific actions. Width, typography, card styling, tab styling, alerts, stat cards, toolbar behavior, and CRUD button treatment should come from the shared admin source of truth.

Applied tab cleanup to:

- `/admin/nursing-entrance-exam` now uses only `AdminTabs` for the management section tabs; the old hidden user-button tab row was removed.

This standard applies to:

- `/admin`
- `/admin/users`
- `/admin/question-type-scan`
- `/admin/billing`
- `/admin/exam-access`
- `/admin/login-security`
- `/admin/audit-logs`
- `/admin/email-jobs`
- `/admin/nursing-entrance-exam`
- `/admin/nursing-test-bank`
- `/admin/nursing-exit-exam`
- parent sub-page editors
- nested sub-page editors
- quiz metadata and question-management pages
- future admin CRUD pages

Admin pages are not user dashboard pages, but they should still use the shared NursingMocks visual language:

- use the same readable font scale, field styling, card polish, badges, buttons, alerts, tabs, empty states, modal patterns, and focus states as `/typography`
- keep the admin workspace full width inside the admin shell because admin pages often contain tables, filters, nested content, and multi-column forms
- avoid narrow user-page content containers on admin management screens
- use compact but readable spacing so admins can scan many records without the page feeling crowded
- keep primary actions aligned with the page header or toolbar, not floating in inconsistent positions
- keep admin breadcrumbs consistent with `Home > Admin Dashboard > Current Page` and render them through `AdminTopBar`
- every previous breadcrumb segment must be clickable and point to a real route; only the current page segment should be non-clickable
- keep search, filters, and create buttons in one responsive toolbar that wraps cleanly on tablet and mobile
- use exact, user-friendly names with correct capitalization instead of raw IDs, slugs, or hyphenated internal labels where a display name exists
- keep destructive actions visually distinct and require consequence-aware confirmation
- show success and error messages above the form or table area affected by the action
- show loading states that explain what is being prepared, but avoid long internal implementation wording
- use `AdminLoadingState` instead of user dashboard loading cards on admin management screens

### Width and Layout

Admin screens should use the admin sidebar shell and a full-width workspace:

```text
main: user-page min-h-screen px-4 py-6 sm:px-6 lg:px-8
inner content: w-full max-w-none
```

Do not use the authenticated user-page max-width container for normal admin management pages. User pages can remain centered and constrained. Admin pages should use the available width for tables, toolbars, editors, and side-by-side management panels.

Where a page has a focused editor, the editor can constrain individual text-heavy panels for readability, but the overall page shell should remain full width.

### Admin Typography Rules

Admin typography should follow the same capitalization discipline used across the project:

- main page headings use clear title case, such as `Billing Configuration` or `Nursing Entrance Exam`
- section headings use readable title case
- helper text uses sentence style
- button labels use action-oriented title case, such as `Save Changes`, `Add Exam`, `Create Quiz`, or `View Activity`
- avoid raw enum labels unless they are intentionally shown as technical configuration
- replace internal labels such as `all_access`, `nursing_test_bank`, or `stripe_us_test` with friendly display names where possible

### Cards, Tables, and Toolbars

Admin cards should not look flat or like plain bordered boxes.

Use the shared polished surface patterns already used by user management and `/typography`:

- white or lightly tinted cards
- subtle border
- soft shadow
- rounded corners consistent with the shared system
- clear heading and helper text hierarchy
- compact stat cards for counts and status
- admin-specific info tiles and badge lists for overview summaries instead of user-dashboard surfaces
- table shells that preserve readability on wide screens and scroll safely on mobile

Toolbars should be predictable:

- search first
- filters next
- secondary actions next
- primary create action last on desktop
- stack cleanly on mobile
- avoid extra-wide search fields when a medium width is enough
- use autocomplete where the data source supports it

Use `AdminToolbar` from `src/components/admin/AdminUi.tsx` for this structure. Page code should pass search and filter fields as children, then pass create or secondary actions through the `actions` prop.

Management tables should use:

```text
AdminTable
```

`AdminTable` owns the table wrapper, border, radius, horizontal scroll, and table class. Page code should provide only the `thead`, `tbody`, cells, row data, and action handlers. Do not create new inline table, toolbar, tab, or stat-card styles when the shared admin classes/components can represent the same UI.

Applied table/card shell cleanup to:

- `/admin/nursing-entrance-exam` main management table card now uses `AdminCard`
- `/admin/nursing-entrance-exam` duplicate hidden legacy header and overview blocks were removed after the visible `AdminPageHeader`, `AdminCard`, and `AdminStatCard` replacements became the source of truth
- `/admin/nursing-entrance-exam` content structure overview now uses `AdminInfoTile` and `AdminBadgeList` instead of user-dashboard tile and pill classes
- `/admin/nursing-entrance-exam` management table header now uses shared `AdminTable` header styling instead of inline `th` styles
- `/admin/nursing-entrance-exam` quiz table rows now use `AdminTableCell` instead of repeated inline `td` styles
- `/admin/nursing-entrance-exam` KB article table rows now use `AdminTableCell` so article names, exam labels, slugs, statuses, timestamps, and CRUD actions share the same admin table rhythm
- `/admin/nursing-entrance-exam` nested sub-page table rows now use `AdminTableCell` while preserving the existing add quiz, edit, view, and delete actions
- `/admin/nursing-entrance-exam` top-level sub-page table rows now use `AdminTableCell` while preserving the existing add nested page, edit, view, and delete actions
- `/admin/nursing-entrance-exam` loading screen now uses `AdminLoadingState` instead of user dashboard card and skeleton classes
- `/admin/nursing-entrance-exam` no longer has `user-*` class references in the page component; admin-specific buttons, loading, cards, tables, and form primitives are now the local standard
- shared `AdminTopBar` was added from the Nursing Entrance Exam breadcrumb pattern and applied to `/admin`, `/admin/users`, `/admin/billing`, `/admin/exam-access`, `/admin/audit-logs`, `/admin/login-security`, `/admin/email-jobs`, `/admin/profile`, `/admin/nursing-entrance-exam`, `/admin/nursing-test-bank`, and `/admin/nursing-exit-exam`
- `AdminTopBar` was also applied to nested admin editor routes for billing documentation, quiz managers, bulk upload pages, and create/edit question pages under Nursing Entrance Exam, Nursing Test Bank, and Nursing Exit Exam
- nested editor breadcrumbs should keep the same shape: `Home > Admin Dashboard > Current Editor`, with deeper page context handled inside the editor content rather than by rebuilding page-local breadcrumb markup
- `/admin/billing/documentation` now uses admin shell, header, card, and button classes instead of user-page classes
- `/admin` dashboard cards, alerts, attention links, management cards, and recent activity tables now use admin primitives/classes instead of user-page classes
- `/admin/users` search, summary stats, alerts, user table, detail panels, status badges, account controls, and JSON panels now use admin primitives/classes instead of user-page classes
- `/admin/billing` alert messages and `/admin/exam-access` alerts, loading state, status badges, table cells, edit action, and form labels now use admin primitives/classes instead of user-page classes

## Follow-up: local Naxlex question type scanner

Added an admin-only scanner at `/admin/question-type-scan` for auditing the local Naxlex Nursing Exit Exams and Nursing Test Bank JSON exports before building unsupported question renderers.

Behavior:

- scans `C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Exit Exams` and `C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank` by default
- allows deployment/workstation overrides through semicolon-delimited `NAXLEX_SCAN_SOURCE_PATHS`
- reads nested JSON files under the local export folder from a protected server route
- records every folder visited during the recursive scan and previews the folder tree in the admin UI with depth, child-folder counts, direct JSON file counts, branch JSON file counts, leaf-folder labels, and sample file names from the deepest folders
- labels scan rows by source export so Nursing Exit Exams and Nursing Test Bank can be reviewed separately
- requires the existing Firebase admin authorization header before scanning
- summarizes every detected `question_type_id`
- shows total questions, file coverage, program/vendor coverage, option shapes, correct-answer shapes, samples, and structural flags such as tabs, subquestions, match options, images, and units
- includes `View Render` actions for Type 1, Type 2, Type 3, Type 5, Type 7, Type 9, Type 11, and Type 14 using actual questions from the scanned JSON
- opens render previews on a dedicated admin page URL such as `/admin/question-type-scan?render=11`, with a `Back to Scan` action returning to the scan table
- render-only URLs suppress scanner metadata such as JSON source paths and renderer notes so the preview reads like a real quiz interaction
- Type 1 preview shows the expected prompt, answer choices, correct option, explanation, and source path
- Type 2 preview renders select-all-that-apply choices with explicit `Check Answer` and `Reset` actions
- Type 3 preview renders true/false choices with explicit `Check Answer` and `Reset` actions
- Type 6 preview renders ordered-response choices using the reference two-panel layout: available steps on the left, dashed ordered response box on the right, HTML drag-and-drop placement/reordering with upper-half/lower-half insertion, full-width dotted progress row, Previous/Next sample navigation, `Remove` fallback control, and explicit `Check Answer`/`Reset` actions
- Type 5 preview renders as the NursingMocks Hot Spot renderer with prompt, artwork/click-target placeholder, coordinate answer data, explanation, and source path
- the current Naxlex export stores the real coordinate-based hot spot sample under source `question_type_id: 9`, so the admin Type 5 preview reuses that real JSON sample to show the intended NursingMocks Type 5 behavior
- Type 7 preview renders a numeric answer input with explicit `Check Answer` and `Reset` actions
- Type 9 preview documents the hot spot renderer requirement, including artwork/click-target handling and saved coordinate ranges from `correctAnswer`
- previews now carry `image_path` into render samples as a locally cached image path when possible; relative Naxlex asset paths are normalized against `https://naxlex.com/nursing/`, downloaded into `public/naxlex-images`, and rendered from that local public URL, while failed downloads fall back to the full remote URL
- Type 11 preview uses an ATI/NCLEX-style desktop highlight layout based on the ATI reference image: the left pane shows the prompt, exhibit tabs, and read-only active exhibit passage; the right pane shows the bold click instruction, a dotted separator row, and every possible selectable finding highlighted in yellow by default. Clicking a finding changes it to a stronger orange selected highlight, and `Check Answer`/`Reset` grade correct, wrong, or missed highlighted findings.
- Type 9, Type 11, and Type 14 render URLs collect every scanned question for that type into `renderSamples` and show Previous/Next controls above the shared preview shell, with URLs such as `/admin/question-type-scan?render=9&sample=1`, `/admin/question-type-scan?render=11&sample=1`, and `/admin/question-type-scan?render=14&sample=1`
- Type 14 preview uses an ATI-style case-study layout with an Exhibits tab strip, one active exhibit panel, a selectable finding-by-condition matrix, and explicit `Check Answer`/`Reset` actions; grading compares selections against the JSON answer key and marks correct, wrong, or missed cells only after the admin checks the answer
- Type 14 matrix preview now keeps its exhibit-plus-table structure while sharing the Type 11/admin visual language: admin card surfaces, purple tab underline states, Outfit-based admin typography, rounded selection controls, and green/red/amber checked feedback
- Type 9 hot spot and Type 14 matrix render previews now use the same Previous/Next sample navigation as Type 11 so admins can review every scanned question in the shared shell for that type
- marks currently public-supported question types `1`, `2`, `3`, and `7`; all other detected types are shown as needing renderer work

Files changed:

- `src/lib/admin/naxlex-question-type-scan.ts`
- `src/app/api/admin/question-type-scan/route.ts`
- `src/app/admin/question-type-scan/page.tsx`
- `src/components/layout/AdminSidebar.tsx`
- `Documentation/admin/Admin content management.md`

Latest Type 11 highlight preview update:

- `src/app/admin/question-type-scan/page.tsx` now states that all possible selections are yellow by default before telling admins to click risk-factor findings and click again to deselect
- selectable Type 11 finding buttons expose their pressed state with `aria-pressed` while preserving yellow default selections, stronger selected highlights, and checked correct/wrong/missed feedback
- `src/lib/admin/naxlex-question-type-scan.ts` now returns all Type 11 render samples so the admin preview can page through them with a Next button while keeping one renderer shell
- `/admin/question-type-scan?render=11&sample=1` now starts the Type 11 preview at the first scanned highlight question and keeps the sample index in the URL
- Type 11 rendering now follows the desktop reference image: exhibits are read-only in the left pane, selectable findings are rendered from the option list in the right pane, default selections are pale yellow, and selected findings use an orange highlight
- Type 11 prompt/instruction rendering now deduplicates click-instruction question text: if the source question is the highlight instruction, it is shown only in the right instruction pane instead of repeating in the left prompt pane
- Type 11 no longer renders the shared pre-preview `questionHtml` block above the ATI-style shell; the Type 11 shell owns prompt and instruction placement so the question does not appear twice
- Type 11 prompt and exhibit panes currently render the same HTML from the JSON through `ContentRenderer` so admins can inspect how the source markup appears before applying additional formatting
- Type 11 selection now allows multiple highlighted findings at the same time while preserving click-again deselection
- Type 11 checked feedback now appears inline next to each selectable finding: selected correct findings show `Correct`, selected wrong findings show `Incorrect`, and unselected correct findings show `Missed`
- Type 11 preview now keeps the same two-column ATI-style structure while using shared admin surfaces, badges, controls, and Outfit-based admin typography
- Type 14 matrix preview now uses the same admin/Type 11 styling system while preserving its matrix-specific exhibit panel, finding rows, condition columns, and per-cell checked feedback
- Type 14 case-study preview now follows the provided reference images more closely: left exhibit tabs/content, right instruction text, dotted progress row, blue assessment table header, and compact teal square checkboxes
- Type 14 matrix previews now collect all scanned matrix render samples and keep the sample index in URLs such as `/admin/question-type-scan?render=14&sample=1`
- Type 9 hot spot previews now collect all scanned hot spot render samples and keep the sample index in URLs such as `/admin/question-type-scan?render=9&sample=1`
- Type 5 hot spot previews now reuse all Type 9 coordinate-based hot spot samples, keep the sample index in URLs such as `/admin/question-type-scan?render=5&sample=1`, and resolve artwork from the downloaded `public/naxlex-images/<source-folder>/` cache before falling back to legacy or remote paths
- `/admin/question-type-scan?render=5` now includes Previous/Next sample controls, and each navigated question shows its current image filename, cached path, and source artwork link inline with the hot spot artwork
- Type 9 hot spot previews now show the referenced artwork image from the local `imagePath` cache URL instead of the old placeholder whenever the JSON includes an artwork path
- Type 9 hot spot previews preserve the full source artwork URL in `imageSourceUrl` and expose an `Open Source Artwork` link so admins can manually download blocked images in a browser
- image cache lookup now prefers manually saved files organized by the JSON file folder under `public/naxlex-images/<source>/<program>/<vendor>/<subject>/`, then falls back to flat original filenames, legacy `public/naxlex-hotspot-artwork` files, hashed downloaded cache files, or the remote URL
- Type 9 hot spot previews are now interactive: admins can click the image, see the selected point, check it against `xRanges`/`yRanges`, and review correct/incorrect feedback with the saved target rectangle shown after checking
- `.gitignore` excludes `public/naxlex-images/` because the folder is a generated local cache created by the admin scanner; the old `public/naxlex-hotspot-artwork/` cache remains ignored for legacy local files
- `scripts/download-naxlex-images.js` supports dry-run manifest generation for the admin image workflow; bulk downloads remain disabled so admins can inspect and download images one at a time from `/admin/image-sources`
- the root `scrape.js` example with a hardcoded proxy API URL was replaced by `scrape-images.js`, which delegates to the general downloader and reads credentials from environment variables
- Admin navigation now includes a dedicated `Image Sources` page at `/admin/image-sources`, and the Question Type Scan header links to that page instead of embedding image source inspection inside the scanner
- `/admin/image-sources` no longer performs a global image scan or builds an all-folder inventory; admins paste one local Naxlex folder path and click `Scan Folder`, which reads only direct JSON files in that folder and lists image source URLs, filenames, target cache paths, and already-saved status before any image download
- folder image scanning recursively checks every field in each parsed JSON question, extracts downloadable image file URLs/paths from direct values and HTML attributes such as `src`, `href`, and `srcset`, filters out whole HTML snippets or non-image strings, and shows the exact JSON field path where each image reference was found
- the folder image table shows the exact image source URL in the image column so admins can verify the original file before downloading
- `/admin/image-sources` includes authenticated `Open Folder` actions that validate the requested path is inside the configured Naxlex source roots, then opens that exact folder in Windows Explorer from the local server
- `/admin/image-sources` includes per-image `Download` buttons that call Zyte API with `POST https://api.zyte.com/v1/extract`, `httpResponseBody: true`, and the selected image URL, then save the returned image bytes under the relevant `public/naxlex-images/<source>/<folder>/` path and mark the row saved after a successful download
- saved image rows and detail panels include an `Open Saved Folder` action that opens the computed local cache folder, and successful downloads display the exact `targetPath` in the admin notification
- the image download route requires `ZYTE_API_KEY` from process environment or `.env.local`

## Follow-up: Zyte Image Source Downloads

Switched the admin image source download workflow to Zyte-only downloads.

Changed:

- `/admin/image-sources` now downloads images through Zyte API only
- the image download route requires `ZYTE_API_KEY` and no longer reads previous provider API key or zone variables
- admin copy now refers to Zyte or the configured image service
- `.env.example` now documents `ZYTE_API_KEY` without including a real key value

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Quiz Explanation Generation

Added a one-click explanation generator to the Nursing Entrance quiz manager.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam
```

Changed:

- added an `AI Explanations` panel with a `Generate Missing Explanations` action
- added `Generate Explanations` actions to Quiz Metadata rows on `/admin/nursing-entrance-exam` when the quiz has questions
- active explanation generation can be stopped from either page; stopping aborts the current request and prevents the loop from moving to the next question
- the admin can optionally regenerate existing explanations for the current quiz
- the client processes the selected quiz questions one at a time so each LLM request only receives one question, passage, answer set, and saved correct answer
- the main Quiz Metadata row action loads the quiz questions first, skips questions that already have explanations, then calls the same one-question API route with row-level progress
- added the admin API route `/api/admin/nursing-entrance-exam/generate-explanation`
- the route reads the saved question from Firestore, calls OpenAI, and writes the explanation back to the existing question document
- existing correct answers are treated as the source of truth; if the model sees a likely mismatch, the question is marked `explanationStatus: "needs_answer_review"` instead of changing the answer
- generated explanations are stored with `explanation`, `explanationStatus`, `explanationGeneratedBy`, and `explanationGeneratedAt`
- failed generations are recorded with `explanationStatus: "failed"` and `explanationError`
- explanation generation also classifies each question into official ATI TEAS sections and saves `atiSubject`, `atiSection`, `atiClassificationReason`, `atiClassificationGeneratedBy`, and `atiClassificationGeneratedAt`
- `atiSection` is server-normalized against the official ATI TEAS section names; unknown or unsupported section names are saved as `Needs Review`

Assumptions:

- `OPENAI_API_KEY` is configured on the server
- the default explanation model is `gpt-5-nano`, overridable with `OPENAI_EXPLANATION_MODEL`
- the explanation style prompt is editable through `OPENAI_EXPLANATION_PROMPT`; escaped `\n` values are converted to line breaks before sending to OpenAI
- the prompt now includes answer mismatch detection, subject-specific guidance, short paragraph formatting, and a 60-140 word target for most explanations
- generated explanation text is normalized before save so dense one-paragraph outputs are split into readable paragraphs when possible
- public quiz explanation rendering also formats plain-text explanations into short paragraphs, so already-saved dense explanations display more readably without regeneration
- public dynamic quiz pages serialize Firestore timestamp-like values before passing questions into client components, preventing Next.js server/client prop errors after explanation and classification metadata are saved
- public quiz question cards now support the first TEAS renderer pass for Type 1, Type 2, Type 3, Type 6, and Type 7 with type-specific answer surfaces, check-answer feedback, correct/wrong highlighting, ordered-response placement, numeric answer checking, and readable explanations
- Type 1, Type 2, and Type 3 public answer rows now follow the admin question-type preview style: no visible A/B labels, radio/checkbox markers, transparent full-width rows, square-edged controls, and compact feedback labels
- public quiz explanations now render below the answer/check area inside the same question card instead of in a desktop side column; checking an answer opens the explanation automatically, and users can still hide or show it manually
- public quiz pages are now tighter on mobile: question cards use smaller mobile padding, answer rows have larger tap targets with safer text wrapping, ordered-response boxes use shorter mobile heights, Check/Reset controls stack cleanly, and preview CTA/review summary spacing is reduced
- Type 6 ordered-response questions are now included in public quiz page filtering and the authenticated full-quiz API so they can render with the shared public question UI
- the authenticated full-quiz API also serializes Firestore timestamp-like values before returning question JSON to client components
- added a reusable cleanup script for restarting explanation generation from a clean state:
  - dry-run: `npm run content:entrance-generated-explanations:dry-run`
  - apply: `npm run content:entrance-generated-explanations:apply`
- the cleanup script removes only fields written by the AI explanation generator and ATI classification flow, preserving question text, passages, options, and saved correct answers

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm run content:entrance-generated-explanations:dry-run
npm run content:entrance-generated-explanations:apply
npm run content:entrance-generated-explanations:dry-run
```

## Follow-up: Nursing Entrance Quiz Name Cursor Fix

Resolved a create-quiz form issue on `/admin/nursing-entrance-exam` where editing text in the middle of the Quiz Name field moved the cursor back to the end.

Changed:

- Quiz Name input now preserves the raw typed value during `onChange`
- slug auto-generation still updates from the current Quiz Name while typing
- display-name normalization still happens on blur and during save

Affected files:

```text
src/app/admin/nursing-entrance-exam/page.tsx
```

## Follow-up: Nursing Entrance Quiz Year Metadata

Added optional year metadata for Nursing Entrance Exam quiz sets so admins can identify which year a quiz/set belongs to before importing or managing questions.

Changed:

- Create Quiz modal on `/admin/nursing-entrance-exam` now includes a Year field
- Year is validated as an optional four-digit value from 2000 through 2100
- created quiz documents now save `examYear`
- Quiz Metadata table now shows the saved year when present
- Quiz Metadata editor now loads, edits, validates, and saves `examYear`
- entrance quiz subject catalog records now mirror `examYear` for downstream My Exams/import targeting

Affected files:

```text
src/app/admin/nursing-entrance-exam/page.tsx
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx
src/lib/firestore-operations.ts
```

## Follow-up: TEAS Scans Bulk Upload Prefill

Added a TEAS scan import prefill to the Nursing Entrance Exam quiz bulk upload page. The existing bulk upload writer remains the production import path; TEAS scans now load into the JSON textarea and preview before admins confirm the normal import.

Changed:

- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload` now includes a `Load From TEAS Scans` panel
- the panel reads the target quiz subject, set number, and year from quiz metadata
- admins can include or exclude TEAS scan records marked `Needs Review`
- matching `teasScannedQuestions` records are converted into the existing bulk-upload JSON shape
- scan warnings/errors are highlighted on the bulk upload page
- non-blocking issues can still be imported after explicit admin confirmation
- blocking issues, such as missing question text or missing correct answer, prevent import
- TEAS scan passages are now included in generated bulk-upload JSON, shown in the bulk-upload preview, saved on imported questions as `passage`, and rendered above the question on public quiz pages
- imported production question records now preserve `importReview` and `sourceScanId` metadata for later manual cleanup
- the saved TEAS scans admin API now supports filtering by `setNumber` and normalized TEAS subject
- bulk upload writes now run through an admin API route instead of browser Firestore writes, avoiding client permission-denied failures while still requiring an admin Firebase token

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/api/admin/nursing-entrance-exam/bulk-upload-questions/route.ts
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload/page.tsx
src/components/quiz/DynamicQuizQuestions.tsx
src/components/quiz/QuestionCard.tsx
src/lib/firestore-operations.ts
```

## Follow-up: TEAS DOCX Source Allowlist

Restricted the TEAS DOCX import tool to the two confirmed source documents only.

Allowed DOCX files:

```text
C:\Users\wilso\OneDrive\Desktop\Teas Guru\Teas Version 7 Real Exams\Teas Version 7 Real Exams\Set 4\ATI TEAS Version 7 - Update 4.docx
C:\Users\wilso\OneDrive\Desktop\Teas Guru\Teas Version 7 Real Exams\Teas Version 7 Real Exams\Set 5\ATI TEAS Version 7 - Update 5 August(NEW).docx
```

Changed:

- moved the allowed DOCX paths into a shared admin helper
- updated the DOCX picker endpoint to return only the configured Set 4 and Set 5 files
- updated the parser endpoint so manual path edits are also restricted to the same allowlist
- missing files remain visible in the picker as disabled options so path problems are obvious

Affected files:

```text
src/lib/admin/teas-doc-import-paths.ts
src/app/api/admin/teas-doc-import/files/route.ts
src/app/api/admin/teas-doc-import/parse/route.ts
src/app/admin/teas-doc-import/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS DOCX One-Button LLM Repair

Simplified the DOCX import repair workflow so admins use one action to repair every parsed question.

Affected page:

```text
/admin/teas-doc-import
```

Changed:

- replaced per-row repair buttons with a single `Repair All with LLM` button
- the repair action now sends every parsed question to the selected LLM provider mode, not only rows marked `Needs LLM`
- added progress text while repair is running, such as `Repairing 3 of 116`
- renamed the review table to `All Questions With LLM Repair Details`
- every question row now reserves a repair-detail area and shows either the returned Gemini/OpenAI repair details or a waiting message
- row status changes to `Repaired` when at least one selected provider returns a repaired result

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS DOCX Final Staging

Added final Firestore staging for DOCX-imported TEAS questions.

Affected page:

```text
/admin/teas-doc-import
```

Changed:

- added `Save Final Staging` after LLM repair
- created the `teasDocStagedQuestions` Firestore collection for DOCX-based final staging
- staging saves only the single best complete LLM version per question
- original parser fallback is not saved as the final staged question
- incomplete LLM outputs are skipped instead of being saved
- existing staged rows for the same source DOCX are replaced before saving the new run
- staged records include set name, set slug, set number, subject, passage block, question block, options, correct answer, question type, ATI format, source document path, selected provider, selected model, confidence, LLM notes, validation summary, and import readiness

Affected files:

```text
src/app/api/admin/teas-doc-import/stage/route.ts
src/app/admin/teas-doc-import/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS DOCX LLM Selection Anchored To Parse

Updated final staging selection so the saved LLM version must stay close to the parsed DOCX data.

Changed:

- final staging still saves only one complete LLM-produced version per question
- LLM candidates are now scored against the original DOCX parse before selection
- source-closeness scoring compares passage/question text overlap, answer choice overlap, answer match, subject match, and choice count similarity
- the selected staged record stores `sourceCloseness` so later audits can see how closely the saved LLM result matched the parsed source
- this reduces the risk of saving a polished but unrelated LLM rewrite when the parsed DOCX data already provides useful evidence

Affected file:

```text
src/app/api/admin/teas-doc-import/stage/route.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS DOCX Reading Passage Assignment

Improved DOCX passage handling for Reading questions.

Changed:

- DOCX `Stimulus` markers now start passage groups instead of being parsed as questions
- loose subject/header text is no longer carried forward as a passage
- questions now carry `passageMarker` so the related stimulus group is explicit
- LLM repair receives nearby passage candidates for Reading questions and is instructed to choose the passage that supports the question
- LLM repair responses can return `passageMarker`
- the repair table now shows the corrected passage under each question when the LLM returns one
- final staging saves the selected passage marker with the staged LLM question

Affected files:

```text
src/lib/admin/teas-docx-import.ts
src/app/api/admin/teas-doc-import/repair/route.ts
src/app/api/admin/teas-doc-import/stage/route.ts
src/app/admin/teas-doc-import/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Public TEAS Exams Browser

Added a simple public TEAS Exams page for browsing staged TEAS questions and searching visible page content.

Affected route:

```text
/teas-exams
```

Changed:

- added a public, logged-out accessible TEAS Exams page
- reads from the existing `teasDocStagedQuestions` final staging collection
- applies the ATI TEAS 7 preview percentage before exposing questions publicly
- does not expose correct answers on the public page
- includes subject filters for `All`, `Reading`, `Mathematics`, `Science`, and `English`
- includes Set 1 through Set 16 selector buttons
- keeps the selected set as the primary loaded/searchable scope for mobile performance
- searches only the questions currently loaded into the page component
- highlights all local matches with a separate active-match style
- supports Previous/Next buttons plus Enter and Shift+Enter navigation
- searches headings, subject/set/question labels, passage text, question text, and answer choices
- uses React text splitting for highlighting instead of unsafe raw HTML replacement

Affected files:

```text
src/app/teas-exams/page.tsx
src/components/teas-exams/TeasExamsBrowser.tsx
src/lib/teas-exams/public-teas-exams.ts
src/lib/teas-exams/types.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src\app\teas-exams\page.tsx src\components\teas-exams\TeasExamsBrowser.tsx src\lib\teas-exams\public-teas-exams.ts src\lib\teas-exams\types.ts
```

Notes:

- `npm run lint` was attempted and still reports unrelated pre-existing lint issues in admin TEAS tooling files.
- A logged-out HTTP request to `/teas-exams` returned `200`.
- The local staging collection returned no visible rows during verification, so browser-level search matching could not be confirmed against live staged question text in this run.

## Follow-up: Public TEAS Exams Data Source Fix

Fixed the empty TEAS Exams page source.

Changed:

- the page initially read only `teasDocStagedQuestions`, but that collection currently has no rows
- the public loader now reads populated `teasScannedQuestions` rows with `status = scanned_ready`
- `teasDocStagedQuestions` remains included for future DOCX final-staged rows
- the loader now loads one selected set at a time instead of trying to load thousands of questions across all sets
- Set buttons reload `/teas-exams?set=N`, keeping search local to the loaded set

Verification:

```text
teasDocStagedQuestions staged_final count: 0
teasScannedQuestions scanned_ready rows checked: 2100
eligible public scanned rows before preview: 2092
Set 1: 164
Set 2: 205
Set 3: 202
Set 4: 0
Set 5: 0
Set 6: 173
Set 7: 180
Set 8: 80
Set 9: 4
Set 10: 167
Set 11: 83
Set 12: 166
Set 13: 167
Set 14: 175
Set 15: 170
Set 16: 164
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src\app\teas-exams\page.tsx src\components\teas-exams\TeasExamsBrowser.tsx src\lib\teas-exams\public-teas-exams.ts src\lib\teas-exams\types.ts
```

## Follow-up: Public TEAS Exams Subject Browsing

Simplified the public TEAS Exams browser to subject-only navigation.

Changed:

- removed the set selector from `/teas-exams`
- questions are now browsed by subject only
- question cards still show `Set N - Question N` for context
- search navigation now scrolls to the owning question card for the active match
- visible answer choices now highlight the correct answer in green
- search still highlights matching text locally in the visible question content

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src\app\teas-exams\page.tsx src\components\teas-exams\TeasExamsBrowser.tsx src\lib\teas-exams\public-teas-exams.ts src\lib\teas-exams\types.ts
```

## Follow-up: Public TEAS Exams Subject Filter Simplification

Removed the `All` subject filter from `/teas-exams`.

Changed:

- subject filters now show only `Reading`, `Mathematics`, `Science`, and `English`
- default selected subject is now `Reading`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src\app\teas-exams\page.tsx src\components\teas-exams\TeasExamsBrowser.tsx src\lib\teas-exams\public-teas-exams.ts src\lib\teas-exams\types.ts
```

## Follow-up: Static Public TEAS Exams Preview

Converted `/teas-exams` to use a static preview JSON file instead of querying Firestore on every public page request.

Changed:

- added `scripts/generate-teas-exams-preview.mjs`
- added `npm run teas:exams:generate-preview`
- generated `public/data/teas-exams-preview.json`
- static JSON is built from `teasScannedQuestions` only
- skipped `teasDocStagedQuestions` because it is currently empty
- static JSON applies the ATI TEAS preview percentage before writing public data
- `/teas-exams` now loads `/data/teas-exams-preview.json` in the browser
- removed the server-side Firestore dependency from `/teas-exams`
- removed the unused public TEAS Firestore loader so the public page only uses static JSON
- simplified the mobile sticky header by removing the title block and leaving only search, match controls, subject filters, and count

Generated output:

```text
public/data/teas-exams-preview.json
questionCount: 438
source: teasScannedQuestions
previewPercentage: 20
```

Validation run:

```text
npm run teas:exams:generate-preview
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src\app\teas-exams\page.tsx src\components\teas-exams\TeasExamsBrowser.tsx src\lib\teas-exams\types.ts scripts\generate-teas-exams-preview.mjs
```

## Follow-up: Public TEAS Exams Full Static Question Set

Updated `/teas-exams` static data generation to include all TEAS scanned questions for this specific public page.

Changed:

- removed the `needsReview != true` exclusion from the static generator
- removed the 20% preview limit from the static generator
- regenerated `public/data/teas-exams-preview.json`
- static file now marks `previewPercentage: 100`
- static file now marks `includesNeedsReview: true`

Generated output:

```text
public/data/teas-exams-preview.json
questionCount: 2092
```

Validation run:

```text
npm run teas:exams:generate-preview
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src\app\teas-exams\page.tsx src\components\teas-exams\TeasExamsBrowser.tsx src\lib\teas-exams\types.ts scripts\generate-teas-exams-preview.mjs
```

## Follow-up: TEAS DOCX Import Selection And LLM Repair

Expanded the TEAS DOCX import tool so Word-based TEAS sets can be selected, parsed, reviewed, and paired with LLM repair output before a later save/import step.

Affected page:

```text
/admin/teas-doc-import
```

Changed:

- added a DOCX file listing endpoint that scans the configured TEAS document root, defaults to `C:\Users\wilso\OneDrive\Desktop\Teas Guru`, and returns selectable `.docx` files
- kept the DOCX path editable, but the page now also provides a document dropdown so admins do not need to paste paths manually
- added an LLM repair provider selector with `Gemini and ChatGPT`, `Gemini only`, and `ChatGPT only`
- added a repair endpoint that sends one parsed DOCX question at a time to Gemini, OpenAI, or both and returns structured repair JSON for review
- added per-row `Repair` actions and a bulk `Repair Missing with LLM` action for rows flagged as missing prompt or having too few choices
- repair output is displayed beside the source parse and is not automatically saved to Firestore, so admins can compare and review before the import step
- the repair prompt asks the provider to preserve passage, question, choices, answer text, TEAS format, confidence, and notes without inventing unsupported content

Affected files:

```text
src/app/admin/teas-doc-import/page.tsx
src/app/api/admin/teas-doc-import/files/route.ts
src/app/api/admin/teas-doc-import/repair/route.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Fill-In Scan Review Status

Adjusted TEAS image import so Type 7 fill-in-the-blank / answer-entry questions are not marked as `Needs Review` only because they do not have multiple-choice answers.

Changed:

- structured OCR parsing now stores Type 7 records with `ati_format: "fill_in_blank"` instead of falling back to `multiple_choice`
- Type 7 parsing no longer adds review warnings for missing four choices, missing selected answer markers, low-confidence selected answer markers, or prompt text without a question mark
- saved scan validation counts are now stored per question instead of copying whole-batch errors onto every saved row
- existing Type 7 saved scans with a question, correct answer, no source image requirement, and only old multiple-choice warnings were cleaned to `scanned_ready`

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Admin Tools Navigation Group

Grouped the operational admin utilities under a single `Tools` dropdown in the admin sidebar.

Changed:

- moved `Question Type Scan`, `TEAS Image Import`, `TEAS Saved Scans`, and `Image Sources` out of the top-level admin list
- added a `Tools` expandable menu that auto-opens when any of those routes is active
- kept the general admin links, content menu, and collapsed-sidebar behavior unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Ordered Response Review Status

Adjusted saved-scan review cleanup so ordered response questions are not marked `Needs Review` only because the OCR extractor could not identify a selected answer marker.

Changed:

- Type 6 ordered response records now ignore selected-marker warnings such as `Selected answer is not visually clear` and `No single answer is explicitly selected` when saving review metadata
- cleaned Set 7 Question 26 of 38 and Question 14 of 38 after confirming each had 4-6 options, a complete ordered `correctAnswer`, no validation errors, and no source image requirement

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Status Recalculation

Updated the saved-scan edit API so corrected records are promoted out of `Needs Review` automatically when the actual blockers have been resolved.

Changed:

- manual edit saves now recalculate the final scan status from corrected fields instead of trusting the old status value sent by the edit page
- scans are saved as `scanned_ready` when there is question text, no validation errors, and no remaining source-image requirement
- structured table exhibits with saved rows/headers no longer count as source-image-required only because their original OCR exhibit had `requiresCrop: true`
- cleaned existing manually corrected records that still showed `Needs Review`; Set 7 now has no remaining `Needs Review` or `Source Image Required` rows

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scans Set Visibility

Fixed the saved scans page so all current TEAS sets are available in the set selector.

Changed:

- increased the saved scans list request from 500 to 2500 records
- increased the scanned-question API list cap from 500 to 2500 records
- confirmed the page can now load all 1127 current staged scans, including Set 9

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Set Replacement on Save

Changed the TEAS scanned-question staging save behavior so importing a set again replaces the prior staged copy instead of creating duplicate rows.

Changed:

- deleted the older duplicate Set 6 staging job and kept the latest 176-record import
- Set 6 now has one saved staging job instead of three copies of the same source images
- the save endpoint now removes existing staged scans with the same set slug/name before writing the newly saved import batch
- the save response includes `replacedCount` so the UI/API caller can see how many older staged records were overwritten

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Set 1 Image Detection

Fixed Set 1 folder image detection for source files named with the `Del-images-N.jpg` pattern.

Changed:

- `pageNumberFromImageName` now recognizes filenames like `ATI TEAS Version 7 - Update 1 - Del-images-0.jpg`
- the `Del-images-N` pattern is treated as zero-based, so `Del-images-0.jpg` maps to page 1
- verified `C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 1\ati-logo-removed` detects all 338 images, with page range 1-338

Validation run:

```text
npx vitest run src/lib/admin/__tests__/google-gemini-teas-image-extract.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scans Load Optimization

Optimized `/admin/teas-image-import/scans` so it does not load every saved scanned question into the browser on initial page load.

Changed:

- added a `summaryOnly=true` API mode that returns compact set summaries for the selector
- added set-specific API filtering with `setSlug` / `setName`
- the scans page now loads only summaries first, then loads records for the selected set
- refresh actions were split into `Refresh Set` and `Refresh Sets`
- the table now renders only the selected set, which keeps page refreshes fast as more TEAS sets are staged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS DOCX Import Tool

Added a Word-document import review tool for TEAS sets that are stored as `.docx` files instead of screenshot folders.

Changed:

- added `TEAS Docs Import` under the admin sidebar `Tools` dropdown
- added `/admin/teas-doc-import` with a DOCX path field, parse action, provider status, and extracted-question review table
- added `/api/admin/teas-doc-import/parse` for admin-only DOCX parsing
- added `src/lib/admin/teas-docx-import.ts` to read DOCX package contents without adding a new dependency
- the parser extracts paragraphs, subject headers, embedded media count, stimulus/question markers, prompt candidates, choices, and bold answer candidates
- the page confirms both Gemini and ChatGPT/OpenAI availability for future missing-question repair
- Set 4 DOCX currently parses 968 paragraphs, 1 embedded media item, 4 subject headers, 116 question-like items, 79 bold-answer candidates, and 35 items needing LLM prompt repair

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Actions

Updated saved TEAS scan actions to preserve the review list while opening individual records.

Affected page:

```text
/admin/teas-image-import/scans
```

Changed:

- View opens in a new browser tab
- Edit opens in a new browser tab
- added `rel="noopener noreferrer"` to both links

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Manual Exhibit Image Upload

Added manual image attachment for TEAS saved scan review/edit pages.

Affected areas:

```text
/admin/teas-image-import/scans/[scanId]/edit
/api/admin/teas-image-import/exhibit-image
/api/admin/teas-image-import/scanned-questions
public/teas-exhibits/{setSlug}/
```

Changed:

- added an admin-only upload endpoint for TEAS exhibit images
- uploaded images are saved under `public/teas-exhibits/{setSlug}/`
- the edit page can upload an image for an existing exhibit and store the returned public URL in `exhibit.imagePath`
- the edit page can add a new image exhibit when the scan needs an image but no exhibit was detected
- uploaded images are inserted into the question HTML at the matching exhibit placeholder or exhibit block when possible
- uploaded images now immediately persist the updated exhibit metadata and question HTML so the saved scans list drops the source-image flag as soon as all required visuals have image URLs
- saved manual edits also persist updated exhibit metadata and update visual review flags
- manual saves/uploads now clear stale batch-level validation errors from the edited scan record, so unrelated validation errors do not keep a resolved record in `Needs Review`
- added admin preview styling so inserted exhibit images stay within the content area

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Scan Visual HTML Editing

Added visual editing for staged TEAS scan passage and question HTML.

Affected page:

```text
/admin/teas-image-import/scans/[scanId]/edit
```

Changed:

- replaced the default raw-only passage and question fields with a Visual/Raw HTML toggle
- Visual mode uses the existing admin rich text editor and writes back to the same HTML fields
- Raw HTML mode remains available for exact table markup, exhibit placeholders, and image tags
- disabled the generic editor image button on this page so TEAS images continue through the exhibit upload workflow and are saved under `public/teas-exhibits/{setSlug}/`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Edit Preview Toggle

Simplified the TEAS scan edit page by hiding rendered preview output by default.

Affected page:

```text
/admin/teas-image-import/scans/[scanId]/edit
```

Changed:

- rendered preview is hidden on initial page load
- added a `Show Preview` / `Hide Preview` button
- preview still renders both passage and question when opened

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Row Delete

Added per-record deletion for saved TEAS scan staging records.

Affected areas:

```text
/admin/teas-image-import/scans
/api/admin/teas-image-import/scanned-questions
```

Changed:

- added a Delete action to each saved scan row
- Delete opens the shared destructive confirmation dialog before removing the record
- extended the staging DELETE API to support deleting a single scan with `?id={scanId}`
- kept the existing Clear staging DB action for bulk deletion
- single-row deletion only affects the `teasScannedQuestions` staging collection and does not touch production quiz questions

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Preview Inline Exhibit Images

Adjusted the TEAS import preview to prefer uploaded inline exhibit images over the original source screenshot.

Affected page:

```text
/admin/teas-image-import/preview
```

Changed:

- preview no longer shows the original source screenshot when the question HTML already contains a saved inline image
- preview now loads saved staged scan records and prefers their edited question HTML/exhibit image paths when the source filename matches
- saved exhibit image paths render as actual images in TEAS display HTML
- `Image required` notices are removed when an exhibit has an `imagePath`
- original source screenshots still appear when a visual is required and no uploaded/saved image is present

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-question-display.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Folder Browser Image Detection

Fixed TEAS local folder scanning for logo-removed image names that use the `1_no-ati-logo.jpg` pattern.

Affected areas:

```text
/admin/teas-image-import
/api/admin/teas-image-import/folders
/api/admin/teas-image-import/ocr
```

Changed:

- updated TEAS image page detection to support numeric filenames with suffixes, including `99_no-ati-logo.jpg` and `176-no-ati-logo.png`
- kept existing support for `page-0001.jpg` and plain `1.jpg`
- verified `C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 9\ati-logo-removed` now detects 170 image pages, ending at `170_no-ati-logo.jpg`

Validation run:

```text
npx vitest run src/lib/admin/__tests__/google-gemini-teas-image-extract.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scans Per Set View

Grouped saved TEAS scanned questions by set on the staging review page.

Affected page:

```text
/admin/teas-image-import/scans
```

Changed:

- added a Set selector with an `All sets grouped` option
- grouped the saved scan table into per-set sections using saved `setName`, `setSlug`, and `setNumber`
- added per-set counts for total questions, review records, visual records, and issue counts
- increased the saved scans fetch limit to 500 records so multiple imported sets can be reviewed together
- kept the existing review/visual/clean filters and sort controls

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Structured Table Alignment

Normalized TEAS structured OCR table data so table headers and body rows share the same column model before preview/import rendering.

Affected areas:

```text
/admin/teas-image-import/preview
/admin/teas-image-import/scans
scripts/normalize-teas-structured-tables.mjs
```

Changed:

- added a structured-output table normalizer that rewrites the latest `teas-ocr-structured-*.json` file with aligned table headers and padded rows
- normalized Set 6 table exhibits into `teas-ocr-structured-1784729787440.json`
- inserted blank leading header cells when extracted table rows contain a row-label column, such as the eye-color table with `Green`, `Blue`, and `Brown`
- promoted table-wide captions from page header lines into the table exhibit title so labels such as `Blood Alcohol Concentration (percent)` render above the table instead of inside the column header row
- removed duplicated caption-style table headers when the same title was repeated as the only visible table header
- updated table HTML rendering to use normalized rows as well as normalized headers
- added display-time repair for already-saved table HTML where the header row has one fewer cell than the body rows, preserving existing saved scans while inserting a visible blank row-label header
- kept generated tables sized to content instead of forcing full-width tables

Validation run:

```text
node scripts/normalize-teas-structured-tables.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6"
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Follow-up validation:

```text
node scripts/normalize-teas-structured-tables.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6"
npx vitest run src/lib/admin/__tests__/teas-question-display.test.ts src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OCR Failed Page Review Records

Changed the TEAS structured OCR parser so every scanned image page remains represented in the staged output.

Changed:

- failed Gemini/no-text pages no longer get dropped during bulk-upload payload generation
- pages with no detected prompt now become manual-review placeholder questions
- placeholder records keep the source file name, scan layout, warnings, subject metadata, and `sourceImageRequired: true`
- generated question counts now match the scanned page count, while failed pages stay visible for manual correction

Affected files:

```text
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Saved Scan Source Image Links

Updated the saved TEAS scans table so reviewers can inspect the exact source screenshot behind each staged question.

Changed:

- the Source column now shows the full local source image path from the saved input folder and file name
- the Source column also shows the OCR output folder when it is recorded
- added an authenticated `Open image` action that opens the source screenshot in a new browser tab through the existing source-image API
- scans without recorded folder/file metadata continue to show that no source path is recorded

Affected file:

```text
src/app/admin/teas-image-import/scans/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Extraction Order

Updated the saved TEAS scans list to keep questions in the order they were extracted.

Changed:

- the scans page now defaults to `Extraction order` instead of issue sorting
- the scanned-questions API supports `sort=extractionOrder`
- extraction sorting uses saved source folder, OCR job, `scanOrder`, question number, and source file as fallbacks
- each row now displays the saved extraction number when available

Affected files:

```text
src/app/admin/teas-image-import/scans/page.tsx
src/app/api/admin/teas-image-import/scanned-questions/route.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Set Number

Added explicit TEAS set number tracking for saved scanned questions.

Changed:

- new saved scan records now store `set.number`, top-level `setNumber`, and `source.setNumber`
- the set number is derived from folder names such as `TEAS Version 7 - Set 6`
- the saved scans table now shows a `Set X` badge in the Set column
- older records without `setNumber` can still display the set number by reading it from the saved set name or source folder path

Affected files:

```text
src/app/admin/teas-image-import/scans/page.tsx
src/app/api/admin/teas-image-import/scanned-questions/route.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Staging DB Cleanup

Added an admin-only cleanup action for restarting TEAS image imports.

Changed:

- added `DELETE /api/admin/teas-image-import/scanned-questions`
- the delete route clears only the `teasScannedQuestions` staging collection in batches
- added a `Clear staging DB` button on `/admin/teas-image-import/scans`
- the button opens a destructive confirmation dialog before deleting records
- after cleanup, the scans table and summary counts reset to zero
- added `scripts/clean-teas-scanned-questions.js` with dry-run/apply modes for terminal cleanup
- ran the cleanup against `teasScannedQuestions`: 172 records deleted, 0 remaining

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/page.tsx
scripts/clean-teas-scanned-questions.js
package.json
```

Validation run:

```text
npm run teas:scans:clean:dry-run
npm run teas:scans:clean:apply
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Gemini Failed Image Fallback

Added a stronger Gemini retry path for images that fail during the cheap first-pass extraction.

Changed:

- normal TEAS image extraction still uses `GEMINI_TEAS_IMAGE_MODELS`, defaulting to `gemini-3.5-flash-lite`
- failed/no-text images are retried with `GEMINI_TEAS_FAILED_IMAGE_MODELS`, defaulting to `gemini-3.5-flash`
- OCR logs now show when a page is retried with the failed-image model
- successful fallback records use `layoutMode: google_gemini_image_failed_retry`
- failed images also get a final relaxed JSON retry without the Gemini response schema
- scan review metadata now stores the Gemini extraction model used for the page
- targeted Set 6 retry was tested for pages 9, 10, 16, 23, 40, and 165; all six still returned no text after `gemini-3.5-flash-lite`, `gemini-3.5-flash`, and relaxed JSON `gemini-3.5-flash`

Configuration:

```text
GEMINI_TEAS_IMAGE_MODELS=gemini-3.5-flash-lite
GEMINI_TEAS_FAILED_IMAGE_MODELS=gemini-3.5-flash
```

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
scripts/retry-teas-failed-images.mjs
.env.example
```

Validation run:

```text
node scripts/retry-teas-failed-images.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6" --pages 9,10,16,23,40,165
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OpenAI Failed Image Fallback

Added an optional OpenAI vision fallback for TEAS screenshots that Gemini cannot extract.

Changed:

- Gemini remains the first-pass extractor
- Gemini failed-image retries are no longer enabled by default
- if `OPENAI_API_KEY` is configured, failed pages are retried with `OPENAI_TEAS_FAILED_IMAGE_MODELS`
- successful OpenAI fallback records use `layoutMode: openai_failed_image_retry`
- the fallback uses the same TEAS JSON shape as the Gemini extractor so preview/save parsing remains unchanged
- added a merge helper so recovered single-page retry files can be merged back into one complete structured OCR file
- Set 6 retry recovered pages 9, 10, 16, 23, 40, and 165 with OpenAI after Gemini returned no text
- merged Set 6 output now has 176 pages and 0 failed pages

Configuration:

```text
OPENAI_API_KEY=
OPENAI_TEAS_FAILED_IMAGE_MODELS=gpt-4o
GEMINI_TEAS_FAILED_IMAGE_MODELS=
```

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
.env.example
scripts/retry-teas-failed-images.mjs
scripts/merge-teas-retry-output.mjs
```

Validation run:

```text
node scripts/retry-teas-failed-images.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6" --pages 9,10,16,23,40,165
node scripts/merge-teas-retry-output.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OpenAI Visual/Table Regeneration

Added an OpenAI-only retry mode for pages with visual exhibits or tables.

Changed:

- `scripts/retry-teas-failed-images.mjs` now supports `--provider openai-only`
- `scripts/retry-teas-failed-images.mjs` now supports `--delay-seconds` for API rate limits
- OpenAI prompt now requires table exhibits to use structured `headers` and `rows`, not CSV text in `textLines`
- table rendering pads blank row-label headers so regenerated tables align correctly
- structured table exhibits with rows no longer force source screenshot display
- `scripts/merge-teas-retry-output.mjs` now supports `--replace-pages` to intentionally replace visual/table pages in the full OCR output
- Set 6 pages 29, 38, 45, 49, 83, 84, 85, and 138 were regenerated with OpenAI and merged into a new complete 176-page output

Latest merged output:

```text
C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6\ati-logo-removed\teas-ocr-output\teas-ocr-structured-1784728706495.json
```

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
scripts/retry-teas-failed-images.mjs
scripts/merge-teas-retry-output.mjs
scripts/audit-teas-structured-output.mjs
```

Validation run:

```text
node scripts/retry-teas-failed-images.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6" --pages 38,45,83,84,85,138 --provider openai-only --delay-seconds 22
node scripts/merge-teas-retry-output.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6" --replace-pages 29,38,45,49,83,84,85,138
node scripts/audit-teas-structured-output.mjs --folder "C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 6"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Exhibit Duplicate/Screenshot Cleanup

Tightened generated exhibit rendering to prevent old visual metadata from showing unnecessary screenshots or duplicate table content.

Changed:

- text-only exhibits no longer force source screenshot display
- structured table exhibits render the table from `headers`/`rows` and suppress duplicate table-like `textLines`
- table exhibits with CSV/pipe-delimited `textLines` are normalized into `headers` and `rows` during parsing
- all parsed tables are normalized to a consistent column count before rendering
- row-label tables now get a blank leading header so headers align with the correct columns
- short table rows are padded with blank cells so every row stays aligned with the headers
- generated TEAS exhibit tables now size to their content instead of stretching full width
- verified latest Set 6 Question 30 source record has no exhibit metadata after OpenAI regeneration
- corrected the Set 6 visual merge helper to use the newest single-page retry per page
- regenerated latest Set 6 merged output so Question 39 now stores Federal Land as structured table rows

Affected file:

```text
src/lib/admin/teas-structured-ocr-parser.ts
scripts/merge-teas-retry-output.mjs
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OCR Preview Review Metadata

Updated the TEAS image import preview so PaddleOCR parser quality is visible per generated question.

Affected pages and APIs:

```text
/admin/teas-image-import
/admin/teas-image-import/preview
/api/admin/teas-image-import/scanned-questions
```

Changed:

- confirmed the structured OCR path uses `scripts/teas-ocr-structured.py`, which imports and runs PaddleOCR
- added per-question `scanReview` metadata with parser warnings, source file name, layout mode, choice count, prompt line count, selected answer, and answer marker confidence
- preview cards now show `Needs Review` when OCR/parser confidence is questionable instead of making every generated card look clean
- preview cards now show the OCR layout mode and selected answer confidence ratio when available
- saved scanned-question documents now persist `scanReview` alongside `scanLayout`

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OCR Math Passage Cleanup

Adjusted TEAS structured OCR conversion so full-width Math questions are not duplicated as passage text.

Changed:

- Math OCR pages no longer use `regionText.left_context` as a passage because Math screenshots often split one question across the left and right layout regions
- duplicate prompt/answer fragments from the left region are suppressed before generating bulk-upload-compatible question HTML
- OCR text spacing now normalizes common joins such as `pizza.One` and `sentence,which`
- added a regression test using the pizza-sharing Math example

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OCR Google Vision Provider

Switched the TEAS image import OCR job away from the local PaddleOCR Python exporter.

Affected files:

```text
src/app/api/admin/teas-image-import/ocr/route.ts
src/lib/admin/google-vision-structured-ocr.ts
src/app/admin/teas-image-import/page.tsx
.env.example
package.json
package-lock.json
```

Changed:

- `/api/admin/teas-image-import/ocr` now runs Google Vision `DOCUMENT_TEXT_DETECTION` from the Next.js server route instead of spawning the PaddleOCR Python script
- OCR output still writes `teas-ocr-structured-<timestamp>.json` into the selected folder's `teas-ocr-output` folder so the existing Load Latest Structured flow keeps working
- added `GOOGLE_VISION_CREDENTIALS` as the preferred server-side Google Vision service-account JSON credential path
- kept `GOOGLE_APPLICATION_CREDENTIALS` as a supported fallback, but `GOOGLE_VISION_CREDENTIALS` avoids conflicts with Firebase Admin credentials
- kept `GOOGLE_CLOUD_VISION_API_KEY` / `GOOGLE_VISION_API_KEY` as optional fallback keys
- added structured output field `ocrProvider: "google_vision"`
- kept local selected-answer marker scoring by reading the screenshot pixels around answer rows with `sharp`
- selected answer metadata still populates `selectedAnswer`, `markerScores`, `selectedAnswerScore`, `secondAnswerScore`, and `selectedAnswerConfidenceRatio` when the filled answer marker is confidently detected
- admin UI copy now describes the OCR job as Google Vision instead of PaddleOCR

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Google Vision Split-Column Recovery

Improved Google Vision structured OCR conversion for screenshots where answer choices are split across the left and right visual regions.

Changed:

- Google Vision exporter now tries merged full-content lines before falling back to the right question column
- split lines on the same visual row are merged before prompt/choice grouping
- structured OCR parser can recover better prompt and answer choices from saved Google Vision JSON, even when the original `questionColumn` grouped only the right side
- added a regression test for the `46.jpg` graph question pattern where each answer choice was split into a left half and right half

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Google Vision Numeric Choice Recovery

Improved Math question recovery for Google Vision pages where calculator/formula text appears near the prompt and the OCR output misses the question mark boundary.

Changed:

- structured parser now detects numeric answer choices such as percentages, fractions, decimals, and comma-formatted values as fallback answer boundaries
- short calculator keypad artifacts such as `7`, `8 9`, `4 5`, `1 2`, and `0` are ignored when recovering choices
- Google Vision exporter applies the same numeric-choice filtering before grouping choices and scoring selected-answer markers
- Google Vision exporter now accepts recovered choice groups when a prompt has question wording but no OCR-detected question mark, allowing selected-answer marker scoring to run on pages such as `50.jpg`
- Math calculator screens now prefer left-region recovery when four numeric choices are detected so right-side calculator/formula artifacts are not prepended to the prompt
- missing question marks are no longer treated as parser warnings when a non-ordered-response question has a complete four-choice structure
- generated question HTML now preserves OCR prompt lines as separate paragraphs instead of collapsing every prompt into one paragraph
- added a regression test for the `50.jpg` Math percentage-choice pattern

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Google LLM Normalization

Added a Google Gemini normalization step after Google Vision OCR for cases where coordinate rules still arrange prompts or answer choices incorrectly.

Affected files:

```text
src/app/api/admin/teas-image-import/llm-normalize/route.ts
src/app/admin/teas-image-import/page.tsx
.env.example
```

Changed:

- added `/api/admin/teas-image-import/llm-normalize`
- the route requires admin authentication and `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`
- the route calls Google Gemini structured output through the Google Generative Language API
- Google Gemini receives compact OCR text, OCR lines, region text, and selected-answer marker metadata
- Gemini returns NursingMocks bulk-upload-compatible question JSON with `questionHtml`, options, type, answer, and warnings
- admin UI now includes `Normalize With Google LLM` beside the deterministic structured OCR converter
- OpenAI is not required for this workflow

Environment:

```text
GEMINI_API_KEY=
GEMINI_TEAS_MODEL=gemini-3.5-flash-lite
GEMINI_TEAS_CHUNK_SIZE=5
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Gemini-Only Image Extraction

Simplified the active TEAS image import workflow so Google Gemini is the only extraction engine.

Affected files:

```text
src/app/api/admin/teas-image-import/ocr/route.ts
src/lib/admin/google-gemini-teas-image-extract.ts
src/app/admin/teas-image-import/page.tsx
src/lib/admin/teas-structured-ocr-parser.ts
.env.example
package.json
package-lock.json
```

Changed:

- removed the active Google Vision OCR path from the TEAS import job
- removed the separate `/api/admin/teas-image-import/llm-normalize` route because Gemini now handles image reading and structuring in the main OCR job
- removed direct `@google-cloud/vision` and `sharp` dependencies from `package.json`
- `Start OCR` now sends each screenshot directly to Google Gemini image understanding
- OCR job output now logs an immediate Gemini start line and a per-page processing line before the Gemini API call so the admin UI does not remain blank while a page is being analyzed
- each Gemini page extraction has a timeout guard controlled by `GEMINI_TEAS_PAGE_TIMEOUT_MS`, defaulting to 45 seconds
- Gemini image extraction logs the model being attempted and uses `GEMINI_TEAS_IMAGE_MODELS`, defaulting to `gemini-3.5-flash-lite`
- image folder selection now keeps only one image per page number and prefers `_no-ati-logo` variants when both the original and cleaned image exist
- Gemini `RESOURCE_EXHAUSTED` / 429 quota errors now stop the job immediately with a billing/quota message instead of trying unavailable models
- OCR jobs now have a server-side stall watchdog controlled by `GEMINI_TEAS_JOB_STALL_TIMEOUT_MS`, defaulting to 90 seconds, so admin polling cannot remain stuck forever when a background Gemini request stops making progress
- Gemini extraction now always writes `teas-ocr-structured-<timestamp>.json` after a run starts, even when some pages fail; failed pages are recorded in `failedPages` and as page-level warning records
- when quota is exhausted mid-run, remaining pages are recorded as skipped instead of losing the already processed pages
- Gemini returns subject, prompt lines, passage lines, choice lines, question type, selected answer, and warnings in structured JSON
- the output still writes `teas-ocr-structured-<timestamp>.json` so the existing Load Latest, Convert, Preview, and Save flow remains intact
- admin UI copy now describes Gemini image extraction instead of Google Vision or coordinate-rule normalization

Environment:

```text
GEMINI_API_KEY=
GEMINI_TEAS_IMAGE_MODEL=gemini-3.5-flash-lite
GEMINI_TEAS_IMAGE_MODELS=gemini-3.5-flash-lite
GEMINI_TEAS_PAGE_TIMEOUT_MS=45000
GEMINI_TEAS_JOB_STALL_TIMEOUT_MS=90000
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Gemini Structured Exhibits

Expanded the Gemini-only TEAS image extraction path so visual exhibits are no longer limited to plain passage text.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/globals.css
```

Changed:

- Gemini structured output now includes an `exhibits` array for visible tables, charts, diagrams, images, or text exhibits
- table exhibits preserve headers and rows when Gemini can identify them from the screenshot
- chart/image exhibits preserve visible labels/data as `description` and `textLines` without inventing missing values
- the structured OCR parser renders table exhibits into the generated question HTML before the prompt
- generated scanned questions keep the original exhibit data in `scanLayout.questionColumn.exhibits` and expose `exhibitCount` in `scanReview`
- admin preview styling now makes generated TEAS exhibit tables readable and horizontally scrollable when needed

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Gemini Layout Fidelity

Improved the Gemini-only TEAS image import workflow so generated structured output keeps more of the source screenshot structure.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/globals.css
```

Changed:

- OCR job output in `/admin/teas-image-import` now auto-scrolls as new log lines are appended
- Gemini is instructed to normalize subjects to the four ATI TEAS subjects:
  - Reading
  - Mathematics
  - Science
  - English and Language Usage
- Gemini structured output now includes `headerLines`, `promptHtmlLines`, and `passageHtmlLines`
- headers such as passage titles, table titles, exhibit titles, and section headings are preserved in generated question HTML
- prompt and passage formatting can preserve safe inline tags for bold, italics, superscript, subscript, and line breaks
- explicit Gemini passage text is preserved even for Mathematics questions, while old coordinate-derived Math fragments are still suppressed
- inline images, diagrams, charts, maps, and figures are detected as `image` or `chart` exhibits and surfaced in preview as visual-exhibit-required blocks
- generated scanned questions now include `imageExhibitCount` in `scanReview`

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Question Numbers And Source Table View

Improved TEAS image import preview fidelity for numbered questions and table-based screenshots.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/admin/teas-image-import/preview/page.tsx
src/app/api/admin/teas-image-import/source-image/route.ts
```

Changed:

- Gemini structured output now includes `questionNumber` when a visible question number is present
- generated question HTML preserves the visible question number before headers, subject, passage, exhibits, and prompt text
- scan review metadata now stores `questionNumber` and `sourceImageRequired`
- table, chart, and image exhibits mark the question as requiring source-image review
- the TEAS preview page displays the source screenshot image for table/chart/image exhibit questions so admins can compare the parsed output against the original visual view
- added an admin-authenticated source image API restricted to the configured TEAS source root and selected source folder

Assumption:

- Exact table-region cropping is not implemented yet; preview preserves the original full screenshot view for tables/charts/images instead of reconstructing the table as the only source of truth.

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Preview HTML Entity Cleanup

Fixed preview text where already-encoded characters could appear literally, such as `&#39;`.

Affected files:

```text
src/lib/admin/teas-question-display.ts
src/app/admin/teas-image-import/preview/page.tsx
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
```

Changed:

- preview question HTML now normalizes common text entities before rendering
- TEAS option display normalizes common apostrophe, quote, and non-breaking-space entities
- structured OCR parsing decodes common entities before escaping text into generated HTML, preventing `&amp;#39;` double-escape output
- added a regression test for already-encoded apostrophes in prompts and answer choices

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Preview Visual Exhibit Labels

Added clearer preview labels for questions with images, charts, tables, or other exhibits.

Affected files:

```text
src/app/admin/teas-image-import/preview/page.tsx
```

Changed:

- preview cards still show a badge for real inline `<img>` references found in question/options/solution HTML
- preview cards now also show `visual exhibit` when Gemini detected image/chart exhibits
- preview cards now show `Source Image Required` when the original screenshot should be reviewed for visual fidelity
- preview cards now show `table/text exhibit` when Gemini detected non-image exhibits such as tables or text exhibits
- preview summary stats now include `Inline Images` for actual `<img>` tags and `Visual Exhibits` for Gemini-detected charts, diagrams, or image exhibits

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Review Page

Added a saved-scan review surface for TEAS image import staging records.

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/page.tsx
src/components/layout/AdminSidebar.tsx
Documentation/admin/Admin content management.md
```

Saved Firestore collection:

```text
teasScannedQuestions
```

Important fields saved:

- generated question HTML, options, correct answer, explanation, question type ID, and ATI format
- original generated ID, tabs, match options, image path, units, and subquestions when present
- raw `scanLayout` and `scanReview` from the Gemini extraction/parser path
- derived review fields for sorting:
  - `needsReview`
  - `issueCount`
  - `warningCount`
  - `validationWarningCount`
  - `questionNumber`
  - `sourceFileName`
  - `sourceImageRequired`
  - `exhibitCount`
  - `imageExhibitCount`
- source traceability:
  - input folder
  - output folder
  - OCR mode
  - OCR job ID
  - saved admin UID
  - scan order
- lifecycle fields:
  - `sourceType: ati_teas_ocr`
  - `status: scanned_review`
  - `createdAt`
  - `updatedAt`
  - version

Changed:

- the scanned-question API now supports `GET` to list saved staging records
- list filters:
  - all scans
  - needs review
  - visual source required
  - clean only
- list sorting:
  - most issues first
  - newest first
  - question number
- added `/admin/teas-image-import/scans`
- added a `TEAS Saved Scans` admin sidebar link
- the saved-scans page shows summary stats, a dense table, review flags, source file, and a detail panel for the selected record

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Save Flagged Scans

Changed TEAS image import saving so flagged scans can be staged for manual review.

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/page.tsx
src/app/admin/teas-image-import/scans/page.tsx
```

Changed:

- `Save Scanned` no longer requires the generated payload to pass full bulk-upload validation
- flagged scans with warnings or validation errors can be saved to `teasScannedQuestions`
- records with validation errors are saved with:
  - `validationErrorCount`
  - `saveValidationErrors`
  - `saveValidationWarnings`
- save still requires at least one question with question text
- records with validation errors or scan-review warnings stay in review status instead of ready status
- the saved-scans page shows a red `Validation Error` badge when staged records have validation errors

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Firestore Save Sanitization

Fixed Firestore save failures caused by invalid nested entities in staged scan metadata.

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
```

Changed:

- added recursive Firestore-safe serialization before writing staged scanned questions
- sanitizes nested values in:
  - `options`
  - `correctAnswer`
  - `tabs`
  - `matchOption`
  - `subquestions`
  - `scanLayout`
  - `scanReview`
  - `source`
  - validation errors and warnings
- converts `undefined` and invalid numeric values to `null`
- converts arrays nested directly inside arrays into objects with a `values` field because Firestore rejects direct array-of-arrays, which can occur in table exhibit rows
- keeps flagged scans saveable while preserving review metadata

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan Manual Editing

Added manual correction support for saved TEAS scanned-question staging records.

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/page.tsx
```

Changed:

- added `PATCH /api/admin/teas-image-import/scanned-questions`
- admins can edit a saved scan from `/admin/teas-image-import/scans`
- editable fields:
  - question HTML
  - correct answer
  - review status
  - manual review notes
- manual saves mark the record with:
  - `manuallyEdited`
  - `manuallyEditedByUid`
  - `manuallyEditedAt`
  - updated `updatedAt`
- setting status to `scanned_ready` clears `needsReview`; `scanned_review` keeps it in the manual review queue

Follow-up adjustments:

- replaced the side detail/edit panel with independent row actions
- `View` opens a read-only modal for the selected scan
- `Edit` opens a separate correction modal for question HTML, correct answer, status, and review notes
- the saved scans table remains full-width while modals handle focused review/correction
- replaced the view/edit modals with dedicated pages:
  - `/admin/teas-image-import/scans/[scanId]`
  - `/admin/teas-image-import/scans/[scanId]/edit`
- the saved-scans list now uses links so each record can be opened in its own page/tab
- the scanned-question API can load a single saved scan with `GET ?id=...`
- the edit page now shows the question as rendered markup first, with raw HTML available in an expandable `Edit HTML Source` section
- the edit page hides issue/record metadata panels and only shows editable question details for focused cleanup; issue details remain on the view page

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Modular Question Parts

Separated TEAS scan metadata from the question body so saved records can be rebuilt later from structured parts instead of relying on one large HTML blob.

Affected files:

```text
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
```

Changed:

- parser removes TEAS chrome metadata from generated `question` HTML
- parser stores metadata in `scanReview`:
  - `questionNumber`
  - `questionProgress`
  - `examTitle`
  - `subject`
- saved Firestore records now include `questionParts`
- `questionParts.metadata` stores question number, question progress, exam title, and subject separately
- `questionParts.bodyHtml` stores only the question body markup
- `questionParts.passageHtml` stores passage markup separately when a question has a passage; it is intentionally blank for questions without a passage
- `questionParts.questionHtml` stores the actual question/prompt markup separately from the passage
- `questionParts` also stores extracted header lines, passage lines, prompt lines, prompt HTML lines, passage HTML lines, and exhibits when available
- top-level fields mirror important metadata for filtering/sorting:
  - `questionNumber`
  - `questionProgress`
  - `examTitle`
  - `subject`
- manual edit saves update the modular metadata fields, optional passage HTML, question HTML, and combined body HTML
- the edit page shows separate fields for passage, question, question number, question progress, exam title, and subject instead of forcing those values into one question HTML blob

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Saved Scan HTML Export

Added a local utility to export saved TEAS scan records into a standalone desktop HTML file for visual inspection.

Affected files:

```text
scripts/export-teas-scans-html.mjs
Documentation/admin/Admin content management.md
```

Changed:

- added `scripts/export-teas-scans-html.mjs`
- the exporter reads `teasScannedQuestions` with Firebase Admin credentials from `.env.local`
- generated output shows:
  - modular metadata fields
  - review fields
  - separate rendered passage and question fields
  - rendered combined question body markup
  - options
  - modular `questionParts`
  - raw `questionParts` JSON
- generated desktop file:

```text
C:\Users\wilso\OneDrive\Desktop\sampletext.html
```

Validation/output:

```text
node scripts/export-teas-scans-html.mjs "C:\Users\wilso\OneDrive\Desktop\sampletext.html"
Wrote 172 records to C:\Users\wilso\OneDrive\Desktop\sampletext.html
```

## Follow-up: TEAS Saved Scan Edit Rebuild

Rebuilt the saved TEAS scan edit page so staged questions can be corrected through focused fields instead of one difficult raw HTML editor.

Affected files:

```text
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
src/app/api/admin/teas-image-import/scanned-questions/route.ts
Documentation/admin/Admin content management.md
```

Changed:

- replaced the edit route layout with a simpler admin form
- edit mode now separates:
  - optional passage HTML
  - question HTML
  - rendered preview
  - answer choices
  - question number
  - question progress
  - exam title
  - subject
  - ATI TEAS question type
  - correct answer
  - status
  - manual review notes
- answer choices can now be added, removed, and edited without manually editing JSON
- saved scan PATCH updates now persist `options`, `questionTypeId`, and `atiFormat` in addition to passage, question, answer, metadata, and status
- the ready-check panel highlights missing core fields before marking a record ready
- view mode remains read-only and renders passage, question, choices, and record metadata separately
- single-record loads now return saved-scan navigation metadata ordered by question number/source file
- the saved scan view and edit headers show the current position and a `Next Question` link when another saved scan exists

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS Gemini Inline Image Detection

Expanded the Gemini TEAS extraction contract so visual elements can be detected as inline exhibits before the actual crop/upload workflow is added.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
Documentation/admin/Admin content management.md
```

Changed:

- Gemini is now instructed to mark inline images, diagrams, charts, maps, graphs, and figures as structured exhibits
- each exhibit can now include:
  - `id`
  - `placement`
  - `inline`
  - `requiresCrop`
  - `alt`
  - `imagePath`
- supported exhibit placements are:
  - `before_passage`
  - `inside_passage`
  - `between_passage_and_question`
  - `inside_question`
  - `after_question`
  - `inside_choice`
  - `after_choices`
  - `unknown`
- Gemini may place a controlled inline placeholder in passage/question HTML:

```html
<figure data-exhibit-id="exhibit_1"></figure>
```

- parser sanitization now preserves only that controlled figure placeholder in addition to the existing allowed inline formatting tags
- parser review metadata now records `inlineExhibitCount` and `cropRequiredCount`
- saved Firestore records mirror those counts for later filtering/review
- saved scan view/edit pages now show detected visual exhibits with inline/crop-needed badges, placement, alt text, and image path status

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Passage And Question Field Split

Made passage detection and storage explicit so passage content is not mixed into the actual question prompt.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/page.tsx
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
scripts/export-teas-scans-html.mjs
Documentation/admin/Admin content management.md
```

Changed:

- Gemini prompt now explicitly separates passage content from the direct question prompt
- passage fields must stay empty when the question has no separate passage
- saved scan records now store direct top-level fields:
  - `passageHtml`
  - `questionHtml`
  - `passageText`
  - `questionText`
  - `hasPassage`
- `questionParts.passageHtml` and `questionParts.questionHtml` remain the structured source fields
- manual edit saves update both the top-level fields and the nested `questionParts` fields
- saved scans list and edit/view pages load the direct fields as fallback for newer records
- sample HTML export now displays `Has Passage` and uses the direct passage/question fields when available

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Metadata-Only Header Cleanup

Prevented TEAS exam title and subject labels from being stored inside rendered passage/question HTML.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
Documentation/admin/Admin content management.md
```

Changed:

- Gemini prompt now explicitly forbids placing exam title and subject labels inside prompt or passage lines
- parser removes metadata-only lines from prompt and passage HTML/text lines, including:
  - `ATI TEAS Version 7 - Reading`
  - `Subject: Reading`
  - `Question 12 of 37`
- save route strips those metadata-only paragraphs from `passageHtml`, `questionHtml`, and combined `question`/`bodyHtml`
- exam title and subject remain stored in metadata fields only
- added a regression test for the Reading title/subject case

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Passage And Question Titles

Added explicit title fields for passage and question content so visible headings can be stored separately from the body HTML.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
scripts/export-teas-scans-html.mjs
Documentation/admin/Admin content management.md
```

Changed:

- Gemini now returns `passageTitle` and `questionTitle` when visible in the source screenshot
- passage titles are not repeated inside `passageLines` or `passageHtmlLines`
- question titles are not repeated inside `promptLines` or `promptHtmlLines`
- saved scan records now store top-level `passageTitle` and `questionTitle`
- structured scan parts also retain `questionParts.passageTitle` and `questionParts.questionTitle`
- manual edit page now includes separate Passage Title and Question Title inputs
- rendered edit/view previews display those titles as section labels
- export HTML now shows Passage Title and Question Title in metadata and field headers
- metadata-only values such as `ATI TEAS Version 7 - Reading`, `Subject: Reading`, and `Question 12 of 37` are rejected as content titles

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Saved Scan V2 Structure

Simplified saved TEAS scan documents around grouped content objects instead of duplicated top-level and `questionParts` HTML fields.

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/page.tsx
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
scripts/export-teas-scans-html.mjs
Documentation/admin/Admin content management.md
```

Changed:

- new saves use document `version: "2.0"`
- passage content is stored as `passage: { title, html, text }` or `passage: null`
- question content is stored as `question: { title, html, text }`
- `questionContent` mirrors the same question object during the staging transition so the UI can distinguish v2 content from old string-based `question` records
- `combinedHtml` stores passage + question HTML for compatibility with older rendering/import flows
- exhibits are stored at top-level `exhibits`
- raw scan/debug data now lives under `debug.scanLayout` and `debug.scanReview`
- `questionParts` is reduced to structured extraction lines only:
  - `headerLines`
  - `passageLines`
  - `passageHtmlLines`
  - `promptLines`
  - `promptHtmlLines`
- saved scans list, view, edit, and export still read legacy fields as fallbacks for older records

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Set Metadata For Imports

Added set metadata to saved TEAS scan records so reviewed questions can later be imported into the correct set and subject.

Affected files:

```text
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/page.tsx
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
scripts/export-teas-scans-html.mjs
Documentation/admin/Admin content management.md
```

Changed:

- new saved scans derive set metadata from the selected input folder unless an explicit set name/slug is supplied
- saved documents now include:

```json
{
  "set": {
    "name": "TEAS Version 7 - Set 6",
    "slug": "teas-version-7-set-6",
    "subject": "Reading"
  },
  "setName": "TEAS Version 7 - Set 6",
  "setSlug": "teas-version-7-set-6",
  "subject": "Reading"
}
```

- `setName` is readable for admins
- `setSlug` is stable for future import queries
- import workflows should target records by `setSlug` and `subject`
- saved scan edit page now includes editable Set Name and Set Slug fields
- edited slugs are normalized to the same slug format used for auto-generated set slugs
- saved scan list now shows set name/slug
- export HTML now includes set name/slug

Assumption:

- local input folders are organized per set, for example `TEAS Version 7 - Set 6`; subject remains a separate field because each set is imported per subject.

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS OCR Logo-Removed Folder Routing And Inline Titles

Adjusted the TEAS importer to use logo-removed images by default and simplified title storage.

Affected files:

```text
src/lib/admin/teas-ocr-paths.ts
src/app/api/admin/teas-image-import/folders/route.ts
src/app/api/admin/teas-image-import/ocr/route.ts
src/app/admin/teas-image-import/page.tsx
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/scans/[scanId]/ScanRecordPageClient.tsx
scripts/export-teas-scans-html.mjs
Documentation/admin/Admin content management.md
```

Changed:

- selecting a set folder now routes OCR to its `ati-logo-removed` subfolder when present
- example selected scan folder:

```text
C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 16\ati-logo-removed
```

- OCR job state now reports the actual `inputPath` used for scanning
- folder browser image counts are based on the routed scan folder and use the same page-number detection as OCR
- folder counts now include `jpg`, `jpeg`, `png`, and `webp`, including names such as `page-0001_no-ati-logo.jpg`
- when a folder with images is loaded, the admin page auto-selects its scan folder and sets Start Page / End Page to the first and last detected image page
- folder cards now show total image count plus first/last page range
- set metadata still derives from the parent set folder when the scan path is `ati-logo-removed`
- passage/question titles are no longer separate v2 fields
- visible passage or question titles should be inline inside the corresponding HTML:

```json
{
  "passage": {
    "html": "<p><strong>Passage Title</strong></p><p>Passage body...</p>",
    "text": "Passage Title Passage body..."
  },
  "question": {
    "html": "<p><strong>Question Heading</strong></p><p>Question body...</p>",
    "text": "Question Heading Question body..."
  }
}
```

- Gemini is now instructed to keep visible titles inline in `passageHtmlLines` or `promptHtmlLines`
- parser still supports older `passageTitle` / `questionTitle` structured outputs by inlining them into generated HTML
- saved scan edit page no longer shows separate Passage Title or Question Title inputs
- export HTML no longer displays separate title metadata fields

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Follow-up: TEAS Table Classification And Placement

Improved table handling in Gemini extraction and structured OCR parsing.

Affected files:

```text
src/lib/admin/google-gemini-teas-image-extract.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
Documentation/admin/Admin content management.md
```

Changed:

- Gemini prompt now requires visible grids/rows/columns to be classified as `type: "table"` instead of `image`, `chart`, or `text`
- Gemini is instructed to preserve table header order, row order, column order, and blank visible cells
- table exhibits are additional context; Gemini must still extract surrounding passage, prompt, and answer-choice text
- inline table exhibits can use the same placeholder pattern as images:

```html
<figure data-exhibit-id="exhibit_1"></figure>
```

- parser replaces exhibit placeholders with the rendered table/image exhibit at that exact HTML location
- parser avoids rendering the same exhibit twice after replacing a placeholder
- exhibits without placeholders are placed by their `placement` field:
  - `before_passage`
  - `inside_passage`
  - `between_passage_and_question`
  - `inside_question`
  - `after_question`
  - `after_choices`
  - `unknown`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

## Planned: ATI TEAS Image-to-JSON Import Pathway

Goal:

Create a controlled workflow that can take ATI TEAS question screenshots, extract the question content, identify the question type, convert the result into a compatible JSON format, and preview it before saving.

Recommended approach:

1. Define bulk-upload-compatible JSON schemas before building OCR.
2. Classify the question type from visual/text clues.
3. Extract screenshot content into the selected schema.
4. Validate the generated JSON.
5. Preview the generated question in the existing admin question renderer.
6. Require review/correction before saving or bulk import.

Confirmed ATI TEAS Version 7 formats:

```text
1. Multiple Choice
2. Multiple Select / Select All That Apply
3. Fill-in-the-Blank / Supply Answer
4. Hot Spot
5. Ordered Response
```

Official ATI sources checked:

```text
https://www.atitesting.com/teas/exam-details
https://help.atitesting.com/what-type-of-questions-are-on-the-ati-teas-version-7/
```

Internal renderer mapping:

```text
ATI Multiple Choice              -> NursingMocks Type 1
ATI Multiple Select              -> NursingMocks Type 2
ATI Fill-in-the-Blank            -> NursingMocks Type 7 for numeric answers; create/extend supply-answer schema for text answers
ATI Hot Spot                     -> NursingMocks Type 9 hot spot renderer
ATI Ordered Response             -> NursingMocks Type 6
```

Out of scope for the ATI TEAS image importer unless a source set proves otherwise:

```text
True/False
Bow Tie / Matrix clinical judgment
Highlight
Dropdown / Cloze
Drag and Drop groups beyond ordered response
Case Study matrix
```

Bulk upload contract:

The ATI TEAS image importer must generate JSON that conforms to the existing Nursing Entrance Exam bulk upload tool, not a separate import format.

Target route family:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
```

Top-level JSON shape:

```json
{
  "questions": []
}
```

Each generated question should use the same fields accepted by the bulk upload parser:

```text
id
question
options
correctAnswer
solution
question_type_id
tabs
match_option
image_path
units
subquestions
```

Bulk upload save behavior to preserve:

```text
question              -> saved as question
options               -> parsed from object/string into saved options array
correctAnswer         -> saved as correctAnswer
solution/explanation  -> saved as explanation
question_type_id      -> saved as questionTypeId
tabs                  -> saved as tabs
match_option          -> saved as matchOption
image_path            -> saved as imagePath
units                 -> saved as units
subquestions          -> saved as subquestions
```

Question type-specific bulk upload shapes:

```text
Type 1 Multiple Choice
- question_type_id: 1
- options: object with A-D choices
- correctAnswer: one option label, such as "A"

Type 2 Multiple Select
- question_type_id: 2
- options: object with A-D or more choices
- correctAnswer: JSON array string or array of labels, such as ["A","C"]

Type 7 Fill-in-the-Blank / Supply Answer
- question_type_id: 7
- options: can be omitted or empty
- correctAnswer: value or array; bulk upload wraps Type 7 answers into an array
- units: optional, for numeric answers

Type 9 Hot Spot
- question_type_id: 9
- image_path: required
- correctAnswer: coordinate/range object or compatible serialized coordinate answer
- options: optional, only if clickable areas are represented as labels

Type 6 Ordered Response
- question_type_id: 6
- options: object with ordered-response choices
- correctAnswer: ordered label list, such as ["C","A","B","D"]
```

Classifier clues:

```text
Four radio-style answer choices               -> Multiple Choice / Type 1
Checkboxes or "select all that apply" wording -> Multiple Select / Type 2
Blank input with no answer options            -> Fill-in-the-Blank / Type 7 or supply-answer text schema
Image or diagram with clickable areas         -> Hot Spot / Type 9
Left option bank plus right ordered box       -> Ordered Response / Type 6
```

OCR/extraction pipeline:

```text
1. Upload or select screenshot image.
2. Run OCR.
3. Detect layout regions: prompt, exhibits, options, answer table, explanation, units, and image references.
4. Classify the question type.
5. Map extracted content into the matching ATI TEAS bulk-upload-compatible JSON schema.
6. Validate required fields for that type.
7. Render the generated question through the admin preview.
8. Allow manual correction.
9. Save only after review.
```

Recommended first admin tool:

```text
/admin/teas-image-import
```

Initial tool behavior:

- upload one ATI TEAS screenshot
- display screenshot on one side
- display OCR text and generated JSON on the other side
- show detected ATI TEAS format, internal renderer type, and confidence score
- render a live preview using the existing question-type renderer
- export or copy the final result as `{ "questions": [...] }` for the current bulk upload tool
- allow manual edits before save

First milestone:

Build the single-image workflow for the five confirmed ATI TEAS formats before bulk processing. The first version should output a valid `{ "questions": [...] }` object that can be pasted into the current bulk upload page. Bulk import should only be added after the single-image OCR, classification, JSON validation, and preview loop is reliable.

## Follow-up: ATI TEAS Bulk Upload Schema Validator

Added the first implementation piece for the ATI TEAS image-to-JSON pathway.

Affected files:

```text
src/lib/admin/teas-bulk-upload-schema.ts
src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

Changed:

- added ATI TEAS format mapping to the existing NursingMocks bulk upload question types
- added builders for bulk-upload-compatible TEAS questions and `{ questions: [...] }` payloads
- added validation for the five confirmed ATI TEAS formats:
  - Multiple Choice -> Type 1
  - Multiple Select -> Type 2
  - Fill-in-the-Blank / Supply Answer -> Type 7
  - Hot Spot -> Type 9
  - Ordered Response -> Type 6
- added per-type rules for option counts, required answers, hot spot image/coordinate data, and ordered-response answer order
- kept this module independent of React and Firebase so it can be reused by the future `/admin/teas-image-import` page, API routes, or tests

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: ATI TEAS Image Import Admin Page

Added the first admin UI for the ATI TEAS image-to-JSON pathway.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/components/layout/AdminSidebar.tsx
src/lib/admin/teas-bulk-upload-schema.ts
```

Changed:

- added `/admin/teas-image-import` using the shared admin sidebar, breadcrumb top bar, full-width admin workspace, cards, status badges, alerts, and tables
- added a `TEAS Image Import` link to the admin sidebar so the tool can be opened from the admin UI
- added a manual JSON review surface that validates `{ "questions": [...] }` payloads against the existing Nursing Entrance Exam bulk upload contract
- added a copy action for the normalized JSON payload once OCR-generated or manually pasted data is ready
- added stats for question count, blocking errors, warnings, and readiness
- added a structural question preview showing detected internal question type labels, options, and correct answer data
- kept this first page intentionally review-only; screenshot upload, OCR extraction, automatic question-type detection, and direct save/import remain the next workflow steps

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Inline Image References

Documented and surfaced inline image support for TEAS-generated bulk upload JSON.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/lib/admin/teas-bulk-upload-schema.ts
src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
```

Changed:

- added inline `<img>` source extraction from `question`, `options`, and `solution`
- added validation warnings when inline images still use temporary `data:` or `blob:` URLs instead of saved public asset paths
- updated `/admin/teas-image-import` to count inline images and list the JSON path/source for each embedded image
- updated the TEAS import preview so option HTML is rendered, matching the existing bulk upload and public quiz renderers
- clarified the import rule: inline images should remain inside the rich HTML field where they appear, while `image_path` remains reserved for full question artwork/hotspot images

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Screenshot Intake

Added the first screenshot intake step to the TEAS image import admin workflow.

Affected file:

```text
src/app/admin/teas-image-import/page.tsx
```

Changed:

- added a `TEAS Screenshot` panel above the JSON editor
- added one-image file selection for local screenshot review
- added screenshot preview, file name, file type, and file size display
- added a clear action for the selected screenshot
- added object URL cleanup so local preview URLs are revoked when the selection changes or the page unmounts
- added a screenshot status metric beside question, error, warning, and inline image counts
- kept this as a local review/intake step only; OCR extraction and asset upload are still separate next steps

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS PaddleOCR Folder Job

Borrowed the working OCR approach from:

```text
C:\Users\wilso\OneDrive\Desktop\Sets\ati-logo-removal-tool
```

Reference pieces used:

```text
convert-questions-to-text.py
.venv\Scripts\python.exe
server.js background job/polling pattern
PROJECT_NOTES.md PaddleOCR version guidance
```

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/app/api/admin/teas-image-import/ocr/route.ts
```

Changed:

- added a node runtime admin API at `/api/admin/teas-image-import/ocr`
- protected the OCR route with the same admin authorization header pattern used by other admin APIs
- starts the existing PaddleOCR converter as a background job using:
  - `C:\Users\wilso\OneDrive\Desktop\Sets\ati-logo-removal-tool\.venv\Scripts\python.exe`
  - `C:\Users\wilso\OneDrive\Desktop\Sets\ati-logo-removal-tool\convert-questions-to-text.py`
- supports input folder, output folder, start page, and end page
- tracks job status, exit code, stdout, stderr, completed page count, total page count, and output folder
- added a `Folder OCR` panel to `/admin/teas-image-import`
- added job polling and a live output log in the admin UI
- kept the first OCR milestone text-based: the converter writes `.txt`; structured JSON conversion and question-type classification remain the next step
- left environment overrides available through `TEAS_OCR_TOOL_ROOT`, `TEAS_OCR_PYTHON`, and `TEAS_OCR_CONVERTER`

Assumptions:

- PaddleOCR should continue using the known working Windows CPU stack from the reference tool:
  - `paddleocr==2.7.3`
  - `paddlepaddle==2.6.2`
  - `numpy==1.26.4`
  - `opencv-python==4.6.0.66`
- the first reliable flow is folder/page-range OCR to text, then parsing that text into bulk-upload JSON after review

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS OCR Text To JSON Parser

Added the first parser that converts PaddleOCR text output into bulk-upload-compatible TEAS JSON.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/lib/admin/teas-ocr-text-parser.ts
src/lib/admin/__tests__/teas-ocr-text-parser.test.ts
```

Changed:

- added `parseTeasOcrTextToBulkUploadPayload`
- supports the current PaddleOCR converter text shape:
  - optional `Subject`
  - optional `Passage`
  - `Question`
  - `Multiple Choices`
  - `Answer`
- outputs NursingMocks Type 1 / ATI Multiple Choice questions in `{ "questions": [...] }` format
- preserves passage and subject inside the question HTML so bulk upload and public quiz rendering can display the context
- added warnings when a parsed OCR block is missing question text, choices, or answer data
- added an `OCR Text to JSON` panel to `/admin/teas-image-import`
- the admin can paste converter `.txt` output and fill the existing JSON validator with one click

Smoke test:

```text
C:\Users\wilso\OneDrive\Desktop\Sets\ati-logo-removal-tool\.venv\Scripts\python.exe
C:\Users\wilso\OneDrive\Desktop\Sets\ati-logo-removal-tool\convert-questions-to-text.py
--input C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7
--output-dir C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7\question-text
--start 1
--end 2
```

Result:

```text
0001 converted 15 lines
0002 converted 15 lines
Text output: C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7\question-text\questions-text-1784647916932.txt
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-ocr-text-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Structured OCR Export

Added a structured PaddleOCR export path so the importer is no longer limited to plain OCR text.

Affected files:

```text
scripts/teas-ocr-structured.py
src/app/api/admin/teas-image-import/ocr/route.ts
src/app/admin/teas-image-import/page.tsx
```

Changed:

- added `scripts/teas-ocr-structured.py`
- the script runs with the same working PaddleOCR virtual environment used by the ATI logo removal tool
- structured output is saved as `teas-ocr-structured-<timestamp>.json`
- each output file includes:
  - source folder
  - page count
  - per-page image filename
  - image width and height
  - subject guess
  - raw OCR rows with bounding boxes and confidence scores
  - visual line groups
  - line region labels: `header`, `left_context`, `question_column`, `footer`
  - UI-text flags
  - full `contentText`
  - region-separated `regionText`
- updated the admin OCR API so jobs can run in either `text` or `structured` mode
- updated `/admin/teas-image-import` with an `OCR Output Mode` selector
- defaulted the admin OCR panel to structured JSON with coordinates because that is the better base for layout detection, cropping, and question-type classification
- added region-first line grouping so passage text and right-column question/answer text do not merge when they share the same vertical position

Smoke test:

```text
.\scripts\teas-ocr-structured.py
--input C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7
--output-dir C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7\question-text
--start 1
--end 1
```

Result:

```text
0001 structured 30 rows
Structured output: C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7\question-text\teas-ocr-structured-1784648170889.json
```

Observed page 1 summary:

```text
fileName: 1.jpg
width: 1280
height: 720
rowCount: 30
lineCount: 28
subject: Reading
regions: header:1, left_context:15, question_column:9, footer:3
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Structured OCR To JSON Parser

Added the first structured OCR parser for coordinate-aware TEAS imports.

Affected files:

```text
scripts/teas-ocr-structured.py
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/admin/teas-image-import/page.tsx
```

Changed:

- structured OCR export now includes `questionColumn`
- `questionColumn` contains:
  - `promptLines`
  - `choiceLines`
  - `selectedAnswer`
  - `markerScores`
- selected answer detection reuses the marker-scoring approach from the earlier PaddleOCR text converter
- added `parseTeasStructuredOcrToBulkUploadPayload`
- parser converts structured OCR pages into NursingMocks Type 1 / ATI Multiple Choice JSON
- left-context `regionText` becomes passage HTML inside the question
- subject guess is preserved in the question HTML
- question-column prompt and choices become the prompt/options
- selected-answer marker becomes `correctAnswer`
- added a `Structured OCR JSON to JSON` panel to `/admin/teas-image-import`
- admins can paste `teas-ocr-structured-*.json` output and fill the existing bulk upload JSON editor

Smoke test:

```text
.\scripts\teas-ocr-structured.py
--input C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7
--output-dir C:\Users\wilso\OneDrive\Desktop\Sets\TEAS Version 7 - Set 7\question-text
--start 1
--end 1
```

Observed `questionColumn`:

```text
promptLines:
- Which of the following is irrelevant information when writing a summary
- of the passage?

choiceLines:
- Students wore buttons that read 3/2
- Students protested for just a week.
- All the demands of the DPN protest were met.
- The board of trustees selected the only hearing candidate.

selectedAnswer: A
markerScores: 1030, 192, 189, 222
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-ocr-text-parser.test.ts src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Structured OCR Range Tuning

Ran structured OCR across a wider Set 7 page range and tuned the exporter for the observed layout.

Affected files:

```text
scripts/teas-ocr-structured.py
src/app/api/admin/teas-image-import/ocr-output/route.ts
src/app/admin/teas-image-import/page.tsx
```

Changed:

- ran structured OCR for Set 7 pages 1-10
- added grouped choice detection so wrapped answer choices are combined before parser conversion
- preserved four choices for all tested pages after grouping
- adjusted selected-answer confidence from `1.25x` to `1.18x` over the second-highest marker score
- page 9 now detects selected answer `D` where the old threshold was too strict
- kept low-confidence/continuation-style questions reviewable rather than inventing missing prompt text
- added `/api/admin/teas-image-import/ocr-output`
- the new output endpoint loads the latest generated OCR file from the configured output folder
- supports latest structured JSON files matching `teas-ocr-structured-*.json`
- supports latest text files matching `questions-text-*.txt`
- added `Load Latest Structured` and `Load Latest Text` buttons to `/admin/teas-image-import`
- admins can now run OCR, load the latest output file, and convert it without opening the folder manually

Observed Set 7 pages 1-10 after tuning:

```text
pages tested: 10
choice grouping: 4 choices on all 10 pages
answers detected:
1:A, 2:B, 3:A, 4:C, 5:A, 6:B, 7:D, 8:A, 9:D, 10:C
known review cases:
- page 5 prompt starts mid-question because the first part is not visible or OCR did not capture it
- page 7 appears to be a continuation/visual-feature style question and should be reviewed before import
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-ocr-text-parser.test.ts src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Structured OCR Review Risk Flags

Added explicit review-risk metadata and parser warnings for structured OCR imports.

Affected files:

```text
scripts/teas-ocr-structured.py
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
```

Changed:

- structured OCR `questionColumn` now includes:
  - `selectedAnswerScore`
  - `secondAnswerScore`
  - `selectedAnswerConfidenceRatio`
- structured parser now warns when:
  - the prompt has no question mark
  - the prompt starts with a lowercase letter, which usually means it starts mid-sentence
  - selected answer marker confidence is below `1.25x` over the runner-up marker
- generated JSON is still produced for reviewable questions; the warnings tell the admin which page needs manual inspection
- this keeps the workflow review-first instead of guessing missing prompt text or silently accepting weak answer markers

Latest Set 7 pages 1-10 confidence summary:

```text
1:A ratio 4.64
2:B ratio 2.474
3:A ratio 3.549
4:C ratio 1.685
5:A ratio 1.374, prompt starts mid-sentence
6:B ratio 1.465
7:D ratio 3.442, prompt has no question mark
8:A ratio 1.843
9:D ratio 1.223, low-confidence marker warning
10:C ratio 2.599
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Scanned Question Storage And Simplified UI

Simplified the TEAS image import workflow around local folders and added separate Firestore storage for scanned questions.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/app/api/admin/teas-image-import/scanned-questions/route.ts
```

Changed:

- removed the manual screenshot intake panel from the main workflow
- removed the plain OCR text conversion panel from the main workflow
- kept the workflow focused on local folder scanning:
  - set input folder
  - set output folder
  - set page range
  - run structured PaddleOCR
  - load latest structured output
  - convert structured OCR to scanned-question JSON
  - review validation and preview
  - save scanned questions
- added `Save Scanned` action to `/admin/teas-image-import`
- added admin API route `/api/admin/teas-image-import/scanned-questions`
- scanned questions are saved to a separate top-level Firestore collection:

```text
teasScannedQuestions
```

Storage behavior:

- scanned imports do not write to live quiz question paths
- scanned imports do not write to the existing top-level `questions` collection
- each scanned question is stored as a separate document
- stored fields mirror the question shape used by current question records:
  - `question`
  - `options`
  - `correctAnswer`
  - `explanation`
  - `questionTypeId`
  - `tabs`
  - `matchOption`
  - `imagePath`
  - `units`
  - `subquestions`
- additional scan metadata is stored:
  - `atiFormat`
  - `source`
  - `sourceType: ati_teas_ocr`
  - `status: scanned_review`
  - `scanOrder`
  - `savedByUid`
  - `createdAt`
  - `updatedAt`
  - `version`

Validation rule:

- the save endpoint runs `validateTeasBulkUploadPayload`
- questions with blocking schema errors cannot be saved
- warning-level parser/schema issues remain reviewable and are returned to the admin

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Local Folder Picker

Replaced manual input-folder typing with a local folder picker and removed the output folder from the admin workflow.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/app/api/admin/teas-image-import/folders/route.ts
src/app/api/admin/teas-image-import/ocr/route.ts
src/app/api/admin/teas-image-import/ocr-output/route.ts
src/lib/admin/teas-ocr-paths.ts
```

Changed:

- added admin API route `/api/admin/teas-image-import/folders`
- folder browsing is restricted to the configured TEAS source root
- default TEAS source root:

```text
C:\Users\wilso\OneDrive\Desktop\Sets
```

- the admin page now shows a folder browser with:
  - current folder
  - parent navigation
  - subfolder list
  - image counts
  - detected min/max page numbers
  - `Open`
  - `Select`
  - `Use This Folder`
- selecting a folder sets the OCR input folder and auto-fills the page range from detected image page numbers
- removed the output folder field from the UI
- OCR output is now an internal intermediate folder derived from the selected input folder:

```text
<selected input folder>\teas-ocr-output
```

- `/api/admin/teas-image-import/ocr` now defaults to that internal output path when no output path is provided
- `/api/admin/teas-image-import/ocr-output` can load latest structured output by `inputPath`

Reason:

- Firestore `teasScannedQuestions` is the real destination
- the OCR output folder is only an implementation detail needed for the PaddleOCR structured JSON file
- admins should select the local source folder, not manage temporary OCR output paths

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Scan Layout Preservation

Added source layout metadata to scanned questions so the review workflow can preserve and compare the visual structure from the original image.

Affected files:

```text
src/lib/admin/teas-bulk-upload-schema.ts
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
src/app/api/admin/teas-image-import/scanned-questions/route.ts
src/app/admin/teas-image-import/page.tsx
```

Changed:

- structured OCR parser now attaches `scanLayout` to each generated question
- `scanLayout` includes:
  - page number
  - source file name
  - image width and height
  - subject guess
  - region text
  - question column summary
  - compact OCR lines with boxes, region labels, and UI-text flags
  - compact OCR rows with boxes and confidence scores
- save endpoint now persists `scanLayout` in each `teasScannedQuestions` document
- preview marks generated questions with `Layout Saved`
- preview shows source layout file and dimensions when present

Reason:

- text-only OCR loses the original question structure
- layout metadata lets the future scanned-question review page show the original structure, compare the reconstructed question against source boxes, and crop charts/tables/diagrams when needed
- this preserves enough source information without writing scanned questions into live quiz collections

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Preview Tab

Moved generated-question preview out of the import workspace and into a dedicated tab.

Affected files:

```text
src/app/admin/teas-image-import/page.tsx
src/app/admin/teas-image-import/preview/page.tsx
src/lib/admin/teas-question-display.ts
```

Changed:

- removed the bulky inline question preview list from `/admin/teas-image-import`
- added `Open Preview` action to the import page header
- added a smaller `Preview` card that opens the generated preview in a new browser tab
- preview data is passed through local storage under:

```text
teas-image-import-preview
```

- added `/admin/teas-image-import/preview`
- preview route renders the current generated questions grouped by question type
- preview route shows:
  - question count
  - question type count
  - layout metadata count
  - review flag count
  - source folder
  - parser warnings
  - schema warnings
  - question cards organized under each question type
  - layout metadata indicator for questions that include `scanLayout`
  - inline image indicators
- added shared display helpers for TEAS question type labels and option rendering

Reason:

- the import page should stay focused on local folder scan, conversion, validation, and saving
- the preview page can use the full admin workspace to show questions in a clean review layout grouped by supported TEAS/NursingMocks question types

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import/preview' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: ATI TEAS Adaptive Layout Detection

Removed the hard dependency on the right-side `question_column` layout after testing Set 7 pages 45-75.

Affected files:

```text
scripts/teas-ocr-structured.py
src/lib/admin/teas-structured-ocr-parser.ts
src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts
```

Changed:

- structured OCR now keeps the existing `question_column` path when it works
- added `adaptive_all_content` fallback when the question column is empty or produces too few choices
- adaptive mode scans all non-UI content lines from `left_context` and `question_column`
- adaptive mode finds prompt start from question/action words such as `which`, `what`, `calculate`, `identify`, `place`, `order`, `if`, and `based`
- adaptive mode uses visible marker scores to find where answer choices begin
- prompt/formula continuation lines stay with the prompt until the first visible answer marker
- added `layoutMode` to `questionColumn` so review can see whether a page used `question_column` or `adaptive_all_content`
- structured parser now classifies ordered-response prompts as Type 6 when prompts mention ordering, ascending, least-to-greatest, selected order, or moving options
- Type 6 generated answers use the detected choice order as the ordered response sequence
- Type 6 prompts are not warned merely because they lack a question mark

Pages 45-75 after adaptive OCR:

```text
parsed cleanly or with expected review only: 45-49, 51-64, 66, 68-72, 74-75
ordered response detected: 64, 75
remaining review pages: 50, 57, 65, 66, 67, 73, 74
```

Remaining warnings are now genuine review cases, mostly cropped/continuation prompts or OCR misses:

```text
50.jpg prompt starts mid-sentence and has only 3 choices
57.jpg prompt starts mid-sentence
65.jpg has only 3 choices and no reliable answer marker
66.jpg prompt starts mid-sentence
67.jpg has no detected choices or answer marker
73.jpg prompt starts mid-sentence and has only 2 choices
74.jpg prompt starts mid-sentence
```

Validation run:

```text
npx vitest run src/lib/admin/__tests__/teas-structured-ocr-parser.test.ts src/lib/admin/__tests__/teas-bulk-upload-schema.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import' -UseBasicParsing -TimeoutSec 30
Invoke-WebRequest -Uri 'http://localhost:3000/admin/teas-image-import/preview' -UseBasicParsing -TimeoutSec 30
```

## Follow-up: Question Type Scan Highlight Preview

Updated the Type 11 Highlight preview using the reference images from:

```text
C:\Users\wilso\OneDrive\Desktop\QuestionTypes\Type 11 - Highlight
```

Changed:

- added a common Type 11 highlight renderer for both no-exhibit and exhibit-based questions
- renders no-exhibit Type 11 questions as a full-width prompt, dotted separator, and inline yellow-highlight findings
- renders exhibit-based Type 11 questions as a split layout with clinical record tabs on the left and the highlight prompt/findings on the right
- keeps possible findings as inline highlighted text spans instead of boxed answer cards
- uses amber/orange for selected highlights, green/red/amber review states after checking, and no A/B/C labels in the answer surface
- after Check Answer, labels each reviewed finding as Correct, Wrong, or Missed and shows a compact color legend so users can identify errors quickly
- preserved Check Answer, Reset, Previous, and Next behavior
- changed Type 11 Highlight scanner support status from Needs Renderer to Public Supported

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type Scan Bow Tie Preview

Updated the Type 10 Bow Tie preview using the reference images from:

```text
C:\Users\wilso\OneDrive\Desktop\QuestionTypes\Type 10 - Bow Tie
```

Changed:

- revised Type 10 from the split client-record layout to a reference-style matrix table under the question
- preserved source exhibits as compact tabs above the question when the JSON includes tabs
- added the full-width dotted separator before the answer table
- changed Type 10 answer cells to large circular radio targets with selected inner dots
- removed visible A/B/C row labels from the answer table
- made the left table header adapt to the prompt, such as Potential Nursing Action, Potential Prescription, Adverse Reaction, Client Statement, or Finding
- preserved Check Answer, Reset, Previous, and Next behavior
- after reviewing the added Type 10 reference images, restored the common split-screen structure with clinical record/exhibit tabs on the left and the prompt plus matrix on the right
- kept the improved matrix styling inside the right panel so the renderer matches both the case-study Bow Tie screenshots and the simpler matrix-only screenshots
- split Type 10 question HTML around the `exhibits` marker so the left panel shows the case intro and the right panel shows the task prompt
- fixed Type 10 sample 81, where the source JSON has an empty `match_option` list despite an A/B/C answer map; the scanner now infers usable column headers from the solution text and falls back to neutral column names when labels cannot be inferred
- improved the Type 10 left table header for client-goal samples so rows display under `Client Data`
- changed Type 10 Bow Tie scanner support status from Needs Renderer to Public Supported

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type Scan Type 9 Label

Corrected the Type 9 question type label in the admin scanner.

Changed:

- renamed Type 9 from `Matrix` to `Hot Spot` in the admin question type scanner labels
- kept the existing Type 9 renderer behavior unchanged; Type 9 already uses the Hot Spot image/coordinate renderer
- left Type 14 as the matrix/case-study renderer

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type Scan Numeric Preview

Updated the Type 7 Numeric preview using the reference images from:

```text
C:\Users\wilso\OneDrive\Desktop\QuestionTypes\Type 7 - Numeric
```

Changed:

- added Type 7 to the paged render preview flow so admins can use Previous and Next across numeric samples
- fixed the scanner to return all Type 7 render samples so the Previous and Next controls are visible when multiple numeric questions exist
- exposed the source JSON `units` value on render samples
- redesigned the Type 7 answer area to use the reference-style dotted separator, rectangular numeric input, and unit suffix beside the input
- preserved Check Answer, Reset, metadata, and explanation behavior

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type Scan Ordered Response Reference Layout

Updated the Type 6 Ordered Response preview using the reference images from:

```text
C:\Users\wilso\OneDrive\Desktop\QuestionTypes\Type 6 - Ordered Response
```

Changed:

- revised Type 6 to use the reference-style two-panel layout with available steps on the left and the ordered response target on the right
- kept the dotted separator row full width and changed the right target to a larger dashed drop area
- removed numbered answer pills and remove buttons from placed responses
- allowed placed answers to be dragged back into the left panel
- preserved Check Answer, Reset, Previous, and Next behavior
- fixed answer-box reordering so placed Type 6 answers can be interchanged by dragging onto other placed answers without being appended by the parent drop zone
- changed Type 6 review feedback to show the actual answer text for the expected order instead of A/B/C source labels
- added a Type 6 parser fallback for incomplete ordered-response answer keys: when the stored answer list is shorter than the prompt requires, the scanner reads the ordered labels from the solution text
- fixed sample 18, question `49745`, where the source answer key has `A, F, E` but the solution lists the four-step order `A, F, D, E`
- changed Type 6 Ordered Response scanner support status from Needs Renderer to Public Supported

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type Scan True/False Preview

Updated the admin question type scanner preview for Type 3 True/False questions.

Affected page:

```text
/admin/question-type-scan?render=3
```

Changed:

- added Type 3 to the paged render preview flow so admins can use Previous and Next across all available True/False samples
- rendered True/False answers with the same plain radio-row structure used for Type 1 single choice, without A/B answer labels or boxed answer borders
- normalized answer checking so Type 1, Type 2, and Type 3 previews can match answer keys stored as labels, visible answer text, or option HTML
- kept the existing admin shell, JSON source metadata, Check Answer, Reset, and explanation behavior unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type 10 Bow Tie Preview

Updated the admin question-type scanner preview for Type 10 Bow Tie questions.

Affected page:

```text
/admin/question-type-scan?render=10
```

Changed:

- added Type 10 to renderable and paged question-type previews
- scanner now parses Type 10 row options, match columns, and per-row correct answer maps
- added a Bow Tie preview layout with client record exhibits, row-by-column selections, reset, and answer checking
- kept Type 10 samples data-driven from the Naxlex JSON files instead of hardcoding sample content

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type 13 Dropdown Cloze Preview

Updated the admin question-type scanner preview for Type 13 Dropdown / Cloze questions.

Affected page:

```text
/admin/question-type-scan?render=13
```

Changed:

- added Type 13 to renderable and paged question-type previews
- scanner now parses `dropdown-group-*` option groups and per-group answer keys from the Naxlex JSON
- added a Cloze preview layout with exhibit tabs, inline dropdown blanks, grouped option buttons, reset, and answer checking
- kept dropdown labels and choices data-driven from the source JSON

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type 12 Drag And Drop Preview

Added a Type 12 Drag And Drop preview to the admin question-type scanner.

Affected page:

```text
/admin/question-type-scan?render=12
```

Changed:

- added Type 12 to renderable and paged question-type previews
- scanner now parses Type 12 `subquestions` into grouped choice banks, target zones, and answer labels
- added admin-styled grouped drag/drop panels with exhibit tabs, clickable fallback placement, reset, and answer checking
- updated Type 12 to match the reference drag/drop workflow: top diagram slots for Actions, Potential Condition, and Parameters, with three choice columns below
- fixed Type 12 slot placement so dragging into Action 2 or Parameter 2 preserves that exact slot instead of collapsing selections into the first open slot
- added drag payload fallback handling, draggable placed answers, click-to-remove behavior, and connector lines between the diagram slots
- restyled Type 12 to follow the reference images more directly: teal action blocks, amber condition block, gray parameter blocks, dotted divider row, colored choice columns, and square drag-handle affordances
- hid internal A/B/C answer labels from Type 12 draggable choices and placed answers while preserving them for correctness checks
- fixed shared option parsing so nested choice objects render their text instead of `[object Object]`
- matched placed Type 12 answers to the same card shape/drag-handle styling as lower choices and allowed dragging placed answers back to the choice columns
- removed remaining rounded corners from Type 12 parameter/list cards, placed answer cards, and drag-handle boxes to match the reference blocks
- squared the Type 12 preview wrapper, type badge, status badges, and selected-count badge so sample-specific parameter lists do not inherit rounded admin pills
- forced Type 12 draggable answer buttons to `borderRadius: 0` because the shared admin CSS rounds generic gray-bordered buttons globally
- replaced visible Type 12 A/B/C feedback with expected answer text for incorrect groups and slots
- kept Type 12 choices and correct answers data-driven from the Naxlex JSON

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type 1 Single Choice Preview

Updated the admin question-type scanner preview for Type 1 Single Choice questions.

Affected page:

```text
/admin/question-type-scan?render=1
```

Changed:

- added Type 1 to paged render previews so admins can review samples with Previous/Next controls
- replaced the old immediate-answer list with an interactive single-choice radio layout
- matched the reference structure with prompt, dotted divider, vertical radio options, and admin Check/Reset controls
- removed visible A/B/C answer labels from the Type 1 option rows while preserving labels internally for checking
- removed boxed borders from Type 1 answer rows so choices render as plain radio options like the reference images

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type 2 Select All Preview

Updated the admin question-type scanner preview for Type 2 Select All That Apply questions.

Affected page:

```text
/admin/question-type-scan?render=2
```

Changed:

- added Type 2 to paged render previews so admins can review samples with Previous/Next controls
- split Type 2 away from the True/False renderer
- matched the reference structure with a dotted divider, plain vertical checkbox options, no boxed answer rows, and admin Check/Reset controls
- removed visible A/B/C labels from Type 2 option rows while preserving labels internally for answer checking
- standardized Type 2 checkbox feedback so unchecked options remain neutral and no amber/yellow missed-answer fragment appears in the answer list

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Question Type 13 Cloze Reference Redesign

Redesigned the Type 13 Dropdown / Cloze preview based on the reference images in:

```text
C:\Users\wilso\OneDrive\Desktop\QuestionTypes\Cloze
```

Changed:

- separated the source stem into intro text, the Cloze instruction, and the fill-in sentence
- moved the preview closer to the ATI-style layout with exhibit tabs on the left and the Cloze sentence on the right
- replaced native selects and option cards with underlined inline blanks, caret indicators, and a floating gray/white option menu inside the question sentence
- adjusted the inline blanks to use dashed admin-style dropdown triggers and standard admin action buttons while keeping the exhibit/question structure intact
- standardized Type 13 Cloze typography to admin UI text sizing and colors instead of custom large preview fonts
- added the full dotted divider line and arrow-shaped Previous / Continue controls
- kept answer checking tied to the source JSON answer key

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Zyte Image Generation

Simplified the `/admin/image-sources` workflow so admins can generate missing images with one primary action.

Changed:

- the page now centers on `Start From Root`, current-folder status, `Generate Current`, `Scan Only`, and compact progress/status output
- `Clean Start` clears root progress/log files, per-folder `unsaved-images.txt` reports, and the downloaded `public/naxlex-images` cache, then starts again from the Naxlex root
- image generation starts from `C:\Users\wilso\OneDrive\Desktop\Naxlex` by default instead of requiring admins to paste a folder path
- after `Clean Start`, folder processing begins at the first discovered folder under the Naxlex root and continues depth-first in natural folder order, matching the arranged folder tree instead of jumping around by full-path sorting
- image detection recursively walks every key/value in each parsed JSON file, including nested objects, arrays, HTML attributes, direct image strings, and `srcset` candidates
- `Generate Images` scans the selected folder and downloads missing images through Zyte with up to fifteen parallel requests
- the folder image table now has `Unfinished` and `Finished` tabs so admins can focus on remaining image work
- the `Folder Images` panel shows the computed local `Saving To` image cache folder for the currently scanned source folder
- admins can save remaining unsaved image references to `unsaved-images.txt` in the selected Naxlex source folder
- bulk generation writes `unsaved-images.txt` for every processed folder, including clean folders with no unsaved images
- bulk generation appends every processed folder to `image-source-scan-log.txt` at the configured Naxlex source root
- bulk generation also updates `image-source-progress.json` at the configured Naxlex source root, marking folders as `complete` when no unsaved images remain or `needs-review` when failures remain after retry
- `Skip already processed folders` is enabled by default so browser reloads resume at unprocessed folders instead of repeating clean folders or previously failed `needs-review` folders
- failed image downloads are retried one more time before they are left in the folder report
- image references under `study_guides` are ignored because those assets are not needed for this workflow
- the page can navigate `Previous Folder` and `Next Folder` across every nested folder under the Naxlex root that contains direct JSON files
- `Auto continue after saving each folder report` runs the current folder, records its report, advances to the next JSON folder, and keeps going even when images still fail after retry
- added authenticated `save-unsaved-report` and `folder-navigation` image source APIs
- the image table now shows only the key management fields: question, status, source file, source URL, and actions
- per-image generation remains available for retrying a single missing image
- the image download route requires `ZYTE_API_KEY` from `.env.local` or the process environment and also accepts `ZYTE_KEY` as an alias

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
- the dedicated image source page is no longer tied to the Type 9 preview and does not render image previews; it focuses on inspecting source mappings for every question type with an image
- validation run: `.\node_modules\.bin\tsc.cmd --noEmit`

Assumptions:

- this scanner is a local admin audit tool, not a production import path
- the Naxlex source export remains JSON files with a top-level `questions` array
- the scanner reports question-type structure only; it does not write Firestore data or change quiz records

### Empty States

Use `AdminEmptyState` for empty cards and `AdminTableEmptyState` inside tables.

Empty states should:

- explain what is missing in user-friendly admin language
- give the next useful action or context
- avoid raw implementation wording such as missing collection names
- stay visually consistent with admin cards and tables
- use title case for the empty-state title and sentence style for helper text

### Detail Panels

Use `AdminDetailPanel` for contextual guidance, relationship notes, and compact edit/detail explanations below or beside management surfaces.

Detail panels should:

- explain how the current records relate to other admin-managed records
- stay compact and scannable
- avoid tiny gray inline notes that are easy to miss
- use `actions` only for directly related next steps
- not replace validation, destructive warnings, or persistent documentation pages

Applied to:

- `/admin/nursing-entrance-exam` content relationship guide below the management table

### Status Badges

Use `AdminStatusBadge` for admin status labels instead of creating page-local pill spans.

Common statuses should resolve to consistent tones:

- green: `Published`, `Active`, `Enabled`, `Ready`, `Paid`, `Sent`, `Success`
- amber: `Draft`, `Pending`, `Review`, `Needs Review`, `Processing`
- red: `Archived`, `Disabled`, `Failed`, `Error`, `Inactive`, `Blocked`
- purple: `Admin`, `Featured`
- blue: `Test`, `Preview`
- gray: unknown or unavailable status

Status labels should be human-readable and title-cased. Keep raw enum IDs out of the visible UI unless the admin needs the technical value.

### Pagination

Use `AdminPagination` for admin tables and lists that split records across pages.

Pagination should:

- show the current visible range and total item count
- use the shared previous, numbered page, gap, and next controls
- disable unavailable previous or next actions
- wrap cleanly on mobile
- keep page calculations in the route or view model, while the visual controls come from `AdminPagination`

### Forms

Use `AdminFormSection`, `AdminFieldGroup`, and `AdminValidationMessage` for admin create, edit, and settings forms.

Admin forms should:

- use `AdminFieldGroup` for every visible field label and helper text
- use `admin-field` for inputs, selects, and textareas
- use `AdminSlugField` for slug URL inputs instead of rebuilding the URL prefix/input group locally
- keep required markers consistent through `AdminFieldGroup`
- place validation errors above the affected form section with `AdminValidationMessage`
- avoid inline focus, border, label, helper, and required-marker styles
- keep submit, cancel, and destructive actions in the shared admin button system

Applied slug fields to:

- `/admin/nursing-entrance-exam` create sub-page modal
- `/admin/nursing-entrance-exam` create KB article modal
- `/admin/nursing-entrance-exam` create nested sub-page modal
- `/admin/nursing-entrance-exam` create quiz modal

### Modals

Use `AdminModal` and `AdminModalFooter` for focused admin create and edit dialogs.

Admin modals should:

- use a clear title and a short description of what the action affects
- keep the modal width intentionally constrained instead of using full page width
- keep form fields inside shared `AdminFormSection` and `AdminFieldGroup` wrappers
- keep cancel and submit actions inside `AdminModalFooter`
- use `admin-button-primary`, `admin-button-secondary`, and `admin-button-cancel` instead of page-local inline button styles
- stack actions cleanly on mobile so the primary action remains easy to tap

Applied to:

- `/admin/nursing-entrance-exam` create sub-page modal
- `/admin/nursing-entrance-exam` create KB article modal
- `/admin/nursing-entrance-exam` create nested sub-page modal
- `/admin/nursing-entrance-exam` create quiz modal

The Nursing Entrance Exam page no longer uses the legacy `user-modal-backdrop` shell for create or delete modals. New content-management modals on this page should use the shared admin modal components instead of adding page-local modal wrappers.

### Destructive Dialogs

Use `AdminDestructiveDialog` for delete confirmations and other irreversible admin actions.

Destructive dialogs should:

- name the exact item being affected
- explain that the action cannot be undone unless a more specific consequence is needed
- keep cancel available and visually separate from the destructive action
- disable both actions while the destructive operation is running
- use the shared danger button and loading spinner instead of page-local SVG spinners or inline red button styles
- remain intentionally narrow because they are confirmation dialogs, not full management pages

Applied to:

- `/admin/nursing-entrance-exam` delete sub-page modal
- `/admin/nursing-entrance-exam` delete nested sub-page modal
- `/admin/nursing-entrance-exam` delete quiz modal
- `/admin/nursing-entrance-exam` delete KB article modal

### CRUD Action Buttons

Admin CRUD actions inside tables and management cards should use the shared compact action button pattern instead of plain text links.

Use these classes:

```text
admin-crud-actions
admin-crud-button
admin-crud-button-primary
admin-crud-button-secondary
admin-crud-button-neutral
admin-crud-button-danger
```

Recommended hierarchy:

- `Add`, `Manage`, and other primary next-step actions use `admin-crud-button-primary`
- `Edit` uses `admin-crud-button-secondary`
- `View` uses `admin-crud-button-neutral`
- `Delete` and destructive actions use `admin-crud-button-danger`

Buttons should remain compact, rounded, keyboard-focusable, and mobile-safe. Use real `button` elements for in-page actions and links only when the action navigates to another route.

Applied to:

- `/admin/nursing-entrance-exam`
- `/admin/nursing-test-bank`
- `/admin/nursing-exit-exam`

### Loading, Modal, and Destructive States

Admin pages should reuse the documented loading, modal, and destructive-state patterns from `/typography`, with admin-specific copy.

Loading states should tell the admin what data is being prepared, for example:

```text
Loading Nursing Entrance Exam Content
Preparing Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata.
```

Modals should:

- have clear titles
- explain what the action affects
- keep form fields aligned and mobile-safe
- keep primary and cancel buttons consistently placed
- avoid overlapping inputs
- avoid tiny helper text

Destructive modals should:

- name the exact item being affected
- explain the consequence
- require a deliberate confirmation action
- use the shared danger button style
- never hide the cancel option

### Admin Tiptap Authoring Standard

All admin content editors that publish public sub-pages should use the same authoring standard created for public generated pages.

This applies to Nursing Entrance Exam, Nursing Test Bank, and Nursing Exit Exam parent and nested sub-page editors.

Required editor behavior:

- show advisory content quality warnings before the editor
- show a public content preview toggle before the editor
- track save state with `All changes saved`, `Unsaved changes`, and `Saving...`
- warn before browser refresh or tab close when unsaved changes exist
- keep structured blocks editable in place
- support moving, duplicating, and deleting structured blocks
- do not block saving for advisory content warnings
- do not rewrite article body content by script unless a controlled migration is explicitly approved

Supported structured Tiptap blocks:

- CTA Block
- Internal Link Card
- FAQ Content Block
- Comparison Table Block

Admin editors should prefer these blocks over manual fixed-width tables, generic links, and repeated plain-text CTA sections.

### Relationship to Public Sub-Page Work

The public generated sub-page standard lives here:

```text
Documentation/public-sub-pages/Public exam sub-page content and Tiptap standard.md
```

Admin UI is responsible for making that public standard easy to author safely.

The admin editor should manage content, SEO fields, metadata, schema fields, FAQs, and structured Tiptap blocks. The public template should control hero layout, subject cards, route-level structure, generated links, FAQ rendering, schema output, and access-aware quiz behavior.

Do not duplicate public page layout logic inside admin forms. Admin preview should show what content will look like, but it should not become a second public-page renderer.

### Implementation Rule

When touching an admin page, first check whether the page follows this standard. If it does not, align the touched area with this standard without changing unrelated business logic.

For admin content pages, apply the standard in this order:

1. Keep the current data flow and CRUD behavior unchanged.
2. Fix the shell width and page header.
3. Align search, filters, and primary actions.
4. Polish cards, tables, alerts, loading states, and modals.
5. Add or preserve content warnings, preview, and save-state behavior for Tiptap pages.
6. Update this documentation when a new reusable admin pattern is added.

## Nursing Entrance Quiz Metadata Manager

Added quiz-level metadata management to the Nursing Entrance Exam quiz manager.

Affected admin route:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
```

Changed:

- added a `Quiz Metadata` panel above the question manager
- replaced the broken `Edit Quiz Info` link with an inline metadata editor
- changed the misleading `Save Changes` button to `Refresh`
- added editable quiz metadata fields:
  - quiz name
  - slug
  - exam product
  - subject
  - set number
  - status
  - preview percentage
  - estimated minutes
  - public description
  - meta title
  - meta description
  - keywords
  - canonical URL
  - OG image
  - schema markup
- metadata saves through the existing `uploadNursingEntranceExamQuiz` write path
- existing catalog sync remains attached to the save path
- fixed entrance quiz slug comparison so a quiz opened by document ID can save its existing public slug without being treated as a duplicate
- updated touched Nursing Entrance Exam metadata defaults from `TeasGurus` to `NursingMocks`
- moved metadata typing into a local draft editor so typing does not re-render the full question table on every keystroke
- slug cleanup now happens on blur and save, instead of changing the text while the admin is still typing
- optional numeric metadata fields are omitted from the save payload when empty so Firestore does not receive unsupported `undefined` values
- save and error alerts now show above the metadata editor where the admin can see them immediately after saving

Reason:

- the public generated quiz pages need reliable quiz-specific metadata instead of hardcoded TEAS English copy
- admins should manage quiz display, access, preview, and SEO settings from the same page where they manage quiz questions
- the old `Edit Quiz Info` link pointed to a non-existent route and did not provide quiz metadata editing
- the metadata form should remain responsive even when a quiz has many questions
- empty optional metadata fields should not block saving the rest of the quiz metadata

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Quiz Bulk Upload UI

Optimized the Nursing Entrance quiz bulk upload page to match the shared admin UI.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
```

Changed:

- replaced the custom gradient workspace with the standard admin page shell, top bar, header, cards, buttons, badges, notifications, and modal confirmation
- removed the hidden legacy header/actions block so the page has one source of page title and navigation actions
- changed the parser key mapping area from disabled dropdowns to static admin info tiles because the parser mappings are fixed
- improved JSON option parsing for string arrays and object maps in preview data
- changed validation progress to reflect the actual parsed questions that are ready to import
- refreshed the preview section with the shared admin card, pagination controls, status badges, and destructive button style
- kept the existing upload flow, Firestore destination, confirmation modal, route params, and background import behavior unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Quiz Bulk Upload Simplification

Simplified the Nursing Entrance quiz bulk upload form so admins follow one clear import flow.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
```

Changed:

- removed the disabled top import action so importing happens from the reviewed preview only
- removed the example/schema insertion button, fixed key mapping tiles, duplicate sample table, static validation checklist, and raw placement IDs
- kept the upload or paste JSON input, parse button, summary counts, validation progress, full preview, clear action, and confirmation modal
- kept the same Firestore import behavior and destination routing

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Bulk Upload Option Preview Fix

Fixed option preview rendering for uploaded JSON where answer choices are provided as objects instead of plain strings.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
```

Changed:

- added option value normalization for array items and option maps
- supported common object fields such as `choice`, `text`, `label`, `answer`, `value`, `option`, `content`, `html`, `body`, and `title`
- prevented object-based choices from rendering as `[object Object]` in the preview
- kept the existing upload and Firestore import behavior unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Question Slug Uniqueness

Prevented duplicate Question Slug URLs for Nursing Entrance Exam quiz questions.

Changed:

- question saves now normalize the requested slug before writing
- the save layer checks existing `questions` collection-group records for the same slug
- if another question already owns the slug, the saved slug is suffixed as `slug-2`, `slug-3`, and so on
- the current question document is excluded from collision checks so editing a question can keep its own slug
- single-question create/edit and bulk upload both use the same uniqueness rule
- generated meta canonical URLs and JSON-LD now use the final unique saved slug

Affected file:

```text
src/lib/firestore-operations.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Question Meta And Schema Autopopulation

Added automatic meta and schema generation for Nursing Entrance Exam quiz questions.

Changed:

- single question saves now generate missing question meta fields and schema at the Firestore save layer
- bulk question uploads now generate missing question meta fields and schema before each question is written
- generated meta title uses the cleaned question text, truncated to fit the recommended title length with the `| NursingMocks` suffix
- generated meta description uses the cleaned question text, truncated to the recommended meta description length
- generated Open Graph title and description mirror the generated meta title and description
- generated canonical URL uses the final question slug
- generated JSON-LD includes `WebPage`, `BreadcrumbList`, and `Question` entities with answer/explanation context when available
- existing non-empty admin-entered meta fields and schema are preserved
- added `scripts/backfill-entrance-question-seo.js` for dry-run/apply backfills
- added npm scripts:
  - `content:entrance-question-seo:dry-run`
  - `content:entrance-question-seo:apply`

Backfill result:

```text
npm run content:entrance-question-seo:apply
scannedQuestions: 1145
updated: 1145

npm run content:entrance-question-seo:dry-run
scannedQuestions: 1145
updatesNeeded: 0
unchanged: 1145
```

Affected files:

```text
src/lib/firestore-operations.ts
scripts/backfill-entrance-question-seo.js
package.json
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Question Create Admin UI And Copyright Removal

Optimized the Nursing Entrance Exam question creation workflow under quiz metadata.

Changed:

- the create-question page now uses the shared admin page shell, breadcrumb labels, `AdminPageHeader`, `AdminCard`, admin notification region, admin status badge, and full-width admin content workspace
- removed the copyright-protected option from single question creation
- removed the copyright-protected option from Nursing Entrance bulk question upload
- bulk question upload now uses the shared admin confirmation modal instead of the browser confirmation dialog
- Nursing Entrance bulk question persistence no longer writes `isCopyRight` from uploaded JSON
- the quiz manager question delete action now uses the shared admin destructive confirmation dialog instead of browser `confirm()`

Affected files:

```text
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create/page.tsx
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload/page.tsx
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx
src/lib/firestore-operations.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Quiz Metadata Load Time

Reduced the perceived load time for the Quiz Metadata tab on the Nursing Entrance Exam admin listing.

Changed:

- quiz rows now render as soon as quiz metadata and route slugs are available
- question counts load after the Quiz Metadata table is visible and then update the rows in place
- the existing catalog repair behavior remains in place during quiz metadata loading

Affected file:

```text
src/app/admin/nursing-entrance-exam/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Page-Name Breadcrumbs

Removed the generic `Sub Pages` breadcrumb segment from Nursing Entrance Exam page editors.

Changed:

- parent Sub Page editor breadcrumbs now go from `Nursing Entrance Exam` directly to the current Sub Page name
- nested Sub Page editor breadcrumbs now go from `Nursing Entrance Exam` directly to the parent page name and then the nested page name
- route URLs still keep `[subPageId]` because nested documents remain scoped under their parent Sub Page

Affected files:

```text
src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Nested Breadcrumb Parent Label

Clarified the Nursing Entrance Exam nested editor breadcrumb after removing the separate Sub Page manage route.

Changed:

- the nested editor route still keeps `[subPageId]` in the URL because the nested document is stored under its parent Sub Page
- the visible breadcrumb no longer uses the raw parent slug after content loads
- the parent breadcrumb now resolves the parent Sub Page and displays its saved `pageName`, hero title, or title while linking to the parent Sub Page edit screen
- the loading breadcrumb uses the neutral `Parent Sub Page` label instead of flashing the raw slug

Affected file:

```text
src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Nested Listing Load Time

Reduced the perceived load time for Nested Sub Pages on the Nursing Entrance Exam admin listing.

Changed:

- the main Nursing Entrance Exam admin page now renders Nested Sub Page rows as soon as nested records and their route slugs are loaded
- quiz metadata has its own loading state, so question counts and quiz route-mapping reads no longer block the Nested Sub Pages table
- added a direct Firestore helper for listing nested pages when the parent Sub Page document ID is already known, avoiding the extra parent slug-resolution read in the main listing

Affected files:

```text
src/app/admin/nursing-entrance-exam/page.tsx
src/lib/firestore-operations.ts
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Tiptap Toolbar Utilities

Added admin editor toolbar controls for commonly needed inline editing and cleanup.

Affected files:

```text
src/components/editor/TiptapEditor.tsx
src/components/editor/Toolbar.tsx
src/components/editor/extensions/SuperscriptMark.tsx
src/components/editor/extensions/TextColorMark.tsx
```

Changed:

- added a Superscript toolbar action backed by a persisted `<sup>` Tiptap mark
- added a controlled Text Color menu with a small admin-safe palette and a Default reset option
- added a Clean Pasted Content action that strips pasted styling/classes while preserving structural editor metadata, links, images, headings, tables, and custom block data attributes
- added a live word count indicator with character count available in the tooltip

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nested Sub Page Public Rendering

Aligned public nested sub pages with the same public rendering path used by sub pages.

Affected file:

```text
src/app/[slug]/page.tsx
```

Changed:

- nested sub pages now use the same `PublicSubPageHero`, guide section rendering, FAQ rendering, and static Tiptap content-part handling as sub pages
- this keeps URLs such as `/teas-4-nested-sub-page-test` visually and structurally consistent with sub-page URLs such as `/teas-4-sub-page-test`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: TEAS 4 Nested Test Content

Added realistic test content to the Nursing Entrance Exam nested test page.

Affected page:

```text
/teas-4-nested-sub-page-test
```

Affected Firestore document:

```text
pillarPages/nursing-entrance-exam/subPages/d4jvIv2oBRfTfVpfWsRs/nestedSubPages/VlN6w0p5IaKfukWMqYjB
```

Changed:

- added human-readable placeholder `bodyContent` instead of repeated dummy text
- included every Modules Library block for public nested-page testing: H2 section headings, callout, dotted separator, quiz card, CTA block, internal link card, FAQ content block, and comparison table
- included a regular table to test public typography and mobile table wrapping
- added page heading, description, card description, metadata, and two QA-only FAQs
- regenerated static sidebar data after the Firestore update

Validation run:

```text
node .\scripts\update-teas-4-nested-test-content.js
node .\scripts\update-teas-4-nested-test-content.js --apply
npm run generate:sidebar
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nested Page Browser QA

Ran a browser-style QA pass against the nested test page.

Affected page:

```text
/teas-4-nested-sub-page-test
```

Changed:

- updated the Tiptap callout extension so callout tone is parsed from `data-callout-type`, legacy `data-type`, or `callout-*` classes
- callouts now render with stable `data-type="callout"` and `data-callout-type` so saved content can round-trip without losing warning, success, error, or info tone

Browser checks run:

- loaded `/teas-4-nested-sub-page-test` at desktop `1440x1000`
- loaded `/teas-4-nested-sub-page-test` at mobile `390x844`
- clicked all five guide tabs
- verified CTA block, internal link card, FAQ content block, comparison table, regular table, quiz card, and callouts render in their expected guide sections
- verified no 404 state and no horizontal overflow on desktop or mobile
- observed only local Tawk.to CORS console errors from the external chat script

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Nested Editor Layout Parity

Aligned the Nursing Entrance Exam nested sub-page edit screen with the standard sub-page edit screen.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
```

Reference page:

```text
/admin/nursing-entrance-exam/[subPageId]
```

Changed:

- converted the nested edit page shell to the same full-width admin wrapper, sidebar offset, top bar, and loading state as the sub-page edit page
- replaced the custom nested header with the shared `AdminPageHeader`
- replaced raw `admin-card`, manual labels, manual slug input, and manual select with shared `AdminCard`, `AdminFormSection`, `AdminFieldGroup`, `AdminInfoTile`, `AdminSlugField`, `AdminSelectField`, and `AdminStatusBadge`
- matched the same settings, SEO/meta/schema, content editor, preview, quality warning, Tiptap, and FAQ section ordering used by the sub-page editor
- kept the nested-only Card Description field in the same shared form-section style
- added the missing Open Graph Description field to the nested SEO panel
- normalized nested default image and canonical URL generation through shared config helpers

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Browser check:

```text
/admin/nursing-entrance-exam/d4jvIv2oBRfTfVpfWsRs
/admin/nursing-entrance-exam/teas-4-sub-page-test/nested/VlN6w0p5IaKfukWMqYjB
```

Both admin URLs reached the admin sign-in screen in the browser automation session, so authenticated visual comparison could not be completed from that unauthenticated browser context.

## Follow-up: Nursing Entrance Sub Page Manage Route Removal

Removed the separate Nursing Entrance Exam Sub Page manage route because nested sub pages are already managed from the main Nursing Entrance admin listing and edited from their own nested edit pages.

Removed route:

```text
/admin/nursing-entrance-exam/[subPageId]/manage
```

Changed:

- deleted the obsolete route file at `src/app/admin/nursing-entrance-exam/[subPageId]/manage/page.tsx`
- removed the empty `manage` route directory
- updated nested sub-page editor breadcrumbs to link back to the parent Sub Page edit screen instead of the removed manage route
- updated the Nursing Entrance quiz manager parent breadcrumb to link back to the parent Sub Page edit screen
- kept quiz `/manage` routes unchanged because those are still active quiz management pages

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Breadcrumb Loading Stability

Stabilized the Nursing Entrance Exam admin breadcrumb during initial content loading.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
/admin/nursing-entrance-exam/kb-articles/[kbArticleId]
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
```

Changed:

- Nursing Entrance Exam admin pages now render the shared sidebar and `AdminTopBar` before Firestore content-loading branches
- breadcrumbs remain visible while Sub Pages, Nested Sub Pages, Knowledge Base Articles, Quiz Metadata, bulk upload, and question editor data are loading
- quiz and question routes wrap their loading shells in `SidebarProvider` so collapsed-sidebar spacing remains consistent before route params finish resolving
- the Sub Page manage route now uses the same shared admin sidebar and breadcrumb top bar for loading, error, and loaded states
- only the admin workspace body swaps between the loading state and the loaded management interface

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Breadcrumb Checklist Coverage

Added checklist coverage for the Nursing Entrance Exam breadcrumb loading fix.

Affected page:

```text
/admin/check-list
```

Changed:

- added route-level checklist items confirming the shared admin sidebar and breadcrumb bar remain visible during loading
- covered the main listing, main page settings editor, Sub Page editor, Sub Page manage screen, Nested Sub Page editor, Knowledge Base Article editor, quiz manager, bulk upload route, create question route, and edit question route
- added a final regression checkpoint for all Nursing Entrance Exam admin loading screens

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Generated Public Breadcrumb Initial Render

Removed the delayed breadcrumb injection on generated public pages such as `/teas-7-practice-test`.

Affected pages:

```text
/[slug]
```

Generated content scope:

```text
Sub Pages
Nested Sub Pages
Knowledge Base Articles
Quiz pages
Topic pages
```

Changed:

- `Layout` now accepts optional `initialBreadcrumbItems`
- generated public pages build breadcrumb items from server-loaded route mapping and page data
- public generated pages pass initial breadcrumb items into `Layout` so desktop and mobile breadcrumbs render correctly on first paint
- when initial breadcrumb items are present, `Layout` skips the client-side breadcrumb refetch so the breadcrumb is not cleared, skeletonized, or replaced after hydration
- the existing client-side breadcrumb refresh remains as fallback behavior for pages that do not pass initial breadcrumb data
- updated the admin checklist with public generated-page breadcrumb checks for Sub Pages, Nested Sub Pages, Knowledge Base Articles, Quiz pages, and final regression

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Sub Page Embedded Admin UI Pass

Completed a one-by-one admin UI comparison for the Nursing Entrance Sub Page editor and its embedded editing controls.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]
```

Affected embedded components:

```text
src/components/admin/FaqEditor.tsx
src/components/admin/PublicContentPreview.tsx
src/components/admin/ContentQualityWarnings.tsx
src/components/editor/CustomModulesPanel.tsx
src/components/editor/CustomHeadingFloatingMenu.tsx
src/components/editor/QuizCardPlaceholder.tsx
src/components/editor/QuizCardModal.tsx
src/components/editor/TiptapEditor.tsx
src/components/editor/Toolbar.tsx
src/components/editor/extensions/CustomImage.tsx
src/components/ui/RichTextEditor.tsx
```

Changed:

- confirmed the Sub Page editor uses the shared admin shell, top bar, cards, field groups, notifications, and loading state
- normalized the Status dropdown with the shared admin select control
- normalized Sub Page Details, SEO fields, meta fields, schema field, and description field wrappers with shared admin form groups
- replaced the FAQ editor buttons and empty state with shared admin buttons and empty-state styling
- replaced the custom module library buttons, badges, panel, and guardrail block with shared admin editor classes
- replaced the Tiptap toolbar buttons, dividers, popover fields, and action buttons with shared admin editor classes
- replaced the heading ID floating menu with shared admin field and button styling
- replaced the quiz card placeholder dashed styling with a polished admin card-style placeholder
- replaced the embedded quiz-card selection modal with shared admin card, field, alert, badge, loading, and button styling
- replaced the short rich-text description editor shell, toolbar, and content area with shared admin editor styles
- replaced the custom image overlay controls with semantic admin image-control classes while preserving image alignment, alt-text editing, delete, and resize behavior
- preserved editor commands, drag-and-drop module insertion, quiz card insertion, FAQ editing, image upload behavior, save behavior, route behavior, and Firestore writes

Validation run:

```text
.\node_modules\.bin\eslint.cmd "src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx" "src/components/admin/AdminUi.tsx" "src/components/admin/FaqEditor.tsx" "src/components/admin/PublicContentPreview.tsx" "src/components/admin/ContentQualityWarnings.tsx" "src/components/editor/CustomModulesPanel.tsx" "src/components/editor/CustomHeadingFloatingMenu.tsx" "src/components/editor/QuizCardPlaceholder.tsx" "src/components/editor/QuizCardModal.tsx" "src/components/editor/TiptapEditor.tsx" "src/components/editor/Toolbar.tsx" "src/components/editor/extensions/CustomImage.tsx" "src/components/ui/RichTextEditor.tsx"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Admin Breadcrumb Previous Links

Added a breadcrumb requirement for admin pages and updated Nursing Entrance Exam routes so previous breadcrumb segments are clickable.

Requirement:

- every breadcrumb segment before the current page must include a real route
- only the current page breadcrumb should be non-clickable
- use `AdminTopBar` for breadcrumb rendering instead of page-local breadcrumb markup where possible

Affected Nursing Entrance routes:

```text
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/edit
/admin/nursing-entrance-exam/kb-articles/[kbArticleId]
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
```

Changed:

- linked `Content` back to `/admin`
- linked `Sub Pages` and `KB Articles` back to `/admin/nursing-entrance-exam`
- linked `Nested Sub Pages` back to the parent Sub Page manager where route params are available
- added clickable `Nursing Entrance Exam` and `Quiz Manager` parent breadcrumbs to bulk upload and question routes
- added clickable parent Sub Page and Nested Sub Page breadcrumbs to the Nursing Entrance quiz manager

## Follow-up: Nursing Entrance Main Page Settings Schema And Loader

Fixed the Nursing Entrance Exam Main Page Settings route.

Affected page:

```text
/admin/nursing-entrance-exam/edit
```

Changed:

- Schema Markup now auto-generates from the shared public page schema builder instead of relying on stale manually edited JSON
- generated schema references the public `/nursing-entrance-exam` page, Nursing Entrance Exam breadcrumb, page title, page description, and FAQ content
- Schema Markup field is now presented as a read-only generated preview so admins do not have to maintain JSON-LD by hand
- save flow persists the current generated schema
- loading state now renders inside the full admin sidebar, top breadcrumb bar, workspace, and content shell so it does not appear in the top-left corner
- shared admin authorization loading now also renders inside the admin sidebar, top breadcrumb bar, workspace, and centered content shell
- replaced stale `TeasGurus` fallback metadata with `NursingMocks`

Validation run:

```text
.\node_modules\.bin\eslint.cmd "src/app/admin/nursing-entrance-exam/edit/page.tsx"
.\node_modules\.bin\eslint.cmd "src/app/admin/layout.tsx" "src/app/admin/nursing-entrance-exam/edit/page.tsx"
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Acronym-Aware Naming Convention

Updated Nursing Entrance Exam content naming so admin-created and admin-edited labels follow the project naming convention.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/[subPageId]/manage
```

Changed:

- added a shared admin content naming helper for content labels and slugs
- preserved required exam acronyms in admin labels, including `ATI`, `TEAS`, `HESI`, `A2`, `RN`, and `LPN`
- Sub Page editing now corrects the visible Sub Page name while the admin types, while still allowing normal multi-word typing
- Sub Page save still normalizes `pageName`, `seoLabel`, `slug`, and `seoSlug` before writing to Firestore
- Sub Page creation and Nested Sub Page creation now use the same content naming helper instead of the billing plan naming helper
- slug fields continue to use lowercase hyphenated URL-safe formatting generated from the normalized content name

## Follow-up: Live Name And Slug Editing

Expanded the Nursing Entrance Exam naming convention to all name-and-slug content flows.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam/kb-articles/[kbArticleId]
```

Changed:

- Sub Page, Nested Sub Page, Knowledge Base Article, and Quiz name fields now apply the admin content naming convention as the admin types
- generated slugs now update live from the normalized name while the slug has not been manually edited
- slug inputs remain editable; once an admin changes a slug manually, the page no longer overwrites it from the name field
- manually entered slugs are sanitized with the same lowercase hyphenated URL convention
- existing custom slugs are protected on edit screens when the stored slug does not match the generated slug for the current name
- save handlers normalize names, SEO labels, and slugs before writing to Firestore so older records and pasted values still follow convention
- quiz metadata and quiz creation now preserve exam acronyms in display names and use the same slug convention as Sub Pages

## Follow-up: Nursing Entrance Sub Page Edit Admin UI

Normalized the Nursing Entrance Exam Sub Page edit screen to follow the shared admin UI system.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]
```

Changed:

- replaced the custom page header markup with the shared `AdminPageHeader`
- replaced the custom Sub Page settings card wrapper with the shared `AdminCard`
- replaced the parent structure tiles with shared `AdminInfoTile` components
- replaced the raw slug input with the shared `AdminSlugField`
- replaced the custom status pill with `AdminStatusBadge`
- updated the SEO and Content Editor card wrappers to shared `AdminCard` components
- removed stale developer-facing helper copy from the parent structure section
- corrected old `TeasGurus` fallback metadata to `NursingMocks`
- standardized visible labels and copy to the admin naming convention, including `Sub Page`, `Display Title`, `Meta Title`, `Meta Description`, and `Open Graph Image`
- preserved existing loading, save, route redirect, schema, editor, FAQ, and Firestore behavior

Validation run:

```text
npx eslint src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Sub Page Form Controls

Completed a deeper admin UI cleanup for the Nursing Entrance Exam Sub Page edit screen and its embedded admin helper components.

Affected files:

```text
src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx
src/components/admin/AdminUi.tsx
src/components/admin/FaqEditor.tsx
src/components/admin/PublicContentPreview.tsx
src/components/admin/ContentQualityWarnings.tsx
src/app/globals.css
```

Changed:

- added a shared `AdminSelectField` component for admin-themed dropdowns
- replaced the Sub Page `Status` native select and inline SVG styling with `AdminSelectField`
- added shared admin select styling in `globals.css`
- rebuilt `FaqEditor` to use admin buttons, admin fields, admin info tiles, and admin empty state styling
- removed the dashed FAQ empty state and corrupted encoded arrow/quote labels
- changed `Add FAQ` to use the admin secondary button with an icon
- changed FAQ reorder and remove actions to use admin button classes
- normalized Public Content Preview to use admin info tile, admin button, and admin empty state patterns
- normalized Content Quality Warnings to use admin tile, status badge, and admin helper text patterns
- preserved all existing FAQ, preview, warning, status, save, and Firestore behavior

Validation run:

```text
npx eslint src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx src/components/admin/AdminUi.tsx src/components/admin/FaqEditor.tsx src/components/admin/PublicContentPreview.tsx src/components/admin/ContentQualityWarnings.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

Validation run:

```text
npx eslint src/app/admin/nursing-entrance-exam/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/manage/page.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Operational Admin Page UI Standardization

Standardized the operational admin pages that still used user-dashboard typography classes.

Affected pages:

```text
/admin/profile
/admin/audit-logs
/admin/email-jobs
/admin/login-security
```

Changed:

- replaced remaining user-page cards, helper text, labels, buttons, alerts, stat cards, status pills, and table cells with shared admin primitives or admin CSS classes
- added a shared `admin-table-heading` class so admin table headers have a central source of truth
- kept all existing admin profile save logic, audit log loading, email job filters, login-security search, autocomplete, overview loading, account-sharing signal logic, and table data flow unchanged
- kept these pages full-width under the admin workspace standard

Reason:

- Admin Dashboard, Admin Profile, User Management, Billing Configuration, Exam Access Catalog, Audit Logs, Login Security, and Email Jobs should all read as one admin system.
- User-page typography classes should not be used as the long-term source of truth for admin management screens.

Validation to run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/profile/page.tsx src/app/admin/audit-logs/page.tsx src/app/admin/email-jobs/page.tsx src/app/admin/login-security/page.tsx src/components/admin/AdminUi.tsx
```

## Follow-up: Loading States And Quiz Metadata Manager

Continued the admin UI source-of-truth cleanup on content management surfaces.

Affected pages:

```text
/admin/nursing-test-bank
/admin/nursing-exit-exam
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
```

Changed:

- replaced the remaining Test Bank and Exit Exam loading screens with the shared `AdminLoadingState`
- updated the Nursing Entrance Exam quiz metadata manager to use admin cards, admin labels, admin fields, admin helper text, and admin primary button styling
- kept quiz metadata generation, schema auto-population, preview percentage handling, save behavior, question loading, and Firestore writes unchanged

Remaining deeper cleanup:

- the Nursing Entrance quiz manager still has legacy styling in the page header, relationship summary, question filters, question table, pagination, and create-question modal
- after Nursing Entrance is finished, the same verified pattern should be copied to Nursing Test Bank and Nursing Exit Exam quiz managers

Validation to run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/nursing-test-bank/page.tsx src/app/admin/nursing-exit-exam/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx
```

## Follow-up: Nursing Entrance Quiz Manager UI

Finished the main Nursing Entrance quiz manager visual cleanup.

Affected page:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
```

Changed:

- moved the page body to the shared admin workspace/content width
- updated the quiz manager header, header actions, status badge, error/success alerts, summary card, question card, filter controls, table shell, edit/delete actions, and create-question modal to use admin UI classes
- kept question search, filters, pagination state, question create/delete handlers, metadata save behavior, and Firestore data flow unchanged

Remaining follow-up:

- the pagination controls still use the existing manual logic, but now sit inside the admin table/card surface
- copy this Nursing Entrance pattern to equivalent Test Bank and Exit Exam quiz manager pages after confirming this page visually

Validation to run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx
```

## Follow-up: Test Bank And Exit Quiz Manager UI

Applied the verified Nursing Entrance quiz-manager visual pattern to the equivalent quiz manager pages for Nursing Test Bank and Nursing Exit Exam.

Affected pages:

```text
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/manage
/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
```

Changed:

- moved both pages to the shared admin workspace width
- updated headers, logged-out topbar links, header actions, summary cards, question cards, filter controls, table shells, row status pills, edit/delete actions, pagination controls, and create-question modals to use admin UI classes
- kept all existing routes, Firestore reads, question create/delete handlers, filters, pagination state, and quiz navigation unchanged

Notes:

- small slate utility classes remain only inside the empty-state icon and pagination active/inactive text states
- deeper question create/edit screens still need their own pass because they contain rich form/editor layouts

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/manage/page.tsx
```

## Follow-up: Question Create And Edit Screens

Standardized the rich question authoring screens across Nursing Entrance, Nursing Test Bank, and Nursing Exit Exam.

Affected pages:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/questions/create
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/questions/[questionId]
/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create
/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
```

Changed:

- replaced the old slate/gradient form treatment with admin workspace, admin header, admin card, admin field, admin helper, admin alert, admin info tile, and admin button classes
- removed unused `gradientBg` constants after migrating inputs to the shared admin field style
- kept all question type switching, options, answer handling, rich text editor behavior, metadata/schema fields, copyright toggle, and save routes unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/questions/create/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/questions/[questionId]/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]/page.tsx
```

## Follow-up: Bulk Upload Screens

Standardized the question bulk-upload screens across Nursing Entrance, Nursing Test Bank, and Nursing Exit Exam.

Affected pages:

```text
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/bulk-upload
/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
```

Changed:

- replaced legacy loading, header, upload card, JSON field, file drop zone, preview table, status surfaces, pagination controls, and action buttons with shared admin classes
- kept JSON parsing, file reading, validation state, preview pagination, copyright flag handling, upload confirmation, Firestore bulk upload calls, and post-upload navigation unchanged
- preserved the Nursing Entrance catalog repair call after successful upload

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/bulk-upload/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload/page.tsx
```

## Follow-up: Nested Manage Pages

Standardized the older nested content management pages that manage sub-pages, nested pages, topics, and quiz lists.

Affected pages:

```text
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-test-bank/[subPageId]/manage
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/manage
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/manage
/admin/nursing-exit-exam/[subPageId]/manage
/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/manage
```

Changed:

- replaced older blue-gradient page shells with the shared admin page background
- updated loading surfaces, page headers, information cards, nested item cards, search fields, modal shells, modal labels, modal fields, and create/cancel buttons to use admin UI classes
- kept all existing create, edit, delete, search, modal state, slug normalization, route navigation, and Firestore read/write behavior unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npx eslint src/app/admin/nursing-entrance-exam/[subPageId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/manage/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/manage/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/manage/page.tsx
```

## Follow-up: Admin UI Typography Layer

Added a real shared admin UI layer so admin pages no longer depend on user-page styling by accident.

Changed:

- added shared `admin-*` typography, workspace, card, toolbar, form, table, button, and auth-screen classes in `src/app/globals.css`
- updated `src/app/admin/layout.tsx` so the full admin area inherits the NursingMocks admin background and typography foundation
- converted admin auth/loading/access-denied states to the shared admin card, field, alert, and button styling
- added a compatibility layer under `.admin-root` so older admin pages using `max-w-7xl`, `max-w-6xl`, `max-w-5xl`, `max-w-4xl`, `max-w-[1220px]`, `bg-gray-50`, `bg-white`, or old blue/indigo gradients are visually pulled into the admin standard while they are migrated page by page
- normalized legacy admin inputs, selects, and textareas under `.admin-root` so they follow the shared field shape, focus ring, font size, and background
- normalized common legacy primary and secondary admin buttons under `.admin-root`
- normalized common admin table header typography under `.admin-root`
- migrated `/admin`, `/admin/users`, `/admin/billing`, `/admin/exam-access`, `/admin/audit-logs`, `/admin/email-jobs`, `/admin/login-security`, and `/admin/profile` to explicit admin workspace/header/table/card classes where safe
- normalized the outer workspace for `/admin/nursing-entrance-exam`, `/admin/nursing-test-bank`, and `/admin/nursing-exit-exam` without changing their CRUD logic

Important rule:

- Admin pages should use `admin-workspace` and `admin-content` instead of centered user containers.
- Management pages should be full-width by default.
- New admin work should use `admin-*` classes first. Existing `user-*` classes can remain temporarily only where they already match the intended visual pattern.
- Deep inline-style cleanup for large content pages should be done section by section to avoid changing create, edit, delete, route, or Firestore behavior.

Remaining cleanup queue:

- `/admin/nursing-entrance-exam` still contains many inline styles inside cards, tables, tab buttons, and modals. The outer shell now follows the admin standard, but the internal sections should be migrated in focused passes.
- `/admin/nursing-test-bank` and `/admin/nursing-exit-exam` now inherit the admin page background and full-width workspace, but their internal cards, tables, and modals still need the same focused migration.
- legacy blog, question, question-type, pillar-page, bulk-upload, and question-edit admin pages still use older gradient wrappers and centered max-width containers. The admin root compatibility layer normalizes them visually, but future edits should replace their wrappers with explicit `admin-workspace`, `admin-content`, `admin-card`, `admin-field`, `admin-button-*`, and `admin-table` classes.
- modal widths should remain intentionally constrained. Do not apply full-width page rules to destructive confirmations, detail previews, or focused create/edit dialogs.

## Follow-up: Content Management Page Typography Enforcement

Added a scoped content-management page layer so the three large content admin sections now visibly follow the admin typography standard even though their internal JSX still contains many legacy inline style objects.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-test-bank
/admin/nursing-exit-exam
```

Changed:

- added `admin-content-management-page` to the main workspace of the three large content admin pages
- added scoped CSS rules in `src/app/globals.css` for content-management headers, cards, section headings, helper text, labels, pills, tabs, search/filter panels, form fields, primary/secondary buttons, table shells, table headers, rows, and mobile wrapping
- used `!important` only inside this scoped class because the existing page contains many inline style objects that otherwise override the shared typography classes
- kept all existing active-tab logic, filtering, search state, pagination, create/edit/delete handlers, modal state, and Firestore data flow unchanged
- kept modal width rules separate so focused dialogs do not become full-width management pages

Reason:

- Nursing Entrance Exam, Nursing Test Bank, and Nursing Exit Exam were visually inconsistent because old inline styles overrode the shared typography system.
- A scoped compatibility layer gives immediate admin-wide consistency while allowing deeper JSX cleanup to happen safely section by section later.

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Content Management Loading States

Standardized the loading modal/card pattern across the three large content admin pages.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-test-bank
/admin/nursing-exit-exam
```

Changed:

- kept the existing loading branches and data-fetching behavior unchanged
- confirmed Nursing Entrance Exam already used the shared loading card copy:
  - `Loading Nursing Entrance Exam Content`
  - `Preparing Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata.`
- updated Nursing Test Bank and Nursing Exit Exam to use the same loading card structure, spinner, skeleton rows, and preparation copy
- used page-specific loading titles for Test Bank and Exit Exam while keeping the same preparation description

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: KB Article Admin Pages

Standardized the KB article edit screens for Test Bank and Exit Exam so they use the same admin shell and form styling as the rest of the admin content management area.

Affected pages:

```text
/admin/nursing-test-bank/kb-articles/[kbArticleId]
/admin/nursing-exit-exam/kb-articles/[kbArticleId]
```

Changed:

- replaced the older standalone gradient page wrapper with the shared `admin-page`, `admin-workspace`, `admin-content`, and `AdminTopBar` structure
- replaced the custom loading spinner with `AdminLoadingState`
- replaced local success/error alert blocks with `AdminAlert`
- updated article settings, parent structure, SEO, schema, and content editor sections to use shared `admin-card`, `admin-card-title`, `admin-section-title`, `admin-helper`, `admin-info-tile`, `admin-field-label`, `admin-field`, `admin-button-primary`, `admin-button-secondary`, and `admin-status-badge` classes
- kept the existing Tiptap editor, rich text description editor, slug/status state, SEO fields, schema field, Firestore load/save functions, live preview link, and route behavior unchanged

Validation run:

```text
npx eslint src/app/admin/nursing-test-bank/kb-articles/[kbArticleId]/page.tsx src/app/admin/nursing-exit-exam/kb-articles/[kbArticleId]/page.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Entrance Exam Admin Completion Pass

Completed a focused Nursing Entrance Exam admin UI pass before applying the same work to Test Bank and Exit Exam.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-entrance-exam/edit
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
/admin/nursing-entrance-exam/kb-articles/[kbArticleId]
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
```

Changed:

- moved the main Nursing Entrance Exam edit page to the shared admin sidebar, workspace, top breadcrumb bar, page header, loading state, alerts, cards, fields, and buttons
- moved the Nursing Entrance Exam sub-page editor, nested sub-page editor, and KB article editor to the same shared admin shell and form styling
- normalized the sub-page manage page alerts, content wrapper, and visible action buttons
- normalized quiz manager and question editor loading states with `AdminLoadingState`
- normalized the missing-question fallback screen so it no longer uses the old blue-gradient shell
- kept all existing Firestore read/write functions, route params, slug/status behavior, rich text editors, Tiptap editors, SEO/schema fields, quiz metadata logic, question CRUD behavior, and public preview links unchanged
- left specialty controls such as copyright toggles, progress bars, upload dropzone states, and table pagination controls intact where they already serve a specific local function

Validation run:

```text
npx eslint src/app/admin/nursing-entrance-exam/page.tsx src/app/admin/nursing-entrance-exam/edit/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/manage/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/page.tsx src/app/admin/nursing-entrance-exam/kb-articles/[kbArticleId]/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]/page.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Admin Check List Page

Added a persistent admin checklist page for one-by-one Nursing Entrance Exam testing.

New route:

```text
/admin/check-list
```

Changed:

- added a `Check List` link to the admin sidebar
- added a full-width admin checklist page using the shared admin sidebar, top breadcrumb bar, header, cards, buttons, stats, fields, and alerts
- included grouped checklist sections for:
  - main listing
  - sub pages
  - nested sub pages
  - quizzes and metadata
  - bulk upload
  - question CRUD
  - public quiz page
  - KB articles
  - main page settings
  - final regression
- each checklist item can be checked and can store notes
- checked state and notes persist to Firestore in:

```text
adminChecklists/nursing-entrance-exam-full-test
```

Persistence behavior:

- checkbox changes save immediately
- notes save on blur or when `Save Notes` is clicked
- saved records include total items, completed items, updater UID/email, and update timestamp

Validation run:

```text
npx eslint src/app/admin/check-list/page.tsx src/components/layout/AdminSidebar.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Naming Conventions And Admin UI

Admin pages must use consistent naming, capitalization, and action wording so management screens feel predictable and professional.

Header and section naming rules:

- Use clean title case for page titles, section titles, modal titles, and card titles.
- Do not use hyphens, dashes, slash-style labels, or internal shorthand in visible headers.
- Use `Checklist`, not `Check List`.
- Use `Sub Page`, not `Sub-page`.
- Use `Nested Sub Page`, not `Nested Sub-page`.
- Use `Knowledge Base Article`, not `KB Article`, in primary labels and section titles.
- Use `Quiz Metadata`, not `Quizzes And Metadata`.
- Use `Question Management`, not `Question CRUD`.
- Use `Public Quiz Pages`, not `Public Quiz Page`, when referring to the public quiz testing group.
- Use `Nursing Entrance Exam` when referring to the admin section. Use plural only when describing multiple exam products.

Button naming rules:

- Use direct action labels such as `Open Page`, `Save Notes`, `Reset Checklist`, `View Page`, `Back to Admin`, and `Save Changes`.
- Avoid vague labels such as `Go`, `Save`, or `View` when the target is not obvious.
- Destructive actions should include the affected object in nearby text or confirmation copy.

Checklist and testing UI rules:

- Checklist items should be written as testable actions, not vague reminders.
- Use user-facing admin language instead of code terms. For example, say `reserved new record error`, not `__new__ error`.
- Long checklists should include a completion summary, progress indicator, section progress badges, saved status, last saved timestamp, and a way to show incomplete items only.
- Checkbox changes should save immediately. Notes should save on blur and through an explicit `Save Notes` action.

Admin visual rules:

- Admin pages should use `admin-page`, `admin-workspace`, `admin-content`, `AdminTopBar`, `admin-header`, `admin-card`, `admin-field`, `admin-button-primary`, `admin-button-secondary`, and `admin-button-danger` where applicable.
- Management pages should stay full width by default.
- Cards, alerts, forms, tables, loading states, modals, and destructive states should use shared admin UI classes before introducing local styling.

Loading state rules:

- Use `AdminLoadingState` for full-page or route-level admin loading screens.
- Use title case in loading titles, such as `Loading Nursing Entrance Exam Content`, `Loading Question Editor`, or `Checking Admin Access`.
- Loading descriptions should explain what is being prepared in plain admin language.
- Use full admin names in loading descriptions. For example, use `Knowledge Base Articles`, not `KB articles`, and use `Quiz Metadata` when the page is preparing quiz records and metadata.
- Use `AdminInlineLoading` for embedded table rows, small sections, and inline admin panels.
- Do not use generic visible copy such as `Loading...` where a specific action is known.
- Keep local button labels specific, such as `Loading Activity`, `Saving...`, `Deleting...`, or `Sending...`.
- Keep upload progress bars, toggle animations, and button-level saving spinners local when they communicate a specific action inside the control.

Implementation update:

- added `AdminInlineLoading` to `src/components/admin/AdminUi.tsx`
- added shared inline loading CSS in `src/app/globals.css`
- normalized page-level loading screens to `AdminLoadingState`
- normalized table and embedded loading rows to `AdminInlineLoading`

## Follow-up: Admin Loading State Normalization

Normalized loading states across admin UI so page-level and embedded loading surfaces use shared components instead of one-off spinner markup.

Changed:

- updated admin authentication loading to use `AdminLoadingState`
- updated legacy Blog, Question Types, Question Management, Pillar Pages, Nursing Test Bank, Nursing Exit Exam, and related editor loading screens to use `AdminLoadingState`
- updated Users, Audit Logs, Email Jobs, Billing, and content manage embedded loading rows to use `AdminInlineLoading`
- kept button-level states such as `Saving...`, `Deleting...`, `Sending...`, and upload progress indicators local because they communicate action-specific progress inside controls
- left not-found and error screens unchanged where they are not loading states

Validation run:

```text
npx eslint src/components/admin/AdminUi.tsx src/app/admin/layout.tsx src/app/admin/users/page.tsx src/app/admin/audit-logs/page.tsx src/app/admin/email-jobs/page.tsx src/app/admin/billing/page.tsx src/app/admin/question/page.tsx src/app/admin/question/create/page.tsx src/app/admin/question/[questionId]/page.tsx src/app/admin/question-types/page.tsx src/app/admin/blog/page.tsx src/app/admin/blog/[blogId]/page.tsx src/app/admin/pillarpages/page.tsx src/app/admin/pillarpages/[pillarPageId]/page.tsx src/app/admin/pillarpages/[pillarPageId]/services/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/manage/page.tsx src/app/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/manage/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/manage/page.tsx src/app/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/manage/page.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Notification Standards And Admin Feedback

Admin pages must use a consistent feedback system for success messages, errors, warnings, validation notices, and destructive confirmations.

Strategic placement rules:

- Place page-level success, error, warning, and informational messages directly below the page header or primary admin toolbar.
- Use field-level validation directly below the field that needs correction.
- Use modal validation inside the modal, above the first field or above the relevant action area.
- Use destructive confirmation dialogs for irreversible delete, disable, archive, or reset actions.
- Do not place important save errors at the bottom of long admin pages where they can be missed.
- Do not show duplicate messages for the same action in more than one area.

Component rules:

- Use `AdminNotificationRegion` for page-level feedback.
- Use `AdminAlert` for local modal notices and standalone feedback blocks.
- Use `AdminValidationMessage` for field-specific validation.
- Use `AdminDestructiveDialog` for destructive confirmation flows.
- Avoid custom `admin-alert`, `user-alert`, or one-off color blocks in active admin pages unless a local workflow needs a specialized state.

Copy rules:

- Use clear title case for notification titles.
- Use titles such as `Content Saved`, `Unable To Save Content`, `Question Saved`, `Unable To Import Questions`, and `Checklist Saved`.
- Keep the message body direct and actionable.
- Avoid developer-focused language in visible admin messages unless the admin needs the exact technical reason to resolve the issue.
- Avoid hyphens and dashes in notification titles when a clean title case phrase works.

Implementation update:

- added `AdminNotificationRegion` to `src/components/admin/AdminUi.tsx`
- added shared notification spacing through `.admin-notification-region` in `src/app/globals.css`
- normalized page-level notifications in Nursing Entrance Exam admin pages and the admin checklist page
- kept modal validation local to the modal while using the shared alert component for consistent styling

Affected pages:

```text
/admin/check-list
/admin/nursing-entrance-exam
/admin/nursing-entrance-exam/edit
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]
/admin/nursing-entrance-exam/kb-articles/[kbArticleId]
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
```

## Follow-up: Nursing Entrance Exam Naming Pass

Normalized visible naming on the Nursing Entrance Exam admin page as the first step of the page optimization pass.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- renamed the tab label `KB Articles` to `Knowledge Base Articles`
- renamed the tab label `Quizzes` to `Quiz Metadata`
- replaced visible `Sub-page` and `Nested Sub-page` wording with `Sub Page` and `Nested Sub Page`
- replaced visible `KB Article` wording with `Knowledge Base Article`
- removed plus-prefixed create button labels and used direct labels such as `New Sub Page`, `New Nested Sub Page`, `New Knowledge Base Article`, and `New Quiz`
- updated modal titles, field labels, validation messages, success messages, empty states, and the content relationship guide to match the admin naming convention
- kept Firestore document IDs, route slugs, tab IDs, data loading, create/delete behavior, filters, and pagination logic unchanged

## Follow-up: Nursing Entrance Exam Debug Log Cleanup

Removed development-only debug logging from the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- removed debug logs for total quizzes, quiz slug maps, quiz records with counts, and empty quiz results
- kept `console.error` logging for failed reads, route mapping failures, question count failures, create actions, and delete actions so admin failures remain diagnosable during testing
- kept all loading, filtering, pagination, Firestore reads, route mapping, question counting, create, edit, view, and delete behavior unchanged

## Follow-up: Nursing Entrance Exam Date And Sort Helpers

Centralized repeated date formatting and newest-first sorting on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- added local helpers for admin date parsing, `lastUpdated` timestamps, newest-first sorting, and last-updated display formatting
- replaced repeated inline `new Date(...).toLocaleDateString(...)` and `toLocaleTimeString(...)` blocks with `formatAdminLastUpdated`
- replaced repeated newest-first sort blocks for Quiz Metadata, Knowledge Base Articles, and Nested Sub Pages with `sortByLastUpdatedDesc`
- kept row order, visible date intent, pagination, filtering, and Firestore behavior unchanged

## Follow-up: Nursing Entrance Exam Row Types

Added safer local row types to the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- added local row interfaces for Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles
- replaced broad `any` state for nested page rows, quiz rows, Knowledge Base Article rows, delete selections, and selected Nested Sub Page quiz creation state
- typed Firestore result mapping at the page boundary while keeping the existing Firestore adapter functions unchanged
- added explicit parent and nested route ID fallbacks where the existing page already expected those values to exist
- kept all page behavior, Firestore paths, route slugs, create/delete actions, and table rendering unchanged

## Follow-up: Nursing Entrance Exam Toolbar Optimization

Improved the Nursing Entrance Exam admin toolbar for easier management.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- added visible labels for Search, Exam, and Status controls
- changed the search input to `type="search"`
- updated placeholders to use naming convention copy such as `Search Sub Pages`, `Search Quiz Metadata`, and `Search Knowledge Base Articles`
- normalized filter option labels to `All Exams` and `All Statuses`
- kept the top toolbar create action for items that can be created without extra parent context
- replaced misleading top toolbar create actions for Nested Sub Pages and Quiz Metadata with short guidance that points admins to the correct row action
- added `.admin-toolbar-control` to the shared admin CSS for labeled toolbar fields
- kept existing filters, tab behavior, row actions, creation modals, and Firestore behavior unchanged

## Follow-up: Nursing Entrance Exam Background Loading

Reduced the perceived loading time on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- kept the first page-level loading state for the initial Sub Pages fetch
- allowed the page shell and Sub Pages table to render as soon as Sub Pages are available
- moved heavier related content preparation for Nested Sub Pages, Quiz Metadata, Knowledge Base Articles, route mappings, and question counts behind a secondary background loading state
- added inline loading rows for Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles while their background data is still being prepared
- kept the same Firestore reads, route mapping behavior, question count behavior, filters, pagination, create actions, delete actions, and visible tables unchanged

## Follow-up: Nursing Entrance Exam Empty States And Guide Copy

Improved empty-state and guidance copy on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- made empty states more actionable for Sub Pages, Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles
- updated toolbar guidance to use `Add Nested Sub Page` instead of `Add Nested Page`
- changed vague row action labels from `Add` to `Add Nested Sub Page` and `Add Quiz`
- kept the existing table rows, modals, filtering, pagination, and Firestore behavior unchanged

## Follow-up: Nursing Entrance Exam Summary Cards

Improved the top summary cards on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- capped the visible Sub Page list in the Content Structure card so it stays scannable as more entrance products are added
- added a count badge for additional Sub Pages when more than four exist
- replaced abbreviated Knowledge Base count copy with full `Knowledge Base Article` wording
- updated Content Stats helper text to explain what each count means for admin management
- kept all table columns, filters, records, and data loading behavior unchanged

## Follow-up: Nursing Entrance Exam Sub Pages Pagination

Added pagination to the Sub Pages tab on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- added dedicated pagination state for Sub Pages
- reset Sub Pages pagination when the active tab, search query, exam filter, or status filter changes
- paginated Sub Page table rows using the same `itemsPerPage` value as Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles
- added `AdminPagination` controls for Sub Pages when the filtered result count spans more than one page
- kept filtering, sorting, row actions, and Firestore behavior unchanged

## Follow-up: Nursing Entrance Exam Tab And Create Action Cleanup

Confirmed and cleaned up duplicate tab behavior on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Confirmed:

- `Main Page Settings` was rendering the same table and behavior as `Sub Pages` because it had no dedicated content branch
- the toolbar fallback could show `New Sub Page` for any unhandled tab
- `Nested Sub Pages` and `Quiz Metadata` should be created from their parent row actions, not from a page-level `New Sub Page` button
- `Knowledge Base Articles` should keep its own `New Knowledge Base Article` action

Changed:

- removed the duplicate `Main Page Settings` tab from the Nursing Entrance Exam page
- added a direct `Edit Main Page` header action that links to the existing main page edit route
- limited the page-level `New Sub Page` button to the `Sub Pages` tab only
- kept Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles CRUD flow unchanged
- kept all Firestore reads, writes, deletes, route mappings, schema generation, and content relationships unchanged

## Follow-up: Nursing Entrance Exam Silent Action Refresh

Improved the post-action experience on the Nursing Entrance Exam admin page.

Affected page:

```text
/admin/nursing-entrance-exam
```

Changed:

- added a silent refresh path for create and delete actions
- kept the current table visible while Firestore data refreshes after an action
- returned admins to the relevant tab after each action:
  - Sub Page actions return to `Sub Pages`
  - Nested Sub Page actions return to `Nested Sub Pages`
  - Quiz actions return to `Quiz Metadata`
  - Knowledge Base Article actions return to `Knowledge Base Articles`
- prevented successful actions from showing the full page loading modal again
- kept the same Firestore write behavior, route mappings, schema generation, validation, and content relationships unchanged

## Follow-up: Nursing Entrance Child Action Refresh

Extended the same silent action-refresh behavior to Nursing Entrance child management screens.

Affected pages:

```text
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage
/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]
```

Changed:

- Nested Sub Page create and delete actions now refresh the child list without showing the page-level loading state
- quiz question create and delete actions now refresh questions silently so the quiz manager stays visible
- quiz metadata save now updates local metadata and refreshes supporting question data silently
- existing question edits now save in place instead of redirecting away from the editor
- standalone question creation and bulk upload still return to the quiz manager after completion because those are separate workflow pages
- kept all Firestore writes, validation, route structure, and content relationships unchanged

## Follow-up: Nursing Entrance Checklist Updates

Updated the admin checklist to match the latest Nursing Entrance Exam workflow.

Affected page:

```text
/admin/check-list
```

Changed:

- removed the obsolete `Main Page Settings` tab from the main listing tab test
- added a checklist item for the `Edit Main Page` header action
- added a checklist item confirming `Main Page Settings` is no longer duplicated as a Sub Pages tab
- added testing coverage for silent refresh behavior after Sub Page, Nested Sub Page, Quiz Metadata, Question, and Knowledge Base Article actions
- added a regression checklist item to confirm create, save, and delete actions keep the admin in the correct tab or editor context

## Follow-up: Checklist Persistence And Domain Navigation

Improved the admin checklist page so it remains usable when Firestore checklist permissions are not available.

Affected page:

```text
/admin/check-list
```

Changed:

- added local browser storage as the first persistence layer for checklist progress and notes
- kept Firestore sync when the admin checklist collection is permitted
- replaced blocking Firestore permission errors with a local checklist mode notice
- redesigned the checklist with a left-side domain navigation for focused testing
- shows one checklist domain at a time so Nursing Entrance Exam testing can be completed step by step
- added per-domain progress counts and percentages in the side navigation
- kept checklist item IDs stable so existing saved progress can still map to the same checks

## Follow-up: Checklist Admin UI Alignment

Aligned the admin checklist page with the shared admin UI design system.

Affected page:

```text
/admin/check-list
```

Changed:

- replaced the custom checklist header with the shared `AdminPageHeader`
- moved the local checklist mode notice into the shared admin notification region
- used shared `AdminCard`, `AdminStatCard`, and `AdminStatusBadge` components for the page sections
- kept the left-side domain navigation but restyled it with admin colors, spacing, borders, and focus states
- updated helper copy so local-first saving and optional Firestore sync are clear to admins

## Follow-up: Checklist Layout Fit Optimization

Optimized the admin checklist layout so the checklist list fits inside the admin workspace.

Affected page:

```text
/admin/check-list
```

Changed:

- constrained the checklist domain side navigation to a smaller fixed admin width
- protected the main checklist panel with `min-width: 0` so long checklist text cannot force horizontal overflow
- made checklist rows behave like a responsive admin list/table with a fixed action column on desktop
- wrapped long checklist labels and helper text safely inside their cards
- stacked the domain navigation and row actions on smaller screens
- kept checklist saving, local fallback, Firestore sync, and item IDs unchanged

## Follow-up: Checklist Admin Width Standardization

Updated the admin checklist page to use the same full-width admin shell as the Admin Dashboard and User Management pages.

Affected page:

```text
/admin/check-list
```

Changed:

- replaced the custom checklist page wrapper with the standard admin wrapper:
  `min-h-screen overflow-x-hidden bg-white`
- moved sidebar spacing to the same transition wrapper used by other admin pages
- restored the standard `main.admin-workspace > div.admin-content` structure
- removed `admin-content-management-page` from the checklist page because its table-oriented min-width rules were causing horizontal overflow
- kept the checklist domain navigation, local fallback saving, Firestore sync attempt, and checklist items unchanged

## Follow-up: Checklist Loading Shell Alignment

Aligned the admin checklist loading state with the loaded admin page shell.

Affected page:

```text
/admin/check-list
```

Changed:

- added the Admin Sidebar to the checklist loading state
- applied the same collapsed/expanded sidebar offset wrapper used by the loaded checklist page
- centered the loading modal inside the admin content area instead of the full browser viewport
- updated the loading title to `Loading Checklist` for naming consistency
- prevented the loading state from visually jumping when the checklist content finishes loading

## Follow-up: Checklist Link And Reset Safety

Improved checklist navigation and reset safety.

Affected page:

```text
/admin/check-list
```

Changed:

- all `Open Page` checklist links now open in a new browser tab
- added `rel="noopener noreferrer"` to checklist links opened in a new tab
- replaced immediate checklist reset with the shared admin destructive confirmation dialog
- reset confirmation explains that checked items and notes will be cleared before the action is applied
- kept checklist saving, local storage fallback, Firestore sync attempt, and item IDs unchanged

## Follow-up: Checklist Changes Complete Tracking

Added a separate completion marker for checklist change work.

Affected page:

```text
/admin/check-list
```

Changed:

- added a second per-item checkbox labeled `Changes Complete`
- kept the existing checklist checkbox for testing/verification status
- persisted `changesComplete` separately from checked items and notes in local storage and Firestore sync attempts
- added page-level and per-domain counts for completed changes
- reset now clears checked items, notes, and changes-complete markers together

## Follow-up: Checklist JSON Export

Added a JSON export option for checklist testing notes.

Affected page:

```text
/admin/check-list
```

Changed:

- added an `Export JSON` action in the checklist header
- export modal includes checked items, changes-complete markers, notes, checklist ID, title, and export timestamp
- added a `Copy JSON` action so checklist notes can be shared or referenced outside the browser
- kept local storage saving, Firestore sync attempts, checklist item IDs, and reset behavior unchanged

## Follow-up: Multi-Area Admin Checklist

Made the admin checklist reusable across major content management areas.

Affected page:

```text
/admin/check-list
```

Changed:

- added a `Checklist Area` selector in the checklist header
- supported separate checklists for:
  - Nursing Entrance Exam
  - Nursing Test Bank
  - Nursing Exit Exam
- each checklist area has its own local storage key and Firestore document ID
- checklist labels, route links, export JSON, loading copy, and header copy now update based on the selected area
- reused the Nursing Entrance checklist structure as the base template so the same testing flow can be applied consistently to the other content pages
- kept existing Nursing Entrance checklist item IDs stable inside its own saved checklist

## Follow-up: Nursing Entrance Main Listing Checklist Fixes

Resolved the confirmed Main Listing checklist issues for Nursing Entrance Exam admin workflows.

Affected pages:

```text
/admin/nursing-entrance-exam
/admin/nursing-entrance-exam/[subPageId]
/admin/nursing-entrance-exam/[subPageId]/manage
/admin/nursing-entrance-exam/edit
```

Changed:

- Sub Page creation now normalizes the Sub Page name into title case and removes punctuation/separators before save
- Sub Page creation now auto-generates the slug from the Sub Page name and sanitizes it with the shared billing slug convention
- Nested Sub Page creation from the main listing now normalizes the Nested Sub Page name and auto-generates a clean slug
- Nested Sub Page creation from the Sub Page manage screen now normalizes the Nested Sub Page name and auto-generates a clean slug
- Sub Page editor save now normalizes `pageName`, `seoLabel`, `slug`, and `seoSlug` before writing to Firestore
- Sub Page editor name field now normalizes on blur and can generate the slug from the cleaned name
- Sub Page editor loading state now uses the full admin sidebar/content shell so the loader does not appear in the top-left corner
- Sub Page editor page shell now follows the standard admin wrapper used by Admin Dashboard and User Management
- Main Page Settings loading state now uses the full admin sidebar/content shell so the loader does not appear in the top-left corner
- Main Page Settings page shell now follows the standard admin wrapper
- Main Page Settings schema is now generated from the current page title, description, and FAQ content on load when missing and again on save
- Main listing silent refresh now shows inline refresh feedback for Nested Sub Pages, Quiz Metadata, and Knowledge Base Articles after create/delete actions

Validation run:

```text
npx eslint src/app/admin/nursing-entrance-exam/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx src/app/admin/nursing-entrance-exam/[subPageId]/manage/page.tsx src/app/admin/nursing-entrance-exam/edit/page.tsx
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Main Listing Phase 1

Started the Nursing Test Bank admin main listing upgrade.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- added the shared admin notification region above the main content
- added `AdminPageHeader` with a direct `Edit Main Page` action
- added shared overview cards for the Test Bank hierarchy and content stats
- added shared tabs for `Sub Pages`, `Nested Sub Pages`, `Topics`, `Quiz Metadata`, and `Knowledge Base Articles`
- corrected the visible top-level create actions so the Topics tab opens the Topic modal and the Quiz Metadata tab opens the Quiz Metadata modal
- kept existing Test Bank Firestore reads, route mappings, filters, table body rendering, pagination, create/delete handlers, and child routes unchanged

Remaining follow-up:

- replace the remaining inline toolbar and table shell with `AdminToolbar`, `AdminTable`, `AdminTableCell`, `AdminTableEmptyState`, `AdminStatusBadge`, and `AdminPagination`
- replace the remaining create/delete overlays with shared admin modal and destructive-dialog components
- remove the hidden legacy header/tabs block after the table and modal pass is complete
- standardize terminology from `KB` and `Quizzes` to `Knowledge Base Articles` and `Quiz Metadata`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest http://localhost:3000/admin/nursing-test-bank
```

## Follow-up: Nursing Test Bank Internal Pages And Data Rules

Completed the remaining Nursing Test Bank admin UI pass after the main listing upgrade.

Affected pages:

```text
/admin/nursing-test-bank/edit
/admin/nursing-test-bank/[subPageId]
/admin/nursing-test-bank/[subPageId]/manage
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/manage
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/manage
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/manage
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/bulk-upload
/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/quizzes/[quizId]/questions/[questionId]
```

Changed:

- wrapped the main Test Bank edit page and relationship manage pages in the shared admin sidebar, top bar, notification region, and full-width admin content shell
- added shared `AdminPageHeader` usage to the Test Bank main edit page, sub-page manage page, nested sub-page manage page, and topic quiz manage page
- replaced browser delete confirmations with `AdminDestructiveDialog` for nested sub-pages, topics, quiz metadata, and quiz questions
- replaced the bulk question import browser confirmation with a neutral shared `AdminModal` confirmation that shows the parsed question count and destination quiz
- normalized Test Bank admin link labels to ASCII arrows and replaced the old question-not-found gradient fallback with an admin-style empty state
- removed Test Bank quiz `setNumber` creation/edit state from the main listing and topic quiz manage flow
- confirmed Test Bank admin `.tsx` files no longer contain `TeasGurus`, `teasgurus.com`, `setNumber`, `examYear`, `Set Number`, or browser `confirm()` usage

Data rule:

- Nursing Test Bank quiz metadata now follows the Exit Exam rule: quiz names come from the source file name, and Test Bank quizzes should not store `setNumber`, `year`, or `examYear`.

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Main Listing Phase 2

Continued the Nursing Test Bank admin main listing upgrade.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- replaced the visible inline search/filter/action toolbar with `AdminToolbar`
- kept the existing search, Sub Page filter, status filter, and active-tab state unchanged
- corrected active-tab create actions for Sub Pages, Nested Sub Pages, Topics, Quiz Metadata, and Knowledge Base Articles
- added shared `AdminPagination` for Nested Sub Pages, Topics, Quiz Metadata, and Knowledge Base Articles
- disabled the old manual pagination block while preserving it for the remaining table-body conversion pass
- cleaned visible table terminology from `quizzes` and `KB articles` to `Quiz Metadata` and `Knowledge Base Articles`
- kept existing Test Bank Firestore reads, route mappings, filtering logic, table body rendering, and create/delete handlers unchanged

Remaining follow-up:

- replace the remaining inline table shell and row cells with shared table primitives
- convert create/delete overlays to shared admin modal and destructive-dialog components
- remove the disabled legacy header/tabs/pagination blocks after the table and modal conversion is complete

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest http://localhost:3000/admin/nursing-test-bank
```

## Follow-up: Nursing Test Bank Main Listing Phase 3

Continued the Nursing Test Bank admin main listing upgrade.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- replaced the visible inline table shell with the shared `AdminTable`
- standardized the active table header with admin table heading classes
- replaced plain empty rows with `AdminTableEmptyState` across Sub Pages, Nested Sub Pages, Topics, Quiz Metadata, and Knowledge Base Articles
- added `AdminStatusBadge` for active table status cells
- added title and URL slug truncation with hover titles so long Test Bank records do not push the action buttons or adjacent rows out of alignment
- normalized broken encoded date fallback/separator text in the active Test Bank table display
- kept existing Test Bank Firestore reads, route mappings, filtering, pagination, create/delete handlers, and row action routes unchanged

Remaining follow-up:

- convert the remaining visible table row cells from inline `td` styles to `AdminTableCell`
- convert create/delete overlays to shared admin modal and destructive-dialog components
- remove the disabled legacy header/tabs/pagination blocks after the table and modal conversion is complete

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest http://localhost:3000/admin/nursing-test-bank
```

## Follow-up: Nursing Test Bank Main Listing Phase 4

Continued the Nursing Test Bank admin main listing upgrade.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- converted the active table body cells from inline `td` styles to `AdminTableCell`
- preserved title and slug truncation, status badges, action links, and active-tab table behavior
- kept existing Test Bank Firestore reads, route mappings, filtering, pagination, create/delete handlers, and row action routes unchanged

Remaining follow-up:

- convert create/delete overlays to shared admin modal and destructive-dialog components
- remove the disabled legacy header/tabs/pagination blocks after the modal conversion is complete

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Main Listing Phase 5

Continued the Nursing Test Bank admin main listing upgrade.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- replaced the five custom delete confirmation overlays with `AdminDestructiveDialog`
- standardized destructive actions for Sub Pages, Nested Sub Pages, Topics, Quiz Metadata, and Knowledge Base Articles
- kept existing delete handlers, loading flags, Firestore delete calls, silent refresh behavior, and row action routes unchanged

Remaining follow-up:

- convert the create overlays to shared `AdminModal`, `AdminFieldGroup`, `AdminSlugField`, `AdminValidationMessage`, and `AdminModalFooter`
- remove the disabled legacy header/tabs/pagination blocks after create modal conversion is complete

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Nursing Test Bank Main Listing Phase 6

Completed the Nursing Test Bank main listing modal cleanup.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- converted the five create overlays to shared `AdminModal`, `AdminFieldGroup`, `AdminSlugField`, `AdminValidationMessage`, and `AdminModalFooter` components
- standardized visible labels to `Sub Page`, `Nested Sub Page`, `Topic`, `Quiz Metadata`, and `Knowledge Base Article`
- preserved existing create handlers, parent selection logic, slug normalization, optional quiz set number handling, validation messages, state resets, and Firestore writes
- removed old fixed-position create overlay wrappers from the Test Bank main listing

Remaining follow-up:

- remove the disabled legacy header/tabs/pagination blocks now that the visible table and modals use shared admin primitives

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest http://localhost:3000/admin/nursing-test-bank
```

## Follow-up: Nursing Test Bank Main Listing Phase 7

Completed dead-code cleanup for the Nursing Test Bank main listing UI upgrade.

Affected page:

```text
/admin/nursing-test-bank
```

Changed:

- removed disabled legacy header, alert, overview, tabs, and pagination blocks that were kept during the phased migration
- kept the active shared notification, page header, overview, tabs, toolbar, table, pagination, create modal, and delete dialog flows unchanged
- confirmed the page no longer contains old fixed-position create modal overlay wrappers

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
Invoke-WebRequest http://localhost:3000/admin/nursing-test-bank
```

Affected files:

```text
src/app/globals.css
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/users/page.tsx
src/app/admin/billing/page.tsx
src/app/admin/exam-access/page.tsx
src/app/admin/audit-logs/page.tsx
src/app/admin/email-jobs/page.tsx
src/app/admin/login-security/page.tsx
src/app/admin/profile/page.tsx
src/app/admin/nursing-entrance-exam/page.tsx
src/app/admin/nursing-test-bank/page.tsx
src/app/admin/nursing-exit-exam/page.tsx
```

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
