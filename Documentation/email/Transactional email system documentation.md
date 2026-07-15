# Transactional email system documentation

## Purpose

This document explains the NursingMocks transactional email system implemented on branch `feature/transactional-email-system`.

The system replaces the old SendGrid implementation with a Resend-based, server-side email job queue. It is designed so browser-side code cannot send arbitrary emails, change recipients, create arbitrary email content, or access private email job records directly.

## Current implementation status

Implemented:

- Resend provider integration behind a provider interface.
- Firebase Admin SDK initialization for trusted server routes.
- Firestore-backed `emailJobs` queue.
- Firestore-backed `contactSubmissions` persistence.
- Firestore-backed `emailRateLimits` for serverless-compatible rate limiting.
- Code-controlled email templates.
- Idempotent job creation using deterministic SHA-256 document IDs.
- Atomic worker claiming with processing leases.
- Bounded retry handling.
- `delivery_uncertain` status for ambiguous provider/network outcomes.
- Protected worker endpoint.
- Welcome email trigger from registration.
- Contact acknowledgement and internal notification jobs.
- Admin-only test email endpoint.
- Firestore rules that deny normal client access to email-related private collections.
- Structured local change-log page at `/change-log`.

Not implemented yet:

- Admin email monitoring UI.
- Firestore-editable email template overrides.
- Production scheduler or Vercel Cron configuration.
- Automatic production deployment.

## Core architecture

The email flow is:

```text
Application event
Trusted Next.js server route
Firebase Admin verifies identity or writes trusted data
Email job is created in Firestore
Worker claims due jobs atomically
Template registry renders HTML and text
Resend provider sends email
Firestore job is updated with delivery status
```

The browser never calls Resend directly.

## Main Firestore collections

### emailJobs

Purpose:

- Stores transactional email jobs and delivery state.

Created by:

- Trusted Next.js server routes using Firebase Admin SDK.

Normal client access:

- Denied by Firestore rules.

Typical fields:

```text
templateId
to
data
status
attempts
maxAttempts
provider
providerMessageId
idempotencyKey
jobId
createdAt
updatedAt
sentAt
nextAttemptAt
processingLeaseExpiresAt
lastErrorCategory
lastErrorMessage
templateVersion
```

Sensitive data policy:

- Does not store API keys.
- Does not store Firebase ID tokens.
- Does not store passwords.
- Does not store card details.
- Does not store password-reset tokens.
- Does not store rendered email bodies.

### contactSubmissions

Purpose:

- Stores validated contact form submissions.

Created by:

- `POST /api/contact` using Firebase Admin SDK.

Normal client access:

- Denied by Firestore rules.

### emailRateLimits

Purpose:

- Stores server-side rate-limit counters for contact form and admin test-email actions.

Created by:

- Trusted server helper `src/lib/server/rate-limit.ts`.

Normal client access:

- Denied by Firestore rules.

Raw email/IP values:

- Not stored in document IDs. Rate-limit document IDs are SHA-256 hashes.

### emailTemplates

Purpose:

- Reserved for future safe editable template text.

Current status:

- Not used by runtime sending yet.

Normal client access:

- Denied by Firestore rules.

## Firestore rule behavior

The old global public read rule was removed because Firestore overlapping match statements use OR semantics.

Final catch-all:

```text
match /{document=**} {
  allow read, write: if false;
}
```

Explicit anonymous public-read collections:

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

Protected from normal clients:

- `emailJobs`
- `contactSubmissions`
- `emailTemplates`
- `emailRateLimits`
- unknown collections

Firebase Admin SDK bypasses client Firestore rules, so trusted server routes can still create and update protected documents.

## Environment variables

Required for production email sending:

```env
RESEND_API_KEY=
EMAIL_FROM=NursingMocks <notifications@nursingmocks.com>
EMAIL_REPLY_TO=info@nursingmocks.com
SUPPORT_EMAIL=support@nursingmocks.com
EMAIL_WORKER_SECRET=
NEXT_PUBLIC_SITE_URL=https://nursingmocks.com
NEXT_PUBLIC_LOGIN_URL=https://nursingmocks.com/login
```

Required for Firebase Admin in production, choose one approach.

Option 1:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

Option 2:

```env
FIREBASE_SERVICE_ACCOUNT_KEY_JSON=
```

Local-only option:

```env
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
```

Important:

- Never use `NEXT_PUBLIC_` for secrets.
- Never commit `.env.local`.
- Never commit service-account JSON files.
- If a private key or API key is pasted into chat, email, or a public place, revoke it and generate a new one.

## Firebase Admin setup

File:

```text
src/lib/server/firebase-admin.ts
```

Supported configuration:

- `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS`

Behavior:

- Initializes Firebase Admin only on the server.
- Normalizes private key newline sequences.
- Throws a clear error if Firebase Admin is not configured.
- Does not log credentials.

## Provider abstraction

Files:

```text
src/lib/email/provider.ts
src/lib/email/providers/resend-provider.ts
```

