import type { EmailConfig } from "@/lib/email/config";

export const EMAIL_PRIMARY = "#6a5cff";

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}

export function renderButton(label: string, href: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${EMAIL_PRIMARY};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;margin:18px 0;">${escapeHtml(label)}</a>`;
}

export function renderEmailLayout(config: EmailConfig, heading: string, body: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;background:#f6f7fb;color:#111827;font-family:Arial,Helvetica,sans-serif;line-height:1.55;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${EMAIL_PRIMARY};padding:24px;color:#ffffff;">
                <div style="font-size:22px;font-weight:800;">NursingMocks</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#111827;">${escapeHtml(heading)}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;">
                Need help? Contact <a href="mailto:${escapeHtml(config.supportEmail)}" style="color:${EMAIL_PRIMARY};">${escapeHtml(config.supportEmail)}</a>.<br>
                <span style="font-size:12px;">NursingMocks, nursing exam preparation resources.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function textFooter(config: EmailConfig) {
  return `\n\nNeed help? Contact ${config.supportEmail}.\nNursingMocks`;
}
