# LPN HESI Test Bank Cleanup Plan

This document tracks the staged cleanup for:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\HESI
```

Cleanup output is stored in:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI
```

Follow the same 10-phase process used for ATI RN, LPN ATI, and RN HESI. Import is the final phase only.

## Process

1. Source inventory
2. Official/recommended public topic mapping
3. Clean folder staging
4. Normalized filename preview
5. Question quality audit
6. Blocking structural repair
7. Duplicate/content-overlap audit
8. Metadata readiness check
9. Import dry-run only
10. Final import/apply after approval

## Step 1 - Source Inventory Results

Stage 1 completed on 2026-08-18.

Command used:

```powershell
.\scripts\inventory-nursing-test-bank-source.ps1 `
  -SourceRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\HESI" `
  -OutputRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI" `
  -GroupSlug "lpn-hesi"
```

Generated files:

```text
lpn-hesi-source-inventory.csv
lpn-hesi-source-inventory.json
lpn-hesi-source-folder-summary.csv
lpn-hesi-root-json-artifacts.csv
lpn-hesi-parse-errors.csv
```

Inventory summary:

| Metric | Count |
|---|---:|
| Source folders | 4 |
| JSON files | 5 |
| Root JSON artifacts | 0 |
| Parse errors | 0 |
| Total questions | 282 |

Source folder summary:

| Source Folder | Files | Questions | Detected Terms |
|---|---:|---:|---|
| `1 - HESI Capstone` | 1 | 40 | HESI; PN |
| `2 - Medical Surgical` | 1 | 61 | HESI; LPN |
| `3 - Maternal Newborn` | 1 | 61 | HESI; LPN |
| `4 - Fundamentals` | 2 | 120 | HESI; LPN; PN |

Source files:

| Source Folder | File | Questions |
|---|---|---:|
| `1 - HESI Capstone` | `1-Hesi capstone pn proctored exam.json` | 40 |
| `2 - Medical Surgical` | `1-HESI Speciality LPN Med Surg Proctored Exam.json` | 61 |
| `3 - Maternal Newborn` | `1-Hesi speciality lpn maternal newborn proctored exam.json` | 61 |
| `4 - Fundamentals` | `1-Lpn hesi fundamentals proctored exam (wgu).json` | 60 |
| `4 - Fundamentals` | `2-HESI PN fundamentals proctored exam.json` | 60 |

## Step 2 - Official Public Topic Mapping

Stage 2 completed on 2026-08-18.

Existing app page context:

```text
Parent page: lpn-exams
Nested page: hesi-lpn-exams
Page name: HESI LPN EXAMS
```

Use `HESI LPN EXAMS` as the public parent page context. Topic card names should remain concise and should not repeat `HESI LPN`, matching the ATI RN/LPN pattern.

These are recommended public topic names mapped from the source files and current app structure. They are not being treated as independently verified exact Elsevier/HESI official topic titles.

### Public Topic Map

| Public Topic | URL Slug | Classification | Source Inputs | Files | Questions | Rule |
|---|---|---|---|---:|---:|---|
| Capstone | `hesi-lpn-capstone-practice-questions` | HESI LPN source topic | `1 - HESI Capstone` | 1 | 40 | Import to Capstone. |
| Medical Surgical | `hesi-lpn-medical-surgical-practice-questions` | HESI LPN source topic | `2 - Medical Surgical` | 1 | 61 | Import to Medical Surgical. |
| Maternal Newborn | `hesi-lpn-maternal-newborn-practice-questions` | HESI LPN source topic | `3 - Maternal Newborn` | 1 | 61 | Import to Maternal Newborn. |
| Fundamentals | `hesi-lpn-fundamentals-practice-questions` | HESI LPN source topic | `4 - Fundamentals` | 2 | 120 | Import both Fundamentals files here. |
| Pharmacology | `hesi-lpn-pharmacology-practice-questions` | Supplemental HESI LPN topic | LPN ATI `Excluded - HESI` file | 1 | 46 | Move/import HESI-branded pharmacology file here, not ATI. |

### Supplemental HESI File From LPN ATI Review

| File | Destination | Action | Reason |
|---|---|---|---|
| `5-HESI LPN phamacology proctored exam.json` | Pharmacology | Import with LPN HESI | The title and metadata are HESI LPN; it was excluded from ATI because it is HESI-branded. |

### Step 2 Result

| Metric | Count |
|---|---:|
| Public topics | 5 |
| Original source folders mapped | 4 |
| Supplemental ATI-excluded HESI files classified | 1 |
| Import-ready files expected after staging | 6 |
| Import-ready questions expected after staging | 328 |
| Duplicate/do-not-import files expected | 0 |
| Review-needed files expected | 0 |

## Step 3 - Clean Folder Staging

Stage 3 completed on 2026-08-18.

Command used:

```powershell
.\scripts\stage-lpn-hesi-cleanup.ps1
```

Generated script:

```text
scripts\stage-lpn-hesi-cleanup.ps1
```

The script copies source files into clean public-topic folders and writes a manifest, JSON manifest, summary, and root-artifact report.

### Staging Output

| Destination Topic | Action | Exams | Questions |
|---|---|---:|---:|
| Capstone | import | 1 | 40 |
| Fundamentals | import | 2 | 120 |
| Maternal Newborn | import | 1 | 61 |
| Medical Surgical | import | 1 | 61 |
| Pharmacology | import | 1 | 46 |

### Staged Folders

```text
Capstone
Fundamentals
Maternal Newborn
Medical Surgical
Pharmacology
```

### Phase 3 Result

| Metric | Count |
|---|---:|
| Source folders processed | 4 |
| Staged JSON files | 6 |
| Staged questions | 328 |
| Root JSON artifacts | 0 |
| Review-needed staged files | 0 |
| Duplicate/do-not-import staged files | 0 |

### Generated Phase 3 Files

```text
lpn-hesi-cleanup-manifest.csv
lpn-hesi-cleanup-manifest.json
lpn-hesi-cleanup-summary.csv
lpn-hesi-root-json-artifacts.csv
```

### Staged File Placement

| Destination Topic | Source File |
|---|---|
| Capstone | `1-Hesi capstone pn proctored exam.json` |
| Medical Surgical | `1-HESI Speciality LPN Med Surg Proctored Exam.json` |
| Maternal Newborn | `1-Hesi speciality lpn maternal newborn proctored exam.json` |
| Fundamentals | `1-Lpn hesi fundamentals proctored exam (wgu).json` |
| Fundamentals | `2-HESI PN fundamentals proctored exam.json` |
| Pharmacology | `5-HESI LPN phamacology proctored exam.json` |

## Step 4 - Normalized Filename Preview

Stage 4 completed on 2026-08-18.

Command used:

```powershell
.\scripts\preview-nursing-test-bank-normalized-names.ps1 `
  -CleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI" `
  -ManifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI\lpn-hesi-cleanup-manifest.csv" `
  -GroupSlug "lpn-hesi" `
  -Vendor "HESI" `
  -Program "LPN" `
  -PublicProgramLabel "LPN"
```

