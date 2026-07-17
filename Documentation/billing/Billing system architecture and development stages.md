# Billing System Architecture and Development Stages

## Objective

Build a dynamic, secure, provider-agnostic billing system for NursingMocks.

The billing system should support dynamic admin-managed plans, dynamic trusted payment gateway configuration, Stripe as the first implemented provider, future providers through server-side adapters, webhook-confirmed access, audit logging, admin protection, and responsive customer/admin billing pages.

## Fixed-Term Exam Access Direction

The next billing model treats each exam as its own purchasable access product. All Access should not be used for new billing configuration because a student normally prepares for one exam path at a time.

Full planning reference:

```text
Documentation/billing/Billing fixed-term exam access full plan.md
```

Stage 1 foundation:

- added an exam access catalog model for admin-managed exam products
- added default exam access products for `ATI TEAS 7`, `HESI A2`, `Nursing Test Bank`, and `Nursing Exit Exams`
- added fixed access durations for `1 Month Access` and `3 Months Access`
- added additive billing plan fields: `examId`, `durationDays`, and `renewsAutomatically`
- kept `packageIds` as a compatibility mirror while existing checkout, dashboard, and profile code are migrated
- added validation that fixed-term plans must use one-time purchase and cannot renew automatically

Implementation rule:

- future billing work should use `examId` as the product relationship and keep `packageIds` only as a temporary compatibility field until all dependent pages are migrated

## Stage 3 Fixed-Term Access Behavior

Fixed-term exam access plans are one-time purchases with a defined access period.

Rules:

- `durationDays: 30` grants 1 Month Access
- `durationDays: 90` grants 3 Months Access
- fixed-term plans must use `purchaseType: one_time`
- fixed-term plans must not renew automatically
- successful webhook processing writes `accessStartsAt` and `accessEndsAt`
- if the user already has active access for the same exam, the new purchase extends from the current active `accessEndsAt`
- if the user has expired access, the new purchase starts from the webhook processing time
- if a legacy/manual lifetime grant exists, a fixed-term purchase must not shorten that lifetime access
- checkout duplicate blocking still applies to lifetime/no-duration plans, but fixed-term plans can be purchased again to extend access

Trusted checkout metadata now includes server-derived fixed-term context:

- `accessType`
- `examId`
- `durationDays`

These values are written by the server from the selected billing plan. They must not be accepted from client input.

## Stage 4 Admin Exam Access Catalog

Exam access products now have an admin-managed catalog.

Admin route:

- `/admin/exam-access`

API route:

- `GET /api/admin/exam-access`
- `POST /api/admin/exam-access`
- `PATCH /api/admin/exam-access`

Catalog behavior:

- default products are provided for `ATI TEAS 7`, `HESI A2`, `Nursing Test Bank`, and `Nursing Exit Exams`
- Firestore records in `exam_access_products` override or extend the default catalog
- admins can add future exams without adding new React constants
- admins can edit name, category, descriptions, active state, preview settings, and preview percentage
- preview question counts should be derived from `previewPercentage` and the exam's total question count rather than stored as a fixed number
- the admin catalog sorts recently updated exams first, with created date as fallback
- the exam ID is stable and becomes the billing relationship key

Important content relationship note:

- `/admin/exam-access` is a billing/access catalog, not a content creation tool
- `/admin/nursing-entrance-exam`, `/admin/nursing-test-bank`, and `/admin/nursing-exit-exam` remain the source for content pages, quizzes, KB articles, and questions
- creating an exam access product must not automatically create content pages or quizzes
- future work on the content admin pages should add an explicit relationship field, such as `examAccessProductId`, so content can be mapped to a billing/access product deliberately
- access checks should use the relationship between content and `examAccessProductId`, then verify the user's active entitlement for that same exam access product
- this keeps billing products, content structure, and access enforcement connected without making any one admin page responsible for all three

Billing validation note:

- billing plan validation accepts normalized future `examId` values so later stages can connect plans to admin-created catalog records
- UI should still guide admins to select from the catalog instead of typing arbitrary IDs once the billing page is migrated

## Stage 5 Admin Billing UI Migration

The `/admin/billing` Add Plan flow now uses the exam access catalog instead of asking admins to manually choose package IDs.

Plan creation behavior:

- admins select one active exam product from `/api/admin/exam-access`
- admins select one fixed duration: `1 Month Access` or `3 Months Access`
- the form generates `planId`, plan name, slug, `examId`, `durationDays`, and compatibility `packageIds`
- purchase type is locked to one-time access
- billing interval remains `lifetime` for provider mapping compatibility until the rest of billing is fully duration-based
- renewal is shown as `No automatic renewal`
- trial days remain `0`
- package checkboxes are hidden from plan creation so admins do not create broad bundle-style plans

Generated examples:

- `ati_teas_7_1_month` / `ATI TEAS 7 1 Month Access`
- `ati_teas_7_3_months` / `ATI TEAS 7 3 Months Access`
- `hesi_a2_1_month` / `HESI A2 1 Month Access`

The existing provider price mapping flow is unchanged in this stage. After the plan is created, admins still create the provider mapping against the plan, gateway, amount, currency, interval, and purchase type.

## Stage 6 Pricing Page Migration

The public `/pricing` page now presents fixed-term exam access by exam product instead of showing every billing plan as an unrelated card.

Pricing behavior:

- plans are grouped by `examId`, falling back to the first compatibility package ID for older records
- each exam card shows the available duration options, such as `1 Month Access` and `3 Months Access`
- each duration row keeps its own price, readiness status, and checkout action
- checkout still uses the existing server-side checkout session endpoint
- legacy All Access plans remain hidden
- subscription and recurring copy is not used for the current fixed-term access flow
- the duplicate package summary section was removed because exam cards now contain the relevant package context

This stage changes presentation only. It does not change checkout creation, provider mappings, webhook processing, or access grant writing.

## Stage 7 Payments Page Migration

The authenticated `/payments` page now matches the fixed-term exam access model.

Payments behavior:

- available plans are grouped by exam product
- each exam group lists available duration options, such as `1 Month Access` and `3 Months Access`
- each duration row keeps its own price, readiness status, and checkout action
- active access is grouped by exam and shows the access end date when available
- payment transactions remain visible as the user's payment history
- access grant history remains visible as read-only access history
- legacy All Access plans remain hidden
- subscription management remains hidden because recurring subscriptions are not part of the current product flow

