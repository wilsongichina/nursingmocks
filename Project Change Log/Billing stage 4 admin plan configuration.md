# Billing Stage 4 Admin Plan Configuration

## Purpose

Extended the admin billing configuration surface so admins can create internal billing plan records.

This continues Stage 4 without enabling checkout, provider price sync, webhook processing, or live payments.

## Files Updated

- `src/lib/billing/admin-config.ts`
- `src/lib/admin/billing.ts`
- `src/app/api/admin/billing/route.ts`
- `src/app/admin/billing/page.tsx`
- `src/lib/billing/__tests__/admin-config.test.ts`

## Implemented

- admin billing plan creation through `/admin/billing`
- server-side plan input normalization
- server-side plan validation
- plan ID and slug duplicate protection
- package assignment
- gateway assignment
- plan status, purchase type, interval, price, currency, trial days, public, featured, and display-order fields
- Firestore persistence to `billing_plans`
- audit log write to `billing_audit_logs` when an admin creates a plan
- readable plan cards in the admin billing page

## Scope Kept Disabled

- checkout
- provider price sync
- webhook handling
- secret storage
- customer-facing pricing plan reads
- entitlement grants

## Validation Run

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- admin gateway and plan input validation tests passed
- billing gateway registry tests passed
- billing validation tests passed
- TypeScript passed

## Notes For Next Stage 4 Slice

The next Stage 4 slice should add provider price mapping management so internal plans can be mapped to provider price IDs before checkout is introduced.

## Follow-up: Admin Billing Management Layout

Rearranged `/admin/billing` for easier management.

Updated:

- added summary tiles for total plans, active plans, enabled gateways, and unmapped plans
- grouped creation tools under a `Create Records` area
- grouped existing records under a `Manage Records` area
- ordered managed records as Plans, Gateways, then Provider Price Mappings
- replaced raw provider mapping JSON with scannable mapping cards
- kept existing plan and gateway creation behavior unchanged

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Plan Name Normalization

Added automatic billing plan name cleanup.

Behavior:

- plan names are normalized on the server before saving
- the admin form also normalizes the visible name when the field loses focus
- separators such as `-`, `_`, and `.` become spaces
- punctuation and unsupported characters are removed
- each word is capitalized

Example:

```text
ati-teas.monthly_plan!! -> Ati Teas Monthly Plan
```

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Follow-up: Billing How It Works Modal

Added an admin education modal to `/admin/billing`.

Changed:

- added a `How it works` button on the right side of the Billing Configuration header
- added a modal explaining:
  - how plans define purchasable access
  - how gateways define payment provider routing and eligibility
  - how provider price mappings connect internal plans to provider prices
  - why relationship-sensitive billing fields are locked after creation
  - that checkout, gateway secrets, webhooks, transactions, subscriptions, and entitlements remain disabled until later billing stages

Reason:

- admins need quick context before editing billing records
- the modal explains the consequences of billing configuration changes without crowding the management page
- the locked-field policy is visible from the page header, not only inside individual edit forms

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed

## Follow-up: Gateway Payment Key References

Added admin-managed payment gateway key reference fields without storing raw payment keys.

Changed:

- added gateway fields:
  - `publishableKeyRef`
  - `secretKeyRef`
  - `webhookSecretRef`
- added the fields to gateway creation in `/admin/billing`
- added the fields to gateway editing in `/admin/billing`
- added warning text telling admins to enter environment variable or secret-manager reference names only
- updated the billing documentation modal to explain each key reference field
- updated gateway create validation to preserve key reference names
- updated gateway update auditing to include key reference changes
- updated Stripe webhook verification to prefer `gateway.webhookSecretRef` when resolving the webhook secret

Security rule:

- raw provider secret values must not be pasted into the admin UI
- Firestore stores references such as `STRIPE_SECRET_KEY_STRIPE_DEFAULT`, not actual secret values
- server-side code resolves the real secret from environment variables or later secret-manager integration

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts src/lib/billing/__tests__/checkout-readiness.test.ts src/lib/billing/__tests__/checkout-session.test.ts src/lib/billing/__tests__/webhook-intake.test.ts src/lib/billing/__tests__/webhook-events.test.ts src/lib/billing/__tests__/webhook-effect-plan.test.ts src/lib/billing/__tests__/webhook-processing.test.ts src/lib/billing/__tests__/stripe-webhook.test.ts src/lib/billing/__tests__/webhook-effect-execution.test.ts src/lib/billing/__tests__/processing-enablement.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Follow-up: Billing Modal Documentation Expansion

Expanded the `How it works` modal into field-level admin documentation.

Changed:

