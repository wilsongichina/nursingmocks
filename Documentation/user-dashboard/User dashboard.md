# User dashboard

## Scope

This phase replaces the existing `/dashboard` page with the first practical NursingMocks student dashboard.

Branch:

```text
feature/user-dashboard
```

Main route:

```text
/dashboard
```

## Current dashboard architecture discovered

The previous dashboard was a client page at:

```text
src/app/dashboard/page.tsx
```

It used:

- `useAuth` from `src/contexts/AuthContext.tsx`
- `Layout` from `src/components/layout/Layout.tsx`
- hardcoded visual metrics such as study hours, test result percentage, and course count
- a local chart component with placeholder weekly time values

The old dashboard did not load the signed-in user's Firestore profile document and showed fake statistics.

## Existing auth and user data discovered

Authentication is provided by:

```text
src/contexts/AuthContext.tsx
```

Relevant values:

- `currentUser`
- `loading`
- Firebase Auth `uid`
- Firebase Auth `email`
- Firebase Auth `displayName`
- Firebase Auth `emailVerified`

User profile data is stored at:

```text
users/{uid}
```

Type definition:

```text
src/types/user-document.ts
```

User document helper:

```text
src/lib/user-document-firestore.ts
```

The dashboard uses the existing live subscription helper:

```text
subscribeUserDocument(uid, onNext, onError)
```

## Attempt and progress collections discovered

The codebase contains many quiz content collections and admin quiz-management operations under `pillarPages/.../quizzes/.../questions`.

However, this phase did not find a confirmed owner-scoped quiz attempt/result collection such as:

```text
users/{uid}/quizAttempts
quizAttempts
completedExams
userProgress
```

Because a reliable attempt/result data model was not confirmed, the new dashboard does not generate fake recent activity or completed exams.

Instead:

- Recent activity shows a real empty state.
- Completed exams shows a real empty state.
- Performance uses only `users/{uid}.stats`.

## Files created

### Dashboard view model

```text
src/lib/dashboard/dashboard-view-model.ts
```

Purpose:

- Converts Firebase Auth user data and Firestore `users/{uid}` data into a normalized dashboard model.
- Keeps package, billing, entitlement, profile-task, and recommendation interpretation out of the React page.
- Handles missing profile data safely.
- Handles Firestore `Timestamp`, `Date`, string, null, and missing values.
- Avoids exposing raw billing provider IDs or internal subscription references.

### Dashboard tests

```text
src/lib/dashboard/__tests__/dashboard-view-model.test.ts
```

Tests cover:

- name fallback behavior
- primary exam label behavior
- active access derivation
- active package sorting
- honest empty attempt sections
- profile tasks for missing data
- cancelling subscription interpretation

### Documentation

```text
Documentation/User dashboard.md
```

This file documents the dashboard implementation and future work.

## Files modified

### Dashboard page

```text
src/app/dashboard/page.tsx
```

The old placeholder dashboard was replaced with a real user-facing dashboard.

The new page:

- redirects unauthenticated users to `/login`
- subscribes only to the current user's `users/{uid}` document
- builds a normalized dashboard view model
- renders a responsive student dashboard
- does not query other users
- does not write billing, entitlement, subscription, role, or admin fields

## Responsive dashboard update

The dashboard was refined for mobile, tablet, and desktop management without changing data flow or dashboard logic.

Updated behavior:

- The desktop sidebar layout now collapses earlier on tablet widths so account, subscription, recommendation, referral, and support cards do not squeeze the main study area.
- Dashboard action buttons become full width on narrow mobile screens for easier tapping.
- Exam cards, Add exam cards, and modal option cards drop fixed-height pressure on mobile so longer package names, badges, and actions do not overflow.
- The Add exam modal uses three columns on desktop, two columns on tablet, and one column on mobile.

## Capitalization update

Dashboard headings and support labels now follow sentence case unless the copy is a product, exam, or brand name such as ATI TEAS 7, HESI A2, Firebase, or Firestore.

Validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
- Account detail rows stack on narrow screens so labels and values remain readable.
- Recent activity and completed exam sections remain full-width within the main dashboard flow.

Validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Implementation details

### Authentication behavior

The dashboard remains a client-side authenticated page.

Behavior:

1. The page reads `currentUser` and `loading` from `useAuth`.
2. While authentication is loading, it shows a compact loading state.
3. If there is no authenticated user, it redirects to:

```text
/login
```

4. If the user is authenticated, it subscribes to only that user's Firestore profile document:

```text
users/{currentUser.uid}
```

5. It builds the dashboard view model from:

- the Firebase Auth user
- the current user's Firestore document

The page does not accept a UID from the URL and does not use client-provided UID values to load another user's dashboard.

### User-document loading behavior

The dashboard uses:

```text
subscribeUserDocument(currentUser.uid, onNext, onError)
```

This keeps the dashboard live with the current user's profile document.

If the Firestore profile document is missing, the dashboard still renders safely using Firebase Auth data and empty states.

Missing user document behavior:

- first name falls back to Firebase Auth display name or email username
- package/access data falls back to free access
- performance shows empty state
- profile tasks encourage completing setup
- no private or fake data is generated

### View-model responsibility

The dashboard page does not directly interpret billing, entitlements, package status, or profile tasks.

That logic lives in:

```text
src/lib/dashboard/dashboard-view-model.ts
```

The view model is responsible for:

- first-name fallback
- primary exam label mapping
- account status label mapping
- access-status derivation
- package card generation
- package sorting
- continue-action selection
- recommendation generation
- profile-task generation
- referral summary formatting
- performance value normalization
- Firestore timestamp/date conversion

This keeps the React page focused on rendering.

### Package model used in this first version

The dashboard defines a user-facing package catalog in the view model.

Package groups:

- Entrance Exams
- Test Banks
- Exit Exams

Package status values:

- `active`
- `free`
- `expired`
- `locked`
- `cancelling`
- `lifetime`
- `payment_issue`

The UI maps those status values to user-facing labels:

- Active
- Free preview
- Expired
- Locked
- Cancelling
- Lifetime
- Payment issue

Active packages receive stronger visual emphasis through the NursingMocks accent color.

### Entitlement mapping

The first version maps the current known entitlement keys to package access.

Known entitlement keys used:

```text
exam:ati_teas_7
exam:hesi_a2
bundle:all_access
```

Behavior:

- `exam:ati_teas_7` activates ATI TEAS 7.
- `exam:hesi_a2` activates HESI A2.
- `bundle:all_access` activates the full visible package catalog when access is active.

Unknown entitlement keys are not displayed directly to the user.

### Continue-action priority implemented

The requested ideal priority was:

1. resumable attempt
2. recent completed exam
3. next exam in active package
4. selected primary exam
5. browse available exams

Because no confirmed owner-scoped attempt/result model exists yet, the implemented priority is:

1. first active package
2. selected ATI TEAS 7 primary exam
3. selected HESI A2 primary exam
4. Nursing Test Bank focus
5. Nursing Exit Exam focus
6. browse entrance exams fallback

No fake resumable attempt is created.

### Empty-state policy

The dashboard intentionally uses empty states instead of placeholder data.

Empty-state sections:

- Recent activity
- Completed Exams
- Performance, when stats are missing

