# Nursing Exit Exam Upload Tracker

This file tracks Nursing Exit Exam quiz metadata and question imports from the local Naxlex source files.

## Source Root

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Exit Exams
```

## Import Rules

- Quiz names use the source JSON filename after removing the leading source number prefix, such as `1-` or `2-`.
- Exit Exam and Test Bank imports do not use `setNumber`, `year`, or `examYear` metadata.
- Duplicate cleaned filenames are made unique with `Form 2`, `Form 3`, and so on.
- Each imported quiz should have a public route mapping.
- Questions are saved in the same normalized format used by the Exit Exam bulk uploader: parsed option arrays, `correctAnswer`, `explanation`, `questionTypeId`, `questionNumber`, `displayOrder`, meta placeholders, source IDs, and `status: published`.

## Current Firestore Totals

Validated after the remaining import batch:

| Nested page | Quiz count | Question total |
| --- | ---: | ---: |
| `/ati-lpn-comprehensive-predictor` | 15 | 2,412 |
| `/hesi-lpn-exit-exam` | 10 | 1,345 |
| `/ati-rn-comprehensive-predictor` | 23 | 3,616 |
| `/hesi-rn-exit-exam` | 19 | 2,141 |

## Uploaded ATI Exit Exams

### LPN ATI

Admin hierarchy:

```text
lpn-exit-exams / ati-lpn-comprehensive-predictor
```

| Quiz name | Public slug | Questions |
| --- | --- | ---: |
| ATI LPN Comprehensive Predictor 2023 Proctored Exam | `ati-lpn-comprehensive-predictor-2023-proctored-exam` | 32 |
| ATI LPN Comprehensive Predictor 2023 Proctored Exam 3 | `ati-lpn-comprehensive-predictor-2023-proctored-exam-3` | 180 |
| ATI LPN Comprehensive Predictor 2023 Proctored Exam Form 2 | `ati-lpn-comprehensive-predictor-2023-proctored-exam-form-2` | 178 |
| ATI LPN Comprehensive Predictor 2023 Retake Proctored Exam | `ati-lpn-comprehensive-predictor-2023-retake-proctored-exam` | 180 |
| ATI LPN Comprehensive Predictor Proctored Exam | `ati-lpn-comprehensive-predictor-proctored-exam` | 99 |
| ATI PN Comprehensive Predictor 2023 - Proctored Exam 1 | `ati-pn-comprehensive-predictor-2023-proctored-exam-1` | 179 |
| ATI PN Comprehensive Predictor 2023 Proctored Exam | `ati-pn-comprehensive-predictor-2023-proctored-exam` | 178 |
| ATI PN Comprehensive Predictor 2023 Proctored Exam 4 | `ati-pn-comprehensive-predictor-2023-proctored-exam-4` | 178 |
| ATI PN Comprehensive Predictor 2023 Proctored Exam Form 2 | `ati-pn-comprehensive-predictor-2023-proctored-exam-form-2` | 168 |
| ATI PN Exit 2023 Proctored Exam | `ati-pn-exit-2023-proctored-exam` | 179 |
| PN Comprehensive Predictor 2023 Proctored Exam | `pn-comprehensive-predictor-2023-proctored-exam` | 148 |
| PN Comprehensive Predictor 2023 Proctored Exam Form 2 | `pn-comprehensive-predictor-2023-proctored-exam-form-2` | 174 |
| PN Comprehensive Predictor 2023 Proctored Exam Form 3 | `pn-comprehensive-predictor-2023-proctored-exam-form-3` | 179 |
| PN Comprehensive Predictor PN 2020 Proctored Exam | `pn-comprehensive-predictor-pn-2020-proctored-exam` | 180 |
| VATI PN Comprehensive Predictor 2020 Proctored Exam | `vati-pn-comprehensive-predictor-2020-proctored-exam` | 180 |

### RN ATI

Admin hierarchy:

```text
rn-exit-exams / ati-rn-comprehensive-predictor
```

| Quiz name | Public slug | Questions |
| --- | --- | ---: |
| ATI Comprehensive Predictor 2023 Exit Proctored Exam A | `ati-comprehensive-predictor-2023-exit-proctored-exam-a` | 139 |
| ATI Comprehensive Predictor 2023 Exit Proctored Exam A Form 2 | `ati-comprehensive-predictor-2023-exit-proctored-exam-a-form-2` | 175 |
| ATI Comprehensive Predictor 2023 Proctored Exam | `ati-comprehensive-predictor-2023-proctored-exam` | 179 |
| ATI RN Comprehensive 2023 With NGN Proctored Exam | `ati-rn-comprehensive-2023-with-ngn-proctored-exam` | 164 |
| ATI RN Comprehensive Per 2023 Proctored Exam | `ati-rn-comprehensive-per-2023-proctored-exam` | 128 |
| ATI RN Comprehensive Predictor 2023 Proctored Exam | `ati-rn-comprehensive-predictor-2023-proctored-exam` | 175 |
| ATI RN Comprehensive Predictor 2023 Proctored Exam Form 2 | `ati-rn-comprehensive-predictor-2023-proctored-exam-form-2` | 44 |
| ATI RN Comprehensive Predictor 2023 Proctored Exam Form 3 | `ati-rn-comprehensive-predictor-2023-proctored-exam-form-3` | 159 |
| ATI RN Comprehensive Predictor 2023 Retake 1 Proctored Exam | `ati-rn-comprehensive-predictor-2023-retake-1-proctored-exam` | 187 |
| ATI RN Comprehensive Predictor 2023 Retake Proctored Exam | `ati-rn-comprehensive-predictor-2023-retake-proctored-exam` | 176 |
| ATI RN Comprehensive Predictor 2023 Updated Proctored Exam | `ati-rn-comprehensive-predictor-2023-updated-proctored-exam` | 179 |
| ATI RN Predictor Assessment Exit Proctored Exam | `ati-rn-predictor-assessment-exit-proctored-exam` | 164 |
| RN ATI Capstone Proctored Comprehensive Assessment Form B | `rn-ati-capstone-proctored-comprehensive-assessment-form-b` | 71 |
| RN ATI Comprehensive Predictor 2023 Proctored Exam | `rn-ati-comprehensive-predictor-2023-proctored-exam` | 142 |
| RN Comprehensive Online Practice 2019 B With NGN Proctored Exam | `rn-comprehensive-online-practice-2019-b-with-ngn-proctored-exam` | 179 |
| RN Comprehensive Predictor 2023 Proctored Exam | `rn-comprehensive-predictor-2023-proctored-exam` | 145 |
| RN Comprehensive Predictor 2023 Proctored Exam - St. Joseph | `rn-comprehensive-predictor-2023-proctored-exam-st-joseph` | 176 |
| RN Comprehensive Predictor 2023 Proctored Exam Form 2 | `rn-comprehensive-predictor-2023-proctored-exam-form-2` | 180 |
| RN Comprehensive Predictor 2023 Proctored Exam Form 3 | `rn-comprehensive-predictor-2023-proctored-exam-form-3` | 151 |
| RN Comprehensive Predictor 2023 Proctored Exam Form 4 | `rn-comprehensive-predictor-2023-proctored-exam-form-4` | 170 |
| RN Comprehensive Predictor Proctored Exam | `rn-comprehensive-predictor-proctored-exam` | 178 |
| RN Comprehensive Predictor Proctored Exam (National U CA San Diego) | `rn-comprehensive-predictor-proctored-exam-national-u-ca-san-diego` | 177 |
| VATI ATI Comprehensive Predictor 2023 Proctored Exam | `vati-ati-comprehensive-predictor-2023-proctored-exam` | 178 |

## Uploaded HESI Exit Exams

### LPN HESI

Admin hierarchy:

```text
lpn-exit-exams / hesi-lpn-exit-exam
```

| Quiz name | Public slug | Questions |
| --- | --- | ---: |
| HESI Exit LPN Proctored Exam 1 | `hesi-exit-lpn-proctored-exam-1` | 73 |
| HESI LPN Exit Exam IV Proctored Exam | `hesi-lpn-exit-exam-iv-proctored-exam` | 126 |
| HESI LPN Exit Proctored Exam | `hesi-lpn-exit-proctored-exam` | 110 |
| HESI LPN Exit Proctored Exam Form 2 | `hesi-lpn-exit-proctored-exam-form-2` | 291 |
| HESI LPN Exit Test 11 Proctored Exam | `hesi-lpn-exit-test-11-proctored-exam` | 71 |
| HESI PN Exit 2023 II Proctored Exam | `hesi-pn-exit-2023-ii-proctored-exam` | 150 |
| HESI PN Exit 2023 Proctored Exam | `hesi-pn-exit-2023-proctored-exam` | 150 |
| HESI PN Exit Proctored Exam | `hesi-pn-exit-proctored-exam` | 150 |
| HESI PN Exit Proctored Exam 2 | `hesi-pn-exit-proctored-exam-2` | 74 |
| HESI PN Exit Proctored Exam Three | `hesi-pn-exit-proctored-exam-three` | 150 |

### RN HESI

Admin hierarchy:

```text
rn-exit-exams / hesi-rn-exit-exam
```

| Quiz name | Public slug | Questions |
| --- | --- | ---: |
| HESI Compass B Exit Proctored Exam | `hesi-compass-b-exit-proctored-exam` | 68 |
| HESI Compass Exit Proctored Exam | `hesi-compass-exit-proctored-exam` | 84 |
| HESI Exit II Proctored Exam | `hesi-exit-ii-proctored-exam` | 117 |
| HESI Exit RN With NGN Proctored Exam | `hesi-exit-rn-with-ngn-proctored-exam` | 107 |
| HESI RN Compass Exit B Proctored Exam | `hesi-rn-compass-exit-b-proctored-exam` | 121 |
| HESI RN Compass Exit Proctored Exam | `hesi-rn-compass-exit-proctored-exam` | 60 |
| HESI RN Exit 1 Proctored Exam | `hesi-rn-exit-1-proctored-exam` | 110 |
| HESI RN Exit 3 Proctored Exam | `hesi-rn-exit-3-proctored-exam` | 120 |
| HESI RN Exit Exam IV Proctored Exam | `hesi-rn-exit-exam-iv-proctored-exam` | 104 |
| HESI RN Exit Proctored Exam | `hesi-rn-exit-proctored-exam` | 130 |
| HESI RN Exit Proctored Exam Form 2 | `hesi-rn-exit-proctored-exam-form-2` | 127 |
| HESI RN Exit Proctored Exam Form 3 | `hesi-rn-exit-proctored-exam-form-3` | 125 |
| HESI RN Exit Proctored Exam Form 4 | `hesi-rn-exit-proctored-exam-form-4` | 127 |
| HESI RN Exit Proctored Exam Form 5 | `hesi-rn-exit-proctored-exam-form-5` | 129 |
| HESI RN Exit Proctored Exam Form 6 | `hesi-rn-exit-proctored-exam-form-6` | 105 |
| HESI RN Exit Proctored Exam Form 7 | `hesi-rn-exit-proctored-exam-form-7` | 117 |
| HESI RN Exit V Proctored Exam | `hesi-rn-exit-v-proctored-exam` | 111 |
| HESI RN Exit VI Proctored Exam | `hesi-rn-exit-vi-proctored-exam` | 129 |
| RN HESI Exit Proctored Exam | `rn-hesi-exit-proctored-exam` | 150 |

## Validation Notes

- Dry-run found 51 remaining importable source files, 7,240 questions, no option parse errors, and no declared-count mismatches before upload.
- The first apply command timed out after writing most of the batch; the script resumed safely because it tracks `source.sourceFile`.
- Final dry-run showed all 67 source JSON files as skipped because they were either part of the initial batch or already imported by source file.
- `scripts/validate-exit-exam-import-format.js` verified zero issues after upload: every quiz metadata `questionCount` matched the actual question subcollection count, and sampled question documents matched the normalized bulk-upload shape.
- Validation totals after upload: 67 quizzes and 9,514 questions across the four Exit Exam nested pages.