- documented the full billing configuration flow:
  - plans
  - gateways
  - provider price mappings
- added plan field explanations for plan ID, slug, name, descriptions, status, purchase type, interval, price, currency, trial days, packages, assigned gateways, visibility, featured status, and display order
- added gateway field explanations for gateway ID, provider, environment, display name, currencies, countries, payment types, min/max amount, priority, enabled, and default gateway
- added provider mapping field explanations for mapping ID, plan, gateway, external product ID, external price ID, external plan ID, amount, currency, interval, purchase type, provider, environment, and active status
- documented safe editable fields versus locked relationship-sensitive fields
- documented validation rules admins should expect when creating or editing records
- retained the current-stage explanation that checkout, secrets, webhooks, transactions, subscriptions, and entitlements are not active yet

Reason:

- admins need documentation-level context inside the billing page before making configuration decisions
- field explanations reduce confusion around internal IDs, slugs, provider mappings, gateway priority, and locked billing contract fields

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed

## Follow-up: Locked Relationship-Sensitive Edit Fields

Revised the expanded edit behavior so fields that can affect related billing elements are visible but cannot be updated in-place.

Changed:

- added warning notices in the edit panel for locked billing relationship fields
- made plan relationship fields read-only in the edit panel:
  - `purchaseType`
  - `billingInterval`
  - `price`
  - `currency`
  - `trialDays`
  - `packageIds`
  - `gatewayIds`
- made gateway relationship fields read-only in the edit panel:
  - `supportedCurrencies`
  - `supportedCountries`
  - `supportedPaymentTypes`
  - `supportsSubscriptions`
  - `supportsOneTimePayments`
  - `minimumAmount`
  - `maximumAmount`
- made provider mapping contract fields read-only in the edit panel:
  - `amount`
  - `currency`
  - `billingInterval`
  - `purchaseType`
- changed edit submit payloads so locked fields are not sent from the UI
- added API-side validation that rejects direct PATCH attempts for locked relationship fields

Allowed edits after this revision:

- plans: `name`, `description`, `shortDescription`, `status`, `isPublic`, `isFeatured`, `displayOrder`
- gateways: `displayName`, `enabled`, `isDefault`, `priority`
- provider price mappings: `externalProductId`, `externalPriceId`, `externalPlanId`, `active`

Reason:

- plan contract fields affect checkout pricing, package access, gateway eligibility, subscriptions, entitlements, and provider mappings
- gateway coverage and amount-limit fields affect checkout eligibility for plans using the gateway
- provider mapping amount/currency/interval/purchase type must mirror the linked internal plan and provider price
- those changes should be made by creating a new plan, gateway, or provider mapping rather than mutating existing linked records

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Note: Edit Form Scope

The first CRUD edit panel intentionally exposes fewer fields than the create forms.

Current editable fields:

- plans: `name`, `status`, `isPublic`, `isFeatured`, `displayOrder`
- gateways: `displayName`, `enabled`, `isDefault`, `minimumAmount`, `maximumAmount`, `priority`
- provider price mappings: `externalProductId`, `externalPriceId`, `externalPlanId`, `active`

Reason:

- IDs such as `planId`, `gatewayId`, and `mappingId` are record identities and should stay immutable after creation
- provider and environment fields are gateway contract fields and should not be changed casually after mappings exist
- pricing, package assignment, gateway assignment, purchase type, interval, and currency affect checkout contracts, future transactions, subscriptions, entitlements, and provider mappings
- those fields should be editable only with stricter validation so existing billing references do not become inconsistent

Recommended next expansion:

- plan edit should add `description`, `shortDescription`, `price`, `currency`, `billingInterval`, `trialDays`, `packageIds`, and `gatewayIds`
- gateway edit should add `supportedCurrencies`, `supportedCountries`, `supportedPaymentTypes`, `supportsSubscriptions`, and `supportsOneTimePayments`
- provider mapping edit should add `amount`, `currency`, `billingInterval`, and `purchaseType`
- plan or gateway reassignment for provider mappings should only be added with validation that provider, environment, amount, currency, interval, and purchase type still match the selected plan and gateway

## Follow-up: Expanded Editable Billing Fields

Expanded the admin edit panel while keeping immutable identity fields locked.

Changed:

- expanded plan editing to include:
  - `description`
  - `shortDescription`
  - `purchaseType`
  - `billingInterval`
  - `price`
  - `currency`
  - `trialDays`
  - `packageIds`
  - `gatewayIds`
- expanded gateway editing to include:
  - `supportedCurrencies`
  - `supportedCountries`
  - `supportedPaymentTypes`
  - `supportsSubscriptions`
  - `supportsOneTimePayments`
