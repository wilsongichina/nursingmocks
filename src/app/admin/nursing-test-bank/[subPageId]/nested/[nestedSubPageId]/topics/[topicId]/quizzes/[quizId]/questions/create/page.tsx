"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  uploadNursingTestBankQuizQuestion,
  getAllQuestionTypes,
  getNursingTestBankQuiz,
} from "@/lib/firestore-operations";
import Link from "next/link";
import RichTextEditor from "@/components/ui/RichTextEditor";

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

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim();
    }
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || html).trim();
  };

  // Generate slug from question text (first 180 characters)
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
        
        // Load question types
        const typesResult = await getAllQuestionTypes();
        if (typesResult.success && typesResult.data) {
          // Filter to only show types 1, 2, 3, 7
          const allowedTypes = typesResult.data.filter(
            (type: QuestionType) => 
              type.questionTypeId === "1" || 
              type.questionTypeId === "2" || 
              type.questionTypeId === "3" || 
              type.questionTypeId === "7"
          );
          setQuestionTypes(allowedTypes);
        }

        // Load quiz name
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
      setQuestionData({
        ...questionData,
        meta: {
          ...questionData.meta,
          [metaField]: value,
        },
      });
    } else if (field === "questionTypeId") {
      // When question type changes, reset options and correct answer based on type
      const newType = parseInt(value);
      let newOptions: string[] = [];
      let newCorrectAnswer: string | string[] = "";
      
      if (newType === 3) {
        // True/False
        newOptions = ["True", "False"];
        newCorrectAnswer = "";
      } else if (newType === 7) {
        // Numeric/Fill-in
        newOptions = [];
        newCorrectAnswer = "";
      } else {
        // Single/Multiple choice
        newOptions = questionData.options && questionData.options.length > 0
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
      
      // Auto-generate slug when question text changes
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

    const newOptions = questionData.options.filter((_: any, i: number) => i !== index);
    setQuestionData({
      ...questionData,
      options: newOptions,
    });
  };

  const handleSave = async () => {
    if (!resolvedParams || !questionData) return;

    // Validation
    if (!questionData.question?.trim()) {
      setError("Question text is required");
      return;
    }

    if (!questionData.questionTypeId) {
      setError("Question type is required");
      return;
    }

    const questionTypeId = questionData.questionTypeId;

    // Validate based on question type
    if (questionTypeId === 1) {
      // Single choice
      const validOptions = questionData.options?.filter((opt: string) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      if (!questionData.correctAnswer || (typeof questionData.correctAnswer === "string" && !questionData.correctAnswer.trim())) {
        setError("Correct answer is required");
        return;
      }
    } else if (questionTypeId === 2) {
      // Multiple choice
      const validOptions = questionData.options?.filter((opt: string) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      if (!questionData.correctAnswer || 
          (Array.isArray(questionData.correctAnswer) && questionData.correctAnswer.length === 0) ||
          (typeof questionData.correctAnswer === "string" && !questionData.correctAnswer.trim())) {
        setError("At least one correct answer is required");
        return;
      }
    } else if (questionTypeId === 3) {
      // True/False
      if (!questionData.correctAnswer || (typeof questionData.correctAnswer === "string" && !questionData.correctAnswer.trim())) {
        setError("Correct answer is required");
        return;
      }
    } else if (questionTypeId === 7) {
      // Numeric
      if (!questionData.correctAnswer || 
          (Array.isArray(questionData.correctAnswer) && (!questionData.correctAnswer[0] || !questionData.correctAnswer[0].trim())) ||
          (typeof questionData.correctAnswer === "string" && !questionData.correctAnswer.trim())) {
        setError("Correct answer is required");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Prepare question content
      let correctAnswerToSave: any = questionData.correctAnswer;
      
      // For type 2 (multiple choice), ensure correctAnswer is an array
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
      
      // For type 7 (numeric), ensure correctAnswer is an array
      if (questionTypeId === 7) {
        if (typeof correctAnswerToSave === "string") {
          correctAnswerToSave = [correctAnswerToSave];
        } else if (!Array.isArray(correctAnswerToSave)) {
          correctAnswerToSave = [String(correctAnswerToSave)];
        }
      }

      const questionContent = {
        question: questionData.question,
        options: questionData.options?.filter((opt: string) => opt.trim()) || [],
        correctAnswer: correctAnswerToSave,
        explanation: questionData.explanation || "",
        questionTypeId: questionTypeId,
        slug: questionData.slug || generateSlug(questionData.question || ""),
        units: questionData.units || null,
        meta: questionData.meta || {
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

      // Generate question ID from slug
      const questionId = questionData.slug || generateSlug(questionData.question || "") || `question-${Date.now()}`;

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Question
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Add a new question to: {quizName || resolvedParams.quizId}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Save Question</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Page Settings Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Page Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Slug URL
            </label>
            <input
              type="text"
              value={questionData.slug || ""}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-900"
              placeholder="Slug will be auto-generated from question text"
            />
            <p className="text-xs text-gray-500 mt-1">
              Automatically generated from the first 180 characters of the question text
            </p>
          </div>
        </div>

        {/* Meta Data Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Meta Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={questionData.meta?.title || ""}
                onChange={(e) => handleInputChange("meta.title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Meta title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={questionData.meta?.description || ""}
                onChange={(e) => handleInputChange("meta.description", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Meta description"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={questionData.meta?.keywords || ""}
                onChange={(e) => handleInputChange("meta.keywords", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Keywords (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Title
              </label>
              <input
                type="text"
                value={questionData.meta?.ogTitle || ""}
                onChange={(e) => handleInputChange("meta.ogTitle", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Open Graph title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Description
              </label>
              <textarea
                value={questionData.meta?.ogDescription || ""}
                onChange={(e) => handleInputChange("meta.ogDescription", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Open Graph description"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Image URL
              </label>
              <input
                type="text"
                value={questionData.meta?.ogImage || ""}
                onChange={(e) => handleInputChange("meta.ogImage", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Open Graph image URL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="text"
                value={questionData.meta?.canonicalUrl || ""}
                onChange={(e) => handleInputChange("meta.canonicalUrl", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Canonical URL"
              />
            </div>
          </div>
        </div>

        {/* Schema Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Schema Markup</h2>
          <textarea
            value={questionData.schema || ""}
            onChange={(e) => handleInputChange("schema", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-gray-900"
            placeholder="Enter JSON-LD schema markup..."
            rows={8}
          />
        </div>

        {/* Question Data Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Question Data</h2>
          
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type *
            </label>
            <select
              value={questionData.questionTypeId || 1}
              onChange={(e) =>
                handleInputChange("questionTypeId", parseInt(e.target.value))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
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

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <RichTextEditor
              value={questionData.question || ""}
              onChange={(val) => handleInputChange("question", val)}
              placeholder="Enter the question text..."
            />
          </div>

          {/* Options - Different UI based on question type */}
          {questionData.questionTypeId === 3 ? (
            // True/False - Fixed options
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options (Fixed for True/False)
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 min-w-[30px]">A:</span>
                  <span className="text-gray-700">True</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 min-w-[30px]">B:</span>
                  <span className="text-gray-700">False</span>
                </div>
              </div>
            </div>
          ) : questionData.questionTypeId === 7 ? (
            // Numeric/Fill-in - No options needed
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Type: Numeric/Fill-in-the-Blank
              </label>
              <p className="text-sm text-gray-500">Enter the numeric answer below.</p>
            </div>
          ) : (
            // Type 1 and 2: Multiple choice options
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options *
                </label>
                {questionData.questionTypeId !== 3 && questionData.questionTypeId !== 7 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {questionData.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600 min-w-[30px]">
                      {ANSWER_LABELS[index] || String(index + 1)}:
                    </span>
                    <RichTextEditor
                      value={option}
                      onChange={(val) => handleOptionChange(index, val)}
                      placeholder={`Option ${ANSWER_LABELS[index] || String(index + 1)}`}
                    />
                    {questionData.questionTypeId !== 3 && questionData.questionTypeId !== 7 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                        disabled={questionData.options && questionData.options.length <= 2}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer - Different UI based on question type */}
          {questionData.questionTypeId === 3 ? (
            // True/False - Radio buttons
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="True"
                    checked={questionData.correctAnswer === "True"}
                    onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-700">True</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="False"
                    checked={questionData.correctAnswer === "False"}
                    onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-gray-700">False</span>
                </label>
              </div>
            </div>
          ) : questionData.questionTypeId === 7 ? (
            // Numeric/Fill-in - Text input with units
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer (Numeric) *
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(questionData.correctAnswer) ? questionData.correctAnswer[0] || "" : (questionData.correctAnswer as string) || ""}
                    onChange={(e) => handleInputChange("correctAnswer", [e.target.value])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Enter numeric answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units
                  </label>
                  <input
                    type="text"
                    value={questionData.units || ""}
                    onChange={(e) => handleInputChange("units", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="e.g., mL, mg, units"
                  />
                </div>
              </div>
            </div>
          ) : questionData.questionTypeId === 2 ? (
            // Multiple choice - Checkboxes
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer(s) * (Select all that apply)
              </label>
              <div className="space-y-2">
                {questionData.options?.map((option: string, index: number) => {
                  const optionLabel = ANSWER_LABELS[index];
                  const selectedAnswers = Array.isArray(questionData.correctAnswer)
                    ? questionData.correctAnswer
                    : [];
                  const isSelected = selectedAnswers.includes(optionLabel);
                  
                  return (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
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
                      <span className="text-sm font-semibold text-gray-600 min-w-[30px]">
                        {optionLabel}:
                      </span>
                      <span className="text-gray-700 flex-1 line-clamp-1">
                        {stripHtmlTags(option)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            // Type 1: Single choice - Dropdown
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <select
                value={Array.isArray(questionData.correctAnswer) ? "" : (questionData.correctAnswer as string) || ""}
                onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
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

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation
            </label>
            <RichTextEditor
              value={questionData.explanation || ""}
              onChange={(val) => handleInputChange("explanation", val)}
              placeholder="Enter the explanation for the correct answer..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={questionData.status || "published"}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}


