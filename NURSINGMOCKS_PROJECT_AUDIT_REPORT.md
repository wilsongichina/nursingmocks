# NursingMocks Project Audit Report

Project folder:
`C:\Users\wilso\OneDrive\Desktop\nursingmocks\NursingMocksProject`

Repository imported from:
`https://github.com/wilsongichina/teas-gurus-new.git`

Local dev URL:
`http://localhost:3000`

Framework:
Next.js 15.3.8, React 19, Firebase, SendGrid, TikTok Pixel, Tailwind-style utility classes.

Report purpose:
This document explains how the project is connected, what every major page group does, what needs checking page by page, and the highest-risk issues found during the first pass.

---

## 1. Executive Summary

The project is a hybrid application, not a simple static site. It has:

- Hard-coded marketing pages.
- Firebase-backed CMS pages.
- Admin pages that create/edit Firestore content.
- Dynamic public pages powered by route mappings.
- Auth-gated user dashboard/profile pages.
- Stripe/Stan Store checkout links.
- TikTok tracking.
- SendGrid email APIs.
- Legal/support pages.

The biggest current risks are:

1. `robots.ts` blocks almost the entire site from search engines.
2. Branding is inconsistent: many files still say `TEAS Gurus` or `teasgurus.com`.
3. Several visible pages contain corrupted characters such as `Â`, `â`, and broken emoji encodings.
4. Admin protection is only client-side with a hard-coded password.
5. Revenue flow is split between `/pricing`, `/prices`, `/teas`, `/teas-7-practice`, Stripe, and Stan Store.
6. SEO sitemap is incomplete and includes pages that do not match the actual app structure.
7. Dependency audit reports production vulnerabilities, including one critical advisory.
8. Firebase Storage rules allow any authenticated user to write to all storage paths.

Recommended first fixes:

1. Fix `robots.ts` and `sitemap.ts`.
2. Decide the real brand/domain: `NursingMocks` and `nursingmocks.com`, then remove TEAS Gurus remnants.
3. Normalize checkout flow and analytics.
4. Fix encoding corruption across visible copy and metadata.
5. Harden admin access and Firebase rules.

---

## 2. Verification Results

Commands already run:

- `npm install` completed.
- `npm run lint` passed with no warnings or errors.
- `npm run build` completed successfully on the second run.
- Production build generated 94 pages.

Important side effect:

Running `npm run build` triggers:

`node scripts/generate-sidebar-data.js`

That regenerated:

- `public/data/sidebar-data.json`
- `src/lib/data/sidebar-data.ts`

Those files now show as modified in Git. They are generated files, not manual edits.

Dependency audit:

`npm audit --omit=dev` reports:

- 1 critical
- 5 high
- 4 moderate

Packages involved include:

- `next`
- `protobufjs`
- `axios`
- `form-data`
- `markdown-it`
- `linkify-it`
- `follow-redirects`
- `@grpc/grpc-js`

Do not blindly run `npm audit fix --force` without testing because it changes Next.js version.

---

## 3. Top-Level Project Structure

Important folders:

- `src/app`: Next.js App Router pages, layouts, API routes.
- `src/components`: Shared UI, layout, analytics, editor, quiz, and section components.
- `src/contexts`: Global React contexts, especially auth.
- `src/lib`: Firebase, Firestore operations, config, SendGrid, data helpers.
- `src/data`: JSON content files.
- `public`: Static assets and generated sidebar data.
- `scripts`: Build-time scripts, especially sidebar generation.

Important top-level files:

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next image/security config.
- `firebase.json`: Firebase storage rule reference.
- `storage.rules`: Firebase Storage security rules.
- `DOMAIN_MIGRATION_SUMMARY.md`: Claims old hardcoded URLs were migrated, but the current code still contains many old references.
- `README.md`: Still generic Next.js starter content.

Suspicious/cleanup candidates:

- `!v)}`: zero-byte file.
- `{`: zero-byte file.
- `tmp_questioncard.tsx`: zero-byte file.
- `temp_edit_page.txt`: large temporary text file.

Do not delete these until confirmed, but they should be reviewed.

---

## 4. Global App Wiring

### `src/app/layout.tsx`

This is the root layout for the entire app.

It does the following:

- Loads the Outfit Google font.
- Imports `globals.css`.
- Defines global metadata.
- Loads TikTok Pixel globally.
- Wraps all pages in `AuthProviderWrapper`.
- Adds `TawkToChat` globally.

Important dependencies:

- `AuthProviderWrapper`
- `TawkToChat`
- `getSiteUrl`
- `getSiteName`
- `getImageUrl`

Issues:

- TikTok Pixel ID is hard-coded.
- Global metadata is still TEAS-oriented in places.
- Google verification is placeholder: `your-google-verification-code`.
- If the pixel is needed only after consent, no consent gating currently appears.

