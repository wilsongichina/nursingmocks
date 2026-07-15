export type BillingProcessingEnablementCheck = {
  id: string;
  label: string;
  passed: boolean;
};

export type BillingProcessingEnablementStatus = {
  effectsEnabled: false;
  canEnable: false;
  checks: BillingProcessingEnablementCheck[];
  message: string;
};

export function getBillingProcessingEnablementStatus(): BillingProcessingEnablementStatus {
  return {
    effectsEnabled: false,
    canEnable: false,
    checks: [
      {
        id: "explicit_approval",
        label: "Live billing effect processing has explicit owner approval.",
        passed: false,
      },
      {
        id: "test_mode_verified",
        label: "Stripe test-mode checkout and webhook processing have been verified end to end.",
        passed: false,
      },
      {
        id: "secret_storage_verified",
        label: "Webhook and checkout secrets are configured through approved secret storage.",
        passed: false,
      },
      {
        id: "writer_tests_complete",
        label: "Transaction, subscription, entitlement, and audit writer tests are complete.",
        passed: false,
      },
      {
        id: "rollback_plan_ready",
        label: "Rollback and manual access correction plan is documented.",
        passed: false,
      },
    ],
    message: "Billing webhook effect processing is not enabled. All live-processing checks remain blocked.",
  };
}