This stage changes presentation only. It does not change checkout payloads, billing history loading, webhook processing, or access grant writing.

## Stage 8 Dashboard And Profile Access Summary Migration

The user dashboard and profile summaries now use exam access wording instead of centering the UI on paid plan language.

Dashboard behavior:

- account summary shows `Exam Access`, `Access Status`, and `Access Ends`
- active exam names are derived from the user's visible active exam cards
- users with no paid access see `Free Preview`
- `Access Ends` appears only when a real access end date exists
- the existing exam cards, add exam modal, and remove exam behavior are unchanged

Profile behavior:

- sidebar summary shows `Active Exams`, `Access Status`, and `Access Ends`
- `Current Plan` is shown only when a real paid/internal plan exists
- empty dates use `Not set`
- access status is derived from active exam entitlements first, then billing status fallback

This stage changes copy and view-model consistency only. It does not change entitlement writes, checkout, or profile update behavior.

## Stage 9 My Exams Access Migration

The `/dashboard/my-exams` page now reads the fixed-term exam access model.

My Exams behavior:

- the view model accepts the user document and billing history
- active access can come from normalized user entitlements or active billing entitlement records
- billing entitlement records use `examId` first, with compatibility fallback through `packageId`
- expired billing entitlement records do not unlock exams
- exam cards can show the active access end date when the webhook-confirmed grant includes one
- preview-enabled exams use `previewPercentage` and derive the approximate preview question count from the exam question count
- visible copy uses exam/access wording instead of package or subscription wording
- locked exam options remain compact in the `More exams available` section

This stage changes the My Exams presentation and access adapter only. It does not add attempt history, change exam-taking routes, or alter checkout/webhook behavior.

## Stage 10 Content Access Relationship Preparation

Content admin now has a prepared relationship between content records and billing exam access products.

Access mapping:

- `nursing-entrance-exam` is a content category, not a billing product
- Nursing Entrance Exam content must map to either `ati_teas_7` or `hesi_a2`
- Nursing Test Bank content maps to `nursing_test_bank`
- Nursing Exit Exam content maps to `nursing_exit_exams`

Implementation behavior:

- added a shared content access product helper for labels, defaults, allowed products, and validation
- new Nursing Entrance Exam sub pages require admins to select `ATI TEAS 7` or `HESI A2`
- new Nursing Test Bank sub pages save `nursing_test_bank` automatically
- new Nursing Exit Exam sub pages save `nursing_exit_exams` automatically
- sub page write operations persist `examAccessProductId` on the content document
- route mappings can also store `examAccessProductId` so future access checks can resolve the needed product from the route lookup

This stage does not enforce access blocking. It prepares content relationships so the next stage can safely check whether the logged-in user has active access for the content's `examAccessProductId`.

## Stage 11 Dynamic Route Preview Enforcement Foundation

Dynamic quiz pages now resolve exam access from the shared dynamic route instead of requiring every generated quiz page to be edited separately.

Dynamic route behavior:

- `[slug]` reads `routeMappings.examAccessProductId` first
- if the route mapping does not include a product, it falls back to the loaded content document's `examAccessProductId`
- if no product is assigned, the content remains public during this preparation stage
- assigned quiz content uses the exam access product preview percentage to calculate the visible preview question count
- the old fixed `10 questions` rule is no longer used in the dynamic quiz route
- preview CTAs use the resolved exam product name and show how many questions remain locked

Current limitation:

- `[slug]` is statically generated, so it cannot reliably know the currently authenticated Firebase user at render time
- this stage does not expose full paid quiz content from the static route
- full paid access should be handled next through a server-readable auth/session path or an authenticated quiz delivery API that verifies active `billing_entitlements`

## Stage 12 Authenticated Full Quiz Access

Dynamic quiz pages now keep the public preview as the default render and upgrade to the full question set only after an authenticated access check.

Full access behavior:

- `[slug]` still renders the configured preview percentage first, so public and unauthenticated visitors see the safe preview state
- the quiz question list is wrapped by a client component that requests full quiz content only when a Firebase user is signed in
- `GET /api/quiz/full?slug=...` verifies the Firebase ID token server-side before reading protected question data
- the API resolves the route mapping and required `examAccessProductId` using the same content access resolver as the preview route
- full access can come from normalized `users/{uid}.entitlements` or active `billing_entitlements` records
- expired billing entitlement records do not unlock the full quiz
- the API returns full questions only for active access and returns a preview status for users without access
- unauthenticated users, users without matching access, and failed checks remain on the preview question set and CTA

This stage does not edit individual quiz pages. It preserves the dynamic route, Firestore content structure, preview percentage rule, and provider-confirmed access model.

## Stage 13 Exam Access Migration Tooling

Added a controlled migration script for legacy package and All Access cleanup.

Migration behavior:

- `npm run billing:exam-access:migrate:dry-run` scans users and billing entitlement records without writing
- `npm run billing:exam-access:migrate:apply` applies the migration intentionally
- user entitlement objects are normalized to the four canonical exam IDs
- billing entitlement records can backfill `examId` from legacy package, source plan, or document identifiers
- active All Access-style billing entitlement records can be expanded into individual exam access records
- original legacy billing entitlement records are kept for audit
- the script supports `--uid <uid>` and `--limit <number>` for smaller checks

Stage 13 slice document:

```text
Documentation/billing/Billing stage 29 exam access migration tooling.md
```

## Architecture Decision

Use a provider-agnostic billing architecture.

Stripe should be the first implemented payment provider, but Stripe-specific logic must stay inside a Stripe adapter. The rest of the application should use internal billing services and normalized billing events.

Admins may configure, enable, disable, prioritize, and assign payment gateways that already have trusted server-side adapters. Admins must not be allowed to create arbitrary payment providers by entering API URLs, executable scripts, webhook code, or custom runtime logic.

## Core Separation

Use separate models for:

- `Plan`: what is sold, price, duration, purchase type, linked exam, compatibility packages, allowed gateways
- `Exam Access Product`: NursingMocks exam collection that can be sold independently
- `Entitlement`: what a specific user can access
- `Payment Gateway`: how payment is processed
- `Provider Price Mapping`: provider-specific product, price, or subscription plan reference
- `Billing Record`: current user billing/subscription state
- `Transaction`: permanent snapshot of each payment
- `Subscription`: normalized internal subscription record
- `Audit Log`: administrative and billing-sensitive activity history

Stripe or another trusted provider remains the authority for payment and subscription status. Verified webhooks synchronize Firestore records used by the dashboard, customer billing page, admin billing pages, and access checks.

Never grant access from checkout success redirects, query parameters, client-provided amounts, client-provided price IDs, or unverified webhook payloads.

## User Entitlement Compatibility Note

`users/{uid}.entitlements` is standardized to the four user package keys:

```text
ati_teas_7
hesi_a2
nursing_test_bank
nursing_exit_exams
```

Billing plans should use one exam access product per plan. Webhook writers and manual admin entitlement operations must write only these keys into the user document.

Legacy keys may still be normalized by user-facing readers during migration, but new billing writes must not create `exam:ati_teas_7`, `exam:hesi_a2`, `bundle:all_access`, `feature:analytics`, `feature:review_mode`, or `feature:timed_mode`.

## Initial Package IDs

Use existing package/catalog source of truth where available.

Suggested package IDs:

- `ati_teas_7`
- `hesi_a2`
- `nursing_test_bank`
- `nursing_exit_exams`

Do not create new `all_access` billing plans. Legacy readers may still normalize older All Access records during migration, but the active catalog should sell exams individually.

Do not alter the existing dynamically generated exam catalog or sidebar generation logic.

## Initial Plans

Suggested initial plans:

- `ATI TEAS`
  - packages: `ati_teas_7`
- `HESI A2`
  - packages: `hesi_a2`
- `Nursing Test Bank`
  - packages: `nursing_test_bank`
- `Nursing Exit Exams`
  - packages: `nursing_exit_exams`

Plans must be stored dynamically and managed from admin pages. Do not hardcode pricing cards or package access in React components.

## Admin Billing Routes

Create this admin billing section:

- `/admin/billing`
- `/admin/billing/plans`
- `/admin/billing/gateways`
- `/admin/billing/transactions`
- `/admin/billing/subscriptions`
- `/admin/billing/entitlements`
- `/admin/billing/audit-log`

Navigation label:

```text
Billing
- Overview
- Plans & Pricing
- Payment Gateways
- Transactions
- Subscriptions
- Entitlements
- Billing Audit Log
```

## Customer Billing Route

Use `/payments` as the customer billing control center.

Show:

- current plan
- subscription status
- purchase type
- billing interval
- renewal date
- access end date
- cancellation status
- payment issue state
- included package access
- manage billing action
- update payment method action where supported
- cancel subscription action where supported
- payment history
- invoice or receipt links where supported

Customer-facing billing states:

- `Free Preview`
- `Active`
- `Cancelling`
- `Payment Issue`
- `Expired`
- `No Active Plan`

Preserve the provider's exact internal subscription status separately from the user-facing billing state.

For Stripe, use Stripe Customer Portal for payment methods, invoices, billing information, cancellation, and subscription management where configured.

## Plan Rules

Supported purchase types:

- `subscription`
- `one_time`
- `manual_access`

Supported billing intervals:

- `monthly`
- `quarterly`
- `yearly`
- `lifetime`

Supported plan statuses:

- `draft`
- `active`
- `inactive`
- `archived`

Validation rules:

- subscription plans require a billing interval
- lifetime plans must use one-time purchase
- price cannot be negative
- plan name must be unique
- plan slug must be unique
- active public plans must include at least one package
- active plans must have at least one valid assigned payment gateway
- active plans must have at least one valid provider price mapping
- archived plans cannot accept new purchases
- plans with transactions or subscriptions must not be permanently deleted
- archive plans instead of deleting historical plans

## Price Versioning

Do not overwrite historical pricing.

When a plan price changes:

- create a new price version
- create a new provider price mapping
- use the new price for new subscribers
- keep existing subscriptions attached to their original provider price
- do not automatically migrate existing subscriptions
- require an explicit migration process if needed later

Each transaction must keep a permanent snapshot of plan name, price, currency, interval, purchase type, package IDs, gateway, provider, provider product ID, provider price ID, and purchase date.

## Provider Price Mappings

Do not store Stripe Price IDs or PayPal plan IDs as universal plan fields.

Use provider-specific mappings such as:

```text
billingPlans/{planId}/providerPrices/{mappingId}
```

Fields:

- `mappingId`
- `provider`
- `gatewayId`
- `environment`
- `externalProductId`
- `externalPriceId`
- `externalPlanId`
- `amount`
- `currency`
- `billingInterval`
- `purchaseType`
- `active`
- `syncStatus`
- `syncedAt`
- `createdAt`
- `updatedAt`

## Payment Gateway Registry

Create a server-side payment gateway registry.

Provider adapters should define:

- checkout creation
- customer billing management session creation
- payment verification
- webhook verification
- normalized webhook event conversion
- subscription retrieval and handling
- refund handling
- connection testing

Internal services should call common methods such as:

- `createCheckout`
- `verifyWebhook`
- `getSubscription`
- `createBillingManagementSession`
- `refundPayment`
- `testConnection`

Stripe-specific code must not be spread across React components, entitlement services, general billing services, or generic Firestore utilities.

## Gateway Configuration

Store non-sensitive gateway configuration separately from credentials.

Suggested collection:

```text
paymentGateways/{gatewayId}
```

Fields:

- `gatewayId`
- `provider`
- `displayName`
- `enabled`
- `environment`
- `connectionStatus`
- `supportedCurrencies`
- `supportedCountries`
- `supportedPaymentTypes`
- `supportsSubscriptions`
- `supportsOneTimePayments`
- `minimumAmount`
- `maximumAmount`
- `priority`
- `isDefault`
- `planIds`
- `configurationStatus`
- `lastConnectionTestAt`
- `lastConnectionTestStatus`
- `lastSuccessfulWebhookAt`
- `lastWebhookFailureAt`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

Do not store raw credentials in this document.

## Secret Management

Requirements:

- never store unencrypted provider secrets in normal Firestore documents
- never expose provider secret keys to the browser
- never return complete saved secrets after storage
- store secrets in a server-side secret manager or encrypted credential store
- show only configured/not configured, last four characters where appropriate, and last updated date
- require authorization and confirmation before replacing credentials
- require confirmation before enabling live mode
- audit every credential replacement without storing the raw secret

## Checkout Security

The browser may send only:

- `planId`
- `gatewayId`

The browser must not control:

- amount
- currency
- package IDs
- provider price ID
- subscription duration
- trial duration
- entitlement expiry
- discount amount

Checkout session creation must happen server-side. The server must authenticate the user, load and validate the plan, validate the gateway, resolve the provider price mapping, attach safe user metadata, create checkout through the provider adapter, and return only safe redirect/session data.

## Webhook Architecture

Preferred routes:

- `/api/webhooks/stripe`
- `/api/webhooks/paypal`

Webhook handlers must:

- read the raw request body where required
- resolve the provider adapter
- verify provider signatures
- reject unverified events
- prevent duplicate event processing
- handle events arriving out of order
- normalize provider events
- update billing records
- update entitlements
- write audit entries
- record processing status
- return the response expected by the provider

Use processed provider event IDs for idempotency.

## Normalized Billing Events

Convert provider events into internal events such as:

- `payment.completed`
- `payment.failed`
- `subscription.created`
- `subscription.activated`
- `subscription.updated`
- `subscription.cancelling`
- `subscription.cancelled`
- `subscription.expired`
- `refund.completed`
- `dispute.created`

Entitlement logic should react to normalized billing events, not raw Stripe or PayPal event names.

## Entitlement Model

The current project uses simple entitlement flags. Preserve compatibility while introducing richer entitlement records.

Recommended migration:

- keep the current fast entitlement flags for existing dashboard/access checks during transition
- add detailed entitlement records for source, expiry, grant/revoke reason, transaction link, subscription link, gateway, and provider
- migrate access checks to the richer entitlement model after billing webhook tests are complete

Supported entitlement sources:

- `subscription`
- `one_time_purchase`
- `manual_grant`
- `promotion`
- `admin_override`

Do not silently overwrite paid entitlement history. Manual access should be represented as a separate entitlement source.

## Admin Authorization

Only authorized billing admins should be able to:

- create or edit plans
- change prices
- activate or archive plans
- configure gateways
- add or replace credentials
- enable live mode
- change default gateways
- assign gateways to plans
- grant or revoke entitlements
- trigger refunds
- view sensitive billing records

Use server-side authorization checks. Do not rely only on hidden frontend buttons.

## Audit Log

Record plan changes, price changes, package assignment changes, gateway changes, credential replacements, default gateway changes, webhook configuration changes, manual entitlement grants/revokes, refund requests, and subscription reviews.

Never include raw secrets in audit logs.

## Development Stages

### Stage 1: Discovery And Existing-State Audit

Goals:

- inspect current billing, entitlement, user, admin, dashboard, and payment code
- document existing billing fields that can be reused
- document current Stripe-specific or checkout-specific coupling
- identify current package IDs and package generation source of truth

Exit criteria:

- written audit notes
- no production behavior changed

Stage 1 document:

```text
Documentation/Billing stage 1 existing-state audit.md
```

### Stage 2: Internal Billing Models

Goals:

- define TypeScript models for plans, price versions, provider mappings, gateways, transactions, subscriptions, entitlements, and audit logs
- preserve current user document compatibility
- define validation helpers

Exit criteria:

- model tests pass
- no checkout enabled yet

Stage 2 document:

```text
Documentation/Billing stage 2 internal models.md
```

### Stage 3: Gateway Registry And Stripe Adapter Skeleton

Goals:

- define the common payment gateway interface
- create server-side gateway registry
- add Stripe adapter skeleton
- keep gateway records provider-agnostic and keyed by `gatewayId`
- support many admin-managed gateways, not only Stripe

Required behavior:

- admin billing configuration is the source for adding gateways
- checkout code consumes server-side gateway configuration instead of hardcoded provider choices
- multiple gateway records can exist for one provider, environment, market, or plan
- provider adapters provide implementation details; gateway records provide admin-managed configuration
- keep Stripe-specific logic inside the adapter

Exit criteria:

- registry can resolve installed providers
- Stripe adapter exposes required methods
- no live payment actions enabled

### Stage 4: Admin Plans And Gateway Configuration

Goals:

- build `/admin/billing/plans`
- build `/admin/billing/gateways`
- support plan creation, editing, activation, archiving, package assignment, gateway assignment, and provider price mappings
- add gateway connection/status checks without real charges
- add audit log writes for admin changes

Initial Stage 4 slice completed:

- added `/admin/billing`
- added admin billing configuration API
- added admin-created gateway records
- added read-only plan, gateway, and provider mapping sections
- added audit logging for gateway creation
- left gateway secrets, checkout, provider price sync, and webhook handling disabled

Second Stage 4 slice completed:

- added admin plan creation through `/admin/billing`
- added server-side plan validation and normalization
- added package and gateway assignment fields
- added billing plan Firestore writes
- added audit logging for plan creation
- left provider price mapping management and checkout disabled

Additional Stage 4 admin gateway capability completed:

- added payment gateway key reference fields in admin
- references include publishable key ref, secret key ref, and webhook secret ref
- Firestore stores secret reference names only, not raw provider secret values
- Stripe webhook verification can resolve `webhookSecretRef` server-side

Stage 4 slice document:

```text
Documentation/Billing stage 4 admin gateway configuration.md
Documentation/Billing stage 4 admin plan configuration.md
```

Exit criteria:

- active plans cannot be saved without valid packages, gateway assignment, and provider mapping
- credentials are not exposed to the browser
- admin authorization enforced server-side

### Stage 5: Checkout Readiness

Goals:

- add a public active billing catalog reader
- add checkout readiness validation before provider checkout is enabled
- validate active/public plan availability
- validate enabled assigned gateway availability
- validate active provider price mapping availability
- return detailed readiness issues without creating checkout sessions or charging users

Exit criteria:

- inactive, private, archived, or missing plans are rejected
- disabled, unready, unsupported, or unassigned gateways are rejected
- missing or mismatched provider mappings are rejected
- responses keep `checkoutEnabled: false`
- live checkout remains disabled

Stage 5 completed:

- added `GET /api/billing/catalog`
- added `POST /api/billing/checkout-readiness`
- added `src/lib/billing/checkout-readiness.ts`
- added Firestore-backed public catalog/readiness helpers
- added checkout readiness tests

Stage 5 slice document:

```text
Documentation/Billing stage 5 checkout readiness.md
```

Customer billing page note:

- the customer billing control center should be built after checkout/webhook/subscription records exist so it can read real transaction, subscription, and entitlement state instead of placeholder data

### Stage 6: Server-Side Checkout

Goals:

- add authenticated checkout route
- accept only `planId` and `gatewayId` from the browser
- server resolves plan, gateway, provider mapping, amount, currency, package IDs, and provider price ID
- call the provider adapter through the gateway abstraction while checkout remains disabled

Exit criteria:

- invalid/inactive/archived plans are rejected
- disabled or unassigned gateways are rejected
- client cannot override amount, currency, package IDs, or provider price IDs
- checkout attempt is logged without creating transactions, subscriptions, or entitlements
- provider checkout still returns unavailable until live checkout is explicitly enabled

Stage 6 draft completed:

- added `POST /api/billing/checkout/session`
- added authenticated user bearer-token helper
- added checkout session draft request validation
- rejected client-controlled payment and entitlement fields
- added server-side checkout draft resolution and adapter call
- added checkout attempt logging to `billing_checkout_attempts`
- kept `checkoutEnabled: false`

Stage 6 slice document:

```text
Documentation/Billing stage 6 server-side checkout draft.md
```

### Stage 7: Verified Webhooks And Billing Synchronization

Goals:

- add `/api/webhooks/stripe`
- verify raw webhook signatures
- add idempotency for provider event IDs
- normalize Stripe events into internal billing events
- update billing records, transactions, subscriptions, entitlements, and audit logs

Exit criteria:

- duplicate webhooks are safe
- invalid signatures are rejected
- access is granted only after verified payment/subscription events

Stage 7A intake foundation completed:

- added `POST /api/webhooks/stripe?gatewayId={gatewayId}`
- added raw request body handling
- added required Stripe signature header boundary
- added provider/gateway validation
- added adapter verification call
- added `billing_webhook_events`
- added provider event ID idempotency support when verification supplies an event ID
- kept `processed: false`
- did not write transactions, subscriptions, entitlements, or user billing state

Stage 7A slice document:

```text
Documentation/Billing stage 7A webhook intake foundation.md
```

Stage 7B event classification completed:

- added normalized billing webhook event types
- mapped supported Stripe event types to internal event names
- added `normalizedEventType` and `eventSupported` to webhook intake records
- recorded unsupported provider event types without processing them
- continued to avoid transaction, subscription, entitlement, and user billing writes

Stage 7B slice document:

```text
Documentation/Billing stage 7B webhook event classification.md
```

Stage 7C effect planning completed:

- added planned billing webhook effects
- stored `plannedEffects` and `effectsEnabled` on webhook intake records
- kept `effectsEnabled: false`
- continued to avoid transaction, subscription, entitlement, and user billing writes

Stage 7C slice document:

```text
Documentation/Billing stage 7C webhook effect planning.md
```

Stage 7D processing guardrails completed:

- added webhook processing statuses
- added processing decision helper
- added processing disabled effect gate
- added processor skeleton with Firestore status updates
- added processing lock handling
- continued to avoid transaction, subscription, entitlement, and user billing writes

Stage 7D slice document:

```text
Documentation/Billing stage 7D webhook processing guardrails.md
```

Stage 7E verified Stripe webhook adapter completed:

- added Stripe signature verification in the adapter
- added gateway-specific and fallback webhook secret environment variable resolution
- extracted provider event ID and provider event type from verified Stripe payloads
- returned only a safe event summary from verification
- kept all billing effects disabled

Stage 7E slice document:

```text
Documentation/Billing stage 7E verified Stripe webhook adapter.md
```

Stage 7F billing state writer gate completed:

- added write target mapping for planned webhook effects
- added effect execution gate
- recorded blocked write targets during webhook processing
- kept actual state writers disabled and not implemented pending controlled approval
- continued to avoid transaction, subscription, entitlement, and user billing writes

Stage 7F slice document:

```text
Documentation/Billing stage 7F billing state writer gate.md
```

Stage 7G controlled processing enablement review completed:

- added explicit enablement review helper
- encoded required checks before webhook effects can be enabled
- kept `effectsEnabled: false`
- kept `canEnable: false`
- continued to avoid transaction, subscription, entitlement, and user billing writes

Stage 7G slice document:

```text
Documentation/Billing stage 7G controlled processing enablement review.md
```

### Stage 8: Customer Billing Control Center

Goals:

- replace `/payments` placeholder with a customer billing control center
- show current billing snapshot and active entitlements
- show public active billing plans from the admin catalog
- show readiness-style labels while checkout remains disabled
- keep all checkout CTAs disabled

Exit criteria:

- unauthenticated users are redirected to login
- billing profile loading has safe loading and error states
- page reads user billing state from Firestore
- page reads plan catalog from `GET /api/billing/catalog`
- no checkout session is created
- no payment provider is contacted

Stage 8 completed:

- replaced `/payments` placeholder
- added current billing summary
- added active entitlement display
- added public plan catalog display
- added disabled checkout CTAs

Stage 8 slice document:

```text
Documentation/Billing stage 8 customer billing control center.md
```

Stripe Customer Portal note:

- portal work should happen after real checkout/webhook/subscription records exist and provider customer IDs are available

### Stage 9: Admin Transactions, Subscriptions, Entitlements, And Audit Views

Goals:

- build admin views for transactions, subscriptions, entitlements, and audit logs
- build admin views for webhook events and checkout attempts
- keep manual entitlement grant/revoke deferred until a separate audited mutation slice
- link entitlements to transactions/subscriptions where applicable once writers are enabled

Exit criteria:

- operations tables are read-only until mutation workflows are explicitly approved
- paid entitlement history is not overwritten
- provider secrets remain hidden

Stage 9 read-only operations views completed:

- added admin read-only operations tabs inside `/admin/billing`
- added transactions, subscriptions, entitlements, webhook events, checkout attempts, and audit logs views
- added operations view documentation to the billing modal
- kept manual entitlement changes disabled

Stage 9 slice document:

```text
Documentation/Billing stage 9 admin operations views.md
```

### Stage 10: Test Coverage And Live-Readiness Review

Goals:

- add automated tests for plans, gateways, checkout, webhooks, entitlements, security, and state handling
- add admin live-readiness dashboard
- verify desktop and mobile layouts
- verify no raw secrets are stored or returned
- verify no client-controlled payment data is trusted

Exit criteria:

- TypeScript passes
- critical tests pass
- live payments remain disabled until explicit approval

Stage 10 live-readiness dashboard completed:

- added `Readiness` as the default `/admin/billing` tab
- added checks for checkout disabled, webhook effects disabled, gateway secret references, active plan mappings, and gateway readiness
- added modal documentation for the readiness view
- kept live payments disabled

Stage 10 slice document:

```text
Documentation/Billing stage 10 live readiness dashboard.md
```

### Stage 11: Sandbox Checkout Activation

Goals:

- create real provider checkout sessions for test gateways only
- keep live gateway checkout disabled until explicit approval
- use admin-managed plans, gateways, and provider price mappings
- resolve provider secrets from environment references, not Firestore raw secrets
- allow the customer billing page to start checkout only for ready test-gateway plans
- keep entitlement grants dependent on verified webhook processing

Exit criteria:

- Stripe test checkout sessions can be created through the server-side gateway adapter
- client-supplied amount, currency, package access, provider price IDs, and metadata remain rejected
- live gateways return unavailable
- checkout attempts are logged
- checkout success redirects do not grant access
- TypeScript and targeted billing tests pass

Stage 11 sandbox checkout activation completed:

- added Stripe test checkout session creation
- added Stripe secret key reference resolution
- kept live Stripe checkout blocked
- returned checkout URLs only when the provider creates a test session
- enabled `/payments` checkout buttons for ready test-gateway plans
- updated admin readiness copy for the live-checkout guardrail

Stage 11 slice document:

```text
Documentation/billing/Billing stage 11 sandbox checkout activation.md
```

### Stage 12: Verified Webhook State Writers

Goals:

- write billing state only from verified provider webhooks
- grant access only after trusted webhook processing
- create billing transactions from verified checkout or invoice events
- create or update subscriptions from verified subscription events
- grant, expire, or revoke entitlements from verified webhook effects
- update the existing `users/{uid}` billing snapshot for compatibility
- keep live webhook effects disabled until explicit approval

Exit criteria:

- checkout success redirects still do not grant access
- duplicate webhook events do not double-grant access
- test gateway webhook events can write billing state
- live gateway webhook events are recorded but effects remain disabled
- missing trusted metadata fails processing
- TypeScript and targeted webhook tests pass

Stage 12 verified webhook state writers completed:

- preserved verified Stripe webhook payloads on event records
- enabled planned effects only for verified test gateway webhooks
- added server-side billing state writers for transactions, subscriptions, entitlements, user billing summaries, and audit logs
- invoked webhook processing after successful Stripe webhook intake
- kept duplicate webhook events idempotent
- updated admin readiness copy for the live-webhook guardrail

Stage 12 slice document:

```text
Documentation/billing/Billing stage 12 verified webhook state writers.md
```

### Stage 13: Customer Billing Portal

Goals:

- add customer billing management through provider-hosted portal sessions
- resolve provider customer IDs server-side from verified webhook state
- prevent the browser from supplying provider customer IDs, subscription IDs, provider, or environment
- keep live billing portal sessions disabled until explicit approval
- audit portal session requests
- show a customer manage-billing action on `/payments`

Exit criteria:

- authenticated users can request a Stripe test billing portal session when a provider customer record exists
- users without provider customer records receive a safe blocked response
- live portal sessions return unavailable
- portal attempts are audit logged
- TypeScript and targeted portal tests pass

Stage 13 customer billing portal completed:

- added provider-agnostic billing portal adapter contracts
- implemented Stripe test billing portal session creation
- added `POST /api/billing/portal/session`
- added `/payments` manage billing action
- blocked client-controlled provider/customer identifiers
- kept live portal sessions disabled

Stage 13 slice document:

```text
Documentation/billing/Billing stage 13 customer billing portal.md
```

### Stage 14: Admin Billing Operations

Goals:

- add controlled admin support operations
- allow audited manual entitlement grants and revokes
- allow webhook reprocessing through the existing idempotent processor
- record refund reviews without executing provider refunds
- record subscription and transaction notes without changing provider state
- show operation review records in the admin billing operations views

Exit criteria:

- every operation requires admin authorization
- every operation writes an audit log
- entitlement changes require a reason and update compatibility entitlement state
- refund/subscription/transaction operations are review-only
- live provider mutations remain disabled
- TypeScript passes

Stage 14 admin billing operations completed:

- added `POST /api/admin/billing/operations`
- added manual entitlement grant and revoke
- added webhook reprocess operation
- added refund review, subscription note, and transaction note records
- added `billing_operation_reviews` to admin billing data
- added operation reviews tab and operations action form in `/admin/billing`

Stage 14 slice document:

```text
Documentation/billing/Billing stage 14 admin billing operations.md
```

### Stage 15: Live Readiness Approval Controls

Goals:

- add explicit server-side controls before live billing behavior can run
- keep live checkout blocked until approved
- keep live webhook effects blocked until approved
- keep live billing portal blocked until approved
- show live approval status in the admin readiness view
- audit every live capability approval

Exit criteria:

- all live capabilities default to blocked
- admin approval records are stored server-side
- live checkout checks approval before provider session creation
- live webhook effect processing checks approval before state writers are enabled
- live portal sessions check approval before provider portal creation
- TypeScript and billing tests pass

Stage 15 live readiness approval controls completed:

- added `billing_live_controls/live`
- added approval status for checkout, webhook effects, and portal
- added admin live-controls API
- added admin readiness approval cards and form
- added server-side approval checks in checkout, webhook, and portal paths
- updated live-blocking tests and live-control tests

Stage 15 slice document:

