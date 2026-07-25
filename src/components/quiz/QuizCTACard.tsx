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
    <section className="user-feature-surface my-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <span className="user-badge user-badge-amber">Preview limit reached</span>
        <h2 className="user-card-title mt-3">Unlock {productLabel}</h2>
        <p className="user-helper mt-2">
          {previewText} Get access to {remainingText}, explanations, review tools, and complete practice sets.
        </p>
        <p className="user-helper mt-2 text-xs">
          One-time access periods are managed from your Payments page.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
        <Link
          href={currentUser ? "/payments" : "/signup"}
          className="user-button-primary w-full"
        >
          {currentUser ? "View Access Options" : "Create Free Account"}
        </Link>
        <Link
          href="/pricing"
          className="user-button-secondary w-full"
        >
          View Pricing
        </Link>
        <p className="user-helper text-left text-xs sm:text-right">
          Access updates after checkout is confirmed by the payment provider.
        </p>
      </div>
    </section>
  );
}
