import { Metadata } from "next";
import Link from "next/link";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";

export const metadata: Metadata = {
  title: "Money-Back Guarantee Policy - Nursing Mocks",
  description:
    "Read the Nursing Mocks money-back guarantee policy. Learn when you can request a refund for your TEAS, HESI, or nursing exam prep subscription and how the process works.",
  keywords:
    "money back guarantee, refund policy, TEAS exam guarantee, HESI exam guarantee, nursing exam prep refund",
  openGraph: {
    title: "Money-Back Guarantee Policy - Nursing Mocks",
    description:
      "Read our money-back guarantee policy to understand when and how you can request a refund.",
    url: "https://nursingmocks.com/money-back-guarantee",
  },
  alternates: {
    canonical: "/money-back-guarantee",
  },
};

export default function MoneyBackGuaranteePage() {
  const lastUpdated = "December 5, 2025";

  return (
    <div
      className="min-h-screen bg-[#f9fafb]"
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      }}
    >
      <NewHeader />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <section
          className="public-page-container"
          style={{
            paddingTop: "42px",
            paddingBottom: "30px",
          }}
        >
          <div>
          <div className="flex flex-wrap gap-[10px] items-center mb-[8px] text-[12px] uppercase tracking-[0.18em] text-[#4f46e5]">
            <span
              className="rounded-full border border-[#c4b5fd] bg-white/70 text-[#4c1d95]"
              style={{ padding: "4px 10px" }}
            >
              Refunds &amp; Guarantees
            </span>
            <span>What happens if Nursing Mocks is not the right fit for you</span>
          </div>

          <h1
            className="text-[#111827]"
            style={{
              fontSize: "clamp(30px, 3.4vw, 38px)",
              lineHeight: "1.08",
              margin: "0 0 10px",
              fontWeight: "bold",
            }}
          >
            Money-Back Guarantee Policy
          </h1>
          <p
            className="text-[#4b5563]"
            style={{
              fontSize: "15px",
              maxWidth: "780px",
              lineHeight: "1.7",
              margin: "0 0 14px",
            }}
          >
            We built Nursing Mocks to be genuinely useful for nursing students, not
            a subscription you forget about. This page explains when you can
            request a refund, how the process works, and what we consider fair
            use of the platform.
          </p>

          <div className="flex flex-wrap gap-[12px] items-center text-[12px] text-[#6b7280]">
            <div
              className="inline-flex items-center gap-[6px] rounded-full bg-white/98 border border-[#e5e7eb] text-[#111827]"
              style={{ padding: "5px 11px" }}
            >
              <svg
                className="w-[11px] h-[11px] text-[#10b981]"
                fill="currentColor"
                viewBox="0 0 512 512"
              >
                <path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z" />
              </svg>
              Last updated: {lastUpdated}
            </div>
            <span>
              Always read this together with our Terms &amp; Conditions.
            </span>
          </div>
          </div>
        </section>
      </div>

      {/* Main Content */}
      <main
        className="public-page-container"
        style={{
          paddingTop: "30px",
          paddingBottom: "40px",
        }}
      >
        <section style={{ width: "100%" }}>
          <article
            className="bg-white rounded-[22px] border border-[#e5e7eb] shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
            style={{ padding: "22px 22px 20px" }}
          >
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                marginTop: "4px",
                marginBottom: "10px",
              }}
            >
              We know that money is tight for most nursing students. If you sign
              up for Nursing Mocks and realise very quickly that it is not what you
              expected, we do not want you to feel stuck. At the same time, we
              have to protect the platform from being used heavily and then
              refunded as if nothing was used at all.
            </p>

            <div
              className="rounded-[14px] bg-[#f9fafb] border border-dashed border-[#e5e7eb] text-[#4b5563]"
              style={{
                fontSize: "13px",
                marginTop: "6px",
                padding: "10px 12px",
                marginBottom: "10px",
              }}
            >
              This policy is designed to be fair on both sides: you get a safety
              net, and we keep Nursing Mocks sustainable for the long term.
            </div>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              1. Who This Policy Applies To
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              This money-back guarantee applies to individual students who
              purchase Nursing Mocks subscriptions directly through our website. If
              you access Nursing Mocks through a school, bundle, or third-party
              program, your refund options may be handled by that partner
              instead.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              2. Our General Refund Principle
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We offer a short &ldquo;try it properly&rdquo; window that allows
              you to explore the platform without risk, as long as it has not
              been used to its full depth.
            </p>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              In simple terms: if you give Nursing Mocks a fair trial, decide it is
              not for you, and have not consumed a large portion of the content,
              you can usually request a refund within the timeframe below.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              3. Eligibility Window For Refunds
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Unless stated differently on a specific promotional page at the
              time of purchase, the standard refund window is:
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                <strong>Within 7 calendar days</strong> of your initial purchase
                or first payment on a new subscription (not a renewal), and
              </li>
              <li style={{ marginTop: "4px" }}>
                <strong>
                  Before you have used a substantial portion of the content
                </strong>{" "}
                (see the fair-use guidelines below).
              </li>
            </ul>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              After this window, we typically do not issue refunds, but we may
              still help you manage your subscription so you are not billed
              again in the future.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              4. Fair-Use Guidelines
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Because Nursing Mocks is digital and instantly accessible, heavy
              usage followed by a refund request is not sustainable. As a
              general guide, refund requests are more likely to be approved if:
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                You have spent a relatively small amount of time in the question
                banks
              </li>
              <li style={{ marginTop: "4px" }}>
                You have not completed multiple full exams across several
                modules
              </li>
              <li style={{ marginTop: "4px" }}>
                You have not downloaded or exported large volumes of content
                (where available)
              </li>
            </ul>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We review each request individually, looking at how much of the
              platform has been genuinely used. We are not looking to catch you
              out; we are simply trying to prevent abuse.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              5. Situations Where A Refund Is Usually Approved
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              While we cannot guarantee outcomes in every case, the following
              are common situations where a refund is often granted within the
              eligibility window:
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                You purchased the wrong module by mistake (for example, TEAS
                instead of HESI) and notified us quickly.
              </li>
              <li style={{ marginTop: "4px" }}>
                You signed up, explored briefly, and realised immediately that
                our teaching style or question formats are not what you are
                looking for.
              </li>
              <li style={{ marginTop: "4px" }}>
                You had significant technical issues accessing the platform that
                we could not resolve in a reasonable time.
              </li>
            </ul>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              6. Situations Where A Refund Is Usually Not Approved
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              To keep the guarantee fair, there are situations where we
              generally do not issue refunds:
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                You have completed a large number of exams or worked through a
                significant portion of the question banks and then request a
                refund solely because the official exam date has passed.
              </li>
              <li style={{ marginTop: "4px" }}>
                You request a refund well after the standard eligibility window
                has passed, without any exceptional circumstances.
              </li>
              <li style={{ marginTop: "4px" }}>
                You have engaged in behaviour that violates our{" "}
                <Link
                  href="/terms-and-conditions"
                  className="text-[#4f46e5] hover:underline"
                >
                  Terms &amp; Conditions
                </Link>
                , such as account sharing, scraping, or suspected cheating.
              </li>
            </ul>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              7. How To Request A Refund
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              To request a refund under this policy:
            </p>
            <ol
              className="text-[#374151] list-decimal"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                Write to <strong>support@nursingmocks.com</strong> from the email
                address linked to your account.
              </li>
              <li style={{ marginTop: "4px" }}>
                Use a clear subject line such as{" "}
                <strong>&ldquo;Refund request – Nursing Mocks&rdquo;</strong>.
              </li>
              <li style={{ marginTop: "4px" }}>
                In the message, include:
                <ul
                  className="list-disc"
                  style={{
                    margin: "4px 0 4px 18px",
                    padding: 0,
                  }}
                >
                  <li style={{ marginTop: "4px" }}>Your full name</li>
                  <li style={{ marginTop: "4px" }}>
                    The email address used to purchase the plan
                  </li>
                  <li style={{ marginTop: "4px" }}>
                    The plan or module you purchased (for example, &ldquo;TEAS 7
                    Prep&rdquo;)
                  </li>
                  <li style={{ marginTop: "4px" }}>The date of purchase</li>
                  <li style={{ marginTop: "4px" }}>
                    A short explanation of why you are requesting a refund
                  </li>
                </ul>
              </li>
            </ol>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We review refund requests manually. In most cases, we will reply
              within a reasonable timeframe with either an approval, a request
              for more information, or an explanation if the request cannot be
              granted.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              8. How Refunds Are Processed
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              When a refund is approved:
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                Refunds are issued back to the original payment method where
                technically possible.
              </li>
              <li style={{ marginTop: "4px" }}>
                Depending on your bank or payment provider, it may take several
                business days for the funds to appear on your statement.
              </li>
              <li style={{ marginTop: "4px" }}>
                Your access to the relevant Nursing Mocks content may be reduced or
                removed, especially for plans that were fully refunded.
              </li>
            </ul>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "12px",
                lineHeight: "1.7",
                color: "#6b7280",
                marginTop: "4px",
                marginBottom: "10px",
              }}
            >
              Note: in some cases (for example, expired cards or certain digital
              wallets), we may need to coordinate an alternative refund route
              where permitted by our payment processor&rsquo;s rules.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              9. Chargebacks &amp; Disputes
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Before you open a dispute or chargeback with your bank, we
              strongly encourage you to contact us directly. In many cases,
              misunderstandings or billing issues can be resolved more quickly
              by speaking with us first.
            </p>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              If a chargeback is filed without prior contact, your account may
              be temporarily frozen while we respond to the dispute. This can
              delay both resolution and future access.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              10. Promotional Offers &amp; Special Campaigns
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              From time to time, we may run special offers, discounts, or
              campaigns with their own terms. Any specific conditions or
              extended guarantees listed on a promotion page at the time of
              purchase will apply in addition to this policy.
            </p>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              If there is ever a conflict between this page and a clearly stated
              guarantee on a specific offer, we will honour the more generous
              option for that purchase.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              11. Policy Changes
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We may update this Money-Back Guarantee Policy from time to time
              as we learn more about how students use the platform, or as
              payment-provider rules change.
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                We will update the &ldquo;Last updated&rdquo; date at the top of
                this page.
              </li>
              <li style={{ marginTop: "4px" }}>
                Changes will apply to new purchases from the date they are
                posted, not retroactively in unfair ways.
              </li>
            </ul>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              12. Need Help Deciding Before You Buy?
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              If you are not sure whether Nursing Mocks is right for your specific
              situation or exam, you are welcome to reach out before
              subscribing. Tell us which exam you are preparing for, how much
              time you have left, and what you are struggling with—we can give
              you an honest answer about whether our platform is likely to help.
            </p>
            <ul
              className="text-[#374151] list-disc"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px 18px",
                padding: 0,
              }}
            >
              <li style={{ marginTop: "4px" }}>
                Email: <strong>support@nursingmocks.com</strong>
              </li>
            </ul>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We would rather be clear up front than have you pay for something
              that does not match what you need.
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
