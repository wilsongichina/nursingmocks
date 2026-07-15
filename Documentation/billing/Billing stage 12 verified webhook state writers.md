# Billing Stage 12 Verified Webhook State Writers

## Purpose

Enable verified test webhook events to write billing state.

Stage 12 moves billing from checkout-session creation into trusted post-payment synchronization. Access is still not granted from checkout success redirects. Access is granted only after a verified, supported, test-gateway webhook is recorded and processed.

## Files Changed

- `src/app/api/webhooks/stripe/route.ts`
- `src/app/admin/billing/page.tsx`
- `src/lib/billing/providers/stripe.ts`
- `src/lib/billing/webhook-effect-execution.ts`
- `src/lib/billing/webhook-effect-plan.ts`
- `src/lib/server/billing-webhooks.ts`
- `src/lib/server/billing-webhook-processing.ts`
- `src/lib/server/billing-webhook-state-writer.ts`
- `src/lib/billing/__tests__/stripe-webhook.test.ts`
- `src/lib/billing/__tests__/webhook-effect-plan.test.ts`
- `src/lib/billing/__tests__/webhook-state-writer.test.ts`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 12 verified webhook state writers.md`

## Behavior Added

- verified Stripe webhook payloads are preserved on webhook event records
- test gateway webhook effects are enabled after signature verification and event classification
- live gateway webhook effects remain disabled
- newly recorded Stripe webhook events are processed after intake
- checkout completion can write a billing transaction
- checkout completion can grant plan package entitlements
- subscription events can create or update subscription records
- subscription cancellation can expire entitlements and update the user billing summary
- user billing compatibility fields are updated from verified webhook state
- billing audit logs record webhook effect execution

## Collections Written

- `billing_transactions`
- `billing_subscriptions`
- `billing_entitlements`
- `billing_audit_logs`
- `users/{uid}.billing`
- `users/{uid}.billing_providers`
- `users/{uid}.entitlements`

## Idempotency

Webhook event records still use stable provider event document IDs.

Duplicate provider events update the duplicate counter and do not execute the state writer again. Billing transaction document IDs are also derived from provider event IDs so repeated processing cannot create duplicate transaction records.

## Guardrails Preserved

- live webhook effects remain disabled
- unsupported event types are recorded but ignored for processing
- checkout success URLs do not grant access
- trusted `uid` and `planId` metadata must be present in the verified provider payload
- missing plan records fail processing rather than granting access
- raw gateway secrets are not stored in Firestore

## Validation Run

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/lib/billing/__tests__/webhook-effect-plan.test.ts src/lib/billing/__tests__/webhook-effect-execution.test.ts src/lib/billing/__tests__/webhook-processing.test.ts src/lib/billing/__tests__/webhook-state-writer.test.ts src/lib/billing/__tests__/stripe-webhook.test.ts
```