### `src/app/globals.css`

Global CSS affects the entire app.

Audit focus:

- Check whether older TEAS Gurus styles conflict with new NursingMocks styles.
- Check global body width/overflow.
- Check mobile typography.
- Check repeated utility classes or custom gradients.
- Check any styles used by `/teas-7-practice` if that page relies heavily on inline CSS.

---

## 5. Shared Layout System

### `src/components/layout/Layout.tsx`

This is the main page shell used by many public pages.

It decides whether to render:

- Header/no header.
- Sidebar/no sidebar.
- Mobile breadcrumb.
- Footer.
- Floating WhatsApp button.

It also loads breadcrumb data from Firestore for dynamic content pages.

Important connections:

- `Header`
- `NewFooter`
- `Sidebar`
- `SidebarContext`
- `AuthContext`
- `MobileBreadcrumb`
- `FloatingWhatsAppButton`
- Firestore functions from `firestore-operations.ts`

Issues:

- Very large component with many responsibilities.
- Breadcrumb logic fetches Firestore data client-side.
- Sidebar mode is inferred from route path.
- Some pages bypass this layout and directly use `NewHeader`/`NewFooter`, so width and navigation consistency can drift.

### `src/components/layout/Header.tsx`

Older header used by `LayoutWithoutSidebar`.

Navigation includes:

- Home
- TEAS
- Hesi A2
- Nursing
- Company dropdown
- Blog
- Contact
- Get Started/login state

Issues:

- Uses routes like `/hesi-a2` and `/nursing`, but these route folders were not found in the route list.
- Company dropdown includes `/how-it-works` and `/faqs`, but those route folders were not found.
- This can create broken links unless handled by dynamic `[slug]`.

### `src/components/layout/NewHeader.tsx`

Newer NursingMocks-style header.

Used directly by:

- Homepage
- `/pricing`
- legal pages
- contact
- cookie policy
- tiptap

Issues:

- Contains corrupted character for dropdown arrow.
- Some navigation links point to routes like `/ati-teas/...` and `/hesi-a2/...`; these need route validation.
- Uses hard-coded inline styling heavily.

### `src/components/layout/NewFooter.tsx`

Newer footer.

Used by both normal pages and sidebar pages.

Issues:

- Contains corrupted separator characters.
- Legal links look correct structurally.
- Business identity says `WILKAM AXIS LTD`; verify if this is the correct legal entity for NursingMocks.

### `src/components/layout/Footer.tsx`

Older footer.

Issues:

- Still links to TEAS Gurus social profiles.
- May be unused or partially used. Confirm before deleting.

---

## 6. Auth System

### `src/components/providers/AuthProviderWrapper.tsx`

Thin wrapper around `AuthProvider`.

### `src/contexts/AuthContext.tsx`

Central auth provider.

Uses Firebase Auth for:

- Email/password register.
- Email/password login.
- Google login.
- Logout.
- Password reset.

Also creates/updates Firestore user document via:

- `ensureUserDocumentOnRegister`

Issues:

- Password reset fallback URL is `https://teasgurus.com/reset-password`.
- App waits until auth loading completes before rendering children. This avoids auth flicker but can delay the whole site.
- Google login and email registration depend on Firebase project `teas-gurus`.

---

## 7. Firebase And Data Layer

### `src/lib/firebase.ts`

Initializes Firebase app.

Current Firebase project:

- `projectId: teas-gurus`
- `authDomain: teas-gurus.firebaseapp.com`
- `storageBucket: teas-gurus.firebasestorage.app`

Issues:

- NursingMocks is using the old TEAS Gurus Firebase project.
- Public Firebase config is expected in client apps, but project ownership and rules must be correct.

### `src/lib/firestore-operations.ts`

This is the central CMS/data operation file.

It handles:

- Page content.
- Blog content.
- Blog categories.
- Pillar pages.
- Sub-pages.
- Nested sub-pages.
- Topics.
- Quizzes.
- Questions.
- Knowledge base articles.
- Route mappings.
- Counts and navigation data.
- Storage uploads.

Issues:

- Very large file with many responsibilities.
- Many write/delete functions are imported by admin client pages.
- Security depends heavily on Firestore rules, which were not found locally.
- Many old domain fallbacks still use `teasgurus.com`.

### `src/lib/data/sidebar-data.ts`

Generated TypeScript sidebar data.

Generated by:

`scripts/generate-sidebar-data.js`

Do not manually edit unless necessary. Fix the generator instead.

### `public/data/sidebar-data.json`

Generated JSON sidebar data.

Same caution as above.

---

## 8. Email System

### `src/lib/sendgrid.ts`

Handles:

