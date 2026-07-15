export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  idempotencyKey?: string;
};

export type SendEmailResult = {
  provider: string;
  messageId: string;
};

export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
