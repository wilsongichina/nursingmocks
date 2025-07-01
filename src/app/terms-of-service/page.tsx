import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - TEAS Gurus",
  description:
    "Read our terms of service to understand the conditions and agreements for using our TEAS exam services and support.",
  keywords:
    "terms of service, TEAS exam terms, service agreement, terms and conditions, TEAS service terms",
  openGraph: {
    title: "Terms of Service - TEAS Gurus",
    description:
      "Read our terms of service to understand the conditions and agreements for using our TEAS exam services.",
    url: "https://teasgurus.com/terms-of-service",
  },
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Understand the terms and conditions that govern our TEAS exam
              services and your use of our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy-policy"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              By accessing and using TEAS Gurus services, you accept and agree
              to be bound by the terms and provision of this agreement. If you
              do not agree to abide by the above, please do not use this
              service.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Service Description
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              TEAS Gurus provides TEAS exam preparation and assistance services.
              We offer tutoring, exam preparation materials, and related
              educational support to help students achieve their academic goals.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              User Responsibilities
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You are responsible for providing accurate information,
              maintaining the confidentiality of your account, and using our
              services in compliance with applicable laws and regulations.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Payment Terms
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Payment is due upon completion of services. We offer a
              pay-after-success model where you only pay once you achieve your
              desired results. All payments are non-refundable unless otherwise
              specified.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Intellectual Property
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              All content, materials, and intellectual property on our platform
              are owned by TEAS Gurus or our licensors. You may not reproduce,
              distribute, or create derivative works without our permission.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              TEAS Gurus shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of our services or any content provided.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Termination
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We may terminate or suspend your access to our services
              immediately, without prior notice, for any reason, including
              breach of these terms of service.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Governing Law
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which TEAS Gurus operates, without
              regard to its conflict of law provisions.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Changes to Terms
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes by posting the new terms on
              this page and updating the effective date.
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
                Questions About Our Terms?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                We're here to help you understand our terms of service. Contact
                us if you have any questions about your rights and
                responsibilities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Contact Us
                </Link>
                <Link
                  href="/privacy-policy"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Privacy Policy
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
              Need Clarification?
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help you understand our terms of service and
              answer any questions you may have.
            </p>
          </div>
          <ContactForm title="Get in Touch" />
        </div>
      </section>
    </Layout>
  );
}
