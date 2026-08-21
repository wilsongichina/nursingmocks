# ATI RN Topic Metadata Generation Prompt

Use this file when generating or refreshing ATI RN Nursing Test Bank topic metadata with ChatGPT.

## Goal

Generate natural, useful public-page metadata for ATI RN topic pages before importing topics into Firestore.

Each topic should have:

- `description`: on-page/admin description
- `h1`: public page heading
- `metaTitle`: browser/SEO title
- `metaDescription`: search snippet description
- `slug`: unchanged from the approved topic map

## Input Source

Use the approved ATI RN topic map as the source of truth:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI\ATI RN topic mapping plan.json
```

Required input fields per topic:

- `topic`
- `official`
- `type`
- `bestKeyword`
- `volume`
- `slug`
- `folders`
- `status`
- `importReady`
- `exams`
- `questions`

## Writing Rules

- Write like a real site editor, not like a template.
- Every topic description must sound different from the others.
- Do not start every description the same way.
- Avoid repeated AI-style patterns such as:
  - `This page lists...`
  - `Practice ATI... with rationales covering...`
  - `Review ... covering...`
  - `Prepare with...`
  - long comma chains of generic topic terms
- Use concrete page function language: the page contains, groups, organizes, links to, or collects practice exams for that topic.
- Mention the topic naturally, but do not force the exact same phrase into every field.
- Do not use sets for ATI RN topics; reserve set wording for ATI TEAS and HESI where appropriate.
- Keep the description specific to the page inventory: topic practice exams, practice tests, test bank questions, or practice questions.
- Use `exams` and `questions` only when it helps the wording. Do not overuse counts in every row.
- Do not change the approved `slug`.
- Do not invent ATI product names that are not in the topic map.
- Do not imply affiliation with ATI.
- Keep wording factual, student-friendly, and suitable for NursingMocks.
- Do not use cheating language.
- Do not use: `answers`, `actual exam`, `guaranteed pass`, `leaked`, `dump`, or similar wording.

## Length Targets

| Field | Target |
|---|---:|
| `description` | 110-180 characters |
| `h1` | 40-70 characters |
| `metaTitle` | 45-65 characters |
| `metaDescription` | 135-160 characters |

## Description Style Examples

Good descriptions vary the structure:

- `Pharmacology practice exams are grouped here for medication safety, drug classes, dosage decisions, and nursing interventions.`
- `Use this Med Surg topic hub to find adult-care practice exams by body system, condition type, procedure, and safety focus.`
- `Fundamentals sets are organized here for core nursing skills, safety, infection control, mobility, and documentation review.`
- `Maternal Newborn practice exams in this section focus on pregnancy, labor, postpartum care, newborn checks, and reproductive health.`

Avoid descriptions that all look like this:

- `This page lists ATI [Topic] practice exams for RN students, including [list of topics].`
- `Practice ATI [Topic] questions with rationales covering [list of topics].`

## Batch ChatGPT Prompt

```text
Generate SEO-safe topic metadata for ATI RN nursing test bank public pages.

Use only the provided topic objects as source data.

Rules:
- Do not change the slug.
- Do not invent ATI product names.
- Do not imply affiliation with ATI.
- Do not use "answers", "actual exam", "guaranteed pass", "leaked", "dump", or cheating language.
- Write like a real site editor, not like a template.
- Make every description sound different from the others.
- Do not start every description the same way.
- Avoid repeated AI patterns such as "This page lists...", "Practice ATI... with rationales covering...", and long comma-chain summaries.
- Description must explain that the page contains, groups, organizes, links to, or collects practice exams, practice tests, test bank questions, or practice questions for that topic.
- Use counts only when they make the sentence clearer; do not force counts into every row.
- H1 should be natural and keyword-aligned, 40-70 characters.
- Meta title should be 45-65 characters.
- Meta description should be 135-160 characters.
- Description should be 110-180 characters.
- Return only valid JSON.

Input topics:
[PASTE TOPIC OBJECTS HERE]

Return an array of objects in this exact shape:
[
  {
    "topic": "",
    "slug": "",
    "description": "",
    "h1": "",
    "metaTitle": "",
    "metaDescription": ""
  }
]
```

## Single Topic Prompt

Use this when reviewing one topic at a time.

```text
Generate SEO-safe metadata for this ATI RN Nursing Test Bank topic.

Use only the provided topic object as source data.

Rules:
- Do not change the slug.
- Do not invent ATI product names.
- Do not imply affiliation with ATI.
- Do not use "answers", "actual exam", "guaranteed pass", "leaked", "dump", or cheating language.
- Write like a real site editor, not like a template.
- Do not use the phrase "This page lists" unless there is a strong reason.
- Avoid generic AI phrasing and long comma-chain topic summaries.
- Description must explain that the page contains, groups, organizes, links to, or collects practice exams, practice tests, test bank questions, or practice questions for the topic.
- H1: 40-70 characters.
- Meta title: 45-65 characters.
- Meta description: 135-160 characters.
- Description: 110-180 characters.
- Return only valid JSON.

Input topic:
{
  "topic": "",
  "official": "",
  "type": "",
  "bestKeyword": "",
  "volume": 0,
  "slug": "",
  "folders": [],
  "status": "",
  "importReady": "",
  "exams": 0,
  "questions": 0
}

Return:
{
  "topic": "",
  "slug": "",
  "description": "",
  "h1": "",
  "metaTitle": "",
  "metaDescription": ""
}
```

## Validation Checklist

Before importing topics, validate the generated metadata:

- Every topic has `description`, `h1`, `metaTitle`, and `metaDescription`.
- No generated field changes the approved `slug`.
- No banned wording appears.
- No duplicate `h1` values.
- No duplicate `metaTitle` values.
- Descriptions do not all start with the same phrase.
- Descriptions do not all follow the same sentence pattern.
- `description` states that the page contains/groups/organizes/links to practice exams, practice tests, test bank questions, or practice questions.
- `metaTitle` is 65 characters or fewer unless manually approved.
- `metaDescription` is close to 135-160 characters.
- `description` is close to 110-180 characters.
- Each `h1` and `metaTitle` reads naturally.
- Topic-only import fields are separated from later quiz/question import fields.

## Recommended Import Order

For topic-only import, topics can be created before questions are imported. Keep `status` and `importReady` metadata so later exam/question imports know which topics still need file-level review.

Import first:

- Pharmacology
- Mental Health
- Community Health
- Leadership and Management
- Nutrition
- Anatomy and Physiology
- Dosage Calculations
- Health Assessment
- Pathophysiology
- Nursing Informatics
- Gerontology
- Capstone

Import with review status retained:

- Adult Medical Surgical
- Fundamentals
- Maternal Newborn
- Nursing Care of Children
- Comprehensive Review
- Communication, only if approved as a public topic

## Output Storage

After generation and validation, update:

```text
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI\ATI RN topic mapping plan.json
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI\ATI RN topic mapping plan.md
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI\ATI RN topic mapping plan.html
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI\ATI RN test bank cleanup plan.md
C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI\ATI RN test bank cleanup plan.html
```

Also sync the repo documentation copy:

```text
Documentation\public-sub-pages\ATI RN test bank cleanup plan.md
```

