import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ContactPageSchema from "@/components/ui/ContactPageSchema";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact TeasGurus | Get Help with Your TEAS Exam Today",
  description:
    "Have questions or need help with your TEAS exam? Contact TeasGurus for expert support, real ATI TEAS questions, and professional exam-taking services. We're here to assist you 24/7.",
  keywords:
    "contact TEAS Gurus, TEAS exam help contact, get quote, TEAS support, nursing exam assistance",
  openGraph: {
    title: "Contact Teas Gurus | Reach Out for TEAS Exam Help",
    description:
      "Need assistance or ready to get started? Contact Teas Gurus today. Our support team is available 24/7 to guide you through the process or answer any questions.",
    url: "https://teasgurus.com/contact",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <Layout>
      <ContactPageSchema />
      {/* Hero Section */}
      <section className="gradient-bg text-white py-[1.25rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
              className="text-white"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              We are Teas Gurus
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto leading-relaxed">
              Ready to start your TEAS exam journey? Get in touch with us for
              personalized support, quotes, and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#contact-form"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Send Message
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Email</p>
                        <p className="text-gray-600">teasgurus@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Phone</p>
                        <p className="text-gray-600">1-579-501-1983</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          className="w-4 h-4 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Availability
                        </p>
                        <p className="text-gray-600">24/7 Support</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Why Choose TEAS Gurus?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-green-500 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Expert instructors with years of TEAS exam experience
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-green-500 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Personalized study plans tailored to your needs
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-green-500 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Comprehensive study materials and practice tests
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-green-500 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Proven track record of student success
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-green-500 mt-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        24/7 support and flexible scheduling
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