The shared preview script was tightened for HESI naming so LPN output removes redundant `PN`/`LPN` wording after the public prefix and corrects `Speciality` to `Specialty`.

Generated files:

```text
lpn-hesi-normalized-name-preview.csv
lpn-hesi-normalized-name-review.csv
lpn-hesi-normalized-name-review-simple.csv
lpn-hesi-normalized-name-summary.csv
```

### Phase 4 Result

| Metric | Count |
|---|---:|
| Preview rows | 6 |
| Review rows | 0 |
| Duplicate public titles | 0 |
| Duplicate slugs | 0 |

### Normalized Public Titles

| Destination Topic | Public Quiz Title | Slug |
|---|---|---|
| Capstone | `HESI LPN Capstone Proctored Exam Practice Questions` | `hesi-lpn-capstone-proctored-exam-practice-questions` |
| Medical Surgical | `HESI LPN Specialty Med Surg Proctored Exam Practice Questions` | `hesi-lpn-specialty-med-surg-proctored-exam-practice-questions` |
| Maternal Newborn | `HESI LPN Specialty Maternal Newborn Proctored Exam Practice Questions` | `hesi-lpn-specialty-maternal-newborn-proctored-exam-practice-questions` |
| Fundamentals | `HESI LPN Fundamentals Proctored Exam (WGU) Practice Questions` | `hesi-lpn-fundamentals-proctored-exam-wgu-practice-questions` |
| Fundamentals | `HESI LPN Fundamentals Proctored Exam Practice Questions` | `hesi-lpn-fundamentals-proctored-exam-practice-questions` |
| Pharmacology | `HESI LPN Pharmacology Proctored Exam Practice Questions` | `hesi-lpn-pharmacology-proctored-exam-practice-questions` |

