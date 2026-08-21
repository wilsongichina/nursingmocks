# RN Nursing Course Exams Cleanup Plan

## Purpose

Clean the RN REGULAR source folders before final Nursing Test Bank import.

This group will become:

```text
RN Exams
  RN Nursing Course Exams
```

Source folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\REGULAR
```

Cleanup folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR
```

## Current Status

Steps 1 through 9 are complete.

Current next step:

```text
Step 10 - Final Import
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

Inventory generated on 2026-08-19.

| Metric | Count |
|---|---:|
| Source folders | 32 |
| JSON exam files | 351 |
| Total questions counted | 18,478 |
| Root/support artifacts | 32 |
| JSON parse errors | 0 |
| Zero-question JSON files | 2 |

Generated files:

```text
rn-regular-source-inventory.csv
rn-regular-source-inventory.json
rn-regular-source-folder-summary.csv
rn-regular-root-json-artifacts.csv
rn-regular-parse-errors.csv
```

## Largest Source Folders

| Source Folder | Files | Questions | Notes |
|---|---:|---:|---|
| `10 - Medical-Surgical` | 79 | 4,462 | Largest source folder; contains one zero-question file and at least one ATI-titled file. |
| `15 - Pediatrics` | 34 | 1,831 | Contains pediatric and OB/pediatric mixed titles; one ATI-titled file. |
| `12 - Fundamentals` | 34 | 1,670 | Includes one Kaplan-titled fundamentals file. |
| `9 - Pharmacology` | 29 | 1,317 | Includes pathopharmacology and medication-safety titles. |
| `18 - Mental Health` | 26 | 1,564 | Mental-health source bucket. |
| `13 - Maternal Newborn` | 25 | 1,281 | Includes NACE and medication-safety titles that need classification. |
| `2 - Pathophysiology` | 19 | 870 | Includes one Kaplan-titled pathophysiology file. |
| `19 - Dosage Calculations` | 18 | 694 | Includes one zero-question file. |
| `14 - Anatomy and Physiology` | 18 | 1,156 | Includes an LPN-titled anatomy and physiology file. |

## Source Folder Summary

| Source Folder | Files | Questions |
|---|---:|---:|
| `1 - Multidimensional care` | 3 | 145 |
| `2 - Pathophysiology` | 19 | 870 |
| `3 - Endocrinology` | 1 | 56 |
| `4 - Perfusion` | 1 | 48 |
| `5 - Gastrointestinal System` | 3 | 82 |
| `6 - ICU Cardiac, Respiratory, Neuro, Renal, Shock Skills` | 1 | 40 |
| `7 - Gastro Urinary Systems Medication` | 3 | 82 |
| `8 - Kaplan Admission Tests` | 4 | 101 |
| `9 - Pharmacology` | 29 | 1,317 |
| `10 - Medical-Surgical` | 79 | 4,462 |
| `11 - Adult Health` | 8 | 408 |
| `12 - Fundamentals` | 34 | 1,670 |
| `13 - Maternal Newborn` | 25 | 1,281 |
| `14 - Anatomy and Physiology` | 18 | 1,156 |
| `15 - Pediatrics` | 34 | 1,831 |
| `16 - Community Health` | 3 | 110 |
| `17 - Promoting Health across the lifespan ATI Exams` | 2 | 201 |
| `18 - Mental Health` | 26 | 1,564 |
| `19 - Dosage Calculations` | 18 | 694 |
| `20 - Nursing Specialty` | 2 | 71 |
| `21 - Foundations of Nursing` | 8 | 589 |
| `22 - Life Science` | 1 | 41 |
| `23 - Nutrition` | 2 | 119 |
| `24 - Leadership` | 5 | 304 |
| `25 - Dimensions of Nursing Practice` | 1 | 31 |
| `26 - Nursing of Women and Childbearing` | 1 | 48 |
| `27 - Applying the nursing process to alterations in health` | 2 | 123 |
| `28 - Health Assessment` | 7 | 355 |
| `29 - Management of Care for Adults` | 2 | 85 |
| `30 - Critical Care` | 1 | 50 |
| `31 - Growth and Development` | 2 | 137 |
| `32 - Microbiology` | 3 | 222 |

## Immediate Review Flags For Step 2

| Source / File | Reason |
|---|---|
| `8 - Kaplan Admission Tests` | Looks like Nursing Entrance Exam content, not RN Nursing Course Exams. |
| `17 - Promoting Health across the lifespan ATI Exams` | ATI appears in the source folder name; must decide whether to keep under Course Exams or move/exclude. |
| `21 - Foundations of Nursing` | Likely an alias/source wording for Fundamentals; probably merge into Fundamentals. |
| `7 - Gastro Urinary Systems Medication` | Appears to duplicate the same gastrointestinal files from `5 - Gastrointestinal System`; needs duplicate check. |
| `14 - Anatomy and Physiology\1-Lpn Anatomy and physiology proctored exam.json` | LPN-titled file inside RN source; needs classification. |
| `10 - Medical-Surgical\62-Smith Chason Los Angeles ATI Med Surg Proctored Exam 2.json` | ATI-titled file inside REGULAR; needs classification. |
| `12 - Fundamentals\30-Kaplan fundamentals ngn proctored exam.json` | Kaplan-titled file inside RN REGULAR; needs classification. |
| `2 - Pathophysiology\15-Kaplan Pathophysiology NGN Proctored Exam.json` | Kaplan-titled file inside RN REGULAR; needs classification. |
| `13 - Maternal Newborn\23-NACE Care of the Child Proctored Exam.json` | NACE-titled file; needs classification. |
| `13 - Maternal Newborn\25-NACE Care of the childbearing family Proctored Exam.json` | NACE-titled file; needs classification. |
| `21 - Foundations of Nursing\7-NACE Foundations of Nursing Proctored Exam 2.json` | NACE-titled file; needs classification. |
| `21 - Foundations of Nursing\8-NACE Foundations of Nursing Proctored Exam.json` | NACE-titled file; needs classification. |
| `31 - Growth and Development\2-CLEP human growth and development proctored exam.json` | CLEP-titled file; may be support/prerequisite content rather than nursing course exam. |

## Zero-Question Files

These parsed successfully but contained no questions:

| Source Folder | File |
|---|---|
| `10 - Medical-Surgical` | `74-Med Surg Proctored Exam 4.json` |
| `19 - Dosage Calculations` | `14-WGU CTO1 Dosage Calculations Proctored Exam.json` |

These should not be imported unless later inspection finds recoverable question content.

## Step 2 Working Topic Questions

Step 2 should decide whether the public topic list should keep broad course topics only or also include support/prerequisite topics.

Working topic candidates from source:

```text
Adult Health
Anatomy and Physiology
Community Health
Critical Care
Dosage Calculations
Endocrinology
Fundamentals
Gastrointestinal System
Growth and Development
Health Assessment
Leadership
Life Science
Maternal Newborn
Medical Surgical
Mental Health
Microbiology
Multidimensional Care
Nutrition
Pathophysiology
Pediatrics
Perfusion
Pharmacology
```

Likely aliases/merge candidates:

```text
Foundations of Nursing -> Fundamentals
Management of Care for Adults -> Adult Health or Medical Surgical
Nursing of Women and Childbearing -> Maternal Newborn
Applying the Nursing Process to Alterations in Health -> Fundamentals / Medical Surgical, depending on file content
Gastro Urinary Systems Medication -> Gastrointestinal System or duplicate source
```

Potential exclusions or moves:

```text
Kaplan Admission Tests -> Nursing Entrance Exam
ATI-titled files -> review against ATI RN destination
NACE/CLEP files -> review before Course Exams import
Zero-question files -> exclude unless repaired
```

## Step 2 - Official Public Topic Mapping

Stage 2 completed on 2026-08-19.

Important decision:

```text
Kaplan Admission Tests are excluded from RN Nursing Course Exams.
Reason: user confirmed Kaplan has already been uploaded.
```

Generated file:

```text
rn-regular-topic-mapping.csv
```

### Step 2 Action Summary

| Action | Source Folders | Files | Questions |
|---|---:|---:|---:|
| Import | 22 | 323 | 16,894 |
| Merge | 3 | 11 | 763 |
| Review | 5 | 10 | 638 |
| Review duplicate | 1 | 3 | 82 |
| Exclude | 1 | 4 | 101 |

### Public Topic Mapping

| Source Folder | Public Topic | Action | URL Slug | Files | Questions | Rule |
|---|---|---|---|---:|---:|---|
| `1 - Multidimensional care` | Multidimensional Care | Import | `rn-nursing-course-multidimensional-care-practice-questions` | 3 | 187 | Course-based RN nursing content. |
| `2 - Pathophysiology` | Pathophysiology | Import | `rn-nursing-course-pathophysiology-practice-questions` | 19 | 870 | Import course-based pathophysiology content; Kaplan-titled file needs file-level review/exclusion. |
| `3 - Endocrinology` | Endocrinology | Import | `rn-nursing-course-endocrinology-practice-questions` | 1 | 42 | Import endocrine course content. |
| `4 - Perfusion` | Perfusion | Import | `rn-nursing-course-perfusion-practice-questions` | 1 | 49 | Import perfusion/cardiovascular assessment content. |
| `5 - Gastrointestinal System` | Gastrointestinal System | Import | `rn-nursing-course-gastrointestinal-system-practice-questions` | 3 | 82 | Import GI system course content. |
| `6 - ICU Cardiac, Respiratory, Neuro, Renal, Shock Skills` | Critical Care | Import | `rn-nursing-course-critical-care-practice-questions` | 1 | 55 | Merge into Critical Care. |
| `7 - Gastro Urinary Systems Medication` | Gastrointestinal System | Review duplicate | `rn-nursing-course-gastrointestinal-system-practice-questions` | 3 | 82 | Likely duplicate/overlap with Gastrointestinal System; duplicate check required before import. |
| `8 - Kaplan Admission Tests` | Exclude - Kaplan Admission Tests | Exclude |  | 4 | 101 | Exclude because Kaplan has already been uploaded. |
| `9 - Pharmacology` | Pharmacology | Import | `rn-nursing-course-pharmacology-practice-questions` | 29 | 1,317 | Import pharmacology/pathopharmacology/medication-safety content. |
| `10 - Medical-Surgical` | Medical Surgical | Import | `rn-nursing-course-medical-surgical-practice-questions` | 79 | 4,462 | Import med-surg content; handle zero-question and ATI-titled files at file level. |
| `11 - Adult Health` | Adult Health | Import | `rn-nursing-course-adult-health-practice-questions` | 8 | 408 | Import adult/gerontology/adult care content. |
| `12 - Fundamentals` | Fundamentals | Import | `rn-nursing-course-fundamentals-practice-questions` | 34 | 1,670 | Import fundamentals/basic nursing content; Kaplan-titled file needs file-level review/exclusion. |
| `13 - Maternal Newborn` | Maternal Newborn | Import | `rn-nursing-course-maternal-newborn-practice-questions` | 25 | 1,281 | Import maternity, newborn, and childbearing-family content; NACE files need review. |
| `14 - Anatomy and Physiology` | Anatomy and Physiology | Import | `rn-nursing-course-anatomy-and-physiology-practice-questions` | 18 | 1,156 | Import A&P support content; LPN-titled file needs review. |
| `15 - Pediatrics` | Pediatrics | Import | `rn-nursing-course-pediatrics-practice-questions` | 34 | 1,831 | Import pediatric nursing and child health content; ATI-titled file needs review. |
| `16 - Community Health` | Community Health | Import | `rn-nursing-course-community-health-practice-questions` | 6 | 336 | Import community/public health nursing content. |
| `17 - Promoting Health across the lifespan ATI Exams` | Health Promotion Across the Lifespan | Review | `rn-nursing-course-health-promotion-across-the-lifespan-practice-questions` | 2 | 201 | ATI appears in source name; content may fit health promotion/lifespan but needs classification. |
| `18 - Mental Health` | Mental Health | Import | `rn-nursing-course-mental-health-practice-questions` | 26 | 1,564 | Import psychiatric/mental health course content. |
| `19 - Dosage Calculations` | Dosage Calculations | Import | `rn-nursing-course-dosage-calculations-practice-questions` | 18 | 694 | Import medication math and dosage-calculation content; zero-question file excluded unless repaired. |
| `20 - Nursing Specialty` | Nursing Specialty | Import | `rn-nursing-course-nursing-specialty-practice-questions` | 2 | 82 | Import mixed/specialty RN course content. |
| `21 - Foundations of Nursing` | Fundamentals | Merge | `rn-nursing-course-fundamentals-practice-questions` | 8 | 589 | Merge alias/source wording into Fundamentals. |
| `22 - Life Science` | Life Science | Review | `rn-nursing-course-life-science-practice-questions` | 1 | 46 | Support science content; decide whether Course Exams should include it. |
| `23 - Nutrition` | Nutrition | Import | `rn-nursing-course-nutrition-practice-questions` | 2 | 65 | Import nutrition course content. |
| `24 - Leadership` | Leadership | Import | `rn-nursing-course-leadership-practice-questions` | 5 | 255 | Import leadership and management content. |
| `25 - Dimensions of Nursing Practice` | Dimensions of Nursing Practice | Import | `rn-nursing-course-dimensions-of-nursing-practice-questions` | 1 | 50 | Import professional practice/SBAR/dimensions content. |
| `26 - Nursing of Women and Childbearing` | Maternal Newborn | Merge | `rn-nursing-course-maternal-newborn-practice-questions` | 1 | 46 | Merge alias/source wording into Maternal Newborn. |
| `27 - Applying the nursing process to alterations in health` | Nursing Process and Alterations in Health | Review | `rn-nursing-course-nursing-process-and-alterations-in-health-practice-questions` | 2 | 123 | Mixed nursing process and alterations content; may split by file if needed. |
| `28 - Health Assessment` | Health Assessment | Import | `rn-nursing-course-health-assessment-practice-questions` | 7 | 355 | Import health assessment content. |
| `29 - Management of Care for Adults` | Adult Health | Merge | `rn-nursing-course-adult-health-practice-questions` | 2 | 128 | Merge adult-care management content into Adult Health unless file review indicates Medical Surgical. |
| `30 - Critical Care` | Critical Care | Import | `rn-nursing-course-critical-care-practice-questions` | 1 | 83 | Import critical care med-surg content. |
| `31 - Growth and Development` | Growth and Development | Review | `rn-nursing-course-growth-and-development-practice-questions` | 2 | 144 | Support/development content; CLEP-titled file needs review. |
| `32 - Microbiology` | Microbiology | Review | `rn-nursing-course-microbiology-practice-questions` | 3 | 124 | Support science content; decide whether Course Exams should include it. |

### Intentional Merges And Duplicate-Slug Groups

These duplicate slugs are expected because multiple source folders map into one public topic:

| Public Slug | Source Folders | Reason |
|---|---|---|
| `rn-nursing-course-fundamentals-practice-questions` | `12 - Fundamentals`; `21 - Foundations of Nursing` | Foundations of Nursing is an alias/source wording for Fundamentals. |
| `rn-nursing-course-maternal-newborn-practice-questions` | `13 - Maternal Newborn`; `26 - Nursing of Women and Childbearing` | Women/childbearing content belongs under Maternal Newborn. |
| `rn-nursing-course-adult-health-practice-questions` | `11 - Adult Health`; `29 - Management of Care for Adults` | Adult-care management content belongs under Adult Health unless file review says otherwise. |
| `rn-nursing-course-critical-care-practice-questions` | `30 - Critical Care`; `6 - ICU Cardiac, Respiratory, Neuro, Renal, Shock Skills` | ICU/shock skills are critical-care content. |
| `rn-nursing-course-gastrointestinal-system-practice-questions` | `5 - Gastrointestinal System`; `7 - Gastro Urinary Systems Medication` | Needs duplicate review before import. |

### Step 2 Result

Step 2 is complete enough to proceed to Step 3 staging.

Step 3 must apply these rules:

```text
Exclude Kaplan Admission Tests.
Exclude zero-question files unless repairable.
Merge Foundations of Nursing into Fundamentals.
Merge Nursing of Women and Childbearing into Maternal Newborn.
Merge Management of Care for Adults into Adult Health unless file review changes it.
Merge ICU/shock skills into Critical Care.
Put Gastro Urinary Systems Medication into Review/Duplicate until duplicate checks confirm import/exclude.
```

## Step 3 - Clean Folder Staging

Stage 3 completed on 2026-08-19.

Created staging script:

```text
scripts/stage-rn-regular-cleanup.ps1
```

Generated files:

```text
rn-regular-cleanup-manifest.csv
rn-regular-cleanup-manifest.json
rn-regular-cleanup-summary.csv
rn-regular-root-json-artifacts.csv
```

The script copies source JSON files into clean destination folders under:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR
```

