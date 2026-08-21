# ATI RN Test Bank Cleanup Plan

## Purpose

Clean the ATI RN source folders before creating Nursing Test Bank topics so public navigation uses clear ATI-aligned topics while preserving the original Naxlex folder and file sources for traceability.

Source folder:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI
```

Local planning pages:

- [ATI RN Topic Mapping Plan](ATI RN topic mapping plan.html)
- [ATI RN Pharmacology Exam Mapping](ATI RN Pharmacology exam mapping.html)
- [ATI RN Pharmacology Content Audit](ATI RN Pharmacology content audit.html)
- [ATI RN Pharmacology Keyword Alternatives](ATI RN Pharmacology alternative keywords seranking.html)

## Public Page Model

- ATI RN belongs under Nursing Test Bank.
- Nursing Test Bank is topic-driven, not practice-set-driven at the subject-card level.
- Public topic cards should send users to topics with `View Topics`.
- Source folders are not automatically public topics.
- Original source folder/file names must be preserved as metadata on imported quizzes and questions.

## Confirmed ATI Content Areas And Topics

Use this table as the working source of truth for ATI RN public topic pages. Each row defines the public description, URL, page name, H1, meta details, source folders, and import readiness before any Firestore topic or quiz import happens.

| Public Topic | Type | Description | URL Slug | H1 | Meta Title | Meta Description | Best Keyword | Source Folders | Exams | Questions | Import Ready |
|---|---|---|---|---|---|---|---|---|---:|---:|---|
| [Pharmacology](ATI RN Pharmacology exam mapping.html) | official_ati_module | This page focuses on ATI Pharmacology practice exams and test bank questions for medication safety, drug classes, dosage decisions, and nursing interventions. | `ati-pharmacology-proctored-exam-practice-questions` | ATI Pharmacology Proctored Exam Practice Questions | ATI Pharmacology Proctored Exam Questions \| NursingMocks | Practice ATI Pharmacology Proctored Exam questions with rationales for drug classes, adverse effects, safe dosing, and nursing interventions. | `ati pharmacology proctored exam` (160/mo) | 1 - Pharmacology | 78 | 4163 | yes |
| Adult Medical Surgical | official_ati_module | Use the Med Surg page to find ATI practice exams and test bank questions organized around adult care, body systems, procedures, and safety. | `ati-med-surg-proctored-exam-practice-questions` | ATI Med Surg Proctored Exam Practice Questions | ATI Med Surg Proctored Exam Questions \| NursingMocks | Review ATI Med Surg Proctored Exam questions with rationales for adult care, body systems, chronic conditions, procedures, and safety. | `ati med surg proctored exam` (590/mo) | 2 - Medical-Surgical<br>15 - Adult Health<br>28 -Advanced Concepts<br>34 - Critical Care | 243 | 13110 | review_first |
| Fundamentals | official_ati_module | The Fundamentals topic brings together ATI practice tests for nursing basics, infection control, mobility, documentation, and bedside care. | `ati-fundamentals-proctored-exam-practice-questions` | ATI Fundamentals Proctored Exam Practice Questions | ATI Fundamentals Proctored Questions \| NursingMocks | Study ATI Fundamentals Proctored Exam questions with rationales on nursing basics, safety, infection control, mobility, and documentation. | `ati fundamentals proctored exam` (190/mo) | 3 - Fundamentals<br>14 - Foundations of Nursing<br>24 - Mobility Safety<br>31 - Health concepts | 99 | 5074 | review_first |
| Maternal Newborn | official_ati_module | Maternal Newborn practice exams on this page cover pregnancy, labor, postpartum care, newborn assessment, and reproductive health review. | `ati-maternal-newborn-test-bank-practice-questions` | ATI Maternal Newborn Test Bank Practice Questions | ATI Maternal Newborn Test Bank Questions \| NursingMocks | Practice ATI Maternal Newborn test bank questions with rationales for pregnancy, labor, postpartum care, newborn assessment, and reproductive health. | `ati maternal newborn test bank` (30/mo) | 4 - Maternal-Newborn<br>26 - Reproductive Health<br>6 - Obstetrics and Pediatrics | 178 | 9445 | review_first |
| Mental Health | official_ati_module | For Mental Health, this page centers ATI practice tests on psychiatric care, therapeutic communication, medication safety, and crisis support. | `ati-mental-health-proctored-exam-practice-questions` | ATI Mental Health Proctored Exam Practice Questions | ATI Mental Health Practice Questions \| NursingMocks | Prepare with ATI Mental Health Proctored Exam questions covering therapeutic communication, psychiatric care, medications, and safety. | `ati mental health proctored exam` (590/mo) | 10 - Mental Health<br>18 - Psychology | 66 | 3478 | yes |
| Community Health | official_ati_module | Community Health review here is built around ATI practice exams for prevention, epidemiology, home care, teaching, and population nursing. | `ati-community-health-test-bank-practice-questions` | ATI Community Health Test Bank Practice Questions | ATI Community Health Test Bank Questions \| NursingMocks | Use ATI Community Health test bank questions to review public health, prevention, epidemiology, home care, teaching, and population nursing. | `ati community health test bank` (10/mo) | 8 - Community Health | 18 | 987 | yes |
| Leadership and Management | official_ati_module | This Leadership page organizes ATI practice exams around delegation, prioritization, ethics, quality improvement, and care coordination. | `ati-leadership-proctored-exam-practice-questions` | ATI Leadership Proctored Exam Practice Questions | ATI Leadership Proctored Questions \| NursingMocks | Practice ATI Leadership Proctored Exam questions with rationales on delegation, prioritization, ethics, quality improvement, and coordination. | `ati leadership proctored exam` (140/mo) | 17 - Leadership | 24 | 1417 | yes |
| Nutrition | official_ati_module | Nutrition practice tests here help students review diet therapy, nutrients, client teaching, enteral nutrition, and nursing care planning. | `ati-nutrition-practice-questions` | ATI Nutrition Practice Questions | ATI Nutrition Practice Questions \| NursingMocks | Review ATI Nutrition practice questions with rationales covering diet therapy, nutrients, client teaching, enteral nutrition, and nursing care. | `ati nutrition practice questions` (10/mo) | 16 - Nutrition | 9 | 479 | yes |
| Nursing Care of Children | official_ati_module | The Nursing Care of Children page gathers ATI practice exams for pediatric growth, development, safety, family teaching, and child health. | `ati-rn-nursing-care-of-children-practice-questions` | ATI RN Nursing Care of Children Practice Questions | ATI Nursing Care of Children Questions \| NursingMocks | Study ATI Nursing Care of Children questions with rationales on pediatric growth, development, family teaching, safety, and child health. | `ati nursing care of children proctored exam` (0/mo) | 22 - Nursing Care of Children<br>6 - Obstetrics and Pediatrics<br>21 - Growth and Development<br>9 - Lifespan Development | 84 | 4392 | review_first |
| Anatomy and Physiology | ati_product_area | Anatomy and Physiology practice questions on this page support body-system review, normal function, foundational science, and physiology. | `ati-rn-anatomy-and-physiology-practice-questions` | ATI RN Anatomy and Physiology Practice Questions | ATI Anatomy and Physiology Questions \| NursingMocks | Practice ATI Anatomy and Physiology questions covering body systems, normal function, foundational science, and nursing-relevant physiology. | `ati anatomy and physiology practice test` (0/mo) | 5 - Anatomy and Physiology | 6 | 329 | yes |
| Dosage Calculations | ati_product_area | This Dosage Calculation page is for ATI practice exams on medication math, conversions, IV flow rates, safe dose ranges, and accuracy. | `ati-dosage-calculation-proctored-exam-practice-questions` | ATI Dosage Calculation Proctored Exam Practice Questions | ATI Dosage Calculation Questions \| NursingMocks | Practice ATI Dosage Calculation questions with rationales for medication math, conversions, IV flow rates, safe dose ranges, and accuracy. | `ati dosage calculation proctored exam` (50/mo) | 11 - Dosage Calculations | 40 | 1131 | yes |
| Health Assessment | ati_product_area | Health Assessment review on this page uses ATI practice tests for physical assessment, focused checks, findings, and documentation. | `ati-rn-health-assessment-practice-questions` | ATI RN Health Assessment Practice Questions | ATI RN Health Assessment Questions \| NursingMocks | Review ATI Health Assessment questions with rationales on physical assessment, focused assessments, normal findings, and documentation. | `ati health assessment practice questions` (0/mo) | 32 - Health Assessment<br>30 - Physical Assessments | 15 | 620 | yes |
| Pathophysiology | ati_product_area | Pathophysiology practice exams here focus on disease processes, clinical signs, risk factors, complications, and nursing implications. | `ati-rn-pathophysiology-practice-questions` | ATI RN Pathophysiology Practice Questions | ATI Pathophysiology Questions \| NursingMocks | Study ATI Pathophysiology questions with rationales covering disease processes, clinical signs, risk factors, and nursing implications. | `ati pathophysiology practice questions` (0/mo) | 33 - Pathophysiology | 8 | 410 | yes |
| Nursing Informatics | ati_product_area | The Informatics page covers ATI practice questions for electronic documentation, health information systems, privacy, data safety, and technology. | `ati-rn-nursing-informatics-practice-questions` | ATI RN Nursing Informatics Practice Questions | ATI Nursing Informatics Questions \| NursingMocks | Practice ATI Nursing Informatics questions covering electronic documentation, health information systems, privacy, data safety, and technology. | `ati nursing informatics practice questions` (0/mo) | 35 - Informatics | 1 | 29 | yes |
| Gerontology | ati_curriculum_topic | Gerontology students can use this page for ATI practice exams on older-adult assessment, chronic care, medication concerns, and safety. | `ati-rn-gerontology-practice-questions` | ATI RN Gerontology Practice Questions | ATI RN Gerontology Practice Questions \| NursingMocks | Review ATI Gerontology questions with rationales on older adult assessment, age-related changes, chronic care, medications, and safety. | `ati gerontology practice questions` (0/mo) | 29 - Geriatrics | 2 | 82 | yes |
| Capstone | ati_product_area | ATI RN Capstone practice exams on this page support integrated review, clinical judgment, prioritization, and broad readiness practice. | `ati-rn-capstone-practice-questions` | ATI RN Capstone Practice Questions | ATI RN Capstone Practice Questions \| NursingMocks | Prepare with ATI RN Capstone questions for integrated nursing review, clinical judgment, prioritization, and broad readiness practice. | `ati rn capstone proctored exam` (0/mo) | 27 - Capstone | 21 | 1337 | yes |
| Comprehensive Review | test_bank_mixed_topic | The Comprehensive Predictor page collects ATI RN practice exams for mixed-content review, final readiness, and clinical judgment practice. | `ati-rn-comprehensive-predictor-practice-questions` | ATI RN Comprehensive Predictor Practice Questions | ATI RN Comprehensive Predictor Questions \| NursingMocks | Use ATI RN Comprehensive Predictor questions to review mixed nursing content, clinical judgment, final exam readiness, and rationales. | `ati rn comprehensive predictor` (140/mo) | 19 - Concept-based assessment level<br>20 - Dimensions of Nursing Practice<br>23 - Custom<br>36 - Role transition of professional nurse<br>12 - Nursing Specialty | 20 | 1546 | review_first |
| Communication | ati_curriculum_topic | Communication practice questions here focus on therapeutic responses, client education, collaboration, cultural care, and professional interactions. | `ati-rn-communication-practice-questions` | ATI RN Communication Practice Questions | ATI RN Communication Practice Questions \| NursingMocks | Practice ATI RN Communication questions covering therapeutic communication, client education, collaboration, cultural care, and nursing interactions. | `ati communication practice questions` (0/mo) | 25 - Communication | 3 | 115 | review_first |

Topic-page rules:

- Descriptions should refer to the page naturally without repeating the same sentence structure.
- Use nursing test bank wording in Description, such as 	est bank, practice exams, practice tests, or practice questions, where it fits.
- Do not use sets for ATI RN topics; reserve set wording for ATI TEAS and HESI where appropriate.
- Do not make every description start with the same phrase, such as This page lists.
- Avoid AI-style sequence wording and long repeated comma-chain summaries.
- Use the Description as the on-page/admin page description for the topic.
- Use the URL Slug exactly for the public ATI RN topic page unless we deliberately rerun keyword research and update this table.
- Use the H1, Meta Title, and Meta Description from this table when creating the topic page.
- Use Import Ready = yes topics first.
- Use eview_first topics only after file-level mapping confirms where each source exam belongs.
- Do not create public topics directly from source folder names unless they are listed here.
- Keep original source folder/file names as metadata even when the public topic name and URL are cleaned.
## SEO Naming Research

Live search results and competitor pages repeatedly use these high-intent modifiers:

- `ATI RN [topic] Proctored Exam`
- `ATI [topic] Proctored Exam`
- `ATI RN [topic] Practice Questions`
- `ATI RN [topic] Test Bank`
- `NGN`
- current-year ranges such as `2025`, `2026`, and `2025/2026`

Use `Practice Questions` for public topic page names because it is cleaner, evergreen, and safer for navigation. Use `Proctored Exam Practice Questions`, `NGN`, and the current year in SEO title/meta copy where useful.

| Public Topic | Recommended SEO Page Name | SEO Title Pattern |
|---|---|---|
| Pharmacology | ATI RN Pharmacology Practice Questions | ATI RN Pharmacology Proctored Exam Practice Questions |
| Adult Medical Surgical | ATI RN Medical Surgical Practice Questions | ATI RN Medical Surgical Proctored Exam Practice Questions |
| Fundamentals | ATI RN Fundamentals Practice Questions | ATI RN Fundamentals Proctored Exam Practice Questions |
| Maternal Newborn | ATI RN Maternal Newborn Practice Questions | ATI RN Maternal Newborn Proctored Exam Practice Questions |
| Mental Health | ATI RN Mental Health Practice Questions | ATI RN Mental Health Proctored Exam Practice Questions |
| Community Health | ATI RN Community Health Practice Questions | ATI RN Community Health Proctored Exam Practice Questions |
| Leadership and Management | ATI RN Leadership Practice Questions | ATI RN Leadership Proctored Exam Practice Questions |
| Nutrition | ATI RN Nutrition Practice Questions | ATI RN Nutrition Proctored Exam Practice Questions |
| Nursing Care of Children | ATI RN Nursing Care of Children Practice Questions | ATI RN Nursing Care of Children Proctored Exam Practice Questions |
| Anatomy and Physiology | ATI Anatomy and Physiology Practice Questions | ATI Anatomy and Physiology Practice Test Questions |
| Dosage Calculations | ATI Dosage Calculation Practice Questions | ATI Dosage Calculation Practice Questions for RN Students |
| Health Assessment | ATI Health Assessment Practice Questions | ATI RN Health Assessment Practice Questions |
| Pathophysiology | ATI Pathophysiology Practice Questions | ATI Pathophysiology Practice Questions for Nursing Students |
| Nursing Informatics | ATI Nursing Informatics Practice Questions | ATI RN Nursing Informatics Practice Questions |
| Gerontology | ATI RN Gerontology Practice Questions | ATI RN Gerontology Practice Questions |
| Capstone | ATI RN Capstone Practice Questions | ATI RN Capstone Proctored Exam Practice Questions |
| Comprehensive Review | ATI RN Comprehensive Review Practice Questions | ATI RN Comprehensive Predictor and Comprehensive Review Practice Questions |

SEO implementation notes:

- Public H1/page name should usually use the `Recommended SEO Page Name`.
- Meta title can use the stronger `Proctored Exam Practice Questions` phrase.
- Slugs should stay short and stable, for example `ati-rn-pharmacology-practice-questions`.
- Avoid using `answers`, `actual exam`, or `guaranteed pass` in official site copy even though those phrases appear often in competitor results.
- For yearly quizzes, put the year and set number on the quiz page, not the parent topic page.

## Clean URL Rules

- Do not use raw source slugs as public URLs when they contain timestamps, source IDs, spelling errors, or duplicated machine-generated suffixes.
- Create clean public URLs from the source title using only factual source signals: official topic, exam type, year, set number, assessment number, quiz number, retake number, benchmark, final, midterm, or named source modifier such as Capstone, VATI, Fletcher, or ICHS.
- Do not append random numeric suffixes such as `-2` or `-3` just to make duplicate slugs unique.
- Only include a number in the URL when that number appears in the source title or is a confirmed set/exam/assessment/retake number.
- If multiple files produce the same clean slug and the source titles do not contain a factual differentiator, keep the clean slug in the mapping and mark the row `Needs review`.
- During review, decide whether the files are duplicates, retakes, different question counts for the same exam, or need a verified distinguishing label.
- Preserve the original source slug and file name as metadata even when the public URL is cleaned.
- Before import, the mapping should include `URL Slug To Use` and `URL Status` for each exam.

## Non-Public Topic Names To Clean Up

These names should not become top-level public ATI RN topics as written. Some are ATI-supported concepts inside ATI products; others are aliases, combined folders, or source buckets. Preserve the original folder/file names as metadata, then map each exam to the clean public topic.

| Folder Name | Exam Count | ATI Status | Cleanup Rule |
|---|---:|---|---|
| Fluid and Electrolytes | 1 | ATI-supported concept in Fundamentals, Skills Modules, A&P, and Pathophysiology content, but not a top-level RN Content Mastery module | Map by exam content; usually Fundamentals, Adult Medical Surgical, Anatomy and Physiology, or Pathophysiology |
| Cardiovascular and Respiratory | 2 | ATI-supported body-system content, but not this exact combined top-level ATI RN topic | Map by exam content; usually Adult Medical Surgical or Anatomy and Physiology |
| Reproductive Health | 1 | ATI-supported inside Maternal Newborn/Women's Health, A&P, and Pharmacology content, but not a standalone RN Content Mastery module | Map to Maternal Newborn unless the file is A&P/pharmacology-heavy |
| Mobility Safety | 3 | ATI supports Mobility and Safety separately in Fundamentals/Skills content; exact combined name is not confirmed | Map to Fundamentals or Nursing Skills based on file content |
| Growth and Development | 2 | ATI-supported as Human Growth and Development in Fundamentals and Concept-Based Curriculum content | Map by exam content; usually Fundamentals or Nursing Care of Children |
| Lifespan Development | 4 | Exact ATI top-level topic name not confirmed; related ATI language appears as fetal lifespan and human growth/development | Map by exam content; usually Nursing Care of Children, Fundamentals, or Maternal Newborn |
| Critical Care | 2 | ATI-supported inside Adult Medical Surgical, Video Case Studies, and dosage assessment content, but not a top-level RN Content Mastery module | Map to Adult Medical Surgical; keep Critical Care as a tag if useful |
| Custom | 3 | ATI has Custom Assessment Builder, but `Custom` is not a curriculum topic | Source bucket only; map each exam to closest topic or Comprehensive Review |
| Nursing Specialty | 4 | Not confirmed as an ATI topic name | Source bucket only; map each exam by content |
| Dimensions of Nursing Practice | 2 | Not confirmed as an ATI topic name | Source bucket only; map to Adult Medical Surgical, Fundamentals, or Comprehensive Review |
| Health Concepts | 1 | Not confirmed as an ATI topic name | Source bucket only; map to Fundamentals, Leadership, or Comprehensive Review |
| Advanced Concepts | 1 | Not confirmed as an ATI topic name | Source bucket only; usually map to Adult Medical Surgical |
| Role Transition of Professional Nurse | 2 | Not confirmed as an ATI topic name | Source bucket or Comprehensive Review/Leadership, not a main ATI topic |
| Psychology | 5 | Alias/source wording, not preferred ATI public topic | Rename/map to Mental Health |
| Foundations of Nursing | 7 | Alias/source wording, not preferred ATI public topic | Rename/map to Fundamentals |
| Adult Health | 9 | Alias/source wording, not preferred ATI public topic | Rename/map to Adult Medical Surgical |
| Physical Assessments | 8 | Alias/source wording, not preferred ATI public topic | Rename/map to Health Assessment |
| Obstetrics and Pediatrics | 74 | Combined source folder; ATI treats these as separate Maternal Newborn and Pediatric/Nursing Care of Children areas | Split/map to Maternal Newborn and Nursing Care of Children where possible |

## Current Unconfirmed Folder Findings

These folders were inspected by file names, JSON metadata, and sampled question content.

| Source Folder / Exam | Destination |
|---|---|
| Nursing Specialty - `Ati Nrsg 200...` | Adult Medical Surgical / mixed Med-Surg |
| Nursing Specialty - `Ati Custom Fletcher Nrsg 106...` | Pharmacology |
| Nursing Specialty - `Ati Nsg 137...` | Health Assessment |
| Nursing Specialty - `ATI Custom Sp23 N144 FINAL...` | Adult Medical Surgical / Fundamentals mixed |
| Psychology - all exams | Mental Health |
| Dimensions of Nursing Practice - `Ati Custom 23 WN 250...` | Adult Medical Surgical |
| Dimensions of Nursing Practice - `NUR1000D Midterm...` | Adult Medical Surgical / Fundamentals mixed |
| Custom - `Nur209 Final Assessment...` | Maternal Newborn + Nursing Care of Children mixed |
| Custom - `Fall NS 126...` | Adult Medical Surgical |
| Custom - `NSG 240 Final...` | Adult Medical Surgical / Health Assessment mixed |
| Advanced Concepts - `nur 211 advanced concept...` | Adult Medical Surgical |
| Health Concepts - `npro 2100...` | Fundamentals / Leadership mixed |
| Role Transition - `nurs 180 role transition...` | Adult Medical Surgical / Fundamentals mixed |
| Role Transition - `ati 2510 transitions...` | Fundamentals / Leadership / Community Health mixed |

## ATI RN Exam Placement Decisions

Completed placement review: 2026-08-02.

Coverage:

- ATI RN topic-folder exam JSON files reviewed: `844`.
- Topic-folder exam JSON files without a placement rule: `0`.
- HESI-branded files found inside ATI source folders: `3`; exclude from ATI import or move to HESI RN.
- Duplicate source-bucket files in `24 - Mobility Safety`: `3`; these match the `23 - Custom` source bucket and should not be double-imported unless content comparison proves they differ.
- Files requiring manual review before final import: `4`.
- Additional root-level JSON files not counted as exams: `7`; these are planning, audit, mapping, or keyword JSON artifacts, not source exam files.

Whole-folder placements:

| Source Folder | Destination Topic |
|---|---|
| `1 - Pharmacology` | Pharmacology |
| `10 - Mental Health` | Mental Health |
| `11 - Dosage Calculations` | Dosage Calculations |
| `16 - Nutrition` | Nutrition |
| `17 - Leadership` | Leadership and Management |
| `18 - Psychology` | Mental Health |
| `22 - Nursing Care of Children` | Nursing Care of Children |
| `25 - Communication` | Communication |
| `27 - Capstone` | Capstone |
| `29 - Geriatrics` | Gerontology |
| `30 - Physical Assessments` | Health Assessment |
| `32 - Health Assessment` | Health Assessment |
| `33 - Pathophysiology` | Pathophysiology |
| `35 - Informatics` | Nursing Informatics |
| `8 - Community Health` | Community Health |

Mixed or non-public source-folder placement rules:

| Source Folder / File | Destination Topic |
|---|---|
| `12 - Nursing Specialty / 1-Ati Nrsg 200...` | Adult Medical Surgical |
| `12 - Nursing Specialty / 2-Ati Custom Fletcher Nrsg 106...` | Pharmacology |
| `12 - Nursing Specialty / 3-Ati Nsg 137...` | Health Assessment |
| `12 - Nursing Specialty / 4-ATI Custom Sp23 N144 FINAL...` | Comprehensive Review |
| `13 - Cardiovascular and Respiratory` | Adult Medical Surgical |
| `14 - Foundations of Nursing` ATI files | Fundamentals |
| `15 - Adult Health` files `1`, `3`, `4` | Adult Medical Surgical |
| `15 - Adult Health` files `6`, `7`, `8` | Health Assessment |
| `15 - Adult Health` file `9` | Gerontology |
| `19 - Concept-based assessment level` | Comprehensive Review |
| `20 - Dimensions of Nursing Practice / 1-Ati Custom 23 WN 250...` | Adult Medical Surgical |
| `20 - Dimensions of Nursing Practice / 2-NUR1000D Midterm...` | Fundamentals |
| `21 - Growth and Development` | Fundamentals |
| `23 - Custom / 1-Nur209 Final Assessment...` | Comprehensive Review |
| `23 - Custom / 2-Fall NS 126...` | Adult Medical Surgical |
| `23 - Custom / 3-NSG 240 Final...` | Comprehensive Review |
| `24 - Mobility Safety` | Duplicate source bucket; same file names/counts as `23 - Custom`; do not double-import by default |
| `26 - Reproductive Health` | Maternal Newborn |
| `28 -Advanced Concepts` | Adult Medical Surgical |
| `31 - Health concepts` | Fundamentals |
| `34 - Critical Care / 1-critical thinking...` | Comprehensive Review |
| `34 - Critical Care / 2-critical care midterm...` | Adult Medical Surgical |
| `36 - Role transition... / 1-nurs 180 role transition...` | Comprehensive Review |
| `36 - Role transition... / 2-ati 2510 transitions...` | Leadership and Management |
| `6 - Obstetrics and Pediatrics` files `2`, `14`, `22`, `25`, `74` | Maternal Newborn |
| `6 - Obstetrics and Pediatrics` all other files | Nursing Care of Children |
| `7 - Fluid and Electrolytes` | Adult Medical Surgical, with Fundamentals/Pathophysiology as secondary tags if useful |
| `9 - Lifespan Development` | Fundamentals |

Exclude or move out of ATI RN:

| Current Folder | File | Decision |
|---|---|---|
| `14 - Foundations of Nursing` | `2-Hesi rn foundation of nursing proctored exam.json` | Exclude from ATI import or move to HESI RN |
| `15 - Adult Health` | `2-HESI RN Adult Health 1 Proctored Exam (WGU).json` | Exclude from ATI import or move to HESI RN |
| `15 - Adult Health` | `5-Wgu hesi rn adult health proctored exam.json` | Exclude from ATI import or move to HESI RN |

Duplicate source verification:

The `24 - Mobility Safety` files are true content duplicates of matching files in `23 - Custom`, not just duplicate names. Verification compared SHA-256 file hashes, source `subtopic.name`, source slug, question counts, source question IDs, and normalized question text.

| Duplicate File | Canonical Source | Same Hash | Same Question IDs | Same Question Text | Decision |
|---|---|---|---|---|---|
| `24 - Mobility Safety / 1-Ati Custom Nur209 Final Assessment Sp 2024 Proctored Exam.json` | `23 - Custom / 1-Ati Custom Nur209 Final Assessment Sp 2024 Proctored Exam.json` | Yes | Yes | Yes | Do not import duplicate; keep canonical `23 - Custom` copy |
| `24 - Mobility Safety / 2-ATI Custom Fall NS 126 Proctored Exam 1.json` | `23 - Custom / 2-ATI Custom Fall NS 126 Proctored Exam 1.json` | Yes | Yes | Yes | Do not import duplicate; keep canonical `23 - Custom` copy |
| `24 - Mobility Safety / 3-ATI Custom NSG 240 Final Proctored Exam.json` | `23 - Custom / 3-ATI Custom NSG 240 Final Proctored Exam.json` | Yes | Yes | Yes | Do not import duplicate; keep canonical `23 - Custom` copy |

Resolved review-needed placements:

| Current Folder | File | Destination | Reason |
|---|---|---|---|
| `4 - Maternal-Newborn` | `85-ATI Rn Nursing Care of Children 2020 Proctored Exam.json` | Fundamentals | Filename says Nursing Care of Children, but prompts are adult basic nursing/fundamentals: delegation, restraints, IV therapy, end-of-life care, handoff, HIPAA, skin care, blood pressure, tracheostomy, and safety. |
| `4 - Maternal-Newborn` | `96-ATI RN Nursing Care of Children 2019 Proctored Exam.json` | Nursing Care of Children | Content is clearly pediatric: infant RSV, preschool poisoning, parent teaching, seizure care, adolescent exposure, immunizations, school-age assessment, and child safety. |
| `4 - Maternal-Newborn` | `98-ATI Nursing Care of Children Maternal Newborn Assessment Proctored Exam.json` | Nursing Care of Children | Mixed pediatric and maternal/newborn assessment, but pediatric content is the stronger destination signal. Store under Nursing Care of Children and keep Maternal Newborn as a secondary topic. |
| `7 - Fluid and Electrolytes` | `1-ATI custom Fluid and Electrolyte Exam Summer 2023 Proctored Exam.json` | Adult Medical Surgical | Content focuses on adult acute-care fluid/electrolyte and acid-base problems: furosemide labs, fluid volume deficit/overload, hypocalcemia, ABGs, kidney failure, burns, and metabolic alkalosis. |

Root-level JSON files not counted as exams:

| File | Treatment |
|---|---|
| `ATI RN Pharmacology alternative keywords seranking.json` | Planning/keyword artifact |
| `ATI RN Pharmacology content audit.json` | Planning/audit artifact |
| `ATI RN Pharmacology keyword volume dataforseo.json` | Planning/keyword artifact |
| `ATI RN Pharmacology keyword volume seranking.json` | Planning/keyword artifact |
| `ATI RN topic keyword best seranking.json` | Planning/keyword artifact |
| `ATI RN topic keyword volume seranking.json` | Planning/keyword artifact |
| `ATI RN topic mapping plan.json` | Planning/mapping artifact |

Destination summary from the placement pass:

| Destination | Exams | Questions |
|---|---:|---:|
| Adult Medical Surgical | 238 | 12737 |
| Anatomy and Physiology | 6 | 329 |
| Capstone | 21 | 1337 |
| Communication | 3 | 115 |
| Community Health | 18 | 987 |
| Comprehensive Review | 14 | 1187 |
| Dosage Calculations | 40 | 1131 |
| Duplicate source bucket; do not double-import | 3 | 147 |
| Exclude from ATI / move to HESI RN | 3 | 196 |
| Fundamentals | 103 | 5273 |
| Gerontology | 5 | 246 |
| Health Assessment | 20 | 848 |
| Leadership and Management | 25 | 1506 |
| Maternal Newborn | 104 | 5471 |
| Mental Health | 69 | 3701 |
| Nursing Care of Children | 75 | 4010 |
| Nursing Informatics | 1 | 29 |
| Nutrition | 9 | 479 |
| Pathophysiology | 8 | 410 |
| Pharmacology | 79 | 4209 |

## ATI RN Cleanup Staging Run

Completed staging run: 2026-08-03.

Source root:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI
```

