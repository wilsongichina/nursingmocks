# RN Certifications Cleanup Plan

## Purpose

Clean and prepare the RN CERTIFICATIONS source folder before final Nursing Test Bank import.

This group will become:

```text
RN Exams
  RN Certifications
```

Source folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\CERTIFICATIONS
```

Cleanup folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\CERTIFICATIONS
```

## Current Status

Steps 1 through 10 are complete.

Current next step:

```text
Complete
```

## Ten-Stage Cleanup Process

| Step | Stage | Purpose | Status |
|---:|---|---|---|
| 1 | Source Inventory | Count folders, JSON files, questions, root/support artifacts, and parse errors. | Complete |
| 2 | Official Topic Mapping | Decide final public topic names and map every source folder/file to a topic, exclusion, duplicate, or review bucket. | Complete |
| 3 | Stage Clean Folder | Copy files into clean destination folders and generate manifest/summary files. | Complete |
| 4 | Review Needed | Resolve unmatched, ambiguous, duplicate, or collision files. | Complete |
| 5 | Normalized Quiz Names | Generate public quiz titles, quiz slugs, card labels, and collision reports. | Complete |
| 6 | Blocking Question Audit | Check missing question text, empty options, missing answers, and other blocking issues. | Complete |
| 7 | Topic Metadata / Page Consistency | Confirm topic slugs, counts, nested page placement, and public-page readiness. | Complete |
| 8 | Documentation | Record final counts, mappings, repairs, artifacts, and decisions. | Complete |
| 9 | Dry Run Import | Validate import plan without writing Firestore data. | Complete |
| 10 | Final Import | Import only after dry-run approval. | Complete |

## Step 1 - Source Inventory Results

Inventory generated on 2026-08-21.

| Metric | Count |
|---|---:|
| Source folders | 2 |
| JSON exam files | 2 |
| Total questions counted | 287 |
| Root JSON artifacts | 0 |
| JSON parse errors | 0 |

Generated files:

```text
rn-certifications-source-inventory.csv
rn-certifications-source-inventory.json
rn-certifications-source-folder-summary.csv
rn-certifications-root-json-artifacts.csv
rn-certifications-parse-errors.csv
```

## Source Folder Summary

| Source Folder | Files | Questions | Parse Errors | Detected Terms |
|---|---:|---:|---:|---|
| `1 - Phlebotomy` | 1 | 116 | 0 | Phlebotomy |
| `2 - CNA Exams` | 1 | 171 | 0 | CNA |

Notes:

- The raw RN CERTIFICATIONS folder is clean at the parsing level.
- No root-level JSON artifacts were found.
- Each source folder contains an `unsaved-images.txt` support file, but those are not quiz JSON files and are not part of the import inventory.

## Step 2 - Official Topic Mapping Results

Mapping generated on 2026-08-21.

Generated files:

```text
rn-certifications-topic-mapping.csv
rn-certifications-file-placement-preview.csv
rn-certifications-topic-summary.csv
```

## Final Topic Mapping

| Source Folder | Final Topic | Public Topic Slug | Files | Questions | Action | Notes |
|---|---|---|---:|---:|---|---|
| `1 - Phlebotomy` | Phlebotomy Certification | `rn-certifications-phlebotomy-certification-practice-questions` | 1 | 116 | import | Certification-focused phlebotomy exam content. |
| `2 - CNA Exams` | CNA Certification | `rn-certifications-cna-certification-practice-questions` | 1 | 171 | import | Special-case certification import; keep source CNA classification as supplied. |

## Slug Namespace Rule Applied

Certification topics use nested-page-aware slugs to avoid conflicts with RN Course Exams, ATI, HESI, LPN, and future groups.

Examples:

```text
rn-certifications-phlebotomy-certification-practice-questions
rn-certifications-cna-certification-practice-questions
```

## Step 3 - Stage Clean Folder Results

