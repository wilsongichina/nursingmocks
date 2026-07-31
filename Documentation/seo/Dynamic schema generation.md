# Dynamic Schema Generation

## Completed Change

Nursing entrance quiz pages now generate JSON-LD automatically from the admin-managed Firestore tree instead of relying on manual schema entry.

## Current Scope

- Applies to nursing entrance exam quiz creation.
- Applies to nursing entrance exam quiz metadata saves.
- Applies to parent sub-page saves for Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams.
- Applies to nested child-page saves for Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams.
- The quiz metadata manager fills the `Schema Markup` field automatically while editing.
- Uses the existing `schema` field that is already rendered by the dynamic public route.
- Keeps the public route dynamic/static behavior unchanged.

## Data Source Rule

Schema hierarchy must come from the admin tree and route metadata, not from parsing slugs.

Current quiz hierarchy:

1. Home
2. Nursing Entrance Exam
3. Parent sub page, such as ATI TEAS 7 or HESI A2
4. Nested subject page, such as TEAS Math Practice Test
5. Quiz set page, such as TEAS Math Practice Test Set 1

Current public sub-page hierarchy:

1. Home
2. Pillar page, such as Nursing Entrance Exams, Nursing Test Bank, or Nursing Exit Exams
3. Parent sub page, such as ATI TEAS 7 or RN Exams
4. Nested child page, such as TEAS Math Practice Test or a test-bank subject page

Parent and nested page schema must be generated from the saved admin tree fields. Do not manually paste stale JSON-LD, do not derive hierarchy from the slug, and do not save localhost URLs.

## Generated Schema Types

Quiz pages generate a JSON-LD graph containing:

- `Organization`
- `WebSite`
- `WebPage`
- `BreadcrumbList`
- `Quiz`
- `LearningResource`
- `Question` entries for preview-visible questions

`QAPage` is intentionally not used because these pages are practice quiz pages, not single public question-and-answer pages.

Parent and nested sub-pages generate a JSON-LD graph containing:

- `Organization`
- `WebSite`
- `CollectionPage`
- `BreadcrumbList`
- `ItemList` when visible child pages, topics, or quizzes exist
- `FAQPage` when visible page-level FAQs exist

Page-level schema does not include quiz answers, hidden questions, locked questions, or unsupported question-count properties.

## Preview Rule

The schema only includes questions that are visible on the public statically generated page.

For nursing entrance quizzes, visible questions are calculated from:

- allowed public question types
- visible quiz question list
- preview percentage

Locked questions are not added to JSON-LD because they are not visible in the public static HTML.

## Canonical URL Rule

Generated schema uses the canonical production origin, not the current admin browser origin. Local admin sessions must not save `localhost` URLs into Firestore because the same stored schema is rendered by production static pages.

Canonical origin:

```text
https://nursingmocks.com
```

The implementation uses the shared canonical site URL helper so every `url`, `@id`, logo URL, breadcrumb URL, quiz URL, and question ID has the same production base.

## Answer Visibility Rule

Public quiz JSON-LD must not expose locked or subscriber-only answers, explanations, or distractor options.

Current public quiz schema includes:

- public page metadata
- breadcrumb hierarchy
- quiz and learning-resource metadata
- preview-visible question text

Current public quiz schema intentionally omits:

- `acceptedAnswer`
- `suggestedAnswer`
- explanations
- paid, locked, unpublished, admin-only, or hidden questions
- `eduQuestionType`, because NursingMocks practice tests are not flashcard pages

## Question Count Rule

Do not emit `numberOfQuestions` in quiz JSON-LD. Schema.org does not recognize that property on `LearningResource`, and Google only supports a narrow subset of `Quiz` properties for Education Q&A flashcard pages. NursingMocks should show question counts in the visible page UI and descriptions, not as an unsupported JSON-LD property.

## Files Updated

- `src/lib/seo/structured-data.ts`
- `src/lib/config.ts`
- `src/app/admin/nursing-entrance-exam/page.tsx`
- `src/app/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage/page.tsx`
- `src/lib/firestore-operations.ts`
- `src/lib/__tests__/structured-data.test.ts`

## Admin Form Behavior

The schema textarea on the nursing entrance quiz metadata manager is read-only and generated from the current form state. Changing fields such as quiz name, slug, exam product, subject, set number, preview percentage, estimated minutes, or description refreshes the JSON-LD shown in the field before submission.

For parent and nested sub-pages, the Firestore save layer regenerates `schema` automatically before writing the document. The generated schema uses the current page name, slug, descriptions, admin-tree breadcrumb hierarchy, visible child records, and page-level FAQs. This protects published pages from stale manually pasted schema and keeps Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams consistent.