Destination root:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI
```

Staging command:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\scripts\stage-ati-rn-cleanup.ps1
```

Generated staging files:

- `ati-rn-cleanup-manifest.csv`
- `ati-rn-cleanup-manifest.json`
- `ati-rn-cleanup-summary.csv`
- `ati-rn-root-json-artifacts.csv`
- `ati-rn-clean-name-duplicates.csv`
- `ati-rn-stripped-name-duplicates.csv`
- `ati-rn-stripped-name-content-duplicates.csv`
- `ati-rn-stripped-name-content-duplicate-details.csv`

Verified staging output:

| Action | Exams | Notes |
|---|---:|---|
| `import` | 838 | Clean staged import files across public ATI RN topics |
| `exclude` | 3 | HESI-branded files copied under `Excluded - HESI` |
| `duplicate` | 3 | Duplicate source bucket copied under `Duplicate Source - Do Not Import` |
| Total manifest rows | 844 | Matches staged topic-folder exam JSON count |

Destination folder counts:

| Destination Folder | JSON Files |
|---|---:|
| Adult Medical Surgical | 238 |
| Anatomy and Physiology | 6 |
| Capstone | 21 |
| Communication | 3 |
| Community Health | 18 |
| Comprehensive Review | 14 |
| Dosage Calculations | 40 |
| Duplicate Source - Do Not Import | 3 |
| Excluded - HESI | 3 |
| Fundamentals | 103 |
| Gerontology | 5 |
| Health Assessment | 20 |
| Leadership and Management | 25 |
| Maternal Newborn | 104 |
| Mental Health | 69 |
| Nursing Care of Children | 75 |
| Nursing Informatics | 1 |
| Nutrition | 9 |
| Pathophysiology | 8 |
| Pharmacology | 79 |

