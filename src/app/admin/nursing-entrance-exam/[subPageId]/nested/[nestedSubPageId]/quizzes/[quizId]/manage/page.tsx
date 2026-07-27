"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getNursingEntranceExamQuizQuestions,
  uploadNursingEntranceExamQuizQuestion,
  deleteNursingEntranceExamQuizQuestion,
  getNursingEntranceExamQuiz,
  uploadNursingEntranceExamQuiz,
  getNestedSubPage,
  getNursingEntranceExamSubPage,
  getPillarPageContent,
  getAllQuestionTypes,
} from "@/lib/firestore-operations";
import Link from "next/link";
import {
  AdminAlert,
  AdminDestructiveDialog,
  AdminLoadingState,
  AdminNotificationRegion,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl } from "@/lib/config";
import { buildEntranceQuizSchemaMarkup } from "@/lib/seo/structured-data";
import {
  normalizeAdminContentName,
  normalizeAdminContentNameInput,
  normalizeAdminContentSlug,
} from "@/lib/admin/content-naming";

interface Question {
  id: string;
  questionId?: string;
  question?: string;
  passage?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  explanationStatus?: string;
  answerReviewReason?: string;
  lastUpdated?: string;
  questionTypeId?: number;
  question_type_id?: number;
}

interface QuestionType {
  id: string;
  questionTypeId: string;
  questionTypeName: string;
}

interface QuizMetadataContent {
  pageName: string;
  slug: string;
  status: "Draft" | "Published" | "Archived";
  examAccessProductId: "ati_teas_7" | "hesi_a2";
  subjectName: string;
  setNumber: string;
  examYear: string;
  previewPercentage: string;
  estimatedMinutes: string;
  description: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  schema: string;
  hero: {
    title: string;
    description: string;
  };
}

function normalizeSlug(value: string) {
  return normalizeAdminContentSlug(value);
}

function quizStatusFromData(value: unknown, active: unknown): "Draft" | "Published" | "Archived" {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "published") return "Published";
    if (normalized === "archived") return "Archived";
    if (normalized === "draft") return "Draft";
  }
  return active === false ? "Draft" : "Published";
}

