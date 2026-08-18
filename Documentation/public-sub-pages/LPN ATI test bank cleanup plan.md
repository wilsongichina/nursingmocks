# LPN ATI Test Bank Cleanup Plan

## Purpose

Clean the LPN ATI source folders before creating Nursing Test Bank topics. This follows the ATI RN cleanup workflow: preserve the original source, create clean staged files, generate manifests, and review topic names before import.

Source folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\ATI
```

Cleanup folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI
```

## Current Status

Step 1, source inventory, is complete.

Current step:

```text
Step 2 - Identify Correct Public Topic Names
```

## Step 1 Inventory Results

Inventory generated on 2026-08-18.

| Metric | Count |
|---|---:|
| Source folders | 24 |
| JSON exam files | 267 |
| Root JSON artifacts | 0 |
| JSON parse errors | 0 |

Generated files:

```text
lpn-ati-source-inventory.csv
lpn-ati-source-inventory.json
lpn-ati-source-folder-summary.csv
lpn-ati-root-json-artifacts.csv
lpn-ati-parse-errors.csv
```

## Source Folder Summary

| Source Folder | Files | Questions | Notes |
|---|---:|---:|---|
| `1 - Nursing Fundamentals` | 49 | 2507 | PN/LPN fundamentals-heavy source folder |
| `2 - Maternity` | 26 | 1373 | Includes one file with RN in title; review before import |
| `3 - Capstone Proctored Comprehensive Assessment` | 3 | 187 | Likely comprehensive/capstone topic |
| `4 - Medical Surgical` | 71 | 3604 | Largest LPN ATI source folder |
| `5 - Gastrointestinal disorders` | 0 | 0 | Empty source folder |
| `6 - Postpartum AMD Newborn Care` | 0 | 0 | Empty source folder |
| `7 - Mental Health` | 27 | 1265 | Mental health source folder |
| `8 - PN Pharmacology` | 22 | 1045 | Contains one HESI-branded file; review/exclude from ATI |
| `9 - PN Mobility` | 2 | 78 | Likely Fundamentals or Mobility/Safety mapping |
| `10 - Dosage Calculations` | 14 | 449 | Dosage calculation topic |
| `11 - Management` | 6 | 371 | Likely Management/Leadership topic |
| `12 - PN Pediatrics` | 20 | 1130 | Pediatric/Nursing Care of Children topic |
| `13 - Geriatric` | 1 | 49 | Likely Gerontology topic |
| `14 - PN Anatomy and Physiology` | 8 | 475 | A&P topic |
| `15 - Advanced Concepts` | 2 | 132 | Review destination |
| `16 - Lifespan Exams` | 2 | 103 | Review destination |
| `17 - Physical Assessment` | 1 | 46 | Likely Health Assessment topic |
| `18 - Nutrition` | 3 | 103 | Nutrition topic |
| `19 - Critical Thinking` | 1 | 50 | Review destination |
| `20 - Nurse Teachings` | 1 | 58 | Review destination |
| `21 - Microbiology` | 1 | 50 | Microbiology or science-support topic |
| `22 - Leadership` | 3 | 182 | Leadership topic |
| `23 - Obstetrics and Pediatrics` | 3 | 119 | Split/review between maternity and pediatrics |
| `24 - Medication Administration` | 1 | 40 | Medication administration/pharmacology mapping |

## Immediate Review Flags

| Source Folder | File | Reason |
|---|---|---|
| `2 - Maternity` | `20-Ati PN Maternal Newborn Rn X1 Proctored Exam.json` | LPN ATI source file contains `RN` in title; verify whether it belongs under LPN or RN before import |
| `8 - PN Pharmacology` | `5-HESI LPN phamacology proctored exam.json` | HESI-branded file found inside ATI source folder; likely exclude from ATI or move to LPN HESI cleanup |

## Working Topic-Name Questions For Step 2

Do not treat these as final public topics yet. These are the source areas that need official/public naming review:

```text
Nursing Fundamentals
Maternity
Capstone / Comprehensive Assessment
Medical Surgical
Mental Health
Pharmacology
Mobility / Safety
Dosage Calculations
Management / Leadership
Pediatrics / Nursing Care of Children
Geriatric / Gerontology
Anatomy and Physiology
Advanced Concepts
Lifespan
Physical Assessment / Health Assessment
Nutrition
Critical Thinking
Nurse Teachings
Microbiology
Obstetrics and Pediatrics
Medication Administration
```

## Next Step

Step 2 is now in progress. The table below is the initial public-topic mapping draft. It separates ATI's official PN Content Mastery Series modules from supporting product/topic areas that appear in the LPN ATI source files.

## Step 2 - Correct Public Topic Names

### Source References

ATI's official Content Mastery Series page lists these PN modules:

```text
Adult Medical Surgical
Management
Maternal Newborn
Mental Health
Pediatric Nursing, formerly Nursing Care of Children
Pharmacology
```

ATI also lists PN dosage-calculation online practice assessments by area:

```text
Dosage Calculation PN Fundamentals
Dosage Calculation PN Adult Medical Surgical
Dosage Calculation PN Maternal Newborn
Dosage Calculation PN Mental Health
Dosage Calculation PN Nursing Care of Children
```

ATI's Maternal Newborn page confirms a PN Edition for the Maternal Newborn Nursing Review Module.

### Proposed Public Topic Names

