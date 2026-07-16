# PageSpeed Optimization Plan

## Purpose

This document records the planned work for improving NursingMocks PageSpeed results on both mobile and desktop.

## Current Findings

- The homepage is currently a full client component through `src/app/NewHomePageClient.tsx`.
- The root layout loads Firebase auth globally through `AuthProviderWrapper`, including on public pages that do not need authenticated state at first paint.
- Public pages currently share `NewHeader`, which depends on auth, router, pathname, hover state, and mobile menu state.
- Tawk chat is injected globally for logged-out users through the root layout.
- TikTok pixel is loaded from the root layout when configured.
- Some public media assets are very large, especially GIFs in `public/gifs`.
- The root Google font loads many weights that are not needed on public pages.

## Primary Goal

Reduce public-page JavaScript, third-party script cost, hydration work, and media payload so homepage, pricing, contact, and legal pages perform better in PageSpeed and real-user Core Web Vitals.

## Phase 1: Measurement Setup

- Add repeatable PageSpeed or Lighthouse scripts for mobile and desktop.
- Track:
  - Performance score
  - Largest Contentful Paint
  - First Contentful Paint
  - Total Blocking Time
  - Cumulative Layout Shift
  - Speed Index
  - JavaScript transfer size
  - unused JavaScript and CSS
- Consider Vercel Speed Insights for real-user Core Web Vitals.

## Phase 2: Split Public, App, and Admin Layouts

Create route groups:

```text
src/app/(public)/layout.tsx
src/app/(app)/layout.tsx
src/app/(admin)/layout.tsx
```

Move public pages into `(public)`:

- `/`
- `/pricing`
- `/contact`
- `/about`
- legal pages
- company and marketing pages

Only authenticated user and admin areas should load Firebase auth providers, dashboard shell code, and admin-specific UI.

## Phase 3: Convert Homepage to Mostly Server Components

Target structure:

```text
src/app/(public)/page.tsx
src/components/home/HomePage.tsx
src/components/home/HomeQuiz.tsx
src/components/home/PublicHeader.tsx
```

- Keep the homepage shell, hero, sections, FAQ, and footer server-rendered.
- Isolate only the quiz as a small client component.
- Avoid loading auth state for the public homepage.

## Phase 4: Add Lightweight Public Header

- Create a public-only header that does not depend on Firebase auth.
- Keep simple `Login` and `Get Started` links.
- Move mobile menu state into the smallest possible client component.
- Keep the existing authenticated header/sidebar behavior for user and admin pages.

## Phase 5: Defer Third-Party Scripts

- Do not load Tawk globally on every public page.
- Load chat only after user action, after idle delay, or only on support/contact pages.
- Keep logged-in pages chat-free.
- Move TikTok pixel away from the root layout if possible.
- Load marketing pixels only on relevant funnel pages or after consent/idle.

## Phase 6: Optimize Images and Media

- Convert large GIFs to MP4, WebM, or optimized animated WebP.
- Lazy-load below-fold media.
- Use `next/image` for important visual assets.
- Add explicit `width`, `height`, or `aspect-ratio` values to reduce layout shift.
- Avoid preloading non-critical images.
- Keep the logo small and optimized.

## Phase 7: Reduce Font Payload

Current font loading includes many weights. Reduce public font weights to the smallest useful set:

```ts
weight: ["400", "500", "600", "700"]
```

Also standardize public pages so they do not mix unnecessary font systems.

## Phase 8: Bundle Audit

- Add `@next/bundle-analyzer`.
- Check whether these are entering public bundles unnecessarily:
  - Firebase auth
  - `react-icons`
  - dashboard/admin code
  - Tiptap/editor code
  - heavy shared providers
- Goal: reduce first-load JavaScript on public pages, especially the homepage.

## Phase 9: Page-Level Cleanup

Homepage:

- Keep above-fold content static.
- Hydrate only the quiz or interactive pieces.
- Defer floating WhatsApp/chat behavior if needed.

Pricing:

- Keep catalog loading, but render a static shell first.
- Avoid Firebase auth load until checkout click.

Contact:

- Keep the form as client-side behavior.
- Server-render the page shell, support cards, and static help content.

Legal Pages:

- Remove client components where no interactivity is needed.
- Keep pages server-rendered.

## Priority Order

1. Split public, app, and admin layouts.
2. Remove Firebase auth provider from public pages.
3. Replace public header with lightweight public-only header.
4. Convert homepage to server component with isolated client quiz.
5. Defer Tawk and TikTok scripts.
6. Optimize large GIF and media assets.
7. Reduce font weights.
8. Run PageSpeed mobile and desktop again.
9. Fix remaining report-specific audits.

## Expected Impact

The biggest gains should come from removing Firebase/auth/chat JavaScript from public pages and reducing homepage hydration. This should improve:

- Mobile performance score
- Total Blocking Time
- First Contentful Paint
- Largest Contentful Paint
- Speed Index
- Interaction readiness

