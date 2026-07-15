# Billing Stage 5 Checkout Readiness

Date: 2026-07-15

Implemented checkout readiness validation without enabling live checkout or provider session creation.

## Scope

This stage prepares the billing system to answer whether a plan can be checked out, but it does not charge users, create provider checkout sessions, write transactions, create subscriptions, or grant entitlements.

## Files Changed

- `src/lib/billing/checkout-readiness.ts`
- `src/lib/server/billing-readiness.ts`
- `src/app/api/billing/catalog/route.ts`
- `src/app/api/billing/checkout-readiness/route.ts`
- `src/lib/billing/__tests__/checkout-readiness.test.ts`

## Behavior Added

- added a public billing catalog reader
- added checkout readiness resolution for a requested plan
- added gateway candidate evaluation
- added provider price mapping matching
- added safe API responses that keep `checkoutEnabled: false`
- added an endpoint for public active billing catalog data:

```text
GET /api/billing/catalog
```

- added an endpoint for checkout readiness validation:

```text
POST /api/billing/checkout-readiness
```

Request shape:

```json
{
  "planId": "all_access_monthly",
  "gatewayId": "stripe_default",
  "country": "US",
  "currency": "USD",
  "environment": "test"
}
```

## Readiness Rules

Checkout is considered ready only when:

- the plan exists
- the plan is `active`
- the plan is public
- the gateway is enabled
- the gateway is assigned to the plan
- the gateway configuration is ready
- the gateway supports the plan currency
- the gateway supports the optional checkout country
- the gateway supports the plan purchase type
- the gateway supports subscriptions when the plan is a subscription
- the gateway supports one-time payments when the plan is one-time
- the plan price is inside the gateway min/max amount range
- an active provider price mapping exists
- the provider mapping matches the plan amount, currency, billing interval, and purchase type
- the provider mapping matches the gateway provider and environment

## Checkout Still Disabled

The readiness result intentionally returns:

```json
{
  "checkoutEnabled": false
}
```

Reason:

- gateway secrets are not wired
- provider checkout session creation is not enabled
- webhooks are not enabled
- transaction writes are not enabled
- subscription writes are not enabled
- entitlement grants are not enabled

## Validation Run

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts src/lib/billing/__tests__/checkout-readiness.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed
