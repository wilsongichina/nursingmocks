"use client";

import { BookOpen } from "lucide-react";

interface QuizCardPlaceholderProps {
  quizTitle?: string | null;
  isEditable?: boolean;
  onClick?: () => void;
}

export function QuizCardPlaceholder({
  quizTitle,
  isEditable = true,
  onClick,
}: QuizCardPlaceholderProps) {
  if (!isEditable) {
    // In read-only mode, show a simple placeholder
    return (
      <div className="quiz-card-placeholder border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {quizTitle ? `Quiz: ${quizTitle}` : "Quiz Card"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="quiz-card-placeholder border-2 border-dashed border-indigo-300 rounded-lg p-6 bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <BookOpen className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          {quizTitle ? (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {quizTitle}
              </h3>
              <p className="text-xs text-gray-600">Click to edit quiz</p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Quiz Card
              </h3>
              <p className="text-xs text-gray-600">Click to configure quiz</p>
            </>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="text-xs text-indigo-600 font-medium">Edit</span>
        </div>
      </div>
    </div>
  );
}

