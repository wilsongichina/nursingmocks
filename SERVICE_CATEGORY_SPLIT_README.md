# Service and Category Field Split Implementation

## Overview

This document describes the implementation of splitting the original "Category (Service)" field into two separate fields: **Category** and **Service**.

## Field Definitions

### Category Field

- **Purpose**: Contains the service page names from the `pages` collection in Firebase
- **Values**: Page IDs like "maths", "science" (from the `pages` collection)
- **Source**: `getAllPages()` function from `pages` collection
- **Usage**: Represents which service page the question belongs to

### Service Field

- **Purpose**: Contains the exam service types (HESI, TEAS)
- **Values**: "hesi", "teas"
- **Source**: `getAllServicesList()` function from `services` collection
- **Usage**: Represents which exam service the question is for

## Data Structure Changes

### Question Form Data Interface

```typescript
interface QuestionFormData {
  // ... other fields
  category: string; // Page name from pages collection (e.g., "maths", "science")
  service: string; // Service slug (e.g., "hesi", "teas")
  // ... other fields
}
```

### Firebase Collections

1. **`pages` collection**: Contains service pages (maths, science, etc.)
2. **`services` collection**: Contains exam services (HESI, TEAS)
3. **`questions/{serviceId}/{questionSlug}`**: Questions stored under service slugs

## Updated Files

### 1. Question Creation Page (`src/app/admin/question/create/page.tsx`)

- **Changes**:
  - Updated imports to use `getAllPages` instead of `getAllQuestionCategories`
  - Modified `loadCategories()` to fetch from `pages` collection
  - Category dropdown now shows page IDs (maths, science, etc.)
  - Service dropdown shows HESI/TEAS from `services` collection

### 2. Question Edit Page (`src/app/admin/question/[questionId]/page.tsx`)

- **Changes**:
  - Updated imports to use `getAllPages` instead of `getAllQuestionCategories`
  - Modified `loadCategories()` to fetch from `pages` collection
  - Category dropdown now shows page IDs (maths, science, etc.)
  - Service dropdown shows HESI/TEAS from `services` collection

### 3. Question Listing Page (`src/app/admin/question/page.tsx`)

- **Changes**:
  - Added "Service" column to display the service field
  - Now shows both Category and Service for each question

### 4. Firebase Operations (`src/lib/firestore-operations.ts`)

- **New Functions**:
  - `getAllServicesList()`: Fetches services from `services` collection
  - `addService()`: Adds new service to `services` collection
  - `getServiceById()`: Gets service by ID
  - `initializeDefaultServices()`: Initializes HESI and TEAS services

## Usage Instructions

### For Question Creation/Editing:

1. **Category Dropdown**: Select from available page names (maths, science, etc.)
2. **Service Dropdown**: Select from available services (HESI, TEAS)

### For Data Storage:

- Questions are stored using the `service` slug as part of the document path
- Example: `questions/hesi/question-slug` or `questions/teas/question-slug`

## Initialization

### Default Services Setup

Run the initialization script to create default HESI and TEAS services:

```bash
node scripts/initialize-services.js
```

Or use the admin interface at `/admin/initialize-services`

## Validation

Both Category and Service fields are required:

- Category must be a valid page ID from the `pages` collection
- Service must be a valid service slug from the `services` collection
