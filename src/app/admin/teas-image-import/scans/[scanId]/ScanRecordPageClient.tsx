"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AdminAlert,
  AdminCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeTeasDisplayHtml, teasQuestionTypeLabel } from "@/lib/admin/teas-question-display";
import RichTextEditor from "@/components/ui/RichTextEditor";

type OptionRow = {
  label: string;
  choice: string;
};

type SavedScanRecord = {
  id: string;
  question?: ContentBlock | string;
  questionContent?: ContentBlock;
  passage?: ContentBlock | null;
  exhibits?: Array<ScanExhibit>;
  combinedHtml?: string;
  passageHtml?: string;
  questionHtml?: string;
  hasPassage?: boolean;
  questionTypeId?: number;
  atiFormat?: string | null;
  options?: Record<string, { choice?: string } | string>;
  correctAnswer?: unknown;
  status?: string;
  needsReview?: boolean;
  validationErrorCount?: number;
  issueCount?: number;
  warningCount?: number;
  questionNumber?: string;
  questionProgress?: string;
  examTitle?: string;
  subject?: string;
  set?: {
    name?: string;
    slug?: string;
    subject?: string;
  };
  setName?: string;
  setSlug?: string;
  questionParts?: {
    metadata?: {
      questionNumber?: string;
      questionProgress?: string;
      examTitle?: string;
      subject?: string;
    };
    exhibits?: Array<ScanExhibit>;
    passageHtml?: string;
    questionHtml?: string;
    bodyHtml?: string;
  };
  sourceFileName?: string;
  sourceImageRequired?: boolean;
  exhibitCount?: number;
  review?: {
    warnings?: string[];
  };
  source?: {
    inputPath?: string;
    outputPath?: string;
    ocrJobId?: string | null;
  };
  manualReviewNotes?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ContentBlock = {
  title?: string;
  html?: string;
  text?: string;
};

type ScanExhibit = {
  id?: string;
  type?: string;
  title?: string;
  placement?: string;
  inline?: boolean;
  requiresCrop?: boolean;
  alt?: string;
  imagePath?: string;
  description?: string;
};

type SavedScanNavigation = {
  currentIndex: number | null;
  total: number;
  nextRecordId: string | null;
};

const SUBJECTS = ["Reading", "Mathematics", "Science", "English and Language Usage"];

const QUESTION_TYPES = [
  { id: 1, format: "multiple_choice", label: "Multiple Choice" },
  { id: 2, format: "multiple_select", label: "Multiple Select" },
  { id: 7, format: "fill_in_blank", label: "Fill In The Blank" },
  { id: 9, format: "hot_spot", label: "Hot Spot" },
  { id: 6, format: "ordered_response", label: "Ordered Response" },
];

function scanTitle(record: SavedScanRecord | null, fallbackId: string) {
  if (!record) return fallbackId;
  return record.questionNumber || record.sourceFileName || record.id.slice(0, 8);
}

function optionRowsFromOptions(options: SavedScanRecord["options"]): OptionRow[] {
  if (!options || typeof options !== "object") return [];
  return Object.entries(options).map(([label, option]) => ({
    label,
    choice: typeof option === "string" ? option : String(option?.choice || ""),
  }));
}

function optionsFromRows(rows: OptionRow[]) {
  return rows.reduce<Record<string, { choice: string }>>((output, row) => {
    const label = row.label.trim();
    if (!label) return output;
    output[label] = { choice: row.choice.trim() };
    return output;
  }, {});
}

function correctAnswerForEditor(value: unknown) {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? "");
}

function parseCorrectAnswer(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed.includes(",")
      ? trimmed.split(",").map((item) => item.trim()).filter(Boolean)
      : trimmed;
  }
}

function formatForType(questionTypeId: number) {
  return QUESTION_TYPES.find((type) => type.id === questionTypeId)?.format || "multiple_choice";
}

function slugifySetName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function prependLegacyTitle(html: string, title?: string) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return html;
  const text = normalizeTeasDisplayHtml(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.toLowerCase().startsWith(cleanTitle.toLowerCase())) return html;
  return `<p><strong>${escapeHtml(cleanTitle)}</strong></p>${html}`;
}

