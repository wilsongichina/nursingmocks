# Billing Stage 29 Exam Access Migration Tooling

## Goal

Prepare a controlled migration path from legacy package and All Access records into the fixed-term exam access model.

## What Changed

- Added `scripts/migrate-billing-exam-access.js`.
- Added dry-run and apply npm scripts:
  - `npm run billing:exam-access:migrate:dry-run`
  - `npm run billing:exam-access:migrate:apply`
- The migration script uses the existing Firebase Admin credential pattern from the project scripts.
- The script defaults to dry-run mode and writes only when `--apply` is passed.

## Migration Behavior

User documents:

- reads `users/{uid}.entitlements`
- normalizes legacy entitlement keys into the four canonical exam access keys:
  - `ati_teas_7`
  - `hesi_a2`
  - `nursing_test_bank`
  - `nursing_exit_exams`
- removes legacy-only active keys from the written user entitlement object during apply

Billing entitlement records:

- scans `billing_entitlements`
- backfills `examId` when a legacy `packageId`, `sourcePlanId`, or document ID maps to one canonical exam
- expands active All Access-style records into individual exam entitlement records
- keeps the original legacy entitlement record for audit instead of deleting it
- adds migration notes to records changed by the script

## Safety

- Dry-run mode prints counts and samples without writing data.
- Apply mode batches writes and keeps legacy billing entitlement records readable for audit.
- The script supports `--uid <uid>` for testing one user before scanning all records.
- The script supports `--limit <number>` for smaller dry runs.

## Commands

Dry run all records:

```text
npm run billing:exam-access:migrate:dry-run
```

Dry run one user:

```text
node scripts/migrate-billing-exam-access.js --uid USER_UID
```

Apply all records:

```text
npm run billing:exam-access:migrate:apply
```

## Files Changed

- `scripts/migrate-billing-exam-access.js`
- `package.json`
- `Documentation/billing/Billing fixed-term exam access full plan.md`
- `Documentation/billing/Billing system architecture and development stages.md`
- `Documentation/user-dashboard/User dashboard.md`
- `Documentation/billing/Billing stage 29 exam access migration tooling.md`

## Assumptions

- New billing writes should use exam IDs, not All Access.
- Legacy All Access records may remain for audit.
- Existing users should not lose access during migration.
- Active All Access records should expand into individual exam access records only when apply mode is intentionally run.

## Validation Run

Commands:

```text
node --check scripts/migrate-billing-exam-access.js
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/lib/__tests__/content-access-state.test.ts
npm run billing:exam-access:migrate:dry-run -- --limit 5
```

Dry-run result:

- scanned 5 user documents
- found 1 user entitlement object that would be normalized
- scanned 2 billing entitlement records
- found 2 active All Access-style entitlement records that would expand into 8 individual exam access grants
- found no unmapped sampled entitlement records
- no writes were performed

## Cleanup Applied

Cleanup command:

```text
npm run billing:exam-access:migrate:apply
```

Apply result:

- scanned 11 user documents
- changed 0 user documents
- scanned 2 legacy billing entitlement records
- expanded 2 active All Access-style entitlement records into 8 individual exam access grants
- kept the original All Access records for audit
- found 0 unmapped entitlement records

Post-cleanup verification:

```text
npm run billing:exam-access:migrate:dry-run
```

Verification result:

- scanned 11 user documents
- changed 0 user documents
- scanned 10 billing entitlement records
- found 0 remaining All Access expansions to apply
- recognized 8 already-expanded exam grants
- found 0 unmapped entitlement records

The migration script was updated after cleanup so future dry runs do not report already-expanded audit records as pending work.

## Targeted User Access Adjustment

Added a targeted UID-based access script:

```text
npm run billing:exam-access:set-user -- --uid USER_UID --exams ati_teas_7
npm run billing:exam-access:set-user -- --uid USER_UID --exams ati_teas_7 --apply
```

Behavior:

- sets `users/{uid}.entitlements` to the selected canonical exam access keys
- expires active billing entitlement records that do not match the selected exam IDs
- expires active legacy All Access billing entitlement records for that user
- keeps matching active exam entitlement records
- does not delete historical billing entitlement records

Targeted cleanup performed:

```text
npm run billing:exam-access:set-user -- --uid IgLumRHdpAUFZNqQmEVhzOqpeAF2 --exams ati_teas_7 --apply
```

Result:

- kept active `ati_teas_7` access
- expired active `all_access`
- expired active `hesi_a2`
- expired active `nursing_test_bank`
- expired active `nursing_exit_exams`
- verification dry run showed only `ati_teas_7` as active for the user
