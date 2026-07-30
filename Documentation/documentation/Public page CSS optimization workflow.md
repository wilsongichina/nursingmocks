# Public Page CSS Optimization Workflow

## Purpose

This document records the safe process for reducing render-blocking CSS on public NursingMocks pages, starting with `/ati-teas-practice-test`.

The goal is to reduce first-render CSS without breaking public pages, admin pages, Tiptap content rendering, quiz cards, or mobile layouts.

## Proven Result

The first completed `/ati-teas-practice-test` optimization pass produced the following PageSpeed result after deployment:

```text
Performance: 98
Accessibility: 100
Best Practices: 100
SEO: 100
Agentic Browsing: 3/3
```

This result came from targeted fixes that preserved the existing user page shell, sidebar, top menu, and pagination behavior.

## Reusable PageSpeed Playbook

Use this order when optimizing another public page:

1. Measure the page first.
   - Record the PageSpeed scores.
   - Record FCP, LCP, TBT, CLS, Speed Index.
   - Identify the actual LCP element.
   - Copy the render-blocking, unused JS, console error, contrast, SEO, and agent-accessibility findings.

2. Keep the visible page shell unless the task is explicitly to redesign it.
   - Do not replace `Layout` or remove the sidebar/top menu just to reduce JavaScript.
   - If the page needs the user sidebar, optimize inside that shell instead of swapping the shell.

3. Remove route-irrelevant global CSS first.
   - Move admin-only CSS into `src/app/admin/admin.css`.
   - Keep shared `.user-*`, public content, public guide, FAQ, and read-only Tiptap styles global until a route-specific renderer/style split is complete.
   - Move editor-authoring styles away from public global CSS when they are only needed in admin/editor routes.

4. Keep Firebase Auth out of first paint on indexable public SEO pages.
   - Add the page path to `src/lib/public-route-performance.ts` when it should not need auth state at first paint.
   - Public SEO pages should use the lightweight anonymous auth context.
   - Quiz set pages that can unlock full questions for signed-in users should lazy-load Firebase Auth after first paint instead of deferring it permanently.
   - Protected, dashboard, admin, login, register, onboarding, billing, and account pages must keep immediate Firebase-backed auth behavior.

5. Skip third-party chat on indexable public SEO pages.
   - Tawk should not inject on pages where it hurts public LCP and is not needed before user interaction.

6. Treat Firebase-hosted cache warnings correctly.
   - `auth/iframe.js` cache headers are controlled by Firebase, not NursingMocks or Vercel.
   - The correct fix is preventing the request on public pages, not trying to set headers for it.

7. Treat font changes as a separate compatibility test.
   - Do not switch `next/font/google` to the variable font default while Turbopack is used locally.
   - The variable Outfit default caused a Turbopack resolution error for `@vercel/turbopack-next/internal/font/google/font`.
   - Keep the explicit Outfit weight list until a font-loading change passes local dev and production build.

8. Avoid unnecessary client Firestore reads on server-rendered public pages.
   - If `src/app/[slug]/page.tsx` passes `initialBreadcrumbItems`, `LayoutWithSidebar` must skip client-side breadcrumb/pillar preloading.
   - Console errors like `firestore.googleapis.com Listen/channel net::ERR_TIMED_OUT` usually mean a client component is still starting Firestore Web SDK work after hydration.

9. Fix audit-specific public files and accessibility findings.
   - `public/llms.txt` must be Markdown-like, have an H1, and contain useful links.
   - `robots.txt` should allow `/llms.txt`, `/robots.txt`, `/sitemap.xml`, static assets, and intended public pages.
   - Footer and shared low-contrast text must pass contrast on dark backgrounds.

10. Validate after each small batch.
    - Run `.\node_modules\.bin\tsc.cmd --noEmit`.
    - Run `npm run lint`.
    - Run `npm run build` as a compile smoke when changing Next/font, layout, route, or provider behavior. If static generation times out after successful compilation, restore unrelated generated sidebar data.
    - Re-run PageSpeed after deployment and compare against the recorded baseline.

## What Worked For `/ati-teas-practice-test`

- Admin CSS was split out of `globals.css` and imported only from `src/app/admin/layout.tsx`.
- Editor-authoring CSS was moved out of the public global path.
- Firebase Auth was split so public SEO pages use a lightweight anonymous context.
- TEAS set pages use a lazy auth pattern so public preview renders first while signed-in full-access checks can still run after idle.
- Tawk chat injection was skipped on public SEO pages.
- Outfit font loading was tested as a variable font default, but this was reverted because it broke Turbopack.
- Client breadcrumb/pillar preload was skipped when server breadcrumbs are already provided.
- `llms.txt` was added with a valid H1 and links.
- `robots.txt` was updated to allow `/llms.txt`.
- Compact footer text contrast was raised on the dark footer.