| Clean Public Topic | Type | Source Folder Signals | Initial Decision |
|---|---|---|---|
| PN Adult Medical Surgical | official_ati_pn_module | `4 - Medical Surgical`, advanced med surg files, adult med surg dosage files | Use as the main destination for medical-surgical LPN/PN content |
| PN Management | official_ati_pn_module | `11 - Management`, some leadership/management titles | Use ATI's PN module wording for Management |
| PN Maternal Newborn | official_ati_pn_module | `2 - Maternity`, OB files, maternal newborn dosage files | Use Maternal Newborn as the clean public topic |
| PN Mental Health | official_ati_pn_module | `7 - Mental Health`, psychosocial files, mental health dosage files | Use Mental Health as the clean public topic |
| PN Pediatric Nursing | official_ati_pn_module | `12 - PN Pediatrics`, nursing care of children files, pediatric dosage files | Use ATI's newer `Pediatric Nursing`; preserve `Nursing Care of Children` as alias/source metadata |
| PN Pharmacology | official_ati_pn_module | `8 - PN Pharmacology`, medication administration files | Use Pharmacology as the clean public topic; exclude HESI-branded file |
| PN Fundamentals | ati_pn_related_area | `1 - Nursing Fundamentals`, `9 - PN Mobility`, physical assessment/fundamentals files | Use as a public support topic because source inventory is large and ATI uses Fundamentals across dosage/review products |
| PN Dosage Calculations | ati_product_area | `10 - Dosage Calculations`, med math files | Use as a clean product/topic page; many files are dosage-specific across PN areas |
| PN Anatomy and Physiology | ati_product_area | `14 - PN Anatomy and Physiology` | Use as clean topic; not a PN CMS module but source files are coherent |
| PN Nutrition | ati_product_area | `18 - Nutrition` | Use as clean topic; not listed in PN CMS modules but source files are coherent |
| PN Gerontology | ati_curriculum_topic | `13 - Geriatric`, geriatric signals in med surg | Map `Geriatric` to Gerontology for cleaner public naming |
| PN Comprehensive Review | test_bank_mixed_topic | `3 - Capstone Proctored Comprehensive Assessment`, some advanced/concepts/critical thinking files | Use for capstone/comprehensive/mixed-readiness files |
| PN Health Assessment | ati_curriculum_topic | `17 - Physical Assessment`, assessment signals | Map Physical Assessment to Health Assessment |
| PN Microbiology | support_science_topic | `21 - Microbiology` | Keep as a support topic unless later merged into A&P/science |
| Review Needed | review_bucket | advanced concepts, lifespan, nurse teachings, mixed OB/pediatric files | Do not import until file-level placement is reviewed |
| Excluded - HESI | exclude | `5-HESI LPN phamacology proctored exam.json` | Move/exclude from ATI; likely belongs in LPN HESI cleanup |

### Initial Source Folder To Topic Mapping

| Source Folder | Proposed Clean Destination | Confidence | Notes |
|---|---|---|---|
| `1 - Nursing Fundamentals` | PN Fundamentals | high | Large coherent fundamentals source folder |
| `2 - Maternity` | PN Maternal Newborn | medium | Contains two Nursing Care of Children files and one title with RN; file-level review needed |
| `3 - Capstone Proctored Comprehensive Assessment` | PN Comprehensive Review | high | Capstone/comprehensive assessment source |
| `4 - Medical Surgical` | PN Adult Medical Surgical | high | Main med surg folder; file-level review for embedded geriatrics/pharm/leadership signals |
| `5 - Gastrointestinal disorders` | No import | high | Empty folder |
| `6 - Postpartum AMD Newborn Care` | No import | high | Empty folder |
| `7 - Mental Health` | PN Mental Health | high | Coherent mental health source folder |
| `8 - PN Pharmacology` | PN Pharmacology | medium | Contains one HESI-branded file to exclude/review |
| `9 - PN Mobility` | PN Fundamentals | medium | Mobility/safety is usually fundamentals-aligned |
| `10 - Dosage Calculations` | PN Dosage Calculations | high | Coherent dosage calculation source folder |
| `11 - Management` | PN Management | high | ATI PN official module name is Management |
| `12 - PN Pediatrics` | PN Pediatric Nursing | high | ATI now uses Pediatric Nursing, formerly Nursing Care of Children |
| `13 - Geriatric` | PN Gerontology | medium | Cleaner public wording than Geriatric |
| `14 - PN Anatomy and Physiology` | PN Anatomy and Physiology | high | Coherent A&P folder |
| `15 - Advanced Concepts` | PN Comprehensive Review / Review Needed | low | Requires file-level placement |
| `16 - Lifespan Exams` | Review Needed | low | Could map to Fundamentals, Pediatric Nursing, or Maternal Newborn depending content |
| `17 - Physical Assessment` | PN Health Assessment | medium | Clean public naming should be Health Assessment |
| `18 - Nutrition` | PN Nutrition | high | Coherent nutrition folder |
| `19 - Critical Thinking` | PN Comprehensive Review / Review Needed | low | Likely mixed readiness topic |
| `20 - Nurse Teachings` | Review Needed | low | Could be Fundamentals, Management, or comprehensive support |
| `21 - Microbiology` | PN Microbiology | medium | Keep as support topic unless merged later |
| `22 - Leadership` | PN Management | medium | ATI PN official module is Management; preserve Leadership as source metadata |
| `23 - Obstetrics and Pediatrics` | Review Needed | low | Likely split between Maternal Newborn and Pediatric Nursing |
| `24 - Medication Administration` | PN Pharmacology | medium | Medication administration aligns with pharmacology/safe meds |

### Step 2 Decisions To Carry Forward

