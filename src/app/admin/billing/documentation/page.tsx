"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";

type DocumentationSection = {
  id: string;
  title: string;
  description: string;
};

const documentationSections: DocumentationSection[] = [
  {
    id: "billing-setup",
    title: "Billing Setup",
    description: "The recommended setup order before checkout testing.",
  },
  {
    id: "plans-section",
    title: "Plans Section",
    description: "How internal billing plans define what students buy.",
  },
  {
    id: "gateways-section",
    title: "Gateways Section",
    description: "How payment providers and environments are represented.",
  },
  {
    id: "provider-mappings-section",
    title: "Provider Price Mappings",
    description: "How internal plans connect to provider products and prices.",
  },
  {
    id: "editable-locked-fields",
    title: "Editable And Locked Fields",
    description: "Which fields can change safely after billing records exist.",
  },
  {
    id: "validation-rules",
    title: "Validation Rules",
    description: "Rules that protect checkout readiness and billing contracts.",
  },
  {
    id: "operations-views",
    title: "Operations Views",
    description: "Read-only billing activity records available to admins.",
  },
  {
    id: "live-readiness-view",
    title: "Live Readiness View",
    description: "How the readiness view explains checkout blockers.",
  },
  {
    id: "current-billing-stage",
    title: "Current Billing Stage",
    description: "What this billing admin area currently supports.",
  },
];

function DocumentationCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="user-card scroll-mt-24 p-5 sm:p-6">
      <h2 className="user-section-title">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-6 text-gray-700">{children}</div>
    </section>
  );
}

function FieldLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <span className="font-semibold text-gray-950">{label}</span> {children}
    </p>
  );
}

function StepLine({ step, children }: { step: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="font-semibold text-gray-950">{step}</p>
      <p className="mt-1 text-sm leading-6 text-gray-700">{children}</p>
    </div>
  );
}

function AdminBillingDocumentationContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin" className="font-medium transition-colors hover:text-blue-600">
                Admin Dashboard
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin/billing" className="font-medium transition-colors hover:text-blue-600">
                Billing Configuration
              </Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Documentation</span>
            </div>
            {currentUser && <UserProfileBadge />}
          </div>
        </div>

        <main className="user-page min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full">
            <header className="user-page-header mb-6">
              <div className="user-page-header-row">
                <div className="user-page-header-copy">
                  <p className="user-eyebrow">Admin Documentation</p>
                  <h1 className="user-page-title mt-1">Billing Documentation</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Detailed reference for plans, gateways, provider mappings, validation, operations, and readiness.
                  </p>
                </div>
                <div className="user-page-header-actions">
                  <Link href="/admin/billing" className="user-button-secondary">
                    Back To Billing
                  </Link>
                </div>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-20 lg:self-start">
                <div className="user-card p-4">
                  <p className="user-label">Main Headers</p>
                  <nav className="mt-3 space-y-1" aria-label="Billing documentation sections">
                    {documentationSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <span className="block">{section.title}</span>
                        <span className="mt-0.5 block text-xs font-normal leading-5 text-gray-500">{section.description}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="space-y-6">
                <DocumentationCard id="billing-setup" title="Start With Billing Setup">
                  <p>
                    Use this order when setting up billing for the first time. Each step prepares the next one, so avoid jumping straight to checkout until the provider, gateway, plan, mapping, and webhook pieces agree.
                  </p>
                  <div className="grid gap-3">
                    <StepLine step="Step 1. Create The Payment Provider Objects First.">
                      In Stripe, create the product and price in the same mode you want to test. Use test mode for localhost and sandbox testing. Copy the provider price ID, such as a Stripe <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">price_...</code> ID, because checkout uses that value.
                    </StepLine>
                    <StepLine step="Step 2. Add Or Verify The Gateway.">
                      Create a gateway for the provider and environment, for example <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">stripe_us_test</code>. Enter secret reference names such as <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">STRIPE_SECRET_KEY</code> and <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">STRIPE_WEBHOOK_SECRET</code>; do not paste raw secret values into admin fields.
                    </StepLine>
                    <StepLine step="Step 3. Create The Internal Plan.">
                      The plan defines what the student buys, the price, currency, purchase type, duration, and which exam access is granted. Create one plan per exam and duration, such as <span className="font-semibold text-gray-950">ATI TEAS 7 1 Month Access</span> or <span className="font-semibold text-gray-950">HESI A2 3 Months Access</span>.
                    </StepLine>
                    <StepLine step="Step 4. Assign The Gateway To The Plan.">
                      The plan must include at least one enabled gateway before checkout can use it.
                    </StepLine>
                    <StepLine step="Step 5. Create The Provider Price Mapping.">
                      Link the internal plan to the gateway and provider price ID. The amount, currency, interval, and purchase type must match the internal plan and the provider price.
                    </StepLine>
                    <StepLine step="Step 6. Check Readiness.">
                      Open the Readiness tab and fix blockers before testing checkout. Checkout will be blocked when the plan, gateway, mapping, or secrets are incomplete.
                    </StepLine>
                    <StepLine step="Step 7. Test Checkout And Webhook Processing.">
                      For localhost, run Stripe CLI forwarding to <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">/api/webhooks/stripe?gatewayId=...</code>. A successful purchase should create a transaction, an access grant, and updated user entitlements after <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">checkout.session.completed</code> is verified.
                    </StepLine>
                  </div>
                </DocumentationCard>

                <DocumentationCard id="plans-section" title="Plans Section">
                  <p>Use plans to define the products students can buy or receive access to.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldLine label="Plan ID.">Stable internal identifier. It is created once and should not change.</FieldLine>
                    <FieldLine label="Slug.">URL/admin-safe identifier used for routing and internal references.</FieldLine>
                    <FieldLine label="Name.">Cleaned into title case and displayed to admins and students.</FieldLine>
                    <FieldLine label="Description And Short Description.">Student-facing copy used in billing cards and summaries.</FieldLine>
                    <FieldLine label="Status.">Controls whether the plan is draft, active, inactive, or archived.</FieldLine>
                    <FieldLine label="Purchase Type.">Defines the billing model. Current checkout focuses on one-time access.</FieldLine>
                    <FieldLine label="Interval.">Normally lifetime for one-time access plans.</FieldLine>
                    <FieldLine label="Price And Currency.">Internal amount and currency that must match the provider mapping.</FieldLine>
                    <FieldLine label="Trial Days.">Keep at 0 for the current one-time access flow.</FieldLine>
                    <FieldLine label="Packages.">The exam access the plan grants after payment confirmation.</FieldLine>
                    <FieldLine label="Assigned Gateways.">Payment gateways allowed to process this plan.</FieldLine>
                    <FieldLine label="Public, Featured, Display Order.">Presentation controls for student-facing plan lists.</FieldLine>
                  </div>
                </DocumentationCard>

                <DocumentationCard id="gateways-section" title="Gateways Section">
                  <p>Use gateways to manage payment providers without storing provider secrets in this admin screen.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldLine label="Gateway ID.">Stable internal identifier, such as <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">stripe_us_test</code>.</FieldLine>
                    <FieldLine label="Provider.">The payment provider, such as Stripe, PayPal, or Authorize.Net.</FieldLine>
                    <FieldLine label="Environment.">Test, sandbox, or live mode. This must match the provider objects and API keys.</FieldLine>
                    <FieldLine label="Display Name.">Admin-friendly name shown in the billing configuration UI.</FieldLine>
                    <FieldLine label="Publishable Key Ref.">Environment variable name for the publishable key, when the provider needs one.</FieldLine>
                    <FieldLine label="Secret Key Ref.">Environment variable name for the provider secret key.</FieldLine>
                    <FieldLine label="Webhook Secret Ref.">Environment variable name for the provider webhook signing secret.</FieldLine>
                    <FieldLine label="Currencies And Countries.">Coverage rules for where and how the gateway can be used.</FieldLine>
                    <FieldLine label="Payment Types.">Supported payment methods for the gateway.</FieldLine>
                    <FieldLine label="Min Amount And Max Amount.">Optional transaction amount limits.</FieldLine>
                    <FieldLine label="Priority.">Sort order when multiple gateways are available.</FieldLine>
                    <FieldLine label="Enabled And Default Gateway.">Controls whether the gateway can be selected and whether it is preferred.</FieldLine>
                  </div>
                </DocumentationCard>

                <DocumentationCard id="provider-mappings-section" title="Provider Price Mappings Section">
                  <p>Use mappings to connect an internal plan to a provider product and price.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldLine label="Mapping ID.">Stable internal identifier for this plan/gateway/provider price connection.</FieldLine>
                    <FieldLine label="Plan.">The internal billing plan the mapping belongs to.</FieldLine>
                    <FieldLine label="Gateway.">The payment gateway used for checkout.</FieldLine>
                    <FieldLine label="External Product ID.">Provider product identifier, useful for matching provider records.</FieldLine>
                    <FieldLine label="External Price ID.">Provider price identifier used by checkout, such as a Stripe <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">price_...</code> ID.</FieldLine>
                    <FieldLine label="Amount, Currency, Interval, Purchase Type.">Contract fields that must match the selected internal plan.</FieldLine>
                    <FieldLine label="Provider And Environment.">Derived from the selected gateway and used to prevent test/live mismatches.</FieldLine>
                    <FieldLine label="Active Mapping.">Controls whether this mapping can be used for checkout readiness.</FieldLine>
                  </div>
                </DocumentationCard>

                <DocumentationCard id="editable-locked-fields" title="Editable And Locked Fields">
                  <p>Some fields can be edited safely. Fields that affect checkout contracts or linked records are locked after creation.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldLine label="Safe Plan Edits.">Name, descriptions, status, public, featured, and display order.</FieldLine>
                    <FieldLine label="Locked Plan Fields.">Price, currency, interval, purchase type, trial days, packages, and assigned gateways.</FieldLine>
                    <FieldLine label="Safe Gateway Edits.">Display name, enabled, default, and priority.</FieldLine>
                    <FieldLine label="Locked Gateway Fields.">Provider, environment, coverage, payment types, support flags, and amount limits.</FieldLine>
                    <FieldLine label="Safe Mapping Edits.">External provider IDs and active status.</FieldLine>
                    <FieldLine label="Locked Mapping Fields.">Linked plan, linked gateway, provider, environment, amount, currency, interval, and purchase type.</FieldLine>
                  </div>
                </DocumentationCard>

                <DocumentationCard id="validation-rules" title="Validation Rules">
                  <ul className="grid gap-2 sm:grid-cols-2">
                    <li className="rounded-lg bg-gray-50 p-3">Active plans must have at least one package and one assigned gateway.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Provider mappings must use a gateway assigned to the selected plan.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Mapping amount, currency, interval, and purchase type must match selected plan.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Mapping provider and environment must match selected gateway.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Gateway minimum amount cannot be greater than maximum amount.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Direct API attempts to update locked relationship fields are rejected.</li>
                  </ul>
                </DocumentationCard>

                <DocumentationCard id="operations-views" title="Operations Views">
                  <p>Admin tables include read-only operational records for future billing activity.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldLine label="Access Grants.">Records showing which users have active exam access.</FieldLine>
                    <FieldLine label="Transactions.">Provider-confirmed payment records.</FieldLine>
                    <FieldLine label="Webhook Events.">Provider webhook events received by the system.</FieldLine>
                    <FieldLine label="Checkout Attempts.">Checkout session creation and failure records.</FieldLine>
                    <FieldLine label="Audit Logs.">Admin and system changes to billing configuration.</FieldLine>
                  </div>
                </DocumentationCard>

                <DocumentationCard id="live-readiness-view" title="Live Readiness View">
                  <p>The readiness tab summarizes why billing is still not live and which configuration items need attention.</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    <li className="rounded-lg bg-gray-50 p-3">Checkout and webhook effects must remain disabled until explicit approval.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Gateways should have secret and webhook references before real provider operations are tested.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Active plans need active provider mappings before checkout can be considered ready.</li>
                    <li className="rounded-lg bg-gray-50 p-3">Gateway readiness must be reviewed before provider checkout or webhook processing is enabled.</li>
                  </ul>
                </DocumentationCard>

                <DocumentationCard id="current-billing-stage" title="Current Billing Stage">
                  <p>
                    This screen manages configuration and operational review. Live checkout remains controlled by provider configuration, readiness checks, and verified webhook processing.
                  </p>
                </DocumentationCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminBillingDocumentationPage() {
  return (
    <SidebarProvider>
      <AdminBillingDocumentationContent />
    </SidebarProvider>
  );
}
