import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import FAQSection from "@/components/sections/FAQSection";
import Link from "next/link";
import GifSlider from "@/components/ui/GifSlider";
import GetStartedButton from "@/components/ui/GetStartedButton";

export const metadata: Metadata = {
  title: "TEAS 7 Exam Questions & Preparation | TeasGurus",
  description:
    "Get exact TEAS 7 exam questions with answers. Access the most current TEAS test materials with lifetime updates. Pass your nursing entrance exam with confidence.",
  keywords:
    "TEAS 7 exam questions, TEAS 7 practice test, TEAS 7 study materials, nursing entrance exam, TEAS 7 preparation",
  openGraph: {
    title: "TEAS 7 Exam Questions & Preparation | TeasGurus",
    description:
      "Get exact TEAS 7 exam questions with answers. Access the most current TEAS test materials with lifetime updates. Pass your nursing entrance exam with confidence.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teasgurus.com"}/teas`,
  },
  alternates: {
    canonical: "/teas",
  },
};

export default function TEASPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-[1.25rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              TEAS 7 Exam Preparation
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              TEAS 7 Exam Questions
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto leading-relaxed">
              Get access to exact TEAS 7 exam questions with answers. Study with
              the most current materials and pass your nursing entrance exam
              with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Get a Free Quote
              </Link>
              <GetStartedButton
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Buy Now - $99
              </GetStartedButton>
            </div>
          </div>
        </div>
      </section>

      {/* GIF Slider Section */}
      <GifSlider />

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Work Process of Teas Gurus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Make Payment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To gain access to the exact TEAS questions we've collected so
                far, a payment of $99.99 is required. This will give you access
                to five updates of the TEAS Version 7 exam.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Access the Files
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Once your payment is confirmed, you'll receive an email with a
                link to access the files. Please ensure your email address is
                entered correctly during payment. For any issues, feel free to
                contact us via email.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Revising the Materials
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Some questions may repeat due to the tests being shuffled, with
                a mix of both different and similar questions. Be sure to review
                all five updates we provide for complete preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Exact TEAS Questions
              </h3>
              <p className="text-gray-600">
                We offer the most current and precise exact TEAS exam questions
                to ensure you're studying the right material.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Reviews from Real Students
              </h3>
              <p className="text-gray-600">
                Our success stories come from real students who have excelled in
                their TEAS exams with our resources.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Unlimited Access
              </h3>
              <p className="text-gray-600">
                Once you purchase, you'll have lifetime access to the files,
                including future updates to stay current.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                100% Confidential
              </h3>
              <p className="text-gray-600">
                Your personal information is protected with encrypted SSL
                security, ensuring your privacy is always maintained.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pass the First Time Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pass the First Time
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We are dedicated to offering students the highest exact
                questions. That's why over 20,000 aspiring nurses have trusted
                us for their nursing entrance exam preparation. You now have the
                option to study with our expertly formulated exact questions for
                both the TEAS and HESI A2 tests.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our questions feature the same trusted elements that have helped
                countless nurses gain admission to top colleges across the U.S.
                They cover 100% relevant content and provide answers. Created by
                Experienced Tutors Who Have Taken the Exam Themselves, Our
                Practice Questions Will Give You a Clear Understanding of the
                Actual Exam, helping you feel confident and well-prepared.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  20,000+ Students Trust Us
                </h3>
                <p className="text-gray-600">
                  Join thousands of successful nursing students who have passed
                  their entrance exams with our exact questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest TEAS 7 Exams Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  TEAS 7 Success Guarantee
                </h3>
                <p className="text-gray-600">
                  Our comprehensive materials are designed to help you achieve a
                  90+ score on your TEAS 7 exam.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Latest TEAS 7 Exams 2024
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Ace the TEAS 7 exam with ease! This all-in-one guide contains
                everything you need to succeed. Includes a comprehensive set of
                TEAS 7 exact exam questions with correct answers. Covers all key
                subjects: Reading, Math, Science, English and Language Usage.
                Focuses on the exact questions you need to improve your score to
                a 90.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                This essential resource ensures you walk into test day fully
                prepared and confident. Know what to expect and achieve the
                score you want! Designed by TEAS exam experts, don't leave your
                success to chance—get the exact TEAS 7 exam questions and start
                preparing today!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Ace Your TEAS 7 Exam?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Get access to exact TEAS 7 questions and start your journey to
                nursing school success today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get a Free Quote
                </Link>
                <GetStartedButton
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Buy Now - $99
                </GetStartedButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
