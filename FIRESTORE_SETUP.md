# Firestore Setup and Usage Guide

## Overview

This project now includes Firestore integration for storing and managing the math page content. The admin panel includes direct upload functionality to save content to Firestore.

## Firebase Configuration

The Firebase configuration is located in `src/lib/firebase.ts` and includes:

- Firestore database initialization
- Project configuration for the TeasGurus Firebase project

## Firestore Operations

All Firestore operations are handled in `src/lib/firestore-operations.ts`:

### Available Functions:

1. **`uploadMathPageContent()`** - Uploads the original math page content to Firestore
2. **`uploadCustomMathContent(content)`** - Uploads custom/edited content to Firestore
3. **`getMathPageContent()`** - Retrieves math page content from Firestore
4. **`getAllPages()`** - Retrieves all pages from Firestore

## Database Structure

The content is stored in Firestore with the following structure:

```
/pages/math
├── hero
│   ├── badge
│   ├── title
│   ├── subtitle
│   └── description
├── trustIndicators[]
├── whatToExpect
│   ├── badge
│   ├── title
│   ├── subtitle
│   ├── cards[]
│   └── footer
├── mostCommonQuestions
│   ├── badge
│   ├── title
│   ├── subtitle
│   └── cards[]
├── studyGuide
│   ├── badge
│   ├── title
│   ├── subtitle
│   └── sections[]
├── privacyPricing[]
├── faq
│   ├── title
│   ├── subtitle
│   └── questions[]
├── lastUpdated (timestamp)
└── version (string)
```

## Admin Panel Upload Features

### Upload Buttons

The admin panel now includes two upload buttons in the header:

1. **"Upload Original"** (Emerald Green)

   - Uploads the original math page content from `math-page-content.ts`
   - Useful for initial setup or resetting to original content

2. **"Upload Current"** (Purple)
   - Uploads the currently edited content from the admin panel
   - Saves all changes made in the admin interface

### Features:

- **Loading States**: Buttons show "Uploading..." with spinner during upload
- **Success/Error Messages**: Clear feedback on upload status
- **Disabled State**: Buttons are disabled during upload to prevent multiple uploads
- **Auto-clear Messages**: Success messages automatically clear after 5 seconds

## Usage Instructions

### 1. Initial Setup

1. Login to the admin panel with the password
2. Click "Upload Original" to upload the initial content to Firestore
3. Verify the upload was successful via the success message

### 2. Content Management

1. Make changes to content using the admin panel interface
2. Click "Upload Current" to save your changes to Firestore
3. The content will be stored with a timestamp and version

### 3. Retrieving Content

The content can be retrieved from Firestore using the provided functions:

```typescript
import { getMathPageContent } from "@/lib/firestore-operations";

const result = await getMathPageContent();
if (result.success) {
  const content = result.data;
  // Use the content
}
```

## Security Considerations

- Ensure Firebase security rules are properly configured
- The admin panel is password-protected
- Consider implementing additional authentication for production use

## Troubleshooting

- Check browser console for any Firebase connection errors
- Verify Firebase project configuration
- Ensure Firestore is enabled in your Firebase project
- Check network connectivity for upload operations

## Future Enhancements

- Real-time content synchronization
- Content versioning and rollback
- Multi-user collaboration features
- Content approval workflows