- Contact email.
- Welcome email.

Issues:

- Default sender/recipient emails are old personal/Gmail addresses.
- Sender name says `TEAS Gurus Contact Form`.
- Welcome email fallback site URL is `https://teasgurus.com`.
- Email copy still mentions TEAS/HESI and may not match NursingMocks product structure.

### `src/app/api/contact/route.ts`

Receives contact form requests.

Accepts JSON or multipart form data.

Issues:

- Logs sender/recipient details.
- Does not appear to rate-limit.
- Attachment is parsed but not visibly sent in the SendGrid helper.

### `src/app/api/send-welcome-email/route.ts`

Sends welcome email.

Issues:

- Requires only name/email in request body.
- No visible auth/rate limit.
- Could be abused if publicly callable.

---

## 9. Analytics

### TikTok Pixel

Global pixel:

- `src/app/layout.tsx`
- Pixel ID: `D6PV3SJC77U1CBCKK130`

Purchase event:

- `src/components/analytics/TikTokThankYouPurchaseScript.tsx`

ViewContent and InitiateCheckout:

- `src/app/teas-7-practice/page.tsx`

Issues:

- Tracking is inconsistent across checkout paths.
- Purchase value is hard-coded as 99.
- Product identity is hard-coded as `teas_7_bundle`.
- If multiple products exist, events need product-specific parameters.
- No clear consent handling.

Recommended analytics map:

- Homepage: optional pageview only.
- Product page: ViewContent.
- Checkout button click: InitiateCheckout.
- Thank-you page after successful payment: Purchase.
- All event IDs should be deterministic enough for deduplication if server-side events are added later.

---

## 10. SEO And Indexing

### `src/app/robots.ts`

Current behavior:

- Allows only `/`.
- Disallows everything else.

This is a critical SEO blocker.

Recommended behavior:

- Allow public pages.
- Disallow admin and private pages.
- Disallow dashboard/profile/payment/account pages if appropriate.
- Include correct sitemap URL.

### `src/app/sitemap.ts`

Current sitemap includes:

- Home
- `/services`
- `/about`
- `/contact`
- `/testimonials`

Issues:

- `/services` and `/testimonials` do not appear in the route inventory.
- Important pages are missing.
- Dynamic routes from Firebase are not represented.

Recommended sitemap includes:

- `/`
- `/pricing`
- `/teas-7-practice`
- `/nursing-entrance-exam`
- `/nursing-exit-exam`
- `/nursing-test-bank`
- `/knowledge-base`
- `/blog`
- `/contact`
- `/privacy-policy`
- `/terms-and-conditions`
- `/money-back-guarantee`
- important dynamic route mappings from Firestore

---

## 11. Security

### Admin password

Admin layout:

- `src/app/admin/layout.tsx`

API auth:

- `src/app/api/admin/auth/route.ts`

Current password:

- Hard-coded in source.

Issues:

- Client-side password check is not real server protection.
- `sessionStorage` only hides/shows admin UI.
- If Firestore rules allow writes, a user may bypass UI.

Recommended:

- Move admin authentication to Firebase Auth custom claims or server-side session.
- Protect admin routes and API routes.
- Restrict Firestore writes to admin users only.
- Remove hard-coded password from source.

### Firebase Storage rules

`storage.rules` allows:

- Public read for all files.
- Write for any authenticated user to all paths.

Risk:

Any logged-in user could upload/overwrite files if they can access the client methods.

Recommended:

- Public read only where needed.
- Admin-only writes for CMS/media folders.
- User-specific writes only under user-owned folders.

### API routes

Current API routes:

- `/api/admin/auth`
- `/api/contact`
- `/api/send-welcome-email`

Recommended:

- Rate limit public email endpoints.
- Validate body sizes.
- Require auth/admin for admin endpoints.
- Avoid exposing operational details in responses/logs.

---

## 12. Page-By-Page Route Audit

This section lists every route found under `src/app`.

### `/`

Files:

- `src/app/page.tsx`
- `src/app/NewHomePageClient.tsx`

Purpose:

Main homepage.

Uses:

- `NewHeader`
- `NewFooter`
- `FloatingWhatsAppButton`
- `AuthContext`

Audit notes:

- New NursingMocks branding is present.
- Contains quiz logic that redirects unauthenticated users to `/register` after quiz completion.
- Contains corrupted characters.
- Heavy hard-coded styling.
- CTA flow should be checked against the final product strategy.
- Metadata contains corrupted dash in title.

Priority:
High.

### `/about`

File:

- `src/app/about/page.tsx`

Purpose:

Company/about page.

Uses:

- `Layout`
- likely old schema component.

Audit notes:

- Still says TEAS Gurus.
- Metadata and open graph use old brand/domain.
- Content appears to describe old TEAS exam help service, not NursingMocks.

