"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getNursingTestBankQuizQuestion,
  uploadNursingTestBankQuizQuestion,
  getAllQuestionTypes,
} from "@/lib/firestore-operations";
import Link from "next/link";
import RichTextEditor from "@/components/ui/RichTextEditor";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionType {
  id: string;
  questionTypeId: string;
  questionTypeName: string;
}

interface QuestionData {
  question?: string;
  options?: string[] | any;
  correctAnswer?: string | string[];
  explanation?: string;
  questionTypeId?: number;
  question_type_id?: number;
  slug?: string;
  units?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  schema?: string;
  status?: string;
  [key: string]: any;
}

export default function EditQuestion({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
    quizId: string;
    questionId: string;
  }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
    quizId: string;
    questionId: string;
  } | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim();
    }
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || html).trim();
  };

  const generateSlug = useCallback((questionText: string): string => {
    if (!questionText) return "";
    const cleanText = stripHtmlTags(questionText);
    const truncated = cleanText.substring(0, 180);
    const slug = truncated
      .toLowerCase()
      .replace(/nbsp/g, "")
      .replace(/&nbsp;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug;
  }, []);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadQuestionTypes = async () => {
      try {
        const result = await getAllQuestionTypes();
        if (result.success && result.data) {
          setQuestionTypes(result.data);
        }
      } catch (err) {
        console.error("Error loading question types:", err);
      }
    };
    loadQuestionTypes();
  }, []);

  const loadQuestion = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      setError("");

      const result = await getNursingTestBankQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
        resolvedParams.quizId,
        resolvedParams.questionId
      );

      if (result.success && result.data) {
        const data = result.data as QuestionData;
        const questionTypeId = data.questionTypeId || data.question_type_id || 1;

        let optionsArray: string[] = [];
        if (data.options) {
          if (Array.isArray(data.options)) {
            optionsArray = data.options;
          } else if (typeof data.options === "string") {
            try {
              const parsed = JSON.parse(data.options);
              if (typeof parsed === "object" && !Array.isArray(parsed)) {
                optionsArray = Object.keys(parsed)
                  .sort()
                  .map((key) => {
                    const option = parsed[key];
                    return option.choice || option || "";
                  });
              } else if (Array.isArray(parsed)) {
                optionsArray = parsed;
              }
            } catch {
              optionsArray = [data.options];
            }
          }
        }

        if (questionTypeId === 3 && optionsArray.length === 0) {
          optionsArray = ["True", "False"];
        } else if (questionTypeId === 7 && optionsArray.length === 0) {
          optionsArray = [""];
        } else if (optionsArray.length === 0) {
          optionsArray = ["", "", "", ""];
        }

        let correctAnswer: string | string[] = "";
        if (data.correctAnswer) {
          if (questionTypeId === 7) {
            if (Array.isArray(data.correctAnswer)) {
              correctAnswer = data.correctAnswer;
            } else if (typeof data.correctAnswer === "string") {
              try {
                const parsed = JSON.parse(data.correctAnswer);
                correctAnswer = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                correctAnswer = [data.correctAnswer];
              }
            } else {
              correctAnswer = [String(data.correctAnswer)];
            }
          } else if (questionTypeId === 2) {
            if (typeof data.correctAnswer === "string") {
              try {
                const parsed = JSON.parse(data.correctAnswer);
                correctAnswer = Array.isArray(parsed)
                  ? parsed
                  : [data.correctAnswer];
              } catch {
                correctAnswer = [data.correctAnswer];
              }
            } else if (Array.isArray(data.correctAnswer)) {
              correctAnswer = data.correctAnswer;
            } else {
              correctAnswer = [String(data.correctAnswer)];
            }
          } else {
            if (typeof data.correctAnswer === "string") {
              correctAnswer = data.correctAnswer;
            } else if (Array.isArray(data.correctAnswer)) {
              correctAnswer = data.correctAnswer[0] || "";
            } else {
              correctAnswer = String(data.correctAnswer);
            }
          }
        }

        setQuestionData({
          question: data.question || "",
          options: optionsArray,
          correctAnswer: correctAnswer,
          explanation: data.explanation || "",
          questionTypeId: questionTypeId,
          slug: data.slug || generateSlug(data.question || ""),
          units: data.units || "",
          meta:
            data.meta || {
              title: "",
              description: "",
              keywords: "",
              ogTitle: "",
              ogDescription: "",
              ogImage: "",
              canonicalUrl: "",
            },
          schema: data.schema || "",
          status: data.status || "published",
        });
      } else {
        setError(result.message || "Failed to load question");
      }
    } catch (err) {
      setError("Failed to load question");
      console.error("Error loading question:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams, generateSlug]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleInputChange = (field: string, value: any) => {
    if (!questionData) return;

    if (field.startsWith("meta.")) {
      const metaField = field.split(".")[1];
      setQuestionData({
        ...questionData,
        meta: {
          ...questionData.meta,
          [metaField]: value,
        },
      });
    } else if (field === "questionTypeId") {
      const newType = parseInt(value);
      let newOptions: string[] = [];
      let newCorrectAnswer: string | string[] = "";

      if (newType === 3) {
        newOptions = ["True", "False"];
        newCorrectAnswer = "";
      } else if (newType === 7) {
        newOptions = [""];
        newCorrectAnswer = "";
      } else {
        newOptions =
          questionData.options &&
          Array.isArray(questionData.options) &&
          questionData.options.length > 0
            ? questionData.options
            : ["", "", "", ""];
        newCorrectAnswer = "";
      }

      setQuestionData({
        ...questionData,
        questionTypeId: newType,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    } else {
      const updatedData = {
        ...questionData,
        [field]: value,
      };
      if (field === "question") {
        updatedData.slug = generateSlug(value);
      }
      setQuestionData(updatedData);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!questionData || !questionData.options) return;
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData({
      ...questionData,
      options: newOptions,
    });
  };

  const handleAddOption = () => {
    if (!questionData || !questionData.options) return;
    setQuestionData({
      ...questionData,
      options: [...questionData.options, ""],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (!questionData || !questionData.options) return;
    const newOptions = questionData.options.filter((_: string, i: number) => i !== index);
    setQuestionData({
      ...questionData,
      options: newOptions,
    });
  };

  const handleSave = async () => {
    if (!resolvedParams || !questionData) return;

    if (!questionData.question?.trim()) {
      setError("Question text is required");
      return;
    }

    const questionTypeId = questionData.questionTypeId || 1;
    let optionsToSave: string[] = [];
    let correctAnswerToSave: string | string[] = "";

    if (questionTypeId === 3) {
      optionsToSave = ["True", "False"];
      if (
        !questionData.correctAnswer ||
        (questionData.correctAnswer !== "True" &&
          questionData.correctAnswer !== "False")
      ) {
        setError("Please select True or False as the correct answer");
        return;
      }
      correctAnswerToSave = questionData.correctAnswer as string;
    } else if (questionTypeId === 7) {
      optionsToSave = [""];
      if (
        !questionData.correctAnswer ||
        (Array.isArray(questionData.correctAnswer) &&
          questionData.correctAnswer.length === 0)
      ) {
        setError("Please enter a numeric answer");
        return;
      }
      correctAnswerToSave = Array.isArray(questionData.correctAnswer)
        ? questionData.correctAnswer
        : [questionData.correctAnswer as string];
    } else if (questionTypeId === 2) {
      const validOptions =
        questionData.options?.filter((opt: string) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      optionsToSave = validOptions;
      if (!questionData.correctAnswer) {
        setError("Please select at least one correct answer");
        return;
      }
      if (Array.isArray(questionData.correctAnswer)) {
        correctAnswerToSave = JSON.stringify(questionData.correctAnswer);
      } else {
        try {
          const parsed = JSON.parse(questionData.correctAnswer as string);
          if (Array.isArray(parsed)) {
            correctAnswerToSave = questionData.correctAnswer as string;
          } else {
            correctAnswerToSave = JSON.stringify([questionData.correctAnswer]);
          }
        } catch {
          correctAnswerToSave = JSON.stringify([questionData.correctAnswer]);
        }
      }
    } else {
      const validOptions =
        questionData.options?.filter((opt: string) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      optionsToSave = validOptions;
      if (!questionData.correctAnswer) {
        setError("Please select a correct answer");
        return;
      }
      correctAnswerToSave = questionData.correctAnswer as string;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const slug = questionData.slug || generateSlug(questionData.question || "");

      const contentToSave: any = {
        question: questionData.question,
        options: optionsToSave,
        correctAnswer: correctAnswerToSave,
        explanation: questionData.explanation || "",
        questionTypeId: questionTypeId,
        slug: slug,
        meta: questionData.meta || {},
        schema: questionData.schema || "",
        status: questionData.status || "published",
      };

      if (questionTypeId === 7 && questionData.units) {
        contentToSave.units = questionData.units;
      }

      const result = await uploadNursingTestBankQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
        resolvedParams.quizId,
        resolvedParams.questionId,
        contentToSave
      );

      if (result.success) {
        setSuccess("Question saved successfully!");
        setTimeout(() => {
          router.push(
            `/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`
          );
        }, 1500);
      } else {
        setError(result.message || "Failed to save question");
      }
    } catch (err) {
      setError("Failed to save question");
      console.error("Error saving question:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Question not found</p>
          <Link
            href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`}
            className="text-indigo-600 hover:underline"
          >
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const gradientBg = "bg-gradient-to-r from-indigo-50 via-white to-blue-50";

  function LayoutShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const { currentUser } = useAuth();
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <AdminSidebar />
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="hidden md:block border-b border-gray-200 bg-white h-16">
            <div className="flex justify-between items-center px-4 h-full">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  Home
                </Link>
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <Link
                  href="/admin"
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  Admin
                </Link>
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <span className="font-medium text-gray-800">Edit Question</span>
              </div>
              {currentUser ? (
                <UserProfileBadge />
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="gradient-button text-white px-6 py-2 rounded-lg font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffffff_0,#f5f6fb_40%,#e8ebff_100%)]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <LayoutShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  Edit Question
                </h1>
              </div>
              <div className="text-sm text-slate-600 flex flex-wrap items-center gap-3">
                <span>Question ID: {resolvedParams.questionId}</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Draft mode
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← Back to Admin
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Question"}
              </button>
            </div>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Question Content
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Question Type *
                  </label>
                  <select
                    value={questionData.questionTypeId || 1}
                    onChange={(e) =>
                      handleInputChange("questionTypeId", parseInt(e.target.value))
                    }
                    className={`mt-1 w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                  >
                    {questionTypes
                      .filter((type) => {
                        const typeId = parseInt(type.questionTypeId);
                        return typeId === 1 || typeId === 2 || typeId === 3 || typeId === 7;
                      })
                      .map((type) => (
                        <option key={type.id} value={type.questionTypeId}>
                          {type.questionTypeName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Question Text *
                  </label>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-white">
                    <RichTextEditor
                      value={questionData.question || ""}
                      onChange={(val) => handleInputChange("question", val)}
                      placeholder="Enter the question text..."
                    />
                  </div>
                </div>

                {questionData.questionTypeId === 3 ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Options (Fixed for True/False)
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-600 min-w-[30px]">
                          A:
                        </span>
                        <span className="text-slate-800">True</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-600 min-w-[30px]">
                          B:
                        </span>
                        <span className="text-slate-800">False</span>
                      </div>
                    </div>
                  </div>
                ) : questionData.questionTypeId === 7 ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Answer Type: Numeric/Fill-in-the-Blank
                    </label>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Enter the numeric answer below.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600">
                        Options *
                      </label>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-3">
                      {questionData.options?.map((option: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                          <span className="text-xs font-semibold text-slate-600 min-w-[24px] pt-1">
                            {ANSWER_LABELS[index] || String(index + 1)}:
                          </span>
                          <div className="flex-1">
                            <RichTextEditor
                              value={option}
                              onChange={(val) => handleOptionChange(index, val)}
                              placeholder={`Option ${ANSWER_LABELS[index] || String(index + 1)}`}
                            />
                          </div>
                          {questionData.questionTypeId !== 3 &&
                            questionData.questionTypeId !== 7 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="text-red-500 hover:text-red-600 p-1"
                                disabled={
                                  questionData.options &&
                                  questionData.options.length <= 2
                                }
                              >
                                ✕
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {questionData.questionTypeId === 3 ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Correct Answer *
                    </label>
                    <div className="mt-2 space-y-2">
                      {["True", "False"].map((val) => (
                        <label
                          key={val}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={val}
                            checked={questionData.correctAnswer === val}
                            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-sm text-slate-800">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : questionData.questionTypeId === 7 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Correct Answer (Numeric) *
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(questionData.correctAnswer)
                            ? questionData.correctAnswer[0] || ""
                            : (questionData.correctAnswer as string) || ""
                        }
                        onChange={(e) => handleInputChange("correctAnswer", [e.target.value])}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Enter numeric answer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Units
                      </label>
                      <input
                        type="text"
                        value={questionData.units || ""}
                        onChange={(e) => handleInputChange("units", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="e.g., mL, mg, units"
                      />
                    </div>
                  </div>
                ) : questionData.questionTypeId === 2 ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Correct Answer(s) * (Select all that apply)
                    </label>
                    <div className="mt-2 space-y-2">
                      {questionData.options?.map((option: string, index: number) => {
                        const optionLabel = ANSWER_LABELS[index];
                        const selectedAnswers = Array.isArray(questionData.correctAnswer)
                          ? questionData.correctAnswer
                          : (() => {
                              try {
                                const parsed = JSON.parse(
                                  (questionData.correctAnswer as string) || "[]"
                                );
                                return Array.isArray(parsed) ? parsed : [];
                              } catch {
                                return [];
                              }
                            })();
                        const isSelected = selectedAnswers.includes(optionLabel);
                        return (
                          <label
                            key={index}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentAnswers = Array.isArray(questionData.correctAnswer)
                                  ? questionData.correctAnswer
                                  : (() => {
                                      try {
                                        const parsed = JSON.parse(
                                          (questionData.correctAnswer as string) || "[]"
                                        );
                                        return Array.isArray(parsed) ? parsed : [];
                                      } catch {
                                        return [];
                                      }
                                    })();

                                let newAnswers: string[];
                                if (e.target.checked) {
                                  newAnswers = [...currentAnswers, optionLabel];
                                } else {
                                  newAnswers = currentAnswers.filter((ans) => ans !== optionLabel);
                                }
                                handleInputChange("correctAnswer", newAnswers);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-xs font-semibold text-slate-600 min-w-[26px]">
                              {optionLabel}:
                            </span>
                            <span className="text-sm text-slate-800 flex-1 line-clamp-1">
                              {stripHtmlTags(option)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Correct Answer *
                    </label>
                    <select
                      value={
                        Array.isArray(questionData.correctAnswer)
                          ? ""
                          : (questionData.correctAnswer as string) || ""
                      }
                      onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                      className={`mt-1 w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                    >
                      <option value="">Select correct answer</option>
                      {questionData.options?.map((_: string, index: number) => (
                        <option key={index} value={ANSWER_LABELS[index]}>
                          {ANSWER_LABELS[index]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Explanation
                  </label>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-white">
                    <RichTextEditor
                      value={questionData.explanation || ""}
                      onChange={(val) => handleInputChange("explanation", val)}
                      placeholder="Enter the explanation for the correct answer..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">
                      Status
                    </label>
                    <select
                      value={questionData.status || "published"}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className={`mt-1 w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <aside className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Meta & Schema</div>
                  <p className="text-xs text-slate-500">
                    Keep SEO metadata and structured data in sync.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-[11px] font-semibold border border-indigo-100">
                  SEO
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <label className="text-xs font-semibold text-slate-600">
                    Question Slug URL
                  </label>
                  <input
                    type="text"
                    value={questionData.slug || ""}
                    readOnly
                    className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 ${gradientBg}`}
                    placeholder="Slug auto-generated from question text"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Auto-generated from the first 180 characters of the question text.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.title || ""}
                        onChange={(e) => handleInputChange("meta.title", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Meta title"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Meta Description
                      </label>
                      <textarea
                        value={questionData.meta?.description || ""}
                        onChange={(e) => handleInputChange("meta.description", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Meta description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.keywords || ""}
                        onChange={(e) => handleInputChange("meta.keywords", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Keywords (comma separated)"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.ogTitle || ""}
                        onChange={(e) => handleInputChange("meta.ogTitle", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Open Graph title"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        OG Description
                      </label>
                      <textarea
                        value={questionData.meta?.ogDescription || ""}
                        onChange={(e) => handleInputChange("meta.ogDescription", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Open Graph description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        OG Image URL
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.ogImage || ""}
                        onChange={(e) => handleInputChange("meta.ogImage", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Open Graph image URL"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.canonicalUrl || ""}
                        onChange={(e) => handleInputChange("meta.canonicalUrl", e.target.value)}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                        placeholder="Canonical URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <label className="text-xs font-semibold text-slate-600">
                    Schema Markup
                  </label>
                  <textarea
                    value={questionData.schema || ""}
                    onChange={(e) => handleInputChange("schema", e.target.value)}
                    className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${gradientBg}`}
                    placeholder="Enter JSON-LD schema markup..."
                    rows={8}
                  />
                </div>
              </div>
            </aside>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Autosave not enabled; click Save Question to persist changes.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-indigo-600 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Question"}
              </button>
            </div>
          </footer>
        </div>
      </LayoutShell>
    </SidebarProvider>
  );
}


