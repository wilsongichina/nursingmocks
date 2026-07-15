# Billing Stage 15 Live Readiness Approval Controls

## Purpose

Add explicit server-side approval controls before any live billing capability can run.

Stage 15 does not turn live billing on by default. It creates auditable approval records for live checkout, live webhook effects, and live billing portal access. Server-side checkout, webhook, and portal paths must read these controls before live behavior is allowed.

## Files Changed

- `src/lib/billing/live-controls.ts`
- `src/lib/server/billing-live-controls.ts`
- `src/app/api/admin/billing/live-controls/route.ts`
- `src/lib/admin/billing.ts`
- `src/app/admin/billing/page.tsx`
- `src/lib/billing/gateway-adapter.ts`
- `src/lib/billing/providers/stripe.ts`
- `src/lib/server/billing-checkout.ts`
- `src/lib/server/billing-portal.ts`
- `src/lib/server/billing-webhooks.ts`
- `src/lib/billing/__tests__/live-controls.test.ts`
- `src/lib/billing/__tests__/gateway-registry.test.ts`
- `src/lib/billing/__tests__/stripe-webhook.test.ts`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 15 live readiness approval controls.md`

## Behavior Added

- added `billing_live_controls/live` server-side approval record
- added live capabilities:
  - `checkout`
  - `webhookEffects`
  - `portal`
- added admin endpoint:
  - `GET /api/admin/billing/live-controls`
  - `POST /api/admin/billing/live-controls`
- added approval cards and approval form to the admin billing readiness tab
- live checkout checks approval before provider session creation
- live webhook effects check approval before state writers are enabled
- live billing portal checks approval before live portal session creation
- approvals write audit logs

## Guardrails

- all live capabilities default to blocked
- every approval requires admin authorization
- every approval requires a reason of at least 15 characters
- approvals are stored server-side, not in client code
- test checkout, test webhooks, and test portal behavior remain available
- live adapter calls still return unavailable unless the matching approval exists

## Validation Run

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- full billing suite
```