Priority:
High if page remains public.

### `/contact`

File:

- `src/app/contact/page.tsx`

Purpose:

Contact/support page.

Uses:

- `NewHeader`
- Contact form/API.

Audit notes:

- Metadata includes TEAS Gurus keywords.
- Verify form fields match `sendgrid.ts`.
- Verify support contact identity and destination email.

Priority:
High.

### `/cookie-policy`

File:

- `src/app/cookie-policy/page.tsx`

Purpose:

Cookie and tracking notice.

Audit notes:

- Still says TEAS Gurus repeatedly.
- Uses `support@teasgurus.com`.
- Must match actual tracking tools: TikTok, Tawk, Firebase, Stripe/Stan Store if applicable.

Priority:
High for compliance.

### `/guarantees`

File:

- `src/app/guarantees/page.tsx`

Purpose:

Guarantees page.

Audit notes:

- Metadata says TEAS Gurus.
- Confirm whether guarantees are still legally/commercially accurate.

Priority:
Medium-high.

### `/money-back-guarantee`

File:

- `src/app/money-back-guarantee/page.tsx`

Purpose:

Refund/money-back policy page.

Uses:

- `NewHeader`

Audit notes:

- Review policy consistency with payment provider.
- Must match actual refund terms shown during checkout.

Priority:
High.

### `/privacy-policy`

File:

- `src/app/privacy-policy/page.tsx`

Purpose:

Privacy policy.

Uses:

- `NewHeader`

Audit notes:

- Must match Firebase Auth, Firestore, Tawk, SendGrid, TikTok, Stripe/Stan Store.
- Verify company name, contact email, country/legal jurisdiction.

Priority:
High.

### `/terms-and-conditions`

File:

- `src/app/terms-and-conditions/page.tsx`

Purpose:

Terms page.

Uses:

- `NewHeader`

Audit notes:

- Verify terms match actual product: practice materials/subscription/test bank.
- Remove any language implying exam cheating or taking exams for users.

Priority:
High.

### `/pricing`

File:

- `src/app/pricing/page.tsx`

Purpose:

Newer NursingMocks pricing page.

Uses:

- `NewHeader`
- `NewFooter`

Audit notes:

- Looks visually newer.
- Plan CTAs are buttons, not links, in the inspected section.
- Must connect to real checkout or registration.
- Monthly/yearly toggle is UI-only unless wired later.
- Needs final product/pricing confirmation.

Priority:
Very high.

### `/prices`

File:

- `src/app/prices/page.tsx`

Purpose:

Older pricing/services page.

Uses:

- `Layout`
- `PricesPageSchema`
- `ContactForm`

Audit notes:

- Strong old TEAS Gurus content.
- Mentions `Take My Teas Exam`, guaranteed scores, and old service model.
- This may be legally/commercially risky and inconsistent with NursingMocks.
- Decide whether to delete, redirect, or rewrite.

Priority:
Very high.

### `/payments`

File:

- `src/app/payments/page.tsx`

Purpose:

Auth-gated payments/subscription placeholder.

Uses:

- `Layout`
- `AuthContext`

Audit notes:

- Redirects unauthenticated users to `/login`.
- Currently only displays `Payments & Subscription`.
- Needs actual subscription/customer portal if retained.

Priority:
Medium.

### `/thank-you`

Files:

- `src/app/thank-you/page.tsx`
- `src/components/thank-you/ThankYouNursingMocksDesign.tsx`
- `src/components/analytics/TikTokThankYouPurchaseScript.tsx`

Purpose:

Post-purchase thank-you page.

Audit notes:

- Fires TikTok Purchase.
- Metadata uses `https://teasgurus.com/thank-you`.
- Copy says Dropbox access.
- Dropbox link is hard-coded.
- Purchase value is hard-coded as 99.

Priority:
Very high for ad tracking and fulfillment.

### `/teas/thank-you`

File:

- `src/app/teas/thank-you/page.tsx`

Purpose:

Alternate TEAS thank-you page.

Audit notes:

- Likely duplicates `/thank-you`.
- Fires same purchase script.
- Metadata uses old domain.
- Decide whether this should redirect to `/thank-you`.

Priority:
High.

### `/teas`

File:

- `src/app/teas/page.tsx`

Purpose:

TEAS product page.

Audit notes:

- Contains Stripe links with old `teasgurus.com` success/cancel URLs.
- Uses `Layout`, not the newer homepage shell.
- Needs alignment with `/teas-7-practice` and `/pricing`.

Priority:
Very high.

### `/teas-7-practice`

File:

- `src/app/teas-7-practice/page.tsx`

Purpose:

TEAS Version 7 sets library / preview/purchase page.

Uses:

- External Mammoth script.
- External PDF.js script.
- `/teas-7-practice/library.js`.
- TikTok ViewContent.
- TikTok InitiateCheckout on purchase click.

Audit notes:

- Purchase link currently points to Stan Store.
- Button says 10 sets in the inspected code.
- Some text contains corrupted characters.
- Page has a lot of inline CSS and script dependencies.
- Must verify mobile, document previews, external scripts, and analytics.

Priority:
Very high.

### `/teas-7-practice-old`

File:

- `src/app/teas-7-practice-old/page.tsx`

Purpose:

Older version of TEAS practice page.

Audit notes:

- Decide whether it should remain public.
- If not needed, redirect or remove from sitemap.

Priority:
Medium.

### `/login`

Files:

- `src/app/login/page.tsx`
- `src/app/login/LoginPageClient.tsx`
- `src/components/ui/LoginForm.tsx`

Purpose:

User login.

Audit notes:

- Metadata still says TEAS Gurus.
- Verify Google login behavior.
- Verify redirect after login.
- Verify errors are user-friendly.

Priority:
High.

### `/register`

Files:

- `src/app/register/page.tsx`
- `src/app/register/RegisterPageClient.tsx`
- `src/components/ui/RegisterForm.tsx`

Purpose:

User registration.

Audit notes:

- Metadata still says TEAS Gurus.
- Some success text still says TEAS Gurus.
- Must verify program type/focus area options.
- Welcome email flow should be checked.

Priority:
High.

### `/forgot-password`

Files:

- `src/app/forgot-password/page.tsx`
- `src/components/ui/ForgotPasswordForm.tsx`

Purpose:

Password reset request.

Audit notes:

- Metadata says TEAS Gurus.
- Password reset action URL fallback in auth context is old domain.

Priority:
Medium-high.

### `/reset-password`

Files:

- `src/app/reset-password/page.tsx`
- `src/app/reset-password/ResetPasswordPageClient.tsx`
- `src/components/ui/ResetPasswordForm.tsx`

Purpose:

Password reset completion.

Audit notes:

- Metadata says TEAS Gurus.
- Verify Firebase reset link behavior.

Priority:
Medium-high.

### `/dashboard`

File:

- `src/app/dashboard/page.tsx`

Purpose:

User dashboard.

Uses:

- `Layout`
- Auth state.

Audit notes:

- Auth protection should be verified.
- Determine whether it is complete or placeholder.
- Exclude from sitemap/SEO.

Priority:
Medium.

### `/profile`

File:

- `src/app/profile/page.tsx`

Purpose:

User profile.

Audit notes:

- Large route bundle size in build output.
- Needs mobile and auth testing.
- Verify Firestore user document reads/writes.

Priority:
Medium-high.

### `/progress-reports`

File:

- `src/app/progress-reports/page.tsx`

Purpose:

Likely auth-gated progress page.

Audit notes:

- Build output suggests small placeholder.
- Exclude from SEO if private.

Priority:
Low-medium.

### `/referrals`

File:

- `src/app/referrals/page.tsx`

Purpose:

Referral page.

Audit notes:

- Build output suggests small placeholder.
- Determine if public or private.

Priority:
Low-medium.

### `/blog`

File:

- `src/app/blog/page.tsx`

Purpose:

Blog index.

Uses:

- Firestore blog data.
- `Layout`.

Audit notes:

- Verify empty-state behavior.
- Verify metadata.
- Verify old TEAS content vs NursingMocks content.

Priority:
Medium-high.

### `/blog/[blogSlug]`

Files:

- `src/app/blog/[blogSlug]/page.tsx`
- `src/app/blog/[blogSlug]/ClientPage.tsx`

Purpose:

Individual blog page.

Audit notes:

- It fetches all blogs then matches slug by title transformation.
- If blog not found, returns `null` instead of `notFound()`.
- This can produce blank pages instead of 404.
- SEO metadata should be checked.

Priority:
High.

### `/knowledge-base`

File:

- `src/app/knowledge-base/page.tsx`

Purpose:

Knowledge base index.

Audit notes:

- Uses `Layout`.
- Verify Firestore content.
- Verify mobile/sidebar behavior.

Priority:
Medium.

### `/knowledge-base/[subPage]`

File:

- `src/app/knowledge-base/[subPage]/page.tsx`

Purpose:

Knowledge base article route.

Audit notes:

- Build generated one static page: `/knowledge-base/ati-teas-practice-test`.
- Need verify all expected KB pages are available.

Priority:
Medium-high.

### `/nursing-entrance-exam`

File:

- `src/app/nursing-entrance-exam/page.tsx`

Purpose:

Public pillar page.

Uses:

- `Layout`

Audit notes:

- Likely uses sidebar layout by route inference.
- Needs width/mobile consistency check.
- Needs content/metadata check.

Priority:
High.

### `/nursing-exit-exam`

File:

- `src/app/nursing-exit-exam/page.tsx`

Purpose:

Public pillar page.

Uses:

- `Layout`

Audit notes:

- Needs route/content/metadata check.
- Build generated child static params.

Priority:
High.

### `/nursing-exit-exam/[subPageId]`

File:

- `src/app/nursing-exit-exam/[subPageId]/page.tsx`

Purpose:

Dynamic subpages under nursing exit exam.

Build generated:

- `/nursing-exit-exam/rn-exit-exams`
- `/nursing-exit-exam/rn-exit-exams-exit-exam`
- `/nursing-exit-exam/lpn-exit-exams`
- `/nursing-exit-exam/lpn-exit-exams-exit-exam`

Audit notes:

- Some generated slugs look repetitive.
- Metadata fallback still uses `teasgurus.com`.
- Needs canonical review.

Priority:
High.

### `/nursing-test-bank`

File:

- `src/app/nursing-test-bank/page.tsx`

Purpose:

Public nursing test bank landing page.

Audit notes:

- Contains corrupted characters and emoji encodings.
- Uses `Layout`.
- Strong product page; should be SEO and conversion audited carefully.

Priority:
High.

### `/[slug]`

File:

- `src/app/[slug]/page.tsx`

Purpose:

Main dynamic public route resolver.

Uses:

- Firestore route mappings.
- CMS content.
- `Layout`.
- Content renderers.
- Quiz cards.
- FAQ accordion.
- Knowledge base viewer.

Build generated:

- 36 static dynamic routes, excluding pillar pages.

Audit notes:

- This is one of the most important files in the app.
- It decides how many CMS-created pages become public.
- Needs careful review of `notFound()` behavior.
- Needs canonical and schema review.
- Needs performance review because first load JS is large.
- Needs route conflict review against hard-coded routes.

Priority:
Very high.

### `/serviceIdTest/question/[question_title]`

Files:

- `src/app/serviceIdTest/layout.tsx`
- `src/app/serviceIdTest/question/[question_title]/page.tsx`

Purpose:

Testing route for question pages.

Audit notes:

- Name suggests temporary/test route.
- Determine if this should exist in production.
- Metadata uses old fallback domain.

Priority:
Medium.

### `/tiptap`

File:

- `src/app/tiptap/page.tsx`

Purpose:

Editor/test page.

Audit notes:

- Likely should not be public unless intentionally used.
- If internal, protect or remove from sitemap.

Priority:
Medium.

---

## 13. Admin Page Audit

All admin routes are under:

`src/app/admin`

Protected by:

`src/app/admin/layout.tsx`

Important issue:

The protection is client-side only and uses a hard-coded password.

### `/admin`

Purpose:

Admin dashboard.

Uses:

- `AdminSidebar`
- `SidebarProvider`
- `UserProfileBadge`
- `AuthContext`

Audit notes:

- The page itself shows login/register options if Firebase user is missing, but admin password auth is separate.
- Clarify whether admin should be password-only or Firebase-admin only.

### `/admin/blog`

Purpose:

Manage blog posts.

Audit notes:

- Verify create/edit/delete permissions.
- Verify slug generation.
- Verify blog metadata.

### `/admin/blog/create`

Purpose:

Create blog post.

Audit notes:

- Verify editor output is safe to render.
- Verify schema/metadata fields.

### `/admin/blog/[blogId]`

Purpose:

Edit blog post.

Audit notes:

- Verify missing blog behavior.
- Verify delete behavior.

### `/admin/pillarpages`

Purpose:

Manage generic pillar pages.

Audit notes:

- Check whether still used now that main nursing pages have dedicated admin routes.

### `/admin/pillarpages/create`

Purpose:

Create pillar page.

Audit notes:

- Uses old domain placeholders in places.
- Verify canonical creation.

### `/admin/pillarpages/[pillarPageId]`

Purpose:

Edit pillar page.

Audit notes:

- Uses old domain fallbacks/placeholders.

### `/admin/pillarpages/[pillarPageId]/services`

Purpose:

Manage services under a pillar page.

Audit notes:

- Could be old TEAS Gurus service model.
- Decide if still part of NursingMocks.

### `/admin/question`

Purpose:

Question list/manage.

Audit notes:

- Verify query scale/performance.
- Verify who can create/update/delete.

### `/admin/question/create`

Purpose:

Create a question.

Audit notes:

- Generates schema using old `teasgurus.com` URLs.
- Needs brand/domain cleanup.

### `/admin/question/[questionId]`

Purpose:

Edit a question.

Audit notes:

- Generates schema using old `teasgurus.com` URLs.
- Needs brand/domain cleanup.

