import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hesi A2 | Hesi A2 Exam Services – TeasGurus",
  description:
    "Get guaranteed Hesi A2 exam support with real questions and expert help. Whether it's Math, Reading, Science, or English – TeasGurus handles your Hesi A2 test from start to finish.",
  keywords:
    "Hesi A2 services, Hesi A2 practice tests, Hesi A2 study materials, Hesi A2 tutoring, Hesi A2 exam help, nursing school preparation",
  openGraph: {
    title: "Hesi A2 | Hesi A2 Exam Services – TeasGurus",
    description:
      "Get guaranteed Hesi A2 exam support with real questions and expert help. Whether it's Math, Reading, Science, or English – TeasGurus handles your Hesi A2 test from start to finish.",
    url: "https://teasgurus.com/hesi-a2",
  },
  alternates: {
    canonical: "/hesi-a2",
  },
};

export default function HesiA2Page() {
  const services = [
    {
      icon: "➗",
      title:
        "Hesi A2 Math Questions — Let Us Take It for You and Get Real Questions",
      description:
        "Are you worried about changing numbers or solving hard equations? Our math experts can take your Hesi A2 math test for you and give you the same kinds of questions that are on the real test.",
      features: [
        "Full support for math, algebra, reading data, and taking measurements",
        "Real Hesi A2 Math Questions with answers and explanations",
        "We have professionals who take the test for you, either online or in person",
        "100% privacy, and if you're not happy, you can get your money back",
      ],
      callToAction:
        "👉 We give you Hesi A2 Math Questions or take the test for you.",
    },
    {
      icon: "🔬",
      title:
        "Hesi A2 Science Questions — We Take the Test and Share Real Exam Content",
      description:
        "Don't worry about dealing with hard anatomy and chemistry. We'll take the Hesi A2 science test for you, and we'll give you access to the real questions so you can study and understand them ahead of time.",
      features: [
        "Covers biology, chemistry, human anatomy & physiology, and scientific reasoning",
        "Get Hesi A2 Science Questions with the correct answers",
        "MSN-level tutors take the test for you in complete safety",
        "Transparent service and flexible payment options",
      ],
      callToAction:
        "👉 We give you Hesi A2 Science Questions or do the science part for you.",
    },
    {
      icon: "📘",
      title:
        "Hesi A2 English Questions — We Handle the Test and Provide the Real Questions",
      description:
        "Are you stressed out about grammar? Not only will our team take the Hesi A2 English section for you, but they will also give you the real, current questions that are on the test.",
      features: [
        "Includes spelling, punctuation, sentence structure, and word meaning",
        "Access the exact Hesi A2 English Questions that appeared on past exams",
        "We handle tests in person or remotely with 100% privacy",
        "Guaranteed score improvement or your money back",
      ],
      callToAction:
        "👉 We give you Hesi A2 English Questions and or care of the whole test for you.",
    },
    {
      icon: "📖",
      title:
        "Hesi A2 Reading Questions — We Take the Test and Share Real Passages",
      description:
        "Are you having trouble with reading comprehension? Our experts will help you with the Hesi A2 Reading section and give you the real questions and passages that will be on the test.",
      features: [
        "Focus on paragraph structure, inference skills, and passage analysis",
        "Exact Hesi A2 Reading Questions and answers provided",
        "Exams handled by experienced tutors with proven success",
        "Safe, secure, and results-focused exam assistance",
      ],
      callToAction:
        "👉 We give you Hesi A2 Reading Questions and take the reading test for you.",
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
              Hesi A2 Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Comprehensive Hesi A2 exam services designed to help you succeed.
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
              Our Comprehensive Hesi A2 Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the service that best fits your learning style and
              timeline. All services include our proven strategies and expert
              support.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-4xl">{service.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-lg font-semibold text-blue-900">
                    {service.callToAction}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-center"
                  >
                    Get a Quote
                  </Link>
                  <Link
                    href="https://buy.stripe.com/4gw5mn0nm0mTfUk3e9"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600">
              Contact us today to discuss your Hesi A2 exam needs and get
              personalized support.
            </p>
          </div>
          <ContactForm title="Get Your Hesi A2 Support" />
        </div>
      </section>
    </Layout>
  );
}
