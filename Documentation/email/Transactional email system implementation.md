# Transactional email system implementation

## Branch

```text
feature/transactional-email-system
```

## Status

Audit and proposed implementation structure completed. Core implementation is in progress on the feature branch. No commit, push, deploy, production Firestore data creation, cron configuration, or real email send has been performed.

## Architecture discovered

- The current trusted server environment is the existing Next.js API route layer.
- No Firebase Cloud Functions folder exists in the repository.
- `firebase.json` currently configures only Firestore and Storage rules.
- No existing background job queue pattern was found.
- Password reset uses Firebase Authentication through `sendPasswordResetEmail`.
- Welcome email behavior currently starts from browser-side registration code, which calls a server API route.
- Contact form behavior currently calls a server API route.
- Payment behavior appears mostly page/link based; payment pricing and payment flow were not modified.
- No existing `emailJobs` or `emailTemplates` collections were found.

## Current email-related runtime files

- `src/app/api/contact/route.ts`
- `src/app/api/send-welcome-email/route.ts`
- `src/lib/resend.ts`
- `src/app/register/RegisterPageClient.tsx`
- `src/components/ui/RegisterForm.tsx`
- `src/contexts/AuthContext.tsx`

## Current risk

The provider API key is server-side only, but the welcome email request can still be initiated by browser-side registration code. The target architecture should move email creation into trusted server job creation and make actual sending happen through a controlled worker.

## Proposed implementation structure

Use the existing Next.js API routes as the trusted server environment first, rather than introducing Firebase Cloud Functions immediately.

Recommended internal modules:

```text
src/lib/email/
  config.ts
  provider.ts
  providers/resend-provider.ts
  templates/
  template-registry.ts
  jobs.ts
  worker.ts
  idempotency.ts
  errors.ts
  validation.ts
```

Recommended email templates:

```text
src/emails/
  components/
  templates/
    WelcomeEmail.ts
    PurchaseConfirmationEmail.ts
    AccessGrantedEmail.ts
    PaymentFailedEmail.ts
    SubscriptionCancelledEmail.ts
    ContactAcknowledgementEmail.ts
    ContactNotificationEmail.ts
```

Recommended Firestore collections:

```text
emailJobs
emailTemplates
contactSubmissions
```

Recommended server routes:

```text
POST /api/contact
POST /api/email/process-jobs
POST /api/admin/email/test
```

## Target flow

```text
Application event
Trusted server code creates deterministic email job
Email job is stored in Firestore
Trusted worker claims and processes the job
Provider abstraction sends through Resend
Firestore job is updated with delivery status
```

## Initial trigger plan

### Welcome email

- Stop sending welcome email directly from browser-side registration code.
- Create a deterministic job after account creation.
- Use idempotency key:

```text
welcome:{userId}
```

### Contact form

- `/api/contact` validates and sanitizes input.
- Save the contact submission.
- Create two deterministic jobs:

```text
contact_acknowledgement:{submissionId}
contact_notification:{submissionId}
```

- Do not expose internal recipient addresses to the browser.

### Payment and entitlement emails

- Prepare server-side functions only.
- Do not trigger purchase/access emails from client redirects or query parameters.
- Only verified server-side payment or entitlement events may create these jobs.

## Environment variable direction

Prefer provider-portable names:

```env
RESEND_API_KEY=
EMAIL_FROM="NursingMocks <notifications@nursingmocks.com>"
EMAIL_REPLY_TO=support@nursingmocks.com
SUPPORT_EMAIL=support@nursingmocks.com
NEXT_PUBLIC_SITE_URL=https://nursingmocks.com
NEXT_PUBLIC_LOGIN_URL=https://nursingmocks.com/login
```

Do not expose `RESEND_API_KEY` through any `NEXT_PUBLIC_` variable.

## Security controls to implement

- Server-side email sending only.
- Provider abstraction so application logic does not import Resend directly.
- Strongly typed template registry.
- Required template data validation.
- Deterministic idempotency keys.
- Firestore transaction or deterministic document ID for duplicate prevention.
- Atomic worker claim before sending.
- Bounded retry policy.
- Safe error summaries only.
- Mask recipients in logs where practical.
- No API keys, tokens, passwords, payment-card data, or full email bodies in logs.
- No executable template logic stored in Firestore.
- Firestore `emailTemplates` overrides limited to safe editable text fields.
- Admin test-email action must require Firebase custom claim `admin: true`.

