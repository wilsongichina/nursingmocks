# Billing Deployment Troubleshooting

## Webhook Access Diagnostic

Added a read-only diagnostic script:

```text
node scripts/check-billing-webhooks.js
node scripts/check-billing-webhooks.js user@example.com
```

The script reports recent `billing_webhook_events` without printing raw webhook payloads or secrets.

Use it when checkout returns successfully but access does not update.

Key fields:

- `eventType`: must include `checkout.session.completed` for one-time checkout access.
- `normalizedEventType`: should be `checkout_completed`.
- `effectsEnabled`: must be `true`.
- `processed`: must be `true`.
- `effectExecutionStatus`: should be `ready`.
- `effectExecutionMessage`: should say verified billing state was written.

If recent events only show Stripe account events such as `balance.available`, `payout.created`, or `payout.updated`, the checkout-completion webhook is not reaching the app. Check the Stripe webhook endpoint event selection, endpoint URL, gateway ID query string, and signing secret for the same Stripe mode used by checkout.

## Purpose

This document records production deployment issues that affect billing routes and the checks needed before assuming billing configuration data is wrong.

## Vercel Billing Catalog Runtime Error

The production `/api/billing/catalog` route can fail before route code runs if Firebase Admin pulls in a serverless-incompatible dependency chain.

Observed Vercel error:

```text
Error: require() of ES Module /var/task/node_modules/jose/dist/webapi/index.js from /var/task/node_modules/jwks-rsa/src/utils.js not supported.
page: '/api/billing/catalog'
```

## Root Cause

`firebase-admin@14.1.0` resolved through:

```text
firebase-admin@14.1.0 -> jwks-rsa@4.1.0 -> jose@6.x
```

`jwks-rsa@4.1.0` required an ESM-only `jose` entry from CommonJS code in the Vercel serverless runtime. That made the billing catalog API return a 500 and caused `/payments` to show:

```text
Billing error
Could not load available plans.
```

## Resolution

Pin Firebase Admin to `13.5.0`:

```json
"firebase-admin": "13.5.0"
```

This resolves through:

```text
firebase-admin@13.5.0 -> jwks-rsa@3.2.2 -> jose@4.15.9
```

That dependency chain avoids the CommonJS/ESM mismatch in the deployed billing API route.

## Validation

After dependency changes, run:

```text
npm ls firebase-admin jwks-rsa jose
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\next.cmd build
```

## Deployment Notes

- Keep Firebase Admin service account variables configured in Vercel Production.
- Do not upload raw secrets to Firestore.
- If `/payments` shows a billing catalog error in production, first check `/api/billing/catalog` function logs before changing plan or gateway data.
- Redeploy after the dependency lockfile is committed and pushed.
