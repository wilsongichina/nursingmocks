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
- Change-log documentation.

Not implemented yet:

- User edits.
- Account disable/enable.
- User deletion.
- Admin claim changes.
- Entitlement changes.
- Billing changes.
- Subscription changes.
- Quiz progress edits.
- User impersonation.
- User export.
- Admin audit logs.

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

Before write actions are added, the project should add a reliable admin audit-log system.

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
- User detail panel.
- Firebase Auth status badges.
- Admin claim indicator.
- Subscription summary.
- Loading state.
- Empty state.
- Error state.

### Change-log entry

```text
Project Change Log/Admin user management.md
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

Before adding write actions, create:

```text
adminAuditLogs
```

Recommended fields:

```ts
type AdminAuditLog = {
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
  ipHash?: string;
  userAgent?: string;
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

Add:

- `adminAuditLogs` collection
- server-side audit helper
- request IDs
- action naming convention
- audit viewer for admins

Do this before account-changing actions.

### Phase 3: Safe support actions

Add low-risk actions:

- send Firebase password reset email
- resend welcome email
- revoke refresh tokens
- refresh user detail

Rules:

- protected server routes only
- admin claim required
- audit log required
- no arbitrary email content
- no arbitrary recipient override

### Phase 4: Account status actions

Add:

- disable Firebase Auth user
- enable Firebase Auth user
- mark Firestore account state as locked if needed
- unlock account if needed

Requirements:

- confirmation modal
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

- Page is read-only.
- No audit log exists yet.
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
