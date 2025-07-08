"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { getMathPageContent } from "@/lib/firestore-operations";
import { getIconComponent, getIconColor } from "@/lib/math-page-content";

// Default content as fallback
const defaultContent = {
  hero: {
    badge: "TEAS Math Practice",
    title: "ATI TEAS Math Questions",
    subtitle:
      "Practice the Most Common TEAS Math Questions for TEAS Exam Success",
    description:
      "Struggling with the math portion of the TEAS exam? Our teas math practice tests are designed to give you focused, exam-like practice that boosts confidence and performance.",
  },
  trustIndicators: [
    { title: "Expert TEAS Specialists", icon: "check" },
    { title: "Complete Privacy Assurance", icon: "shield" },
    { title: "High Client Satisfaction Rates", icon: "star" },
    { title: "Guaranteed Success", icon: "check-circle" },
  ],
  whatToExpect: {
    badge: "TEAS Math Practice",
    title: "What to Expect in the ATI TEAS Math Practice Test Section",
    subtitle:
      "The math practice test for the ATI TEAS is supposed to be the same as the math element of the real TEAS test.",
    cards: [
      {
        title: "Test Structure & Timing",
        icon: "check",
        content: [
          "There are normally 36 questions in the math part of the TEAS that you have to answer in 57 minutes.",
        ],
      },
    ],
    footer:
      "Regularly taking ATI TEAS Math Practice Tests will make you feel more sure of yourself.",
  },
  mostCommonQuestions: {
    badge: "2025 TEAS Exam",
    title: "Most Common TEAS Practice Math Questions on the 2025 TEAS Exam",
    subtitle:
      "The math part of the 2025 TEAS test is very similar to the math part of the real test.",
    cards: [
      {
        title: "Core Math Concepts",
        content: [
          "These include working with fractions, decimals, percentages, and ratios.",
        ],
      },
    ],
  },
  studyGuide: {
    badge: "Study Guide",
    title: "Best Way for Students to Study for ATI TEAS Math",
    subtitle:
      "Comprehensive study strategies for each section of the TEAS exam",
    sections: [
      {
        title: "Math",
        icon: "star",
        content:
          "The math part is all about basic math, like adding, subtracting, multiplying, and dividing.",
      },
    ],
  },
  privacyPricing: [
    {
      title: "Your Privacy is Always Guaranteed",
      icon: "shield",
      content:
        "When you ask us to take my TEAS for me, we respect your privacy.",
    },
  ],
  faq: {
    title: "Frequently Asked Questions",
    subtitle:
      "Get answers to the most common questions about TEAS math preparation.",
    questions: [
      {
        question: "What kinds of math problems are on the ATI TEAS?",
        paragraphs: [
          "The math part of the ATI TEAS tests the basic skills you need to go to nursing school.",
        ],
        additionalParagraphs: [],
      },
    ],
  },
};

export default function MathPage() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const result = await getMathPageContent();

        if (result.success && result.data) {
          // Convert Firestore data to the expected format
          const firestoreData = result.data as any;
          setContent({
            hero: firestoreData.hero || defaultContent.hero,
            trustIndicators:
              firestoreData.trustIndicators || defaultContent.trustIndicators,
            whatToExpect:
              firestoreData.whatToExpect || defaultContent.whatToExpect,
            mostCommonQuestions:
              firestoreData.mostCommonQuestions ||
              defaultContent.mostCommonQuestions,
            studyGuide: firestoreData.studyGuide || defaultContent.studyGuide,
            privacyPricing:
              firestoreData.privacyPricing || defaultContent.privacyPricing,
            faq: firestoreData.faq || defaultContent.faq,
          });
        } else {
          console.warn("Using default content:", result.message);
          // Keep using default content if Firestore fetch fails
        }
      } catch (err) {
        console.error("Error loading content from Firestore:", err);
        setError("Failed to load content. Using default content.");
        // Keep using default content on error
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">
              Loading content from Firestore...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few seconds on first load
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-lg font-semibold">Error Loading Content</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </Layout>
    );
  }

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
              {content.hero.badge}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content.hero.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
            <p className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              {content.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/heasi-a2"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Our Services
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

      {/* Trust Indicators Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {content.trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div
                  className={`w-20 h-20 ${getIconColor(
                    indicator.icon
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(indicator.icon)} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {indicator.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {content.whatToExpect.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.whatToExpect.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content.whatToExpect.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.whatToExpect.cards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${getIconColor(
                    card.icon
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(card.icon)} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {card.title}
                </h3>
                {card.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < card.content.length - 1 ? "mb-4" : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {content.whatToExpect.footer}
            </p>
          </div>
        </div>
      </section>

      {/* Most Common Questions Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              {content.mostCommonQuestions.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.mostCommonQuestions.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content.mostCommonQuestions.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.mostCommonQuestions.cards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {card.title}
                </h3>
                {card.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < card.content.length - 1 ? "mb-4" : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Guide Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
              {content.studyGuide.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.studyGuide.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content.studyGuide.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content with Left Border */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-600 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {content.studyGuide.sections.map((section, index) => (
                    <div key={index} className="text-center">
                      <div
                        className={`w-16 h-16 ${getIconColor(
                          section.icon
                        )} rounded-full flex items-center justify-center mx-auto mb-6`}
                      >
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={getIconComponent(section.icon)} />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side CTA */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-lg text-white sticky top-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-blue-900"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Ready to Excel?</h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Get expert help with your TEAS math preparation. Our
                    specialists are here to guide you to success.
                  </p>
                  <div className="space-y-4">
                    <Link
                      href="/heasi-a2"
                      className="block w-full bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors text-center"
                    >
                      Our Services
                    </Link>
                    <Link
                      href="/prices"
                      className="block w-full border-2 border-white text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
                    >
                      View Pricing
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.privacyPricing.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${getIconColor(
                    item.icon
                  )} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={getIconComponent(item.icon)} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {content.faq.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.faq.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {content.faq.questions.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {faq.question}
                </h3>

                {/* Render paragraphs */}
                {faq.paragraphs.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className={`text-gray-600 leading-relaxed ${
                      pIndex < faq.paragraphs.length - 1 ? "mb-4" : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}

                {/* Render additional paragraphs if they exist */}
                {faq.additionalParagraphs &&
                  faq.additionalParagraphs.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className={`text-gray-600 leading-relaxed ${
                        pIndex < faq.additionalParagraphs!.length - 1
                          ? "mb-4"
                          : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Page Style CTA Banner */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center">
            {/* Left Side - CTA Content */}
            <div>
              <p className="text-xl font-semibold mb-4 w-full text-center">
                Pay Only After You Pass
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 w-full text-center">
                Ready to Master TEAS Math?
              </h2>
              <p className="text-xl md:text-2xl mb-8 w-full text-center">
                Get expert help with your TEAS math preparation. Our specialists
                are here to guide you to success and ensure you achieve your
                nursing school goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors text-center"
                >
                  Get a Free Quote
                </Link>
                <Link
                  href="/prices"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Get Started Today</h3>
                <p className="text-blue-100 mb-6">
                  Contact us for personalized TEAS math assistance
                </p>
                <div className="space-y-4">
                  <Link
                    href="/contact"
                    className="block w-full bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors text-center"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/heasi-a2"
                    className="block w-full border-2 border-white text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
                  >
                    Our Services
                  </Link>
                </div>
              </div>
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
                Ready to Master TEAS Math?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Join thousands of successful students who have achieved their
                nursing school dreams with TEAS Gurus. Get started today and pay
                only after you pass.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/heasi-a2"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Our Services
                </Link>
                <Link
                  href="/prices"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