function exhibitImageHtml(exhibit: ScanExhibit, imagePath: string) {
  const exhibitId = escapeHtml(exhibit.id || "exhibit");
  const alt = escapeHtml(exhibit.alt || exhibit.description || exhibit.title || "Question exhibit image");
  return `<figure data-exhibit-id="${exhibitId}" class="teas-scan-image-figure"><img src="${escapeHtml(imagePath)}" alt="${alt}" /></figure>`;
}

function insertExhibitImageIntoHtml(html: string, exhibit: ScanExhibit, imagePath: string) {
  const imageHtml = exhibitImageHtml(exhibit, imagePath);
  const exhibitId = exhibit.id || "";
  if (exhibitId) {
    const safeExhibitId = escapeRegExp(exhibitId);
    const placeholderPattern = new RegExp(`<figure\\s+data-exhibit-id=["']${safeExhibitId}["']\\s*><\\/figure>`, "i");
    if (placeholderPattern.test(html)) return html.replace(placeholderPattern, imageHtml);

    const exhibitDivPattern = new RegExp(
      `(<div\\s+class=["']teas-scan-exhibit["'][^>]*data-exhibit-id=["']${safeExhibitId}["'][^>]*>)([\\s\\S]*?)(<\\/div>)`,
      "i"
    );
    if (exhibitDivPattern.test(html)) {
      return html.replace(exhibitDivPattern, (_match, open: string, body: string, close: string) => {
        const withoutNotice = body.replace(/<p\s+class=["']teas-scan-image-notice["'][\s\S]*?<\/p>/i, "");
        return `${open}${withoutNotice}${imageHtml}${close}`;
      });
    }
  }
  return `${html}${imageHtml}`;
}

function exhibitStillRequiresImage(exhibit: ScanExhibit) {
  const type = String(exhibit.type || "").toLowerCase();
  return (type === "image" || type === "chart" || Boolean(exhibit.requiresCrop)) && !String(exhibit.imagePath || "").trim();
}

function legacyQuestionHtml(record: SavedScanRecord) {
  return typeof record.question === "string" ? record.question : record.question?.html || "";
}

function recordPassage(record: SavedScanRecord) {
  return record.passage || null;
}

function recordQuestion(record: SavedScanRecord) {
  return record.questionContent || (typeof record.question === "object" ? record.question : null);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="admin-field-label mb-1 block">{children}</span>;
}

function ScanRecordContent({ scanId, mode }: { scanId: string; mode: "view" | "edit" }) {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [record, setRecord] = useState<SavedScanRecord | null>(null);
  const [navigation, setNavigation] = useState<SavedScanNavigation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [passageEditorMode, setPassageEditorMode] = useState<"visual" | "raw">("visual");
  const [questionEditorMode, setQuestionEditorMode] = useState<"visual" | "raw">("visual");
  const [showRenderedPreview, setShowRenderedPreview] = useState(false);

  const [passageHtml, setPassageHtml] = useState("");
  const [questionHtml, setQuestionHtml] = useState("");
  const [questionNumber, setQuestionNumber] = useState("");
  const [questionProgress, setQuestionProgress] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [setName, setSetName] = useState("");
  const [setSlug, setSetSlug] = useState("");
  const [questionTypeId, setQuestionTypeId] = useState(1);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [status, setStatus] = useState("scanned_review");
  const [notes, setNotes] = useState("");
  const [optionRows, setOptionRows] = useState<OptionRow[]>([]);
  const [editableExhibits, setEditableExhibits] = useState<ScanExhibit[]>([]);
  const [uploadingExhibitId, setUploadingExhibitId] = useState("");

  const loadRecord = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ id: scanId });
      const response = await fetch(`/api/admin/teas-image-import/scanned-questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not load saved scan.");

      const nextRecord = payload.record as SavedScanRecord;
      const nextNavigation = (payload.navigation || null) as SavedScanNavigation | null;
      const metadata = nextRecord.questionParts?.metadata || {};
      const passageBlock = recordPassage(nextRecord);
      const questionBlock = recordQuestion(nextRecord);
      const nextQuestionTypeId = Number(nextRecord.questionTypeId || 1);
      setRecord(nextRecord);
      setNavigation(nextNavigation);
      setPassageHtml(
        prependLegacyTitle(
          passageBlock?.html || nextRecord.questionParts?.passageHtml || nextRecord.passageHtml || "",
          passageBlock?.title
        )
      );
      setQuestionHtml(
        prependLegacyTitle(
          questionBlock?.html ||
            nextRecord.questionParts?.questionHtml ||
            nextRecord.questionHtml ||
            nextRecord.questionParts?.bodyHtml ||
            legacyQuestionHtml(nextRecord) ||
            "",
          questionBlock?.title
        )
      );
      setQuestionNumber(metadata.questionNumber || nextRecord.questionNumber || "");
      setQuestionProgress(metadata.questionProgress || nextRecord.questionProgress || "");
      setExamTitle(metadata.examTitle || nextRecord.examTitle || "");
      setSubject(metadata.subject || nextRecord.subject || "");
      setSetName(nextRecord.set?.name || nextRecord.setName || "");
      setSetSlug(nextRecord.set?.slug || nextRecord.setSlug || "");
      setQuestionTypeId(nextQuestionTypeId);
      setCorrectAnswer(correctAnswerForEditor(nextRecord.correctAnswer));
      setStatus(nextRecord.status || "scanned_review");
      setNotes(nextRecord.manualReviewNotes || "");
      setOptionRows(optionRowsFromOptions(nextRecord.options));
      setEditableExhibits(nextRecord.exhibits || nextRecord.questionParts?.exhibits || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load saved scan.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, scanId]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  const title = scanTitle(record, scanId);
  const displayMetadata = record?.questionParts?.metadata || {};
  const displayPassageBlock = record ? recordPassage(record) : null;
  const displayQuestionBlock = record ? recordQuestion(record) : null;
  const displayPassageHtml = prependLegacyTitle(
    displayPassageBlock?.html || record?.questionParts?.passageHtml || record?.passageHtml || "",
    displayPassageBlock?.title
  );
  const displayQuestionHtml =
    prependLegacyTitle(
      displayQuestionBlock?.html ||
        record?.questionParts?.questionHtml ||
        record?.questionHtml ||
        record?.questionParts?.bodyHtml ||
        (record ? legacyQuestionHtml(record) : "") ||
        "",
      displayQuestionBlock?.title
    );
  const exhibits = record?.exhibits || record?.questionParts?.exhibits || [];
  const visibleEditExhibits = editableExhibits.length > 0 ? editableExhibits : exhibits;
  const displayQuestionNumber = displayMetadata.questionNumber || record?.questionNumber || "";
  const displayQuestionProgress = displayMetadata.questionProgress || record?.questionProgress || "";
  const displayExamTitle = displayMetadata.examTitle || record?.examTitle || "";
  const displaySubject = displayMetadata.subject || record?.subject || "";
  const displaySetName = record?.set?.name || record?.setName || "";
  const displaySetSlug = record?.set?.slug || record?.setSlug || "";
  const selectedType = QUESTION_TYPES.find((type) => type.id === questionTypeId);
  const nextHref = navigation?.nextRecordId
    ? `/admin/teas-image-import/scans/${navigation.nextRecordId}${mode === "edit" ? "/edit" : ""}`
    : "";
  const positionText =
    navigation?.currentIndex !== null && navigation?.currentIndex !== undefined
      ? `${navigation.currentIndex + 1} of ${navigation.total}`
      : "";

  const editWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!questionHtml.trim()) warnings.push("Question text is required.");
    if (!subject.trim()) warnings.push("Subject is not selected.");
    if ([1, 2, 6].includes(questionTypeId) && optionRows.filter((row) => row.label.trim() && row.choice.trim()).length === 0) {
      warnings.push("This question type should have answer choices.");
    }
    if (!correctAnswer.trim()) warnings.push("Correct answer is empty.");
    return warnings;
  }, [correctAnswer, optionRows, questionHtml, questionTypeId, subject]);

  const updateOptionRow = (index: number, update: Partial<OptionRow>) => {
    setOptionRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...update } : row)));
  };

  const addOptionRow = () => {
    const nextLabel = String.fromCharCode(65 + optionRows.length);
    setOptionRows((rows) => [...rows, { label: nextLabel, choice: "" }]);
  };

  const removeOptionRow = (index: number) => {
    setOptionRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const addImageExhibit = () => {
    setEditableExhibits((items) => {
      const currentItems = items.length > 0 ? items : exhibits;
      const nextIndex = currentItems.length + 1;
      return [
        ...currentItems,
        {
          id: `exhibit_${nextIndex}`,
          type: "image",
          title: `Image ${nextIndex}`,
          placement: "inside_question",
          inline: true,
          requiresCrop: true,
          alt: "Question exhibit image",
          imagePath: "",
          description: "Question exhibit image.",
        },
      ];
    });
  };

  const uploadExhibitImage = async (exhibit: ScanExhibit, file: File | null) => {
    if (!currentUser || !record || !file) return;
    const exhibitId = exhibit.id || "exhibit";
    setUploadingExhibitId(exhibitId);
    setSaveError("");
    setSaveStatus("");
    try {
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scanId", record.id);
      formData.append("exhibitId", exhibitId);
      formData.append("setSlug", setSlug.trim() || slugifySetName(setName));
      formData.append("sourceFileName", record.sourceFileName || exhibitId);

      const response = await fetch("/api/admin/teas-image-import/exhibit-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not upload exhibit image.");
      const imagePath = String(payload.imagePath || "");
      const updatedExhibit: ScanExhibit = {
        ...exhibit,
        type: exhibit.type === "chart" ? "chart" : "image",
        inline: true,
        requiresCrop: false,
        imagePath,
      };
      const currentExhibits = editableExhibits.length > 0 ? editableExhibits : exhibits;
      const nextExhibits = currentExhibits.map((item) => ((item.id || "") === exhibitId ? updatedExhibit : item));
      const nextQuestionHtml = insertExhibitImageIntoHtml(questionHtml, updatedExhibit, imagePath);
      const nextSourceImageRequired = nextExhibits.some(exhibitStillRequiresImage);
      const nextStatus = !nextSourceImageRequired && Number(record.issueCount || 0) === 0 ? "scanned_ready" : status;
      setEditableExhibits(nextExhibits);
      setQuestionHtml(nextQuestionHtml);
      setStatus(nextStatus);

      const saveResponse = await fetch("/api/admin/teas-image-import/scanned-questions", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: record.id,
          passageHtml,
          questionHtml: nextQuestionHtml,
          questionNumber,
          questionProgress,
          examTitle,
          subject,
          setName,
          setSlug: setSlug.trim() || slugifySetName(setName),
          questionTypeId,
          atiFormat: selectedType?.format || formatForType(questionTypeId),
          options: optionsFromRows(optionRows),
          correctAnswer: parseCorrectAnswer(correctAnswer),
          exhibits: nextExhibits,
          status: nextStatus,
          manualReviewNotes: notes,
        }),
      });
      const savePayload = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(savePayload?.error || "Image uploaded, but the scan record was not updated.");
      setSaveStatus("Image uploaded and saved. The source-image flag will be removed from the scans list when all required visuals have an image.");
      await loadRecord();
    } catch (uploadError) {
      setSaveError(uploadError instanceof Error ? uploadError.message : "Could not upload exhibit image.");
    } finally {
      setUploadingExhibitId("");
    }
  };

  const saveManualEdit = async () => {
    if (!currentUser || !record) return;
    setSaving(true);
    setSaveError("");
    setSaveStatus("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-image-import/scanned-questions", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: record.id,
          passageHtml,
          questionHtml,
          questionNumber,
          questionProgress,
          examTitle,
          subject,
          setName,
          setSlug: setSlug.trim() || slugifySetName(setName),
          questionTypeId,
          atiFormat: selectedType?.format || formatForType(questionTypeId),
          options: optionsFromRows(optionRows),
          correctAnswer: parseCorrectAnswer(correctAnswer),
          exhibits: editableExhibits,
          status,
          manualReviewNotes: notes,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not save manual correction.");
      setSaveStatus("Manual correction saved.");
      await loadRecord();
    } catch (saveEditError) {
      setSaveError(saveEditError instanceof Error ? saveEditError.message : "Could not save manual correction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "TEAS Image Import", href: "/admin/teas-image-import" },
            { label: "Saved Scans", href: "/admin/teas-image-import/scans" },
            { label: mode === "edit" ? "Edit" : "View" },
          ]}
          actions={currentUser ? <UserProfileBadge /> : null}
        />
        <main className="admin-page min-h-[calc(100vh-4rem)]">
          <AdminPageHeader
            eyebrow="ATI TEAS Review"
            title={`${mode === "edit" ? "Edit" : "View"} Question ${title}`}
            description={
              mode === "edit"
                ? "Update the staged question fields before marking the scan ready."
                : "Read-only saved scan review."
            }
            actions={
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/teas-image-import/scans" className="admin-button-secondary">
                  Back to Saved Scans
                </Link>
                {positionText && (
                  <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600">
                    {positionText}
                  </span>
                )}
                {record && mode === "view" && (
                  <Link href={`/admin/teas-image-import/scans/${record.id}/edit`} className="admin-button-primary">
                    Edit
                  </Link>
                )}
                {nextHref && (
                  <Link href={nextHref} className="admin-button-secondary">
                    Next Question
                  </Link>
                )}
                {record && mode === "edit" && (
                  <button
                    type="button"
                    onClick={() => void saveManualEdit()}
                    disabled={saving}
                    className="admin-button-primary disabled:opacity-50"
                  >
                    {saving ? "Saving" : "Save Changes"}
                  </button>
                )}
              </div>
            }
          />

          {loading && <AdminAlert tone="info" title="Loading">Loading saved scan...</AdminAlert>}
          {error && <AdminAlert tone="error" title="Saved Scan Error">{error}</AdminAlert>}
          {saveError && <AdminAlert tone="error" title="Edit Error">{saveError}</AdminAlert>}
          {saveStatus && <AdminAlert tone="success" title="Edit Saved">{saveStatus}</AdminAlert>}

          {record && mode === "edit" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
              <div className="space-y-6">
                <AdminCard title="Question Content" description="Keep passage separate. Leave passage blank when the source question has no passage.">
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <FieldLabel>Passage Optional</FieldLabel>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setPassageEditorMode("visual")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${passageEditorMode === "visual" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                          >
                            Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => setPassageEditorMode("raw")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${passageEditorMode === "raw" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                          >
                            Raw HTML
                          </button>
                        </div>
                      </div>
                      {passageEditorMode === "visual" ? (
                        <RichTextEditor
                          value={passageHtml}
                          onChange={setPassageHtml}
                          placeholder="Passage text..."
                          disableLinks
                          disableImages
                        />
                      ) : (
                        <textarea
                          value={passageHtml}
                          onChange={(event) => setPassageHtml(event.target.value)}
                          className="admin-input min-h-[160px] w-full font-mono text-xs"
                          placeholder="<p>Passage text...</p>"
                        />
                      )}
                    </div>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <FieldLabel>Question</FieldLabel>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                          <button
                            type="button"
                            onClick={() => setQuestionEditorMode("visual")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${questionEditorMode === "visual" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                          >
                            Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionEditorMode("raw")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${questionEditorMode === "raw" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                          >
                            Raw HTML
                          </button>
                        </div>
                      </div>
                      {questionEditorMode === "visual" ? (
                        <RichTextEditor
                          value={questionHtml}
                          onChange={setQuestionHtml}
                          placeholder="Question text..."
                          disableLinks
                          disableImages
                        />
                      ) : (
                        <textarea
                          value={questionHtml}
                          onChange={(event) => setQuestionHtml(event.target.value)}
                          className="admin-input min-h-[180px] w-full font-mono text-xs"
                          placeholder="<p>Question text...</p>"
                        />
                      )}
                      <span className="admin-helper mt-2 block">
                        Use Raw HTML for exact exhibit placeholders, table markup, or image tags.
                      </span>
                    </div>
                  </div>
                </AdminCard>

                <AdminCard title="Rendered Preview">
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowRenderedPreview((current) => !current)}
                      className="admin-button-secondary"
                    >
                      {showRenderedPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    {showRenderedPreview && (
                      <div className="space-y-4">
                        {passageHtml.trim() && (
                          <div>
                            <p className="admin-field-label mb-2">Passage</p>
                            <div
                              className="admin-body rounded-lg border border-gray-200 bg-white p-4 text-sm"
                              dangerouslySetInnerHTML={{ __html: normalizeTeasDisplayHtml(passageHtml) }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="admin-field-label mb-2">Question</p>
                          <div
                            className="admin-body rounded-lg border border-gray-200 bg-white p-4 text-sm"
                            dangerouslySetInnerHTML={{ __html: normalizeTeasDisplayHtml(questionHtml || "No question text.") }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </AdminCard>

                <AdminCard title="Answer Choices" description="Use labels that match the correct answer value, such as A, B, C, D.">
                  <div className="space-y-3">
                    {optionRows.map((row, index) => (
                      <div key={`${row.label}-${index}`} className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[6rem_minmax(0,1fr)_auto]">
                        <label className="block">
                          <FieldLabel>Label</FieldLabel>
                          <input
                            value={row.label}
                            onChange={(event) => updateOptionRow(index, { label: event.target.value })}
                            className="admin-input w-full"
                          />
                        </label>
                        <label className="block">
                          <FieldLabel>Choice HTML/Text</FieldLabel>
                          <textarea
                            value={row.choice}
                            onChange={(event) => updateOptionRow(index, { choice: event.target.value })}
                            className="admin-input min-h-[74px] w-full"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeOptionRow(index)}
                          className="self-end rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addOptionRow} className="admin-button-secondary">
                      Add Choice
                    </button>
                  </div>
                </AdminCard>
              </div>

              <div className="space-y-6">
                <AdminCard title="Question Details">
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                      <label className="block">
                        <FieldLabel>Question Number</FieldLabel>
                        <input value={questionNumber} onChange={(event) => setQuestionNumber(event.target.value)} className="admin-input w-full" />
                      </label>
                      <label className="block">
                        <FieldLabel>Question Progress</FieldLabel>
                        <input value={questionProgress} onChange={(event) => setQuestionProgress(event.target.value)} className="admin-input w-full" placeholder="12 of 37" />
                      </label>
                    </div>
                    <label className="block">
                      <FieldLabel>Exam Title</FieldLabel>
                      <input value={examTitle} onChange={(event) => setExamTitle(event.target.value)} className="admin-input w-full" />
                    </label>
                    <label className="block">
                      <FieldLabel>Subject</FieldLabel>
                      <select value={subject} onChange={(event) => setSubject(event.target.value)} className="admin-input w-full">
                        <option value="">Select subject</option>
                        {SUBJECTS.map((nextSubject) => (
                          <option key={nextSubject} value={nextSubject}>{nextSubject}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <FieldLabel>Set Name</FieldLabel>
                      <input
                        value={setName}
                        onChange={(event) => setSetName(event.target.value)}
                        className="admin-input w-full"
                        placeholder="TEAS Version 7 - Set 6"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Set Slug</FieldLabel>
                      <input
                        value={setSlug}
                        onChange={(event) => setSetSlug(event.target.value)}
                        className="admin-input w-full"
                        placeholder={slugifySetName(setName) || "teas-version-7-set-6"}
                      />
                      <span className="admin-helper mt-1 block">
                        Used for import targeting. Leave blank to use the slug generated from Set Name.
                      </span>
                    </label>
                    <label className="block">
                      <FieldLabel>Question Type</FieldLabel>
                      <select
                        value={questionTypeId}
                        onChange={(event) => setQuestionTypeId(Number(event.target.value))}
                        className="admin-input w-full"
                      >
                        {QUESTION_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            Type {type.id} - {type.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <FieldLabel>Correct Answer</FieldLabel>
                      <input
                        value={correctAnswer}
                        onChange={(event) => setCorrectAnswer(event.target.value)}
                        className="admin-input w-full"
                        placeholder='A, ["A","C"], or typed answer'
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Status</FieldLabel>
                      <select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input w-full">
                        <option value="scanned_review">Needs manual review</option>
                        <option value="scanned_ready">Ready after review</option>
                      </select>
                    </label>
                    <label className="block">
                      <FieldLabel>Review Notes</FieldLabel>
                      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="admin-input min-h-[110px] w-full" />
                    </label>
                  </div>
                </AdminCard>

                <AdminCard title="Ready Check">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-2">
                      <AdminStatusBadge label={selectedType ? `Type ${selectedType.id}` : "Type"} tone="blue" />
                      <AdminStatusBadge label={selectedType?.format || formatForType(questionTypeId)} tone="purple" />
                      {status === "scanned_ready" ? (
                        <AdminStatusBadge label="Ready" tone="green" />
                      ) : (
                        <AdminStatusBadge label="Review" tone="amber" />
                      )}
                    </div>
                    {editWarnings.length > 0 ? (
                      <ul className="list-disc space-y-1 pl-5 text-amber-800">
                        {editWarnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-700">Core fields are complete.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => void saveManualEdit()}
                      disabled={saving}
                      className="admin-button-primary w-full justify-center disabled:opacity-50"
                    >
                      {saving ? "Saving" : "Save Changes"}
                    </button>
                  </div>
                </AdminCard>

                <AdminCard title="Detected Visuals" description="Upload exhibit images that are required to answer the question. The file is saved under public/teas-exhibits/{setSlug}.">
                  <div className="mb-3">
                    <button type="button" onClick={addImageExhibit} className="admin-button-secondary">
                      Add Image Exhibit
                    </button>
                  </div>
                  {visibleEditExhibits.length > 0 ? (
                    <div className="space-y-3 text-sm text-gray-700">
                      {visibleEditExhibits.map((exhibit, index) => (
                        <div key={`${exhibit.id || index}`} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <AdminStatusBadge label={exhibit.type || "exhibit"} tone="blue" />
                            {exhibit.inline && <AdminStatusBadge label="Inline" tone="purple" />}
                            {exhibit.requiresCrop && <AdminStatusBadge label="Crop needed" tone="amber" />}
                          </div>
                          <p className="font-semibold text-gray-950">{exhibit.title || exhibit.id || `Exhibit ${index + 1}`}</p>
                          <p><strong>Placement:</strong> {exhibit.placement || "unknown"}</p>
                          <p><strong>Alt:</strong> {exhibit.alt || "Not recorded"}</p>
                          <p className="break-all"><strong>Image path:</strong> {exhibit.imagePath || "Not added yet"}</p>
                          {exhibit.imagePath && (
                            <>
                              {/* Uploaded exhibit files live in public storage paths controlled by the admin tool. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={exhibit.imagePath}
                                alt={exhibit.alt || exhibit.title || `Exhibit ${index + 1}`}
                                className="mt-3 max-h-56 max-w-full border border-gray-200 bg-white object-contain"
                              />
                            </>
                          )}
                          <label className="mt-3 block">
                            <FieldLabel>Upload Image</FieldLabel>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              disabled={uploadingExhibitId === (exhibit.id || "exhibit")}
                              onChange={(event) => void uploadExhibitImage(exhibit, event.target.files?.[0] || null)}
                              className="admin-input w-full"
                            />
                            <span className="admin-helper mt-1 block">
                              {uploadingExhibitId === (exhibit.id || "exhibit")
                                ? "Uploading..."
                                : "Uploads the image, updates imagePath, and inserts it into the question preview."}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No exhibits recorded yet. Add one when the source question needs an image, chart, or diagram.</p>
                  )}
                </AdminCard>

                <AdminCard title="Source">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>ID:</strong> {record.id}</p>
                    <p><strong>Source file:</strong> {record.sourceFileName || "Not recorded"}</p>
                    <p><strong>Created:</strong> {record.createdAt || "Not recorded"}</p>
                    <p><strong>Updated:</strong> {record.updatedAt || "Not recorded"}</p>
                    <p className="break-all"><strong>Folder:</strong> {record.source?.inputPath || "Not recorded"}</p>
                  </div>
                </AdminCard>
              </div>
            </div>
          )}

          {record && mode === "view" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
              <div className="space-y-6">
                {displayPassageHtml && (
                  <AdminCard title="Passage">
                    <div
                      className="admin-body rounded-lg border border-gray-200 bg-white p-4 text-sm"
                      dangerouslySetInnerHTML={{ __html: normalizeTeasDisplayHtml(displayPassageHtml) }}
                    />
                  </AdminCard>
                )}
                <AdminCard title="Question">
                  <div
                    className="admin-body rounded-lg border border-gray-200 bg-white p-4 text-sm"
                    dangerouslySetInnerHTML={{ __html: normalizeTeasDisplayHtml(displayQuestionHtml || "No question text.") }}
                  />
                </AdminCard>
                <AdminCard title="Answer Choices">
                  {optionRowsFromOptions(record.options).length > 0 ? (
                    <div className="space-y-2">
                      {optionRowsFromOptions(record.options).map((option) => (
                        <div key={option.label} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 md:grid-cols-[5rem_minmax(0,1fr)]">
                          <span className="font-semibold text-gray-950">{option.label}</span>
                          <div
                            className="admin-body text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: normalizeTeasDisplayHtml(option.choice) }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No choices saved.</p>
                  )}
                </AdminCard>
                {exhibits.length > 0 && (
                  <AdminCard title="Detected Visuals">
                    <div className="space-y-3 text-sm text-gray-700">
                      {exhibits.map((exhibit, index) => (
                        <div key={`${exhibit.id || index}`} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <AdminStatusBadge label={exhibit.type || "exhibit"} tone="blue" />
                            {exhibit.inline && <AdminStatusBadge label="Inline" tone="purple" />}
                            {exhibit.requiresCrop && <AdminStatusBadge label="Crop needed" tone="amber" />}
                          </div>
                          <p className="font-semibold text-gray-950">{exhibit.title || exhibit.id || `Exhibit ${index + 1}`}</p>
                          <p><strong>Placement:</strong> {exhibit.placement || "unknown"}</p>
                          <p><strong>Alt:</strong> {exhibit.alt || "Not recorded"}</p>
                          <p className="break-all"><strong>Image path:</strong> {exhibit.imagePath || "Not added yet"}</p>
                        </div>
                      ))}
                    </div>
                  </AdminCard>
                )}
              </div>

              <div className="space-y-6">
                <AdminCard title="Record">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-2">
                      <AdminStatusBadge label={teasQuestionTypeLabel(Number(record.questionTypeId || 1))} tone="blue" />
                      {record.needsReview ? (
                        <AdminStatusBadge label="Needs Review" tone="amber" />
                      ) : (
                        <AdminStatusBadge label="Clean" tone="green" />
                      )}
                      {Number(record.validationErrorCount || 0) > 0 && <AdminStatusBadge label="Validation Error" tone="red" />}
                      {record.sourceImageRequired && <AdminStatusBadge label="Source Image" tone="purple" />}
                    </div>
                    <p><strong>Question number:</strong> {displayQuestionNumber || "Not recorded"}</p>
                    <p><strong>Question progress:</strong> {displayQuestionProgress || "Not recorded"}</p>
                    <p><strong>Exam title:</strong> {displayExamTitle || "Not recorded"}</p>
                    <p><strong>Subject:</strong> {displaySubject || "Not recorded"}</p>
                    <p><strong>Set:</strong> {displaySetName || "Not recorded"}</p>
                    <p><strong>Set slug:</strong> {displaySetSlug || "Not recorded"}</p>
                    <p><strong>Correct answer:</strong> {JSON.stringify(record.correctAnswer)}</p>
                    <p><strong>Status:</strong> {record.status || "Not recorded"}</p>
                    <p><strong>Source file:</strong> {record.sourceFileName || "Not recorded"}</p>
                    {record.manualReviewNotes && <p><strong>Review notes:</strong> {record.manualReviewNotes}</p>}
                  </div>
                </AdminCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ScanRecordPageClient({ scanId, mode }: { scanId: string; mode: "view" | "edit" }) {
  return (
    <SidebarProvider>
      <ScanRecordContent scanId={scanId} mode={mode} />
    </SidebarProvider>
  );
}
