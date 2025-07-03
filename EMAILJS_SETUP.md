# EmailJS Setup Guide

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" as your email service
4. Connect your Gmail account (azmeerhamasali@gmail.com)
5. Note down your **Service ID** (e.g., "service_abc123")

## Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template:

**Subject:** New Contact Form Submission - TEAS Gurus

**HTML Template:**

```html
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Budget:</strong> {{budget}}</p>
<p><strong>Services:</strong> {{services}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>
```

4. Save the template and note down your **Template ID** (e.g., "template_xyz789")

## Step 4: Get Public Key

1. Go to "Account" → "API Keys"
2. Copy your **Public Key** (e.g., "user_def456")

## Step 5: Update ContactForm Component

Replace the placeholder values in `src/components/ui/ContactForm.tsx`:

```javascript
// Replace these values with your actual EmailJS credentials:
const result = await emailjs.send(
  "YOUR_SERVICE_ID", // Replace with your Service ID
  "YOUR_TEMPLATE_ID", // Replace with your Template ID
  templateParams,
  "YOUR_PUBLIC_KEY" // Replace with your Public Key
);
```

## Step 6: Uncomment EmailJS Code

In the ContactForm component, uncomment the EmailJS implementation and remove the simulation code.

## Example Configuration:

```javascript
const result = await emailjs.send(
  "service_abc123", // Your Service ID
  "template_xyz789", // Your Template ID
  templateParams,
  "user_def456" // Your Public Key
);
```

## Testing:

1. Fill out the contact form on your website
2. Submit the form
3. Check your Gmail inbox (azmeerhamasali@gmail.com)
4. You should receive the email with all form details

## Free Plan Limits:

- 200 emails per month
- Perfect for most small to medium websites

## Support:

If you need help, EmailJS has excellent documentation and support at [docs.emailjs.com](https://docs.emailjs.com/)
