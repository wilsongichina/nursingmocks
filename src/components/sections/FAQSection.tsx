"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "What credentials do your TEAS exam specialists possess?",
      answer:
        "Our highly skilled professionals with solid academic backgrounds in health sciences are our TEAS exam experts. Many have obtained a Doctor of Nursing Practice (DNP), and the majority have degrees in Allied Health. We are able to provide more than just basic tutoring thanks to these credentials, which enable us to guarantee high scores with genuine academic insight. Our staff has received specialized training in time management, proctored platforms, and test-taking strategies. They are fully aware of what to anticipate and how to function under duress. Each expert is carefully chosen by us based on their experience, academic credentials, and track record of assisting students in passing the ATI TEAS exam.",
    },
    {
      question:
        "How can the security and confidentiality of a student's exam be guaranteed?",
      answer:
        "Security and confidentiality are very important to us. Your identity is fully protected when working with Teas Gurus. No personal information about the students they are helping is ever given to our exam takers. They see it as just another exam that needs to be passed in a discrete and professional manner. To ensure that your data is secure from the first message to the end result, we employ private access systems, secure login processes, and encrypted communication. You can rest assured that your privacy will be completely protected, and neither your school nor the testing platform will ever be aware that you received assistance. Our professional promise is that.",
    },
    {
      question: "What occurs if I'm not happy with the outcomes?",
      answer:
        "We place a great deal of importance on your satisfaction. Even though the majority of our clients are ecstatic about their high scores, we recognize that unexpected events do occur. We provide a complete money-back guarantee in the extremely unlikely event that you're not satisfied with your outcomes. This implies that you will receive a complete refund without any complexities or fine print. We implemented this policy to demonstrate our appreciation for your confidence and investment. It's a commitment to accountability rather than merely a promise. We completely support the idea that we only succeed when you do.",
    },
    {
      question:
        "Even if I'm not in the US, can I still get help with the TEAS exam?",
      answer:
        "Indeed! Anywhere in the world, you can get professional TEAS exam assistance. Teas Gurus is a worldwide service that works around the clock to accommodate students' needs in all time zones. We can help you whether you're studying in the UK, Canada, Australia, Africa, or Asia. All you need is a laptop or desktop computer and a reliable internet connection because our system is fully online. No matter where you are, we will walk you through every step once you get in touch with us. Our services have been successfully utilized by students from more than 20 countries. Even though it is midnight your time, we are only a message away.",
    },
    {
      question: "Can I retake the TEAS exam for free?",
      answer:
        "Unfortunately, there is a cost associated with retaking the TEAS exam. The exam fee is the same whether you are taking it for the first time or again, and you will need to pay it through ATI Testing or your test center. This can be discouraging, particularly if you failed by a slim margin. Because of this, we advise students to do things correctly the first time, and our team assists you in doing just that. When you use Teas Gurus, you're investing in outcomes that save you money, time, and stress by removing the need for pricey retakes. You're not just paying someone to take your test.",
    },
    {
      question: "What TEAS score is regarded as passing?",
      answer:
        "Depending on your school's requirements, a passing score on the TEAS test can vary, but it usually hovers around 65%. While some nursing programs may accept a lower score, others may require a minimum of 70% or even 75% for admission. But why settle for less? Our professionals at Teas Gurus routinely receive scores of 85% and higher, and many of our clients end up in the 90th percentile. Therefore, we help you stand out as a top applicant rather than just meeting the cutoff. Our goal is to get you recognized for your excellence, so don't worry about merely 'passing.'",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to the most common questions about our TEAS exam
            services and how we can help you succeed.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`px-6 pb-4 transition-all duration-200 ease-in-out ${
                  openIndex === index ? "block opacity-100" : "hidden opacity-0"
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-700 mb-6">
            Ready to get started? Contact us today to learn more about our TEAS
            exam assistance services and how we can help you achieve your
            nursing school goals.
          </p>
          <Link
            href="/contact"
            className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Contact Us Today
          </Link>
        </div>
      </div>
    </section>
  );
}
