"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNursingEntranceExamQuizQuestions,
  uploadNursingEntranceExamQuizQuestion,
  deleteNursingEntranceExamQuizQuestion,
  getNursingEntranceExamQuiz,
  getNestedSubPage,
  getNursingEntranceExamSubPage,
  getPillarPageContent,
  getAllQuestionTypes,
} from "@/lib/firestore-operations";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  questionId?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  lastUpdated?: string;
  questionTypeId?: number;
  question_type_id?: number;
}

interface QuestionType {
  id: string;
  questionTypeId: string;
  questionTypeName: string;
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
  const [quizName, setQuizName] = useState("");
  const [quizSetNumber, setQuizSetNumber] = useState<string | number>("");
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

  const loadQuestions = useCallback(async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
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
        setNestedSubPageContent(nestedData);
        setNestedSubPageName(
          nestedData.pageName || resolvedParams.nestedSubPageId
        );
        setNestedSlug(nestedData.slug || resolvedParams.nestedSubPageId);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, skillFilter, statusFilter, questions.length]);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!resolvedParams) return;

    if (
      !confirm(`Are you sure you want to delete the question "${questionId}"?`)
    ) {
      return;
    }

    try {
      const result = await deleteNursingEntranceExamQuizQuestion(
        resolvedParams.subPageId,
        resolvedParams.nestedSubPageId,
        resolvedParams.quizId,
        questionId
      );
      if (result.success) {
        setSuccess("Question deleted successfully!");
        setCurrentPage(1); // Reset to first page after deletion
        loadQuestions();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete question");
      }
    } catch (err) {
      setError("Failed to delete question");
      console.error("Error deleting:", err);
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
        loadQuestions();
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
          <div className="hidden md:block border-b border-gray-200 bg-white h-16">
            <div className="flex justify-between items-center px-4 h-full">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  Home
                </Link>
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <Link
                  href="/admin"
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  Admin
                </Link>
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <span className="font-medium text-gray-800">Quiz Manager</span>
              </div>
              {currentUser ? (
                <UserProfileBadge />
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="gradient-button text-white px-6 py-2 rounded-lg font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-slate-900">
                    Quiz Questions – {quizBreadcrumb}
                  </h1>
                </div>
                <div className="text-sm text-slate-600 flex flex-wrap items-center gap-3">
                  <span>
                    Review and manage all questions for this quiz. Use search,
                    filters, and bulk actions to keep the set clean and up to
                    date.
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Quiz published
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                  href="/admin/nursing-entrance-exam"
                  className="btn btn-ghost rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-white shadow-sm"
                >
                  ← Back to Admin
                </Link>
                <Link
                  href={`/${quizSlug || resolvedParams.quizId}`}
                  target="_blank"
                  className="btn btn-ghost rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-white shadow-sm"
                >
                  View Live Quiz
                </Link>
                <button
                  type="button"
                  onClick={loadQuestions}
                  className="btn btn-primary rounded-full bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </header>

          {/* Summary */}
          <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-base font-semibold text-slate-900">
                {quizBreadcrumb}
              </div>
              <div className="text-sm text-slate-500">
                Manage all the questions for this quiz from one place.
              </div>
            </div>
            <Link
              href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/manage`}
              className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Edit Quiz Info
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
            <div>
              <div className="uppercase text-[11px] tracking-wide text-slate-400 mb-1">
                Exam
              </div>
              <div className="text-slate-900 font-medium">{parentName}</div>
            </div>
            <div>
              <div className="uppercase text-[11px] tracking-wide text-slate-400 mb-1">
                Subject
              </div>
              <div className="text-slate-900 font-medium">{nestedName}</div>
            </div>
            <div>
              <div className="uppercase text-[11px] tracking-wide text-slate-400 mb-1">
                Questions
              </div>
              <div className="text-slate-900 font-medium">
                {questions.length}
              </div>
            </div>
            <div>
              <div className="uppercase text-[11px] tracking-wide text-slate-400 mb-1">
                Set Number
              </div>
              <div className="text-slate-900 font-medium">
                {quizSetNumber !== "" ? quizSetNumber : "—"}
              </div>
            </div>
            <div>
              <div className="uppercase text-[11px] tracking-wide text-slate-400 mb-1">
                URL
              </div>
              <div className="text-indigo-600 break-words">
                /{quizSlug || resolvedParams.quizId}
              </div>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="font-semibold text-slate-900 text-base">
                Questions
              </div>
              <div className="text-sm text-slate-500">
                Showing {totalQuestions === 0 ? 0 : startIndex + 1}–
                {endIndex} of {totalQuestions} questions.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/bulk-upload`}
                className="rounded-full bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-blue-700"
              >
                Bulk Upload
              </Link>
              <Link
                href={`/admin/nursing-entrance-exam/${resolvedParams.subPageId}/nested/${resolvedParams.nestedSubPageId}/quizzes/${resolvedParams.quizId}/questions/create`}
                className="rounded-full bg-green-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-green-700"
              >
                + Add Question
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center mb-3">
            <div className="w-full sm:w-auto min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="w-full sm:w-40">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              <h3 className="text-base font-medium text-slate-900 mb-1">
                No questions found
              </h3>
              <p className="text-sm text-slate-600">
                Adjust filters or add a new question to get started.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-500">
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
                          className="border-t border-slate-200 bg-white odd:bg-white even:bg-slate-50"
                        >
                          <td className="px-3 py-3 font-semibold text-slate-600 whitespace-nowrap">
                            Q{startIndex + index + 1}
                          </td>
                          <td className="px-3 py-3 text-slate-900 align-top">
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
                          <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
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
                                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                >
                                  Edit
                                </Link>
                              )}
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100"
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

          {/* Alerts */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}
        </div>

        {/* Create Question Modal */}
        {showCreateQuestionModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 overflow-y-auto py-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 my-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Question
              </h2>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{validationError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., question-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter the question text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 mb-2"
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewOptions([...newOptions, ""])}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  <input
                    type="text"
                    value={newCorrectAnswer}
                    onChange={(e) => setNewCorrectAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter the correct answer (must match one of the options)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Explanation
                  </label>
                  <textarea
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter explanation for the correct answer (optional)"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
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
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </LayoutShell>
    </SidebarProvider>
  );
}

