# Billing Stage 2 Internal Models

## Purpose

Stage 2 adds internal billing model contracts and pure validation helpers only.

No checkout, webhook, provider connection, credential storage, Firestore writes, or live payment behavior was enabled.

## Files Added

- `src/lib/billing/models.ts`
- `src/lib/billing/validation.ts`
- `src/lib/billing/__tests__/validation.test.ts`

## Models Added

`src/lib/billing/models.ts` defines the internal billing contracts for:

- billing package IDs
- billing providers
- billing environments
- plan statuses
- purchase types
- billing intervals
- transaction statuses
- subscription statuses
- entitlement statuses
- entitlement sources
- billing plans
- plan price versions
- provider price mappings
- payment gateway configuration
- billing transactions
- billing subscriptions
- detailed billing entitlements
- billing audit log entries

These contracts are intentionally provider-agnostic. Stripe-specific implementation is still deferred to a later provider adapter stage.

## Validation Added

`src/lib/billing/validation.ts` adds:

- `validateBillingPlan`
- `canGatewayServePlan`

Current plan validation covers:

- required plan name
- required plan slug
- required currency
- non-negative price
- non-negative trial days
- subscription plans requiring a billing interval
- lifetime plans requiring one-time purchase
- unique plan names
- unique plan slugs
- active public plans requiring at least one package
- active plans requiring at least one payment gateway
- active plans requiring at least one enabled and ready gateway
- active plans requiring a matching provider price mapping

Current gateway eligibility validation covers:

- disabled gateways
- incomplete gateway configuration
- gateway not assigned to plan
- checkout environment mismatch
- unsupported currency
- unsupported country
- unsupported purchase type
- subscription support
- one-time payment support
- minimum amount
- maximum amount

## Tests Added

`src/lib/billing/__tests__/validation.test.ts` verifies:

- valid active plans pass when package, gateway, and provider mapping are present
- active public plans without packages fail
- active plans without ready assigned gateways fail
- active plans without matching provider price mappings fail
- duplicate plan slugs fail
- lifetime subscription plans fail
- configured gateways assigned to the plan pass
- disabled gateways and unsupported currencies fail

## Validation Run

```text
npm test -- src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing validation tests passed
- TypeScript passed

## Notes For Stage 3

Stage 3 should define the common payment gateway interface, create the server-side gateway registry, and add a Stripe adapter skeleton.

Stage 3 should still avoid live payment behavior until checkout and webhook verification are implemented and tested in later stages.
