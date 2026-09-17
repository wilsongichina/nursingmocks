import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { getCanonicalSiteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "How NursingMocks Works",
  description: "Choose your nursing exam, find a practice set, and review the questions on NursingMocks.",
  alternates: { canonical: `${getCanonicalSiteUrl()}/how-it-works` },
};

export default function HowItWorksPage() {
  return (
    <Layout initialBreadcrumbItems={[{ name: "Home", url: "/" }, { name: "How It Works" }]}>
      <section className="public-page-container py-10">
        <h1 className="text-3xl font-bold text-gray-950">How NursingMocks Works</h1>
        <p className="mt-3 text-gray-600">Start with the exam you are preparing for, then choose a subject and practice set.</p>
        <ol className="mt-8 space-y-6 list-decimal pl-6 text-gray-700">
          <li><h2 className="text-lg font-semibold text-gray-950">Choose your exam</h2>
            <p>Browse <Link className="text-purple-700 underline" href="/nursing-entrance-exam">entrance exams</Link>, <Link className="text-purple-700 underline" href="/nursing-test-bank">nursing test banks</Link>, or <Link className="text-purple-700 underline" href="/nursing-exit-exam">exit exams</Link>.</p></li>
          <li><h2 className="text-lg font-semibold text-gray-950">Open a subject and practice set</h2>
            <p>Follow the exam pages to the subject or topic you want to study. Review Mode on a practice set opens its question list.</p></li>
          <li><h2 className="text-lg font-semibold text-gray-950">Check your access</h2>
            <p>Some sets provide a public preview. Full access depends on the exam package assigned to your account. Check <Link className="text-purple-700 underline" href="/prices">Plans &amp; Pricing</Link> for available options.</p></li>
          <li><h2 className="text-lg font-semibold text-gray-950">Review and practise</h2>
            <p>Work through the questions and available explanations. Use the page breadcrumbs to return to the subject or exam and select another set.</p></li>
        </ol>
        <p className="mt-8 text-gray-600">Need help? Read the <Link className="text-purple-700 underline" href="/faqs">FAQs</Link> or <Link className="text-purple-700 underline" href="/contact">contact us</Link>.</p>
      </section>
    </Layout>
  );
}
