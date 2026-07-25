"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AdminAlert,
  AdminCard,
  AdminNotificationRegion,
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
import {
  inlineImageReferencesForQuestion,
  type TeasBulkUploadPayload,
  validateTeasBulkUploadPayload,
} from "@/lib/admin/teas-bulk-upload-schema";
import { parseTeasStructuredOcrToBulkUploadPayload } from "@/lib/admin/teas-structured-ocr-parser";
import { teasQuestionTypeLabel } from "@/lib/admin/teas-question-display";

const EMPTY_JSON = JSON.stringify({ questions: [] }, null, 2);

type OcrJob = {
  id: string;
  status: "running" | "done" | "failed";
  mode: "text" | "structured";
  provider?: string;
  code: number | null;
  stdout: string;
  stderr: string;
  completed: number;
  total: number;
  inputPath: string;
  outputPath: string;
};

type FolderEntry = {
  name: string;
  path: string;
  scanPath?: string;
  imageCount: number;
  minPage: number | null;
  maxPage: number | null;
  firstImageName?: string;
  lastImageName?: string;
};

type FolderListing = {
  root: string;
  current: string;
  scanPath?: string;
  parent: string | null;
  imageCount: number;
  minPage: number | null;
  maxPage: number | null;
  firstImageName?: string;
  lastImageName?: string;
  dirs: FolderEntry[];
};

function TeasImageImportContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [jsonInput, setJsonInput] = useState(EMPTY_JSON);
  const [copyStatus, setCopyStatus] = useState("");
  const [ocrInputPath, setOcrInputPath] = useState(
    "C:\\Users\\wilso\\OneDrive\\Desktop\\Sets\\TEAS Version 7 - Set 7"
  );
  const [ocrStart, setOcrStart] = useState("1");
  const [ocrEnd, setOcrEnd] = useState("");
  const ocrMode = "structured";
  const [ocrJob, setOcrJob] = useState<OcrJob | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");
  const [folderListing, setFolderListing] = useState<FolderListing | null>(null);
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderError, setFolderError] = useState("");
  const [structuredOcrInput, setStructuredOcrInput] = useState("");
  const [structuredParseWarnings, setStructuredParseWarnings] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const ocrLogRef = useRef<HTMLPreElement | null>(null);
  const ocrOutputPath = useMemo(
    () => `${ocrInputPath.replace(/[\\/]+$/, "")}\\teas-ocr-output`,
    [ocrInputPath]
  );

  const parsed = useMemo(() => {
    try {
      const payload = JSON.parse(jsonInput) as TeasBulkUploadPayload;
      return {
        payload,
        parseError: "",
        validation: validateTeasBulkUploadPayload(payload),
      };
    } catch (error) {
      return {
        payload: null,
        parseError: error instanceof Error ? error.message : "Invalid JSON",
        validation: validateTeasBulkUploadPayload(null),
      };
    }
  }, [jsonInput]);

  const questions = parsed.payload?.questions || [];
  const ocrLogText = (ocrJob?.stdout || ocrJob?.stderr || "Waiting for OCR output...").trim();
  const inlineImages = questions.flatMap((question, index) =>
    inlineImageReferencesForQuestion(question, `$.questions[${index}]`)
  );
  const ready = !parsed.parseError && parsed.validation.valid;
  const warningCount = parsed.validation.warnings.length;
  const errorCount = parsed.parseError ? 1 : parsed.validation.errors.length;
  const normalizedJson = parsed.payload ? JSON.stringify(parsed.payload, null, 2) : "";

  const loadFolders = useCallback(
    async (folderPath?: string) => {
      if (!currentUser) return;
      setFolderLoading(true);
      setFolderError("");
      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams();
        if (folderPath) params.set("path", folderPath);
        const response = await fetch(`/api/admin/teas-image-import/folders?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Could not load folders");
        }
        setFolderListing(data as FolderListing);
        if (data?.imageCount) {
          setOcrInputPath(data.scanPath || data.current);
          setOcrStart(String(data.minPage || 1));
          setOcrEnd(data.maxPage ? String(data.maxPage) : "");
        }
      } catch (error) {
        setFolderError(error instanceof Error ? error.message : "Could not load folders");
      } finally {
        setFolderLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  const selectInputFolder = (folder: Pick<FolderEntry, "path" | "scanPath" | "minPage" | "maxPage">) => {
    setOcrInputPath(folder.scanPath || folder.path);
    setOcrStart(String(folder.minPage || 1));
    setOcrEnd(folder.maxPage ? String(folder.maxPage) : "");
    setOcrJob(null);
    setStructuredOcrInput("");
    setStructuredParseWarnings([]);
    setJsonInput(EMPTY_JSON);
  };

  const fetchOcrJob = useCallback(
    async (jobId: string) => {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/admin/teas-image-import/ocr?id=${encodeURIComponent(jobId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not load OCR job");
      }
      setOcrJob(data.job as OcrJob);
    },
    [currentUser]
  );

  useEffect(() => {
    if (!ocrJob || ocrJob.status !== "running") return;
    const poll = window.setInterval(() => {
      void fetchOcrJob(ocrJob.id).catch((error) => {
        setOcrError(error instanceof Error ? error.message : "Could not poll OCR job");
      });
    }, 1500);
    return () => window.clearInterval(poll);
  }, [fetchOcrJob, ocrJob]);

  useEffect(() => {
    const logElement = ocrLogRef.current;
    if (!logElement) return;
    logElement.scrollTop = logElement.scrollHeight;
  }, [ocrLogText]);

  const startOcrJob = async () => {
    if (!currentUser) {
      setOcrError("Sign in as an admin before starting OCR.");
      return;
    }
    setOcrLoading(true);
    setOcrError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-image-import/ocr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputPath: ocrInputPath,
          mode: ocrMode,
          start: ocrStart || undefined,
          end: ocrEnd || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not start OCR job");
      }
      const nextJob = data.job as OcrJob;
      setOcrInputPath(nextJob.inputPath || ocrInputPath);
      setOcrJob(nextJob);
    } catch (error) {
      setOcrError(error instanceof Error ? error.message : "Could not start OCR job");
    } finally {
      setOcrLoading(false);
    }
  };

  const loadLatestOcrOutput = async (kind: "text" | "structured") => {
    if (!currentUser) {
      setOcrError("Sign in as an admin before loading OCR output.");
      return;
    }
    setOcrError("");
    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ inputPath: ocrInputPath, kind });
      const response = await fetch(`/api/admin/teas-image-import/ocr-output?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not load OCR output");
      }
      setStructuredOcrInput(data.content || "");
      setCopyStatus(`Loaded ${data.fileName}.`);
    } catch (error) {
      setOcrError(error instanceof Error ? error.message : "Could not load OCR output");
    }
  };

  const convertStructuredOcrToJson = () => {
    try {
      const structured = JSON.parse(structuredOcrInput);
      const result = parseTeasStructuredOcrToBulkUploadPayload(structured);
      setJsonInput(JSON.stringify(result.payload, null, 2));
      setStructuredParseWarnings(result.warnings);
    } catch (error) {
      setStructuredParseWarnings([
        error instanceof Error ? error.message : "Structured OCR JSON could not be parsed.",
      ]);
    }
  };


  const saveScannedQuestions = async () => {
    if (!currentUser) {
      setSaveError("Sign in as an admin before saving scanned questions.");
      return;
    }
    if (!parsed.payload || questions.length === 0) {
      setSaveError("Generate scanned-question JSON before saving.");
      return;
    }
    setSaving(true);
    setSaveError("");
    setSaveStatus("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-image-import/scanned-questions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: parsed.payload,
          source: {
            inputPath: ocrInputPath,
            outputPath: ocrOutputPath,
            ocrMode,
            ocrJobId: ocrJob?.id || null,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not save scanned questions");
      }
      setSaveStatus(
        `Saved ${data.savedCount} scanned questions to ${data.collection}${
          data.savedWithValidationErrors ? " with validation errors for manual review" : ""
        }.`
      );
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save scanned questions");
    } finally {
      setSaving(false);
    }
  };

  const copyJson = async () => {
    if (!normalizedJson) return;
    try {
      await navigator.clipboard.writeText(normalizedJson);
      setCopyStatus("Copied JSON to clipboard.");
      setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("Could not copy JSON from this browser context.");
    }
  };

  const openPreview = () => {
    if (!parsed.payload) {
      setSaveError("Generate scanned-question JSON before opening preview.");
      return;
    }
    window.localStorage.setItem(
      "teas-image-import-preview",
      JSON.stringify({
        payload: parsed.payload,
        parserWarnings: structuredParseWarnings,
        schemaWarnings: parsed.validation.warnings,
        source: {
          inputPath: ocrInputPath,
          ocrOutputPath,
          openedAt: new Date().toISOString(),
        },
      })
    );
    window.open("/admin/teas-image-import/preview", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Content", href: "/admin" },
            { label: "TEAS Image Import" },
          ]}
          actions={currentUser ? <UserProfileBadge /> : null}
        />
        <main className="admin-page min-h-[calc(100vh-4rem)]">
          <AdminPageHeader
            eyebrow="ATI TEAS Import"
            title="TEAS Image-to-JSON Review"
            description="Validate bulk-upload-compatible TEAS JSON before OCR and bulk import are added. The output must match the existing Nursing Entrance Exam bulk upload structure."
            actions={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyJson}
                  disabled={!normalizedJson}
                  className="admin-button-secondary disabled:opacity-50"
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  onClick={saveScannedQuestions}
                  disabled={!parsed.payload || questions.length === 0 || saving}
                  className="admin-button-primary disabled:opacity-50"
                >
                  {saving ? "Saving" : "Save Scanned"}
                </button>
                <button
                  type="button"
                  onClick={openPreview}
                  disabled={questions.length === 0}
                  className="admin-button-primary disabled:opacity-50"
                >
                  Open Preview
                </button>
              </div>
            }
          />

          <AdminNotificationRegion
            success={copyStatus || undefined}
            info={saveStatus || undefined}
            error={parsed.parseError || saveError || undefined}
            warning={
              warningCount > 0
                ? `${warningCount} warning${warningCount === 1 ? "" : "s"} found.`
                : undefined
            }
            errorTitle="Action Error"
            successTitle="Copied"
            infoTitle="Saved"
            warningTitle="Validation Warning"
          />

          <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Questions" value={questions.length} helper="Generated scanned questions." />
            <AdminStatCard label="Review Flags" value={structuredParseWarnings.length + warningCount} helper="Parser and schema warnings." />
            <AdminStatCard
              label="Storage"
              value="teasScannedQuestions"
              helper="Separate Firestore collection."
            />
            <AdminStatCard
              label="OCR Job"
              value={ocrJob ? ocrJob.status : "Not Started"}
              helper={ocrJob?.total ? `${ocrJob.completed}/${ocrJob.total} pages` : "Google Gemini image extraction."}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <AdminCard
                title="Local Folder Scan"
                description="Run Google Gemini directly on your local screenshots, load the latest structured output, then convert it to scanned questions."
              >
                <div className="grid gap-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="admin-field-label">Selected Input Folder</p>
                        <p className="break-all font-mono text-xs text-gray-700">{ocrInputPath}</p>
                        {folderListing?.scanPath && (
                          <p className="mt-1 break-all font-mono text-[11px] text-gray-500">
                            Scan folder: {folderListing.scanPath}
                          </p>
                        )}
                      </div>
                      <AdminStatusBadge
                        label={folderListing?.imageCount ? `${folderListing.imageCount} images` : "Browse folders"}
                        tone={folderListing?.imageCount ? "green" : "gray"}
                      />
                    </div>
                    {folderListing?.imageCount ? (
                      <div className="mt-3 grid gap-2 text-xs text-gray-700 sm:grid-cols-3">
                        <p><strong>Total:</strong> {folderListing.imageCount}</p>
                        <p><strong>First:</strong> {folderListing.minPage}</p>
                        <p><strong>Last:</strong> {folderListing.maxPage}</p>
                      </div>
                    ) : null}
                    <p className="admin-helper mt-2">
                      OCR runs from the first detected image to the last detected image. Working files are saved in `teas-ocr-output` inside the scan folder.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="admin-field-label">Folder Browser</p>
                        <p className="break-all font-mono text-xs text-gray-600">
                          {folderListing?.current || "Loading source root..."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {folderListing?.parent && (
                          <button
                            type="button"
                            onClick={() => void loadFolders(folderListing.parent || undefined)}
                            className="admin-button-secondary"
                          >
                            Up
                          </button>
                        )}
                        {folderListing && (
                          <button
                            type="button"
                            onClick={() =>
                              selectInputFolder({
                                path: folderListing.current,
                                scanPath: folderListing.scanPath,
                                minPage: folderListing.minPage,
                                maxPage: folderListing.maxPage,
                              })
                            }
                            className="admin-button-primary"
                          >
                            Use This Folder
                          </button>
                        )}
                      </div>
                    </div>

                    {folderError && (
                      <AdminAlert tone="error" title="Folder Error">
                        {folderError}
                      </AdminAlert>
                    )}
                    {folderLoading ? (
                      <p className="admin-helper">Loading folders...</p>
                    ) : (
                      <div className="max-h-72 overflow-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Folder</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Images</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Range</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {(folderListing?.dirs || []).map((folder) => (
                              <tr key={folder.path}>
                                <td className="break-all px-3 py-2 font-medium text-gray-900">{folder.name}</td>
                                <td className="px-3 py-2 text-gray-600">
                                  {folder.imageCount || "None"}
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {folder.imageCount ? `${folder.minPage}-${folder.maxPage}` : "-"}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => void loadFolders(folder.path)}
                                      className="admin-button-secondary"
                                    >
                                      Open
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => selectInputFolder(folder)}
                                      disabled={!folder.imageCount}
                                      className="admin-button-secondary disabled:opacity-50"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {folderListing && folderListing.dirs.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">
                                  No subfolders found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="admin-field-label mb-1 block">Start Page</span>
                      <input
                        value={ocrStart}
                        onChange={(event) => setOcrStart(event.target.value)}
                        className="admin-input w-full"
                        inputMode="numeric"
                      />
                    </label>
                    <label className="block">
                      <span className="admin-field-label mb-1 block">End Page</span>
                      <input
                        value={ocrEnd}
                        onChange={(event) => setOcrEnd(event.target.value)}
                        className="admin-input w-full"
                        inputMode="numeric"
                        placeholder="All"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={startOcrJob}
                      disabled={ocrLoading || ocrJob?.status === "running"}
                      className="admin-button-primary disabled:opacity-50"
                    >
                      {ocrLoading || ocrJob?.status === "running" ? "OCR Running" : "Start OCR"}
                    </button>
                    {ocrJob && (
                      <AdminStatusBadge
                        label={`${ocrJob.mode} ${ocrJob.status}${ocrJob.total ? ` ${ocrJob.completed}/${ocrJob.total}` : ""}`}
                        tone={ocrJob.status === "done" ? "green" : ocrJob.status === "failed" ? "red" : "amber"}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => void loadLatestOcrOutput("structured")}
                      className="admin-button-secondary"
                    >
                      Load Latest Structured
                    </button>
                  </div>
                  {ocrError && (
                    <AdminAlert tone="error" title="OCR Error">
                      {ocrError}
                    </AdminAlert>
                  )}
                  {ocrJob && (
                    <div className="rounded-xl border border-gray-200 bg-gray-950 p-3">
                      <p className="mb-2 text-xs font-semibold text-gray-200">
                        Output: {ocrJob.outputPath}
                      </p>
                      <pre ref={ocrLogRef} className="max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-gray-100">
                        {ocrLogText}
                      </pre>
                    </div>
                  )}
                </div>
              </AdminCard>

              <AdminCard
                title="Gemini Extraction"
                description="Load or paste Gemini structured output, then convert it into scanned-question JSON."
              >
                <div className="space-y-3">
                  <textarea
                    value={structuredOcrInput}
                    onChange={(event) => setStructuredOcrInput(event.target.value)}
                    className="min-h-[260px] w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-mono text-xs leading-5 text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    spellCheck={false}
                    placeholder="Paste teas-ocr-structured-*.json here..."
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={convertStructuredOcrToJson}
                      className="admin-button-primary"
                    >
                      Convert Gemini Output
                    </button>
                    <span className="admin-helper">
                      Gemini reads the screenshot and returns prompt, choices, type, and selected answer in one step.
                    </span>
                  </div>
                  {structuredParseWarnings.length > 0 && (
                    <AdminAlert tone="warning" title="Structured OCR Parse Warnings">
                      <ul className="list-disc space-y-1 pl-5">
                        {structuredParseWarnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </AdminAlert>
                  )}
                </div>
              </AdminCard>

              <AdminCard
                title="Scanned Question JSON"
                description='Review the generated { "questions": [...] } before saving to Firestore.'
              >
                <textarea
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  className="min-h-[420px] w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-mono text-xs leading-5 text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  spellCheck={false}
                />
              </AdminCard>
            </div>

            <div className="space-y-6">
              <AdminCard title="Validation" description="Issues are grouped by JSON path so OCR output can be corrected quickly.">
                {ready ? (
                  <AdminAlert tone="success" title="Valid TEAS Bulk Upload JSON">
                    This payload conforms to the current bulk upload structure.
                  </AdminAlert>
                ) : (
                  <AdminAlert tone="warning" title="Manual Review Required">
                    You can save this staged scan now. Review and fix the listed issues before promoting it into the production question bank.
                  </AdminAlert>
                )}

                {(parsed.validation.errors.length > 0 || parsed.validation.warnings.length > 0) && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Path</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.validation.errors.map((issue, index) => (
                          <tr key={`error-${index}`}>
                            <AdminTableCell>
                              <AdminStatusBadge label="Error" tone="red" />
                            </AdminTableCell>
                            <AdminTableCell mono>{issue.path}</AdminTableCell>
                            <AdminTableCell nowrap={false}>{issue.message}</AdminTableCell>
                          </tr>
                        ))}
                        {parsed.validation.warnings.map((issue, index) => (
                          <tr key={`warning-${index}`}>
                            <AdminTableCell>
                              <AdminStatusBadge label="Warning" tone="amber" />
                            </AdminTableCell>
                            <AdminTableCell mono>{issue.path}</AdminTableCell>
                            <AdminTableCell nowrap={false}>{issue.message}</AdminTableCell>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </div>
                )}
              </AdminCard>

              <AdminCard title="Preview" description="Open a full review page in a new tab, grouped by question type.">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openPreview}
                    disabled={questions.length === 0}
                    className="admin-button-primary disabled:opacity-50"
                  >
                    Open Preview
                  </button>
                  <span className="admin-helper">
                    {questions.length > 0
                      ? `${questions.length} generated questions ready for preview.`
                      : "Convert structured OCR before previewing."}
                  </span>
                </div>
                {questions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from(new Set(questions.map((question) => Number(question.question_type_id || 1)))).map((typeId) => (
                      <AdminStatusBadge
                        key={typeId}
                        label={`${teasQuestionTypeLabel(typeId)}: ${
                          questions.filter((question) => Number(question.question_type_id || 1) === typeId).length
                        }`}
                        tone="blue"
                      />
                    ))}
                  </div>
                )}
              </AdminCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeasImageImportPage() {
  return (
    <SidebarProvider>
      <TeasImageImportContent />
    </SidebarProvider>
  );
}