- Use ATI's official PN Content Mastery module names where they exist.
- Prefer `PN Pediatric Nursing` as the public topic name, while preserving `Nursing Care of Children` as an alias because ATI states Pediatric Nursing was formerly Nursing Care of Children.
- Use `PN Management`, not `PN Leadership and Management`, for the core ATI PN module.
- Use support topics only where the source files are coherent and too large to bury under another topic, such as Fundamentals, Dosage Calculations, Anatomy and Physiology, and Nutrition.
- Do not import HESI-branded files into ATI cleanup.
- Do not force empty folders into public topics.

## Step 3 Preview

Step 3 converts the public-name draft into a formal topic mapping table with:

```text
Public Topic
Type
Description
URL Slug
H1
Meta Title
Meta Description
Best Keyword
Source Folders
Exams
Questions
Import Ready
```

## Step 3 - Topic Mapping Table

This is the first formal LPN ATI public-topic map. Counts are based on the Step 1 source inventory and the Step 2 placement draft.

| Public Topic | Type | Description | URL Slug | H1 | Meta Title | Meta Description | Best Keyword | Source Folders | Exams | Questions | Import Ready |
|---|---|---|---|---|---|---|---|---|---:|---:|---|
| PN Adult Medical Surgical | official_ati_pn_module | LPN medical-surgical practice exams are grouped here for adult care, body systems, acute conditions, and clinical judgment review. | `ati-pn-adult-medical-surgical-practice-questions` | ATI PN Adult Medical Surgical Practice Questions | ATI PN Adult Medical Surgical Questions \| NursingMocks | Practice ATI PN Adult Medical Surgical questions for med surg review, adult-care concepts, body systems, and clinical decision-making. | `ati pn adult medical surgical` | `4 - Medical Surgical` | 71 | 3604 | yes |
| PN Management | official_ati_pn_module | PN Management practice exams focus on prioritization, delegation, care coordination, safety, and practical nursing decision-making. | `ati-pn-management-practice-questions` | ATI PN Management Practice Questions | ATI PN Management Practice Questions \| NursingMocks | Review ATI PN Management practice questions for delegation, prioritization, care coordination, safety, and nursing leadership decisions. | `ati pn management proctored exam` | `11 - Management`<br>`22 - Leadership` | 9 | 553 | yes |
| PN Maternal Newborn | official_ati_pn_module | Maternal Newborn practice exams cover pregnancy, labor, postpartum care, newborn care, OB topics, and practical nursing review. | `ati-pn-maternal-newborn-practice-questions` | ATI PN Maternal Newborn Practice Questions | ATI PN Maternal Newborn Questions \| NursingMocks | Practice ATI PN Maternal Newborn questions for maternity, OB, postpartum care, newborn care, and practical nursing exam review. | `ati pn maternal newborn proctored exam` | `2 - Maternity` | 24 | 1244 | review_first |
| PN Mental Health | official_ati_pn_module | Mental Health practice exams are organized for psychiatric nursing, therapeutic communication, safety, crisis care, and psychosocial review. | `ati-pn-mental-health-practice-questions` | ATI PN Mental Health Practice Questions | ATI PN Mental Health Practice Questions \| NursingMocks | Study ATI PN Mental Health practice questions on psychiatric nursing, therapeutic communication, psychosocial care, and safety. | `ati pn mental health proctored exam` | `7 - Mental Health` | 27 | 1265 | yes |
| PN Pediatric Nursing | official_ati_pn_module | Pediatric Nursing practice exams collect PN child-health questions, growth and development review, family teaching, and child safety topics. | `ati-pn-pediatric-nursing-practice-questions` | ATI PN Pediatric Nursing Practice Questions | ATI PN Pediatric Nursing Questions \| NursingMocks | Practice ATI PN Pediatric Nursing questions for child health, growth and development, family teaching, safety, and pediatric care. | `ati pn pediatric nursing` | `12 - PN Pediatrics`<br>`2 - Maternity` child-care files | 22 | 1259 | review_first |
| PN Pharmacology | official_ati_pn_module | Pharmacology practice exams focus on medication classes, administration safety, adverse effects, client teaching, and PN medication review. | `ati-pn-pharmacology-practice-questions` | ATI PN Pharmacology Practice Questions | ATI PN Pharmacology Practice Questions \| NursingMocks | Review ATI PN Pharmacology practice questions on medication safety, drug classes, adverse effects, administration, and client teaching. | `ati pn pharmacology proctored exam` | `8 - PN Pharmacology`<br>`24 - Medication Administration` | 22 | 1039 | review_first |
| PN Fundamentals | ati_pn_related_area | Fundamentals practice exams cover basic nursing care, safety, mobility, infection control, nursing process, and foundational PN skills. | `ati-pn-fundamentals-practice-questions` | ATI PN Fundamentals Practice Questions | ATI PN Fundamentals Practice Questions \| NursingMocks | Practice ATI PN Fundamentals questions for basic nursing care, safety, mobility, infection control, nursing process, and skills review. | `ati pn fundamentals proctored exam` | `1 - Nursing Fundamentals`<br>`9 - PN Mobility` | 51 | 2585 | yes |
| PN Dosage Calculations | ati_product_area | Dosage Calculation practice exams are grouped for med math, safe medication administration, calculation methods, and PN assessment review. | `ati-pn-dosage-calculations-practice-questions` | ATI PN Dosage Calculations Practice Questions | ATI PN Dosage Calculation Questions \| NursingMocks | Practice ATI PN dosage calculation questions for medication math, safe administration, conversions, and content-area assessments. | `ati pn dosage calculation` | `10 - Dosage Calculations` | 14 | 449 | yes |
| PN Anatomy and Physiology | ati_product_area | Anatomy and Physiology practice exams support body-system review, normal function, terminology, and practical nursing science foundations. | `ati-pn-anatomy-and-physiology-practice-questions` | ATI PN Anatomy and Physiology Practice Questions | ATI PN Anatomy and Physiology Questions \| NursingMocks | Review ATI PN anatomy and physiology questions for body systems, normal function, terminology, and nursing science foundations. | `ati pn anatomy and physiology` | `14 - PN Anatomy and Physiology` | 8 | 475 | yes |
| PN Nutrition | ati_product_area | Nutrition practice exams focus on diet therapy, nutrient needs, client teaching, enteral support, and nutrition-related nursing care. | `ati-pn-nutrition-practice-questions` | ATI PN Nutrition Practice Questions | ATI PN Nutrition Practice Questions \| NursingMocks | Practice ATI PN Nutrition questions covering diet therapy, nutrients, client teaching, enteral support, and nursing care planning. | `ati pn nutrition` | `18 - Nutrition` | 3 | 103 | yes |
| PN Gerontology | ati_curriculum_topic | Gerontology review covers older-adult care, aging changes, chronic conditions, safety, medication concerns, and practical nursing support. | `ati-pn-gerontology-practice-questions` | ATI PN Gerontology Practice Questions | ATI PN Gerontology Practice Questions \| NursingMocks | Review ATI PN Gerontology questions for older-adult assessment, chronic care, medication concerns, safety, and nursing support. | `ati pn gerontology` | `13 - Geriatric` | 1 | 49 | yes |
| PN Comprehensive Review | test_bank_mixed_topic | Comprehensive Review groups capstone and mixed-readiness practice exams for broad PN review, clinical judgment, and final preparation. | `ati-pn-comprehensive-review-practice-questions` | ATI PN Comprehensive Review Practice Questions | ATI PN Comprehensive Review Questions \| NursingMocks | Prepare with ATI PN comprehensive review questions for mixed nursing content, capstone practice, readiness checks, and clinical judgment. | `ati pn comprehensive predictor` | `3 - Capstone Proctored Comprehensive Assessment` | 3 | 187 | yes |
| PN Health Assessment | ati_curriculum_topic | Health Assessment practice questions support focused assessment, physical findings, documentation, and practical nursing observation skills. | `ati-pn-health-assessment-practice-questions` | ATI PN Health Assessment Practice Questions | ATI PN Health Assessment Questions \| NursingMocks | Practice ATI PN Health Assessment questions on focused assessment, physical findings, documentation, and observation skills. | `ati pn health assessment` | `17 - Physical Assessment` | 1 | 46 | yes |
| PN Microbiology | support_science_topic | Microbiology practice questions support infection, organisms, transmission, prevention, and science concepts used in practical nursing. | `ati-pn-microbiology-practice-questions` | ATI PN Microbiology Practice Questions | ATI PN Microbiology Practice Questions \| NursingMocks | Review ATI PN Microbiology questions for infection, organisms, transmission, prevention, and nursing science foundations. | `ati pn microbiology` | `21 - Microbiology` | 1 | 50 | review_first |
| Review Needed | review_bucket | These source files need manual placement before import because the folder names are mixed, broad, or not clearly public-topic aligned. | `review-needed` | Review Needed | Review Needed | Review these LPN ATI source files before creating public pages or importing quizzes. | n/a | `15 - Advanced Concepts`<br>`16 - Lifespan Exams`<br>`19 - Critical Thinking`<br>`20 - Nurse Teachings`<br>`23 - Obstetrics and Pediatrics` | 9 | 462 | no |
| Excluded - HESI | exclude | HESI-branded source file found inside the LPN ATI source tree. It should not be imported into ATI. | `excluded-hesi` | Excluded - HESI | Excluded - HESI | HESI-branded file found in ATI source; move to HESI review or exclude from ATI import. | n/a | `8 - PN Pharmacology` | 1 | 46 | no |

