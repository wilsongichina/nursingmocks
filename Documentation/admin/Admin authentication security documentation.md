# Admin authentication security documentation

## Purpose

This document explains the NursingMocks admin authentication security migration.

The goal of the admin authentication work was to remove the legacy hardcoded admin password model and make `/admin` access depend on Firebase Authentication plus a trusted Firebase custom claim:

```json
{
  "admin": true
}
```

Admin access is now based on Firebase identity and token claims, not on a shared password, browser storage, a URL value, or a user document field.

## Summary of what changed

Implemented:

- Removed the legacy hardcoded admin password gate.
- Removed the obsolete password-based admin auth API route.
- Added reusable Firebase custom-claim checking through `useAdminAuthorization`.
- Added an admin-specific email/password sign-in screen at `/admin`.
- Required Firebase email/password sign-in for admin access.
- Required the Firebase ID token custom claim `admin: true`.
- Added clear interface states for loading, unauthenticated, wrong provider, non-admin, claim lookup error, and authorized access.
- Preserved Firestore and Storage rules as the authoritative data protection layer.
- Documented that custom claims must be assigned only from a trusted Firebase Admin SDK environment.

Not changed in this phase:

- Payment functionality.
- Public branding.
- Public page content.
- Quiz behavior.
- Firestore content data.
- Admin page feature behavior other than the access gate.

## Previous admin model

Before Phase 2, admin access used a split and weaker model:

- The admin layout used a hardcoded password.
- The admin API route also contained the same hardcoded password.
- Admin UI access relied on browser-side state such as `sessionStorage`.
- Firestore and Storage rules already expected `request.auth.token.admin == true`, so the UI access model did not match the backend authorization model.

Risks in the old model:

- A shared password could leak or be reused.
- Browser storage could be manipulated.
- UI access did not prove the user had the Firebase `admin` custom claim.
- The admin UI and Firebase rules enforced different concepts of admin access.

## Current admin model

Admin access now requires all of the following:

1. The user is signed in with Firebase Authentication.
2. The user signed in with the Firebase `password` provider.
3. The Firebase ID token contains:

```json
{
  "admin": true
}
```

The admin interface does not grant access based only on:

- Email address.
- `users/{uid}.is_admin`.
- `users/{uid}.role`.
- `localStorage`.
- `sessionStorage`.
- Client-created cookies.
- URL parameters.
- A shared password.

## Main files

### Admin layout gate

```text
src/app/admin/layout.tsx
```

Responsibilities:

- Wraps all `/admin` routes.
- Shows admin sign-in form when no Firebase user is authenticated.
- Validates admin email/password input before calling Firebase Auth.
- Calls the shared admin authorization hook.
- Handles Firebase login errors with user-friendly validation messages.
- Shows loading, access denied, wrong-provider, verification-error, and authorized states.

### Reusable admin authorization hook

```text
src/hooks/useAdminAuthorization.ts
```

Responsibilities:

- Reads the current Firebase user from `useAuth`.
- Waits for Firebase Auth state to finish loading.
- Calls:

```ts
currentUser.getIdTokenResult(true)
```

- Forces token refresh so newly assigned claims can be picked up.
- Verifies the sign-in provider is `password`.
- Verifies `tokenResult.claims.admin === true`.
- Returns a typed status for the admin layout to render.

Admin statuses:

```text
loading
unauthenticated
invalid-provider
not-admin
authorized
error
```

### Firebase Auth context

```text
src/contexts/AuthContext.tsx
```

Responsibilities:

- Provides `currentUser`.
- Provides `loading`.
- Provides `login`.
- Provides `logout`.
- Provides registration and reset-password helpers.
- Uses Firebase Authentication email/password login through `signInWithEmailAndPassword`.

### Firebase rules

```text
firestore.rules
storage.rules
```

Relevant behavior:

- Firestore uses:

```text
request.auth.token.admin == true
```

- Storage uses:

```text
request.auth.token.admin == true
```

This means the Firebase custom claim is the authoritative backend signal for privileged writes.

## Step-by-step admin access flow

### 1. User opens `/admin`

The route is wrapped by:

```text
src/app/admin/layout.tsx
```

The layout starts by checking Firebase Auth state through `useAuth`.

### 2. App waits for Firebase Auth state

If Firebase Auth is still loading, the admin page shows:

```text
Checking admin access
```

This prevents the UI from flashing protected admin content before auth state is known.

### 3. User is not signed in

If there is no Firebase user, the admin route shows a dedicated admin sign-in screen.

The admin sign-in screen:

- Accepts email and password only.
- Requires both fields.
- Validates email format.
- Calls the existing Firebase Auth `login` method.
- Uses email/password sign-in.
- Shows clear validation errors.

Example validation messages:

- `Enter your admin email and password.`
- `Enter a valid email address.`
- `Invalid email or password.`
- `This account has been disabled.`
- `Too many failed attempts. Please try again later.`

### 4. User signs in

The admin form calls:

```ts
login(trimmedEmail, password, true)
```

The `login` function in `AuthContext` uses:

