export type EmailConfig = {
  provider: "resend";
  from: string;
  replyTo: string;
  supportEmail: string;
  siteUrl: string;
  loginUrl: string;
  workerSecret?: string;
};

export function getEmailConfig(): EmailConfig {
  return {
    provider: "resend",
    from: process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "",
    replyTo: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || "",
    supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_REPLY_TO || "",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com",
    loginUrl: process.env.NEXT_PUBLIC_LOGIN_URL || `${process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com"}/login`,
    workerSecret: process.env.EMAIL_WORKER_SECRET,
  };
}

export function validateEmailSendingConfig() {
  const missing = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  const config = getEmailConfig();
  if (!config.from) missing.push("EMAIL_FROM");
  if (!config.replyTo) missing.push("EMAIL_REPLY_TO");
  if (!config.supportEmail) missing.push("SUPPORT_EMAIL");
  if (missing.length) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`);
  }
  return config;
}

export function validateWorkerConfig() {
  const config = getEmailConfig();
  if (!config.workerSecret) {
    throw new Error("EMAIL_WORKER_SECRET is not configured");
  }
  return config;
}
