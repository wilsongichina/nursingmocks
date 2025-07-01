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
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              We are Teas Gurus
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Money Back Guarantee
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
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
              Our Money Back Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee that you will achieve at least a 90% score on your
              TEAS exam. If you don't reach this score, we will provide a full
              refund or retake the exam at no additional cost.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Pay After Success Model
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our unique pay-after-success model means you only pay once you
              achieve your desired results. This eliminates the risk and ensures
              you get value for your investment.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Guarantee Eligibility
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our money back guarantee is available in the following
              circumstances: failure to achieve the guaranteed score, service
              cancellation before exam commencement, or technical issues
              preventing service delivery.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Refund Process
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To request a refund under our money back guarantee, contact our
              support team within 30 days of service completion. We will review
              your case and process eligible refunds within 5-7 business days.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Non-Refundable Items
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Consultation fees, administrative costs, and any services that
              have been fully completed and delivered as promised are generally
              non-refundable.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Partial Refunds
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              In cases where partial services have been completed, we may offer
              a partial refund based on the percentage of services not delivered
              or the extent of the issue.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Dispute Resolution
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If you disagree with a refund decision, you may request a review
              by our management team. We are committed to fair and transparent
              resolution of all disputes.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              For refund requests or questions about our money back guarantee,
              please contact our customer support team through our contact form,
              email, or WhatsApp chat.
            </p>

            <div className="bg-green-50 rounded-lg p-6 mt-8">
              <p className="text-green-800 font-semibold mb-2">Our Promise:</p>
              <p className="text-green-700">
                We are committed to your success and satisfaction. Our money
                back guarantee is designed to protect your investment and ensure
                you receive the value you expect from our services.
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
                Confident in Our Money Back Guarantee?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Our pay-after-success model and comprehensive money back
                guarantee ensure you have nothing to lose. Start your TEAS exam
                journey with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started Today
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
