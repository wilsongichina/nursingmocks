import { Metadata } from "next";
import ContactPageSchema from "@/components/ui/ContactPageSchema";
import SupportContactForm from "@/components/ui/SupportContactForm";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import TawkToChat from "@/components/ui/TawkToChat";
import { FaCircleCheck, FaMagnifyingGlass, FaKey, FaCreditCard, FaCircleExclamation, FaRepeat, FaEnvelope, FaWhatsapp, FaCommentDots } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "NursingMocks Support – Help For TEAS, HESI & Nursing Test Banks",
  description:
    "Need help with NursingMocks? Get support for TEAS and HESI practice exams, account access, billing, and technical issues. Our team is here to keep your prep running smoothly.",
  keywords:
    "contact TEAS Gurus, TEAS exam help contact, get quote, TEAS support, nursing exam assistance",
  openGraph: {
    title: "NursingMocks Support – Help For TEAS, HESI & Nursing Test Banks",
    description:
      "Need help with NursingMocks? Get support for TEAS and HESI practice exams, account access, billing, and technical issues. Our team is here to keep your prep running smoothly.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/contact`,
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif]">
      <ContactPageSchema />
      <NewHeader />
      
      {/* Support Hero Section */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <section className="w-[94%] max-w-[1320px] mx-auto" style={{ padding: "42px 0 26px" }}>
          <div className="flex flex-col gap-[18px]">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[#4f46e5] flex gap-[10px] items-center flex-wrap">
              <span className="px-[10px] py-1 rounded-full border border-[#c4b5fd] bg-[rgba(255,255,255,0.6)] text-[#4c1d95]">
                Support & Help Center
              </span>
              <span>Real people answering questions from real nursing students</span>
            </div>
            
            <h1 className="text-[clamp(30px,3.4vw,38px)] leading-[1.08] m-0 font-bold text-[#111827]">
              Get the help you need while you get ready for your exams.
            </h1>
            
            <p className="text-[15px] max-w-[720px] text-[#4b5563] leading-[1.7] m-0">
              Whether you are squeezing in TEAS questions after a shift, trying to understand a HESI score report, or
              untangling a subscription issue, this page is the fastest way to reach us. We keep support simple so you
              can save your mental energy for actual studying.
            </p>

            <div className="flex flex-wrap gap-[14px] items-center text-[12px] text-[#6b7280]">
              <div className="inline-flex items-center gap-[6px] px-[11px] py-[5px] rounded-full bg-[rgba(255,255,255,0.95)] border border-[#e5e7eb] text-[#111827] text-[12px]">
                <FaCircleCheck className="text-[12px] text-[#10b981]" />
                Weekday replies within 24 hours
              </div>
              <span>Weekend replies may take a little longer when we are on call or in clinical rotations.</span>
            </div>

            <div className="mt-[6px] max-w-[520px] relative">
              <FaMagnifyingGlass className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]" />
              <input
                type="text"
                placeholder="Search for help: 'cannot open exam', 'billing question', 'change email'…"
                className="w-full pl-[36px] pr-[40px] py-[11px] rounded-full border border-[rgba(148,163,184,0.8)] text-[14px] text-[#111827] outline-none bg-[rgba(255,255,255,0.98)] shadow-[0_12px_30px_rgba(129,140,248,0.2)] placeholder:text-[#9ca3af]"
              />
              <button
                type="button"
                className="absolute right-[6px] top-1/2 -translate-y-1/2 px-[14px] py-[7px] rounded-full border-none bg-[#111827] text-[#f9fafb] text-[12px] cursor-pointer"
              >
                Search help
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Main Support Content */}
      <main className="w-[94%] max-w-[1320px] mx-auto" style={{ padding: "32px 0 40px" }}>
        <section className="grid grid-cols-1 lg:grid-cols-[2.1fr_1.3fr] gap-[28px] items-start">
          {/* LEFT: QUICK HELP & COMMON ISSUES */}
          <article className="bg-white rounded-[22px] border border-[#e5e7eb] shadow-[0_16px_40px_rgba(15,23,42,0.04)]" style={{ padding: "18px 18px 16px" }}>
            <header className="flex justify-between items-center gap-[10px] mb-[10px]">
              <div>
                <h2 className="text-[16px] font-semibold m-0 text-[#111827]">Start With The Most Common Questions</h2>
                <p className="text-[13px] text-[#6b7280] m-0 mt-1">
                  A lot of messages we receive fall into the same few buckets. If one of these sounds like your situation,
                  it is usually quicker to start here first.
                </p>
              </div>
            </header>

            <div className="flex flex-wrap gap-[8px] mt-[8px]">
              <span className="text-[11px] px-[8px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563]">Account & login</span>
              <span className="text-[11px] px-[8px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563]">Billing & plans</span>
              <span className="text-[11px] px-[8px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563]">Exam access</span>
              <span className="text-[11px] px-[8px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563]">Technical issues</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mt-[10px]">
              <button
                type="button"
                className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] text-[13px] flex flex-col gap-[4px] cursor-pointer transition-all duration-[0.18s] hover:bg-[#eef2ff] hover:shadow-[0_12px_30px_rgba(129,140,248,0.18)] hover:-translate-y-[1px]"
                style={{ padding: "10px 11px" }}
              >
                <strong className="text-[13px] flex items-center gap-[5px] text-[#111827]">
                  <FaKey className="text-[13px] text-[#4f46e5] mr-[5px]" />
                  I cannot log into my account
                </strong>
                <span className="text-[12px] text-[#6b7280]">
                  Check that you are using the same email you used at checkout. Try "Forgot password" first;
                  if that does not work, send us the email and last card digits you used so we can look it up.
                </span>
              </button>

              <button
                type="button"
                className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] text-[13px] flex flex-col gap-[4px] cursor-pointer transition-all duration-[0.18s] hover:bg-[#eef2ff] hover:shadow-[0_12px_30px_rgba(129,140,248,0.18)] hover:-translate-y-[1px]"
                style={{ padding: "10px 11px" }}
              >
                <strong className="text-[13px] flex items-center gap-[5px] text-[#111827]">
                  <FaCreditCard className="text-[13px] text-[#4f46e5] mr-[5px]" />
                  I am not sure which plan I have
                </strong>
                <span className="text-[12px] text-[#6b7280]">
                  Head to your dashboard and open "Billing". You will see your current plan,
                  renewal date, and next charge. Screenshots of this page are helpful if you email us.
                </span>
              </button>

              <button
                type="button"
                className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] text-[13px] flex flex-col gap-[4px] cursor-pointer transition-all duration-[0.18s] hover:bg-[#eef2ff] hover:shadow-[0_12px_30px_rgba(129,140,248,0.18)] hover:-translate-y-[1px]"
                style={{ padding: "10px 11px" }}
              >
                <strong className="text-[13px] flex items-center gap-[5px] text-[#111827]">
                  <FaCircleExclamation className="text-[13px] text-[#4f46e5] mr-[5px]" />
                  My practice exam will not load
                </strong>
                <span className="text-[12px] text-[#6b7280]">
                  Most loading issues are solved by refreshing, switching browsers, or logging out and back in.
                  If the timer starts but the page stays blank, copy the URL and send it to us.
                </span>
              </button>

              <button
                type="button"
                className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] text-[13px] flex flex-col gap-[4px] cursor-pointer transition-all duration-[0.18s] hover:bg-[#eef2ff] hover:shadow-[0_12px_30px_rgba(129,140,248,0.18)] hover:-translate-y-[1px]"
                style={{ padding: "10px 11px" }}
              >
                <strong className="text-[13px] flex items-center gap-[5px] text-[#111827]">
                  <FaRepeat className="text-[13px] text-[#4f46e5] mr-[5px]" />
                  I need to change or cancel my subscription
                </strong>
                <span className="text-[12px] text-[#6b7280]">
                  You can cancel renewal anytime from "Billing" in your account.
                  Your access stays active until the end of the paid period, and we will not charge you again.
                </span>
              </button>
            </div>

            <div className="mt-[10px] flex flex-col gap-[10px]">
              <div className="rounded-[16px] bg-[#f9fafb] border border-dashed border-[#e5e7eb] text-[13px] flex justify-between items-center gap-[10px]" style={{ padding: "10px 11px" }}>
                <div className="text-[13px] text-[#374151]">
                  I paid but my TEAS or HESI exams are still locked.
                </div>
                <div className="text-[11px] px-[8px] py-[3px] rounded-full bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] whitespace-nowrap">
                  Exam access
                </div>
              </div>
              
              <div className="rounded-[16px] bg-[#f9fafb] border border-dashed border-[#e5e7eb] text-[13px] flex justify-between items-center gap-[10px]" style={{ padding: "10px 11px" }}>
                <div className="text-[13px] text-[#374151]">
                  I am seeing questions that do not match the topics my class is covering.
                </div>
                <div className="text-[11px] px-[8px] py-[3px] rounded-full bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] whitespace-nowrap">
                  Content feedback
                </div>
              </div>
              
              <div className="rounded-[16px] bg-[#f9fafb] border border-dashed border-[#e5e7eb] text-[13px] flex justify-between items-center gap-[10px]" style={{ padding: "10px 11px" }}>
                <div className="text-[13px] text-[#374151]">
                  I made an account with the wrong email and want to fix it without losing progress.
                </div>
                <div className="text-[11px] px-[8px] py-[3px] rounded-full bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] whitespace-nowrap">
                  Profile update
                </div>
              </div>
            </div>
          </article>

          {/* RIGHT: CONTACT & MESSAGE FORM */}
          <aside className="bg-white rounded-[22px] border border-[#e5e7eb] shadow-[0_16px_40px_rgba(15,23,42,0.04)]" style={{ padding: "18px 18px 16px" }}>
            <header className="flex justify-between items-center gap-[10px] mb-[10px]">
              <div>
                <h2 className="text-[16px] font-semibold m-0 text-[#111827]">Contact The NursingMocks Support Team</h2>
                <p className="text-[13px] text-[#6b7280] m-0 mt-1">
                  Tell us what you are working on, what went wrong, and what you expected to happen.
                  The clearer the picture, the faster we can help.
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr] gap-[10px] mt-[8px] text-[13px]">
              <div className="rounded-[16px] bg-[#f9fafb] border border-[#e5e7eb] flex flex-col gap-[3px]" style={{ padding: "9px 11px" }}>
                <strong className="text-[13px] text-[#111827]">Typical response time</strong>
                <span className="text-[12px] text-[#6b7280]">Monday – Friday: under 24 hours</span>
              </div>
              <div className="rounded-[16px] bg-[#f9fafb] border border-[#e5e7eb] flex flex-col gap-[3px]" style={{ padding: "9px 11px" }}>
                <strong className="text-[13px] text-[#111827]">Best time to message us</strong>
                <span className="text-[12px] text-[#6b7280]">Morning or early afternoon in your local time zone</span>
              </div>
            </div>

            <div className="mt-[10px] flex flex-col gap-[8px] text-[13px]">
              <div className="flex items-center gap-[8px] rounded-[12px] bg-[#f9fafb] border border-[#e5e7eb]" style={{ padding: "7px 9px" }}>
                <FaEnvelope className="text-[14px] text-[#4f46e5]" />
                <div>
                  <span className="text-[13px] text-[#111827]">Email: support@nursingmocks.com</span>
                  <small className="block text-[11px] text-[#6b7280] mt-0.5">
                    Use this for detailed questions, screenshots, or anything related to billing and account access.
                  </small>
                </div>
              </div>
              
              <div className="flex items-center gap-[8px] rounded-[12px] bg-[#f9fafb] border border-[#e5e7eb]" style={{ padding: "7px 9px" }}>
                <FaWhatsapp className="text-[14px] text-[#4f46e5]" />
                <div>
                  <span className="text-[13px] text-[#111827]">WhatsApp: +254 7xx xxx xxx</span>
                  <small className="block text-[11px] text-[#6b7280] mt-0.5">
                    Quick questions only. We cannot change billing details over chat, but we can point you in the right direction.
                  </small>
                </div>
              </div>
              
              <div className="flex items-center gap-[8px] rounded-[12px] bg-[#f9fafb] border border-[#e5e7eb]" style={{ padding: "7px 9px" }}>
                <FaCommentDots className="text-[14px] text-[#4f46e5]" />
                <div>
                  <span className="text-[13px] text-[#111827]">In-app chat</span>
                  <small className="block text-[11px] text-[#6b7280] mt-0.5">
                    Available from the bottom-right icon on desktop. If we are offline, your message drops into our inbox.
                  </small>
                </div>
              </div>
            </div>

            <SupportContactForm />
          </aside>
        </section>

        {/* SECONDARY SUPPORT INFO */}
        <section style={{ padding: "0 0 40px" }}>
          <header className="mb-[6px]">
            <div>
              <h2 className="text-[16px] font-semibold m-0 text-[#111827]">Before You Hit Send</h2>
              <p className="text-[13px] text-[#6b7280] m-0 mt-1">
                A few guidelines that keep things fair, transparent, and respectful for everyone who uses NursingMocks.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-[14px]">
            <article className="bg-white rounded-[18px] border border-[#e5e7eb] text-[13px] shadow-[0_12px_30px_rgba(15,23,42,0.03)]" style={{ padding: "16px 16px 14px" }}>
              <div className="flex justify-between items-center gap-[10px] mb-[6px]">
                <h3 className="text-[15px] font-semibold m-0 text-[#111827]">Academic integrity matters</h3>
                <span className="text-[11px] px-[7px] py-[3px] rounded-full bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]">
                  Important
                </span>
              </div>
              <p className="m-0 mb-[8px] text-[#6b7280] leading-[1.6]">
                We are happy to explain concepts, walk through practice questions, and help you build a study plan,
                but we cannot sit your real exam for you, provide actual test questions, or help you bypass any school
                policy. If a message looks like a request for that kind of help, we will decline it and gently explain why.
              </p>
              <ul className="m-0 pl-[18px] text-[12px] text-[#4b5563]">
                <li className="mt-[3px] first:mt-0">Use NursingMocks to practise and understand, not to shortcut the testing process.</li>
                <li className="mt-[3px]">Follow your school's code of conduct and the rules set by ATI, HESI, or your testing provider.</li>
                <li className="mt-[3px]">If you are unsure whether something is allowed, ask us and we will give an honest answer.</li>
              </ul>
            </article>

            <article className="bg-white rounded-[18px] border border-[#e5e7eb] text-[13px] shadow-[0_12px_30px_rgba(15,23,42,0.03)]" style={{ padding: "16px 16px 14px" }}>
              <div className="flex justify-between items-center gap-[10px] mb-[6px]">
                <h3 className="text-[15px] font-semibold m-0 text-[#111827]">How we handle billing and refunds</h3>
                <span className="text-[11px] px-[7px] py-[3px] rounded-full bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]">
                  Billing
                </span>
              </div>
              <p className="m-0 mb-[8px] text-[#6b7280] leading-[1.6]">
                Every plan clearly lists the renewal date and price before you check out.
                If you cancel, the current period runs to the end and then simply stops renewing.
                We know money is tight for most nursing students, so if something looks wrong on your statement,
                bring it to us calmly and we will go through it line by line.
              </p>
              <ul className="m-0 pl-[18px] text-[12px] text-[#4b5563]">
                <li className="mt-[3px] first:mt-0">Include the last four digits of the card used and the approximate charge date.</li>
                <li className="mt-[3px]">Tell us if you purchased through a bundle, promotion, or discount code.</li>
                <li className="mt-[3px]">Mistakes happen; when we see we have made one, we fix it instead of arguing about it.</li>
              </ul>
            </article>

            <article className="bg-white rounded-[18px] border border-[#e5e7eb] text-[13px] shadow-[0_12px_30px_rgba(15,23,42,0.03)]" style={{ padding: "16px 16px 14px" }}>
              <div className="flex justify-between items-center gap-[10px] mb-[6px]">
                <h3 className="text-[15px] font-semibold m-0 text-[#111827]">Technical glitches & bug reports</h3>
                <span className="text-[11px] px-[7px] py-[3px] rounded-full bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]">
                  Tech
                </span>
              </div>
              <p className="m-0 mb-[8px] text-[#6b7280] leading-[1.6]">
                Browsers, Wi-Fi, and exams do not always get along. When something breaks, a clear description from you
                often helps us find the issue faster than any automated log.
              </p>
              <ul className="m-0 pl-[18px] text-[12px] text-[#4b5563]">
                <li className="mt-[3px] first:mt-0">Let us know which device and browser you are using (for example: Chrome on Windows, or Safari on iPhone).</li>
                <li className="mt-[3px]">Tell us whether the issue happens on one exam only or across the site.</li>
                <li className="mt-[3px]">Screenshots of error messages or the exact screen where things freeze are extremely useful.</li>
              </ul>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <NewFooter />

      {/* Floating buttons */}
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}