### Step 3 Notes

- `PN Adult Medical Surgical`, `PN Management`, `PN Maternal Newborn`, `PN Mental Health`, `PN Pediatric Nursing`, and `PN Pharmacology` are based on ATI's official PN Content Mastery Series module names.
- `PN Pediatric Nursing` is preferred because ATI lists it as the current wording, with `Nursing Care of Children` as the former name.
- `PN Dosage Calculations` is supported by ATI's PN dosage-calculation assessment product structure.
- `PN Fundamentals`, `PN Anatomy and Physiology`, `PN Nutrition`, `PN Gerontology`, `PN Health Assessment`, and `PN Microbiology` are support/topic pages based on coherent source inventory rather than the PN Content Mastery module list.
- `Review Needed` is intentionally not import-ready.
- `Excluded - HESI` is intentionally not import-ready.

## Step 4 Preview

Step 4 converts the topic map into explicit folder/file placement rules for the staging script.

## Step 4 - Folder/File Placement Rules

Placement script:

```text
scripts/stage-lpn-ati-cleanup.ps1
```

The script copies files from the original source into the cleanup folder and generates manifest/summary files. It does not move or delete the original source files.

### Placement Actions

| Action | Meaning |
|---|---|
| `import` | File is staged into a clean destination topic and can proceed if no later duplicate/name issue appears |
| `review` | File is copied into a review destination but should not be imported until manually checked |
| `exclude` | File is intentionally excluded from ATI import |
| `empty` | Source folder has no JSON files |

### Explicit Folder/File Rules