## Step 5 - Question Quality Audit

Stage 5 completed on 2026-08-18.

Command used:

```powershell
node scripts/audit-nursing-test-bank-question-quality.js `
  --cleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI" `
  --manifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI\lpn-hesi-cleanup-manifest.csv" `
  --groupSlug lpn-hesi
```

Generated files:

```text
lpn-hesi-question-quality-issues.csv
lpn-hesi-question-quality-file-summary.csv
lpn-hesi-question-quality-summary.csv
```

### Phase 5 Result

| Metric | Count |
|---|---:|
| Audited files | 6 |
| Import-ready files audited | 6 |
| Audited questions | 328 |
| Total issues | 10 |
| Import-ready issues | 10 |

Issue types:

| Issue | Count |
|---|---:|
| `empty_option_text` | 10 |

No missing question text, missing clean question text, missing correct answer, invalid question type, or parse errors were reported by the audit.

### Affected Files

| Destination Topic | Source File | Issues |
|---|---|---:|
| Capstone | `1-Hesi capstone pn proctored exam.json` | 6 |
| Medical Surgical | `1-HESI Speciality LPN Med Surg Proctored Exam.json` | 2 |
| Maternal Newborn | `1-Hesi speciality lpn maternal newborn proctored exam.json` | 1 |
| Fundamentals | `2-HESI PN fundamentals proctored exam.json` | 1 |

### Affected Question Rows

| Destination Topic | Source File | Question Numbers | Issue |
|---|---|---|---|
| Capstone | `1-Hesi capstone pn proctored exam.json` | 1, 2, 10, 15, 19, 26 | `empty_option_text` |
| Medical Surgical | `1-HESI Speciality LPN Med Surg Proctored Exam.json` | 10, 29 | `empty_option_text` |
| Maternal Newborn | `1-Hesi speciality lpn maternal newborn proctored exam.json` | 9 | `empty_option_text` |
| Fundamentals | `2-HESI PN fundamentals proctored exam.json` | 9 | `empty_option_text` |

## Step 6 - Blocking Structural Repair

Stage 6 completed on 2026-08-18.

Generated script:

```text
scripts\repair-lpn-hesi-blocking-structural-issues.js
```

Command used:

```powershell
node scripts/repair-lpn-hesi-blocking-structural-issues.js
```

Repair method:

- Removed only blank option entries from affected multiple-choice questions.
- Blank keys removed were `E` and `F`.
- No invented answer choices were added.
- Every repaired question retained four valid options: `A`, `B`, `C`, and `D`.
- Correct answers were validated after repair and none were removed.

Generated repair report:

```text
lpn-hesi-structural-repair-report.json
```

### Phase 6 Repair Result

| Metric | Count |
|---|---:|
| Repaired files | 4 |
| Repaired questions | 10 |
| Removed blank option entries | 20 |
| Validation issues | 0 |

### Repaired Rows

| Destination Topic | Source File | Question Numbers | Removed Blank Keys |
|---|---|---|---|
| Capstone | `1-Hesi capstone pn proctored exam.json` | 1, 2, 10, 15, 19, 26 | `E`, `F` |
| Medical Surgical | `1-HESI Speciality LPN Med Surg Proctored Exam.json` | 10, 29 | `E`, `F` |
| Maternal Newborn | `1-Hesi speciality lpn maternal newborn proctored exam.json` | 9 | `E`, `F` |
| Fundamentals | `2-HESI PN fundamentals proctored exam.json` | 9 | `E`, `F` |

### Post-Repair Quality Audit

Command rerun:

```powershell
node scripts/audit-nursing-test-bank-question-quality.js `
  --cleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI" `
  --manifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI\lpn-hesi-cleanup-manifest.csv" `
  --groupSlug lpn-hesi
```

| Metric | Count |
|---|---:|
| Audited files | 6 |
| Audited questions | 328 |
| Total issues | 0 |
| Import-ready issues | 0 |

## Step 7 - Duplicate / Content-Overlap Audit

Stage 7 completed on 2026-08-18.

Command used:

```powershell
.\scripts\audit-nursing-test-bank-cleanup-duplicates.ps1 `
  -CleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI" `
  -ManifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI\lpn-hesi-cleanup-manifest.csv" `
  -GroupSlug "lpn-hesi"
