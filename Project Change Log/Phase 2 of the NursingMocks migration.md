# Phase 2 of the NursingMocks migration

## Scope

Admin authentication security only.

Branch:

```text
migration/admin-security
```

## Changes made

- Removed the legacy admin credential gate from the admin layout.
- Removed the obsolete admin authentication API route.
- Added reusable Firebase custom-claim authorization logic for admin access.
- Added a dedicated admin email/password sign-in screen for unauthenticated `/admin` users.
- Added admin login validation and Firebase Authentication error handling.
- Enforced Firebase email/password as the required admin sign-in provider before checking the admin claim.
- Updated the public login redirect flow to preserve a safe internal return path.
- Kept payment functionality, public branding, public page content, Firebase rules, and Firestore data unchanged.

## Admin authorization flow

1. A user visits `/admin`.
2. The admin layout waits for the existing Firebase Authentication state.
3. If there is no authenticated Firebase user, `/admin` shows an email/password-only admin sign-in form.
4. The admin sign-in form uses the existing Firebase Authentication email/password login method.
5. The admin layout calls `getIdTokenResult(true)` on the authenticated Firebase user.
6. The token must show the Firebase `password` sign-in provider.
7. Access is allowed only when the Firebase ID token contains `admin: true`.
8. Authenticated users without the claim see an Access Denied screen.
9. Users signed in with another provider are told to sign out and use email/password.
10. Token lookup failures show a retryable verification error.

The admin gate does not trust localStorage, sessionStorage, client-created cookies, URL parameters, or the user's email address by itself.

## Manual Firebase setup required

Admin access now requires a Firebase custom claim:

```json
{
  "admin": true
}
```

This claim must be assigned from a trusted server environment using the Firebase Admin SDK. Do not assign admin claims from client-side code, URL parameters, browser storage, or any public app route.

Do not commit service-account keys or private credentials to the repository.

## Manual Firebase setup completed

- Set the Firebase Auth custom claim `admin: true` for `info@nursingmocks.com` in the NursingMocks Firebase project.
- Confirmed the account uses the Firebase `password` sign-in provider.
- Used a local service-account key from outside the repository.
- Did not add or commit any service-account key, private credential, or claim-setting script.

## Firebase rules review

Firestore and Storage rules already require `request.auth.token.admin == true` for writes outside owner-scoped user paths. No rule changes were made in this phase.

## Validation

- Repository-wide admin credential search:
  - Searched for the former admin credential value, obsolete API path, legacy browser-storage flag, and old admin password UI labels.
  - Result: passed, no matches.
- TypeScript check:
  - `.\\node_modules\\.bin\\tsc.cmd --noEmit`
  - Result: passed.
- Direct Next.js production build:
  - `.\\node_modules\\.bin\\next.cmd build`
  - Result: passed.

## Remaining risks

- Admin access now depends on keeping the `admin: true` Firebase Auth custom claim assigned only to trusted accounts.
- The frontend admin gate improves interface access control, but Firestore and Storage rules remain the authoritative protection for data writes.
