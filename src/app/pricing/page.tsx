"use client";

import { useState } from "react";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";

export default function PricingPage() {
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");

  const toggleBilling = () => {
    setBillingMode(billingMode === "monthly" ? "yearly" : "monthly");
  };

  const plans = [
    {
      name: "TEAS 7 Prep",
      tag: "ATI TEAS",
      description: "All TEAS Reading, Math, Science, and English practice plus realistic mock exams.",
      monthlyPrice: "$99",
      yearlyPrice: "$299",
      pill: "Perfect for pre-nursing TEAS students",
      features: [
        "Full TEAS coverage: Reading, Math, Science, English & Language Usage.",
        "Unlimited TEAS practice questions & custom quizzes.",
        "Exam Mode & Review Mode for every TEAS practice test.",
        "Skill mastery dashboard for TEAS subjects and subskills.",
        "Access to TEAS knowledge base articles and study guides.",
      ],
      primaryButton: "Get TEAS 7 Prep",
      secondaryButton: "Try free TEAS questions",
      note: "Cancel anytime. No long-term contracts.",
      featured: false,
    },
    {
      name: "HESI A2 Prep",
      tag: "HESI A2",
      description: "Practice for all required HESI A2 subjects with test-like questions and detailed feedback.",
      monthlyPrice: "$99",
      yearlyPrice: "$299",
      pill: "Covers all core HESI A2 subjects",
      features: [
        "Vocabulary, Grammar, Reading, Math, Biology, A&P, Chemistry.",
        "Unlimited HESI A2 practice questions and realistic mock exams.",
        "Detailed explanations with every HESI practice question.",
        "Skill-based analytics so you know exactly what to fix next.",
        "HESI-specific study tips and knowledge base access.",
      ],
      primaryButton: "Get HESI A2 Prep",
      secondaryButton: "Try free HESI questions",
      note: "Ideal if your program requires HESI A2.",
      featured: false,
    },
    {
      name: "All-Access Nursing Prep",
      tag: "RN & LPN",
      description: "RN & LPN nursing test banks and exit exam practice in one all-access subscription.",
      monthlyPrice: "$79",
      yearlyPrice: "$300",
      pill: "Best value for nursing students in their program",
      descriptionNote: "Focused on RN/LPN nursing test banks and exit exam practice. TEAS and HESI A2 sold separately.",
      features: [
        "RN & LPN nursing test banks for core nursing subjects.",
        "Fundamentals, Med-Surg, Pharmacology, OB, Pediatrics, Mental Health, and more.",
        "Exit exam style practice and predictor-style analytics for RN/LPN.",
        "Unlimited custom quizzes and advanced performance analytics.",
        "Priority support for account and study questions.",
      ],
      primaryButton: "Get All-Access Nursing Prep",
      secondaryButton: "Explore question banks",
      note: "Recommended if you're already in an RN or LPN program.",
      featured: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef2ff,#f5f6fb_40%,#f9fafb_100%)] font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Segoe_UI',sans-serif] text-[#0f172a]">
      <NewHeader />
      
      <main className="max-w-[1120px] mx-auto px-4 py-8 pb-16">
        {/* Hero */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-[rgba(79,70,229,0.06)] text-[#4338ca] border border-[rgba(79,70,229,0.16)] mb-3">
            <span className="w-[7px] h-[7px] rounded-full bg-[#06b6d4]"></span>
            <span>Flexible Nursing Exam Prep Plans</span>
          </div>
          <h1 className="text-[30px] tracking-[-0.03em] mb-2 font-bold text-[#0f172a]">
            Choose your NursingMocks plan
          </h1>
          <p className="text-[15px] text-[#6b7280] max-w-[580px] mx-auto">
            TEAS, HESI, and full nursing test banks in one clean dashboard.
            Pick a plan that fits the way you like to study.
          </p>

          {/* Billing Toggle */}
          <div className="mt-5 flex justify-center">
            <div
              className="inline-flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-white border border-[#e3e5f0] shadow-[0_10px_30px_rgba(15,23,42,0.08)] cursor-pointer"
              onClick={toggleBilling}
            >
              <span
                className={`text-[13px] flex items-center gap-1.5 select-none ${
                  billingMode === "monthly"
                    ? "text-[#4338ca] font-semibold"
                    : "text-[#9ca3af]"
                }`}
              >
                Monthly
              </span>
              <div
                className={`relative w-[46px] h-6 rounded-full transition-[background] duration-[0.18s] ease-out ${
                  billingMode === "yearly"
                    ? "bg-[rgba(79,70,229,0.2)]"
                    : "bg-[#e5e7eb]"
                }`}
              >
                <div
                  className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.2)] transition-transform duration-[0.18s] ease-out ${
                    billingMode === "yearly" ? "translate-x-[22px]" : ""
                  }`}
                ></div>
              </div>
              <span
                className={`text-[13px] flex items-center gap-1.5 select-none ${
                  billingMode === "yearly"
                    ? "text-[#4338ca] font-semibold"
                    : "text-[#9ca3af]"
                }`}
              >
                Yearly
                <span className="text-[11px] px-2 py-1 rounded-full bg-[rgba(34,197,94,0.10)] text-[#15803d] border border-[rgba(34,197,94,0.45)] font-medium">
                  Save with yearly billing
                </span>
              </span>
            </div>
          </div>
        </header>

        {/* Pricing Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-8">
          {plans.map((plan, index) => (
            <article
              key={index}
              className={`bg-[rgba(255,255,255,0.98)] rounded-[22px] p-5 border transition-all duration-[0.18s] ease-out relative overflow-hidden ${
                plan.featured
                  ? "border-[rgba(79,70,229,0.55)] shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-gradient-to-br from-[rgba(79,70,229,0.02)] via-[rgba(6,182,212,0.02)] to-white pt-10"
                  : "border-[#e3e5f0] shadow-[0_14px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:border-[#d6daf2]"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-2.5 right-3 px-2.5 py-1 text-[11px] rounded-full bg-[rgba(79,70,229,0.10)] text-[#4338ca] border border-[rgba(79,70,229,0.35)] font-semibold max-w-[120px] truncate">
                  Most popular
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-base font-semibold mb-1 flex items-center gap-1.5 text-[#0f172a]">
                  {plan.name}
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[rgba(15,23,42,0.04)] text-[#6b7280]">
                    {plan.tag}
                  </span>
                </h2>
                <p className="text-[13px] text-[#6b7280] m-0">{plan.description}</p>
              </div>

              <div className="my-3.5">
                <div className="text-2xl font-bold tracking-[-0.03em] flex items-baseline gap-1 text-[#0f172a]">
                  {billingMode === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                  <span className="text-sm font-medium text-[#9ca3af]">
                    / {billingMode === "monthly" ? "month" : "year"}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  {plan.descriptionNote ||
                    (billingMode === "monthly"
                      ? "Billed monthly. Switch to yearly any time inside your dashboard."
                      : "Billed yearly. Switch to monthly any time inside your dashboard.")}
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] mt-2 px-2 py-1 rounded-full bg-[rgba(79,70,229,0.08)] text-[#4338ca]">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#06b6d4]"></span>
                  <span>{plan.pill}</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[rgba(148,163,184,0.4)] to-transparent my-3"></div>

              <ul className="list-none p-0 m-0 mb-3.5 text-[13px] text-[#6b7280] grid gap-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full border border-[rgba(34,197,94,0.6)] flex items-center justify-center text-[10px] text-[#15803d] flex-shrink-0">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 mt-auto">
                <button className="rounded-full border border-transparent px-3 py-2 text-[13px] font-medium cursor-pointer text-center transition-all duration-[0.18s] ease-out bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(79,70,229,0.45)]">
                  {plan.primaryButton}
                </button>
                <button className="rounded-full border px-3 py-2 text-[13px] font-medium cursor-pointer text-center transition-all duration-[0.18s] ease-out bg-[rgba(15,23,42,0.02)] text-[#0f172a] border-[rgba(148,163,184,0.5)] hover:bg-[rgba(15,23,42,0.04)]">
                  {plan.secondaryButton}
                </button>
                <p className="text-[11px] text-[#9ca3af] text-center m-0">{plan.note}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Comparison Section */}
        <section className="mt-10 rounded-[18px] bg-[rgba(255,255,255,0.98)] p-5 border border-[#e3e5f0] shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="flex justify-between items-center gap-4 mb-3.5 flex-wrap">
            <div>
              <h2 className="text-base m-0 font-semibold text-[#0f172a]">Compare plans</h2>
              <p className="text-[13px] text-[#6b7280] m-0">
                Every plan includes clean analytics, skill tracking, and unlimited practice sessions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs text-[#9ca3af] font-medium">Feature</th>
                  <th className="p-2 text-center text-xs text-[#9ca3af] font-medium w-[90px]">TEAS</th>
                  <th className="p-2 text-center text-xs text-[#9ca3af] font-medium w-[90px]">HESI</th>
                  <th className="p-2 text-center text-xs text-[#9ca3af] font-medium w-[90px]">All-Access</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Unlimited practice questions</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Full-length mock exams</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Skill mastery & weak-area analytics</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Access to TEAS knowledge base</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Access to HESI knowledge base</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Nursing test banks (RN & LPN)</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Exit exam style questions (RN/LPN)</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-left border-b border-[rgba(226,232,240,0.8)] text-[#0f172a]">Priority support</td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="text-[#9ca3af] text-xs">–</span>
                  </td>
                  <td className="p-2 text-center border-b border-[rgba(226,232,240,0.8)]">
                    <span className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center border border-[rgba(79,70,229,0.35)] text-[11px] text-[#4338ca] bg-[rgba(79,70,229,0.04)]">
                      ✓
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ + CTA */}
        <section className="grid grid-cols-1 md:grid-cols-[1.6fr_1.2fr] gap-[18px] mt-8">
          {/* FAQ */}
          <article className="bg-[rgba(255,255,255,0.98)] rounded-[18px] p-[18px] border border-[#e3e5f0] shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-[15px] m-0 mb-2.5 font-semibold text-[#0f172a]">Pricing & subscription FAQ</h2>

            <div className="mb-2.5">
              <h3 className="text-[13px] font-semibold m-0 mb-1 text-[#0f172a]">Is NursingMocks updated for the latest exams?</h3>
              <p className="text-[13px] text-[#6b7280] m-0">
                Yes. We keep TEAS, HESI, and nursing test bank content aligned with current exam
                blueprints and update questions regularly.
              </p>
            </div>

            <div className="mb-2.5">
              <h3 className="text-[13px] font-semibold m-0 mb-1 text-[#0f172a]">Can I switch between plans later?</h3>
              <p className="text-[13px] text-[#6b7280] m-0">
                You can upgrade or switch plans anytime. Changes apply immediately
                and billing is adjusted automatically.
              </p>
            </div>

            <div className="mb-2.5">
              <h3 className="text-[13px] font-semibold m-0 mb-1 text-[#0f172a]">Do you offer refunds?</h3>
              <p className="text-[13px] text-[#6b7280] m-0">
                If you're not happy with NursingMocks in the first 7 days, contact support and
                we'll review a refund or extension on a case-by-case basis.
              </p>
            </div>

            <div className="mb-2.5">
              <h3 className="text-[13px] font-semibold m-0 mb-1 text-[#0f172a]">Will my subscription renew automatically?</h3>
              <p className="text-[13px] text-[#6b7280] m-0">
                Yes, subscriptions renew automatically, but you can cancel inside your dashboard
                at any time with a single click.
              </p>
            </div>
          </article>

          {/* CTA */}
          <article className="bg-[rgba(255,255,255,0.98)] rounded-[18px] p-[18px] border border-[#e3e5f0] shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-[15px] m-0 mb-2 font-semibold text-[#0f172a]">Start studying smarter, not harder</h2>
            <p className="text-[13px] text-[#6b7280] m-0 mb-3">
              Create your NursingMocks account, choose a plan, and start practicing in under
              two minutes. No contracts, no setup fees.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[11px] px-2 py-1 rounded-full bg-[rgba(15,23,42,0.03)] text-[#6b7280] border border-dashed border-[rgba(148,163,184,0.6)]">
                Exam-style questions
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-[rgba(15,23,42,0.03)] text-[#6b7280] border border-dashed border-[rgba(148,163,184,0.6)]">
                Skill-based practice
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-[rgba(15,23,42,0.03)] text-[#6b7280] border border-dashed border-[rgba(148,163,184,0.6)]">
                Clean analytics
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-[rgba(15,23,42,0.03)] text-[#6b7280] border border-dashed border-[rgba(148,163,184,0.6)]">
                RN & LPN support
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button className="rounded-full border border-transparent px-3 py-2 text-[13px] font-medium cursor-pointer text-center transition-all duration-[0.18s] ease-out bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(79,70,229,0.45)]">
                Get started now
              </button>
              <button className="rounded-full border px-3 py-2 text-[13px] font-medium cursor-pointer text-center transition-all duration-[0.18s] ease-out bg-[rgba(15,23,42,0.02)] text-[#0f172a] border-[rgba(148,163,184,0.5)] hover:bg-[rgba(15,23,42,0.04)]">
                Try free sample questions
              </button>
            </div>

            <p className="text-[11px] text-[#9ca3af] mt-2 m-0">
              Join nursing students preparing for TEAS, HESI, and nursing school exams with confidence.
            </p>
          </article>
        </section>
      </main>

      {/* Footer */}
      <NewFooter />

      {/* Floating buttons */}
      <FloatingWhatsAppButton />
    </div>
  );
}

