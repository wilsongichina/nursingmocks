import { beforeEach, describe, expect, it, vi } from "vitest";

const createdJobs: unknown[] = [];
const auditLogs: unknown[] = [];

const authMock = {
  getUser: vi.fn(),
  generatePasswordResetLink: vi.fn(),
  generateEmailVerificationLink: vi.fn(),
};

vi.mock("@/lib/server/firebase-admin", () => ({
  getAdminAuth: () => authMock,
  requireAdminFromAuthorizationHeader: vi.fn(async () => ({
    uid: "admin-1",
    email: "admin@example.com",
  })),
}));

vi.mock("@/lib/admin/audit", () => ({
  createAdminAuditRequestId: vi.fn(() => "request-1"),
  readRequestMetadata: vi.fn(() => ({ ipHash: "ip-hash", userAgent: "vitest" })),
  writeAdminAuditLog: vi.fn(async (input) => {
    auditLogs.push(input);
    return { auditLogId: "audit-1", requestId: "request-1" };
  }),
}));

vi.mock("@/lib/email/config", () => ({
  getEmailConfig: () => ({
    provider: "resend",
    from: "NursingMocks <notifications@nursingmocks.com>",
    replyTo: "support@nursingmocks.com",
    supportEmail: "support@nursingmocks.com",
    siteUrl: "https://nursingmocks.com",
    loginUrl: "https://nursingmocks.com/login",
  }),
}));

vi.mock("@/lib/email/jobs", () => ({
  createPasswordResetEmailJob: vi.fn(async (input) => {
    createdJobs.push({ type: "password_reset", ...input });
    return { jobId: "job-reset", created: true };
  }),
  createEmailVerificationJob: vi.fn(async (input) => {
    createdJobs.push({ type: "email_verification", ...input });
    return { jobId: "job-verify", created: true };
  }),
}));

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(async () => ({ sent: 1 })),
}));

import { POST } from "@/app/api/admin/users/[uid]/support-actions/route";

describe("admin user support actions route", () => {
  beforeEach(() => {
    createdJobs.length = 0;
    auditLogs.length = 0;
    authMock.getUser.mockResolvedValue({
      uid: "user-1",
      email: "student@example.com",
      emailVerified: false,
      disabled: false,
    });
    authMock.generatePasswordResetLink.mockResolvedValue(
      "https://example.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=reset-code-123"
    );
    authMock.generateEmailVerificationLink.mockResolvedValue(
      "https://example.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=verify-code-123"
    );
  });

  it("queues and audits an admin password reset email", async () => {
    const request = new Request("http://localhost/api/admin/users/user-1/support-actions", {
      method: "POST",
      headers: { authorization: "Bearer admin-token", "content-type": "application/json" },
      body: JSON.stringify({ action: "send_password_reset" }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ uid: "user-1" }) });

    expect(response.status).toBe(200);
    expect(createdJobs[0]).toMatchObject({
      type: "password_reset",
      email: "student@example.com",
      resetUrl: "https://nursingmocks.com/reset-password?mode=resetPassword&oobCode=reset-code-123",
    });
    expect(auditLogs[0]).toMatchObject({
      action: "user.password_reset.send",
      actor: { uid: "admin-1", email: "admin@example.com" },
      targetUid: "user-1",
      targetEmail: "student@example.com",
    });
  });

  it("queues and audits an admin email verification message", async () => {
    const request = new Request("http://localhost/api/admin/users/user-1/support-actions", {
      method: "POST",
      headers: { authorization: "Bearer admin-token", "content-type": "application/json" },
      body: JSON.stringify({ action: "send_email_verification" }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ uid: "user-1" }) });

    expect(response.status).toBe(200);
    expect(createdJobs[0]).toMatchObject({
      type: "email_verification",
      email: "student@example.com",
      verificationUrl: "https://example.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=verify-code-123",
    });
    expect(auditLogs[0]).toMatchObject({
      action: "user.email_verification.send",
      targetUid: "user-1",
    });
  });
});