The app uses an `EmailProvider` interface so future providers such as Postmark or Amazon SES can be added without rewriting application routes.

Only `src/lib/email/providers/resend-provider.ts` imports the Resend SDK.

## Template registry

File:

```text
src/lib/email/template-registry.ts
```

Supported templates:

- `welcome`
- `contact_acknowledgement`
- `contact_notification`
- `purchase_confirmation`
- `access_granted`
- `payment_failed`
- `subscription_cancelled`

Template behavior:

- Templates are code-controlled.
- Required fields are validated before sending.
- User-controlled text is escaped.
- HTML and plain-text versions are rendered.
- Support email is included.
- Links use configured site/login URLs.
- Admin test emails include a visible `[TEST]` subject marker.

## Welcome email flow

Files:

```text
src/app/api/send-welcome-email/route.ts
src/app/register/RegisterPageClient.tsx
src/components/ui/RegisterForm.tsx
```

Flow:

1. User registers through Firebase Authentication.
2. Browser gets the Firebase ID token from the authenticated Firebase user.
3. Browser calls `POST /api/send-welcome-email`.
4. Server verifies the ID token with Firebase Admin SDK.
5. Server derives `uid`, `email`, and `name` from the verified token.
6. Browser-provided recipient data is ignored.
7. Server validates the account email.
8. Server creates a deterministic job with:

```text
welcome:{uid}
```

9. The job ID is the SHA-256 hash of that idempotency key.

Important correction made during local testing:

- Brand-new email/password users often have `email_verified: false`.
- The welcome route now accepts a valid email from a server-verified Firebase token even when `email_verified` is false.
- The route still does not trust browser-provided recipient identity.

## Contact form flow

File:

```text
src/app/api/contact/route.ts
```

Flow:

1. Browser posts contact form data to `POST /api/contact`.
2. Server validates and sanitizes fields.
3. Server validates email syntax.
4. Server applies Firestore-backed rate limiting.
5. Server saves the submission to `contactSubmissions`.
6. Server creates acknowledgement email job for the sender.
7. Server creates notification email job for `SUPPORT_EMAIL`.
8. Server attempts immediate processing.

Security behavior:

- Browser cannot choose internal recipient.
- Browser cannot choose sender address.
- Browser cannot choose arbitrary template.
- Browser cannot submit arbitrary HTML email.
- Header-injection-style email values are rejected by validation.

## Worker endpoint

File:

```text
src/app/api/internal/email/process-jobs/route.ts
```

Endpoint:

```text
POST /api/internal/email/process-jobs
Authorization: Bearer <EMAIL_WORKER_SECRET>
```

Behavior:

- POST only.
- Requires `EMAIL_WORKER_SECRET`.
- Uses constant-time comparison through a defensive helper.
- Rejects missing or wrong secrets with `401`.
- Applies a per-invocation processing limit.
- Returns only aggregate counts.
- Does not return job payloads, full recipients, rendered email bodies, or secrets.

Example response:

```json
{
  "scanned": 0,
  "claimed": 0,
  "sent": 0,
  "retrying": 0,
  "failed": 0,
  "deliveryUncertain": 0
}
```

Local testing confirmed:

- Wrong secret returns `401`.
- Correct secret reaches processing.
- With Firebase Admin configured and no jobs, response returns zero counts.
- With a pending welcome job, the worker claimed one job and Resend marked it sent.

## Worker processing and retries

File:

```text
src/lib/email/worker.ts
```

Claiming behavior:

- Worker queries due jobs with status `pending`, `retrying`, or recoverable `processing`.
- Worker claims each job inside a Firestore transaction.
- Claim sets status to `processing`.
- Claim increments `attempts`.
- Claim sets `processingLeaseExpiresAt`.
- If another worker already claimed the job, the claim returns null.

Retry behavior:

- Temporary failures are retried with bounded delays.
- Permanent validation, configuration, and provider-auth failures are not retried indefinitely.
- Network/timeout/socket-style ambiguous failures become `delivery_uncertain`.
- `delivery_uncertain` is not blindly retried because the provider may have accepted the email even if the response was lost.

Retry delays:

```text
Attempt 1: immediate
Attempt 2: about 1 minute
Attempt 3: about 5 minutes
Attempt 4: about 30 minutes
Attempt 5: about 2 hours
```

## Admin test email endpoint

File:

```text
src/app/api/admin/email/test/route.ts
```

Endpoint:

```text
POST /api/admin/email/test
```

Behavior:

- Requires Firebase ID token.
- Requires custom claim `admin == true`.
- Validates recipient email.
- Accepts only registered template IDs.
- Does not accept arbitrary HTML.
- Does not accept arbitrary sender address.
- Adds a visible test marker.
- Records the request as an email job.
- Applies Firestore-backed rate limiting.

## Local test results

Automated validation:

```text
npm test
```

Result:

```text
9 test files passed
39 tests passed
```

TypeScript:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

```text
passed
```

