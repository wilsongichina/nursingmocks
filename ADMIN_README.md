# Admin Panel Documentation

## Overview

The admin panel provides a password-protected interface for editing the content of the Math page on the TeasGurus website.

## Access

- **URL**: `/admin`
- **Password**: `teasgurus2024`

## Features

### Authentication

- Password-protected login system
- Secure logout functionality
- Session management

### Content Editing

The admin panel allows you to edit the following sections of the Math page:

#### 1. Hero Section

- **Badge**: The small badge text displayed above the main title
- **Title**: The main heading of the page
- **Subtitle**: The subtitle text below the main title
- **Description**: The detailed description text

#### 2. Trust Indicators

- **Title**: The text for each trust indicator
- **Icon**: Choose from available icon options (Check, Shield, Star, Check Circle)

#### 3. What to Expect Section

- **Badge**: Section badge text
- **Title**: Section title
- **Subtitle**: Section subtitle
- **Footer**: Footer text for the section

#### 4. FAQ Section

- **Title**: FAQ section title
- **Subtitle**: FAQ section subtitle
- **Questions**: Individual FAQ questions with:
  - Question text
  - Answer paragraphs
  - Additional paragraphs (if applicable)
- **Dynamic Management**:
  - Add new FAQ questions
  - Remove existing FAQ questions
  - Add/remove paragraphs within each question
  - Add/remove additional paragraphs

#### 5. Privacy & Pricing Section

- **Cards**: Individual privacy and pricing cards with:
  - Title
  - Icon selection (Check, Shield, Star, Check Circle)
  - Content text
- **Dynamic Management**:
  - Add new privacy/pricing cards
  - Remove existing cards
  - Edit card titles, icons, and content

## How to Use

1. **Login**: Navigate to `/admin` and enter the password
2. **Edit Mode**: Click "Edit Content" to enable editing
3. **Make Changes**: Modify any content fields as needed
4. **FAQ Management**:
   - Click "Add New FAQ Question" to create a new FAQ
   - Use "Remove Question" to delete unwanted FAQs
   - Click "+ Add Paragraph" to add more paragraphs to answers
   - Click "+ Add Additional Paragraph" for extra content
   - Use the "×" buttons to remove individual paragraphs
5. **Privacy & Pricing Management**:
   - Click "Add New Card" to create a new privacy/pricing card
   - Use "Remove Card" to delete unwanted cards
   - Edit card titles, select icons, and modify content
6. **Save**: Click "Save Changes" to save your modifications
7. **Cancel**: Click "Cancel" to discard changes and revert to original content
8. **Logout**: Click "Logout" to securely exit the admin panel

## Technical Details

### File Structure

- **Admin Page**: `src/app/admin/page.tsx`
- **Admin Layout**: `src/app/admin/layout.tsx`
- **Content Source**: `src/lib/math-page-content.ts`
- **Firestore Operations**: `src/lib/firestore-operations.ts`

### Security Notes

- The password is currently hardcoded for demo purposes
- In production, implement proper authentication with environment variables
- Consider adding rate limiting and additional security measures

### Content Persistence

- Content is saved directly to Firestore database
- Changes are immediately available on the math page
- Content is loaded from Firestore with fallback to local content

## Future Enhancements

- User management system
- Content versioning
- Rich text editor for better content formatting
- Image upload functionality
- Content preview before saving
- Real-time content synchronization

## Troubleshooting

- If you can't access the admin panel, verify the password
- If changes aren't saving, check the browser console for errors
- Ensure you're logged in before attempting to edit content