Reason:

- There is no confirmed real attempt/result source in the codebase yet.
- Showing fake attempts, fake scores, or fake completion history would mislead users.

### Visual design notes

The page uses:

- existing `Layout`
- white cards on a gray page background
- rounded cards
- compact status badges
- responsive two-column layout on desktop
- single-column layout on mobile
- accent color `#6a5cff`
- compact dashboard density rather than a marketing hero

The main visual priority is:

1. Welcome/access status
2. Continue studying
3. Performance metrics
4. My Packages
5. Activity/completed exam empty states
6. Account, recommendations, profile tasks, referrals, support

## Detailed file responsibilities

### `src/app/dashboard/page.tsx`

Responsibilities:

- handles auth loading
- redirects unauthenticated users
- subscribes to the current user's Firestore document
- builds the dashboard view model
- renders all dashboard sections
- renders loading and missing-profile states
- keeps all dashboard actions as navigation only

Important constraints:

- does not write to Firestore
- does not modify quiz attempts
- does not update billing
- does not update entitlements
- does not expose admin data

### `src/lib/dashboard/dashboard-view-model.ts`

Responsibilities:

- defines dashboard-specific TypeScript types
- derives user-facing access state
- maps entitlements to packages
- sorts package cards
- selects the continue action
- builds recommendations
- builds profile tasks
- formats referral values
- normalizes dates
- avoids raw provider/billing identifiers

Important exported items:

```text
buildDashboardViewModel
formatDashboardDate
DashboardViewModel
DashboardPackage
DashboardAccessStatus
```

### `src/lib/dashboard/__tests__/dashboard-view-model.test.ts`

Responsibilities:

- validates dashboard view-model behavior
- tests name fallback behavior
- tests primary exam labels
- tests active access status
- tests active package sorting
- tests empty attempt/result arrays
- tests profile task creation
- tests cancelling subscription interpretation

### `Documentation/User dashboard.md`

Responsibilities:

- documents the dashboard architecture
- documents discovered data sources
- documents unimplemented attempt/result sections
- documents validation results
- records future work

## Dashboard sections implemented

### 1. Welcome header

Shows:

- first name
- primary exam focus when available
- account status badge
- access status badge
- email verification warning when unverified
- account settings link
- support link

Data sources:

- Firebase Auth `displayName`
- Firebase Auth `email`
- Firebase Auth `emailVerified`
- Firestore `full_name`
- Firestore `profile.display_name`
- Firestore `profile.primary_exam_id`
- Firestore `profile.focus_areas`
- Firestore `account_state.status`
- Firestore `auth.email_verified`

Name fallback order:

1. Firestore `profile.display_name`
2. Firestore `full_name`
3. Firebase Auth `displayName`
4. email username
5. `Student`

### 2. Continue studying

Shows the strongest available action.

Current logic:

1. Active package, if available.
2. Selected ATI TEAS 7 primary exam.
3. Selected HESI A2 primary exam.
4. Nursing Test Bank focus.
5. Nursing Exit Exam focus.
6. Browse entrance exams fallback.

Data sources:

- Firestore `entitlements`
- Firestore `profile.primary_exam_id`
- Firestore `profile.focus_areas`
- derived package list

Limitations:

- Does not resume unfinished quiz attempts yet because no confirmed owner-scoped attempt model was found.

### 3. My Packages

Shows package cards for NursingMocks product families.

Product families represented:

- Entrance Exams
- Test Banks
- Exit Exams

Package names represented:

- ATI TEAS 7
- HESI A2
- ATI Fundamentals
- ATI Pharmacology
- ATI Medical-Surgical
- HESI Fundamentals
- HESI Pharmacology
- HESI Medical-Surgical
- HESI LPN Exit
- HESI RN Exit
- ATI LPN Comprehensive Predictor
- ATI RN Comprehensive Predictor

Data sources:

- Firestore `entitlements`
- Firestore `billing.subscription_status`
- Firestore `billing.plan_id`
- Firestore `billing.current_period_end`
- Firestore `billing.cancel_at_period_end`

Behavior:

- active packages are sorted first
- entrance exam cards can show free preview status
- locked/expired/payment issue packages link to plans
- active packages link to the related practice area
- raw entitlement keys are not shown to users

### 4. Performance snapshot

Shows:

- completed attempts
- questions answered
- overall accuracy
- study streak
- last practice date

Data sources:

- Firestore `stats.total_attempts`
- Firestore `stats.total_questions_answered`
- Firestore `stats.accuracy_overall`
- Firestore `stats.streak_days`
- Firestore `stats.last_attempt_at`

When stats are missing or zero, the dashboard shows:

```text
Performance tracking starts after your first practice exam
```

No fake performance values are displayed.

### 5. Recent activity

Current behavior:

- Shows an empty state.

Reason:

- No reliable owner-scoped quiz attempt feed was confirmed in the codebase.

Future requirement:

- Connect this section only after a real attempt/result model exists.

### 6. Completed Exams

Current behavior:

- Shows an empty state.

Reason:

- No reliable owner-scoped completed exam/result collection was confirmed in the codebase.

Future requirement:

- Connect this section only after completed result records are available.

### 7. Recommended for You

Uses simple reliable signals only.

Signals:

- active packages
- selected primary exam ID
- missing exam focus

Data sources:

- Firestore `entitlements`
- Firestore `profile.primary_exam_id`
- Firestore `profile.focus_areas`

The dashboard does not label weak areas because question-level performance data is not available yet.

### 8. Account and subscription summary

Shows safe user-facing subscription information:

- access status
- plan name
- access end date
- manage subscription link
- view plans link

Data sources:

- Firestore `billing.subscription_status`
- Firestore `billing.plan_id`
- Firestore `billing.current_period_end`
- Firestore `billing.cancel_at_period_end`
- Firestore `entitlements`

Not shown:

- payment provider customer IDs
- subscription IDs
- internal billing references
- raw provider records
- card details
- transaction IDs

### 9. Profile tasks

Shows only useful outstanding tasks.

Possible tasks:

- verify email
- add display name
- select exam focus
- set timezone
- set preferences

Data sources:

- Firebase Auth `emailVerified`
- Firestore `auth.email_verified`
- Firestore `full_name`
- Firestore `profile.display_name`
- Firestore `profile.primary_exam_id`
- Firestore `profile.focus_areas`
- Firestore `profile.timezone`
- Firestore `preferences`

The section is hidden when there are no outstanding tasks.

### 10. Referral summary

Shown only when the user has a referral code.

Data sources:

- Firestore `referral_summary.referral_code`
- Firestore `referral_summary.total_referrals`
- Firestore `referral_summary.total_converted`
- Firestore `referral_summary.total_commission_earned`
- Firestore `referral_summary.total_commission_paid`

Referral values are read-only.

### 11. Support links

Links added:

- `/contact`
- `/knowledge-base`
- `/terms-and-conditions`
- `/privacy-policy`

No invented URLs were added.

## Section-by-section data-source table