Production build:

```text
.\node_modules\.bin\next.cmd build
```

Result:

```text
passed
```

Firestore rules dry-run:

```text
firebase deploy --only firestore:rules --dry-run
```

Result:

```text
rules compiled successfully
dry run complete
```

Firestore Emulator Suite:

- Attempted.
- Blocked because Java was not installed or not available on PATH.

Manual local worker test:

- `EMAIL_WORKER_SECRET=local-worker-secret`.
- Wrong secret returned `401`.
- Correct secret returned `200`.
- With no jobs, response contained zero counts.
- Registration created a `welcome` job.
- Manual worker call claimed one job.
- Firestore job ended as:

```text
status: sent
provider: resend
attempts: 1
providerMessageId: recorded
```

## Why the test email did not send immediately

The registration route created the email job successfully, but no continuous background worker runs in local development.

The email stayed `pending` until the worker endpoint was manually called.

After calling:

```text
POST /api/internal/email/process-jobs
```

the worker claimed and sent the job.

Production needs a scheduler, such as Vercel Cron, to call the worker endpoint regularly.

## Production setup checklist

Before enabling production email:

1. Verify `nursingmocks.com` in Resend.
2. Configure SPF, DKIM, and DMARC DNS records.
3. Set `RESEND_API_KEY` in hosting environment variables.
4. Set `EMAIL_FROM`.
5. Set `EMAIL_REPLY_TO`.
6. Set `SUPPORT_EMAIL`.
7. Set a strong `EMAIL_WORKER_SECRET`.
8. Configure Firebase Admin credentials in hosting.
9. Deploy updated Firestore rules.
10. Configure a trusted scheduler to call:

```text
POST https://nursingmocks.com/api/internal/email/process-jobs
Authorization: Bearer <EMAIL_WORKER_SECRET>
```

11. Run one controlled production email test.
12. Monitor Resend delivery logs.

## Vercel Cron note

Vercel Cron cannot directly attach custom authorization headers in the simplest `vercel.json` configuration.

Recommended options:

- Use a trusted scheduler that supports custom headers.
- Use a protected internal cron route that validates Vercel-provided cron identity if the project is deployed on Vercel.
- Do not expose an unprotected public worker endpoint.

## Operational commands

Run all email tests:

```text
npm test
```

Run the worker locally:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/internal/email/process-jobs" -Method POST -Headers @{ Authorization = "Bearer local-worker-secret" } -UseBasicParsing
```

Check the response:

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/internal/email/process-jobs" -Method POST -Headers @{ Authorization = "Bearer local-worker-secret" } -UseBasicParsing
$response.Content
```

Check Firestore rule compilation:

```text
firebase deploy --only firestore:rules --dry-run
```

## Files involved

Email routes:

- `src/app/api/send-welcome-email/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/internal/email/process-jobs/route.ts`
- `src/app/api/admin/email/test/route.ts`

Email core:

- `src/lib/email/config.ts`
- `src/lib/email/provider.ts`
- `src/lib/email/providers/resend-provider.ts`
- `src/lib/email/template-registry.ts`
- `src/lib/email/jobs.ts`
- `src/lib/email/worker.ts`
- `src/lib/email/idempotency.ts`
- `src/lib/email/errors.ts`
- `src/lib/email/validation.ts`

Email rendering:

- `src/emails/components/layout.ts`

Server helpers:

- `src/lib/server/firebase-admin.ts`
- `src/lib/server/security.ts`
- `src/lib/server/rate-limit.ts`

Client trigger updates:

- `src/app/register/RegisterPageClient.tsx`
- `src/components/ui/RegisterForm.tsx`

Security rules:

- `firestore.rules`

Tests:

- `src/app/api/admin/email/test/__tests__/route.test.ts`
- `src/app/api/internal/email/process-jobs/__tests__/route.test.ts`
- `src/app/api/send-welcome-email/__tests__/route.test.ts`
- `src/lib/email/__tests__/firestore-rules-effective.test.ts`
- `src/lib/email/__tests__/idempotency.test.ts`
- `src/lib/email/__tests__/jobs.test.ts`
- `src/lib/email/__tests__/template-registry.test.ts`
- `src/lib/email/__tests__/worker.test.ts`
- `src/lib/server/__tests__/rate-limit.test.ts`

Documentation and tracking:

- `EMAIL_SETUP.md`
- `README.md`
- `Documentation/Transactional email system implementation.md`
- `Documentation/Transactional email system documentation.md`
- `Documentation/Email provider migration to Resend.md`
- `Documentation/Documentation webpage.md`

Deleted:

- `src/lib/sendgrid.ts`

## Security reminders

- Do not commit `.env.local`.
- Do not commit service-account JSON files.
- Do not paste API keys or private keys into chat.
- Revoke any key that was pasted into chat.
- Keep `EMAIL_WORKER_SECRET` strong in production.
- Keep the worker endpoint protected.
- Deploy Firestore rules before relying on production email jobs.

