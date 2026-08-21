# LPN Nursing Course Exams Cleanup Plan

## Purpose

Clean the LPN REGULAR source folders before final Nursing Test Bank import.

This group will become:

```text
LPN Exams
  LPN Nursing Course Exams
```

Source folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\REGULAR
```

Cleanup folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR
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
| 4 | Review Needed | Resolve unmatched, ambiguous, duplicate, or collision files until review rows are zero. | Complete |
| 5 | Normalized Quiz Names | Generate public quiz titles, slugs, card labels, and collision reports. | Complete |
| 6 | Blocking Question Audit | Check missing question text, empty options, missing answers, and other blocking issues. | Complete |
| 7 | Topic Metadata / Page Consistency | Normalize Firestore topic display names, route mappings, counts, and shared template behavior. | Complete |
| 8 | Documentation | Record final counts, mappings, exclusions, audits, and decisions in Markdown and HTML. | Complete |
| 9 | Dry Run Import | Validate import plan without writing data. | Complete |
| 10 | Final Import | Import/overwrite only after explicit approval. | Complete |

## Step 1 - Source Inventory Results

Inventory generated on 2026-08-21.

| Metric | Count |
|---|---:|
| Source folders | 5 |
| JSON exam files | 19 |
| Total questions counted | 1,002 |
| Root/support artifacts | 0 |
| JSON parse errors | 0 |
| Zero-question JSON files | 0 |

Generated files:

```text
lpn-regular-source-inventory.csv
lpn-regular-source-inventory.json
lpn-regular-source-folder-summary.csv
lpn-regular-root-json-artifacts.csv
lpn-regular-parse-errors.csv
```

## Source Folder Summary

| Source Folder | Files | Questions | Parse Errors | Zero-Question Files |
|---|---:|---:|---:|---:|
| `1 - Dosage Calculations` | 3 | 88 | 0 | 0 |
| `2 - Medical Surgical` | 3 | 201 | 0 | 0 |
| `3 - Health assessment` | 1 | 50 | 0 | 0 |
| `4 - Fundamentals` | 11 | 623 | 0 | 0 |
| `5 - Leadership` | 1 | 40 | 0 | 0 |

## Phase 1 Notes

- The raw LPN REGULAR folder is clean at the parsing level.
- No empty JSON files were found.
- No root-level support artifacts were found.
- The largest source folder is `4 - Fundamentals` with 11 files and 623 questions.
- The next step is to confirm recommended public topic names and map each source folder into the final LPN Nursing Course Exams structure.

## Step 2 - Official Topic Mapping Results

Mapping generated on 2026-08-21.

All five LPN REGULAR source folders map cleanly into the final `LPN Nursing Course Exams` nested page.

Generated files:

```text
lpn-regular-topic-mapping.csv
lpn-regular-file-placement-preview.csv
lpn-regular-topic-summary.csv
```

## Final Topic Mapping

| Source Folder | Final Topic | Public Slug | Files | Questions | Review Flags | Notes |
|---|---|---|---:|---:|---:|---|
| `1 - Dosage Calculations` | Dosage Calculations | `lpn-nursing-course-dosage-calculations-practice-questions` | 3 | 88 | 0 | LPN medication math/course dosage calculation content. |
| `2 - Medical Surgical` | Medical Surgical | `lpn-nursing-course-medical-surgical-practice-questions` | 3 | 201 | 0 | LPN medical-surgical nursing course content. |
| `3 - Health assessment` | Health Assessment | `lpn-nursing-course-health-assessment-practice-questions` | 1 | 50 | 0 | Normalize casing from source folder. |
| `4 - Fundamentals` | Fundamentals | `lpn-nursing-course-fundamentals-practice-questions` | 10 | 570 | 0 | LPN fundamentals/basic nursing course content. One file has an ATI-branded title and is flagged for review before import. |
| `5 - Leadership` | Leadership | `lpn-nursing-course-leadership-practice-questions` | 1 | 40 | 0 | LPN nursing leadership course content. |

## Slug Namespace Rule Applied

Regular course topics use nested-page-aware slugs to avoid conflicts with ATI, HESI, and future LPN/RN groups.

Example:

```text
lpn-nursing-course-fundamentals-practice-questions
```

instead of:

```text
lpn-fundamentals-practice-questions
```

## Phase 2 Review Flag

The following file remains course-relevant but needs title/vendor review during later normalization:

```text
4 - Fundamentals\11-LPN ATI fundamental proctored exam.json
```

Reason:

```text
Vendor-branded title appears inside the Regular LPN source. Keep the content for now, but normalize/review before import.
```

## Step 3 - Stage Clean Folder Results

Clean staging completed on 2026-08-21.

Cleaned folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR\Cleaned
```

Generated files:

```text
lpn-regular-cleaned-manifest.csv
lpn-regular-cleaned-topic-summary.csv
```

| Destination Topic | Public Slug | Files | Questions | Review Flags |
|---|---|---:|---:|---:|
| Dosage Calculations | `lpn-nursing-course-dosage-calculations-practice-questions` | 3 | 88 | 0 |
| Fundamentals | `lpn-nursing-course-fundamentals-practice-questions` | 10 | 570 | 0 |
| Health Assessment | `lpn-nursing-course-health-assessment-practice-questions` | 1 | 50 | 0 |
| Leadership | `lpn-nursing-course-leadership-practice-questions` | 1 | 40 | 0 |
| Medical Surgical | `lpn-nursing-course-medical-surgical-practice-questions` | 3 | 201 | 0 |

## Phase 3 Notes

- All 19 JSON files were copied into final clean topic folders.
- Total question count remained 1,002 after staging.
- No destination filename collisions occurred during staging.
- The ATI-branded Fundamentals file remains flagged for review/title normalization.

## Step 4 - Review Needed Resolution

Review completed on 2026-08-21.

Generated files:

```text
lpn-regular-review-resolution.csv
lpn-regular-excluded-files.csv
```

## Resolved Review Item

| File | Original Placement | Resolution | Reason |
|---|---|---|---|
| `4 - Fundamentals\11-LPN ATI fundamental proctored exam.json` | `Cleaned\Fundamentals` | Excluded from LPN Regular import | Content is ATI-branded. The JSON subtopic is `LPN ATI fundamental proctored exam`, the source slug is `lpn-ati-fundamental-exam-1693220327`, and embedded image paths include `LPNATI`. ATI LPN has already been handled separately. |

