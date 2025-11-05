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
        "Security and confidentiality are extremely important to us at Teas Gurus, the trusted TEAS exam help service for every nursing student. Your identity is fully protected when you choose us to take my TEAS exam for me or pay someone to take my TEAS exam. No personal information about the students we assist is ever disclosed to our exam takers or professionals. They view each task as just another ATI TEAS exam that must be completed discreetly and professionally. To guarantee complete protection, we use private access systems, secure login procedures, and encrypted communication for all exam help services. From your first message to the final results, your data remains safe and confidential. You can rest assured that your privacy will always be protected and that neither your school nor the testing platform will ever know you received TEAS exam help. This is our professional promise  to maintain integrity, security, and confidentiality while helping you succeed in your nursing education."
    },
    {
      question:
        "Even if I'm not in the US, can I still get help with the TEAS exam?",
      answer:
        "Indeed! Anywhere in the world, you can get professional TEAS exam help service from Teas Gurus. We provide global exam help services that allow nursing students from any location to pay someone to take my TEAS exam or get expert exam assistance online. Teas Gurus operates around the clock to accommodate students’ needs in all time zones, ensuring reliable support for ATI TEAS and online exams. Whether you’re studying in the UK, Canada, Australia, Africa, or Asia, our professionals are available to take my TEAS exam for me and guarantee high scores. All you need is a laptop or desktop computer and a stable internet connection because our system is fully online and secure. No matter where you are, we will walk you through every step of the exam-taking process once you get in touch with us. Our TEAS exam help services have been successfully utilized by nursing students from more than 20 countries. Even if it’s midnight in your time zone, our support team is only a message away, ready to assist you with your nursing education journey.",
    },
    {
      question: "Can I retake the TEAS exam for free?",
      answer:
        "Unfortunately, there is a cost associated with retaking the TEAS exam. The exam fee is the same whether you are taking it for the first time or again, and payment is made through ATI Testing or your authorized test center. This can be discouraging, particularly if you failed by a slim margin. Because of this, Teas Gurus, a trusted TEAS exam help service, advises students to get things right the first time. Our exam help services ensure that when you decide to pay someone to take my TEAS exam or seek TEAS exam help, you’re investing in guaranteed results. When you use Teas Gurus to take my TEAS exam for me, you’re choosing proven professionals who help you achieve high scores the first time around. You’re not just paying someone to take your test—you’re investing in outcomes that save you money, time, and stress by eliminating the need for costly retakes. With our expert tutors and exam assistance, success in your nursing education is no longer uncertain—it’s guaranteed.",
    },
    {
      question: "What TEAS score is regarded as passing?",
      answer:
        "Depending on your school’s requirements, a passing score on the TEAS test can vary, but it usually hovers around 65%. While some nursing programs may accept a lower score, others may require a minimum of 70% or even 75% for admission. But why settle for less when Teas Gurus can help you aim higher? Our professionals who take my TEAS exam for me routinely achieve scores of 85% and higher, and many of our nursing students end up in the 90th percentile. Our TEAS exam help service and exam help services are designed to help you stand out as a top applicant, not just meet the cutoff. With our ATI TEAS experts, proven study methods, and personalized exam assistance, we make sure you’re recognized for your excellence rather than merely passing. Our goal is to help you reach your nursing school and career dreams with confidence. Ready to get started? Contact Teas Gurus today to learn more about how you can pay someone to take my TEAS exam safely and how our TEAS exam help can help you achieve your nursing education goals faster and more effectively.'",
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
