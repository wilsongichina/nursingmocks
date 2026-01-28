"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function QuizCTACard() {
  const { currentUser, loading } = useAuth();

  // Don't show the card if user is logged in or still loading
  if (loading || currentUser) {
    return null;
  }

  return (
    <section className="my-5.5 px-4.5 py-4 rounded-[20px] bg-gradient-to-br from-[#fef3c7] to-[#e0ecff] border border-[rgba(250,204,21,0.4)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-wrap gap-3.5 items-center justify-between">
      <div className="max-w-[620px]">
        <div className="text-[11px] tracking-[0.12em] uppercase text-[#92400e] font-semibold mb-1">
          Boost your TEAS English score
        </div>
        <div className="text-[15px] font-bold mb-1 text-[#202437]">
          Unlock more English sets, score tracking & timed exams
        </div>
        <p className="text-[13px] text-[#7a819c] mb-0">
          Enjoying Set 1? Create a free NursingMocks account to unlock all ATI TEAS English question
          sets, track your accuracy over time, and switch between review and exam mode whenever you need.
        </p>
        <div className="text-[11px] text-[#a0a5bf] mt-1">
          No credit card required · Cancel anytime · Ideal for serious TEAS prep.
        </div>
      </div>
      <div className="flex flex-col gap-1.5 min-w-[190px] items-end">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-1.5 px-5.5 py-2.75 rounded-full border-none text-sm font-semibold text-white bg-gradient-to-br from-[#6a5cff] to-[#4f46e5] no-underline shadow-[0_12px_26px_rgba(80,72,220,0.55)] transition-all hover:-translate-y-px hover:shadow-[0_16px_34px_rgba(80,72,220,0.6)]"
        >
          <span>Create free account</span>
          <span>›</span>
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border border-dashed border-[rgba(251,191,36,0.9)] bg-white/85 text-xs text-[#92400e] no-underline"
        >
          <span>View premium English bundles</span>
          <span>↗</span>
        </Link>
        <div className="text-[11px] text-[#a0a5bf] text-right">
          Students who practice with multiple sets improve English scores significantly.
        </div>
      </div>
    </section>
  );
}