## Future Stages

1. Add the same schema builder pattern to nursing test bank and nursing exit exam quiz forms.
2. Add page-level schema builders for pillar and knowledge base article pages.
3. Add a backfill script to regenerate schema for existing Firestore content.
4. Add schema validation tests to ensure no `undefined` values reach Firestore.
5. Add a manual `Regenerate Schema` admin action if admins need to refresh schema without editing other metadata.

## Frontend Page Metadata Coverage

Updated the focused frontend metadata set for home, company, legal, and registration/account setup routes.

Behavior:

- Home and contact metadata already had current NursingMocks titles and descriptions.
- About, guarantees, prices, register, login, cookie policy, and thank-you metadata now use current NursingMocks branding and page-specific descriptions.
- Terms, privacy, and onboarding now use server page wrappers with static metadata while their interactive bodies remain client components.
- `/robots.txt` is served from `public/robots.txt` and uses an explicit allowlist for public SEO pages, ATI TEAS quiz URL prefixes, sitemap/robots, and render assets while blocking everything else.
- Non-sitemap pages outside the indexable allowlist receive an `X-Robots-Tag: noindex, nofollow` header from `src/middleware.ts` so Google can crawl the page and see the noindex signal instead of failing live inspection as blocked by robots.
- The indexable middleware allowlist covers home, company, legal, registration/account setup, and existing ATI TEAS quiz pages for Sets 1-3 and 6-16 across English, Reading, Science, and Math. Sets 4 and 5 are intentionally omitted because those quiz records do not exist.
- `/sitemap.xml` now lists the same indexable page set and no longer includes unrelated placeholder routes.
- Sitemap and robots generation use the canonical URL helper, which falls back to `https://www.nursingmocks.com` for localhost and Vercel preview domains.

Files changed:

- `src/app/about/page.tsx`
- `src/app/guarantees/page.tsx`
- `src/app/prices/page.tsx`
- `src/app/money-back-guarantee/page.tsx`
- `src/app/terms-and-conditions/page.tsx`
- `src/app/terms-and-conditions/TermsAndConditionsPageClient.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/privacy-policy/PrivacyPolicyPageClient.tsx`
- `src/app/cookie-policy/page.tsx`
- `src/app/register/page.tsx`
- `src/app/login/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/OnboardingPageClient.tsx`
- `src/app/thank-you/page.tsx`
- `public/robots.txt`
- `src/app/sitemap.ts`
- `src/middleware.ts`
- `src/lib/config.ts`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## ATI TEAS 7 Practice Test Copy Normalization

Normalized the public `/teas-7-practice-test` page record and hero summary labels so generated labels no longer appear in the page metadata, summary chips, or JSON-LD fallback data.

Behavior:

- The saved sub-page name and H1 remain `ATI TEAS 7`; SEO-only fields can still use `ATI TEAS 7 Practice Test`.
- The hero summary chips now use explicit labels such as `Exam: ATI TEAS 7`, `Category: Nursing Entrance Exams`, `Preview: Free`, `Subjects: 4`, and `Questions: 2,281`.
- The Nursing Entrance Exam sub-page editor now includes an `Edit Public Copy` modal for optional template copy overrides. Blank fields keep the generated defaults for autogenerated pages.
- The modal primary action is `Save Public Copy`, which writes the sub-page immediately instead of only closing the modal.
- The public renderer reads optional `displayCopy` fields for the hero CTA labels, practice section eyebrow/title/description, guide section title/description, and FAQ section title/description.
- The `/ati-teas-practice-test` hero keeps one primary practice action, `Start ATI TEAS Practice`, which scrolls to the subject cards. Its secondary action is `See Exam Details`, which scrolls to the saved guide/details content instead of duplicating the subject-card action.
- Public ATI TEAS parent mobile layout uses smaller phone hero typography, stacked full-width hero actions, 44px subject-card action targets, safe text wrapping for long card titles, and scroll-margin anchors for the practice and exam-details sections.
- FAQ section title and description controls live in a separate FAQ Section card below the Tiptap Content Editor, directly above the FAQ item editor, instead of inside the public-copy modal.
- FAQ section title and description inputs are prefilled with generated defaults so admins can edit the existing copy directly.
- The shared public hero now receives the child count label from the page context, so parent pages can show `Subjects`, nested exit pages can show `Exams`, and test-bank pages can show `Topics`.
- Dynamic public pages revalidate every 60 seconds so admin copy changes refresh quickly while keeping static page performance.
- The canonical URL now points to `https://www.nursingmocks.com/ati-teas-practice-test`.
- The page schema now uses `NursingMocks` branding and `https://www.nursingmocks.com` URLs.
- The schema `ItemList` descriptions for Reading, Math, Science, and English now use subject-specific descriptions instead of generated placeholder text.
- Dynamic public pages now prefer saved `pageName` over `seoLabel` for visible page labels, so SEO copy does not rename the public sub-page.

