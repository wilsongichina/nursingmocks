"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminAlert,
  AdminCard,
  AdminDestructiveDialog,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminTable,
  AdminTableCell,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeTeasDisplayHtml, teasQuestionTypeLabel } from "@/lib/admin/teas-question-display";

type SavedScanRecord = {
  id: string;
  question?: { html?: string; text?: string } | string;
  questionContent?: { html?: string; text?: string };
  passage?: { html?: string; text?: string } | null;
  passageHtml?: string;
  questionHtml?: string;
  hasPassage?: boolean;
  questionParts?: {
    questionHtml?: string;
    bodyHtml?: string;
  };
  questionTypeId?: number;
  atiFormat?: string | null;
  correctAnswer?: unknown;
  status?: string;
  needsReview?: boolean;
  issueCount?: number;
  warningCount?: number;
  validationWarningCount?: number;
  validationErrorCount?: number;
  questionNumber?: string;
  set?: {
    name?: string;
    slug?: string;
    number?: string;
  };
  setName?: string;
  setSlug?: string;
  setNumber?: string;
  sourceFileName?: string;
  sourceImageRequired?: boolean;
  exhibitCount?: number;
  imageExhibitCount?: number;
  scanOrder?: number;
  review?: {
    warnings?: string[];
    choiceCount?: number;
    promptLineCount?: number;
    layoutMode?: string;
  };
  source?: {
    fileName?: string;
    inputPath?: string;
    outputPath?: string;
    ocrJobId?: string | null;
  };
  manualReviewNotes?: string;
  createdAt?: string | null;
};

type SavedScansResponse = {
  collection: string;
  records: SavedScanRecord[];
  summary: {
    total: number;
    review: number;
    visual: number;
    issues: number;
    sets?: SetSummary[];
  };
};

type SetSummary = {
  key: string;
  label: string;
  slug: string;
  setName: string;
  setNumber: string;
  total: number;
  ready: number;
  review: number;
  visual: number;
  issues: number;
  subjects: string[];
};

function questionTextPreview(html: string) {
  return normalizeTeasDisplayHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function recordQuestionHtml(record: SavedScanRecord) {
  if (record.questionContent?.html) return record.questionContent.html;
  if (typeof record.question === "object" && record.question?.html) return record.question.html;
  return (
    record.questionParts?.questionHtml ||
    record.questionHtml ||
    record.questionParts?.bodyHtml ||
    (typeof record.question === "string" ? record.question : "") ||
    ""
  );
}

function sourceImageFileName(record: SavedScanRecord) {
  return record.sourceFileName || record.source?.fileName || "";
}

function sourceImageFullPath(record: SavedScanRecord) {
  const inputPath = record.source?.inputPath || "";
  const fileName = sourceImageFileName(record);
  if (!inputPath) return fileName;
  if (!fileName) return inputPath;
  return `${inputPath.replace(/[\\/]+$/, "")}\\${fileName}`;
}

function setNumberFromText(value: string) {
  const match = String(value || "").match(/\bset\s*(\d+)\b/i);
  return match?.[1] || "";
}

function displaySetNumber(record: SavedScanRecord) {
  return (
    record.set?.number ||
    record.setNumber ||
    setNumberFromText(record.set?.name || record.setName || "") ||
    setNumberFromText(record.source?.inputPath || "") ||
    ""
  );
}

function recordSetName(record: SavedScanRecord) {
  return record.set?.name || record.setName || "No set";
}

function recordSetSlug(record: SavedScanRecord) {
  return record.set?.slug || record.setSlug || "";
}

function recordSetKey(record: SavedScanRecord) {
  return recordSetSlug(record) || recordSetName(record).toLowerCase() || "no-set";
}

function recordSetLabel(record: SavedScanRecord) {
  const setNumber = displaySetNumber(record);
  return setNumber ? `Set ${setNumber} - ${recordSetName(record)}` : recordSetName(record);
}

function groupRecordsBySet(records: SavedScanRecord[]) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      slug: string;
      setNumber: string;
      records: SavedScanRecord[];
      review: number;
      visual: number;
      issues: number;
    }
  >();

  records.forEach((record) => {
    const key = recordSetKey(record);
    const existing =
      groups.get(key) ||
      {
        key,
        label: recordSetLabel(record),
        slug: recordSetSlug(record),
        setNumber: displaySetNumber(record),
        records: [],
        review: 0,
        visual: 0,
        issues: 0,
      };
    existing.records.push(record);
    existing.review += record.needsReview ? 1 : 0;
    existing.visual += record.sourceImageRequired ? 1 : 0;
    existing.issues += Number(record.issueCount || 0);
    groups.set(key, existing);
  });

  return Array.from(groups.values()).sort((a, b) => {
    const leftNumber = Number(a.setNumber || Number.MAX_SAFE_INTEGER);
    const rightNumber = Number(b.setNumber || Number.MAX_SAFE_INTEGER);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }
    return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" });
  });
}

function SavedTeasScansContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("extractionOrder");
  const [selectedSetKey, setSelectedSetKey] = useState("");
  const [setSummaries, setSetSummaries] = useState<SetSummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [data, setData] = useState<SavedScansResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openingSourceId, setOpeningSourceId] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<SavedScanRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState("");

  const loadSetSummaries = useCallback(async () => {
    if (!currentUser) return;
    setSummaryLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ summaryOnly: "true" });
      const response = await fetch(`/api/admin/teas-image-import/scanned-questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not load saved TEAS scans.");
      const nextSummaries = (payload as SavedScansResponse).summary.sets || [];
      setSetSummaries(nextSummaries);
      setSelectedSetKey((current) => {
        if (current && nextSummaries.some((set) => set.key === current)) return current;
        return nextSummaries[0]?.key || "";
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load saved scan sets.");
    } finally {
      setSummaryLoading(false);
    }
  }, [currentUser]);

  const selectedSet = setSummaries.find((set) => set.key === selectedSetKey) || null;

  const loadScans = useCallback(async () => {
    if (!currentUser || !selectedSet) {
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ filter, sort, limit: "600" });
      if (selectedSet.slug) params.set("setSlug", selectedSet.slug);
      else params.set("setName", selectedSet.setName);
      const response = await fetch(`/api/admin/teas-image-import/scanned-questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not load saved TEAS scans.");
      setData(payload as SavedScansResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load saved TEAS scans.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter, selectedSet, sort]);

  const openSourceImage = useCallback(
    async (record: SavedScanRecord) => {
      if (!currentUser) return;
      const inputPath = record.source?.inputPath || "";
      const fileName = sourceImageFileName(record);
      if (!inputPath || !fileName) {
        setError("This scan does not have enough source image information to open the image.");
        return;
      }

      const targetWindow = window.open("", "_blank");
      if (targetWindow) targetWindow.opener = null;
      setOpeningSourceId(record.id);
      setError("");
      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ inputPath, fileName });
        const response = await fetch(`/api/admin/teas-image-import/source-image?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || "Could not open source image.");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (targetWindow) {
          targetWindow.location.href = objectUrl;
        } else {
          window.open(objectUrl, "_blank", "noopener,noreferrer");
        }
      } catch (sourceError) {
        if (targetWindow) targetWindow.close();
        setError(sourceError instanceof Error ? sourceError.message : "Could not open source image.");
      } finally {
        setOpeningSourceId("");
      }
    },
    [currentUser]
  );

  const clearScannedQuestions = useCallback(async () => {
    if (!currentUser) return;
    setClearing(true);
    setError("");
    setSuccess("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-image-import/scanned-questions", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not clear saved scans.");
      setData({
        collection: payload.collection || "teasScannedQuestions",
        records: [],
        summary: {
          total: 0,
          review: 0,
          visual: 0,
          issues: 0,
        },
      });
      setSetSummaries([]);
      setSelectedSetKey("");
      setSuccess(`Cleared ${payload.deletedCount || 0} saved TEAS scanned question records.`);
      setShowClearDialog(false);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Could not clear saved scans.");
    } finally {
      setClearing(false);
    }
  }, [currentUser]);

  const deleteSingleScan = useCallback(async () => {
    if (!currentUser || !deleteRecord) return;
    setDeletingRecordId(deleteRecord.id);
    setError("");
    setSuccess("");
    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ id: deleteRecord.id });
      const response = await fetch(`/api/admin/teas-image-import/scanned-questions?${params.toString()}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not delete saved scan.");
      setSuccess(`Deleted saved scan ${deleteRecord.questionNumber || deleteRecord.sourceFileName || deleteRecord.id}.`);
      setDeleteRecord(null);
      await loadSetSummaries();
      await loadScans();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete saved scan.");
    } finally {
      setDeletingRecordId("");
    }
  }, [currentUser, deleteRecord, loadScans, loadSetSummaries]);

  useEffect(() => {
    void loadSetSummaries();
  }, [loadSetSummaries]);

  useEffect(() => {
    void loadScans();
  }, [loadScans]);

  const records = data?.records || [];
  const setGroups = groupRecordsBySet(records);
  const visibleGroups = setGroups;
  const visibleRecords = visibleGroups.flatMap((group) => group.records);
  const totalSetCount = setSummaries.length;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "TEAS Image Import", href: "/admin/teas-image-import" },
            { label: "Saved Scans" },
          ]}
          actions={currentUser ? <UserProfileBadge /> : null}
        />
        <main className="admin-page min-h-[calc(100vh-4rem)]">
          <AdminPageHeader
            eyebrow="ATI TEAS Review"
            title="Saved TEAS Scanned Questions"
            description="Review staged TEAS questions saved from image extraction. Records are shown in extraction order by default."
            actions={
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void loadScans()} className="admin-button-secondary">
                  Refresh Set
                </button>
                <button type="button" onClick={() => void loadSetSummaries()} className="admin-button-secondary">
                  Refresh Sets
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearDialog(true)}
                  disabled={clearing || loading || summaryLoading || setSummaries.length === 0}
                  className="admin-button-danger disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear staging DB
                </button>
              </div>
            }
          />

          {error && (
            <AdminAlert tone="error" title="Saved Scan Error">
              {error}
            </AdminAlert>
          )}
          {success && (
            <AdminAlert tone="success" title="Saved Scans Cleared">
              {success}
            </AdminAlert>
          )}

          <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Selected Set" value={selectedSet?.total || 0} helper={selectedSet ? selectedSet.label : `${totalSetCount} sets available.`} />
            <AdminStatCard label="Loaded Rows" value={visibleRecords.length} helper="Only the selected set is loaded into the table." />
            <AdminStatCard label="Needs Review" value={selectedSet?.review || 0} helper="Records with parser warnings or review flags in this set." />
            <AdminStatCard label="Issues" value={selectedSet?.issues || 0} helper="Total review issue count in this set." />
          </section>

          {setSummaries.length > 0 && (
            <AdminCard title="Sets" description="Choose one set. The page loads questions only for the selected set to keep refreshes fast." className="mb-6">
              <div className="flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="admin-field-label mb-1 block">Set</span>
                  <select value={selectedSetKey} onChange={(event) => setSelectedSetKey(event.target.value)} className="admin-input min-w-72">
                    {setSummaries.map((group) => (
                      <option key={group.key} value={group.key}>
                        {group.label} ({group.total})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  {setSummaries.map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => setSelectedSetKey(group.key)}
                      className={selectedSetKey === group.key ? "admin-button-primary" : "admin-button-secondary"}
                    >
                      {group.setNumber ? `Set ${group.setNumber}` : group.label}
                    </button>
                  ))}
                </div>
                {(summaryLoading || loading) && (
                  <span className="admin-helper">
                    {summaryLoading ? "Loading sets..." : "Loading selected set..."}
                  </span>
                )}
              </div>
            </AdminCard>
          )}

          <AdminCard title="Saved Data" className="mb-6">
            <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2 xl:grid-cols-3">
              <p>Question HTML, options, correct answer, type, and ATI format.</p>
              <p>Question number, source file, source folder, OCR job, and scan order.</p>
              <p>Review warnings, issue counts, visual exhibit flags, and raw Gemini scan layout.</p>
            </div>
          </AdminCard>

          <div className="grid gap-6">
            <AdminCard title="Scanned Questions" description="Use the filters to bring risky records to the top.">
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="admin-field-label mb-1 block">Filter</span>
                  <select value={filter} onChange={(event) => setFilter(event.target.value)} className="admin-input">
                    <option value="all">All scans</option>
                    <option value="review">Needs review</option>
                    <option value="visual">Visual source required</option>
                    <option value="clean">Clean only</option>
                  </select>
                </label>
                <label className="block">
                  <span className="admin-field-label mb-1 block">Sort</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value)} className="admin-input">
                    <option value="extractionOrder">Extraction order</option>
                    <option value="issues">Most issues first</option>
                    <option value="newest">Newest first</option>
                    <option value="questionNumber">Question number</option>
                  </select>
                </label>
                {loading && <span className="admin-helper">Loading selected set...</span>}
              </div>

              <div className="space-y-6">
                {visibleGroups.map((group) => (
                  <section key={group.key} className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-950">{group.label}</h3>
                          {group.slug && <p className="mt-1 break-all text-xs text-gray-500">{group.slug}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <AdminStatusBadge label={`${group.records.length} questions`} tone="gray" />
                          {group.review > 0 && <AdminStatusBadge label={`${group.review} review`} tone="amber" />}
                          {group.visual > 0 && <AdminStatusBadge label={`${group.visual} visual`} tone="purple" />}
                          {group.issues > 0 && <AdminStatusBadge label={`${group.issues} issues`} tone="red" />}
                        </div>
                      </div>
                    </div>
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Set</th>
                          <th>Type</th>
                          <th>Flags</th>
                          <th>Issues</th>
                          <th>Source</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                    {group.records.map((record) => (
                      <tr key={record.id}>
                        <AdminTableCell nowrap={false}>
                          <div className="max-w-xl">
                            <p className="font-semibold text-gray-950">
                              Question {record.questionNumber || record.sourceFileName || record.id.slice(0, 8)}
                            </p>
                            {record.scanOrder && (
                              <p className="mt-1 text-[11px] font-semibold uppercase text-gray-500">
                                Extracted #{record.scanOrder}
                              </p>
                            )}
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                              {questionTextPreview(recordQuestionHtml(record)) || "No question preview."}
                            </p>
                          </div>
                        </AdminTableCell>
                        <AdminTableCell nowrap={false}>
                          <div className="max-w-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-semibold text-gray-800">{recordSetName(record)}</p>
                              {displaySetNumber(record) && (
                                <AdminStatusBadge label={`Set ${displaySetNumber(record)}`} tone="purple" />
                              )}
                            </div>
                            <p className="mt-1 break-all text-[11px] text-gray-500">{recordSetSlug(record)}</p>
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>
                          <AdminStatusBadge label={teasQuestionTypeLabel(Number(record.questionTypeId || 1))} tone="blue" />
                        </AdminTableCell>
                        <AdminTableCell nowrap={false}>
                          <div className="flex flex-wrap gap-1">
                            {record.needsReview ? (
                              <AdminStatusBadge label="Needs Review" tone="amber" />
                            ) : (
                              <AdminStatusBadge label="Clean" tone="green" />
                            )}
                            {Number(record.validationErrorCount || 0) > 0 && (
                              <AdminStatusBadge label="Validation Error" tone="red" />
                            )}
                            {record.sourceImageRequired && <AdminStatusBadge label="Source Image" tone="purple" />}
                            {Number(record.exhibitCount || 0) > 0 && (
                              <AdminStatusBadge label={`${record.exhibitCount} exhibits`} tone="blue" />
                            )}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>{Number(record.issueCount || 0)}</AdminTableCell>
                        <AdminTableCell nowrap={false}>
                          <div className="max-w-sm space-y-2">
                            <p className="break-all text-xs font-semibold text-gray-800">
                              {sourceImageFullPath(record) || "No source path recorded"}
                            </p>
                            {record.source?.outputPath && (
                              <p className="break-all text-[11px] text-gray-500">
                                Output: {record.source.outputPath}
                              </p>
                            )}
                            {record.source?.inputPath && sourceImageFileName(record) && (
                              <button
                                type="button"
                                onClick={() => void openSourceImage(record)}
                                disabled={openingSourceId === record.id}
                                className="admin-button-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {openingSourceId === record.id ? "Opening..." : "Open image"}
                              </button>
                            )}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/teas-image-import/scans/${record.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-button-secondary"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/teas-image-import/scans/${record.id}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-button-primary"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteRecord(record)}
                              disabled={deletingRecordId === record.id}
                              className="admin-button-danger disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingRecordId === record.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </AdminTableCell>
                      </tr>
                    ))}
                      </tbody>
                    </AdminTable>
                  </section>
                ))}
                {visibleRecords.length === 0 && (
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <AdminTable>
                      <tbody>
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                          No saved scans found for this filter.
                        </td>
                      </tr>
                      </tbody>
                    </AdminTable>
                  </div>
                )}
              </div>
            </AdminCard>
          </div>
        </main>
      </div>
      {showClearDialog && (
        <AdminDestructiveDialog
          title="Clear TEAS staging DB"
          itemName="all saved TEAS scanned question records"
          consequence="This deletes only the teasScannedQuestions staging collection. Production quiz questions are not touched."
          confirmLabel="Clear staging DB"
          confirmingLabel="Clearing..."
          confirming={clearing}
          onCancel={() => setShowClearDialog(false)}
          onConfirm={() => void clearScannedQuestions()}
        />
      )}
      {deleteRecord && (
        <AdminDestructiveDialog
          title="Delete TEAS scanned question"
          itemName={`Question ${deleteRecord.questionNumber || deleteRecord.sourceFileName || deleteRecord.id.slice(0, 8)}`}
          consequence="This deletes only this staged TEAS scan record. Production quiz questions are not touched."
          confirmLabel="Delete scan"
          confirmingLabel="Deleting..."
          confirming={deletingRecordId === deleteRecord.id}
          onCancel={() => setDeleteRecord(null)}
          onConfirm={() => void deleteSingleScan()}
        />
      )}
    </div>
  );
}

export default function SavedTeasScansPage() {
  return (
    <SidebarProvider>
      <SavedTeasScansContent />
    </SidebarProvider>
  );
}
