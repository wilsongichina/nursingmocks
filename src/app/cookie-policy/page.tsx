import { Metadata } from "next";
import Link from "next/link";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";

export const metadata: Metadata = {
  title: "Cookie & Tracking Notice - TEAS Gurus",
  description:
    "Learn how TEAS Gurus uses cookies and similar tracking technologies to keep you logged in, analyse usage, and improve TEAS, HESI, and nursing exam prep.",
  keywords:
    "cookie policy, tracking notice, cookies, privacy, TEAS exam, HESI exam, nursing exam prep",
  openGraph: {
    title: "Cookie & Tracking Notice - TEAS Gurus",
    description:
      "Learn how we use cookies and similar tracking technologies to improve your experience.",
    url: "https://teasgurus.com/cookie-policy",
  },
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function CookiePolicyPage() {
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
              Cookies & Tracking
            </span>
            <span>How TEAS Gurus remembers you and improves the platform</span>
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
            Cookie & Tracking Notice
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
            This page explains how TEAS Gurus uses cookies and similar
            technologies to keep you logged in, measure which exams and features
            are being used, and improve your overall experience while you
            prepare for TEAS, HESI, and other nursing exams.
          </p>

          <div className="flex flex-wrap gap-[12px] items-center text-[12px] text-[#6b7280]">
            <div
              className="inline-flex items-center gap-[6px] rounded-full bg-white/98 border border-[#e5e7eb] text-[#111827]"
              style={{ padding: "5px 11px" }}
            >
              <svg
                className="w-[11px] h-[11px] text-[#10b981]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Last updated: {lastUpdated}
            </div>
            <span>
              Read this together with our Privacy Policy for the full picture.
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
              When you study online, your browser quietly keeps track of a few
              things in the background so that pages stay logged in, your
              progress is saved, and analytics can tell us which parts of the
              site need more attention. These small pieces of data are often
              called cookies, pixels, or similar technologies.
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
              We use cookies to run TEAS Gurus and understand how nursing
              students use it. We do not use cookies to spy on your personal
              life outside the platform.
            </div>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              1. What Are Cookies?
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Cookies are small text files stored on your device (computer,
              tablet, or phone) by your browser. They help a website recognise
              your device and remember certain information over time — for
              example, that you are already logged in or that you prefer exam
              mode instead of review mode.
            </p>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Similar technologies (such as local storage, pixels, and tags)
              work alongside cookies to provide analytics and usage information.
              In this notice, we refer to them collectively as
              &ldquo;cookies&rdquo; unless we need to distinguish them.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              2. Types Of Cookies We Use
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              On TEAS Gurus, cookies generally fall into the following
              categories:
            </p>

            <h3
              className="text-[#111827]"
              style={{
                fontSize: "15px",
                margin: "12px 0 4px",
                fontWeight: "bold",
              }}
            >
              2.1 Strictly Necessary Cookies
            </h3>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              These cookies are essential for the platform to function properly.
              Without them, you would not be able to:
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
                Log in and stay logged in as you move between pages
              </li>
              <li style={{ marginTop: "4px" }}>
                Start an exam and have your progress recorded correctly
              </li>
              <li style={{ marginTop: "4px" }}>
                Securely access your account and dashboard data
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
              Because they are necessary for basic functionality, you cannot
              switch these cookies off through our interface. You can still
              block them in your browser settings, but the site may not work as
              intended.
            </p>

            <h3
              className="text-[#111827]"
              style={{
                fontSize: "15px",
                margin: "12px 0 4px",
                fontWeight: "bold",
              }}
            >
              2.2 Performance &amp; Analytics Cookies
            </h3>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              These cookies help us understand how nursing students use TEAS
              Gurus so we can improve what matters most. For example, they may
              tell us:
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
                Which practice exams are used most often
              </li>
              <li style={{ marginTop: "4px" }}>
                Which pages have high drop-off or error rates
              </li>
              <li style={{ marginTop: "4px" }}>
                How many users are accessing the platform on mobile versus
                desktop
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
              We use this information in aggregate form — for trends and
              patterns, not to watch individual students. Typical tools in this
              category include analytics services that collect anonymised or
              pseudonymised data.
            </p>

            <h3
              className="text-[#111827]"
              style={{
                fontSize: "15px",
                margin: "12px 0 4px",
                fontWeight: "bold",
              }}
            >
              2.3 Preference Cookies
            </h3>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Preference cookies remember choices you make so the platform feels
              more familiar each time you return. For example:
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
                Your preferred exam module (TEAS, HESI, or a specific nursing
                test bank)
              </li>
              <li style={{ marginTop: "4px" }}>
                Whether you last used light or dark mode (if available)
              </li>
              <li style={{ marginTop: "4px" }}>
                Interface settings like language or question-view mode
              </li>
            </ul>

            <h3
              className="text-[#111827]"
              style={{
                fontSize: "15px",
                margin: "12px 0 4px",
                fontWeight: "bold",
              }}
            >
              2.4 Marketing &amp; Campaign Cookies (If Used)
            </h3>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              If we run ads or work with affiliates, marketing cookies may track
              which ad or campaign led you to TEAS Gurus. This helps us
              understand which messages are actually useful to nursing students.
            </p>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              These cookies do not give advertisers direct access to your
              personal study data. They focus on events such as &ldquo;visited
              the pricing page&rdquo; or &ldquo;started a trial&rdquo;, not the
              specific questions you got right or wrong.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              3. What We Use Cookies For
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              In practical, exam-prep terms, cookies allow us to:
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
                Keep your session active while you move between dashboards and
                exams
              </li>
              <li style={{ marginTop: "4px" }}>
                Load your existing progress when you return after a break
              </li>
              <li style={{ marginTop: "4px" }}>
                Remember which modules or exam types you use most often
              </li>
              <li style={{ marginTop: "4px" }}>
                Measure which features students find helpful, confusing, or
                rarely used
              </li>
              <li style={{ marginTop: "4px" }}>
                Diagnose technical issues that occur on particular browsers or
                devices
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
              We do not use cookies to read anything on your device outside of
              TEAS Gurus, and we do not use them to track your unrelated
              browsing on other sites.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              4. Your Choices &amp; Controls
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              You have several ways to control how cookies are used:
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
                <strong>Browser settings:</strong> most browsers let you block
                or delete cookies. You can usually find these options in the
                &ldquo;Settings&rdquo; or &ldquo;Privacy&rdquo; section of your
                browser.
              </li>
              <li style={{ marginTop: "4px" }}>
                <strong>Do Not Track / privacy preferences:</strong> depending
                on your browser and region, you may be able to send a general
                &ldquo;Do Not Track&rdquo; or similar signal. We will honour
                such signals where required by law and where our technical stack
                allows.
              </li>
              <li style={{ marginTop: "4px" }}>
                <strong>Third-party opt-outs:</strong> if we use specific
                analytics or advertising services, they may offer their own
                opt-out tools. These are usually linked from their privacy or
                cookie pages.
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
              If you decide to block all cookies, some parts of TEAS Gurus may
              stop working correctly — especially exam sessions, login, and
              personalised dashboards.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              5. Cookies From Third Parties
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We may use third-party services to help us run and improve TEAS
              Gurus. When these services place cookies, they do so under their
              own names and policies. Common examples include:
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
                Analytics providers that measure site usage and performance
              </li>
              <li style={{ marginTop: "4px" }}>
                Payment processors that help complete secure transactions
              </li>
              <li style={{ marginTop: "4px" }}>
                Email and messaging tools that send account-related
                notifications
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
              We choose providers that are widely used and that commit to
              reasonable privacy and security standards. Even so, we recommend
              reviewing the privacy and cookie information provided by those
              services if you want more detail.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              6. How Long Cookies Stay On Your Device
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Some cookies are temporary and disappear when you close your
              browser. Others last longer, so we can recognise your device when
              you return to TEAS Gurus.
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
                <strong>Session cookies:</strong> these expire when you close
                your browser. They are often used to manage your current login
                and exam attempts.
              </li>
              <li style={{ marginTop: "4px" }}>
                <strong>Persistent cookies:</strong> these remain on your device
                for a set period (days, weeks, or months) unless you delete them
                earlier. They help remember preferences and measure long-term
                usage trends.
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
              7. Relationship To Our Privacy Policy
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              Cookies are just one way we collect and process information. Our{" "}
              <Link
                href="/privacy-policy"
                className="text-[#4f46e5] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              explains in more detail:
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
                What types of personal data we collect on TEAS Gurus
              </li>
              <li style={{ marginTop: "4px" }}>
                How we use that data to run and improve the platform
              </li>
              <li style={{ marginTop: "4px" }}>
                When we share data with service providers
              </li>
              <li style={{ marginTop: "4px" }}>
                Your rights over your personal information
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
              If there is ever a question about how cookies fit into our wider
              data practices, the Privacy Policy provides the broader context.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              8. Changes To This Cookie &amp; Tracking Notice
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              We may update this notice from time to time—for example, when we
              add new features, change the tools we use, or as legal
              requirements evolve.
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
                We may highlight significant changes within your dashboard or in
                other notices.
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
              Continued use of TEAS Gurus after an updated version is posted
              means you accept the new version of this notice.
            </p>

            <h2
              className="text-[#111827]"
              style={{
                fontSize: "18px",
                margin: "18px 0 6px",
                fontWeight: "bold",
              }}
            >
              9. Contacting Us About Cookies
            </h2>
            <p
              className="text-[#374151]"
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 10px",
              }}
            >
              If you have questions about how we use cookies or would like more
              detail than this page provides, you can contact us at:
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
                Email: <strong>support@teasgurus.com</strong>
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
              When you reach out, it helps if you let us know which browser and
              device you are using (for example, &ldquo;Chrome on Windows&rdquo;
              or &ldquo;Safari on iPhone&rdquo;). That makes it easier to
              troubleshoot or explain what you are seeing.
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
