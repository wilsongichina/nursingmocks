# Billing Stage 6 Server-Side Checkout Draft

Date: 2026-07-15

Implemented the authenticated server-side checkout session boundary while keeping live checkout disabled.

## Scope

This stage adds the route and server resolution path that checkout will use later. It does not create a live provider checkout session, charge users, write transactions, write subscriptions, or grant entitlements.

## Files Changed

- `src/lib/server/firebase-admin.ts`
- `src/lib/billing/checkout-session.ts`
- `src/lib/server/billing-checkout.ts`
- `src/app/api/billing/checkout/session/route.ts`
- `src/lib/billing/__tests__/checkout-session.test.ts`

## Route Added

```text
POST /api/billing/checkout/session
```

Authentication:

- requires a Firebase authenticated user bearer token
- does not require admin claim

Accepted client fields:

- `planId`
- `gatewayId`
- `successUrl`
- `cancelUrl`
- `customerEmail`

Rejected client-controlled fields:

- `amount`
- `currency`
- `packageIds`
- `providerPriceId`
- `providerPriceMappingId`
- `externalPriceId`
- `externalPlanId`
- `providerCustomerId`
- `entitlements`
- `metadata`

## Server-Side Resolution

The server resolves:

- plan
- gateway
- provider price mapping
- amount
- currency
- package IDs
- provider price ID / plan ID
- provider
- environment

The browser cannot override those values.

## Attempt Logging

Added checkout draft attempt logging to:

```text
billing_checkout_attempts
```

Logged fields include:

- attempt ID
- UID
- plan ID
- gateway ID
- provider
- status
- message
- readiness issues
- provider result summary
- created timestamp

These are attempt logs, not transaction records.

## Checkout Still Disabled

The route returns `checkoutEnabled: false`.

Stripe adapter checkout still returns unavailable until provider checkout, secrets, and webhooks are implemented.

## Validation Run

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts src/lib/billing/__tests__/checkout-readiness.test.ts src/lib/billing/__tests__/checkout-session.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed
