# Billing Stage 14 Admin Billing Operations

## Purpose

Add controlled admin billing operations for support workflows without enabling live provider mutations.

Stage 14 gives admins audited operational actions for manual entitlements, webhook reprocessing, and review records. Refunds and subscription/provider changes are intentionally review-only at this stage.

## Files Changed

- `src/lib/admin/billing-operations.ts`
- `src/lib/admin/billing.ts`
- `src/app/api/admin/billing/operations/route.ts`
- `src/app/admin/billing/page.tsx`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 14 admin billing operations.md`

## Behavior Added

- added authenticated admin operation route:
  - `POST /api/admin/billing/operations`
- added audited manual entitlement grant
- added audited manual entitlement revoke
- added webhook reprocess operation
- added refund review record creation
- added subscription review note creation
- added transaction note creation
- added `billing_operation_reviews` to the admin billing snapshot
- added an Operation Reviews tab in `/admin/billing`
- added an Operations Actions panel with consequence warning and required reason field

## Collections Written

- `billing_entitlements`
- `billing_audit_logs`
- `billing_operation_reviews`
- `users/{uid}.entitlements`

## Guardrails

- every operation requires admin authorization
- every operation requires a reason of at least 10 characters
- entitlement grants and revokes update both normalized entitlement records and the user compatibility entitlement map
- refund workflow creates review records only; it does not call a payment provider
- subscription and transaction note workflows create review records only
- webhook reprocessing goes through the existing idempotent processing path
- live provider actions remain disabled

## Validation Run

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