The original source folder remains untouched:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\REGULAR
```

### Step 3 Totals

| Metric | Count |
|---|---:|
| Source topic folders processed | 32 |
| JSON files staged/classified | 351 |
| Import files | 322 |
| Review files | 21 |
| Excluded files | 8 |

### Imported Clean Topics

| Destination Topic | Exams | Questions |
|---|---:|---:|
| Adult Health | 10 | 536 |
| Anatomy and Physiology | 17 | 1,106 |
| Community Health | 6 | 336 |
| Critical Care | 2 | 138 |
| Dimensions of Nursing Practice | 1 | 50 |
| Dosage Calculations | 17 | 694 |
| Endocrinology | 1 | 42 |
| Fundamentals | 38 | 1,922 |
| Gastrointestinal System | 3 | 82 |
| Health Assessment | 7 | 355 |
| Leadership | 5 | 255 |
| Maternal Newborn | 24 | 1,131 |
| Medical Surgical | 77 | 4,405 |
| Mental Health | 26 | 1,564 |
| Multidimensional Care | 3 | 187 |
| Nursing Specialty | 2 | 82 |
| Nutrition | 2 | 65 |
| Pathophysiology | 18 | 825 |
| Pediatrics | 33 | 1,789 |
| Perfusion | 1 | 49 |
| Pharmacology | 29 | 1,317 |

### Excluded Files

| Destination | Files | Questions | Reason |
|---|---:|---:|---|
| `Excluded - Already Uploaded\Kaplan` | 6 | 175 | Kaplan content has already been uploaded. |
| `Excluded - Empty Files` | 2 | 0 | Zero-question JSON files. |

Excluded files:

```text
10 - Medical-Surgical\74-Med Surg Proctored Exam 4.json
12 - Fundamentals\30-Kaplan fundamentals ngn proctored exam.json
19 - Dosage Calculations\14-WGU CTO1 Dosage Calculations Proctored Exam.json
2 - Pathophysiology\15-Kaplan Pathophysiology NGN Proctored Exam.json
8 - Kaplan Admission Tests\Kaplan Admission Practice Test Math.json
8 - Kaplan Admission Tests\Kaplan Admission Practice Test Reading.json
8 - Kaplan Admission Tests\Kaplan Admission Practice Test Science.json
8 - Kaplan Admission Tests\Kaplan Admission Practice Test Writing.json
```

### Review Needed Groups

| Review Group | Files | Questions | Reason |
|---|---:|---:|---|
| `Review Needed\Credential or Support Review` | 5 | 555 | NACE/CLEP or credential/support-style content needs classification. |
| `Review Needed\Duplicate Review - Gastrointestinal System` | 3 | 82 | Likely duplicates of Gastrointestinal System files. |
| `Review Needed\Nursing Process and Alterations in Health` | 2 | 123 | Mixed nursing-process/alterations content needs file-level placement. |
| `Review Needed\Program Review - LPN or PN Titled` | 1 | 50 | LPN/PN-titled file inside RN source. |
| `Review Needed\Support Development - Growth and Development` | 1 | 55 | Support/development content needs inclusion decision. |
| `Review Needed\Support Science - Life Science` | 1 | 46 | Support science content needs inclusion decision. |
| `Review Needed\Support Science - Microbiology` | 3 | 124 | Support science content needs inclusion decision. |
| `Review Needed\Vendor Review - ATI Titled` | 5 | 338 | ATI-titled files/folder inside RN REGULAR need classification. |

### Step 3 Implementation Note

The first staging run over-flagged files because the text `Medication` contains the letters `ati`. The script was corrected to match only standalone `ATI`, then staging was rerun from a cleaned destination-folder state.

Step 4 should resolve the 21 review files before normalized quiz-name generation.

## Step 4 - Review Needed Resolution

Stage 4 completed on 2026-08-20.

Created placement script:

```text
scripts/apply-rn-regular-review-placements.ps1
```

Generated review-placement file:

```text
rn-regular-review-placements.csv
```

### Step 4 Result

| Metric | Count |
|---|---:|
| Review files evaluated | 21 |
| Review placements applied | 21 |
| Unresolved review rows | 0 |
| Remaining review JSON files | 0 |

### Applied Review Decisions

| Decision | Files | Questions | Notes |
|---|---:|---:|---|
| Import to Pediatrics | 1 | 101 | `NACE Care of the Child` contains pediatric nursing/child-care content. |
| Import to Maternal Newborn | 1 | 95 | `NACE Care of the childbearing family` contains maternity/newborn content. |
| Import to Fundamentals | 3 | 318 | NACE Foundations and nursing-process foundations files belong under Fundamentals. |
| Import to Medical Surgical | 1 | 75 | Alterations-in-health file contains adult clinical/med-surg content. |
| Import to Anatomy and Physiology | 1 | 50 | LPN-titled file contains generic A&P content. |
| Import to Growth and Development | 2 | 144 | Human growth/development support coursework retained under Growth and Development. |
| Import to Microbiology | 3 | 124 | Microbiology support coursework retained under Microbiology. |
| Duplicate - Do Not Import | 3 | 82 | Gastro Urinary Systems Medication files are exact SHA-256 duplicates of imported Gastrointestinal System files. |
| Exclude - Non Nursing Support Science | 1 | 46 | Life Science lab file is plant/photosynthesis biology, not RN nursing course content. |
| Exclude - Wrong Vendor ATI | 5 | 338 | ATI-titled/source-folder files are not imported into RN Nursing Course Exams. |

### Final Cleanup State After Step 4

| Action | Files | Questions |
|---|---:|---:|
| Import | 334 | 17,837 |
| Duplicate - Do Not Import | 3 | 82 |
| Exclude - Already Uploaded Kaplan | 6 | 175 |
| Exclude - Empty Files | 2 | 0 |
| Exclude - Non Nursing Support Science | 1 | 46 |
| Exclude - Wrong Vendor ATI | 5 | 338 |
| Review | 0 | 0 |

## Step 5 - Normalized Quiz Names

Stage 5 completed on 2026-08-20.

Created normalization preview script:

```text
scripts/preview-rn-regular-normalized-names.ps1
```

Generated files:

```text
rn-regular-normalized-name-preview.csv
rn-regular-normalized-name-review.csv
rn-regular-normalized-name-review-simple.csv
rn-regular-normalized-name-summary.csv
rn-regular-normalized-slug-collisions.csv
rn-regular-normalized-title-collisions.csv
```

### Step 5 Result

| Metric | Count |
|---|---:|
| Import rows normalized | 334 |
| Review rows | 0 |
| Slug collision rows | 0 |
| Title collision rows | 0 |

The normalized title preview uses RN Nursing Course Exam names only. It does not force `ATI`, `HESI`, `LPN`, or `Practice Test` wording into the public quiz titles.

### Normalized Topic Totals

| Topic | Files | Questions |
|---|---:|---:|
| Adult Health | 10 | 536 |
| Anatomy and Physiology | 18 | 1,156 |
| Community Health | 6 | 336 |
| Critical Care | 2 | 138 |
| Dimensions of Nursing Practice | 1 | 50 |
| Dosage Calculations | 17 | 694 |
| Endocrinology | 1 | 42 |
| Fundamentals | 41 | 2,240 |
| Gastrointestinal System | 3 | 82 |
| Growth and Development | 2 | 144 |
| Health Assessment | 7 | 355 |
| Leadership | 5 | 255 |
| Maternal Newborn | 25 | 1,226 |
| Medical Surgical | 78 | 4,480 |
| Mental Health | 26 | 1,564 |
| Microbiology | 3 | 124 |
| Multidimensional Care | 3 | 187 |
| Nursing Specialty | 2 | 82 |
| Nutrition | 2 | 65 |
| Pathophysiology | 18 | 825 |
| Pediatrics | 34 | 1,890 |
| Perfusion | 1 | 49 |
| Pharmacology | 29 | 1,317 |

## Step 6 - Blocking Question Audit

Stage 6 completed on 2026-08-20.

Created RN REGULAR structural repair script:

```text
scripts/repair-rn-regular-blocking-structural-issues.js
```

Generated audit and repair files:

```text
rn-regular-question-quality-issues.csv
rn-regular-question-quality-file-summary.csv
rn-regular-question-quality-summary.csv
rn-regular-structural-repair-report.json
```

### Initial Audit Result

| Issue | Import Rows | Duplicate Rows | Notes |
|---|---:|---:|---|
| Empty option text | 286 | 3 | Blocking for import rows. |
| Missing explanation | 222 | 26 | Not repaired in this phase; explanations will be handled later. |

No missing question text, missing correct answers, parse errors, invalid question-type IDs, or declared-count mismatches were found in import rows.

### Structural Repair Applied

The repair removed blank option entries only. It did not invent answer choices, explanations, or question text.

| Metric | Count |
|---|---:|
| Import files repaired | 112 |
| Blank question options removed | 547 |
| Blank subquestion options removed | 8 |
| Repair warnings | 0 |

Zero repair warnings means every repaired question retained at least two usable options after blank entries were removed.

### Final Audit Result After Repair

| Issue | Import Rows | Duplicate Rows | Status |
|---|---:|---:|---|
| Empty option text | 0 | 3 | Import blockers cleared. Remaining rows are duplicate/do-not-import files. |
| Missing explanation | 222 | 26 | Deferred; not a blocker for this phase. |

### Phase 6 Result

Phase 6 blocking issues are clear for the RN REGULAR import set.

```text
Blocking import issues: 0
Explanation-only import issues deferred: 222
```

## Step 7 - Topic Metadata / Page Consistency

Stage 7 completed on 2026-08-20.

Created metadata readiness script:

```text
scripts/audit-rn-regular-metadata-readiness.js
```

Generated files:

```text
rn-regular-metadata-readiness-summary.json
rn-regular-metadata-readiness-topics.csv
rn-regular-duplicate-audit-rows.csv
rn-regular-exact-content-duplicates.csv
rn-regular-clean-name-duplicates.csv
rn-regular-question-signature-duplicates.csv
rn-regular-duplicate-audit-summary.csv
```

### Step 7 Readiness Result

| Check | Result |
|---|---|
| 23 expected RN Nursing Course Exam topics present | Pass |
| 334 import-ready quizzes | Pass |
| 17,837 import-ready questions | Pass |
| Duplicate import slugs | 0 |
| Duplicate import public titles | 0 |
| Exact duplicate content inside import set | 0 blocking groups |
| Question-signature duplicates inside import set | 0 blocking groups |
| Blocking question issues | 0 |
| Remaining quality issues | Explanation-only |
| RN Nursing Course Exams nested page exists locally | Pass |

Readiness status:

```text
readyForImportPreparation: true
```

### Topic Metadata Prepared

| Topic | Slug | Files | Questions |
|---|---|---:|---:|
| Adult Health | `rn-nursing-course-adult-health-practice-questions` | 10 | 536 |
| Anatomy and Physiology | `rn-nursing-course-anatomy-and-physiology-practice-questions` | 18 | 1,156 |
| Community Health | `rn-nursing-course-community-health-practice-questions` | 6 | 336 |
| Critical Care | `rn-nursing-course-critical-care-practice-questions` | 2 | 138 |
| Dimensions of Nursing Practice | `rn-nursing-course-dimensions-of-nursing-practice-questions` | 1 | 50 |
| Dosage Calculations | `rn-nursing-course-dosage-calculations-practice-questions` | 17 | 694 |
| Endocrinology | `rn-nursing-course-endocrinology-practice-questions` | 1 | 42 |
| Fundamentals | `rn-nursing-course-fundamentals-practice-questions` | 41 | 2,240 |
| Gastrointestinal System | `rn-nursing-course-gastrointestinal-system-practice-questions` | 3 | 82 |
| Growth and Development | `rn-nursing-course-growth-and-development-practice-questions` | 2 | 144 |
| Health Assessment | `rn-nursing-course-health-assessment-practice-questions` | 7 | 355 |
| Leadership | `rn-nursing-course-leadership-practice-questions` | 5 | 255 |
| Maternal Newborn | `rn-nursing-course-maternal-newborn-practice-questions` | 25 | 1,226 |
| Medical Surgical | `rn-nursing-course-medical-surgical-practice-questions` | 78 | 4,480 |
| Mental Health | `rn-nursing-course-mental-health-practice-questions` | 26 | 1,564 |
| Microbiology | `rn-nursing-course-microbiology-practice-questions` | 3 | 124 |
| Multidimensional Care | `rn-nursing-course-multidimensional-care-practice-questions` | 3 | 187 |
| Nursing Specialty | `rn-nursing-course-nursing-specialty-practice-questions` | 2 | 82 |
| Nutrition | `rn-nursing-course-nutrition-practice-questions` | 2 | 65 |
| Pathophysiology | `rn-nursing-course-pathophysiology-practice-questions` | 18 | 825 |
| Pediatrics | `rn-nursing-course-pediatrics-practice-questions` | 34 | 1,890 |
| Perfusion | `rn-nursing-course-perfusion-practice-questions` | 1 | 49 |
| Pharmacology | `rn-nursing-course-pharmacology-practice-questions` | 29 | 1,317 |

### Local Page Consistency Note

The local sidebar data already contains:

```text
RN Nursing Course Exams
slug: rn-nursing-course-exams
nestedSubPageId: zMFBI0XMiRsJnnXWhL5S
```

Current local sidebar counts after final import/backfill:

```text
topicCount: 23
quizCount: 334
questionCount: 17,837
```

### Topic Slug Namespace Note

RN REGULAR topic slugs use the `rn-nursing-course-*` namespace instead of generic `rn-*` topic slugs.

Example:

```text
rn-nursing-course-medical-surgical-practice-questions
```

Reason: public routes are flat, so the slug must remain distinct from ATI RN, HESI RN, certifications, and future RN topic pages that may share the same display topic name.

## Step 8 - Documentation Finalization

Stage 8 completed on 2026-08-20.

This Markdown documentation and the matching HTML review page now record:

```text
source inventory
topic mapping
clean-folder staging
review-needed resolutions
normalized public quiz names
question-quality audit and structural repair
duplicate/content audit
topic metadata readiness
page consistency notes
final import-ready counts
```

Documentation files:

```text
Documentation/public-sub-pages/RN REGULAR test bank cleanup plan.md
Documentation/public-sub-pages/RN REGULAR test bank cleanup plan.html
```

### Final Import-Ready Summary

| Item | Count / Status |
|---|---:|
| Source JSON files reviewed | 351 |
| Import-ready files | 334 |
| Import-ready questions | 17,837 |
| Public topics prepared | 23 |
| Review rows remaining | 0 |
| Duplicate import slugs | 0 |
| Duplicate import public titles | 0 |
| Blocking question issues | 0 |
| Explanation-only deferred rows | 222 |
| Duplicate/do-not-import files | 3 |
| Excluded files | 14 |

### Final Placement Summary

| Placement | Files | Questions | Import? |
|---|---:|---:|---|
| RN Nursing Course Exams topics | 334 | 17,837 | Yes |
| Duplicate Source - Do Not Import | 3 | 82 | No |
| Excluded - Already Uploaded Kaplan | 6 | 175 | No |
| Excluded - Empty Files | 2 | 0 | No |
| Excluded - Non Nursing Support Science | 1 | 46 | No |
| Excluded - Wrong Vendor ATI | 5 | 338 | No |

### Import Target

```text
Pillar: Nursing Test Bank
Parent page: RN Exams
Nested page: RN Nursing Course Exams
Nested slug: rn-nursing-course-exams
Nested page ID: zMFBI0XMiRsJnnXWhL5S
```

### Deferred Work

The only known deferred content-quality item is missing explanations:

```text
222 import questions are missing explanations.
```

This was intentionally not repaired in Phase 6 because the current workflow handles explanations later.

### Step 8 Result

The RN REGULAR cleanup documentation is now import-preparation ready.

## Step 9 - Dry Run Import

Stage 9 completed on 2026-08-20.

Created dry-run import script:

```text
scripts/import-rn-regular-test-bank-dry-run.js
```

Generated dry-run output folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR\import-dry-run
```

