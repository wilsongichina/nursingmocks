# Email Setup Guide for Contact Form

## Overview

The contact form is now configured to send emails to `teasgurus@gmail.com` using EmailJS. Follow these steps to complete the setup.

## ✅ Step 1: EmailJS Service ID (COMPLETED)

Your EmailJS Service ID: `service_s8v8yuk`

## ✅ Step 2: Email Template ID (COMPLETED)

Your EmailJS Template ID: `template_pidg1bu`

## ✅ Step 3: Public Key (COMPLETED)

Your EmailJS Public Key: `6euT1eo-TKXg_mLXT`

## ✅ Step 4: Configure Environment Variables (READY TO SETUP)

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
EMAILJS_SERVICE_ID=service_s8v8yuk
EMAILJS_TEMPLATE_ID=template_pidg1bu
EMAILJS_PUBLIC_KEY=6euT1eo-TKXg_mLXT
```

## Step 5: Test the Setup

1. Create the `.env.local` file with the above content
2. Start your development server: `npm run dev`
3. Go to the contact page and submit a test form
4. Check if the email is received at `teasgurus@gmail.com`
5. Check the browser console for any errors

## Troubleshooting

### Common Issues:

1. **"Email service not configured" error**: Make sure all environment variables are set correctly
2. **"Failed to send email" error**: Check your EmailJS service configuration and template
3. **Emails not received**: Check spam folder and EmailJS dashboard for delivery status

### Security Notes:

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Keep your EmailJS credentials secure
- ✅ You used the correct public key (not the private key)

## Email Template Variables

The following variables are available in your email template:

- `{{from_name}}` - Contact form name
- `{{from_email}}` - Contact form email
- `{{phone}}` - Contact form phone (or "Not provided")
- `{{budget}}` - Contact form budget (or "Not provided")
- `{{services}}` - Selected service
- `{{message}}` - Contact form message
- `{{reply_to}}` - Reply-to email address

## Production Deployment

When deploying to production:

1. Set the environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Test the contact form in production
3. Monitor email delivery through EmailJS dashboard

## Support

If you encounter issues:

1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Verify your Gmail account settings
3. Check the browser console for error messages
4. Ensure all environment variables are correctly set