## What Did Not Work

- Replacing the generated public page with a lightweight custom layout reduced page-shell JavaScript but broke the expected sidebar menu, top menu, and pagination behavior.
- Do not repeat that approach unless the replacement layout fully reproduces the existing user UI shell.

## Current Finding

PageSpeed reports render-blocking first-party CSS on the ATI TEAS practice page:

```text
css/4e9f1fe6e1f0f166.css
css/03f488d47096d51a.css
```

The larger blocking file is the main target. The exact generated filename changes by build, so optimization should focus on source ownership, not the hashed filename.

Local inspection shows `src/app/globals.css` is the main risk:

- `src/app/layout.tsx` imports `./globals.css`, so these styles are available from the root layout.
- `src/app/globals.css` is about 5,476 lines.
- Local `.next/static/css` output includes one very large CSS asset, which indicates too much styling is being bundled broadly.

## Source Inventory

`src/app/globals.css` currently contains several unrelated style families:

| Area | Approximate source range | Public ATI TEAS page need |
| --- | ---: | --- |
| Tailwind import, tokens, body defaults | `1-51` | Required globally |
| Shared user page primitives | `52-68`, `2101-3036` | Required by public/user pages |
| Admin shell, tables, forms, modals, auth screen | `69-2099` | Not needed on public TEAS page |
| Legacy admin compatibility layer | `1598-2003` | Not needed on public TEAS page |
| Animations, gradients, generic legacy utilities | `3037-3187` | Audit before moving or deleting |
| Contenteditable editor styles | `3188-3277` | Admin/editor only |
| `.prose`, blog, TOC, breadcrumb legacy styles | `3278-3758` | Audit by route before moving |
| Full Tiptap editor styles | `3759-4335` | Mostly editor/admin; public only needs readonly subset |
| Public Tiptap/read-only article styles | `4336-4735` | Needed by public generated pages |
| Marketing block editor controls | `4742-4858` | Admin/editor only |
| Public guide and FAQ styles | `4860-5273` | Needed by `/ati-teas-practice-test` |
| Image controls and section heading editor tools | `5274-end` | Admin/editor only |

## ATI TEAS Page Dependency Map

The `/ati-teas-practice-test` public page is rendered through `src/app/[slug]/page.tsx`.

Important public components:

- `src/components/sections/PublicSubPageHero.tsx`
- `src/components/sections/PublicSubPageGuide.tsx`
- `src/components/ui/ContentRenderer.tsx`
- `src/components/editor/TiptapContentRenderer.tsx`
- `src/components/editor/QuizCardRenderer.tsx`, only when embedded quiz-card modules exist in saved content
- `src/components/layout/Layout.tsx`

Risk point:

`TiptapContentRenderer` renders saved public content through the full `TiptapEditor` in read-only mode. This makes the public page depend on `.tiptap-readonly` and `.public-tiptap-content` styles, and may also keep editor-related JS/CSS closer to public routes than necessary.

## Safe Optimization Order

### Phase 1: Measure Before Changing

For the target page, record:

- Page URL
- Lighthouse/PageSpeed run date
- Mobile and desktop scores
- Render-blocking CSS filenames and transfer sizes
- LCP, FCP, CLS, TBT
- Screenshot or report URL if available

Do not rely on hashed CSS filenames as stable identifiers.

### Phase 2: Move Admin-Only CSS First

This is the safest first CSS split.

Target:

- Move admin shell, admin tables, admin forms, admin modals, admin loading states, and admin compatibility styles out of `globals.css`.
- Put them in an admin-only stylesheet imported from `src/app/admin/layout.tsx`.

Why this is safe:

- Admin routes already have `src/app/admin/layout.tsx`.
- Public pages do not need admin selectors like `.admin-root`, `.admin-table`, `.admin-modal`, `.admin-field`, `.admin-content-management-page`.

Do not move shared `.user-*` classes in this phase because some admin compatibility styles still reference them and many public/user pages rely on them.

Validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm run lint
```

Then manually check:

- `/ati-teas-practice-test`
- `/admin`
- `/admin/nursing-entrance-exam`
- `/admin/nursing-exit-exam`
- `/admin/nursing-test-bank`

### Phase 3: Move Editor-Authoring CSS

Move editor-only selectors away from the global public path:

- `[contenteditable="true"]`
- `.tiptap-editor:not(.tiptap-readonly) ...`
- `.marketing-block-editor ...`
- `.admin-image-control-button`
- `.image-controls`
- `.resize-handle`
- `.alt-input-container`
- `.section-headings-list`

Likely destination:

- editor/admin stylesheet imported by admin editor components, or
- admin-only stylesheet if the editor is currently admin-only.

Do not move `.tiptap-readonly` or `.public-tiptap-content` yet. The public generated pages still use them.

### Phase 4: Create a Lightweight Public Read-Only Renderer

Current public generated pages use:

```text
TiptapContentRenderer -> TiptapEditor editable={false}
```

This is heavier than needed for static public article content.

Recommended later change:

- Create a lightweight public HTML renderer for sanitized saved content.
- Keep special handling for custom public blocks and quiz-card modules.
- Use read-only CSS only:
  - `.public-tiptap-content`
  - `.tiptap-readonly`
  - public CTA/link/table/FAQ block styles

This should reduce both CSS and JavaScript on public pages, but it is riskier than the admin CSS split because saved content may contain custom Tiptap structures.

### Phase 5: Split Public Generated Page CSS

After the renderer dependency is clear, move public generated-page CSS into a public route/component stylesheet:

- `.public-tiptap-content`
- `.tiptap-readonly`
- `.public-cta-block`
- `.public-internal-link-card`
- `.public-faq-content-block`
- `.public-comparison-table-block`
- `.public-guide-*`
- `.public-faq-*`

Keep the shared `.user-*` primitives global until the user dashboard, public pages, quiz pages, and admin compatibility layer are audited.

### Phase 6: Re-Measure

After each phase, run the same PageSpeed/Lighthouse check and compare:

- Render-blocking CSS transfer size
- Number of render-blocking CSS requests
- FCP
- LCP
- CLS
- Mobile screenshot/layout

Expected first meaningful target:

```text
Reduce the large first-party render-blocking CSS payload on /ati-teas-practice-test.
```

The goal is not zero render-blocking CSS. Some CSS must remain render-blocking for stable first paint.

## What Not To Do

- Do not remove `@import "tailwindcss"` from `globals.css`.
- Do not move root CSS variables until every dependent route has a replacement.
- Do not move `.user-*` primitives before auditing dashboard, quiz, public, and admin compatibility usage.
- Do not delete Tiptap readonly styles while public generated pages still use `TiptapContentRenderer`.
- Do not optimize based only on one hashed CSS filename.
- Do not make visual changes while splitting CSS unless the issue is caused by missing styles.

## Page Checklist

Use this checklist for any public page before CSS splitting:

1. Identify route file and layout.
2. Identify components used above the fold.
3. Identify global class families used by those components.
4. Identify admin/editor/dashboard styles currently loaded but not needed.
5. Move only one style family per commit.
6. Validate TypeScript and lint.
7. Check desktop and mobile render.
8. Re-run PageSpeed and record before/after numbers.

## Recommended First Implementation For ATI TEAS

Start with:

```text
Move admin-only CSS from src/app/globals.css into an admin-only stylesheet imported by src/app/admin/layout.tsx.
```

Reason:

- It has the clearest route boundary.
- It should reduce public CSS without changing public markup.
- It avoids the higher-risk Tiptap/public renderer work until after the first measurable CSS reduction.

After that:

```text
Move editor-authoring CSS out of the public global path.
```

Then:

```text
Replace public read-only Tiptap rendering with a lighter public renderer.
```

## Implementation Log

### 2026-07-30: Phase 2 Admin CSS Split

Completed:

- Moved the admin-only CSS block from `src/app/globals.css` into `src/app/admin/admin.css`.
- Imported `src/app/admin/admin.css` from `src/app/admin/layout.tsx`.
- Kept shared root tokens, body defaults, `.user-*` primitives, public generated-page styles, Tiptap readonly styles, and public guide/FAQ styles in `src/app/globals.css`.
- Reduced `src/app/globals.css` from about `5,476` lines to about `3,444` lines.
- Moved about `2,032` admin CSS lines into the admin route stylesheet.

Validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm run lint
npm run build
```

Results:

- TypeScript passed.
- Lint passed with only the existing `src/components/editor/Toolbar.tsx` hook dependency warning.
- Build smoke reached successful compilation and lint/type checks, then timed out during static page generation. This confirmed the admin stylesheet import is accepted by Next and does not fail compilation.
- The prebuild sidebar-data regeneration was reverted after the smoke run because it was unrelated to the CSS split.

Local CSS output after the smoke build showed separate CSS assets, including:

```text
4e9f1fe6e1f0f166.css   4.9 KB
878506a8f1ede162.css   16.6 KB
84f92a067e88de57.css   38.4 KB
13d3cb7c84d8cfe4.css   218.6 KB
```

Next step:

- Re-run PageSpeed for `/ati-teas-practice-test` after deployment and compare the render-blocking CSS report.
- If the public page still receives an oversized CSS asset, continue with Phase 3: move editor-authoring CSS out of the public global path.

### 2026-07-30: Phase 3 Editor-Authoring CSS Split

Completed:

- Moved clearly authoring-only editor CSS from `src/app/globals.css` into `src/app/admin/admin.css`.
- Moved:
  - `[contenteditable="true"]` rich text authoring styles.
  - `.tiptap-editor:not(.tiptap-readonly)` custom heading ID badge styles.
  - `.marketing-block-editor` controls and mobile rules.
  - image resize, image control, alt text, and section-heading editor controls.
- Kept public read-only content styles in `src/app/globals.css`, including:
  - `.tiptap-readonly`
  - `.public-tiptap-content`
  - `.public-guide-*`
  - `.public-faq-*`

Reason:

- Public generated pages, including `/ati-teas-practice-test`, still render saved content through `TiptapContentRenderer` and need read-only Tiptap/public article styles.
- Admin/editor authoring controls are not needed for first paint on public pages.

Current source sizes after this split:

```text
src/app/globals.css        ~2,974 lines
src/app/admin/admin.css    ~2,513 lines
```

Next step:

- Re-run PageSpeed after deployment.
- If render-blocking CSS is still high, the next meaningful reduction is the higher-risk renderer work: replace public read-only Tiptap rendering with a lighter public renderer.

## Related Critical Network Work

The `/ati-teas-practice-test` network dependency tree also showed Firebase Auth on the LCP critical path:

```text
auth/iframe.js
relyingparty/getProjectConfig
```

This is not a CSS issue. It was caused by the root layout mounting `AuthProviderWrapper` and `TawkToChat` for public pages.

Completed on 2026-07-30:

- Added `src/lib/public-route-performance.ts`.
- Skipped Firebase Auth listener startup on indexable public SEO pages, including `/ati-teas-practice-test`.
- Split the auth context from the Firebase-backed provider so public SEO pages can render with a lightweight anonymous auth context.
- Dynamically load the Firebase-backed provider only on routes where account/auth behavior is needed.
- Skipped Tawk chat injection on those same pages.
- Kept immediate auth behavior for protected/account/admin routes.

Expected result:

- `auth/iframe.js` and `relyingparty/getProjectConfig` should not appear in the initial critical chain for `/ati-teas-practice-test` after deployment.
- Cache TTL warnings for `auth/iframe.js` should disappear from this public page only if the Firebase Auth iframe is no longer requested. Its cache headers are controlled by Firebase, not by NursingMocks.

## Related Text LCP Work

The `/ati-teas-practice-test` LCP element was reported as above-fold paragraph text. For text LCP pages, font loading can affect when the final text paint is eligible for LCP.

Tested on 2026-07-30:

- Updating the root `Outfit` setup in `src/app/layout.tsx` to use the variable font default instead of explicitly listing seven static weights.
- This compiled in a production build smoke but failed in Turbopack local dev with `@vercel/turbopack-next/internal/font/google/font`.
- The change was reverted and the explicit weight list was restored.

Rule:

- Keep the explicit weight list until a font-loading change passes both local dev and production build.
- Keep checking the actual LCP element before changing image, server, or JavaScript behavior.

## Related Console Error Work

PageSpeed may report console errors such as:

```text
firestore.googleapis.com Listen/channel net::ERR_TIMED_OUT
```

For server-rendered public generated pages, this usually indicates that a client component is still making Firestore Web SDK reads after hydration.

Completed on 2026-07-30:

- Updated `src/components/layout/Layout.tsx` so `LayoutWithSidebar` skips the client-side pillar/category breadcrumb preload when `initialBreadcrumbItems` are already provided.

Reason:

- `src/app/[slug]/page.tsx` already builds public breadcrumbs on the server for generated pages.
- Running the layout preload again in the browser can create unnecessary Firestore transport requests and console noise.
- This keeps the existing sidebar/top menu layout while avoiding an unnecessary public-page Firestore request.

## TEAS Set Page Template Optimization

The TEAS set pages share the `pageType === "quiz"` branch in `src/app/[slug]/page.tsx`, so optimizing the shared quiz template and route-level providers affects all matching set URLs.

Completed on 2026-07-30:

- Added a TEAS set slug matcher in `src/lib/public-route-performance.ts`:

```text
/teas-{english|reading|science|math}-practice-test-set-{number}
```

- Kept chat skipped on those set pages.
- Lazy-load Firebase Auth on those set pages instead of disabling it permanently.
- Updated `src/contexts/AuthProviderClient.tsx` so the page can keep rendering while lazy auth resolves.

Reason:

- `DynamicQuizQuestions` uses auth to fetch full questions for signed-in users with access.
- Permanently deferring auth would improve public PageSpeed but could leave paid users stuck in preview mode.
- Lazy auth preserves the public first paint while allowing full-access checks after the page is interactive.
