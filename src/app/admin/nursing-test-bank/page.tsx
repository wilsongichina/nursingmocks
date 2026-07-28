"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getNursingTestBankSubPages,
  deleteNursingTestBankSubPage,
  uploadNursingTestBankSubPage,
  getNursingTestBankNestedSubPages,
  getNursingTestBankTopics,
  getNursingTestBankQuizzes,
  getRouteMappingSlugsByIds,
  countTopicQuestions,
  countQuizQuestions,
  uploadNursingTestBankNestedSubPage,
  deleteNursingTestBankNestedSubPage,
  deleteNursingTestBankTopic,
  uploadNursingTestBankTopic,
  deleteNursingTestBankQuiz,
  uploadNursingTestBankQuiz,
  uploadNursingTestBankKbArticle,
  getNursingTestBankKbArticles,
  deleteNursingTestBankKbArticle,
} from "@/lib/firestore-operations";
import Link from "next/link";
import {
  AdminBadgeList,
  AdminCard,
  AdminDestructiveDialog,
  AdminFieldGroup,
  AdminInfoTile,
  AdminLoadingState,
  AdminModal,
  AdminModalFooter,
  AdminNotificationRegion,
  AdminPagination,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminTabs,
  AdminTable,
  AdminTableCell,
  AdminTableEmptyState,
  AdminToolbar,
  AdminTopBar,
  AdminSlugField,
  AdminValidationMessage,
} from "@/components/admin/AdminUi";
import { useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl } from "@/lib/config";
import { contentAccessProductLabel } from "@/lib/content-access-products";

const nursingTestBankAdminTabs = [
  { id: "sub-pages", label: "Sub Pages" },
  { id: "nested", label: "Nested Sub Pages" },
  { id: "topics", label: "Topics" },
  { id: "quizzes", label: "Quiz Metadata" },
  { id: "kb", label: "Knowledge Base Articles" },
];

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

function NursingTestBankAdminPageContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
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

    // Check topics
    const existingTopic = topics.find((topic) => {
      const existingSlug = normalizeSlug(topic.slug || topic.id);
      return existingSlug === normalizedSlug && topic.id !== excludeId;
    });
    if (existingTopic) {
      return {
        taken: true,
        message: `A topic with slug "${normalizedSlug}" already exists.`,
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
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<any | null>(null);
  const [deletingTopic, setDeletingTopic] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [selectedNestedSubPageForTopic, setSelectedNestedSubPageForTopic] =
    useState<any | null>(null);
  const [newTopicId, setNewTopicId] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [topicValidationError, setTopicValidationError] = useState("");
  const [savingTopic, setSavingTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Reset pagination when tab changes
  useEffect(() => {
    setNestedSubPagesPage(1);
    setTopicsPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [activeTab]);

  // Reset pagination when search query changes
  useEffect(() => {
    setNestedSubPagesPage(1);
    setTopicsPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setNestedSubPagesPage(1);
    setTopicsPage(1);
    setQuizzesPage(1);
    setKbArticlesPage(1);
  }, [examFilter, statusFilter]);

  const [nestedSubPages, setNestedSubPages] = useState<any[]>([]);
  const [topicsCount, setTopicsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [kbArticlesCount, setKbArticlesCount] = useState(0);
  const [topics, setTopics] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [nestedSubPagesPage, setNestedSubPagesPage] = useState(1);
  const [topicsPage, setTopicsPage] = useState(1);
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
    const tab = searchParams.get("tab");
    const validTab = nursingTestBankAdminTabs.some((item) => item.id === tab);
    if (tab && validTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const getSubPageNameById = (subPageId?: string) => {
    const parentSubPage = subPages.find(
      (sp) => sp.id === subPageId || sp.slug === subPageId
    );
    return parentSubPage
      ? parentSubPage.pageName ||
          parentSubPage.hero?.title ||
          parentSubPage.title ||
          parentSubPage.id
      : "";
  };

  const matchesSearch = (value: string) =>
    !searchQuery || value.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesStatus = (status?: string) =>
    !statusFilter || (status || "published").toLowerCase() === statusFilter;

  const filteredNestedSubPagesCount = nestedSubPages.filter((nsp) => {
    const name = nsp.pageName || nsp.hero?.title || nsp.title || nsp.id;
    const examName =
      getSubPageNameById(nsp.parentSubPageDocId) ||
      getSubPageNameById(nsp.parentSubPageId) ||
      nsp.parentSubPageName ||
      nsp.parentSubPageId;
    return matchesSearch(name) && (!examFilter || examName === examFilter) && matchesStatus(nsp.status);
  }).length;

  const filteredTopicsCount = topics.filter((topic) => {
    const name = topic.topicName || topic.pageName || topic.title || topic.name || topic.id;
    const examName =
      getSubPageNameById(topic.parentSubPageDocId) ||
      getSubPageNameById(topic.parentSubPageId) ||
      topic.parentSubPageName ||
      topic.parentSubPageId;
    return matchesSearch(name) && (!examFilter || examName === examFilter) && matchesStatus(topic.status);
  }).length;

  const filteredQuizzesCount = quizzes.filter((quiz) => {
    const name = quiz.quizName || quiz.pageName || quiz.title || quiz.name || quiz.id;
    const examName =
      getSubPageNameById(quiz.parentSubPageDocId) ||
      getSubPageNameById(quiz.parentSubPageId) ||
      quiz.parentSubPageName ||
      quiz.parentSubPageId;
    return matchesSearch(name) && (!examFilter || examName === examFilter) && matchesStatus(quiz.status);
  }).length;

  const filteredKbArticlesCount = kbArticles.filter((kb) => {
    const name = kb.pageName || kb.title || kb.id;
    const examName = getSubPageNameById(kb.parentId);
    return matchesSearch(name) && (!examFilter || examName === examFilter) && matchesStatus(kb.status);
  }).length;

  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<any | null>(
    null
  );
  const [newQuizId, setNewQuizId] = useState("");
  const [newQuizName, setNewQuizName] = useState("");
  const [quizValidationError, setQuizValidationError] = useState("");
  const [savingQuiz, setSavingQuiz] = useState(false);

  useEffect(() => {
    loadSubPages();
  }, []);

  const loadSubPages = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getNursingTestBankSubPages();

      if (result.success && result.data) {
        setSubPages(result.data);

        // Load nested sub-pages for all sub-pages in parallel
        const allNestedSubPages: any[] = [];
        let totalTopics = 0;

        // Fetch all nested sub-pages in parallel using Promise.all
        const nestedSubPagesPromises = result.data.map(async (subPage) => {
          const subPageId = subPage.slug || subPage.id;
          const subPageDocId = subPage.id; // Keep the document ID for route mappings
          const subPageName =
            subPage.pageName ||
            subPage.hero?.title ||
            subPage.title ||
            subPage.id;
          const nestedResult = await getNursingTestBankNestedSubPages(
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
              pillarId: "nursing-test-bank",
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

        // Fetch all topics for all nested sub-pages in parallel
        const allTopics: any[] = [];
        const topicCountPromises = nestedWithSlugs.map(
          async (nestedSubPage) => {
            const nestedSubPageId = nestedSubPage.slug || nestedSubPage.id;
            const parentInfo = nestedSubPageMap.get(nestedSubPage.id);
            if (!parentInfo) return { count: 0, topics: [] };

            try {
              const topicsResult = await getNursingTestBankTopics(
                parentInfo.subPageId,
                nestedSubPageId
              );

              if (
                topicsResult.success &&
                topicsResult.data &&
                topicsResult.data.length > 0
              ) {
                // Add parent information to each topic
                const topicsWithParent = topicsResult.data.map(
                  (topic: any) => ({
                    ...topic,
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
                  })
                );
                allTopics.push(...topicsWithParent);
                return {
                  count: topicsResult.data.length,
                  topics: topicsWithParent,
                };
              }
            } catch (error) {
              console.error(
                `Error loading topics for ${nestedSubPageId}:`,
                error
              );
            }
            return { count: 0, topics: [] };
          }
        );

        const topicResults = await Promise.all(topicCountPromises);
        totalTopics = topicResults.reduce(
          (sum, result) => sum + result.count,
          0
        );

        console.log(
          "Total topics found:",
          totalTopics,
          "All topics:",
          allTopics
        );

        // Get route mapping slugs for all topics
        if (allTopics.length > 0) {
          // Group topics by nested sub-page for efficient route mapping queries
          const topicGroups = new Map<
            string,
            {
              topicIds: string[];
              subPageDocId: string;
              nestedSubPageDocId: string;
            }
          >();

          for (const topic of allTopics) {
            const key = `${topic.parentSubPageDocId}_${topic.nestedSubPageDocId}`;
            if (!topicGroups.has(key)) {
              topicGroups.set(key, {
                topicIds: [],
                subPageDocId: topic.parentSubPageDocId,
                nestedSubPageDocId: topic.nestedSubPageDocId,
              });
            }
            topicGroups.get(key)!.topicIds.push(topic.id);
          }

          // Fetch route mapping slugs for each group in parallel
          const topicSlugMapPromises = Array.from(topicGroups.entries()).map(
            async ([key, group]) => {
              try {
                const slugResult = await getRouteMappingSlugsByIds({
                  pillarId: "nursing-test-bank",
                  type: "topic",
                  ids: group.topicIds,
                  subPageId: group.subPageDocId,
                  nestedPageId: group.nestedSubPageDocId,
                });
                return slugResult.success && slugResult.slugMap
                  ? slugResult.slugMap
                  : {};
              } catch (error) {
                console.error(
                  `Error getting route mappings for topics in group ${key}:`,
                  error
                );
                return {};
              }
            }
          );

          const topicSlugMaps = await Promise.all(topicSlugMapPromises);
          const combinedTopicSlugMap: Record<string, string> = {};
          topicSlugMaps.forEach((map: Record<string, string>) => {
            Object.assign(combinedTopicSlugMap, map);
          });

          console.log("Topic slug map:", combinedTopicSlugMap);

          // Update topics with route mapping slugs
          const topicsWithSlugs = allTopics.map((topic) => {
            const routeSlug = combinedTopicSlugMap[topic.id];
            return {
              ...topic,
              slug: routeSlug || topic.slug || topic.id, // Prefer route mapping slug
            };
          });

          // Fetch question counts for all topics in parallel
          const questionCountPromises = topicsWithSlugs.map(async (topic) => {
            try {
              const questionCount = await countTopicQuestions(
                topic.parentSubPageId,
                topic.nestedSubPageId,
                topic.slug || topic.id
              );
              return { topicId: topic.id, questionCount };
            } catch (error) {
              console.error(
                `Error counting questions for topic ${topic.id}:`,
                error
              );
              return { topicId: topic.id, questionCount: 0 };
            }
          });

          const questionCounts = await Promise.all(questionCountPromises);
          const questionCountMap = new Map<string, number>();
          questionCounts.forEach(({ topicId, questionCount }) => {
            questionCountMap.set(topicId, questionCount);
          });

          // Add question counts to topics
          const topicsWithCounts = topicsWithSlugs.map((topic) => ({
            ...topic,
            questionCount: questionCountMap.get(topic.id) || 0,
          }));

          console.log("Topics with slugs and counts:", topicsWithCounts);
          setTopics(topicsWithCounts);

          // Fetch all quizzes for all topics in parallel
          const allQuizzes: any[] = [];
          const quizCountPromises = topicsWithCounts.map(async (topic) => {
            const topicId = topic.slug || topic.id;
            try {
              const quizzesResult = await getNursingTestBankQuizzes(
                topic.parentSubPageId,
                topic.nestedSubPageId,
                topicId
              );

              if (
                quizzesResult.success &&
                quizzesResult.data &&
                quizzesResult.data.length > 0
              ) {
                // Add parent information to each quiz
                const quizzesWithParent = quizzesResult.data.map(
                  (quiz: any) => ({
                    ...quiz,
                    parentSubPageId: topic.parentSubPageId, // slug for URL
                    parentSubPageDocId: topic.parentSubPageDocId, // document ID for route
                    parentSubPageName: topic.parentSubPageName,
                    nestedSubPageId: topic.nestedSubPageId, // slug for URL
                    nestedSubPageDocId: topic.nestedSubPageDocId, // document ID for route
                    nestedSubPageName: topic.nestedSubPageName,
                    topicId: topicId, // slug for URL
                    topicDocId: topic.id, // document ID for route
                    topicName:
                      topic.topicName ||
                      topic.pageName ||
                      topic.title ||
                      topic.name ||
                      topic.id,
                  })
                );
                allQuizzes.push(...quizzesWithParent);
                return {
                  count: quizzesResult.data.length,
                  quizzes: quizzesWithParent,
                };
              }
            } catch (error) {
              console.error(
                `Error loading quizzes for topic ${topicId}:`,
                error
              );
            }
            return { count: 0, quizzes: [] };
          });

          const quizResults = await Promise.all(quizCountPromises);
          const totalQuizzes = quizResults.reduce(
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
            // Group quizzes by topic for efficient route mapping queries
            const quizGroups = new Map<
              string,
              {
                quizIds: string[];
                subPageDocId: string;
                nestedSubPageDocId: string;
                topicDocId: string;
              }
            >();

            for (const quiz of allQuizzes) {
              const key = `${quiz.parentSubPageDocId}_${quiz.nestedSubPageDocId}_${quiz.topicDocId}`;
              if (!quizGroups.has(key)) {
                quizGroups.set(key, {
                  quizIds: [],
                  subPageDocId: quiz.parentSubPageDocId,
                  nestedSubPageDocId: quiz.nestedSubPageDocId,
                  topicDocId: quiz.topicDocId,
                });
              }
              quizGroups.get(key)!.quizIds.push(quiz.id);
            }

            // Fetch route mapping slugs for each group in parallel
            const quizSlugMapPromises = Array.from(quizGroups.entries()).map(
              async ([key, group]) => {
                try {
                  const slugResult = await getRouteMappingSlugsByIds({
                    pillarId: "nursing-test-bank",
                    type: "quiz",
                    ids: group.quizIds,
                    subPageId: group.subPageDocId,
                    nestedPageId: group.nestedSubPageDocId,
                    topicId: group.topicDocId,
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
                const questionCount = await countQuizQuestions(
                  quiz.parentSubPageId,
                  quiz.nestedSubPageId,
                  quiz.topicId,
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
            setQuizzesCount(totalQuizzes);
          } else {
            console.log("No quizzes found");
            setQuizzes([]);
            setQuizzesCount(0);
          }
        } else {
          console.log("No topics found");
          setTopics([]);
          setQuizzes([]);
          setQuizzesCount(0);
        }

        setNestedSubPages(nestedWithSlugs);
        setTopicsCount(totalTopics);

        // Fetch KB articles
        const kbResult = await getNursingTestBankKbArticles();
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

      const result = await deleteNursingTestBankSubPage(subPageToDelete.id);

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

      const result = await deleteNursingTestBankNestedSubPage(
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

  const handleDeleteTopicClick = (topic: any) => {
    setTopicToDelete(topic);
    setShowDeleteTopicModal(true);
  };

  const handleDeleteTopicConfirm = async () => {
    if (!topicToDelete) return;

    try {
      setDeletingTopic(true);
      setError("");
      setSuccess("");

      const result = await deleteNursingTestBankTopic(
        topicToDelete.parentSubPageId,
        topicToDelete.nestedSubPageId,
        topicToDelete.id
      );

      if (result.success) {
        setSuccess("Topic deleted successfully!");
        setShowDeleteTopicModal(false);
        setTopicToDelete(null);
        loadSubPages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete topic");
      }
    } catch (err) {
      setError("Failed to delete topic");
      console.error("Error deleting topic:", err);
    } finally {
      setDeletingTopic(false);
    }
  };

  const handleDeleteTopicCancel = () => {
    setShowDeleteTopicModal(false);
    setTopicToDelete(null);
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

      const result = await deleteNursingTestBankQuiz(
        quizToDelete.parentSubPageId,
        quizToDelete.nestedSubPageId,
        quizToDelete.topicId,
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

  const handleDeleteQuizCancel = () => {
    setShowDeleteQuizModal(false);
    setQuizToDelete(null);
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

      const result = await deleteNursingTestBankKbArticle(
        kbArticleToDelete.id
      );

      if (result.success) {
        setSuccess(
          `KB Article "${kbArticleToDelete.pageName || kbArticleToDelete.id}" deleted successfully!`
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

  const handleCreateKbArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setKbValidationError("");

    if (!newKbArticleId.trim() || !newKbArticleName.trim()) {
      setKbValidationError("Both KB Article ID and Name are required.");
      return;
    }

    if (!selectedSubPageForKb) {
      setKbValidationError("Please select a parent sub-page.");
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

      // Get the pillar page ID (nursing-test-bank)
      const pillarPageId = "nursing-test-bank";

      // Get default values from sub-page defaults (similar to nursing entrance exam)
      const selectedSubPage = subPages.find((sp) => sp.id === selectedSubPageForKb);
      const _defaultSlug = selectedSubPage?.slug || selectedSubPage?.id || "";

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

      const result = await uploadNursingTestBankKbArticle(
        normalizedKbArticleId,
        kbArticleData
      );

      if (result.success) {
        setSuccess(`KB Article "${newKbArticleName}" created successfully!`);
        setShowCreateKbModal(false);
        setNewKbArticleId("");
        setNewKbArticleName("");
        setSelectedSubPageForKb("");
        setKbValidationError("");
        loadSubPages();
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

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizValidationError("");

    if (!newQuizId.trim() || !newQuizName.trim()) {
      setQuizValidationError("Quiz ID and Name are required.");
      return;
    }

    if (!selectedTopicForQuiz) {
      setQuizValidationError("Topic is required.");
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
      const parentSubPageId = selectedTopicForQuiz.parentSubPageId;
      const nestedSubPageId = selectedTopicForQuiz.nestedSubPageId;
      const topicId = selectedTopicForQuiz.slug || selectedTopicForQuiz.id;
      const topicName =
        selectedTopicForQuiz.topicName ||
        selectedTopicForQuiz.pageName ||
        selectedTopicForQuiz.hero?.title ||
        selectedTopicForQuiz.title ||
        selectedTopicForQuiz.id;

      const defaultQuizContent = {
        pageName: newQuizName,
        slug: normalizedQuizId,
        meta: {
          title: `${newQuizName} | NursingMocks`,
          description: `Content for ${newQuizName} under ${topicName}.`,
          keywords: `${newQuizName}, ${topicName}, nursing test bank`,
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

      const result = await uploadNursingTestBankQuiz(
        parentSubPageId,
        nestedSubPageId,
        topicId,
        normalizedQuizId,
        defaultQuizContent
      );

      if (result.success) {
        setSuccess(`Quiz "${newQuizName}" created successfully!`);
        setShowCreateQuizModal(false);
        setSelectedTopicForQuiz(null);
        setNewQuizId("");
        setNewQuizName("");
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

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicValidationError("");

    if (!newTopicId.trim() || !newTopicName.trim()) {
      setTopicValidationError("Topic ID and Name are required.");
      return;
    }

    if (!selectedNestedSubPageForTopic) {
      setTopicValidationError("Nested sub-page is required.");
      return;
    }

    const normalizedTopicId = newTopicId.toLowerCase().replace(/\s+/g, "-");

    // Check if slug is taken across all levels
    const slugCheck = isSlugTaken(normalizedTopicId);
    if (slugCheck.taken) {
      setTopicValidationError(
        slugCheck.message ||
          `A page with slug "${normalizedTopicId}" already exists.`
      );
      return;
    }

    try {
      setSavingTopic(true);
      setError("");
      setSuccess("");

      // Use parentSubPageId (slug) for the function, as it resolves IDs internally
      const parentSubPageId = selectedNestedSubPageForTopic.parentSubPageId;
      const nestedSubPageId =
        selectedNestedSubPageForTopic.slug || selectedNestedSubPageForTopic.id;
      const nestedSubPageName =
        selectedNestedSubPageForTopic.pageName ||
        selectedNestedSubPageForTopic.hero?.title ||
        selectedNestedSubPageForTopic.title ||
        selectedNestedSubPageForTopic.id;

      const defaultTopicContent = {
        pageName: newTopicName,
        status: "Draft",
        heading: "",
        description: "",
        seoLabel: newTopicName,
        seoSlug: normalizedTopicId,
        createdAt: new Date().toISOString(),
        bodyContent: "",
        slug: normalizedTopicId,
        meta: {
          title: `${newTopicName} | NursingMocks`,
          description: `Content for ${newTopicName} under ${nestedSubPageName}.`,
          keywords: `${newTopicName}, ${nestedSubPageName}, nursing test bank`,
          ogTitle: `${newTopicName} | NursingMocks`,
          ogDescription: `Content for ${newTopicName}`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedTopicId}`,
        },
        schema: "",
        hero: {
          title: "",
          description: "",
        },
      };

      const result = await uploadNursingTestBankTopic(
        parentSubPageId,
        nestedSubPageId,
        normalizedTopicId,
        defaultTopicContent
      );

      if (result.success) {
        setSuccess(`Topic "${newTopicName}" created successfully!`);
        setShowCreateTopicModal(false);
        setSelectedNestedSubPageForTopic(null);
        setNewTopicId("");
        setNewTopicName("");
        setTopicValidationError("");
        loadSubPages(); // Reload to refresh topics
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setTopicValidationError(result.message || "Failed to create topic.");
      }
    } catch (err) {
      setTopicValidationError("Failed to create topic.");
      console.error("Error creating topic:", err);
    } finally {
      setSavingTopic(false);
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
          title: `${newNestedSubPageName} | NursingMocks`,
          description: `Content for ${newNestedSubPageName} under ${parentSubPageName}.`,
          keywords: `${newNestedSubPageName}, ${parentSubPageId}, nursing test bank`,
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

      const result = await uploadNursingTestBankNestedSubPage(
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
        examAccessProductId: "nursing_test_bank",
        status: "Published",
        heading: "",
        description: "",
        seoLabel: newSubPageName,
        seoSlug: normalizedSubPageId,
        createdAt: new Date().toISOString(),
        meta: {
          title: `${newSubPageName} | Nursing Test Bank`,
          description: `Content for ${newSubPageName} under Nursing Test Bank.`,
          keywords: `${newSubPageName}, nursing test bank`,
          ogTitle: `${newSubPageName} | Nursing Test Bank`,
          ogDescription: `Content for ${newSubPageName} under Nursing Test Bank.`,
          ogImage: "/nursing-mocks-logo.png",
          canonicalUrl: `${getSiteUrl()}/${normalizedSubPageId}`,
        },
        schema: "",
        bodyContent: "",
      };

      const result = await uploadNursingTestBankSubPage(
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
      <div className="min-h-screen bg-white overflow-x-hidden">
        <AdminSidebar />
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="admin-page flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <AdminLoadingState
              title="Loading nursing test bank content"
              description="Preparing sub pages, nested pages, KB articles, and quizzes."
            />
          </div>
        </div>
      </div>
    );
  }

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
            { label: "Nursing Test Bank" },
          ]}
          actions={
            currentUser ? (
              <UserProfileBadge />
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
                  className="admin-button-primary px-4 py-2 text-sm"
                >
                  Register
                </Link>
              </div>
            )
          }
        />

        <div className="admin-page">
          {/* Main Content */}
          <div className="admin-workspace admin-content-management-page">
            <AdminNotificationRegion
              error={error}
              success={success}
              errorTitle="Unable To Update Test Bank Content"
              successTitle="Test Bank Content Updated"
            />
            <AdminPageHeader
              eyebrow="Content Management"
              title="Nursing Test Bank"
              description="Manage the Nursing Test Bank hierarchy, including Sub Pages, Nested Sub Pages, Topics, Quiz Metadata, and Knowledge Base Articles."
              actions={
                <Link
                  href="/admin/nursing-test-bank/edit"
                  className="admin-button-secondary"
                >
                  Edit Main Page
                </Link>
              }
            />
            <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <AdminCard className="p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="admin-section-title">Structure Overview</h2>
                    <p className="admin-body mt-1">
                      Test Bank content follows a four-level structure before question records.
                    </p>
                  </div>
                  <span className="admin-badge admin-badge-purple">
                    Pillar / Sub Page / Nested Sub Page / Topic / Quiz
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <AdminInfoTile label="Main Pillar Page">Nursing Test Bank</AdminInfoTile>
                  <AdminInfoTile label="Sub Pages">
                    <AdminBadgeList
                      emptyLabel="No Sub Pages"
                      items={subPages.slice(0, 6).map((sp) => ({
                        label: sp.pageName || sp.hero?.title || sp.title || sp.id,
                        tone: "purple",
                      }))}
                    />
                  </AdminInfoTile>
                  <AdminInfoTile label="Nested Sub Pages">{nestedSubPages.length} total</AdminInfoTile>
                  <AdminInfoTile label="Topics">{topicsCount} linked topics</AdminInfoTile>
                  <AdminInfoTile label="Quiz Metadata">{quizzesCount} linked quizzes</AdminInfoTile>
                  <AdminInfoTile label="Knowledge Base Articles">{kbArticlesCount} articles</AdminInfoTile>
                </div>
              </AdminCard>
              <AdminCard className="p-4 sm:p-5">
                <div className="mb-4">
                  <h2 className="admin-section-title">Content Stats</h2>
                  <p className="admin-body mt-1">
                    Current records loaded for this Test Bank pillar.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminStatCard label="Sub Pages" value={subPages.length} />
                  <AdminStatCard label="Nested Sub Pages" value={nestedSubPages.length} />
                  <AdminStatCard label="Topics" value={topicsCount} />
                  <AdminStatCard label="Quiz Metadata" value={quizzesCount} />
                  <AdminStatCard label="Knowledge Base Articles" value={kbArticlesCount} />
                </div>
              </AdminCard>
            </div>
            <AdminTabs
              tabs={nursingTestBankAdminTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              label="Nursing Test Bank content sections"
            />

            {/* Sub Pages Table Card */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "18px 20px",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
                marginTop: "8px",
              }}
            >
              <AdminToolbar
                actions={
                  activeTab === "kb" ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateKbModal(true)}
                      className="admin-button-primary"
                    >
                      New Knowledge Base Article
                    </button>
                  ) : activeTab === "topics" ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateTopicModal(true)}
                      className="admin-button-primary"
                    >
                      New Topic
                    </button>
                  ) : activeTab === "quizzes" ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateQuizModal(true)}
                      className="admin-button-primary"
                    >
                      New Quiz Metadata
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="admin-button-primary"
                    >
                      {activeTab === "nested" ? "New Nested Sub Page" : "New Sub Page"}
                    </button>
                  )
                }
              >
                  <input
                    type="text"
                    placeholder={
                      activeTab === "nested"
                        ? "Search nested sub pages..."
                        : activeTab === "topics"
                        ? "Search topics..."
                        : activeTab === "quizzes"
                        ? "Search quiz metadata..."
                        : activeTab === "kb"
                        ? "Search Knowledge Base Articles..."
                        : "Search sub pages..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-input min-w-[220px]"
                  />
                  <select
                    value={examFilter}
                    onChange={(e) => setExamFilter(e.target.value)}
                    className="admin-input min-w-[180px]"
                  >
                    <option value="">All Sub Pages</option>
                    {uniqueSubPageNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-input min-w-[160px]"
                  >
                    <option value="">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
              </AdminToolbar>

              <AdminTable tableClassName="min-w-[960px]">
                  <thead>
                    <tr>
                      <th className="admin-table-heading min-w-[210px] px-4 py-3 text-left">
                        Title
                      </th>
                      <th className="admin-table-heading px-4 py-3 text-left">
                        Exam
                      </th>
                      <th className="admin-table-heading px-4 py-3 text-left">
                        Level
                      </th>
                      {(activeTab === "topics" || activeTab === "quizzes") && (
                        <th className="admin-table-heading px-4 py-3 text-left">
                          Questions
                        </th>
                      )}
                      <th className="admin-table-heading min-w-[180px] px-4 py-3 text-left">
                        URL slug
                      </th>
                      <th className="admin-table-heading px-4 py-3 text-left">
                        Status
                      </th>
                      <th className="admin-table-heading px-4 py-3 text-left">
                        Last updated
                      </th>
                      <th className="admin-table-heading min-w-[180px] px-4 py-3 text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "topics" ? (
                      (() => {
                        const filteredTopics = topics.filter((topic) => {
                          // Search filter
                          if (searchQuery) {
                            const name =
                              topic.topicName ||
                              topic.pageName ||
                              topic.title ||
                              topic.name ||
                              topic.id;
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
                                sp.id === topic.parentSubPageDocId ||
                                sp.slug === topic.parentSubPageId ||
                                sp.id === topic.parentSubPageId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : topic.parentSubPageName ||
                                topic.parentSubPageId;

                            // Compare exact match with filter value
                            if (examName !== examFilter) {
                              return false;
                            }
                          }

                          // Status filter
                          if (statusFilter) {
                            // For now, all topics are published, but check if status field exists
                            const status = topic.status || "published";
                            if (statusFilter !== status.toLowerCase()) {
                              return false;
                            }
                          }

                          return true;
                        });
                        const sortedTopics = [...filteredTopics].sort(
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
                        const startIndex = (topicsPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedTopics = sortedTopics.slice(
                          startIndex,
                          endIndex
                        );

                        return sortedTopics.length === 0 ? (
                          <AdminTableEmptyState
                            colSpan={8}
                            title="No Topics Found"
                            description="Create a Topic from a Nested Sub Page row or adjust the current filters."
                          />
                        ) : (
                          paginatedTopics.map((topic) => {
                            const topicName =
                              topic.topicName ||
                              topic.pageName ||
                              topic.title ||
                              topic.name ||
                              topic.id;
                            const lastUpdated = topic.lastUpdated
                              ? new Date(topic.lastUpdated).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                ) +
                                " - " +
                                new Date(topic.lastUpdated).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "N/A";

                            // Get sub-page name from subPages array
                            const parentSubPage = subPages.find(
                              (sp) =>
                                sp.id === topic.parentSubPageDocId ||
                                sp.slug === topic.parentSubPageId ||
                                sp.id === topic.parentSubPageId
                            );
                            const examName = parentSubPage
                              ? parentSubPage.pageName ||
                                parentSubPage.hero?.title ||
                                parentSubPage.title ||
                                parentSubPage.id
                              : topic.parentSubPageName ||
                                topic.parentSubPageId;

                            return (
                              <tr key={topic.id}>
                                <AdminTableCell className="min-w-[210px]">
                                  <span
                                    className="admin-table-title-truncate"
                                    title={topicName}
                                  >
                                    {topicName}
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
                                  Topic
                                </AdminTableCell>
                                <AdminTableCell>
                                  {topic.questionCount !== undefined
                                    ? topic.questionCount
                                    : "N/A"}
                                </AdminTableCell>
                                <AdminTableCell className="min-w-[180px]" mono>
                                  <span
                                    className="admin-table-slug-truncate"
                                    title={`/${topic.slug || topic.id}`}
                                  >
                                    /{topic.slug || topic.id}
                                  </span>
                                </AdminTableCell>
                                <AdminTableCell>
                                  <AdminStatusBadge label={topic.status || "Published"} />
                                </AdminTableCell>
                                <AdminTableCell>
                                  {lastUpdated}
                                </AdminTableCell>
                                <AdminTableCell>
                                  <div className="admin-crud-actions">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTopicForQuiz(topic);
                                        setShowCreateQuizModal(true);
                                      }}
                                      className="admin-crud-button admin-crud-button-primary"
                                    >
                                      Add
                                    </button>
                                    <Link
                                      href={`/admin/nursing-test-bank/${topic.parentSubPageId}/nested/${topic.nestedSubPageId}/topics/${topic.id}`}
                                      className="admin-crud-button admin-crud-button-secondary"
                                    >
                                      Edit
                                    </Link>
                                    <Link
                                      href={`/${topic.slug || topic.id}`}
                                      target="_blank"
                                      className="admin-crud-button admin-crud-button-neutral"
                                    >
                                      View
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteTopicClick(topic)
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
                    ) : activeTab === "quizzes" ? (
                      (() => {
                        const filteredQuizzes = quizzes.filter((quiz) => {
                          // Search filter
                          if (searchQuery) {
                            const name =
                              quiz.pageName ||
                              quiz.hero?.title ||
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
                          <AdminTableEmptyState
                            colSpan={8}
                            title="No Quiz Metadata Found"
                            description="Create Quiz Metadata from a Topic row or adjust the current filters."
                          />
                        ) : (
                          paginatedQuizzes.map((quiz) => {
                            const quizName =
                              quiz.pageName ||
                              quiz.hero?.title ||
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
                                " - " +
                                new Date(quiz.lastUpdated).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
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
                              : quiz.parentSubPageName || quiz.parentSubPageId;

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
                                  {quiz.questionCount || 0}
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
                                      href={`/admin/nursing-test-bank/${
                                        quiz.parentSubPageId
                                      }/nested/${quiz.nestedSubPageId}/topics/${
                                        quiz.topicId
                                      }/quizzes/${quiz.slug || quiz.id}/manage`}
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
                    ) : activeTab === "kb" ? (
                      (() => {
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
                            description="Create a Knowledge Base Article when this test bank area needs supporting student-facing content."
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
                                " - " +
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
                                      href={`/admin/nursing-test-bank/kb-articles/${
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
                          <AdminTableEmptyState
                            colSpan={7}
                            title="No Nested Sub Pages Found"
                            description="Create a Nested Sub Page from a Sub Page row or adjust the current filters."
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
                                " - " +
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
                                        setSelectedNestedSubPageForTopic(
                                          nestedSubPage
                                        );
                                        setShowCreateTopicModal(true);
                                      }}
                                      className="admin-crud-button admin-crud-button-primary"
                                    >
                                      Add
                                    </button>
                                    <Link
                                      href={`/admin/nursing-test-bank/${nestedSubPage.parentSubPageId}/nested/${nestedSubPage.id}`}
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
                        description="Create a Sub Page to get started."
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
                              " - " +
                              new Date(subPage.lastUpdated).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A";

                          return (
                            <tr key={subPage.id}>
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
                                    href={`/admin/nursing-test-bank/${subPage.id}`}
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

              {activeTab === "nested" && (
                <AdminPagination
                  currentPage={nestedSubPagesPage}
                  totalItems={filteredNestedSubPagesCount}
                  itemsPerPage={itemsPerPage}
                  itemLabel="Nested Sub Pages"
                  onPageChange={setNestedSubPagesPage}
                />
              )}
              {activeTab === "topics" && (
                <AdminPagination
                  currentPage={topicsPage}
                  totalItems={filteredTopicsCount}
                  itemsPerPage={itemsPerPage}
                  itemLabel="Topics"
                  onPageChange={setTopicsPage}
                />
              )}
              {activeTab === "quizzes" && (
                <AdminPagination
                  currentPage={quizzesPage}
                  totalItems={filteredQuizzesCount}
                  itemsPerPage={itemsPerPage}
                  itemLabel="Quiz Metadata"
                  onPageChange={setQuizzesPage}
                />
              )}
              {activeTab === "kb" && (
                <AdminPagination
                  currentPage={kbArticlesPage}
                  totalItems={filteredKbArticlesCount}
                  itemsPerPage={itemsPerPage}
                  itemLabel="Knowledge Base Articles"
                  onPageChange={setKbArticlesPage}
                />
              )}

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
                    Nested sub pages live under their parent sub pages. Each
                    nested sub page can have its own topics and content.
                  </>
                ) : activeTab === "topics" ? (
                  <>
                    Topics are linked to nested sub pages. Each topic contains
                    its own questions stored in the question bank. You can
                    manage topic questions from the Edit action.
                  </>
                ) : (
                  <>
                    Sub pages represent main categories. Nested sub pages live
                    under those sub pages. Topics are managed under the Topics
                    tab, and each topic contains its own questions stored in the
                    question bank.
                  </>
                )}
              </div>
            </div>
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
              confirmLabel="Delete Sub Page"
              confirming={deleting}
              onCancel={handleDeleteCancel}
              onConfirm={handleDeleteConfirm}
            />
          )}

                    {/* Create Sub-page Modal */}
          {showCreateModal && (
            <AdminModal
              title="Create New Sub Page"
              description="Add a top-level Nursing Test Bank category."
            >
              <form onSubmit={handleCreateSubPage} className="space-y-4">
                {validationError && (
                  <AdminValidationMessage>{validationError}</AdminValidationMessage>
                )}
                <AdminFieldGroup
                  label="Sub Page Name"
                  required
                  helper="The display name for this sub page."
                >
                  <input
                    type="text"
                    value={newSubPageName}
                    onChange={(e) => setNewSubPageName(e.target.value)}
                    className="admin-field"
                    placeholder="e.g., Math Review, Reading Strategies"
                    required
                  />
                </AdminFieldGroup>
                <AdminFieldGroup label="Exam Access Product">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-sm font-semibold text-gray-950">
                      {contentAccessProductLabel("nursing_test_bank")}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      All Nursing Test Bank content is unlocked by the Nursing Test Bank access product.
                    </p>
                  </div>
                </AdminFieldGroup>
                <AdminFieldGroup
                  label="Slug URL"
                  required
                  helper={<>This will create a page at /{newSubPageId || "sub-page-id"}</>}
                >
                  <AdminSlugField
                    origin={getSiteUrl()}
                    value={newSubPageId}
                    onChange={(value) => setNewSubPageId(value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="e.g., math-review"
                    required
                  />
                </AdminFieldGroup>
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

                    {/* Create Nested Sub-page Modal */}
          {showCreateNestedModal && selectedSubPageForNested && (
            <AdminModal
              title="Create New Nested Sub Page"
              description="Add a child page under the selected Nursing Test Bank Sub Page."
            >
              <form onSubmit={handleCreateNestedSubPage} className="space-y-4">
                {nestedValidationError && (
                  <AdminValidationMessage>{nestedValidationError}</AdminValidationMessage>
                )}
                <AdminFieldGroup
                  label="Nested Sub Page Name"
                  required
                  helper="The display name for this nested sub page."
                >
                  <input
                    type="text"
                    value={newNestedSubPageName}
                    onChange={(e) => setNewNestedSubPageName(e.target.value)}
                    className="admin-field"
                    placeholder="e.g., Medical-Surgical Nursing, Pediatric Nursing"
                    required
                  />
                </AdminFieldGroup>
                <AdminFieldGroup
                  label="Slug URL"
                  required
                  helper={<>This will create a page at /{newNestedSubPageId || "nested-sub-page-id"}</>}
                >
                  <AdminSlugField
                    origin={getSiteUrl()}
                    value={newNestedSubPageId}
                    onChange={(value) => setNewNestedSubPageId(value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="e.g., medical-surgical-nursing"
                    required
                  />
                </AdminFieldGroup>
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

                    {/* Create Topic Modal */}
          {showCreateTopicModal && selectedNestedSubPageForTopic && (
            <AdminModal
              title="Create New Topic"
              description="Add a topic under the selected Nursing Test Bank nested page."
            >
              <form onSubmit={handleCreateTopic} className="space-y-4">
                {topicValidationError && (
                  <AdminValidationMessage>{topicValidationError}</AdminValidationMessage>
                )}
                <AdminFieldGroup
                  label="Topic Name"
                  required
                  helper="The display name for this topic."
                >
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="admin-field"
                    placeholder="e.g., Cardiovascular System, Respiratory System"
                    required
                  />
                </AdminFieldGroup>
                <AdminFieldGroup
                  label="Slug URL"
                  required
                  helper={<>This will create a page at /{newTopicId || "topic-id"}</>}
                >
                  <AdminSlugField
                    origin={getSiteUrl()}
                    value={newTopicId}
                    onChange={(value) => setNewTopicId(value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="e.g., cardiovascular-system"
                    required
                  />
                </AdminFieldGroup>
                <AdminModalFooter>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTopicModal(false);
                      setSelectedNestedSubPageForTopic(null);
                      setNewTopicId("");
                      setNewTopicName("");
                      setTopicValidationError("");
                    }}
                    className="admin-button-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTopic}
                    className="admin-button-primary"
                  >
                    {savingTopic ? "Creating..." : "Create Topic"}
                  </button>
                </AdminModalFooter>
              </form>
            </AdminModal>
          )}

          {/* Delete Nested Sub-page Modal */}
          {showDeleteNestedModal && nestedSubPageToDelete && (
            <AdminDestructiveDialog
              title="Delete Nested Sub Page"
              itemName={
                nestedSubPageToDelete.pageName ||
                nestedSubPageToDelete.hero?.title ||
                nestedSubPageToDelete.title ||
                nestedSubPageToDelete.id
              }
              confirmLabel="Delete Nested Sub Page"
              confirming={deletingNested}
              onCancel={handleDeleteNestedCancel}
              onConfirm={handleDeleteNestedConfirm}
            />
          )}

          {/* Delete Topic Modal */}
          {showDeleteTopicModal && topicToDelete && (
            <AdminDestructiveDialog
              title="Delete Topic"
              itemName={
                topicToDelete.topicName ||
                topicToDelete.pageName ||
                topicToDelete.title ||
                topicToDelete.name ||
                topicToDelete.id
              }
              confirmLabel="Delete Topic"
              confirming={deletingTopic}
              onCancel={handleDeleteTopicCancel}
              onConfirm={handleDeleteTopicConfirm}
            />
          )}

          {/* Create Quiz Modal */}
          {showCreateQuizModal && (
            <AdminModal
              title="Create New Quiz Metadata"
              description="Create quiz metadata under a Nursing Test Bank topic."
            >
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                {quizValidationError && (
                  <AdminValidationMessage>{quizValidationError}</AdminValidationMessage>
                )}
                {!selectedTopicForQuiz && (
                  <AdminFieldGroup label="Topic" helper="Select the topic this quiz metadata belongs to.">
                    <select
                      value={
                        selectedTopicForQuiz
                          ? `${selectedTopicForQuiz.parentSubPageId}_${
                              selectedTopicForQuiz.nestedSubPageId
                            }_${
                              selectedTopicForQuiz.slug ||
                              selectedTopicForQuiz.id
                            }`
                          : ""
                      }
                      onChange={(e) => {
                        const [parentId, nestedId, topicId] = e.target.value.split("_");
                        const topic = topics.find(
                          (t) =>
                            t.parentSubPageId === parentId &&
                            t.nestedSubPageId === nestedId &&
                            (t.slug === topicId || t.id === topicId)
                        );
                        if (topic) {
                          setSelectedTopicForQuiz(topic);
                        }
                      }}
                      className="admin-field"
                    >
                      <option value="">Select a topic...</option>
                      {topics.map((topic) => {
                        const topicName =
                          topic.topicName ||
                          topic.pageName ||
                          topic.title ||
                          topic.name ||
                          topic.id;
                        return (
                          <option
                            key={`${topic.parentSubPageId}_${
                              topic.nestedSubPageId
                            }_${topic.slug || topic.id}`}
                            value={`${topic.parentSubPageId}_${
                              topic.nestedSubPageId
                            }_${topic.slug || topic.id}`}
                          >
                            {topicName} (under {topic.parentSubPageName} - {topic.nestedSubPageName})
                          </option>
                        );
                      })}
                    </select>
                  </AdminFieldGroup>
                )}
                <AdminFieldGroup
                  label="Quiz Name"
                  required
                  helper="The display name for this quiz metadata record."
                >
                  <input
                    type="text"
                    value={newQuizName}
                    onChange={(e) => setNewQuizName(e.target.value)}
                    className="admin-field"
                    placeholder="e.g., Cardiovascular Quiz, Respiratory Quiz"
                    required
                  />
                </AdminFieldGroup>
                <AdminFieldGroup
                  label="Slug URL"
                  required
                  helper={<>This will create a page at /{newQuizId || "quiz-id"}</>}
                >
                  <AdminSlugField
                    origin={getSiteUrl()}
                    value={newQuizId}
                    onChange={(value) => setNewQuizId(value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="e.g., cardiovascular-quiz"
                    required
                  />
                </AdminFieldGroup>
                <AdminModalFooter>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateQuizModal(false);
                      setSelectedTopicForQuiz(null);
                      setNewQuizId("");
                      setNewQuizName("");
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
                    {savingQuiz ? "Creating..." : "Create Quiz Metadata"}
                  </button>
                </AdminModalFooter>
              </form>
            </AdminModal>
          )}

          {/* Delete Quiz Modal */}
          {showDeleteQuizModal && quizToDelete && (
            <AdminDestructiveDialog
              title="Delete Quiz Metadata"
              itemName={
                quizToDelete.pageName ||
                quizToDelete.hero?.title ||
                quizToDelete.title ||
                quizToDelete.name ||
                quizToDelete.id
              }
              confirmLabel="Delete Quiz Metadata"
              confirming={deletingQuiz}
              onCancel={handleDeleteQuizCancel}
              onConfirm={handleDeleteQuizConfirm}
            />
          )}

          {/* Delete KB Article Modal */}
          {showDeleteKbModal && kbArticleToDelete && (
            <AdminDestructiveDialog
              title="Delete Knowledge Base Article"
              itemName={
                kbArticleToDelete.pageName ||
                kbArticleToDelete.title ||
                kbArticleToDelete.id
              }
              confirmLabel="Delete Knowledge Base Article"
              confirming={deletingKb}
              onCancel={handleDeleteKbCancel}
              onConfirm={handleDeleteKbArticle}
            />
          )}

          {/* Create KB Article Modal */}
          {showCreateKbModal && (
            <AdminModal
              title="Create New Knowledge Base Article"
              description="Create a supporting article under a Nursing Test Bank Sub Page."
            >
              <form onSubmit={handleCreateKbArticle} className="space-y-4">
                {kbValidationError && (
                  <AdminValidationMessage>{kbValidationError}</AdminValidationMessage>
                )}
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
                    onChange={(e) => setNewKbArticleName(e.target.value)}
                    className="admin-field"
                    placeholder="e.g., How to Study for Nursing Test Bank Questions"
                    required
                  />
                </AdminFieldGroup>
                <AdminFieldGroup
                  label="Slug URL"
                  required
                  helper={<>This will create a page at /{newKbArticleId || "knowledge-base-article-id"}</>}
                >
                  <AdminSlugField
                    origin={getSiteUrl()}
                    value={newKbArticleId}
                    onChange={(value) => setNewKbArticleId(value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="e.g., how-to-study-nursing-test-bank-questions"
                    required
                  />
                </AdminFieldGroup>
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
        </div>
      </div>
    </div>
  );
}

export default function NursingTestBankAdminPage() {
  return (
    <SidebarProvider>
      <NursingTestBankAdminPageContent />
    </SidebarProvider>
  );
}
