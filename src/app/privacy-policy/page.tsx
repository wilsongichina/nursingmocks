import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - TEAS Gurus",
  description:
    "Read our privacy policy to understand how we collect, use, and protect your personal information when you use our TEAS exam services.",
  keywords:
    "privacy policy, TEAS exam privacy, data protection, personal information, privacy terms",
  openGraph: {
    title: "Privacy Policy - TEAS Gurus",
    description:
      "Read our privacy policy to understand how we collect, use, and protect your personal information.",
    url: "https://teasgurus.com/privacy-policy",
  },
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Learn how we collect, use, and protect your personal information
              when you use our TEAS exam services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/terms-of-service"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Information We Collect
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We collect information you provide directly to us, such as when
              you create an account, contact us, or use our services. This may
              include your name, email address, phone number, and other contact
              information.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We use the information we collect to provide, maintain, and
              improve our services, communicate with you, and ensure the
              security of our platform. Your information is never sold to third
              parties.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Data Security
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction. Our systems are regularly updated and
              monitored.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Information Sharing
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties without your consent, except as
              required by law or to protect our rights and safety.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Your Rights
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You have the right to access, update, or delete your personal
              information. You may also opt out of certain communications.
              Contact us to exercise these rights.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Cookies and Tracking
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We use cookies and similar technologies to enhance your experience
              on our website. You can control cookie settings through your
              browser preferences.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We may update this privacy policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the effective date.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Contact Us
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If you have any questions about this privacy policy or our data
              practices, please contact us through our contact form or email us
              directly.
            </p>

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
                Questions About Our Privacy Policy?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                We're committed to transparency and protecting your privacy.
                Contact us if you have any questions about how we handle your
                information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Contact Us
                </Link>
                <Link
                  href="/terms-of-service"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Terms of Service
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
              Need More Information?
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help you understand our privacy practices and
              answer any questions you may have.
            </p>
          </div>
          <ContactForm title="Get in Touch" />
        </div>
      </section>
    </Layout>
  );
}