function QuizMetadataPanel({
  initialMetadata,
  fallbackSlug,
  saving,
  generateSchema,
  onSave,
}: {
  initialMetadata: QuizMetadataContent;
  fallbackSlug: string;
  saving: boolean;
  generateSchema: (metadata: QuizMetadataContent) => string;
  onSave: (metadata: QuizMetadataContent) => Promise<void>;
}) {
  const [draft, setDraft] = useState(initialMetadata);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    const schema = generateSchema(initialMetadata);
    const normalizedName = normalizeAdminContentName(initialMetadata.pageName);
    setDraft({
      ...initialMetadata,
      pageName: normalizedName,
      schema,
    });
    setSlugManuallyEdited(
      normalizeSlug(initialMetadata.slug) !== normalizeSlug(normalizedName)
    );
  }, [fallbackSlug, generateSchema, initialMetadata]);

  const updateField = <
    TField extends keyof Omit<QuizMetadataContent, "meta" | "hero">,
  >(
    field: TField,
    value: QuizMetadataContent[TField]
  ) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateMetaField = (
    field: keyof QuizMetadataContent["meta"],
    value: string
  ) => {
    setDraft((previous) => ({
      ...previous,
      meta: {
        ...previous.meta,
        [field]: value,
      },
    }));
  };

  const normalizedPublicSlug = normalizeSlug(draft.slug || fallbackSlug);
  const updatePageName = (value: string) => {
    const normalizedInput = normalizeAdminContentNameInput(value);
    setDraft((previous) => ({
      ...previous,
      pageName: normalizedInput,
      slug: slugManuallyEdited
        ? previous.slug
        : normalizeSlug(normalizedInput || fallbackSlug),
    }));
  };

  return (
    <section className="admin-card mb-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="admin-section-title">
            Quiz Metadata
          </div>
          <div className="admin-helper mt-1">
            Manage the public quiz title, access relationship, preview rules, and SEO values.
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSave(draft)}
          disabled={saving}
          className="admin-button-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Quiz Metadata"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-field-label">
                Quiz Name
              </label>
              <input
                type="text"
                value={draft.pageName}
                onChange={(event) => updatePageName(event.target.value)}
                onBlur={() => updatePageName(normalizeAdminContentName(draft.pageName))}
                className="admin-field mt-2"
                placeholder="HESI A2 Mathematics Set 1"
              />
            </div>
            <div>
              <label className="admin-field-label">
                Slug
              </label>
              <input
                type="text"
                value={draft.slug}
                onChange={(event) => {
                  setSlugManuallyEdited(true);
                  updateField("slug", normalizeSlug(event.target.value));
                }}
                onBlur={(event) =>
                  updateField("slug", normalizeSlug(event.target.value))
                }
                className="admin-field mt-2"
                placeholder="hesi-a2-math-practice-test-set-1"
              />
              <p className="admin-helper mt-1">
                Public URL: /{normalizedPublicSlug || fallbackSlug}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="admin-field-label">
                Exam Product
              </label>
              <select
                value={draft.examAccessProductId}
                onChange={(event) =>
                  updateField(
                    "examAccessProductId",
                    event.target.value as QuizMetadataContent["examAccessProductId"]
                  )
                }
                className="admin-field mt-2"
              >
                <option value="ati_teas_7">ATI TEAS 7</option>
                <option value="hesi_a2">HESI A2</option>
              </select>
            </div>
            <div>
              <label className="admin-field-label">
                Subject
              </label>
              <input
                type="text"
                value={draft.subjectName}
                onChange={(event) => updateField("subjectName", event.target.value)}
                className="admin-field mt-2"
                placeholder="Mathematics"
              />
            </div>
            <div>
              <label className="admin-field-label">
                Set Number
              </label>
              <input
                type="number"
                min="1"
                value={draft.setNumber}
                onChange={(event) => updateField("setNumber", event.target.value)}
                className="admin-field mt-2"
              />
            </div>
            <div>
              <label className="admin-field-label">
                Year
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={draft.examYear}
                onChange={(event) => updateField("examYear", event.target.value)}
                className="admin-field mt-2"
                placeholder="2026"
              />
            </div>
            <div>
              <label className="admin-field-label">
                Status
              </label>
              <select
                value={draft.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as QuizMetadataContent["status"]
                  )
                }
                className="admin-field mt-2"
              >
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-field-label">
                Preview Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={draft.previewPercentage}
                onChange={(event) =>
                  updateField("previewPercentage", event.target.value)
                }
                className="admin-field mt-2"
              />
              <p className="admin-helper mt-1">
                Controls the unpaid preview limit based on total questions.
              </p>
            </div>
            <div>
              <label className="admin-field-label">
                Estimated Minutes
              </label>
              <input
                type="number"
                min="1"
                value={draft.estimatedMinutes}
                onChange={(event) =>
                  updateField("estimatedMinutes", event.target.value)
                }
                className="admin-field mt-2"
                placeholder="45"
              />
            </div>
          </div>

          <div>
            <label className="admin-field-label">
              Public Description
            </label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="admin-field mt-2"
              placeholder="Describe what students practice in this quiz set."
            />
          </div>
        </div>

        <div className="admin-info-tile space-y-4 p-4">
          <div>
            <div className="admin-card-title">
              SEO, Social, And Schema
            </div>
            <p className="admin-helper mt-1">
              These fields will support the generated public quiz page.
            </p>
          </div>
          <div>
            <label className="admin-field-label">
              Meta Title
            </label>
            <input
              type="text"
              value={draft.meta.title}
              onChange={(event) => updateMetaField("title", event.target.value)}
              className="admin-field mt-2 bg-white"
            />
          </div>
          <div>
            <label className="admin-field-label">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={draft.meta.description}
              onChange={(event) =>
                updateMetaField("description", event.target.value)
              }
              className="admin-field mt-2 bg-white"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="admin-field-label">
                Keywords
              </label>
              <input
                type="text"
                value={draft.meta.keywords}
                onChange={(event) =>
                  updateMetaField("keywords", event.target.value)
                }
                className="admin-field mt-2 bg-white"
              />
            </div>
            <div>
              <label className="admin-field-label">
                OG Image
              </label>
              <input
                type="text"
                value={draft.meta.ogImage}
                onChange={(event) =>
                  updateMetaField("ogImage", event.target.value)
                }
                className="admin-field mt-2 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="admin-field-label">
              Canonical URL
            </label>
            <input
              type="text"
              value={draft.meta.canonicalUrl}
              onChange={(event) =>
                updateMetaField("canonicalUrl", event.target.value)
              }
              className="admin-field mt-2 bg-white"
            />
          </div>
          <div>
            <label className="admin-field-label">
              Schema Markup
            </label>
            <textarea
              rows={5}
              value={draft.schema}
              readOnly
              className="admin-field mt-2 font-mono text-xs"
              placeholder='{"@context":"https://schema.org","@type":"Quiz"}'
            />
            <p className="admin-helper mt-1">
              Generated automatically from the quiz metadata, parent tree, and public preview questions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ManageQuizQuestions({
  params,
}: {
  params: Promise<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  }>;
}) {
  const { currentUser } = useAuth();
  const explanationAbortController = useRef<AbortController | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvedParams, setResolvedParams] = useState<{
    subPageId: string;
    nestedSubPageId: string;
    quizId: string;
  } | null>(null);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [newQuestionId, setNewQuestionId] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [quizSetNumber, setQuizSetNumber] = useState<string | number>("");
  const [quizMetadata, setQuizMetadata] = useState<QuizMetadataContent | null>(null);
  const [_parentSlug, setParentSlug] = useState("");
  const [_nestedSlug, setNestedSlug] = useState("");
  const [quizSlug, setQuizSlug] = useState("");
  const [_pillarPageContent, setPillarPageContent] = useState<any>(null);
  const [_parentSubPageContent, setParentSubPageContent] = useState<any>(null);
  const [_nestedSubPageContent, setNestedSubPageContent] = useState<any>(null);
  const [parentSubPageName, setParentSubPageName] = useState("");
  const [nestedSubPageName, setNestedSubPageName] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [generatingExplanations, setGeneratingExplanations] = useState(false);
  const [regenerateExplanations, setRegenerateExplanations] = useState(false);
  const [explanationProgress, setExplanationProgress] = useState<{
    total: number;
    completed: number;
    generated: number;
    skipped: number;
    failed: number;
    needsReview: number;
    currentQuestionId: string;
  } | null>(null);
  const questionsPerPage = 10;

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  };

  // Generate slug from question text (first 180 characters)
  const generateSlug = (questionText: string): string => {
    if (!questionText) return "";
    const cleanText = stripHtmlTags(questionText);
    const truncated = cleanText.substring(0, 180);
    const slug = truncated
      .toLowerCase()
      .replace(/nbsp/g, "")
      .replace(/&nbsp;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug;
  };

  // Get question type name from ID
  const getQuestionTypeName = (questionTypeId?: number): string => {
    if (!questionTypeId) return "Unknown";
    const type = questionTypes.find(
      (t) => t.questionTypeId === questionTypeId.toString()
    );
    return type?.questionTypeName || `Type ${questionTypeId}`;
  };

  const buildSchemaQuestionList = useCallback((previewPercentage: number) => {
    const allowedQuestionTypes = [1, 2, 3, 7];
    const publicQuestions = questions.filter((question) => {
      const questionTypeId = Number(question.questionTypeId || question.question_type_id);
      return allowedQuestionTypes.includes(questionTypeId);
    });
    const visibleLimit =
      publicQuestions.length > 0 && previewPercentage > 0
        ? Math.min(publicQuestions.length, Math.max(1, Math.ceil((publicQuestions.length * previewPercentage) / 100)))
        : 0;

    // Match the statically generated public quiz page: only preview-visible questions belong in JSON-LD.
    return publicQuestions.slice(0, visibleLimit).map((question) => {
      return {
        id: question.id,
        question: question.question,
      };
    });
  }, [questions]);

  const buildGeneratedQuizSchema = useCallback(
    (metadata: QuizMetadataContent) => {
      const normalizedQuizSlug = normalizeSlug(metadata.slug || resolvedParams?.quizId || "");
      const setNumber = metadata.setNumber.trim()
        ? Number(metadata.setNumber)
        : undefined;
      const previewPercentage = metadata.previewPercentage.trim()
        ? Number(metadata.previewPercentage)
        : 20;
      const estimatedMinutes = metadata.estimatedMinutes.trim()
        ? Number(metadata.estimatedMinutes)
        : undefined;
      const quizTitle = metadata.pageName.trim() || quizName || resolvedParams?.quizId || "Practice Quiz";
      const parentName = parentSubPageName || resolvedParams?.subPageId || "Nursing Entrance Exam";
      const nestedName = nestedSubPageName || metadata.subjectName || resolvedParams?.nestedSubPageId || "Practice Set";

      return buildEntranceQuizSchemaMarkup({
        slug: normalizedQuizSlug || resolvedParams?.quizId || "",
        quizName: quizTitle,
        description:
          metadata.description ||
          metadata.hero.description ||
          metadata.meta.description,
        examProductName:
          metadata.examAccessProductId === "hesi_a2" ? "HESI A2" : "ATI TEAS 7",
        subjectName: metadata.subjectName.trim() || nestedName,
        categoryName: "Nursing Entrance Exam",
        setNumber: Number.isFinite(setNumber) ? setNumber : undefined,
        estimatedMinutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : undefined,
        questionCount: questions.length,
        breadcrumbs: [
          { name: "Nursing Entrance Exam", slug: "nursing-entrance-exam" },
          { name: parentName, slug: _parentSlug || resolvedParams?.subPageId },
          { name: nestedName, slug: _nestedSlug || resolvedParams?.nestedSubPageId },
          { name: quizTitle, slug: normalizedQuizSlug || resolvedParams?.quizId },
        ],
        questions: buildSchemaQuestionList(
          Number.isFinite(previewPercentage) ? previewPercentage : 20
        ),
      });
    },
    [
      _nestedSlug,
      _parentSlug,
      nestedSubPageName,
      parentSubPageName,
      questions,
      quizName,
      resolvedParams,
      buildSchemaQuestionList,
    ]
  );

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

  const loadQuestions = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!resolvedParams) return;

    try {
      if (!options.silent) {
        setLoading(true);
      }
      const result = await getNursingEntranceExamQuizQuestions(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId
      );
      if (result.success && result.data) {
        setQuestions(result.data);
      }

      // Load pillar page content
      const pillarResult = await getPillarPageContent("nursing-entrance-exam");
      if (pillarResult.success && pillarResult.data) {
        setPillarPageContent(pillarResult.data);
      }

      // Load quiz name and slugs for display
      const quizResult = await getNursingEntranceExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId
      );
      if (quizResult.success && quizResult.data) {
        const quizData = quizResult.data as any;
        setQuizName(quizData.pageName || resolvedParams.quizId);
        setQuizSlug(quizData.slug || resolvedParams.quizId);
        setQuizSetNumber(quizData.setNumber ?? "");
        const inferredSubjectName =
          quizData.subjectName ||
          quizData.hero?.title ||
          quizData.pageName ||
          "";
        const loadedSlug = quizData.slug || resolvedParams.quizId;
        setQuizMetadata({
          pageName: quizData.pageName || quizData.quizName || resolvedParams.quizId,
          slug: loadedSlug,
          status: quizStatusFromData(quizData.status, quizData.active),
          examAccessProductId:
            quizData.examAccessProductId === "hesi_a2" ? "hesi_a2" : "ati_teas_7",
          subjectName: inferredSubjectName,
          setNumber: quizData.setNumber != null ? String(quizData.setNumber) : "",
          examYear: quizData.examYear != null ? String(quizData.examYear) : quizData.year != null ? String(quizData.year) : "",
          previewPercentage:
            quizData.previewPercentage != null ? String(quizData.previewPercentage) : "20",
          estimatedMinutes:
            quizData.estimatedMinutes != null ? String(quizData.estimatedMinutes) : "",
          description:
            quizData.description ||
            quizData.hero?.description ||
            quizData.meta?.description ||
            "",
          meta: {
            title:
              quizData.meta?.title ||
              `${quizData.pageName || quizData.quizName || resolvedParams.quizId} | NursingMocks`,
            description: quizData.meta?.description || "",
            keywords: quizData.meta?.keywords || "",
            ogTitle:
              quizData.meta?.ogTitle ||
              quizData.pageName ||
              quizData.quizName ||
              resolvedParams.quizId,
            ogDescription: quizData.meta?.ogDescription || quizData.meta?.description || "",
            ogImage: quizData.meta?.ogImage || "/nursing-mocks-logo.png",
            canonicalUrl: quizData.meta?.canonicalUrl || `${getSiteUrl()}/${loadedSlug}`,
          },
          schema: quizData.schema || "",
          hero: {
            title:
              quizData.hero?.title ||
              quizData.pageName ||
              quizData.quizName ||
              resolvedParams.quizId,
            description: quizData.hero?.description || quizData.description || "",
          },
        });
      }

      // Load parent and nested sub-page content
      const parentResult = await getNursingEntranceExamSubPage(
        resolvedParams.subPageId
      );
      if (parentResult.success && parentResult.data) {
        const parentData = parentResult.data as any;
        setParentSubPageContent(parentData);
        setParentSubPageName(parentData.pageName || resolvedParams.subPageId);
        setParentSlug(parentData.slug || resolvedParams.subPageId);
      }

      const nestedResult = await getNestedSubPage(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId
      );
      if (nestedResult.success && nestedResult.data) {
        const nestedData = nestedResult.data as any;
        const loadedNestedName =
          nestedData.pageName || resolvedParams.nestedSubPageId;
        setNestedSubPageContent(nestedData);
        setNestedSubPageName(loadedNestedName);
        setNestedSlug(nestedData.slug || resolvedParams.nestedSubPageId);
        setQuizMetadata((prev) =>
          prev && !prev.subjectName
            ? { ...prev, subjectName: loadedNestedName }
            : prev
        );
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load questions");
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [resolvedParams]);

  const refreshQuestionsSilently = () => {
    // Keep the quiz manager visible after question or metadata actions while Firestore refreshes.
    void loadQuestions({ silent: true });
  };

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, skillFilter, statusFilter, questions.length]);

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!resolvedParams || !questionToDelete) return;

    try {
      setDeletingQuestion(true);
      const result = await deleteNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        questionToDelete.id
      );
      if (result.success) {
        setSuccess("Question deleted successfully!");
        setQuestionToDelete(null);
        refreshQuestionsSilently();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete question");
      }
    } catch (err) {
      setError("Failed to delete question");
      console.error("Error deleting:", err);
    } finally {
      setDeletingQuestion(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newQuestionId.trim() || !newQuestion.trim()) {
      setValidationError("Question ID and Question text are required.");
      return;
    }

    if (!newOptions.some((opt) => opt.trim())) {
      setValidationError("At least one option is required.");
      return;
    }

    if (!newCorrectAnswer.trim()) {
      setValidationError("Correct answer is required.");
      return;
    }

    if (!resolvedParams) return;

    const normalizedQuestionId = newQuestionId
      .toLowerCase()
      .replace(/\s+/g, "-");

    const existingQuestion = questions.find(
      (q) => q.id === normalizedQuestionId
    );
    if (existingQuestion) {
      setValidationError(
        `A question with ID "${normalizedQuestionId}" already exists.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const questionContent = {
        question: newQuestion,
        options: newOptions.filter((opt) => opt.trim()),
        correctAnswer: newCorrectAnswer,
        explanation: newExplanation || "",
        slug: generateSlug(newQuestion),
      };

      const result = await uploadNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        normalizedQuestionId,
        questionContent
      );

      if (result.success) {
        setSuccess(`Question "${normalizedQuestionId}" created successfully!`);
        setShowCreateQuestionModal(false);
        setNewQuestionId("");
        setNewQuestion("");
        setNewOptions(["", "", "", ""]);
        setNewCorrectAnswer("");
        setNewExplanation("");
        setValidationError("");
        // Calculate the last page and navigate to it to show the new question
        const totalQuestions = questions.length + 1;
        const lastPage = Math.ceil(totalQuestions / questionsPerPage);
        setCurrentPage(lastPage);
        refreshQuestionsSilently();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create question.");
      }
    } catch (err) {
      setValidationError("Failed to create question.");
      console.error("Error creating question:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuizMetadata = async (metadataToSave: QuizMetadataContent) => {
    if (!resolvedParams) return;

    const normalizedQuizName = normalizeAdminContentName(metadataToSave.pageName);
    const normalizedQuizSlug = normalizeSlug(metadataToSave.slug || normalizedQuizName || resolvedParams.quizId);
    if (!normalizedQuizName) {
      setError("Quiz name is required.");
      return;
    }
    if (!normalizedQuizSlug) {
      setError("Quiz slug is required.");
      return;
    }

    try {
      setSavingMetadata(true);
      setError("");
      setSuccess("");

      const setNumber = metadataToSave.setNumber.trim()
        ? Number(metadataToSave.setNumber)
        : undefined;
      const examYear = metadataToSave.examYear.trim()
        ? Number(metadataToSave.examYear)
        : undefined;
      const previewPercentage = metadataToSave.previewPercentage.trim()
        ? Number(metadataToSave.previewPercentage)
        : 20;
      const estimatedMinutes = metadataToSave.estimatedMinutes.trim()
        ? Number(metadataToSave.estimatedMinutes)
        : undefined;

      if (setNumber !== undefined && (!Number.isFinite(setNumber) || setNumber < 1)) {
        setError("Set number must be 1 or higher.");
        return;
      }
      if (
        examYear !== undefined &&
        (!Number.isInteger(examYear) || examYear < 2000 || examYear > 2100)
      ) {
        setError("Quiz year must be a valid year between 2000 and 2100.");
        return;
      }
      if (!Number.isFinite(previewPercentage) || previewPercentage < 0 || previewPercentage > 100) {
        setError("Preview percentage must be between 0 and 100.");
        return;
      }
      if (
        estimatedMinutes !== undefined &&
        (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 1)
      ) {
        setError("Estimated minutes must be 1 or higher.");
        return;
      }

      const generatedSchema = buildGeneratedQuizSchema({
        ...metadataToSave,
        pageName: normalizedQuizName,
        slug: normalizedQuizSlug,
        setNumber: setNumber === undefined ? "" : String(setNumber),
        examYear: examYear === undefined ? "" : String(examYear),
        previewPercentage: String(previewPercentage),
        estimatedMinutes:
          estimatedMinutes === undefined ? "" : String(estimatedMinutes),
      });

      const contentToSave = {
        pageName: normalizedQuizName,
        quizName: normalizedQuizName,
        slug: normalizedQuizSlug,
        status: metadataToSave.status,
        active: metadataToSave.status === "Published",
        examAccessProductId: metadataToSave.examAccessProductId,
        subjectName: metadataToSave.subjectName.trim() || nestedName,
        previewPercentage,
        description: metadataToSave.description,
        meta: {
          ...metadataToSave.meta,
          title: metadataToSave.meta.title || `${normalizedQuizName} | NursingMocks`,
          canonicalUrl: metadataToSave.meta.canonicalUrl || `${getSiteUrl()}/${normalizedQuizSlug}`,
        },
        schema: generatedSchema,
        hero: {
          title: metadataToSave.hero.title || normalizedQuizName,
          description: metadataToSave.hero.description || metadataToSave.description,
        },
        ...(setNumber === undefined ? {} : { setNumber }),
        ...(examYear === undefined ? {} : { examYear }),
        ...(estimatedMinutes === undefined ? {} : { estimatedMinutes }),
      };

      const result = await uploadNursingEntranceExamQuiz(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        contentToSave
      );

      if (result.success) {
        setSuccess("Quiz metadata saved successfully.");
        setQuizName(contentToSave.pageName);
        setQuizSlug(normalizedQuizSlug);
        setQuizSetNumber(setNumber ?? "");
        setQuizMetadata({
          ...metadataToSave,
          pageName: contentToSave.pageName,
          slug: normalizedQuizSlug,
          subjectName: contentToSave.subjectName,
          setNumber: setNumber === undefined ? "" : String(setNumber),
          examYear: examYear === undefined ? "" : String(examYear),
          previewPercentage: String(previewPercentage),
          estimatedMinutes:
            estimatedMinutes === undefined ? "" : String(estimatedMinutes),
          meta: contentToSave.meta,
          schema: generatedSchema,
          hero: contentToSave.hero,
        });
        refreshQuestionsSilently();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to save quiz metadata.");
      }
    } catch (err) {
      setError("Failed to save quiz metadata.");
      console.error("Error saving quiz metadata:", err);
    } finally {
      setSavingMetadata(false);
    }
  };

  const explanationTargets = questions.filter((question) => {
    if (regenerateExplanations) return true;
    return !String(question.explanation || "").trim();
  });

  const missingExplanationCount = questions.filter(
    (question) => !String(question.explanation || "").trim()
  ).length;

  const answerReviewCount = questions.filter(
    (question) => question.explanationStatus === "needs_answer_review"
  ).length;

  const handleStopMissingExplanations = () => {
    explanationAbortController.current?.abort();
    explanationAbortController.current = null;
    setGeneratingExplanations(false);
    setSuccess("Explanation generation stopped. Any request that already finished may have saved.");
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleGenerateMissingExplanations = async () => {
    if (!resolvedParams || !currentUser) {
      setError("Admin login is required before generating explanations.");
      return;
    }

    const targets = explanationTargets;
    if (targets.length === 0) {
      setSuccess("All questions already have explanations.");
      setTimeout(() => setSuccess(""), 3000);
      return;
    }

    setGeneratingExplanations(true);
    setError("");
    setSuccess("");
    setExplanationProgress({
      total: targets.length,
      completed: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      needsReview: 0,
      currentQuestionId: "",
    });

    let generated = 0;
    let skipped = 0;
    let failed = 0;
    let needsReview = 0;
    const abortController = new AbortController();
    explanationAbortController.current = abortController;

    try {
      const token = await currentUser.getIdToken();
      for (let index = 0; index < targets.length; index += 1) {
        if (abortController.signal.aborted) break;
        const question = targets[index];
        setExplanationProgress({
          total: targets.length,
          completed: index,
          generated,
          skipped,
          failed,
          needsReview,
          currentQuestionId: question.questionId || question.id,
        });

        // Keep every model call scoped to one question so the saved answer remains the anchor.
        const response = await fetch("/api/admin/nursing-entrance-exam/generate-explanation", {
          method: "POST",
          signal: abortController.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subPageId: resolvedParams.subPageId,
            nestedSubPageId: resolvedParams.nestedSubPageId,
            quizId: resolvedParams.quizId,
            questionId: question.id,
            regenerate: regenerateExplanations,
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          failed += 1;
        } else if (payload.status === "generated") {
          generated += 1;
        } else if (payload.status === "needs_answer_review") {
          needsReview += 1;
        } else if (payload.status === "skipped") {
          skipped += 1;
        } else {
          failed += 1;
        }

        setExplanationProgress({
          total: targets.length,
          completed: index + 1,
          generated,
          skipped,
          failed,
          needsReview,
          currentQuestionId: question.questionId || question.id,
        });
      }

      const stopped = abortController.signal.aborted;
      setSuccess(
        stopped
          ? `Explanation generation stopped: ${generated} generated, ${needsReview} need answer review, ${failed} failed.`
          : `Explanation generation finished: ${generated} generated, ${needsReview} need answer review, ${failed} failed.`
      );
      refreshQuestionsSilently();
      setTimeout(() => setSuccess(""), 6000);
    } catch (err) {
      if (abortController.signal.aborted) {
        setSuccess("Explanation generation stopped. Any request that already finished may have saved.");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(err instanceof Error ? err.message : "Failed to generate explanations.");
      }
    } finally {
      setGeneratingExplanations(false);
      if (explanationAbortController.current === abortController) {
        explanationAbortController.current = null;
      }
    }
  };

  const loadingQuizManagerHref = resolvedParams
    ? `/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/manage`
    : "/admin/nursing-entrance-exam";

  function LoadingShell({ children }: { children: React.ReactNode }) {
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
              { label: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam" },
              { label: "Quiz Manager", href: loadingQuizManagerHref },
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
          <AdminLoadingState
            title="Loading quiz manager"
            description="Preparing quiz metadata, questions, filters, and table actions."
          />
        </LoadingShell>
      </SidebarProvider>
    );
  }

  const typeOptions = questionTypes.map((t) => ({
    id: t.questionTypeId,
    name: t.questionTypeName,
  }));

  const availableSkills = Array.from(
    new Set(
      questions
        .map(
          (q: any) =>
            (q.skill || q.category || "").toString().trim().toLowerCase()
        )
        .filter(Boolean)
    )
  );

  const availableStatuses = Array.from(
    new Set(
      questions
        .map((q: any) => (q.status || "published").toString().toLowerCase())
        .filter(Boolean)
    )
  );

  const filteredQuestions = questions.filter((q) => {
    const text = stripHtmlTags(q.question || "").toLowerCase();
    const matchesSearch = !searchQuery
      ? true
      : text.includes(searchQuery.toLowerCase());

    const questionType =
      q.questionTypeId?.toString() || q.question_type_id?.toString() || "";
    const matchesType =
      typeFilter === "all" ? true : questionType === typeFilter;

    const questionSkill = (q as any).skill?.toString().toLowerCase() ||
      (q as any).category?.toString().toLowerCase() ||
      "";
    const matchesSkill =
      skillFilter === "all" ? true : questionSkill === skillFilter;

    const questionStatus = (q as any).status?.toString().toLowerCase() || "published";
    const matchesStatus =
      statusFilter === "all" ? true : questionStatus === statusFilter;

    return matchesSearch && matchesType && matchesSkill && matchesStatus;
  });

  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions);
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const quizBreadcrumb = quizName || resolvedParams.quizId;
  const parentName = parentSubPageName || resolvedParams.subPageId;
  const nestedName = nestedSubPageName || resolvedParams.nestedSubPageId;
  const parentSubPageHref = `/admin/nursing-entrance-exam/${resolvedParams.subPageId}`;
  const nestedEditorHref = `/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}`;

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
              { label: "Nursing Entrance Exam", href: "/admin/nursing-entrance-exam" },
              {
                label: parentName,
                href: parentSubPageHref,
              },
              {
                label: nestedName,
                href: nestedEditorHref,
              },
              { label: "Quiz Manager" },
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
          <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ecebff_0%,transparent_55%),radial-gradient(circle_at_bottom_right,#eaf5ff_0%,transparent_55%),#f5f6fb]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <LayoutShell>
        <div className="admin-workspace">
          <div className="admin-content">
          {/* Header */}
          <header className="admin-header mb-6">
            <div className="admin-header-row flex-wrap">
              <div className="admin-header-copy flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="admin-page-title">
                    Quiz Questions – {quizBreadcrumb}
                  </h1>
                </div>
                <div className="admin-body flex flex-wrap items-center gap-3">
                  <span>
                    Review and manage all questions for this quiz. Use search,
                    filters, and bulk actions to keep the set clean and up to
                    date.
                  </span>
                  <AdminStatusBadge label="Quiz Published" tone="green" />
                </div>
              </div>
              <div className="admin-header-actions">
                <Link
                  href="/admin/nursing-entrance-exam"
                  className="admin-button-secondary"
                >
                  ← Back to Admin
                </Link>
                <Link
                  href={`/${quizSlug || resolvedParams.quizId}`}
                  target="_blank"
                  className="admin-button-secondary"
                >
                  View Live Quiz
                </Link>
                <button
                  type="button"
                  onClick={() => void loadQuestions()}
                  className="admin-button-primary"
                >
                  Refresh
                </button>
              </div>
            </div>
          </header>

          <AdminNotificationRegion
            error={error}
            success={success}
            errorTitle="Unable To Update Quiz"
            successTitle="Quiz Updated"
          />

          {/* Quiz Metadata */}
          {quizMetadata && (
            <QuizMetadataPanel
              initialMetadata={quizMetadata}
              fallbackSlug={resolvedParams.quizId}
              saving={savingMetadata}
              generateSchema={buildGeneratedQuizSchema}
              onSave={handleSaveQuizMetadata}
            />
          )}

          {/* Summary */}
          <section className="admin-card p-5 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="admin-section-title">
                {quizBreadcrumb}
              </div>
              <div className="admin-helper mt-1">
                Manage all the questions for this quiz from one place.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
            <div>
              <div className="admin-info-tile-label mb-1">
                Exam
              </div>
              <div className="admin-info-tile-value">{parentName}</div>
            </div>
            <div>
              <div className="admin-info-tile-label mb-1">
                Subject
              </div>
              <div className="admin-info-tile-value">{nestedName}</div>
            </div>
            <div>
              <div className="admin-info-tile-label mb-1">
                Questions
              </div>
              <div className="admin-info-tile-value">
                {questions.length}
              </div>
            </div>
            <div>
              <div className="admin-info-tile-label mb-1">
                Set Number
              </div>
              <div className="admin-info-tile-value">
                {quizSetNumber !== "" ? quizSetNumber : "—"}
              </div>
            </div>
            <div>
              <div className="admin-info-tile-label mb-1">
                URL
              </div>
              <div className="admin-info-tile-value break-words">
                /{quizSlug || resolvedParams.quizId}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card mb-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="admin-section-title">AI Explanations</div>
              <div className="admin-helper mt-1">
                Generate explanations one question at a time using the saved correct answer.
              </div>
            </div>
            <button
              type="button"
              onClick={
                generatingExplanations
                  ? handleStopMissingExplanations
                  : handleGenerateMissingExplanations
              }
              disabled={!generatingExplanations && explanationTargets.length === 0}
              className={`disabled:cursor-not-allowed disabled:opacity-50 ${
                generatingExplanations ? "admin-button-danger" : "admin-button-primary"
              }`}
            >
              {generatingExplanations ? "Stop" : "Generate Missing Explanations"}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="admin-info-tile">
              <div className="admin-info-tile-label mb-1">Missing</div>
              <div className="admin-info-tile-value">{missingExplanationCount}</div>
            </div>
            <div className="admin-info-tile">
              <div className="admin-info-tile-label mb-1">Needs Answer Review</div>
              <div className="admin-info-tile-value">{answerReviewCount}</div>
            </div>
            <label className="admin-info-tile flex items-center gap-3">
              <input
                type="checkbox"
                checked={regenerateExplanations}
                onChange={(event) => setRegenerateExplanations(event.target.checked)}
                disabled={generatingExplanations}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">Regenerate existing</span>
                <span className="block text-xs text-gray-500">Overwrite current explanations for this quiz.</span>
              </span>
            </label>
          </div>
          {explanationProgress && (
            <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm text-purple-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">
                  {explanationProgress.completed} / {explanationProgress.total} processed
                </span>
                <span>
                  Generated {explanationProgress.generated} · Review {explanationProgress.needsReview} · Failed {explanationProgress.failed}
                </span>
              </div>
              {explanationProgress.currentQuestionId && (
                <div className="mt-1 text-xs text-purple-700">
                  Current question: {explanationProgress.currentQuestionId}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Questions */}
        <section className="admin-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="admin-section-title">
                Questions
              </div>
              <div className="admin-helper mt-1">
                Showing {totalQuestions === 0 ? 0 : startIndex + 1}–
                {endIndex} of {totalQuestions} questions.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/bulk-upload`}
                className="admin-button-secondary"
              >
                Bulk Upload
              </Link>
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/questions/create`}
                className="admin-button-primary"
              >
                + Add Question
              </Link>
            </div>
          </div>

          <div className="admin-card mb-4 flex flex-wrap gap-2 p-3">
            <div className="w-full sm:w-auto min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions…"
                className="admin-field"
              />
            </div>
            <div className="w-full sm:w-40">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="admin-field"
              >
                <option value="all">All types</option>
                {typeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="admin-field"
              >
                <option value="all">All skills</option>
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-field"
              >
                <option value="all">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {paginatedQuestions.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="admin-card-title mb-1">
                No questions found
              </h3>
              <p className="admin-helper">
                Adjust filters or add a new question to get started.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Q#</th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Question
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Type
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Skill
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuestions.map((question, index) => {
                      const questionTypeName = getQuestionTypeName(
                        question.questionTypeId || question.question_type_id
                      );
                      const questionSkill =
                        (question as any).skill ||
                        (question as any).category ||
                        "—";
                      const questionStatus =
                        (question as any).status?.toString().toLowerCase() ||
                        "published";
                      const isPublished = questionStatus === "published";
                      const isDraft = questionStatus === "draft";

                      const canEdit =
                        question.questionTypeId === 1 ||
                        question.questionTypeId === 2 ||
                        question.questionTypeId === 3 ||
                        question.questionTypeId === 7 ||
                        question.question_type_id === 1 ||
                        question.question_type_id === 2 ||
                        question.question_type_id === 3 ||
                        question.question_type_id === 7;

                      return (
                        <tr
                          key={question.id}
                          className=""
                        >
                          <td className="admin-table-cell-nowrap px-3 py-3 font-semibold">
                            Q{startIndex + index + 1}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="line-clamp-2 leading-5">
                              {stripHtmlTags(
                                question.question || "No question text"
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 text-xs font-medium">
                              {questionTypeName}
                            </span>
                          </td>
                          <td className="admin-table-cell-nowrap px-3 py-3">
                            {questionSkill || "—"}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${
                                isDraft
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : isPublished
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {questionStatus.charAt(0).toUpperCase() +
                                questionStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {canEdit && (
                                <Link
                                  href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/questions/${question.id}`}
                                  className="admin-button-secondary px-3 py-1.5 text-xs"
                                >
                                  Edit
                                </Link>
                              )}
                              <button
                                onClick={() => handleDeleteQuestion(question)}
                                className="admin-button-danger px-3 py-1.5 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm text-slate-500">
                <span>
                  Showing {totalQuestions === 0 ? 0 : startIndex + 1}–{endIndex} of{" "}
                  {totalQuestions} questions
                </span>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={`rounded-full border border-slate-200 px-2 py-1 text-xs ${
                      currentPage === 1
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    1
                  </button>
                  {totalPages > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={`rounded-full border border-slate-200 px-2 py-1 text-xs ${
                        currentPage > 1 && currentPage <= totalPages
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {Math.min(totalPages, 2)}
                    </button>
                  )}
                  {totalPages > 2 && <span className="px-1">…</span>}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-700 disabled:opacity-40"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        </div>

        {/* Create Question Modal */}
        {showCreateQuestionModal && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal max-w-2xl">
              <h2 className="admin-modal-title mb-6">
                Add New Question
              </h2>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                {validationError && (
                  <AdminAlert tone="error" title="Question Validation Error">
                    {validationError}
                  </AdminAlert>
                )}
                <div>
                  <label className="admin-field-label mb-2 block">
                    Question ID *
                  </label>
                  <input
                    type="text"
                    value={newQuestionId}
                    onChange={(e) =>
                      setNewQuestionId(
                        e.target.value.toLowerCase().replace(/\s+/g, "-")
                      )
                    }
                    className="admin-field"
                    placeholder="e.g., question-1"
                    required
                  />
                </div>
                <div>
                  <label className="admin-field-label mb-2 block">
                    Question Text *
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={3}
                    className="admin-field"
                    placeholder="Enter the question text"
                    required
                  />
                </div>
                <div>
                  <label className="admin-field-label mb-2 block">
                    Options *
                  </label>
                  {newOptions.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[index] = e.target.value;
                        setNewOptions(updated);
                      }}
                      className="admin-field mb-2"
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewOptions([...newOptions, ""])}
                    className="admin-button-secondary px-3 py-1.5 text-xs"
                  >
                    + Add Option
                  </button>
                </div>
                <div>
                  <label className="admin-field-label mb-2 block">
                    Correct Answer *
                  </label>
                  <input
                    type="text"
                    value={newCorrectAnswer}
                    onChange={(e) => setNewCorrectAnswer(e.target.value)}
                    className="admin-field"
                    placeholder="Enter the correct answer (must match one of the options)"
                    required
                  />
                </div>
                <div>
                  <label className="admin-field-label mb-2 block">
                    Explanation
                  </label>
                  <textarea
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    rows={3}
                    className="admin-field"
                    placeholder="Enter explanation for the correct answer (optional)"
                  />
                </div>
                <div className="admin-modal-footer pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="admin-button-primary flex-1 disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Create Question"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateQuestionModal(false);
                      setNewQuestionId("");
                      setNewQuestion("");
                      setNewOptions(["", "", "", ""]);
                      setNewCorrectAnswer("");
                      setNewExplanation("");
                      setValidationError("");
                    }}
                    className="admin-button-cancel flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {questionToDelete && (
          <AdminDestructiveDialog
            title="Delete Question"
            itemName={questionToDelete.questionId || questionToDelete.id}
            consequence="This removes the question from this quiz and cannot be undone."
            confirmLabel="Delete Question"
            confirmingLabel="Deleting..."
            confirming={deletingQuestion}
            onCancel={() => setQuestionToDelete(null)}
            onConfirm={handleConfirmDeleteQuestion}
          />
        )}
        </div>
      </LayoutShell>
    </SidebarProvider>
  );
}

