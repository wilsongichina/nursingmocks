# Nursing Test Bank Cleanup Master Plan

## Purpose

Use this file as the line-by-line working checklist for recreating the ATI RN cleanup workflow across the remaining Nursing Test Bank folders.

The cleanup process must preserve the original Naxlex source folders. Source files should be copied into clean staged folders under:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank
```

Do not move or delete files from:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank
```

## Existing Reference

Completed reference workflow:

```text
RN\ATI
```

Reference outputs:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI
```

Reference project files:

```text
Documentation/public-sub-pages/ATI RN test bank cleanup plan.md
Documentation/public-sub-pages/ATI RN topic metadata generation prompt.md
scripts/stage-ati-rn-cleanup.ps1
scripts/preview-ati-rn-normalized-names.ps1
```

## Remaining Cleanup Groups

Work through these groups in this order:

1. `LPN\ATI`
2. `RN\HESI`
3. `LPN\HESI`
4. `RN\REGULAR`
5. `LPN\REGULAR`
6. `RN\CERTIFICATIONS`

Reason: `LPN\ATI` is closest to the completed `RN\ATI` workflow, so it should be the easiest to replicate first.

## Required Workflow Order

## Important Verification Rule

For Nursing Test Bank work, always verify the lowest relevant visible tier before moving deeper.

Current rule:

```text
Nested page
  -> topics first
  -> then quizzes
  -> then questions
```

When checking whether a page such as `ati-lpn-exams` matches `ati-rn-exams`, start by confirming the topic documents and topic route mappings. Do not jump straight to quiz/question counts until the topic layer is correct.

### 1. Inventory The Source

List every folder and JSON file under the selected source group.

Capture:

```text
source folder
file name
subtopic name
slug
topic_id
question count
root JSON artifacts
parse errors
```

Expected output examples:

```text
lpn-ati-source-inventory.csv
rn-hesi-source-inventory.csv
```

### 2. Identify Correct Public Topic Names

Before copying files into final clean topic folders, identify the correct public/offical-style topic names students should see.

Examples from ATI RN:

```text
Psychology -> Mental Health
Geriatrics -> Gerontology
Physical Assessments -> Health Assessment
Foundations of Nursing -> Fundamentals
Adult Health -> Adult Medical Surgical / Health Assessment / Gerontology
Obstetrics and Pediatrics -> Maternal Newborn / Nursing Care of Children
```

Do not use messy raw source folder names as public topics unless they are intentionally approved.

### 3. Create The Topic Mapping Table

For each group, create a mapping document similar to the ATI RN cleanup plan.

Each row should include:

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

Also create an HTML documentation page for the mapping table when useful for review.

### 4. Define Folder/File Placement Rules

Decide how every raw source folder maps into clean topics.

Allowed actions:

```text
import
exclude
review
duplicate
```

Also flag wrong-vendor or wrong-program files:

```text
HESI inside ATI
ATI inside HESI
RN inside LPN
LPN inside RN
CNA / phlebotomy inside RN test bank
```

### 5. Create Or Reuse The Cleanup Script

Replicate the ATI RN script behavior, but make it reusable where practical.

Expected generated files:

```text
[group]-cleanup-manifest.csv
[group]-cleanup-manifest.json
[group]-cleanup-summary.csv
[group]-root-json-artifacts.csv
```

### 6. Stage Files Into Clean Folders

Copy source JSON files into clean destination folders under:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank
```

Example:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI
C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI
```

The original source folders remain untouched.

### 7. Generate Cleanup Summary

Confirm totals:

```text
source folders
staged files
import files
excluded files
duplicate files
review-needed files
questions per clean topic
```

### 8. Run Duplicate Checks

Check for:

```text
same file hash
same question IDs
same normalized question text
same title
same slug
same content under different folders
```

Generate files such as:

```text
[group]-exact-content-duplicates.csv
[group]-same-name-different-content.csv
[group]-same-content-different-name.csv
[group]-slug-collisions.csv
```

### 9. Generate Normalized Public Names

For every staged exam file, create:

```text
normalizedPublicTitle
normalizedSlug
cardLabel
examType
modifier
sourceFileNumber
questionCount
urlStatus
reviewNotes
```

### 10. Create Simple Review CSV

Create a human review file with only the important columns:

```text
sourceFileName
sourceFolder
destinationTopic
previousName
normalizedPublicTitle
normalizedSlug
questionCount
reviewStatus
```

### 11. Review Problem Rows

Manually review:

```text
duplicates
wrong-vendor files
mixed-topic files
slug collisions
unclear source folders
low-confidence mappings
```

### 12. Update Documentation

For each group, create both markdown and HTML documentation where useful:

```text
RN HESI test bank cleanup plan.md
RN HESI test bank cleanup plan.html
RN Regular test bank cleanup plan.md
RN Regular test bank cleanup plan.html
LPN ATI test bank cleanup plan.md
LPN ATI test bank cleanup plan.html
LPN HESI test bank cleanup plan.md
LPN HESI test bank cleanup plan.html
LPN Regular test bank cleanup plan.md
LPN Regular test bank cleanup plan.html
RN Certifications cleanup plan.md
RN Certifications cleanup plan.html
```

### 13. Maintain This Master Cleanup Index

Update this file as each group moves through the workflow.

Current status:

| Group | Status | Notes |
|---|---|---|
| `RN\ATI` | staged | Reference workflow completed. |
| `LPN\ATI` | imported | Inventory, mapping, staging, duplicate audit, normalized-name preview, `Review Needed` placement, content-based review, final title cleanup, import dry run, blocking question repairs, Firestore import, count audit, and sidebar regeneration completed on 2026-08-18. Imported and verified 14 topics, 266 quizzes, and 13,370 questions; only 22 missing-explanation rows remain for a later explanation pass. |
| `RN\HESI` | pending | Requires HESI-specific public topic naming. |
| `LPN\HESI` | pending | Requires LPN HESI topic mapping. |
| `RN\REGULAR` | pending | Likely needs heavier manual mapping. |
| `LPN\REGULAR` | pending | Likely needs heavier manual mapping. |
| `RN\CERTIFICATIONS` | pending | Keep certification content separate from RN test bank topics. |

### 14. Only After Review: Build Import Script

Do not write Firestore until the mapping, normalized names, duplicate decisions, and import-ready rows are reviewed.

### 15. Regenerate Sidebar/Public Data

After import, regenerate:

```text
public/data/sidebar-data.json
src/lib/data/sidebar-data.ts
```

### 16. Validate Public Pages

Check:

```text
topic pages load
quiz pages load
no raw ugly names
no wrong vendor names
question counts match
sidebar grouping is correct
SEO metadata is correct
```

## HTML Documentation Requirement

For every major cleanup plan, create an HTML review page as well as markdown when the content includes mapping tables, file-placement decisions, or import summaries.

The HTML pages are for easier visual review before import. They should be text-focused, simple, and documentation-style.
