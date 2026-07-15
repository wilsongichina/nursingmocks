# Billing Stage 1 Existing-State Audit

## Purpose

This document records the current NursingMocks billing, entitlement, payment, pricing, admin, and customer billing state before implementing the provider-agnostic billing system.

No production billing behavior was changed during this audit.

## Files Inspected

- `src/types/user-document.ts`
- `src/lib/user-document-firestore.ts`
- `src/lib/dashboard/dashboard-view-model.ts`
- `src/lib/dashboard/__tests__/dashboard-view-model.test.ts`
- `src/lib/profile-view-model.ts`
- `src/lib/admin/users.ts`
- `src/app/admin/users/page.tsx`
- `src/app/payments/page.tsx`
- `src/app/prices/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/teas/page.tsx`
- `src/app/api/**`
- `firestore.rules`
- `package.json`

## Current User Billing Fields

Current Firestore user documents are modeled in `src/types/user-document.ts` and initialized in `src/lib/user-document-firestore.ts`.

Current `users/{uid}.billing` fields:

- `subscription_status`
- `plan_id`
- `interval`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`
- `active_provider`
- `active_subscription_ref`

Current supported billing status values:

- `active`
- `canceled`
- `past_due`
- `null`

Current supported billing interval values:

- `monthly`
- `yearly`
- `null`

Current supported provider values:

- `stripe`
- `paypal`
- `authorize_net`
- `null`

## Current Provider Billing Fields

Current `users/{uid}.billing_providers` stores provider-specific customer/subscription references:

```text
billing_providers.stripe.customer_id
billing_providers.stripe.subscription_id
billing_providers.stripe.last_event_at

billing_providers.paypal.payer_id
billing_providers.paypal.subscription_id
billing_providers.paypal.last_event_at

