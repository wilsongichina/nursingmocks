"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNursingEntranceExamQuiz } from "@/lib/firestore-operations";
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
  correctAnswer: unknown;
  solution: string;
  question_type_id: number;
  [key: string]: any;
}

type ImportIssueLevel = "warning" | "error" | "blocking";

type TeasScanImportIssue = {
  level: ImportIssueLevel;
  message: string;
  scanId?: string;
  questionId?: string | number;
};

type TeasScanRecord = {
  id: string;
  question?: { html?: string; text?: string } | string;
  questionContent?: { html?: string; text?: string };
  passage?: { html?: string; text?: string } | string | null;
  passageHtml?: string;
  questionHtml?: string;
  questionParts?: {
    questionHtml?: string;
    bodyHtml?: string;
    passageHtml?: string;
    passage?: string;
  };
  options?: Record<string, unknown> | unknown[];
  correctAnswer?: unknown;
  correct_answer?: unknown;
  correctAnswerLabels?: unknown;
  correctAnswerText?: unknown;
  solution?: string;
  explanation?: string;
  questionTypeId?: number;
  question_type_id?: number;
  atiFormat?: string | null;
  questionNumber?: string;
  needsReview?: boolean;
  issueCount?: number;
  sourceImageRequired?: boolean;
  imagePath?: string | null;
  image_path?: string | null;
  sourceFileName?: string;
  source?: {
    fileName?: string;
    inputPath?: string;
  };
  review?: {
    warnings?: string[];
    questionNumber?: string;
    subject?: string;
    selectedAnswer?: unknown;
  };
  scanOrder?: number;
};

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
  const [quizSubjectName, setQuizSubjectName] = useState("");
  const [quizSetNumber, setQuizSetNumber] = useState("");
  const [quizExamYear, setQuizExamYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadingTeasScans, setLoadingTeasScans] = useState(false);
  const [includeTeasReviewRecords, setIncludeTeasReviewRecords] = useState(true);
  const [teasScanIssues, setTeasScanIssues] = useState<TeasScanImportIssue[]>([]);
  const [teasScanSource, setTeasScanSource] = useState("");
  const [forceImportConfirmed, setForceImportConfirmed] = useState(false);
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
          setQuizSubjectName(quizData.subjectName || quizData.hero?.title || "");
          setQuizSetNumber(quizData.setNumber != null ? String(quizData.setNumber) : "");
          setQuizExamYear(
            quizData.examYear != null
              ? String(quizData.examYear)
              : quizData.year != null
              ? String(quizData.year)
              : ""
          );
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
      setTeasScanIssues([]);
      setTeasScanSource("");
      setForceImportConfirmed(false);
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

  const normalizeTeasSubject = (value: string) => {
    const text = value.toLowerCase().replace(/&/g, "and");
    if (text.includes("math")) return "Mathematics";
    if (text.includes("science")) return "Science";
    if (text.includes("english")) return "English and Language Usage";
    if (text.includes("reading")) return "Reading";
    return value.trim();
  };

  const decodeEscapedText = (value: unknown) => {
    let text = String(value ?? "");
    for (let pass = 0; pass < 3; pass += 1) {
      const decoded = text
        .replace(/\\+u([0-9a-fA-F]{4})/g, (_, hex: string) =>
          String.fromCharCode(Number.parseInt(hex, 16))
        )
        .replace(/\\+n/g, "\n")
        .replace(/\\+t/g, "\t")
        .replace(/\\+r/g, "\r");
      if (decoded === text) break;
      text = decoded;
    }
    return text
      .replace(/&pi;/gi, "π")
      .replace(/&#960;/gi, "π")
      .replace(/&#x3c0;/gi, "π")
      .replace(/&times;/gi, "×")
      .replace(/&divide;/gi, "÷")
      .replace(/&nbsp;/gi, " ");
  };

  const recordQuestionHtml = (record: TeasScanRecord) => {
    if (record.questionContent?.html) return decodeEscapedText(record.questionContent.html);
    if (typeof record.question === "object" && record.question?.html) return decodeEscapedText(record.question.html);
    return decodeEscapedText(
      record.questionParts?.questionHtml ||
      record.questionHtml ||
      record.questionParts?.bodyHtml ||
      (typeof record.question === "string" ? record.question : "") ||
      ""
    );
  };

  const recordPassageHtml = (record: TeasScanRecord) => {
    if (typeof record.passage === "object" && record.passage?.html) return decodeEscapedText(record.passage.html);
    if (typeof record.passage === "string") return decodeEscapedText(record.passage);
    return decodeEscapedText(record.passageHtml || record.questionParts?.passageHtml || record.questionParts?.passage || "");
  };

  const questionNumberFromScan = (record: TeasScanRecord) => {
    const raw = String(record.questionNumber || record.review?.questionNumber || "").trim();
    const match = raw.match(/\d+/);
    return match?.[0] || "";
  };

  const sourceImageName = (record: TeasScanRecord) =>
    record.sourceFileName || record.source?.fileName || "";

  const normalizedCorrectAnswerFromScan = (record: TeasScanRecord) => {
    const labelSource = record.correctAnswerLabels;
    if (Array.isArray(labelSource) && labelSource.length > 0) {
      const labels = labelSource.map((label) => String(label).trim().toUpperCase()).filter(Boolean);
      return labels.length === 1 ? labels[0] : labels;
    }
    if (typeof labelSource === "string" && labelSource.trim()) {
      const labels = labelSource
        .split(/[,\s]+/)
        .map((label) => label.trim().toUpperCase())
        .filter(Boolean);
      return labels.length === 1 ? labels[0] : labels;
    }

    const directAnswer = record.correctAnswer ?? record.correct_answer ?? record.review?.selectedAnswer;
    if (String(directAnswer ?? "").trim()) return directAnswer;

    // Preview/export records can carry fill-in or text answers without a label.
    return record.correctAnswerText ?? "";
  };

  const optionObjectFromScan = (options: TeasScanRecord["options"]) => {
    if (!options) return {};
    if (Array.isArray(options)) {
      return options.reduce<Record<string, { choice: string }>>((output, option, index) => {
        const label = String.fromCharCode(65 + index);
        output[label] = { choice: decodeEscapedText(formatOptionValue(option)) };
        return output;
      }, {});
    }
    if (typeof options === "object") {
      return Object.fromEntries(
        Object.entries(options).map(([label, option]) => {
          if (option && typeof option === "object" && !Array.isArray(option)) {
            return [
              label,
              {
                ...option,
                choice: decodeEscapedText(formatOptionValue(option)),
              },
            ];
          }
          return [label, { choice: decodeEscapedText(formatOptionValue(option)) }];
        })
      );
    }
    return {};
  };

  const stableQuestionId = (record: TeasScanRecord, index: number) => {
    const subjectSlug = normalizeTeasSubject(quizSubjectName || quizName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const questionNumber = questionNumberFromScan(record);
    const fallbackNumber = String(index + 1).padStart(3, "0");
    return `teas-set-${quizSetNumber || "unknown"}-${subjectSlug || "subject"}-q${String(
      questionNumber || fallbackNumber
    ).padStart(3, "0")}`;
  };

  const issuesForScanRecord = (
    record: TeasScanRecord,
    convertedQuestion: ParsedQuestion
  ): TeasScanImportIssue[] => {
    const issues: TeasScanImportIssue[] = [];
    const questionText = String(convertedQuestion.question || "").trim();
    const answer = convertedQuestion.correctAnswer;
    const optionCount = parseOptions(convertedQuestion.options).length;
    const questionTypeId = Number(convertedQuestion.question_type_id || 1);
    const scanQuestionNumber = questionNumberFromScan(record);
    const warnings = Array.isArray(record.review?.warnings) ? record.review.warnings : [];

    if (!questionText) {
      issues.push({ level: "blocking", message: "Question text is missing." });
    }
    if (!String(answer ?? "").trim()) {
      issues.push({ level: "blocking", message: "Correct answer is missing." });
    }
    if (![1, 2, 6, 7, 9].includes(questionTypeId)) {
      issues.push({ level: "blocking", message: `Unsupported question type ${questionTypeId}.` });
    }
    if (!scanQuestionNumber) {
      issues.push({ level: "error", message: "Question number is missing." });
    }
    if (record.needsReview) {
      issues.push({ level: "error", message: "Scan is marked Needs Review." });
    }
    if (record.sourceImageRequired && !String(record.imagePath || record.image_path || "").trim()) {
      issues.push({ level: "error", message: "Source image is required but no image path is attached." });
    }
    if (questionTypeId !== 7 && questionTypeId !== 9 && optionCount < 2) {
      issues.push({ level: "error", message: `Only ${optionCount} answer options were found.` });
    }
    warnings.slice(0, 5).forEach((warning) => {
      issues.push({ level: "warning", message: warning });
    });

    return issues.map((issue) => ({
      ...issue,
      scanId: record.id,
      questionId: convertedQuestion.id,
    }));
  };

  const convertTeasScanToQuestion = (record: TeasScanRecord, index: number): ParsedQuestion => {
    const questionTypeId = Number(record.questionTypeId || record.question_type_id || 1);
    const questionId = stableQuestionId(record, index);
    return {
      id: questionId,
      question: recordQuestionHtml(record),
      passage: recordPassageHtml(record),
      options: optionObjectFromScan(record.options),
      correctAnswer: normalizedCorrectAnswerFromScan(record),
      solution: decodeEscapedText(record.solution || record.explanation || ""),
      question_type_id: questionTypeId,
      image_path: record.imagePath || record.image_path || null,
      importReview: {
        source: "teasScannedQuestions",
        scanId: record.id,
        sourceFileName: sourceImageName(record),
        sourceImageRequired: Boolean(record.sourceImageRequired),
        importedWithIssues: false,
        issues: [],
        setNumber: quizSetNumber || null,
        examYear: quizExamYear || null,
        subject: normalizeTeasSubject(quizSubjectName || quizName),
      },
    };
  };

  const handleLoadTeasScans = async () => {
    if (!currentUser) {
      setError("Admin session is required to load TEAS scans.");
      return;
    }
    if (!quizSetNumber) {
      setError("Set number is required on the target quiz before loading TEAS scans.");
      return;
    }
    const subject = normalizeTeasSubject(quizSubjectName || quizName);
    if (!subject) {
      setError("Could not determine the TEAS subject for this quiz.");
      return;
    }

    try {
      setLoadingTeasScans(true);
      setError("");
      setSuccess("");
      setForceImportConfirmed(false);
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({
        setNumber: quizSetNumber,
        subject,
        sort: "questionNumber",
        limit: "2500",
        filter: includeTeasReviewRecords ? "all" : "clean",
      });
      const response = await fetch(`/api/admin/teas-image-import/scanned-questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not load TEAS scans.");

      const records = ((payload.records || []) as TeasScanRecord[]).sort((left, right) => {
        const leftNumber = Number(questionNumberFromScan(left) || Number.MAX_SAFE_INTEGER);
        const rightNumber = Number(questionNumberFromScan(right) || Number.MAX_SAFE_INTEGER);
        if (leftNumber !== rightNumber) return leftNumber - rightNumber;
        return Number(left.scanOrder || 0) - Number(right.scanOrder || 0);
      });
      const seenQuestionIds = new Map<string, number>();
      const duplicateIdIssues: TeasScanImportIssue[] = [];
      const questions = records.map((record, index) => {
        const question = convertTeasScanToQuestion(record, index);
        const baseId = String(question.id);
        const nextCount = (seenQuestionIds.get(baseId) || 0) + 1;
        seenQuestionIds.set(baseId, nextCount);
        if (nextCount > 1) {
          question.id = `${baseId}-${nextCount}`;
          duplicateIdIssues.push({
            level: "error",
            message: `Duplicate question number generated ${baseId}; using ${question.id} to avoid overwriting.`,
            scanId: record.id,
            questionId: question.id,
          });
        }
        return question;
      });
      const issueRows = questions.flatMap((question, index) => {
        const issues = [
          ...issuesForScanRecord(records[index], question),
          ...duplicateIdIssues.filter((issue) => issue.questionId === question.id),
        ];
        question.importReview = {
          ...question.importReview,
          importedWithIssues: issues.length > 0,
          issues,
        };
        return issues;
      });

      const nextJson = JSON.stringify({ questions }, null, 2);
      setJsonInput(nextJson);
      setParsedQuestions(questions);
      setTeasScanIssues(issueRows);
      setTeasScanSource(`${subject} Set ${quizSetNumber}${quizExamYear ? ` (${quizExamYear})` : ""}`);
      setPreviewExpanded(true);
      setCurrentPage(1);
      setSuccess(`Loaded ${questions.length} questions from TEAS scans.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load TEAS scans.");
    } finally {
      setLoadingTeasScans(false);
    }
  };

  const handleBulkUpload = async () => {
    if (parsedQuestions.length === 0) {
      setError("No questions to upload. Please parse JSON first.");
      return;
    }

    if (!resolvedParams) return;
    if (!currentUser) {
      setError("Admin session is required to import questions.");
      return;
    }
    const blockingIssues = teasScanIssues.filter((issue) => issue.level === "blocking");
    if (blockingIssues.length > 0) {
      setError(`Fix ${blockingIssues.length} blocking issue${blockingIssues.length === 1 ? "" : "s"} before importing.`);
      return;
    }
    if (teasScanIssues.length > 0 && !forceImportConfirmed) {
      setShowUploadConfirm(true);
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      setShowUploadConfirm(false);

      const token = await currentUser.getIdToken();
      const uploadResponse = await fetch("/api/admin/nursing-entrance-exam/bulk-upload-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subPageId: resolvedParams.subPageId,
          nestedSubPageId: resolvedParams.nestedSubPageId,
          quizId: resolvedParams.quizId,
          questions: parsedQuestions,
        }),
      });
      const result = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(result?.error || "Failed to upload questions.");
      }

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
    if (typeof option !== "object") return decodeEscapedText(option);
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

    return decodeEscapedText(Object.values(option).map(formatOptionValue).filter(Boolean).join(" "));
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
  const warningIssueCount = teasScanIssues.filter((issue) => issue.level === "warning").length;
  const errorIssueCount = teasScanIssues.filter((issue) => issue.level === "error").length;
  const blockingIssueCount = teasScanIssues.filter((issue) => issue.level === "blocking").length;
  const blockingIssues = teasScanIssues.filter((issue) => issue.level === "blocking");
  const targetTeasSubject = normalizeTeasSubject(quizSubjectName || quizName);
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
          <AdminCard
            title="Load From TEAS Scans"
            description="Prefill this bulk upload from saved TEAS image scans for the current quiz subject and set."
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="admin-info-tile p-3">
                  <div className="admin-info-tile-label">Subject</div>
                  <div className="admin-card-title mt-1">{targetTeasSubject || "Not detected"}</div>
                </div>
                <div className="admin-info-tile p-3">
                  <div className="admin-info-tile-label">Set</div>
                  <div className="admin-card-title mt-1">{quizSetNumber || "Missing"}</div>
                </div>
                <div className="admin-info-tile p-3">
                  <div className="admin-info-tile-label">Year</div>
                  <div className="admin-card-title mt-1">{quizExamYear || "Not set"}</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={includeTeasReviewRecords}
                    onChange={(event) => setIncludeTeasReviewRecords(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Include records marked Needs Review</span>
                </label>
                <button
                  type="button"
                  onClick={handleLoadTeasScans}
                  disabled={loadingTeasScans || !quizSetNumber || !targetTeasSubject}
                  className="admin-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingTeasScans ? "Loading Scans..." : "Load Scans Into JSON"}
                </button>
              </div>
            </div>
            {teasScanSource && (
              <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm text-purple-900">
                Loaded source: <strong>{teasScanSource}</strong>. Warnings: {warningIssueCount}. Errors: {errorIssueCount}. Blocking: {blockingIssueCount}.
              </div>
            )}
            {teasScanIssues.length > 0 && (
              <div className="mt-4 max-h-56 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50">
                <div className="border-b border-amber-200 px-3 py-2 text-sm font-semibold text-amber-950">
                  Import Issues
                </div>
                <div className="divide-y divide-amber-100">
                  {teasScanIssues.slice(0, 80).map((issue, index) => (
                    <div key={`${issue.scanId}-${index}`} className="px-3 py-2 text-sm text-amber-950">
                      <span
                        className={`mr-2 inline-flex rounded border px-2 py-0.5 text-xs font-semibold uppercase ${
                          issue.level === "blocking"
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-amber-300 bg-white text-amber-900"
                        }`}
                      >
                        {issue.level}
                      </span>
                      <span className="font-medium">{issue.questionId || issue.scanId || "Scan"}</span>
                      <span className="mx-1">-</span>
                      <span>{issue.message}</span>
                      {issue.scanId && (
                        <Link
                          href={`/admin/teas-image-import/scans/${issue.scanId}/edit`}
                          className="ml-2 font-semibold text-purple-700 underline-offset-2 hover:underline"
                        >
                          Edit scan
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AdminCard>
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
                                __html: decodeEscapedText(q.question || "No question text"),
                              }}
                            />
                            {q.passage && (
                              <div className="mb-3 rounded-lg border border-purple-100 bg-purple-50 p-3">
                                <p className="admin-card-title mb-1 text-purple-950">
                                  Passage
                                </p>
                                <div
                                  className="admin-body-sm text-purple-950"
                                  dangerouslySetInnerHTML={{ __html: decodeEscapedText(q.passage) }}
                                />
                              </div>
                            )}
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
                                          dangerouslySetInnerHTML={{ __html: decodeEscapedText(opt) }}
                                        />
                                        {isCorrect && (
                                          <span className="ml-2 inline-block font-semibold text-emerald-700">
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
                                    __html: decodeEscapedText(q.solution || "").substring(0, 240) + "...",
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
                      setTeasScanIssues([]);
                      setTeasScanSource("");
                      setForceImportConfirmed(false);
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
              description={
                teasScanIssues.length > 0
                  ? `Import ${parsedQuestions.length} questions with ${teasScanIssues.length} highlighted issue${teasScanIssues.length === 1 ? "" : "s"}.`
                  : `Import ${parsedQuestions.length} parsed questions into this quiz.`
              }
              maxWidthClassName="max-w-[460px]"
            >
              <p className="admin-body">
                This will create question records under{" "}
                <strong>{quizName || resolvedParams.quizId}</strong>. Review the
                parsed preview before confirming.
              </p>
              {teasScanIssues.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-950">
                    This import has unresolved scan issues.
                  </p>
                  <p className="mt-1 text-sm text-amber-900">
                    Warnings: {warningIssueCount}. Errors: {errorIssueCount}. Blocking: {blockingIssueCount}.
                    {blockingIssueCount > 0
                      ? " Blocking issues must be fixed before import."
                      : " Non-blocking issues will be saved on each imported question for later review."}
                  </p>
                  {blockingIssues.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {blockingIssues.map((issue, index) => (
                        <div key={`${issue.scanId || issue.questionId || "blocking"}-${index}`} className="rounded border border-red-200 bg-white p-2 text-sm text-red-900">
                          <div className="font-semibold">
                            {issue.questionId || issue.scanId || "Blocking issue"}
                          </div>
                          <div>{issue.message}</div>
                          {issue.scanId && (
                            <Link
                              href={`/admin/teas-image-import/scans/${issue.scanId}/edit`}
                              className="mt-1 inline-flex font-semibold text-purple-700 underline-offset-2 hover:underline"
                            >
                              Edit this scan
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {blockingIssueCount === 0 && (
                    <label className="mt-3 flex items-start gap-2 text-sm text-amber-950">
                      <input
                        type="checkbox"
                        checked={forceImportConfirmed}
                        onChange={(event) => setForceImportConfirmed(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-amber-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>I understand and want to import these questions with highlighted issues.</span>
                    </label>
                  )}
                </div>
              )}
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
                  disabled={
                    uploading ||
                    parsedQuestions.length === 0 ||
                    blockingIssueCount > 0 ||
                    (teasScanIssues.length > 0 && !forceImportConfirmed)
                  }
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



