"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  bulkUploadNursingEntranceExamQuizQuestions,
  getNursingEntranceExamQuiz,
} from "@/lib/firestore-operations";
import Link from "next/link";
import {
  AdminCard,
  AdminLoadingState,
  AdminModal,
  AdminModalFooter,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();
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
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);

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
        setError(
          "Invalid JSON format. Expected an object with a 'questions' array."
        );
        setParsedQuestions([]);
        return;
      }

      setParsedQuestions(parsed.questions);
      setSuccess(`Successfully parsed ${parsed.questions.length} questions!`);
      setPreviewExpanded(true);
      setCurrentPage(1);
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

    if (!file.name.toLowerCase().endsWith(".json")) {
      setError("Please upload a .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        setJsonInput(fileContent);
        handleJsonParse(fileContent);
      } catch (err) {
        setError(
          `Error reading file: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
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

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      setShowUploadConfirm(false);

      const result = await bulkUploadNursingEntranceExamQuizQuestions(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        parsedQuestions
      );

      if (result.success) {
        let catalogRepairMessage = "";
        try {
          const token = await currentUser?.getIdToken();
          if (!token) throw new Error("Admin session is not available.");

          const repairResponse = await fetch("/api/admin/entrance-exam/catalog-repair", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              subPageId: resolvedParams.subPageId,
              nestedSubPageId: resolvedParams.nestedSubPageId,
              quizId: resolvedParams.quizId,
            }),
          });
          const repairResult = await repairResponse.json();
          if (!repairResponse.ok) {
            throw new Error(repairResult?.error || "Catalog repair failed.");
          }
          catalogRepairMessage = ` My Exams catalog updated with ${repairResult.questionCount ?? parsedQuestions.length} questions.`;
        } catch (repairError) {
          catalogRepairMessage = ` Questions uploaded, but My Exams catalog was not updated: ${
            repairError instanceof Error ? repairError.message : "Unknown error"
          }`;
        }

        setSuccess(`${result.message || "Questions uploaded successfully!"}${catalogRepairMessage}`);
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

  const formatOptionValue = (option: any): string => {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return String(option);
    if (Array.isArray(option)) return option.map(formatOptionValue).filter(Boolean).join(" ");

    const optionText =
      option.choice ??
      option.text ??
      option.label ??
      option.answer ??
      option.value ??
      option.option ??
      option.content ??
      option.html ??
      option.body ??
      option.title;

    if (optionText !== undefined && optionText !== null) {
      return formatOptionValue(optionText);
    }

    return Object.values(option).map(formatOptionValue).filter(Boolean).join(" ");
  };

  const parseOptions = (options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options.map(formatOptionValue);
    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed.map(formatOptionValue);
        }
        if (typeof parsed === "object" && parsed !== null) {
          return Object.keys(parsed)
            .sort()
            .map((key) => {
              const option = parsed[key];
              return formatOptionValue(option);
            });
        }
      } catch {
        return [];
      }
    }
    if (typeof options === "object") {
      return Object.keys(options)
        .sort()
        .map((key) => formatOptionValue(options[key]));
    }
    return [];
  };

  const getQuestionAnswer = (question: ParsedQuestion) =>
    question.correctAnswer || (question as any).correct_answer || "";

  const isQuestionReady = (question: ParsedQuestion) => {
    const questionTypeId =
      question.question_type_id || (question as any).questionTypeId || 1;
    const hasQuestion = Boolean(String(question.question || "").trim());
    const hasAnswer = Boolean(String(getQuestionAnswer(question) || "").trim());
    const hasOptions = questionTypeId === 7 || parseOptions(question.options).length >= 2;
    return hasQuestion && hasAnswer && hasOptions;
  };

  const loadingQuizManagerHref = resolvedParams
    ? `/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`
    : "/admin/nursing-entrance-exam";

  function LoadingShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

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
              { label: "Admin", href: "/admin" },
              { label: "Content", href: "/admin" },
              { label: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam" },
              { label: "Quiz Manager", href: loadingQuizManagerHref },
              { label: "Bulk Upload" },
            ]}
            actions={currentUser ? <UserProfileBadge /> : null}
          />
          <div className="admin-page flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (loading || !resolvedParams) {
    return (
      <SidebarProvider>
        <LoadingShell>
          <AdminLoadingState title="Loading bulk upload" description="Preparing quiz details and upload workspace." />
        </LoadingShell>
      </SidebarProvider>
    );
  }

  const readyCount = parsedQuestions.filter(isQuestionReady).length;
  const needsReviewCount = Math.max(0, parsedQuestions.length - readyCount);
  const parsedCount = parsedQuestions.length;
  const validationProgress = parsedQuestions.length
    ? Math.round((readyCount / parsedQuestions.length) * 100)
    : 0;
  const quizManagerHref = `/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`;

  function LayoutShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

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
              { label: "Admin", href: "/admin" },
              { label: "Content", href: "/admin" },
              { label: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam" },
              {
                label: "Quiz Manager",
                href: quizManagerHref,
              },
              { label: "Bulk Upload" },
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
          <div className="admin-page min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <LayoutShell>
        <main className="admin-workspace">
          <div className="admin-content">
            <AdminPageHeader
              eyebrow="Nursing Entrance Exam"
              title="Bulk Upload Questions"
              description={
                <>
                  Import questions for <strong>{quizName || resolvedParams.quizId}</strong>.
                  Parsed questions are validated and previewed before they are written to Firestore.
                </>
              }
              actions={
                <>
                  <Link href={quizManagerHref} className="admin-button-secondary">
                    Back To Quiz Manager
                  </Link>
                  <Link
                    href={`/${resolvedParams.quizId}`}
                    target="_blank"
                    className="admin-button-secondary"
                  >
                    View Page
                  </Link>
                </>
              }
            />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
            <AdminCard
              title="Upload JSON File"
              description="Upload or paste a JSON object with a questions array. The parser validates each row before import."
            >
              <div className="grid grid-cols-1 gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="admin-info-tile relative border-dashed p-5 text-center transition hover:border-purple-300">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg border border-purple-100 bg-white shadow-sm">
                      <span className="text-lg font-semibold text-purple-700">
                        {"{ }"}
                      </span>
                    </div>
                    <div className="admin-card-title">
                      Drop your JSON here
                    </div>
                    <div className="admin-helper mt-1">
                      or choose a .json file from your computer
                    </div>
                    <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-2">
                      <span className="admin-button-secondary min-h-0 px-3 py-1 text-xs">
                        Choose JSON File
                      </span>
                    </div>
                    <p className="admin-helper mt-3">
                      Expected: <code className="font-mono">{"{ questions: [...] }"}</code>{" "}
                      with question, options, and correctAnswer fields.
                    </p>
                  </div>
                </label>

                <div className="space-y-2">
                  <label className="admin-field-label">
                    Paste JSON Data
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='Paste your JSON data here. Expected format: { "questions": [...] }'
                    className="admin-field h-48 font-mono"
                  />
                </div>

                <button
                  onClick={() => handleJsonParse()}
                  disabled={!jsonInput.trim()}
                  className="admin-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Parse & Preview Questions
                </button>
              </div>
            </AdminCard>

            <AdminCard
              title="Import Summary"
              description="Review validation status and destination before saving."
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="admin-info-tile p-3 space-y-1">
                    <div className="admin-info-tile-label">
                      Objects Parsed
                    </div>
                    <div className="admin-section-title">
                      {parsedCount || 0}
                      <span className="admin-helper ml-2">
                        From JSON input
                      </span>
                    </div>
                  </div>
                  <div className="admin-info-tile p-3 space-y-1">
                    <div className="admin-info-tile-label">
                      Ready To Import
                    </div>
                    <div className="admin-section-title">
                      {readyCount || 0}
                      <span className="admin-helper ml-2">
                        {needsReviewCount} need review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-info-tile p-3 space-y-2">
                  <div className="admin-info-tile-label">
                    Validation Progress
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${validationProgress}%` }}
                    />
                  </div>
                  <div className="admin-helper flex justify-between">
                    <span>Question text, answer, and options.</span>
                    <span className="font-semibold">
                      {validationProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>

          {parsedQuestions.length > 0 && (
            <AdminCard
              title={`Preview (${parsedQuestions.length} Questions)`}
              description="Review parsed content before importing."
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                  className="admin-button-secondary px-3 py-2 text-xs"
                >
                  {previewExpanded ? "Collapse" : "Expand"}
                </button>
              </div>

              {previewExpanded && (
                <>
                  <div className="admin-helper flex flex-wrap items-center justify-between">
                    <span>
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
                      of {parsedQuestions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="admin-pagination-button"
                      >
                        Previous
                      </button>
                      <span className="admin-helper">
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
                        className="admin-pagination-button"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[520px] overflow-y-auto">
                    {parsedQuestions
                      .slice(
                        (currentPage - 1) * questionsPerPage,
                        currentPage * questionsPerPage
                      )
                      .map((q, index) => {
                        const globalIndex =
                          (currentPage - 1) * questionsPerPage + index;
                        const options = parseOptions(q.options);
                        const correct = q.correctAnswer || (q as any).correct_answer;
                        return (
                          <div
                            key={q.id || globalIndex}
                            className="admin-info-tile bg-white p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="admin-field-label">
                                Question #{globalIndex + 1} (ID: {q.id})
                              </span>
                              <AdminStatusBadge
                                label={`Type ${q.question_type_id || 1}`}
                                tone="purple"
                              />
                            </div>
                            <div
                              className="admin-body mb-3"
                              dangerouslySetInnerHTML={{
                                __html: q.question || "No question text",
                              }}
                            />
                            {options.length > 0 && (
                              <div className="mb-3">
                                <p className="admin-card-title mb-2">
                                  Options
                                </p>
                                <ul className="space-y-1">
                                  {options.map((opt, optIndex) => {
                                    const label = String.fromCharCode(65 + optIndex);
                                    const isCorrect = label === correct;
                                    return (
                                      <li
                                        key={optIndex}
                                        className={`text-sm ${
                                          isCorrect
                                            ? "text-emerald-700 font-semibold"
                                            : "admin-body-sm"
                                        }`}
                                      >
                                        <span className="font-semibold">{label}:</span>{" "}
                                        <span
                                          dangerouslySetInnerHTML={{ __html: opt }}
                                        />
                                        {isCorrect && (
                                          <span className="ml-2 font-semibold text-emerald-700">
                                            Correct
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                            {q.solution && (
                              <div className="mt-3 border-t border-[#e3e5f0] pt-3">
                                <p className="admin-card-title mb-1">
                                  Solution
                                </p>
                                <div
                                  className="admin-body-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: (q.solution || "").substring(0, 240) + "...",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e5f0] pt-3">
                <div className="admin-helper">
                  Imports run in the background. You can keep editing while this completes.
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedQuestions([]);
                      setJsonInput("");
                      setSuccess("");
                      setError("");
                    }}
                    className="admin-button-danger px-3 py-2 text-xs"
                  >
                    Clear This Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadConfirm(true)}
                    disabled={uploading || parsedQuestions.length === 0}
                    className="admin-button-primary px-4 py-2 text-xs disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : `Confirm & Import ${parsedQuestions.length || 0} Questions`}
                  </button>
                </div>
              </div>
            </AdminCard>
          )}

          <AdminNotificationRegion
            error={error}
            success={success}
            errorTitle="Unable To Import Questions"
            successTitle="Questions Ready"
          />
          {showUploadConfirm && (
            <AdminModal
              title="Confirm Question Import"
              description={`Import ${parsedQuestions.length} parsed questions into this quiz.`}
              maxWidthClassName="max-w-[460px]"
            >
              <p className="admin-body">
                This will create question records under{" "}
                <strong>{quizName || resolvedParams.quizId}</strong>. Review the
                parsed preview before confirming.
              </p>
              <AdminModalFooter>
                <button
                  type="button"
                  onClick={() => setShowUploadConfirm(false)}
                  disabled={uploading}
                  className="admin-button-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={uploading || parsedQuestions.length === 0}
                  className="admin-button-primary"
                >
                  {uploading ? "Uploading..." : "Import Questions"}
                </button>
              </AdminModalFooter>
            </AdminModal>
          )}
        </div>
        </main>
      </LayoutShell>
    </SidebarProvider>
  );
}