| Source Rule | Destination | Action | Notes |
|---|---|---|---|
| HESI appears in file name or source subtopic | Excluded - HESI | exclude | HESI-branded file should not import as ATI |
| `1 - Nursing Fundamentals` | PN Fundamentals | import | Core fundamentals source |
| `2 - Maternity` | PN Maternal Newborn | import | Default maternity/OB placement |
| `2 - Maternity` with Nursing Care of Children/Pediatric signal | PN Pediatric Nursing | review | Child-care file inside Maternity; verify before import |
| `2 - Maternity` with RN signal | Review Needed | review | LPN source file contains RN in title |
| `3 - Capstone Proctored Comprehensive Assessment` | PN Comprehensive Review | import | Capstone/comprehensive source |
| `4 - Medical Surgical` | PN Adult Medical Surgical | import | Default med surg placement |
| `4 - Medical Surgical` with Leadership/Management signal | PN Adult Medical Surgical | review | Keep staged under med surg until content review |
| `4 - Medical Surgical` with Pharm/Medication signal | PN Adult Medical Surgical | review | Keep staged under med surg with possible secondary pharmacology metadata |
| `4 - Medical Surgical` with Geriatric/Gerontology signal | PN Adult Medical Surgical | review | Keep staged under med surg until content review |
| `5 - Gastrointestinal disorders` | No Import - Empty Source Folder | empty | No JSON files in inventory |
| `6 - Postpartum AMD Newborn Care` | No Import - Empty Source Folder | empty | No JSON files in inventory |
| `7 - Mental Health` | PN Mental Health | import | Core mental health source |
| `8 - PN Pharmacology` | PN Pharmacology | import | Default pharmacology placement, except HESI file |
| `9 - PN Mobility` | PN Fundamentals | import | Mobility/safety mapped to fundamentals |
| `10 - Dosage Calculations` | PN Dosage Calculations | import | Dosage/med math source |
| `11 - Management` | PN Management | import | ATI PN official module name |
| `12 - PN Pediatrics` | PN Pediatric Nursing | import | ATI current wording is Pediatric Nursing |
| `13 - Geriatric` | PN Gerontology | import | Cleaner public wording |
| `14 - PN Anatomy and Physiology` | PN Anatomy and Physiology | import | Coherent A&P source |
| `15 - Advanced Concepts` | Review Needed | review | Requires file-level placement |
| `16 - Lifespan Exams` | Review Needed | review | Could map to several topics depending content |
| `17 - Physical Assessment` | PN Health Assessment | import | Physical Assessment mapped to Health Assessment |
| `18 - Nutrition` | PN Nutrition | import | Coherent nutrition source |
| `19 - Critical Thinking` | Review Needed | review | Likely comprehensive review but needs validation |
| `20 - Nurse Teachings` | Review Needed | review | Needs placement review |
| `21 - Microbiology` | PN Microbiology | review | Support science topic; review before public import |
| `22 - Leadership` | PN Management | import | Leadership source mapped to ATI PN Management |
| `23 - Obstetrics and Pediatrics` | Review Needed | review | Combined OB/pediatric source needs split review |
| `24 - Medication Administration` | PN Pharmacology | import | Medication administration maps to Pharmacology |
| unmatched folder/file | Review Needed | review | Safety fallback |

### Expected Generated Files

When Step 5 runs the staging script, it should create:

```text
lpn-ati-cleanup-manifest.csv
lpn-ati-cleanup-manifest.json
lpn-ati-cleanup-summary.csv
lpn-ati-root-json-artifacts.csv
```

## Step 5 Preview

Step 5 runs the LPN ATI staging script and verifies the generated clean folders and summary counts.

## Step 5 - Staging Run Results

Staging completed on 2026-08-18.

Command:

```powershell
.\scripts\stage-lpn-ati-cleanup.ps1 -SourceRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\ATI" -DestinationRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI"
```

Generated files:

```text
lpn-ati-cleanup-manifest.csv
lpn-ati-cleanup-manifest.json
lpn-ati-cleanup-summary.csv
lpn-ati-root-json-artifacts.csv
```

### Staging Totals

| Metric | Count |
|---|---:|
| Source folders scanned | 24 |
| Staged JSON files | 267 |
| Root JSON artifacts | 0 |
| Import rows | 260 |
| Review rows | 0 |
| Excluded rows | 1 |

### Staged Folder Counts

| Clean Folder | JSON Files |
|---|---:|
| Excluded - HESI | 1 |
| PN Adult Medical Surgical | 68 |
| PN Anatomy and Physiology | 8 |
| PN Comprehensive Review | 3 |
| PN Dosage Calculations | 14 |
| PN Fundamentals | 55 |
| PN Gerontology | 2 |
| PN Health Assessment | 1 |
| PN Management | 10 |
| PN Maternal Newborn | 27 |
| PN Mental Health | 27 |
| PN Microbiology | 1 |
| PN Nutrition | 3 |
| PN Pediatric Nursing | 23 |
| PN Pharmacology | 23 |
| Review Needed | 0 |

### Summary By Action

| Destination Topic | Action | Exams | Questions |
|---|---|---:|---:|
| Excluded - HESI | exclude | 1 | 46 |
| PN Adult Medical Surgical | import | 68 | 3455 |
| PN Anatomy and Physiology | import | 8 | 475 |
| PN Comprehensive Review | import | 4 | 237 |
| PN Dosage Calculations | import | 14 | 449 |
| PN Fundamentals | import | 55 | 2827 |
| PN Gerontology | import | 2 | 99 |
| PN Health Assessment | import | 1 | 46 |
| PN Management | import | 10 | 604 |
| PN Maternal Newborn | import | 27 | 1363 |
| PN Mental Health | import | 27 | 1265 |
| PN Nutrition | import | 3 | 103 |
| PN Pediatric Nursing | import | 23 | 1310 |
| PN Pharmacology | import | 23 | 1087 |
| PN Microbiology | import | 1 | 50 |