```

Generated files:

```text
lpn-hesi-duplicate-audit-rows.csv
lpn-hesi-exact-content-duplicates.csv
lpn-hesi-clean-name-duplicates.csv
lpn-hesi-question-signature-duplicates.csv
lpn-hesi-duplicate-audit-summary.csv
```

### Phase 7 Result

| Metric | Count |
|---|---:|
| Audited rows | 6 |
| Exact duplicate groups | 0 |
| Exact duplicate files | 0 |
| Clean-name duplicate groups | 0 |
| Clean-name duplicate files | 0 |
| Question-signature duplicate groups | 0 |
| Question-signature duplicate files | 0 |

No LPN HESI staged file needs to be excluded based on duplicate/content-overlap audit results.

## Step 8 - Metadata Readiness Check

Stage 8 completed on 2026-08-18.

Generated script:

```text
scripts\audit-lpn-hesi-metadata-readiness.js
```

Command used:

```powershell
node scripts/audit-lpn-hesi-metadata-readiness.js
```

Generated files:

```text
lpn-hesi-metadata-readiness-summary.json
lpn-hesi-metadata-readiness-topics.csv
```

### Phase 8 Result

| Metric | Count |
|---|---:|
| Ready for import preparation | true |
| Public topics | 5 |
| Import-ready quizzes | 6 |
| Import-ready questions | 328 |
| Duplicate public titles | 0 |
| Duplicate import slugs | 0 |
| Quality issue types | 0 |
| Missing expected topics | 0 |
| Unexpected topics | 0 |

### Topic Readiness

| Topic | Slug | Files | Questions |
|---|---|---:|---:|
| Capstone | `hesi-lpn-capstone-practice-questions` | 1 | 40 |
| Fundamentals | `hesi-lpn-fundamentals-practice-questions` | 2 | 120 |
| Maternal Newborn | `hesi-lpn-maternal-newborn-practice-questions` | 1 | 61 |
| Medical Surgical | `hesi-lpn-medical-surgical-practice-questions` | 1 | 61 |
| Pharmacology | `hesi-lpn-pharmacology-practice-questions` | 1 | 46 |

### Readiness Checks

| Check | Pass |
|---|---|
| 5 expected public topics present | true |
| 6 import-ready quizzes | true |
| 328 import-ready questions | true |
| No duplicate import slugs | true |
| No duplicate import public titles | true |
| No exact duplicate content groups | true |
| No question-signature duplicate groups | true |
| No blocking question issues remain | true |
| Remaining quality issues are explanation-only | true |

## Step 9 - Import Dry-Run Only

Stage 9 completed on 2026-08-18.

Generated script:

```text
scripts\import-lpn-hesi-test-bank-dry-run.js
```

Command used:

```powershell
node scripts/import-lpn-hesi-test-bank-dry-run.js
```

Important: this was a dry-run only. It produced local payload/report files and did not write to Firestore.

Generated files:

```text
import-dry-run\lpn-hesi-import-dry-run-summary.json
import-dry-run\lpn-hesi-import-dry-run-quizzes.csv
import-dry-run\lpn-hesi-import-dry-run-topic-summary.csv
import-dry-run\lpn-hesi-import-dry-run-question-issues.csv
import-dry-run\lpn-hesi-import-dry-run-missing.csv
import-dry-run\lpn-hesi-import-dry-run-payload-samples.json
```

### Phase 9 Result

| Metric | Count |
|---|---:|
| Preview rows | 6 |
| Manifest rows | 6 |
| Planned import rows | 6 |
| Excluded rows | 0 |
| Missing or parse-error rows | 0 |
| Question issue rows | 0 |
| Duplicate slug count | 0 |
| Duplicate title count | 0 |
| Total questions | 328 |

### Dry-Run Topic Summary

| Topic | Topic Slug | Quizzes | Questions |
|---|---|---:|---:|
| Capstone | `hesi-lpn-capstone-practice-questions` | 1 | 40 |
| Fundamentals | `hesi-lpn-fundamentals-practice-questions` | 2 | 120 |
| Maternal Newborn | `hesi-lpn-maternal-newborn-practice-questions` | 1 | 61 |
| Medical Surgical | `hesi-lpn-medical-surgical-practice-questions` | 1 | 61 |
| Pharmacology | `hesi-lpn-pharmacology-practice-questions` | 1 | 46 |

## Step 10 - Final Import / Apply

Stage 10 completed on 2026-08-18 after explicit approval.

Generated script:

```text
scripts\import-lpn-hesi-test-bank.js
```

Pre-apply real-import dry-run command:

```powershell
node scripts/import-lpn-hesi-test-bank.js
```

Apply command:

```powershell
node scripts/import-lpn-hesi-test-bank.js --apply
```

Post-apply audit command:

```powershell
node scripts/import-lpn-hesi-test-bank.js --audit
```

Generated import files:

```text
import-dry-run\lpn-hesi-real-import-dry-run-summary.json
import-dry-run\lpn-hesi-real-import-apply-summary.json
```

### Firestore Target

| Field | Value |
|---|---|
| Parent slug | `lpn-exams` |
| Parent id | `z0xzINtS3EohZNaKosBz` |
| Nested slug | `hesi-lpn-exams` |
| Nested id | `ToLSmb6DG83NTZWXEJxt` |
| Nested page name | `HESI LPN EXAMS` |

### Apply Result

| Metric | Count |
|---|---:|
| Created topics | 5 |
| Created quizzes | 6 |
| Imported questions | 328 |
| Missing explanation rows | 0 |
| Blocking question issues | 0 |

### Imported Topics

| Topic | Topic Id | Slug | Quizzes | Questions |
|---|---|---|---:|---:|
| Capstone | `XsTO5lZeaMwktqDEY8yE` | `hesi-lpn-capstone-practice-questions` | 1 | 40 |
| Fundamentals | `HQnTsUWAQtikNnY47O7a` | `hesi-lpn-fundamentals-practice-questions` | 2 | 120 |
| Maternal Newborn | `5QNQ1kHttmDRA6VJ1KfS` | `hesi-lpn-maternal-newborn-practice-questions` | 1 | 61 |
| Medical Surgical | `jD7wUAqBY3cn5ZMToJOK` | `hesi-lpn-medical-surgical-practice-questions` | 1 | 61 |
| Pharmacology | `kd7EysTYYyAv51SSo8Xd` | `hesi-lpn-pharmacology-practice-questions` | 1 | 46 |

### Imported Quizzes

| Topic | Quiz Title | Slug | Questions |
|---|---|---|---:|
| Capstone | `HESI LPN Capstone Proctored Exam Practice Questions` | `hesi-lpn-capstone-proctored-exam-practice-questions` | 40 |
| Medical Surgical | `HESI LPN Specialty Med Surg Proctored Exam Practice Questions` | `hesi-lpn-specialty-med-surg-proctored-exam-practice-questions` | 61 |
| Maternal Newborn | `HESI LPN Specialty Maternal Newborn Proctored Exam Practice Questions` | `hesi-lpn-specialty-maternal-newborn-proctored-exam-practice-questions` | 61 |
| Fundamentals | `HESI LPN Fundamentals Proctored Exam (WGU) Practice Questions` | `hesi-lpn-fundamentals-proctored-exam-wgu-practice-questions` | 60 |
| Fundamentals | `HESI LPN Fundamentals Proctored Exam Practice Questions` | `hesi-lpn-fundamentals-proctored-exam-practice-questions` | 60 |
| Pharmacology | `HESI LPN Pharmacology Proctored Exam Practice Questions` | `hesi-lpn-pharmacology-proctored-exam-practice-questions` | 46 |

### Post-Apply Audit

| Metric | Expected | Actual |
|---|---:|---:|
| Quizzes | 6 | 6 |
| Questions | 328 | 328 |

All five topics exist and all five topic route mappings are present.

### Count Backfill and Static Sidebar Update

The nested page count was stale before backfill:

| Field | Before | After |
|---|---:|---:|
| Topic count | 1 | 5 |
| Quiz count | 0 | 6 |
| Question count | 0 | 328 |

Commands used:

```powershell
node scripts/backfill-sidebar-nested-question-counts.js `
  --pillar nursing-test-bank `
  --sub lpn-exams `
  --nested hesi-lpn-exams `
  --apply

node scripts/generate-sidebar-data.js

node scripts/audit-test-bank-topics.js --parent lpn-exams --nested hesi-lpn-exams
```

Regenerated static files:

```text
public\data\sidebar-data.json
src\lib\data\sidebar-data.ts
```

### Final LPN HESI Cleanup Status

LPN HESI has completed all 10 phases:

1. Source inventory
2. Official/recommended public topic mapping
3. Clean folder staging
4. Normalized filename preview
5. Question quality audit
6. Blocking structural repair
7. Duplicate/content-overlap audit
8. Metadata readiness check
9. Import dry-run only
10. Final import/apply