### `/admin/question-types`

Purpose:

Manage question types.

Audit notes:

- Verify how this connects to quizzes and public filtering.

### Nursing entrance admin routes

Routes:

- `/admin/nursing-entrance-exam`
- `/admin/nursing-entrance-exam/edit`
- `/admin/nursing-entrance-exam/[subPageId]`
- `/admin/nursing-entrance-exam/[subPageId]/manage`
- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]`
- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/bulk-upload`
- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/manage`
- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/create`
- `/admin/nursing-entrance-exam/[subPageId]/nested/[nestedSubPageId]/quizzes/[quizId]/questions/[questionId]`
- `/admin/nursing-entrance-exam/kb-articles/[kbArticleId]`

Purpose:

Manage the entrance exam hierarchy, nested pages, quizzes, questions, and KB articles.

Audit notes:

- Verify route mapping creation.
- Verify slug uniqueness.
- Verify quiz question upload.
- Verify image upload permissions.
- Verify metadata/canonical domain.

### Nursing exit admin routes

Routes mirror nursing entrance, with an extra nested manage page:

- `/admin/nursing-exit-exam`
- `/admin/nursing-exit-exam/edit`
- `/admin/nursing-exit-exam/[subPageId]`
- `/admin/nursing-exit-exam/[subPageId]/manage`
- `/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]`
- `/admin/nursing-exit-exam/[subPageId]/nested/[nestedSubPageId]/manage`
- quiz/question routes
- KB article route

Audit notes:

- Build generated some repetitive public slugs.
- Route mapping and canonical generation need close review.

### Nursing test bank admin routes

Routes:

- `/admin/nursing-test-bank`
- `/admin/nursing-test-bank/edit`
- `/admin/nursing-test-bank/[subPageId]`
- `/admin/nursing-test-bank/[subPageId]/manage`
- `/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]`
- `/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/manage`
- `/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]`
- `/admin/nursing-test-bank/[subPageId]/nested/[nestedSubPageId]/topics/[topicId]/manage`
- topic quiz/question routes
- KB article route

Purpose:

Most complex content hierarchy in the app.

Audit notes:

- Contains sub-pages, nested pages, topics, quizzes, and questions.
- Needs the strongest data integrity checks.
- Verify route mapping cleanup when slugs change.
- Verify deleting content also cleans route mappings and dependent children.

---

## 14. Component Groups

### Layout components

- `AdminSidebar`
- `Footer`
- `Header`
- `Layout`
- `NewFooter`
- `NewHeader`
- `Sidebar`
- `SidebarContext`
- `UserProfileBadge`

Audit focus:

- Broken links.
- Duplicate navigation.
- Width consistency.
- Mobile menus.
- Brand consistency.
- Whether old `Footer` is still needed.

### UI components

Important examples:

- `ContactForm`
- `SupportContactForm`
- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `SchemaScripts`
- `FirebaseImage`
- `FloatingWhatsAppButton`
- `TawkToChat`
- `MobileBreadcrumb`

Audit focus:

- Validation.
- Error states.
- Accessibility.
- Mobile layout.
- Brand copy.
- Schema correctness.

### Editor components

Important examples:

- `TiptapEditor`
- `Toolbar`
- `TiptapContentRenderer`
- `QuizCardModal`
- `QuizCardRenderer`
- custom extensions.

Audit focus:

- Stored HTML safety.
- XSS risk.
- Image handling.
- Table rendering on mobile.
- Editor output compatibility with public renderers.

### Quiz components

- `QuestionCard`
- `QuizCTACard`

Audit focus:

- Correct answers/explanations.
- Navigation.
- State persistence.
- Mobile usability.
- Analytics opportunity.

---

## 15. Content And Copy Issues

Known current copy problems:

- Mixed NursingMocks and TEAS Gurus branding.
- Old domain references.
- Old social links.
- Old support emails.
- Corrupted encoded characters.
- Possible claims that need legal review, such as guaranteed scores or exam-taking services.

High-risk old wording areas:

- `/prices`
- `/about`
- `/guarantees`
- `/cookie-policy`
- schema components
- email templates
- admin-generated schema templates

Recommended copy standard:

- Use `NursingMocks` consistently.
- Use `nursingmocks.com` consistently.
- Avoid implying anyone takes exams for students.
- Position product as practice tests, study materials, test banks, quizzes, analytics, and prep support.

---

## 16. Revenue Flow Decision Needed

Current possible purchase paths:

1. `/pricing` plan CTAs.
2. `/prices` old service CTAs.
3. `/teas` old Stripe checkout.
4. `/teas-7-practice` Stan Store checkout.
5. `/thank-you` Dropbox fulfillment.
6. `/teas/thank-you` duplicate fulfillment/tracking.

