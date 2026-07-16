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
