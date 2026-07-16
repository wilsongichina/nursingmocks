# Public Page Layout Standards

## Purpose

This document records the shared width standard for the public homepage and company/legal pages.

## Standard

- Public marketing and company pages should use `public-page-container` for their main page sections.
- The shared desktop width token is `--public-page-max-width: 1320px`.
- The shared desktop gutter token is `--public-page-gutter: 6vw`.
- The shared mobile gutter token is `--public-page-gutter-mobile: 28px`.
- Do not nest `public-page-container` inside another `public-page-container`; nested containers make sections narrower than the shared width.
- On the homepage, non-FAQ sections should align to the same public width. The FAQ section may stay centered and narrower for readability.
- Inner reading areas, such as long legal policy content, may stay narrower when readability is more important than full section width.

## Current Scope

The standard has been applied to:

- Homepage
- About
- Contact
- Guarantees
- Privacy Policy
- Terms & Conditions
- Cookie Policy
- Money-Back Guarantee

## Validation

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

## Footer Capitalization Follow-Up

- Standardized shared frontend footer labels to title case.
- Updated `NewFooter` company/legal links to `Privacy Policy`, `Terms & Conditions`, and `Money-Back Guarantee`.
- Updated the legacy `Footer` labels to `FAQs`, `How It Works`, `Terms & Conditions`, and `Money-Back Guarantee`.
- Updated footer body copy to use `Nursing Exit Exams` consistently.
- Standardized related shared frontend navigation and breadcrumb labels so `Terms & Conditions`, `Money-Back Guarantee`, and `Privacy Policy` match the footer.

## Homepage Mobile And Asset Follow-Up

- Added shared public-page guttering to the public header so the logo and mobile menu align with homepage content.
- Reduced the mobile logo height while preserving `object-contain` sizing so the logo fits the top-left header area.
- Updated the mobile menu panel to align with the header height and use the shared public page width.
- Tightened homepage mobile spacing, section padding, and CTA wrapping to reduce horizontal overflow risk.
- Cleaned broken homepage text encoding artifacts so separators and dashes render normally.
- Preferred `/favicon.ico` as the shortcut icon while keeping `/favicon.png` available for PNG and Apple icon metadata.
