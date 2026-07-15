# Billing Stage 11 Sandbox Checkout Activation

## Purpose

Enable real provider checkout session creation for test gateways while keeping live payments and entitlement effects disabled.

This stage activates the server-side checkout path only for sandbox/test payment gateways. It does not grant access from checkout redirects, does not process live gateways, and does not write transactions, subscriptions, or entitlements.

## Files Changed

- `src/lib/billing/providers/stripe.ts`
- `src/lib/server/billing-checkout.ts`
- `src/app/api/billing/checkout/session/route.ts`
- `src/app/payments/page.tsx`
- `src/app/admin/billing/page.tsx`
- `src/lib/billing/__tests__/gateway-registry.test.ts`
- `src/lib/billing/__tests__/stripe-webhook.test.ts`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 11 sandbox checkout activation.md`

## Behavior Added

- Stripe test checkout sessions can now be created through the gateway adapter.
- Checkout uses admin-managed plans, gateways, and provider price mappings.
- Checkout requires an active provider price mapping with an external Stripe price ID.
- Checkout uses the selected test gateway secret reference to resolve the Stripe secret key.
- The customer `/payments` page can start checkout for ready test-gateway plans.
- Checkout attempts continue to be logged in `billing_checkout_attempts`.
- Successful provider session creation returns the provider session ID and checkout URL to the client.
- The admin readiness dashboard now states that live checkout remains disabled while test checkout is available.

## Secret Resolution

Stripe checkout resolves the secret key in this order:

1. the environment variable named by `gateway.secretKeyRef`
2. `STRIPE_SECRET_KEY_{GATEWAY_ID}`
3. `STRIPE_SECRET_KEY`

Raw secrets are still not stored in Firestore or returned to the client.

## Guardrails Preserved

- live Stripe gateway checkout is blocked
- manual access plans cannot create provider checkout sessions
- client-supplied amounts, currencies, provider price IDs, package IDs, metadata, and entitlements remain rejected
- checkout success redirects do not grant access
- webhook effects remain disabled
- transaction, subscription, and entitlement writers remain disabled

## Validation Run

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/stripe-webhook.test.ts src/lib/billing/__tests__/checkout-session.test.ts
```
