"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  bulkUploadNursingEntranceExamQuizQuestions,
  getNursingEntranceExamQuiz,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface ParsedQuestion {
  id: number | string;
  question: string;
  options: any;
  correctAnswer: string;
  solution: string;
  question_type_id: number;
  [key: string]: any;
}

export default function BulkUploadQuestions({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  } | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadQuizInfo = async () => {
      if (!resolvedParams) return;

      try {
        setLoading(true);
        const quizResult = await getNursingEntranceExamQuiz(
          resolvedParams.subPageId,
          resolvedParams.nestedSubPageId,
          resolvedParams.quizId
        );
        if (quizResult.success && quizResult.data) {
          const quizData = quizResult.data as any;
          setQuizName(quizData.pageName || resolvedParams.quizId);
        }
      } catch (err) {
        console.error("Error loading quiz info:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizInfo();
  }, [resolvedParams]);

  const handleJsonParse = (jsonString?: string) => {
    try {
      setError("");
      setSuccess("");
      const jsonToParse = jsonString || jsonInput;
      const parsed = JSON.parse(jsonToParse);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        setError("Invalid JSON format. Expected an object with a 'questions' array.");
        setParsedQuestions([]);
        return;
      }

      setParsedQuestions(parsed.questions);
      setSuccess(`Successfully parsed ${parsed.questions.length} questions!`);
      setPreviewExpanded(true);
      setCurrentPage(1); // Reset to first page when new questions are parsed
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        `Invalid JSON: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setParsedQuestions([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError("Please upload a .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        setJsonInput(fileContent); // Update textarea with file content
        handleJsonParse(fileContent);
      } catch (err) {
        setError(
          `Error reading file: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    };

    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };

    reader.readAsText(file);
  };


  const handleBulkUpload = async () => {
    if (parsedQuestions.length === 0) {
      setError("No questions to upload. Please parse JSON first.");
      return;
    }

    if (!resolvedParams) return;

    if (
      !confirm(
        `Are you sure you want to upload ${parsedQuestions.length} questions?`
      )
    ) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const result = await bulkUploadNursingEntranceExamQuizQuestions(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        parsedQuestions
      );

      if (result.success) {
        setSuccess(result.message || "Questions uploaded successfully!");
        setTimeout(() => {
          router.push(
            `/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`
          );
        }, 2000);
      } else {
        setError(result.message || "Failed to upload questions");
        if (result.data) {
          console.log("Upload results:", result.data);
        }
      }
    } catch (err) {
      setError("Failed to upload questions");
      console.error("Error uploading questions:", err);
    } finally {
      setUploading(false);
    }
  };

  const parseOptions = (options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);
        if (typeof parsed === "object") {
          return Object.keys(parsed)
            .sort()
            .map((key) => {
              const option = parsed[key];
              return option.choice || option || "";
            });
        }
      } catch {
        return [];
      }
    }
    return [];
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
                Bulk Upload Questions
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Upload multiple questions for: {quizName || resolvedParams.quizId}
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

        {/* Upload Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upload JSON Data
          </h2>

          <div className="space-y-6">
            {/* File Upload Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload JSON File
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-indigo-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JSON file only (.json)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* JSON Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste JSON Data
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste your JSON data here. Expected format: { "questions": [...] }'
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <button
              onClick={() => handleJsonParse()}
              disabled={!jsonInput.trim()}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Parse & Preview Questions
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {parsedQuestions.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Preview ({parsedQuestions.length} questions)
              </h2>
              <button
                onClick={() => setPreviewExpanded(!previewExpanded)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {previewExpanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {previewExpanded && (
              <>
                {/* Pagination Info */}
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * questionsPerPage + 1,
                      parsedQuestions.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * questionsPerPage,
                      parsedQuestions.length
                    )}{" "}
                    of {parsedQuestions.length} questions
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of{" "}
                      {Math.ceil(parsedQuestions.length / questionsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(parsedQuestions.length / questionsPerPage),
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(parsedQuestions.length / questionsPerPage)
                      }
                      className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                  {parsedQuestions
                    .slice(
                      (currentPage - 1) * questionsPerPage,
                      currentPage * questionsPerPage
                    )
                    .map((q, index) => {
                      const globalIndex =
                        (currentPage - 1) * questionsPerPage + index;
                      const options = parseOptions(q.options);
                      return (
                        <div
                          key={q.id || globalIndex}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Question #{globalIndex + 1} (ID: {q.id})
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Type: {q.question_type_id || 1}
                            </span>
                          </div>
                          <div
                            className="text-gray-900 mb-3"
                            dangerouslySetInnerHTML={{
                              __html: q.question || "No question text",
                            }}
                          />
                          {options.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Options:
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {options.map((opt, optIndex) => (
                                  <li
                                    key={optIndex}
                                    className={`text-sm ${
                                      String.fromCharCode(65 + optIndex) ===
                                      (q.correctAnswer || q.correct_answer)
                                        ? "text-green-700 font-semibold"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + optIndex)}:
                                    </span>{" "}
                                    <span
                                      dangerouslySetInnerHTML={{ __html: opt }}
                                    />
                                    {String.fromCharCode(65 + optIndex) ===
                                      (q.correctAnswer || q.correct_answer) && (
                                      <span className="ml-2 text-green-600">
                                        ✓ Correct
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {q.solution && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Solution:
                              </p>
                              <div
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{
                                  __html: q.solution.substring(0, 200) + "...",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Pagination Controls at Bottom */}
                {parsedQuestions.length > questionsPerPage && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="First"
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
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-600 px-3">
                        Page {currentPage} of{" "}
                        {Math.ceil(parsedQuestions.length / questionsPerPage)}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              Math.ceil(parsedQuestions.length / questionsPerPage),
                              prev + 1
                            )
                          )
                        }
                        disabled={
                          currentPage >=
                          Math.ceil(parsedQuestions.length / questionsPerPage)
                        }
                        className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next"
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.ceil(parsedQuestions.length / questionsPerPage)
                          )
                        }
                        disabled={
                          currentPage >=
                          Math.ceil(parsedQuestions.length / questionsPerPage)
                        }
                        className="p-2 text-gray-900 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Last"
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
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleBulkUpload}
                disabled={uploading || parsedQuestions.length === 0}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Upload {parsedQuestions.length} Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

