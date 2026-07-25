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
      <div className="quiz-card-placeholder admin-quiz-placeholder text-center">
        <span className="admin-quiz-placeholder-icon mx-auto mb-2">
          <BookOpen className="h-5 w-5" />
        </span>
        <p className="admin-helper">
          {quizTitle ? `Quiz: ${quizTitle}` : "Quiz Card"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="quiz-card-placeholder admin-quiz-placeholder admin-quiz-placeholder-interactive"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="admin-quiz-placeholder-icon">
          <BookOpen className="h-5 w-5" />
        </span>
        <div className="flex-1">
          {quizTitle ? (
            <>
              <h3 className="admin-card-title mb-1">
                {quizTitle}
              </h3>
              <p className="admin-helper">Click to edit quiz</p>
            </>
          ) : (
            <>
              <h3 className="admin-card-title mb-1">
                Quiz Card
              </h3>
              <p className="admin-helper">Click to configure quiz</p>
            </>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="admin-status-badge admin-status-badge-purple">Edit</span>
        </div>
      </div>
    </div>
  );
}

