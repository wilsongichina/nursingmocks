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
              Service Quality Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              TEAS Gurus guarantees the highest quality of educational
              assistance and exam preparation services. We are committed to
              providing comprehensive support that meets your academic needs and
              helps you achieve your goals.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Professional Support Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee professional, reliable, and timely support throughout
              your TEAS exam preparation journey. Our team of experts is
              dedicated to providing you with the guidance and assistance you
              need to succeed.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Educational Excellence Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee that our educational materials and support services
              are designed to enhance your understanding of TEAS exam content.
              Our approach focuses on legitimate educational improvement and
              comprehensive preparation.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Customer Satisfaction Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your satisfaction is our priority. We guarantee to address your
              concerns promptly and work diligently to ensure you are completely
              satisfied with our services and support.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Confidentiality Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee the confidentiality and security of your personal
              information and academic records. Your privacy is protected
              throughout our service relationship.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Continuous Support Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee ongoing support and assistance throughout your TEAS
              exam preparation process. Our team is available to help you
              navigate challenges and achieve your academic goals.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Quality Assurance Guarantee
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee that all our services meet the highest standards of
              quality and professionalism. Our commitment to excellence ensures
              that you receive the best possible support for your TEAS exam
              preparation.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Commitment to Success
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We are committed to your success and guarantee to provide the
              resources, support, and guidance you need to achieve your TEAS
              exam goals. Your academic journey is our priority.
            </p>

            <div className="bg-green-50 rounded-lg p-6 mt-8">
              <p className="text-green-800 font-semibold mb-2">Our Promise:</p>
              <p className="text-green-700">
                We guarantee to provide exceptional educational support services
                that help you prepare effectively for your TEAS exam while
                maintaining the highest standards of professionalism and
                integrity.
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
                Questions About Our Guarantees?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                We're committed to transparency and want to ensure you
                understand our guarantees and commitments. Contact us if you
                need clarification on any points.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Contact Us
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
              Need More Information?
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
