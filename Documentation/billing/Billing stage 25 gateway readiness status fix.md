# Billing Stage 25 Gateway Readiness Status Fix

## Purpose

Stage 25 fixes gateway readiness during checkout testing. Admins enter secret reference names, but the gateway `configurationStatus` is derived by the server because there is no manual status field in the admin UI.

## Files Changed

- `src/lib/billing/admin-config.ts`
- `src/lib/admin/billing.ts`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 25 gateway readiness status fix.md`

## Behavior Updated

Stripe gateway configuration status is now derived from saved secret references:

- `ready` when `secretKeyRef` and `webhookSecretRef` are present
- `incomplete` otherwise

This applies when:

- a gateway is created
- a gateway is edited

## Scope

This does not store raw secrets in Firestore. It only evaluates whether the saved reference names are present.

## Validation

Required after implementation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