Files changed:

- `scripts/update-teas-practice-test-content.js`
- `src/app/[slug]/page.tsx`
- `src/components/sections/PublicSubPageHero.tsx`
- `src/app/admin/nursing-entrance-exam/[subPageId]/page.tsx`
- `src/lib/data/sidebar-data.ts`
- `public/data/sidebar-data.json`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## ATI TEAS Parent Canonical Redirect

The canonical ATI TEAS parent practice page is:

```text
/ati-teas-practice-test
```

Legacy parent URLs now permanently redirect to that canonical page:

```text
/teas-7-practice
/teas-7-practice-test
```

The dynamic public renderer also normalizes saved TEAS parent JSON-LD URLs and metadata canonical URLs to `/ati-teas-practice-test` so older saved schema cannot point search engines back to a legacy slug. Static sidebar data uses the same canonical URL in its saved schema strings.

Search crawling rule:

- Canonical public ATI TEAS hub pages are listed in `src/app/sitemap.ts`.
- Canonical public ATI TEAS hub pages are explicitly allowed in `public/robots.txt`.
- Legacy redirect URLs are excluded from the sitemap but allowed in `public/robots.txt` so Google can crawl them, receive the permanent redirect, and consolidate signals to `/ati-teas-practice-test`.
- Middleware indexability must match sitemap/robots intent. Any canonical page added to the sitemap must also be included in `INDEXABLE_PATHS` in `src/middleware.ts`, otherwise the route can receive an `X-Robots-Tag: noindex, nofollow`.

Current ATI TEAS hub sitemap entries:

```text
/ati-teas-practice-test
/ati-teas-reading-practice-test
/ati-teas-math-practice-test
/ati-teas-science-practice-test
/ati-teas-english-practice-test
```

Current allowed legacy redirect URLs:

```text
/teas-7-practice
/teas-7-practice-test
```

## Nested Page SEO And Sidebar Modal URL Backfill

Existing nested sub-pages across Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams were refreshed with production SEO fields and route-backed modal URLs.

Behavior:

- Nested page `meta.canonicalUrl` values use `https://www.nursingmocks.com/{slug}`.
- Nested page `meta.ogImage` values use `https://www.nursingmocks.com/nursing-mocks-logo.png`.
- Nested page `schema` values are regenerated as page-level JSON-LD using NursingMocks branding, production URLs, breadcrumbs, visible child records, and visible FAQs.
- `routeMappings` are upserted by `refPath` for every nested sub-page so the saved public slug remains the URL source of truth.
- The sidebar data generator now reads `routeMappings` and stores `publicSlug` and `publicUrl` for cached modal nested pages.
- The left sidebar nested-page modal now prefers `nestedSubPage.publicUrl` before falling back to legacy URL construction, preventing guessed Test Bank or Exit Exam links from pointing to nonexistent routes.

Files changed:

- `scripts/backfill-nested-page-seo-and-routes.js`
- `scripts/update-ati-teas-english-content.js`
- `scripts/generate-sidebar-data.js`
- `src/components/layout/Sidebar.tsx`
- `src/lib/data/sidebar-data.ts`
- `public/data/sidebar-data.json`

Validation run:

```text
cmd /c node scripts\backfill-nested-page-seo-and-routes.js --apply
cmd /c node scripts\generate-sidebar-data.js
cmd /c node scripts\backfill-nested-page-seo-and-routes.js
.\node_modules\.bin\tsc.cmd --noEmit
```

## ATI TEAS English Content Refresh

The ATI TEAS English nested page was regenerated to match the current subject-hub pattern used by Reading, Math, and Science.

Behavior:

- Replaced the short placeholder body content with full English and Language Usage guide content.
- Added the official English section fact table with total questions, scored questions, unscored pretest questions, time limit, and scored content-area allocations.
- Added NursingMocks-focused FAQs and regenerated FAQPage schema through the nested page SEO backfill.
- Updated the English page display copy for the hero CTA, set-selector section, guide text, and FAQ header.
- Updated the English page SEO title, description, canonical URL, OG title, OG description, OG image, and public description.

Validation run:

```text
cmd /c node scripts\update-ati-teas-english-content.js --apply
cmd /c node scripts\backfill-nested-page-seo-and-routes.js --apply
cmd /c node scripts\generate-sidebar-data.js
cmd /c node scripts\update-ati-teas-english-content.js
.\node_modules\.bin\tsc.cmd --noEmit
```