billing_providers.authorize_net.customer_profile_id
billing_providers.authorize_net.subscription_id
billing_providers.authorize_net.last_event_at
```

These fields are useful as compatibility fields, but they do not replace normalized provider price mappings, transactions, subscriptions, webhook event logs, or secure gateway configuration.

## Current Entitlement Model

Current `users/{uid}.entitlements` is a flat boolean map.

Initial entitlement keys created for new users:

- `exam:ati_teas_7`
- `exam:hesi_a2`
- `bundle:all_access`
- `feature:analytics`
- `feature:review_mode`
- `feature:timed_mode`

Dashboard access logic also recognizes additional entitlement keys:

- `test_bank:rn`
- `test_bank:lpn`
- `exit_exam:rn`
- `exit_exam:lpn`
- `ati_fundamentals`
- `ati_pharmacology`
- `ati_med_surg`
- `hesi_fundamentals`
- `hesi_pharmacology`
- `hesi_med_surg`
- `hesi_lpn_exit`
- `hesi_rn_exit`
- `ati_lpn_predictor`
- `ati_rn_predictor`

Risk:

- Flat boolean entitlements do not capture source, transaction, subscription, gateway, provider, grant reason, revocation reason, or access end date.

Recommendation:

- Preserve the boolean map for compatibility during migration.
- Add detailed entitlement records in a new structure before changing existing dashboard access checks.

## Current Dashboard Access Logic

Dashboard package and access state are built in `src/lib/dashboard/dashboard-view-model.ts`.

Current behavior:

- `billing.cancel_at_period_end` with a future period end becomes `cancelling`
- `billing.subscription_status === "active"` becomes `active`
- any true entitlement also causes user access to be treated as `active`
- `billing.subscription_status === "past_due"` becomes `past_due`
- `billing.subscription_status === "canceled"` becomes `cancelling` if period end is future, otherwise `expired`
- otherwise access is `free`

Current package statuses:

- active packages show `active`, `cancelling`, or `lifetime`
- unpaid packages show `free` unless the account is past due or expired
- past-due packages show `payment_issue`
- expired packages show `expired`

Current dashboard package catalog is locally defined in code:

- `hesi_a2`
- `ati_teas`
- `nursing_test_bank_rn`
- `nursing_test_bank_lpn`
- `nursing_exit_exam_rn`
- `nursing_exit_exam_lpn`

Risk:

- Package catalog and entitlement mapping are currently local code constants, not dynamic billing/package models.
- This is acceptable during migration but should eventually be driven by shared package configuration.

## Current Profile Billing Display

`src/lib/profile-view-model.ts` reads:

- `billing.subscription_status`
- `billing.interval`
- `billing.plan_id`
- `billing.current_period_end`
- `entitlements`

It formats these for the profile page but does not manage checkout, cancellation, payment method updates, invoices, transactions, or entitlement changes.

## Current Customer Billing Page

`src/app/payments/page.tsx` is currently a protected placeholder.

Current behavior:

- redirects unauthenticated users to `/login`
- shows loading state while auth is loading
- renders only `Payments & Subscription`

Gaps:

- no current plan display
- no package access summary
- no payment history
- no invoice links
- no Stripe Customer Portal integration
- no update payment method action
- no cancel subscription action
- no payment issue recovery flow

## Current Pricing Pages

There are two pricing-related pages:

- `/prices`
- `/pricing`

`/prices` appears to be legacy TEAS service pricing and uses old service language.

`/pricing` contains hardcoded NursingMocks-style plans in React:

- `TEAS 7 Prep`
- `HESI A2 Prep`
- `All-Access Nursing Prep`

Risk:

- `/pricing` hardcodes plan names, prices, billing modes, features, and call-to-action labels directly in a React component.
- Future billing work should replace this with dynamic public plan data.

## Current Direct Stripe Coupling

Direct Stripe checkout links exist in older TEAS content.

Known direct link location:

- `src/app/teas/page.tsx`

Pattern found:

```text
https://buy.stripe.com/...
```

Risk:

- Direct checkout links bypass the planned server-side checkout validation flow.
- Direct links can create payment state outside the normalized billing system.

Recommendation:

- Treat existing direct Stripe links as legacy content.
- Do not add new direct provider checkout links.
- Migrate purchase actions to server-side checkout after the gateway adapter exists.

## Current API Routes

Current API routes include:

- contact form
- welcome email
- internal email job processing
- admin user list/detail
- admin email test

Current gaps:

- no checkout creation route
- no Stripe webhook route
- no PayPal webhook route
- no customer portal route
- no billing plan admin API route
- no payment gateway admin API route
- no transaction admin API route
- no subscription admin API route
- no entitlement admin API route
- no billing audit log API route

## Current Admin Billing Support

Admin user management currently reads and displays billing and entitlements.

Files:

- `src/lib/admin/users.ts`
- `src/app/admin/users/page.tsx`

Current admin user list shows:

- subscription status
- plan ID

Current admin user detail shows JSON panels for:

- billing summary
- entitlements

Gaps:

- no dedicated admin billing navigation
- no plan management
- no gateway management
- no transactions page
- no subscriptions page
- no entitlement grant/revoke tools
- no billing audit log
- no refund tooling
- no server-side billing admin permission separate from general admin claim

## Current Admin Authorization

Server-side admin user APIs use `assertAdminUserManager`, which requires:

```text
decoded.admin === true
```

Firestore rules define:

```text
request.auth.token.admin == true
```

Gaps:

- no dedicated billing admin role or permission yet
- no separate permission for secrets, refunds, entitlement grants, or gateway live-mode changes

Recommendation:

- Keep the existing admin claim as the initial broad admin check.
- Add billing-specific authorization before enabling sensitive billing actions.

## Current Firestore Rules

Current rules allow users to read, create, and update their own `users/{uid}` document:

```text
allow read, create, update: if isOwner(userId) || isAdmin();
```

Risk:

- If client writes remain allowed to all user document fields, a user could potentially alter billing or entitlement fields unless frontend/backend code and rules are tightened.

Recommendation:

- Before live billing, restrict client writes to safe profile/preferences fields.
- Billing and entitlement fields should be updated only by trusted server-side code and verified webhook processing.

## Current Package Source Of Truth

Exam catalog/sidebar generation is separate from billing and should be preserved.

Existing dynamic exam catalog generation uses the project sidebar/catalog data flow and should not be replaced by billing work.

Billing package models should reference content/package IDs and should not alter:

- dynamically generated Nursing Entrance Exams
- dynamically generated Nursing Test Bank
- dynamically generated Nursing Exit Exams
- existing exam catalog build process

## Current Tests

Existing dashboard tests cover billing/access behavior in:

- `src/lib/dashboard/__tests__/dashboard-view-model.test.ts`

Existing test cases include:

- active subscription state
- free preview behavior
- cancelling subscription with future access
- package/status behavior tied to entitlements and billing

Reusable:

- extend these tests during billing migration.

Needed later:

- plan validation tests
- gateway validation tests
- checkout security tests
- webhook signature/idempotency tests
- transaction snapshot tests
- entitlement source/revoke tests
- admin authorization tests
- secret leakage tests

## Reusable Pieces

Reusable now:

- `UserDocumentBilling`
- `UserDocumentBillingProviders`
- flat `UserDocumentEntitlements` compatibility map
- dashboard access status derivation tests
- admin user summary/detail API and UI patterns
- Firebase Admin server utilities
- email job templates for payment failure/access events
- existing auth redirect pattern for `/payments`

## Main Gaps Before Billing Implementation

Missing foundation:

- internal billing plan model
- price version model
- provider price mapping model
- payment gateway config model
- gateway registry interface
- Stripe adapter
- secure secret storage strategy
- normalized billing events

Missing backend:

- server-side checkout creation
- Stripe webhook verification
- webhook idempotency store
- transaction records
- subscription records
- detailed entitlement records
- billing audit logs
- customer portal session creation

Missing admin:

- billing overview
- plans and pricing management
- payment gateways management
- transactions view
- subscriptions view
- entitlement grant/revoke tools
- billing audit log
- billing-specific authorization

Missing customer:

- real `/payments` control center
- current plan/status summary
- package access summary
- payment history
- invoice/receipt links
- manage billing portal action
- payment issue recovery action

Security gaps to close before live payments:

- user client write access to billing/entitlement fields
- direct legacy Stripe checkout links
- absence of webhook verification
- absence of idempotency
- absence of transaction snapshots
- absence of audit logging
- absence of secret storage strategy

## Stage 1 Conclusion

The project already has useful billing compatibility fields and dashboard access logic, but it does not yet have a real billing system.

The next stage should be Stage 2: Internal Billing Models.

Stage 2 should add TypeScript models and validation helpers for:

- billing plans
- price versions
- provider price mappings
- payment gateway configuration
- transactions
- subscriptions
- detailed entitlements
- audit log entries

Stage 2 should not enable checkout or live payments.
