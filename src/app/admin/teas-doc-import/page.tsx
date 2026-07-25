"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminAlert,
  AdminCard,
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

type ParsedDocQuestion = {
  index: number;
  subject: string;
  marker: string;
  passageMarker: string;
  passageLines: string[];
  prompt: string;
  choices: string[];
  boldAnswers: string[];
  needsLlmQuestion: boolean;
  warnings: string[];
};

type DocxFileSummary = {
  path: string;
  relativePath: string;
  folder: string;
  name: string;
  bytes: number;
  lastModified: number;
  exists: boolean;
};

type ParseResponse = {
  root: string;
  providerStatus: {
    gemini: boolean;
    chatgpt: boolean;
  };
  llmConfirmation: {
    gemini: string;
    chatgpt: string;
  };
  parsed: {
    sourcePath: string;
    fileName: string;
    paragraphCount: number;
    mediaCount: number;
    subjectHeaders: string[];
    questions: ParsedDocQuestion[];
    warnings: string[];
  };
};

type RepairProvider = "both" | "gemini" | "openai";

type ProviderRepairResult = {
  provider: "gemini" | "openai";
  model: string;
  status: "repaired" | "skipped" | "error";
  data?: {
    subject?: string;
    marker?: string;
    passageMarker?: string;
    passage?: { text?: string; lines?: string[] };
    question?: { text?: string; lines?: string[] };
    choices?: string[];
    correctAnswerText?: string;
    questionTypeId?: number;
    atiFormat?: string;
    confidence?: number;
    notes?: string;
    raw?: string;
  } | null;
  error?: string;
};

type RepairResponse = {
  results: ProviderRepairResult[];
};

type StageResponse = {
  collection: string;
  savedCount: number;
  replacedCount: number;
  skippedCount: number;
  readyCount: number;
  issueCount: number;
  set: {
    name: string;
    slug: string;
    number: string;
  };
};

const DEFAULT_DOCX_PATH =
  "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Teas Version 7 Real Exams\\Teas Version 7 Real Exams\\Set 4\\ATI TEAS Version 7 - Update 4.docx";

function TeasDocImportContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [docxPath, setDocxPath] = useState(DEFAULT_DOCX_PATH);
  const [docFiles, setDocFiles] = useState<DocxFileSummary[]>([]);
  const [docRoot, setDocRoot] = useState("");
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [repairProvider, setRepairProvider] = useState<RepairProvider>("both");
  const [repairResults, setRepairResults] = useState<Record<number, RepairResponse>>({});
  const [repairingAll, setRepairingAll] = useState(false);
  const [repairProgress, setRepairProgress] = useState({ current: 0, total: 0 });
  const [staging, setStaging] = useState(false);
  const [stageResult, setStageResult] = useState<StageResponse | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    void loadDocFiles();
  }, [currentUser]);

  const loadDocFiles = async () => {
    if (!currentUser) return;
    setLoadingFiles(true);
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-doc-import/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not load DOCX files.");
      setDocFiles(payload.files || []);
      setDocRoot(payload.root || "");
      const firstAvailable = payload.files?.find((file: DocxFileSummary) => file.exists) || payload.files?.[0];
      if (firstAvailable && docxPath === DEFAULT_DOCX_PATH) setDocxPath(firstAvailable.path);
    } catch (filesError) {
      setError(filesError instanceof Error ? filesError.message : "Could not load DOCX files.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const parseDocx = async () => {
    if (!currentUser) {
      setError("Sign in as an admin before parsing TEAS documents.");
      return;
    }
    setLoading(true);
    setError("");
    setRepairResults({});
    setStageResult(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-doc-import/parse", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ docxPath }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not parse DOCX file.");
      setResult(payload as ParseResponse);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Could not parse DOCX file.");
    } finally {
      setLoading(false);
    }
  };

  const requestQuestionRepair = async (question: ParsedDocQuestion) => {
    if (!currentUser) {
      setError("Sign in as an admin before repairing TEAS document questions.");
      return null;
    }
    const token = await currentUser.getIdToken();
    const response = await fetch("/api/admin/teas-doc-import/repair", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: repairProvider,
          question: {
            ...question,
            passageCandidates: passageCandidatesForQuestion(question, questions),
          },
        }),
      });
    const payload = await response.json();
    if (!response.ok && !payload?.results) throw new Error(payload?.error || "Could not repair question.");
    return payload as RepairResponse;
  };

  const repairAllQuestions = async () => {
    if (!questions.length) return;
    setRepairingAll(true);
    setError("");
    setStageResult(null);
    setRepairProgress({ current: 0, total: questions.length });
    setRepairResults({});
    try {
      for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        setRepairProgress({ current: index + 1, total: questions.length });
        const repaired = await requestQuestionRepair(question);
        if (repaired) {
          setRepairResults((current) => ({ ...current, [question.index]: repaired }));
        }
      }
    } catch (repairError) {
      setError(repairError instanceof Error ? repairError.message : "Could not repair all questions.");
    } finally {
      setRepairingAll(false);
    }
  };

  const saveFinalStaging = async () => {
    if (!currentUser || !result) return;
    setStaging(true);
    setError("");
    setStageResult(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/teas-doc-import/stage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docxPath,
          parsed: result.parsed,
          repairResults,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not save final DOCX staging.");
      setStageResult(payload as StageResponse);
    } catch (stageError) {
      setError(stageError instanceof Error ? stageError.message : "Could not save final DOCX staging.");
    } finally {
      setStaging(false);
    }
  };

  const questions = result?.parsed.questions || [];
  const missingPromptCount = questions.filter((question) => question.needsLlmQuestion).length;
  const answerCount = questions.filter((question) => question.boldAnswers.length > 0).length;
  const repairedCount = questions.filter((question) =>
    repairResults[question.index]?.results?.some((item) => item.status === "repaired")
  ).length;
  const selectedDoc = useMemo(
    () => docFiles.find((file) => file.path === docxPath),
    [docFiles, docxPath]
  );

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Tools" },
            { label: "TEAS Docs Import" },
          ]}
          actions={currentUser ? <UserProfileBadge /> : null}
        />
        <main className="admin-page min-h-[calc(100vh-4rem)]">
          <AdminPageHeader
            eyebrow="ATI TEAS Import"
            title="TEAS Docs Import"
            description="Select a Word-based TEAS set, review the parsed questions, then repair missing or ambiguous rows with Gemini and ChatGPT."
            actions={
              <button
                type="button"
                onClick={() => void parseDocx()}
                disabled={loading || !docxPath.trim()}
                className="admin-button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Parsing" : "Parse DOCX"}
              </button>
            }
          />

          {error && (
            <AdminAlert tone="error" title="DOCX Import Error">
              {error}
            </AdminAlert>
          )}

          <AdminCard title="Source Document" description="Choose the Word file to inspect. The path remains editable for documents inside the configured root.">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <label className="block">
                <span className="admin-field-label mb-1 block">Select DOCX</span>
                <select
                  value={selectedDoc?.path || ""}
                  onChange={(event) => {
                    const next = docFiles.find((file) => file.path === event.target.value);
                    if (next) setDocxPath(next.path);
                  }}
                  className="admin-input w-full"
                  disabled={loadingFiles || docFiles.length === 0}
                >
                  <option value="">{loadingFiles ? "Loading documents" : "Choose a document"}</option>
                  {docFiles.map((file) => (
                    <option key={file.path} value={file.path} disabled={!file.exists}>
                      {file.relativePath}{file.exists ? "" : " (missing)"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="admin-field-label mb-1 block">LLM repair provider</span>
                <select
                  value={repairProvider}
                  onChange={(event) => setRepairProvider(event.target.value as RepairProvider)}
                  className="admin-input w-full"
                >
                  <option value="both">Gemini and ChatGPT</option>
                  <option value="gemini">Gemini only</option>
                  <option value="openai">ChatGPT only</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block">
              <span className="admin-field-label mb-1 block">DOCX path</span>
              <input
                value={docxPath}
                onChange={(event) => setDocxPath(event.target.value)}
                className="admin-input w-full"
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>Root: {docRoot || "Not loaded"}</span>
              <span>{docFiles.length} document{docFiles.length === 1 ? "" : "s"} found</span>
              {selectedDoc && <span>Selected: {formatBytes(selectedDoc.bytes)}</span>}
            </div>
          </AdminCard>

          {result && (
            <>
              <section className="my-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard label="Questions" value={questions.length} helper={`${result.parsed.paragraphCount} paragraphs parsed.`} />
                <AdminStatCard label="Answers Found" value={answerCount} helper="Bold answer text detected in DOCX." />
                <AdminStatCard label="Needs LLM" value={missingPromptCount} helper="Missing prompt or too few choices." />
                <AdminStatCard label="LLM Repaired" value={repairedCount} helper={`${stageResult?.savedCount || 0} saved to final staging.`} />
              </section>

              <AdminCard title="LLM Confirmation" description="Use one repair action to pair every parsed question with structured LLM output. Results are shown for review and are not saved automatically.">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-950">Gemini</p>
                      <AdminStatusBadge label={result.providerStatus.gemini ? "Configured" : "Missing key"} tone={result.providerStatus.gemini ? "green" : "amber"} />
                    </div>
                    <p className="text-sm text-gray-600">{result.llmConfirmation.gemini}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-950">ChatGPT / OpenAI</p>
                      <AdminStatusBadge label={result.providerStatus.chatgpt ? "Configured" : "Missing key"} tone={result.providerStatus.chatgpt ? "green" : "amber"} />
                    </div>
                    <p className="text-sm text-gray-600">{result.llmConfirmation.chatgpt}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void repairAllQuestions()}
                  disabled={repairingAll || questions.length === 0}
                  className="mt-4 admin-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {repairingAll ? `Repairing ${repairProgress.current} of ${repairProgress.total}` : "Repair All with LLM"}
                </button>
                <button
                  type="button"
                  onClick={() => void saveFinalStaging()}
                  disabled={staging || repairingAll || repairedCount === 0}
                  className="ml-3 mt-4 admin-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {staging ? "Saving Final Staging" : "Save Final Staging"}
                </button>
                {stageResult && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    Saved {stageResult.savedCount} final LLM question{stageResult.savedCount === 1 ? "" : "s"} to {stageResult.collection}
                    {stageResult.replacedCount ? ` and replaced ${stageResult.replacedCount} previous staged row${stageResult.replacedCount === 1 ? "" : "s"}` : ""}.
                    {stageResult.skippedCount ? ` Skipped ${stageResult.skippedCount} incomplete LLM row${stageResult.skippedCount === 1 ? "" : "s"}.` : ""}
                  </div>
                )}
              </AdminCard>

              <AdminCard title="All Questions With LLM Repair Details" className="mt-6" description="Review each parsed question beside its LLM repair result before the import step.">
                {missingPromptCount > 0 && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {missingPromptCount} extracted item{missingPromptCount === 1 ? "" : "s"} need LLM repair before they should be saved.
                  </div>
                )}
                <AdminTable>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Marker</th>
                      <th>Question</th>
                      <th>Choices</th>
                      <th>Answer</th>
                      <th>LLM Repair</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => {
                      const repaired = repairResults[question.index];
                      return (
                        <tr key={`${question.marker}-${question.index}`}>
                          <AdminTableCell>{question.index}</AdminTableCell>
                          <AdminTableCell>{question.subject || "Unknown"}</AdminTableCell>
                          <AdminTableCell nowrap={false}>{question.marker || "Unmarked"}</AdminTableCell>
                          <AdminTableCell nowrap={false}>
                            <div className="max-w-xl space-y-2 text-xs text-gray-700">
                              {question.passageLines.length > 0 && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                                  <p className="mb-1 font-semibold text-gray-800">Passage</p>
                                  <p>{question.passageLines.slice(0, 4).join(" ")}</p>
                                </div>
                              )}
                              <p>{question.prompt || "Missing prompt"}</p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>{question.choices.length}</AdminTableCell>
                          <AdminTableCell nowrap={false}>
                            <div className="max-w-md space-y-1">
                              {question.boldAnswers.slice(0, 3).map((answer) => (
                                <p key={answer} className="text-xs text-gray-700">{answer}</p>
                              ))}
                              {question.boldAnswers.length === 0 && <p className="text-xs text-gray-500">None</p>}
                            </div>
                          </AdminTableCell>
                          <AdminTableCell nowrap={false}>
                            <div className="min-w-64 max-w-xl space-y-2">
                              {repaired?.results?.length ? (
                                repaired.results.map((item) => (
                                  <RepairPanel key={`${question.index}-${item.provider}`} result={item} />
                                ))
                              ) : (
                                <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
                                  {repairingAll ? "Waiting for repair output." : "Run Repair All with LLM to generate details."}
                                </p>
                              )}
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            {repaired?.results?.some((item) => item.status === "repaired") ? (
                              <AdminStatusBadge label="Repaired" tone="green" />
                            ) : question.needsLlmQuestion ? (
                              <AdminStatusBadge label="Needs LLM" tone="amber" />
                            ) : (
                              <AdminStatusBadge label="Parsed" tone="green" />
                            )}
                          </AdminTableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </AdminTable>
              </AdminCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function passageCandidatesForQuestion(question: ParsedDocQuestion, questions: ParsedDocQuestion[]) {
  const groups = new Map<string, string[]>();
  questions.forEach((item) => {
    if (!item.passageMarker || item.passageLines.length === 0) return;
    if (!groups.has(item.passageMarker)) groups.set(item.passageMarker, item.passageLines);
  });
  const markers = Array.from(groups.keys());
  const currentIndex = markers.indexOf(question.passageMarker);
  const nearbyMarkers = markers.filter((_, index) => (
    question.subject !== "Reading" ||
    currentIndex < 0 ||
    Math.abs(index - currentIndex) <= 1
  ));
  return nearbyMarkers.map((marker) => ({
    marker,
    lines: groups.get(marker) || [],
  }));
}

function RepairPanel({ result }: { result: ProviderRepairResult }) {
  const repairedQuestion = result.data?.question?.text || result.data?.raw || "";
  const repairedPassage = result.data?.passage?.text || result.data?.passage?.lines?.join(" ") || "";
  const tone = result.status === "repaired" ? "green" : result.status === "skipped" ? "gray" : "red";
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-semibold text-gray-950">{result.provider === "openai" ? "ChatGPT" : "Gemini"} - {result.model}</p>
        <AdminStatusBadge label={result.status} tone={tone} />
      </div>
      {result.error && <p className="text-red-700">{result.error}</p>}
      {repairedPassage && (
        <div className="mb-2 rounded-lg border border-purple-100 bg-purple-50 p-2 text-gray-700">
          <p className="mb-1 font-semibold text-purple-800">
            Corrected Passage{result.data?.passageMarker ? ` - ${result.data.passageMarker}` : ""}
          </p>
          <p>{repairedPassage}</p>
        </div>
      )}
      {repairedQuestion && <p className="font-medium text-gray-800">{repairedQuestion}</p>}
      {result.data?.choices?.length ? (
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          {result.data.choices.map((choice) => <li key={choice}>{choice}</li>)}
        </ol>
      ) : null}
      {result.data?.correctAnswerText && (
        <p className="mt-2 text-gray-600">Answer: <span className="font-medium text-gray-900">{result.data.correctAnswerText}</span></p>
      )}
      {result.data?.notes && <p className="mt-2 text-gray-500">{result.data.notes}</p>}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export default function TeasDocImportPage() {
  return (
    <SidebarProvider>
      <TeasDocImportContent />
    </SidebarProvider>
  );
}