```ts
signInWithEmailAndPassword(auth, email, password)
```

Firebase Authentication verifies the credentials.

### 5. Admin claim is checked

After Firebase sign-in succeeds, `useAdminAuthorization` runs:

```ts
currentUser.getIdTokenResult(true)
```

The `true` argument forces a token refresh.

This matters because Firebase custom claims can be added after a user already has a token. Without refreshing, the browser might keep using an older token that does not yet contain the `admin` claim.

### 6. Sign-in provider is checked

The hook checks:

```ts
tokenResult.signInProvider !== "password"
```

If the user signed in with Google or another provider, the status becomes:

```text
invalid-provider
```

The UI then shows:

```text
Email Login Required
```

Reason:

- Admin access was intentionally restricted to Firebase email/password sign-in.
- This avoids relying on a social login session for admin access.

### 7. Custom claim is checked

The hook checks:

```ts
tokenResult.claims.admin === true
```

If true, the user is allowed into `/admin`.

If false or missing, the status becomes:

```text
not-admin
```

The UI shows:

```text
Access Denied
```

### 8. Authorized admin sees admin pages

Only after the Firebase token shows `admin: true` does the layout render:

```tsx
{children}
```

That means the admin dashboard and nested admin pages are not rendered until the authorization check passes.

## Interface states

### loading

Shown while Firebase Auth state or claim lookup is pending.

Purpose:

- Avoids exposing admin UI before authorization is known.

### unauthenticated

Shown when no Firebase user is signed in.

Behavior:

- Displays the admin email/password sign-in form.

### invalid-provider

Shown when a user is authenticated but did not sign in with Firebase email/password.

Behavior:

- Tells the user email/password login is required.
- Provides a sign-out button.

### not-admin

Shown when a user is authenticated but the token does not contain:

```json
{
  "admin": true
}
```

Behavior:

- Shows Access Denied.
- Provides a link back to the normal dashboard.

Important:

- The dashboard link is not an admin bypass.
- It only sends the user back to the normal user area.
- Returning to `/admin` still requires the admin claim.

### error

Shown when token refresh or claim lookup fails.

Behavior:

- Shows a retry button.
- Does not render admin content.

### authorized

Shown when the user is authenticated, signed in with the password provider, and has `admin: true`.

Behavior:

- Renders admin child routes.

## Firebase custom claim setup

Admin access requires setting this custom claim on the Firebase Auth user:

```json
{
  "admin": true
}
```

This must be done using a trusted server environment with Firebase Admin SDK.

Do not set admin status from:

- Client code.
- Browser console.
- URL parameters.
- Firestore user profile fields.
- Public API routes.
- User-submitted forms.

## Trusted claim assignment example

Use this only in a trusted local/server environment, never in browser code.

Example:

```js
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp({
  credential: applicationDefault(),
});

async function setAdminClaim(uid) {
  await getAuth().setCustomUserClaims(uid, { admin: true });
  console.log("Admin claim set.");
}

setAdminClaim("USER_UID_HERE").catch(console.error);
```

Local credential options:

- Use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON outside the repo.
- Or use server-only Firebase Admin environment variables.

Security rule:

- Never commit service-account JSON files.
- Never paste service-account private keys into chat or public tools.
- Revoke any key that was exposed.

## Difference between `is_admin` and `admin` custom claim

The project has user document fields such as:

```text
is_admin
role
```

Those are profile/document fields. They are not trusted for admin access to `/admin`.

The actual admin gate uses the Firebase ID token custom claim:

```text
admin: true
```

Why:

- Firestore documents can be read or written according to rules.
- User profile data can be stale or incorrectly edited if rules are not perfect.
- Firebase custom claims are issued into signed Firebase Auth ID tokens.
- Firestore and Storage rules can verify custom claims through `request.auth.token.admin`.

## Firestore and Storage rule relationship

Admin UI gating is not the only protection.

The authoritative data protection is in Firebase rules:

```text
request.auth.token.admin == true
```

The UI gate prevents non-admin users from seeing admin screens.

The Firebase rules prevent non-admin users from performing protected database or storage operations, even if they manually call Firestore/Storage APIs.

## Admin email/password requirement

Admin UI access now requires:

```text
tokenResult.signInProvider === "password"
```

This means a user with `admin: true` who signs in through Google will see:

```text
Email Login Required
```

They must sign out and sign in through the admin page with email/password.

Reason:

- This gives the admin area a consistent, explicit sign-in path.
- It avoids silently granting admin UI access from a different provider session.

## Password reset

Password reset still uses Firebase Authentication.

File:

```text
src/contexts/AuthContext.tsx
```

Function:

```ts
sendPasswordResetEmail(auth, email, getActionCodeSettings())
```

No custom password reset tokens were added.

Important:

- Firebase Auth remains responsible for secure reset-token generation.
- The app should not send ordinary emails containing custom reset links.

## Removed legacy behavior

Removed or replaced:

- Hardcoded admin password gate.
- Password comparison in source code.
- Obsolete `/api/admin/auth` route.
- Browser-storage-based admin authorization.
- Shared admin password instructions.

