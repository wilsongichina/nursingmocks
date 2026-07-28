"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  getNursingEntranceExamSubPages,
  getNursingEntranceExamQuizQuestions,
  deleteNursingEntranceExamSubPage,
  uploadNursingEntranceExamSubPage,
  getNestedSubPagesByParentDocId,
  getNursingEntranceExamQuizzes,
  getRouteMappingSlugsByIds,
  countExitEntranceQuizQuestions,
  uploadNestedSubPage,
  deleteNestedSubPage,
  deleteNursingEntranceExamQuiz,
  uploadNursingEntranceExamQuiz,
  uploadNursingEntranceExamKbArticle,
  getNursingEntranceExamKbArticles,
  deleteNursingEntranceExamKbArticle,
} from "@/lib/firestore-operations";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  AdminCard,
  AdminDestructiveDialog,
  AdminDetailPanel,
  AdminBadgeList,
  AdminFieldGroup,
  AdminFormSection,
  AdminInfoTile,
  AdminInlineLoading,
  AdminLoadingState,
  AdminModal,
  AdminModalFooter,
  AdminNotificationRegion,
  AdminTableEmptyState,
  AdminPageHeader,
  AdminPagination,
  AdminSlugField,
  AdminStatCard,
  AdminStatusBadge,
  AdminTable,
  AdminTableCell,
  AdminTabs,
  AdminTopBar,
  AdminToolbar,
  AdminValidationMessage,
} from "@/components/admin/AdminUi";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl } from "@/lib/config";
import { buildEntranceQuizSchemaMarkup } from "@/lib/seo/structured-data";
import {
  normalizeAdminContentName,
  normalizeAdminContentNameInput,
  normalizeAdminContentSlug,
} from "@/lib/admin/content-naming";
import {
  CONTENT_ACCESS_PRODUCTS,
  CONTENT_ACCESS_PRODUCTS_BY_PILLAR,
  contentAccessProductLabel,
  normalizeContentExamAccessProductId,
  validateContentExamAccessProductId,
} from "@/lib/content-access-products";

type ExamAccessOption = {
  examId: string;
  name: string;
  category: string;
  active: boolean;
};

type ExamAccessCatalogResponse = {
  products?: ExamAccessOption[];
  error?: string;
};

type ContentRefreshOptions = {
  silent?: boolean;
};

const nursingEntranceAdminTabs = [
  { id: "sub-pages", label: "Sub Pages" },
  { id: "nested", label: "Nested Sub Pages" },
  { id: "quizzes", label: "Quiz Metadata" },
  { id: "kb", label: "Knowledge Base Articles" },
];

function normalizeCatalogCategory(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isNursingEntranceCatalogCategory(value: string) {
  const normalized = normalizeCatalogCategory(value);
  return normalized === "nursing entrance exams" || normalized === "nursing entrance exam";
}

function subPageDisplayName(subPage: SubPage) {
  return subPage.pageName || subPage.hero?.title || subPage.title || subPage.id;
}

function defaultEntranceExamFilter(subPages: SubPage[]) {
  const atiTeasSubPage = subPages.find((subPage) => {
    const productId = normalizeContentExamAccessProductId(
      "nursing-entrance-exam",
      subPage.examAccessProductId,
      subPageDisplayName(subPage)
    );
    return productId === "ati_teas_7";
  });
  if (atiTeasSubPage) return subPageDisplayName(atiTeasSubPage);

  const namedAtiTeasSubPage = subPages.find((subPage) =>
    /ati\s+teas\s*7/i.test(subPageDisplayName(subPage))
  );
  return namedAtiTeasSubPage ? subPageDisplayName(namedAtiTeasSubPage) : "";
}

type AdminDateValue =
  | string
  | number
  | Date
  | {
      toDate?: () => Date;
      seconds?: number;
    }
  | null
  | undefined;

type LastUpdatedRecord = {
  lastUpdated?: AdminDateValue;
};

function getAdminDate(value: AdminDateValue) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return null;
}

function getLastUpdatedTime(value: AdminDateValue) {
  return getAdminDate(value)?.getTime() || 0;
}

function sortByLastUpdatedDesc<T extends LastUpdatedRecord>(items: T[]) {
  return [...items].sort(
    (a, b) => getLastUpdatedTime(b.lastUpdated) - getLastUpdatedTime(a.lastUpdated)
  );
}

function formatAdminLastUpdated(value: AdminDateValue) {
  const date = getAdminDate(value);
  if (!date) return "Not Updated";

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} | ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

interface SubPage {
  id: string;
  subPageId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: string;
  version?: string;
  status?: string;
  examAccessProductId?: string | null;
  hero?: {
    title: string;
  };
}

interface NestedSubPageRow {
  id: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: AdminDateValue;
  status?: string;
  parentSubPageId?: string;
  parentSubPageDocId?: string;
  parentSubPageName?: string;
  examAccessProductId?: string | null;
  hero?: {
    title?: string;
  };
}

interface QuizRow {
  id: string;
  slug?: string;
  quizName?: string;
  pageName?: string;
  title?: string;
  name?: string;
  lastUpdated?: AdminDateValue;
  status?: string;
  questionCount?: number;
  examYear?: number | string;
  year?: number | string;
  parentSubPageId?: string;
  parentSubPageDocId?: string;
  parentSubPageName?: string;
  nestedSubPageId?: string;
  nestedSubPageDocId?: string;
  nestedSubPageName?: string;
}

interface KnowledgeBaseArticleRow {
  id: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: AdminDateValue;
  status?: string;
  parentId?: string;
  parentSubPageId?: string;
}

function NursingEntranceExamAdminPageContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const quizExplanationAbortControllers = useRef<Record<string, AbortController>>({});
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentDetailsLoading, setContentDetailsLoading] = useState(false);
  const [quizMetadataLoading, setQuizMetadataLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get unique sub-page names for exam filter
  const uniqueSubPageNames = useMemo(() => {
    const names = subPages
      .map((sp) => sp.pageName || sp.hero?.title || sp.title || sp.id)
      .filter((name, index, self) => self.indexOf(name) === index && name)
      .sort();
    return names;
  }, [subPages]);

  // Helper function to check if a slug exists across all levels
  const isSlugTaken = (
    slug: string,
    excludeId?: string
  ): { taken: boolean; message?: string } => {
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");

    // Check for reserved static routes
    const reservedRoutes = ["knowledge-base"];
    if (reservedRoutes.includes(normalizedSlug)) {
      return {
        taken: true,
        message: `The slug "${normalizedSlug}" is reserved and cannot be used. Please choose a different slug.`,
      };
    }

    // Helper to normalize a slug for comparison
    const normalizeSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

    // Check sub-pages
    const existingSubPage = subPages.find((sp) => {
      const existingSlug = normalizeSlug(sp.slug || sp.id);
      return existingSlug === normalizedSlug && sp.id !== excludeId;
    });
    if (existingSubPage) {
      return {
        taken: true,
        message: `A Sub Page with slug "${normalizedSlug}" already exists.`,
      };
    }

    // Check nested sub-pages
    const existingNestedSubPage = nestedSubPages.find((nsp) => {
      const existingSlug = normalizeSlug(nsp.slug || nsp.id);
      return existingSlug === normalizedSlug && nsp.id !== excludeId;
    });
    if (existingNestedSubPage) {
      return {
        taken: true,
        message: `A Nested Sub Page with slug "${normalizedSlug}" already exists.`,
      };
    }

    // Check quizzes
    const existingQuiz = quizzes.find((quiz) => {
      const existingSlug = normalizeSlug(quiz.slug || quiz.id);
      return existingSlug === normalizedSlug && quiz.id !== excludeId;
    });
    if (existingQuiz) {
      return {
        taken: true,
        message: `A quiz with slug "${normalizedSlug}" already exists.`,
      };
    }

    // Check KB articles
    const existingKbArticle = kbArticles.find((kb) => {
      const existingSlug = normalizeSlug(kb.slug || kb.id);
      return existingSlug === normalizedSlug && kb.id !== excludeId;
    });
    if (existingKbArticle) {
      return {
        taken: true,
        message: `A Knowledge Base Article with slug "${normalizedSlug}" already exists.`,
      };
    }

    return { taken: false };
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateKbModal, setShowCreateKbModal] = useState(false);
  const [newSubPageId, setNewSubPageId] = useState("");
  const [newSubPageName, setNewSubPageName] = useState("");
  const [newSubPageSlugManuallyEdited, setNewSubPageSlugManuallyEdited] =
    useState(false);
  const [newSubPageExamAccessProductId, setNewSubPageExamAccessProductId] = useState("ati_teas_7");
  const [examAccessProducts, setExamAccessProducts] = useState<ExamAccessOption[]>([]);
  const [examAccessProductsError, setExamAccessProductsError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newKbArticleId, setNewKbArticleId] = useState("");
  const [newKbArticleName, setNewKbArticleName] = useState("");
  const [newKbArticleSlugManuallyEdited, setNewKbArticleSlugManuallyEdited] =
    useState(false);
  const [selectedSubPageForKb, setSelectedSubPageForKb] = useState("");
  const [kbValidationError, setKbValidationError] = useState("");
  const [savingKb, setSavingKb] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subPageToDelete, setSubPageToDelete] = useState<SubPage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("sub-pages");
  const [showCreateNestedModal, setShowCreateNestedModal] = useState(false);
  const [selectedSubPageForNested, setSelectedSubPageForNested] =
    useState<SubPage | null>(null);
  const [newNestedSubPageId, setNewNestedSubPageId] = useState("");
  const [newNestedSubPageName, setNewNestedSubPageName] = useState("");
  const [
    newNestedSubPageSlugManuallyEdited,
    setNewNestedSubPageSlugManuallyEdited,
  ] = useState(false);
  const [nestedValidationError, setNestedValidationError] = useState("");
  const [savingNested, setSavingNested] = useState(false);
  const [showDeleteNestedModal, setShowDeleteNestedModal] = useState(false);
  const [nestedSubPageToDelete, setNestedSubPageToDelete] = useState<
    NestedSubPageRow | null
  >(null);
  const [deletingNested, setDeletingNested] = useState(false);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizRow | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [selectedNestedSubPageForQuiz, setSelectedNestedSubPageForQuiz] =
    useState<NestedSubPageRow | null>(null);
  const [newQuizId, setNewQuizId] = useState("");
  const [newQuizName, setNewQuizName] = useState("");
  const [newQuizSlugManuallyEdited, setNewQuizSlugManuallyEdited] =
    useState(false);
  const [newQuizSetNumber, setNewQuizSetNumber] = useState("");
  const [newQuizExamYear, setNewQuizExamYear] = useState("");
  const [quizValidationError, setQuizValidationError] = useState("");
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const hasAppliedDefaultExamFilter = useRef(false);
  const hasManuallyChangedExamFilter = useRef(false);
  const [statusFilter, setStatusFilter] = useState("");

  const entranceExamAccessProducts = useMemo(() => {
    const dynamicProducts = examAccessProducts.filter(
      (product) =>
        product.active !== false &&
        isNursingEntranceCatalogCategory(product.category)
    );
    if (dynamicProducts.length > 0) return dynamicProducts;

    return CONTENT_ACCESS_PRODUCTS_BY_PILLAR["nursing-entrance-exam"].map((productId) => ({
      examId: productId,
      name: CONTENT_ACCESS_PRODUCTS[productId].label,
      category: "Nursing Entrance Exams",
      active: true,
    }));
  }, [examAccessProducts]);

  // Reset pagination when tab changes
  useEffect(() => {
    setSubPagesPage(1);
    setNestedSubPagesPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [activeTab]);

  // Reset pagination when search query changes
  useEffect(() => {
    setSubPagesPage(1);
    setNestedSubPagesPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setSubPagesPage(1);
    setNestedSubPagesPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [examFilter, statusFilter]);
  const [nestedSubPages, setNestedSubPages] = useState<NestedSubPageRow[]>([]);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [kbArticlesCount, setKbArticlesCount] = useState(0);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [quizExplanationJobs, setQuizExplanationJobs] = useState<
    Record<
      string,
      {
        running: boolean;
        total: number;
        completed: number;
        generated: number;
        failed: number;
        needsReview: number;
      }
    >
  >({});
  const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticleRow[]>([]);
  const [subPagesPage, setSubPagesPage] = useState(1);
  const [nestedSubPagesPage, setNestedSubPagesPage] = useState(1);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [kbArticlesPage, setKbArticlesPage] = useState(1);
  const itemsPerPage = 10;
  const [showDeleteKbModal, setShowDeleteKbModal] = useState(false);
  const [kbArticleToDelete, setKbArticleToDelete] =
    useState<KnowledgeBaseArticleRow | null>(null);
  const [deletingKb, setDeletingKb] = useState(false);

  useEffect(() => {
    loadSubPages();
    // The initial admin content load should run once on mount; create/delete handlers refresh explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadExamAccessProducts = async () => {
      try {
        setExamAccessProductsError("");
        const response = await fetch("/api/exam-access/catalog");
        const data = (await response.json().catch(() => ({}))) as ExamAccessCatalogResponse;
        if (!response.ok || !Array.isArray(data.products)) {
          throw new Error(data.error || "Could not load exam access catalog");
        }
        setExamAccessProducts(data.products);
      } catch (catalogError) {
        setExamAccessProductsError(
          catalogError instanceof Error ? catalogError.message : "Could not load exam access catalog"
        );
      }
    };

    void loadExamAccessProducts();
  }, []);

  useEffect(() => {
    if (entranceExamAccessProducts.length === 0) return;
    if (entranceExamAccessProducts.some((product) => product.examId === newSubPageExamAccessProductId)) return;
    setNewSubPageExamAccessProductId(entranceExamAccessProducts[0].examId);
  }, [entranceExamAccessProducts, newSubPageExamAccessProductId]);

  useEffect(() => {
    if (hasAppliedDefaultExamFilter.current || hasManuallyChangedExamFilter.current) return;
    const defaultFilter = defaultEntranceExamFilter(subPages);
    if (!defaultFilter) return;
    hasAppliedDefaultExamFilter.current = true;
    setExamFilter(defaultFilter);
  }, [subPages]);

  const loadSubPages = async (options: ContentRefreshOptions = {}) => {
    const shouldBlockPage = !options.silent && subPages.length === 0;
    try {
      setLoading(shouldBlockPage);
      if (!options.silent) {
        setContentDetailsLoading(false);
        setQuizMetadataLoading(false);
      }
      setError("");

      const result = await getNursingEntranceExamSubPages();

      if (result.success && result.data) {
        setSubPages(result.data);
        setLoading(false);
        if (!options.silent) {
          setContentDetailsLoading(true);
          setQuizMetadataLoading(true);
        }

        // Load nested sub-pages for all sub-pages in parallel
        const allNestedSubPages: NestedSubPageRow[] = [];
        let totalQuizzes = 0;

        // Fetch all nested sub-pages in parallel using Promise.all
        const nestedSubPagesPromises = result.data.map(async (subPage) => {
          const subPageId = subPage.slug || subPage.id;
          const subPageDocId = subPage.id; // Keep the document ID for route mappings
          const subPageName =
            subPage.pageName ||
            subPage.hero?.title ||
            subPage.title ||
            subPage.id;
          const nestedResult = await getNestedSubPagesByParentDocId(subPageDocId);

          if (nestedResult.success && nestedResult.data) {
            // Add parent sub-page info to each nested sub-page
            const nestedWithParent = (nestedResult.data as NestedSubPageRow[]).map(
              (nestedSubPage) => ({
                ...nestedSubPage,
                parentSubPageId: subPageId,
                parentSubPageDocId: subPageDocId, // Document ID for route mappings
                parentSubPageName: subPageName,
              })
            );

            return { nestedWithParent, subPageId, subPageDocId };
          }
          return {
            nestedWithParent: [],
            subPageId,
            subPageDocId: subPageDocId,
          };
        });

        const nestedResults = await Promise.all(nestedSubPagesPromises);

        // Collect all nested sub-pages and their parent info
        const allNestedIds: string[] = [];
        const nestedSubPageMap = new Map<
          string,
          { nested: NestedSubPageRow; subPageId: string; subPageDocId: string }
        >();

        for (const {
          nestedWithParent,
          subPageId,
          subPageDocId,
        } of nestedResults) {
          for (const nested of nestedWithParent) {
            allNestedSubPages.push(nested);
            allNestedIds.push(nested.id);
            nestedSubPageMap.set(nested.id, {
              nested,
              subPageId,
              subPageDocId,
            });
          }
        }

        // Get route mapping slugs for all nested sub-pages in one query
        // Group by subPageId to get slugs efficiently
        const subPageGroups = new Map<string, string[]>();
        for (const { nested, subPageDocId } of nestedSubPageMap.values()) {
          if (!subPageGroups.has(subPageDocId)) {
            subPageGroups.set(subPageDocId, []);
          }
          subPageGroups.get(subPageDocId)!.push(nested.id);
        }

        // Fetch route mapping slugs for each sub-page group in parallel
        const slugMapPromises = Array.from(subPageGroups.entries()).map(
          async ([subPageDocId, nestedIds]) => {
            const slugResult = await getRouteMappingSlugsByIds({
              pillarId: "nursing-entrance-exam",
              type: "nested",
              ids: nestedIds,
              subPageId: subPageDocId,
            });
            return slugResult.success && slugResult.slugMap
              ? slugResult.slugMap
              : {};
          }
        );

        const slugMaps = await Promise.all(slugMapPromises);
        const combinedSlugMap: Record<string, string> = {};
        slugMaps.forEach((map: Record<string, string>) => {
          Object.assign(combinedSlugMap, map);
        });

        // Update nested sub-pages with route mapping slugs if available
        const nestedWithSlugs = allNestedSubPages.map((nested) => {
          const routeSlug = combinedSlugMap[nested.id];
          return {
            ...nested,
            slug: routeSlug || nested.slug || nested.id, // Prefer route mapping slug
          };
        });
        setNestedSubPages(nestedWithSlugs);
        setContentDetailsLoading(false);

        // Fetch all quizzes for all nested sub-pages in parallel
        const allQuizzes: QuizRow[] = [];
        const quizCountPromises = nestedWithSlugs.map(async (nestedSubPage) => {
          const nestedSubPageId = nestedSubPage.slug || nestedSubPage.id;
          const parentInfo = nestedSubPageMap.get(nestedSubPage.id);
          if (!parentInfo) return { count: 0, quizzes: [] };

          try {
            const quizzesResult = await getNursingEntranceExamQuizzes(
              parentInfo.subPageId,
              nestedSubPageId,
              { repairMyExamsCatalog: true }
            );

            if (
              quizzesResult.success &&
              quizzesResult.data &&
              quizzesResult.data.length > 0
            ) {
              // Add parent information to each quiz
              const quizzesWithParent = (quizzesResult.data as QuizRow[]).map((quiz) => ({
                ...quiz,
                parentSubPageId: parentInfo.subPageId, // slug for URL
                parentSubPageDocId: parentInfo.subPageDocId, // document ID for route
                parentSubPageName: nestedSubPage.parentSubPageName,
                nestedSubPageId: nestedSubPageId, // slug for URL
                nestedSubPageDocId: nestedSubPage.id, // document ID for route
                nestedSubPageName:
                  nestedSubPage.pageName ||
                  nestedSubPage.hero?.title ||
                  nestedSubPage.title ||
                  nestedSubPage.id,
              }));
              allQuizzes.push(...quizzesWithParent);
              return {
                count: quizzesResult.data.length,
                quizzes: quizzesWithParent,
              };
            }
          } catch (error) {
            console.error(
              `Error loading quizzes for ${nestedSubPageId}:`,
              error
            );
          }
          return { count: 0, quizzes: [] };
        });

        const quizResults = await Promise.all(quizCountPromises);
        totalQuizzes = quizResults.reduce(
          (sum, result) => sum + result.count,
          0
        );

        // Get route mapping slugs for all quizzes
        if (allQuizzes.length > 0) {
          // Group quizzes by nested sub-page for efficient route mapping queries
          const quizGroups = new Map<
            string,
            {
              quizIds: string[];
              subPageDocId: string;
              nestedSubPageDocId: string;
            }
          >();

          for (const quiz of allQuizzes) {
            const subPageDocId = quiz.parentSubPageDocId || quiz.parentSubPageId || "";
            const nestedSubPageDocId = quiz.nestedSubPageDocId || quiz.nestedSubPageId || "";
            const key = `${subPageDocId}_${nestedSubPageDocId}`;
            if (!quizGroups.has(key)) {
              quizGroups.set(key, {
                quizIds: [],
                subPageDocId,
                nestedSubPageDocId,
              });
            }
            quizGroups.get(key)!.quizIds.push(quiz.id);
          }

          // Fetch route mapping slugs for each group in parallel
          const quizSlugMapPromises = Array.from(quizGroups.entries()).map(
            async ([key, group]) => {
              try {
                const slugResult = await getRouteMappingSlugsByIds({
                  pillarId: "nursing-entrance-exam",
                  type: "quiz",
                  ids: group.quizIds,
                  subPageId: group.subPageDocId,
                  nestedPageId: group.nestedSubPageDocId,
                });
                return slugResult.success && slugResult.slugMap
                  ? slugResult.slugMap
                  : {};
              } catch (error) {
                console.error(
                  `Error getting route mappings for quizzes in group ${key}:`,
                  error
                );
                return {};
              }
            }
          );

          const quizSlugMaps = await Promise.all(quizSlugMapPromises);
          const combinedQuizSlugMap: Record<string, string> = {};
          quizSlugMaps.forEach((map: Record<string, string>) => {
            Object.assign(combinedQuizSlugMap, map);
          });

          // Update quizzes with route mapping slugs
          const quizzesWithSlugs = allQuizzes.map((quiz) => {
            const routeSlug = combinedQuizSlugMap[quiz.id];
            return {
              ...quiz,
              slug: routeSlug || quiz.slug || quiz.id, // Prefer route mapping slug
            };
          });
          setQuizzes(quizzesWithSlugs);
          setQuizzesCount(totalQuizzes);
          setQuizMetadataLoading(false);

          // Question counts are slower than quiz metadata, so load them after
          // the table is already visible and update rows in place.
          const questionCountPromises = quizzesWithSlugs.map(async (quiz) => {
            try {
              const questionCount = await countExitEntranceQuizQuestions(
                "nursing-entrance-exam",
                quiz.parentSubPageId || quiz.parentSubPageDocId || "",
                quiz.nestedSubPageId || quiz.nestedSubPageDocId || "",
                quiz.slug || quiz.id
              );
              return { quizId: quiz.id, questionCount };
            } catch (error) {
              console.error(
                `Error counting questions for quiz ${quiz.id}:`,
                error
              );
              return { quizId: quiz.id, questionCount: 0 };
            }
          });

          const questionCounts = await Promise.all(questionCountPromises);
          const questionCountMap = new Map<string, number>();
          questionCounts.forEach(({ quizId, questionCount }) => {
            questionCountMap.set(quizId, questionCount);
          });

          // Add question counts to quizzes
          const quizzesWithCounts = quizzesWithSlugs.map((quiz) => ({
            ...quiz,
            questionCount: questionCountMap.get(quiz.id) || 0,
          }));

          setQuizzes(quizzesWithCounts);
        } else {
          setQuizzes([]);
          setQuizzesCount(0);
          setQuizMetadataLoading(false);
        }

        // Fetch KB articles
        const kbResult = await getNursingEntranceExamKbArticles();
        if (kbResult.success && kbResult.data) {
          setKbArticles(kbResult.data);
          setKbArticlesCount(kbResult.data.length);
        } else {
          setKbArticles([]);
          setKbArticlesCount(0);
        }
      } else {
        setError("Failed to load Sub Pages.");
      }
    } catch (err) {
      setError("Failed to load Sub Pages.");
      console.error("Error loading sub-pages:", err);
    } finally {
      setLoading(false);
      setContentDetailsLoading(false);
      setQuizMetadataLoading(false);
    }
  };

  const refreshContentSilently = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "nested" || tabId === "kb") {
      setContentDetailsLoading(true);
    }
    if (tabId === "quizzes") {
      setQuizMetadataLoading(true);
    }
    // Keep the current tab/table visible while Firestore data refreshes after a CRUD action.
    void loadSubPages({ silent: true });
  };

  const handleDeleteClick = (subPage: SubPage) => {
    setSubPageToDelete(subPage);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subPageToDelete) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const result = await deleteNursingEntranceExamSubPage(subPageToDelete.id);

      if (result.success) {
        setSuccess("Sub Page deleted successfully.");
        setShowDeleteModal(false);
        setSubPageToDelete(null);
        refreshContentSilently("sub-pages");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete Sub Page.");
      }
    } catch (err) {
      setError("Failed to delete Sub Page.");
      console.error("Error deleting sub-page:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSubPageToDelete(null);
  };

  const handleDeleteNestedClick = (nestedSubPage: NestedSubPageRow) => {
    setNestedSubPageToDelete(nestedSubPage);
    setShowDeleteNestedModal(true);
  };

  const handleDeleteNestedConfirm = async () => {
    if (!nestedSubPageToDelete) return;

    try {
      setDeletingNested(true);
      setError("");
      setSuccess("");

      // Use parentSubPageDocId (document ID) instead of parentSubPageId (slug)
      const parentSubPageDocId =
        nestedSubPageToDelete.parentSubPageDocId ||
        nestedSubPageToDelete.parentSubPageId ||
        "";

      const result = await deleteNestedSubPage(
        parentSubPageDocId,
        nestedSubPageToDelete.id
      );

      if (result.success) {
        setSuccess("Nested Sub Page deleted successfully.");
        setShowDeleteNestedModal(false);
        setNestedSubPageToDelete(null);
        refreshContentSilently("nested");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete Nested Sub Page.");
      }
    } catch (err) {
      setError("Failed to delete Nested Sub Page.");
      console.error("Error deleting nested sub-page:", err);
    } finally {
      setDeletingNested(false);
    }
  };

  const handleDeleteNestedCancel = () => {
    setShowDeleteNestedModal(false);
    setNestedSubPageToDelete(null);
  };

  const handleDeleteQuizClick = (quiz: QuizRow) => {
    setQuizToDelete(quiz);
    setShowDeleteQuizModal(true);
  };

  const handleDeleteQuizConfirm = async () => {
    if (!quizToDelete) return;

    try {
      setDeletingQuiz(true);
      setError("");
      setSuccess("");

      const result = await deleteNursingEntranceExamQuiz(
        quizToDelete.parentSubPageId || quizToDelete.parentSubPageDocId || "",
        quizToDelete.nestedSubPageId || quizToDelete.nestedSubPageDocId || "",
        quizToDelete.id
      );

      if (result.success) {
        setSuccess("Quiz deleted successfully.");
        setShowDeleteQuizModal(false);
        setQuizToDelete(null);
        refreshContentSilently("quizzes");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete quiz.");
      }
    } catch (err) {
      setError("Failed to delete quiz.");
      console.error("Error deleting quiz:", err);
    } finally {
      setDeletingQuiz(false);
    }
  };

  const handleDeleteKbClick = (kbArticle: KnowledgeBaseArticleRow) => {
    setKbArticleToDelete(kbArticle);
    setShowDeleteKbModal(true);
  };

  const handleDeleteKbCancel = () => {
    setShowDeleteKbModal(false);
    setKbArticleToDelete(null);
  };

  const handleDeleteKbArticle = async () => {
    if (!kbArticleToDelete) return;

    try {
      setDeletingKb(true);
      setError("");
      setSuccess("");

      const result = await deleteNursingEntranceExamKbArticle(
        kbArticleToDelete.id
      );

      if (result.success) {
        setSuccess(
          `Knowledge Base Article "${
            kbArticleToDelete.pageName || kbArticleToDelete.id
          }" deleted successfully.`
        );
        setShowDeleteKbModal(false);
        setKbArticleToDelete(null);
        refreshContentSilently("kb");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete Knowledge Base Article.");
      }
    } catch (err) {
      setError("Failed to delete Knowledge Base Article.");
      console.error("Error deleting KB article:", err);
    } finally {
      setDeletingKb(false);
    }
  };

  const handleDeleteQuizCancel = () => {
    setShowDeleteQuizModal(false);
    setQuizToDelete(null);
  };

  const handleStopQuizExplanations = (quizId: string) => {
    quizExplanationAbortControllers.current[quizId]?.abort();
    delete quizExplanationAbortControllers.current[quizId];
    setQuizExplanationJobs((previous) => ({
      ...previous,
      [quizId]: {
        ...(previous[quizId] || {
          total: 0,
          completed: 0,
          generated: 0,
          failed: 0,
          needsReview: 0,
        }),
        running: false,
      },
    }));
    setSuccess("Explanation generation stopped. Any request that already finished may have saved.");
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleGenerateQuizExplanations = async (quiz: QuizRow) => {
    if (!currentUser) {
      setError("Admin login is required before generating explanations.");
      return;
    }

    const parentId = quiz.parentSubPageDocId || quiz.parentSubPageId || "";
    const nestedId = quiz.nestedSubPageDocId || quiz.nestedSubPageId || "";
    if (!parentId || !nestedId || !quiz.id) {
      setError("This quiz is missing route identifiers required for explanation generation.");
      return;
    }

    setError("");
    setSuccess("");
    setQuizExplanationJobs((previous) => ({
      ...previous,
      [quiz.id]: {
        running: true,
        total: 0,
        completed: 0,
        generated: 0,
        failed: 0,
        needsReview: 0,
      },
    }));

    const abortController = new AbortController();
    quizExplanationAbortControllers.current[quiz.id] = abortController;

    try {
      const questionsResult = await getNursingEntranceExamQuizQuestions(
        parentId,
        nestedId,
        quiz.id
      );
      if (!questionsResult.success || !Array.isArray(questionsResult.data)) {
        throw new Error(questionsResult.message || "Could not load quiz questions.");
      }

      const targets = questionsResult.data.filter(
        (question: { explanation?: unknown }) =>
          !String(question.explanation || "").trim()
      );
      if (targets.length === 0) {
        setQuizExplanationJobs((previous) => ({
          ...previous,
          [quiz.id]: {
            running: false,
            total: 0,
            completed: 0,
            generated: 0,
            failed: 0,
            needsReview: 0,
          },
        }));
        setSuccess("All questions in this quiz already have explanations.");
        setTimeout(() => setSuccess(""), 3000);
        return;
      }

      const token = await currentUser.getIdToken();
      let generated = 0;
      let failed = 0;
      let needsReview = 0;

      for (let index = 0; index < targets.length; index += 1) {
        if (abortController.signal.aborted) break;
        const question = targets[index] as { id: string; questionId?: string };
        const response = await fetch("/api/admin/nursing-entrance-exam/generate-explanation", {
          method: "POST",
          signal: abortController.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subPageId: parentId,
            nestedSubPageId: nestedId,
            quizId: quiz.id,
            questionId: question.id || question.questionId,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          failed += 1;
        } else if (payload.status === "generated") {
          generated += 1;
        } else if (payload.status === "needs_answer_review") {
          needsReview += 1;
        }

        setQuizExplanationJobs((previous) => ({
          ...previous,
          [quiz.id]: {
            running: true,
            total: targets.length,
            completed: index + 1,
            generated,
            failed,
            needsReview,
          },
        }));
      }

      const stopped = abortController.signal.aborted;
      setQuizExplanationJobs((previous) => ({
        ...previous,
        [quiz.id]: {
          running: false,
          total: targets.length,
          completed: targets.length,
          generated,
          failed,
          needsReview,
        },
      }));
      setSuccess(
        stopped
          ? `Explanation generation stopped for ${quiz.pageName || quiz.quizName || quiz.id}: ${generated} generated, ${needsReview} need answer review, ${failed} failed.`
          : `Explanation generation finished for ${quiz.pageName || quiz.quizName || quiz.id}: ${generated} generated, ${needsReview} need answer review, ${failed} failed.`
      );
      setTimeout(() => setSuccess(""), 6000);
    } catch (generationError) {
      const wasStopped = abortController.signal.aborted;
      setQuizExplanationJobs((previous) => ({
        ...previous,
        [quiz.id]: {
          ...(previous[quiz.id] || {
            total: 0,
            completed: 0,
            generated: 0,
            failed: 0,
            needsReview: 0,
          }),
          running: false,
        },
      }));
      if (wasStopped) {
        setSuccess("Explanation generation stopped. Any request that already finished may have saved.");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Failed to generate explanations."
        );
      }
    } finally {
      if (quizExplanationAbortControllers.current[quiz.id] === abortController) {
        delete quizExplanationAbortControllers.current[quiz.id];
      }
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizValidationError("");

    if (!newQuizId.trim() || !newQuizName.trim()) {
      setQuizValidationError("Quiz ID and Name are required.");
      return;
    }

    if (!selectedNestedSubPageForQuiz) {
      setQuizValidationError("Nested Sub Page is required.");
      return;
    }

    const normalizedQuizName = normalizeAdminContentName(newQuizName);
    const normalizedQuizId = normalizeAdminContentSlug(
      newQuizId || normalizedQuizName
    );

    if (!normalizedQuizName || !normalizedQuizId) {
      setQuizValidationError("Quiz name and slug are required.");
      return;
    }

    const normalizedQuizYear = newQuizExamYear.trim()
      ? Number(newQuizExamYear)
      : undefined;
    if (
      normalizedQuizYear !== undefined &&
      (!Number.isInteger(normalizedQuizYear) ||
        normalizedQuizYear < 2000 ||
        normalizedQuizYear > 2100)
    ) {
      setQuizValidationError("Quiz year must be a valid year between 2000 and 2100.");
      return;
    }

    // Check if slug is taken across all levels
    const slugCheck = isSlugTaken(normalizedQuizId);
    if (slugCheck.taken) {
      setQuizValidationError(
        slugCheck.message ||
          `A page with slug "${normalizedQuizId}" already exists.`
      );
      return;
    }

    try {
      setSavingQuiz(true);
      setError("");
      setSuccess("");

      // Use parentSubPageId (slug) for the function, as it resolves IDs internally
      const parentSubPageId =
        selectedNestedSubPageForQuiz.parentSubPageId ||
        selectedNestedSubPageForQuiz.parentSubPageDocId ||
        "";
      const nestedSubPageId =
        selectedNestedSubPageForQuiz.slug || selectedNestedSubPageForQuiz.id;
      const nestedSubPageName =
        selectedNestedSubPageForQuiz.pageName ||
        selectedNestedSubPageForQuiz.hero?.title ||
        selectedNestedSubPageForQuiz.title ||
        selectedNestedSubPageForQuiz.id;
      const examAccessProductId = normalizeContentExamAccessProductId(
        "nursing-entrance-exam",
        selectedNestedSubPageForQuiz.examAccessProductId,
        `${selectedNestedSubPageForQuiz.parentSubPageName || ""} ${nestedSubPageName}`
      );
      const examProductName =
        entranceExamAccessProducts.find((product) => product.examId === examAccessProductId)?.name ||
        contentAccessProductLabel(examAccessProductId);
      const generatedSchema = buildEntranceQuizSchemaMarkup({
        slug: normalizedQuizId,
        quizName: normalizedQuizName,
        description: `Practice questions for ${normalizedQuizName}. Review answer choices and explanations as you study.`,
        examProductName,
        subjectName: nestedSubPageName,
        categoryName: "Nursing Entrance Exam",
        setNumber: newQuizSetNumber ? Number(newQuizSetNumber) : undefined,
        questionCount: 0,
        breadcrumbs: [
          { name: "Nursing Entrance Exam", slug: "nursing-entrance-exam" },
          {
            name: selectedNestedSubPageForQuiz.parentSubPageName || parentSubPageId,
            slug: parentSubPageId,
          },
          { name: nestedSubPageName, slug: nestedSubPageId },
          { name: normalizedQuizName, slug: normalizedQuizId },
        ],
        questions: [],
      });

      const defaultQuizContent = {
        pageName: normalizedQuizName,
        slug: normalizedQuizId,
        setNumber: newQuizSetNumber ? Number(newQuizSetNumber) : undefined,
        examYear: normalizedQuizYear,
        meta: {
          title: `${normalizedQuizName} | NursingMocks`,
          description: `Content for ${normalizedQuizName} under ${nestedSubPageName}.`,
          keywords: `${normalizedQuizName}, ${nestedSubPageName}, nursing entrance exam`,
          ogTitle: `${normalizedQuizName} | NursingMocks`,
          ogDescription: `Content for ${normalizedQuizName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedQuizId}`,
        },
        hero: {
          title: normalizedQuizName,
        },
        schema: generatedSchema,
      };

      const result = await uploadNursingEntranceExamQuiz(
        parentSubPageId,
        nestedSubPageId,
        normalizedQuizId,
        defaultQuizContent
      );

      if (result.success) {
        setSuccess(`Quiz "${normalizedQuizName}" created successfully.`);
        setShowCreateQuizModal(false);
        setSelectedNestedSubPageForQuiz(null);
        setNewQuizId("");
        setNewQuizName("");
        setNewQuizSlugManuallyEdited(false);
        setNewQuizSetNumber("");
        setNewQuizExamYear("");
        setQuizValidationError("");
        refreshContentSilently("quizzes");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setQuizValidationError(result.message || "Failed to create quiz.");
      }
    } catch (err) {
      setQuizValidationError("Failed to create quiz.");
      console.error("Error creating quiz:", err);
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleCreateNestedSubPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setNestedValidationError("");

    if (!newNestedSubPageId.trim() || !newNestedSubPageName.trim()) {
      setNestedValidationError("Nested Sub Page slug and name are required.");
      return;
    }

    if (!selectedSubPageForNested) {
      setNestedValidationError("Parent Sub Page is required.");
      return;
    }

    const normalizedNestedSubPageName = normalizeAdminContentName(newNestedSubPageName);
    const normalizedNestedSubPageId = normalizeAdminContentSlug(
      newNestedSubPageId || normalizedNestedSubPageName
    );

    if (!normalizedNestedSubPageName || !normalizedNestedSubPageId) {
      setNestedValidationError("Nested Sub Page name and slug are required.");
      return;
    }

    // Check if slug is taken across all levels
    const slugCheck = isSlugTaken(normalizedNestedSubPageId);
    if (slugCheck.taken) {
      setNestedValidationError(
        slugCheck.message ||
          `A page with slug "${normalizedNestedSubPageId}" already exists.`
      );
      return;
    }

    try {
      setSavingNested(true);
      setError("");
      setSuccess("");

      const parentSubPageName =
        selectedSubPageForNested.pageName ||
        selectedSubPageForNested.hero?.title ||
        selectedSubPageForNested.title ||
        selectedSubPageForNested.id;
      const parentSubPageId =
        selectedSubPageForNested.slug || selectedSubPageForNested.id;

      const defaultNestedSubPageContent = {
        pageName: normalizedNestedSubPageName,
        status: "Draft",
        heading: "",
        description: "",
        seoLabel: normalizedNestedSubPageName,
        seoSlug: normalizedNestedSubPageId,
        createdAt: new Date().toISOString(),
        bodyContent: "",
        meta: {
          title: `${normalizedNestedSubPageName} | NursingMocks`,
          description: `Content for ${normalizedNestedSubPageName} under ${parentSubPageName}.`,
          keywords: `${normalizedNestedSubPageName}, ${parentSubPageId}, nursing entrance exam`,
          ogTitle: `${normalizedNestedSubPageName} | NursingMocks`,
          ogDescription: `Content for ${normalizedNestedSubPageName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedNestedSubPageId}`,
        },
        schema: "",
        hero: {
          title: "",
          description: "",
        },
      };

      const result = await uploadNestedSubPage(
        parentSubPageId,
        normalizedNestedSubPageId,
        defaultNestedSubPageContent
      );

      if (result.success) {
        setSuccess(
          `Nested Sub Page "${normalizedNestedSubPageName}" created successfully.`
        );
        setShowCreateNestedModal(false);
        setSelectedSubPageForNested(null);
        setNewNestedSubPageId("");
        setNewNestedSubPageName("");
        setNewNestedSubPageSlugManuallyEdited(false);
        setNestedValidationError("");
        refreshContentSilently("nested");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setNestedValidationError(
          result.message || "Failed to create Nested Sub Page."
        );
      }
    } catch (err) {
      setNestedValidationError("Failed to create Nested Sub Page.");
      console.error("Error creating nested sub-page:", err);
    } finally {
      setSavingNested(false);
    }
  };

  const handleCreateKbArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setKbValidationError("");

    if (!newKbArticleId.trim() || !newKbArticleName.trim()) {
      setKbValidationError("Knowledge Base Article slug and name are required.");
      return;
    }

    if (!selectedSubPageForKb) {
      setKbValidationError("Please select a Sub Page.");
      return;
    }

    const normalizedKbArticleName = normalizeAdminContentName(newKbArticleName);
    const normalizedKbArticleId = normalizeAdminContentSlug(
      newKbArticleId || normalizedKbArticleName
    );

    if (!normalizedKbArticleName || !normalizedKbArticleId) {
      setKbValidationError("Knowledge Base Article name and slug are required.");
      return;
    }

    // Check if slug is taken across all levels
    const slugCheck = isSlugTaken(normalizedKbArticleId);
    if (slugCheck.taken) {
      setKbValidationError(
        slugCheck.message ||
          `A page with slug "${normalizedKbArticleId}" already exists.`
      );
      return;
    }

    try {
      setSavingKb(true);
      setError("");
      setSuccess("");

      const defaultKbArticleContent = {
        pageName: normalizedKbArticleName,
        status: "Published",
        heading: "",
        description: "",
        seoLabel: normalizedKbArticleName,
        seoSlug: normalizedKbArticleId,
        createdAt: new Date().toISOString(),
        parentId: selectedSubPageForKb,
        parentSubPageId: selectedSubPageForKb,
        meta: {
          title: `${normalizedKbArticleName} | Nursing Entrance Exam`,
          description: `Knowledge Base Article: ${normalizedKbArticleName} under Nursing Entrance Exam.`,
          keywords: `${normalizedKbArticleName}, nursing entrance exam, knowledge base`,
          ogTitle: `${normalizedKbArticleName} | Nursing Entrance Exam`,
          ogDescription: `Knowledge Base Article: ${normalizedKbArticleName} under Nursing Entrance Exam.`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedKbArticleId}`,
        },
        schema: "",
        bodyContent: "",
        tags: [],
        isFeatured: false,
        isFaq: false,
        isStudentFacing: true,
        readingTimeMinutes: 0,
        difficultyLevel: "",
        authorId: "",
        authorName: "",
        source: "",
        relatedArticleIds: [],
        relatedQuizIds: [],
        viewsCount: 0,
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        publishedAt: new Date().toISOString(),
        skillId: "",
      };

      const result = await uploadNursingEntranceExamKbArticle(
        normalizedKbArticleId,
        defaultKbArticleContent
      );

      if (result.success) {
        setSuccess(`Knowledge Base Article "${normalizedKbArticleName}" created successfully.`);
        setShowCreateKbModal(false);
        setNewKbArticleId("");
        setNewKbArticleName("");
        setNewKbArticleSlugManuallyEdited(false);
        setSelectedSubPageForKb("");
        setKbValidationError("");
        refreshContentSilently("kb");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setKbValidationError(result.message || "Failed to create Knowledge Base Article.");
      }
    } catch (err) {
      setKbValidationError("Failed to create Knowledge Base Article.");
      console.error("Error creating KB article:", err);
    } finally {
      setSavingKb(false);
    }
  };

  const handleCreateSubPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newSubPageId.trim() || !newSubPageName.trim()) {
      setValidationError("Sub Page slug and name are required.");
      return;
    }

    const normalizedSubPageName = normalizeAdminContentName(newSubPageName);
    const normalizedSubPageId = normalizeAdminContentSlug(newSubPageId || normalizedSubPageName);
    if (!normalizedSubPageName || !normalizedSubPageId) {
      setValidationError("Sub Page name and slug are required.");
      return;
    }
    const accessValidation = validateContentExamAccessProductId(
      "nursing-entrance-exam",
      newSubPageExamAccessProductId
    );
    if (!accessValidation.valid) {
      setValidationError(accessValidation.message);
      return;
    }

    // Check if slug is taken across all levels
    const slugCheck = isSlugTaken(normalizedSubPageId);
    if (slugCheck.taken) {
      setValidationError(
        slugCheck.message ||
          `A page with slug "${normalizedSubPageId}" already exists.`
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const defaultSubPageContent = {
        pageName: normalizedSubPageName,
        examAccessProductId: newSubPageExamAccessProductId,
        status: "Published",
        heading: "",
        description: "",
        seoLabel: normalizedSubPageName,
        seoSlug: normalizedSubPageId,
        createdAt: new Date().toISOString(),
        meta: {
          title: `${normalizedSubPageName} | Nursing Entrance Exam`,
          description: `Content for ${normalizedSubPageName} under Nursing Entrance Exam.`,
          keywords: `${normalizedSubPageName}, nursing entrance exam`,
          ogTitle: `${normalizedSubPageName} | Nursing Entrance Exam`,
          ogDescription: `Content for ${normalizedSubPageName} under Nursing Entrance Exam.`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedSubPageId}`,
        },
        schema: "",
        bodyContent: "",
      };

      const result = await uploadNursingEntranceExamSubPage(
        normalizedSubPageId,
        defaultSubPageContent
      );

      if (result.success) {
        setSuccess(`Sub Page "${normalizedSubPageName}" created successfully.`);
        setShowCreateModal(false);
        setNewSubPageId("");
        setNewSubPageName("");
        setNewSubPageSlugManuallyEdited(false);
        setNewSubPageExamAccessProductId(entranceExamAccessProducts[0]?.examId || "ati_teas_7");
        setValidationError("");
        refreshContentSilently("sub-pages");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create Sub Page.");
      }
    } catch (err) {
      setValidationError("Failed to create Sub Page.");
      console.error("Error creating sub-page:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-white">
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
              { label: "Nursing Entrance Exam" },
            ]}
            actions={currentUser ? <UserProfileBadge /> : null}
          />
          <div className="admin-page flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <AdminLoadingState
              title="Loading Nursing Entrance Exam Content"
              description="Preparing Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
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
            { label: "Nursing Entrance Exam" },
          ]}
          actions={
            currentUser ? (
              <UserProfileBadge />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="admin-breadcrumb-link"
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

        <div className="admin-workspace admin-content-management-page">
          {/* Main Content */}
          <div className="admin-content">
            <AdminNotificationRegion
              error={error}
              success={success}
              errorTitle="Could Not Load Content"
              successTitle="Content Saved"
            />

            {/* Page Header */}
            <AdminPageHeader
              eyebrow="Admin Content"
              title="Nursing Entrance Exam"
              description="Manage the main pillar page, Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata for ATI TEAS 7 and HESI A2."
              actions={
                <Link href="/admin/nursing-entrance-exam/edit" className="admin-button-secondary">
                  Edit Main Page
                </Link>
              }
            />
            <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)]">
              <AdminCard
                title="Content Structure"
                description="A quick map of the entrance exam content hierarchy managed from this page."
              >
                <div className="grid gap-3">
                  <AdminInfoTile label="Main Pillar Page">
                    Nursing Entrance Exam
                  </AdminInfoTile>
                  <AdminInfoTile label="Sub Pages">
                    {subPages.length > 0
                      ? `${subPages
                          .slice(0, 4)
                          .map((sp) => sp.pageName || sp.hero?.title || sp.title || sp.id)
                          .join(", ")}${subPages.length > 4 ? `, +${subPages.length - 4} more` : ""}`
                      : "No sub pages yet"}
                  </AdminInfoTile>
                  <AdminBadgeList
                    items={[
                      ...subPages.slice(0, 4).map((sp) => ({
                        label: sp.pageName || sp.hero?.title || sp.title || sp.id,
                        tone: "purple" as const,
                      })),
                      ...(subPages.length > 4
                        ? [
                            {
                              label: `${subPages.length - 4} More Sub Pages`,
                              tone: "gray" as const,
                            },
                          ]
                        : []),
                      ...(kbArticlesCount > 0
                        ? [
                            {
                              label: `${kbArticlesCount} Knowledge Base ${
                                kbArticlesCount === 1 ? "Article" : "Articles"
                              }`,
                              tone: "green" as const,
                            },
                          ]
                        : []),
                      ...(quizzesCount > 0
                        ? [
                            {
                              label: `${quizzesCount} ${
                                quizzesCount === 1 ? "Quiz Record" : "Quiz Records"
                              }`,
                              tone: "amber" as const,
                            },
                          ]
                        : []),
                    ]}
                    emptyLabel="No Sub Pages, Knowledge Base Articles, or Quiz Metadata yet"
                  />
                </div>
              </AdminCard>

              <AdminCard
                title="Content Stats"
                description="Live counts from Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminStatCard label="Sub Pages" value={subPages.length} helper="ATI TEAS 7, HESI A2, or future entrance products." />
                  <AdminStatCard label="Nested Sub Pages" value={nestedSubPages.length} helper="Subject pages under each entrance product." />
                  <AdminStatCard label="Knowledge Base Articles" value={kbArticlesCount} helper="Supporting student-facing content." />
                  <AdminStatCard label="Quiz Metadata" value={quizzesCount} helper="Question-set records attached to subjects." />
                </div>
              </AdminCard>
            </div>

            {/* Tabs Row */}
            <AdminTabs
              tabs={nursingEntranceAdminTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              label="Nursing entrance exam management sections"
            />

            {/* Sub Pages Table Card */}
            <AdminCard className="mt-2">
              {/* Toolbar */}
              <AdminToolbar
                className="admin-info-tile mb-4 p-4"
                actions={
                  activeTab === "kb" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNewKbArticleId("");
                        setNewKbArticleName("");
                        setNewKbArticleSlugManuallyEdited(false);
                        setSelectedSubPageForKb("");
                        setKbValidationError("");
                        setShowCreateKbModal(true);
                      }}
                      className="admin-button-primary"
                    >
                      New Knowledge Base Article
                    </button>
                  ) : activeTab === "nested" ? (
                    <p className="admin-helper max-w-[220px] text-right">
                      Use Add Nested Sub Page from a Sub Page row.
                    </p>
                  ) : activeTab === "quizzes" ? (
                    <p className="admin-helper max-w-[220px] text-right">
                      Use Add Quiz from a Nested Sub Page row.
                    </p>
                  ) : activeTab === "sub-pages" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNewSubPageId("");
                        setNewSubPageName("");
                        setNewSubPageSlugManuallyEdited(false);
                        setValidationError("");
                        setShowCreateModal(true);
                      }}
                      className="admin-button-primary"
                    >
                      New Sub Page
                    </button>
                  ) : null
                }
              >
                <div className="admin-toolbar-control">
                  <label className="admin-field-label" htmlFor="nursing-entrance-search">
                    Search
                  </label>
                  <input
                    id="nursing-entrance-search"
                    className="admin-field"
                    type="search"
                    placeholder={
                      activeTab === "nested"
                        ? "Search Nested Sub Pages"
                        : activeTab === "quizzes"
                        ? "Search Quiz Metadata"
                        : activeTab === "kb"
                        ? "Search Knowledge Base Articles"
                        : "Search Sub Pages"
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="admin-toolbar-control">
                  <label className="admin-field-label" htmlFor="nursing-entrance-exam-filter">
                    Exam
                  </label>
                  <select
                    id="nursing-entrance-exam-filter"
                    className="admin-field"
                    value={examFilter}
                    onChange={(e) => {
                      hasManuallyChangedExamFilter.current = true;
                      setExamFilter(e.target.value);
                    }}
                  >
                    <option value="">All Exams</option>
                    {uniqueSubPageNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-toolbar-control">
                  <label className="admin-field-label" htmlFor="nursing-entrance-status-filter">
                    Status
                  </label>
                  <select
                    id="nursing-entrance-status-filter"
                    className="admin-field"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </AdminToolbar>

              {/* Table */}
              <AdminTable>
                  <thead>
                    <tr>
                      <th className="min-w-[210px] text-left">
                        Title
                      </th>
                      <th className="text-left">
                        Exam
                      </th>
                      <th className="text-left">
                        Level
                      </th>
                      {activeTab === "quizzes" && (
                        <th className="text-left">
                          Questions
                        </th>
                      )}
                      {activeTab === "quizzes" && (
                        <th className="text-left">
                          Year
                        </th>
                      )}
                      <th className="min-w-[180px] text-left">
                        URL slug
                      </th>
                      <th className="text-left">
                        Status
                      </th>
                      <th className="text-left">
                        Last updated
                      </th>
                      <th className="text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {((activeTab === "nested" && contentDetailsLoading) ||
                      (activeTab === "quizzes" && quizMetadataLoading) ||
                      (activeTab === "kb" && contentDetailsLoading)) ? (
                      <tr>
                        <td colSpan={activeTab === "quizzes" ? 9 : 7}>
                          <div className="flex justify-center py-8">
                            <AdminInlineLoading
                              label={
                                activeTab === "nested"
                                  ? "Loading Nested Sub Pages"
                                  : activeTab === "quizzes"
                                  ? "Loading Quiz Metadata"
                                  : "Loading Knowledge Base Articles"
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ) : activeTab === "quizzes" ? (
                      (() => {
                        const filteredQuizzes = quizzes.filter((quiz) => {
                          // Search filter
                          if (searchQuery) {
                            const name =
                              quiz.quizName ||
                              quiz.pageName ||
                              quiz.title ||
                              quiz.name ||
                              quiz.id;
                            if (
                              !name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            ) {
                              return false;
                            }
                          }

                          // Exam filter - compare against Exam column value (sub-page name)
                          if (examFilter) {
                            // Get sub-page name from subPages array (same logic as Exam column)
                            const parentSubPage = subPages.find(
                              (sp) =>
                                sp.id === quiz.parentSubPageDocId ||
                                sp.slug === quiz.parentSubPageId ||
                                sp.id === quiz.parentSubPageId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : quiz.parentSubPageName || quiz.parentSubPageId;

                            // Compare exact match with filter value
                            if (examName !== examFilter) {
                              return false;
                            }
                          }

                          // Status filter
                          if (statusFilter) {
                            // For now, all quizzes are published, but check if status field exists
                            const status = quiz.status || "published";
                            if (statusFilter !== status.toLowerCase()) {
                              return false;
                            }
                          }

                          return true;
                        });
                        const sortedQuizzes = sortByLastUpdatedDesc(filteredQuizzes);
                        const startIndex = (quizzesPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedQuizzes = sortedQuizzes.slice(
                          startIndex,
                          endIndex
                        );

                        return sortedQuizzes.length === 0 ? (
                          <AdminTableEmptyState
                            colSpan={9}
                            title="No Quiz Metadata Found"
                            description="Open Nested Sub Pages and use Add Quiz on the correct subject row when you are ready to attach a question set."
                          />
                        ) : (
                          paginatedQuizzes.map((quiz) => {
                            const quizName =
                              quiz.quizName ||
                              quiz.pageName ||
                              quiz.title ||
                              quiz.name ||
                              quiz.id;
                            const lastUpdated = formatAdminLastUpdated(quiz.lastUpdated);
                            const explanationJob = quizExplanationJobs[quiz.id];
                            const hasQuestions = Number(quiz.questionCount || 0) > 0;

                            // Get sub-page name from subPages array
                            const parentSubPage = subPages.find(
                              (sp) =>
                                sp.id === quiz.parentSubPageDocId ||
                                sp.slug === quiz.parentSubPageId ||
                                sp.id === quiz.parentSubPageId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : quiz.parentSubPageName || quiz.parentSubPageId;

                            return (
                              <tr key={quiz.id}>
                                <AdminTableCell className="min-w-[210px]">
                                  {quizName}
                                </AdminTableCell>
                                <AdminTableCell>
                                  {examName}
                                </AdminTableCell>
                                <AdminTableCell>
                                  Quiz
                                </AdminTableCell>
                                <AdminTableCell>
                                  {quiz.questionCount !== undefined
                                    ? quiz.questionCount
                                    : "—"}
                                </AdminTableCell>
                                <AdminTableCell>
                                  {quiz.examYear || quiz.year || "—"}
                                </AdminTableCell>
                                <AdminTableCell className="min-w-[180px]" mono>
                                  /{quiz.slug || quiz.id}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <AdminStatusBadge label={quiz.status || "Published"} />
                                </AdminTableCell>
                                <AdminTableCell>
                                  {lastUpdated}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <div className="admin-crud-actions">
                                    <Link
                                      href={`/admin/nursing-entrance-exam/${
                                        quiz.parentSubPageDocId ||
                                        quiz.parentSubPageId
                                      }/nested/${
                                        quiz.nestedSubPageDocId ||
                                        quiz.nestedSubPageId
                                      }/quizzes/${quiz.id}/manage`}
                                      className="admin-crud-button admin-crud-button-primary"
                                    >
                                      Manage
                                    </Link>
                                    <Link
                                      href={`/${quiz.slug || quiz.id}`}
                                      target="_blank"
                                      className="admin-crud-button admin-crud-button-neutral"
                                    >
                                      View
                                    </Link>
                                    {hasQuestions && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          explanationJob?.running
                                            ? handleStopQuizExplanations(quiz.id)
                                            : void handleGenerateQuizExplanations(quiz)
                                        }
                                        className={`admin-crud-button ${
                                          explanationJob?.running
                                            ? "admin-crud-button-danger"
                                            : "admin-crud-button-secondary"
                                        }`}
                                      >
                                        {explanationJob?.running ? "Stop" : "Generate Explanations"}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteQuizClick(quiz)
                                      }
                                      className="admin-crud-button admin-crud-button-danger"
                                    >
                                      Delete
                                    </button>
                                    {explanationJob && (
                                      <span className="text-xs text-gray-500">
                                        {explanationJob.completed}/{explanationJob.total} · Review {explanationJob.needsReview} · Failed {explanationJob.failed}
                                      </span>
                                    )}
                                  </div>
                                </AdminTableCell>
                              </tr>
                            );
                          })
                        );
                      })()
                    ) : activeTab === "kb" ? (
                      (() => {
                        const filteredKbArticles = kbArticles.filter((kb) => {
                          // Search filter
                          if (searchQuery) {
                            const name = kb.pageName || kb.title || kb.id;
                            if (
                              !name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            ) {
                              return false;
                            }
                          }

                          // Exam filter - compare against parent sub-page
                          if (examFilter) {
                            const parentSubPage = subPages.find(
                              (sp) => sp.id === kb.parentId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : "";

                            if (examName !== examFilter) {
                              return false;
                            }
                          }

                          // Status filter
                          if (statusFilter) {
                            const status = kb.status || "published";
                            if (statusFilter !== status.toLowerCase()) {
                              return false;
                            }
                          }

                          return true;
                        });
                        const sortedKbArticles = sortByLastUpdatedDesc(filteredKbArticles);
                        const startIndex = (kbArticlesPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedKbArticles = sortedKbArticles.slice(
                          startIndex,
                          endIndex
                        );

                        return sortedKbArticles.length === 0 ? (
                          <AdminTableEmptyState
                            colSpan={7}
                            title="No Knowledge Base Articles Found"
                            description="Create a Knowledge Base Article when this entrance exam area needs supporting study content, FAQs, or SEO guidance."
                          />
                        ) : (
                          paginatedKbArticles.map((kbArticle) => {
                            const pageName =
                              kbArticle.pageName ||
                              kbArticle.title ||
                              kbArticle.id;
                            const lastUpdated = formatAdminLastUpdated(kbArticle.lastUpdated);

                            // Get sub-page name from subPages array
                            const parentSubPage = subPages.find(
                              (sp) => sp.id === kbArticle.parentId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : "—";

                            return (
                              <tr key={kbArticle.id}>
                                <AdminTableCell className="min-w-[210px]">
                                  {pageName}
                                </AdminTableCell>
                                <AdminTableCell>
                                  {examName}
                                </AdminTableCell>
                                <AdminTableCell>
                                  Knowledge Base Article
                                </AdminTableCell>
                                <AdminTableCell className="min-w-[180px]" mono>
                                  /{kbArticle.slug || kbArticle.id}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <AdminStatusBadge
                                    label={kbArticle.status || "Published"}
                                  />
                                </AdminTableCell>
                                <AdminTableCell>
                                  {lastUpdated}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <div className="admin-crud-actions">
                                    <Link
                                      href={`/${
                                        kbArticle.slug || kbArticle.id
                                      }`}
                                      target="_blank"
                                      className="admin-crud-button admin-crud-button-neutral"
                                    >
                                      View
                                    </Link>
                                    <Link
                                      href={`/admin/nursing-entrance-exam/kb-articles/${kbArticle.id}`}
                                      className="admin-crud-button admin-crud-button-secondary"
                                    >
                                      Edit
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteKbClick(kbArticle);
                                      }}
                                      className="admin-crud-button admin-crud-button-danger"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </AdminTableCell>
                              </tr>
                            );
                          })
                        );
                      })()
                    ) : activeTab === "nested" ? (
                      (() => {
                        const filteredNestedSubPages = nestedSubPages.filter(
                          (nsp) => {
                            // Search filter
                            if (searchQuery) {
                              const name =
                                nsp.pageName ||
                                nsp.hero?.title ||
                                nsp.title ||
                                nsp.id;
                              if (
                                !name
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              ) {
                                return false;
                              }
                            }

                            // Exam filter - compare against Exam column value (sub-page name)
                            if (examFilter) {
                              // Get sub-page name from subPages array (same logic as Exam column)
                              const parentSubPage = subPages.find(
                                (sp) =>
                                  sp.id === nsp.parentSubPageDocId ||
                                  sp.slug === nsp.parentSubPageId ||
                                  sp.id === nsp.parentSubPageId
                              );
                              const examName = parentSubPage
                                ? parentSubPage.pageName ||
                                  parentSubPage.hero?.title ||
                                  parentSubPage.title ||
                                  parentSubPage.id
                                : nsp.parentSubPageName || nsp.parentSubPageId;

                              // Compare exact match with filter value
                              if (examName !== examFilter) {
                                return false;
                              }
                            }

                            // Status filter
                            if (statusFilter) {
                              // For now, all nested sub-pages are published, but check if status field exists
                              const status = nsp.status || "published";
                              if (statusFilter !== status.toLowerCase()) {
                                return false;
                              }
                            }

                            return true;
                          }
                        );
                        const sortedNestedSubPages =
                          sortByLastUpdatedDesc(filteredNestedSubPages);
                        const startIndex =
                          (nestedSubPagesPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedNestedSubPages =
                          sortedNestedSubPages.slice(startIndex, endIndex);

                        return sortedNestedSubPages.length === 0 ? (
                          <AdminTableEmptyState
                            colSpan={7}
                            title="No Nested Sub Pages Found"
                            description="Open Sub Pages and use Add Nested Sub Page on ATI TEAS 7 or HESI A2 to organize subjects such as Reading, Math, Science, Vocabulary, or Anatomy and Physiology."
                          />
                        ) : (
                          paginatedNestedSubPages.map((nestedSubPage) => {
                            const pageName =
                              nestedSubPage.pageName ||
                              nestedSubPage.hero?.title ||
                              nestedSubPage.title ||
                              nestedSubPage.id;
                            const lastUpdated = formatAdminLastUpdated(nestedSubPage.lastUpdated);

                            // Get sub-page name from subPages array
                            const parentSubPage = subPages.find(
                              (sp) =>
                                sp.id === nestedSubPage.parentSubPageDocId ||
                                sp.slug === nestedSubPage.parentSubPageId ||
                                sp.id === nestedSubPage.parentSubPageId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : nestedSubPage.parentSubPageName ||
                                nestedSubPage.parentSubPageId;

                            return (
                              <tr key={nestedSubPage.id}>
                                <AdminTableCell className="min-w-[210px]">
                                  {pageName}
                                </AdminTableCell>
                                <AdminTableCell>
                                  {examName}
                                </AdminTableCell>
                                <AdminTableCell>
                                  Nested Sub Page
                                </AdminTableCell>
                                <AdminTableCell className="min-w-[180px]" mono>
                                  /{nestedSubPage.slug || nestedSubPage.id}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <AdminStatusBadge
                                    label={nestedSubPage.status || "Published"}
                                  />
                                </AdminTableCell>
                                <AdminTableCell>
                                  {lastUpdated}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <div className="admin-crud-actions">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedNestedSubPageForQuiz(
                                          nestedSubPage
                                        );
                                        setNewQuizId("");
                                        setNewQuizName("");
                                        setNewQuizSlugManuallyEdited(false);
                                        setNewQuizSetNumber("");
                                        setNewQuizExamYear("");
                                        setQuizValidationError("");
                                        setShowCreateQuizModal(true);
                                      }}
                                      className="admin-crud-button admin-crud-button-primary"
                                    >
                                      Add Quiz
                                    </button>
                                    <Link
                                      href={`/admin/nursing-entrance-exam/${nestedSubPage.parentSubPageId}/nested/${nestedSubPage.id}`}
                                      className="admin-crud-button admin-crud-button-secondary"
                                    >
                                      Edit
                                    </Link>
                                    <Link
                                      href={`/${
                                        nestedSubPage.slug || nestedSubPage.id
                                      }`}
                                      target="_blank"
                                      className="admin-crud-button admin-crud-button-neutral"
                                    >
                                      View
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteNestedClick(nestedSubPage)
                                      }
                                      className="admin-crud-button admin-crud-button-danger"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </AdminTableCell>
                              </tr>
                            );
                          })
                        );
                      })()
                    ) : subPages.length === 0 ? (
                      <AdminTableEmptyState
                        colSpan={7}
                        title="No Sub Pages Found"
                        description="Create a Sub Page for an entrance exam product such as ATI TEAS 7 or HESI A2."
                      />
                    ) : (
                      subPages
                        .filter((sp) => {
                          // Search filter
                          if (searchQuery) {
                            const name =
                              sp.pageName ||
                              sp.hero?.title ||
                              sp.title ||
                              sp.id;
                            if (
                              !name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            ) {
                              return false;
                            }
                          }

                          // Exam filter - compare against Exam column value (sub-page name)
                          if (examFilter) {
                            const pageName =
                              sp.pageName ||
                              sp.hero?.title ||
                              sp.title ||
                              sp.id;

                            // Compare exact match with filter value
                            if (pageName !== examFilter) {
                              return false;
                            }
                          }

                          // Status filter
                          if (statusFilter) {
                            // For now, all sub-pages are published, but check if status field exists
                            const status = sp.status || "published";
                            if (statusFilter !== status.toLowerCase()) {
                              return false;
                            }
                          }

                          return true;
                        })
                        .sort(
                          (a, b) =>
                            getLastUpdatedTime(b.lastUpdated) -
                            getLastUpdatedTime(a.lastUpdated)
                        )
                        .slice(
                          (subPagesPage - 1) * itemsPerPage,
                          subPagesPage * itemsPerPage
                        )
                        .map((subPage) => {
                          const pageName =
                            subPage.pageName ||
                            subPage.hero?.title ||
                            subPage.title ||
                            subPage.id;
                          const lastUpdated = formatAdminLastUpdated(subPage.lastUpdated);

                          return (
                            <tr key={subPage.id}>
                              <AdminTableCell className="min-w-[210px]">
                                {pageName}
                              </AdminTableCell>
                              <AdminTableCell>
                                {pageName}
                              </AdminTableCell>
                              <AdminTableCell>
                                Sub Page
                              </AdminTableCell>
                              <AdminTableCell className="min-w-[180px]" mono>
                                /{subPage.slug || subPage.id}
                              </AdminTableCell>
                              <AdminTableCell>
                                <AdminStatusBadge
                                  label={subPage.status || "Published"}
                                />
                              </AdminTableCell>
                              <AdminTableCell>
                                {lastUpdated}
                              </AdminTableCell>
                              <AdminTableCell>
                                <div className="admin-crud-actions">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubPageForNested(subPage);
                                      setNewNestedSubPageId("");
                                      setNewNestedSubPageName("");
                                      setNewNestedSubPageSlugManuallyEdited(false);
                                      setNestedValidationError("");
                                      setShowCreateNestedModal(true);
                                    }}
                                    className="admin-crud-button admin-crud-button-primary"
                                  >
                                    Add Nested Sub Page
                                  </button>
                                  <Link
                                    href={`/admin/nursing-entrance-exam/${subPage.id}`}
                                    className="admin-crud-button admin-crud-button-secondary"
                                  >
                                    Edit
                                  </Link>
                                  <Link
                                    href={`/${subPage.slug || subPage.id}`}
                                    target="_blank"
                                    className="admin-crud-button admin-crud-button-neutral"
                                  >
                                    View
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(subPage)}
                                    className="admin-crud-button admin-crud-button-danger"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </AdminTableCell>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
              </AdminTable>

              {/* Pagination Controls */}
              {(activeTab === "sub-pages" ||
                activeTab === "nested" ||
                activeTab === "quizzes" ||
                activeTab === "kb") &&
                (() => {
                  if (activeTab === "sub-pages") {
                    const filteredSubPages = subPages.filter((sp) => {
                      if (searchQuery) {
                        const name =
                          sp.pageName ||
                          sp.hero?.title ||
                          sp.title ||
                          sp.id;
                        if (!name.toLowerCase().includes(searchQuery.toLowerCase())) {
                          return false;
                        }
                      }
                      if (examFilter) {
                        const pageName =
                          sp.pageName ||
                          sp.hero?.title ||
                          sp.title ||
                          sp.id;
                        if (pageName !== examFilter) {
                          return false;
                        }
                      }
                      if (statusFilter) {
                        const status = sp.status || "published";
                        if (statusFilter !== status.toLowerCase()) {
                          return false;
                        }
                      }
                      return true;
                    });
                    const totalPages = Math.ceil(
                      filteredSubPages.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <AdminPagination
                        currentPage={subPagesPage}
                        totalItems={filteredSubPages.length}
                        itemsPerPage={itemsPerPage}
                        itemLabel="Sub Pages"
                        onPageChange={setSubPagesPage}
                      />
                    );
                  }

                  if (activeTab === "kb") {
                    const filteredKbArticles = kbArticles.filter((kb) => {
                      if (searchQuery) {
                        const name = kb.pageName || kb.title || kb.id;
                        if (
                          !name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        ) {
                          return false;
                        }
                      }
                      if (examFilter) {
                        const parentSubPage = subPages.find(
                          (sp) => sp.id === kb.parentId
                        );
                        const examName = parentSubPage
                          ? parentSubPage.pageName ||
                            parentSubPage.hero?.title ||
                            parentSubPage.title ||
                            parentSubPage.id
                          : "";
                        if (examName !== examFilter) {
                          return false;
                        }
                      }
                      if (statusFilter) {
                        const status = kb.status || "published";
                        if (statusFilter !== status.toLowerCase()) {
                          return false;
                        }
                      }
                      return true;
                    });
                    const sortedKbArticles = sortByLastUpdatedDesc(filteredKbArticles);
                    const totalPages = Math.ceil(
                      sortedKbArticles.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <AdminPagination
                        currentPage={kbArticlesPage}
                        totalItems={sortedKbArticles.length}
                        itemsPerPage={itemsPerPage}
                        itemLabel="Knowledge Base Articles"
                        onPageChange={setKbArticlesPage}
                      />
                    );
                  } else if (activeTab === "quizzes") {
                    const filteredQuizzes = quizzes.filter((quiz) => {
                      // Search filter
                      if (searchQuery) {
                        const name =
                          quiz.quizName ||
                          quiz.pageName ||
                          quiz.title ||
                          quiz.name ||
                          quiz.id;
                        if (
                          !name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        ) {
                          return false;
                        }
                      }

                      // Exam filter - compare against Exam column value (sub-page name)
                      if (examFilter) {
                        // Get sub-page name from subPages array (same logic as Exam column)
                        const parentSubPage = subPages.find(
                          (sp) =>
                            sp.id === quiz.parentSubPageDocId ||
                            sp.slug === quiz.parentSubPageId ||
                            sp.id === quiz.parentSubPageId
                        );
                        const examName = parentSubPage
                          ? parentSubPage.pageName ||
                            parentSubPage.hero?.title ||
                            parentSubPage.title ||
                            parentSubPage.id
                          : quiz.parentSubPageName || quiz.parentSubPageId;

                        // Compare exact match with filter value
                        if (examName !== examFilter) {
                          return false;
                        }
                      }

                      // Status filter
                      if (statusFilter) {
                        const status = quiz.status || "published";
                        if (statusFilter !== status.toLowerCase()) {
                          return false;
                        }
                      }

                      return true;
                    });
                    const sortedQuizzes = sortByLastUpdatedDesc(filteredQuizzes);
                    const totalPages = Math.ceil(
                      sortedQuizzes.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <AdminPagination
                        currentPage={quizzesPage}
                        totalItems={sortedQuizzes.length}
                        itemsPerPage={itemsPerPage}
                        itemLabel="Quiz Metadata"
                        onPageChange={setQuizzesPage}
                      />
                    );
                  } else if (activeTab === "nested") {
                    const filteredNestedSubPages = nestedSubPages.filter(
                      (nsp) => {
                        // Search filter
                        if (searchQuery) {
                          const name =
                            nsp.pageName ||
                            nsp.hero?.title ||
                            nsp.title ||
                            nsp.id;
                          if (
                            !name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          ) {
                            return false;
                          }
                        }

                        // Exam filter - compare against Exam column value (sub-page name)
                        if (examFilter) {
                          // Get sub-page name from subPages array (same logic as Exam column)
                          const parentSubPage = subPages.find(
                            (sp) =>
                              sp.id === nsp.parentSubPageDocId ||
                              sp.slug === nsp.parentSubPageId ||
                              sp.id === nsp.parentSubPageId
                          );
                          const examName = parentSubPage
                            ? parentSubPage.pageName ||
                              parentSubPage.hero?.title ||
                              parentSubPage.title ||
                              parentSubPage.id
                            : nsp.parentSubPageName || nsp.parentSubPageId;

                          // Compare exact match with filter value
                          if (examName !== examFilter) {
                            return false;
                          }
                        }

                        // Status filter
                        if (statusFilter) {
                          const status = nsp.status || "published";
                          if (statusFilter !== status.toLowerCase()) {
                            return false;
                          }
                        }

                        return true;
                      }
                    );
                    const sortedNestedSubPages =
                      sortByLastUpdatedDesc(filteredNestedSubPages);
                    const totalPages = Math.ceil(
                      sortedNestedSubPages.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <AdminPagination
                        currentPage={nestedSubPagesPage}
                        totalItems={sortedNestedSubPages.length}
                        itemsPerPage={itemsPerPage}
                        itemLabel="Nested Sub Pages"
                        onPageChange={setNestedSubPagesPage}
                      />
                    );
                  }
                  return null;
                })()}

              <AdminDetailPanel className="mt-4" title="Content Relationship Guide">
                {activeTab === "nested" ? (
                  <>
                    Nested Sub Pages like TEAS Reading, TEAS Math, HESI
                    Vocabulary, and HESI A&P live under their parent Sub Pages.
                    Each Nested Sub Page can have its own quizzes and content.
                  </>
                ) : activeTab === "quizzes" ? (
                  <>
                    Quiz Metadata is linked to Nested Sub Pages. Each quiz
                    contains its own questions stored in the question bank. You
                    can manage quiz questions from the Manage action.
                  </>
                ) : (
                  <>
                    Sub Pages represent ATI TEAS and HESI A2. Nested Sub Pages
                    like TEAS Reading, TEAS Math, HESI Vocabulary, and HESI A&P
                    live under those Sub Pages. Knowledge Base Articles are
                    linked from this pillar and TEAS/HESI Sub Pages under the
                    Knowledge Base Articles tab. Linked quizzes such as ATI TEAS
                    Math Questions Set 1 are managed under the Quiz Metadata tab,
                    and each quiz contains its own questions stored in the
                    question bank.
                  </>
                )}
              </AdminDetailPanel>
            </AdminCard>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && subPageToDelete && (
            <AdminDestructiveDialog
              title="Delete Sub Page"
              itemName={
                subPageToDelete.pageName ||
                subPageToDelete.hero?.title ||
                subPageToDelete.title ||
                subPageToDelete.id
              }
              confirmLabel="Delete"
              confirmingLabel="Deleting..."
              confirming={deleting}
              onCancel={handleDeleteCancel}
              onConfirm={handleDeleteConfirm}
            />
          )}

          {/* Delete Nested Sub Page Modal */}
          {showDeleteNestedModal && nestedSubPageToDelete && (
            <AdminDestructiveDialog
              title="Delete Nested Sub Page"
              itemName={
                nestedSubPageToDelete.pageName ||
                nestedSubPageToDelete.hero?.title ||
                nestedSubPageToDelete.title ||
                nestedSubPageToDelete.id
              }
              confirmLabel="Delete"
              confirmingLabel="Deleting..."
              confirming={deletingNested}
              onCancel={handleDeleteNestedCancel}
              onConfirm={handleDeleteNestedConfirm}
            />
          )}

          {/* Delete Quiz Modal */}
          {showDeleteQuizModal && quizToDelete && (
            <AdminDestructiveDialog
              title="Delete Quiz"
              itemName={
                quizToDelete.quizName ||
                quizToDelete.pageName ||
                quizToDelete.title ||
                quizToDelete.name ||
                quizToDelete.id
              }
              confirmLabel="Delete"
              confirmingLabel="Deleting..."
              confirming={deletingQuiz}
              onCancel={handleDeleteQuizCancel}
              onConfirm={handleDeleteQuizConfirm}
            />
          )}

          {/* Create Sub Page Modal */}
          {showCreateModal && (
            <AdminModal
              title="Create New Sub Page"
              description="Add a top-level entrance exam page and connect it to an exam access product."
              maxWidthClassName="max-w-[560px]"
            >
              <form onSubmit={handleCreateSubPage}>
                  {validationError && (
                    <AdminValidationMessage>{validationError}</AdminValidationMessage>
                  )}
                  <AdminFormSection className="mt-4">
                    <AdminFieldGroup
                      label="Sub Page Name"
                      required
                      helper="The display name for this Sub Page."
                    >
                      <input
                        type="text"
                        value={newSubPageName}
                        onChange={(e) => {
                          const normalizedInput = normalizeAdminContentNameInput(e.target.value);
                          setNewSubPageName(normalizedInput);
                          if (!newSubPageSlugManuallyEdited) {
                            setNewSubPageId(normalizeAdminContentSlug(normalizedInput));
                          }
                        }}
                        onBlur={() => {
                          const normalizedName = normalizeAdminContentName(newSubPageName);
                          setNewSubPageName(normalizedName);
                          if (!newSubPageSlugManuallyEdited) {
                            setNewSubPageId(normalizeAdminContentSlug(normalizedName));
                          }
                        }}
                        className="admin-field"
                        placeholder="e.g., Math Review, Reading Strategies"
                        required
                      />
                    </AdminFieldGroup>

                    <AdminFieldGroup
                      label="Exam Access Product"
                      required
                      helper={
                        <>
                          Nursing Entrance Exams is a category. Add new entrance products from Exam Access Catalog before using them here.
                          {examAccessProductsError ? ` Catalog fallback active: ${examAccessProductsError}` : ""}
                        </>
                      }
                    >
                      <select
                        value={newSubPageExamAccessProductId}
                        onChange={(e) => setNewSubPageExamAccessProductId(e.target.value)}
                        className="admin-field"
                        required
                      >
                        {entranceExamAccessProducts.map((product) => (
                          <option key={product.examId} value={product.examId}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </AdminFieldGroup>

                    <AdminFieldGroup
                      label="Slug URL"
                      required
                      helper={
                        <>
                          This will create a page at /{newSubPageId || "sub-page-id"}.
                        </>
                      }
                    >
                      <AdminSlugField
                        origin={getSiteUrl()}
                        value={newSubPageId}
                        onChange={(value) => {
                          setNewSubPageSlugManuallyEdited(true);
                          setNewSubPageId(normalizeAdminContentSlug(value));
                        }}
                        placeholder="e.g., ati-teas, math-review"
                        required
                      />
                    </AdminFieldGroup>
                  </AdminFormSection>
                  <AdminModalFooter>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewSubPageId("");
                        setNewSubPageName("");
                        setNewSubPageSlugManuallyEdited(false);
                        setValidationError("");
                      }}
                      className="admin-button-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="admin-button-primary"
                    >
                      {saving ? "Creating..." : "Create Sub Page"}
                    </button>
                  </AdminModalFooter>
              </form>
            </AdminModal>
          )}

          {/* Delete Knowledge Base Article Modal */}
          {showDeleteKbModal && kbArticleToDelete && (
            <AdminDestructiveDialog
              title="Delete Knowledge Base Article"
              itemName={
                kbArticleToDelete.pageName ||
                kbArticleToDelete.title ||
                kbArticleToDelete.id
              }
              confirmLabel="Delete Knowledge Base Article"
              confirmingLabel="Deleting..."
              confirming={deletingKb}
              onCancel={handleDeleteKbCancel}
              onConfirm={handleDeleteKbArticle}
            />
          )}

          {/* Create Knowledge Base Article Modal */}
          {showCreateKbModal && (
            <AdminModal
              title="Create New Knowledge Base Article"
              description="Add a Knowledge Base Article and connect it to the correct Nursing Entrance Exam Sub Page."
              maxWidthClassName="max-w-[560px]"
            >
              <form onSubmit={handleCreateKbArticle}>
                  {kbValidationError && (
                    <AdminValidationMessage>{kbValidationError}</AdminValidationMessage>
                  )}
                  <AdminFormSection className="mt-4">
                    <AdminFieldGroup
                      label="Sub Page"
                      required
                      helper="Select the Sub Page this Knowledge Base Article belongs to."
                    >
                      <select
                        value={selectedSubPageForKb}
                        onChange={(e) =>
                          setSelectedSubPageForKb(e.target.value)
                        }
                        className="admin-field"
                        required
                      >
                        <option value="">Select a Sub Page</option>
                        {subPages.map((subPage) => {
                          const pageName =
                            subPage.pageName ||
                            subPage.hero?.title ||
                            subPage.title ||
                            subPage.id;
                          return (
                            <option key={subPage.id} value={subPage.id}>
                              {pageName}
                            </option>
                          );
                        })}
                      </select>
                    </AdminFieldGroup>

                    <AdminFieldGroup
                      label="Knowledge Base Article Name"
                      required
                      helper="The display name for this Knowledge Base Article."
                    >
                      <input
                        type="text"
                        value={newKbArticleName}
                        onChange={(e) => {
                          const normalizedInput = normalizeAdminContentNameInput(e.target.value);
                          setNewKbArticleName(normalizedInput);
                          if (!newKbArticleSlugManuallyEdited) {
                            setNewKbArticleId(normalizeAdminContentSlug(normalizedInput));
                          }
                        }}
                        onBlur={() => {
                          const normalizedName = normalizeAdminContentName(newKbArticleName);
                          setNewKbArticleName(normalizedName);
                          if (!newKbArticleSlugManuallyEdited) {
                            setNewKbArticleId(normalizeAdminContentSlug(normalizedName));
                          }
                        }}
                        className="admin-field"
                        placeholder="e.g., How to Study for TEAS Math"
                        required
                      />
                    </AdminFieldGroup>

                    <AdminFieldGroup
                      label="Slug URL"
                      required
                      helper={
                        <>
                          This will create a page at /{newKbArticleId || "kb-article-id"}.
                        </>
                      }
                    >
                      <AdminSlugField
                        origin={getSiteUrl()}
                        value={newKbArticleId}
                        onChange={(value) => {
                          setNewKbArticleSlugManuallyEdited(true);
                          setNewKbArticleId(normalizeAdminContentSlug(value));
                        }}
                        placeholder="e.g., how-to-study-teas-math"
                        required
                      />
                    </AdminFieldGroup>
                  </AdminFormSection>
                  <AdminModalFooter>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateKbModal(false);
                        setNewKbArticleId("");
                        setNewKbArticleName("");
                        setNewKbArticleSlugManuallyEdited(false);
                        setSelectedSubPageForKb("");
                        setKbValidationError("");
                      }}
                      className="admin-button-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingKb}
                      className="admin-button-primary"
                    >
                      {savingKb ? "Creating..." : "Create Knowledge Base Article"}
                    </button>
                  </AdminModalFooter>
              </form>
            </AdminModal>
          )}

          {/* Create Nested Sub Page Modal */}
          {showCreateNestedModal && selectedSubPageForNested && (
            <AdminModal
              title="Create New Nested Sub Page"
              description="Add a child page under the selected Nursing Entrance Exam Sub Page."
              maxWidthClassName="max-w-[560px]"
            >
              <form onSubmit={handleCreateNestedSubPage}>
                  {nestedValidationError && (
                    <AdminValidationMessage>{nestedValidationError}</AdminValidationMessage>
                  )}
                  <AdminFormSection className="mt-4">
                    <AdminFieldGroup
                      label="Nested Sub Page Name"
                      required
                      helper="The display name for this Nested Sub Page."
                    >
                      <input
                        type="text"
                        value={newNestedSubPageName}
                        onChange={(e) => {
                          const normalizedInput = normalizeAdminContentNameInput(e.target.value);
                          setNewNestedSubPageName(normalizedInput);
                          if (!newNestedSubPageSlugManuallyEdited) {
                            setNewNestedSubPageId(normalizeAdminContentSlug(normalizedInput));
                          }
                        }}
                        onBlur={() => {
                          const normalizedName = normalizeAdminContentName(newNestedSubPageName);
                          setNewNestedSubPageName(normalizedName);
                          if (!newNestedSubPageSlugManuallyEdited) {
                            setNewNestedSubPageId(normalizeAdminContentSlug(normalizedName));
                          }
                        }}
                        className="admin-field"
                        placeholder="e.g., TEAS Reading, TEAS Math, HESI Vocabulary"
                        required
                      />
                    </AdminFieldGroup>

                    <AdminFieldGroup
                      label="Slug URL"
                      required
                      helper={
                        <>
                          This will create a page at /{newNestedSubPageId || "nested-sub-page-id"}.
                        </>
                      }
                    >
                      <AdminSlugField
                        origin={getSiteUrl()}
                        value={newNestedSubPageId}
                        onChange={(value) => {
                          setNewNestedSubPageSlugManuallyEdited(true);
                          setNewNestedSubPageId(normalizeAdminContentSlug(value));
                        }}
                        placeholder="e.g., ati-teas-practice-questions"
                        required
                      />
                    </AdminFieldGroup>
                  </AdminFormSection>
                  <AdminModalFooter>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateNestedModal(false);
                        setSelectedSubPageForNested(null);
                        setNewNestedSubPageId("");
                        setNewNestedSubPageName("");
                        setNewNestedSubPageSlugManuallyEdited(false);
                        setNestedValidationError("");
                      }}
                      className="admin-button-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingNested}
                      className="admin-button-primary"
                    >
                      {savingNested ? "Creating..." : "Create Nested Sub Page"}
                    </button>
                  </AdminModalFooter>
              </form>
            </AdminModal>
          )}

          {/* Create Quiz Modal */}
          {showCreateQuizModal && selectedNestedSubPageForQuiz && (
            <AdminModal
              title="Create New Quiz"
              description="Add a quiz under the selected Nested Sub Page and prepare its public slug."
              maxWidthClassName="max-w-[560px]"
            >
              <form onSubmit={handleCreateQuiz}>
                  {quizValidationError && (
                    <AdminValidationMessage>{quizValidationError}</AdminValidationMessage>
                  )}
                  <AdminFormSection className="mt-4">
                    <AdminFieldGroup
                      label="Quiz Name"
                      required
                      helper="The display name for this quiz."
                    >
                      <input
                        type="text"
                        value={newQuizName}
                        onChange={(e) => {
                          const rawInput = e.target.value;
                          setNewQuizName(rawInput);
                          if (!newQuizSlugManuallyEdited) {
                            setNewQuizId(normalizeAdminContentSlug(rawInput));
                          }
                        }}
                        onBlur={() => {
                          const normalizedName = normalizeAdminContentName(newQuizName);
                          setNewQuizName(normalizedName);
                          if (!newQuizSlugManuallyEdited) {
                            setNewQuizId(normalizeAdminContentSlug(normalizedName));
                          }
                        }}
                        className="admin-field"
                        placeholder="e.g., ATI TEAS Math Questions - Set 1"
                        required
                      />
                    </AdminFieldGroup>
                    <AdminFieldGroup
                      label="Set Number"
                      helper="Optional. Use this when the quiz belongs to a numbered set."
                    >
                      <input
                        type="number"
                        min="1"
                        value={newQuizSetNumber}
                        onChange={(e) => setNewQuizSetNumber(e.target.value)}
                        className="admin-field"
                        placeholder="e.g., 1"
                      />
                    </AdminFieldGroup>
                    <AdminFieldGroup
                      label="Year"
                      helper="Optional. Use this to identify the exam year for this quiz."
                    >
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={newQuizExamYear}
                        onChange={(e) => setNewQuizExamYear(e.target.value)}
                        className="admin-field"
                        placeholder="e.g., 2026"
                      />
                    </AdminFieldGroup>
                    <AdminFieldGroup
                      label="Slug URL"
                      required
                      helper={
                        <>
                          This will create a quiz at /{newQuizId || "quiz-id"}.
                        </>
                      }
                    >
                      <AdminSlugField
                        origin={getSiteUrl()}
                        value={newQuizId}
                        onChange={(value) => {
                          setNewQuizSlugManuallyEdited(true);
                          setNewQuizId(normalizeAdminContentSlug(value));
                        }}
                        placeholder="e.g., ati-teas-math-questions-set-1"
                        required
                      />
                    </AdminFieldGroup>
                  </AdminFormSection>
                  <AdminModalFooter>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateQuizModal(false);
                        setSelectedNestedSubPageForQuiz(null);
                        setNewQuizId("");
                        setNewQuizName("");
                        setNewQuizSlugManuallyEdited(false);
                        setNewQuizSetNumber("");
                        setNewQuizExamYear("");
                        setQuizValidationError("");
                      }}
                      className="admin-button-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingQuiz}
                      className="admin-button-primary"
                    >
                      {savingQuiz ? "Creating..." : "Create Quiz"}
                    </button>
                  </AdminModalFooter>
              </form>
            </AdminModal>
          )}
          </div>
        </div>
      </div>
  );
}

export default function NursingEntranceExamAdminPage() {
  return (
    <SidebarProvider>
      <NursingEntranceExamAdminPageContent />
    </SidebarProvider>
  );
}
