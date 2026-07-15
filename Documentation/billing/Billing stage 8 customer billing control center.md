# Billing Stage 8 Customer Billing Control Center

Date: 2026-07-15

Replaced the `/payments` placeholder with a customer billing control center while keeping checkout disabled.

## Scope

This stage gives authenticated users a safe billing overview and plan catalog preview. It does not create checkout sessions or charge users.

## Files Changed

- `src/app/payments/page.tsx`

## Behavior Added

- requires login before viewing `/payments`
- subscribes to the current user's Firestore document
- displays current billing snapshot:
  - plan ID
  - subscription status
  - billing interval
  - provider
  - renewal/access end date
- displays active entitlements from the user document
- loads public active billing catalog from:

```text
GET /api/billing/catalog
```

- displays available public plans from admin billing configuration
- shows package coverage per plan
- shows readiness-style labels:
  - `Ready`
  - `Incomplete`
- keeps checkout buttons disabled:
  - `Checkout not enabled`
  - `Configuration incomplete`

## Safety

- no checkout session is created
- no payment provider is contacted
- no transaction records are written
- no subscription records are written
- no entitlements are changed
- no user billing state is updated

## Validation Run

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed
