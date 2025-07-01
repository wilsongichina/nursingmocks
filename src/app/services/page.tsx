import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "TEAS Exam Services - Practice Tests, Study Materials & Tutoring | TEAS Gurus",
  description:
    "Comprehensive TEAS exam services including practice tests, study materials, expert tutoring, and personalized study plans. Master all four TEAS sections with our proven approach.",
  keywords:
    "TEAS services, TEAS practice tests, TEAS study materials, TEAS tutoring, TEAS exam help, nursing school preparation",
  openGraph: {
    title: "TEAS Exam Services - Practice Tests, Study Materials & Tutoring",
    description:
      "Comprehensive TEAS exam services including practice tests, study materials, expert tutoring, and personalized study plans.",
    url: "https://teasgurus.com/services",
  },
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesPage() {
  const services = [
    {
      title: "TEAS Practice Tests",
      description:
        "Full-length practice tests that mirror the actual TEAS exam format and difficulty level.",
      features: [
        "Timed practice tests",
        "Detailed explanations",
        "Performance analytics",
        "Progress tracking",
      ],
      price: "Starting at $29.99",
    },
    {
      title: "Study Materials",
      description:
        "Comprehensive study guides, flashcards, and video lessons covering all TEAS exam topics.",
      features: [
        "2,000+ practice questions",
        "Video tutorials",
        "Study guides",
        "Mobile app access",
      ],
      price: "Starting at $49.99",
    },
    {
      title: "Expert Tutoring",
      description:
        "One-on-one tutoring sessions with certified nursing educators and TEAS exam specialists.",
      features: [
        "Personalized sessions",
        "Flexible scheduling",
        "Expert instructors",
        "Progress monitoring",
      ],
      price: "Starting at $75/hour",
    },
    {
      title: "Study Plans",
      description:
        "Customized study plans tailored to your timeline, strengths, and target score.",
      features: [
        "Personalized planning",
        "Adaptive learning",
        "Milestone tracking",
        "24/7 support",
      ],
      price: "Starting at $99.99",
    },
  ];

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
              Our Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Comprehensive TEAS exam services designed to help you succeed.
              From full exam taking to targeted practice tests, we have
              everything you need to achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/prices"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Comprehensive Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the service that best fits your learning style and
              timeline. All services include our proven strategies and expert
              support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-8 hover-lift"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {service.price}
                  </p>
                  <button className="gradient-button text-white px-6 py-3 rounded-lg font-semibold">
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your TEAS Journey?
            </h2>
            <p className="text-xl text-gray-600">
              Contact us to learn more about our services and get personalized
              recommendations.
            </p>
          </div>
          <ContactForm title="Get Your Free Consultation" />
        </div>
      </section>
    </Layout>
  );
}
