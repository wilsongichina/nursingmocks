# RN HESI Test Bank Cleanup Plan

## Purpose

Clean the RN HESI source folders before final Nursing Test Bank import. This follows the same staged workflow used for ATI RN and LPN ATI: preserve the original source, create clean staged files, generate manifests, review topic names, audit question quality, document the result, and only import at the final stage.

Source folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\HESI
```

Cleanup folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI
```

## Current Status

Step 1, source inventory, is complete.

Current step:

```text
Step 2 - Identify Correct Public Topic Names
```

## Ten-Stage Cleanup Process

| Step | Stage | Purpose | Status |
|---:|---|---|---|
| 1 | Source Inventory | Count folders, JSON files, questions, root artifacts, and parse errors. | Complete |
| 2 | Official Topic Mapping | Decide final public topic names and map every source folder to a topic, exclusion, or duplicate bucket. | Next |
| 3 | Stage Clean Folder | Copy files into clean destination folders and generate manifest/summary files. | Pending |
| 4 | Review Needed | Resolve unmatched, ambiguous, duplicate, or collision files until review rows are zero. | Pending |
| 5 | Normalized Quiz Names | Generate public quiz titles, slugs, card labels, and collision reports. | Pending |
| 6 | Blocking Question Audit | Check missing question text, empty options, missing answers, and other blocking issues. | Pending |
| 7 | Topic Metadata / Page Consistency | Normalize Firestore topic display names, route mappings, counts, and shared template behavior. | Pending |
| 8 | Documentation | Record final counts, mappings, exclusions, audits, and decisions in Markdown and HTML. | Pending |
| 9 | Dry Run Import | Validate import plan without writing data. | Pending |
| 10 | Final Import | Import/overwrite only after explicit approval. | Pending |

## Step 1 - Source Inventory Results

Inventory generated on 2026-08-18.

| Metric | Count |
|---|---:|
| Source folders | 23 |
| JSON exam files | 148 |
| Root JSON artifacts | 0 |
| JSON parse errors | 0 |

Generated files:

```text
rn-hesi-source-inventory.csv
rn-hesi-source-inventory.json
rn-hesi-source-folder-summary.csv
rn-hesi-root-json-artifacts.csv
rn-hesi-parse-errors.csv
```

## Source Folder Summary

| Source Folder | Files | Questions | Detected Terms | Notes |
|---|---:|---:|---|---|
| `1 - Hesi Medical Surgical` | 24 | 1,234 | HESI; RN | Largest med-surg source folder; one dosage-calculation file must be reviewed for mapping. |
| `2 - Hesi Biology` | 1 | 24 | HESI | Biology support topic. |
| `3 - HESI Pediatric` | 10 | 478 | HESI; RN | Pediatric Nursing topic. |
| `4 - HESI Pharmacology` | 21 | 1,003 | HESI; RN | Pharmacology topic. |
| `5 - Nursing Specialty` | 1 | 78 | HESI; RN | Specialty source bucket. |
| `6 - Nursing Research` | 4 | 203 | HESI; RN | Nursing Research topic. |
| `7 - Nutrition` | 3 | 150 | HESI; RN | Nutrition topic. |
| `8 - Hesi Dosage Calculations` | 16 | 819 | HESI; RN | Dosage Calculations topic. |
| `9 - HESI Leadership` | 2 | 96 | HESI; RN | Leadership topic. |
| `10 - RN HESI Mental Health` | 7 | 316 | HESI; RN | Mental Health topic; plus Psychiatric Exam source folder may merge here. |
| `11 - Hesi Cat` | 1 | 79 | HESI | CAT topic. |
| `12 - Nursing Fundamentals` | 10 | 500 | HESI; RN | Fundamentals topic. |
| `13 - HESI Maternity` | 7 | 376 | HESI; RN | Maternity topic. |
| `14 - HESI Management` | 1 | 48 | HESI; RN | Management topic. |
| `15 - HESI Adult Health` | 9 | 449 | HESI; RN | Adult Health topic; supplemental files from ATI RN excluded HESI folder need review. |
| `16 - HESI Community Health` | 4 | 226 | HESI; RN | Community Health topic. |
| `17 - RN HESI HEALTH ASSESSMENT` | 15 | 867 | HESI; RN | Health Assessment topic. |
| `18 - Foundations of Nursing` | 6 | 338 | HESI; RN | Alias/source wording; likely merge into Fundamentals. |
| `19 - Capstone` | 1 | 124 | HESI; RN | Capstone topic. |
| `20 - Milestones` | 2 | 129 | HESI; RN | Milestones/development topic. |
| `21 - Psychiatric Exam` | 1 | 40 | HESI | Alias/source wording; likely merge into Mental Health. |
| `22 - Information Technology in Nursing` | 1 | 60 | HESI | Information Technology in Nursing topic. |
| `23 - Pathophysiology` | 1 | 49 | HESI; RN | Pathophysiology topic. |

## Immediate Review Flags For Step 2

| Source | File / Area | Reason |
|---|---|---|
| `1 - Hesi Medical Surgical` | Dosage-calculation title inside med-surg folder | Should map to Dosage Calculations if title/content confirms medication math. |
| `18 - Foundations of Nursing` | Whole source folder | Source alias should likely merge into Fundamentals rather than becoming a separate public topic. |
| `21 - Psychiatric Exam` | Whole source folder | Source alias should likely merge into Mental Health rather than becoming a separate public topic. |
| ATI RN excluded HESI folder | Adult Health and Foundation files | HESI-branded files found during ATI RN cleanup must be classified as RN HESI import, duplicate, or do-not-import. |

## Working Topic-Name Questions For Step 2

Do not treat these as final public topics yet. These are the source areas that need official/public naming review:

```text
Medical Surgical
Biology
Pediatric Nursing
Pharmacology
Specialty
Nursing Research
Nutrition
Dosage Calculations
Leadership
Mental Health
CAT
Fundamentals
Maternity
Management
Adult Health
Community Health
Health Assessment
Foundations of Nursing / Fundamentals
Capstone
Milestones
Psychiatric Exam / Mental Health
Information Technology in Nursing
Pathophysiology
```

## Step 2 - Mapping Requirements

Step 2 should produce the official RN HESI public-topic mapping table.

Required output:

- Final public topic name.
- Public URL slug.
- Source folder or source-file inputs.
- Whether the topic is a main HESI RN topic, support topic, alias, duplicate, or source bucket.
- Whether the topic is import-ready or needs review.

Do not import or overwrite Firestore quiz/question data until Steps 1-9 are complete and final import is explicitly approved.

## Step 2 - Official Public Topic Mapping

Stage 2 completed on 2026-08-18.

The RN HESI public topic layer should use concise topic names, the same way ATI RN and LPN ATI now do. Do not use long topic card labels such as `HESI RN Fundamentals Practice Questions` on the nested topic grid. The vendor/program is already supplied by the parent page, `HESI RN Exams`.

### Public Topic Map

| Public Topic | URL Slug | Classification | Source Inputs | Files | Questions | Rule |
|---|---|---|---|---:|---:|---|
| Adult Health | `hesi-rn-adult-health-practice-questions` | HESI RN topic | `15 - HESI Adult Health`; supplemental adult-health files from ATI RN excluded HESI folder | 11 | 590 | Import to Adult Health. |
| Biology | `hesi-rn-biology-practice-questions` | Support science topic | `2 - Hesi Biology` | 1 | 24 | Import to Biology. |
| Capstone | `hesi-rn-capstone-practice-questions` | HESI RN topic/source bucket | `19 - Capstone` | 1 | 124 | Import to Capstone. |
| CAT | `hesi-rn-cat-practice-questions` | HESI RN exam format/topic | `11 - Hesi Cat` | 1 | 79 | Import to CAT. |
| Community Health | `hesi-rn-community-health-practice-questions` | HESI RN topic | `16 - HESI Community Health` | 4 | 226 | Import to Community Health. |
| Dosage Calculations | `hesi-rn-dosage-calculations-practice-questions` | HESI RN topic | `8 - Hesi Dosage Calculations`; dosage-calculation file from `1 - Hesi Medical Surgical` | 17 | 874 | Import dosage/math files here even if source folder was Medical Surgical. |
| Fundamentals | `hesi-rn-fundamentals-practice-questions` | HESI RN topic | `12 - Nursing Fundamentals`; `18 - Foundations of Nursing` | 16 | 838 | Merge Foundations of Nursing into Fundamentals. |
| Health Assessment | `hesi-rn-health-assessment-practice-questions` | HESI RN topic | `17 - RN HESI HEALTH ASSESSMENT` | 15 | 867 | Import to Health Assessment. |
| Information Technology in Nursing | `hesi-rn-information-technology-in-nursing-practice-questions` | Support/informatics topic | `22 - Information Technology in Nursing` | 1 | 60 | Import to Information Technology in Nursing. |
| Leadership | `hesi-rn-leadership-practice-questions` | HESI RN topic | `9 - HESI Leadership` | 2 | 96 | Import to Leadership. |
| Management | `hesi-rn-management-practice-questions` | HESI RN topic | `14 - HESI Management` | 1 | 48 | Import to Management. |
| Maternity | `hesi-rn-maternity-practice-questions` | HESI RN topic | `13 - HESI Maternity` | 7 | 376 | Import to Maternity. |
| Medical Surgical | `hesi-rn-medical-surgical-practice-questions` | HESI RN topic | `1 - Hesi Medical Surgical`, excluding dosage-calculation file | 23 | 1,179 | Import med-surg files here; move dosage/math title to Dosage Calculations. |
| Mental Health | `hesi-rn-mental-health-practice-questions` | HESI RN topic | `10 - RN HESI Mental Health`; `21 - Psychiatric Exam` | 8 | 356 | Merge Psychiatric Exam into Mental Health. |
| Milestones | `hesi-rn-milestones-practice-questions` | Development/support topic | `20 - Milestones` | 2 | 129 | Import to Milestones. |
| Nursing Research | `hesi-rn-nursing-research-practice-questions` | HESI RN topic | `6 - Nursing Research` | 4 | 203 | Import to Nursing Research. |
| Nutrition | `hesi-rn-nutrition-practice-questions` | HESI RN topic | `7 - Nutrition` | 3 | 150 | Import to Nutrition. |
| Pathophysiology | `hesi-rn-pathophysiology-practice-questions` | Support/topic area | `23 - Pathophysiology` | 1 | 49 | Import to Pathophysiology. |
| Pediatric Nursing | `hesi-rn-pediatric-nursing-practice-questions` | HESI RN topic | `3 - HESI Pediatric` | 10 | 478 | Import to Pediatric Nursing. |
| Pharmacology | `hesi-rn-pharmacology-practice-questions` | HESI RN topic | `4 - HESI Pharmacology` | 21 | 1,003 | Import to Pharmacology. |
| Specialty | `hesi-rn-specialty-practice-questions` | Source bucket/topic | `5 - Nursing Specialty` | 1 | 78 | Import to Specialty. |

### Alias And Merge Rules

| Source Name | Final Destination | Reason |
|---|---|---|
| `Foundations of Nursing` | Fundamentals | Alias/source wording for foundational nursing content. |
| `Psychiatric Exam` | Mental Health | Psychiatric content belongs under Mental Health for public navigation. |
| Dosage-calculation file inside `1 - Hesi Medical Surgical` | Dosage Calculations | The file title/content is dosage-calculation specific, not general med-surg. |
| `HESI Pediatric` | Pediatric Nursing | Use the clearer public nursing topic name. |
| `Hesi Cat` | CAT | Keep CAT as the concise public label. |

### Supplemental ATI RN Excluded HESI Files

During ATI RN cleanup, three HESI-branded files were excluded from ATI RN. They are handled in RN HESI as follows:

| File | Destination | Action | Reason |
|---|---|---|---|
| `2-HESI RN Adult Health 1 Proctored Exam (WGU).json` | Adult Health | Import | Low overlap with existing Adult Health content; HESI RN Adult Health title. |
| `5-Wgu hesi rn adult health proctored exam.json` | Adult Health | Import | No text-overlap match found in existing RN HESI cleanup set; HESI RN Adult Health title. |
| `2-Hesi rn foundation of nursing proctored exam.json` | Duplicate Source - Do Not Import | Duplicate | Same filename as an existing Fundamentals file and high text overlap with already staged content. |

### Step 2 Result

| Metric | Count |
|---|---:|
| Public topics | 21 |
| Original source folders mapped | 23 |
| Supplemental ATI-excluded HESI files classified | 3 |
| Import-ready files expected after staging | 150 |
| Duplicate/do-not-import files expected after staging | 1 |
| Review-needed files expected after staging | 0 |

## Step 3 - Clean Folder Staging

Stage clean folder creation should use `scripts/stage-rn-hesi-cleanup.ps1`.

Stage 3 completed on 2026-08-18.

Expected output:

```text
rn-hesi-cleanup-manifest.csv
rn-hesi-cleanup-manifest.json
rn-hesi-cleanup-summary.csv
rn-hesi-root-json-artifacts.csv
```

Expected folder-level result:

```text
21 public topic folders
1 Duplicate Source - Do Not Import folder
0 Review Needed folder
```

Actual folder-level result:

```text
21 public topic folders
1 Duplicate Source - Do Not Import folder
0 Review Needed folder
```

Actual manifest result:

| Action | Files | Questions |
|---|---:|---:|
| Import-ready | 150 | 7,827 |
| Duplicate / do not import | 1 | 55 |

The stale `import-dry-run` folder from the interrupted early import attempt was removed from the RN HESI cleanup root because it is not part of the approved staged source structure.

## Step 4 - Normalized Filename Preview

Run the normalized-name preview against the staged RN HESI folders and confirm that public-facing exam filenames follow the ATI RN / LPN ATI pattern. The names should not include unnecessary vendor/program prefixes such as `HESI RN` when the parent page already provides that context.

Stage 4 completed on 2026-08-18.

Command used:

```powershell
.\scripts\preview-nursing-test-bank-normalized-names.ps1 `
  -CleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI" `
  -ManifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI\rn-hesi-cleanup-manifest.csv" `
  -GroupSlug "rn-hesi" `
  -Vendor "HESI" `
  -Program "RN" `
  -PublicProgramLabel "RN"
```

Generated files:

```text
rn-hesi-normalized-name-preview.csv
rn-hesi-normalized-name-review.csv
rn-hesi-normalized-name-review-simple.csv
rn-hesi-normalized-name-summary.csv
```

Result:

| Metric | Count |
|---|---:|
| Preview rows | 151 |
| Review rows | 0 |
| Duplicate slugs found | 0 |
| Duplicate wording cases fixed | 3 |

The normalizer was tightened for HESI RN titles so source titles such as `RN Medical Surgical HESI Proctored Exam` become clean public titles such as `HESI RN Medical Surgical Proctored Exam Practice Questions - Set 19`.

## Step 5 - Question Quality Audit

Audit question quality inside the staged RN HESI files. Focus first on structural issues that can break display or quiz behavior:

- missing question text,
- empty or missing options,
- missing correct answers,
- malformed rationales,
- invalid question counts,
- parse errors that were not caught during inventory.

Stage 5 completed on 2026-08-18.

Command used:

```powershell
node scripts/audit-nursing-test-bank-question-quality.js `
  --cleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI" `
  --manifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI\rn-hesi-cleanup-manifest.json" `
  --groupSlug rn-hesi
```

Generated files:

```text
rn-hesi-question-quality-issues.csv
rn-hesi-question-quality-file-summary.csv
rn-hesi-question-quality-summary.csv
```

Result:

| Metric | Count |
|---|---:|
| Audited files | 151 |
| Import-ready files | 150 |
| Audited questions | 7,882 |
| Import-ready questions | 7,827 |
| Duplicate/do-not-import questions | 55 |
| Import-ready structural issues | 460 |
| Total structural issues including duplicate file | 462 |

Import-ready issue breakdown:

| Issue | Count |
|---|---:|
| Empty option text | 278 |
| Missing explanation | 107 |
| Missing correct answer | 75 |

Highest-issue files:

| Issues | File |
|---:|---|
| 41 | `4-HESI Nursing Research Proctored Exam.json` |
| 36 | `9-RN HESI PAEDIATRICS Proctored Exam 2.json` |
| 23 | `4-Hesi rn  pediatrics & care of woman proctored exam.json` |
| 20 | `5-Wgu hesi rn adult health proctored exam.json` |
| 20 | `10-RN hesi fundamentals.json` |

Important note: many missing-correct-answer examples are NGN-style diagram/exhibit questions. These need careful handling because the answer may be represented differently from ordinary multiple-choice questions.

## Step 6 - Blocking Structural Repair

Repair the blocking structural issues before import:

- missing correct answers,
- empty option text,
- missing question text if any appear in later audits,
- malformed option payloads.

Missing explanations can be handled after the blocking display/answer issues, because explanation generation/review is a separate content-quality phase.

Stage 6 completed on 2026-08-18.

Commands used:

```powershell
node scripts\repair-rn-hesi-blocking-structural-issues.js

node scripts\audit-nursing-test-bank-question-quality.js `
  --cleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI" `
  --manifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI\rn-hesi-cleanup-manifest.json" `
  --groupSlug rn-hesi
```

Generated repair report:

```text
rn-hesi-structural-repair-report.json
```

Repairs performed:

| Repair | Count |
|---|---:|
| Import files changed | 100 |
| Blank/null top-level option entries removed | 549 |
| Blank/null subquestion option entries removed | 92 |

Important handling decision:

- Ordinary type `1` questions with blank `E` / `F` placeholders were repaired by removing only the blank option entries.
- Type `12` NGN diagram/exhibit questions were not assigned invented parent answers. Their answer data already exists inside `subquestions[].answer`, so the audit was refined to treat those as structurally answered when every subquestion has an answer.

Post-repair audit result:

| Issue | Before | After |
|---|---:|---:|
| Empty option text | 278 | 0 |
| Missing correct answer | 75 | 0 |
| Missing explanation | 107 | 107 |

Remaining issues are explanation-only:

| Topic | Missing Explanations |
|---|---:|
| Nursing Research | 40 |
| Pediatric Nursing | 36 |
| Fundamentals | 21 |
| Pharmacology | 5 |
| Health Assessment | 4 |
| Nutrition | 1 |

## Step 7 - Duplicate And Content-Overlap Audit

Run duplicate/content-overlap auditing after the structural repairs. Confirm whether any import-ready files are exact duplicates, clean-name duplicates, or question-signature duplicates. Keep the known duplicate source file excluded from import.

Stage 7 completed on 2026-08-18.

Command used:

```powershell
.\scripts\audit-nursing-test-bank-cleanup-duplicates.ps1 `
  -CleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI" `
  -ManifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI\rn-hesi-cleanup-manifest.csv" `
  -GroupSlug "rn-hesi"
