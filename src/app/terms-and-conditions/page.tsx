"use client";

import Link from "next/link";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";
import TawkToChat from "@/components/ui/TawkToChat";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif] text-[#111827] flex flex-col">
      <NewHeader />

      {/* Terms Hero */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <section className="max-w-[1320px] mx-auto w-[94%] py-[42px] pb-[30px]">
          <div className="max-w-[980px] mx-auto">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[#4f46e5] flex gap-[10px] items-center flex-wrap mb-2">
              <span className="px-[10px] py-1 rounded-full border border-[#c4b5fd] bg-[rgba(255,255,255,0.7)] text-[#4c1d95]">
                Terms &amp; Conditions
              </span>
              <span>The ground rules for using NursingMocks</span>
            </div>
            <h1 className="text-[clamp(30px,3.4vw,38px)] m-0 mb-[10px] leading-[1.08] font-bold">
              Terms &amp; Conditions
            </h1>
            <p className="text-[15px] max-w-[780px] text-[#4b5563] leading-[1.7] m-0 mb-[14px]">
              These terms explain what you can expect from NursingMocks, what we
              expect from you, and how we handle subscriptions, content, and
              exam prep on the platform. Please take a moment to read them
              before you dive back into practice questions.
            </p>

            <div className="flex flex-wrap gap-3 items-center text-xs text-[#6b7280]">
              <div className="inline-flex items-center gap-1.5 px-[11px] py-1.5 rounded-full bg-[rgba(255,255,255,0.98)] border border-[#e5e7eb] text-[#111827]">
                <svg
                  className="w-[11px] h-[11px] text-[#10b981]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 3.18l6 2.25v4.81c0 4.12-2.69 7.77-6 8.89-3.31-1.12-6-4.77-6-8.89V6.43l6-2.25z" />
                </svg>
                Last updated: <span>December 5, 2025</span>
              </div>
              <span>
                By using NursingMocks, you agree to the terms on this page.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Terms Main Content */}
      <main className="flex-1 py-[30px] pb-10 flex justify-center max-w-[1320px] w-[94%] mx-auto">
        <section className="w-full max-w-[980px]">
          <article className="bg-white rounded-[22px] border border-[#e5e7eb] pt-[18px] px-4 pb-4 md:pt-[22px] md:px-[22px] md:pb-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <p className="mt-1 text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;) is an online platform that provides practice
              questions, explanations, and study tools for nursing entrance
              exams (including ATI TEAS and HESI A2), nursing test banks, and
              nursing exit exams. When you create an account, start a free
              trial, or purchase a plan, you are entering into an agreement with
              us based on the terms below.
            </p>

            <div className="mt-1.5 p-[10px] px-3 rounded-[14px] bg-[#f9fafb] border border-dashed border-[#e5e7eb] text-[13px] text-[#4b5563]">
              If something in these terms is unclear, the fastest way to get
              clarification is to email
              <strong> support@nursingmocks.com</strong> with the subject line{" "}
              <strong>&ldquo;Question about Terms&rdquo;</strong>. We would
              rather clear it up early than have you guessing.
            </div>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              1. Acceptance Of These Terms
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              By accessing or using NursingMocks in any way (including browsing
              the site, creating an account, or buying a subscription), you
              confirm that you:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Have read and understood these Terms &amp; Conditions
              </li>
              <li className="mt-1">Agree to comply with them</li>
              <li className="mt-1">
                Are old enough in your region to enter into a binding agreement,
                or have appropriate consent
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you do not agree with these terms, you should not use the
              platform or purchase a plan.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              2. Who We Are (And Who We Are Not)
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks is an independent exam-prep provider. We are not
              owned, operated, or endorsed by ATI, Elsevier, HESI, Pearson, or
              any nursing school or testing body.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Names such as &ldquo;ATI&rdquo;, &ldquo;TEAS&rdquo;,
              &ldquo;HESI&rdquo;, and other trademarks belong to their
              respective owners. We use these names only to describe which exams
              our practice tools are designed to support. Our questions and
              explanations are original practice materials and are not official
              exam content.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              3. Using NursingMocks
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks is intended for individual nursing students and
              health-care learners who want to prepare for their exams in a
              legitimate, ethical way. You agree that you will:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Use the platform only for your own study and personal learning
              </li>
              <li className="mt-1">
                Respect academic integrity and not use NursingMocks to cheat on
                any exam
              </li>
              <li className="mt-1">
                Follow any applicable laws and rules from your school, employer,
                or testing provider
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              You agree that you will not:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Attempt to access or share real, live exam questions or secure
                test content
              </li>
              <li className="mt-1">
                Use the platform during a proctored or live exam in any form
              </li>
              <li className="mt-1">
                Copy, scrape, or systematically download large amounts of
                content for reuse elsewhere
              </li>
              <li className="mt-1">
                Share your login details with others or allow multiple people to
                use one account
              </li>
              <li className="mt-1">
                Try to disable, bypass, or interfere with any security or usage
                limits on the site
              </li>
            </ul>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              4. Accounts, Security &amp; Access
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              To access most features, you will need a NursingMocks account. You
              are responsible for keeping your login credentials safe and for
              all activity that occurs under your account.
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Use a strong password and keep it private.
              </li>
              <li className="mt-1">
                Let us know quickly if you suspect someone else is using your
                account.
              </li>
              <li className="mt-1">
                Do not sell or transfer your account to another person.
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We reserve the right to suspend or close accounts that are being
              misused, accessed in suspicious ways, or involved in cheating or
              abusive behaviour.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              5. Subscriptions, Billing &amp; Renewal
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Some parts of NursingMocks are free to browse, but full access to
              exam sets, dashboards, and advanced features usually requires a
              paid subscription or plan.
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                <strong>Pricing:</strong> current prices and plan details are
                displayed on the{" "}
                <Link
                  href="/pricing"
                  className="text-[#2563eb] no-underline hover:underline"
                >
                  Pricing
                </Link>
                page. Prices may change over time; if they do, we will apply
                changes on your next billing cycle where applicable.
              </li>
              <li className="mt-1">
                <strong>Billing:</strong> payments are processed by third-party
                payment providers. By purchasing a subscription, you authorise
                us and our payment processor to charge your selected payment
                method.
              </li>
              <li className="mt-1">
                <strong>Renewal:</strong> unless stated otherwise, subscriptions
                renew automatically at the end of each term (for example,
                monthly) until you cancel.
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              You can usually manage or cancel your subscription through your
              account settings. Cancelling stops future renewals; it does not
              automatically trigger a refund for past payments unless our refund
              policy applies.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              6. Refunds &amp; Money-Back Guarantee (Summary)
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We want NursingMocks to feel fair. Any specific money-back
              guarantee or refund criteria will be detailed on our dedicated{" "}
              <Link
                href="/money-back-guarantee"
                className="text-[#2563eb] no-underline hover:underline"
              >
                Money-Back Guarantee
              </Link>{" "}
              page.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              In general:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Refunds are subject to the conditions and timeframes described
                in that policy.
              </li>
              <li className="mt-1">
                We may not be able to offer refunds if a large portion of the
                content has already been used, or if the request falls outside
                the stated refund window.
              </li>
              <li className="mt-1">
                If you request a chargeback through your bank without contacting
                us first, your account may be suspended while the issue is
                reviewed.
              </li>
            </ul>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              7. Educational Use &amp; Academic Integrity
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks is designed to help you understand concepts, practise
              questions, and build confidence. It is not designed to help you
              break exam rules or get around academic policies.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              You agree that you will not use NursingMocks to:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Obtain or share real exam questions from live or recently
                administered tests
              </li>
              <li className="mt-1">
                Coordinate cheating or share answers during proctored
                assessments
              </li>
              <li className="mt-1">
                Represent our practice questions as official exam content
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We may suspend or terminate accounts that appear to be involved in
              cheating, IP violations, or behaviour that puts your nursing
              career or our platform at risk.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              8. Intellectual Property &amp; Allowed Use
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              All content on NursingMocks—including questions, explanations,
              rationales, diagrams, text, layout, branding, and design—is
              protected by intellectual property laws.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Unless we say otherwise in writing, you are allowed to:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Access the platform for your own personal, non-commercial study
              </li>
              <li className="mt-1">
                View and interact with practice questions and explanations
                inside your account
              </li>
              <li className="mt-1">
                Print or save small portions of content only for your personal
                revision
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              You may not:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Copy or re-upload our questions, explanations, or UI to another
                website or app
              </li>
              <li className="mt-1">
                Use our content to build a competing product or database
              </li>
              <li className="mt-1">
                Remove or hide any copyright, trademark, or attribution notices
              </li>
            </ul>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              9. User Content (If You Share Anything)
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If at any point you are able to post reviews, comments, or upload
              your own content (for example, suggested questions or feedback),
              you are responsible for what you share.
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                You should only submit content you have the right to share and
                that does not violate someone else&rsquo;s intellectual
                property.
              </li>
              <li className="mt-1">
                By submitting content, you give us a non-exclusive licence to
                use, display, and adapt that content in connection with the
                platform (for example, to show your review or improve features).
              </li>
              <li className="mt-1">
                We may remove or edit user content that is abusive, unlawful, or
                clearly not aligned with our goals as an exam-prep platform.
              </li>
            </ul>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              10. Third-Party Services &amp; Links
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              NursingMocks may include links to other websites or services, or
              rely on third-party tools (such as payment processors, analytics,
              or email providers). We do not control these third parties and are
              not responsible for their content, policies, or practices.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you choose to visit a third-party site or connect with a
              third-party service, you do so at your own discretion and should
              review their terms and privacy policies separately.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              11. Disclaimers
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We work hard to keep NursingMocks accurate, up to date, and
              genuinely helpful. At the same time, there are things we cannot
              promise.
            </p>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              To the fullest extent permitted by law:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                The platform and all content are provided on an &ldquo;as
                is&rdquo; and &ldquo;as available&rdquo; basis.
              </li>
              <li className="mt-1">
                We do not guarantee that using NursingMocks will result in a
                specific score, admission offer, or job outcome.
              </li>
              <li className="mt-1">
                We do not guarantee that the site will be available 100% of the
                time or free from errors, though we do aim for stability and
                reliability.
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              You are responsible for how you use the information you learn here
              and how it fits into your individual situation, program
              requirements, and local regulations.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              12. Limitation Of Liability
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              To the extent allowed by law, NursingMocks and its owners, team
              members, and partners will not be liable for any indirect,
              incidental, special, or consequential damages arising from or in
              connection with your use of the platform. This includes, for
              example:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">Lost study time or data</li>
              <li className="mt-1">
                Exam outcomes, admission decisions, or employment decisions
              </li>
              <li className="mt-1">
                Issues arising from reliance on information found on the
                platform
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Where our liability cannot be excluded, it will be limited to the
              amount you paid to us for access to the Services in the period
              immediately before the event giving rise to the claim.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              13. Suspension &amp; Termination
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We hope you never hit this section in real life, but we have to
              include it. We may suspend or terminate your access to
              NursingMocks if:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                You seriously or repeatedly violate these terms
              </li>
              <li className="mt-1">
                We detect suspicious behaviour, abuse, or attempts to break
                security
              </li>
              <li className="mt-1">
                We are required to do so by law or by a valid legal request
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Where reasonable, we will try to notify you before suspending or
              terminating your account and may give you a chance to resolve the
              issue. In urgent or severe cases (for example, clear evidence of
              cheating or fraud), we may act without prior notice.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              14. Governing Law
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              These Terms &amp; Conditions are governed by the laws of the
              jurisdiction in which NursingMocks is legally established, without
              regard to conflict of law principles. Any dispute related to these
              terms or your use of the platform will be handled in that
              jurisdiction&rsquo;s courts, unless local consumer protection laws
              give you additional rights.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              15. Changes To These Terms
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              We may update these Terms &amp; Conditions from time to time—for
              example, when we add new features, update our pricing structure,
              or respond to changes in law.
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                We will update the &ldquo;Last updated&rdquo; date at the top of
                this page.
              </li>
              <li className="mt-1">
                We will post the new version here so you can review it.
              </li>
              <li className="mt-1">
                If the changes are significant, we may also notify you by email
                or inside your dashboard, especially if they affect your rights
                or obligations.
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If you continue using NursingMocks after new terms are posted, it
              means you accept those changes. If you do not agree, you should
              stop using the platform and, if relevant, cancel your
              subscription.
            </p>

            <h2 className="text-[18px] m-[18px_0_6px] font-semibold">
              16. Contacting Us About These Terms
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              If something in these terms does not sit right with you, or you
              need clarification before making a purchase, we want to hear from
              you. You can reach us at:
            </p>
            <ul className="m-0 mb-2.5 ml-[18px] p-0 text-[14px] leading-[1.7] text-[#374151]">
              <li className="mt-1">
                Email: <strong>support@nursingmocks.com</strong>
              </li>
            </ul>
            <p className="text-[14px] leading-[1.7] text-[#374151] m-0 mb-2.5">
              Please include the email address associated with your account (if
              you have one) and a brief description of your question or concern.
              We do our best to respond within a reasonable timeframe, even
              during busy exam seasons.
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