Moved to:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR\Excluded - ATI Already Uploaded\Fundamentals\11-LPN ATI fundamental proctored exam.json
```

## Post-Review Import Set

| Topic | Files | Questions | Review Flags |
|---|---:|---:|---:|
| Dosage Calculations | 3 | 88 | 0 |
| Fundamentals | 10 | 570 | 0 |
| Health Assessment | 1 | 50 | 0 |
| Leadership | 1 | 40 | 0 |
| Medical Surgical | 3 | 201 | 0 |

Post-review totals:

| Metric | Count |
|---|---:|
| Files kept for Regular LPN import | 18 |
| Questions kept for Regular LPN import | 949 |
| Files excluded from Regular LPN import | 1 |
| Questions excluded from Regular LPN import | 53 |
| Remaining review flags | 0 |

## Phase 4 Decision

The excluded file is not deleted. It remains preserved in the cleanup folder for traceability, but it will not be included in the Regular LPN import set.

## Step 5 - Normalized Quiz Names Results

Normalized-name preview generated on 2026-08-21.

Generated files:

```text
lpn-regular-normalized-name-preview.csv
lpn-regular-normalized-name-collisions.csv
```

Normalization approach:

```text
Preserve source exam identity.
Clean casing, spelling, and spacing.
Append Practice Questions.
Generate public slugs from the cleaned title.
```

## Collision Resolution

One duplicate cleaned title was found in Fundamentals:

```text
2-Lpn fundamentals proctored exam (basic nursing).json
4-Lpn fundamentals proctored exam (basic nursing).json
```

Resolution:

| Source File | Public Quiz Title | Public Slug |
|---|---|---|
| `2-Lpn fundamentals proctored exam (basic nursing).json` | LPN Fundamentals Proctored Exam (Basic Nursing) - Set 2 Practice Questions | `lpn-fundamentals-proctored-exam-basic-nursing-set-2-practice-questions` |
| `4-Lpn fundamentals proctored exam (basic nursing).json` | LPN Fundamentals Proctored Exam (Basic Nursing) - Set 4 Practice Questions | `lpn-fundamentals-proctored-exam-basic-nursing-set-4-practice-questions` |

Post-resolution duplicate slugs:

```text
0
```

## Phase 5 Totals

| Metric | Count |
|---|---:|
| Normalized quiz rows | 18 |
| Duplicate slugs before resolution | 1 |
| Duplicate slugs after resolution | 0 |
| Collision rows after resolution | 0 |

## Step 6 - Blocking Question Audit Results

Audit completed on 2026-08-21.

Generated files:

```text
lpn-regular-audit-manifest.json
lpn-regular-audit-manifest.csv
lpn-regular-question-quality-issues.csv
lpn-regular-question-quality-file-summary.csv
lpn-regular-question-quality-summary.csv
lpn-regular-structural-repair-report.json
```

## Initial Audit Result

| Metric | Count |
|---|---:|
| Audited files | 18 |
| Audited questions | 949 |
| Initial issues | 9 |
| Empty option text issues | 7 |
| Missing explanation issues | 2 |

## Structural Repair

The empty option text issues were repaired by removing blank option entries from the affected questions.

| Metric | Count |
|---|---:|
| Repaired files | 4 |
| Blank option entries removed | 14 |
| Repair warnings | 0 |

Repaired files:

```text
10-PN FUNDAMENTALS PROCTORED EXAM.json
6-Lpn Fundamental Proctored Exam (basic nursing).json
7-Pn fundamentals 2023 proctored exam.json
8-Lpn fundamentals exam evolve ( Illinois college) proctored exam.json
```

## Post-Repair Audit Result

| Metric | Count |
|---|---:|
| Audited files | 18 |
| Import-ready files | 18 |
| Audited questions | 949 |
| Blocking structural issues remaining | 0 |
| Missing explanation issues deferred | 2 |

Deferred explanation rows:

| Topic | Source File | Question # | Source Question ID |
|---|---|---:|---|
| Medical Surgical | `3-Medical surgical nursing proctored exam (lpn).json` | 92 | `59253196` |
| Fundamentals | `10-PN FUNDAMENTALS PROCTORED EXAM.json` | 19 | `26360` |

## Phase 6 Decision

The Regular LPN import set is structurally clean. Missing explanations are documented and deferred for a later explanation-writing pass.

## Step 7 - Topic Metadata / Page Consistency Results

Metadata readiness completed on 2026-08-21.

Generated files:

```text
lpn-regular-metadata-readiness-summary.json
lpn-regular-metadata-readiness-topics.csv
```

## Readiness Summary

| Check | Result |
|---|---|
| 5 expected LPN Nursing Course Exam topics present | Pass |
| 18 import-ready quizzes | Pass |
| 949 import-ready questions | Pass |
| No duplicate import slugs | Pass |
| No duplicate import public titles | Pass |
| No blocking question issues remain | Pass |
| Remaining quality issues are explanation-only | Pass |
| LPN Nursing Course Exams nested page exists locally | Pass |

## Topic Metadata

| Topic | Public Slug | Files | Questions |
|---|---|---:|---:|
| Dosage Calculations | `lpn-nursing-course-dosage-calculations-practice-questions` | 3 | 88 |
| Fundamentals | `lpn-nursing-course-fundamentals-practice-questions` | 10 | 570 |
| Health Assessment | `lpn-nursing-course-health-assessment-practice-questions` | 1 | 50 |
| Leadership | `lpn-nursing-course-leadership-practice-questions` | 1 | 40 |
| Medical Surgical | `lpn-nursing-course-medical-surgical-practice-questions` | 3 | 201 |

## Local Sidebar Status

`LPN Nursing Course Exams` exists locally with slug:

```text
lpn-nursing-course-exams
```

Current local sidebar counts are still zero:

| Count | Current | Expected After Import/Backfill |
|---|---:|---:|
| Topics | 0 | 5 |
| Quizzes | 0 | 18 |
| Questions | 0 | 949 |

This is not a blocker at Phase 7 because the Regular LPN import has not been run yet.

## Shared Template Check

The public `[slug]` page already treats Nursing Test Bank topic pages as public sub-pages and uses published quizzes as child exam cards. This keeps LPN Regular topic pages aligned with the RN/ATI/HESI topic-page template behavior.

## Step 8 - Documentation Results

Documentation finalized on 2026-08-21 for the completed cleanup stages before import preparation.

Updated documentation files:

```text
Documentation/public-sub-pages/LPN REGULAR test bank cleanup plan.md
Documentation/public-sub-pages/LPN REGULAR test bank cleanup plan.html
Documentation/public-sub-pages/Nursing Test Bank cleanup master plan.md
```

## Artifact Index

Generated cleanup artifacts in:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR
```

