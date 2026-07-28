"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  bulkUploadNursingTestBankQuizQuestions,
  getNursingTestBankQuiz,
} from "@/lib/firestore-operations";
import Link from "next/link";
import {
  AdminLoadingShell,
  AdminModal,
  AdminModalFooter,
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
  const [jsonInput, setJsonInput] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
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

  const requestBulkUpload = () => {
    if (parsedQuestions.length === 0) {
      setError("No questions to upload. Please parse JSON first.");
      return;
    }

    if (!resolvedParams) return;

    setShowUploadConfirm(true);
  };

  const handleBulkUpload = async () => {
    if (parsedQuestions.length === 0) {
      setError("No questions to upload. Please parse JSON first.");
      return;
    }

    if (!resolvedParams) return;

    try {
      setUploading(true);
      setShowUploadConfirm(false);
      setError("");
      setSuccess("");

      const result = await bulkUploadNursingTestBankQuizQuestions(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.topicId,
        resolvedParams.quizId,
        parsedQuestions
      );

      if (result.success) {
        setSuccess(result.message || "Questions uploaded successfully!");
        setTimeout(() => {
          router.push(
            `/admin/nursing-test-bank/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/topics/${resolvedParams.topicId}/quizzes/${resolvedParams.quizId}/manage`
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
      <AdminLoadingShell title="Loading bulk upload" description="Preparing quiz details and upload workspace." />
    );
  }

  const sampleRows = parsedQuestions.slice(0, 3);
  const readyCount = parsedQuestions.length;
  const needsReviewCount = Math.max(0, parsedQuestions.length - 50);
  const parsedCount = parsedQuestions.length;
  const validationProgress = parsedQuestions.length ? 64 : 0;

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
                  Bulk Upload Questions (JSON)
                </h1>
              </div>
              <div className="admin-body flex flex-wrap items-center gap-3">
                <span>
                  Import questions for{" "}
                  <strong>{quizName || resolvedParams.quizId}</strong>. We’ll
                  validate and preview before sending them to Firestore.
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Draft upload
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
              <Link
                href={`/${resolvedParams.quizId}`}
                target="_blank"
                className="admin-button-secondary"
              >
                View Page
              </Link>
              <button
                type="button"
                onClick={requestBulkUpload}
                disabled={uploading || parsedQuestions.length === 0}
                className="admin-button-primary disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : `Save & Upload${parsedQuestions.length ? ` (${parsedQuestions.length})` : ""}`}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
            <section className="admin-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="admin-eyebrow mb-1 inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Upload JSON File
                  </div>
                  <p className="admin-body">
                    Drop a JSON array of questions. We parse, validate, and show
                    a preview before importing.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-button-secondary px-3 py-2 text-xs"
                  onClick={() =>
                    setJsonInput(
                      `{"questions":[{"id":1,"question":"Sample question?","options":["A","B","C","D"],"correctAnswer":"A","solution":"Example solution","question_type_id":1}]}`
                    )
                  }
                >
                  View JSON Schema
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="admin-info-tile relative border-dashed p-5 text-center transition hover:border-[#6a5cff]">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-indigo-100 shadow">
                      <span className="text-lg font-semibold text-indigo-600">
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
                      <span className="rounded-full bg-indigo-600 text-white px-3 py-1 text-xs font-semibold">
                        Choose JSON File
                      </span>
                      <span className="admin-status-badge admin-status-badge-gray">
                        Preview Example Payload
                      </span>
                    </div>
                    <p className="admin-helper mt-3">
                      Expected: <code className="font-mono">{"{ questions: [...] }"}</code>{" "}
                      up to ~5,000 items.
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
                  className="w-full rounded-full bg-indigo-600 text-white px-4 py-3 text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Parse & Preview Questions
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                  {[
                    ["Question Key", "question"],
                    ["Options Key", "options"],
                    ["Correct Answer Key", "correctAnswer"],
                    ["Skill / Tag Key", "skill"],
                    ["Difficulty Key", "difficulty"],
                    ["Solution Key", "solution"],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-1">
                      <div className="admin-info-tile-label">
                        {label}
                      </div>
                      <div className="relative">
                        <select className="admin-field">
                          <option>{value}</option>
                          <option>choices</option>
                          <option>answerKey</option>
                          <option>explanation</option>
                        </select>
                        <span className="admin-helper absolute right-3 top-1/2 -translate-y-1/2">
                          ▾
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {sampleRows.length > 0 && (
                  <div className="admin-table-wrap overflow-hidden">
                    <div className="admin-info-tile-label flex items-center justify-between px-3 py-2">
                      <span>Sample Questions From JSON</span>
                      <span className="text-[11px] normal-case">
                        Showing {sampleRows.length} of {parsedQuestions.length} parsed items
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="admin-table">
                        <thead >
                          <tr >
                            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-[0.08em]">
                              #
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-[0.08em]">
                              Question
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-[0.08em]">
                              Skill
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-[0.08em]">
                              Difficulty
                            </th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase tracking-[0.08em]">
                              Correct
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleRows.map((row, idx) => (
                            <tr
                              key={row.id || idx}
                              
                            >
                              <td className="px-3 py-2">
                                {idx + 1}
                              </td>
                              <td className="max-w-xs truncate px-3 py-2">
                                {row.question || "—"}
                              </td>
                              <td className="px-3 py-2">
                                <span className="admin-status-badge admin-status-badge-gray">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {(row as any).skill || (row as any).tag || "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs">
                                {(row as any).difficulty || "—"}
                              </td>
                              <td className="px-3 py-2 text-xs font-semibold">
                                {row.correctAnswer || (row as any).correct_answer || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="admin-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="admin-eyebrow mb-1 inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Import Summary
                  </div>
                  <p className="admin-body">
                    Review validation and where these questions will be placed.
                  </p>
                </div>
              </div>

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
                    <div className="admin-helper">
                      We’ll skip duplicates already linked in your DB.
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
                    <div className="admin-helper">
                      Only valid objects will be written to your question bank.
                    </div>
                  </div>
                </div>

                <div className="admin-info-tile p-3 space-y-2">
                  <div className="admin-info-tile-label">
                    Validation Progress
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-[#e3e5f0] bg-[#edf0f7]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
                      style={{ width: `${validationProgress}%` }}
                    />
                  </div>
                  <div className="admin-helper flex justify-between">
                    <span>Checking JSON shape, keys, and options…</span>
                    <span className="font-semibold">
                      {validationProgress}%
                    </span>
                  </div>
                </div>

                <div className="admin-info-tile p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs">
                      ✓
                    </span>
                    <span>
                      Valid JSON array detected with a <strong>questions</strong> field.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs">
                      ✓
                    </span>
                    <span>
                      Required keys mapped: <strong>question</strong>,{" "}
                      <strong>options</strong>, <strong>correctAnswer</strong>,
                      <strong> skill</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 itemscenter justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs">
                      !
                    </span>
                    <span>
                      Missing solutions are allowed but will skip explanations in review
                      mode.
                    </span>
                  </div>
                </div>

                <div className="admin-info-tile p-3 space-y-1">
                  <div className="admin-info-tile-label">
                    Placement
                  </div>
                  <div className="admin-card-title">
                    {quizName || resolvedParams.quizId}
                  </div>
                  <div className="admin-helper">
                    Sub-page: {resolvedParams.subPageId} · Nested:{" "}
                    {resolvedParams.nestedSubPageId} · Topic: {resolvedParams.topicId}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {parsedQuestions.length > 0 && (
            <section className="admin-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="admin-card-title">
                    Preview ({parsedQuestions.length} questions)
                  </div>
                  <div className="admin-helper">
                    Scroll to review parsed content before importing.
                  </div>
                </div>
                <button
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
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
                      –{" "}
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
                        «
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
                        »
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
                              <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full">
                                Type: {q.question_type_id || 1}
                              </span>
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
                                          <span className="ml-2 text-emerald-600">
                                            ✓ Correct
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
                    onClick={() => handleJsonParse()}
                    className="admin-button-secondary px-3 py-2 text-xs"
                  >
                    Run Validation Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedQuestions([]);
                      setJsonInput("");
                      setSuccess("");
                      setError("");
                    }}
                    className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    Clear This Upload
                  </button>
                  <button
                    type="button"
                    onClick={requestBulkUpload}
                    disabled={uploading || parsedQuestions.length === 0}
                    className="rounded-full bg-indigo-600 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : `Confirm & Import ${parsedQuestions.length || 0} Questions`}
                  </button>
                </div>
              </div>
            </section>
          )}

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
          {showUploadConfirm && (
            <AdminModal
              title="Import Questions"
              description="Confirm this import after reviewing the parsed question preview."
              maxWidthClassName="max-w-[460px]"
            >
              <div className="space-y-4">
                <p className="admin-body-sm">
                  This will import {parsedQuestions.length} question
                  {parsedQuestions.length === 1 ? "" : "s"} into{" "}
                  <strong>{quizName || resolvedParams?.quizId}</strong>.
                </p>
                <AdminModalFooter>
                  <button
                    type="button"
                    onClick={() => {
                      if (!uploading) setShowUploadConfirm(false);
                    }}
                    disabled={uploading}
                    className="admin-button-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    disabled={uploading}
                    className="admin-button-primary disabled:opacity-50"
                  >
                    {uploading ? "Importing..." : "Import Questions"}
                  </button>
                </AdminModalFooter>
              </div>
            </AdminModal>
          )}
        </div>
      </LayoutShell>
    </SidebarProvider>
  );
}






