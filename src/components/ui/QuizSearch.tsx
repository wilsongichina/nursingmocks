"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Icon components for dashboard-style cards
const LaptopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const FlaskIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const ABCIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.5 17.5L6.5 13.5L7.5 17.5"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 15.5H7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12.5V17.5" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 12.5H12C12.7 12.5 13.2 13 13.2 13.6C13.2 14.2 12.7 14.7 12 14.7H10.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 14.7H12C12.7 14.7 13.2 15.2 13.2 15.8C13.2 16.4 12.7 16.9 12 16.9H10.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.5C15.7 12.5 15 13.1 15 13.8V16.2C15 16.9 15.7 17.5 16.5 17.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.8 12.8C18.1 13 18.2 13.3 18.2 13.6"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.8 17.2C18.1 17 18.2 16.7 18.2 16.4"
    />
  </svg>
);

interface Quiz {
  id: string;
  pageName?: string;
  hero?: { title?: string };
  title?: string;
  quizName?: string;
  questionCount?: number;
  slug?: string;
}

interface QuizSearchProps {
  quizzes: Quiz[];
  quizSlugMap: Record<string, string>;
  pageQuestionCountCard?: React.ReactNode;
  pageType?: "nested" | "topic";
}

// Helper function to get card icon and colors
const getCardIcon = (name: string, index: number) => {
  const nameLower = name.toLowerCase();
  const colorVariants = [
    { iconBg: "bg-purple-500", numberColor: "text-purple-600" },
    { iconBg: "bg-blue-500", numberColor: "text-blue-600" },
    { iconBg: "bg-orange-500", numberColor: "text-orange-600" },
    { iconBg: "bg-green-500", numberColor: "text-green-600" },
    { iconBg: "bg-teal-500", numberColor: "text-teal-600" },
    { iconBg: "bg-indigo-500", numberColor: "text-indigo-600" },
    { iconBg: "bg-pink-500", numberColor: "text-pink-600" },
    { iconBg: "bg-cyan-500", numberColor: "text-cyan-600" },
  ];

  if (nameLower.includes("reading")) {
    return {
      icon: <BookIcon className="w-6 h-6 text-white" />,
      iconBg: "bg-purple-500",
      numberColor: "text-purple-600",
    };
  } else if (nameLower.includes("math")) {
    return {
      icon: <CalculatorIcon className="w-6 h-6 text-white" />,
      iconBg: "bg-blue-500",
      numberColor: "text-blue-600",
    };
  } else if (nameLower.includes("science")) {
    return {
      icon: <FlaskIcon className="w-6 h-6 text-white" />,
      iconBg: "bg-orange-500",
      numberColor: "text-orange-600",
    };
  } else if (nameLower.includes("english")) {
    return {
      icon: <ABCIcon className="w-6 h-6 text-white" />,
      iconBg: "bg-green-500",
      numberColor: "text-green-600",
    };
  }
  const colorVariant = colorVariants[index % colorVariants.length];
  return {
    icon: <LaptopIcon className="w-6 h-6 text-white" />,
    iconBg: colorVariant.iconBg,
    numberColor: colorVariant.numberColor,
  };
};

export default function QuizSearch({
  quizzes,
  quizSlugMap,
  pageQuestionCountCard,
}: QuizSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter quizzes based on search query
  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) {
      return quizzes;
    }

    const query = searchQuery.toLowerCase().trim();
    return quizzes.filter((quiz) => {
      const quizName =
        quiz.pageName ||
        quiz.hero?.title ||
        quiz.title ||
        quiz.quizName ||
        quiz.id;
      return quizName.toLowerCase().includes(query);
    });
  }, [quizzes, searchQuery]);

  return (
    <div className="mt-6 mb-8">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${quizzes.length} quiz${quizzes.length !== 1 ? "zes" : ""}...`}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-center text-sm text-gray-600 mt-2">
            Showing {filteredQuizzes.length} of {quizzes.length} quiz
            {quizzes.length !== 1 ? "zes" : ""}
          </p>
        )}
      </div>

      {/* Quiz Cards */}
      {filteredQuizzes.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4">
          {filteredQuizzes.map((quiz: any, index: number) => {
            // Use route mapping slug if available, otherwise fall back to document slug or id
            const quizSlug =
              quizSlugMap[quiz.id] || quiz.slug || quiz.id;
            const quizName =
              quiz.pageName ||
              quiz.hero?.title ||
              quiz.title ||
              quiz.quizName ||
              quiz.id;
            const config = getCardIcon(quizName, index);
            const questionCount = (quiz.questionCount || 0).toLocaleString();

            return (
              <Link
                key={quiz.id}
                href={`/${quizSlug}`}
                {...({ name: quizName } as any)}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(33.333%-0.67rem)] max-w-sm block"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {quizName}
                    </p>
                    <p
                      className={`text-3xl font-bold ${config.numberColor}`}
                    >
                      {questionCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total Questions Available
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Page question count card */}
          {pageQuestionCountCard}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}