- expanded provider price mapping editing to include:
  - `amount`
  - `currency`
  - `billingInterval`
  - `purchaseType`
- kept these fields immutable after creation:
  - `planId`
  - `gatewayId`
  - `mappingId`
  - gateway `provider`
  - gateway `environment`
  - mapping `planId`
  - mapping `gatewayId`
  - mapping `provider`
  - mapping `environment`

Validation behavior:

- plan updates still require active plans to have at least one package and one gateway
- plan package IDs must be supported package IDs
- plan gateway IDs must point to existing gateway records
- plan billing contract fields must remain valid for purchase type, interval, price, currency, and trial days
- active provider mappings for a plan must still match the plan price, currency, billing interval, purchase type, and assigned gateways
- gateway amount limits still require minimum amount to be less than or equal to maximum amount
- gateway payment types must be supported purchase types
- provider mapping edits must still keep either an external price ID or external plan ID
- provider mapping amount, currency, billing interval, and purchase type must still match the linked plan
- provider mapping provider and environment must still match the linked gateway

Reason:

- admins need full practical management over plans, gateway coverage, and provider mapping contracts
- immutable fields remain locked to protect record identity and existing references
- sensitive billing fields are editable only with validation so configuration cannot drift into an inconsistent checkout state

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Follow-up: Admin Billing CRUD Management

Added update and soft-delete style management operations to `/admin/billing`.

Changed:

- added `PATCH /api/admin/billing` for billing configuration updates
- added server-side update handlers for plans, gateways, and provider price mappings
- added audit log records for every admin update
- added row actions in the management tables:
  - `Edit` for plans, gateways, and provider mappings
  - `Archive` for plans
  - `Disable` for gateways
  - `Deactivate` for provider mappings
- added a single right-column edit panel so admins can update the selected record without opening multiple long forms
- kept destructive billing actions as reversible state changes instead of physical document deletes

Behavior:

- plan edits currently allow `name`, `status`, `isPublic`, `isFeatured`, and `displayOrder`
- plan names are normalized again on edit, so separators and punctuation are cleaned into title case
- gateway edits currently allow `displayName`, `enabled`, `isDefault`, `minimumAmount`, `maximumAmount`, and `priority`
- gateway amount validation prevents minimum amount from exceeding maximum amount
- provider mapping edits currently allow provider external IDs and `active`
- provider mapping validation still requires either an external price ID or external plan ID
- every update writes a `billing_audit_logs` entry with before and after summaries

Reason:

- billing configuration needs complete admin management before checkout and webhook stages
- soft state changes preserve references that future transactions, subscriptions, entitlements, and audit logs may depend on
- placing edit controls inside the management table makes repeated admin work faster than searching through create forms

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Follow-up: Entrance Exam Package Split

Updated billing package options so ATI TEAS and HESI A2 are separate Nursing Entrance Exam packages.

Changed:

- replaced the broad `nursing_entrance_exams` billing package with `ati_teas_7` and `hesi_a2`
- updated admin plan package checkboxes to show `ATI TEAS 7` and `HESI A2` separately
- added validation coverage confirming ATI TEAS and HESI can be assigned as separate packages
- aligned billing package IDs with the existing user entitlement keys `exam:ati_teas_7` and `exam:hesi_a2`

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Admin Usage And Field Meaning

This section explains the current `/admin/billing` management screen and the purpose of each important field.

### Page Structure

The admin billing screen is organized for management rather than checkout.

Top summary tiles:

- `Plans`: total internal billing plans currently configured
- `Active Plans`: plans marked `active`
- `Enabled Gateways`: gateway records marked enabled
- `Unmapped Plans`: plans that do not yet have provider price mappings

Left side:

- `Add Plan`: creates internal NursingMocks billing plans
- `Add Gateway`: creates payment gateway configuration records

Right side:

- `Plans`: existing billing plans
- `Gateways`: existing payment gateway records
- `Provider Price Mappings`: existing provider price mappings, shown as cards instead of raw JSON

### Plan Fields

`Plan ID`

- internal stable ID for the plan
- used as the Firestore document ID in `billing_plans`
- used later by transactions, subscriptions, provider price mappings, audit logs, and entitlement logic
- should be machine-readable, for example `ati_teas_monthly`
- should not be changed after real billing records reference it

`Slug`

- URL-safe/readable identifier for customer-facing or admin lookups
- example: `ati-teas-monthly`
- separate from `Plan ID` so internal billing references can stay stable even if display wording changes

`Name`

