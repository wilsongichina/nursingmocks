"use client";

import React from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

function normalizeFaqs(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question =
        typeof (item as any).question === "string" ? (item as any).question : "";
      const answer =
        typeof (item as any).answer === "string" ? (item as any).answer : "";
      return { question, answer };
    })
    .filter(Boolean) as FaqItem[];
}

export default function FaqEditor({
  value,
  onChange,
  label = "FAQ",
}: {
  value: FaqItem[] | unknown;
  onChange: (next: FaqItem[]) => void;
  label?: string;
}) {
  const faqs = normalizeFaqs(value);

  const update = (idx: number, patch: Partial<FaqItem>) => {
    const next = faqs.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    onChange(next);
  };

  const add = () => onChange([...faqs, { question: "", answer: "" }]);
  const remove = (idx: number) => onChange(faqs.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= faqs.length) return;
    const next = [...faqs];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-[13px] font-semibold text-[#202437]">{label}</div>
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-[#e2e4f0] bg-white text-[#202437] px-3 py-1.5 text-xs font-medium hover:bg-[#f4f5ff] transition-colors"
        >
          + Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-xs text-[#7a819c] rounded-xl border border-dashed border-[#e2e4f0] bg-[#fbfbff] p-3">
          No FAQs yet. Click “Add FAQ” to create the first one.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#e2e4f0] bg-[#fbfbff] p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-xs font-semibold text-[#3b3f57]">
                  FAQ #{idx + 1}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    className="rounded-full border border-[#e2e4f0] bg-white px-2.5 py-1 text-[11px] text-[#202437] disabled:opacity-50 hover:bg-[#f4f5ff] transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === faqs.length - 1}
                    className="rounded-full border border-[#e2e4f0] bg-white px-2.5 py-1 text-[11px] text-[#202437] disabled:opacity-50 hover:bg-[#f4f5ff] transition-colors"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="rounded-full border border-red-200 bg-white text-red-700 px-2.5 py-1 text-[11px] font-medium hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#3b3f57] mb-1">
                    Question
                  </label>
                  <input
                    value={faq.question}
                    onChange={(e) => update(idx, { question: e.target.value })}
                    placeholder="Type the FAQ question..."
                    className="w-full rounded-lg border border-[#e2e4f0] bg-white px-2.5 py-2 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#3b3f57] mb-1">
                    Answer
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => update(idx, { answer: e.target.value })}
                    placeholder="Type the answer..."
                    rows={4}
                    className="w-full rounded-lg border border-[#e2e4f0] bg-white px-2.5 py-2 text-sm text-[#202437] outline-none transition-all focus:border-[#6a5cff] focus:shadow-[0_0_0_1px_rgba(91,76,255,0.35)] resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

