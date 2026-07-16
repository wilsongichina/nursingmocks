# Billing Deployment Troubleshooting

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