- human-readable plan name shown to admins and eventually customers
- automatically normalized before saving
- the admin form also normalizes the field when the Name input loses focus
- separators such as `-`, `_`, and `.` become spaces
- punctuation and unsupported characters are removed
- each word is capitalized

Example:

```text
ati-teas.monthly_plan!! -> Ati Teas Monthly Plan
```

`Status`

- `draft`: plan can be configured without being sellable
- `active`: plan is intended to be sellable later, once provider mapping and checkout are implemented
- `inactive`: plan is not currently sellable
- `archived`: plan is retained for history but should not be reused for new purchases

`Purchase Type`

- `subscription`: recurring billing
- `one_time`: one-time purchase
- `manual_access`: admin/manual access workflow, not a payment checkout

`Interval`

- recurring or duration label for the plan
- subscription plans require an interval
- lifetime plans must use `one_time`

`Price` and `Currency`

- internal amount and currency for the plan
- these are not trusted for payment until provider price mappings and verified checkout are added
- provider price mappings must later match the internal amount and currency before checkout is enabled

`Trial Days`

- number of trial days for a plan
- must be zero or greater
- currently stored only as configuration

`Display Order`

- ordering hint for admin/customer plan lists
- lower numbers should appear first

`Packages`

- defines what content a plan should grant access to after verified payment or manual grant
- current options:
  - `ati_teas_7`: ATI TEAS 7 entrance exam package
  - `hesi_a2`: HESI A2 entrance exam package
  - `nursing_test_bank`: Nursing Test Bank package
  - `nursing_exit_exams`: Nursing Exit Exams package
  - `all_access`: broad bundle marker

Important package rule:

- ATI TEAS and HESI are separate Nursing Entrance Exam packages
- do not use one broad `nursing_entrance_exams` package for both
- this matches existing user entitlement keys:
  - `exam:ati_teas_7`
  - `exam:hesi_a2`

`Assigned Gateways`

- controls which gateway records can process a plan later
- active plans require at least one gateway
- checkout is still disabled, so this is configuration only for now

`Public`

- intended to control whether a plan is visible to customers later
- currently stored only as admin configuration

`Featured`

- intended to mark plans for highlighted display later
- currently stored only as admin configuration

### Gateway Fields

`Gateway ID`

- stable internal ID for a gateway record
- used as the Firestore document ID in `billing_gateways`
- examples: `stripe_us_test`, `paypal_default`

`Provider`

- trusted provider adapter type
- current choices:
  - Stripe
  - PayPal
  - Authorize.Net

The admin can create gateway records for multiple providers, but only providers with server-side adapters can be used for payment behavior in later stages.

`Environment`

- `test` or `live`
- used later to prevent checkout from mixing test and live gateway configuration

`Display Name`

- admin-readable gateway label

`Currencies`

- currencies the gateway can process
- example: `USD, CAD`

`Countries`

- countries the gateway can serve
- blank means global/no country restriction in the current validation model

`Payment Types`

- supported payment flow types for the gateway
- current options:
  - subscription
  - one-time

`Min Amount`

- smallest plan price this gateway should process
- useful for provider minimum-charge rules or internal business rules
- checkout eligibility will later reject plans below this amount for that gateway

`Max Amount`

- largest plan price this gateway should process
- useful when high-value purchases should use another gateway or require manual handling
- checkout eligibility will later reject plans above this amount for that gateway

`Priority`

- ordering hint when multiple gateways can serve the same plan
- lower numbers should be preferred first

Example:

```text
Stripe US: 1
PayPal: 2
Authorize.Net: 3
```

`Enabled`

- marks the gateway as available for future eligibility checks
- enabled gateways still cannot process checkout until later stages implement provider price mappings, checkout, and webhooks

`Default Gateway`

- admin preference marker for default routing
- currently stored only as configuration

### Provider Price Mappings

Provider price mappings connect internal plans to external provider price IDs.

Example future mapping:

```text
Plan: ati_teas_monthly
Gateway: stripe_us_test
Provider price ID: price_123
Amount: 29 USD
Interval: monthly
```

This stage now supports creating provider price mappings and displaying existing mapping records. Editing provider price mappings is still deferred.

### What This Stage Does Not Do

This stage does not:

- create Stripe prices
- create checkout sessions
- verify webhook events
- grant entitlements
- update customer billing records
- expose payment secrets
- make pricing pages read dynamic plans

Access must still not be granted until later stages verify trusted provider webhooks.

## Follow-up: Provider Price Mapping Management

Added admin provider price mapping creation.

Files updated:

- `src/lib/billing/admin-config.ts`
- `src/lib/admin/billing.ts`
- `src/app/api/admin/billing/route.ts`
- `src/app/admin/billing/page.tsx`
- `src/lib/billing/__tests__/admin-config.test.ts`