| Dashboard section | Data source | Real data used now | Empty state used |
| --- | --- | --- | --- |
| Welcome header | Firebase Auth + `users/{uid}` | Yes | No |
| Continue studying | `users/{uid}.entitlements`, `profile.primary_exam_id`, `profile.focus_areas` | Yes | No |
| My Packages | `users/{uid}.entitlements`, `billing` | Yes | No |
| Performance snapshot | `users/{uid}.stats` | Yes | Yes, when stats are missing |
| Recent activity | Attempt/result model not confirmed | No | Yes |
| Completed Exams | Attempt/result model not confirmed | No | Yes |
| Recommended for You | primary exam, focus areas, active packages | Yes | No |
| Account and subscription | `users/{uid}.billing`, `entitlements` | Yes | No |
| Profile tasks | Firebase Auth + profile fields + preferences | Yes | Hidden when no tasks |
| Referral summary | `users/{uid}.referral_summary` | Yes, only when referral code exists | Card omitted |
| Support links | existing application routes | Yes | No |

## Manual review checklist

Use this checklist before approving or committing the dashboard phase.

### Authentication states

- Signed-out user visiting `/dashboard` is redirected to `/login`.
- Signed-in user can load `/dashboard`.
- Admin user can also load the normal user dashboard because admins are still users.

### User document states

- User with complete `users/{uid}` document sees profile, package, access, and stats sections.
- User with missing `users/{uid}` document sees safe fallback UI.
- User with partially populated `users/{uid}` document does not see `undefined`, `NaN`, or invalid dates.

### Access states

- Free user sees free access and preview-oriented cards.
- Active subscriber sees active access.
- Cancelling subscriber with future period end sees cancelling/access-end behavior.
- Past-due subscriber sees payment issue.
- Expired user sees expired/locked package actions.

### Dashboard content states

- Stats display real values only.
- Recent activity does not show fake quiz attempts.
- Completed Exams does not show fake completed exams.
- Profile tasks disappear when all required fields are present.
- Referral summary appears only when a referral code exists.

### Responsive states

- Desktop layout keeps the main dashboard and right column readable.
- Mobile layout stacks cards without horizontal overflow.
- Long package names wrap cleanly.
- Long plan names do not break the card layout.

## Future data model needed for attempts/results

To connect Recent activity and Completed Exams safely, the app needs a confirmed owner-scoped data model.

Recommended structure, subject to the existing quiz engine:

```text
users/{uid}/quizAttempts/{attemptId}
```

Possible fields:

```ts
type QuizAttempt = {
  userId: string;
  quizId: string;
  quizTitle: string;
  productFamily: "entrance" | "test_bank" | "exit_exam";
  productName: string;
  setNumber?: number;
  status: "in_progress" | "completed";
  mode: "timed" | "tutor" | "review";
  currentQuestionIndex?: number;
  totalQuestions: number;
  answeredQuestions: number;
  scorePercent?: number;
  accuracyPercent?: number;
  startedAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
};
```

Security rule expectation:

```text
Only request.auth.uid can read/write their own attempts.
Admins may read only through explicit admin tools or server routes when needed.
```

The dashboard should not connect to this until the structure and rules are confirmed.

## Production caution

This dashboard reads private user profile/account data.

Before deployment, confirm:

- Firestore rules still restrict `users/{uid}` to the owner and admins.
- Normal users cannot read other users' dashboard data.
- Billing provider IDs are not rendered.
- Entitlement keys are mapped to friendly package names.
- No fake attempt data is introduced.
- No dashboard action writes trusted fields from the client.

## Access-status interpretation

The dashboard derives a user-friendly access status from billing and entitlement data.

Possible statuses:

- `active`
- `free`
- `expired`
- `past_due`
- `cancelling`
- `lifetime`
- `none`

Important behavior:

- `billing.subscription_status` is not used as the only access decision.
- Active entitlements can also indicate active access.
- A cancelled subscription with a future access end date is treated as cancelling, not immediately expired.
- Past-due subscriptions show as payment issue.

## Security considerations

The dashboard is owner-scoped.

Security rules followed:

- only reads the current authenticated user's `users/{uid}` document
- does not query all users
- does not read admin user-management data
- does not expose Firebase custom claims
- does not display raw provider billing IDs
- does not write billing fields
- does not write entitlement fields
- does not write role/admin fields
- does not create or modify quiz attempts
- does not weaken Firestore rules

## Validation results

