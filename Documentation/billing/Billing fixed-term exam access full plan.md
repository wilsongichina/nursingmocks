# Billing Fixed-Term Exam Access Full Plan

## Goal

Move billing and access from fixed packages and All Access into a scalable exam-based model.

- No All Access plan for new billing setup.
- Each exam is purchased separately.
- Each exam supports fixed-term access: 1 Month and 3 Months.
- No automatic renewal.
- Future exams can be added from admin without code changes.

## Stage 1: Data Model

Create an admin-managed exam access catalog.

Model:

```ts
type ExamAccessProduct = {
  examId: string;
  name: string;
  category: string;
  description?: string;
  active: boolean;
  displayOrder: number;
};
```

Billing plans reference one exam:

```ts
type BillingPlan = {
  examId: string;
  durationDays: 30 | 90;
  renewsAutomatically: false;
};
```

Entitlements become exam-based:

```ts
type UserEntitlement = {
  examId: string;
  accessStartsAt: Date;
  accessEndsAt: Date;
  status: "active" | "expired";
};
```

Affected areas:

- `src/lib/billing/models.ts`
- `src/lib/user-entitlements.ts`
- `src/lib/billing/admin-config.ts`
- Firestore billing seed/config scripts
- billing tests

## Stage 2: Remove All Access

Remove All Access from active future-facing UI and options:

- admin billing plan package options
- user dashboard access logic
- payments/billing page
- profile billing summary
- entitlement expansion logic for new writes
- documentation

Do not delete historical records blindly. Existing All Access users should either be migrated into individual active exam entitlements or handled as legacy until cleanup.

Affected pages:

- `/admin/billing`
- `/dashboard`
- `/payments`
- `/profile`
- `/pricing`
- `/dashboard/my-exams`

## Stage 3: Fixed-Term Access

Add duration-based access:

- 1 Month Access
- 3 Months Access
- no recurring subscription
- no auto-renew wording
- access end date always visible after purchase
- renew/extend means another one-time payment

Rules:

- If user has no active access, access starts now.
- If user has active access, extend from current `accessEndsAt`.
- If access expired, start from now.
- Access end equals start date plus duration days.

Affected logic:

- Stripe checkout metadata
- webhook entitlement grant logic
- billing transaction records
- access grant records
- dashboard access summary
- payments access status
- profile access summary

## Stage 4: Admin Exam Catalog

Create admin UI to manage exams without code changes.

Route:

```text
/admin/exam-access
```

Admin can:

- add exam
- edit name
- edit category
- set active/inactive
- set display order
- add short description
- choose whether preview is available
- set preview percentage

This catalog becomes the source of truth for billing plan dropdowns and dashboard display.

Affected pages:

- `/admin/exam-access`
- `/admin/billing`
- admin sidebar
- documentation page

## Stage 5: Admin Billing UI

Update billing plan creation/editing.

Instead of package IDs, use:

- Exam
- Duration

Plan creation flow:

1. Select exam.
2. Select duration: 1 Month or 3 Months.
3. Enter price.
4. Assign gateway.
5. Add provider price mapping.

Admin plan table should show:

- Plan name
- Exam
- Duration
- Price
- Gateway
- Status
- Readiness

Affected areas:

- `/admin/billing`
- `/admin/billing/documentation`
- billing validation
- billing audit logs

## Stage 6: Pricing Page

Redesign pricing around exams.

Each exam card should show:

- exam name
- short description
- 1 Month price
- 3 Months price
- start buttons
- preview badge if available

No All Access card.

Affected:

- `/pricing`
- pricing page helpers/components
- checkout links

## Stage 7: User Dashboard

Dashboard should show:

- Primary Exam
- active exams
- expiring soon notices
- Add Exam card only if more active exams are available
- no All Access logic

For each exam card:

- Active / Preview / Expired
- access ends date
- continue/start action
- renew or extend access if paid access exists or expired

Affected:

- `/dashboard`
- dashboard view model
- dashboard tests

## Stage 8: Payments Page

Update `/payments` to focus on fixed-term access.

Show:

- current active exam access
- access end dates
- available plans grouped by exam
- transactions
- no subscriptions
- no recurring wording

Affected:

- `/payments`
- billing catalog API
- billing history API
- payment UI tests if present

## Stage 9: Profile Page

Profile should summarize:

- Primary Exam
- active exam access
- paid plan wording changed to active access
- access ends

Remove wording that implies subscription.

Affected:

- `/profile`
- profile view model
- profile tests

## Stage 10: My Exams

Use dynamic exam catalog plus entitlements.

Statuses:

- Active
- Preview
- Expired
- Locked

No hardcoded All Access unlock.

Affected:

- `/dashboard/my-exams`
- My Exams adapters/view models
- exam cards

## Stage 11: Checkout And Stripe

Checkout metadata should include:

- `examId`
- `planId`
- `durationDays`
- `accessType: "fixed_term"`

Webhook should:

- verify event
- find plan
- confirm amount, currency, and provider price
- create transaction
- grant or extend entitlement
- store access end date
- record audit log

Affected:

- `/api/billing/checkout`
- `/api/webhooks/stripe`
- billing services
- webhook tests

## Stage 12: Migration

Before turning this on:

1. Read current user entitlements.
2. Convert old package IDs to exam IDs:
   - `ati_teas_7`
   - `hesi_a2`
   - `nursing_test_bank`
   - `nursing_exit_exams`
3. Convert any All Access records into separate exam entitlements only if needed.
4. Remove All Access from future UI.
5. Keep old records readable for audit.

## Stage 13: Documentation

Update:

- `Documentation/billing/*`
- `Documentation/user-dashboard/*`
- `Documentation/user-dashboard/User typography standards.md`
- admin documentation page
- main project rules if needed

Document clearly:

- exams are admin-managed
- plans are exam-based
- access is fixed-term
- there are no auto-renew subscriptions
- entitlements control access

## Recommended Build Order

1. Add exam access catalog model and defaults.
2. Remove All Access from active UI/options.
3. Add duration fields to billing plans.
4. Update admin billing UI.
5. Update checkout/webhook entitlement duration logic.
6. Update pricing and payments pages.
7. Update dashboard/profile/My Exams.
8. Add migration/cleanup script.
9. Update documentation.
10. Run full typecheck and focused tests.

## Pages Affected

Admin:

- `/admin`
- `/admin/billing`
- `/admin/billing/documentation`
- `/admin/exam-access`
- admin sidebar

User:

- `/pricing`
- `/dashboard`
- `/dashboard/my-exams`
- `/payments`
- `/profile`

APIs:

- `/api/billing/catalog`
- `/api/billing/checkout`
- `/api/billing/history`
- `/api/webhooks/stripe`
- admin billing APIs
- exam catalog APIs

Data:

- billing plans
- payment gateways
- provider price mappings
- transactions
- access grants
- user entitlements
- exam catalog

Testing:

- billing validation
- checkout readiness
- webhook entitlement grant
- dashboard access logic
- payments access logic
- profile summary
- All Access removal
- fixed-term extension logic
