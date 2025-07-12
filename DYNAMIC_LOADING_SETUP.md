# Static Page Generation Setup

This document explains how the dynamic pages are now built as static pages at build time instead of fetching data from Firebase at runtime.

## Overview

The pages at `/[serviceId]` and `/[serviceId]/[pageId]` routes were previously client-side components that fetched data from Firebase on each page load, showing a "Loading content from firebase..." message. They have been converted to server-side components that are pre-built at build time.

## How It Works

### 1. Build Script (`scripts/build-static-pages.js`)

This script runs during the build process and:

- Connects to Firebase
- Fetches all pages from the `pages` collection
- Fetches all support pages from the `supportPages` collection
- Saves the data as JSON files in `src/data/`

### 2. Static Data Layer (`src/lib/static-data.ts`)

This module provides the same API as the Firebase operations but reads from static JSON files instead:

- `getServiceContent(serviceId)` - Gets service page content
- `getAllSupportPages()` - Gets all support pages
- `getSupportPageContent(serviceId, pageId)` - Gets specific support page content
- `getAllPages()` - Gets all pages

### 3. Updated Page Components

Both dynamic page components have been converted from client-side to server-side:

#### `src/app/[serviceId]/page.tsx`

- Removed `"use client"` directive
- Removed React hooks (`useState`, `useEffect`)
- Added `generateStaticParams()` to pre-generate all service pages
- Added `generateMetadata()` for SEO optimization
- Data is fetched at build time, not runtime

#### `src/app/[serviceId]/[pageId]/page.tsx`

- Already had `generateStaticParams()` and `generateMetadata()`
- Updated to use static data functions instead of Firebase functions

## Build Process

The build process now includes:

1. **Data Fetching**: The build script fetches all data from Firebase
2. **Static Generation**: Next.js generates static HTML for all pages
3. **No Runtime Dependencies**: Pages load instantly without Firebase calls

## Benefits

- **Performance**: Pages load instantly without Firebase API calls
- **SEO**: Better search engine optimization with pre-rendered content
- **Reliability**: No dependency on Firebase availability at runtime
- **Cost**: Reduced Firebase read operations

## Development

During development, you can still use the dynamic loading by running:

```bash
npm run dev
```

For production builds with static generation:

```bash
npm run build
```

## Adding New Pages

To add new pages:

1. Add content to Firebase collections (`pages` or `supportPages`)
2. Run the build script to fetch the new data
3. The pages will be automatically generated at build time

## Fallback Content

The system includes fallback content for math pages (`mathPageContent`) to ensure pages work even if Firebase is unavailable during build.

## Environment Variables

Make sure these Firebase environment variables are set for the build script:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