The original Naxlex source folder was not moved or deleted; staging copied files into the cleanup folder and preserved traceability through the manifest.

## ATI RN Clean Name Uniqueness Audit

Completed audit: 2026-08-03.

Physical staged filenames are unique among importable cleanup files when checked exactly by filename across destination folders.

However, stripped/normalized clean name keys are not unique. When the leading source number is removed and names are normalized into slug-like keys, the audit found:

- Duplicate clean-name keys: `68`
- Import files affected: `194`
- Audit output: `C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI\ati-rn-clean-name-duplicates.csv`

Import implication:

- Do not generate public quiz slugs from the cleaned exam name alone.
- Preserve the source file number, confirmed exam/set number, year, retake/assessment marker, or another factual differentiator when creating quiz slugs.
- If no factual differentiator exists, keep the row in the duplicate-name audit for manual slug review before import.
- Physical source filenames can stay unchanged in the cleanup folder because they are already unique.

Content verification for stripped-name duplicates:

- Duplicate stripped-name groups checked: `65`
- Files in those duplicate-name groups: `188`
- Exact content duplicate groups among importable files: `0`
- Same question-ID/text duplicate groups among importable files: `0`
- All `65` stripped-name duplicate groups are `same_name_different_content`.
- Summary output: `C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI\ati-rn-stripped-name-content-duplicates.csv`
- Detail output: `C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI\ati-rn-stripped-name-content-duplicate-details.csv`

