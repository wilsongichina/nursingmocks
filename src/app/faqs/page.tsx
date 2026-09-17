import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { getCanonicalSiteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "NursingMocks FAQs",
  description: "Find help choosing practice tests, using Review Mode, and accessing your NursingMocks exam package.",
  alternates: { canonical: `${getCanonicalSiteUrl()}/faqs` },
};

export default function FaqsPage() {
  return (
    <Layout initialBreadcrumbItems={[{ name: "Home", url: "/" }, { name: "FAQs" }]}>
      <section className="public-page-container py-10">
        <h1 className="text-3xl font-bold text-gray-950">Frequently Asked Questions</h1>
        <div className="mt-8 space-y-4 text-gray-700">
          <details className="rounded-xl border border-gray-200 p-5" open>
            <summary className="cursor-pointer font-semibold text-gray-950">Where do I find ATI TEAS practice tests?</summary>
            <p className="mt-3">Open <Link className="text-purple-700 underline" href="/ati-teas-practice-test">ATI TEAS Practice Tests</Link>, choose your subject, and select a practice set.</p>
          </details>
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold text-gray-950">What does Review Mode open?</summary>
            <p className="mt-3">On a practice set, Review Mode takes you to that set's question list. Topic categories open the topic page so you can choose a set.</p>
          </details>
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold text-gray-950">Why can I only see some questions?</summary>
            <p className="mt-3">Some sets show a public preview. Access to the full set requires the relevant exam package on your signed-in account. See <Link className="text-purple-700 underline" href="/prices">Plans &amp; Pricing</Link> for package details.</p>
          </details>
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold text-gray-950">Where can I find HESI A2 or nursing test-bank questions?</summary>
            <p className="mt-3">Visit <Link className="text-purple-700 underline" href="/hesi-a2-practice-test">HESI A2 Practice Tests</Link> or the <Link className="text-purple-700 underline" href="/nursing-test-bank">Nursing Test Bank</Link>.</p>
          </details>
          <details className="rounded-xl border border-gray-200 p-5">
            <summary className="cursor-pointer font-semibold text-gray-950">What if I cannot access my purchased package?</summary>
            <p className="mt-3">Check that you are signed in with the account used for your purchase. If access is still missing, <Link className="text-purple-700 underline" href="/contact">contact support</Link> with your account email and the package name.</p>
          </details>
        </div>
        <p className="mt-8"><Link className="text-purple-700 underline" href="/how-it-works">See how NursingMocks works</Link></p>
      </section>
    </Layout>
  );
}