| Stage | Artifact |
|---|---|
| Phase 1 | `lpn-regular-source-inventory.csv` |
| Phase 1 | `lpn-regular-source-inventory.json` |
| Phase 1 | `lpn-regular-source-folder-summary.csv` |
| Phase 1 | `lpn-regular-root-json-artifacts.csv` |
| Phase 1 | `lpn-regular-parse-errors.csv` |
| Phase 2 | `lpn-regular-topic-mapping.csv` |
| Phase 2 | `lpn-regular-file-placement-preview.csv` |
| Phase 2 | `lpn-regular-topic-summary.csv` |
| Phase 3 | `lpn-regular-cleaned-manifest.csv` |
| Phase 3 | `lpn-regular-cleaned-topic-summary.csv` |
| Phase 4 | `lpn-regular-review-resolution.csv` |
| Phase 4 | `lpn-regular-excluded-files.csv` |
| Phase 5 | `lpn-regular-normalized-name-preview.csv` |
| Phase 5 | `lpn-regular-normalized-name-collisions.csv` |
| Phase 6 | `lpn-regular-audit-manifest.json` |
| Phase 6 | `lpn-regular-audit-manifest.csv` |
| Phase 6 | `lpn-regular-question-quality-issues.csv` |
| Phase 6 | `lpn-regular-question-quality-file-summary.csv` |
| Phase 6 | `lpn-regular-question-quality-summary.csv` |
| Phase 6 | `lpn-regular-structural-repair-report.json` |
| Phase 7 | `lpn-regular-metadata-readiness-summary.json` |
| Phase 7 | `lpn-regular-metadata-readiness-topics.csv` |

## Phase 8 Import-Preparation Baseline

| Metric | Count |
|---|---:|
| Final topics | 5 |
| Import-ready quizzes | 18 |
| Import-ready questions | 949 |
| Excluded ATI-branded files | 1 |
| Blocking structural issues remaining | 0 |
| Deferred missing explanations | 2 |
| Duplicate public quiz slugs | 0 |
| Duplicate public quiz titles | 0 |

## Next Step

Proceed to Complete. The dry run should validate Firestore write targets, topic/page metadata, route mappings, quiz slugs, and question counts without writing data.

## Step 9 - Dry Run Import Results

Dry run completed on 2026-08-21.