Decision: keep the files. The duplicate stripped names are naming collisions, not duplicate content. Public quiz slug generation still needs unique factual differentiators, but these files should not be removed as duplicates.

## Normalized Quiz Naming Structure

Status: revised after Adult Medical Surgical preview review.

Goal:

- Keep public quiz names SEO-friendly and readable.
- Prevent collisions across RN/LPN, topic pages, and same-name source files.
- Preserve the source exam title meaning instead of collapsing files into generic topic names.
- Clean presentation issues such as casing, spacing, missing `RN`, and common acronym casing.
- Preserve all raw source information in metadata so cleanup remains reversible.

Required normalized fields per imported quiz:

| Field | Purpose | Example |
|---|---|---|
| `program` | Program-level collision prevention | `RN`, `LPN` |
| `vendor` | Vendor/source family | `ATI` |
| `normalizedTopic` | Public topic destination | `Pharmacology` |
| `normalizedExamType` | Search-facing exam type | `Proctored Exam` |
| `normalizedModifier` | Factual source modifier when present | `2023`, `Retake 1`, `Assessment 1`, `Final`, `Midterm`, `NGN` |
| `normalizedSetLabel` | Fallback uniqueness label from source file number | `Set 25` |
| `publicQuizTitle` | H1/default public quiz name | `ATI RN Pharmacology Proctored Exam Practice Questions - Set 25` |
| `seoTitle` | Browser/meta title | `ATI RN Pharmacology Proctored Exam Practice Questions - Set 25 \| NursingMocks` |
| `slug` | Public route slug | `ati-rn-pharmacology-proctored-exam-practice-questions-set-25` |
| `cardLabel` | Short label for dense cards | `ATI RN Pharmacology - Set 25` |
| `sourceFileNumber` | Numeric prefix from source filename | `25` |

