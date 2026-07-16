# Admin user management documentation

## Purpose

This document explains the first NursingMocks admin user-management implementation and records what should be added in future phases.

The current implementation gives admins a read-only view of registered users by combining:

- Firebase Authentication account records.
- Firestore `users/{uid}` profile documents.

The page is intentionally read-only because user management touches sensitive data such as email addresses, account status, billing summaries, entitlements, referral information, and admin claims.

Branch:

```text
feature/admin-user-management
```

Main admin route:

```text
/admin/users
```

## Current implementation status

Implemented:

- Read-only admin user directory.
- Read-only user detail panel.
- Protected server-side API routes.
- Firebase Admin SDK user lookup.
- Firestore profile lookup through Firebase Admin SDK.
- Admin custom-claim enforcement on API routes.
- Admin dashboard card.
- Admin sidebar navigation item.
- Admin audit-log foundation.
- Admin audit-log viewer.
- Audited user-detail view events.
- Audited support email actions.
- Audited account disable/enable actions.
- Change-log documentation.

Not implemented yet:

- User edits.
- User deletion.
- Admin claim changes.
- Entitlement changes.
- Billing changes.
- Subscription changes.
- Quiz progress edits.
- User impersonation.
- User export.

## Why this phase is read-only

Admin user management can become high-risk quickly.

The system currently displays private account information but does not allow writes. This is the safest first step because it lets admins inspect user accounts while avoiding accidental or unauthorized changes to:

- Firebase Auth users.
- Custom claims.
- Firestore user profiles.
- Billing state.
- Entitlements.
- Referral balances.
- Quiz progress.
- Subscription records.

Before write actions are added, every account-changing route must use the admin audit-log system.

## Files created

### Server-side user service

```text
src/lib/admin/users.ts
```

Purpose:

- Centralizes admin user-management server logic.
- Uses Firebase Admin SDK.
- Reads Firebase Auth users.
- Reads matching Firestore `users/{uid}` documents.
- Merges both sources into safe response objects.
- Normalizes timestamps for frontend display.
- Keeps Firebase Admin SDK out of browser code.

Key exported functionality:

- `listAdminUsers`
- `getAdminUserDetail`

Main data returned:

- Firebase Auth identity.
- Firebase Auth metadata.
- Firebase Auth custom claims.
- Firebase Auth provider list.
- Firestore profile summary.
- Firestore access summary.
- Firestore billing summary.
- Firestore entitlement summary.
- Firestore referral summary.
- Firestore stats summary.

### User-list API route

```text
src/app/api/admin/users/route.ts
```

Purpose:

- Provides the admin user directory data.
- Handles:

```text
GET /api/admin/users
```

Supported query parameters:

```text
limit
pageToken
search
```

Behavior:

- Requires `Authorization: Bearer <Firebase ID token>`.
- Verifies the token with Firebase Admin SDK.
- Requires decoded token claim `admin: true`.
- Calls `listAdminUsers`.
- Returns structured user summaries.
- Does not allow writes.

### User-detail API route

```text
src/app/api/admin/users/[uid]/route.ts
```

Purpose:

- Provides selected user detail data.
- Handles:

```text
GET /api/admin/users/:uid
```

Behavior:

- Requires `Authorization: Bearer <Firebase ID token>`.
- Verifies the token with Firebase Admin SDK.
- Requires decoded token claim `admin: true`.
- Validates that a UID was provided.
- Calls `getAdminUserDetail`.
- Returns a structured read-only user detail object.
- Does not allow writes.

### Admin users page

```text
src/app/admin/users/page.tsx
```

Purpose:

- Adds the admin user-management interface.
- Displays the user directory.
- Displays selected user details.
- Calls protected API routes using the current Firebase user's ID token.
- Keeps all user changes disabled because this phase is read-only.

Main UI features:

- User table.
- Search input.
- Pagination controls.
- Current-page summary cards.
- Search mode explanation.
- Read-only phase notice.
- User detail panel.
- Firebase Auth status badges.
- Admin claim indicator.
- Subscription summary.
- Loading state.
- Empty state.
- Error state.

## Follow-up: management visibility improvements

The `/admin/users` page was updated to make Firebase Auth pagination and search behavior clearer for admins.

Behavior:

- shows the number of users currently visible from the loaded Firebase Auth page
- shows the current page position based on Firebase Auth page-token navigation
- explains whether search is global exact-email lookup or current-page filtering
- adds a clear read-only phase notice before future account-changing actions are added
- table footer now states that Firebase Auth is paginated and exact email search is the global lookup path