## Validation already performed during Resend migration

- TypeScript check passed:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

- Direct Next.js production build passed:

```text
.\node_modules\.bin\next.cmd build
```

## Implemented in current working tree

- Firebase Admin initialization for trusted server routes.
- Provider abstraction and Resend provider.
- Server-side email configuration validation.
- Strongly typed code-controlled template registry.
- Code templates for:
  - `welcome`
  - `contact_acknowledgement`
  - `contact_notification`
  - `purchase_confirmation`
  - `access_granted`
  - `payment_failed`
  - `subscription_cancelled`
- Firestore `emailJobs` helpers with deterministic SHA-256 document IDs.
- Contact submission persistence in `contactSubmissions`.
- Atomic worker claiming with processing lease expiration.
- Bounded retry handling.
- `delivery_uncertain` classification for ambiguous network-style failures.
- Protected worker endpoint:

```text
POST /api/internal/email/process-jobs
Authorization: Bearer <EMAIL_WORKER_SECRET>
```

- Admin-only test-email endpoint:

```text
POST /api/admin/email/test
```

- Welcome endpoint now verifies a Firebase ID token and derives `uid` and email server-side.
- Contact endpoint now creates acknowledgement and internal notification jobs.

## Still not done

- Admin email monitoring UI.
- Firestore-editable template overrides.
- Production cron configuration.
- Real email send.
- Commit, push, deploy, or production Firestore data creation.

## Validation results

- TypeScript check:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed after rerunning separately from the production build.

- Automated tests:

```text
npm test
```

Result: 7 test files passed, 16 tests passed.

- Direct Next.js production build:

```text
.\node_modules\.bin\next.cmd build
```

Result: passed.

- Exposed Resend key search:
  - Checked for public Resend variables and key-shaped Resend values.
  - Result: passed, no matches.

- Runtime SendGrid search:

Runtime code no longer imports SendGrid. Remaining SendGrid mentions are historical notes in change-tracking/audit documents only.

- Direct browser-side provider sending search:

Application code no longer imports the Resend SDK outside the provider module. Browser registration code may initiate the welcome-email request, but it sends a Firebase ID token only; the server derives UID, email, and name from the verified token.

## Remaining limitations

- Email processing is scheduler-ready but no Vercel Cron job has been configured.
- Firestore security rules now explicitly deny direct client access to `emailJobs`, `contactSubmissions`, `emailTemplates`, and `emailRateLimits`; trusted Next.js server routes use Firebase Admin SDK for those writes.
- Admin email monitoring UI was intentionally deferred.
- Firestore-editable template overrides were intentionally deferred.
- No real Resend delivery test was run.

## Production-readiness security review fixes

- Added explicit Firestore deny rules for email-related collections before the global public-read catch-all.
- Replaced in-memory-only contact and admin-test email rate limiting with Firestore-backed rate limiting suitable for serverless deployments.
- Hashed rate-limit document IDs so raw email/IP keys are not stored in document IDs.
- Reduced contact API error detail for unexpected server failures.
- Added tests for email Firestore rule placement and Firestore-backed rate limiting.

## Production-readiness security review results

Review scope:

- Firestore rules for `emailJobs`, `contactSubmissions`, `emailTemplates`, and email-related admin/rate-limit data.
- Client access paths for creating, modifying, reading, or changing email jobs.
- Firebase Admin usage for email job, contact submission, and rate-limit writes.
- Worker endpoint authentication, response safety, processing limits, due-job filtering, and lease behavior.
- Firebase Admin initialization and credential handling.
- Contact form validation, recipient control, template control, sender control, and rate limiting.
- Welcome email server-side Firebase ID-token verification.
- Retry behavior, provider idempotency, and `delivery_uncertain` handling.
- Email job payload contents for secrets or unnecessary rendered bodies.

Findings fixed:

