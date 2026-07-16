"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getNursingEntranceExamSubPages,
  deleteNursingEntranceExamSubPage,
  uploadNursingEntranceExamSubPage,
  getNestedSubPages,
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
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl } from "@/lib/config";

interface SubPage {
  id: string;
  subPageId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  lastUpdated?: string;
  version?: string;
  status?: string;
  hero?: {
    title: string;
  };
}

function NursingEntranceExamAdminPageContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const [loading, setLoading] = useState(true);
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
        message: `A sub-page with slug "${normalizedSlug}" already exists.`,
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
        message: `A nested sub-page with slug "${normalizedSlug}" already exists.`,
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
        message: `A KB article with slug "${normalizedSlug}" already exists.`,
      };
    }

    return { taken: false };
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateKbModal, setShowCreateKbModal] = useState(false);
  const [newSubPageId, setNewSubPageId] = useState("");
  const [newSubPageName, setNewSubPageName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newKbArticleId, setNewKbArticleId] = useState("");
  const [newKbArticleName, setNewKbArticleName] = useState("");
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
  const [showDeleteKbModal, setShowDeleteKbModal] = useState(false);
  const [kbArticleToDelete, setKbArticleToDelete] = useState<any | null>(null);
  const [deletingKb, setDeletingKb] = useState(false);

  useEffect(() => {
    loadSubPages();
  }, []);

  const loadSubPages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getNursingEntranceExamSubPages();

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
          const nestedResult = await getNestedSubPages(subPageId);

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

        // Fetch all quizzes for all nested sub-pages in parallel
        const allQuizzes: any[] = [];
        const quizCountPromises = nestedWithSlugs.map(async (nestedSubPage) => {
          const nestedSubPageId = nestedSubPage.slug || nestedSubPage.id;
          const parentInfo = nestedSubPageMap.get(nestedSubPage.id);
          if (!parentInfo) return { count: 0, quizzes: [] };

          try {
            const quizzesResult = await getNursingEntranceExamQuizzes(
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

        console.log(
          "Total quizzes found:",
          totalQuizzes,
          "All quizzes:",
          allQuizzes
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

          console.log("Quiz slug map:", combinedQuizSlugMap);

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
                "nursing-entrance-exam",
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

          console.log("Quizzes with slugs and counts:", quizzesWithCounts);
          setQuizzes(quizzesWithCounts);
        } else {
          console.log("No quizzes found");
          setQuizzes([]);
        }

        setNestedSubPages(nestedWithSlugs);
        setQuizzesCount(totalQuizzes);

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
        setError("Failed to load sub-pages");
      }
    } catch (err) {
      setError("Failed to load sub-pages");
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

      const result = await deleteNursingEntranceExamSubPage(subPageToDelete.id);

      if (result.success) {
        setSuccess("Sub-page deleted successfully!");
        setShowDeleteModal(false);
        setSubPageToDelete(null);
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete sub-page");
      }
    } catch (err) {
      setError("Failed to delete sub-page");
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

      const result = await deleteNestedSubPage(
        parentSubPageDocId,
        nestedSubPageToDelete.id
      );

      if (result.success) {
        setSuccess("Nested sub-page deleted successfully!");
        setShowDeleteNestedModal(false);
        setNestedSubPageToDelete(null);
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete nested sub-page");
      }
    } catch (err) {
      setError("Failed to delete nested sub-page");
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

      const result = await deleteNursingEntranceExamQuiz(
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

      const result = await deleteNursingEntranceExamKbArticle(
        kbArticleToDelete.id
      );

      if (result.success) {
        setSuccess(
          `KB Article "${
            kbArticleToDelete.pageName || kbArticleToDelete.id
          }" deleted successfully!`
        );
        setShowDeleteKbModal(false);
        setKbArticleToDelete(null);
        loadSubPages(); // Reload to refresh KB articles
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete KB article.");
      }
    } catch (err) {
      setError("Failed to delete KB article.");
      console.error("Error deleting KB article:", err);
    } finally {
      setDeletingKb(false);
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
      setQuizValidationError("Nested sub-page is required.");
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
          title: `${newQuizName} | TeasGurus`,
          description: `Content for ${newQuizName} under ${nestedSubPageName}.`,
          keywords: `${newQuizName}, ${nestedSubPageName}, nursing entrance exam`,
          ogTitle: `${newQuizName} | TeasGurus`,
          ogDescription: `Content for ${newQuizName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedQuizId}`,
        },
        hero: {
          title: newQuizName,
        },
        schema: "",
      };

      const result = await uploadNursingEntranceExamQuiz(
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
        loadSubPages(); // Reload to refresh quizzes
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
      setNestedValidationError("Nested sub-page ID and Name are required.");
      return;
    }

    if (!selectedSubPageForNested) {
      setNestedValidationError("Parent sub-page is required.");
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
          title: `${newNestedSubPageName} | TeasGurus`,
          description: `Content for ${newNestedSubPageName} under ${parentSubPageName}.`,
          keywords: `${newNestedSubPageName}, ${parentSubPageId}, nursing entrance exam`,
          ogTitle: `${newNestedSubPageName} | TeasGurus`,
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

      const result = await uploadNestedSubPage(
        parentSubPageId,
        normalizedNestedSubPageId,
        defaultNestedSubPageContent
      );

      if (result.success) {
        setSuccess(
          `Nested sub-page "${newNestedSubPageName}" created successfully!`
        );
        setShowCreateNestedModal(false);
        setSelectedSubPageForNested(null);
        setNewNestedSubPageId("");
        setNewNestedSubPageName("");
        setNestedValidationError("");
        loadSubPages(); // Reload to refresh nested sub-pages
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setNestedValidationError(
          result.message || "Failed to create nested sub-page."
        );
      }
    } catch (err) {
      setNestedValidationError("Failed to create nested sub-page.");
      console.error("Error creating nested sub-page:", err);
    } finally {
      setSavingNested(false);
    }
  };

  const handleCreateKbArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setKbValidationError("");

    if (!newKbArticleId.trim() || !newKbArticleName.trim()) {
      setKbValidationError("KB Article ID and Name are required.");
      return;
    }

    if (!selectedSubPageForKb) {
      setKbValidationError("Please select a sub-page.");
      return;
    }

    const normalizedKbArticleId = newKbArticleId
      .toLowerCase()
      .replace(/\s+/g, "-");

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
        pageName: newKbArticleName,
        status: "Published",
        heading: "",
        description: "",
        seoLabel: newKbArticleName,
        seoSlug: normalizedKbArticleId,
        createdAt: new Date().toISOString(),
        parentId: selectedSubPageForKb,
        parentSubPageId: selectedSubPageForKb,
        meta: {
          title: `${newKbArticleName} | Nursing Entrance Exam`,
          description: `KB Article: ${newKbArticleName} under Nursing Entrance Exam.`,
          keywords: `${newKbArticleName}, nursing entrance exam, knowledge base`,
          ogTitle: `${newKbArticleName} | Nursing Entrance Exam`,
          ogDescription: `KB Article: ${newKbArticleName} under Nursing Entrance Exam.`,
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
        setSuccess(`KB Article "${newKbArticleName}" created successfully!`);
        setShowCreateKbModal(false);
        setNewKbArticleId("");
        setNewKbArticleName("");
        setSelectedSubPageForKb("");
        setKbValidationError("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setKbValidationError(result.message || "Failed to create KB article.");
      }
    } catch (err) {
      setKbValidationError("Failed to create KB article.");
      console.error("Error creating KB article:", err);
    } finally {
      setSavingKb(false);
    }
  };

  const handleCreateSubPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!newSubPageId.trim() || !newSubPageName.trim()) {
      setValidationError("Sub-page ID and Name are required.");
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
        status: "Published",
        heading: "",
        description: "",
        seoLabel: newSubPageName,
        seoSlug: normalizedSubPageId,
        createdAt: new Date().toISOString(),
        meta: {
          title: `${newSubPageName} | Nursing Entrance Exam`,
          description: `Content for ${newSubPageName} under Nursing Entrance Exam.`,
          keywords: `${newSubPageName}, nursing entrance exam`,
          ogTitle: `${newSubPageName} | Nursing Entrance Exam`,
          ogDescription: `Content for ${newSubPageName} under Nursing Entrance Exam.`,
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
        setSuccess(`Sub-page "${newSubPageName}" created successfully!`);
        setShowCreateModal(false);
        setNewSubPageId("");
        setNewSubPageName("");
        setValidationError("");
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setValidationError(result.message || "Failed to create sub-page.");
      }
    } catch (err) {
      setValidationError("Failed to create sub-page.");
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
          <div className="user-page flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="user-card p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              <p className="user-card-title">Loading nursing entrance exam content</p>
              <p className="user-helper mt-2">Preparing sub pages, nested pages, KB articles, and quizzes.</p>
              <div className="mt-5 grid gap-3 text-left">
                <div className="user-skeleton h-5 w-3/4" />
                <div className="user-skeleton h-4 w-full" />
                <div className="user-skeleton h-4 w-2/3" />
              </div>
            </div>
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
        {/* Desktop: Show header bar with breadcrumbs - same as pillar pages */}
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-8">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link
                href="/"
                className="font-medium transition-colors hover:text-indigo-700"
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
                className="font-medium transition-colors hover:text-indigo-700"
              >
                Admin Dashboard
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
              <span className="font-medium">Nursing Entrance Exam</span>
            </div>
            {/* Show UserProfileBadge if logged in, or Login/Register buttons if logged out */}
            {currentUser ? (
              <div>
                <UserProfileBadge />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="font-medium text-gray-700 transition-colors hover:text-indigo-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="user-button-primary px-4 py-2 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="user-page min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          {/* Main Content */}
          <div className="w-full">
            {/* Alerts */}
            {error && (
              <div className="user-alert user-alert-error mb-6" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="user-helper">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="user-alert user-alert-success mb-6" role="status">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="user-helper">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="user-page-header mb-6">
              <div className="user-page-header-row">
              <div className="user-page-header-copy">
                <p className="user-eyebrow">Admin Content</p>
                <h1
                  className="user-page-title mt-1"
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    color: "#111827",
                  }}
                >
                  Nursing Entrance Exam – Admin
                </h1>
                <p
                  className="user-body mt-2 max-w-4xl"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    maxWidth: "520px",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  Manage the main pillar page, sub pages, nested sub pages,
                  knowledge base links, and quizzes for ATI TEAS & HESI A2. Use
                  this panel to add, edit, and organize content that appears on
                  NursingMocks.
                </p>
              </div>
              <div className="user-page-header-actions sm:pt-7">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="user-button-primary"
                >
                  + New Sub Page
                </button>
              </div>
              </div>
            </div>

            {/* Overview Grid */}
            <div
              className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1.2fr)]"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              {/* Structure Overview Card */}
              <div
                className="user-card !rounded-[1.125rem] !bg-white/95 !p-5 !shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h2
                    className="user-section-title !text-[#0f172a]"
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      color: "#312e81",
                    }}
                  >
                    Structure overview
                  </h2>
                  <span
                    className="user-helper"
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    Entrance pillar → TEAS & HESI
                  </span>
                </div>
                <div
                  className="user-body-sm"
                  style={{
                    fontSize: "13px",
                    color: "#4b5563",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  <ul style={{ listStyle: "none", marginTop: "6px" }}>
                    <li style={{ margin: "4px 0" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        Main Pillar Page:
                      </span>{" "}
                      Nursing Entrance Exam
                    </li>
                    <li style={{ margin: "4px 0" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        Sub Pages:
                      </span>{" "}
                      {subPages.length > 0
                        ? subPages
                            .map(
                              (sp) =>
                                sp.pageName ||
                                sp.hero?.title ||
                                sp.title ||
                                sp.id
                            )
                            .join(", ")
                        : "None"}
                    </li>
                    <li style={{ margin: "4px 0" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        Nested Sub Pages:
                      </span>{" "}
                      {nestedSubPages.length > 0
                        ? nestedSubPages
                            .slice(0, 5)
                            .map(
                              (nsp) =>
                                nsp.pageName ||
                                nsp.hero?.title ||
                                nsp.title ||
                                nsp.id
                            )
                            .join(", ") +
                          (nestedSubPages.length > 5 ? ", etc." : "")
                        : "None"}
                    </li>
                    <li style={{ margin: "4px 0" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        KB:
                      </span>{" "}
                      TEAS & HESI knowledge base articles linked from this
                      pillar
                      {kbArticlesCount > 0
                        ? ` (${kbArticlesCount} articles)`
                        : ""}
                    </li>
                    <li style={{ margin: "4px 0" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        Linked Quizzes:
                      </span>{" "}
                      {quizzesCount > 0
                        ? `${quizzesCount} quiz${
                            quizzesCount !== 1 ? "zes" : ""
                          } (each quiz links to its own questions in the question bank)`
                        : "None (each quiz links to its own questions in the question bank)"}
                    </li>
                  </ul>
                  <div
                    className="user-detail-surface mt-4 flex flex-wrap gap-2 p-4"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    {subPages.map((sp) => {
                      const name =
                        sp.pageName || sp.hero?.title || sp.title || sp.id;
                      return (
                        <span
                          className="user-pill user-pill-purple"
                          key={sp.id}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background: "#eef2ff",
                            color: "#4338ca",
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}
                        >
                          Sub Pages: {name}
                        </span>
                      );
                    })}
                    {nestedSubPages.slice(0, 6).map((nsp) => {
                      const name =
                        nsp.pageName || nsp.hero?.title || nsp.title || nsp.id;
                      return (
                        <span
                          className="user-pill user-pill-purple"
                          key={nsp.id}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background: "#eef2ff",
                            color: "#4338ca",
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}
                        >
                          Nested: {name}
                        </span>
                      );
                    })}
                    {kbArticlesCount > 0 && (
                      <span
                        className="user-pill user-pill-purple"
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: "#eef2ff",
                          color: "#4338ca",
                          fontFamily:
                            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}
                      >
                        KB: TEAS & HESI
                      </span>
                    )}
                    {quizzesCount > 0 && (
                      <span
                        className="user-pill user-pill-purple"
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: "#eef2ff",
                          color: "#4338ca",
                          fontFamily:
                            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}
                      >
                        Quiz: {quizzesCount}{" "}
                        {quizzesCount === 1 ? "Quiz" : "Quizzes"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Stats Card */}
              <div
                className="user-card !rounded-[1.125rem] !bg-white/95 !p-5 !shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "18px 20px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h2
                    className="user-section-title !text-[#0f172a]"
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      color: "#312e81",
                    }}
                  >
                    Content stats
                  </h2>
                  <span
                    className="user-helper"
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    For Nursing Entrance Exam
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
                  <div
                    className="user-detail-surface !rounded-xl !bg-slate-950/[0.02] !p-4"
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
                      className="user-label"
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: "4px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      Sub pages
                    </div>
                    <div
                      className="user-stat-value"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        marginBottom: "2px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        color: "#111827",
                      }}
                    >
                      {subPages.length}
                    </div>
                    <div
                      className="user-helper"
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      {subPages.length > 0
                        ? subPages
                            .map(
                              (sp) =>
                                sp.pageName ||
                                sp.hero?.title ||
                                sp.title ||
                                sp.id
                            )
                            .join(" & ")
                        : "None"}
                    </div>
                  </div>
                  <div
                    className="user-detail-surface !rounded-xl !bg-slate-950/[0.02] !p-4"
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
                      className="user-label"
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: "4px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      Nested sub pages
                    </div>
                    <div
                      className="user-stat-value"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        marginBottom: "2px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        color: "#111827",
                      }}
                    >
                      {nestedSubPages.length}
                    </div>
                    <div
                      className="user-helper"
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      {nestedSubPages.length > 0
                        ? nestedSubPages
                            .slice(0, 4)
                            .map(
                              (nsp) =>
                                nsp.pageName ||
                                nsp.hero?.title ||
                                nsp.title ||
                                nsp.id
                            )
                            .join(", ") +
                          (nestedSubPages.length > 4 ? ", ..." : "")
                        : "None"}
                    </div>
                  </div>
                  <div
                    className="user-detail-surface !rounded-xl !bg-slate-950/[0.02] !p-4"
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
                      className="user-label"
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: "4px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      KB articles
                    </div>
                    <div
                      className="user-stat-value"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        marginBottom: "2px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        color: "#111827",
                      }}
                    >
                      {kbArticlesCount}
                    </div>
                    <div
                      className="user-helper"
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      Linked from Entrance pillar
                    </div>
                  </div>
                  <div
                    className="user-detail-surface !rounded-xl !bg-slate-950/[0.02] !p-4"
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
                      className="user-label"
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9ca3af",
                        marginBottom: "4px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      Linked quizzes
                    </div>
                    <div
                      className="user-stat-value"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        marginBottom: "2px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        color: "#111827",
                      }}
                    >
                      {quizzesCount}
                    </div>
                    <div
                      className="user-helper"
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      {quizzesCount > 0
                        ? `${quizzesCount} quiz${
                            quizzesCount !== 1 ? "zes" : ""
                          } linked`
                        : "No quizzes linked"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div
              className="user-page-controls mb-4 !flex !flex-wrap !items-center !gap-2"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <button
                onClick={() => setActiveTab("sub-pages")}
                className="user-page-button !min-h-10 !px-4 !py-2"
                aria-current={activeTab === "sub-pages" ? "page" : undefined}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border:
                    activeTab === "sub-pages"
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                  cursor: "pointer",
                  color: activeTab === "sub-pages" ? "#4338ca" : "#6b7280",
                  background:
                    activeTab === "sub-pages" ? "#eef2ff" : "transparent",
                  fontWeight: activeTab === "sub-pages" ? 500 : 400,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Sub Pages
              </button>
              <button
                onClick={() => setActiveTab("nested")}
                className="user-page-button !min-h-10 !px-4 !py-2"
                aria-current={activeTab === "nested" ? "page" : undefined}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border:
                    activeTab === "nested"
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                  cursor: "pointer",
                  color: activeTab === "nested" ? "#4338ca" : "#6b7280",
                  background:
                    activeTab === "nested" ? "#eef2ff" : "transparent",
                  fontWeight: activeTab === "nested" ? 500 : 400,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Nested Sub Pages
              </button>
              <button
                onClick={() => setActiveTab("kb")}
                className="user-page-button !min-h-10 !px-4 !py-2"
                aria-current={activeTab === "kb" ? "page" : undefined}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border:
                    activeTab === "kb"
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                  cursor: "pointer",
                  color: activeTab === "kb" ? "#4338ca" : "#6b7280",
                  background: activeTab === "kb" ? "#eef2ff" : "transparent",
                  fontWeight: activeTab === "kb" ? 500 : 400,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                KB Articles
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className="user-page-button !min-h-10 !px-4 !py-2"
                aria-current={activeTab === "quizzes" ? "page" : undefined}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border:
                    activeTab === "quizzes"
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                  cursor: "pointer",
                  color: activeTab === "quizzes" ? "#4338ca" : "#6b7280",
                  background:
                    activeTab === "quizzes" ? "#eef2ff" : "transparent",
                  fontWeight: activeTab === "quizzes" ? 500 : 400,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Quizzes
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="user-page-button !min-h-10 !px-4 !py-2"
                aria-current={activeTab === "settings" ? "page" : undefined}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border:
                    activeTab === "settings"
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                  cursor: "pointer",
                  color: activeTab === "settings" ? "#4338ca" : "#6b7280",
                  background:
                    activeTab === "settings" ? "#eef2ff" : "transparent",
                  fontWeight: activeTab === "settings" ? 500 : 400,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Main Page Settings
              </button>
            </div>

            {/* Sub Pages Table Card */}
            <div
              className="user-card p-5"
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "18px 20px",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
                marginTop: "8px",
              }}
            >
              {/* Toolbar */}
              <div
                className="user-search-panel !mb-4 !grid !gap-4 !rounded-2xl !p-4 xl:!grid-cols-[minmax(0,1fr)_auto] xl:!items-end"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  className="user-search-row !grid w-full lg:grid-cols-[minmax(260px,1fr)_220px_180px]"
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    className="user-field !min-h-[44px] !w-full !rounded-xl !px-4"
                    type="text"
                    placeholder={
                      activeTab === "nested"
                        ? "Search nested sub pages..."
                        : activeTab === "quizzes"
                        ? "Search quizzes..."
                        : activeTab === "kb"
                        ? "Search KB articles..."
                        : "Search sub pages..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      fontSize: "13px",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#111827",
                      minWidth: "120px",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  />
                  <select
                    className="user-field !min-h-[44px] !w-full !rounded-xl !px-4"
                    value={examFilter}
                    onChange={(e) => setExamFilter(e.target.value)}
                    style={{
                      fontSize: "13px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#111827",
                      minWidth: "120px",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    <option value="">All exams</option>
                    {uniqueSubPageNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="user-field !min-h-[44px] !w-full !rounded-xl !px-4"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      fontSize: "13px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#111827",
                      minWidth: "120px",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div
                  className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end"
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {activeTab === "kb" ? (
                    <button
                      onClick={() => setShowCreateKbModal(true)}
                      className="user-button-secondary !min-h-[44px] w-full !px-4 sm:w-auto"
                    >
                      + New KB Article
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="user-button-secondary !min-h-[44px] w-full !px-4 sm:w-auto"
                    >
                      {activeTab === "nested"
                        ? "+ New Nested Sub-page"
                        : activeTab === "quizzes"
                        ? "+ New Quiz"
                        : "+ New Sub Page"}
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div
                className="user-detail-surface"
                style={{
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  background: "#ffffff",
                  overflowX: "auto",
                }}
              >
                <table
                  className="min-w-full divide-y divide-gray-200"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    minWidth: "800px",
                  }}
                >
                  <thead style={{ background: "#f9fafb" }}>
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
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "quizzes" ? (
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
                          <tr>
                            <td
                              colSpan={8}
                              style={{
                                padding: "40px 12px",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              No quizzes found.
                            </td>
                          </tr>
                        ) : (
                          paginatedQuizzes.map((quiz) => {
                            const quizName =
                              quiz.quizName ||
                              quiz.pageName ||
                              quiz.title ||
                              quiz.name ||
                              quiz.id;
                            const lastUpdated = quiz.lastUpdated
                              ? new Date(quiz.lastUpdated).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                ) +
                                " · " +
                                new Date(quiz.lastUpdated).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "—";

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
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                    minWidth: "210px",
                                  }}
                                >
                                  {quizName}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {examName}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Quiz
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {quiz.questionCount !== undefined
                                    ? quiz.questionCount
                                    : "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#6b7280",
                                    whiteSpace: "nowrap",
                                    minWidth: "180px",
                                    fontFamily:
                                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                    fontSize: "12px",
                                  }}
                                >
                                  /{quiz.slug || quiz.id}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      background: "#dcfce7",
                                      color: "#15803d",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                    }}
                                  >
                                    Published
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {lastUpdated}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Link
                                      href={`/admin/nursing-entrance-exam/${
                                        quiz.parentSubPageDocId ||
                                        quiz.parentSubPageId
                                      }/nested/${
                                        quiz.nestedSubPageDocId ||
                                        quiz.nestedSubPageId
                                      }/quizzes/${quiz.id}/manage`}
                                      style={{
                                        fontSize: "12px",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Manage
                                    </Link>
                                    <Link
                                      href={`/${quiz.slug || quiz.id}`}
                                      target="_blank"
                                      style={{
                                        fontSize: "12px",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      View
                                    </Link>
                                    <span
                                      onClick={() =>
                                        handleDeleteQuizClick(quiz)
                                      }
                                      style={{
                                        fontSize: "12px",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Delete
                                    </span>
                                  </div>
                                </td>
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
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                padding: "40px 12px",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              No KB articles found.
                            </td>
                          </tr>
                        ) : (
                          paginatedKbArticles.map((kbArticle) => {
                            const pageName =
                              kbArticle.pageName ||
                              kbArticle.title ||
                              kbArticle.id;
                            const lastUpdated = kbArticle.lastUpdated
                              ? new Date(
                                  kbArticle.lastUpdated
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }) +
                                " · " +
                                new Date(
                                  kbArticle.lastUpdated
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—";

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
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                    minWidth: "210px",
                                  }}
                                >
                                  {pageName}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {examName}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  KB Article
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#6b7280",
                                    whiteSpace: "nowrap",
                                    minWidth: "180px",
                                    fontFamily:
                                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                    fontSize: "12px",
                                  }}
                                >
                                  /{kbArticle.slug || kbArticle.id}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      background: "#dcfce7",
                                      color: "#15803d",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                    }}
                                  >
                                    {kbArticle.status || "Published"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {lastUpdated}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Link
                                      href={`/${
                                        kbArticle.slug || kbArticle.id
                                      }`}
                                      target="_blank"
                                      style={{
                                        fontSize: "12px",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      View
                                    </Link>
                                    <Link
                                      href={`/admin/nursing-entrance-exam/kb-articles/${kbArticle.id}`}
                                      style={{
                                        fontSize: "12px",
                                        color: "#6a5cff",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Edit
                                    </Link>
                                    <span
                                      onClick={() => {
                                        handleDeleteKbClick(kbArticle);
                                      }}
                                      style={{
                                        fontSize: "12px",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Delete
                                    </span>
                                  </div>
                                </td>
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
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                padding: "40px 12px",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              No nested sub-pages found.
                            </td>
                          </tr>
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
                              : "—";

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
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                    minWidth: "210px",
                                  }}
                                >
                                  {pageName}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {examName}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Nested Sub Page
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#6b7280",
                                    whiteSpace: "nowrap",
                                    minWidth: "180px",
                                    fontFamily:
                                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                    fontSize: "12px",
                                  }}
                                >
                                  /{nestedSubPage.slug || nestedSubPage.id}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      background: "#dcfce7",
                                      color: "#15803d",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                    }}
                                  >
                                    Published
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {lastUpdated}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      onClick={() => {
                                        setSelectedNestedSubPageForQuiz(
                                          nestedSubPage
                                        );
                                        setShowCreateQuizModal(true);
                                      }}
                                      style={{
                                        fontSize: "12px",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Add
                                    </span>
                                    <Link
                                      href={`/admin/nursing-entrance-exam/${nestedSubPage.parentSubPageId}/nested/${nestedSubPage.id}`}
                                      style={{
                                        fontSize: "12px",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Edit
                                    </Link>
                                    <Link
                                      href={`/${
                                        nestedSubPage.slug || nestedSubPage.id
                                      }`}
                                      target="_blank"
                                      style={{
                                        fontSize: "12px",
                                        color: "#4f46e5",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      View
                                    </Link>
                                    <span
                                      onClick={() =>
                                        handleDeleteNestedClick(nestedSubPage)
                                      }
                                      style={{
                                        fontSize: "12px",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontFamily:
                                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Delete
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        );
                      })()
                    ) : subPages.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: "40px 12px",
                            textAlign: "center",
                            color: "#6b7280",
                          }}
                        >
                          No sub-pages found. Create a sub-page to get started.
                        </td>
                      </tr>
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
                        .sort((a, b) => {
                          const dateA = a.lastUpdated
                            ? new Date(a.lastUpdated).getTime()
                            : 0;
                          const dateB = b.lastUpdated
                            ? new Date(b.lastUpdated).getTime()
                            : 0;
                          return dateB - dateA; // Descending order (newest first)
                        })
                        .map((subPage) => {
                          const pageName =
                            subPage.pageName ||
                            subPage.hero?.title ||
                            subPage.title ||
                            subPage.id;
                          const lastUpdated = subPage.lastUpdated
                            ? new Date(subPage.lastUpdated).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              ) +
                              " · " +
                              new Date(subPage.lastUpdated).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "—";

                          return (
                            <tr key={subPage.id}>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#4b5563",
                                  whiteSpace: "nowrap",
                                  minWidth: "210px",
                                }}
                              >
                                {pageName}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#4b5563",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {pageName}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#4b5563",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Sub Page
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#6b7280",
                                  whiteSpace: "nowrap",
                                  minWidth: "180px",
                                  fontFamily:
                                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                  fontSize: "12px",
                                }}
                              >
                                /{subPage.slug || subPage.id}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#4b5563",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "999px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    fontFamily:
                                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                  }}
                                >
                                  Published
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#4b5563",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {lastUpdated}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#4b5563",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    onClick={() => {
                                      setSelectedSubPageForNested(subPage);
                                      setShowCreateNestedModal(true);
                                    }}
                                    style={{
                                      fontSize: "12px",
                                      color: "#4f46e5",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Add
                                  </span>
                                  <Link
                                    href={`/admin/nursing-entrance-exam/${subPage.id}`}
                                    style={{
                                      fontSize: "12px",
                                      color: "#4f46e5",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Edit
                                  </Link>
                                  <Link
                                    href={`/${subPage.slug || subPage.id}`}
                                    target="_blank"
                                    style={{
                                      fontSize: "12px",
                                      color: "#4f46e5",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    View
                                  </Link>
                                  <span
                                    onClick={() => handleDeleteClick(subPage)}
                                    style={{
                                      fontSize: "12px",
                                      color: "#ef4444",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Delete
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(activeTab === "nested" ||
                activeTab === "quizzes" ||
                activeTab === "kb") &&
                (() => {
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
                    const sortedKbArticles = [...filteredKbArticles].sort(
                      (a, b) => {
                        const dateA = a.lastUpdated
                          ? new Date(a.lastUpdated).getTime()
                          : 0;
                        const dateB = b.lastUpdated
                          ? new Date(b.lastUpdated).getTime()
                          : 0;
                        return dateB - dateA;
                      }
                    );
                    const totalPages = Math.ceil(
                      sortedKbArticles.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "16px",
                          padding: "12px 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}
                        >
                          Showing {(kbArticlesPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            kbArticlesPage * itemsPerPage,
                            sortedKbArticles.length
                          )}{" "}
                          of {sortedKbArticles.length} KB articles
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              setKbArticlesPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={kbArticlesPage === 1}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                kbArticlesPage === 1
                                  ? "#f9fafb"
                                  : "transparent",
                              color:
                                kbArticlesPage === 1 ? "#9ca3af" : "#6b7280",
                              cursor:
                                kbArticlesPage === 1
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (kbArticlesPage !== 1) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (kbArticlesPage !== 1) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Previous
                          </button>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= kbArticlesPage - 1 &&
                                  page <= kbArticlesPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setKbArticlesPage(page)}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "13px",
                                      border:
                                        kbArticlesPage === page
                                          ? "1px solid #c7d2fe"
                                          : "1px solid transparent",
                                      borderRadius: "999px",
                                      background:
                                        kbArticlesPage === page
                                          ? "#eef2ff"
                                          : "transparent",
                                      color:
                                        kbArticlesPage === page
                                          ? "#4338ca"
                                          : "#6b7280",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      fontWeight:
                                        kbArticlesPage === page ? 500 : 400,
                                      minWidth: "36px",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (kbArticlesPage !== page) {
                                        e.currentTarget.style.background =
                                          "#eef2ff";
                                        e.currentTarget.style.borderColor =
                                          "#c7d2fe";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (kbArticlesPage !== page) {
                                        e.currentTarget.style.background =
                                          "transparent";
                                        e.currentTarget.style.borderColor =
                                          "transparent";
                                      }
                                    }}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === kbArticlesPage - 2 ||
                                page === kbArticlesPage + 2
                              ) {
                                return (
                                  <span
                                    key={page}
                                    style={{
                                      padding: "6px 4px",
                                      color: "#9ca3af",
                                      fontSize: "13px",
                                    }}
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <button
                            onClick={() =>
                              setKbArticlesPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={kbArticlesPage === totalPages}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                kbArticlesPage === totalPages
                                  ? "#f9fafb"
                                  : "transparent",
                              color:
                                kbArticlesPage === totalPages
                                  ? "#9ca3af"
                                  : "#6b7280",
                              cursor:
                                kbArticlesPage === totalPages
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (kbArticlesPage !== totalPages) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (kbArticlesPage !== totalPages) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
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
                    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
                      const dateA = a.lastUpdated
                        ? new Date(a.lastUpdated).getTime()
                        : 0;
                      const dateB = b.lastUpdated
                        ? new Date(b.lastUpdated).getTime()
                        : 0;
                      return dateB - dateA; // Descending order (newest first)
                    });
                    const totalPages = Math.ceil(
                      sortedQuizzes.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "16px",
                          padding: "12px 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}
                        >
                          Showing {(quizzesPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            quizzesPage * itemsPerPage,
                            sortedQuizzes.length
                          )}{" "}
                          of {sortedQuizzes.length} quizzes
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              setQuizzesPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={quizzesPage === 1}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border:
                                quizzesPage === 1
                                  ? "1px solid #e5e7eb"
                                  : "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                quizzesPage === 1 ? "#f9fafb" : "transparent",
                              color: quizzesPage === 1 ? "#9ca3af" : "#6b7280",
                              cursor:
                                quizzesPage === 1 ? "not-allowed" : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (quizzesPage !== 1) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (quizzesPage !== 1) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Previous
                          </button>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= quizzesPage - 1 &&
                                  page <= quizzesPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setQuizzesPage(page)}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "13px",
                                      border:
                                        quizzesPage === page
                                          ? "1px solid #c7d2fe"
                                          : "1px solid transparent",
                                      borderRadius: "999px",
                                      background:
                                        quizzesPage === page
                                          ? "#eef2ff"
                                          : "transparent",
                                      color:
                                        quizzesPage === page
                                          ? "#4338ca"
                                          : "#6b7280",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      fontWeight:
                                        quizzesPage === page ? 500 : 400,
                                      minWidth: "36px",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (quizzesPage !== page) {
                                        e.currentTarget.style.background =
                                          "#eef2ff";
                                        e.currentTarget.style.borderColor =
                                          "#c7d2fe";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (quizzesPage !== page) {
                                        e.currentTarget.style.background =
                                          "transparent";
                                        e.currentTarget.style.borderColor =
                                          "transparent";
                                      }
                                    }}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === quizzesPage - 2 ||
                                page === quizzesPage + 2
                              ) {
                                return (
                                  <span
                                    key={page}
                                    style={{
                                      padding: "6px 4px",
                                      fontSize: "13px",
                                      color: "#6b7280",
                                    }}
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <button
                            onClick={() =>
                              setQuizzesPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={quizzesPage === totalPages}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border:
                                quizzesPage === totalPages
                                  ? "1px solid #e5e7eb"
                                  : "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                quizzesPage === totalPages
                                  ? "#f9fafb"
                                  : "transparent",
                              color:
                                quizzesPage === totalPages
                                  ? "#9ca3af"
                                  : "#6b7280",
                              cursor:
                                quizzesPage === totalPages
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (quizzesPage !== totalPages) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (quizzesPage !== totalPages) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
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
                    const totalPages = Math.ceil(
                      sortedNestedSubPages.length / itemsPerPage
                    );
                    if (totalPages <= 1) return null;

                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "16px",
                          padding: "12px 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          }}
                        >
                          Showing {(nestedSubPagesPage - 1) * itemsPerPage + 1}{" "}
                          to{" "}
                          {Math.min(
                            nestedSubPagesPage * itemsPerPage,
                            sortedNestedSubPages.length
                          )}{" "}
                          of {sortedNestedSubPages.length} nested sub-pages
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              setNestedSubPagesPage((prev) =>
                                Math.max(1, prev - 1)
                              )
                            }
                            disabled={nestedSubPagesPage === 1}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border:
                                nestedSubPagesPage === 1
                                  ? "1px solid #e5e7eb"
                                  : "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                nestedSubPagesPage === 1
                                  ? "#f9fafb"
                                  : "transparent",
                              color:
                                nestedSubPagesPage === 1
                                  ? "#9ca3af"
                                  : "#6b7280",
                              cursor:
                                nestedSubPagesPage === 1
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (nestedSubPagesPage !== 1) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (nestedSubPagesPage !== 1) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Previous
                          </button>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= nestedSubPagesPage - 1 &&
                                  page <= nestedSubPagesPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setNestedSubPagesPage(page)}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "13px",
                                      border:
                                        nestedSubPagesPage === page
                                          ? "1px solid #c7d2fe"
                                          : "1px solid transparent",
                                      borderRadius: "999px",
                                      background:
                                        nestedSubPagesPage === page
                                          ? "#eef2ff"
                                          : "transparent",
                                      color:
                                        nestedSubPagesPage === page
                                          ? "#4338ca"
                                          : "#6b7280",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      fontWeight:
                                        nestedSubPagesPage === page ? 500 : 400,
                                      minWidth: "36px",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (nestedSubPagesPage !== page) {
                                        e.currentTarget.style.background =
                                          "#eef2ff";
                                        e.currentTarget.style.borderColor =
                                          "#c7d2fe";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (nestedSubPagesPage !== page) {
                                        e.currentTarget.style.background =
                                          "transparent";
                                        e.currentTarget.style.borderColor =
                                          "transparent";
                                      }
                                    }}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === nestedSubPagesPage - 2 ||
                                page === nestedSubPagesPage + 2
                              ) {
                                return (
                                  <span
                                    key={page}
                                    style={{
                                      padding: "6px 4px",
                                      fontSize: "13px",
                                      color: "#6b7280",
                                    }}
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <button
                            onClick={() =>
                              setNestedSubPagesPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={nestedSubPagesPage === totalPages}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border:
                                nestedSubPagesPage === totalPages
                                  ? "1px solid #e5e7eb"
                                  : "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                nestedSubPagesPage === totalPages
                                  ? "#f9fafb"
                                  : "transparent",
                              color:
                                nestedSubPagesPage === totalPages
                                  ? "#9ca3af"
                                  : "#6b7280",
                              cursor:
                                nestedSubPagesPage === totalPages
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (nestedSubPagesPage !== totalPages) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (nestedSubPagesPage !== totalPages) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#9ca3af",
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                {activeTab === "nested" ? (
                  <>
                    Nested sub pages (like TEAS Reading, TEAS Math, HESI
                    Vocabulary, HESI A&P) live under their parent sub pages.
                    Each nested sub page can have its own quizzes and content.
                  </>
                ) : activeTab === "quizzes" ? (
                  <>
                    Quizzes are linked to nested sub pages. Each quiz contains
                    its own questions stored in the question bank. You can
                    manage quiz questions from the Manage action.
                  </>
                ) : (
                  <>
                    Sub pages represent ATI TEAS and HESI A2. Nested sub pages
                    (like TEAS Reading, TEAS Math, HESI Vocabulary, HESI A&P)
                    live under those sub pages. Knowledge base (KB) articles are
                    linked from this pillar and TEAS/HESI sub pages under the
                    "KB Articles" tab. Linked quizzes such as "ATI TEAS Math
                    Questions – Set 1" are managed under the Quizzes tab, and
                    each quiz contains its own questions stored in the question
                    bank.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && subPageToDelete && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[460px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "26px 26px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "999px",
                    margin: "0 auto 14px",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "999px",
                      border: "2px solid #ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    !
                  </div>
                </div>
                <h2
                  className="user-card-title"
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "#111827",
                  }}
                >
                  Delete Sub-page
                </h2>
                <p
                  className="user-helper"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "18px",
                  }}
                >
                  Are you sure you want to delete the sub-page{" "}
                  <strong>
                    "
                    {subPageToDelete.pageName ||
                      subPageToDelete.hero?.title ||
                      subPageToDelete.title ||
                      subPageToDelete.id}
                    "
                  </strong>
                  ?<br />
                  This action cannot be undone.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="user-button-cancel"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deleting ? "not-allowed" : "pointer",
                      background: "#ffffff",
                      color: "#111827",
                      boxShadow: "0 3px 8px rgba(148, 163, 184, 0.25)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deleting ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deleting) {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deleting) {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="user-button-danger"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid transparent",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deleting ? "not-allowed" : "pointer",
                      background: deleting ? "#9ca3af" : "#ef4444",
                      color: "#ffffff",
                      boxShadow: deleting
                        ? "none"
                        : "0 10px 24px rgba(239, 68, 68, 0.45)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deleting ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!deleting) {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deleting) {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {deleting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Nested Sub-page Modal */}
          {showDeleteNestedModal && nestedSubPageToDelete && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[460px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "26px 26px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "999px",
                    margin: "0 auto 14px",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "999px",
                      border: "2px solid #ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    !
                  </div>
                </div>
                <h2
                  className="user-card-title"
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "#111827",
                  }}
                >
                  Delete Nested Sub-page
                </h2>
                <p
                  className="user-helper"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "18px",
                  }}
                >
                  Are you sure you want to delete the nested sub-page{" "}
                  <strong>
                    "
                    {nestedSubPageToDelete.pageName ||
                      nestedSubPageToDelete.hero?.title ||
                      nestedSubPageToDelete.title ||
                      nestedSubPageToDelete.id}
                    "
                  </strong>
                  ?<br />
                  This action cannot be undone.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    onClick={handleDeleteNestedCancel}
                    disabled={deletingNested}
                    className="user-button-cancel"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingNested ? "not-allowed" : "pointer",
                      background: "#ffffff",
                      color: "#111827",
                      boxShadow: "0 3px 8px rgba(148, 163, 184, 0.25)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingNested ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingNested) {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingNested) {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteNestedConfirm}
                    disabled={deletingNested}
                    className="user-button-danger"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid transparent",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingNested ? "not-allowed" : "pointer",
                      background: deletingNested ? "#9ca3af" : "#ef4444",
                      color: "#ffffff",
                      boxShadow: deletingNested
                        ? "none"
                        : "0 10px 24px rgba(239, 68, 68, 0.45)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingNested ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingNested) {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingNested) {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {deletingNested ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Quiz Modal */}
          {showDeleteQuizModal && quizToDelete && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[460px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "26px 26px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "999px",
                    margin: "0 auto 14px",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "999px",
                      border: "2px solid #ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    !
                  </div>
                </div>
                <h2
                  className="user-card-title"
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "#111827",
                  }}
                >
                  Delete Quiz
                </h2>
                <p
                  className="user-helper"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "18px",
                  }}
                >
                  Are you sure you want to delete the quiz{" "}
                  <strong>
                    "
                    {quizToDelete.quizName ||
                      quizToDelete.pageName ||
                      quizToDelete.title ||
                      quizToDelete.name ||
                      quizToDelete.id}
                    "
                  </strong>
                  ?<br />
                  This action cannot be undone.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    onClick={handleDeleteQuizCancel}
                    disabled={deletingQuiz}
                    className="user-button-cancel"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingQuiz ? "not-allowed" : "pointer",
                      background: "#ffffff",
                      color: "#111827",
                      boxShadow: "0 3px 8px rgba(148, 163, 184, 0.25)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingQuiz ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingQuiz) {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingQuiz) {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteQuizConfirm}
                    disabled={deletingQuiz}
                    className="user-button-danger"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid transparent",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingQuiz ? "not-allowed" : "pointer",
                      background: deletingQuiz ? "#9ca3af" : "#ef4444",
                      color: "#ffffff",
                      boxShadow: deletingQuiz
                        ? "none"
                        : "0 10px 24px rgba(239, 68, 68, 0.45)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingQuiz ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingQuiz) {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingQuiz) {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {deletingQuiz ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Sub-page Modal */}
          {showCreateModal && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[520px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "24px 26px 20px",
                }}
              >
                <div style={{ marginBottom: "18px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      marginBottom: "4px",
                      color: "#111827",
                    }}
                  >
                    Create New Sub-page
                  </h2>
                </div>
                <form onSubmit={handleCreateSubPage}>
                  {validationError && (
                    <div className="user-alert user-alert-error mb-4" role="alert">
                      <span className="user-alert-icon" aria-hidden="true">!</span>
                      <p className="user-helper">{validationError}</p>
                    </div>
                  )}
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Sub-page Name
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newSubPageName}
                        onChange={(e) => setNewSubPageName(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "1px solid #e5e7eb",
                          padding: "11px 13px",
                          fontSize: "14px",
                          color: "#111827",
                          background: "#f9fafb",
                          outline: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                        }}
                        onFocus={(e) => {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#4f46e5";
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(79, 70, 229, 0.18)";
                        }}
                        onBlur={(e) => {
                          e.target.style.background = "#f9fafb";
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="e.g., Math Review, Reading Strategies"
                        required
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        The display name for this sub-page.
                      </p>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Slug URL
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            padding: "11px 12px",
                            borderRadius: "999px 0 0 999px",
                            border: "1px solid #e5e7eb",
                            borderRight: "none",
                            fontSize: "13px",
                            color: "#6b7280",
                            background: "#f9fafb",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getSiteUrl()}/
                        </div>
                        <input
                          type="text"
                          value={newSubPageId}
                          onChange={(e) =>
                            setNewSubPageId(
                              e.target.value.toLowerCase().replace(/\s+/g, "-")
                            )
                          }
                          style={{
                            flex: 1,
                            borderRadius: "0 999px 999px 0",
                            border: "1px solid #e5e7eb",
                            borderLeft: "none",
                            padding: "11px 13px",
                            fontSize: "14px",
                            color: "#111827",
                            background: "#f9fafb",
                            outline: "none",
                            transition:
                              "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "#ffffff";
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow =
                              "0 0 0 1px rgba(79, 70, 229, 0.18)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "#f9fafb";
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.boxShadow = "none";
                          }}
                          placeholder="e.g., ati-teas, math-review"
                          required
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        This will create a page at /
                        {newSubPageId || "sub-page-id"}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewSubPageId("");
                        setNewSubPageName("");
                        setValidationError("");
                      }}
                      className="user-button-cancel"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid #e5e7eb",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#f3f4f6",
                        color: "#111827",
                        transition:
                          "background 0.15s, border-color 0.15s, transform 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="user-button-primary"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: saving ? "not-allowed" : "pointer",
                        background: saving ? "#9ca3af" : "#4f46e5",
                        color: "#ffffff",
                        boxShadow: saving
                          ? "none"
                          : "0 10px 24px rgba(79, 70, 229, 0.45)",
                        transition: "background 0.15s, transform 0.08s",
                        opacity: saving ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!saving) {
                          e.currentTarget.style.background = "#4338ca";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!saving) {
                          e.currentTarget.style.background = "#4f46e5";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {saving ? "Creating..." : "Create Sub-page"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete KB Article Modal */}
          {showDeleteKbModal && kbArticleToDelete && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[460px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "26px 26px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "999px",
                    margin: "0 auto 14px",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "999px",
                      border: "2px solid #ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    !
                  </div>
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "#111827",
                  }}
                >
                  Delete KB Article
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "18px",
                  }}
                >
                  Are you sure you want to delete the KB article{" "}
                  <strong>
                    "
                    {kbArticleToDelete.pageName ||
                      kbArticleToDelete.title ||
                      kbArticleToDelete.id}
                    "
                  </strong>
                  ?<br />
                  This action cannot be undone.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    onClick={handleDeleteKbCancel}
                    disabled={deletingKb}
                    className="user-button-cancel"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingKb ? "not-allowed" : "pointer",
                      background: "#ffffff",
                      color: "#111827",
                      boxShadow: "0 3px 8px rgba(148, 163, 184, 0.25)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingKb ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingKb) {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingKb) {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteKbArticle}
                    disabled={deletingKb}
                    className="user-button-danger"
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid transparent",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingKb ? "not-allowed" : "pointer",
                      background: deletingKb ? "#9ca3af" : "#ef4444",
                      color: "#ffffff",
                      boxShadow: deletingKb
                        ? "none"
                        : "0 10px 24px rgba(239, 68, 68, 0.45)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingKb ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingKb) {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingKb) {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {deletingKb ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Delete KB Article</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create KB Article Modal */}
          {showCreateKbModal && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[520px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "24px 26px 20px",
                }}
              >
                <div style={{ marginBottom: "18px" }}>
                  <h2
                    className="user-card-title"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      marginBottom: "4px",
                      color: "#111827",
                    }}
                  >
                    Create New KB Article
                  </h2>
                </div>
                <form onSubmit={handleCreateKbArticle}>
                  {kbValidationError && (
                    <div className="user-alert user-alert-error mb-4" role="alert">
                      <span className="user-alert-icon" aria-hidden="true">!</span>
                      <p className="user-helper">
                        {kbValidationError}
                      </p>
                    </div>
                  )}
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Sub-page
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <select
                        value={selectedSubPageForKb}
                        onChange={(e) =>
                          setSelectedSubPageForKb(e.target.value)
                        }
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "1px solid #e5e7eb",
                          padding: "11px 13px",
                          fontSize: "14px",
                          color: "#111827",
                          background: "#f9fafb",
                          outline: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                          cursor: "pointer",
                        }}
                        onFocus={(e) => {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#4f46e5";
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(79, 70, 229, 0.18)";
                        }}
                        onBlur={(e) => {
                          e.target.style.background = "#f9fafb";
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                        required
                      >
                        <option value="">Select a sub-page</option>
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
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        Select the sub-page this KB article belongs to.
                      </p>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          KB Article Name
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newKbArticleName}
                        onChange={(e) => setNewKbArticleName(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "1px solid #e5e7eb",
                          padding: "11px 13px",
                          fontSize: "14px",
                          color: "#111827",
                          background: "#f9fafb",
                          outline: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                        }}
                        onFocus={(e) => {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#4f46e5";
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(79, 70, 229, 0.18)";
                        }}
                        onBlur={(e) => {
                          e.target.style.background = "#f9fafb";
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="e.g., How to Study for TEAS Math"
                        required
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        The display name for this KB article.
                      </p>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Slug URL
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            padding: "11px 12px",
                            borderRadius: "999px 0 0 999px",
                            border: "1px solid #e5e7eb",
                            borderRight: "none",
                            fontSize: "13px",
                            color: "#6b7280",
                            background: "#f9fafb",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getSiteUrl()}/
                        </div>
                        <input
                          type="text"
                          value={newKbArticleId}
                          onChange={(e) =>
                            setNewKbArticleId(
                              e.target.value.toLowerCase().replace(/\s+/g, "-")
                            )
                          }
                          style={{
                            flex: 1,
                            borderRadius: "0 999px 999px 0",
                            border: "1px solid #e5e7eb",
                            borderLeft: "none",
                            padding: "11px 13px",
                            fontSize: "14px",
                            color: "#111827",
                            background: "#f9fafb",
                            outline: "none",
                            transition:
                              "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "#ffffff";
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow =
                              "0 0 0 1px rgba(79, 70, 229, 0.18)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "#f9fafb";
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.boxShadow = "none";
                          }}
                          placeholder="e.g., how-to-study-teas-math"
                          required
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        This will create a page at /
                        {newKbArticleId || "kb-article-id"}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateKbModal(false);
                        setNewKbArticleId("");
                        setNewKbArticleName("");
                        setSelectedSubPageForKb("");
                        setKbValidationError("");
                      }}
                      className="user-button-cancel"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid #e5e7eb",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#f3f4f6",
                        color: "#111827",
                        transition:
                          "background 0.15s, border-color 0.15s, transform 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingKb}
                      className="user-button-primary"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: savingKb ? "not-allowed" : "pointer",
                        background: savingKb ? "#9ca3af" : "#4f46e5",
                        color: "#ffffff",
                        boxShadow: savingKb
                          ? "none"
                          : "0 10px 24px rgba(79, 70, 229, 0.45)",
                        transition: "background 0.15s, transform 0.08s",
                        opacity: savingKb ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!savingKb) {
                          e.currentTarget.style.background = "#4338ca";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!savingKb) {
                          e.currentTarget.style.background = "#4f46e5";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {savingKb ? "Creating..." : "Create KB Article"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Nested Sub-page Modal */}
          {showCreateNestedModal && selectedSubPageForNested && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[520px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "24px 26px 20px",
                }}
              >
                <div style={{ marginBottom: "18px" }}>
                  <h2
                    className="user-card-title"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      marginBottom: "4px",
                      color: "#111827",
                    }}
                  >
                    Create New Nested Sub-page
                  </h2>
                </div>
                <form onSubmit={handleCreateNestedSubPage}>
                  {nestedValidationError && (
                    <div className="user-alert user-alert-error mb-4" role="alert">
                      <span className="user-alert-icon" aria-hidden="true">!</span>
                      <p className="user-helper">
                        {nestedValidationError}
                      </p>
                    </div>
                  )}
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Nested Sub-page Name
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newNestedSubPageName}
                        onChange={(e) =>
                          setNewNestedSubPageName(e.target.value)
                        }
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "1px solid #e5e7eb",
                          padding: "11px 13px",
                          fontSize: "14px",
                          color: "#111827",
                          background: "#f9fafb",
                          outline: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                        }}
                        onFocus={(e) => {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#4f46e5";
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(79, 70, 229, 0.18)";
                        }}
                        onBlur={(e) => {
                          e.target.style.background = "#f9fafb";
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="e.g., TEAS Reading, TEAS Math, HESI Vocabulary"
                        required
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        The display name for this nested sub-page.
                      </p>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Slug URL
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            padding: "11px 12px",
                            borderRadius: "999px 0 0 999px",
                            border: "1px solid #e5e7eb",
                            borderRight: "none",
                            fontSize: "13px",
                            color: "#6b7280",
                            background: "#f9fafb",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getSiteUrl()}/
                        </div>
                        <input
                          type="text"
                          value={newNestedSubPageId}
                          onChange={(e) =>
                            setNewNestedSubPageId(
                              e.target.value.toLowerCase().replace(/\s+/g, "-")
                            )
                          }
                          style={{
                            flex: 1,
                            borderRadius: "0 999px 999px 0",
                            border: "1px solid #e5e7eb",
                            borderLeft: "none",
                            padding: "11px 13px",
                            fontSize: "14px",
                            color: "#111827",
                            background: "#f9fafb",
                            outline: "none",
                            transition:
                              "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "#ffffff";
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow =
                              "0 0 0 1px rgba(79, 70, 229, 0.18)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "#f9fafb";
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.boxShadow = "none";
                          }}
                          placeholder="e.g., ati-teas-practice-questions"
                          required
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        This will create a page at /
                        {newNestedSubPageId || "nested-sub-page-id"}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateNestedModal(false);
                        setSelectedSubPageForNested(null);
                        setNewNestedSubPageId("");
                        setNewNestedSubPageName("");
                        setNestedValidationError("");
                      }}
                      className="user-button-cancel"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid #e5e7eb",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#f3f4f6",
                        color: "#111827",
                        transition:
                          "background 0.15s, border-color 0.15s, transform 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingNested}
                      className="user-button-primary"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: savingNested ? "not-allowed" : "pointer",
                        background: savingNested ? "#9ca3af" : "#4f46e5",
                        color: "#ffffff",
                        boxShadow: savingNested
                          ? "none"
                          : "0 10px 24px rgba(79, 70, 229, 0.45)",
                        transition: "background 0.15s, transform 0.08s",
                        opacity: savingNested ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!savingNested) {
                          e.currentTarget.style.background = "#4338ca";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!savingNested) {
                          e.currentTarget.style.background = "#4f46e5";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {savingNested ? "Creating..." : "Create Nested Sub-page"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Quiz Modal */}
          {showCreateQuizModal && selectedNestedSubPageForQuiz && (
            <div
              className="user-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="user-modal mx-auto my-auto w-full max-w-[520px] bg-white"
                style={{
                  borderRadius: "20px",
                  boxShadow:
                    "0 20px 50px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.25)",
                  padding: "24px 26px 20px",
                }}
              >
                <div style={{ marginBottom: "18px" }}>
                  <h2
                    className="user-card-title"
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      marginBottom: "4px",
                      color: "#111827",
                    }}
                  >
                    Create New Quiz
                  </h2>
                </div>
                <form onSubmit={handleCreateQuiz}>
                  {quizValidationError && (
                    <div className="user-alert user-alert-error mb-4" role="alert">
                      <span className="user-alert-icon" aria-hidden="true">!</span>
                      <p className="user-helper">
                        {quizValidationError}
                      </p>
                    </div>
                  )}
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Quiz Name
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newQuizName}
                        onChange={(e) => setNewQuizName(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "1px solid #e5e7eb",
                          padding: "11px 13px",
                          fontSize: "14px",
                          color: "#111827",
                          background: "#f9fafb",
                          outline: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                        }}
                        onFocus={(e) => {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#4f46e5";
                          e.target.style.boxShadow =
                            "0 0 0 1px rgba(79, 70, 229, 0.18)";
                        }}
                        onBlur={(e) => {
                          e.target.style.background = "#f9fafb";
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="e.g., ATI TEAS Math Questions – Set 1"
                        required
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        The display name for this quiz.
                      </p>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Set Number
                        </label>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={newQuizSetNumber}
                        onChange={(e) => setNewQuizSetNumber(e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "1px solid #e5e7eb",
                          padding: "11px 13px",
                          fontSize: "14px",
                          color: "#111827",
                          background: "#f9fafb",
                          outline: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                        }}
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#111827",
                          }}
                        >
                          Slug URL
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            padding: "11px 12px",
                            borderRadius: "999px 0 0 999px",
                            border: "1px solid #e5e7eb",
                            borderRight: "none",
                            fontSize: "13px",
                            color: "#6b7280",
                            background: "#f9fafb",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getSiteUrl()}/
                        </div>
                        <input
                          type="text"
                          value={newQuizId}
                          onChange={(e) =>
                            setNewQuizId(
                              e.target.value.toLowerCase().replace(/\s+/g, "-")
                            )
                          }
                          style={{
                            flex: 1,
                            borderRadius: "0 999px 999px 0",
                            border: "1px solid #e5e7eb",
                            borderLeft: "none",
                            padding: "11px 13px",
                            fontSize: "14px",
                            color: "#111827",
                            background: "#f9fafb",
                            outline: "none",
                            transition:
                              "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "#ffffff";
                            e.target.style.borderColor = "#4f46e5";
                            e.target.style.boxShadow =
                              "0 0 0 1px rgba(79, 70, 229, 0.18)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "#f9fafb";
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.boxShadow = "none";
                          }}
                          placeholder="e.g., ati-teas-math-questions-set-1"
                          required
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        This will create a quiz at /{newQuizId || "quiz-id"}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "4px",
                    }}
                  >
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
                      className="user-button-cancel"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid #e5e7eb",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#f3f4f6",
                        color: "#111827",
                        transition:
                          "background 0.15s, border-color 0.15s, transform 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingQuiz}
                      className="user-button-primary"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: savingQuiz ? "not-allowed" : "pointer",
                        background: savingQuiz ? "#9ca3af" : "#4f46e5",
                        color: "#ffffff",
                        boxShadow: savingQuiz
                          ? "none"
                          : "0 10px 24px rgba(79, 70, 229, 0.45)",
                        transition: "background 0.15s, transform 0.08s",
                        opacity: savingQuiz ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!savingQuiz) {
                          e.currentTarget.style.background = "#4338ca";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!savingQuiz) {
                          e.currentTarget.style.background = "#4f46e5";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {savingQuiz ? "Creating..." : "Create Quiz"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
