"use client";

import { useState } from "react";

interface FAQAccordionProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export default function FAQAccordion({
  question,
  answer,
  defaultOpen = false,
}: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border border-gray-300 bg-white overflow-hidden transition-all ${
        isOpen ? "shadow-md" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border-none bg-transparent p-3 flex justify-between items-center text-left cursor-pointer text-sm text-gray-900 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-600">
            Q
          </div>
          <span>{question}</span>
        </div>
        <span
          className={`text-base text-gray-400 transition-transform ${
            isOpen ? "rotate-90 text-indigo-600" : ""
          }`}
        >
          ›
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-150 ${
          isOpen ? "max-h-[220px] pb-3" : "max-h-0 pb-0"
        }`}
      >
        <div className="px-3 text-sm text-gray-600">{answer}</div>
      </div>
    </div>
  );
}