- `firestore.rules` previously had a global public-read catch-all that would have exposed future `emailJobs` and `contactSubmissions` documents.
- Contact and admin test-email rate limiting was originally in-memory only, which is not reliable across serverless instances.
- Contact API unexpected failures could expose too much internal error detail to the browser.

Fixes applied:

- Added explicit deny rules before the global catch-all:
  - `/emailJobs/{jobId}`
  - `/contactSubmissions/{submissionId}`
  - `/emailTemplates/{templateId}`
  - `/emailRateLimits/{rateLimitId}`
- Added Firestore-backed rate limiting in `src/lib/server/rate-limit.ts`.
- Used SHA-256 hashed rate-limit document IDs so raw email/IP keys are not stored in document IDs.
- Updated contact and admin test-email routes to use the shared Firestore-backed rate limiter.
- Reduced contact API error responses to validation/rate-limit details only, with generic unexpected failure responses.
- Added tests for Firestore rule placement and Firestore-backed rate limiting.
- Updated email setup docs to state that email-related collections are server-only and direct client access is denied.

Validation after review:

```text
npm test
```

Result: passed, 9 test files and 19 tests.

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.

```text
.\node_modules\.bin\next.cmd build
```

Result: passed.

```text
firebase deploy --only firestore:rules --dry-run
```

Result: passed. Firestore rules compiled successfully. No rules were deployed.

Firestore emulator validation:

- Attempted with `firebase emulators:exec --only firestore`.
- Blocked because Java is not installed or not available on PATH.

Search results:

- No real Resend API keys, worker secrets, Firebase private keys, or service-account JSON values were found in source/docs placeholders.
- No browser/client writes to `emailJobs`, `contactSubmissions`, or `emailRateLimits` were found.
- Email-related collection writes use Firebase Admin server-side code.

Remaining production blockers:

- Deploy updated Firestore rules before enabling production email jobs.
- Install Java if full local Firebase Emulator Suite rule tests are required.
- Configure Resend DNS records for `nursingmocks.com`, including SPF, DKIM, and DMARC.
- Add real server-only environment variables in hosting.
- Configure Vercel Cron or another trusted scheduler with `EMAIL_WORKER_SECRET`.

No commit, push, deploy, cron configuration, production Firestore data creation, or real email send was performed during this review.

## Firestore effective-rule correction

Important correction:

- Firestore overlapping match statements use OR semantics.
- The earlier explicit deny entries for email collections were not enough while the recursive catch-all still allowed public reads.
- The global catch-all public read has now been removed.

Final rule behavior:

- Anonymous reads are allowed only for explicit public content collections:
  - `pages`
  - `blogs`
  - `blogCategories`
  - `pillarPages/{document=**}`
  - `knowledgeBase`
  - `questions`
  - `questionTypes`
  - `questionCategories`
  - `services`
  - `routeMappings`
- The final recursive catch-all is:

```text
match /{document=**} {
  allow read, write: if false;
}
```

Confirmed inaccessible to normal clients through the final catch-all:

- `emailJobs`
- `contactSubmissions`
- `emailTemplates`
- `emailRateLimits`
- unknown collections

Firebase Admin behavior:

- Firebase Admin SDK operations still work because Admin SDK bypasses client Firestore security rules.
- Email job, contact submission, and rate-limit writes continue to use trusted server-side Firebase Admin code.

Additional test coverage:

- Added behavior-focused tests covering the effective allow/deny paths:
  - anonymous read of `emailJobs` is denied
  - authenticated non-admin read of `emailJobs` is denied
  - anonymous read of `contactSubmissions` is denied
  - authenticated non-admin read of `contactSubmissions` is denied
  - anonymous read of approved public content succeeds
  - anonymous read of an unknown collection is denied

Validation after effective-rule correction:

```text
npm test
```

Result: passed, 9 test files and 39 tests.

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.

```text
firebase deploy --only firestore:rules --dry-run
```

Result: passed. Firestore rules compiled successfully. No rules were deployed.

```text
.\node_modules\.bin\next.cmd build
```

Result: passed.

Firestore emulator validation:

- Attempted with `firebase emulators:exec --only firestore`.
- Still blocked because Java is not installed or not available on PATH.