Primary title pattern:

```text
{Cleaned Source Exam Title} Practice Questions
```

When the cleaned source exam title does not already include a program after `ATI`, add `RN`:

```text
ATI Med Surg Proctored Exam
ATI RN Med Surg Proctored Exam Practice Questions
```

When the normalized title collides within the same vendor/program/topic, append the source set label:

```text
{Cleaned Source Exam Title} Practice Questions - Set {sourceFileNumber}
```

Card label pattern:

```text
ATI {Program} {Topic} - Set {sourceFileNumber}
```

Examples:

| Source File | Public Quiz Title | Slug |
|---|---|---|
| `25-Ati Fundamentals Proctored Exam.json` | `ATI RN Fundamentals Proctored Exam Practice Questions - Set 25` | `ati-rn-fundamentals-proctored-exam-practice-questions-set-25` |
| `51-Ati Rn Pharmacology 2023 Retake 1 Proctored Exam.json` | `ATI RN Pharmacology 2023 Retake 1 Proctored Exam Practice Questions` | `ati-rn-pharmacology-2023-retake-1-proctored-exam-practice-questions` |
| `160-Ati Med Surg Proctored Exam 2.json` | `ATI RN Med Surg Proctored Exam 2 Practice Questions` | `ati-rn-med-surg-proctored-exam-2-practice-questions` |
| `96-ATI RN Nursing Care of Children 2019 Proctored Exam.json` | `ATI RN Nursing Care of Children 2019 Proctored Exam Practice Questions` | `ati-rn-nursing-care-of-children-2019-proctored-exam-practice-questions` |
| Future LPN file with same topic/name | `ATI LPN Pharmacology Proctored Exam Practice Questions - Set 25` | `ati-lpn-pharmacology-proctored-exam-practice-questions-set-25` |

Normalization rules:

| Raw Source Wording | Public Normalization |
|---|---|
| `Ati`, `ati`, `ATI` | `ATI` |
| `ATI` without program | `ATI RN` for this RN cleanup batch |
| `Rn`, `rn`, `RN` | `RN` |
| `Lpn`, `lpn`, `LPN` | `LPN` |
| `Med Surg`, `Medsurg`, `Medical Surgical` | `Med Surg` in quiz titles; `Adult Medical Surgical` remains the topic name |
| `Paediatrics`, `Paediatric`, `Pediatrics`, `Pediatric` | `Nursing Care of Children` for topic; `Pediatric` only when retained as a factual source modifier |
| `Maternal-Newborn`, `Maternity`, `OB` | `Maternal Newborn` |
| `Psychology`, `Psych`, `Psychiatric Nursing` | `Mental Health` |
| `Foundations of Nursing`, `Foundation of Nursing` | `Fundamentals` |
| `Physical Assessments`, `Physical Assessment` | `Health Assessment` |
| `Geriatrics`, `Gero` | `Gerontology` |
| `Pharm`, `Pharmacy`, misspellings such as `Phamacology` | `Pharmacology` |
| `proctored   exam`, `proctored Exam`, repeated spacing | `Proctored Exam` |
| School/course codes such as `NUR 112`, `NURS 240`, `NSG 240` | Keep in the public title when present because they are useful differentiators |
| Source timestamps, machine suffixes, duplicated numeric slug suffixes | Remove only when they are clearly machine-generated rather than part of the source exam name |

Modifier rules:

- Keep factual modifiers and course/source details from the source title when they help distinguish the exam: year, course code, `NGN`, `Retake`, `Assessment`, `Exam 1`, `Exam 2`, `Final`, `Midterm`, `Capstone`, `VATI`, or a named source label such as `Fletcher`.
- Do not invent modifiers that are not present in the source.
- If a source title has no factual differentiator and collides after normalization, use `Set {sourceFileNumber}`.
- If a source title already contains a clear exam/set number, use that number as the modifier instead of also adding source set, unless another collision remains.

SEO rules:

- Public H1 and meta title should include `Practice Questions`.
- Avoid `answers`, `actual exam`, `guaranteed pass`, or similar claims in public names.
- Include `{Program}` in all quiz titles and slugs so RN and LPN can coexist safely.
- Topic pages can stay broader, but quiz pages should be uniquely tied to vendor/program/topic.

Slug collision rules:

- Slugs must be unique across the full site, not only within a topic.
- Generate from normalized title first.
- If duplicate, append `set-{sourceFileNumber}`.
- If still duplicate, append a short deterministic source hash or source document ID only as a last resort.

Metadata preservation rules:

- Never overwrite raw Naxlex identity fields.
- Preserve `sourceFileName`, `sourceFolder`, `sourceSubtopic`, `sourceSubtopicSlug`, `sourceTopicId`, `sourceFileNumber`, `destinationTopic`, `secondaryTopics`, and `normalizationNotes`.

