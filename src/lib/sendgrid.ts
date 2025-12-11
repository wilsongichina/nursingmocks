import sgMail from "@sendgrid/mail";
import { getSiteName } from "@/lib/config";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  services: string;
  topic?: string;
  urgency?: string;
  message: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

/**
 * Send contact form email
 */
export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  // Sender email - must be a verified sender in SendGrid
  // Default: azmeerhamasaliltd@gmail.com (verified sender profile)
  const fromEmail =
    process.env.SENDGRID_FROM_EMAIL || "azmeerhamasaliltd@gmail.com";

  // Recipient email - where contact form submissions are sent
  // Default: azmeerhamasali@gmail.com
  // To change this, set SENDGRID_TO_EMAIL in your .env.local file
  const toEmail = process.env.SENDGRID_TO_EMAIL || "azmeerhamasali@gmail.com";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #4F46E5; }
          .value { margin-top: 5px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${data.topic ? `Support Request: ${escapeHtml(data.topic)}` : "New Contact Form Submission"} - ${getSiteName()}</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${escapeHtml(data.name)}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${escapeHtml(
                data.email
              )}">${escapeHtml(data.email)}</a></div>
            </div>
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${escapeHtml(
                data.phone || "Not provided"
              )}</div>
            </div>
            <div class="field">
              <div class="label">Budget:</div>
              <div class="value">${escapeHtml(
                data.budget || "Not provided"
              )}</div>
            </div>
            <div class="field">
              <div class="label">Services/Topic:</div>
              <div class="value">${escapeHtml(data.services)}</div>
            </div>
            ${data.topic ? `
            <div class="field">
              <div class="label">Topic:</div>
              <div class="value">${escapeHtml(data.topic)}</div>
            </div>
            ` : ""}
            ${data.urgency ? `
            <div class="field">
              <div class="label">Urgency:</div>
              <div class="value">${escapeHtml(data.urgency)}</div>
            </div>
            ` : ""}
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${escapeHtml(data.message).replace(
                /\n/g,
                "<br>"
              )}</div>
            </div>
            <div class="footer">
              <p>Submitted on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
${data.topic ? `Support Request: ${data.topic}` : "New Contact Form Submission"} - ${getSiteName()}

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Budget: ${data.budget || "Not provided"}
Services/Topic: ${data.services}
${data.topic ? `Topic: ${data.topic}\n` : ""}${data.urgency ? `Urgency: ${data.urgency}\n` : ""}
Message:
${data.message}

Submitted on: ${new Date().toLocaleString()}
  `.trim();

  const msg: any = {
    to: toEmail,
    from: {
      email: fromEmail,
      name: "TEAS Gurus Contact Form",
    },
    subject: data.topic 
      ? `Support Request: ${data.topic} - ${getSiteName()}`
      : "New Contact Form Submission - TEAS Gurus",
    text: textContent,
    html: htmlContent,
  };

  // Add replyTo only if email is valid (SendGrid may reject unverified replyTo addresses)
  // The user's email will still be visible in the email body
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    msg.replyTo = data.email;
  }

  console.log("Sending contact email via SendGrid:", {
    to: toEmail,
    from: fromEmail,
    replyTo: data.email,
    subject: msg.subject,
  });

  try {
    await sgMail.send(msg);
    console.log("Contact email sent successfully to:", toEmail);
  } catch (error: any) {
    console.error("SendGrid send error:", error);
    if (error?.response) {
      console.error("SendGrid response status:", error.response.statusCode);
      console.error("SendGrid response body:", error.response.body);
    }
    throw error;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  // Sender email - must be a verified sender in SendGrid
  // Default: azmeerhamasaliltd@gmail.com (verified sender profile)
  const fromEmail =
    process.env.SENDGRID_FROM_EMAIL || "azmeerhamasaliltd@gmail.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com";
  const loginUrl =
    process.env.NEXT_PUBLIC_LOGIN_URL || `${siteUrl}/login`;
  const siteName = getSiteName();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
          ul { margin: 15px 0; padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${siteName}!</h1>
          </div>
          <div class="content">
            <p>Hi ${escapeHtml(data.name)},</p>
            
            <p>Welcome to ${siteName}! Your account has been created successfully, and you're all set to begin preparing for your TEAS or HESI exam with confidence.</p>
            
            <p>You can now log in anytime using the email: <strong>${escapeHtml(
              data.email
            )}</strong></p>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button" style="display: inline-block; background-color: #4F46E5; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">Login to Your Account</a>
            </div>
            
            <p>Inside your dashboard, you'll be able to:</p>
            <ul>
              <li>Access TEAS and HESI practice questions</li>
              <li>Take full-length mock exams</li>
              <li>Track your progress and performance</li>
              <li>Resume saved tests anytime</li>
              <li>Explore Nursing Test Bank & Exit Exams</li>
            </ul>
            
            <p>If you ever need help, reply to this email — our support team is always happy to assist you.</p>
            
            <p>Welcome again, and we're excited to be part of your nursing journey! 💙</p>
            
            <p>Best regards,<br>${siteName} Team<br><a href="${siteUrl}">${siteUrl}</a></p>
            
            <div class="footer">
              <p>This email was sent to ${escapeHtml(data.email)}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
🎉 Welcome to ${siteName} — Your Account Is Ready!

Hi ${data.name},

Welcome to ${siteName}! Your account has been created successfully, and you're all set to begin preparing for your TEAS or HESI exam with confidence.

You can now log in anytime using the email: ${data.email}

Login here: ${loginUrl}

Inside your dashboard, you'll be able to:

- Access TEAS and HESI practice questions
- Take full-length mock exams
- Track your progress and performance
- Resume saved tests anytime
- Explore Nursing Test Bank & Exit Exams

If you ever need help, reply to this email — our support team is always happy to assist you.

Welcome again, and we're excited to be part of your nursing journey! 💙

${siteName} Team
${siteUrl}
  `.trim();

  const msg = {
    to: data.email,
    from: {
      email: fromEmail,
      name: siteName,
    },
    subject: `🎉 Welcome to ${siteName} — Your Account Is Ready!`,
    text: textContent,
    html: htmlContent,
  };

  await sgMail.send(msg);
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
