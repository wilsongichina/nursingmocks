# Billing Stage 13 Customer Billing Portal

## Purpose

Add customer billing management through a provider-hosted test billing portal.

Stage 13 lets authenticated users manage billing only through server-resolved provider customer records. The client cannot provide provider customer IDs or subscription IDs. Live portal sessions remain blocked.

## Files Changed

- `src/lib/billing/gateway-adapter.ts`
- `src/lib/billing/billing-portal.ts`
- `src/lib/billing/providers/stripe.ts`
- `src/lib/server/billing-portal.ts`
- `src/app/api/billing/portal/session/route.ts`
- `src/app/payments/page.tsx`
- `src/lib/billing/__tests__/billing-portal.test.ts`
- `src/lib/billing/__tests__/stripe-webhook.test.ts`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 13 customer billing portal.md`

## Behavior Added

- added a provider-agnostic billing portal adapter contract
- implemented Stripe test billing portal session creation
- added authenticated `POST /api/billing/portal/session`
- resolved provider customer IDs from `users/{uid}.billing_providers`
- blocked client-supplied provider customer IDs, subscription IDs, provider, and environment
- logged portal session attempts to `billing_audit_logs`
- added a `/payments` manage billing action when a verified test customer record exists
- kept live billing portal sessions disabled

## Guardrails

- users can only request portal sessions for their authenticated account
- provider customer IDs are resolved server-side
- live provider portal sessions return unavailable
- missing provider customer records block portal access
- missing ready test gateways block portal access

## Validation Run

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/lib/billing/__tests__/billing-portal.test.ts src/lib/billing/__tests__/stripe-webhook.test.ts
```
