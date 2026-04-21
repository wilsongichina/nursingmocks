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

function NursingTestBankAdminPageContent() {
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

  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<any | null>(
    null
  );
  const [newQuizId, setNewQuizId] = useState("");
  const [newQuizName, setNewQuizName] = useState("");
  const [newQuizSetNumber, setNewQuizSetNumber] = useState("");
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
        setNumber: newQuizSetNumber ? Number(newQuizSetNumber) : undefined,
        meta: {
          title: `${newQuizName} | TeasGurus`,
          description: `Content for ${newQuizName} under ${topicName}.`,
          keywords: `${newQuizName}, ${topicName}, nursing test bank`,
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
          title: `${newTopicName} | TeasGurus`,
          description: `Content for ${newTopicName} under ${nestedSubPageName}.`,
          keywords: `${newTopicName}, ${nestedSubPageName}, nursing test bank`,
          ogTitle: `${newTopicName} | TeasGurus`,
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
          title: `${newNestedSubPageName} | TeasGurus`,
          description: `Content for ${newNestedSubPageName} under ${parentSubPageName}.`,
          keywords: `${newNestedSubPageName}, ${parentSubPageId}, nursing test bank`,
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
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sub-pages...</p>
            </div>
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
        {/* Desktop: Show header bar with breadcrumbs - same as pillar pages */}
        <div
          className="hidden md:block h-16"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderBottom: "1px solid #d9def3",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex justify-between items-center px-8 h-full">
            {/* Breadcrumbs */}
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
              <span className="font-medium">Nursing Test Bank</span>
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

        <div
          className="min-h-screen"
          style={{
            background:
              "linear-gradient(135deg, #f0f4ff 0%, #e8edff 50%, #f0f4ff 100%)",
          }}
        >
          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Alerts */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    color: "#111827",
                  }}
                >
                  Nursing Test Bank – Admin
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    maxWidth: "520px",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  Manage the main pillar page, sub pages, nested sub pages, and
                  topics for Nursing Test Bank. Use this panel to add, edit, and
                  organize content.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    borderRadius: "999px",
                    padding: "8px 14px",
                    fontSize: "13px",
                    border: "1px solid #4f46e5",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#4338ca";
                    e.currentTarget.style.borderColor = "#4338ca";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#4f46e5";
                    e.currentTarget.style.borderColor = "#4f46e5";
                  }}
                >
                  + New Sub Page
                </button>
              </div>
            </div>

            {/* Overview Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              {/* Structure Overview Card */}
              <div
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
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    Test Bank pillar → Sub Pages → Nested → Topics
                  </span>
                </div>
                <div
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
                      Nursing Test Bank
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
                        Linked Topics:
                      </span>{" "}
                      {topicsCount > 0
                        ? `${topicsCount} topic${
                            topicsCount !== 1 ? "s" : ""
                          } (each topic links to its own questions in the question bank)`
                        : "None (each topic links to its own questions in the question bank)"}
                    </li>
                    <li style={{ margin: "4px 0" }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>
                        KB:
                      </span>{" "}
                      Knowledge base articles linked from this pillar
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
                </div>
              </div>

              {/* Content Stats Card */}
              <div
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
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                  >
                    For Nursing Test Bank
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
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
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
                  </div>
                  <div
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
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
                  </div>
                  <div
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
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
                      Linked topics
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        marginBottom: "2px",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        color: "#111827",
                      }}
                    >
                      {topicsCount}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
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
                  <div
                    style={{
                      padding: "12px 12px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #f9fafb 0%, #f5f5ff 60%, #eef2ff 100%)",
                      border: "1px dashed #e2e4f0",
                    }}
                  >
                    <div
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
                      KB Articles
                    </div>
                    <div
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
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}
                    >
                      {kbArticlesCount > 0
                        ? `${kbArticlesCount} article${
                            kbArticlesCount !== 1 ? "s" : ""
                          } linked`
                        : "No articles linked"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <button
                onClick={() => setActiveTab("sub-pages")}
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
                onClick={() => setActiveTab("topics")}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border:
                    activeTab === "topics"
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                  cursor: "pointer",
                  color: activeTab === "topics" ? "#4338ca" : "#6b7280",
                  background:
                    activeTab === "topics" ? "#eef2ff" : "transparent",
                  fontWeight: activeTab === "topics" ? 500 : 400,
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Topics
              </button>
              <button
                onClick={() => setActiveTab("kb")}
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
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    placeholder={
                      activeTab === "nested"
                        ? "Search nested sub pages..."
                        : activeTab === "topics"
                        ? "Search topics..."
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
                      style={{
                        borderRadius: "999px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#ffffff",
                        color: "#111827",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f3f4ff";
                        e.currentTarget.style.borderColor = "#c7d2fe";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      + New KB Article
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        borderRadius: "999px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#ffffff",
                        color: "#111827",
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f3f4ff";
                        e.currentTarget.style.borderColor = "#c7d2fe";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
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
                style={{
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  background: "#ffffff",
                  overflowX: "auto",
                }}
              >
                <table
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
                      {(activeTab === "topics" || activeTab === "quizzes") && (
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
                          <tr>
                            <td
                              colSpan={8}
                              style={{
                                padding: "40px 12px",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              No topics found.
                            </td>
                          </tr>
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
                                " · " +
                                new Date(topic.lastUpdated).toLocaleTimeString(
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
                                  {topicName}
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
                                  Topic
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
                                  {topic.questionCount !== undefined
                                    ? topic.questionCount
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
                                  /{topic.slug || topic.id}
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
                                        setSelectedTopicForQuiz(topic);
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
                                      href={`/admin/nursing-test-bank/${topic.parentSubPageId}/nested/${topic.nestedSubPageId}/topics/${topic.id}`}
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
                                      href={`/${topic.slug || topic.id}`}
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
                                        handleDeleteTopicClick(topic)
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
                          <tr>
                            <td
                              colSpan={6}
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
                                  {quiz.questionCount || 0}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                    minWidth: "180px",
                                  }}
                                >
                                  {quiz.slug || quiz.id}
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
                                      padding: "2px 8px",
                                      borderRadius: "999px",
                                      background: "#d1fae5",
                                      color: "#065f46",
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
                                    color: "#6b7280",
                                    whiteSpace: "nowrap",
                                    fontSize: "12px",
                                  }}
                                >
                                  {lastUpdated}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    borderBottom: "1px solid #f3f4f6",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "12px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Link
                                      href={`/admin/nursing-test-bank/${
                                        quiz.parentSubPageId
                                      }/nested/${quiz.nestedSubPageId}/topics/${
                                        quiz.topicId
                                      }/quizzes/${quiz.slug || quiz.id}/manage`}
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
                                      href={`/${kbArticle.slug || kbArticle.id}`}
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
                                      href={`/admin/nursing-test-bank/kb-articles/${
                                        kbArticle.id
                                      }`}
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
                                        setSelectedNestedSubPageForTopic(
                                          nestedSubPage
                                        );
                                        setShowCreateTopicModal(true);
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
                                      href={`/admin/nursing-test-bank/${nestedSubPage.parentSubPageId}/nested/${nestedSubPage.id}`}
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
                                    href={`/admin/nursing-test-bank/${subPage.id}`}
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
                activeTab === "topics" ||
                activeTab === "quizzes" ||
                activeTab === "kb") &&
                (() => {
                  if (activeTab === "kb") {
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
                                kbArticlesPage === 1 ? "#f9fafb" : "transparent",
                              color: kbArticlesPage === 1 ? "#9ca3af" : "#6b7280",
                              cursor:
                                kbArticlesPage === 1 ? "not-allowed" : "pointer",
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
                                e.currentTarget.style.background = "transparent";
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
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  } else if (activeTab === "topics") {
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
                          : topic.parentSubPageName || topic.parentSubPageId;

                        // Compare exact match with filter value
                        if (examName !== examFilter) {
                          return false;
                        }
                      }

                      // Status filter
                      if (statusFilter) {
                        const status = topic.status || "published";
                        if (statusFilter !== status.toLowerCase()) {
                          return false;
                        }
                      }

                      return true;
                    });
                    const sortedTopics = [...filteredTopics].sort((a, b) => {
                      const dateA = a.lastUpdated
                        ? new Date(a.lastUpdated).getTime()
                        : 0;
                      const dateB = b.lastUpdated
                        ? new Date(b.lastUpdated).getTime()
                        : 0;
                      return dateB - dateA; // Descending order (newest first)
                    });
                    const totalPages = Math.ceil(
                      sortedTopics.length / itemsPerPage
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
                          Showing {(topicsPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            topicsPage * itemsPerPage,
                            sortedTopics.length
                          )}{" "}
                          of {sortedTopics.length} topics
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
                              setTopicsPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={topicsPage === 1}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border:
                                topicsPage === 1
                                  ? "1px solid #e5e7eb"
                                  : "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                topicsPage === 1 ? "#f9fafb" : "transparent",
                              color: topicsPage === 1 ? "#9ca3af" : "#6b7280",
                              cursor:
                                topicsPage === 1 ? "not-allowed" : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (topicsPage !== 1) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (topicsPage !== 1) {
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
                                (page >= topicsPage - 1 &&
                                  page <= topicsPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setTopicsPage(page)}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "13px",
                                      border:
                                        topicsPage === page
                                          ? "1px solid #c7d2fe"
                                          : "1px solid transparent",
                                      borderRadius: "999px",
                                      background:
                                        topicsPage === page
                                          ? "#eef2ff"
                                          : "transparent",
                                      color:
                                        topicsPage === page
                                          ? "#4338ca"
                                          : "#6b7280",
                                      cursor: "pointer",
                                      fontFamily:
                                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                      fontWeight:
                                        topicsPage === page ? 500 : 400,
                                      minWidth: "36px",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (topicsPage !== page) {
                                        e.currentTarget.style.background =
                                          "#eef2ff";
                                        e.currentTarget.style.borderColor =
                                          "#c7d2fe";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (topicsPage !== page) {
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
                                page === topicsPage - 2 ||
                                page === topicsPage + 2
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
                              setTopicsPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={topicsPage === totalPages}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              border:
                                topicsPage === totalPages
                                  ? "1px solid #e5e7eb"
                                  : "1px solid #e5e7eb",
                              borderRadius: "999px",
                              background:
                                topicsPage === totalPages
                                  ? "#f9fafb"
                                  : "transparent",
                              color:
                                topicsPage === totalPages
                                  ? "#9ca3af"
                                  : "#6b7280",
                              cursor:
                                topicsPage === totalPages
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (topicsPage !== totalPages) {
                                e.currentTarget.style.background = "#eef2ff";
                                e.currentTarget.style.borderColor = "#c7d2fe";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (topicsPage !== totalPages) {
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
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Delete Sub-page
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  Are you sure you want to delete the sub-page{" "}
                  <span className="font-semibold text-gray-900">
                    "
                    {subPageToDelete.pageName ||
                      subPageToDelete.hero?.title ||
                      subPageToDelete.title ||
                      subPageToDelete.id}
                    "
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

          {/* Create Sub-page Modal */}
          {showCreateModal && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[520px] mx-auto my-auto"
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">{validationError}</p>
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
                          placeholder="e.g., math-review"
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
                      style={{
                        borderRadius: "999px",
                        border: "1px solid #e5e7eb",
                        padding: "11px 18px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#ffffff",
                        color: "#374151",
                        transition: "background 0.15s, transform 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 18px",
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

          {/* Create Nested Sub-page Modal */}
          {showCreateNestedModal && selectedSubPageForNested && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[520px] mx-auto my-auto"
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
                    Create New Nested Sub-page
                  </h2>
                </div>
                <form onSubmit={handleCreateNestedSubPage}>
                  {nestedValidationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
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
                        placeholder="e.g., Medical-Surgical Nursing, Pediatric Nursing"
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
                          placeholder="e.g., medical-surgical-nursing"
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

          {/* Create Topic Modal */}
          {showCreateTopicModal && selectedNestedSubPageForTopic && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[520px] mx-auto my-auto"
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
                    Create New Topic
                  </h2>
                </div>
                <form onSubmit={handleCreateTopic}>
                  {topicValidationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
                        {topicValidationError}
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
                          Topic Name
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
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
                        placeholder="e.g., Cardiovascular System, Respiratory System"
                        required
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        The display name for this topic.
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
                          value={newTopicId}
                          onChange={(e) =>
                            setNewTopicId(
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
                          placeholder="e.g., cardiovascular-system"
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
                        This will create a topic at /{newTopicId || "topic-id"}
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
                        setShowCreateTopicModal(false);
                        setSelectedNestedSubPageForTopic(null);
                        setNewTopicId("");
                        setNewTopicName("");
                        setTopicValidationError("");
                      }}
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
                      disabled={savingTopic}
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: savingTopic ? "not-allowed" : "pointer",
                        background: savingTopic ? "#9ca3af" : "#4f46e5",
                        color: "#ffffff",
                        boxShadow: savingTopic
                          ? "none"
                          : "0 10px 24px rgba(79, 70, 229, 0.45)",
                        transition: "background 0.15s, transform 0.08s",
                        opacity: savingTopic ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!savingTopic) {
                          e.currentTarget.style.background = "#4338ca";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!savingTopic) {
                          e.currentTarget.style.background = "#4f46e5";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {savingTopic ? "Creating..." : "Create Topic"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Nested Sub-page Modal */}
          {showDeleteNestedModal && nestedSubPageToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[460px] mx-auto my-auto"
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
                  Delete Nested Sub-page
                </h2>
                <p
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

          {/* Delete Topic Modal */}
          {showDeleteTopicModal && topicToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[460px] mx-auto my-auto"
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
                  Delete Topic
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "18px",
                  }}
                >
                  Are you sure you want to delete the topic{" "}
                  <strong>
                    "
                    {topicToDelete.topicName ||
                      topicToDelete.pageName ||
                      topicToDelete.title ||
                      topicToDelete.name ||
                      topicToDelete.id}
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
                    onClick={handleDeleteTopicCancel}
                    disabled={deletingTopic}
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingTopic ? "not-allowed" : "pointer",
                      background: "#ffffff",
                      color: "#111827",
                      boxShadow: "0 3px 8px rgba(148, 163, 184, 0.25)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingTopic ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingTopic) {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingTopic) {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTopicConfirm}
                    disabled={deletingTopic}
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid transparent",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingTopic ? "not-allowed" : "pointer",
                      background: deletingTopic ? "#9ca3af" : "#ef4444",
                      color: "#ffffff",
                      boxShadow: deletingTopic
                        ? "none"
                        : "0 10px 24px rgba(239, 68, 68, 0.45)",
                      transition: "background 0.15s, transform 0.08s",
                      opacity: deletingTopic ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingTopic) {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!deletingTopic) {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {deletingTopic ? (
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

          {/* Create Quiz Modal */}
          {showCreateQuizModal && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[520px] mx-auto my-auto"
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
                    Create New Quiz
                  </h2>
                </div>
                <form onSubmit={handleCreateQuiz}>
                  {quizValidationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
                        {quizValidationError}
                      </p>
                    </div>
                  )}
                  <div style={{ marginBottom: "18px" }}>
                    {!selectedTopicForQuiz && (
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
                              color: "#374151",
                            }}
                          >
                            Topic
                          </label>
                        </div>
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
                            const [parentId, nestedId, topicId] =
                              e.target.value.split("_");
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
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #e5e7eb",
                            fontSize: "14px",
                            background: "#ffffff",
                            color: "#111827",
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            cursor: "pointer",
                          }}
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
                                {topicName} (under {topic.parentSubPageName} →{" "}
                                {topic.nestedSubPageName})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
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
                        placeholder="e.g., Cardiovascular Quiz, Respiratory Quiz"
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
                          placeholder="e.g., cardiovascular-quiz"
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
                        This will create a page at /{newQuizId || "quiz-id"}
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
                        setSelectedTopicForQuiz(null);
                        setNewQuizId("");
                        setNewQuizName("");
                        setNewQuizSetNumber("");
                        setQuizValidationError("");
                      }}
                      style={{
                        borderRadius: "999px",
                        border: "1px solid #e5e7eb",
                        padding: "11px 18px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#ffffff",
                        color: "#374151",
                        transition: "background 0.15s, transform 0.08s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingQuiz}
                      style={{
                        borderRadius: "999px",
                        border: "1px solid transparent",
                        padding: "11px 18px",
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

          {/* Delete Quiz Modal */}
          {showDeleteQuizModal && quizToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[460px] mx-auto my-auto"
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
                  Delete Quiz
                </h2>
                <p
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
                    {quizToDelete.pageName ||
                      quizToDelete.hero?.title ||
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
                    style={{
                      minWidth: "120px",
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "11px 18px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: deletingQuiz ? "not-allowed" : "pointer",
                      background: "#ffffff",
                      color: "#374151",
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

          {/* Delete KB Article Modal */}
          {showDeleteKbModal && kbArticleToDelete && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[460px] mx-auto my-auto"
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
              className="fixed inset-0 flex items-center justify-center z-[100] overflow-y-auto p-4"
              style={{ background: "rgba(15, 23, 42, 0.45)" }}
            >
              <div
                className="bg-white w-full max-w-[520px] mx-auto my-auto"
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
                    Create New KB Article
                  </h2>
                </div>
                <form onSubmit={handleCreateKbArticle}>
                  {kbValidationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
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
                        This will create a page at /{newKbArticleId || "kb-article-id"}
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
