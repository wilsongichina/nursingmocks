# Billing Stage 7A Webhook Intake Foundation

Date: 2026-07-15

Implemented webhook intake infrastructure without changing billing access, transactions, subscriptions, or entitlements.

## Scope

This slice adds the webhook route shape, raw body boundary, signature requirement, adapter verification call, event recording, and idempotency support. It does not process successful payments or grant access.

## Files Changed

- `src/lib/billing/webhook-intake.ts`
- `src/lib/server/billing-webhooks.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/billing/__tests__/webhook-intake.test.ts`

## Route Added

```text
POST /api/webhooks/stripe?gatewayId={gatewayId}
```

Behavior:

- reads the raw request body with `request.text()`
- reads the `stripe-signature` header
- requires a gateway ID
- verifies the gateway exists and belongs to the Stripe provider
- calls the gateway adapter webhook verification method
- records the intake result
- keeps `processed: false`

## Collection Added

```text
billing_webhook_events
```

Recorded fields include:

- webhook event record ID
- provider
- gateway ID
- provider event ID when verification supplies one
- event type when verification supplies one
- status
- message
- signature presence
- processed flag
- duplicate count
- timestamps

## Idempotency

When a provider event ID is available, the document ID is derived from provider and event ID.

Duplicate events update duplicate counters instead of creating another event record.

## Current Limitation

Stripe webhook verification still returns unavailable because gateway secrets and live webhook verification are not configured yet.

No entitlement, transaction, subscription, or user billing document is updated in this slice.

## Validation Run

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts src/lib/billing/__tests__/checkout-readiness.test.ts src/lib/billing/__tests__/checkout-session.test.ts src/lib/billing/__tests__/webhook-intake.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed
