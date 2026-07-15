export const BILLING_LIVE_CAPABILITIES = ["checkout", "webhookEffects", "portal"] as const;

export type BillingLiveCapability = (typeof BILLING_LIVE_CAPABILITIES)[number];

export type BillingLiveCapabilityStatus = {
  approved: boolean;
  approvedBy: string | null;
  approvedAt: Date | null;
  reason: string | null;
};

export type BillingLiveControls = Record<BillingLiveCapability, BillingLiveCapabilityStatus>;

export const defaultBillingLiveCapabilityStatus: BillingLiveCapabilityStatus = {
  approved: false,
  approvedBy: null,
  approvedAt: null,
  reason: null,
};

export function createDefaultBillingLiveControls(): BillingLiveControls {
  return {
    checkout: { ...defaultBillingLiveCapabilityStatus },
    webhookEffects: { ...defaultBillingLiveCapabilityStatus },
    portal: { ...defaultBillingLiveCapabilityStatus },
  };
}

export function isBillingLiveCapability(value: string): value is BillingLiveCapability {
  return (BILLING_LIVE_CAPABILITIES as readonly string[]).includes(value);
}
