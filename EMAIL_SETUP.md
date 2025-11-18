# Email Setup Guide - SendGrid

## Overview

This application uses SendGrid to send emails for:

1. Contact form submissions
2. Welcome emails for new user registrations

Follow these steps to complete the setup.

## Step 1: Create a SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/) and sign up for a free account
2. Complete the account verification process
3. Verify your email address

## Step 2: Create a SendGrid API Key

1. Log in to your SendGrid dashboard: https://app.sendgrid.com/
2. Navigate to **Settings** → **API Keys** (or go directly to https://app.sendgrid.com/settings/api_keys)
3. Click **Create API Key**
4. Give your API key a name (e.g., "TEAS Gurus Production" or "TEAS Gurus Development")
5. Select **Full Access** permissions (or at minimum, **Mail Send** permissions)
6. Click **Create & View**
7. **IMPORTANT**: Copy the API key immediately - you won't be able to see it again! It will look like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 3: Verify Your Sender Identity

SendGrid requires you to verify your sender email address or domain before you can send emails.

### Option A: Single Sender Verification (Easier for testing)

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender**
3. Fill in the form:
   - **From Email Address**: The email address you want to send from (e.g., `noreply@teasgurus.com` or `teasgurus@gmail.com`)
   - **From Name**: TEAS Gurus (or your preferred name)
   - **Reply To**: The email where you want replies to go (e.g., `teasgurus@gmail.com`)
   - **Company Address**: Your company address
   - **City, State, Zip, Country**: Your location details
4. Click **Create**
5. Check your email inbox and click the verification link in the email from SendGrid
6. Once verified, you can use this email address as your `SENDGRID_FROM_EMAIL`

### Option B: Domain Authentication (Recommended for production)

1. Go to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Click **Authenticate Your Domain**
3. Select your DNS provider (or choose "Other" if not listed)
4. Follow the instructions to add DNS records to your domain
5. Once verified, you can send from any email address on that domain

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
# SendGrid Configuration (REQUIRED)
SENDGRID_API_KEY=SG.your_api_key_here

# Optional: Sender email (must be verified in SendGrid)
# Default: azmeerhamasaliltd@gmail.com (your verified sender profile)
SENDGRID_FROM_EMAIL=azmeerhamasaliltd@gmail.com

# Optional: Contact form recipient email
# Default: azmeerhamasali@gmail.com
# Change this to receive contact form submissions at a different email
SENDGRID_TO_EMAIL=azmeerhamasali@gmail.com

# Optional: Custom login URL (defaults to https://www.teasgurus.com/login)
NEXT_PUBLIC_LOGIN_URL=https://www.teasgurus.com/login
```

### Environment Variable Descriptions:

- **SENDGRID_API_KEY** (Required): Your SendGrid API key from Step 2
- **SENDGRID_FROM_EMAIL** (Optional): The verified email address to send from. Defaults to `azmeerhamasaliltd@gmail.com` (your verified sender profile) if not set. **Must be a verified sender in SendGrid.**
- **SENDGRID_TO_EMAIL** (Optional): The email address where contact form submissions will be sent. Defaults to `azmeerhamasali@gmail.com` if not set. **To change where contact form emails are sent, simply update this value.**
- **NEXT_PUBLIC_LOGIN_URL** (Optional): The login URL used in welcome emails. Defaults to `https://www.teasgurus.com/login` if not set

### Changing the Contact Form Recipient Email

To change where contact form submissions are sent:

1. Open your `.env.local` file
2. Update the `SENDGRID_TO_EMAIL` value to your desired email address:
   ```env
   SENDGRID_TO_EMAIL=your-new-email@example.com
   ```
3. Restart your development server
4. The contact form will now send emails to the new address

## Step 5: Test the Setup

1. Make sure your `.env.local` file is configured with the correct values
2. Start your development server: `npm run dev`
3. Go to the contact page and submit a test form
4. Check if the email is received at the `SENDGRID_TO_EMAIL` address
5. Check the browser console and server logs for any errors
6. Register a new user account to test the welcome email

## Troubleshooting

### Common Issues:

1. **"Email service not configured" error**:

   - Make sure `SENDGRID_API_KEY` is set in your `.env.local` file
   - Restart your development server after adding environment variables

2. **"Failed to send email" error**:

   - Verify your API key is correct and has the right permissions
   - Check that your sender email is verified in SendGrid
   - Check SendGrid dashboard for any error messages

3. **Emails not received**:

   - Check spam/junk folder
   - Check SendGrid dashboard → **Activity** to see email delivery status
   - Verify your sender identity is fully verified
   - Check that the recipient email address is valid

4. **"Unauthorized" or "403 Forbidden" errors**:

   - Your API key might not have the correct permissions
   - Create a new API key with "Full Access" or at minimum "Mail Send" permissions

5. **"Sender email not verified" error**:
   - Complete the sender verification process in SendGrid
   - Make sure you clicked the verification link in your email
   - Wait a few minutes after verification for changes to propagate

### Security Notes:

- **Never commit your `.env.local` file to version control**
- The `.env.local` file is already in `.gitignore`
- Keep your SendGrid API key secure and never share it publicly
- Use different API keys for development and production environments
- Rotate your API keys periodically for security

## Email Templates

The application includes built-in HTML email templates for:

### Contact Form Email

- **To**: Email address specified in `SENDGRID_TO_EMAIL` (defaults to `teasgurus@gmail.com`)
- **From**: Email address specified in `SENDGRID_FROM_EMAIL` (defaults to `noreply@teasgurus.com`)
- **Reply-To**: The email address from the contact form
- **Subject**: "New Contact Form Submission - TEAS Gurus"
- **Content**: Includes all form fields (name, email, phone, budget, services, message)

### Welcome Email

- **To**: New user's email address
- **From**: Email address specified in `SENDGRID_FROM_EMAIL` (defaults to `noreply@teasgurus.com`)
- **Subject**: "🎉 Welcome to TEAS Gurus — Your Account Is Ready!"
- **Content**: Welcome message with login link and feature overview

## Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform (Vercel, Netlify, etc.):

   - Go to your project settings
   - Navigate to Environment Variables
   - Add all the variables from Step 4

2. **Use a production API key**:

   - Create a separate API key in SendGrid for production
   - Use a more restrictive name like "TEAS Gurus Production"
   - Set it in your production environment variables

3. **Verify your domain** (recommended):

   - Complete domain authentication in SendGrid
   - This improves email deliverability and allows you to send from any email on your domain

4. **Test both emails** in production:

   - Submit a contact form
   - Register a new user account
   - Verify emails are received correctly

5. **Monitor email delivery**:
   - Check SendGrid dashboard → **Activity** regularly
   - Set up email alerts for bounces or blocks
   - Monitor your sender reputation

## SendGrid Free Tier Limits

The free SendGrid plan includes:

- **100 emails per day** (forever)
- All core features
- Email API access
- Email activity tracking

If you need to send more than 100 emails per day, consider upgrading to a paid plan.

## Support

If you encounter issues:

1. Check SendGrid documentation: https://docs.sendgrid.com/
2. Check SendGrid dashboard for error messages and activity logs
3. Verify all environment variables are correctly set
4. Check the browser console and server logs for error messages
5. Contact SendGrid support if you have account or API issues

## Migration from EmailJS

If you were previously using EmailJS:

1. ✅ EmailJS code has been replaced with SendGrid
2. ✅ All API routes now use SendGrid
3. ✅ Contact form now uses the API route instead of client-side EmailJS
4. ⚠️ Remove `@emailjs/browser` from your dependencies (run `npm uninstall @emailjs/browser`)
5. ⚠️ Remove old EmailJS environment variables from your `.env.local` file
