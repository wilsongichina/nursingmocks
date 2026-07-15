# Billing System Architecture and Development Stages

## Objective

Build a dynamic, secure, provider-agnostic billing system for NursingMocks.

The billing system should support dynamic admin-managed plans, dynamic trusted payment gateway configuration, Stripe as the first implemented provider, future providers through server-side adapters, webhook-confirmed access, audit logging, admin protection, and responsive customer/admin billing pages.

## Architecture Decision

Use a provider-agnostic billing architecture.

Stripe should be the first implemented payment provider, but Stripe-specific logic must stay inside a Stripe adapter. The rest of the application should use internal billing services and normalized billing events.

Admins may configure, enable, disable, prioritize, and assign payment gateways that already have trusted server-side adapters. Admins must not be allowed to create arbitrary payment providers by entering API URLs, executable scripts, webhook code, or custom runtime logic.

## Core Separation

Use separate models for:

- `Plan`: what is sold, price, interval, purchase type, included packages, allowed gateways
- `Package`: NursingMocks content or exam collection
- `Entitlement`: what a specific user can access
- `Payment Gateway`: how payment is processed
- `Provider Price Mapping`: provider-specific product, price, or subscription plan reference
- `Billing Record`: current user billing/subscription state
- `Transaction`: permanent snapshot of each payment
- `Subscription`: normalized internal subscription record
- `Audit Log`: administrative and billing-sensitive activity history

Stripe or another trusted provider remains the authority for payment and subscription status. Verified webhooks synchronize Firestore records used by the dashboard, customer billing page, admin billing pages, and access checks.

Never grant access from checkout success redirects, query parameters, client-provided amounts, client-provided price IDs, or unverified webhook payloads.

## Initial Package IDs

Use existing package/catalog source of truth where available.

Suggested package IDs:

- `ati_teas_7`
- `hesi_a2`
- `nursing_test_bank`
- `nursing_exit_exams`
- `all_access`

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
- `All Access`
  - packages: `ati_teas_7`, `hesi_a2`, `nursing_test_bank`, `nursing_exit_exams`

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