Generated files:

```text
rn-regular-import-dry-run-summary.json
rn-regular-import-dry-run-quizzes.csv
rn-regular-import-dry-run-topic-summary.csv
rn-regular-import-dry-run-question-issues.csv
rn-regular-import-dry-run-missing.csv
rn-regular-import-dry-run-payload-samples.json
```

### Dry Run Summary

| Metric | Count |
|---|---:|
| Preview rows | 334 |
| Manifest rows | 351 |
| Planned import rows | 334 |
| Excluded rows | 14 |
| Missing or parse-error rows | 0 |
| Duplicate quiz slugs | 0 |
| Duplicate quiz titles | 0 |
| Planned questions | 17,837 |
| Dry-run question issues | 193 |

The dry-run question issues are all:

```text
missing_explanation
```

No missing files, JSON parse errors, slug collisions, title collisions, missing question text, missing correct answers, or too-few-option errors were reported by the dry run.

### Dry Run Topic Summary

| Topic | Quizzes | Questions |
|---|---:|---:|
| Adult Health | 10 | 536 |
| Anatomy and Physiology | 18 | 1,156 |
| Community Health | 6 | 336 |
| Critical Care | 2 | 138 |
| Dimensions of Nursing Practice | 1 | 50 |
| Dosage Calculations | 17 | 694 |
| Endocrinology | 1 | 42 |
| Fundamentals | 41 | 2,240 |
| Gastrointestinal System | 3 | 82 |
| Growth and Development | 2 | 144 |
| Health Assessment | 7 | 355 |
| Leadership | 5 | 255 |
| Maternal Newborn | 25 | 1,226 |
| Medical Surgical | 78 | 4,480 |
| Mental Health | 26 | 1,564 |
| Microbiology | 3 | 124 |
| Multidimensional Care | 3 | 187 |
| Nursing Specialty | 2 | 82 |
| Nutrition | 2 | 65 |
| Pathophysiology | 18 | 825 |
| Pediatrics | 34 | 1,890 |
| Perfusion | 1 | 49 |
| Pharmacology | 29 | 1,317 |

