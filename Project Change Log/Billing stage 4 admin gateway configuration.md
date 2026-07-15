# Billing Stage 4 Admin Gateway Configuration

## Purpose

Added the first admin-managed billing configuration surface.

This stage starts the admin billing UI and persistence layer for gateway records without enabling checkout, webhook processing, provider credential storage, or live payments.

## Files Added

- `src/lib/billing/admin-config.ts`
- `src/lib/admin/billing.ts`
- `src/app/api/admin/billing/route.ts`
- `src/app/admin/billing/page.tsx`
- `src/lib/billing/__tests__/admin-config.test.ts`

## Files Updated

- `src/components/layout/AdminSidebar.tsx`

## Implemented

- admin billing configuration page at `/admin/billing`
- admin sidebar link for Billing Configuration
- admin API route at `/api/admin/billing`
- authenticated admin-only billing configuration reads
- authenticated admin-only gateway creation
- server-side gateway input normalization and validation
- Firestore persistence for gateway records
- audit log write when an admin creates a gateway
- read-only display sections for current plans, gateways, and provider price mappings

## Firestore Collections

The admin billing configuration layer reads from:

- `billing_plans`
- `billing_gateways`
- `billing_provider_price_mappings`

Gateway creation writes to:

- `billing_gateways`
- `billing_audit_logs`

## Multiple Gateway Support

The admin UI can create gateway records for:

- Stripe
- PayPal
- Authorize.Net

Gateway records are keyed by `gatewayId`, not provider. This preserves the Stage 3 design where the system can support multiple gateways, including multiple gateways for the same provider.

## Security And Scope

- admin access uses the existing Firebase admin-claim verification path
- gateway secrets are not collected or stored in this stage
- created gateways start with `configurationStatus: "incomplete"` and `connectionStatus: "not_configured"`
- checkout remains disabled
- webhook processing remains disabled
- provider price sync remains disabled

## Validation Run

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- admin gateway input validation tests passed
- billing gateway registry tests passed
- billing validation tests passed
- TypeScript passed

## Notes For Next Stage 4 Slice

The next Stage 4 slice should add admin plan creation/editing and provider price mapping management. The `/admin/billing` page already includes read-only sections for those records so the UI can expand without changing the route.