```

Generated files:

```text
rn-hesi-duplicate-audit-rows.csv
rn-hesi-exact-content-duplicates.csv
rn-hesi-clean-name-duplicates.csv
rn-hesi-question-signature-duplicates.csv
rn-hesi-duplicate-audit-summary.csv
```

Result:

| Metric | Count |
|---|---:|
| Audited rows | 151 |
| Exact duplicate groups | 0 |
| Exact duplicate files | 0 |
| Clean-name duplicate groups | 16 |
| Clean-name duplicate files | 53 |
| Question-signature duplicate groups | 0 |
| Question-signature duplicate files | 0 |

Decision:

- No additional import-ready files should be removed based on this audit.
- Clean-name duplicates are classified as `same_clean_name_different_content`, meaning they share broad source names such as `hesi pharmacology` or `hesi fundamentals` but have different content/signatures.
- Public quiz titles and slugs are protected with set suffixes where needed.
- The only duplicate public title pair is the known Foundation of Nursing supplemental duplicate, and that row is already marked `duplicate` under `Duplicate Source - Do Not Import`.

## Step 8 - Metadata Readiness Check

Run final metadata readiness checks for the RN HESI public topic layer and import payload:

- topic count,
- quiz count per topic,
- question count per topic,
- normalized public quiz titles,
- duplicate/excluded files not included in import payload,
- remaining explanation-only issues documented for later content enhancement.

Stage 8 completed on 2026-08-18.

Command used:

```powershell
node scripts\audit-rn-hesi-metadata-readiness.js
```

Generated files:

```text
rn-hesi-metadata-readiness-summary.json
rn-hesi-metadata-readiness-topics.csv
```

Overall result:

```text
readyForImportPreparation = true
```

Readiness checks:

| Check | Result |
|---|---|
| 21 expected public topics present | Pass |
| 150 import-ready quizzes | Pass |
| 7,827 import-ready questions | Pass |
| 1 duplicate/do-not-import row remains excluded | Pass |
| No duplicate import slugs | Pass |
| No duplicate import public titles | Pass |
| No exact duplicate content groups | Pass |
| No question-signature duplicate groups | Pass |
| No blocking question issues remain | Pass |
| Remaining quality issues are explanation-only | Pass |

Topic readiness:

| Topic | Files | Questions |
|---|---:|---:|
| Adult Health | 11 | 590 |
| Biology | 1 | 24 |
| Capstone | 1 | 124 |
| CAT | 1 | 79 |
| Community Health | 4 | 226 |
| Dosage Calculations | 17 | 874 |
| Fundamentals | 16 | 838 |
| Health Assessment | 15 | 867 |
| Information Technology in Nursing | 1 | 60 |
| Leadership | 2 | 96 |
| Management | 1 | 48 |
| Maternity | 7 | 376 |
| Medical Surgical | 23 | 1,179 |
| Mental Health | 8 | 356 |
| Milestones | 2 | 129 |
| Nursing Research | 4 | 203 |
| Nutrition | 3 | 150 |
| Pathophysiology | 1 | 49 |
| Pediatric Nursing | 10 | 478 |
| Pharmacology | 21 | 1,003 |
| Specialty | 1 | 78 |

## Step 9 - Import Dry-Run

Prepare and run an import dry-run only. The dry-run should validate the final import payload, topic metadata, quiz metadata, question normalization, and remaining non-blocking explanation gaps without writing Firestore data.

Stage 9 completed on 2026-08-18.

Command used:

```powershell
node scripts\import-rn-hesi-test-bank.js
```

Important: `--apply` was not passed, so this was a dry-run. No quiz/question writes were performed.

Generated file:

```text
import-dry-run\rn-hesi-real-import-dry-run-summary.json
```

Dry-run result:

| Metric | Count |
|---|---:|
| Planned topics | 21 |
| Planned quizzes | 150 |
| Planned questions | 7,827 |
| Blocking question issues | 0 |
| Missing explanation rows | 107 |
| Imported rows | 0 |

All planned topic actions were `update`, meaning the RN HESI topic documents already exist and the dry-run would update their metadata/counts during apply.

The importer validation was aligned with the quality audit so blank/HTML-only explanations are counted consistently as missing explanations.

## Step 10 - Final Import / Apply

Final import/apply, only after explicit approval:

```powershell
node scripts\import-rn-hesi-test-bank.js --apply
```

This step will write Firestore topic metadata, quiz documents, quiz questions, and routing metadata. It should only be run after reviewing the dry-run summary and confirming that the `107` remaining explanation gaps are acceptable for initial import.

Stage 10 completed on 2026-08-18.

Commands used:

```powershell
node scripts\import-rn-hesi-test-bank.js --apply
node scripts\audit-rn-hesi-extra-quizzes.js
node scripts\delete-rn-hesi-extra-quizzes.js --apply
node scripts\import-rn-hesi-test-bank.js --audit
node scripts\audit-rn-hesi-extra-quizzes.js
```

Generated files:

```text
import-dry-run\rn-hesi-real-import-apply-summary.json
rn-hesi-extra-live-quizzes.json
rn-hesi-extra-live-quizzes-delete-report.json
```

Import result:

| Metric | Count |
|---|---:|
| Planned quizzes | 150 |
| Planned questions | 7,827 |
| Missing explanation rows | 107 |
| Blocking question issues | 0 |
| Created during completed apply | 4 |
| Updated during completed apply | 146 |

The first apply attempt timed out before completion and did not write an apply summary. The apply was rerun with a longer timeout and completed successfully.

Because earlier RN HESI work had already inserted older quiz slugs, the post-apply audit initially showed 8 stale extra live quizzes. These were not part of the validated RN HESI payload. They were removed using the targeted extra-quiz cleanup script.

Stale cleanup result:

| Metric | Count |
|---|---:|
| Stale quiz docs deleted | 8 |
| Stale question docs deleted | 333 |
| Extra live quizzes after cleanup | 0 |

Final Firestore audit:

| Metric | Expected | Actual |
|---|---:|---:|
| RN HESI quizzes | 150 | 150 |
| RN HESI questions | 7,827 | 7,827 |

Final state: RN HESI live Firestore data now matches the validated cleanup payload exactly.
