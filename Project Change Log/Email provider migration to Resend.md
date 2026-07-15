# Email provider migration to Resend

## Scope

Replace SendGrid email delivery with Resend for application emails.

## Changes made

- Removed the SendGrid package dependency.
- Added the Resend package dependency.
- Replaced the SendGrid helper with a Resend email helper.
- Updated welcome email and contact form API routes to use Resend.
- Updated `.env.example` to use Resend environment variables:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `RESEND_TO_EMAIL`
- Updated `README.md` and `EMAIL_SETUP.md` with Resend setup instructions.
- Removed old SendGrid fallback sender and recipient emails from active email code.

## Required setup

Configure these values in `.env.local` and production hosting:

```text
RESEND_API_KEY=
RESEND_FROM_EMAIL="NursingMocks <noreply@nursingmocks.com>"
RESEND_TO_EMAIL=info@nursingmocks.com
```

The `nursingmocks.com` sending domain must be verified in Resend before production sending from `noreply@nursingmocks.com`.

## Validation

- Removed active SendGrid code references from `src`, `.env.example`, `README.md`, `EMAIL_SETUP.md`, `package.json`, and `package-lock.json`.
- Confirmed Resend references are present in the email helper, API routes, environment example, and setup docs.
- Ran TypeScript check:
  - `.\\node_modules\\.bin\\tsc.cmd --noEmit`
  - Result: passed.
- Ran direct Next.js production build:
  - `.\\node_modules\\.bin\\next.cmd build`
  - Result: passed.

## Not changed

- Historical audit and migration report files were not rewritten.
- No email was sent during validation because no Resend API key was used in the terminal session.
- No commit or push has been made yet.
