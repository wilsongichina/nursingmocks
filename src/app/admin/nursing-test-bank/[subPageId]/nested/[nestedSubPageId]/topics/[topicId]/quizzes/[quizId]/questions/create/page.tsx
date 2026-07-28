"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  uploadNursingTestBankQuizQuestion,
  getAllQuestionTypes,
  getNursingTestBankQuiz,
} from "@/lib/firestore-operations";
import Link from "next/link";
import { AdminLoadingShell, AdminTopBar } from "@/components/admin/AdminUi";
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
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  questionTypeId?: number;
  question_type_id?: number;
  slug?: string;
  units?: string;
  isCopyRight?: boolean;
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

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function CreateQuestion({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
    quizId: string;
  }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    topicId: string;
    quizId: string;
  } | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    questionTypeId: 1,
    slug: "",
    units: "",
    isCopyRight: false,
    meta: {
      title: "",
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
    schema: "",
    status: "published",
  });
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quizName, setQuizName] = useState("");

  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim();
    }
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || html).trim();
  };

  const generateSlug = (questionText: string): string => {
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
  };

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadData = async () => {
      if (!resolvedParams) return;

      try {
        setLoading(true);

        const typesResult = await getAllQuestionTypes();
        if (typesResult.success && typesResult.data) {
          const allowedTypes = typesResult.data.filter(
            (type: QuestionType) =>
              type.questionTypeId === "1" ||
              type.questionTypeId === "2" ||
              type.questionTypeId === "3" ||
              type.questionTypeId === "7"
          );
          setQuestionTypes(allowedTypes);
        }

        const quizResult = await getNursingTestBankQuiz(
          resolvedParams.subPageId,
          resolvedParams.nestedSubPageId,
          resolvedParams.topicId,
          resolvedParams.quizId
        );
        if (quizResult.success && quizResult.data) {
          const quizData = quizResult.data as any;
          setQuizName(quizData.pageName || resolvedParams.quizId);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("meta.")) {
      const metaField = field.split(".")[1];
      setQuestionData((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          [metaField]: value,
        },
      }));
    } else if (field === "questionTypeId") {
      const newType = parseInt(value);
      let newOptions: string[] = [];
      let newCorrectAnswer: string | string[] = "";

      if (newType === 3) {
        newOptions = ["True", "False"];
        newCorrectAnswer = "";
      } else if (newType === 7) {
        newOptions = [];
        newCorrectAnswer = "";
      } else {
        newOptions =
          questionData.options && questionData.options.length > 0
            ? questionData.options
            : ["", "", "", ""];
        newCorrectAnswer = "";
      }

      setQuestionData((prev) => ({
        ...prev,
        questionTypeId: newType,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      }));
    } else {
      const updatedData: QuestionData = {
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
    if (!questionData.options) return;
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData({
      ...questionData,
      options: newOptions,
    });
  };

  const handleAddOption = () => {
    if (!questionData.options) return;
    setQuestionData({
      ...questionData,
      options: [...questionData.options, ""],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (!questionData.options) return;
    const newOptions = questionData.options.filter((_, i) => i !== index);
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

    if (!questionData.questionTypeId) {
      setError("Question type is required");
      return;
    }

    const questionTypeId = questionData.questionTypeId;

    if (questionTypeId === 1) {
      const validOptions =
        questionData.options?.filter((opt) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      if (
        !questionData.correctAnswer ||
        (typeof questionData.correctAnswer === "string" &&
          !questionData.correctAnswer.trim())
      ) {
        setError("Correct answer is required");
        return;
      }
    } else if (questionTypeId === 2) {
      const validOptions =
        questionData.options?.filter((opt) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      if (
        !questionData.correctAnswer ||
        (Array.isArray(questionData.correctAnswer) &&
          questionData.correctAnswer.length === 0) ||
        (typeof questionData.correctAnswer === "string" &&
          !questionData.correctAnswer.trim())
      ) {
        setError("At least one correct answer is required");
        return;
      }
    } else if (questionTypeId === 3) {
      if (
        !questionData.correctAnswer ||
        (typeof questionData.correctAnswer === "string" &&
          !questionData.correctAnswer.trim())
      ) {
        setError("Correct answer is required");
        return;
      }
    } else if (questionTypeId === 7) {
      if (
        !questionData.correctAnswer ||
        (Array.isArray(questionData.correctAnswer) &&
          (!questionData.correctAnswer[0] ||
            !questionData.correctAnswer[0].trim())) ||
        (typeof questionData.correctAnswer === "string" &&
          !questionData.correctAnswer.trim())
      ) {
        setError("Correct answer is required");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let correctAnswerToSave: any = questionData.correctAnswer;

      if (questionTypeId === 2) {
        if (typeof correctAnswerToSave === "string") {
          try {
            const parsed = JSON.parse(correctAnswerToSave);
            correctAnswerToSave = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            correctAnswerToSave = [correctAnswerToSave];
          }
        } else if (!Array.isArray(correctAnswerToSave)) {
          correctAnswerToSave = [correctAnswerToSave];
        }
      }

      if (questionTypeId === 7) {
        if (typeof correctAnswerToSave === "string") {
          correctAnswerToSave = [correctAnswerToSave];
        } else if (!Array.isArray(correctAnswerToSave)) {
          correctAnswerToSave = [String(correctAnswerToSave)];
        }
      }

      const questionContent = {
        question: questionData.question,
        options: questionData.options?.filter((opt) => opt.trim()) || [],
        correctAnswer: correctAnswerToSave,
        explanation: questionData.explanation || "",
        questionTypeId: questionTypeId,
        slug: questionData.slug || generateSlug(questionData.question || ""),
        units: questionData.units || null,
        isCopyRight: questionData.isCopyRight || false,
        meta:
          questionData.meta || {
            title: "",
            description: "",
            keywords: "",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            canonicalUrl: "",
          },
        schema: questionData.schema || "",
        status: questionData.status || "published",
      };

      const questionId =
        questionData.slug ||
        generateSlug(questionData.question || "") ||
        `question-${Date.now()}`;

      const result = await uploadNursingTestBankQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
        resolvedParams.quizId,
        questionId,
        questionContent
      );

      if (result.success) {
        setSuccess("Question created successfully!");
        setTimeout(() => {
          router.push(
            `/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`
          );
        }, 1500);
      } else {
        setError(result.message || "Failed to create question");
      }
    } catch (err) {
      setError("Failed to create question");
      console.error("Error creating question:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !resolvedParams) {
    return (
      <div className="admin-page">
        <AdminLoadingShell
          title="Loading Admin Content"
          description="Preparing admin data and management controls."
        />
      </div>
    );
  }

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
          <AdminTopBar
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Admin Dashboard", href: "/admin" },
              { label: "Create Question" },
            ]}
            actions={
              currentUser ? (
                <UserProfileBadge />
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="admin-button-secondary px-3 py-1.5 text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="admin-button-primary px-4 py-2 text-sm"
                  >
                    Register
                  </Link>
                </div>
              )
            }
          />
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
        <div className="admin-workspace space-y-6">
          <header className="admin-header-row flex-wrap">
            <div className="admin-header-copy flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="admin-page-title">
                  Create Question
                </h1>
              </div>
              <div className="admin-body flex flex-wrap items-center gap-3">
                <span>
                  Add a new question to{" "}
                  <strong>{quizName || resolvedParams.quizId}</strong>.
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Draft mode
                </span>
              </div>
            </div>
            <div className="admin-header-actions">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`}
                className="admin-button-secondary"
              >
                Back to Admin
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="admin-button-primary disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Question"}
              </button>
            </div>
          </header>

          {error && (
            <div className="admin-alert admin-alert-error">
              {error}
            </div>
          )}
          {success && (
            <div className="admin-alert admin-alert-success">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <section className="admin-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="admin-card-title">
                  Question Content
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="admin-field-label">
                    Question Type *
                  </label>
                  <select
                    value={questionData.questionTypeId || 1}
                    onChange={(e) =>
                      handleInputChange("questionTypeId", parseInt(e.target.value))
                    }
                    className="admin-field mt-1"
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
                  <label className="admin-field-label">
                    Question Text *
                  </label>
                  <div className="admin-info-tile mt-1 bg-white">
                    <RichTextEditor
                      value={questionData.question || ""}
                      onChange={(val) => handleInputChange("question", val)}
                      placeholder="Enter the question text..."
                    />
                  </div>
                </div>

                {questionData.questionTypeId === 3 ? (
                  <div>
                    <label className="admin-field-label">
                      Options (Fixed for True/False)
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="admin-info-tile flex items-center gap-3 px-3 py-2">
                        <span className="admin-field-label min-w-[30px]">
                          A:
                        </span>
                        <span className="admin-body-sm">True</span>
                      </div>
                      <div className="admin-info-tile flex items-center gap-3 px-3 py-2">
                        <span className="admin-field-label min-w-[30px]">
                          B:
                        </span>
                        <span className="admin-body-sm">False</span>
                      </div>
                    </div>
                  </div>
                ) : questionData.questionTypeId === 7 ? (
                  <div>
                    <label className="admin-field-label">
                      Answer Type: Numeric/Fill-in-the-Blank
                    </label>
                    <p className="admin-helper mt-1">
                      Enter the numeric answer below.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="admin-field-label">
                        Options *
                      </label>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="admin-button-secondary px-3 py-1.5 text-xs"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-3">
                      {questionData.options?.map((option: string, index: number) => (
                        <div
                          key={index}
                          className="admin-info-tile flex items-start gap-3 bg-white px-3 py-2"
                        >
                          <span className="admin-field-label min-w-[24px] pt-1">
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
                                className="admin-button-danger px-2 py-1 text-xs"
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
                    <label className="admin-field-label">
                      Correct Answer *
                    </label>
                    <div className="mt-2 space-y-2">
                      {["True", "False"].map((val) => (
                        <label
                          key={val}
                          className="admin-info-tile flex cursor-pointer items-center gap-3 bg-white px-3 py-2"
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={val}
                            checked={questionData.correctAnswer === val}
                            onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="admin-body-sm">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : questionData.questionTypeId === 7 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="admin-field-label">
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
                        className="admin-field mt-1"
                        placeholder="Enter numeric answer"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">
                        Units
                      </label>
                      <input
                        type="text"
                        value={questionData.units || ""}
                        onChange={(e) => handleInputChange("units", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="e.g., mL, mg, units"
                      />
                    </div>
                  </div>
                ) : questionData.questionTypeId === 2 ? (
                  <div>
                    <label className="admin-field-label">
                      Correct Answer(s) * (Select all that apply)
                    </label>
                    <div className="mt-2 space-y-2">
                      {questionData.options?.map((option: string, index: number) => {
                        const optionLabel = ANSWER_LABELS[index];
                        const selectedAnswers = Array.isArray(questionData.correctAnswer)
                          ? questionData.correctAnswer
                          : [];
                        const isSelected = selectedAnswers.includes(optionLabel);
                        return (
                          <label
                            key={index}
                            className="admin-info-tile flex cursor-pointer items-center gap-3 bg-white px-3 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentAnswers = Array.isArray(questionData.correctAnswer)
                                  ? questionData.correctAnswer
                                  : [];
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
                            <span className="admin-field-label min-w-[26px]">
                              {optionLabel}:
                            </span>
                            <span className="admin-body-sm flex-1 line-clamp-1">
                              {stripHtmlTags(option)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="admin-field-label">
                      Correct Answer *
                    </label>
                    <select
                      value={
                        Array.isArray(questionData.correctAnswer)
                          ? ""
                          : (questionData.correctAnswer as string) || ""
                      }
                      onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                      className="admin-field mt-1"
                    >
                      <option value="">Select correct answer</option>
                      {questionData.options?.map((_, index: number) => (
                        <option key={index} value={ANSWER_LABELS[index]}>
                          {ANSWER_LABELS[index]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="admin-field-label">
                    Explanation
                  </label>
                  <div className="admin-info-tile mt-1 bg-white">
                    <RichTextEditor
                      value={questionData.explanation || ""}
                      onChange={(val) => handleInputChange("explanation", val)}
                      placeholder="Enter the explanation for the correct answer..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="admin-field-label">
                      Status
                    </label>
                    <select
                      value={questionData.status || "published"}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="admin-field mt-1"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <label className="admin-info-tile flex cursor-pointer items-center justify-between px-4 py-3">
                    <div>
                      <span className="admin-card-title block">
                        Copyright Protected
                      </span>
                      <span className="admin-helper">
                        Mark this question as copyright protected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange("isCopyRight", !questionData.isCopyRight)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        questionData.isCopyRight ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          questionData.isCopyRight ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            </section>

            <aside className="admin-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="admin-card-title">Meta & Schema</div>
                  <p className="admin-helper">
                    Keep SEO metadata and structured data in sync.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-[11px] font-semibold border border-indigo-100">
                  SEO
                </span>
              </div>

              <div className="space-y-3">
                <div className="admin-info-tile px-3 py-3">
                  <label className="admin-field-label">
                    Question Slug URL
                  </label>
                  <input
                    type="text"
                    value={questionData.slug || ""}
                    readOnly
                    className="admin-field mt-1"
                    placeholder="Slug auto-generated from question text"
                  />
                  <p className="admin-helper mt-1">
                    Auto-generated from the first 180 characters of the question text.
                  </p>
                </div>

                <div className="admin-info-tile bg-white px-3 py-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="admin-field-label">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.title || ""}
                        onChange={(e) => handleInputChange("meta.title", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Meta title"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">
                        Meta Description
                      </label>
                      <textarea
                        value={questionData.meta?.description || ""}
                        onChange={(e) => handleInputChange("meta.description", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Meta description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.keywords || ""}
                        onChange={(e) => handleInputChange("meta.keywords", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Keywords (comma separated)"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.ogTitle || ""}
                        onChange={(e) => handleInputChange("meta.ogTitle", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Open Graph title"
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">
                        OG Description
                      </label>
                      <textarea
                        value={questionData.meta?.ogDescription || ""}
                        onChange={(e) => handleInputChange("meta.ogDescription", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Open Graph description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="admin-field-label">
                        OG Image URL
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.ogImage || ""}
                        onChange={(e) => handleInputChange("meta.ogImage", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Open Graph image URL"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="admin-field-label">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={questionData.meta?.canonicalUrl || ""}
                        onChange={(e) => handleInputChange("meta.canonicalUrl", e.target.value)}
                        className="admin-field mt-1"
                        placeholder="Canonical URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-info-tile bg-white px-3 py-3">
                  <label className="admin-field-label">
                    Schema Markup
                  </label>
                  <textarea
                    value={questionData.schema || ""}
                    onChange={(e) => handleInputChange("schema", e.target.value)}
                    className="admin-field mt-1 font-mono"
                    placeholder="Enter JSON-LD schema markup..."
                    rows={8}
                  />
                </div>
              </div>
            </aside>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e5f0] pt-3">
            <div className="admin-helper">
              Autosave not enabled; click Save Question to persist changes.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`}
                className="admin-button-secondary px-3 py-2 text-xs"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="admin-button-primary px-4 py-2 text-xs disabled:opacity-50"
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







