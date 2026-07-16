# Shared Layout Hydration Note

## Change

The root app layout now sets `suppressHydrationWarning` on the `<html>` element.

## Reason

Some browser tooling can inject attributes such as `data-page-optimizer-init` on the root `<html>` element before React hydrates. The app already suppressed body-level hydration differences, but the warning occurred at the root element itself.

## Files Changed

- `src/app/layout.tsx`
- `Documentation/documentation/Shared layout hydration note.md`

## Scope

This is a rendering warning fix only. It does not change routes, billing behavior, authentication, data loading, or page content.

## Validation

Completed validation:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- TypeScript passed
