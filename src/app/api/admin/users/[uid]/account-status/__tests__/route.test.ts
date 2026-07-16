import { beforeEach, describe, expect, it, vi } from "vitest";

const auditLogs: unknown[] = [];
const createdJobs: unknown[] = [];
let shouldFailEmailQueue = false;

const authMock = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
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

vi.mock("@/lib/email/jobs", () => ({
  createEmailJob: vi.fn(async (input) => {
    if (shouldFailEmailQueue) throw new Error("Email queue unavailable");
    createdJobs.push(input);
    return { jobId: "job-disabled", created: true };
  }),
}));

vi.mock("@/lib/email/worker", () => ({
  processDueEmailJobs: vi.fn(async () => ({ sent: 1 })),
}));

import { POST } from "@/app/api/admin/users/[uid]/account-status/route";

describe("admin user account status route", () => {
  beforeEach(() => {
    auditLogs.length = 0;
    createdJobs.length = 0;
    shouldFailEmailQueue = false;
    authMock.getUser.mockClear();
    authMock.updateUser.mockClear();
    authMock.getUser.mockResolvedValue({
      uid: "user-1",
      email: "student@example.com",
      emailVerified: true,
      disabled: false,
      customClaims: {},
    });
    authMock.updateUser.mockResolvedValue({
      uid: "user-1",
      email: "student@example.com",
      emailVerified: true,
      disabled: true,
      customClaims: {},
    });
  });

  it("disables a user account, queues the disabled email, and writes an audit log", async () => {
    const request = new Request("http://localhost/api/admin/users/user-1/account-status", {
      method: "POST",
      headers: { authorization: "Bearer admin-token", "content-type": "application/json" },
      body: JSON.stringify({ action: "disable_account", reason: "User requested account lock." }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ uid: "user-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.disabled).toBe(true);
    expect(authMock.updateUser).toHaveBeenCalledWith("user-1", { disabled: true });
    expect(body.emailQueued).toBe(true);
    expect(createdJobs[0]).toMatchObject({
      templateId: "account_disabled",
      to: "student@example.com",
      data: { message: "User requested account lock." },
      idempotencyKey: "account_disabled:request-1",
    });
    expect(auditLogs[0]).toMatchObject({
      action: "user.account.disable",
      targetUid: "user-1",
      targetEmail: "student@example.com",
      reason: "User requested account lock.",
      after: expect.objectContaining({ emailQueued: true, emailError: null }),
    });
  });

  it("keeps the account disabled and audits when the disabled email cannot be queued", async () => {
    shouldFailEmailQueue = true;
    const request = new Request("http://localhost/api/admin/users/user-1/account-status", {
      method: "POST",
      headers: { authorization: "Bearer admin-token", "content-type": "application/json" },
      body: JSON.stringify({ action: "disable_account", reason: "Policy review required." }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ uid: "user-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.disabled).toBe(true);
    expect(body.emailQueued).toBe(false);
    expect(body.emailError).toBe("Email queue unavailable");
    expect(auditLogs[0]).toMatchObject({
      action: "user.account.disable",
      after: expect.objectContaining({ emailQueued: false, emailError: "Email queue unavailable" }),
    });
  });

  it("enables a disabled user account, queues the enabled email, and writes an audit log", async () => {
    authMock.getUser.mockResolvedValue({
      uid: "user-1",
      email: "student@example.com",
      emailVerified: true,
      disabled: true,
      customClaims: {},
    });
    authMock.updateUser.mockResolvedValue({
      uid: "user-1",
      email: "student@example.com",
      emailVerified: true,
      disabled: false,
      customClaims: {},
    });

    const request = new Request("http://localhost/api/admin/users/user-1/account-status", {
      method: "POST",
      headers: { authorization: "Bearer admin-token", "content-type": "application/json" },
      body: JSON.stringify({ action: "enable_account", reason: "Account review completed." }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ uid: "user-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.emailQueued).toBe(true);
    expect(authMock.updateUser).toHaveBeenCalledWith("user-1", { disabled: false });
    expect(createdJobs[0]).toMatchObject({
      templateId: "account_enabled",
      to: "student@example.com",
      data: { message: "Account review completed." },
      idempotencyKey: "account_enabled:request-1",
    });
    expect(auditLogs[0]).toMatchObject({
      action: "user.account.enable",
      targetUid: "user-1",
      reason: "Account review completed.",
      after: expect.objectContaining({ emailQueued: true, emailError: null }),
    });
  });

  it("blocks self-disable and records a failure audit log", async () => {
    const request = new Request("http://localhost/api/admin/users/admin-1/account-status", {
      method: "POST",
      headers: { authorization: "Bearer admin-token", "content-type": "application/json" },
      body: JSON.stringify({ action: "disable_account", reason: "Testing self protection." }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ uid: "admin-1" }) });

    expect(response.status).toBe(400);
    expect(authMock.updateUser).not.toHaveBeenCalled();
    expect(auditLogs[0]).toMatchObject({
      status: "failure",
      errorMessage: "Admins cannot disable their own account.",
    });
  });
});
