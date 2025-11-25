"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getNursingEntranceExamQuizQuestion,
  uploadNursingEntranceExamQuizQuestion,
  getAllQuestionTypes,
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
    quizId: string;
    questionId: string;
  }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
    questionId: string;
  } | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    
    // Strip HTML tags
    const cleanText = stripHtmlTags(questionText);
    
    // Take first 180 characters
    const truncated = cleanText.substring(0, 180);
    
    // Convert to URL-friendly slug
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

  // Load question types
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

      const result = await getNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        resolvedParams.questionId
      );

      if (result.success && result.data) {
        const data = result.data as QuestionData;
        const questionTypeId = data.questionTypeId || data.question_type_id || 1;
        
        // Parse options based on question type
        let optionsArray: string[] = [];
        if (data.options) {
          if (Array.isArray(data.options)) {
            optionsArray = data.options;
          } else if (typeof data.options === "string") {
            try {
              const parsed = JSON.parse(data.options);
              if (typeof parsed === "object" && !Array.isArray(parsed)) {
                // Convert object to array (for types 1, 2, 3)
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
              // If parsing fails, treat as single string
              optionsArray = [data.options];
            }
          }
        }
        
        // Handle default options based on question type
        if (questionTypeId === 3 && optionsArray.length === 0) {
          // True/False
          optionsArray = ["True", "False"];
        } else if (questionTypeId === 7 && optionsArray.length === 0) {
          // Numeric/Fill-in
          optionsArray = [""];
        } else if (optionsArray.length === 0) {
          // Default for single/multiple choice
          optionsArray = ["", "", "", ""];
        }
        
        // Parse correct answer based on question type
        let correctAnswer: string | string[] = "";
        if (data.correctAnswer) {
          if (questionTypeId === 7) {
            // Type 7: Numeric - should be an array
            if (Array.isArray(data.correctAnswer)) {
              correctAnswer = data.correctAnswer;
            } else if (typeof data.correctAnswer === "string") {
              try {
                // Try to parse if it's a JSON string
                const parsed = JSON.parse(data.correctAnswer);
                correctAnswer = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                // If not JSON, wrap in array
                correctAnswer = [data.correctAnswer];
              }
            } else {
              correctAnswer = [String(data.correctAnswer)];
            }
          } else if (questionTypeId === 2) {
            // Type 2: Multiple choice - should be JSON array string
            if (typeof data.correctAnswer === "string") {
              try {
                const parsed = JSON.parse(data.correctAnswer);
                correctAnswer = Array.isArray(parsed) ? parsed : [data.correctAnswer];
              } catch {
                correctAnswer = [data.correctAnswer];
              }
            } else if (Array.isArray(data.correctAnswer)) {
              correctAnswer = data.correctAnswer;
            } else {
              correctAnswer = [String(data.correctAnswer)];
            }
          } else {
            // Type 1 and 3: Single answer - string
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
          meta: data.meta || {
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
        newOptions = [""];
        newCorrectAnswer = "";
      } else {
        // Single/Multiple choice
        newOptions = questionData.options && Array.isArray(questionData.options) && questionData.options.length > 0
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

    const questionTypeId = questionData.questionTypeId || 1;
    let optionsToSave: string[] = [];
    let correctAnswerToSave: string | string[] = "";

    // Process options and correct answer based on question type
    if (questionTypeId === 3) {
      // True/False - options are fixed
      optionsToSave = ["True", "False"];
      if (!questionData.correctAnswer || (questionData.correctAnswer !== "True" && questionData.correctAnswer !== "False")) {
        setError("Please select True or False as the correct answer");
        return;
      }
      correctAnswerToSave = questionData.correctAnswer as string;
    } else if (questionTypeId === 7) {
      // Numeric/Fill-in - options is empty array, correct answer is numeric
      optionsToSave = [""];
      if (!questionData.correctAnswer || (Array.isArray(questionData.correctAnswer) && questionData.correctAnswer.length === 0)) {
        setError("Please enter a numeric answer");
        return;
      }
      // For type 7, correctAnswer should be an array
      correctAnswerToSave = Array.isArray(questionData.correctAnswer) 
        ? questionData.correctAnswer 
        : [questionData.correctAnswer as string];
    } else if (questionTypeId === 2) {
      // Multiple choice - correct answer is an array
      const validOptions = questionData.options?.filter((opt: string) => opt.trim()) || [];
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      optionsToSave = validOptions;
      if (!questionData.correctAnswer) {
        setError("Please select at least one correct answer");
        return;
      }
      // For type 2, correctAnswer should be an array (JSON string)
      if (Array.isArray(questionData.correctAnswer)) {
        correctAnswerToSave = JSON.stringify(questionData.correctAnswer);
      } else {
        // Try to parse if it's a JSON string
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
      // Type 1: Single choice
      const validOptions = questionData.options?.filter((opt: string) => opt.trim()) || [];
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

      // Generate slug if not present
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

      // Add units for type 7
      if (questionTypeId === 7 && questionData.units) {
        contentToSave.units = questionData.units;
      }

      const result = await uploadNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        resolvedParams.questionId,
        contentToSave
      );

      if (result.success) {
        setSuccess("Question saved successfully!");
        setTimeout(() => {
          router.push(
            `/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`
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
            href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`}
            className="text-indigo-600 hover:underline"
          >
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Question
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Question ID: {resolvedParams.questionId}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`}
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
                      {ANSWER_LABELS[index]}:
                    </span>
                    <RichTextEditor
                      value={option}
                      onChange={(val) => handleOptionChange(index, val)}
                      placeholder={`Option ${ANSWER_LABELS[index]}`}
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
                    : (() => {
                        try {
                          const parsed = JSON.parse(questionData.correctAnswer as string || "[]");
                          return Array.isArray(parsed) ? parsed : [];
                        } catch {
                          return [];
                        }
                      })();
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
                            : (() => {
                                try {
                                  const parsed = JSON.parse(questionData.correctAnswer as string || "[]");
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

