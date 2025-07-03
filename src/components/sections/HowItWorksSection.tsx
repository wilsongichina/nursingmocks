"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    {
      number: "1",
      title: "Register for The Online/Remote Exam",
      description:
        "To register for the TEAS exam, visit www.atitesting.com and select I AM PREPARING FOR OR TAKING THE TEAS. Click on Exam Registration, choose Register under the Remote Online option, and select ATI Remote Proctor. Then, choose your preferred date and time, review your details, create an account if necessary, and enter your payment information to complete your registration.",
      icon: "📝",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      number: "2",
      title: "Computer Access",
      description:
        "Download and install RemotePc on your Windows by visiting the official RemotePC website. Once you install it, copy the code and share it with us. We will access your device and start installing the respondus bypass software.",
      icon: "💻",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      number: "3",
      title: "Bypass Software Installation",
      description:
        "We will remotely access your Windows laptop to execute commands on your Mac or install software on your Windows device, allowing us to bypass security measures. We want to clarify that our software does not interfere with your exam content or alter your responses in any manner. Its primary purpose is to ensure a seamless proctoring experience for both you and our team.",
      icon: "🔧",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      number: "4",
      title: "ATI TEAS Dry Run Assessment",
      description:
        "We will conduct a dry run test to ensure that the bypass software works in readiness for the real/actual exam. This is important to ensure that you're versed with the process.",
      icon: "🧪",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      number: "5",
      title: "Exam Taking",
      description:
        "On the day of the exam, you will simply sit back and act as though you're taking the test while we control the mouse and complete it for you.",
      icon: "✍️",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      number: "6",
      title: "Make Payment",
      description:
        "When taking the Online/Remote Teas Exam, the exam results are available immediately you finish the exam. You'll make the full payment once you pass the exam.",
      icon: "💳",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ];

  const scrollToStep = (stepIndex: number) => {
    setActiveStep(stepIndex);

    // Scroll to the step after a short delay to ensure state update
    setTimeout(() => {
      const stepElement = stepRefs.current[stepIndex];
      if (stepElement) {
        stepElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Simple 6-Step Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How it Works
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We're talking about a company with a distinctive culture that sets
            us apart. Where else will you find such high levels of engagement,
            authentic communication and top-quality results? Here are is a
            graphical representation of how our TEAS exam taking service works.
          </p>
        </div>

        {/* Interactive Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div
            className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600"
            style={{ height: "calc(100% - 8rem)" }}
          ></div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center">
                  {/* Left Side (Even Steps) */}
                  {index % 2 === 0 && (
                    <>
                      <div className="w-1/2 pr-12">
                        <div
                          className={`p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            activeStep === index
                              ? `${step.borderColor} shadow-xl scale-105`
                              : "border-gray-200 bg-white"
                          }`}
                          onClick={() => setActiveStep(index)}
                          ref={(el) => {
                            stepRefs.current[index] = el;
                          }}
                        >
                          <div className="flex items-center mb-4">
                            <div
                              className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-xl font-bold mr-4`}
                            >
                              {step.number}
                            </div>
                            <div className="text-4xl">{step.icon}</div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Center Circle */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center z-10">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold`}
                        >
                          {step.number}
                        </div>
                      </div>

                      <div className="w-1/2 pl-12"></div>
                    </>
                  )}

                  {/* Right Side (Odd Steps) */}
                  {index % 2 === 1 && (
                    <>
                      <div className="w-1/2 pr-12"></div>

                      {/* Center Circle */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center z-10">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold`}
                        >
                          {step.number}
                        </div>
                      </div>

                      <div className="w-1/2 pl-12">
                        <div
                          className={`p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            activeStep === index
                              ? `${step.borderColor} shadow-xl scale-105`
                              : "border-gray-200 bg-white"
                          }`}
                          onClick={() => setActiveStep(index)}
                          ref={(el) => {
                            stepRefs.current[index] = el;
                          }}
                        >
                          <div className="flex items-center mb-4">
                            <div
                              className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-xl font-bold mr-4`}
                            >
                              {step.number}
                            </div>
                            <div className="text-4xl">{step.icon}</div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden">
                  <div
                    className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      activeStep === index
                        ? `${step.borderColor} shadow-xl scale-105`
                        : "border-gray-200 bg-white"
                    }`}
                    onClick={() => setActiveStep(index)}
                    ref={(el) => {
                      stepRefs.current[index] = el;
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-lg font-bold mr-3`}
                      >
                        {step.number}
                      </div>
                      <div className="text-3xl">{step.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Join thousands of students who have successfully passed the TEAS
                exam with our proven approach. Get started today and pay only
                after you pass.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Buy Exact Teas - $99
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
