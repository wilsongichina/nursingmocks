"use client";

import Link from "next/link";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import TawkToChat from "@/components/ui/TawkToChat";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif] text-[#111827]">
      <NewHeader />

      {/* Privacy Hero */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <section className="max-w-[1320px] mx-auto w-[94%] py-[42px] pb-[30px]">
          <div className="max-w-[980px] mx-auto">
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#4f46e5] flex gap-[10px] items-center flex-wrap mb-2">
            <span className="px-[10px] py-1 rounded-full border border-[#c4b5fd] bg-[rgba(255,255,255,0.7)] text-[#4c1d95]">
              Privacy &amp; Data Protection
            </span>
            <span>How we treat the information you share with NursingMocks</span>
          </div>
          <h1 className="text-[clamp(30px,3.4vw,38px)] m-0 mb-[10px] leading-[1.08] font-bold">
              Privacy Policy
            </h1>
          <p className="text-[15px] max-w-[780px] text-[#4b5563] leading-[1.7] m-0 mb-[14px]">
            When you sign up for TEAS or HESI practice, you trust us with exam scores, study habits, and contact details.
            This page explains, in plain language, what we collect, why we collect it, and the choices you have.
          </p>

          <div className="flex flex-wrap gap-3 items-center text-xs text-[#6b7280]">
            <div className="inline-flex items-center gap-1.5 px-[11px] py-1.5 rounded-full bg-[rgba(255,255,255,0.98)] border border-[#e5e7eb] text-[#111827]">
              <svg className="w-[11px] h-[11px] text-[#10b981]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 3.18l6 2.25v4.81c0 4.12-2.69 7.77-6 8.89-3.31-1.12-6-4.77-6-8.89V6.43l6-2.25z"/>
              </svg>
              Last updated: <span>December 5, 2025</span>
            </div>
            <span>We review this policy whenever we ship meaningful product changes.</span>
          </div>
        </div>
      </section>
      </div>

      {/* Privacy Main Content */}
      <main className="flex-1 py-[30px] pb-10 flex justify-center max-w-[1320px] w-[94%] mx-auto">
        <section className="w-full max-w-[980px]">
          <article className="bg-white rounded-[22px] border border-[#e5e7eb] pt-[18px] px-4 pb-4 md:pt-[22px] md:px-[22px] md:pb-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <p className="mt-1 text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) provides online practice tools for
              nursing entrance exams (including ATI TEAS and HESI A2), Nursing Practice Tests, and nursing exit exams. This
              Privacy Policy describes how we handle personal information when you use our website, dashboards, and
              practice products (collectively, the &ldquo;Services&rdquo;).
            </p>

            <div className="mt-1.5 p-[10px] px-3 rounded-[14px] bg-[#f9fafb] border border-dashed border-[#e5e7eb] text-[13px] text-[#4b5563]">
              If you are in the middle of studying and just need the short version: we collect only what we need to run
              your account, keep your exams working, and improve the product. We do not sell your personal information.
            </div>

            <h2 id="section-1" className="text-[18px] m-[18px_0_6px] font-semibold">1. Who We Are &amp; How To Reach Us</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks is an independent exam-prep platform built for nursing students. We are not owned by ATI,
              Elsevier, or any nursing school. Questions labelled as &ldquo;ATI&rdquo; or &ldquo;HESI&rdquo; are for
              practice and are not official test questions.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you have a question about this policy, or want to exercise a privacy right, the best way to reach us is:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Email: <strong>support@nursingmocks.com</strong></li>
              <li className="mt-1">Subject line: <strong>&ldquo;Privacy request – NursingMocks&rdquo;</strong></li>
            </ul>

            <h2 id="section-2" className="text-[18px] m-[18px_0_6px] font-semibold">2. What This Policy Covers</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">This policy applies to information we collect when you:</p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Create or use a NursingMocks account</li>
              <li className="mt-1">Purchase a TEAS, HESI, or other nursing prep plan from us</li>
              <li className="mt-1">Take practice exams, review rationales, or track performance in your dashboard</li>
              <li className="mt-1">Contact us via email, WhatsApp, in-app support, or social channels</li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              It does <strong>not</strong> cover information collected by your nursing school, your testing provider, or
              other websites you visit, even if we link to them from our platform.
            </p>

            <h2 id="section-3" className="text-[18px] m-[18px_0_6px] font-semibold">3. Information We Collect</h2>

            <h3 className="text-[15px] m-[12px_0_4px] font-semibold">3.1 Information You Provide Directly</h3>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">Examples include:</p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                <strong>Account details:</strong> your name, email address, and password when you create an account.
              </li>
              <li className="mt-1">
                <strong>Billing details:</strong> payment method, billing address, and plan type when you subscribe.
                Payments are processed by trusted third-party providers; we do not store your full card number.
              </li>
              <li className="mt-1">
                <strong>Study information:</strong> which exams you take (for example, &ldquo;ATI TEAS Math – Set 4&rdquo;),
                your scores, time spent, and which questions you mark for review.
              </li>
              <li className="mt-1">
                <strong>Support messages:</strong> emails, chats, and attachments (such as screenshots) you send when you
                contact us.
              </li>
            </ul>

            <h3 className="text-[15px] m-[12px_0_4px] font-semibold">3.2 Information Collected Automatically</h3>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              When you use NursingMocks, we automatically collect some technical data so the site can function and we can
              understand how students are using it. This may include:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Device type (for example, laptop, tablet, or phone)</li>
              <li className="mt-1">Browser and operating system</li>
              <li className="mt-1">IP address and approximate location (city or region, not your exact home address)</li>
              <li className="mt-1">
                Log data such as pages viewed, time spent on an exam, and features used (for example, &ldquo;review mode&rdquo;
                vs &ldquo;exam mode&rdquo;)
              </li>
            </ul>

            <h3 className="text-[15px] m-[12px_0_4px] font-semibold">3.3 Cookies &amp; Similar Technologies</h3>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We use cookies and similar technologies to keep you logged in, remember your preferences, and measure how the
              platform is performing. You can control cookies through your browser settings, but some features may stop
              working correctly if you disable essential cookies.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              For more detail on how we use these tools, please see our
              <Link href="/cookie-policy" className="text-[#4f46e5] hover:underline ml-1">Cookie &amp; Tracking Notice</Link>.
            </p>

            <h3 className="text-[15px] m-[12px_0_4px] font-semibold">3.4 Information From Third Parties</h3>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you purchase through a partner link, or arrive from an affiliate or ad campaign, we may receive
              non-sensitive information such as the campaign name or referring website. This helps us understand which
              study resources are leading nursing students to us.
            </p>

            <h2 id="section-4" className="text-[18px] m-[18px_0_6px] font-semibold">4. How We Use Your Information</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">We use the information we collect to:</p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Create and manage your account and subscription</li>
              <li className="mt-1">Serve you the correct practice content based on the module or exam you choose</li>
              <li className="mt-1">Save your scores, progress, and study history so you can pick up where you left off</li>
              <li className="mt-1">Troubleshoot technical issues and keep the platform secure</li>
              <li className="mt-1">
                Analyse usage patterns (for example, which TEAS sections students struggle with most) so we can improve
                explanations and add new question sets
              </li>
              <li className="mt-1">Communicate with you about updates, maintenance, and new features</li>
              <li className="mt-1">
                Comply with legal obligations, such as responding to lawful requests from authorities where required
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We do <strong>not</strong> use your personal practice data to make automated decisions about your future,
              admissions chances, or anything outside the platform itself.
            </p>

            <h2 id="section-5" className="text-[18px] m-[18px_0_6px] font-semibold">5. How We Share Information</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We share your information only when it is necessary to provide the Services, improve them, or comply with the
              law. Common examples include:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                <strong>Payment processors:</strong> to handle subscription payments and refunds securely.
              </li>
              <li className="mt-1">
                <strong>Analytics tools:</strong> to understand how the platform is used (for example, which pages are
                frequently visited, or which exams students start but do not finish).
              </li>
              <li className="mt-1">
                <strong>Email and messaging providers:</strong> to send account-related emails, password resets, receipts,
                and support replies.
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We do <strong>not</strong> sell your personal information. We also do not give schools or employers access to
              your individual scores unless you explicitly ask us to share something on your behalf.
            </p>

            <h2 id="section-6" className="text-[18px] m-[18px_0_6px] font-semibold">6. How Long We Keep Your Data</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We keep your information only for as long as we have a reason to do so – for example, to maintain your
              account, show your exam history, meet legal requirements, or resolve billing questions.
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Account and study data are generally kept while you have an active account, and for a reasonable period
                afterward so you can return to your history if you come back.
              </li>
              <li className="mt-1">
                Billing records are kept for the time required by tax and accounting laws, even if you close your account.
              </li>
              <li className="mt-1">
                Support conversations may be retained so we can see what was previously discussed, which helps us avoid
                repeating the same troubleshooting steps with you.
              </li>
            </ul>

            <h2 id="section-7" className="text-[18px] m-[18px_0_6px] font-semibold">7. Your Choices &amp; Rights</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Depending on where you live, you may have certain rights over your personal information. Even where those
              laws do not formally apply, we try to offer a consistent, student-friendly approach:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                <strong>Access:</strong> you can request a summary of the key personal data we hold about you.
              </li>
              <li className="mt-1">
                <strong>Correction:</strong> if your name, email, or other details are inaccurate, you can update them in
                your account settings or ask us to correct them.
              </li>
              <li className="mt-1">
                <strong>Deletion:</strong> you may request that we delete your account and associated personal data, subject
                to information we must keep for legal or security reasons.
              </li>
              <li className="mt-1">
                <strong>Marketing preferences:</strong> you can opt out of non-essential marketing emails by using the
                unsubscribe link at the bottom of those emails.
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              To exercise any of these rights, email us at <strong>support@nursingmocks.com</strong> from the address
              linked to your account and clearly describe what you are requesting.
            </p>

            <h2 id="section-8" className="text-[18px] m-[18px_0_6px] font-semibold">8. Keeping Your Information Safe</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We use a combination of technical and organisational measures to protect your information. Examples include:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Using reputable cloud hosting providers and secure connections (HTTPS) where possible</li>
              <li className="mt-1">Limiting staff access to data strictly to what they need to do their job</li>
              <li className="mt-1">Regularly reviewing logs and alerts for suspicious activity</li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              No online platform can promise perfect security, but we do take practical and reasonable steps to reduce
              risk. If we ever discover a data incident that could impact you, we will communicate honestly about what
              happened and what we are doing in response.
            </p>

            <h2 id="section-9" className="text-[18px] m-[18px_0_6px] font-semibold">9. Children &amp; Student Accounts</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks is designed for nursing students and adult learners preparing for professional exams. We do not
              knowingly collect personal information from children under the age where parental consent is required in your
              region.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you believe a child has created an account or provided personal information to us without appropriate
              consent, please contact us and we will investigate and take appropriate action.
            </p>

            <h2 id="section-10" className="text-[18px] m-[18px_0_6px] font-semibold">10. International Transfers</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Our servers or service providers may be located in different countries. This means your information may be
              processed in a country that is not the one you live in. We work only with providers that commit to protecting
              your data and handling it in line with recognised privacy standards.
            </p>

            <h2 id="section-11" className="text-[18px] m-[18px_0_6px] font-semibold">11. Changes To This Policy</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We may update this Privacy Policy from time to time as our Services evolve, or as laws change. When we make
              a significant change, we will:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Update the &ldquo;Last updated&rdquo; date at the top of this page</li>
              <li className="mt-1">Publish the revised policy on this page</li>
              <li className="mt-1">
                Where appropriate, notify you by email or with a notice inside your dashboard, especially if the changes
                affect how your data is used
              </li>
            </ul>

            <h2 id="section-12" className="text-[18px] m-[18px_0_6px] font-semibold">12. Contacting Us About Privacy</h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you have a question, concern, or complaint about how we handle your information, we would rather you tell
              us directly than worry in silence. The inbox below is monitored by real humans, not bots:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Email: <strong>support@nursingmocks.com</strong></li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              When you write, it helps if you include the email address linked to your account and a short description of
              what you need. We cannot promise to fix every issue instantly, but we do read every message and respond as
              promptly as we can.
            </p>
          </article>
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
