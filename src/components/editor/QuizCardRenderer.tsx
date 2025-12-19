"use client";

import { useState, useEffect } from "react";

interface QuizCardRendererProps {
  questions: any[];
  quizTitle: string;
  isEditable?: boolean;
  onEdit?: () => void;
}

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function QuizCardRenderer({
  questions,
  quizTitle,
  isEditable = false,
  onEdit,
}: QuizCardRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<
    Array<{ 
      attempted: boolean; 
      pickedKey: string | null; 
      pickedKeys: string[]; // For multiple select
      isCorrect: boolean | null;
      confirmed: boolean; // For multiple select and numeric confirmation
      numericValue: string; // For numeric questions
    }>
  >([]);
  const [passageExpanded, setPassageExpanded] = useState(false);

  useEffect(() => {
    // Initialize state for all questions
    setState(questions.map(() => ({ 
      attempted: false, 
      pickedKey: null, 
      pickedKeys: [],
      isCorrect: null,
      confirmed: false,
      numericValue: "",
    })));
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const currentState = state[currentIndex] || { 
    attempted: false, 
    pickedKey: null, 
    pickedKeys: [],
    isCorrect: null,
    confirmed: false,
    numericValue: "",
  };

  if (!currentQuestion) {
    return (
      <div className="quiz-card-renderer border border-gray-300 rounded-lg p-4 bg-white">
        <p className="text-gray-600">No questions available.</p>
      </div>
    );
  }

  const questionTypeId = currentQuestion.questionTypeId || currentQuestion.question_type_id || 1;
  const options = currentQuestion.options || [];
  const correctAnswer = currentQuestion.correctAnswer || currentQuestion.correct_answer || "";
  const explanation = currentQuestion.explanation || "";
  const passage = currentQuestion.passage || "";
  const units = currentQuestion.units || "";

  const getQuestionTypeName = (typeId: number) => {
    switch (typeId) {
      case 1:
        return "Multiple Choice";
      case 2:
        return "Multiple Select";
      case 3:
        return "True/False";
      case 7:
        return "Numeric";
      default:
        return "Multiple Choice";
    }
  };

  const handleOptionClick = (optionKey: string) => {
    // For multiple select (type 2), allow multiple selections before confirming
    if (questionTypeId === 2) {
      if (currentState.confirmed) return; // Don't allow changes after confirmation
      
      const newState = [...state];
      const currentPickedKeys = currentState.pickedKeys || [];
      const newPickedKeys = currentPickedKeys.includes(optionKey)
        ? currentPickedKeys.filter((key) => key !== optionKey)
        : [...currentPickedKeys, optionKey];
      
      newState[currentIndex] = {
        ...currentState,
        pickedKeys: newPickedKeys,
      };
      setState(newState);
      return;
    }

    // For other question types, single selection
    if (currentState.attempted) return;

    // Parse correct answer consistently
    let correctAnswersArray: string[] = [];
    if (Array.isArray(correctAnswer)) {
      correctAnswersArray = correctAnswer;
    } else if (typeof correctAnswer === 'string') {
      try {
        const parsed = JSON.parse(correctAnswer);
        correctAnswersArray = Array.isArray(parsed) ? parsed : [correctAnswer];
      } catch {
        correctAnswersArray = [correctAnswer];
      }
    } else {
      correctAnswersArray = [String(correctAnswer)];
    }

    // Normalize all answers for comparison
    const normalizedCorrect = correctAnswersArray.map(a => String(a).toUpperCase().trim());
    const normalizedOptionKey = optionKey.toUpperCase().trim();
    
    // Check if correct answer matches the option key
    let isCorrect = normalizedCorrect.includes(normalizedOptionKey);
    
    // For True/False questions, also check if correct answer matches the option text
    if (questionTypeId === 3) {
      // Get the option text for the selected option
      const selectedOptionIndex = ANSWER_LABELS.indexOf(optionKey);
      if (selectedOptionIndex >= 0 && selectedOptionIndex < options.length) {
        const optionText = String(options[selectedOptionIndex] || "").toUpperCase().trim();
        // Check if correct answer matches either the option key (A/B) or the option text (True/False)
        // Also handle case-insensitive matching for "true"/"false" variations
        isCorrect = normalizedCorrect.includes(normalizedOptionKey) || 
                   normalizedCorrect.includes(optionText) ||
                   normalizedCorrect.some(ca => {
                     const caUpper = ca.toUpperCase();
                     const caLower = ca.toLowerCase();
                     // Match "true" with "TRUE" or "True", and "false" with "FALSE" or "False"
                     return (caUpper === "TRUE" && (optionText === "TRUE" || optionText.includes("TRUE"))) ||
                            (caUpper === "FALSE" && (optionText === "FALSE" || optionText.includes("FALSE"))) ||
                            (caLower === "true" && optionText.includes("TRUE")) ||
                            (caLower === "false" && optionText.includes("FALSE"));
                   });
      }
    }

    const newState = [...state];
    newState[currentIndex] = {
      ...currentState,
      attempted: true,
      pickedKey: optionKey,
      isCorrect,
    };
    setState(newState);
  };

  const handleNumericInputChange = (value: string) => {
    if (questionTypeId !== 7) return;
    if (currentState.confirmed) return; // Don't allow changes after confirmation
    
    const newState = [...state];
    newState[currentIndex] = {
      ...currentState,
      numericValue: value,
    };
    setState(newState);
  };

  const handleNumericConfirm = () => {
    if (questionTypeId !== 7) return;
    if (currentState.confirmed) return;
    
    const userAnswer = currentState.numericValue?.trim() || "";
    if (!userAnswer) return;

    // Parse correct answer
    let correctAnswerValue = "";
    if (Array.isArray(correctAnswer)) {
      correctAnswerValue = correctAnswer[0] || "";
    } else {
      correctAnswerValue = String(correctAnswer || "");
    }

    // Normalize both answers for comparison (remove whitespace, handle decimals)
    const normalizeNumeric = (val: string) => {
      return val.trim().replace(/\s+/g, "").toLowerCase();
    };

    const normalizedUser = normalizeNumeric(userAnswer);
    const normalizedCorrect = normalizeNumeric(correctAnswerValue);

    // Compare numeric values (handle both string and numeric comparison)
    const isCorrect = normalizedUser === normalizedCorrect || 
                     parseFloat(normalizedUser) === parseFloat(normalizedCorrect);

    const newState = [...state];
    newState[currentIndex] = {
      ...currentState,
      attempted: true,
      confirmed: true,
      isCorrect,
    };
    setState(newState);
  };

  const handleConfirm = () => {
    if (questionTypeId !== 2) return;
    if (currentState.confirmed) return;
    
    const selectedKeys = currentState.pickedKeys || [];
    if (selectedKeys.length === 0) return;

    // Parse correct answer - handle both array and string formats
    let correctAnswersArray: string[] = [];
    if (Array.isArray(correctAnswer)) {
      correctAnswersArray = correctAnswer;
    } else if (typeof correctAnswer === 'string') {
      // Try to parse if it's a JSON string like "[\"A\",\"B\",\"C\"]"
      try {
        const parsed = JSON.parse(correctAnswer);
        correctAnswersArray = Array.isArray(parsed) ? parsed : [correctAnswer];
      } catch {
        // If not JSON, treat as single answer
        correctAnswersArray = [correctAnswer];
      }
    } else {
      correctAnswersArray = [String(correctAnswer)];
    }
    
    // Normalize all answers to uppercase strings for comparison
    const normalizedSelected = selectedKeys.map(k => String(k).toUpperCase().trim()).sort();
    const normalizedCorrect = correctAnswersArray.map(a => String(a).toUpperCase().trim()).sort();
    
    // For multi-select: must select ALL correct answers and NO incorrect answers
    // This means selected must exactly match correct (same length and same items)
    const isCorrect = 
      normalizedSelected.length === normalizedCorrect.length &&
      normalizedSelected.length > 0 &&
      normalizedSelected.every((key, index) => key === normalizedCorrect[index]);

    const newState = [...state];
    newState[currentIndex] = {
      ...currentState,
      attempted: true,
      confirmed: true,
      isCorrect,
    };
    setState(newState);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    // For type 2 and 7, require confirmation; for others, require attempt
    const canProceed = (questionTypeId === 2 || questionTypeId === 7)
      ? currentState.confirmed 
      : currentState.attempted;
    
    if (currentIndex < questions.length - 1 && canProceed) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const score = state.reduce((acc, s) => acc + (s.isCorrect ? 1 : 0), 0);
  const attemptedCount = state.reduce((acc, s) => acc + (s.attempted ? 1 : 0), 0);

  const _stripHtmlTags = (html: string): string => {
    if (!html) return "";
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim();
    }
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || html).trim();
  };

  const buildTwoSentencePreview = (text: string): string => {
    const clean = (text || "").trim().replace(/\s+/g, " ");
    if (!clean) return "";

    const sentenceMatches = clean.match(/[^.!?]+[.!?]+/g);
    if (sentenceMatches && sentenceMatches.length >= 2) {
      return (sentenceMatches[0] + " " + sentenceMatches[1]).trim() + " <span class='dots'>...</span>";
    }

    const slice = clean.slice(0, 240).trim();
    return slice + (clean.length > slice.length ? " <span class='dots'>...</span>" : "");
  };

  return (
    <div 
      className="quiz-card-renderer"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <style jsx>{`
        .embed-wrap {
          max-width: 820px;
          margin: 0 auto;
          padding: 16px 14px 24px;
        }

        .nm-quiz {
          background: #ffffff;
          border: 1px solid rgba(32, 36, 55, 0.1);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(18, 20, 40, 0.08);
          overflow: hidden;
        }

        .nm-quiz__header {
          padding: 16px 16px 12px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          background: linear-gradient(180deg, rgba(106, 92, 255, 0.1), rgba(106, 92, 255, 0) 65%);
        }

        .nm-quiz__title h2 {
          margin: 0;
          font-size: 15px;
          letter-spacing: 0.2px;
          font-weight: 800;
        }

        .nm-quiz__title p {
          margin: 0;
          color: #7a819c;
          font-size: 12.5px;
        }

        .nm-quiz__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(106, 92, 255, 0.1);
          border: 1px solid rgba(106, 92, 255, 0.18);
          color: #202437;
          font-size: 12px;
          white-space: nowrap;
        }

        .chip .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #6a5cff;
          box-shadow: 0 0 0 3px rgba(106, 92, 255, 0.15);
        }

        .dash-sep {
          border-top: 1px dashed rgba(32, 36, 55, 0.16);
          margin: 0 16px;
        }

        .nm-quiz__body {
          padding: 14px 16px 16px;
        }

        .passage {
          border: 1px dashed rgba(32, 36, 55, 0.18);
          background: rgba(245, 246, 251, 0.65);
          border-radius: 12px;
          padding: 12px;
          margin: 0 0 12px;
        }

        .passage__label strong {
          font-size: 12px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          color: #7a819c;
        }

        .passage__preview,
        .passage__full {
          margin: 0;
          color: #202437;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .passage__full {
          display: ${passageExpanded ? "block" : "none"};
        }

        .passage.expanded .passage__full {
          display: block;
        }

        .passage.expanded .passage__preview {
          display: none;
        }

        .dots {
          font-weight: 800;
        }

        .toggle {
          margin-top: 10px;
          border: 1px solid rgba(106, 92, 255, 0.25);
          background: rgba(106, 92, 255, 0.1);
          color: #202437;
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 780;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.08s ease, box-shadow 0.12s ease, border-color 0.12s ease;
        }

        .toggle:hover {
          border-color: rgba(106, 92, 255, 0.4);
          box-shadow: 0 10px 18px rgba(18, 20, 40, 0.08);
          transform: translateY(-1px);
        }

        .toggle .icon {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(106, 92, 255, 0.16);
          border: 1px solid rgba(106, 92, 255, 0.22);
          color: #6a5cff;
          font-size: 12px;
          line-height: 1;
        }

        .question__top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .qno {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(245, 246, 251, 0.9);
          border: 1px solid rgba(32, 36, 55, 0.1);
          font-size: 12px;
          color: #7a819c;
        }

        .qno b {
          color: #202437;
        }

        .question__text {
          margin: 0 0 10px;
          font-size: 15px;
          font-weight: 780;
          letter-spacing: 0.1px;
        }

        .options {
          display: grid;
          gap: 10px;
          margin-top: 6px;
        }

        .option {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px;
          border: 1px solid rgba(32, 36, 55, 0.1);
          border-radius: 12px;
          background: #fff;
          cursor: ${currentState.attempted ? "default" : "pointer"};
          transition: transform 0.08s ease, border-color 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease;
          user-select: none;
          position: relative;
        }

        .option:hover {
          ${!currentState.attempted
            ? `
            border-color: rgba(106, 92, 255, 0.3);
            box-shadow: 0 8px 22px rgba(18, 20, 40, 0.06);
            transform: translateY(-1px);
          `
            : ""}
        }

        .option.selected {
          border-color: rgba(106, 92, 255, 0.4);
          background: rgba(106, 92, 255, 0.08);
        }

        .option.correct {
          border-color: rgba(22, 163, 74, 0.45);
          background: rgba(22, 163, 74, 0.12);
        }

        .option.correct .badge {
          background: rgba(22, 163, 74, 0.12);
          border-color: rgba(22, 163, 74, 0.3);
          color: #16a34a;
        }

        .option.incorrect {
          border-color: rgba(239, 68, 68, 0.45);
          background: rgba(239, 68, 68, 0.12);
        }

        .option.incorrect .badge {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .checkbox-wrapper {
          flex: 0 0 auto;
          margin-right: 8px;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #6a5cff;
        }

        .checkbox-wrapper input[type="checkbox"]:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .badge {
          width: 32px;
          height: 32px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-weight: 800;
          background: rgba(106, 92, 255, 0.1);
          border: 1px solid rgba(106, 92, 255, 0.18);
          color: #6a5cff;
          flex: 0 0 auto;
        }

        .opt-text {
          margin: 0;
          color: #202437;
          font-size: 14px;
          line-height: 1.45;
        }

        .reveal {
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(32, 36, 55, 0.1);
          background: rgba(245, 246, 251, 0.75);
          display: ${currentState.attempted ? "block" : "none"};
        }

        .reveal .row {
          display: grid;
          gap: 6px;
          margin-bottom: 10px;
        }

        .reveal .k {
          font-size: 12px;
          color: #7a819c;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .reveal .v {
          margin: 0;
          font-size: 14px;
          color: #202437;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .nm-quiz__footer {
          padding: 12px 16px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          background: linear-gradient(180deg, rgba(245, 246, 251, 0), rgba(245, 246, 251, 0.8));
        }

        .progress {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 220px;
          flex: 1 1 auto;
        }

        .bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(32, 36, 55, 0.08);
          border: 1px solid rgba(32, 36, 55, 0.1);
          overflow: hidden;
          flex: 1 1 auto;
          min-width: 140px;
        }

        .bar > span {
          display: block;
          height: 100%;
          width: ${Math.round(((currentIndex + 1) / questions.length) * 100)}%;
          background: linear-gradient(90deg, #6a5cff, #7b6dff);
          border-radius: 999px;
          transition: width 0.25s ease;
        }

        .progress .txt {
          font-size: 12px;
          color: #7a819c;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn {
          border: 1px solid rgba(32, 36, 55, 0.1);
          background: #fff;
          color: #202437;
          border-radius: 14px;
          padding: 10px 12px;
          font-weight: 780;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.08s ease, box-shadow 0.12s ease, border-color 0.12s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 140px;
          justify-content: center;
        }

        .btn:hover {
          border-color: rgba(106, 92, 255, 0.35);
          box-shadow: 0 10px 20px rgba(18, 20, 40, 0.08);
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn.primary {
          background: linear-gradient(180deg, rgba(106, 92, 255, 0.98), rgba(106, 92, 255, 0.86));
          border-color: rgba(106, 92, 255, 0.55);
          color: #fff;
        }

        .btn.primary:hover {
          box-shadow: 0 14px 26px rgba(106, 92, 255, 0.22);
        }

        .btn .btn-ic {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(32, 36, 55, 0.06);
          border: 1px solid rgba(32, 36, 55, 0.08);
          font-size: 12px;
        }

        .btn.primary .btn-ic {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .edit-btn {
          margin-top: 8px;
          padding: 6px 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          color: #374151;
        }

        .edit-btn:hover {
          background: #e5e7eb;
        }
      `}</style>

      <div className="embed-wrap">
        <section className="nm-quiz" aria-label={quizTitle}>
          <div className="nm-quiz__header">
            <div className="nm-quiz__title">
              <h2>{quizTitle}</h2>
              <p>Click an option to reveal the answer and explanation.</p>
            </div>

            <div className="nm-quiz__meta">
              <span className="chip" title="Question type">
                <span className="dot" aria-hidden="true"></span>
                <span>
                  <b>{getQuestionTypeName(questionTypeId)}</b> Question
                </span>
              </span>

              <span className="chip" title="Score so far">
                <span className="dot" aria-hidden="true"></span>
                <span>
                  <b>{score}</b> correct
                </span>
              </span>

              <span className="chip" title="Attempted">
                <span className="dot" aria-hidden="true"></span>
                <span>
                  <b>{attemptedCount}</b>/<b>{questions.length}</b> attempted
                </span>
              </span>
            </div>
          </div>

          <div className="dash-sep"></div>

          <div className="nm-quiz__body">
            {/* Passage */}
            {passage && (
              <div className={`passage ${passageExpanded ? "expanded" : ""}`}>
                <div className="passage__label">
                  <strong>Passage</strong>
                </div>

                <p
                  className="passage__preview"
                  dangerouslySetInnerHTML={{ __html: buildTwoSentencePreview(passage) }}
                ></p>

                <button
                  type="button"
                  className="toggle"
                  onClick={() => setPassageExpanded(!passageExpanded)}
                  aria-expanded={passageExpanded}
                >
                  <span className="icon">{passageExpanded ? "–" : "+"}</span>
                  <span>{passageExpanded ? "Hide full passage" : "View full passage"}</span>
                </button>

                <p className="passage__full">{passage}</p>
              </div>
            )}

            {/* Question */}
            <div className="question">
              <div className="question__top">
                <div className="qno">
                  Question <b>{currentIndex + 1}</b> of <b>{questions.length}</b>
                </div>
                <div className="qno">
                  <span>
                    {questionTypeId === 2
                      ? currentState.confirmed
                        ? "Confirmed"
                        : currentState.pickedKeys && currentState.pickedKeys.length > 0
                        ? "Selection made"
                        : "Not attempted"
                      : questionTypeId === 7
                      ? currentState.confirmed
                        ? "Confirmed"
                        : currentState.numericValue && currentState.numericValue.trim() !== ""
                        ? "Answer entered"
                        : "Not attempted"
                      : currentState.attempted
                      ? "Attempted"
                      : "Not attempted"}
                  </span>
                </div>
              </div>

              <p
                className="question__text"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question || "" }}
              ></p>

              {/* Options */}
              {questionTypeId !== 7 && options.length > 0 && (
                <div className="options">
                  {options.map((option: string, index: number) => {
                    const optionKey = ANSWER_LABELS[index];
                    
                    // Parse correct answer consistently
                    let correctAnswersArray: string[] = [];
                    if (Array.isArray(correctAnswer)) {
                      correctAnswersArray = correctAnswer;
                    } else if (typeof correctAnswer === 'string') {
                      try {
                        const parsed = JSON.parse(correctAnswer);
                        correctAnswersArray = Array.isArray(parsed) ? parsed : [correctAnswer];
                      } catch {
                        correctAnswersArray = [correctAnswer];
                      }
                    } else {
                      correctAnswersArray = [String(correctAnswer)];
                    }
                    
                    // Check if option is correct - for True/False, also check option text
                    const normalizedCorrect = correctAnswersArray.map(a => String(a).toUpperCase().trim());
                    const normalizedOptionKey = optionKey.toUpperCase().trim();
                    let isCorrect = normalizedCorrect.includes(normalizedOptionKey);
                    
                    // For True/False questions, also check if correct answer matches the option text
                    if (questionTypeId === 3) {
                      const optionText = String(option || "").toUpperCase().trim();
                      // Check if correct answer matches either the option key (A/B) or the option text (True/False)
                      isCorrect = normalizedCorrect.includes(normalizedOptionKey) || 
                                 normalizedCorrect.includes(optionText) ||
                                 normalizedCorrect.some(ca => {
                                   const caUpper = ca.toUpperCase();
                                   const caLower = ca.toLowerCase();
                                   // Match "true" with "TRUE" or "True", and "false" with "FALSE" or "False"
                                   return (caUpper === "TRUE" && (optionText === "TRUE" || optionText.includes("TRUE"))) ||
                                          (caUpper === "FALSE" && (optionText === "FALSE" || optionText.includes("FALSE"))) ||
                                          (caLower === "true" && optionText.includes("TRUE")) ||
                                          (caLower === "false" && optionText.includes("FALSE"));
                                 });
                    }
                    
                    // For type 2, check if option is in pickedKeys; for others, check pickedKey
                    const isSelected = questionTypeId === 2
                      ? (currentState.pickedKeys || []).includes(optionKey)
                      : currentState.pickedKey === optionKey;
                    
                    // Show correct styling only after confirmation/attempt
                    const showCorrect = questionTypeId === 2
                      ? currentState.confirmed && isCorrect
                      : (questionTypeId === 1 || questionTypeId === 3)
                      ? currentState.attempted && isCorrect
                      : currentState.attempted && isCorrect;
                    
                    // Show incorrect styling for multi-select, MCQ, and True/False (selected but not correct)
                    const showIncorrect = questionTypeId === 2
                      ? currentState.confirmed && isSelected && !isCorrect
                      : (questionTypeId === 1 || questionTypeId === 3)
                      ? currentState.attempted && isSelected && !isCorrect
                      : false;

                    return (
                      <div
                        key={index}
                        className={`option ${isSelected ? "selected" : ""} ${showCorrect ? "correct" : ""} ${showIncorrect ? "incorrect" : ""}`}
                        onClick={() => handleOptionClick(optionKey)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOptionClick(optionKey);
                          }
                        }}
                      >
                        {questionTypeId === 2 && (
                          <div className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by parent onClick
                              onClick={(e) => e.stopPropagation()}
                              disabled={currentState.confirmed}
                            />
                          </div>
                        )}
                        <div className="badge">{optionKey}</div>
                        <p
                          className="opt-text"
                          dangerouslySetInnerHTML={{ __html: option }}
                        ></p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Confirm Button for Multiple Select */}
              {questionTypeId === 2 && !currentState.confirmed && (
                <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={handleConfirm}
                    disabled={(currentState.pickedKeys || []).length === 0}
                    style={{ minWidth: "160px" }}
                  >
                    <span>Confirm Selection</span>
                  </button>
                </div>
              )}

              {/* Numeric input field */}
              {questionTypeId === 7 && (
                <div 
                  style={{ marginTop: "16px" }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                >
                  <div style={{ 
                    position: "relative",
                    display: "inline-flex",
                    width: "100%",
                    maxWidth: "400px"
                  }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={currentState.numericValue || ""}
                      onChange={(e) => {
                        // Only allow numeric input and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        handleNumericInputChange(value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      disabled={currentState.confirmed}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        paddingRight: units ? "60px" : "16px",
                        fontSize: "14px",
                        border: `1px solid ${
                          currentState.confirmed
                            ? currentState.isCorrect
                              ? "rgba(22, 163, 74, 0.45)"
                              : "rgba(239, 68, 68, 0.45)"
                            : "rgba(32, 36, 55, 0.18)"
                        }`,
                        borderRadius: "12px",
                        background: currentState.confirmed
                          ? currentState.isCorrect
                            ? "rgba(22, 163, 74, 0.12)"
                            : "rgba(239, 68, 68, 0.12)"
                          : "#fff",
                        color: "#202437",
                        outline: "none",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        if (!currentState.confirmed) {
                          e.target.style.borderColor = "rgba(106, 92, 255, 0.4)";
                          e.target.style.boxShadow = "0 0 0 3px rgba(106, 92, 255, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        e.stopPropagation();
                        if (!currentState.confirmed) {
                          e.target.style.borderColor = "rgba(32, 36, 55, 0.18)";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                      placeholder="Enter numeric value"
                    />
                    {units && (
                      <span style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#7a819c",
                        pointerEvents: "none",
                        userSelect: "none"
                      }}>
                        {units}
                      </span>
                    )}
                  </div>
                  
                  {/* Confirm Button for Numeric */}
                  {!currentState.confirmed && (
                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNumericConfirm();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        disabled={!currentState.numericValue || currentState.numericValue.trim() === ""}
                        style={{ minWidth: "160px" }}
                      >
                        <span>Confirm</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reveal Answer */}
              <div className="reveal" style={{ 
                display: ((questionTypeId === 2 || questionTypeId === 7) ? currentState.confirmed : currentState.attempted) ? "block" : "none" 
              }}>
                <div className="row">
                  <div className="k">Correct answer</div>
                  <div className="v">
                    {(() => {
                      // Parse correct answer for display
                      let answersToShow: string[] = [];
                      if (Array.isArray(correctAnswer)) {
                        answersToShow = correctAnswer;
                      } else if (typeof correctAnswer === 'string') {
                        try {
                          const parsed = JSON.parse(correctAnswer);
                          answersToShow = Array.isArray(parsed) ? parsed : [correctAnswer];
                        } catch {
                          answersToShow = [correctAnswer];
                        }
                      } else {
                        answersToShow = [String(correctAnswer)];
                      }

                      // For multi-select, MCQ, True/False, and Numeric, show as styled badges
                      if ((questionTypeId === 2 || questionTypeId === 1 || questionTypeId === 3 || questionTypeId === 7) && answersToShow.length > 0) {
                        return (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                            {answersToShow.map((ans, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minWidth: "36px",
                                  height: "36px",
                                  padding: "0 12px",
                                  borderRadius: "12px",
                                  background: "rgba(22, 163, 74, 0.12)",
                                  border: "1px solid rgba(22, 163, 74, 0.3)",
                                  color: "#16a34a",
                                  fontWeight: 800,
                                  fontSize: "14px",
                                }}
                              >
                                {String(ans).trim()}
                                {questionTypeId === 7 && units && (
                                  <span style={{ marginLeft: "6px", fontSize: "12px", opacity: 0.8 }}>
                                    {units}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      
                      // For other question types, show as text
                      return <p style={{ margin: 0 }}>{answersToShow.join(", ")}</p>;
                    })()}
                  </div>
                </div>
                {explanation && (
                  <div className="row" style={{ marginBottom: 0 }}>
                    <div className="k">Explanation</div>
                    <p
                      className="v"
                      dangerouslySetInnerHTML={{ __html: explanation }}
                    ></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dash-sep"></div>

          <div className="nm-quiz__footer">
            <div className="progress">
              <div className="bar" aria-hidden="true">
                <span></span>
              </div>
              <div className="txt">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <span className="btn-ic">←</span>
                <span>Previous</span>
              </button>

              <button
                type="button"
                className="btn primary"
                onClick={handleNext}
                disabled={
                  ((questionTypeId === 2 || questionTypeId === 7) ? !currentState.confirmed : !currentState.attempted) ||
                  currentIndex === questions.length - 1
                }
              >
                <span>Next</span>
                <span className="btn-ic">→</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {isEditable && onEdit && (
        <button className="edit-btn" onClick={onEdit}>
          Edit Quiz Selection
        </button>
      )}
    </div>
  );
}

