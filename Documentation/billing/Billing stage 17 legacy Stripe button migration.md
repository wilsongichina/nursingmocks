# Billing Stage 17 Legacy Stripe Button Migration

## Purpose

Stage 17 removes direct Stripe Payment Links from active TEAS purchase buttons without adding new billing concepts. The goal is to make normal Stripe purchase intent enter the internal billing flow instead of sending users directly to a provider-hosted Payment Link.

## Files Changed

- `src/app/teas/page.tsx`
- `src/components/sections/HowItWorksSection.tsx`
- `Documentation/billing/Billing stage 16 legacy payment link cleanup audit.md`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 17 legacy Stripe button migration.md`

## Behavior Updated

The TEAS purchase buttons no longer point directly to `https://buy.stripe.com/...`.

Updated buttons:

- TEAS hero `Buy Now - $99`
- TEAS bottom call-to-action `Buy Now - $99`
- How It Works `Buy Exact Teas - $99`

These buttons now use the existing `GetStartedButton` behavior:

- signed-in users go to `/payments`
- signed-out users go to `/register`
- `/payments` remains responsible for server-side checkout session creation

## Why This Matters

Direct Stripe Payment Links bypass:

- admin-managed plans
- admin-managed gateways
- provider price mappings
- checkout attempt audit logs
- live checkout approval controls
- webhook-based entitlement writes
- future support for multiple payment gateways

Routing through `/payments` keeps purchase intent aligned with the billing architecture already built in earlier stages.

## Deferred External Checkout

Stan Store links remain unchanged in this stage.

Reason:

- Stan Store is not currently an admin-managed billing gateway
- removing it without a mapped billing plan and package entitlement could interrupt the existing TEAS 7 practice sales path
- a later phase should decide whether Stan Store becomes a supported gateway adapter or is retired as a legacy channel

The deferred status is marked in:

```text
Documentation/billing/Billing stage 16 legacy payment link cleanup audit.md
```

## Validation

Completed validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
rg -n "buy\.stripe|buy.stripe|checkout\.stripe|stripe\.com" src/app src/components src/lib
```

Result:

- TypeScript passed
- no runtime `buy.stripe.com` Payment Links remain in `src/app`, `src/components`, or `src/lib`
- remaining Stripe URLs are the official Stripe API endpoints and test URLs in the provider adapter and billing tests