## Step 6 - Duplicate Audit Results

Duplicate audit completed on 2026-08-18.

Command:

```powershell
.\scripts\audit-nursing-test-bank-cleanup-duplicates.ps1 -CleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI" -ManifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\lpn-ati-cleanup-manifest.csv" -GroupSlug "lpn-ati"
```

Generated files:

```text
lpn-ati-duplicate-audit-rows.csv
lpn-ati-exact-content-duplicates.csv
lpn-ati-clean-name-duplicates.csv
lpn-ati-question-signature-duplicates.csv
lpn-ati-duplicate-audit-summary.csv
```

### Duplicate Audit Summary

| Metric | Count |
|---|---:|
| Audited rows | 266 |
| Exact content duplicate groups | 0 |
| Exact duplicate files | 0 |
| Clean-name duplicate groups | 24 |
| Clean-name duplicate files | 110 |
| Question-signature duplicate groups | 0 |
| Question-signature duplicate files | 0 |

### Interpretation

The audit did not find exact file-content duplicates and did not find matching question-signature duplicates among import/review files.

The 24 clean-name duplicate groups are normalized-name collisions. Example: multiple files normalize to names such as `fundamentals`, `management`, or `paediatrics`, but they have different file hashes and different question signatures. These should be reviewed for public naming and import labeling, not deleted as duplicate content without manual review.

### Current Decision

Do not remove any staged LPN ATI files based only on the clean-name duplicate audit. Use `lpn-ati-clean-name-duplicates.csv` as a review file when generating final quiz/public names.

## Step 7 Preview

The next step is to generate normalized public names and a simple review CSV for the 16 review rows plus the 110 clean-name collision rows.

## Step 7 - Normalized Public Name Preview

Normalized-name preview completed on 2026-08-18.

Command:

```powershell
.\scripts\preview-nursing-test-bank-normalized-names.ps1 -CleanupRoot "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI" -ManifestPath "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\lpn-ati-cleanup-manifest.csv" -GroupSlug "lpn-ati" -Vendor "ATI" -Program "LPN" -PublicProgramLabel "PN"
```

Generated files:

```text
lpn-ati-normalized-name-preview.csv
lpn-ati-normalized-name-review.csv
lpn-ati-normalized-name-review-simple.csv
lpn-ati-normalized-name-summary.csv
```

### Naming Preview Summary

| Metric | Count |
|---|---:|
| Preview rows | 266 |
| Unique public quiz titles | 266 |
| Unique slugs | 266 |
| Rows requiring review | 110 |
| Manifest review rows represented | 0 |
| Clean-name collision rows represented | 110 |

The review count is `110` after all manifest `action=review` rows were resolved. The remaining review rows are clean-name collisions only, and they use the explicit `Set {sourceFileNumber}` suffix.

### Public Naming Rule Used

For this LPN ATI batch, public quiz names use ATI's PN-facing wording:

```text
ATI PN {Cleaned Source Exam Title} Practice Questions
```

For every clean-name collision row, append the source file number:

```text
ATI PN {Cleaned Source Exam Title} Practice Questions - Set {sourceFileNumber}
```

Examples:

| Source File | Public Quiz Title |
|---|---|
| `10-Ati pn fundamentals 2023 proctored exam.json` | `ATI PN Fundamentals 2023 Proctored Exam Practice Questions - Set 10` |
| `12-Ati lpn fundamentals proctored exam.json` | `ATI PN Fundamentals Proctored Exam Practice Questions - Set 12` |
| `20-Ati lpn critical thinking proctored exam.json` | `ATI PN Critical Thinking Proctored Exam Practice Questions - Set 20` |

The source metadata still preserves the original LPN/PN wording through `sourceFileName`, `sourceFolder`, `sourceSubtopic`, `sourceSubtopicSlug`, and `sourceTopicId`.

### Review File Purpose

Use `lpn-ati-normalized-name-review-simple.csv` for manual review. It focuses on:

- rows staged with `action=review`,
- rows placed in `Review Needed`,
- rows that collided after clean-name normalization.

No exam JSON files were renamed by this step. This is a naming/import preview only.

## Step 8 - Review Needed Placement Decisions

The `Review Needed` folder was resolved on 2026-08-18. The 10 files were moved into final topic folders and the staging script was updated so the same decisions are reproducible.

| Source File | Final Topic | Reason |
|---|---|---|
| `1-Ati lpn concepts of nursing proctored exam.json` | `PN Fundamentals` | Broad concepts file; content scan leaned Fundamentals. |
| `2-Ati Lpn Advanced Concept Quiz Proctored Exam.json` | `PN Fundamentals` | Broad advanced-concepts file; content scan leaned Fundamentals. |
| `1-Ati nur 213 lifespan Proctored final exam.json` | `PN Fundamentals` | Lifespan final mapped to Fundamentals. |
| `2-ATI PN Custom Lifespan Proctored Exam 1 2023.json` | `PN Pediatric Nursing` | Lifespan file had pediatric/developmental content signals. |
| `1-Ati pn critical thinking proctored exam.json` | `PN Comprehensive Review` | Critical Thinking mapped to Comprehensive Review. |
| `20-Ati PN Maternal Newborn Rn X1 Proctored Exam.json` | `PN Maternal Newborn` | Filename contains `RN`, but source folder and content scan strongly matched Maternal Newborn. |
| `1-Ati lpn nurse teaching proctored exam.json` | `PN Fundamentals` | Nurse teaching mapped to Fundamentals. |
| `1-Ati lpn OBSTETRICS nursing proctored exam.json` | `PN Maternal Newborn` | Obstetrics/OB content. |
| `2-Ati lpn obstetrics OB nursing cohort proctored exam Total Questions_ 35.json` | `PN Maternal Newborn` | Obstetrics/OB content. |
| `3-Ati lpn OBSTETRICS nursing proctored exam.json` | `PN Maternal Newborn` | Obstetrics/OB content. |

