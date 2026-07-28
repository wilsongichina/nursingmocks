"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getNursingExitExamSubPages,
  deleteNursingExitExamSubPage,
  uploadNursingExitExamSubPage,
  getNursingExitExamNestedSubPages,
  getNursingExitExamQuizzes,
  getRouteMappingSlugsByIds,
  countExitEntranceQuizQuestions,
  uploadNursingExitExamNestedSubPage,
  deleteNursingExitExamNestedSubPage,
  deleteNursingExitExamQuiz,
  uploadNursingExitExamQuiz,
  uploadNursingExitExamKbArticle,
  getNursingExitExamKbArticles,
  deleteNursingExitExamKbArticle,
} from "@/lib/firestore-operations";
import Link from "next/link";
import {
  AdminBadgeList,
  AdminCard,
  AdminDestructiveDialog,
  AdminFieldGroup,
  AdminFormSection,
  AdminInfoTile,
  AdminLoadingState,
  AdminModal,
  AdminModalFooter,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminPagination,
  AdminSlugField,
  AdminStatCard,
  AdminStatusBadge,
  AdminTabs,
  AdminTable,
  AdminTableCell,
  AdminTableEmptyState,
  AdminTopBar,
  AdminToolbar,
  AdminValidationMessage,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl } from "@/lib/config";
import { contentAccessProductLabel } from "@/lib/content-access-products";

const nursingExitAdminTabs = [
  { id: "sub-pages", label: "Sub Pages" },
  { id: "nested", label: "Nested Sub Pages" },
  { id: "quizzes", label: "Quiz Metadata" },
  { id: "kb", label: "Knowledge Base Articles" },
];

