import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Money Back Guarantee - TEAS Gurus",
  description:
    "Learn about our money back guarantee and commitment to your success. We offer a pay-after-success model with comprehensive guarantees for your TEAS exam services.",
  keywords:
    "money back guarantee, TEAS exam guarantee, satisfaction guarantee, pay after success, refund guarantee",
  openGraph: {
    title: "Money Back Guarantee - TEAS Gurus",
    description:
      "Learn about our money back guarantee and commitment to your success. We offer a pay-after-success model with comprehensive guarantees.",
    url: "https://teasgurus.com/money-back-guarantee",
  },
  alternates: {
    canonical: "/money-back-guarantee",
  },
};

export default function MoneyBackGuaranteePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-[1.25rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Money Back Guarantee" },
              ]}
              className="text-white"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              We are Teas Gurus
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Money Back Guarantee
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto leading-relaxed">
              We stand behind our services with a comprehensive money back
              guarantee. Your success is our commitment, and we ensure your
              satisfaction with our TEAS exam services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/guarantees"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Our Guarantees
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Money Back Guarantee Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Money Back Guarantee Policy
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Students may be able to get their money back if:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>
                Even after five tries to fix things, the original requirements
                were still not met.
              </li>
              <li>
                Our exam helper didn't meet the deadline we agreed on in the
                first agreement.
              </li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800 font-semibold">Important:</p>
              <p className="text-yellow-700">
                Students must give detailed feedback about the problems in order
                to start a refund request. Our team will look over and audit the
                case after it has been submitted to see if it meets the
                requirements.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Non-Eligibility for Refunds
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              There will be no refunds in the following situations:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>
                The student doesn't give complete or accurate initial
                information, which leads to bad results.
              </li>
              <li>
                The student changes the work that was given to them and gets bad
                results.
              </li>
              <li>
                The student doesn't answer questions or requests for
                clarification right away, which causes delays.
              </li>
              <li>After placing the order, the student changes their mind.</li>
              <li>
                The student asks for more work or changes the original scope
                after the work is done, but they don't have to pay again.
              </li>
              <li>
                Claims are made without giving people time to make changes or
                ask questions.
              </li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 font-semibold">Note:</p>
              <p className="text-blue-700">
                Any changes or additions to the original instructions will cost
                more. If these charges aren't paid, we won't be responsible for
                any problems that come up.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Transaction Charges & Refund Process
            </h2>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>
                All approved refunds are subject to a 15% transaction fee.
              </li>
              <li>
                If you want a refund, please email our support team. We'll help
                you through a quick and easy process for resolving your issue.
              </li>
            </ul>

            <div className="bg-green-50 rounded-lg p-6 mt-8">
              <p className="text-green-800 font-semibold mb-2">
                Our Commitment:
              </p>
              <p className="text-green-700">
                We are committed to providing quality service and ensuring your
                satisfaction. Our money back guarantee is designed to protect
                your investment while maintaining fair and transparent policies.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mt-8">
              <p className="text-blue-800 font-semibold mb-2">Last Updated:</p>
              <p className="text-blue-700">January 1, 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Need to Request a Refund?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Our support team is here to help you through the refund process.
                Contact us with detailed feedback about any issues you've
                experienced.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Contact Support
                </Link>
                <Link
                  href="/how-it-works"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Learn How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions About Our Money Back Guarantee?
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help you understand our money back guarantee
              and address any concerns you may have.
            </p>
          </div>
          <ContactForm title="Get in Touch" />
        </div>
      </section>
    </Layout>
  );
}
