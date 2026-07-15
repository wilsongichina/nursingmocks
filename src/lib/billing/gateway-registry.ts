import type { PaymentGatewayConfig } from "@/lib/billing/models";
import { canGatewayServePlan } from "@/lib/billing/validation";
import type { PaymentGatewayAdapter } from "@/lib/billing/gateway-adapter";
import { stripeGatewayAdapter } from "@/lib/billing/providers/stripe";
import type { BillingPlan } from "@/lib/billing/models";

export type GatewayRegistryEntry = {
  config: PaymentGatewayConfig;
  adapter: PaymentGatewayAdapter;
};

export type GatewayRegistryBuildResult = {
  registry: BillingGatewayRegistry;
  issues: string[];
};

export class BillingGatewayRegistry {
  private readonly entries = new Map<string, GatewayRegistryEntry>();

  register(config: PaymentGatewayConfig, adapter: PaymentGatewayAdapter) {
    if (config.provider !== adapter.provider) {
      throw new Error(
        `Gateway ${config.gatewayId} uses provider ${config.provider}, but adapter is for ${adapter.provider}.`
      );
    }

    if (this.entries.has(config.gatewayId)) {
      throw new Error(`Gateway ${config.gatewayId} is already registered.`);
    }

    this.entries.set(config.gatewayId, { config, adapter });
  }

  get(gatewayId: string) {
    return this.entries.get(gatewayId) ?? null;
  }

  list() {
    return Array.from(this.entries.values()).sort(
      (a, b) => a.config.priority - b.config.priority || a.config.gatewayId.localeCompare(b.config.gatewayId)
    );
  }

  listEligibleForPlan(
    plan: BillingPlan,
    options: {
      country?: string | null;
      currency?: string | null;
      environment?: string | null;
    } = {}
  ) {
    return this.list().filter(({ config }) => canGatewayServePlan(config, plan, options).valid);
  }
}

export function createBillingGatewayRegistry(
  gatewayConfigs: PaymentGatewayConfig[],
  adapters: PaymentGatewayAdapter[] = [stripeGatewayAdapter]
): GatewayRegistryBuildResult {
  const registry = new BillingGatewayRegistry();
  const adapterByProvider = new Map(adapters.map((adapter) => [adapter.provider, adapter]));
  const issues: string[] = [];

  for (const config of gatewayConfigs) {
    const adapter = adapterByProvider.get(config.provider);
    if (!adapter) {
      issues.push(`Gateway ${config.gatewayId} uses provider ${config.provider}, but no adapter is registered.`);
      continue;
    }

    try {
      // Gateway configs are expected to come from the admin billing UI/Firestore,
      // so the registry must support many gateway records instead of one hardcoded provider.
      registry.register(config, adapter);
    } catch (error) {
      issues.push(error instanceof Error ? error.message : `Gateway ${config.gatewayId} could not be registered.`);
    }
  }

  return { registry, issues };
}