After these moves:

| Metric | Count |
|---|---:|
| JSON files remaining in `Review Needed` | 0 |
| Import rows after regenerated manifest | 260 |
| Review rows after regenerated manifest | 0 |
| Excluded rows | 1 |
| Normalized-name review rows after regeneration | 110 |

## Step 9 Preview

The next step is to review the clean-name collision rows before preparing an import script.

## Step 9 - Content-Based Review Decisions

The remaining 6 manifest-review rows were inspected using actual question content, not filenames alone. Keyword counts and question stems were reviewed for each file.

| Source File | Previous Destination | Final Topic | Content Evidence |
|---|---|---|---|
| `22-ATI PN Nursing Care of Children 2020 with NGN II Proctored Exam.json` | `PN Pediatric Nursing` | `PN Pediatric Nursing` | Child, toddler, infant, school-age, adolescent, developmental, and pediatric clinical stems dominated the file. |
| `23-ATI PN Nursing Care of Children with NGN 2020 Proctored Exam.json` | `PN Pediatric Nursing` | `PN Pediatric Nursing` | Pediatric care stems dominated: infant suctioning, school-age monitoring, preschool postoperative care, adolescent sickle-cell care. |
| `1-Ati lpn microbiology proctored exam.json` | `PN Microbiology` | `PN Microbiology` | Content centered on isolation, PPE, disinfection, sterilization, hepatitis, chicken pox, hand hygiene, bacteria, and infection control. |
| `17-Ati lpn med surg( geriatrics) proctored exam.json` | `PN Adult Medical Surgical` | `PN Gerontology` | Strong gerontology signal: older adult care, presbycusis, age-related changes, respiratory infection risk, Erikson older-adult stage. |
| `29-Ati lpn med surg pharm competence proctored exam.json` | `PN Adult Medical Surgical` | `PN Pharmacology` | Strong pharmacology/dosage signal: medication administration, IV rate, tablets per dose, insulin, naproxen, opioids, nicotine patch, baclofen. |
| `70-ATI PN Medical Surgical Leadership Proctored Exam.json` | `PN Adult Medical Surgical` | `PN Management` | Strong leadership/management signal: delegation, AP assignment, incident reports, malpractice, negligence, LPN role/scope, conflict handling. |

After this pass:

| Metric | Count |
|---|---:|
| Manifest import rows | 266 |
| Manifest review rows | 0 |
| Excluded rows | 1 |
| Exact duplicate groups | 0 |
| Question-signature duplicate groups | 0 |
| Clean-name collision rows needing naming sanity check | 110 |

## Step 10 - Final Title Normalization Cleanup

Final naming cleanup completed on 2026-08-18.

Fixes applied:

- Removed public-title `RN` leakage from the PN batch.
- Converted the awkward `PN X1` wording to `X1`.
- Preserved source metadata so the original filename still shows the source contained `Rn X1`.
- Normalized small-word casing in public titles, such as `of`, `with`, and `and`.
- Preserved common source/course acronyms such as `NS117`, `NS122`, `NY`, `FA25`, `NGN`, and `SP`.

Example fixed row:

| Source File | Final Public Title |
|---|---|
| `20-Ati PN Maternal Newborn Rn X1 Proctored Exam.json` | `ATI PN Maternal Newborn X1 Proctored Exam Practice Questions` |

Final validation:

| Check | Result |
|---|---:|
| Manifest import rows | 266 |
| Manifest review rows | 0 |
| Excluded rows | 1 |
| Duplicate public quiz titles | 0 |
| Duplicate slugs | 0 |
| Public titles containing `RN` or `LPN` | 0 |
| Clean-name collision rows using `Set {sourceFileNumber}` | 110 |

## Step 11 - Import Dry Run

Import dry-run script created and executed on 2026-08-18.

Script:

```text
scripts/import-lpn-ati-test-bank-dry-run.js
```

Command:

```powershell
node scripts\import-lpn-ati-test-bank-dry-run.js
```

