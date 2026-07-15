# Billing Stage 9 Admin Operations Views

Date: 2026-07-15

Added read-only billing operations views to the admin billing page.

## Scope

This stage gives admins visibility into operational billing collections without enabling manual billing mutations.

## Files Changed

- `src/lib/admin/billing.ts`
- `src/app/admin/billing/page.tsx`

## Admin API Behavior Added

The admin billing config API now returns read-only records from:

- `billing_transactions`
- `billing_subscriptions`
- `billing_entitlements`
- `billing_webhook_events`
- `billing_checkout_attempts`
- `billing_audit_logs`

## Admin UI Behavior Added

Added read-only tabs in `/admin/billing` for:

- Transactions
- Subscriptions
- Entitlements
- Webhooks
- Checkout Attempts
- Audit Logs

Each tab uses the same compact admin table style as the existing billing configuration tables and includes safe empty states.

## Documentation Updated

The billing `How it works` modal now explains the operations views and what each table is expected to show.

## Safety

- no manual entitlement grant or revoke was added
- no transaction mutation was added
- no subscription mutation was added
- no webhook processing action was added
- views are read-only

## Validation Run

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts src/lib/billing/__tests__/checkout-readiness.test.ts src/lib/billing/__tests__/checkout-session.test.ts src/lib/billing/__tests__/webhook-intake.test.ts src/lib/billing/__tests__/webhook-events.test.ts src/lib/billing/__tests__/webhook-effect-plan.test.ts src/lib/billing/__tests__/webhook-processing.test.ts src/lib/billing/__tests__/stripe-webhook.test.ts src/lib/billing/__tests__/webhook-effect-execution.test.ts src/lib/billing/__tests__/processing-enablement.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed
