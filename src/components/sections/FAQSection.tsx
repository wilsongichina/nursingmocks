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
      question:
        "How much should I pay someone to take my online teas exam Reddit?",
      answer:
        "As per various discussions held on Reddit, the cost of hiring someone to take your online TEAS test, as most clients suggest, can go up to $500. However, you may find these prices varying. This is because it depends on the tutor's qualification, their success rate, and the complexity of your exams.",
    },
    {
      question: "Can I pay someone to take my remote teas exam?",
      answer:
        "Yes. You can pay someone to take your remote TEAS exams. Our support team will guide you on how to go about it, or you can fill out our quote and share the details needed. One of our qualified and professional MSN tutors will take your place and handle the test for you. They are ready to help with the whole exam, ensure you get the best score, and have more time for fun stuff. Don't worry; we handle everything discreetly.",
    },
    {
      question: "Where can I pay someone to take my teas entrance exam?",
      answer:
        "There is no better place to pay someone to take your TEAS entrance exam than online. Online helpers are the solution you need as they are convenient in the sense that they are accessible anytime and from anywhere. They are also confidential to ensure your location is concealed to avoid raising any red flags with your institution. Plus, they are reliable and offer a variety of services.",
    },
    {
      question: "How much should I pay someone to take my online teas exam?",
      answer:
        "While take my teas exam services charge upwards of $500 to take an online TEAS exam, we strongly believe in considerable and affordable pricing. Therefore, we only charge $400 per exam, with a full money-back guarantee, a secure testing environment, and no hidden charges. We also offer a payment plan where you can make an initial partial payment to get our team started and make a full payment after the results.",
    },
    {
      question: "Is Teas Gurus legit?",
      answer:
        "Yes. If you are looking for a legitimate online helper, Teas Guru ought to be your first choice. We have a credible record and previous students' testimonials to attest to our credibility. And that's not all. We are an open book, and our policies on payment and services are clear, so you know what to expect and exactly what you are paying for.",
    },
    {
      question: "Is our Teas Gurus Legit? Does it have enough exam takers?",
      answer:
        "Our TEAS Gurus are 100% legit. We have been around for many years, and during that time, our teams have acquired a ton of experience through helping and interacting with thousands of students. We have a ton of exam takers, sufficient if you may, so there is always someone ready and available to help you with your TEAS tests.",
    },
    {
      question: "Can I take my teas exam online or remotely?",
      answer:
        "Usually, you can take your TEAS exam online or remotely. But today, as learning institutions embrace technological advancement, many testing centers, ATI included, offer remote proctoring options. We recommend taking it remotely because, let's be honest, it's convenient, as you can take it from anywhere and anytime with your computer. It also allows you to hire a classtaker (like Teas Gurus) and alleviate the pressure and stress of meeting deadlines. It's the perfect way to have a good work-life balance if you ask me.",
    },
    {
      question: "How do you properly take the teas exam?",
      answer:
        "If you are searching for take my teas test for me, we are here to help. First, you need to register online using the official ATI testing website, select 'I am preparing for or taking the TEAS' and click on 'exam registration.' Go for the 'remote online option, and choose a suitable exam date and time. Complete and confirm your details and payment information. The next step is to ensure that you have computer access by downloading and installing AnyDesk. Once it's installed, copy and share the code with us. This will help us access your device and install the respondus bypass software. This software is ideal for smooth proctoring without tampering with your test responses. Also, before the actual exam, do a dry run test to ensure that the bypass software works properly. Lastly, on exam day, it will appear as if you are taking the exam while our professionals manage the process remotely. Once the exam is done, your result will be available, and payment will be made in full.",
    },
    {
      question: "Are There Legit Teas Takers Experts?",
      answer:
        "Yes, Teas Gurus Is!! Our team of experts offers professional assistance and resources to help you pass your exams.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">FAQS</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to the most common questions about our TEAS exam
            services.
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
