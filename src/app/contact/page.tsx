import { Metadata } from "next";
import Link from "next/link";
import {
  FaArrowRight,
  FaCircleCheck,
  FaClock,
  FaCreditCard,
  FaEnvelope,
  FaKey,
  FaLifeRing,
  FaMessage,
  FaWhatsapp,
} from "react-icons/fa6";
import ContactPageSchema from "@/components/ui/ContactPageSchema";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import SupportContactForm from "@/components/ui/SupportContactForm";
import NewFooter from "@/components/layout/NewFooter";
import NewHeader from "@/components/layout/NewHeader";

export const metadata: Metadata = {
  title: "Contact NursingMocks Support - Account, Billing, And Exam Help",
  description:
    "Contact NursingMocks support for account access, billing questions, exam access issues, technical problems, and nursing exam prep help.",
  keywords:
    "NursingMocks contact, NursingMocks support, TEAS support, HESI support, nursing exam support",
  openGraph: {
    title: "Contact NursingMocks Support - Account, Billing, And Exam Help",
    description:
      "Get help with NursingMocks account access, billing, exam access, and technical issues.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://nursingmocks.com"}/contact`,
  },
  alternates: {
    canonical: "/contact",
  },
};

const supportRoutes = [
  {
    title: "Account Access",
    description: "Password resets, email changes, locked accounts, and login problems.",
    href: "/forgot-password",
    icon: FaKey,
    action: "Reset Password",
  },
  {
    title: "Payments",
    description: "Payment history, access status, plan questions, and checkout concerns.",
    href: "/payments",
    icon: FaCreditCard,
    action: "View Payments",
  },
  {
    title: "Dashboard Help",
    description: "Find your exams, continue attempts, and check available access.",
    href: "/dashboard",
    icon: FaLifeRing,
    action: "Open Dashboard",
  },
];

const messageGuidelines = [
  "Use the same email address you use on NursingMocks.",
  "Include the exam name, set, or page URL if an exam will not open.",
  "For billing questions, include the approximate payment date.",
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif] text-[#111827]">
      <ContactPageSchema />
      <NewHeader />

      <div className="border-b border-[#e5e7eb] bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff]">
        <section className="public-page-container py-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[#4f46e5]">
                <span className="rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-[10px] py-1 text-[#4338ca]">
                  NursingMocks Support
                </span>
                <span>Account, Billing, Exam Access, And Technical Help</span>
              </div>

              <h1 className="m-0 max-w-[760px] text-[clamp(34px,4.2vw,44px)] font-bold leading-[1.08] tracking-normal text-[#111827]">
                Get Help Without Losing Study Time
              </h1>

              <p className="mt-4 max-w-[690px] text-[15px] leading-[1.7] text-[#4b5563]">
                Tell us what happened, where it happened, and the email on your
                account. We will route your message to the right support queue
                and reply with the next clear step.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-[#d9e0ff] bg-gradient-to-br from-white to-[#eef2ff] p-4 shadow-[0_14px_30px_rgba(129,140,248,0.16)]">
                  <FaClock className="mb-3 text-[18px] text-[#4f46e5]" />
                  <div className="text-[14px] font-semibold text-[#111827]">
                    Typical Reply
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-[#6b7280]">
                    Within 24 business hours
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#d9e0ff] bg-gradient-to-br from-white to-[#eef2ff] p-4 shadow-[0_14px_30px_rgba(129,140,248,0.16)]">
                  <FaEnvelope className="mb-3 text-[18px] text-[#4f46e5]" />
                  <div className="text-[14px] font-semibold text-[#111827]">
                    Email
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-[#6b7280]">
                    support@nursingmocks.com
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#d9e0ff] bg-gradient-to-br from-white to-[#eef2ff] p-4 shadow-[0_14px_30px_rgba(129,140,248,0.16)]">
                  <FaWhatsapp className="mb-3 text-[18px] text-[#4f46e5]" />
                  <div className="text-[14px] font-semibold text-[#111827]">
                    WhatsApp
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-[#6b7280]">
                    +44 7832 350707
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-[18px] shadow-[0_18px_45px_rgba(15,23,42,0.09)] md:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
                  <FaMessage />
                </div>
                <div>
                  <h2 className="m-0 text-[20px] font-semibold leading-tight text-[#111827]">
                    Send A Support Request
                  </h2>
                  <p className="m-0 mt-1 text-[14px] leading-6 text-[#6b7280]">
                    This form creates a support record and queues confirmation emails.
                  </p>
                </div>
              </div>
              <SupportContactForm />
            </div>
          </div>
        </section>
      </div>

      <main className="public-page-container py-10">
        <section className="grid gap-5 lg:grid-cols-3">
          {supportRoutes.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[20px] border border-[#dfe3ff] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-[1px] hover:border-[#6366f1] hover:bg-[#f9fafb]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
                  <Icon />
                </div>
                <h2 className="m-0 text-[17px] font-semibold text-[#111827]">
                  {item.title}
                </h2>
                <p className="m-0 mt-2 text-[14px] leading-6 text-[#6b7280]">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#4f46e5]">
                  {item.action}
                  <FaArrowRight className="text-[11px] transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[20px] border border-[#e5e7eb] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <h2 className="m-0 text-[19px] font-semibold text-[#111827]">
              Before You Send
            </h2>
            <p className="m-0 mt-2 text-[14px] leading-6 text-[#6b7280]">
              The best support messages are specific. These details help us
              find your account and reproduce the issue quickly.
            </p>
            <div className="mt-5 grid gap-3">
              {messageGuidelines.map((item) => (
                <div key={item} className="flex gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] p-3">
                  <FaCircleCheck className="mt-1 shrink-0 text-[#10b981]" />
                  <span className="text-[14px] leading-6 text-[#374151]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[20px] border border-[#e5e7eb] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <h2 className="m-0 text-[19px] font-semibold text-[#111827]">
              What We Can Help With
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Exam Access After Payment",
                "Password And Account Recovery",
                "Billing Records And Payment Questions",
                "Practice Test Loading Issues",
                "Progress Or Results Questions",
                "Content Feedback And Corrections",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-[14px] font-medium text-[#374151]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>

      <NewFooter />
      <FloatingWhatsAppButton />
    </div>
  );
}
