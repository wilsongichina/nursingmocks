import type { EmailConfig } from "@/lib/email/config";
import { assertValidEmailAddress, sanitizeLongText, sanitizeText } from "@/lib/email/validation";
import { escapeHtml, renderButton, renderEmailLayout, textFooter } from "@/emails/components/layout";

export type EmailTemplateId =
  | "welcome"
  | "purchase_confirmation"
  | "access_granted"
  | "payment_failed"
  | "subscription_cancelled"
  | "contact_acknowledgement"
  | "contact_notification";

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
  version: number;
};

export type EmailTemplateDefinition = {
  id: EmailTemplateId;
  version: number;
  enabled: boolean;
  render(data: Record<string, unknown>, config: EmailConfig): RenderedEmail;
};

function requireString(data: Record<string, unknown>, key: string, maxLength = 200) {
  const value = sanitizeText(data[key], maxLength);
  if (!value) throw new Error(`Missing required template field: ${key}`);
  return value;
}

function optionalString(data: Record<string, unknown>, key: string, maxLength = 200) {
  return sanitizeText(data[key], maxLength);
}

function appLink(config: EmailConfig, path: string) {
  return new URL(path, config.siteUrl).toString();
}

export const emailTemplates: Record<EmailTemplateId, EmailTemplateDefinition> = {
  welcome: {
    id: "welcome",
    version: 1,
    enabled: true,
    render(data, config) {
      const name = requireString(data, "name");
      const dashboardUrl = appLink(config, "/dashboard");
      const body = `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
        <p style="margin:0 0 14px;">Welcome to NursingMocks. Your account is ready, and you can start using your nursing exam practice resources now.</p>
        ${renderButton("Open Dashboard", dashboardUrl)}
        <p style="margin:0;">Use your dashboard to access practice resources, track progress, and continue your preparation.</p>
      `;
      return {
        subject: "Welcome to NursingMocks - Your account is ready",
        html: renderEmailLayout(config, "Welcome to NursingMocks", body),
        text: `Hi ${name},\n\nWelcome to NursingMocks. Your account is ready.\n\nOpen your dashboard: ${dashboardUrl}${textFooter(config)}`,
        version: 1,
      };
    },
  },
  contact_acknowledgement: {
    id: "contact_acknowledgement",
    version: 1,
    enabled: true,
    render(data, config) {
      const name = requireString(data, "name");
      const body = `
        <p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
        <p style="margin:0 0 14px;">We received your message and our support team will review it.</p>
        <p style="margin:0;">You can reply to this email if you need to add more context.</p>
      `;
      return {
        subject: "We received your NursingMocks message",
        html: renderEmailLayout(config, "We received your message", body),
        text: `Hi ${name},\n\nWe received your message and our support team will review it.${textFooter(config)}`,
        version: 1,
      };
    },
  },
  contact_notification: {
    id: "contact_notification",
    version: 1,
    enabled: true,
    render(data, config) {
      const name = requireString(data, "name");
      const email = requireString(data, "email");
      assertValidEmailAddress(email, "contact email");
      const topic = optionalString(data, "topic") || "General inquiry";
      const urgency = optionalString(data, "urgency") || "Not provided";
      const message = sanitizeLongText(data.message, 4000);
      if (!message) throw new Error("Missing required template field: message");
      const body = `
        <p style="margin:0 0 12px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 12px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 12px;"><strong>Topic:</strong> ${escapeHtml(topic)}</p>
        <p style="margin:0 0 12px;"><strong>Urgency:</strong> ${escapeHtml(urgency)}</p>
        <p style="margin:16px 0 6px;"><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;margin:0;">${escapeHtml(message)}</p>
      `;
      return {
        subject: `Support request: ${topic}`,
        html: renderEmailLayout(config, "New support request", body),
        text: `New support request\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\nUrgency: ${urgency}\n\n${message}`,
        version: 1,
      };
    },
  },
  purchase_confirmation: {
    id: "purchase_confirmation",
    version: 1,
    enabled: true,
    render(data, config) {
      const productName = requireString(data, "productName");
      const body = `<p>Your purchase for ${escapeHtml(productName)} was confirmed.</p>${renderButton("Open Dashboard", appLink(config, "/dashboard"))}`;
      return {
        subject: "Your NursingMocks purchase is confirmed",
        html: renderEmailLayout(config, "Purchase confirmed", body),
        text: `Your purchase for ${productName} was confirmed.${textFooter(config)}`,
        version: 1,
      };
    },
  },
  access_granted: {
    id: "access_granted",
    version: 1,
    enabled: true,
    render(data, config) {
      const accessName = requireString(data, "accessName");
      const body = `<p>Your access to ${escapeHtml(accessName)} is now active.</p>${renderButton("Start Practicing", appLink(config, "/dashboard"))}`;
      return {
        subject: "Your NursingMocks access is active",
        html: renderEmailLayout(config, "Access granted", body),
        text: `Your access to ${accessName} is now active.${textFooter(config)}`,
        version: 1,
      };
    },
  },
  payment_failed: {
    id: "payment_failed",
    version: 1,
    enabled: true,
    render(data, config) {
      const body = `<p>We could not process your latest payment. Please review your billing details or contact support.</p>`;
      return {
        subject: "NursingMocks payment issue",
        html: renderEmailLayout(config, "Payment issue", body),
        text: `We could not process your latest payment. Please review your billing details or contact support.${textFooter(config)}`,
        version: 1,
      };
    },
  },
  subscription_cancelled: {
    id: "subscription_cancelled",
    version: 1,
    enabled: true,
    render(data, config) {
      const body = `<p>Your NursingMocks subscription cancellation has been recorded. Contact support if this was unexpected.</p>`;
      return {
        subject: "NursingMocks subscription cancelled",
        html: renderEmailLayout(config, "Subscription cancelled", body),
        text: `Your NursingMocks subscription cancellation has been recorded.${textFooter(config)}`,
        version: 1,
      };
    },
  },
};

export function renderEmailTemplate(templateId: EmailTemplateId, data: Record<string, unknown>, config: EmailConfig) {
  const template = emailTemplates[templateId];
  if (!template) throw new Error(`Unknown email template: ${templateId}`);
  if (!template.enabled) throw new Error(`Email template is disabled: ${templateId}`);
  const rendered = template.render(data, config);
  if (data.__testEmail === true) {
    return {
      ...rendered,
      subject: `[TEST] ${rendered.subject}`,
    };
  }
  return rendered;
}

export function isEmailTemplateId(value: unknown): value is EmailTemplateId {
  return typeof value === "string" && value in emailTemplates;
}
