# TeasGurus Admin Panel

This admin panel provides a comprehensive interface for managing service pages on the TeasGurus website.

## Features

### 1. Password Protection

- Single password protected route at `/admin`
- Password: `teasgurus2024` (should be moved to environment variables in production)
- Session-based authentication using sessionStorage
- Automatic logout functionality

### 2. Services Management (`/admin`)

- **View All Services**: Displays all created service pages with their details
- **Create New Services**: Add new service pages with a template structure
- **Edit Services**: Navigate to individual service editing pages
- **View Live Pages**: Open service pages in new tabs to preview
- **Delete Services**: Remove services from the database (with confirmation)

### 3. Service Editing (`/admin/[serviceId]`)

- **Hero Section**: Edit badge, title, subtitle, and description
- **Trust Indicators**: Add, edit, or remove trust indicator cards
- **What to Expect**: Manage cards with titles, icons, and content arrays
- **FAQ Section**: Create and manage frequently asked questions with multiple paragraphs
- **Real-time Preview**: View changes immediately in the form
- **Save Changes**: Persist changes to Firestore database

## File Structure

```
src/app/admin/
├── layout.tsx              # Password protection and navigation
├── page.tsx                # Services overview and management
├── [serviceId]/
│   └── page.tsx           # Individual service editing
└── api/
    └── auth/
        └── route.ts       # Server-side authentication
```

## Usage

### Accessing the Admin Panel

1. Navigate to `/admin`
2. Enter the admin password: `teasgurus2024`
3. You'll be redirected to the services management page

### Creating a New Service

1. Click "Create New Service" button
2. Enter a service ID (URL slug) and title
3. Click "Create Service" to generate a template
4. The new service will appear in the services list

### Editing a Service

1. Click the "Edit" button next to any service
2. You'll be taken to `/admin/[serviceId]` for that specific service
3. Make changes to any section using the form fields
4. Click "Save Changes" to persist your changes
5. Use "View Page" to see the live version

### Service Content Structure

Each service follows this structure:

```typescript
interface ServiceContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  trustIndicators: Array<{
    title: string;
    icon: string;
  }>;
  whatToExpect: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      icon: string;
      content: string[];
    }>;
    footer: string;
  };
  mostCommonQuestions: {
    badge: string;
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      content: string[];
    }>;
  };
  studyGuide: {
    badge: string;
    title: string;
    subtitle: string;
    sections: Array<{
      title: string;
      icon: string;
      content: string;
    }>;
  };
  privacyPricing: Array<{
    title: string;
    icon: string;
    content: string;
  }>;
  faq: {
    title: string;
    subtitle: string;
    questions: Array<{
      question: string;
      paragraphs: string[];
      additionalParagraphs?: string[];
    }>;
  };
}
```

## Security Considerations

1. **Password Storage**: The admin password is currently hardcoded. In production, move it to environment variables.
2. **Session Management**: Authentication is stored in sessionStorage. Consider implementing server-side sessions for better security.
3. **API Protection**: Add middleware to protect admin API routes.
4. **Input Validation**: Add proper validation for all form inputs.

## Future Enhancements

1. **User Management**: Add multiple admin users with different permission levels
2. **Content Versioning**: Track changes and allow rollbacks
3. **Media Management**: Upload and manage images, icons, and other media
4. **Bulk Operations**: Edit multiple services at once
5. **Analytics**: View page performance and user engagement metrics
6. **Publishing Workflow**: Draft/publish states for content
7. **Rich Text Editor**: WYSIWYG editor for content sections

## Technical Implementation

### Authentication Flow

1. User enters password on `/admin`
2. Password is validated against stored value
3. Authentication state is stored in sessionStorage
4. All admin routes check for authentication
5. Logout clears session and redirects to login

### Data Flow

1. Services are stored in Firestore under the "pages" collection
2. Each service document uses the service ID as the document ID
3. Content is structured according to the ServiceContent interface
4. Changes are immediately saved to Firestore when "Save Changes" is clicked

### Error Handling

- Loading states for all async operations
- Error messages for failed operations
- Success confirmations for completed actions
- Graceful fallbacks for missing content