Adult Medical Surgical preview:

- Generated preview file: `C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI\ati-rn-adult-medical-surgical-normalized-name-preview.csv`
- Simplified two-column review file: `C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI\ati-rn-adult-medical-surgical-normalized-name-preview-simple.csv`
- Rows: `238`
- Scope: naming preview only; no staged exam JSON files were renamed.
- Rule adjustment after preview: retain the cleaned source exam name, add missing `RN`, normalize casing/acronyms/spacing, append `Practice Questions`, and append `Set {sourceFileNumber}` only when the cleaned public title still collides.
- Verify this preview before generating normalized names for all ATI RN topics.

## Required Import Metadata

Every imported quiz should keep:

```text
sourceFolder
sourceFileName
sourceBucket
sourceSubtopic
sourceSubtopicSlug
destinationTopic
topicSourceType
secondaryTopics
mappingConfidence
```

Every imported question should keep at least:

```text
sourceFolder
sourceFileName
sourceBucket
sourceQuestionId
sourceSubtopic
destinationTopic
```

## Cleanup Workflow

1. Build a local mapping file for all 36 ATI RN folders.
2. Assign each folder or exam file to an acceptable public topic.
3. Mark uncertain or mixed files with `mappingConfidence: "review"`.
4. Run a dry-run report before writing Firestore.
5. Review counts by destination topic, source folder, and source file.
6. Create only the accepted public topics in Firestore.
7. Import each exam file as a quiz under its destination topic.
8. Preserve original source metadata on quizzes and questions.
9. Regenerate sidebar data after import.
10. Run TypeScript validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Topic Import Log

2026-08-01:

- Imported ATI RN topics only, not quizzes or questions.
- Target path: `pillarPages/nursing-test-bank/subPages/SuT1noZoNGEjKGR1vTbi/nestedSubPages/Fnnd4c6ae0Uiurk2KUSc/topics`.
- Public hierarchy: `rn-exams` > `ati-rn-exams` > topic pages.
- Imported 18 topic pages from `ATI RN topic mapping plan.json`.
- Existing `Pharmacology` draft topic was updated to the approved slug `ati-pharmacology-proctored-exam-practice-questions` instead of creating a duplicate.
- Created route mappings for all 18 approved topic slugs.
- Regenerated sidebar data with `node scripts/generate-sidebar-data.js`.
- Validation passed with `.\node_modules\.bin\tsc.cmd --noEmit`.

## Assumptions

- ATI official module names are preferred for public navigation when available.
- Search-facing names should use common user phrasing such as `ATI RN Medical Surgical Practice Questions`.
- Mixed/custom source exams should not create messy public topics unless there is a deliberate SEO strategy for a mixed review page.