Output folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR\import-dry-run
```

Generated files:

```text
lpn-regular-import-dry-run-summary.json
lpn-regular-import-dry-run-quizzes.csv
lpn-regular-import-dry-run-topic-summary.csv
lpn-regular-import-dry-run-question-issues.csv
lpn-regular-import-dry-run-missing.csv
lpn-regular-import-dry-run-payload-samples.json
```

## Dry Run Summary

| Metric | Count |
|---|---:|
| Preview rows | 18 |
| Manifest rows | 18 |
| Planned import rows | 18 |
| Excluded rows | 1 |
| Missing or parse-error rows | 0 |
| Question issue rows | 2 |
| Duplicate quiz slugs | 0 |
| Duplicate quiz titles | 0 |
| Total planned questions | 949 |

The 2 question issue rows are the already-documented missing explanations. They are not structural blockers for the import plan.

## Dry Run Topic Summary

| Topic | Public Slug | Planned Quizzes | Planned Questions |
|---|---|---:|---:|
| Dosage Calculations | `lpn-nursing-course-dosage-calculations-practice-questions` | 3 | 88 |
| Fundamentals | `lpn-nursing-course-fundamentals-practice-questions` | 10 | 570 |
| Health Assessment | `lpn-nursing-course-health-assessment-practice-questions` | 1 | 50 |
| Leadership | `lpn-nursing-course-leadership-practice-questions` | 1 | 40 |
| Medical Surgical | `lpn-nursing-course-medical-surgical-practice-questions` | 3 | 201 |

## Phase 9 Decision

The dry run is clean for import preparation:

```text
No missing JSON files.
No JSON parse errors.
No duplicate public quiz slugs.
No duplicate public quiz titles.
All planned question counts match the cleaned files.
```

Next step is Complete, only after explicit approval.

## Step 10 - Final Import Results

Final import completed on 2026-08-21.

Import script:

```text
scripts/import-lpn-regular-test-bank.js
```

Compatibility manifest generated for the final import:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR\lpn-regular-cleanup-manifest.csv
```

Final import summary file:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\REGULAR\import-dry-run\lpn-regular-real-import-apply-summary.json
```

## Firestore Import Result

| Metric | Count |
|---|---:|
| Parent page | `lpn-exams` |
| Nested page | `lpn-nursing-course-exams` |
| Topics created | 5 |
| Quizzes created | 18 |
| Questions imported | 949 |
| Blocking question issues | 0 |
| Missing explanations carried forward | 2 |

## Imported Topic IDs

| Topic | Topic ID | Public Slug | Quizzes | Questions |
|---|---|---|---:|---:|
| Dosage Calculations | `0HON8THyW0E7BoW1rSm1` | `lpn-nursing-course-dosage-calculations-practice-questions` | 3 | 88 |
| Medical Surgical | `AlR3KvZbCSZXo21jeLnT` | `lpn-nursing-course-medical-surgical-practice-questions` | 3 | 201 |
| Health Assessment | `ZZkcjv41bafusCBaLafv` | `lpn-nursing-course-health-assessment-practice-questions` | 1 | 50 |
| Fundamentals | `XKenRdlHMVfdY4Dl99G2` | `lpn-nursing-course-fundamentals-practice-questions` | 10 | 570 |
| Leadership | `Qs5JkdFNyVs8OJ4DIUvf` | `lpn-nursing-course-leadership-practice-questions` | 1 | 40 |

## Post-Import Audit

The import audit matched expected counts exactly.

| Metric | Expected | Actual |
|---|---:|---:|
| Quizzes | 18 | 18 |
| Questions | 949 | 949 |

## Sidebar / Local Data Update

After import, sidebar counts were backfilled for:

```text
nursing-test-bank / lpn-exams / lpn-nursing-course-exams
```

Updated count result:

| Count | Value |
|---|---:|
| Topics | 5 |
| Quizzes | 18 |
| Questions | 949 |

Regenerated local sidebar files:

```text
public/data/sidebar-data.json
src/lib/data/sidebar-data.ts
```

## Final Status

LPN Regular is fully cleaned, imported, audited, and reflected in local sidebar data. The only content items intentionally carried forward are the 2 documented missing explanations.