Repository searches were performed during the phase for:

- Old hardcoded password value.
- Password-based admin access.
- `sessionStorage` admin authorization.
- `/api/admin/auth`.

Result:

- Legacy admin password access was removed from active admin auth code.

Note:

- `sessionStorage` still appears in normal public login/register success-message flows.
- Those references are not admin authorization and do not grant admin access.

## Admin account used during setup

The admin account configured during local setup was:

```text
info@nursingmocks.com
```

The Firebase custom claim was set separately:

```json
{
  "admin": true
}
```

The account must continue to exist in Firebase Authentication and must use the password provider for the current admin UI requirements.

## Common failure cases

### Invalid email or password

Displayed when Firebase returns:

- `auth/invalid-credential`
- `auth/wrong-password`
- `auth/user-not-found`

Meaning:

- The credentials were rejected by Firebase Auth.
- This is not an admin-claim problem yet because the user did not authenticate.

### Access Denied

Meaning:

- The user is signed in.
- Firebase Auth token was readable.
- The token does not contain `admin: true`.

Fix:

- Assign the custom claim from a trusted Firebase Admin SDK environment.
- Sign out and sign back in, or force token refresh.

### Email Login Required

Meaning:

- The user is signed in through a provider other than Firebase password.

Fix:

- Sign out.
- Return to `/admin`.
- Sign in with email/password.

### Could Not Verify Access

Meaning:

- The browser could not refresh or inspect the Firebase ID token.

Possible causes:

- Network problem.
- Firebase Auth problem.
- Expired or invalid user session.

Fix:

- Use the retry button.
- Sign out and sign back in if retry fails.

## Local verification steps

### Check admin page loads

```text
http://localhost:3000/admin
```

Expected when signed out:

- Admin sign-in form.

### Check non-admin behavior

1. Sign in as a normal user.
2. Visit `/admin`.

Expected:

- Access Denied.

### Check admin behavior

1. Sign in with an account that has `admin: true`.
2. Use email/password provider.
3. Visit `/admin`.

Expected:

- Admin dashboard renders.

### Check wrong provider behavior

1. Sign in with Google.
2. Visit `/admin`.

Expected:

- Email Login Required.

## Validation performed in Phase 2

TypeScript:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

```text
passed
```

Production build:

```text
.\node_modules\.bin\next.cmd build
```

Result:

```text
passed
```

Repository search:

- Searched for the old admin password.
- Searched for obsolete admin auth route references.
- Searched for browser-storage admin authorization.

Result:

- No active legacy password-based admin authorization remained.

## Production deployment requirements

Before production use, confirm:

1. Admin users exist in Firebase Authentication.
2. Admin users have secure passwords.
3. Admin users have the Firebase custom claim:

```json
{
  "admin": true
}
```

4. Admin users sign in with the password provider.
5. Firestore rules are deployed.
6. Storage rules are deployed.
7. Service account keys are not committed.
8. Only trusted people can set or remove admin claims.

## How to remove admin access

Use Firebase Admin SDK from a trusted environment:

```js
await getAuth().setCustomUserClaims(uid, { admin: false });
```

or remove the claim:

```js
await getAuth().setCustomUserClaims(uid, {});
```

Then require the user to sign out and sign in again, or force token refresh.

## Security limitations and remaining risks

### Client-side gate is not the final security boundary

The admin UI gate improves the user interface and prevents casual access, but client-side code can be inspected.

The final protection must remain:

- Firestore rules.
- Storage rules.
- Trusted server-side authorization for API routes.

### Admin claim assignment is high risk

Whoever can assign Firebase custom claims can grant admin access.

Protect:

- Google Cloud IAM access.
- Firebase service-account keys.
- Local service-account JSON files.
- CI/CD environment variables.

### Service-account keys must be rotated if exposed

If a key is pasted into chat, committed, emailed, or shown publicly:

1. Revoke the key.
2. Generate a new one.
3. Update local/hosting environments.
4. Confirm the old key no longer works.

### User document flags are not authoritative

Fields such as `is_admin` can exist for display or internal profile purposes, but they must not be used as the sole source of admin authorization.

The Firebase custom claim is the source of truth for admin access.

## Files involved

Admin auth core:

- `src/app/admin/layout.tsx`
- `src/hooks/useAdminAuthorization.ts`
- `src/contexts/AuthContext.tsx`

Firebase rules:

- `firestore.rules`
- `storage.rules`

Related Firebase Admin server helper:

- `src/lib/server/firebase-admin.ts`

Change tracking:

- `Documentation/Phase 2 of the NursingMocks migration.md`
- `Documentation/Admin authentication security documentation.md`

## Final operational summary

The admin authentication system now works like this:

```text
User opens /admin
Firebase Auth state loads
If signed out, show admin email/password login
If signed in, refresh Firebase ID token
Require signInProvider == password
Require token claim admin == true
Render admin pages only after both checks pass
Use Firestore/Storage rules as backend enforcement
```

This aligns the admin UI with the Firebase security model already expected by Firestore and Storage.

