# Billing Stage 3 Gateway Registry And Stripe Adapter Skeleton

## Purpose

Stage 3 adds provider-agnostic payment gateway infrastructure without enabling checkout, webhook processing, provider credential storage, or live payments.

## Files Added

- `src/lib/billing/gateway-adapter.ts`
- `src/lib/billing/gateway-registry.ts`
- `src/lib/billing/providers/stripe.ts`
- `src/lib/billing/__tests__/gateway-registry.test.ts`

## Implemented

- common `PaymentGatewayAdapter` interface
- checkout session request and result contracts
- provider price sync request and result contracts
- webhook verification request and result contracts
- gateway connection test contract
- server-side `BillingGatewayRegistry`
- registry creation from many `PaymentGatewayConfig` records
- provider adapter matching by provider
- gateway registration by `gatewayId`
- duplicate gateway protection
- eligible gateway selection using the Stage 2 `canGatewayServePlan` rules
- Stripe adapter skeleton

## Multiple Gateway Support

The registry is intentionally keyed by `gatewayId`, not provider.

This allows the admin billing UI to create and manage multiple gateway records, including:

- multiple Stripe gateway configs for different environments or markets
- a Stripe gateway and a PayPal gateway on the same plan
- separate test and live gateways
- future providers added through provider adapters

Provider adapters are reusable implementation modules. Gateway records should come from admin-managed billing configuration stored server-side, not from hardcoded checkout code.

## Stripe Adapter Status

The Stripe adapter exists only as a skeleton in this stage.

Current Stripe operations return `unavailable`:

- checkout session creation
- provider price sync
- webhook verification
- connection testing

This keeps Stage 3 from accidentally enabling live payment behavior before later checkout, webhook, entitlement, and admin security stages are implemented.

## Validation Run

```text
npm test -- src/lib/billing/__tests__/validation.test.ts src/lib/billing/__tests__/gateway-registry.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing validation tests passed
- billing gateway registry tests passed
- TypeScript passed

## Notes For Stage 4

Stage 4 should build the admin billing configuration surface and persistence layer for plans, gateways, and provider price mappings.

The admin UI must be the source for adding and managing gateway records. Checkout code should consume published gateway configuration through the server-side registry instead of hardcoding Stripe or any other provider.
