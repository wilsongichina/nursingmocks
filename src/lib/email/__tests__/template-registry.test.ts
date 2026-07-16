import { describe, expect, it } from "vitest";
import { getEmailConfig } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/template-registry";

describe("email template registry", () => {
  const config = {
    ...getEmailConfig(),
    from: "NursingMocks <notifications@nursingmocks.com>",
    replyTo: "support@nursingmocks.com",
    supportEmail: "support@nursingmocks.com",
  };

  it("renders welcome email with valid data", () => {
    const rendered = renderEmailTemplate("welcome", { name: "Ada" }, config);
    expect(rendered.subject).toContain("Welcome");
    expect(rendered.html).toContain("NursingMocks");
    expect(rendered.text).toContain("Ada");
  });

  it("renders password reset email with a reset link", () => {
    const rendered = renderEmailTemplate(
      "password_reset",
      { resetUrl: "https://nursingmocks.com/reset-password?mode=resetPassword&oobCode=abc" },
      config
    );
    expect(rendered.subject).toContain("Reset");
    expect(rendered.html).toContain("Reset Password");
    expect(rendered.text).toContain("/reset-password");
  });

  it("renders email verification with a Firebase action link", () => {
    const rendered = renderEmailTemplate(
      "email_verification",
      { verificationUrl: "https://example.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=abc" },
      config
    );
    expect(rendered.subject).toContain("Verify");
    expect(rendered.html).toContain("Verify Email");
    expect(rendered.text).toContain("verify your email address");
  });

  it("renders account disabled email with a controlled plain-text message", () => {
    const rendered = renderEmailTemplate(
      "account_disabled",
      { message: "Your account is under review for security reasons." },
      config
    );
    expect(rendered.subject).toContain("disabled");
    expect(rendered.html).toContain("Account disabled");
    expect(rendered.html).toContain("Your account is under review for security reasons.");
    expect(rendered.text).toContain("Reason:");
  });

  it("renders account enabled email with a controlled plain-text message", () => {
    const rendered = renderEmailTemplate(
      "account_enabled",
      { message: "Account review completed and access restored." },
      config
    );
    expect(rendered.subject).toContain("enabled");
    expect(rendered.html).toContain("Account enabled");
    expect(rendered.text).toContain("sign in again");
  });

  it("rejects missing required template data", () => {
    expect(() => renderEmailTemplate("welcome", {}, config)).toThrow(
      "Missing required template field: name"
    );
  });

  it("adds a visible test marker for test emails", () => {
    const rendered = renderEmailTemplate(
      "welcome",
      { name: "Ada", __testEmail: true },
      config
    );
    expect(rendered.subject).toMatch(/^\[TEST\]/);
  });

  it("rejects contact header injection through invalid email", () => {
    expect(() =>
      renderEmailTemplate(
        "contact_notification",
        {
          name: "Ada",
          email: "ada@example.com\r\nbcc:evil@example.com",
          message: "Hello",
        },
        config
      )
    ).toThrow("Invalid contact email");
  });
});