### Step 9 Result

The RN REGULAR dry-run import plan is structurally clean.

### Global Route Slug Conflict Check

Created and ran:

```text
scripts/audit-rn-regular-route-slug-conflicts.js
```

Generated:

```text
rn-regular-route-slug-conflicts.csv
rn-regular-route-slug-conflicts-summary.json
```

Result:

| Metric | Count |
|---|---:|
| Planned topic slugs checked | 23 |
| Planned quiz slugs checked | 334 |
| Planned total slugs checked | 357 |
| Existing route mappings checked | 653 |
| Topic slug conflicts | 0 |
| Quiz slug conflicts | 0 |
| Total conflict rows | 0 |

The planned quiz slugs do not currently conflict with existing global route mappings.

## Step 10 - Final Import

Stage 10 completed on 2026-08-20.

Created final importer:

```text
scripts/import-rn-regular-test-bank.js
```

The final importer was based on the existing Nursing Test Bank import pattern, with RN REGULAR-specific target settings:

```text
Pillar: Nursing Test Bank
Parent page: RN Exams
Nested page: RN Nursing Course Exams
Parent slug: rn-exams
Nested slug: rn-nursing-course-exams
Parent ID: SuT1noZoNGEjKGR1vTbi
Nested ID: zMFBI0XMiRsJnnXWhL5S
Group slug: rn-regular
```

