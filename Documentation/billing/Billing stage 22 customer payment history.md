# Billing Stage 22 Customer Payment History

## Purpose

Stage 22 adds a read-only billing history section to the customer `/payments` page so users can see their own payment, subscription, and entitlement records.

## Files Changed

- `src/app/api/billing/history/route.ts`
- `src/app/payments/page.tsx`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 22 customer payment history.md`

## Behavior Updated

Added authenticated endpoint:

```text
GET /api/billing/history
```

The endpoint:

- requires the current user's Firebase ID token
- reads only records where `uid` matches the authenticated user
- returns transactions, subscriptions, and entitlements
- serializes Firestore timestamps to ISO strings
- does not expose other users' billing records

The `/payments` page now shows:

- customer transactions
- customer subscriptions
- customer entitlement history

## Scope

This stage is read-only.

It does not:

- create checkout sessions
- call payment providers
- mutate billing records
- grant or revoke entitlements
- change admin billing operations
- change Firestore schemas

## Validation

Completed validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed
