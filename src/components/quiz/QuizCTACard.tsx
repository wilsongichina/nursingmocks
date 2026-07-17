"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type QuizCTACardProps = {
  productLabel?: string;
  previewQuestionCount?: number;
  totalQuestionCount?: number;
  hiddenQuestionCount?: number;
  showForAuthenticated?: boolean;
};

export default function QuizCTACard({
  productLabel = "this exam",
  previewQuestionCount,
  totalQuestionCount,
  hiddenQuestionCount,
  showForAuthenticated = false,
}: QuizCTACardProps) {
  const { currentUser, loading } = useAuth();

  // Public dynamic quiz pages are statically rendered, so this CTA can be shown for
  // logged-in users when the server route only has enough context to render a preview.
  if (loading || (currentUser && !showForAuthenticated)) {
    return null;
  }

  const previewText =
    previewQuestionCount && totalQuestionCount
      ? `${previewQuestionCount} of ${totalQuestionCount} questions are available in this preview.`
      : "Preview the available questions, then unlock the complete set when you are ready.";
  const remainingText =
    hiddenQuestionCount && hiddenQuestionCount > 0 ? `${hiddenQuestionCount} more questions` : "the complete set";

  return (
    <section className="my-5.5 flex flex-wrap items-center justify-between gap-3.5 rounded-[20px] border border-[rgba(250,204,21,0.4)] bg-gradient-to-br from-[#fef3c7] to-[#e0ecff] px-4.5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="max-w-[620px]">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#92400e]">
          Preview limit reached
        </div>
        <div className="mb-1 text-[15px] font-bold text-[#202437]">Unlock {productLabel}</div>
        <p className="mb-0 text-[13px] text-[#7a819c]">
          {previewText} Get access to {remainingText}, explanations, review tools, and full practice sets.
        </p>
        <div className="mt-1 text-[11px] text-[#a0a5bf]">
          One-time access periods are managed from your Payments page.
        </div>
      </div>
      <div className="flex min-w-[190px] flex-col items-end gap-1.5">
        <Link
          href={currentUser ? "/payments" : "/signup"}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border-none bg-gradient-to-br from-[#6a5cff] to-[#4f46e5] px-5.5 py-2.75 text-sm font-semibold text-white no-underline shadow-[0_12px_26px_rgba(80,72,220,0.55)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(80,72,220,0.6)]"
        >
          <span>{currentUser ? "View access options" : "Create free account"}</span>
          <span>{">"}</span>
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-[rgba(251,191,36,0.9)] bg-white/85 px-3.5 py-2 text-xs text-[#92400e] no-underline"
        >
          <span>View pricing</span>
          <span>{"->"}</span>
        </Link>
        <div className="text-right text-[11px] text-[#a0a5bf]">
          Access updates after checkout is confirmed by the payment provider.
        </div>
      </div>
    </section>
  );
}
