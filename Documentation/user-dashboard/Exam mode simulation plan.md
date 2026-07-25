# Exam Mode Simulation Plan

## Purpose

Exam Mode is the full test-taking simulation for NursingMocks quiz sets. It should feel different from Review Mode:

- Exam Mode is for taking the set under exam-like conditions.
- Review Mode is for learning, checking explanations, and practicing without exam pressure.
- Both modes use the same quiz questions and access rules.
- My Exams should route into the quiz experience; it must not duplicate quiz-taking logic.

## Route Behavior

My Exams should link modes with query parameters:

```text
Exam Mode   -> /quiz-slug?mode=exam
Review Mode -> /quiz-slug?mode=review
```

The dynamic quiz route should read `mode` and pass it into the quiz component.

Supported mode values:

- `exam`
- `review`

Fallback:

- If `mode` is missing or invalid, default to `review`.
- Do not block the user because of a malformed mode query.

## Question Loading

Questions should load only when the user opens the quiz route.

My Exams loads only catalog metadata:

- title
- subject
- set number
- slug
- question count
- preview percentage
- access product ID

The quiz route loads question documents for the selected quiz.

This keeps `/dashboard/my-exams` fast even when TEAS/HESI has many sets.

## Access Rules

The access layer remains shared across modes.

Paid access:

- user can access the full question set
- Exam Mode can use all available questions
- Review Mode can use all available questions

Preview access:

- user can access only the calculated preview question count
- preview count is based on percentage of total questions
- no hidden full access through query parameters

Locked access:

- user should not start Exam Mode or Review Mode
- show the existing access CTA
- do not load protected full question payloads for locked users

## Exam Mode Experience

Exam Mode should simulate a real exam attempt.

Core behavior:

- show an exam start screen before questions begin
- explain number of questions, timer, and submission rules
- require the user to click `Start Exam`
- start the timer only after the user starts
- hide explanations while answering
- do not reveal correctness while answering
- allow question navigation
- allow answer changes before final submission
- show unanswered count before final submit
- require confirmation before final submit
- lock the attempt after final submission
- show results after submission

Exam Mode should not show:

- instant answer feedback
- explanations after each question
- learning hints during the exam
- review-only labels or study copy

## Review Mode Experience

Review Mode is the learning mode.

Core behavior:

- no strict exam start gate required
- no required timer
- explanations can be shown after answering or after submission
- correctness can be shown during review
- user can move through questions more freely
- user-facing copy should focus on practice and learning

Review Mode should not pretend to be a full exam simulation.

## Timer Plan

Initial implementation can support a calculated timer.

Recommended timer source order:

1. quiz-level `estimatedMinutes`
2. subject-level default duration
3. calculated duration from question count

Suggested default:

```text
1 minute per question
minimum 10 minutes
```

Timer behavior:

- starts when the user clicks `Start Exam`
- persists in attempt state
- warns when 5 minutes remain
- auto-submits when time expires only after autosave exists

Do not add aggressive auto-submit until answer persistence is stable.

## Attempt State

Exam Mode needs an attempt record.

Suggested Firestore structure:

```text
users/{uid}/exam_attempts/{attemptId}
```

Suggested fields:

```ts
{
  quizId: string;
  slug: string;
  examAccessProductId: string;
  mode: "exam" | "review";
  status: "in_progress" | "submitted" | "abandoned";
  questionCount: number;
  answeredCount: number;
  startedAt: Timestamp;
  lastActivityAt: Timestamp;
  submittedAt?: Timestamp;
  durationSeconds?: number;
  remainingSeconds?: number;
  scorePercent?: number;
  correctCount?: number;
}
```

Suggested answer subcollection:

```text
users/{uid}/exam_attempts/{attemptId}/answers/{questionId}
```

Suggested answer fields:

```ts
{
  questionId: string;
  selectedAnswer: unknown;
  answeredAt: Timestamp;
  isCorrect?: boolean;
}
```

Important:

- preserve attempt history
- do not overwrite older submitted attempts
- new retakes should create new attempts
- continue actions should resume only `in_progress` attempts

## Autosave

Exam Mode should autosave answers.

Recommended behavior:

- save answer when user selects or changes an answer
- save navigation/progress periodically
- update `lastActivityAt`
- show a subtle saved state
- recover in-progress attempt after refresh

Do not rely only on local React state for Exam Mode.

## Results

After submission, show a focused result summary:

- score percentage
- correct answers out of total
- time taken
- unanswered count
- Review Results button
- Retake button when allowed

Detailed analytics belong on Results & Progress, not inside My Exams.

## My Exams Integration

My Exams cards should route as follows:

```text
Exam Mode   -> href + "?mode=exam"
Review Mode -> href + "?mode=review"
```

Button behavior:

- locked: no Exam Mode button, show access option
- preview: `Start Free Preview` may default to Review Mode unless explicitly designed for preview exam mode
- full access: show both Exam Mode and Review Mode

## Preview Behavior

Preview users should still be able to try questions, but do not imply they are taking the full exam.

Recommended:

- Preview users see `Start Free Preview`
- preview route uses review-style behavior by default
- if `mode=exam` is requested by a preview user, limit to preview questions and label clearly as preview

## Security And Data Rules

Do not trust query parameters for access.

The server/client access layer must verify:

- authenticated user
- entitlement or preview access
- quiz access product
- allowed question count

Do not expose:

- locked full question sets
- other users' attempts
- billing internals
- admin-only content

## Implementation Stages

### Stage 1: Mode Routing

- update My Exams buttons to use `?mode=exam` and `?mode=review`
- read mode on dynamic quiz route
- pass mode into quiz component
- default invalid/missing mode to review

### Stage 2: UI Shell

- add mode-aware labels
- add Exam Mode start screen
- hide explanations during Exam Mode
- keep Review Mode learning behavior

### Stage 3: Attempt Records

- create owner-scoped attempt records
- autosave answers
- resume in-progress attempts
- submit attempts

### Stage 4: Timer

- add timer source
- persist timer state
- warn near expiry
- defer auto-submit until autosave is proven stable

### Stage 5: Results

- calculate score on submission
- store submitted summary
- show result summary
- link deeper analytics to Results & Progress

### Stage 6: My Exams Progress

- show Not Started, In Progress, Completed, and Retake Available from real attempts
- show progress count from saved attempts
- continue latest in-progress attempt

## Testing Checklist

- paid user starts Exam Mode
- paid user starts Review Mode
- preview user cannot access full set
- locked user cannot load protected questions
- refresh during Exam Mode restores attempt
- final submit locks attempt
- retake creates a new attempt
- My Exams reflects in-progress attempt
- My Exams reflects completed attempt
- timer does not start before clicking Start Exam
- invalid `mode` query falls back to Review Mode

## Current Decision

Exam Mode is the full simulation mode for the exam set.

Review Mode is the learning mode.

Both modes reuse the same quiz content and route. The mode changes behavior, not the content source.
