# NursingMocks Codex Instructions

These instructions apply to all Codex work in this repository.

## Default Workflow

- Inspect the existing implementation before editing.
- Make the smallest safe change that satisfies the request.
- Preserve existing routes, data sources, permissions, loading states, and dynamic generation logic unless the task explicitly asks to change them.
- Do not redesign unrelated UI or refactor unrelated code.
- Do not hardcode data that already has a project source of truth.
- Update the relevant file in `Project Change Log/` when behavior, UI structure, data flow, or user-facing functionality changes.
- Run `.\node_modules\.bin\tsc.cmd --noEmit` after TypeScript or React changes.

## Code Comments

Use helpful comments as a standard, but avoid noisy comments.

Add comments when they explain:

- non-obvious business rules
- why a value is intentionally hardcoded
- why dynamic data must not be replaced
- persistence or database side effects
- permission, entitlement, or subscription logic
- route, slug, or build-time data assumptions
- complex UI state behavior such as mutually exclusive expansion

Do not add comments that only restate obvious code.

Good:

```ts
// Keep exam catalog sections mutually exclusive so the sidebar stays scannable.
```

Avoid:

```ts
// Set the state.
```

## UI Changes

- Match existing component patterns before introducing new UI patterns.
- Keep user dashboard, profile, billing, referrals, progress, and package screens visually consistent.
- Preserve mobile behavior when changing shared layout or sidebar code.
- For sidebar changes, keep catalog sections data-driven from the existing sidebar/catalog source of truth.

## Documentation

- Record completed changes in the relevant project change log.
- Include files changed, behavior updated, validation run, and any assumptions.
- If a change touches shared behavior, mention the affected scope.

## Git Safety

- Do not revert user changes unless explicitly asked.
- Do not run destructive git commands.
- Commit only when the user asks for a commit.
