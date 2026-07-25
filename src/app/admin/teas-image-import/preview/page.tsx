"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminAlert,
  AdminCard,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  inlineImageReferencesForQuestion,
  type TeasBulkUploadPayload,
} from "@/lib/admin/teas-bulk-upload-schema";
import {
  normalizeTeasDisplayHtml,
  teasOptionTexts,
  teasQuestionTypeLabel,
} from "@/lib/admin/teas-question-display";

type PreviewState = {
  payload: TeasBulkUploadPayload;
  parserWarnings?: string[];
  schemaWarnings?: Array<{ path: string; message: string }>;
  source?: {
    inputPath?: string;
    ocrOutputPath?: string;
    openedAt?: string;
  };
};

type SavedScanRecord = {
  id: string;
  questionHtml?: string;
  questionContent?: { html?: string };
  question?: { html?: string } | string;
  sourceFileName?: string;
  sourceImageRequired?: boolean;
  needsReview?: boolean;
  exhibits?: Array<{
    id?: string;
    type?: string;
    imagePath?: string;
    requiresCrop?: boolean;
  }>;
  source?: {
    fileName?: string;
  };
};

function layoutText(scanLayout: unknown) {
  if (!scanLayout || typeof scanLayout !== "object") return "";
  const record = scanLayout as Record<string, unknown>;
  return `${String(record.fileName || "page")} ${String(record.width || "?")}x${String(record.height || "?")}`;
}

function scanReview(question: TeasBulkUploadPayload["questions"][number]) {
  const review = question.scanReview;
  if (!review || typeof review !== "object") {
    return {
      needsReview: false,
      warnings: [] as string[],
      layoutMode: "",
      selectedAnswerConfidenceRatio: 0,
      questionNumber: "",
      sourceImageRequired: false,
      exhibitCount: 0,
      imageExhibitCount: 0,
    };
  }
  const record = review as Record<string, unknown>;
  return {
    needsReview: Boolean(record.needsReview),
    warnings: Array.isArray(record.warnings)
      ? record.warnings.map((warning) => String(warning)).filter(Boolean)
      : [],
    layoutMode: String(record.layoutMode || ""),
    selectedAnswerConfidenceRatio: Number(record.selectedAnswerConfidenceRatio || 0),
    questionNumber: String(record.questionNumber || ""),
    sourceImageRequired: Boolean(record.sourceImageRequired),
    exhibitCount: Number(record.exhibitCount || 0),
    imageExhibitCount: Number(record.imageExhibitCount || 0),
  };
}

function sourceFileName(question: TeasBulkUploadPayload["questions"][number]) {
  const layout = question.scanLayout;
  if (!layout || typeof layout !== "object") return "";
  return String((layout as Record<string, unknown>).fileName || "");
}

function savedScanQuestionHtml(record: SavedScanRecord | null) {
  if (!record) return "";
  if (record.questionContent?.html) return record.questionContent.html;
  if (record.questionHtml) return record.questionHtml;
  if (typeof record.question === "object" && record.question?.html) return record.question.html;
  return typeof record.question === "string" ? record.question : "";
}

function savedScanSourceFileName(record: SavedScanRecord) {
  return record.sourceFileName || record.source?.fileName || "";
}

function questionHasSavedImage(question: TeasBulkUploadPayload["questions"][number], savedScan: SavedScanRecord | null) {
  const html = normalizeTeasDisplayHtml(savedScanQuestionHtml(savedScan) || question.question || "");
  if (/<img\b[^>]+\bsrc=(["'])\/teas-exhibits\//i.test(html)) return true;
  if (/<img\b/i.test(html)) return true;

  if (savedScan?.exhibits?.some((exhibit) => Boolean(String(exhibit.imagePath || "").trim()))) return true;

  const layout = question.scanLayout;
  const column =
    layout && typeof layout === "object"
      ? ((layout as Record<string, unknown>).questionColumn as Record<string, unknown> | undefined)
      : undefined;
  const exhibits = Array.isArray(column?.exhibits) ? column.exhibits : [];
  return exhibits.some((exhibit) => {
    if (!exhibit || typeof exhibit !== "object") return false;
    const record = exhibit as Record<string, unknown>;
    return Boolean(String(record.imagePath || "").trim());
  });
}

function displayQuestionHtml(question: TeasBulkUploadPayload["questions"][number], savedScan: SavedScanRecord | null) {
  return savedScanQuestionHtml(savedScan) || question.question || "No question text.";
}

function SourceScreenshotPreview({
  inputPath,
  fileName,
  currentUser,
}: {
  inputPath: string;
  fileName: string;
  currentUser: ReturnType<typeof useAuth>["currentUser"];
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    async function loadImage() {
      if (!currentUser || !inputPath || !fileName) return;
      try {
        setError("");
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ inputPath, fileName });
        const response = await fetch(`/api/admin/teas-image-import/source-image?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "Could not load source screenshot.");
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setImageUrl(objectUrl);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load source screenshot.");
      }
    }
    void loadImage();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentUser, fileName, inputPath]);

  if (!inputPath || !fileName) return null;

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Original Screenshot View</p>
      {error ? (
        <p className="text-xs text-red-700">{error}</p>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={`Source screenshot ${fileName}`}
          className="max-h-[560px] w-full rounded border border-gray-200 bg-white object-contain"
        />
      ) : (
        <p className="text-xs text-gray-500">Loading source screenshot...</p>
      )}
    </div>
  );
}

function TeasPreviewContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [savedScans, setSavedScans] = useState<SavedScanRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("teas-image-import-preview");
      if (!raw) {
        setError("No preview data found. Return to TEAS Image Import and click Open Preview again.");
        return;
      }
      setPreview(JSON.parse(raw) as PreviewState);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load preview data.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSavedScans() {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ filter: "all", sort: "extractionOrder", limit: "500" });
        const response = await fetch(`/api/admin/teas-image-import/scanned-questions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Could not load saved scan image references.");
        if (!cancelled) setSavedScans(Array.isArray(payload.records) ? payload.records : []);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load saved scan image references.");
      }
    }
    void loadSavedScans();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const questions = preview?.payload?.questions || [];
  const grouped = useMemo(() => {
    const groups = new Map<number, typeof questions>();
    questions.forEach((question) => {
      const typeId = Number(question.question_type_id || 1);
      groups.set(typeId, [...(groups.get(typeId) || []), question]);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [questions]);

  const layoutCount = questions.filter((question) => Boolean(question.scanLayout)).length;
  const questionReviewCount = questions.filter((question) => scanReview(question).needsReview).length;
  const inlineImageCount = questions.reduce(
    (total, question) => total + inlineImageReferencesForQuestion(question).length,
    0
  );
  const visualExhibitCount = questions.reduce(
    (total, question) => total + scanReview(question).imageExhibitCount,
    0
  );
  const warningCount =
    questionReviewCount + (preview?.parserWarnings?.length || 0) + (preview?.schemaWarnings?.length || 0);
  const savedScanByFileName = useMemo(() => {
    const map = new Map<string, SavedScanRecord>();
    savedScans.forEach((record) => {
      const fileName = savedScanSourceFileName(record);
      if (fileName) map.set(fileName.toLowerCase(), record);
    });
    return map;
  }, [savedScans]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "TEAS Image Import", href: "/admin/teas-image-import" },
            { label: "Preview" },
          ]}
          actions={currentUser ? <UserProfileBadge /> : null}
        />
        <main className="admin-page min-h-[calc(100vh-4rem)]">
          <AdminPageHeader
            eyebrow="ATI TEAS Preview"
            title="Scanned Questions Preview"
            description="Review generated questions grouped by question type before saving or promoting them."
          />

          {error && (
            <AdminAlert tone="error" title="Preview Error">
              {error}
            </AdminAlert>
          )}

          <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <AdminStatCard label="Questions" value={questions.length} helper="Generated questions in this preview." />
            <AdminStatCard label="Question Types" value={grouped.length} helper="Groups detected from question_type_id." />
            <AdminStatCard label="Layout Metadata" value={layoutCount} helper="Questions with OCR layout boxes." />
            <AdminStatCard label="Needs Review" value={questionReviewCount} helper="Questions with OCR parser concerns." />
            <AdminStatCard label="Inline Images" value={inlineImageCount} helper="Actual img tags in generated HTML." />
            <AdminStatCard label="Visual Exhibits" value={visualExhibitCount} helper="Gemini-detected charts, diagrams, or image exhibits." />
          </section>

          {preview?.source?.inputPath && (
            <AdminCard title="Source" className="mb-6">
              <p className="break-all font-mono text-xs text-gray-700">{preview.source.inputPath}</p>
            </AdminCard>
          )}

          {warningCount > 0 && (
            <AdminCard title="Review Flags" className="mb-6">
              <div className="grid gap-3 lg:grid-cols-2">
                {(preview?.parserWarnings || []).length > 0 && (
                  <div>
                    <p className="admin-field-label mb-2">Parser Warnings</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
                      {(preview?.parserWarnings || []).map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(preview?.schemaWarnings || []).length > 0 && (
                  <div>
                    <p className="admin-field-label mb-2">Schema Warnings</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
                      {(preview?.schemaWarnings || []).map((warning) => (
                        <li key={`${warning.path}-${warning.message}`}>
                          <span className="font-mono">{warning.path}</span>: {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AdminCard>
          )}

          <div className="space-y-6">
            {grouped.map(([typeId, typeQuestions]) => (
              <AdminCard
                key={typeId}
                title={`${teasQuestionTypeLabel(typeId)} - Type ${typeId}`}
                description={`${typeQuestions.length} question${typeQuestions.length === 1 ? "" : "s"}`}
              >
                <div className="space-y-4">
                  {typeQuestions.map((question, questionIndex) => {
                    const options = teasOptionTexts(question.options);
                    const inlineImages = inlineImageReferencesForQuestion(question);
                    const review = scanReview(question);
                    const fileName = sourceFileName(question);
                    const savedScan = fileName ? savedScanByFileName.get(fileName.toLowerCase()) || null : null;
                    const hasSavedImage = questionHasSavedImage(question, savedScan);
                    const sourceImageRequired = savedScan ? Boolean(savedScan.sourceImageRequired) : review.sourceImageRequired;
                    return (
                      <article
                        key={`${question.id || typeId}-${questionIndex}`}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-950">
                            Question {review.questionNumber || questionIndex + 1}
                          </span>
                          <AdminStatusBadge label={teasQuestionTypeLabel(typeId)} tone="blue" />
                          {Boolean(question.scanLayout) && <AdminStatusBadge label="Layout Saved" tone="purple" />}
                          {review.needsReview ? (
                            <AdminStatusBadge label="Needs Review" tone="amber" />
                          ) : (
                            <AdminStatusBadge label="Auto Parsed" tone="green" />
                          )}
                          {inlineImages.length > 0 && (
                            <AdminStatusBadge label={`${inlineImages.length} inline image${inlineImages.length === 1 ? "" : "s"}`} tone="purple" />
                          )}
                          {review.imageExhibitCount > 0 && (
                            <AdminStatusBadge
                              label={`${review.imageExhibitCount} visual exhibit${review.imageExhibitCount === 1 ? "" : "s"}`}
                              tone="purple"
                            />
                          )}
                          {sourceImageRequired && !hasSavedImage && (
                            <AdminStatusBadge label="Source Image Required" tone="amber" />
                          )}
                          {hasSavedImage && (
                            <AdminStatusBadge label="Uploaded Image" tone="green" />
                          )}
                          {review.exhibitCount > review.imageExhibitCount && (
                            <AdminStatusBadge
                              label={`${review.exhibitCount - review.imageExhibitCount} table/text exhibit${review.exhibitCount - review.imageExhibitCount === 1 ? "" : "s"}`}
                              tone="blue"
                            />
                          )}
                        </div>
                        {review.warnings.length > 0 && (
                          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            <p className="mb-1 font-semibold">Check this OCR parse before using it.</p>
                            <ul className="list-disc space-y-1 pl-4">
                              {review.warnings.map((warning) => (
                                <li key={warning}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div
                          className="admin-body text-sm font-medium leading-6 text-gray-900"
                          dangerouslySetInnerHTML={{
                            __html: normalizeTeasDisplayHtml(displayQuestionHtml(question, savedScan)),
                          }}
                        />
                        {sourceImageRequired && !hasSavedImage && preview?.source?.inputPath && (
                          <SourceScreenshotPreview
                            inputPath={preview.source.inputPath}
                            fileName={fileName}
                            currentUser={currentUser}
                          />
                        )}
                        {options.length > 0 && (
                          <ol className="mt-3 space-y-2 text-sm text-gray-800">
                            {options.map((option, optionIndex) => (
                              <li key={`${option}-${optionIndex}`} className="border border-gray-200 bg-gray-50 px-3 py-2">
                                <span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                                <span dangerouslySetInnerHTML={{ __html: option }} />
                              </li>
                            ))}
                          </ol>
                        )}
                        <div className="mt-3 grid gap-2 border-t border-gray-200 pt-3 text-xs text-gray-600 sm:grid-cols-2">
                          <p>Correct answer: {JSON.stringify(question.correctAnswer) ?? "null"}</p>
                          {Boolean(question.scanLayout) && <p className="break-all">Layout: {layoutText(question.scanLayout)}</p>}
                          {review.layoutMode && <p>OCR layout mode: {review.layoutMode}</p>}
                          {review.selectedAnswerConfidenceRatio > 0 && (
                            <p>Answer marker confidence: {review.selectedAnswerConfidenceRatio.toFixed(2)}x</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </AdminCard>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeasPreviewPage() {
  return (
    <SidebarProvider>
      <TeasPreviewContent />
    </SidebarProvider>
  );
}
