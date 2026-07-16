# Billing Stage 24 Billing Closeout Checklist

## Purpose

Stage 24 intentionally adds no new billing features. It records what is now in place, what should be verified manually, and what must remain blocked until the owner explicitly approves live billing.

## Scope

Documentation only.

No application code, API routes, Firestore writes, provider calls, checkout behavior, webhook behavior, entitlement behavior, or admin mutations were changed in this stage.

## Current Billing Capabilities

The billing system now has:

- admin-managed billing plans
- admin-managed payment gateways
- admin-managed provider price mappings
- gateway secret reference fields
- server-side checkout session creation
- verified webhook intake and processing guardrails
- controlled test webhook state writers
- customer `/payments` billing center
- customer billing portal session support
- customer payment history
- admin billing operations
- admin operation record views
- admin record search, filters, detail modal, and preflight report
- live approval controls for checkout, webhook effects, and billing portal

## Must Stay Blocked Until Explicit Live Approval

Do not enable these implicitly:

- live checkout
- live webhook effects
- live billing portal
- direct provider checkout links
- entitlement grants from checkout success redirects
- raw provider secrets in Firestore
- browser-controlled amount, currency, provider customer ID, subscription ID, or entitlement writes

## Manual Verification Before Live Billing

Before approving live billing, verify:

- every public active plan has the correct package IDs
- every public active plan has an active provider price mapping
- every mapped provider price matches the internal amount, currency, interval, and purchase type
- every live gateway has server-side secret storage configured outside Firestore
- webhook signature verification works in the target environment
- at least one sandbox checkout has completed end to end
- at least one verified webhook has written transaction, subscription, and entitlement state as expected
- `/payments` shows the correct access and billing history for the test user
- admin billing records show the checkout attempt, webhook event, transaction, subscription, entitlement, and audit log
- rollback steps are known before live approval

## Remaining Non-Urgent Cleanup

These can stay out of the current phase:

- deciding whether Stan Store remains a legacy external sales channel or becomes an admin-managed gateway
- adding CSV export for admin billing records
- adding server-side pagination for large admin billing collections
- adding provider-specific adapters beyond Stripe
- adding automated provider price synchronization

## Validation

No TypeScript validation was required because this stage changed documentation only.