### Import Result

| Metric | Expected | Imported/Audited |
|---|---:|---:|
| Topics | 23 | 23 |
| Quizzes | 334 | 334 |
| Questions | 17,837 | 17,837 |
| Blocking question issues | 0 | 0 |

The first apply run exceeded the command timeout after a partial import. The importer was updated with a resume-safe `--skip-complete` mode, then rerun so complete quizzes were skipped and only missing/incomplete quizzes were written.

Final audit command:

```text
node scripts\import-rn-regular-test-bank.js --audit
```

Final audit result:

```text
expectedQuizzes: 334
actualQuizzes: 334
expectedQuestions: 17837
actualQuestions: 17837
```

### Sidebar Count Backfill

After import, the RN Nursing Course Exams nested page counts were backfilled:

```text
node scripts\backfill-sidebar-nested-question-counts.js --pillar nursing-test-bank --sub rn-exams --nested rn-nursing-course-exams --apply
```

Backfilled counts:

| Field | Count |
|---|---:|
| topicCount | 23 |
| quizCount | 334 |
| questionCount | 17,837 |

### Static Sidebar Regeneration

The static sidebar data files were regenerated:

```text
node scripts\generate-sidebar-data.js
```

Updated files:

```text
public\data\sidebar-data.json
src\lib\data\sidebar-data.ts
```

### Step 10 Result

RN REGULAR has been imported under `RN Exams > RN Nursing Course Exams` and verified against the cleaned source counts.

The remaining known deferred content item is explanations only:

```text
222 import questions are missing explanations.
```

These do not block the RN REGULAR import and remain for a later explanation pass.