Clean staging folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\CERTIFICATIONS\Cleaned
```

Staged files:

```text
Cleaned\Phlebotomy Certification\1-Phlebotomy  Certification Proctored Exam 130.json
Cleaned\CNA Certification\1-CNA Proctored Exam.json
```

Generated files:

```text
rn-certifications-cleaned-manifest.csv
rn-certifications-cleaned-manifest.json
rn-certifications-cleaned-topic-summary.csv
```

Staging result:

| Topic | Files | Questions | Action |
|---|---:|---:|---|
| CNA Certification | 1 | 171 | import |
| Phlebotomy Certification | 1 | 116 | import |

## Step 4 - Review Needed Results

Phase 4 was handled as a special-case confirmation pass.

Generated files:

```text
rn-certifications-review-resolution.csv
rn-certifications-post-review-summary.csv
```

Final decision:

| File | Final Action | Reason |
|---|---|---|
| `1-Phlebotomy  Certification Proctored Exam 130.json` | import | Metadata and sampled content support Phlebotomy Certification. |
| `1-CNA Proctored Exam.json` | import | Special-case RN Certifications import; keep source CNA classification as supplied. |

Special-case note:

- The CNA file contains broader clinical-assistant style wording in sampled questions.
- User confirmed this certifications group should be imported as supplied.
- Therefore the source classification remains `CNA Certification`.

## Step 5 - Normalized Quiz Names Results

Generated files:

```text
rn-certifications-normalized-name-preview.csv
rn-certifications-normalized-name-review.csv
rn-certifications-normalized-name-review-simple.csv
rn-certifications-normalized-name-summary.csv
rn-certifications-normalized-name-collisions.csv
```

Final quiz names:

| Topic | Public Quiz Title | Quiz Slug |
|---|---|---|
| Phlebotomy Certification | Phlebotomy Certification Proctored Exam Practice Questions | `phlebotomy-certification-proctored-exam-practice-questions` |
| CNA Certification | CNA Certification Proctored Exam Practice Questions | `cna-certification-proctored-exam-practice-questions` |

Phase 5 result:

| Check | Result |
|---|---:|
| Normalized quiz names | 2 |
| Review rows | 0 |
| Slug/name collisions | 0 |

## Step 6 - Blocking Question Audit Results

Initial audit found 11 blocking issues, all caused by blank option entries inside otherwise valid multiple-choice questions.

Initial issue summary:

| Issue | Count |
|---|---:|
| `empty_option_text` | 11 |

Repair performed on staged copies only:

| File | Blank Option Entries Removed |
|---|---:|
| `1-Phlebotomy  Certification Proctored Exam 130.json` | 15 |
| `1-CNA Proctored Exam.json` | 6 |

Generated/updated files:

```text
rn-certifications-question-quality-issues.csv
rn-certifications-question-quality-file-summary.csv
rn-certifications-question-quality-summary.csv
rn-certifications-structural-repair-report.json
```

Final audit result:

| Metric | Count |
|---|---:|
| Audited files | 2 |
| Audited questions | 287 |
| Blocking issues | 0 |
| Total issues | 0 |
| Missing explanations | 0 |

## Step 7 - Topic Metadata / Page Consistency Results

Generated files:

```text
rn-certifications-metadata-readiness-summary.json
rn-certifications-metadata-readiness-topics.csv
rn-certifications-metadata-readiness-checks.csv
```

Readiness result:

| Metric | Value |
|---|---:|
| Ready for dry-run import | true |
| Parent slug | `rn-exams` |
| Nested page slug | `rn-certifications` |
| Nested page name | `RN Certifications` |
| Topics | 2 |
| Quizzes | 2 |
| Questions | 287 |
| Blocking issues | 0 |
| Missing explanations | 0 |
| Duplicate topic slugs | 0 |
| Duplicate quiz slugs | 0 |

Topic readiness:

| Topic | Slug | Quizzes | Questions | Status |
|---|---|---:|---:|---|
| CNA Certification | `rn-certifications-cna-certification-practice-questions` | 1 | 171 | ready |
| Phlebotomy Certification | `rn-certifications-phlebotomy-certification-practice-questions` | 1 | 116 | ready |

Checks passed:

- RN Certifications nested page exists locally.
- 2 expected certification topics are present.
- 2 import-ready quizzes are present.
- 287 import-ready questions are present.
- No duplicate topic slugs.
- No duplicate quiz slugs.
- No blocking question-quality issues.

Sidebar note:

- Local sidebar currently shows `0` counts for RN Certifications.
- This is expected before import/backfill.
- After final import, regenerate/backfill sidebar counts.

## Step 8 - Documentation Results

Documentation files created:

```text
Documentation/public-sub-pages/RN CERTIFICATIONS test bank cleanup plan.md
Documentation/public-sub-pages/RN CERTIFICATIONS test bank cleanup plan.html
```

The master cleanup plan was updated to show RN CERTIFICATIONS as active with phases 1 through 8 complete.

## Current Import Readiness

RN Certifications is ready for Phase 9 dry-run import.

Expected import target:

```text
RN Exams
  RN Certifications
    CNA Certification
    Phlebotomy Certification
```

Expected counts after import:

| Level | Count |
|---|---:|
| Topics | 2 |
| Quizzes | 2 |
| Questions | 287 |

## Step 9 - Dry Run Import Results

Dry run completed on 2026-08-21.

Script created:

```text
scripts/import-rn-certifications-test-bank.js
```

Dry-run summary file:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\CERTIFICATIONS\import-dry-run\rn-certifications-real-import-dry-run-summary.json
```

Dry-run result:

| Metric | Count |
|---|---:|
| Planned topics | 2 |
| Planned quizzes | 2 |
| Planned questions | 287 |
| Missing explanation rows | 0 |
| Blocking question issues | 0 |

Planned topic actions:

| Topic | Action | Quiz Count | Question Count |
|---|---|---:|---:|
| Phlebotomy Certification | create | 1 | 116 |
| CNA Certification | create | 1 | 171 |

Resolved Firestore target:

```text
Parent: rn-exams / SuT1noZoNGEjKGR1vTbi
Nested: rn-certifications / Xm9CE6gN7AB8T4YZKMNa
```

## Step 10 - Final Import Results

Final import completed on 2026-08-21.

Apply summary file:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\CERTIFICATIONS\import-dry-run\rn-certifications-real-import-apply-summary.json
```

Imported topics:

| Topic | Topic ID | Quiz ID | Quizzes | Questions |
|---|---|---|---:|---:|
| Phlebotomy Certification | `S3CdPETwhcGfYKwqrEFO` | `qXpFpzqp3xJiLBUO2Ugd` | 1 | 116 |
| CNA Certification | `mLQLcSPuJFwx9Xk2SZ7f` | `u3cMcVU0OzoeMRTBxGPo` | 1 | 171 |

Post-import audit:

| Metric | Expected | Actual |
|---|---:|---:|
| Quizzes | 2 | 2 |
| Questions | 287 | 287 |

Sidebar count backfill:

| Nested Page | Topics | Quizzes | Questions |
|---|---:|---:|---:|
| RN Certifications | 2 | 2 | 287 |

Regenerated local sidebar files:

```text
public/data/sidebar-data.json
src/lib/data/sidebar-data.ts
```

## Final Status

```text
Complete
```

RN Certifications has been imported, audited, and sidebar counts have been backfilled.

Remaining validation:

```text
npx tsc --noEmit --incremental false
```


