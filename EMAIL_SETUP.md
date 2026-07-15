# Email Setup Guide - Resend

## Overview

This application uses Resend to send:

1. Contact form submissions
2. Welcome emails for new user registrations

## Step 1: Create a Resend Account

1. Go to https://resend.com and create an account.
2. Verify your account.
3. Add and verify the sending domain `nursingmocks.com`.

## Step 2: Create a Resend API Key

1. Open the Resend dashboard.
2. Go to **API Keys**.
3. Create an API key with email sending access.
4. Copy the key immediately and store it securely.

## Step 3: Configure DNS

In Resend, verify `nursingmocks.com` by adding the DNS records Resend provides. Do not use a production `noreply@nursingmocks.com` sender until the domain is verified.

## Step 4: Configure Environment Variables

Create or update `.env.local`:

```env
RESEND_API_KEY=
EMAIL_FROM="NursingMocks <notifications@nursingmocks.com>"
EMAIL_REPLY_TO=support@nursingmocks.com
SUPPORT_EMAIL=support@nursingmocks.com
EMAIL_WORKER_SECRET=
NEXT_PUBLIC_LOGIN_URL=https://nursingmocks.com/login
```

Environment variables:

- `RESEND_API_KEY`: Required. Resend API key.
- `EMAIL_FROM`: Required for production. Sender identity verified in Resend.
- `EMAIL_REPLY_TO`: Reply-to address used for transactional emails.
- `SUPPORT_EMAIL`: Contact form internal recipient and visible support address.
- `EMAIL_WORKER_SECRET`: Server-only secret for `/api/internal/email/process-jobs`.
- `NEXT_PUBLIC_LOGIN_URL`: Login link used in welcome emails.

## Firestore Email Collections

The email system writes these protected collections from trusted Next.js server routes using Firebase Admin SDK:

- `emailJobs`
- `contactSubmissions`
- `emailRateLimits`

Client Firestore access to those collections is denied in `firestore.rules`. Admin monitoring or retry tools should use authenticated server routes rather than direct browser Firestore reads.

## Firebase Admin Setup

The email queue is written and processed from trusted Next.js server routes with Firebase Admin SDK. Configure one of these options in the deployment environment:

```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

or:

```env
FIREBASE_SERVICE_ACCOUNT_KEY_JSON=
```

or set `GOOGLE_APPLICATION_CREDENTIALS` on a trusted server. Do not commit service-account JSON files.

## Worker / Cron

The protected worker endpoint is:

```text
POST /api/internal/email/process-jobs
Authorization: Bearer <EMAIL_WORKER_SECRET>
```

For Vercel Cron, configure a scheduled call to that endpoint through a trusted integration that can attach the bearer token. The endpoint returns only aggregate counts and does not expose job contents.

## Step 5: Test

1. Restart the local server after editing `.env.local`.
2. Submit the contact form.
3. Register a test user account.
4. Confirm the contact and welcome emails are received.
5. Check server logs for Resend errors if email delivery fails.

## Troubleshooting

- `Email service not configured`: `RESEND_API_KEY` is missing.
- Sender/domain error: verify `nursingmocks.com` in Resend and use a verified sender.
- Emails not received: check spam, Resend delivery logs, and the configured recipient.
- Unauthorized error: rotate the API key and update the deployment environment.

## Security Notes

- Never commit `.env.local` or API keys.
- Use separate API keys for local development and production where practical.
- Rotate API keys if they are exposed.
- Keep service-account keys and email provider keys outside the repository.