Files changed:

- `src/app/admin/users/page.tsx`
- `Documentation/admin/Admin user management.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: full-width typography alignment

The `/admin/users` page was aligned with the shared typography visual system while preserving the full-width admin workspace standard.

Behavior:

- uses shared typography classes for page title, body copy, cards, detail surfaces, labels, fields, buttons, alerts, status pills, and helper text
- keeps the admin workspace full width after the sidebar and avoids centered width caps such as `mx-auto max-w-7xl`
- keeps compact header controls, such as user search, visually constrained so admin pages do not create awkward full-width form bars
- adds native autocomplete suggestions from the currently loaded Firebase Auth page using email, UID, display name, and Firestore full name values
- searches automatically as the admin types, with a short debounce to avoid firing a request on every keystroke
- keeps exact email lookup global when a full Firebase Auth email matches, then falls back to current-page filtering for partial email input
- keeps the dense table layout appropriate for admin management screens
- preserves read-only behavior, Firebase Auth pagination, exact-email lookup, and user detail loading behavior

Files changed:

- `src/app/admin/users/page.tsx`
- `Documentation/admin/Admin user management.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: structured user detail panel

The `/admin/users` detail panel was reorganized for easier account review while keeping the page read-only.

Behavior:

- replaces the primary raw-detail view with named management sections
- adds Identity, Access, Billing, Activity, and Account State sections
- keeps status badges visible at the top of the selected-user panel
- keeps billing as a snapshot and entitlements/access as the source of access truth
- keeps raw custom-claim and Firestore payloads inside a collapsed Technical Records area for troubleshooting
- preserves the existing Firebase Auth and Firestore read flow without adding write actions

Files changed:

- `src/app/admin/users/page.tsx`
- `Documentation/admin/Admin user management.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: admin audit logging foundation

The admin user-management audit foundation was implemented before account-changing actions are added.

Behavior:

- adds the `adminAuditLogs` collection contract for general admin actions
- adds a server-only audit helper with request IDs, actor details, target details, before/after summaries, reason, status, error message, user agent, and hashed IP metadata
- adds `/api/admin/audit-logs` for protected admin reads
- adds `/admin/audit-logs` as a full-width admin typography page
- adds Audit Logs to the admin sidebar and admin dashboard
- records `user.detail.view` audit events whenever an admin opens a user detail record
- keeps the user-management page read-only and does not add account-changing actions yet

Files changed:

- `src/lib/admin/audit.ts`
- `src/app/api/admin/audit-logs/route.ts`
- `src/app/api/admin/users/[uid]/route.ts`
- `src/app/admin/audit-logs/page.tsx`
- `src/components/layout/AdminSidebar.tsx`
- `src/app/admin/page.tsx`
- `Documentation/admin/Admin user management.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: audited support email actions

The first low-risk support actions were added to `/admin/users`.

Behavior:

- adds `Send Password Reset` to the selected-user detail panel
- adds `Send Email Verification` only when the selected user email is not verified
- uses protected server route `/api/admin/users/[uid]/support-actions`
- verifies the caller has `admin: true`
- loads the target user server-side by UID
- generates Firebase Authentication action links on the server
- queues branded NursingMocks emails through `emailJobs`
- runs the email worker for immediate delivery attempts
- writes `user.password_reset.send` and `user.email_verification.send` audit logs
- writes failure audit logs when a support action fails after admin verification
- does not expose passwords, change account state, or let admins provide arbitrary recipients

Files changed:

- `src/app/admin/users/page.tsx`
- `src/app/api/admin/users/[uid]/support-actions/route.ts`
- `src/app/api/admin/users/[uid]/support-actions/__tests__/route.test.ts`
- `src/lib/email/template-registry.ts`
- `src/lib/email/jobs.ts`
- `src/lib/email/__tests__/template-registry.test.ts`
- `Documentation/admin/Admin user management.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/app/api/admin/users/[uid]/support-actions/__tests__/route.test.ts src/lib/email/__tests__/template-registry.test.ts
```

## Follow-up: audited account status actions

Reversible account status controls were added to `/admin/users`.

Behavior:

- adds an Account Controls section to the selected-user detail panel
- requires a 10 to 500 character reason before disable/enable can run
- disables Firebase Auth users through a protected server route
- enables Firebase Auth users through a protected server route
- queues a controlled `account_disabled` email when an account is disabled and the target has an email
- queues a controlled `account_enabled` email when an account is enabled and the target has an email
- records whether the account-status email was queued in the audit log
- prevents admins from disabling their own account
- prevents no-op disable/enable requests when the target account is already in that state
- writes `user.account.disable` and `user.account.enable` audit logs with before/after summaries
- writes failure audit logs when an account status action fails after admin verification
- refreshes the selected user detail and current user list after a successful status change
- does not delete users, edit entitlements, edit billing, or change admin claims

Files changed:

- `src/app/admin/users/page.tsx`
- `src/app/api/admin/users/[uid]/account-status/route.ts`
- `src/app/api/admin/users/[uid]/account-status/__tests__/route.test.ts`
- `src/lib/email/template-registry.ts`
- `src/lib/email/jobs.ts`
- `src/lib/email/__tests__/template-registry.test.ts`
- `Documentation/admin/Admin user management.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/app/api/admin/users/[uid]/account-status/__tests__/route.test.ts src/app/api/admin/users/[uid]/support-actions/__tests__/route.test.ts src/lib/email/__tests__/template-registry.test.ts
```

## Follow-up: admin email jobs monitor

A read-only admin email queue monitor was added so support actions can be verified without exposing sensitive template data.

Behavior:

- adds `/admin/email-jobs`
- adds `/api/admin/email-jobs`
- adds Email Jobs to the admin sidebar and dashboard
- lists recent `emailJobs` records
- supports template, status, and recipient filters across the latest 50 jobs
- shows status, attempts, provider metadata, timestamps, error details, idempotency key, and safe template data keys
- displays readable title-case names in admin tables instead of raw underscore, hyphen, or dot-separated identifiers
- normalizes readable filter input such as `Password Reset` or `Admin Audit View` back to stored identifiers
- hides sensitive template values such as reset URLs, verification URLs, and account-status messages
- does not add retry, delete, or manual edit actions

Files changed:

- `src/lib/admin/email-jobs.ts`
- `src/app/api/admin/email-jobs/route.ts`
- `src/app/admin/email-jobs/page.tsx`
- `src/components/layout/AdminSidebar.tsx`
- `src/app/admin/page.tsx`
- `Documentation/admin/Admin user management.md`
- `Documentation/email/Transactional email system documentation.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: sidebar logo autofit

Updated the admin sidebar logo header so the logo fits the available top-left section cleanly.

Behavior:

- full sidebar and mobile drawer use the full NursingMocks logo inside a constrained header-safe box
- collapsed desktop sidebar uses the compact favicon-style logo
- logo images use `object-contain`, max height, max width, and overflow protection
- mobile drawer always shows the full logo even when the desktop sidebar was previously collapsed

Files changed:

- `src/components/layout/AdminSidebar.tsx`
- `src/components/layout/Sidebar.tsx`
- `Documentation/admin/Admin user management.md`
- `Documentation/user-dashboard/User dashboard.md`

## Follow-up: dedicated admin sidebar

Updated the admin left menu so it is dedicated to admin work and no longer shares user dashboard navigation items.

Behavior:

- removed user-facing dashboard, profile, referrals, payments, and progress-report links from the admin sidebar
- added `Admin Dashboard` as the admin landing page link
- kept admin content links and admin tool links only
- kept the existing auth/session behavior unchanged
- replaced bullet-dot subitems with a left divider line, matching the cleaner user-sidebar subnavigation style
- preserved the existing sidebar collapse, mobile drawer, route highlighting, and logout behavior

Admin profile decision:

- admins share the same Firebase Auth identity and base `users/{uid}` account record as other authenticated users
- the admin UI should not send admins to the customer `/profile` page from the admin menu
- `/admin/profile` provides an admin-facing identity view using the same signed-in Firebase user
- `/admin/profile` allows the signed-in admin to update display name only
- display name updates go through `/api/admin/profile`, update Firebase Auth plus safe mirrored Firestore fields, and write `user.profile.update` audit logs
- email, UID, admin claim, role, access flags, billing, entitlements, account status, login security, provider IDs, and audit records remain locked from admin profile editing

Files changed:

- `src/components/layout/AdminSidebar.tsx`
- `src/app/admin/profile/page.tsx`
- `src/app/api/admin/profile/route.ts`
- `Documentation/admin/Admin user management.md`

## Follow-up: admin dashboard command center

Redesigned `/admin` from a simple grid of links into an admin command center.

Behavior:

- adds `/api/admin/dashboard` for server-side admin dashboard summaries
- keeps dashboard stats behind the existing Firebase admin authorization boundary
- shows top KPI cards for total users, active users, disabled users, verified emails, transactions, revenue, active access grants, and pending email jobs
- shows operational attention items for high-attention login security accounts, review accounts, failed email jobs, and recent audit failures
- shows compact recent payment and recent admin-failure tables
- preserves the existing admin destinations by grouping them into Users & Security, Billing, Content Management, and System sections
- keeps `/admin` full width and aligned with the shared admin typography/card/table patterns
- uses the shared `/typography` card system: `user-stat-tile` for KPI cards, plain `user-card` for management links, `user-card-title` for headings, `user-helper` for secondary copy, `user-pill` for metadata, and `user-button-secondary` for card actions
- removes custom tinted admin card backgrounds, tone accents, and one-off action pill styling so admin cards stay consistent with the documented typography system

Data sources:

- Firebase Auth user list for total, disabled, and verified user counts
- `users` for active-in-last-30-days activity
- `billing_transactions` for transaction and revenue summaries
- `billing_entitlements` for active access grant count
- `users/{uid}.login_security` snapshots for login-security attention counts
- `emailJobs` for pending and failed email work
- `adminAuditLogs` for recent failed admin actions

Files changed:

- `src/app/admin/page.tsx`
- `src/app/api/admin/dashboard/route.ts`
- `src/lib/admin/dashboard.ts`
- `Documentation/admin/Admin user management.md`

## Follow-up: login security telemetry foundation

The login event writer was extended as the first step toward account-sharing detection.

Behavior:

- keeps writing append-only `user_login_events`
- adds `ip_hash` for privacy-preserving IP comparison
- adds coarse `location` from hosting/CDN request headers when available
- adds `device` summary with device type, browser, and operating system
- updates `users/{uid}.login_metrics` with the latest IP hash, device, and location summary
- preserves existing raw IP and user-agent fields for compatibility
- exposes a standalone read-only Login Security section at `/admin/login-security`
- allows lookup by user name, Firebase UID, or exact email address
- shows selectable user matches when a name search finds more than one account
- adds autocomplete suggestions while typing a user search
- keeps the search panel visually constrained instead of stretching across the full admin workspace
- formats displayed user names with readable capitalization instead of showing raw slug-like text
- shows latest login activity with time, provider, device, coarse location, and short IP hash preview
- summarizes reviewed events by unique IP hashes, device profiles, and locations
- adds Account Sharing Signals with Normal, Watch, Review, and High Attention statuses
- calculates 24-hour, 7-day, and 30-day IP/device indicators from `user_login_events`
- highlights recent IP or device switching within 24 hours
- refreshes `users/{uid}.login_security` after each successful login so detection is available without searching every user manually
- adds an Auto-Detected Accounts overview table on `/admin/login-security` for users with Watch, Review, or High Attention snapshots
- treats sharing signals as manual-review guidance only; no automatic blocking or account enforcement is performed
- writes an audit log entry when an admin views a user's login security activity
- falls back to an unordered query if the project does not yet have the Firestore composite index for ordered login history
- keeps `/admin/users` focused on account identity, access, billing snapshots, support actions, and account status controls

Signal thresholds:

- Normal: no unusual pattern found in the reviewed login history
- Watch: three unique IP hashes or three device profiles in 30 days
- Review: four or more unique IP hashes, four or more device profiles, multiple countries, or repeated 24-hour switching
- High Attention: six or more unique IP hashes or three or more countries in 30 days

The UI explains that shared Wi-Fi, VPNs, mobile networks, work networks, and travel can produce legitimate IP, device, or location changes.

Stored snapshot:

```text
users/{uid}.login_security.status
users/{uid}.login_security.unique_ip_hashes_24h
users/{uid}.login_security.unique_ip_hashes_7d
users/{uid}.login_security.unique_ip_hashes_30d
users/{uid}.login_security.unique_devices_24h
users/{uid}.login_security.unique_devices_7d
users/{uid}.login_security.unique_devices_30d
users/{uid}.login_security.unique_locations_30d
users/{uid}.login_security.unique_countries_30d
users/{uid}.login_security.recent_ip_switches_24h
users/{uid}.login_security.recent_device_switches_24h
users/{uid}.login_security.last_switch_at
users/{uid}.login_security.reasons
users/{uid}.login_security.recommendation
users/{uid}.login_security.last_evaluated_at
```

Still deferred:

- automatic suspicious sharing decisions
- impossible-travel detection
- failed-login tracking

### Change-log entry

```text
Documentation/Admin user management.md
```

Purpose:

- Documents what was built.
- Documents how it works.
- Documents security decisions.
- Documents future additions.
- Appears in the existing project change-log webpage.

## Files edited

### Admin sidebar

```text
src/components/layout/AdminSidebar.tsx
```

Changes:

- Added a `users` icon case to the existing sidebar icon renderer.
- Added a `User Management` navigation link.
- Link target:

```text
/admin/users
```

- Kept the existing sidebar visual style.
- Kept the existing collapsed and expanded sidebar behavior.

### Admin dashboard

```text
src/app/admin/page.tsx
```

Changes:

- Added a `User Management` card to the admin dashboard.
- Link target:

```text
/admin/users
```

- Describes the feature as read-only account review.

## Current user-management flow

### 1. Admin signs in

The admin uses the existing admin authentication system.

The current admin authentication system requires:

- Firebase Authentication user.
- Email/password sign-in provider.
- Firebase ID token claim:

```json
{
  "admin": true
}
```

### 2. Admin opens the users page

The admin opens:

```text
/admin/users
```

The route is still protected by the existing `/admin` layout.

### 3. Browser requests user data

The page gets the current Firebase user's ID token and calls:

```text
GET /api/admin/users
Authorization: Bearer <Firebase ID token>
```

### 4. Server verifies admin access

The Next.js API route calls:

```text
requireAdminFromAuthorizationHeader
```

That helper:

- extracts the bearer token
- verifies it with Firebase Admin SDK
- checks `decoded.admin === true`

If the user does not have the admin claim, the API route rejects the request.

### 5. Server reads Firebase Auth users

The API route uses Firebase Admin SDK to read users from Firebase Authentication.

This is server-side only. The browser does not receive Firebase Admin credentials and cannot call Firebase Admin SDK directly.

### 6. Server reads Firestore user profiles

For each Firebase Auth user returned, the server reads:

```text
users/{uid}
```

from Firestore using Firebase Admin SDK.

Firebase Admin SDK bypasses client Firestore security rules. This is expected and safe only because the API route is protected by server-side admin-token verification.

### 7. Server returns a safe structured response

The API returns a structured summary instead of exposing arbitrary server internals.

### 8. Admin selects a user

When an admin clicks `View`, the browser calls:

```text
GET /api/admin/users/:uid
Authorization: Bearer <Firebase ID token>
```

The server repeats the same admin verification before returning details.

## Security model

The security boundary is the server API route, not the React page.

The browser can render the UI, but it cannot be trusted to decide who is an admin.

The API route must always enforce:

```text
decodedToken.admin == true
```

Do not replace this with:

- email address checks
- Firestore `access.is_admin`
- Firestore `role`
- localStorage
- sessionStorage
- URL parameters
- client-created cookies
- hidden form fields

## Important distinction: admin claim vs Firestore flags

The user detail panel may show Firestore fields such as:

```text
access.is_admin
access.role
```

These are visible for review only.

They are not the source of truth for admin access.

The source of truth is the Firebase Auth custom claim:

```json
{
  "admin": true
}
```

## Current page sections

### User table

The table shows:

- display name
- email
- Firebase UID
- admin claim status
- disabled/enabled status
- email verification status
- subscription status
- plan ID
- last sign-in date

### Search

Search behavior:

- Exact email search works across Firebase Auth using Firebase Admin SDK.
- Other search terms filter the currently loaded Firebase Auth page.

Current limitation:

- There is no full-database text search for names, roles, plans, or UIDs.

Future improvement:

- Add a managed search index or Firestore-backed searchable admin index if advanced search is needed.

### Pagination

Pagination uses Firebase Auth `listUsers` paging.

Current behavior:

- `Next` uses the Firebase Auth `pageToken`.
- `Previous` uses locally remembered page tokens.

Current limitation:

- Firebase Auth list ordering is not optimized for newest users, last active users, or subscription status.

Future improvement:

- Add sortable Firestore admin indexes for operational views.

### User detail panel

The selected user panel shows:

- Firebase UID
- email
- display name
- provider IDs
- disabled status
- email verification status
- admin claim status
- account creation date
- last sign-in date
- account status
- subscription status
- total attempts
- custom claims
- Firestore access object
- Firestore auth object
- Firestore billing object
- Firestore entitlements object
- Firestore referral summary
- Firestore stats

## Data sources

### Firebase Authentication

Firebase Auth is used for:

- UID
- email
- display name
- photo URL
- phone number
- email verification
- disabled status
- provider IDs
- account creation time
- last sign-in time
- custom claims

Firebase Auth is the source of truth for:

- account identity
- disabled/enabled Auth status
- email verification
- custom claims

### Firestore `users/{uid}`

Firestore is used for app-level profile and product data.

The current page reads:

- full name
- email stored in profile document
- phone stored in profile document
- avatar URL
- profile metadata
- app access fields
- app auth profile fields
- billing summary
- entitlement summary
- referral summary
- account state
- quiz stats
- created/updated timestamps
- last login/active timestamps

Firestore is the source of truth for:

- NursingMocks profile fields
- preferences
- app account state
- app subscription summary
- entitlements
- referral summary
- quiz stats

## API response design

The API returns structured objects rather than raw Firebase Admin objects.

Reason:

- avoids exposing unnecessary implementation detail
- keeps the frontend stable if Firebase Admin SDK response shapes change
- gives one place to mask or remove fields later
- prevents accidental exposure of credentials or internal server state

## Privacy considerations

The user-management page displays private account information.

Access must remain limited to trusted admins.

Sensitive data visible to admins includes:

- email addresses
- account status
- subscription summaries
- entitlement summaries
- referral summaries
- activity stats
- custom claims

Do not expose this page to:

- anonymous users
- normal authenticated users
- support users unless a support permission model is created
- marketing users
- affiliates

## Current permissions

Current permission model:

```text
admin: true
```

This means every admin has the same visibility.

There is no separate support, billing, or content-admin role yet.

## Recommended future permission model

Future roles may include:

```text
admin: true
support: true
billing_admin: true
content_admin: true
user_manager: true
```

Possible split:

- `admin: true`: full trusted admin.
- `support: true`: view limited user profile and send password reset.
- `billing_admin: true`: view billing and manage verified billing workflows.
- `content_admin: true`: manage public content only.
- `user_manager: true`: manage basic account status but not billing or admin claims.

This should be designed before exposing user-management capabilities to non-owner staff.

## What must not be added casually

Do not add the following as direct client writes:

- setting admin claims
- editing Firestore `access.is_admin`
- editing Firestore `billing`
- editing Firestore `entitlements`
- editing Firestore `referral_summary`
- editing Firestore `account_state`
- deleting users
- granting free access
- marking invoices paid

All future write actions must go through protected server routes.

## Required pattern for future write actions

Every future user-management write action should follow this pattern:

```text
Admin clicks action
Client sends Firebase ID token to protected API route
API verifies token with Firebase Admin SDK
API requires the correct custom claim or role
API validates request body
API reads current target state
API performs action using Firebase Admin SDK or trusted payment provider API
API writes admin audit log
API returns a safe result
UI refreshes selected user data
```

Do not let the browser write privileged user-management changes directly to Firestore.

## Admin audit logs

Before adding write actions, use:

```text
adminAuditLogs
```

Recommended fields:

```ts
type AdminAuditLog = {
  auditLogId: string;
  action: string;
  actorUid: string;
  actorEmail: string | null;
  targetUid: string | null;
  targetEmail: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  requestId: string;
  createdAt: Timestamp;
  ipHash: string | null;
  userAgent: string | null;
  status: "success" | "failure";
  errorMessage: string | null;
};
```

Audit logs should be:

- append-only
- server-created only
- admin-readable only
- not editable from the browser
- not deletable from the browser

## Recommended future roadmap

### Phase 1: Read-only user management

Status:

```text
Implemented
```

Includes:

- user list
- user detail
- Auth plus Firestore data
- admin-protected API
- no write actions

### Phase 2: Audit logging foundation

Status:

```text
Implemented
```

Includes:

- `adminAuditLogs` collection
- server-side audit helper
- request IDs
- action naming convention
- audit viewer for admins
- hashed IP metadata when available
- `user.detail.view` audit writes when admins open user details

Use this before adding account-changing actions.

### Phase 3: Safe support actions

Status:

```text
Partially implemented
```

Implemented low-risk actions:

- send Firebase password reset email
- send Firebase email verification email

Still deferred:

- resend welcome email
- revoke refresh tokens

Rules:

- protected server routes only
- admin claim required
- audit log required
- no arbitrary email content
- no arbitrary recipient override

### Phase 4: Account status actions

Status:

```text
Partially implemented
```

Implemented:

- disable Firebase Auth user
- enable Firebase Auth user

Still deferred:

- mark Firestore account state as locked if needed
- unlock account if needed

Requirements:

- reason field
- audit log
- prevent admins from disabling themselves accidentally
- prevent lower-privilege admins from disabling owner accounts if role separation is added

### Phase 5: Billing and entitlement visibility improvements

Add:

- clearer subscription timeline
- payment provider customer links
- invoice summaries
- entitlement source and expiration
- access-granted email history

Do not add manual billing edits unless tied to verified payment-provider events or a very strict audited override process.

### Phase 6: Entitlement actions

Possible actions:

- grant temporary access
- revoke temporary access
- extend access

Requirements:

- separate permission, such as `billing_admin: true`
- reason field
- expiration date
- audit log
- never treat client-side payment redirects as proof of purchase
- optional notification email

### Phase 7: Admin claim management

This is high risk.

Possible actions:

- grant admin claim
- remove admin claim
- view claim history

Requirements:

- owner-only or super-admin-only role
- reauthentication
- typed confirmation
- reason field
- audit log
- self-protection checks
- separate server route
- never assign claims from the browser directly

### Phase 8: Advanced search and filtering

Add filters:

- email verified
- disabled
- admin claim
- subscription status
- plan
- created date
- last sign-in date
- account status
- primary exam

Possible implementation:

- Firestore admin search index
- scheduled sync from Firebase Auth
- server-side filtering over selected indexed fields

### Phase 9: Exports and reporting

If exports are needed, add:

- admin-only export request route
- rate limits
- audit logs
- masked fields
- purpose selection
- time-limited signed download URLs

Do not add unrestricted CSV export from the browser.

## Testing performed

Validation commands run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test
.\node_modules\.bin\next.cmd build
```

