import { describe, expect, it } from "vitest";
import { getBillingProcessingEnablementStatus } from "@/lib/billing/processing-enablement";

describe("billing processing enablement review", () => {
  it("keeps billing effects disabled until explicit approval and readiness checks pass", () => {
    const status = getBillingProcessingEnablementStatus();

    expect(status.effectsEnabled).toBe(false);
    expect(status.canEnable).toBe(false);
    expect(status.checks.every((check) => check.passed === false)).toBe(true);
    expect(status.checks.map((check) => check.id)).toEqual([
      "explicit_approval",
      "test_mode_verified",
      "secret_storage_verified",
      "writer_tests_complete",
      "rollback_plan_ready",
    ]);
  });
});
