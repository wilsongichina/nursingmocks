# Billing Stage 27 Customer Payments UI Redesign

## Purpose

Stage 27 improves the customer-facing `/payments` page so users can manage payments and access more easily without exposing subscription management.

## Files Changed

- `src/app/payments/page.tsx`
- `Documentation/user-dashboard/User dashboard.md`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/billing/Billing stage 27 customer payments UI redesign.md`

## Behavior Updated

The `/payments` page now uses a dashboard-style layout with:

- a shared user account theme matching `/dashboard` and `/profile`
- a light account status header using the radial user-page background
- current plan, provider, and access end summary
- compact status tiles for access, plan, last payment, and access end
- clearer one-time access plan cards
- a dedicated payment transactions section
- a dedicated active access section
- a dedicated access grants section

## Follow-up UI Simplification

The `/payments` page was further simplified for brand-new or preview-only users:

- removed the internal-sounding checkout readiness pill from the page header
- changed the plan summary fallback to `No Paid Plan` so it matches the dashboard wording
- renamed the summary tile from `Paid Plan` to `Current Plan`
- hid `Access End` details when the user does not have a paid plan or recorded access end date
- hid the `Active Access` panel when there are no active access grants, avoiding repeated no-access messages
- kept payment transactions visible because they are the user's payment history
- kept access grant history visible as a read-only access history section

The plan-card grid was intentionally left unchanged. The current request excluded changes to the available-plan whitespace/layout.

Checkout return notice follow-up:

- the `/payments?checkout=success` notice now distinguishes between a pending webhook update and active access
- when active entitlements are already present, the notice says access was updated successfully
- when entitlements are not present yet, the notice explains that Stripe must send a verified webhook before access changes
- checkout session creation, webhook verification, and entitlement writing were not changed

Access status follow-up:

- the `/payments` access summary now derives active access from both `users/{uid}.entitlements` and active `billing_entitlements` returned by billing history
- this prevents the visible Access Status tile from staying inactive when the webhook wrote billing entitlement records but the user document snapshot has not caught up
- after `checkout=success`, the page briefly refreshes billing history so successful webhook writes can appear without requiring a manual page refresh
- visible payment status is still authenticated per-user and does not expose other users' billing records

Transactions remain visible because they are payment history. Subscription management remains hidden because recurring subscriptions are not part of the current product flow.

## Theme Decision

The customer payments page must use the shared authenticated user account theme, not a separate payments theme.

Theme reference:

```text
Documentation/user-dashboard/User dashboard.md
```

Recorded theme rules:

- radial violet page background over `#f5f6fb`
- `#202437` primary text
- `#7a819c` secondary text
- `#6a5cff` primary accent
- white rounded account panels with soft shadows
- dashed compact status pills
- rounded full primary and secondary actions

## Scope

This is a UI-only change. It does not change:

- billing catalog loading
- billing history loading
- entitlement loading
- checkout session request payload
- webhook-dependent access updates
- backend billing records

## Validation

Completed:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.