Generated reports:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-import-dry-run-summary.json
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-import-dry-run-quizzes.csv
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-import-dry-run-topic-summary.csv
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-import-dry-run-question-issues.csv
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-import-dry-run-missing.csv
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-import-dry-run-payload-samples.json
```

### Dry-Run Summary

| Check | Result |
|---|---:|
| Preview rows | 266 |
| Manifest rows | 267 |
| Planned import rows | 266 |
| Excluded rows | 1 |
| Missing or parse-error rows | 0 |
| Duplicate slugs | 0 |
| Duplicate public titles | 0 |
| Total planned questions | 13,370 |
| Question issue rows | 22 |

### Topic Import Summary

| Topic | Quizzes | Questions |
|---|---:|---:|
| PN Adult Medical Surgical | 68 | 3,455 |
| PN Anatomy and Physiology | 8 | 475 |
| PN Comprehensive Review | 4 | 237 |
| PN Dosage Calculations | 14 | 449 |
| PN Fundamentals | 55 | 2,827 |
| PN Gerontology | 2 | 99 |
| PN Health Assessment | 1 | 46 |
| PN Management | 10 | 604 |
| PN Maternal Newborn | 27 | 1,363 |
| PN Mental Health | 27 | 1,265 |
| PN Microbiology | 1 | 50 |
| PN Nutrition | 3 | 103 |
| PN Pediatric Nursing | 23 | 1,310 |
| PN Pharmacology | 23 | 1,087 |

### Question Issues Before Real Import

The initial dry run found `25` question-shape issues:

- `23` missing-explanation rows.
- `1` missing question text row.
- `1` row with too few parsed options.

The two blocking non-explanation issues were repaired in the staged cleanup files.

Repairs:

| Source File | Issue | Note |
|---|---|---|
| `50-ATI PN Adult Medical Surgical 2023 Proctored Exam.json` | Missing question text | Restored question text for source question `50705` from the existing source rationale text. |
| `21-ATI PN Medical Surgical Proctored Exam 2023.json` | Too few parsed options | Restored four answer choices for source question `59246304`; matching wording was verified from public search results and aligned with the existing solution rationale. |

Repair script:

```text
scripts/repair-lpn-ati-blocking-question-issues.js
```

After rerunning the dry run:

| Check | Result |
|---|---:|
| Question issue rows | 22 |
| Missing question text rows | 0 |
| Empty/too-few option rows | 0 |
| Remaining issue type | Missing explanations only |

The `22` missing-explanation rows were accepted for now. Explanations will be repaired in a later pass.

## Step 12 - Real Firestore Import

Status: completed on 2026-08-18.

Importer:

```text
scripts/import-lpn-ati-test-bank.js
```

The importer writes to the existing Nursing Test Bank hierarchy:

```text
pillarPages/nursing-test-bank
  /subPages/z0xzINtS3EohZNaKosBz
  /nestedSubPages/lyrHg4RBzN6UafuymMFT
  /topics/{topicId}
  /quizzes/{quizId}
  /questions/{questionId}
```

Existing page targets:

| Page | Slug | Document ID |
|---|---|---|
| LPN Exams | `lpn-exams` | `z0xzINtS3EohZNaKosBz` |
| ATI LPN Exams | `ati-lpn-exams` | `lyrHg4RBzN6UafuymMFT` |

Import behavior:

- Created or updated the 14 ATI PN topic pages under ATI LPN Exams.
- Created or updated quiz route mappings.
- Imported quiz documents under their destination topic pages.
- Imported question documents under each quiz.
- Skipped already-complete quizzes during resume by comparing existing question count with expected source question count.
- Kept the `22` missing-explanation rows as non-blocking issues.

The first full apply run timed out before completion. The importer was then made resumable and rerun. Completed quizzes were skipped, and only missing/incomplete quizzes were written.

Final verified Firestore audit:

| Check | Expected | Actual |
|---|---:|---:|
| Topics | 14 | 14 |
| Quizzes | 266 | 266 |
| Questions | 13,370 | 13,370 |
| Blocking question issues | 0 | 0 |
| Missing explanations | 22 | 22 |

Final nested page count update:

| Nested Page | Topic Count | Quiz Count | Question Count |
|---|---:|---:|---:|
| ATI LPN Exams | 14 | 266 | 13,370 |

Generated summary files:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-real-import-dry-run-summary.json
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\import-dry-run\lpn-ati-real-import-apply-summary.json
```

Post-import maintenance completed:

- Optimized `scripts/backfill-sidebar-nested-question-counts.js` to use Firestore aggregate counts instead of downloading every question document.
- Added targeted backfill filters: `--pillar`, `--sub`, and `--nested`.
- Ran the targeted count backfill for `nursing-test-bank / lpn-exams / ati-lpn-exams`.
- Regenerated `public/data/sidebar-data.json`.
- Regenerated `src/lib/data/sidebar-data.ts`.

## Step 13 - Topic Display Name Normalization

Status: completed on 2026-08-18.

Updated ATI LPN topic display names to match the ATI RN topic-selector convention.

Public topic-card names are now concise subject names:

- Adult Medical Surgical
- Anatomy and Physiology
- Comprehensive Review
- Dosage Calculations
- Fundamentals
- Gerontology
- Health Assessment
- Management
- Maternal Newborn
- Mental Health
- Microbiology
- Nutrition
- Pediatric Nursing
- Pharmacology

Normalization rule:

- Topic display fields should not include `ATI PN`, `ATI LPN`, or `Practice Questions`.
- SEO slugs, quiz titles, meta titles, descriptions, source filenames, and route mappings can still include ATI/PN/practice-question language where useful.
- This mirrors ATI RN, where the topic card displays `Fundamentals` while the route can remain `ati-fundamentals-proctored-exam-practice-questions`.

Updated Firestore fields on all 14 ATI LPN topic documents:

- `pageName`
- `title`
- `heading`
- `seoLabel`
- `hero.title`
- `sourceMetadata.officialName`

Also renamed the staged cleanup folders under:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI
```

from `PN ...` names to concise RN-style names, such as `Fundamentals`, `Maternal Newborn`, and `Pharmacology`.

Scripts updated for the new naming convention:

- `scripts/stage-lpn-ati-cleanup.ps1`
- `scripts/apply-lpn-ati-review-placements.ps1`
- `scripts/repair-lpn-ati-blocking-question-issues.js`
- `scripts/import-lpn-ati-test-bank-dry-run.js`
- `scripts/import-lpn-ati-test-bank.js`
- `scripts/normalize-lpn-ati-topic-display-names.js`