Results:

- TypeScript passed.
- Vitest passed.
- Production Next.js build passed.

Test output summary:

```text
9 test files passed
40 tests passed
```

Build result:

- `/admin/users` was included in the Next.js route output.
- `/api/admin/users` was included as a dynamic server route.
- `/api/admin/users/[uid]` was included as a dynamic server route.

## Local testing instructions

1. Start the app:

```text
npm run dev
```

2. Open:

```text
http://localhost:3000/admin
```

3. Sign in with an account that has:

```json
{
  "admin": true
}
```

4. Open:

```text
http://localhost:3000/admin/users
```

5. Confirm:

- user list loads
- User Management appears in the sidebar
- User Management appears on the admin dashboard
- selecting `View` loads user detail
- no edit/delete/claim buttons appear

6. Optional negative test:

- sign in with a normal non-admin account
- call `/admin/users`
- confirm the admin layout denies access
- confirm API calls fail without `admin: true`

## Production requirements

The hosting environment must have Firebase Admin configured safely.

Do not use `NEXT_PUBLIC_` variables for Firebase Admin credentials.

Do not commit:

- service-account JSON files
- private keys
- local secret files
- `.env.local`

Required server-side Firebase Admin configuration must remain consistent with:

```text
src/lib/server/firebase-admin.ts
```

Supported safe patterns include:

- secure environment variables
- hosting platform secret manager
- application default credentials where appropriate

## Remaining limitations

- User detail data remains read-only except for audited support email and account status actions.
- Audit logs exist, but only user-detail views, audit-log views, support email actions, and account status actions are wired so far.
- No separate support role exists yet.
- Exact email search is the only cross-auth search.
- General search filters the currently loaded page only.
- User list is not sorted by most recent activity.
- Billing and entitlement display is raw summary data.
- No masking rules beyond structured response shaping.
- No export capability.
- No bulk actions.

## Final operational summary

The current admin user-management system works like this:

```text
Admin opens /admin/users
Browser obtains Firebase ID token
Browser calls protected admin API
Server verifies token with Firebase Admin SDK
Server requires admin: true custom claim
Server reads Firebase Auth users
Server reads matching Firestore users/{uid} documents
Server returns structured read-only data
Admin reviews user list and selected user details
No user data is modified
```

This is the correct foundation for user management. The next important step is admin audit logging before adding any account-changing actions.
