import { Resend } from "resend";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "@/lib/email/provider";
import { validateEmailSendingConfig } from "@/lib/email/config";

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;

  constructor(apiKey = process.env.RESEND_API_KEY) {
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    this.resend = new Resend(apiKey);
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const config = validateEmailSendingConfig();
    const result = await this.resend.emails.send(
      {
        to: input.to,
        from: config.from,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo || config.replyTo,
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined
    );

    if (result.error) {
      const error = new Error(result.error.message);
      error.name = result.error.name || "ResendError";
      throw error;
    }

    if (!result.data?.id) {
      throw new Error("Resend did not return a message ID");
    }

    return {
      provider: "resend",
      messageId: result.data.id,
    };
  }
}
