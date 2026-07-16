# Billing Stage 28 Duplicate Active Plan Checkout Prevention

## Purpose

Stage 28 prevents a user from paying for the same plan again while that plan is already active and unexpired on their account.

## Files Changed

- `src/lib/server/billing-checkout.ts`
- `src/app/payments/page.tsx`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 28 duplicate active plan checkout prevention.md`

## Behavior Updated

Checkout now checks for active same-plan access before creating a provider checkout session.

The server blocks checkout when:

- the selected plan already has an active entitlement document for the user
- the entitlement `accessEndsAt` is empty, which means lifetime/current access
- the entitlement `accessEndsAt` is in the future
- or the user billing summary shows the same active plan with current unexpired access

The customer `/payments` page also disables the same active plan card and shows `Already active`.

## Scope

This is a checkout safety guard. It does not remove payment history, entitlement records, webhook processing, or admin operations.

## Assumptions

- `accessEndsAt: null` means active access without a scheduled expiration.
- A user may buy the same plan again only after the current access period has ended.
- Server-side checkout blocking is the source of truth; the UI disabled state is only a user experience improvement.

## Validation

Completed:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.
