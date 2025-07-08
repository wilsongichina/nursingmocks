import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guarantees - TEAS Gurus",
  description:
    "Learn about our guarantees and commitments to your TEAS exam success. We stand behind our services with comprehensive guarantees for your peace of mind.",
  keywords:
    "guarantees, TEAS exam guarantees, service guarantees, satisfaction guarantee, educational guarantees",
  openGraph: {
    title: "Guarantees - TEAS Gurus",
    description:
      "Learn about our guarantees and commitments to your TEAS exam success.",
    url: "https://teasgurus.com/guarantees",
  },
  alternates: {
    canonical: "/guarantees",
  },
};

export default function GuaranteesPage() {
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
              Our Guarantees
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              We stand behind our services with comprehensive guarantees for
              your peace of mind. Your success is our commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/money-back-guarantee"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Money Back Guarantee
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              GUARANTEES
            </h2>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              What We Promise You
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You're not just paying for a service when you choose Teas Gurus;
              you're also trusting us with your future. And we really mean it.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              This is what we promise:
            </p>

            <div className="space-y-8">
              <div className="bg-white border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Best Scores, All the Time
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  We want to get at least 85% on every TEAS. No excuses, no
                  shortcuts.
                </p>
              </div>

              <div className="bg-white border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  We will keep your privacy safe.
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  No one else will know about it. No one, not your school or the
                  testing site, will ever know that you got help. We keep it
                  completely private.
                </p>
              </div>

              <div className="bg-white border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  We Get There On Time
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Your test will happen exactly when it is supposed to. We can
                  help you with your exam at any time of day or night, no matter
                  where you are.
                </p>
              </div>

              <div className="bg-white border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Guarantee of a refund
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  You will get a full refund if we don't deliver what we
                  promised, whether that means missing the deadline or not
                  reaching the target score. No problems, no stress.
                </p>
              </div>

              <div className="bg-white border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  You'll Always Know What's Going On
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  We'll keep you up to date at every step, so you won't be left
                  in the dark.
                </p>
              </div>

              <div className="bg-white border-l-4 border-indigo-500 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Easy and Safe Setup
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  We set everything up for you quickly, safely, and without any
                  tech problems using safe, remote tools like AnyDesk.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mt-12 border-l-4 border-blue-500">
              <p className="text-gray-800 text-lg leading-relaxed">
                In the end, your success is our success. We'll take care of your
                TEAS exam so you can focus on what's most important: your future
                as a nurse.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 mt-8">
              <p className="text-green-800 font-semibold mb-2">
                Our Commitment:
              </p>
              <p className="text-green-700">
                We are committed to your success and satisfaction. Our
                guarantees are designed to protect your investment and ensure
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
                Ready to Trust Us With Your Future?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Our comprehensive guarantees ensure you have nothing to lose.
                Start your TEAS exam journey with confidence knowing we stand
                behind every promise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/money-back-guarantee"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Money Back Guarantee
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
              Questions About Our Guarantees?
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help you understand our guarantees and address
              any questions you may have about our services.
            </p>
          </div>
          <ContactForm title="Get in Touch" />
        </div>
      </section>
    </Layout>
  );
}
