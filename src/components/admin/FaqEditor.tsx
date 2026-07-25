"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

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
        typeof (item as { question?: unknown }).question === "string"
          ? (item as { question: string }).question
          : "";
      const answer =
        typeof (item as { answer?: unknown }).answer === "string"
          ? (item as { answer: string }).answer
          : "";
      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
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
    const next = faqs.map((faq, i) => (i === idx ? { ...faq, ...patch } : faq));
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
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="admin-card-title">{label}</div>
          <p className="admin-helper mt-1">
            Add public questions and answers shown below the page content.
          </p>
        </div>
        <button type="button" onClick={add} className="admin-button-secondary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon" aria-hidden="true">
            +
          </div>
          <div>
            <p className="admin-card-title">No FAQs Yet</p>
            <p className="admin-helper mt-1">
              Add the first FAQ when this page needs public question and answer
              content.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="admin-info-tile p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="admin-field-label">FAQ #{idx + 1}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    className="admin-button-secondary min-h-[34px] px-3 py-1.5 text-xs"
                    aria-label={`Move FAQ ${idx + 1} up`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === faqs.length - 1}
                    className="admin-button-secondary min-h-[34px] px-3 py-1.5 text-xs"
                    aria-label={`Move FAQ ${idx + 1} down`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="admin-button-danger min-h-[34px] px-3 py-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="admin-field-group">
                  <span className="admin-field-label">Question</span>
                  <input
                    value={faq.question}
                    onChange={(event) =>
                      update(idx, { question: event.target.value })
                    }
                    placeholder="Type the FAQ question."
                    className="admin-field"
                  />
                </label>

                <label className="admin-field-group">
                  <span className="admin-field-label">Answer</span>
                  <textarea
                    value={faq.answer}
                    onChange={(event) =>
                      update(idx, { answer: event.target.value })
                    }
                    placeholder="Type the answer."
                    rows={4}
                    className="admin-field resize-y"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
