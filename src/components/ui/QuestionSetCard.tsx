"use client";

import Link from "next/link";

interface QuestionSetCardProps {
  id: string;
  title: string;
  subtitle: string;
  questionCount: number;
  tag?: string;
  slug: string;
  reviewModeUrl?: string;
  examModeUrl?: string;
}

export default function QuestionSetCard({
  title,
  subtitle,
  questionCount,
  tag,
  slug,
  reviewModeUrl,
  examModeUrl,
}: QuestionSetCardProps) {
  const defaultReviewUrl = `/${slug}?mode=review`;
  const defaultExamUrl = `/${slug}?mode=exam`;

  return (
    <div className="bg-white rounded-[20px] shadow-[0_16px_32px_rgba(148,163,184,0.25)] border border-[#e5e7eb] p-[14px_18px] grid grid-cols-[auto_1px_minmax(0,1.7fr)] gap-[14px] items-center w-full">
      {/* Left: Circle with count */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-[6px] text-[11px] text-[#6b7280]">
          <div
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, #ffffff 0, #eef2ff 60%, #e0e7ff 100%)",
              border: "1px dotted #cbd5f5",
            }}
          >
            <strong className="text-[22px] font-bold text-[#4f46e5] leading-[1.1]">
              {questionCount}
            </strong>
          </div>
          <div className="uppercase tracking-[0.16em] text-[9px] text-center">
            Questions Available
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="self-stretch justify-self-center w-[1px] border-r border-dashed border-[#e5e7eb] my-1" />

      {/* Main content */}
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center justify-between gap-[10px]">
          <div className="text-sm font-semibold text-[#202437]">{title}</div>
          {tag && (
            <div className="text-[11px] px-2 py-[3px] rounded-full bg-[#eef2ff] text-[#4f46e5] uppercase tracking-[0.08em] whitespace-nowrap">
              {tag}
            </div>
          )}
        </div>
        <div className="text-xs text-[#9ca3af]">{subtitle}</div>
        <div className="flex flex-col gap-[6px] mt-[6px]">
          <Link
            href={reviewModeUrl || defaultReviewUrl}
            className="w-full rounded-full py-[7px] px-3 border-none flex items-center justify-center gap-2 text-xs font-medium text-[#111827] cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #eef2ff, #f5f3ff)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#22c55e" }}
            />
            Review Mode
          </Link>
          <Link
            href={examModeUrl || defaultExamUrl}
            className="w-full rounded-full py-[7px] px-3 border-none flex items-center justify-center gap-2 text-xs font-medium text-[#111827] cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #e0e7ff, #ede9fe)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#3b82f6" }}
            />
            Exam Mode
          </Link>
        </div>
      </div>
    </div>
  );
}

