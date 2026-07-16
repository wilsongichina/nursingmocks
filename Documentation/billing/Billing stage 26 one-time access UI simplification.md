# Billing Stage 26 One-Time Access UI Simplification

## Purpose

Stage 26 simplifies the billing interface around the current business decision: NursingMocks is using one-time access purchases for now, not subscriptions.

## Files Changed

- `src/app/payments/page.tsx`
- `src/app/admin/billing/page.tsx`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 26 one-time access UI simplification.md`

## Behavior Updated

Customer `/payments` now focuses on:

- current access
- payment transactions
- access grants
- available one-time checkout plans

The customer page no longer shows:

- subscription status as the primary state
- billing interval
- provider billing portal management
- subscription history cards

Admin billing now focuses the normal management UI on:

- plans
- gateways
- provider mappings
- transactions
- access grants
- webhooks
- checkout attempts
- operation reviews
- audit logs

The normal admin UI no longer exposes subscription review actions or subscription record tabs. Transaction records remain visible because they are payment history, not recurring subscription management. Backend subscription records remain intact for audit and future use.

## Scope

This is a UI simplification only. It does not remove billing collections, webhook writers, audit records, checkout security, or provider integrations.

## Validation

Completed:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.
