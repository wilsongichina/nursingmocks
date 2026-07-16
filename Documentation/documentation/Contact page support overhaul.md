# Contact Page Support Overhaul

## Update

The public `/contact` page was redesigned to be a focused NursingMocks support page.

## Scope

- Replaced the old dense contact layout with a clearer support-first page.
- Removed the non-functional help search input.
- Added direct support routes for account access, payments, and dashboard help.
- Redesigned the main support request form with readable fields, mobile-safe spacing, inline validation, and inline success/error messages.
- Kept the form submission on `/contact` instead of redirecting users away after submit.
- Removed the attachment upload control because the current backend does not persist uploaded files.
- Updated the contact API route to avoid writing `undefined` values into Firestore contact submissions.
- Preserved the existing `contactSubmissions` collection and contact email job flow.
- Aligned the contact page visuals with the homepage palette: soft `#eef2ff` to `#fdf2ff` hero gradient, white cards, indigo accents, lighter homepage-style shadows, and dark primary actions.
- Updated contact-page typography and capitalization so headings, action labels, form labels, and option labels use consistent title case while helper text and descriptions stay sentence style.
- Hardened the contact form sending path so support requests are still saved and email jobs are still queued even when immediate email delivery cannot run during the request.
- The contact API now reports whether contact emails were sent immediately, queued for worker processing, or need support review.

## Validation

```text
.\node_modules\.bin\tsc.cmd --noEmit
```