Implemented:

- `Add Provider Price Mapping` form on `/admin/billing`
- admin API support for `type: "providerPriceMapping"`
- server-side provider price mapping validation
- Firestore writes to `billing_provider_price_mappings`
- audit log writes to `billing_audit_logs`
- provider mapping cards in the existing management area

Validation rules:

- selected plan must exist
- selected gateway must exist
- selected gateway must be assigned to the selected plan
- provider must match the selected gateway provider
- environment must match the selected gateway environment
- amount must match the internal plan price
- currency must match the internal plan currency
- purchase type must match the internal plan purchase type
- billing interval must match the internal plan billing interval
- external price ID or external plan ID is required
- duplicate mapping IDs are rejected

Admin form behavior:

- selecting a plan fills amount, currency, interval, and purchase type from the plan
- selecting a gateway fills provider and environment from the gateway
- checkout remains disabled
- provider price sync remains disabled
- webhook handling remains disabled

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- admin gateway, plan, and provider price mapping validation tests passed
- billing gateway registry tests passed
- billing validation tests passed
- TypeScript passed

## Follow-up: Billing Form Input Layout

Fixed crowded admin billing form rows where amount, currency, interval, min amount, max amount, and priority inputs could squeeze into each other.

Changed:

- reduced the plan price/currency/trial/display-order row from four columns to two columns
- reduced gateway min amount/max amount/priority from three columns to two columns
- reduced provider mapping amount/currency/interval from three columns to two columns
- reduced provider/environment/purchase type read-only fields from three columns to two columns
- added explicit full-width/min-width constraints to affected inputs so they stay inside their grid cells

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Follow-up: Plan Pricing Field Stack

Updated the Add Plan pricing fields so each field has its own row.

Changed:

- stacked `Price`, `Currency`, `Trial Days`, and `Display Order`
- kept full-width/min-width input constraints
- reduced the chance of labels and values visually crossing in the left-column admin form

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed

## Follow-up: Admin Full-Width Layout Standard

Updated the repository instructions and billing admin page to follow the full-width admin workspace standard used by the exam admin pages.

Changed:

- documented admin page layout rules in `AGENTS.md`
- specified the shared admin sidebar offsets: `md:ml-20` collapsed and `md:ml-64` expanded
- documented that admin workspaces should avoid centered width caps such as `mx-auto max-w-7xl`
- documented `w-full max-w-none` as the preferred inner admin workspace container
- updated `/admin/billing` from `mx-auto max-w-7xl` to `w-full max-w-none`
- kept existing admin page body padding: `px-4 py-6 sm:px-6 lg:px-8`

Reason:

- admin pages contain dense management data
- full-width layouts match `/admin/nursing-entrance-exam`
- shared admin pages should have consistent working width after the sidebar

## Follow-up: User Management Style Admin Billing Redesign

Redesigned `/admin/billing` to better match the admin User Management page aesthetic and organization.

Changed:

- made record management the primary workspace
- moved create forms into the secondary side column
- converted plan cards into a compact admin table
- converted gateway cards into a compact admin table
- converted provider price mapping cards into a compact admin table
- kept the same gray admin workspace, white bordered sections, purple accent buttons, compact table headers, and small status pills used by `/admin/users`
- documented reusable admin visual design rules in `AGENTS.md`

Design standard added to `AGENTS.md`:

- admin shell/background colors
- page eyebrow/title/supporting text styles
- primary and secondary button styles
- input focus and border styles
- card/panel styles
- section header styles
- admin table styles
- status badge tone rules
- preferred main-table plus secondary-panel layout

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: Easier Admin Management And Scrolling

Optimized `/admin/billing` for easier admin management and shorter scrolling.

Changed:

- added tabs for `Plans`, `Gateways`, and `Provider Mappings`
- only one dense management table is shown at a time
- made `Add Plan`, `Add Gateway`, and `Add Provider Price Mapping` collapsible
- kept the User Management visual style: gray workspace, white bordered panels, purple active controls, compact tables, and small status pills
- documented the tabbed-table and collapsible-form pattern in `AGENTS.md` for future admin pages

Reason:

- billing has multiple record types, and stacking all tables plus all forms made the page too long
- tabs keep record review focused
- collapsible create forms keep the creation tools available without dominating the page
- this better supports dense admin data and repeated management workflows

Validation run:

```text
npm test -- src/lib/billing/__tests__/admin-config.test.ts src/lib/billing/__tests__/gateway-registry.test.ts src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing tests passed
- TypeScript passed