```text
Documentation/billing/Billing stage 15 live readiness approval controls.md
```

### Stage 16: Legacy Payment Link Cleanup Audit

Goals:

- audit customer-facing purchase paths before adding more billing behavior
- identify direct provider checkout links that bypass server-side billing controls
- identify external checkout services that are not yet admin-managed gateways
- confirm that `/payments` remains the preferred server-side checkout boundary
- document a small follow-up migration path

Exit criteria:

- direct Stripe Payment Links are documented
- external Stan Store purchase links are documented
- `/payments` checkout and portal redirects are reviewed
- no runtime behavior is changed
- the next cleanup step is scoped before implementation

Stage 16 legacy payment link cleanup audit completed:

- found direct Stripe Payment Links in TEAS content
- found external Stan Store purchase links in TEAS 7 practice content
- confirmed `/payments` uses `POST /api/billing/checkout/session` for checkout
- confirmed `/payments` uses `POST /api/billing/portal/session` for portal access
- documented why legacy links must move behind admin-managed plans, gateways, provider mappings, and webhook state writers

Stage 16 slice document:

```text
Documentation/billing/Billing stage 16 legacy payment link cleanup audit.md
```

### Stage 17: Legacy Stripe Button Migration

Goals:

- remove direct Stripe Payment Links from active TEAS purchase buttons
- route TEAS purchase intent through the internal billing entry point
- preserve the existing customer-facing button text and visual treatment
- leave non-Stripe external checkout links documented but unchanged until gateway strategy is decided

Exit criteria:

- TEAS purchase buttons no longer link directly to `buy.stripe.com`
- signed-in users are routed to `/payments`
- signed-out users are routed to registration before billing
- Stan Store links remain marked as deferred external checkout
- TypeScript passes

Stage 17 legacy Stripe button migration completed:

- replaced TEAS page direct Stripe purchase links with `GetStartedButton`
- replaced How It Works direct Stripe purchase link with `GetStartedButton`
- kept the existing button labels and styling
- marked Stan Store links as deferred in the Stage 16 audit document

Stage 17 slice document:

```text
Documentation/billing/Billing stage 17 legacy Stripe button migration.md
```

### Stage 18: Payment State Visibility Review

Goals:

- review whether users can understand checkout return state
- review whether admins can inspect payment, subscription, entitlement, webhook, checkout attempt, operation, and audit records
- keep checkout success redirects informational only
- avoid granting access from the checkout return page

Exit criteria:

- `/payments?checkout=success` explains that access updates after verified webhook processing
- `/payments?checkout=cancelled` explains that no billing access changed
- admin billing state views are reviewed
- TypeScript passes

Stage 18 payment state visibility review completed:

- added checkout return notices to `/payments`
- kept checkout return pages read-only
- confirmed admin billing already exposes transactions, subscriptions, entitlements, webhook events, checkout attempts, operation reviews, and audit logs
- documented visibility assumptions and remaining guardrails

Stage 18 slice document:

```text
Documentation/billing/Billing stage 18 payment state visibility review.md
```

### Stage 19: Admin Record Table Management

Goals:

- make billing operational records easier to scan in admin
- add search to record-heavy billing tables
- show matching record counts
- display newest records first where timestamps are available
- avoid changing billing state or Firestore schemas

Exit criteria:

- Transactions, Subscriptions, Entitlements, Webhook Events, Checkout Attempts, Operation Reviews, and Audit Logs tables support search
- matching counts are visible
- empty search results are explained
- TypeScript passes

Stage 19 admin record table management completed:

- added reusable search to admin billing operation tables
- added visible result counts
- sorted records newest-first using available timestamp fields
- kept the change display-only

Stage 19 slice document:

```text
Documentation/billing/Billing stage 19 admin record table management.md
```

### Stage 20: Admin Record Detail View

Goals:

- make full billing operational records readable from admin
- add a read-only detail view to record-heavy tables
- preserve table scanning while supporting detailed inspection
- avoid billing mutations, provider calls, and schema changes

Exit criteria:

- billing record tables expose a `View` action
- admins can inspect full record key/value details
- nested objects are readable as formatted JSON
- detail view is read-only
- TypeScript passes

Stage 20 admin record detail view completed:

- added a reusable read-only record detail modal
- added row-level `View` actions to billing operation tables
- formatted nested record fields for inspection
- kept the change display-only

Stage 20 slice document:

```text
Documentation/billing/Billing stage 20 admin record detail view.md
```

### Stage 21: Admin Record Filters

Goals:

- make admin billing operational records easier to narrow down
- add status, provider, and date filters to record-heavy tables
- keep filtering client-side over already loaded records
- avoid billing mutations and provider calls

Exit criteria:

- billing record tables support status filtering
- billing record tables support provider filtering
- billing record tables support date range filtering
- result counts update with filters
- TypeScript passes

Stage 21 admin record filters completed:

- added reusable status, provider, date-from, and date-to filters
- kept existing table search and newest-first ordering
- applied filters to billing operation tables
- kept the change display-only

Stage 21 slice document:

```text
Documentation/billing/Billing stage 21 admin record filters.md
```

### Stage 22: Customer Payment History

Goals:

- show customers their own billing history on `/payments`
- keep payment history read-only
- restrict history records to the authenticated user
- avoid changing checkout, webhook processing, or entitlement rules

Exit criteria:

- authenticated users can load their own transactions
- authenticated users can load their own subscriptions
- authenticated users can load their own entitlement records
- `/payments` displays the records clearly
- TypeScript passes

Stage 22 customer payment history completed:

- added `GET /api/billing/history`
- scoped history queries to the authenticated user's UID
- added transaction, subscription, and entitlement history panels to `/payments`
- kept the change read-only

Stage 22 slice document:

```text
Documentation/billing/Billing stage 22 customer payment history.md
```

### Stage 23: Live Launch Preflight Report

Goals:

- summarize what still blocks live billing
- show live launch review warnings before approval
- display a compact current billing snapshot
- keep the report read-only
- avoid live approvals, provider calls, billing mutations, or schema changes

Exit criteria:

- readiness tab shows live launch blockers
- readiness tab shows launch review warnings
- readiness tab shows current billing snapshot counts
- report remains read-only
- TypeScript passes

