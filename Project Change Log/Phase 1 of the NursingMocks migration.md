# Phase 1 of the NursingMocks migration

## Scope

Firebase configuration and build-safety cleanup only.

Branch:

```text
migration/firebase-config-safety
```

## Files changed

- `.env.example`
- `.gitignore`
- `scripts/generate-sidebar-data.js`
- `Project Change Log/Phase 1 of the NursingMocks migration.md`

## Changes made

### `scripts/generate-sidebar-data.js`

- Removed all hardcoded Firebase fallback values from the old `teas-gurus` project.
- Removed old Firebase API key, project ID, auth domain, storage bucket, messaging sender ID, and app ID fallbacks.
- Added explicit validation for required Firebase environment variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- Added local `.env` and `.env.local` loading for the standalone Node prebuild script.
- Kept logs limited to variable names and general status messages; no secret values are printed.
- Changed missing Firebase config and generation failures to exit with code `1`.
- Confirmed missing environment variables fail safely instead of connecting to the old Firebase project.

### `.env.example`

- Added `NEXT_PUBLIC_LOGIN_URL=https://nursingmocks.com/login` because the application references `NEXT_PUBLIC_LOGIN_URL`.
- Confirmed placeholders exist for the currently referenced Firebase, SendGrid, site, TikTok, and Tawk environment variables.

### `.gitignore`

- Added protections for Firebase service-account JSON files.
- Added protections for private keys, certs, and local secret files.
- Explicitly ignored `.env.local` and `.env.*.local`.

## Validation performed

- Ran `git diff`.
- Scanned changed files for old Firebase project references:
  - `teas-gurus`
  - `teasgurus`
  - `teas-gurus-new`
  - old Firebase project number
  - old Firebase API key
  - old auth/storage domains
- Ran sidebar generation safely in a temporary directory using local environment variables.
- Ran missing-env sidebar generation test and confirmed it exits with code `1`.
- Ran direct Next.js production build:
  - `.\\node_modules\\.bin\\next.cmd build`
  - Result: passed.
- Ran TypeScript check:
  - `.\\node_modules\\.bin\\tsc.cmd --noEmit`
  - Result: passed after rerun.
- Ran full npm production build:
  - `npm run build`
  - Result: passed with exit code `0`.
- Ran local production server smoke test:
  - `next start -p 3001`
  - Result: passed.
  - Confirmed HTTP `200` for `/`, `/login`, `/pricing`, `/nursing-entrance-exam`, `/nursing-exit-exam`, and `/nursing-test-bank`.
- Restored generated sidebar data files after build tests so Phase 1 review remains limited to Firebase configuration and build-safety changes.

## Remaining Firebase configuration risks

- `src/lib/firebase.ts` still falls back to empty strings if env vars are missing in production.
- `scripts/build-static-pages.js` and `scripts/initialize-services.js` still do not validate Firebase env vars.
- CI or hosting must provide the required Firebase variables; otherwise the build will now fail intentionally during sidebar generation.

## Commit status

No commit or push has been made yet. Changes are waiting for review.