Commands run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test
.\node_modules\.bin\next.cmd build
```

Results:

- TypeScript passed.
- Tests passed.
- Production build passed.

Test summary:

```text
10 test files passed
45 tests passed
```

Build note:

- The first production build attempt compiled successfully but failed during page-data collection with unrelated `PageNotFoundError` module resolution errors across many routes.
- Rerunning the same build command succeeded.
- No dashboard code change was required for that transient build failure.

## Known limitations

- Recent activity is not connected because no reliable owner-scoped attempt model was confirmed.
- Completed Exams is not connected because no reliable owner-scoped result model was confirmed.
- Package progress is not shown because no reliable package-progress source was confirmed.
- Free preview wording assumes the current product rule of previewing the first 10 questions per set.
- Package mapping is based on current entitlement keys and product family routes.
- Advanced recommendations are not implemented because weak-area analytics are not available yet.

## Recommended next phase

1. Define or confirm the quiz attempt/result data model.
2. Ensure attempts are owner-scoped.
3. Add Firestore rules/tests for attempt ownership.
4. Connect recent activity to real attempt data.
5. Connect completed exams to real result data.
6. Add package progress only when reliable progress data exists.
7. Add topic-level recommendations only after question-level performance data exists.

Do not add fake stats or placeholder attempts.

## Follow-up: profile-style dashboard uniformity

Updated after comparing `/dashboard` with `/profile`.

Files changed:

```text
src/app/dashboard/page.tsx
Documentation/User dashboard.md
```

Visual system changes:

- matched the dashboard page background to the profile radial background and page container rhythm
- replaced the dashboard card shell with profile-style rounded white panels and soft shadows
- converted status pills to profile-style dashed pills with compact centered labels
- fixed `Free preview` badge alignment with fixed minimum height, no wrapping, and centered content
- updated primary and secondary dashboard actions to profile-style rounded pill buttons
- changed dashboard metric cards to profile-style dashed stat tiles with circular icon/value treatment
- changed package cards to use dashed violet-tinted rows and compact mode pills
- changed account, referral, recommendation, task, recent activity, and completed-exam rows to shared dashed detail rows
- changed support links to profile-style rounded pill rows
- kept dashboard data behavior unchanged

## User Page UI Design Source Of Truth

All authenticated user-page UI design must be based on the shared typography standard, not page-specific visual experiments.

Primary reference:

```text
/typography
Documentation/user-dashboard/User typography standards.md
```

Shared implementation:

```text
src/app/globals.css
```

Required rule:

- Start every authenticated user page from `/typography`.
- Use the shared `user-*` classes in `src/app/globals.css` before adding page-specific Tailwind utilities.
- Use `user-page` as the outer page wrapper.
- Use `user-page-container` for the page width and padding.
- Use the standard `1360px` maximum width from `--user-page-max-width`.
- Use the shared page header pattern for page hero/header areas.
- Use the shared components for cards, forms, buttons, alerts, badges, pills, tabs, search filters, pagination, modals, loading states, empty states, summary tiles, and progress indicators.
- Sidebar logos should autofit the top-left header area: use a constrained logo box, `object-contain`, max height/width, and overflow protection. Mobile sidebars should show the full logo even if the desktop sidebar was collapsed.
- Keep page-specific styling limited to layout decisions or truly unique page needs.
- If a new pattern is useful across multiple user pages, add it to `/typography` and document it before using it broadly.

Do not introduce a dark hero, a separate standalone visual system, or one-off page theme for normal authenticated user management pages unless the product explicitly creates a new user theme and updates `/typography` first.

Visual source update:

- The shared authenticated-user background now follows `/pricing`: `radial-gradient(circle at top left, #eef2ff, #f5f6fb 40%, #f9fafb 100%)`.
- Shared cards use the pricing page's translucent white surface, light `#e3e5f0` border, and soft slate shadow.
- Shared primary buttons use the pricing page's indigo gradient and shadow language.
- User pages should reuse these surfaces while keeping the larger, more readable authenticated-user typography scale.

Payments page adoption:

- `/payments` uses this shared user account theme for the header, summary tiles, plan cards, transaction history, active access, and access grant panels.
- Transactions remain visible as payment history.
- Subscription management remains hidden because recurring subscriptions are not part of the current customer flow.

## Profile Page Simplification

Updated after auditing `/profile` for user manageability.

Files changed:

```text
src/app/profile/page.tsx
src/lib/profile-view-model.ts
Documentation/user-dashboard/User dashboard.md
```

Decision:

- `/profile` is an account settings page, not a second dashboard.
- Keep only the profile workflows a user naturally expects there: account details, preferences, and security.
- Move payment/access management to `/payments`.
- Move referral management to `/referrals`.
- Keep dashboard-level stats and activity on `/dashboard`.

Profile structure:

- `Account`: display name, full name, email, country, phone, timezone, program type, recommended focus, locale, and bio.
- `Preferences`: notification choices, quiz mode, and explanation default.
- `Manage Password`: password update for email/password users only.

Removed from the normal profile page:

- large overview dashboard
- practice stats cards
- full access entitlement table
- full referral management panel
- sign-in status security tiles
- unfinished MFA action button
- user-facing subscription wording

The left profile summary now shows only identity, study focus, current plan, access end, and links to the dedicated payments and referral pages.

Manage Password tab follow-up:

- removed the sign-in method, email verification, phone verification, and MFA status tiles
- retained only the change-password workflow
- redesigned the password panel with grouped password fields, requirements text, and one primary update action
- renamed the visible tab from `Security` to `Manage Password`

Profile readability follow-up:

- increased form input text from 13px to the shared readable `text-sm` size
- increased helper text where it carries instructions
- increased section titles to `text-xl`
- increased profile summary values and tab labels for easier scanning
- kept compact badges and field labels smaller so the page still feels organized

Profile typography standard follow-up:

- updated `/profile` to use the shared `/typography` user-page standard
- replaced the local radial background and max-width wrapper with `user-page` and `user-page-container`
- replaced the custom profile header with the shared `user-page-header` structure
- replaced local buttons with `user-button-primary` and `user-button-secondary`
- replaced local panels with `user-card`
- replaced local field, helper, and detail-row styling with `user-field`, `user-control`, `user-detail-surface`, `user-label`, and `user-helper`
- replaced local tab styling with `user-tabs` and `user-tab`
- replaced local alerts with `user-alert` variants
- kept the existing profile data flow, tab behavior, save/reset actions, and password update logic unchanged

Profile action feedback visibility follow-up:

- moved account, preferences, and password update feedback above the active profile tab content
- removed duplicate below-form feedback placement so users see save and validation messages immediately
- kept the shared `user-alert` feedback styling
- kept profile persistence, preference save behavior, and password update logic unchanged

Dashboard typography standard follow-up:

- updated `/dashboard` to use the shared `/typography` user-page standard
- replaced the local dashboard background and old `1220px` wrapper with `user-page` and `user-page-container`
- replaced the custom dashboard hero with `user-page-header`
- replaced local cards, metric tiles, package cards, empty states, and detail rows with shared `user-card`, `user-stat-tile`, `user-feature-surface`, `user-detail-surface`, `user-pill`, `user-badge`, and `user-alert` patterns
- replaced local primary and secondary action styles with shared button classes
- updated the loading state to use the shared skeleton pattern
- kept the existing dashboard data flow, package grouping, recommendations, profile tasks, referral visibility, and access logic unchanged

Payments typography standard follow-up:

- updated `/payments` to use the shared `/typography` user-page standard
- replaced the local payments background and old `1220px` wrapper with `user-page` and `user-page-container`
- replaced the custom payments hero with `user-page-header`
- replaced local status pills, summary tiles, plan cards, transaction rows, active access rows, empty states, alerts, and loading states with shared `user-*` typography classes
- improved payment-facing labels so transaction history shows plan/payment method context before internal IDs and checkout readiness language stays user-friendly
- kept billing catalog loading, checkout session creation, active-plan duplicate purchase blocking, billing history loading, and checkout return notices unchanged

Validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result: passed.

## Follow-up: My Exams UI-first page

Implemented the first UI-focused version of the user `My Exams` route.

Files added:

- `src/app/dashboard/my-exams/page.tsx`
- `src/lib/my-exams/get-my-exams.ts`
- `src/lib/my-exams/types.ts`
- `src/lib/my-exams/__tests__/get-my-exams.test.ts`

Files updated:

- `src/components/layout/Sidebar.tsx`

What changed:

- added `/dashboard/my-exams` using the existing authenticated dashboard layout and shared `user-*` typography system
- changed the sidebar `My Exams` item from the old dashboard anchor to the new route
- added a typed My Exams view model that derives access from `users/{uid}.entitlements`
- kept billing status out of exam-access decisions
- added access summary, search, family filter, subject filter, access filter, sort control, and functional status tabs
- added grouped exam cards for Nursing Entrance Exams, Nursing Test Bank, and Nursing Exit Exams
- represented preview-enabled entrance exam content with `Preview` badges and `Start Free Preview` actions
- represented unavailable paid packages in a compact `More exams available` section
- intentionally did not show fake unfinished attempts, completed exams, scores, or progress because no confirmed owner-scoped attempt/result collection exists yet
- kept start/review actions routed into existing page areas instead of duplicating exam-taking logic

Typography follow-up:

- aligned the My Exams tabs with the shared `user-tabs` and `user-tab` typography pattern
- replaced one-off card value text classes with shared `user-card-title` and `user-label` classes
- kept My Exams surfaces, buttons, badges, pills, fields, progress bars, alerts, skeletons, and page shell on the documented user typography standard

Validation:

```text
npm test -- src/lib/my-exams/__tests__/get-my-exams.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- My Exams view-model tests passed.
- TypeScript passed.

## Follow-up: Canonical user entitlements and login tracking

Simplified user package access and added server-side login tracking.

Files added:

- `src/lib/user-entitlements.ts`
- `src/app/api/users/login-event/route.ts`

Files updated:

- `src/types/user-document.ts`
- `src/lib/user-document-firestore.ts`
- `src/contexts/AuthContext.tsx`
- `src/lib/profile-view-model.ts`
- `src/lib/dashboard/dashboard-view-model.ts`
- `src/lib/my-exams/get-my-exams.ts`
- `src/lib/my-exams/__tests__/get-my-exams.test.ts`
- `src/lib/dashboard/__tests__/dashboard-view-model.test.ts`
- `src/lib/server/billing-webhook-state-writer.ts`
- `src/lib/admin/billing-operations.ts`

Entitlement standard:

`users/{uid}.entitlements` should contain only these four package keys:

```text
ati_teas_7
hesi_a2
nursing_test_bank
nursing_exit_exams
```

All Access is represented by setting all four package keys to `true`; it is not stored as `bundle:all_access`.

Compatibility:

- readers normalize older keys such as `exam:ati_teas_7`, `exam:hesi_a2`, `bundle:all_access`, `test_bank:rn`, and `exit_exam:rn` so existing users do not lose access before migration
- new users, webhook writers, and manual admin entitlement operations write only the four canonical keys
- profile entitlement display now shows only the four package entitlements
- dashboard and My Exams access checks use the canonical entitlement helper

Login tracking:

- added `POST /api/users/login-event`
- verifies the Firebase ID token server-side
- writes append-only login history to `user_login_events/{eventId}`
- updates `users/{uid}.last_login_at`, `users/{uid}.last_active_at`, and `users/{uid}.login_metrics`

Tracked login summary fields:

```text
login_metrics.total_logins
login_metrics.last_session_id
login_metrics.last_ip_address
login_metrics.last_ip_hash
login_metrics.last_user_agent
login_metrics.last_device
login_metrics.last_location
login_metrics.last_login_provider
```

Login security telemetry update:

- new login events also store `ip_hash` for privacy-preserving IP comparison
- new login events store `device` summary with device type, browser, and OS inferred from the user agent
- new login events store `location` summary from hosting/CDN request headers when available
- user summaries now keep `login_metrics.last_ip_hash`, `login_metrics.last_device`, and `login_metrics.last_location`
- successful login events refresh `users/{uid}.login_security` with a compact account-sharing detection snapshot for admin visibility
- raw `ip_address` and `last_ip_address` are still preserved for compatibility with the current data model

Current limitation:

- location is based on request headers such as Vercel or Cloudflare geo headers; if the hosting layer does not provide them, location fields remain null
- login-security signals are manual-review indicators only and do not automatically block users
- impossible-travel detection and failed-login tracking are not built yet

Validation:

```text
npm test -- src/lib/my-exams/__tests__/get-my-exams.test.ts src/lib/dashboard/__tests__/dashboard-view-model.test.ts
npm test -- src/lib/billing/__tests__/webhook-state-writer.test.ts src/lib/billing/__tests__/checkout-session.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- My Exams and dashboard view-model tests passed.
- Billing writer and checkout tests passed.
- TypeScript passed.

### Current user cleanup script

Added a Firestore cleanup script for existing `users/{uid}` documents.

Files added/updated:

- `scripts/clean-users-collection.js`
- `package.json`

Dry-run command:

```text
npm run users:clean:dry-run
```

Live apply command:

```text
npm run users:clean:apply
```

The script:

- scans the `users` collection
- rewrites `entitlements` to exactly the four canonical package keys
- maps old `exam:ati_teas_7`, `exam:hesi_a2`, `bundle:all_access`, RN/LPN test bank, and RN/LPN exit exam keys into the canonical package keys
- removes old feature entitlement keys from the rewritten `entitlements` object
- backfills `login_metrics.last_ip_address`, `login_metrics.last_user_agent`, and `login_metrics.last_login_provider`
- preserves existing `login_metrics.total_logins` and `login_metrics.last_session_id` where present
- prints a sample of proposed changes in dry-run mode

Live cleanup result:

```text
npm run users:clean:apply
```

Result:

- scanned 10 current `users` documents
- updated 10 current `users` documents
- converted legacy entitlement keys to the four canonical keys
- preserved the detected `all_access: true` user by setting all four canonical entitlements to `true`
- backfilled the new login metric fields

Verification:

```text
npm run users:clean:dry-run
```

Result:

- scanned 10 current `users` documents
- changed 0 documents

### Manual entitlement UI clarification

During user-table testing, a manually granted `ati_teas_7` entitlement correctly made access active while leaving billing fields empty.

Updated Profile and Payments wording so this state is clearer:

- Profile side summary now shows `Package access` separately from `Paid plan`
- Profile changed `Access ends` to `Billing access ends`
- Payments changed `Plan` to `Paid Plan`
- Payments changed `Access End` to `Billing Access End`
- Payments helper text now explains that manual or payment-granted access can exist without a paid plan or access end date

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed.

## Follow-up: standard user sidebar width

Expanded the shared user sidebar width so longer section labels fit cleanly.

Changes:

- increased the expanded desktop user sidebar from `w-64` to `w-72`
- updated the shared user layout offset from `md:ml-64` to `md:ml-72`
- increased the mobile user sidebar panel to `w-72` with a viewport max width guard
- left the collapsed user sidebar width unchanged at `w-20`
- left the admin sidebar width unchanged

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed.
- static source check confirmed the shared user sidebar and shared user layout offset now use matching widths.

## Follow-up: My Packages taxonomy cleanup

Updated the dashboard package model after confirming the left/sidebar package groups.

Allowed package families:

- Nursing Entrance Exams
- Nursing Test Bank
- Nursing Exit Exams

Dashboard package names now shown under `My Packages`:

- Nursing Entrance Exams: HESI A2
- Nursing Entrance Exams: ATI TEAS
- Nursing Test Bank: RN Exams
- Nursing Test Bank: LPN Exams
- Nursing Exit Exams: RN Exams
- Nursing Exit Exams: LPN Exam

Implementation notes:

- Removed granular package cards such as ATI Fundamentals, ATI Pharmacology, HESI Fundamentals, HESI RN Exit, and ATI RN Predictor from the dashboard package catalog.
- Preserved legacy entitlement mapping by rolling older granular entitlement keys into the matching RN/LPN Test Bank or Exit Exam dashboard package.
- Kept free preview behavior limited to Nursing Entrance Exams.
- Updated dashboard view-model tests to assert the approved package families and names.

Validation run:

```text
npm test -- src/lib/dashboard/__tests__/dashboard-view-model.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- Dashboard view-model tests passed.
- TypeScript passed.

## Follow-up: My Packages section grouping

Updated the dashboard `My Packages` UI so the package taxonomy is easier to scan.

Layout changes:

- replaced the single flat package grid with three grouped sections
- each section now represents one package family:
  - Nursing Entrance Exams
  - Nursing Test Bank
  - Nursing Exit Exams
- each family section displays exactly two package cards
- package cards now use a stable minimum height so the two-card rows align cleanly
- package actions stay pinned to the bottom of each card for visual consistency
- package cards no longer repeat the family name inside every card because the family is now shown as the section heading

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed.

## Follow-up: easier recommended focus changes

Updated the dashboard and profile flow so users can change the recommended focus with fewer clicks.

Changes:

- added a `Recommended focus` row to the dashboard account/subscription panel
- added a direct `Change focus` dashboard button
- changed focus-related dashboard recommendations and profile tasks to link to `/profile?tab=account`
- updated the profile page so `?tab=account` opens the editable Account tab automatically
- centralized primary-focus recommendation metadata in the dashboard view model
- kept the actual focus edit control in the profile `Program type` selector

Validation run:

```text
npm test -- src/lib/dashboard/__tests__/dashboard-view-model.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- Dashboard view-model tests passed.
- TypeScript passed.

## Follow-up: shared recommended focus labels

Cleaned up the recommended-focus display logic so it is not locally hardcoded in the profile page.

Changes:

- moved primary exam labels into `src/lib/program-type.ts`
- added `recommendedFocusLabelFromProgramType(programType)` as the shared focus preview helper
- updated the profile Account tab to use the shared helper
- updated profile and dashboard view models to import the shared primary exam labels
- removed duplicate primary exam label maps from feature files

Behavior:

- ATI TEAS previews as ATI TEAS 7
- HESI A2 previews as HESI A2
- Nursing Test Bank previews as Nursing Test Bank
- Nursing Exit Exam previews as Nursing Exit Exam

Validation run:

```text
npm test -- src/lib/dashboard/__tests__/dashboard-view-model.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- Dashboard view-model tests passed.
- TypeScript passed.

## Follow-up: persist recommended focus primary exam

Fixed the profile save path so changing `Program type` updates the database fields the dashboard uses.

Change:

- `updateUserProfileContact` now writes both:
  - `profile.focus_areas`
  - `profile.primary_exam_id`
- `profile.primary_exam_id` is derived from the selected program type via the shared `inferPrimaryExamIdFromProgramType` helper.

Behavior:

- choosing ATI TEAS saves `primary_exam_id: "ati_teas_7"`
- choosing HESI A2 saves `primary_exam_id: "hesi_a2"`
- choosing Nursing Test Bank saves `primary_exam_id: null`
- choosing Nursing Exit Exam saves `primary_exam_id: null`
- the dashboard live subscription then reads the updated user document and uses the updated focus.

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed.

Additional validation added:

- added `src/lib/__tests__/program-type.test.ts`
- verifies each current program type maps to the correct stored `primary_exam_id`
- verifies each current program type maps to the correct recommended-focus display label

Validation run:

```text
npm test -- src/lib/__tests__/program-type.test.ts src/lib/dashboard/__tests__/dashboard-view-model.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- Program type mapping tests passed.
- Dashboard view-model tests passed.
- TypeScript passed.

## Follow-up: free preview for all exam packages

Updated package access behavior so every exam package supports free preview when the user does not have full access.

Behavior:

- unsubscribed users see `Free preview` for:
  - Nursing Entrance Exams
  - Nursing Test Bank
  - Nursing Exit Exams
- subscribed or entitled users see full-access states such as `Active`, `Cancelling`, or `Lifetime`
- expired or past-due accounts still show restricted/payment states instead of free preview

Validation added:

- dashboard view-model test now verifies free preview across all three package families for a non-subscribed user

Validation run:

```text
npm test -- src/lib/__tests__/program-type.test.ts src/lib/dashboard/__tests__/dashboard-view-model.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- Program type mapping tests passed.
- Dashboard view-model tests passed.
- TypeScript passed.

## Follow-up: dashboard focus/package documentation

Added dedicated documentation for the dashboard focus and package behavior.

Documentation file:

```text
Documentation/User dashboard focus and package documentation.md
```

Documented:

- approved dashboard package families and two-card grouping
- free preview behavior across all package families
- subscribed/full-access behavior
- recommended focus edit flow through `/profile?tab=account`
- Firestore fields updated on profile save
- shared focus helper exports
- dashboard live read flow
- validation commands

## Follow-up: dashboard sidebar structure

Updated the user dashboard sidebar grouping to match the requested structure while keeping the exam catalog data-driven.

Final sidebar structure:

```text
Main
- Dashboard
- My Exams
- Results & Progress

Nursing Entrance Exams
- generated from the existing Nursing Entrance Exam catalog data

Nursing Test Bank
- generated from the existing Nursing Test Bank catalog data

Nursing Exit Exams
- generated from the existing Nursing Exit Exam catalog data

Account
- Profile
- Billing & Subscription
- Referrals
- Help & Support
```

Changes:

- added the `Main` sidebar section with `Dashboard`, `My Exams`, and `Results & Progress`
- moved profile-related links into the `Account` section with `Profile`, `Billing & Subscription`, `Referrals`, and `Help & Support`
- removed the old expandable dashboard account grouping and the separate progress item
- added a dashboard anchor target so `My Exams` links to the existing dashboard packages area
- normalized only the dynamic exam section headings to `Nursing Entrance Exams`, `Nursing Test Bank`, and `Nursing Exit Exams`
- confirmed `Browse Exams` is not present in the dashboard sidebar

Preserved:

- dynamic exam catalog rendering from `pillarPages` and `pillarCategories`
- static sidebar data loading from `/data/sidebar-data.json`
- Firestore fallback loading through the existing pillar/category helpers
- existing category item routes, icons, expand/collapse state, active-link handling, and mobile sidebar behavior
- the build-time sidebar data generation script, `scripts/generate-sidebar-data.js`
- the existing catalog source of truth; generated exam child entries were not manually rewritten in JSX

Files changed:

- `src/components/layout/Sidebar.tsx`
- `src/app/dashboard/page.tsx`
- `Documentation/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed.
- static source checks confirmed `Browse Exams` is absent and the exam sections still use `validPillarPages.map(...)` and `categories.map(...)`

## Follow-up: repository Codex instructions

Added a root Codex instruction file for project-wide defaults.

File added:

- `AGENTS.md`

Documented defaults:

- inspect existing implementation before editing
- make the smallest safe change
- preserve routes, dynamic data sources, permissions, loading states, and build-time generation logic
- update the relevant Documentation after user-facing or behavior changes
- run TypeScript validation after TypeScript or React changes
- use useful code comments for non-obvious business rules, data-source assumptions, persistence, permissions, and complex UI state
- avoid comments that only restate obvious code
- do not commit unless requested

## Follow-up: billing architecture planning

Added a dedicated billing architecture and staged development document.

Documentation file:

```text
Documentation/Billing system architecture and development stages.md
```

Documented:

- provider-agnostic billing architecture
- Stripe as the first trusted server-side provider adapter
- future provider support through adapters rather than arbitrary admin-defined code
- separation of plans, packages, entitlements, gateways, provider price mappings, billing records, transactions, subscriptions, and audit logs
- admin billing routes and customer `/payments` requirements
- dynamic plans and gateway configuration rules
- checkout and webhook security requirements
- price versioning and provider price mapping design
- secret management requirements
- admin authorization and audit logging requirements
- staged development plan from discovery through live-readiness review

## Follow-up: billing Stage 1 audit

Completed the first billing implementation stage: existing-state audit.

Documentation file:

```text
Documentation/Billing stage 1 existing-state audit.md
```

Documented:

- current user billing fields
- current provider billing references
- current flat entitlement model
- current dashboard access logic
- current profile billing display
- current `/payments`, `/prices`, and `/pricing` state
- direct legacy Stripe checkout coupling
- current admin billing visibility
- current API route coverage
- current Firestore rule risk for user billing fields
- reusable pieces for Stage 2
- gaps that must be closed before live billing

No production billing behavior was changed.

## Follow-up: billing Stage 2 internal models

Completed the second billing implementation stage: internal billing models and validation helpers.

Documentation file:

```text
Documentation/Billing stage 2 internal models.md
```

Files added:

- `src/lib/billing/models.ts`
- `src/lib/billing/validation.ts`
- `src/lib/billing/__tests__/validation.test.ts`

Implemented:

- provider-agnostic billing model contracts
- plan, price version, provider mapping, gateway, transaction, subscription, entitlement, and audit log types
- pure validation helpers for billing plans and gateway eligibility
- tests for core plan and gateway validation rules

Validation run:

```text
npm test -- src/lib/billing/__tests__/validation.test.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- billing validation tests passed
- TypeScript passed

No checkout, webhook, provider connection, credential storage, Firestore writes, or live payment behavior was enabled.

## Follow-up: exam sidebar accordion behavior

Updated the exam catalog sidebar expansion behavior.

Changes:

- `Nursing Entrance Exams` is the only exam catalog dropdown open by default
- `Nursing Test Bank` and `Nursing Exit Exams` start closed
- opening any one exam catalog dropdown closes the other two exam catalog dropdowns
- preserved the existing dynamic exam catalog rendering and item click handlers

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed.

## Follow-up: My Exams terminology standard

Updated user-facing dashboard terminology so students see `My Exams` instead of `My Packages`.

Terminology rule:

- user dashboard pages should refer to student content access as `My Exams`, `Exam access`, `Exam areas`, or `Access options`
- avoid `My Packages`, `Package access`, `View Package`, and similar package wording on student-facing screens
- internal billing configuration may still use `packageIds` and package identifiers because those are the entitlement keys used by payment plans and admin configuration

Files changed:

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/my-exams/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/payments/page.tsx`
- `src/lib/profile-view-model.ts`
- `Documentation/user-dashboard/User dashboard.md`

## Follow-up: focused dashboard My Exams cards

Updated the main user dashboard `My Exams` section so it stays focused and easier to manage.

Behavior:

- the dashboard now shows one primary exam card instead of all exam access areas
- if the user has an active exam entitlement, the dashboard shows one active exam card
- if the active entitlement matches the signup-selected exam focus, that selected active exam is preferred
- if the user has no active entitlement, the dashboard shows the signup-selected exam focus when available
- Nursing Test Bank and Nursing Exit Exam signup choices are family-level, so the dashboard uses one representative card while the full list remains available from `My Exams`
- a second `Add exam` card links to `/dashboard/my-exams` so users can browse or add other exam areas
- if no focus exists, the dashboard shows a `Choose exam focus` card linked to profile account settings

Files changed:

- `src/app/dashboard/page.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: dashboard Add exam modal

Changed the dashboard `Add exam` card from a link into an in-page modal.

Behavior:

- clicking `Add exam` now opens a popup instead of navigating to `/dashboard/my-exams`
- the popup displays the other three top-level exam areas, excluding the exam currently shown on the dashboard
- modal options use the same access status badges as the dashboard exam card
- active exam areas link directly to the exam area
- preview exam areas use `Start preview`
- locked, expired, or payment-issue exam areas route to access options
- the modal can be closed with the close button or `Escape`

Files changed:

- `src/app/dashboard/page.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: saved dashboard exam cards

Updated the dashboard `Add exam` flow so added exams remain visible in the dashboard area.

Behavior:

- clicking `Add to dashboard` in the modal saves the selected exam area to `users/{uid}.profile.dashboard_exam_ids`
- the dashboard keeps the original signup/active exam first
- saved dashboard exams render as additional exam cards beside the original exam card
- the add modal excludes every exam area already shown on the dashboard
- if all four top-level exam areas are already visible, the modal shows an empty state instead of duplicate options
- this is a dashboard display preference only; it does not grant paid access, change entitlements, or overwrite `profile.focus_areas`

Data fields:

- `profile.focus_areas`: original signup/profile focus
- `profile.primary_exam_id`: primary ATI TEAS 7 or HESI A2 focus when applicable
- `profile.dashboard_exam_ids`: optional user-managed dashboard card list

Files changed:

- `src/app/dashboard/page.tsx`
- `src/lib/dashboard/dashboard-view-model.ts`
- `src/lib/user-document-firestore.ts`
- `src/types/user-document.ts`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: dashboard exam card remove rules

Updated the dashboard My Exams card management controls.

Behavior:

- the `Add exam` card now has a distinct dashed, violet-tinted design so it does not look like a normal exam card
- manually-added exam cards can be removed only when the card does not have active access
- active, cancelling, and lifetime access cards do not show a remove action
- the original signup/active exam card is not removable because it is not stored as a user-added dashboard card
- removing an eligible exam updates `users/{uid}.profile.dashboard_exam_ids`

Files changed:

- `src/app/dashboard/page.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: full-width dashboard activity sections

Updated the main dashboard layout so activity sections are easier to scan.

Behavior:

- `Recent activity` now renders as its own full-width card
- `Completed Exams` now renders as a separate full-width card below it
- removed the large-screen two-column wrapper that previously placed both cards side by side

Files changed:

- `src/app/dashboard/page.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: hide Tawk chat on logged-in pages

Updated the global Tawk chat loader so authenticated users do not see the public chat widget inside logged-in app pages.

Behavior:

- signed-out visitors can still load the Tawk chat widget
- once Firebase Auth has a current user, the Tawk component does not inject the script
- if Tawk was already injected before login, the component removes Tawk scripts, iframes, widget containers, and the local positioning style
- no dashboard, profile, payments, or other authenticated page needs local Tawk handling

Files changed:

- `src/components/ui/TawkToChat.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: login success state styling

Updated the login success confirmation to match the shared user-page visual system.

Behavior:

- the active `/login` success screen now uses `user-page`, `user-card`, `user-page-title`, and `user-alert-success`
- the reusable `LoginForm` success state uses the same card and alert pattern
- removed the old standalone SVG/emoji success treatment
- redirect behavior after successful email or Google login remains unchanged

Files changed:

- `src/app/login/LoginPageClient.tsx`
- `src/components/ui/LoginForm.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: login page typography redesign

Redesigned `/login` to match the shared user-page typography system.

Behavior:

- replaced the old one-off login layout with `user-page`, `user-page-container`, `user-page-header`, `user-card`, `user-detail-surface`, `user-field`, `user-button-primary`, and `user-button-secondary`
- added a cleaner left-side summary for `My Exams`, `Progress`, and `Payments`
- updated loading, error, and success states to use shared skeletons and alert patterns
- preserved email/password login, Google login, remember-me behavior, safe `returnTo` redirect handling, and success redirect timing
- removed corrupted decorative characters from the login UI

Files changed:

- `src/app/login/LoginPageClient.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: register page typography redesign

Redesigned `/register` to match the shared user-page typography system.

Behavior:

- replaced the old one-off register layout with `user-page`, `user-page-container`, `user-page-header`, `user-card`, `user-detail-surface`, `user-field`, `user-button-primary`, and `user-button-secondary`
- added a cleaner left-side summary for focus selection, progress tracking, and access management
- updated loading, error, and success states to use shared skeletons and alert patterns
- preserved email/password registration, Google registration, program type selection, terms validation, welcome-email call, and dashboard redirect timing
- removed corrupted decorative characters from the active register UI

Files changed:

- `src/app/register/RegisterPageClient.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: register page exam naming cleanup

Updated `/register` copy for correct exam names and capitalization.

Behavior:

- changed `Pick a focus` to `Pick an Exam Focus`
- changed the focus helper to use `ATI TEAS 7`, `HESI A2`, `Nursing Test Bank`, and `Nursing Exit Exams`
- standardized visible labels such as `Sign Up`, `Full Name`, `Email Address`, `Confirm Password`, and `Program Type`
- updated register validation copy to use `Program Type`

Files changed:

- `src/app/register/RegisterPageClient.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: forgot password typography redesign

Redesigned `/forgot-password` to match the shared user-page typography system.

Behavior:

- replaced the old one-off forgot-password layout with `user-page`, `user-page-container`, `user-page-header`, `user-card`, `user-detail-surface`, `user-field`, and `user-button-primary`
- updated loading, error, and success states to use shared skeletons and alert patterns
- corrected exam naming to `ATI TEAS 7`, `HESI A2`, `Nursing Test Bank`, and `Nursing Exit Exams`
- removed corrupted decorative characters from the active forgot-password UI
- preserved password reset validation, Firebase reset email behavior, and redirect behavior for already-authenticated users

Files changed:

- `src/app/forgot-password/ForgotPasswordPageClient.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: register exam type wording

Updated register-page wording from `Program Type` to `Exam Type`.

Behavior:

- active `/register` page now labels the focus selector as `Exam Type`
- validation messages now ask users to select an `Exam Type`
- reusable legacy `RegisterForm` user-facing text was updated for consistency
- internal state and auth parameters still use existing `program` / `programType` names to preserve data flow

Files changed:

- `src/app/register/RegisterPageClient.tsx`
- `src/components/ui/RegisterForm.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: password visibility controls

Added view/hide controls to password-entry fields where users need to confirm what they typed.

Behavior:

- `/login` now lets users show or hide the password before signing in
- `/register` now lets users show or hide both password and confirm-password fields
- reset-password form now lets users show or hide both new-password and confirm-password fields
- reusable legacy login/register form components were updated so alternate render paths stay consistent
- visibility controls use button elements with `aria-label` and `aria-pressed`; submit behavior and validation are unchanged

Files changed:

- `src/app/login/LoginPageClient.tsx`
- `src/app/register/RegisterPageClient.tsx`
- `src/components/ui/LoginForm.tsx`
- `src/components/ui/RegisterForm.tsx`
- `src/components/ui/ResetPasswordForm.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: forgot-password and reset-password flow review

Reviewed the password recovery flow and aligned the reset step with the shared user-page typography system.

Behavior:

- `/forgot-password` still validates email format and sends Firebase password reset email through the existing auth context
- Firebase reset links continue to target the current browser origin plus `/reset-password` during local testing
- non-browser fallback reset URL now uses `NEXT_PUBLIC_SITE_URL` when available and falls back to the NursingMocks domain
- `/reset-password` now uses the same `user-page`, `user-page-container`, `user-card`, alert, field, skeleton, and button patterns as the other user auth pages
- reset-password form keeps Firebase `oobCode` verification, password length validation, password match validation, success redirect to `/login`, and view/hide password controls
- forgot-password and reset-password metadata was updated from the old TEAS Gurus copy to NursingMocks

Files changed:

- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/reset-password/ResetPasswordPageClient.tsx`
- `src/components/ui/ResetPasswordForm.tsx`
- `src/contexts/AuthContext.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: NursingMocks password reset email delivery

Moved password reset email delivery from Firebase's default email sender to the NursingMocks transactional email queue.

Behavior:

- `/forgot-password` now calls `POST /api/auth/password-reset` through the auth context instead of Firebase client-side `sendPasswordResetEmail`
- the server route validates and rate-limits the request, generates the Firebase password reset action link with Firebase Admin, queues a `password_reset` email job, and processes due jobs through the existing Resend worker
- users see a generic success message so the UI does not reveal whether an email address exists
- the reset email uses a new NursingMocks `password_reset` template in the code-controlled template registry
- `/reset-password` now accepts password reset action links even if the browser already has an authenticated session
- reset-password validation now requires at least 8 characters, matching registration
- reset-password verifies the Firebase action mode before processing the `oobCode`

Files changed:

- `src/app/api/auth/password-reset/route.ts`
- `src/app/api/auth/password-reset/__tests__/route.test.ts`
- `src/app/forgot-password/ForgotPasswordPageClient.tsx`
- `src/app/reset-password/ResetPasswordPageClient.tsx`
- `src/components/ui/ResetPasswordForm.tsx`
- `src/contexts/AuthContext.tsx`
- `src/lib/email/jobs.ts`
- `src/lib/email/template-registry.ts`
- `src/lib/email/__tests__/template-registry.test.ts`
- `Documentation/email/Transactional email system documentation.md`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
npm test -- src/app/api/auth/password-reset/__tests__/route.test.ts src/lib/email/__tests__/template-registry.test.ts
```

## Follow-up: reset-password field icon cleanup

Removed the left lock icons from the reset-password inputs so typed password text remains fully clear.

Behavior:

- new-password and confirm-password fields no longer show decorative left-side lock icons
- input text now uses the normal field padding with no left-side visual obstruction
- password visibility toggles and reset validation behavior are unchanged

Files changed:

- `src/components/ui/ResetPasswordForm.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: mobile auth form optimization

Optimized the active authentication forms for small screens while preserving the desktop typography layout.

Behavior:

- login, register, forgot-password, and reset-password now use `100svh`-aware mobile layouts
- login, register, and forgot-password show the form card before the supporting hero copy on mobile
- supporting feature tiles are hidden on small screens and restored from the `sm` breakpoint upward
- mobile card padding is slightly tighter, while desktop spacing remains unchanged
- reset-password aligns near the top on mobile so the form is visible sooner

Files changed:

- `src/app/login/LoginPageClient.tsx`
- `src/app/register/RegisterPageClient.tsx`
- `src/app/forgot-password/ForgotPasswordPageClient.tsx`
- `src/app/reset-password/ResetPasswordPageClient.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: mobile Google button icon

Replaced the remote Google sign-in icon on active auth pages with a local inline SVG component.

Behavior:

- login and register Google buttons no longer depend on loading `https://www.gstatic.com/.../google.svg`
- the icon renders consistently on mobile and desktop
- Google sign-in/sign-up behavior is unchanged

Files changed:

- `src/components/ui/GoogleMark.tsx`
- `src/app/login/LoginPageClient.tsx`
- `src/app/register/RegisterPageClient.tsx`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Follow-up: favicon route conflict

Resolved the Next.js `/favicon.ico` conflict.

Behavior:

- removed the duplicate App Router favicon file
- kept `public/favicon.ico` as the single `/favicon.ico` source
- root layout metadata continues to reference `/favicon.ico` and `/favicon.png`

Files changed:

- `src/app/favicon.ico`
- `Documentation/user-dashboard/User dashboard.md`

Validation run:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
