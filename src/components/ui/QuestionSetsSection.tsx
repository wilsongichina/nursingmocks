"use client";

import { useState, useMemo } from "react";
import QuestionSetCard from "./QuestionSetCard";

interface QuestionSet {
  id: string;
  title: string;
  subtitle: string;
  questionCount: number;
  tag?: string;
  slug: string;
}

interface QuestionSetsSectionProps {
  questionSets: QuestionSet[];
  pageName: string;
}

export default function QuestionSetsSection({
  questionSets,
  pageName,
}: QuestionSetsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Filter question sets based on search query
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) {
      return questionSets;
    }

    const query = searchQuery.toLowerCase().trim();
    return questionSets.filter((set) => {
      const title = set.title.toLowerCase();
      const subtitle = set.subtitle.toLowerCase();
      const tag = set.tag?.toLowerCase() || "";
      return (
        title.includes(query) || subtitle.includes(query) || tag.includes(query)
      );
    });
  }, [questionSets, searchQuery]);

  // Show first 4 by default, all if showAll is true
  const displayedSets = showAll ? filteredSets : filteredSets.slice(0, 4);

  const totalQuestions = questionSets.reduce(
    (sum, set) => sum + set.questionCount,
    0
  );

  return (
    <div
      className="rounded-[22px] shadow-[0_22px_40px_rgba(148,163,184,0.28)] border border-[rgba(148,163,184,0.5)] p-[18px_20px]"
      style={{
        background: "radial-gradient(circle at top, #f1f3ff 0, #ffffff 60%)",
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 gap-[10px]">
        <div>
          <div className="text-base font-semibold text-[#202437]">
            {pageName} Question Sets
          </div>
          <div className="text-xs text-[#9ca3af] mt-[2px]">
            Choose a section or practice all subjects together. Switch between
            Review Mode and Exam Mode whenever you need.
          </div>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-[#f1f0ff] text-[#5548e0] uppercase tracking-[0.08em] whitespace-nowrap">
          Practice
        </span>
      </div>

      {/* Search Bar Row */}
      <div className="flex items-center justify-between gap-3 mb-4 mt-1">
        <label
          htmlFor="qsSearch"
          className="text-xs text-[#7a819c] flex-shrink-0 whitespace-nowrap"
        >
          Search {pageName} subjects
        </label>
        <div className="flex items-center gap-[6px] flex-1 px-[10px] py-[6px] rounded-full border border-[#d4d4ff] bg-[#f9f9ff] shadow-[0_8px_18px_rgba(148,163,184,0.18)]">
          <span className="text-sm text-[#9ca3af] flex-shrink-0">🔍</span>
          <input
            id="qsSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${pageName} subjects (Math, Reading, Science, English)`}
            className="border-none outline-none bg-transparent text-[13px] w-full text-[#202437] placeholder:text-[#a1a5c5]"
          />
        </div>
      </div>

      {/* Question Sets Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-[18px_22px] w-full ${
          showAll ? "" : ""
        }`}
        id="qsGrid"
      >
        {displayedSets.map((set) => (
          <QuestionSetCard
            key={set.id}
            id={set.id}
            title={set.title}
            subtitle={set.subtitle}
            questionCount={set.questionCount}
            tag={set.tag}
            slug={set.slug}
          />
        ))}
      </div>

      {/* Footer */}
      {questionSets.length > 0 && (
        <div className="flex items-center justify-between mt-[18px] text-xs text-[#6b7280] gap-2 flex-wrap">
          <div>
            Showing {displayedSets.length} of {questionSets.length} question
            sets · {totalQuestions} total questions
          </div>
          {questionSets.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="border-none bg-transparent text-[#5548e0] font-medium text-xs cursor-pointer p-0 whitespace-nowrap hover:underline"
            >
              {showAll
                ? `View fewer ${pageName} question sets ↑`
                : `View all ${pageName} question sets →`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
