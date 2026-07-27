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
- `/robots.txt` is served from `public/robots.txt` and uses an exact allowlist for home, company, legal, registration/account setup, and four TEAS set 1 subject practice pages.
- The static robots file explicitly allows `/robots.txt` and `/sitemap.xml` so Google can fetch the sitemap even though the rest of the site is disallowed by default.
- All other page paths are disallowed in robots, while static render assets such as `/_next/static/`, favicon files, and the NursingMocks logo remain crawlable.
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
- `src/lib/config.ts`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
