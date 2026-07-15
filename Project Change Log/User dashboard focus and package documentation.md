# User Dashboard Focus and Package Documentation

## Purpose

This document describes the current user dashboard package taxonomy, recommended focus behavior, and free preview access rules.

## Package Families

The dashboard supports exactly three package families:

- Nursing Entrance Exams
- Nursing Test Bank
- Nursing Exit Exams

Each family displays two package cards in `My Packages`.

## Package Cards

Nursing Entrance Exams:

- HESI A2
- ATI TEAS

Nursing Test Bank:

- RN Exams
- LPN Exams

Nursing Exit Exams:

- RN Exams
- LPN Exam

The package names match the left sidebar structure.

## Free Preview Rules

All package families support free preview.

If a user is not subscribed and does not have an entitlement, each package displays:

- status: `Free preview`
- action: `Start`

If a user has full access through entitlement, active subscription, cancelling subscription with remaining access, or lifetime access, the package displays a full-access state such as:

- `Active`
- `Cancelling`
- `Lifetime`

Expired and past-due accounts do not fall back to free preview:

- expired access displays `Expired`
- past-due access displays `Payment issue`

## Recommended Focus

The editable source of truth for recommended focus is the Profile Account tab:

```text
/profile?tab=account
```

The field shown to the user is:

```text
Program type
```

Program type options are defined in:

```text
src/lib/program-type.ts
```

Current options:

- ATI TEAS
- HESI A2
- Nursing Test Bank
- Nursing Exit Exam

## Firestore Fields

When the user saves the Profile Account form, `updateUserProfileContact` writes:

```text
profile.focus_areas
profile.primary_exam_id
```

The selected program type is stored as the first and only value in:

```text
profile.focus_areas[0]
```

The primary exam id is derived from the selected program type:

- ATI TEAS -> `ati_teas_7`
- HESI A2 -> `hesi_a2`
- Nursing Test Bank -> `null`
- Nursing Exit Exam -> `null`

## Shared Focus Helpers

Shared focus logic lives in:

```text
src/lib/program-type.ts
```

Important exports:

- `PROGRAM_TYPE_OPTIONS`
- `PROGRAM_TYPE_LABELS`
- `PRIMARY_EXAM_LABELS`
- `inferPrimaryExamIdFromProgramType`
- `recommendedFocusLabelFromProgramType`
- `normalizeProgramTypeFromProfile`

Do not duplicate focus labels or primary exam mappings inside page components.

## Dashboard Read Flow

The dashboard subscribes to:

```text
users/{uid}
```

via:

```text
subscribeUserDocument
```

When the profile save completes, Firestore updates the user document. The dashboard receives the live update and rebuilds the dashboard view model from the updated document.

The dashboard uses:

```text
profile.primary_exam_id
profile.focus_areas
```

to display the current recommended focus and to choose relevant recommendations.

## Tests

Program type mapping is covered by:

```text
src/lib/__tests__/program-type.test.ts
```

Dashboard package and free preview behavior is covered by:

```text
src/lib/dashboard/__tests__/dashboard-view-model.test.ts
```

Run:

```text
npm test -- src/lib/__tests__/program-type.test.ts src/lib/dashboard/__tests__/dashboard-view-model.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```
