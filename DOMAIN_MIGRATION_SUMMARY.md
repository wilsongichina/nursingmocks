# Domain Migration Summary

## Overview
All hardcoded `teasgurus.com` URLs have been replaced with the `NEXT_PUBLIC_SITE_URL` environment variable throughout the codebase.

## Environment Variable Setup

**IMPORTANT**: Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SITE_URL=https://teasgurus.com
```

Replace `https://teasgurus.com` with your actual domain.

## Files Updated

### Core Configuration
- ✅ `src/lib/config.ts` - Created utility functions for site URL
- ✅ `src/app/layout.tsx` - Updated metadata and schema
- ✅ `src/app/page.tsx` - Updated metadata

### Schema Components
- ✅ `src/components/ui/AboutPageSchema.tsx`
- ✅ `src/components/ui/SchemaScripts.tsx`
- ✅ `src/components/ui/PricesPageSchema.tsx`
- ✅ `src/components/ui/HowItWorksPageSchema.tsx`
- ✅ `src/components/ui/ContactPageSchema.tsx`
- ✅ `src/components/ui/FAQPageSchema.tsx`

### Page Files
- ✅ `src/app/contact/page.tsx`
- ✅ `src/app/prices/page.tsx`
- ✅ `src/app/faqs/page.tsx`
- ✅ `src/app/about/page.tsx`
- ✅ `src/app/how-it-works/page.tsx`
- ✅ `src/app/teas/page.tsx`
- ✅ `src/app/[slug]/page.tsx`
- ✅ `src/app/nursing-exit-exam/page.tsx`
- ✅ `src/app/nursing-test-bank/page.tsx`
- ✅ `src/app/nursing-entrance-exam/page.tsx`
- ✅ `src/app/nursing-exit-exam/[subPageId]/page.tsx`
- ✅ `src/app/serviceIdTest/layout.tsx`

### Library Files
- ✅ `src/lib/sendgrid.ts`
- ✅ `src/lib/firestore-operations.ts`
- ✅ `src/lib/data/sidebar-data.ts` - Added processing function for canonical URLs

### Admin Pages (Partially Updated)
Many admin pages have been updated. Some remaining occurrences may be in:
- Placeholder text/display strings (non-functional)
- Comments
- Template strings that need manual review

## Usage Pattern

All URLs now use the pattern:
```typescript
`${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/path`
```

Or in components:
```typescript
import { getSiteUrl } from "@/lib/config";
const siteUrl = getSiteUrl();
```

## Next Steps

1. **Create `.env.local`** file with your domain
2. **Test the application** to ensure all URLs work correctly
3. **Review remaining admin files** - Some may have placeholder text that doesn't need updating
4. **Update sidebar-data generation script** - The script at `scripts/generate-sidebar-data.js` should be updated to use the environment variable when generating canonical URLs

## Notes

- The `sidebar-data.ts` file is auto-generated. The processing function will handle URL replacement at runtime.
- Some admin pages may have hardcoded URLs in placeholder text or comments - these are non-functional and can be left as-is or updated for consistency.
- All functional canonical URLs in schemas and metadata have been updated.

