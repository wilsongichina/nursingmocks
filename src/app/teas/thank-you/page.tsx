import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You - TeasGurus",
  description:
    "Thank you for reaching out to TeasGurus. We've received your form submission and will get back to you shortly.",
  keywords: "thank you, contact confirmation, TEAS exam help, TeasGurus",
  openGraph: {
    title: "Thank You - TeasGurus",
    description:
      "Thank you for reaching out to TeasGurus. We've received your form submission and will get back to you shortly.",
    url: "https://teasgurus.com/teas/thank-you",
  },
  alternates: {
    canonical: "/teas/thank-you",
  },
};

export default function ThankYouPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Main Content */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Thank You for Reaching Out!
            </h1>

            <div className="text-lg text-gray-700 space-y-6 leading-relaxed">
              <p>
                We've received your form submission and truly appreciate your
                interest in Teas Gurus.
              </p>

              <p>
                One of our team members will get back to you shortly—either via
                email, WhatsApp, or iMessage—depending on your preferred method
                of contact.
              </p>

              <p>
                In the meantime, feel free to check your inbox (and spam/junk
                folder) for any immediate follow-up.
              </p>

              <p>
                If you have urgent questions, you can also reach us directly
                through{" "}
                <a
                  href="https://wa.me/15795011983"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-semibold underline"
                >
                  WhatsApp
                </a>{" "}
                or our{" "}
                <Link
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  contact page
                </Link>
                .
              </p>

              <p className="text-xl font-semibold text-gray-900">
                Thanks again for getting in touch—we look forward to helping you
                succeed with your TEAS exam!
              </p>
            </div>

            {/* Back to Home Button */}
            <div className="mt-10">
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Home
              </Link>
            </div>

            {/* Additional Links */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <Link
                  href="/hesi-a2"
                  className="hover:text-green-600 transition-colors"
                >
                  Our Services
                </Link>
                <Link
                  href="/prices"
                  className="hover:text-green-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/how-it-works"
                  className="hover:text-green-600 transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="/faqs"
                  className="hover:text-green-600 transition-colors"
                >
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