Decision needed:

- Is the product a one-time bundle?
- Is the product a subscription?
- Is checkout Stripe or Stan Store?
- Which thank-you page is canonical?
- Are files delivered by Dropbox, email, dashboard, or all three?

Recommended final flow:

Product page -> checkout click fires InitiateCheckout -> payment -> `/thank-you` -> Purchase event -> clear access instructions.

Then remove or redirect duplicate old pages.

---

## 17. Build And Performance Notes

Build output:

- Homepage first load: about 278 kB.
- Dynamic `[slug]`: about 459 kB first load.
- Profile: about 343 kB first load.
- Admin/content pages: many around 280-449 kB.

Performance audit focus:

- Dynamic public content pages.
- Tiptap editor routes.
- Profile route.
- Firebase client calls.
- External scripts on `/teas-7-practice`.
- Image optimization remote patterns.

---

## 18. Mobile Audit Checklist

Every public page should be checked at:

- 390 x 844 mobile.
- 768 x 1024 tablet.
- 1440 desktop.

Check:

- Header menu opens and closes.
- No horizontal scrolling.
- Buttons fit.
- Cards do not overflow.
- Footer legal links wrap cleanly.
- Sidebar pages still fit mobile.
- Breadcrumb does not cover content.
- Floating WhatsApp button does not block CTAs.
- `/teas-7-practice` sticky buy button does not block previews.
- Thank-you page mobile button works.

---

## 19. Page Groups By Priority

### Priority 1: Revenue and discoverability

- `/`
- `/pricing`
- `/teas-7-practice`
- `/teas`
- `/thank-you`
- `/teas/thank-you`
- `robots.ts`
- `sitemap.ts`

### Priority 2: Trust and compliance

- `/privacy-policy`
- `/terms-and-conditions`
- `/money-back-guarantee`
- `/cookie-policy`
- `/contact`
- email templates
- schema components

### Priority 3: Account flow

- `/register`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/profile`

### Priority 4: SEO content engine

- `/nursing-entrance-exam`
- `/nursing-exit-exam`
- `/nursing-exit-exam/[subPageId]`
- `/nursing-test-bank`
- `/knowledge-base`
- `/knowledge-base/[subPage]`
- `/blog`
- `/blog/[blogSlug]`
- `/[slug]`

### Priority 5: Admin/content management

- all `/admin/...` routes
- Firestore rules
- Storage rules
- route mapping lifecycle
- generated sidebar data

---

## 20. Immediate Fix Checklist

1. Fix `robots.ts` so public pages are indexable.
2. Rebuild `sitemap.ts` from real routes.
3. Replace TEAS Gurus metadata/copy/social/email/domain references.
4. Fix corrupted characters across source files.
5. Decide one checkout provider and one canonical thank-you page.
6. Add proper checkout links to `/pricing`.
7. Remove, rewrite, or redirect `/prices`.
8. Standardize TikTok events across the real purchase flow.
9. Move admin password to real auth or remove password-only admin.
10. Lock Firebase Storage writes to admin users.
11. Check Firestore security rules in Firebase console.
12. Update dependency versions safely and retest build.
13. Decide whether `/tiptap` and `/serviceIdTest` should be public.
14. Remove or document zero-byte/temp files.
15. Update README with real project instructions.

---

## 21. Suggested Study Plan

Study the project in this order:

1. Read `src/app/layout.tsx`.
2. Read `src/components/layout/Layout.tsx`.
3. Read `src/lib/config.ts`.
4. Read `src/lib/firebase.ts`.
5. Read `src/contexts/AuthContext.tsx`.
6. Read `src/lib/firestore-operations.ts` by section, not all at once.
7. Read `src/app/page.tsx` and `src/app/NewHomePageClient.tsx`.
8. Read `/pricing`, `/teas-7-practice`, `/teas`, and thank-you pages.
9. Read `robots.ts` and `sitemap.ts`.
10. Read admin layout and one full admin content flow.
11. Read `[slug]/page.tsx` last, because it depends on understanding the CMS structure first.

---

## 22. Final Assessment

The app has a strong foundation: it builds, lints, has a broad route structure, has Firebase CMS capabilities, and has many product/content surfaces already present.

The main problem is not that the app is broken at the code syntax level. The main problem is that it is halfway through a business/domain migration from TEAS Gurus to NursingMocks. That creates risk in SEO, trust, checkout, analytics, legal copy, admin data, and emails.

The best next move is not random page polishing. The best next move is a controlled cleanup in this order:

1. Indexing and sitemap.
2. Brand/domain migration.
3. Checkout and thank-you flow.
4. Analytics events.
5. Admin/security hardening.
6. Page-by-page mobile and copy cleanup.

