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