function subPageDisplayName(subPage: SubPage) {
  return subPage.pageName || subPage.hero?.title || subPage.title || subPage.id;
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

function NursingExitExamAdminPageContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get unique sub-page names for exam filter
  const uniqueSubPageNames = useMemo(() => {
    const names = subPages
      .map((sp) => subPageDisplayName(sp))
      .filter((name, index, self) => self.indexOf(name) === index && name)
      .sort();
    return names;
  }, [subPages]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubPageId, setNewSubPageId] = useState("");
  const [newSubPageName, setNewSubPageName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subPageToDelete, setSubPageToDelete] = useState<SubPage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("sub-pages");
  const [showCreateNestedModal, setShowCreateNestedModal] = useState(false);
  const [selectedSubPageForNested, setSelectedSubPageForNested] =
    useState<SubPage | null>(null);
  const [newNestedSubPageId, setNewNestedSubPageId] = useState("");
  const [newNestedSubPageName, setNewNestedSubPageName] = useState("");
  const [nestedValidationError, setNestedValidationError] = useState("");
  const [savingNested, setSavingNested] = useState(false);
  const [showDeleteNestedModal, setShowDeleteNestedModal] = useState(false);
  const [nestedSubPageToDelete, setNestedSubPageToDelete] = useState<
    any | null
  >(null);
  const [deletingNested, setDeletingNested] = useState(false);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [selectedNestedSubPageForQuiz, setSelectedNestedSubPageForQuiz] =
    useState<any | null>(null);
  const [newQuizId, setNewQuizId] = useState("");
  const [newQuizName, setNewQuizName] = useState("");
  const [newQuizSetNumber, setNewQuizSetNumber] = useState("");
  const [quizValidationError, setQuizValidationError] = useState("");
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Reset pagination when tab changes
  useEffect(() => {
    setNestedSubPagesPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [activeTab]);

  // Reset pagination when search query changes
  useEffect(() => {
    setNestedSubPagesPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setNestedSubPagesPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [examFilter, statusFilter]);
  const [nestedSubPages, setNestedSubPages] = useState<any[]>([]);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [kbArticlesCount, setKbArticlesCount] = useState(0);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [nestedSubPagesPage, setNestedSubPagesPage] = useState(1);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [kbArticlesPage, setKbArticlesPage] = useState(1);
  const itemsPerPage = 10;
  const [showCreateKbModal, setShowCreateKbModal] = useState(false);
  const [newKbArticleId, setNewKbArticleId] = useState("");
  const [newKbArticleName, setNewKbArticleName] = useState("");
  const [selectedSubPageForKb, setSelectedSubPageForKb] = useState("");
  const [kbValidationError, setKbValidationError] = useState("");
  const [savingKb, setSavingKb] = useState(false);
  const [showDeleteKbModal, setShowDeleteKbModal] = useState(false);
  const [kbArticleToDelete, setKbArticleToDelete] = useState<any | null>(null);
  const [deletingKb, setDeletingKb] = useState(false);

  useEffect(() => {
    loadSubPages();
  }, []);

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

    // Check Knowledge Base Articles
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

  const loadSubPages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getNursingExitExamSubPages();

      if (result.success && result.data) {
        setSubPages(result.data);

        // Load nested sub-pages for all sub-pages in parallel
        const allNestedSubPages: any[] = [];
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
          const nestedResult = await getNursingExitExamNestedSubPages(
            subPageId
          );

          if (nestedResult.success && nestedResult.data) {
            // Add parent sub-page info to each nested sub-page
            const nestedWithParent = nestedResult.data.map(
              (nestedSubPage: any) => ({
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
          { nested: any; subPageId: string; subPageDocId: string }
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
              pillarId: "nursing-exit-exam",
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

        // Fetch all quizzes for all nested sub-pages in parallel
        const allQuizzes: any[] = [];
        const quizCountPromises = nestedWithSlugs.map(async (nestedSubPage) => {
          const nestedSubPageId = nestedSubPage.slug || nestedSubPage.id;
          const parentInfo = nestedSubPageMap.get(nestedSubPage.id);
          if (!parentInfo) return { count: 0, quizzes: [] };

          try {
            const quizzesResult = await getNursingExitExamQuizzes(
              parentInfo.subPageId,
              nestedSubPageId
            );

            if (
              quizzesResult.success &&
              quizzesResult.data &&
              quizzesResult.data.length > 0
            ) {
              // Add parent information to each quiz
              const quizzesWithParent = quizzesResult.data.map((quiz: any) => ({
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
            const key = `${quiz.parentSubPageDocId}_${quiz.nestedSubPageDocId}`;
            if (!quizGroups.has(key)) {
              quizGroups.set(key, {
                quizIds: [],
                subPageDocId: quiz.parentSubPageDocId,
                nestedSubPageDocId: quiz.nestedSubPageDocId,
              });
            }
            quizGroups.get(key)!.quizIds.push(quiz.id);
          }

          // Fetch route mapping slugs for each group in parallel
          const quizSlugMapPromises = Array.from(quizGroups.entries()).map(
            async ([key, group]) => {
              try {
                const slugResult = await getRouteMappingSlugsByIds({
                  pillarId: "nursing-exit-exam",
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

          // Fetch question counts for all quizzes in parallel
          const questionCountPromises = quizzesWithSlugs.map(async (quiz) => {
            try {
              const questionCount = await countExitEntranceQuizQuestions(
                "nursing-exit-exam",
                quiz.parentSubPageId,
                quiz.nestedSubPageId,
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
        }

        setNestedSubPages(nestedWithSlugs);
        setQuizzesCount(totalQuizzes);

        // Fetch KB articles
        const kbResult = await getNursingExitExamKbArticles();
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
    }
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

      const result = await deleteNursingExitExamSubPage(subPageToDelete.id);

      if (result.success) {
        setSuccess("Sub Page deleted successfully.");
        setShowDeleteModal(false);
        setSubPageToDelete(null);
        loadSubPages();
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

  const handleDeleteNestedClick = (nestedSubPage: any) => {
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
        nestedSubPageToDelete.parentSubPageId;

      const result = await deleteNursingExitExamNestedSubPage(
        parentSubPageDocId,
        nestedSubPageToDelete.id
      );

      if (result.success) {
        setSuccess("Nested Sub Page deleted successfully.");
        setShowDeleteNestedModal(false);
        setNestedSubPageToDelete(null);
        loadSubPages();
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

  const handleDeleteQuizClick = (quiz: any) => {
    setQuizToDelete(quiz);
    setShowDeleteQuizModal(true);
  };

  const handleDeleteQuizConfirm = async () => {
    if (!quizToDelete) return;

    try {
      setDeletingQuiz(true);
      setError("");
      setSuccess("");

      const result = await deleteNursingExitExamQuiz(
        quizToDelete.parentSubPageId,
        quizToDelete.nestedSubPageId,
        quizToDelete.id
      );

      if (result.success) {
        setSuccess("Quiz deleted successfully!");
        setShowDeleteQuizModal(false);
        setQuizToDelete(null);
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete quiz");
      }
    } catch (err) {
      setError("Failed to delete quiz");
      console.error("Error deleting quiz:", err);
    } finally {
      setDeletingQuiz(false);
    }
  };

  const handleDeleteKbClick = (kbArticle: any) => {
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

      const result = await deleteNursingExitExamKbArticle(
        kbArticleToDelete.id
      );

      if (result.success) {
        setSuccess(
          `Knowledge Base Article "${kbArticleToDelete.pageName || kbArticleToDelete.id}" deleted successfully.`
        );
        setShowDeleteKbModal(false);
        setKbArticleToDelete(null);
        loadSubPages(); // Reload to refresh Knowledge Base Articles.
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete Knowledge Base Article.");
      }
    } catch (err) {
      setError("Failed to delete Knowledge Base Article.");
      console.error("Error deleting Knowledge Base Article:", err);
    } finally {
      setDeletingKb(false);
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
      setKbValidationError("Please select a parent Sub Page.");
      return;
    }

    const normalizedKbArticleId = newKbArticleId
      .toLowerCase()
      .replace(/\s+/g, "-");

    // Check if slug is taken across all levels
    const slugCheck = isSlugTaken(normalizedKbArticleId);
    if (slugCheck.taken) {
      setKbValidationError(slugCheck.message || "This slug is already taken.");
      return;
    }

    try {
      setSavingKb(true);
      setError("");
      setSuccess("");

      // Get the pillar page ID (nursing-exit-exam)
      const pillarPageId = "nursing-exit-exam";

      const kbArticleData = {
        pageName: newKbArticleName,
        slug: normalizedKbArticleId,
        status: "published",
        heading: "",
        description: "",
        seoLabel: "",
        seoSlug: "",
        meta: {
          title: "",
          description: "",
          keywords: "",
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          canonicalUrl: getSiteUrl() + "/" + normalizedKbArticleId,
        },
        schema: "",
        bodyContent: "",
        type: "kb-article",
        parentId: selectedSubPageForKb,
        pillarId: pillarPageId,
        contentPath: "",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
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
        createdAt: new Date().toISOString(),
        skillId: "",
      };

      const result = await uploadNursingExitExamKbArticle(
        normalizedKbArticleId,
        kbArticleData
      );

      if (result.success) {
        setSuccess(`Knowledge Base Article "${newKbArticleName}" created successfully.`);
        setShowCreateKbModal(false);
        setNewKbArticleId("");
        setNewKbArticleName("");
        setSelectedSubPageForKb("");
        setKbValidationError("");
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setKbValidationError(result.message || "Failed to create Knowledge Base Article.");
      }
    } catch (err) {
      setKbValidationError("Failed to create Knowledge Base Article.");
      console.error("Error creating Knowledge Base Article:", err);
    } finally {
      setSavingKb(false);
    }
  };

  const handleDeleteQuizCancel = () => {
    setShowDeleteQuizModal(false);
    setQuizToDelete(null);
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

    const normalizedQuizId = newQuizId.toLowerCase().replace(/\s+/g, "-");

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
      const parentSubPageId = selectedNestedSubPageForQuiz.parentSubPageId;
      const nestedSubPageId =
        selectedNestedSubPageForQuiz.slug || selectedNestedSubPageForQuiz.id;
      const nestedSubPageName =
        selectedNestedSubPageForQuiz.pageName ||
        selectedNestedSubPageForQuiz.hero?.title ||
        selectedNestedSubPageForQuiz.title ||
        selectedNestedSubPageForQuiz.id;

      const defaultQuizContent = {
        pageName: newQuizName,
        slug: normalizedQuizId,
        setNumber: newQuizSetNumber ? Number(newQuizSetNumber) : undefined,
        meta: {
          title: `${newQuizName} | NursingMocks`,
          description: `Content for ${newQuizName} under ${nestedSubPageName}.`,
          keywords: `${newQuizName}, ${nestedSubPageName}, nursing exit exam`,
          ogTitle: `${newQuizName} | NursingMocks`,
          ogDescription: `Content for ${newQuizName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedQuizId}`,
        },
        hero: {
          title: newQuizName,
        },
        schema: "",
      };

      const result = await uploadNursingExitExamQuiz(
        parentSubPageId,
        nestedSubPageId,
        normalizedQuizId,
        defaultQuizContent
      );

      if (result.success) {
        setSuccess(`Quiz "${newQuizName}" created successfully!`);
        setShowCreateQuizModal(false);
        setSelectedNestedSubPageForQuiz(null);
        setNewQuizId("");
        setNewQuizName("");
        setNewQuizSetNumber("");
        setQuizValidationError("");
        loadSubPages(); // Reload to refresh Quiz Metadata.
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

    const normalizedNestedSubPageId = newNestedSubPageId
      .toLowerCase()
      .replace(/\s+/g, "-");

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
        pageName: newNestedSubPageName,
        status: "Draft",
        heading: "",
        description: "",
        seoLabel: newNestedSubPageName,
        seoSlug: normalizedNestedSubPageId,
        createdAt: new Date().toISOString(),
        bodyContent: "",
        meta: {
          title: `${newNestedSubPageName} | NursingMocks`,
          description: `Content for ${newNestedSubPageName} under ${parentSubPageName}.`,
          keywords: `${newNestedSubPageName}, ${parentSubPageId}, nursing exit exam`,
          ogTitle: `${newNestedSubPageName} | NursingMocks`,
          ogDescription: `Content for ${newNestedSubPageName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedNestedSubPageId}`,
        },
        schema: "",
        hero: {
          title: "",
          description: "",
        },
      };

      const result = await uploadNursingExitExamNestedSubPage(
        parentSubPageId,
        normalizedNestedSubPageId,
        defaultNestedSubPageContent
      );

      if (result.success) {
        setSuccess(
          `Nested Sub Page "${newNestedSubPageName}" created successfully.`
        );
        setShowCreateNestedModal(false);
        setSelectedSubPageForNested(null);
        setNewNestedSubPageId("");
        setNewNestedSubPageName("");
        setNestedValidationError("");
        loadSubPages(); // Reload to refresh Nested Sub Pages.
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

  const handleCreateSubPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newSubPageId.trim() || !newSubPageName.trim()) {
      setValidationError("Sub Page slug and name are required.");
      return;
    }

    const normalizedSubPageId = newSubPageId.toLowerCase().replace(/\s+/g, "-");

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
        pageName: newSubPageName,
        slug: normalizedSubPageId,
        examAccessProductId: "nursing_exit_exams",
        status: "Published",
        heading: "",
        description: "",
        seoLabel: newSubPageName,
        seoSlug: normalizedSubPageId,
        createdAt: new Date().toISOString(),
        meta: {
          title: `${newSubPageName} | Nursing Exit Exam`,
          description: `Content for ${newSubPageName} under Nursing Exit Exam.`,
          keywords: `${newSubPageName}, nursing exit exam`,
          ogTitle: `${newSubPageName} | Nursing Exit Exam`,
          ogDescription: `Content for ${newSubPageName} under Nursing Exit Exam.`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedSubPageId}`,
        },
        trustIndicators: [],
        whatToExpect: {
          badge: "",
          title: "",
          subtitle: "",
          cards: [],
          footer: "",
        },
        mostCommonQuestions: {
          badge: "",
          title: "",
          subtitle: "",
          cards: [],
        },
        studyGuide: {
          badge: "",
          title: "",
          subtitle: "",
          sections: [],
        },
        privacyPricing: [],
        faq: {
          title: "",
          subtitle: "",
          questions: [],
        },
        schema: "",
        bodyContent: "",
      };

      const result = await uploadNursingExitExamSubPage(
        normalizedSubPageId,
        defaultSubPageContent
      );

      if (result.success) {
        setSuccess(`Sub Page "${newSubPageName}" created successfully.`);
        setShowCreateModal(false);
        setNewSubPageId("");
        setNewSubPageName("");
        setValidationError("");
        loadSubPages();
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
              { label: "Nursing Exit Exam" },
            ]}
            actions={currentUser ? <UserProfileBadge /> : null}
          />
          <div className="admin-page flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <AdminLoadingState
              title="Loading Nursing Exit Exam Content"
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
            { label: "Nursing Exit Exam" },
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

            <AdminPageHeader
              eyebrow="Admin Content"
              title="Nursing Exit Exam"
              description="Manage the main pillar page, Sub Pages, Nested Sub Pages, Knowledge Base Articles, and Quiz Metadata for Nursing Exit Exams."
              actions={
                <Link href="/admin/nursing-exit-exam/edit" className="admin-button-secondary">
                  Edit Main Page
                </Link>
              }
            />

            <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)]">
              <AdminCard
                title="Content Structure"
                description="A quick map of the exit exam content hierarchy managed from this page."
              >
                <div className="grid gap-3">
                  <AdminInfoTile label="Main Pillar Page">
                    Nursing Exit Exam
                  </AdminInfoTile>
                  <AdminInfoTile label="Sub Pages">
                    {subPages.length > 0
                      ? subPages
                          .slice(0, 4)
                          .map((sp) => subPageDisplayName(sp))
                          .join(", ") +
                        (subPages.length > 4 ? ", +" + (subPages.length - 4) + " more" : "")
                      : "No Sub Pages yet"}
                  </AdminInfoTile>
                  <AdminBadgeList
                    items={[
                      ...subPages.slice(0, 4).map((sp) => ({
                        label: subPageDisplayName(sp),
                        tone: "purple" as const,
                      })),
                      ...(subPages.length > 4
                        ? [
                            {
                              label: String(subPages.length - 4) + " More Sub Pages",
                              tone: "gray" as const,
                            },
                          ]
                        : []),
                      ...(kbArticlesCount > 0
                        ? [
                            {
                              label:
                                String(kbArticlesCount) +
                                " Knowledge Base " +
                                (kbArticlesCount === 1 ? "Article" : "Articles"),
                              tone: "green" as const,
                            },
                          ]
                        : []),
                      ...(quizzesCount > 0
                        ? [
                            {
                              label:
                                String(quizzesCount) +
                                " " +
                                (quizzesCount === 1 ? "Quiz Record" : "Quiz Records"),
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
                  <AdminStatCard label="Sub Pages" value={subPages.length} helper="Top-level exit exam categories." />
                  <AdminStatCard label="Nested Sub Pages" value={nestedSubPages.length} helper="Subject or exam pages under each category." />
                  <AdminStatCard label="Knowledge Base Articles" value={kbArticlesCount} helper="Supporting student-facing content." />
                  <AdminStatCard label="Quiz Metadata" value={quizzesCount} helper="Question-set records attached to nested pages." />
                </div>
              </AdminCard>
            </div>

            <AdminTabs
              tabs={nursingExitAdminTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              label="Nursing exit exam management sections"
            />

            <AdminCard className="mt-2">
              <AdminToolbar
                className="admin-info-tile mb-4 p-4"
                actions={
                  activeTab === "kb" ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateKbModal(true)}
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="admin-button-primary"
                    >
                      New Sub Page
                    </button>
                  )
                }
              >
                <div className="admin-toolbar-control">
                  <label className="admin-field-label" htmlFor="nursing-exit-search">
                    Search
                  </label>
                  <input
                    id="nursing-exit-search"
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
                  <label className="admin-field-label" htmlFor="nursing-exit-exam-filter">
                    Exam
                  </label>
                  <select
                    id="nursing-exit-exam-filter"
                    className="admin-field"
                    value={examFilter}
                    onChange={(e) => setExamFilter(e.target.value)}
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
                  <label className="admin-field-label" htmlFor="nursing-exit-status-filter">
                    Status
                  </label>
                  <select
                    id="nursing-exit-status-filter"
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
              <AdminTable>
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                            minWidth: "210px",
                          }}
                        >
                          Title
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          Exam
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          Level
                        </th>
                        {activeTab === "quizzes" && (
                          <th
                            style={{
                              padding: "10px 12px",
                              textAlign: "left",
                              borderBottom: "1px solid #f3f4f6",
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: 500,
                            }}
                          >
                            Questions
                          </th>
                        )}
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                            minWidth: "180px",
                          }}
                        >
                          URL slug
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          Status
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          Last updated
                        </th>
                        <th
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: 500,
                            minWidth: "150px",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab === "quizzes"
                        ? (() => {
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
                                  : quiz.parentSubPageName ||
                                    quiz.parentSubPageId;

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
                            const sortedQuizzes = [...filteredQuizzes].sort(
                              (a, b) => {
                                const dateA = a.lastUpdated
                                  ? new Date(a.lastUpdated).getTime()
                                  : 0;
                                const dateB = b.lastUpdated
                                  ? new Date(b.lastUpdated).getTime()
                                  : 0;
                                return dateB - dateA; // Descending order (newest first)
                              }
                            );
                            const startIndex = (quizzesPage - 1) * itemsPerPage;
                            const endIndex = startIndex + itemsPerPage;
                            const paginatedQuizzes = sortedQuizzes.slice(
                              startIndex,
                              endIndex
                            );

                            return sortedQuizzes.length === 0 ? (
                              <AdminTableEmptyState
                                colSpan={8}
                                title="No Quiz Metadata Found"
                                description="Use Add Quiz from a Nested Sub Page row when you are ready to attach a question set."
                              />
                            ) : (
                              paginatedQuizzes.map((quiz) => {
                                const quizName =
                                  quiz.quizName ||
                                  quiz.pageName ||
                                  quiz.title ||
                                  quiz.name ||
                                  quiz.id;
                                const lastUpdated = quiz.lastUpdated
                                  ? new Date(
                                      quiz.lastUpdated
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }) +
                                    " · " +
                                    new Date(
                                      quiz.lastUpdated
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A";

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
                                  : quiz.parentSubPageName ||
                                    quiz.parentSubPageId;

                                return (
                                  <tr key={quiz.id}>
                                    <AdminTableCell className="min-w-[210px]">
                                      <span
                                        className="admin-table-title-truncate"
                                        title={quizName}
                                      >
                                        {quizName}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      <span
                                        className="admin-table-title-truncate"
                                        title={examName}
                                      >
                                        {examName}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      Quiz
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      {quiz.questionCount !== undefined
                                        ? quiz.questionCount
                                        : "N/A"}
                                    </AdminTableCell>
                                    <AdminTableCell className="min-w-[180px]" mono>
                                      <span
                                        className="admin-table-slug-truncate"
                                        title={`/${quiz.slug || quiz.id}`}
                                      >
                                        /{quiz.slug || quiz.id}
                                      </span>
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
                                          href={`/admin/nursing-exit-exam/${
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
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteQuizClick(quiz)
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
                        : activeTab === "kb"
                        ? (() => {
                            const filteredKbArticles = kbArticles.filter((kb) => {
                              // Search filter
                              if (searchQuery) {
                                const name =
                                  kb.pageName ||
                                  kb.title ||
                                  kb.id;
                                if (
                                  !name.toLowerCase().includes(searchQuery.toLowerCase())
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
                            const sortedKbArticles = [...filteredKbArticles].sort(
                              (a, b) => {
                                const dateA = a.lastUpdated
                                  ? new Date(a.lastUpdated).getTime()
                                  : 0;
                                const dateB = b.lastUpdated
                                  ? new Date(b.lastUpdated).getTime()
                                  : 0;
                                return dateB - dateA; // Descending order (newest first)
                              }
                            );
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
                                description="Create a Knowledge Base Article when this exit exam area needs supporting student-facing content."
                              />
                            ) : (
                              paginatedKbArticles.map((kbArticle) => {
                                const pageName =
                                  kbArticle.pageName ||
                                  kbArticle.title ||
                                  kbArticle.id;
                                const lastUpdated = kbArticle.lastUpdated
                                  ? new Date(kbArticle.lastUpdated).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    ) +
                                    " · " +
                                    new Date(kbArticle.lastUpdated).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "N/A";

                                // Get sub-page name from subPages array
                                const parentSubPage = subPages.find(
                                  (sp) => sp.id === kbArticle.parentId
                                );
                                const examName = parentSubPage
                                  ? parentSubPage.pageName ||
                                    parentSubPage.hero?.title ||
                                    parentSubPage.title ||
                                    parentSubPage.id
                                  : "N/A";

                                return (
                                  <tr key={kbArticle.id}>
                                    <AdminTableCell className="min-w-[210px]">
                                      <span
                                        className="admin-table-title-truncate"
                                        title={pageName}
                                      >
                                        {pageName}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      <span
                                        className="admin-table-title-truncate"
                                        title={examName}
                                      >
                                        {examName}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      Knowledge Base Article
                                    </AdminTableCell>
                                    <AdminTableCell className="min-w-[180px]" mono>
                                      <span
                                        className="admin-table-slug-truncate"
                                        title={`/${kbArticle.slug || kbArticle.id}`}
                                      >
                                        /{kbArticle.slug || kbArticle.id}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      <AdminStatusBadge label={kbArticle.status || "Published"} />
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      {lastUpdated}
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      <div className="admin-crud-actions">
                                        <Link
                                          href={`/${kbArticle.slug || kbArticle.id}`}
                                          target="_blank"
                                          className="admin-crud-button admin-crud-button-neutral"
                                        >
                                          View
                                        </Link>
                                        <Link
                                          href={`/admin/nursing-exit-exam/kb-articles/${
                                            kbArticle.id
                                          }`}
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
                        : activeTab === "nested"
                        ? (() => {
                            const filteredNestedSubPages =
                              nestedSubPages.filter((nsp) => {
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
                                    : nsp.parentSubPageName ||
                                      nsp.parentSubPageId;

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
                              });
                            const sortedNestedSubPages = [
                              ...filteredNestedSubPages,
                            ].sort((a, b) => {
                              const dateA = a.lastUpdated
                                ? new Date(a.lastUpdated).getTime()
                                : 0;
                              const dateB = b.lastUpdated
                                ? new Date(b.lastUpdated).getTime()
                                : 0;
                              return dateB - dateA; // Descending order (newest first)
                            });
                            const startIndex =
                              (nestedSubPagesPage - 1) * itemsPerPage;
                            const endIndex = startIndex + itemsPerPage;
                            const paginatedNestedSubPages =
                              sortedNestedSubPages.slice(startIndex, endIndex);

                            return sortedNestedSubPages.length === 0 ? (
                              <AdminTableEmptyState
                                colSpan={7}
                                title="No Nested Sub Pages Found"
                                description="Use Add Nested Sub Page from a Sub Page row to create a subject or exam section."
                              />
                            ) : (
                              paginatedNestedSubPages.map((nestedSubPage) => {
                                const pageName =
                                  nestedSubPage.pageName ||
                                  nestedSubPage.hero?.title ||
                                  nestedSubPage.title ||
                                  nestedSubPage.id;
                                const lastUpdated = nestedSubPage.lastUpdated
                                  ? new Date(
                                      nestedSubPage.lastUpdated
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }) +
                                    " · " +
                                    new Date(
                                      nestedSubPage.lastUpdated
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A";

                                // Get sub-page name from subPages array
                                const parentSubPage = subPages.find(
                                  (sp) =>
                                    sp.id ===
                                      nestedSubPage.parentSubPageDocId ||
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
                                      <span
                                        className="admin-table-title-truncate"
                                        title={pageName}
                                      >
                                        {pageName}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      <span
                                        className="admin-table-title-truncate"
                                        title={examName}
                                      >
                                        {examName}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      Nested Sub Page
                                    </AdminTableCell>
                                    <AdminTableCell className="min-w-[180px]" mono>
                                      <span
                                        className="admin-table-slug-truncate"
                                        title={`/${nestedSubPage.slug || nestedSubPage.id}`}
                                      >
                                        /{nestedSubPage.slug || nestedSubPage.id}
                                      </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                      <AdminStatusBadge label={nestedSubPage.status || "Published"} />
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
                                            setShowCreateQuizModal(true);
                                          }}
                                          className="admin-crud-button admin-crud-button-primary"
                                        >
                                          Add
                                        </button>
                                        <Link
                                          href={`/admin/nursing-exit-exam/${nestedSubPage.parentSubPageId}/nested/${nestedSubPage.id}`}
                                          className="admin-crud-button admin-crud-button-secondary"
                                        >
                                          Edit
                                        </Link>
                                        <Link
                                          href={`/${
                                            nestedSubPage.slug ||
                                            nestedSubPage.id
                                          }`}
                                          target="_blank"
                                          className="admin-crud-button admin-crud-button-neutral"
                                        >
                                          View
                                        </Link>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteNestedClick(
                                              nestedSubPage
                                            )
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
                        : (() => {
                            // Filter and sort sub-pages
                            const filteredSubPages = subPages.filter(
                              (subPage) => {
                                // Search filter
                                if (searchQuery) {
                                  const name =
                                    subPage.pageName ||
                                    subPage.hero?.title ||
                                    subPage.title ||
                                    subPage.id;
                                  if (
                                    !name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  ) {
                                    return false;
                                  }
                                }

                                // Exam filter - compare against sub-page name
                                if (examFilter) {
                                  const examName =
                                    subPage.pageName ||
                                    subPage.hero?.title ||
                                    subPage.title ||
                                    subPage.id;
                                  if (examName !== examFilter) {
                                    return false;
                                  }
                                }

                                // Status filter
                                if (statusFilter) {
                                  const status = subPage.status || "published";
                                  if (statusFilter !== status.toLowerCase()) {
                                    return false;
                                  }
                                }

                                return true;
                              }
                            );

                            // Sort by lastUpdated (newest first)
                            const sortedSubPages = [...filteredSubPages].sort(
                              (a, b) => {
                                const dateA = a.lastUpdated
                                  ? new Date(a.lastUpdated).getTime()
                                  : 0;
                                const dateB = b.lastUpdated
                                  ? new Date(b.lastUpdated).getTime()
                                  : 0;
                                return dateB - dateA; // Descending order (newest first)
                              }
                            );

                            if (sortedSubPages.length === 0) {
                              return (
                                <AdminTableEmptyState
                                  colSpan={7}
                                  title="No Sub Pages Found"
                                  description="Create a Sub Page or adjust the current filters."
                                />
                              );
                            }

                            return sortedSubPages.map((subPage) => {
                              const pageName =
                                subPage.pageName ||
                                subPage.hero?.title ||
                                subPage.title ||
                                subPage.id;
                              const lastUpdated = subPage.lastUpdated
                                ? new Date(
                                    subPage.lastUpdated
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }) +
                                  " · " +
                                  new Date(
                                    subPage.lastUpdated
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A";

                              return (
                                <tr
                                  key={subPage.id}
                                  style={{
                                    borderBottom: "1px solid #f3f4f6",
                                  }}
                                >
                                  <AdminTableCell className="min-w-[210px]">
                                    <span
                                      className="admin-table-title-truncate"
                                      title={pageName}
                                    >
                                      {pageName}
                                    </span>
                                  </AdminTableCell>
                                  <AdminTableCell>
                                    <span
                                      className="admin-table-title-truncate"
                                      title={pageName}
                                    >
                                      {pageName}
                                    </span>
                                  </AdminTableCell>
                                  <AdminTableCell>
                                    Sub Page
                                  </AdminTableCell>
                                  <AdminTableCell className="min-w-[180px]" mono>
                                    <span
                                      className="admin-table-slug-truncate"
                                      title={`/${subPage.slug || subPage.id}`}
                                    >
                                      /{subPage.slug || subPage.id}
                                    </span>
                                  </AdminTableCell>
                                  <AdminTableCell>
                                    <AdminStatusBadge label={subPage.status || "Published"} />
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
                                          setShowCreateNestedModal(true);
                                        }}
                                        className="admin-crud-button admin-crud-button-primary"
                                      >
                                        Add
                                      </button>
                                      <Link
                                        href={`/admin/nursing-exit-exam/${subPage.id}`}
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
                                        onClick={() =>
                                          handleDeleteClick(subPage)
                                        }
                                        className="admin-crud-button admin-crud-button-danger"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </AdminTableCell>
                                </tr>
                              );
                            });
                          })()}
                    </tbody>
              </AdminTable>
                {/* Pagination Controls */}
                {activeTab === "kb"
                  ? (() => {
                      const filteredKbArticles = kbArticles.filter((kb) => {
                        if (searchQuery) {
                          const name = kb.pageName || kb.title || kb.id;
                          if (!name.toLowerCase().includes(searchQuery.toLowerCase())) {
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
                      const sortedKbArticles = [...filteredKbArticles].sort((a, b) => {
                        const dateA = a.lastUpdated
                          ? new Date(a.lastUpdated).getTime()
                          : 0;
                        const dateB = b.lastUpdated
                          ? new Date(b.lastUpdated).getTime()
                          : 0;
                        return dateB - dateA;
                      });

                      return (
                        <AdminPagination
                          currentPage={kbArticlesPage}
                          totalItems={sortedKbArticles.length}
                          itemsPerPage={itemsPerPage}
                          itemLabel="Knowledge Base Articles"
                          onPageChange={setKbArticlesPage}
                        />
                      );
                    })()
                  : activeTab === "quizzes"
                    ? (() => {
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
                      const sortedQuizzes = [...filteredQuizzes].sort(
                        (a, b) => {
                          const dateA = a.lastUpdated
                            ? new Date(a.lastUpdated).getTime()
                            : 0;
                          const dateB = b.lastUpdated
                            ? new Date(b.lastUpdated).getTime()
                            : 0;
                          return dateB - dateA; // Descending order (newest first)
                        }
                      );

                      return (
                        <AdminPagination
                          currentPage={quizzesPage}
                          totalItems={sortedQuizzes.length}
                          itemsPerPage={itemsPerPage}
                          itemLabel="Quiz Metadata"
                          onPageChange={setQuizzesPage}
                        />
                      );
                    })()
                    : activeTab === "nested"
                      ? (() => {
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
                        const sortedNestedSubPages = [
                          ...filteredNestedSubPages,
                        ].sort((a, b) => {
                          const dateA = a.lastUpdated
                            ? new Date(a.lastUpdated).getTime()
                            : 0;
                          const dateB = b.lastUpdated
                            ? new Date(b.lastUpdated).getTime()
                            : 0;
                          return dateB - dateA; // Descending order (newest first)
                        });

                        return (
                          <AdminPagination
                            currentPage={nestedSubPagesPage}
                            totalItems={sortedNestedSubPages.length}
                            itemsPerPage={itemsPerPage}
                            itemLabel="Nested Sub Pages"
                            onPageChange={setNestedSubPagesPage}
                          />
                        );
                      })()
                      : null}
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

          {/* Create Sub Page Modal */}
          {showCreateModal && (
            <AdminModal
              title="Create New Sub Page"
              description="Add a top-level Nursing Exit Exam page and connect it to the Nursing Exit Exams access product."
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
                      onChange={(e) => setNewSubPageName(e.target.value)}
                      className="admin-field"
                      placeholder="e.g., NCLEX RN, NCLEX PN, Predictor Exams"
                      required
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Exam Access Product"
                    helper="All Nursing Exit Exam content is unlocked by the Nursing Exit Exams access product."
                  >
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-sm font-semibold text-gray-950">
                        {contentAccessProductLabel("nursing_exit_exams")}
                      </p>
                    </div>
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Slug URL"
                    required
                    helper={<>This will create a page at /{newSubPageId || "sub-page-id"}.</>}
                  >
                    <AdminSlugField
                      origin={getSiteUrl()}
                      value={newSubPageId}
                      onChange={(value) =>
                        setNewSubPageId(value.toLowerCase().replace(/\s+/g, "-"))
                      }
                      placeholder="e.g., nclex-rn"
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
                      setValidationError("");
                    }}
                    className="admin-button-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="admin-button-primary">
                    {saving ? "Creating..." : "Create Sub Page"}
                  </button>
                </AdminModalFooter>
              </form>
            </AdminModal>
          )}

          {/* Create Nested Sub Page Modal */}
          {showCreateNestedModal && selectedSubPageForNested && (
            <AdminModal
              title="Create New Nested Sub Page"
              description="Add a child page under the selected Nursing Exit Exam Sub Page."
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
                      onChange={(e) => setNewNestedSubPageName(e.target.value)}
                      className="admin-field"
                      placeholder="e.g., RN Exit Exam, LPN Exit Exam, Predictor Review"
                      required
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Slug URL"
                    required
                    helper={<>This will create a page at /{newNestedSubPageId || "nested-sub-page-id"}.</>}
                  >
                    <AdminSlugField
                      origin={getSiteUrl()}
                      value={newNestedSubPageId}
                      onChange={(value) =>
                        setNewNestedSubPageId(value.toLowerCase().replace(/\s+/g, "-"))
                      }
                      placeholder="e.g., rn-exit-exam"
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
                      setNestedValidationError("");
                    }}
                    className="admin-button-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={savingNested} className="admin-button-primary">
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
              description="Add quiz metadata under the selected Nested Sub Page and prepare its public slug."
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
                      onChange={(e) => setNewQuizName(e.target.value)}
                      className="admin-field"
                      placeholder="e.g., RN Exit Exam Practice Test Set 1"
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
                    label="Slug URL"
                    required
                    helper={<>This will create a quiz at /{newQuizId || "quiz-id"}.</>}
                  >
                    <AdminSlugField
                      origin={getSiteUrl()}
                      value={newQuizId}
                      onChange={(value) =>
                        setNewQuizId(value.toLowerCase().replace(/\s+/g, "-"))
                      }
                      placeholder="e.g., rn-exit-exam-practice-test-set-1"
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
                      setNewQuizSetNumber("");
                      setQuizValidationError("");
                    }}
                    className="admin-button-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={savingQuiz} className="admin-button-primary">
                    {savingQuiz ? "Creating..." : "Create Quiz"}
                  </button>
                </AdminModalFooter>
              </form>
            </AdminModal>
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
              description="Add a Knowledge Base Article and connect it to the correct Nursing Exit Exam Sub Page."
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
                      onChange={(e) => setSelectedSubPageForKb(e.target.value)}
                      className="admin-field"
                      required
                    >
                      <option value="">Select a Sub Page</option>
                      {subPages.map((subPage) => (
                        <option key={subPage.id} value={subPage.id}>
                          {subPageDisplayName(subPage)}
                        </option>
                      ))}
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
                      onChange={(e) => setNewKbArticleName(e.target.value)}
                      className="admin-field"
                      placeholder="e.g., How to Prepare for the RN Exit Exam"
                      required
                    />
                  </AdminFieldGroup>

                  <AdminFieldGroup
                    label="Slug URL"
                    required
                    helper={<>This will create a page at /{newKbArticleId || "knowledge-base-article-id"}.</>}
                  >
                    <AdminSlugField
                      origin={getSiteUrl()}
                      value={newKbArticleId}
                      onChange={(value) =>
                        setNewKbArticleId(value.toLowerCase().replace(/\s+/g, "-"))
                      }
                      placeholder="e.g., how-to-prepare-rn-exit-exam"
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
                      setSelectedSubPageForKb("");
                      setKbValidationError("");
                    }}
                    className="admin-button-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={savingKb} className="admin-button-primary">
                    {savingKb ? "Creating..." : "Create Knowledge Base Article"}
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

export default function NursingExitExamAdminPage() {
  return (
    <SidebarProvider>
      <NursingExitExamAdminPageContent />
    </SidebarProvider>
  );
}