Stage 23 live launch preflight report completed:

- added a live launch preflight panel to admin billing readiness
- summarized gateway, mapping, live approval, webhook, checkout, and transaction readiness
- kept existing live approval controls unchanged
- kept the change display-only

Stage 23 slice document:

```text
Documentation/billing/Billing stage 23 live launch preflight report.md
```

### Stage 24: Billing Closeout Checklist

Goals:

- avoid adding more billing features in this phase
- document what is already in place
- document what must stay blocked until explicit live approval
- document manual checks before live billing
- keep the stage documentation-only

Exit criteria:

- closeout checklist is documented
- live approval guardrails are restated
- manual verification checklist is recorded
- no application code changes are made

Stage 24 billing closeout checklist completed:

- documented current billing capabilities
- documented live billing controls that must remain blocked
- documented manual verification before live billing approval
- documented non-urgent cleanup items
- made no code or runtime behavior changes

Stage 24 slice document:

```text
Documentation/billing/Billing stage 24 billing closeout checklist.md
```

### Stage 25: Gateway Readiness Status Fix

Goals:

- remove the need for a manual gateway status field
- derive Stripe gateway readiness from saved secret reference names
- unblock sandbox checkout when gateway refs are configured
- keep raw provider secrets out of Firestore

Exit criteria:

- newly created Stripe gateways can be marked ready from refs
- edited Stripe gateways can move from incomplete to ready from refs
- readiness status remains incomplete when required refs are missing
- TypeScript passes

Stage 25 gateway readiness status fix completed:

- derived Stripe gateway `configurationStatus` from `secretKeyRef` and `webhookSecretRef`
- applied the derivation on gateway creation and update
- kept the admin UI free of raw secret values

Stage 25 slice document:

```text
Documentation/billing/Billing stage 25 gateway readiness status fix.md
```

### Stage 26: One-Time Access UI Simplification

Goals:

- simplify billing screens around one-time purchases
- remove subscription-focused UI from the normal customer billing page
- remove subscription-heavy tabs from the normal admin billing workflow while keeping transaction payment history visible
- keep backend records intact for audit and future use

Exit criteria:

- `/payments` focuses on current access, transactions, access grants, and available plans
- admin billing focuses on plans, gateways, mappings, transactions, access grants, webhooks, checkout attempts, reviews, and audit logs
- subscription review actions are hidden from the normal admin UI
- TypeScript passes

Stage 26 one-time access UI simplification completed:

- renamed customer billing to payments and access
- removed customer subscription status, portal management, and subscription history card
- kept customer transaction display as payment history
- kept admin transaction records visible as payment history
- hid subscription record tabs from the normal admin billing workflow
- defaulted new admin plan and mapping forms toward one-time lifetime access
- validated with `.\node_modules\.bin\tsc.cmd --noEmit`

Stage 26 slice document:

```text
Documentation/billing/Billing stage 26 one-time access UI simplification.md
```

### Stage 27: Customer Payments UI Redesign

Goals:

- make `/payments` easier for customers to understand and manage
- keep transactions visible as payment history
- keep subscription management out of the normal customer interface
- preserve the existing checkout and billing history data flow

Exit criteria:

- `/payments` has a clearer account status header
- current access, payment transactions, access grants, and available plans are visually separated
- one-time plan cards have clearer pricing, package, and checkout states
- TypeScript passes

Stage 27 customer payments UI redesign completed:

- rebuilt `/payments` into a dashboard-style account management layout
- aligned `/payments` with the shared authenticated user account theme documented under `Documentation/user-dashboard/User dashboard.md`
- added compact summary tiles for access, plan, last payment, and access end
- kept transactions visible as payment history
- kept subscriptions hidden from the customer interface
- validated with `.\node_modules\.bin\tsc.cmd --noEmit`

Stage 27 slice document:

```text
Documentation/billing/Billing stage 27 customer payments UI redesign.md
```

### Stage 28: Duplicate Active Plan Checkout Prevention

Goals:

- prevent users from paying for the same active plan before the current access period ends
- enforce the rule server-side before provider checkout creation
- show a clear disabled state on `/payments` for already-active plans
- keep transactions visible as payment history

Exit criteria:

- checkout session creation checks active same-plan entitlements
- checkout session creation checks the user billing summary as a fallback
- `accessEndsAt: null` is treated as active access with no expiration
- `/payments` shows `Already active` for the current active plan
- TypeScript passes

Stage 28 duplicate active plan checkout prevention completed:

- added a server-side active same-plan access guard before provider checkout session creation
- logged blocked duplicate checkout attempts with readiness issue details
- disabled the same active plan on `/payments`
- kept server-side checkout validation as the source of truth
- documented that `accessEndsAt: null` means lifetime/permanent access and blocks duplicate checkout indefinitely
- documented that future time-limited one-time plans must write a real `accessEndsAt` timestamp before repurchase can be allowed after expiry
- validated with `.\node_modules\.bin\tsc.cmd --noEmit`

Stage 28 slice document:

```text
Documentation/billing/Billing stage 28 duplicate active plan checkout prevention.md
```

## Important Constraints

Preserve:

- existing exam catalog generation
- dynamically generated Nursing Entrance Exams
- dynamically generated Nursing Test Bank
- dynamically generated Nursing Exit Exams
- existing package IDs where already defined
- existing user access checks until migration is complete
- existing responsive layout
- existing admin authorization
- existing Firebase Auth integration
- existing Firestore structure where it can be safely extended

Do not:

- hardcode pricing cards in React
- hardcode Stripe throughout the application
- store raw secrets in Firestore
- trust amounts sent by the browser
- grant access from the success page
- allow arbitrary payment provider scripts
- replace dynamic exam generation
- delete historical plans with transactions
- migrate existing subscriptions automatically
- enable or deploy live payments without explicit approval

## Required Implementation Report

After implementation stages, report:

- files changed
- routes added
- Firestore schema changes
- new collections or subcollections
- payment gateway adapter interface
- Stripe adapter implementation summary
- provider price mapping design
- plan validation rules
- checkout security protections
- webhook security protections
- secret storage requirements
- admin authorization added
- audit logging added
- tests completed
- assumptions made
- remaining work before live payments can be enabled
