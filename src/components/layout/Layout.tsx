"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import UserProfileBadge from "./UserProfileBadge";
import FloatingWhatsAppButton from "../ui/FloatingWhatsAppButton";
import TawkToChat from "../ui/TawkToChat";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

// Helper function to format breadcrumb labels (convert slugs to readable text)
function formatBreadcrumbLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to check if pathname is a nursing-entrance-exam page or sub-page
function isNursingEntranceExamPage(pathname: string): boolean {
  // Normalize pathname (remove trailing slash if present)
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  // Main page
  if (normalizedPath === "/nursing-entrance-exam") {
    return true;
  }
  // Nested sub-pages have pattern: /{subPageId}-{nestedSubPageId}-questions
  if (
    normalizedPath.includes("-questions") &&
    normalizedPath.split("/").length === 2
  ) {
    return true;
  }
  // For regular sub-pages, we need to check if it's not an excluded route
  // Excluded routes that should show header
  const excludedRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/admin",
    "/blog",
    "/dashboard",
    "/profile",
    "/referrals",
    "/payments",
    "/contact",
    "/prices",
    "/about",
    "/how-it-works",
    "/faqs",
    "/teas",
    "/hesi-a2",
    "/nursing",
  ];

  // If it's an excluded route, it's not a nursing-entrance-exam sub-page
  // But check for exact matches first to avoid false positives (e.g., /hesi-a2-practice-exam shouldn't match /hesi-a2)
  if (
    excludedRoutes.some((route) => {
      // Exact match
      if (normalizedPath === route) return true;
      // Path starts with route followed by a slash (e.g., /hesi-a2/...)
      if (normalizedPath.startsWith(route + "/")) return true;
      return false;
    })
  ) {
    return false;
  }

  // If it's a single-segment path (like /ati-teas), it could be a sub-page
  // We'll hide the header and let the page component handle 404 if needed
  const segments = normalizedPath.split("/").filter((s) => s);
  if (segments.length === 1) {
    // Could be a sub-page, hide header
    return true;
  }

  return false;
}

function LayoutWithSidebar({ children }: { children: ReactNode }) {
  const { isCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [pillarPages, setPillarPages] = useState<any[]>([]);
  const [pillarCategories, setPillarCategories] = useState<
    Record<string, any[]>
  >({});
  const [sidebarData] = useState<{
    pillarPages: any[];
    pillarCategories: Record<string, any[]>;
  } | null>(null);
  const [nursingSubPages, setNursingSubPages] = useState<any[]>([]);
  const [nursingExitExamSubPages, setNursingExitExamSubPages] = useState<any[]>(
    []
  );
  const [nursingTestBankSubPages, setNursingTestBankSubPages] = useState<any[]>(
    []
  );
  const [nestedSubPagesCache, setNestedSubPagesCache] = useState<
    Record<string, any[]>
  >({});
  const [quizNamesCache, setQuizNamesCache] = useState<Record<string, string>>(
    {}
  );
  const [breadcrumbDataLoaded, setBreadcrumbDataLoaded] = useState(false);
  const [pageMetadataCache, setPageMetadataCache] = useState<
    Record<
      string,
      {
        type?: string;
        pillarId?: string;
        parentId?: string;
        pageName?: string;
        subPageId?: string | null;
        nestedPageId?: string | null;
        topicId?: string | null;
        quizId?: string | null;
      }
    >
  >({});
  const [routeMappingCache, setRouteMappingCache] = useState<
    Record<string, any>
  >({});
  const [, setLoadingParentMappings] = useState<Set<string>>(new Set());
  const [nestedPageBreadcrumbData, setNestedPageBreadcrumbData] = useState<{
    parentSubPageName: string;
    parentSubPageSlug: string;
    nestedPageName: string;
    loading: boolean;
  } | null>(null);
  const [quizPageBreadcrumbData, setQuizPageBreadcrumbData] = useState<{
    parentSubPageName: string;
    parentSubPageSlug: string;
    nestedPageName: string;
    nestedPageSlug: string;
    topicName?: string;
    topicSlug?: string;
    quizName: string;
    loading: boolean;
  } | null>(null);

  // Load pillar pages and categories for breadcrumbs
  useEffect(() => {
    const loadBreadcrumbData = async () => {
      try {
        const {
          getAllPillarPages,
          getAllPillarServicePages,
          getNursingEntranceExamSubPages,
          getNursingExitExamSubPages,
          getNursingTestBankSubPages,
        } = await import("@/lib/firestore-operations");
        const pillarPagesResult = await getAllPillarPages();
        if (pillarPagesResult.success && pillarPagesResult.data) {
          setPillarPages(pillarPagesResult.data);

          // Load categories for each pillar page
          const categoriesByPillar: Record<string, any[]> = {};
          for (const pillarPage of pillarPagesResult.data) {
            if (pillarPage.id === "nursing-entrance-exam") {
              // Load nursing-entrance-exam sub-pages separately
              const nursingResult = await getNursingEntranceExamSubPages();
              if (nursingResult.success && nursingResult.data) {
                setNursingSubPages(nursingResult.data);
              }
              continue;
            }
            if (pillarPage.id === "nursing-exit-exam") {
              // Load nursing-exit-exam sub-pages separately
              const exitExamResult = await getNursingExitExamSubPages();
              if (exitExamResult.success && exitExamResult.data) {
                setNursingExitExamSubPages(exitExamResult.data);
              }
              continue;
            }
            if (pillarPage.id === "nursing-test-bank") {
              // Load nursing-test-bank sub-pages separately
              const testBankResult = await getNursingTestBankSubPages();
              if (testBankResult.success && testBankResult.data) {
                setNursingTestBankSubPages(testBankResult.data);
              }
              continue;
            }
            const result = await getAllPillarServicePages(pillarPage.id);
            if (result.success && result.data) {
              categoriesByPillar[pillarPage.id] = result.data;
            }
          }
          setPillarCategories(categoriesByPillar);
        }
        // Mark breadcrumb data as loaded
        setBreadcrumbDataLoaded(true);
      } catch (error) {
        console.error("Error loading breadcrumb data:", error);
        // Still mark as loaded to avoid infinite loading state
        setBreadcrumbDataLoaded(true);
      }
    };

    loadBreadcrumbData();
  }, []);

  // Load quiz names for breadcrumbs when pathname changes (using document type)
  useEffect(() => {
    const loadQuizName = async () => {
      const pathSegments = pathname.split("/").filter((s) => s);
      if (pathSegments.length !== 2) return;

      const pageSlug = pathSegments[0];
      const cachedMetadata = pageMetadataCache[pageSlug];

      // Only proceed if it's a quiz page based on document type
      if (
        !cachedMetadata ||
        cachedMetadata.type !== "quiz" ||
        cachedMetadata.pillarId !== "nursing-entrance-exam"
      ) {
        return;
      }

      const parentSubPageId = cachedMetadata.subPageId;
      const nestedSubPageId = cachedMetadata.nestedPageId;
      const quizSlug = pathSegments[1] || cachedMetadata.quizId;

      if (!parentSubPageId || !nestedSubPageId || !quizSlug) return;

      const quizCacheKey = `${parentSubPageId}-${nestedSubPageId}-${quizSlug}`;

      // Skip if already cached
      if (quizNamesCache[quizCacheKey]) return;

      // Find parent sub-page
      const parentSubPage = nursingSubPages.find((subPage) => {
        const subPageId = subPage.id || subPage.subPageId;
        return (
          subPageId === parentSubPageId ||
          subPageId === parentSubPageId + "-exam"
        );
      });

      if (parentSubPage) {
        const parentId =
          parentSubPage.id || parentSubPage.subPageId || parentSubPageId;
        const { getNursingEntranceExamQuiz } = await import(
          "@/lib/firestore-operations"
        );
        const result = await getNursingEntranceExamQuiz(
          parentId,
          nestedSubPageId,
          quizSlug
        );

        if (result.success && result.data) {
          const quizData = result.data as any;
          const quizName =
            quizData.pageName ||
            quizData.hero?.title ||
            formatBreadcrumbLabel(quizSlug);
          setQuizNamesCache((prev) => ({
            ...prev,
            [quizCacheKey]: quizName,
          }));
        } else {
          setQuizNamesCache((prev) => ({
            ...prev,
            [quizCacheKey]: formatBreadcrumbLabel(quizSlug),
          }));
        }
      }
    };

    loadQuizName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, nursingSubPages, pageMetadataCache]);

  // Reload test bank sub-pages when navigating to test bank pages to ensure fresh data
  useEffect(() => {
    // Check if it's a test bank page using metadata or pathname patterns
    const pathSegments = pathname.split("/").filter((s) => s);
    const pageSlug = pathSegments[0];
    const cachedMetadata = pageMetadataCache[pageSlug];
    const isTestBankPage =
      pathname === "/nursing-test-bank" ||
      cachedMetadata?.pillarId === "nursing-test-bank" ||
      // Match patterns without suffix: [slug], [slug]-[slug], [slug]-[slug]-[slug], [slug]-[slug]-[slug]-[slug]
      (pathname.match(/^\/([^-]+(?:-[^-]+)*)$/) &&
        !pathname.match(/^\/(.+)-exit-exam$/) &&
        !pathname.match(/^\/(.+)-questions$/) &&
        !pathname.match(/^\/(.+)-exam$/));

    if (isTestBankPage && nursingTestBankSubPages.length === 0) {
      const loadTestBankSubPages = async () => {
        try {
          const { getNursingTestBankSubPages } = await import(
            "@/lib/firestore-operations"
          );
          const testBankResult = await getNursingTestBankSubPages();
          if (testBankResult.success && testBankResult.data) {
            setNursingTestBankSubPages(testBankResult.data);
          }
        } catch (error) {
          console.error("Error loading test bank sub-pages:", error);
        }
      };
      loadTestBankSubPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, nursingTestBankSubPages.length]);

  // Load page metadata and route mappings for all dynamic pages to determine breadcrumb structure
  useEffect(() => {
    // Exclude known static routes and admin routes
    const excludedRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/admin",
      "/blog",
      "/dashboard",
      "/profile",
      "/referrals",
      "/payments",
      "/contact",
      "/prices",
      "/about",
      "/how-it-works",
      "/faqs",
      "/teas",
      "/hesi-a2",
      "/nursing",
      "/nursing-test-bank",
      "/nursing-exit-exam",
      "/nursing-entrance-exam",
    ];

    // Match single-segment paths (e.g., /hesi-a2-exam, /teas-exam, /any-dynamic-page)
    const pathSegments = pathname.split("/").filter((s) => s);
    const isSingleSegment = pathSegments.length === 1;
    const isExcluded =
      excludedRoutes.includes(pathname) || pathname.startsWith("/admin");

    if (isSingleSegment && !isExcluded) {
      const pageSlug = pathSegments[0];
      // Check if we already have this in cache
      const hasInCache = pageMetadataCache[pageSlug];

      if (!hasInCache) {
        const loadPageMetadata = async () => {
          try {
            const { getPageBySlug, getRouteMappingBySlugOnly } = await import(
              "@/lib/firestore-operations"
            );

            // First try to get route mapping (more reliable)
            const routeMappingResult = await getRouteMappingBySlugOnly(
              pageSlug
            );

            if (routeMappingResult.success && routeMappingResult.data) {
              const mapping = routeMappingResult.data as any;

              // Get page data to get page name
              const result: any = await getPageBySlug(pageSlug);
              const pageName =
                result?.data?.pageName ||
                result?.data?.hero?.title ||
                result?.data?.title ||
                formatBreadcrumbLabel(pageSlug);

              setPageMetadataCache((prev) => ({
                ...prev,
                [pageSlug]: {
                  type: mapping.type,
                  pillarId: mapping.pillarId,
                  parentId: mapping.subPageId || null,
                  pageName: pageName,
                  subPageId: mapping.subPageId || null,
                  nestedPageId: mapping.nestedPageId || null,
                  topicId: mapping.topicId || null,
                  quizId: mapping.quizId || null,
                },
              }));

              // Cache the route mapping
              setRouteMappingCache((prev) => ({
                ...prev,
                [pageSlug]: mapping,
              }));

              // Load parent route mappings if needed
              const loadParentMappings = async () => {
                const { getRouteMappingById } = await import(
                  "@/lib/firestore-operations"
                );

                if (mapping.type === "nested" && mapping.subPageId) {
                  const mappingKey = `${mapping.pillarId}:${mapping.subPageId}`;
                  // Mark as loading
                  setLoadingParentMappings((prev) =>
                    new Set(prev).add(mappingKey)
                  );
                  // Load sub-page route mapping
                  const subPageResult = await getRouteMappingById({
                    pillarId: mapping.pillarId,
                    type: "sub",
                    id: mapping.subPageId,
                  });
                  if (subPageResult.success && subPageResult.data) {
                    setRouteMappingCache((prev) => ({
                      ...prev,
                      [mappingKey]: subPageResult.data,
                    }));
                  }
                  // Mark as done loading
                  setLoadingParentMappings((prev) => {
                    const next = new Set(prev);
                    next.delete(mappingKey);
                    return next;
                  });
                } else if (
                  (mapping.type === "topic" || mapping.type === "quiz") &&
                  mapping.nestedPageId &&
                  mapping.subPageId
                ) {
                  // Load nested page and sub-page route mappings
                  const [nestedResult, subPageResult] = await Promise.all([
                    getRouteMappingById({
                      pillarId: mapping.pillarId,
                      type: "nested",
                      id: mapping.nestedPageId,
                      subPageId: mapping.subPageId,
                    }),
                    getRouteMappingById({
                      pillarId: mapping.pillarId,
                      type: "sub",
                      id: mapping.subPageId,
                    }),
                  ]);

                  if (nestedResult.success && nestedResult.data) {
                    setRouteMappingCache((prev) => ({
                      ...prev,
                      [`${mapping.pillarId}:${mapping.nestedPageId}`]:
                        nestedResult.data,
                    }));
                  }

                  if (subPageResult.success && subPageResult.data) {
                    setRouteMappingCache((prev) => ({
                      ...prev,
                      [`${mapping.pillarId}:${mapping.subPageId}`]:
                        subPageResult.data,
                    }));
                  }
                }
              };
              loadParentMappings();
            } else {
              // Fallback to getPageBySlug if route mapping not found
              const result: any = await getPageBySlug(pageSlug);
              if (result.success && result.data) {
                setPageMetadataCache((prev) => ({
                  ...prev,
                  [pageSlug]: {
                    type: result.type,
                    pillarId: result.pillarId,
                    parentId: result.parentId,
                    pageName:
                      result.data?.pageName ||
                      result.data?.hero?.title ||
                      result.data?.title ||
                      formatBreadcrumbLabel(pageSlug),
                  },
                }));
              }
            }
          } catch (error) {
            console.error("Error loading page metadata:", error);
          }
        };
        loadPageMetadata();
      }
    }
  }, [pathname, pageMetadataCache]);

  // Load nested page breadcrumb data directly from Firebase
  useEffect(() => {
    const loadNestedPageBreadcrumb = async () => {
      const pathSegments = pathname.split("/").filter((s) => s);
      if (pathSegments.length !== 1) {
        setNestedPageBreadcrumbData(null);
        return;
      }

      const pageSlug = pathSegments[0];
      const cachedMetadata = pageMetadataCache[pageSlug];

      // Check if it's a nested page from metadata
      let parentSubPageId: string | null = null;
      let nestedSubPageId: string | null = null;
      let pillarId: string | null = null;

      // Only use document type from metadata, no URL pattern fallback
      if (!cachedMetadata || cachedMetadata.type !== "nested") {
        setNestedPageBreadcrumbData(null);
        return;
      }

      parentSubPageId = cachedMetadata.subPageId || null;
      nestedSubPageId = cachedMetadata.nestedPageId || null;
      pillarId = cachedMetadata.pillarId || null;

      if (!parentSubPageId || !nestedSubPageId || !pillarId) {
        setNestedPageBreadcrumbData(null);
        return;
      }

      // Check if it's a nursing-entrance-exam nested page
      if (pillarId !== "nursing-entrance-exam") {
        setNestedPageBreadcrumbData(null);
        return;
      }

      const isNursingEntranceExam = nursingSubPages.some((subPage) => {
        const subPageId = subPage.id || subPage.subPageId;
        return (
          subPageId === parentSubPageId ||
          subPageId === parentSubPageId + "-exam"
        );
      });

      if (!isNursingEntranceExam && nursingSubPages.length > 0) {
        setNestedPageBreadcrumbData(null);
        return;
      }

      setNestedPageBreadcrumbData({
        parentSubPageName: "",
        parentSubPageSlug: "",
        nestedPageName: "",
        loading: true,
      });

      try {
        const { getNestedSubPages, getNursingEntranceExamSubPage } =
          await import("@/lib/firestore-operations");

        // Find parent sub-page
        const parentSubPage = nursingSubPages.find((subPage) => {
          const subPageId = subPage.id || subPage.subPageId;
          return (
            subPageId === parentSubPageId ||
            subPageId === parentSubPageId + "-exam"
          );
        });

        let parentSubPageName: string | null = null;
        let parentSubPageSlug = parentSubPageId;

        if (parentSubPage) {
          parentSubPageName =
            parentSubPage?.pageName || parentSubPage?.hero?.title || null;
          parentSubPageSlug = parentSubPage?.slug || parentSubPageId;
        } else {
          // Try to fetch parent sub-page directly
          const parentResult = await getNursingEntranceExamSubPage(
            parentSubPageId
          );
          if (parentResult.success && parentResult.data) {
            const parentData = parentResult.data as any;
            parentSubPageName =
              parentData.pageName || parentData.hero?.title || null;
            parentSubPageSlug = parentData.slug || parentSubPageId;
          }
        }

        // Fetch nested sub-pages
        const resolvedParentId =
          parentSubPage?.id || parentSubPage?.subPageId || parentSubPageId;
        const nestedResult = await getNestedSubPages(resolvedParentId);

        let nestedPageName: string | null = null;
        if (nestedResult.success && nestedResult.data) {
          const nestedSubPage = nestedResult.data.find((nsp: any) => {
            const nspId = nsp.id || nsp.nestedSubPageId;
            return nspId === nestedSubPageId;
          });
          if (nestedSubPage) {
            nestedPageName =
              nestedSubPage?.pageName ||
              nestedSubPage?.hero?.title ||
              nestedSubPage?.title ||
              null;
          }
        }

        setNestedPageBreadcrumbData({
          parentSubPageName: parentSubPageName || "",
          parentSubPageSlug,
          nestedPageName: nestedPageName || "",
          loading: false,
        });
      } catch (error) {
        console.error("Error loading nested page breadcrumb:", error);
        setNestedPageBreadcrumbData({
          parentSubPageName: "",
          parentSubPageSlug: parentSubPageId,
          nestedPageName: "",
          loading: false,
        });
      }
    };

    loadNestedPageBreadcrumb();
  }, [pathname, nursingSubPages, pageMetadataCache]);

  // Load quiz page breadcrumb data directly from Firebase
  useEffect(() => {
    const loadQuizPageBreadcrumb = async () => {
      const pathSegments = pathname.split("/").filter((s) => s);
      // Handle both two-segment paths (page-slug/quiz-slug) and single-segment paths (quiz-slug)
      if (pathSegments.length !== 2 && pathSegments.length !== 1) {
        setQuizPageBreadcrumbData(null);
        return;
      }

      // For two-segment paths: page-slug/quiz-slug
      // For single-segment paths: quiz-slug (the page slug itself is the quiz slug)
      const pageSlug = pathSegments[0];
      const quizSlug =
        pathSegments.length === 2 ? pathSegments[1] : pathSegments[0];
      const cachedMetadata = pageMetadataCache[pageSlug];

      // Check if it's a quiz page from metadata
      let parentSubPageId: string | null = null;
      let nestedSubPageId: string | null = null;
      let pillarId: string | null = null;

      // Only use document type from metadata, no URL pattern fallback
      if (!cachedMetadata || cachedMetadata.type !== "quiz") {
        setQuizPageBreadcrumbData(null);
        return;
      }

      parentSubPageId = cachedMetadata.subPageId || null;
      nestedSubPageId = cachedMetadata.nestedPageId || null;
      pillarId = cachedMetadata.pillarId || null;

      // For single-segment paths, use quizId from metadata if available
      const finalQuizSlug =
        pathSegments.length === 1
          ? cachedMetadata.quizId || quizSlug
          : quizSlug;

      if (!parentSubPageId || !nestedSubPageId || !pillarId || !finalQuizSlug) {
        setQuizPageBreadcrumbData(null);
        return;
      }

      // Check if it's a quiz page for supported pillars
      if (
        pillarId !== "nursing-entrance-exam" &&
        pillarId !== "nursing-exit-exam" &&
        pillarId !== "nursing-test-bank"
      ) {
        setQuizPageBreadcrumbData(null);
        return;
      }

      // For nursing-test-bank, we need topicId
      if (pillarId === "nursing-test-bank") {
        const topicId = cachedMetadata.topicId;
        if (!topicId) {
          setQuizPageBreadcrumbData(null);
          return;
        }
      }

      setQuizPageBreadcrumbData({
        parentSubPageName: "",
        parentSubPageSlug: "",
        nestedPageName: "",
        nestedPageSlug: "",
        topicName: "",
        topicSlug: "",
        quizName: "",
        loading: true,
      });

      try {
        const {
          getNestedSubPages,
          getNursingEntranceExamSubPage,
          getNursingEntranceExamQuiz,
          getNursingExitExamSubPage,
          getNursingExitExamNestedSubPages,
          getNursingExitExamQuiz,
          getNursingTestBankSubPage,
          getNursingTestBankNestedSubPage,
          getNursingTestBankTopic,
          getNursingTestBankQuiz,
        } = await import("@/lib/firestore-operations");

        let parentSubPageName: string | null = null;
        let parentSubPageSlug = parentSubPageId;
        let nestedPageName: string | null = null;
        let nestedPageSlug = nestedSubPageId;
        let topicName: string | null = null;
        let topicSlug = "";
        let quizName: string | null = null;

        if (pillarId === "nursing-test-bank") {
          // For nursing test bank: sub page -> nested page -> topic -> quiz
          const topicId = cachedMetadata.topicId!;

          // Fetch parent sub-page
          const parentResult = await getNursingTestBankSubPage(parentSubPageId);
          if (parentResult.success && parentResult.data) {
            const parentData = parentResult.data as any;
            parentSubPageName =
              parentData.pageName || parentData.hero?.title || null;
            parentSubPageSlug = parentData.slug || parentSubPageId;
          }

          // Fetch nested sub-page
          const nestedResult = await getNursingTestBankNestedSubPage(
            parentSubPageId,
            nestedSubPageId
          );
          if (nestedResult.success && nestedResult.data) {
            const nestedData = nestedResult.data as any;
            nestedPageName =
              nestedData.pageName || nestedData.hero?.title || null;
            nestedPageSlug = nestedData.slug || nestedSubPageId;
          }

          // Fetch topic
          const topicResult = await getNursingTestBankTopic(
            parentSubPageId,
            nestedSubPageId,
            topicId
          );
          if (topicResult.success && topicResult.data) {
            const topicData = topicResult.data as any;
            topicName = topicData.pageName || topicData.hero?.title || null;
            topicSlug = topicData.slug || topicId;
          }

          // Fetch quiz data
          const quizResult = await getNursingTestBankQuiz(
            parentSubPageId,
            nestedSubPageId,
            topicId,
            finalQuizSlug
          );
          if (quizResult.success && quizResult.data) {
            const quizData = quizResult.data as any;
            quizName = quizData.pageName || quizData.hero?.title || null;
          }
        } else {
          // For nursing entrance/exit exam: sub page -> nested page -> quiz
          if (pillarId === "nursing-exit-exam") {
            // Handle exit exam separately
            // Find parent sub-page from exit exam sub pages
            const parentSubPage = nursingExitExamSubPages.find((subPage) => {
              const subPageId = subPage.id || subPage.subPageId;
              return (
                subPageId === parentSubPageId ||
                subPageId === parentSubPageId + "-exit-exam"
              );
            });

            if (parentSubPage) {
              parentSubPageName =
                parentSubPage?.pageName ||
                parentSubPage?.hero?.title ||
                formatBreadcrumbLabel(parentSubPageId);
              parentSubPageSlug = parentSubPage?.slug || parentSubPageId;
            } else {
              // Try to fetch parent sub-page directly
              const parentResult = await getNursingExitExamSubPage(
                parentSubPageId
              );
              if (parentResult.success && parentResult.data) {
                const parentData = parentResult.data as any;
                parentSubPageName =
                  parentData.pageName ||
                  parentData.hero?.title ||
                  formatBreadcrumbLabel(parentSubPageId);
                parentSubPageSlug = parentData.slug || parentSubPageId;
              }
            }

            // Fetch nested sub-pages for exit exam
            const resolvedParentId =
              parentSubPage?.id || parentSubPage?.subPageId || parentSubPageId;
            const nestedResult = await getNursingExitExamNestedSubPages(
              resolvedParentId
            );

            if (nestedResult.success && nestedResult.data) {
              const nestedSubPage = nestedResult.data.find((nsp: any) => {
                const nspId = nsp.id || nsp.nestedSubPageId;
                return nspId === nestedSubPageId;
              });
              if (nestedSubPage) {
                nestedPageName =
                  nestedSubPage?.pageName ||
                  nestedSubPage?.hero?.title ||
                  nestedSubPage?.title ||
                  formatBreadcrumbLabel(nestedSubPageId);
                nestedPageSlug = nestedSubPage?.slug || nestedSubPageId;
              }
            }

            // Fetch quiz data for exit exam
            const quizResult = await getNursingExitExamQuiz(
              resolvedParentId,
              nestedSubPageId,
              finalQuizSlug
            );

            if (quizResult.success && quizResult.data) {
              const quizData = quizResult.data as any;
              quizName =
                quizData.pageName ||
                quizData.hero?.title ||
                formatBreadcrumbLabel(finalQuizSlug);
            }
          } else {
            // Handle entrance exam (original logic)
            // Find parent sub-page
            const parentSubPage = nursingSubPages.find((subPage) => {
              const subPageId = subPage.id || subPage.subPageId;
              return (
                subPageId === parentSubPageId ||
                subPageId === parentSubPageId + "-exam"
              );
            });

            if (parentSubPage) {
              parentSubPageName =
                parentSubPage?.pageName || parentSubPage?.hero?.title || null;
              parentSubPageSlug = parentSubPage?.slug || parentSubPageId;
            } else {
              // Try to fetch parent sub-page directly
              const parentResult = await getNursingEntranceExamSubPage(
                parentSubPageId
              );
              if (parentResult.success && parentResult.data) {
                const parentData = parentResult.data as any;
                parentSubPageName =
                  parentData.pageName || parentData.hero?.title || null;
                parentSubPageSlug = parentData.slug || parentSubPageId;
              }
            }

            // Fetch nested sub-pages
            const resolvedParentId =
              parentSubPage?.id || parentSubPage?.subPageId || parentSubPageId;
            const nestedResult = await getNestedSubPages(resolvedParentId);

            if (nestedResult.success && nestedResult.data) {
              const nestedSubPage = nestedResult.data.find((nsp: any) => {
                const nspId = nsp.id || nsp.nestedSubPageId;
                return nspId === nestedSubPageId;
              });
              if (nestedSubPage) {
                nestedPageName =
                  nestedSubPage?.pageName ||
                  nestedSubPage?.hero?.title ||
                  nestedSubPage?.title ||
                  null;
                nestedPageSlug = nestedSubPage?.slug || nestedSubPageId;
              }
            }

            // Fetch quiz data
            const quizResult = await getNursingEntranceExamQuiz(
              resolvedParentId,
              nestedSubPageId,
              finalQuizSlug
            );

            if (quizResult.success && quizResult.data) {
              const quizData = quizResult.data as any;
              quizName = quizData.pageName || quizData.hero?.title || null;
            }
          }
        }

        setQuizPageBreadcrumbData({
          parentSubPageName: parentSubPageName || "",
          parentSubPageSlug,
          nestedPageName: nestedPageName || "",
          nestedPageSlug,
          topicName: topicName || "",
          topicSlug,
          quizName: quizName || "",
          loading: false,
        });
      } catch (error) {
        console.error("Error loading quiz page breadcrumb:", error);
        setQuizPageBreadcrumbData({
          parentSubPageName: "",
          parentSubPageSlug: parentSubPageId,
          nestedPageName: "",
          nestedPageSlug: nestedSubPageId,
          quizName: "",
          loading: false,
        });
      }
    };

    loadQuizPageBreadcrumb();
  }, [pathname, nursingSubPages, nursingExitExamSubPages, pageMetadataCache]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Sidebar initialData={sidebarData} />
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Mobile Header - Only show on mobile devices */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-[90] h-16">
          <div className="flex items-center justify-between h-full px-4">
            {/* Logo on the left */}
            <Link
              href="/"
              aria-label="TEAS Gurus Home"
              className="flex-shrink-0 flex items-center h-full"
            >
              <Image
                src="/teas-gurus-logo.png"
                alt="TEAS Gurus Logo"
                width={150}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Right side - Login badge and Menu button */}
            <div className="flex items-center gap-3">
              {/* User Badge - Only show if logged in */}
              {currentUser && (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {currentUser.displayName
                        ? currentUser.displayName.charAt(0).toUpperCase()
                        : currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Hamburger Menu Button - Rightmost */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Desktop: Show header bar with breadcrumbs for all pages with sidebar */}
        {(() => {
          // Determine if sidebar should be shown
          const shouldShowSidebar = () => {
            const excludedRoutes = [
              "/",
              "/login",
              "/register",
              "/forgot-password",
            ];
            if (excludedRoutes.includes(pathname)) return false;
            if (pathname.startsWith("/blog")) return false;
            if (pathname.startsWith("/admin")) return false;
            return true;
          };
          const sidebarEnabled = shouldShowSidebar();

          if (!sidebarEnabled) return null;

          return (
            <div className="hidden md:block border-b border-gray-200 bg-white h-16">
              <div className="flex justify-between items-center px-4 h-full">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Link
                    href="/"
                    className="hover:text-blue-600 transition-colors font-medium"
                  >
                    Home
                  </Link>
                  {/* Generate breadcrumbs based on pathname */}
                  {(() => {
                    // Don't render dynamic breadcrumbs until data is loaded to avoid flash
                    // For simple static routes, we can render immediately
                    const isStaticRoute =
                      pathname === "/nursing-test-bank" ||
                      pathname === "/nursing-exit-exam" ||
                      pathname === "/nursing-entrance-exam";

                    // For dynamic routes, show skeleton loaders while data is loading
                    if (!isStaticRoute && !breadcrumbDataLoaded) {
                      // Determine number of breadcrumb items based on document type from metadata
                      const pathSegments = pathname.split("/").filter((s) => s);
                      let skeletonCount = 1; // At least one (the main category)

                      // Check document type from metadata cache
                      const pageSlug = pathSegments[0];
                      const cachedMetadata = pageMetadataCache[pageSlug];
                      const pageType = cachedMetadata?.type;
                      console.log(pageType, "This is pageType");

                      // Determine skeleton count based on document type
                      if (pageType === "quiz") {
                        // For nursing test bank: Home > Category > Sub Page > Nested Page > Topic > Quiz (5 items)
                        // For entrance/exit exam: Home > Category > Parent > Nested > Quiz (4 items)
                        const pillarId = cachedMetadata?.pillarId;
                        console.log(pillarId, "This is pillarId");
                        skeletonCount =
                          pillarId === "nursing-test-bank" ? 5 : 4;
                      } else if (pageType === "nested") {
                        skeletonCount = 3; // Home > Category > Parent > Nested
                      } else if (pageType === "sub") {
                        skeletonCount = 2; // Home > Category > SubPage
                      } else if (pageType === "topic") {
                        skeletonCount = 4; // Home > Category > Parent > Nested > Topic
                      } else if (pathSegments.length === 1) {
                        // Fallback: if no metadata yet, assume it's a sub-page
                        skeletonCount = 2;
                      }

                      // Render skeleton loaders
                      return (
                        <>
                          {Array.from({ length: skeletonCount }).map(
                            (_, index) => (
                              <React.Fragment key={index}>
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
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              </React.Fragment>
                            )
                          )}
                        </>
                      );
                    }

                    // For nursing-test-bank pages
                    // Check if it's the main page
                    if (pathname === "/nursing-test-bank") {
                      return (
                        <>
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
                        </>
                      );
                    }

                    // For nursing-exit-exam pages
                    // Check if it's the main page
                    if (pathname === "/nursing-exit-exam") {
                      return (
                        <>
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
                          <span className="font-medium">Nursing Exit Exam</span>
                        </>
                      );
                    }

                    // For nursing-entrance-exam pages
                    // Check if it's the main page (must be checked BEFORE test bank patterns)
                    if (pathname === "/nursing-entrance-exam") {
                      return (
                        <>
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
                          <span className="font-medium">
                            Nursing Entrance Exam
                          </span>
                        </>
                      );
                    }

                    // Check if it's an entrance exam quiz page FIRST (pattern: /{parent}-{nested}-questions/{quizSlug})
                    // This must be checked BEFORE test bank patterns to avoid false matches
                    const entranceExamPathSegments = pathname
                      .split("/")
                      .filter((s) => s);
                    const isEntranceExamQuizPage =
                      entranceExamPathSegments.length === 2 &&
                      entranceExamPathSegments[0].endsWith("-questions");
                    const entranceExamQuizNestedMatch = isEntranceExamQuizPage
                      ? entranceExamPathSegments[0].match(
                          /^(.+)-(.+)-questions$/
                        )
                      : null;

                    if (isEntranceExamQuizPage && entranceExamQuizNestedMatch) {
                      const parentSubPageId = entranceExamQuizNestedMatch[1];
                      const nestedSubPageId = entranceExamQuizNestedMatch[2];
                      const quizSlug = entranceExamPathSegments[1];
                      const quizCacheKey = `${parentSubPageId}-${nestedSubPageId}-${quizSlug}`;

                      // Find the parent sub-page to get its actual name
                      const parentSubPage = nursingSubPages.find((subPage) => {
                        const subPageId = subPage.id || subPage.subPageId;
                        return (
                          subPageId === parentSubPageId ||
                          subPageId === parentSubPageId + "-exam"
                        );
                      });
                      const parentSubPageName =
                        parentSubPage?.pageName ||
                        parentSubPage?.hero?.title ||
                        null;

                      // Try to find nested sub-page name from cache
                      const cacheKey = `entrance-${parentSubPageId}`;
                      const nestedSubPages =
                        nestedSubPagesCache[cacheKey] || [];
                      const nestedSubPage = nestedSubPages.find((nsp: any) => {
                        const nspId = nsp.id || nsp.nestedSubPageId;
                        return nspId === nestedSubPageId;
                      });
                      const nestedSubPageName =
                        nestedSubPage?.pageName ||
                        nestedSubPage?.hero?.title ||
                        nestedSubPage?.title ||
                        null;

                      // Load nested sub-pages if not in cache
                      if (!nestedSubPagesCache[cacheKey] && parentSubPageId) {
                        import("@/lib/firestore-operations").then(
                          ({ getNestedSubPages }) => {
                            getNestedSubPages(parentSubPageId).then(
                              (result) => {
                                if (result.success && result.data) {
                                  setNestedSubPagesCache((prev) => ({
                                    ...prev,
                                    [cacheKey]: result.data || [],
                                  }));
                                }
                              }
                            );
                          }
                        );
                      }

                      // Load quiz data to get quiz name if not in cache
                      if (
                        !quizNamesCache[quizCacheKey] &&
                        parentSubPageId &&
                        nestedSubPageId &&
                        quizSlug
                      ) {
                        const parentId =
                          parentSubPage?.id ||
                          parentSubPage?.subPageId ||
                          parentSubPageId;
                        import("@/lib/firestore-operations").then(
                          ({ getNursingEntranceExamQuiz }) => {
                            getNursingEntranceExamQuiz(
                              parentId,
                              nestedSubPageId,
                              quizSlug
                            ).then((result) => {
                              if (result.success && result.data) {
                                const quizData = result.data as any;
                                const quizName =
                                  quizData.pageName ||
                                  quizData.hero?.title ||
                                  null;
                                if (quizName) {
                                  setQuizNamesCache((prev) => ({
                                    ...prev,
                                    [quizCacheKey]: quizName,
                                  }));
                                }
                              }
                            });
                          }
                        );
                      }

                      const displayQuizName =
                        quizNamesCache[quizCacheKey] || null;

                      // Get slugs from route mapping cache
                      const parentMappingKey = `nursing-entrance-exam:${parentSubPageId}`;
                      const nestedMappingKey = `nursing-entrance-exam:${nestedSubPageId}`;
                      const parentRouteMapping =
                        routeMappingCache[parentMappingKey] ||
                        routeMappingCache[parentSubPage?.slug || ""];
                      const nestedRouteMapping =
                        routeMappingCache[nestedMappingKey] ||
                        routeMappingCache[nestedSubPage?.slug || ""];

                      const parentUrlSlug =
                        parentRouteMapping?.slug ||
                        parentSubPage?.slug ||
                        parentSubPageId;
                      const nestedSubPageUrl =
                        nestedRouteMapping?.slug ||
                        nestedSubPage?.slug ||
                        nestedSubPageId;

                      // Show skeleton loader if we don't have all data
                      if (
                        !parentSubPageName ||
                        !nestedSubPageName ||
                        !displayQuizName
                      ) {
                        return (
                          <>
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
                              href="/nursing-entrance-exam"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Entrance Exam
                            </Link>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <React.Fragment key={i}>
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
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              </React.Fragment>
                            ))}
                          </>
                        );
                      }

                      return (
                        <>
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
                            href="/nursing-entrance-exam"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Entrance Exam
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
                            href={`/${parentUrlSlug}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {parentSubPageName}
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
                            href={`/${nestedSubPageUrl}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {nestedSubPageName}
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
                          <span className="font-medium">{displayQuizName}</span>
                        </>
                      );
                    }

                    // Check exit exam pages using document type from metadata
                    const pathSegmentsForExitExam = pathname
                      .split("/")
                      .filter((s) => s);
                    const exitExamPageSlug = pathSegmentsForExitExam[0];
                    const exitExamCachedMetadata =
                      pageMetadataCache[exitExamPageSlug];
                    const exitExamPageType = exitExamCachedMetadata?.type;
                    const exitExamPillarId = exitExamCachedMetadata?.pillarId;

                    // Check if it's an exit exam quiz page based on document type
                    const isExitExamQuizPage =
                      exitExamPageType === "quiz" &&
                      exitExamPillarId === "nursing-exit-exam" &&
                      pathSegmentsForExitExam.length === 2;

                    // Check if it's an exit exam nested sub-page based on document type
                    const isExitExamNestedSubPage =
                      exitExamPageType === "nested" &&
                      exitExamPillarId === "nursing-exit-exam" &&
                      pathSegmentsForExitExam.length === 1;

                    // Handle exit exam quiz page breadcrumbs using metadata
                    // Only handle exit exam quiz pages (not other pillar quiz pages)
                    // Skip if quizPageBreadcrumbData is available (it has the correct data from Firebase)
                    if (
                      exitExamPageType === "quiz" &&
                      exitExamCachedMetadata &&
                      exitExamPillarId === "nursing-exit-exam" &&
                      !quizPageBreadcrumbData
                    ) {
                      // Debug logs for exit exam quiz breadcrumb
                      console.log(
                        "=== Exit Exam Quiz Breadcrumb Debug (inside exitExamPageType === 'quiz') ==="
                      );
                      console.log("exitExamPageType:", exitExamPageType);
                      console.log("exitExamPillarId:", exitExamPillarId);
                      console.log(
                        "pathSegmentsForExitExam:",
                        pathSegmentsForExitExam
                      );
                      console.log(
                        "pathSegmentsForExitExam.length:",
                        pathSegmentsForExitExam.length
                      );
                      console.log("isExitExamQuizPage:", isExitExamQuizPage);
                      console.log(
                        "exitExamCachedMetadata:",
                        exitExamCachedMetadata
                      );
                      const nestedSubPageId =
                        exitExamCachedMetadata.nestedPageId;
                      const parentSubPageId = exitExamCachedMetadata.subPageId;
                      const quizSlug =
                        pathSegmentsForExitExam[1] ||
                        exitExamCachedMetadata.quizId;

                      if (!nestedSubPageId || !parentSubPageId || !quizSlug) {
                        return null;
                      }
                      const quizCacheKey = `exit-${parentSubPageId}-${nestedSubPageId}-${quizSlug}`;

                      // Find the parent sub-page to get its actual name
                      const parentSubPage = nursingExitExamSubPages.find(
                        (subPage) => {
                          const subPageId = subPage.id || subPage.subPageId;
                          return (
                            subPageId === parentSubPageId ||
                            subPageId === parentSubPageId + "-exit-exam"
                          );
                        }
                      );
                      const parentSubPageName =
                        parentSubPage?.pageName ||
                        parentSubPage?.hero?.title ||
                        null;

                      // Try to find nested sub-page name from cache
                      const cacheKey = `exit-${parentSubPageId}`;
                      const nestedSubPages =
                        nestedSubPagesCache[cacheKey] || [];
                      const nestedSubPage = nestedSubPages.find((nsp: any) => {
                        const nspId = nsp.id || nsp.nestedSubPageId;
                        return nspId === nestedSubPageId;
                      });

                      // Get nested subpage name - use name directly from Firebase (same as entrance exam)
                      const nestedSubPageName =
                        nestedSubPage?.pageName ||
                        nestedSubPage?.hero?.title ||
                        nestedSubPage?.title ||
                        null;

                      console.log(
                        "Final nestedSubPageName:",
                        nestedSubPageName
                      );

                      // Load nested sub-pages if not in cache
                      if (!nestedSubPagesCache[cacheKey] && parentSubPageId) {
                        console.log(
                          "Loading nested sub-pages from Firebase..."
                        );
                        import("@/lib/firestore-operations").then(
                          ({ getNursingExitExamNestedSubPages }) => {
                            getNursingExitExamNestedSubPages(
                              parentSubPageId
                            ).then((result) => {
                              console.log(
                                "Loaded nested sub-pages result:",
                                result
                              );
                              if (result.success && result.data) {
                                console.log(
                                  "Loaded nested sub-pages data:",
                                  result.data
                                );
                                setNestedSubPagesCache((prev) => ({
                                  ...prev,
                                  [cacheKey]: result.data || [],
                                }));
                              }
                            });
                          }
                        );
                      }

                      // Load quiz data to get quiz name if not in cache
                      if (
                        !quizNamesCache[quizCacheKey] &&
                        parentSubPageId &&
                        nestedSubPageId &&
                        quizSlug
                      ) {
                        const parentId =
                          parentSubPage?.id ||
                          parentSubPage?.subPageId ||
                          parentSubPageId;
                        import("@/lib/firestore-operations").then(
                          ({ getNursingExitExamQuiz }) => {
                            getNursingExitExamQuiz(
                              parentId,
                              nestedSubPageId,
                              quizSlug
                            ).then((result) => {
                              if (result.success && result.data) {
                                const quizData = result.data as any;
                                const quizName =
                                  quizData.pageName ||
                                  quizData.hero?.title ||
                                  null;
                                if (quizName) {
                                  setQuizNamesCache((prev) => ({
                                    ...prev,
                                    [quizCacheKey]: quizName,
                                  }));
                                }
                              }
                            });
                          }
                        );
                      }

                      // Get slugs from route mapping cache
                      // Try multiple lookup strategies for route mapping
                      const parentMappingKey = `nursing-exit-exam:${parentSubPageId}`;
                      const nestedMappingKey = `nursing-exit-exam:${nestedSubPageId}`;
                      const nestedSlugFromData = nestedSubPage?.slug;
                      const nestedSlugMappingKey = nestedSlugFromData
                        ? `nursing-exit-exam:${nestedSlugFromData}`
                        : null;

                      const parentRouteMapping =
                        routeMappingCache[parentMappingKey] ||
                        routeMappingCache[parentSubPage?.slug || ""];
                      const nestedRouteMapping =
                        routeMappingCache[nestedMappingKey] ||
                        (nestedSlugMappingKey
                          ? routeMappingCache[nestedSlugMappingKey]
                          : null) ||
                        routeMappingCache[nestedSlugFromData || ""];

                      const parentSubPageUrl =
                        parentRouteMapping?.slug ||
                        parentSubPage?.slug ||
                        parentSubPageId;

                      // Use slug from nestedSubPage data first, then route mapping, then fallback
                      // The slug from Firebase should already be the full slug (e.g., "lpn-reading")
                      const nestedSubPageUrl =
                        nestedSubPage?.slug ||
                        nestedRouteMapping?.slug ||
                        nestedSubPageId;

                      const displayQuizName =
                        quizNamesCache[quizCacheKey] || null;

                      // Show skeleton loader if we don't have all data
                      if (
                        !parentSubPageName ||
                        !nestedSubPageName ||
                        !displayQuizName
                      ) {
                        return (
                          <>
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
                              href="/nursing-exit-exam"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Exit Exam
                            </Link>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <React.Fragment key={i}>
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
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              </React.Fragment>
                            ))}
                          </>
                        );
                      }

                      return (
                        <>
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
                            href="/nursing-exit-exam"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Exit Exam
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
                            href={`/${parentSubPageUrl}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {parentSubPageName}
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
                            href={`/${nestedSubPageUrl}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {nestedSubPageName}
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
                          <span className="font-medium">{displayQuizName}</span>
                        </>
                      );
                    }

                    if (isExitExamNestedSubPage && exitExamCachedMetadata) {
                      const nestedSubPageId =
                        exitExamCachedMetadata.nestedPageId;
                      const parentSubPageId = exitExamCachedMetadata.subPageId;

                      if (!nestedSubPageId || !parentSubPageId) {
                        return null;
                      }

                      // Find the parent sub-page to get its actual name
                      const parentSubPage = nursingExitExamSubPages.find(
                        (subPage) => {
                          const subPageId = subPage.id || subPage.subPageId;
                          return subPageId === parentSubPageId;
                        }
                      );
                      const parentSubPageName =
                        parentSubPage?.pageName ||
                        parentSubPage?.hero?.title ||
                        null;

                      // Try to find nested sub-page name from cache
                      const cacheKey = `exit-${parentSubPageId}`;
                      const nestedSubPages =
                        nestedSubPagesCache[cacheKey] || [];
                      const nestedSubPage = nestedSubPages.find((nsp: any) => {
                        const nspId = nsp.id || nsp.nestedSubPageId;
                        return nspId === nestedSubPageId;
                      });

                      // Get nested subpage name - use name directly from Firebase (same as entrance exam)
                      const nestedSubPageName =
                        nestedSubPage?.pageName ||
                        nestedSubPage?.hero?.title ||
                        nestedSubPage?.title ||
                        null;

                      // Load nested sub-pages if not in cache
                      if (!nestedSubPagesCache[cacheKey] && parentSubPageId) {
                        import("@/lib/firestore-operations").then(
                          ({ getNursingExitExamNestedSubPages }) => {
                            getNursingExitExamNestedSubPages(
                              parentSubPageId
                            ).then((result) => {
                              if (result.success && result.data) {
                                setNestedSubPagesCache((prev) => ({
                                  ...prev,
                                  [cacheKey]: result.data || [],
                                }));
                              }
                            });
                          }
                        );
                      }

                      // Get slug from route mapping cache or sub-page data
                      const parentMappingKey = `nursing-exit-exam:${parentSubPageId}`;
                      const parentRouteMapping =
                        routeMappingCache[parentMappingKey] ||
                        routeMappingCache[parentSubPage?.slug || ""];
                      const parentSubPageSlug =
                        parentRouteMapping?.slug ||
                        parentSubPage?.slug ||
                        parentSubPageId;

                      return (
                        <>
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
                            href="/nursing-exit-exam"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Exit Exam
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
                            href={`/${parentSubPageSlug}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {parentSubPageName}
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
                          <span className="font-medium">
                            {nestedSubPageName}
                          </span>
                        </>
                      );
                    }

                    // Check if it's a test bank topic (pattern: [parentSubPageSlug]-[nestedSubPageSlug]-[topicSlug])
                    // Use metadata to identify test bank pages
                    const pathSegmentsForTopic = pathname
                      .split("/")
                      .filter((s) => s);
                    const pageSlugForTopic = pathSegmentsForTopic[0];
                    const cachedMetadataForTopic =
                      pageMetadataCache[pageSlugForTopic];
                    const exitExamNestedMatchForTopic = pathname.match(
                      /^\/(.+)-(.+)-exit-exam$/
                    );
                    const entranceExamNestedMatchForTopic = pathname.match(
                      /^\/(.+)-(.+)-questions$/
                    );
                    // Exclude main pages: nursing-entrance-exam, nursing-exit-exam, nursing-test-bank
                    const isMainPage =
                      pathname === "/nursing-entrance-exam" ||
                      pathname === "/nursing-exit-exam" ||
                      pathname === "/nursing-test-bank";
                    const testBankTopicMatch =
                      !isMainPage &&
                      !exitExamNestedMatchForTopic &&
                      !entranceExamNestedMatchForTopic &&
                      pathname.match(/^\/(.+)-(.+)-(.+)$/);

                    // Check if it could be a test bank topic
                    // Use metadata to identify test bank topics
                    let isTestBankTopic = false;
                    if (testBankTopicMatch) {
                      // Check metadata first
                      if (
                        cachedMetadataForTopic?.type === "topic" &&
                        cachedMetadataForTopic?.pillarId === "nursing-test-bank"
                      ) {
                        isTestBankTopic = true;
                      } else if (nursingTestBankSubPages.length > 0) {
                        // Data is loaded, verify it's a test bank topic
                        // Pattern: [parentSubPageSlug]-[nestedSubPageSlug]-[topicSlug]
                        // The first part should match a parent subpage slug
                        const potentialParentSlug = testBankTopicMatch[1];
                        isTestBankTopic = nursingTestBankSubPages.some(
                          (subPage) => {
                            const subPageId = subPage.id || subPage.subPageId;
                            const subPageSlug = subPage.slug || subPageId;
                            // Check if the first part matches a parent subpage slug
                            return (
                              subPageId === potentialParentSlug ||
                              subPageSlug === potentialParentSlug ||
                              potentialParentSlug.startsWith(subPageSlug + "-")
                            );
                          }
                        );
                      } else {
                        // Data not loaded yet, but pattern matches - assume it could be a test bank topic
                        // We'll render with formatted labels and data will load async
                        isTestBankTopic = true;
                      }
                    }

                    if (isTestBankTopic && testBankTopicMatch) {
                      // Pattern: [parentSubPageSlug]-[nestedSubPageSlug]-[topicSlug]
                      // Extract from metadata if available, otherwise from pathname
                      let parentSubPageId = "";
                      let nestedSubPageId = "";
                      let topicId = "";

                      if (cachedMetadataForTopic) {
                        parentSubPageId =
                          cachedMetadataForTopic.subPageId || "";
                        nestedSubPageId =
                          cachedMetadataForTopic.nestedPageId || "";
                        topicId = cachedMetadataForTopic.topicId || "";
                      }

                      // Fallback to pathname extraction if metadata not available
                      if (
                        (!parentSubPageId || !nestedSubPageId || !topicId) &&
                        testBankTopicMatch
                      ) {
                        // Pattern: [parentSubPageSlug]-[nestedSubPageSlug]-[topicSlug]
                        // We need to identify which part is which
                        // For now, use the pattern: assume last part is topic, first part is parent
                        const fullMatch = testBankTopicMatch[0];
                        if (fullMatch) {
                          const parts = fullMatch.substring(1).split("-");
                          if (parts.length >= 3) {
                            // Try to match parent slug first
                            // const potentialParentSlug = parts[0];
                            // const potentialNestedSlug = parts
                            //   .slice(0, -1)
                            //   .join("-");
                            // const potentialTopicSlug = parts[parts.length - 1];

                            // For now, use simple extraction: last part is topic
                            if (!topicId) topicId = parts[parts.length - 1];
                            if (!nestedSubPageId)
                              nestedSubPageId = parts.slice(0, -1).join("-");
                            if (!parentSubPageId) parentSubPageId = parts[0];
                          }
                        }
                      }

                      // Find the parent sub-page to get its actual name and slug
                      const parentSubPage = nursingTestBankSubPages.find(
                        (subPage) => {
                          const subPageId = subPage.id || subPage.subPageId;
                          const subPageSlug = subPage.slug || subPageId;
                          return (
                            subPageId === parentSubPageId ||
                            subPageSlug === parentSubPageId
                          );
                        }
                      );
                      const parentSubPageName =
                        parentSubPage?.pageName ||
                        parentSubPage?.hero?.title ||
                        null;
                      const parentSubPageSlug =
                        parentSubPage?.slug || parentSubPageId;

                      // Try to find nested sub-page name from cache
                      const cacheKey = `test-bank-${parentSubPageId}`;
                      const nestedSubPages =
                        nestedSubPagesCache[cacheKey] || [];
                      const nestedSubPage = nestedSubPages.find((nsp: any) => {
                        const nspId = nsp.id || nsp.nestedSubPageId;
                        const nspSlug = nsp.slug || nspId;
                        return (
                          nspId === nestedSubPageId ||
                          nspSlug === nestedSubPageId
                        );
                      });
                      const nestedSubPageName =
                        nestedSubPage?.pageName ||
                        nestedSubPage?.hero?.title ||
                        nestedSubPage?.title ||
                        null;

                      // Load nested sub-pages if not in cache
                      if (!nestedSubPagesCache[cacheKey] && parentSubPageId) {
                        import("@/lib/firestore-operations").then(
                          ({ getNursingTestBankNestedSubPages }) => {
                            getNursingTestBankNestedSubPages(
                              parentSubPageId
                            ).then((result) => {
                              if (result.success && result.data) {
                                setNestedSubPagesCache((prev) => ({
                                  ...prev,
                                  [cacheKey]: result.data || [],
                                }));
                              }
                            });
                          }
                        );
                      }

                      // Try to find topic name
                      const topicCacheKey = `test-bank-topic-${parentSubPageId}-${nestedSubPageId}`;
                      const topicsCache =
                        (nestedSubPagesCache as any)[topicCacheKey] || [];
                      const topic = topicsCache.find((t: any) => {
                        const tId = t.id || t.topicId;
                        const tSlug = t.slug || tId;
                        return tId === topicId || tSlug === topicId;
                      });
                      const topicName =
                        topic?.pageName ||
                        topic?.hero?.title ||
                        topic?.title ||
                        null;

                      // Load topics if not in cache
                      if (
                        !topicsCache.length &&
                        parentSubPageId &&
                        nestedSubPageId
                      ) {
                        import("@/lib/firestore-operations").then(
                          ({ getNursingTestBankTopics }) => {
                            getNursingTestBankTopics(
                              parentSubPageId,
                              nestedSubPageId
                            ).then((result) => {
                              if (result.success && result.data) {
                                setNestedSubPagesCache((prev: any) => ({
                                  ...prev,
                                  [topicCacheKey]: result.data || [],
                                }));
                              }
                            });
                          }
                        );
                      }

                      // Show skeleton loader if we don't have all data
                      if (
                        !parentSubPageName ||
                        !nestedSubPageName ||
                        !topicName
                      ) {
                        return (
                          <>
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
                              href="/nursing-test-bank"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Test Bank
                            </Link>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <React.Fragment key={i}>
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
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              </React.Fragment>
                            ))}
                          </>
                        );
                      }

                      return (
                        <>
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
                            href="/nursing-test-bank"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Test Bank
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
                            href={`/${parentSubPageSlug}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {parentSubPageName}
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
                            href={`/${nestedSubPage?.slug || nestedSubPageId}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {nestedSubPageName}
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
                          <span className="text-gray-900 font-medium">
                            {topicName}
                          </span>
                        </>
                      );
                    }

                    // Check if it's a test bank nested sub-page (pattern: [parentSubPageSlug]-[nestedSubPageSlug])
                    // Use metadata to identify test bank pages
                    const pathSegments = pathname.split("/").filter((s) => s);
                    const pageSlug = pathSegments[0];
                    const cachedMetadata = pageMetadataCache[pageSlug];
                    const isTestBankNestedSubPage =
                      cachedMetadata?.type === "nested" &&
                      cachedMetadata?.pillarId === "nursing-test-bank";

                    let testBankNestedMatch: RegExpMatchArray | null = null;
                    let nestedSubPageId = "";
                    let parentSubPageId = "";

                    if (isTestBankNestedSubPage && cachedMetadata) {
                      // Extract IDs from metadata
                      parentSubPageId = cachedMetadata.subPageId || "";
                      nestedSubPageId = cachedMetadata.nestedPageId || "";
                      // Also try to match pattern [parentSlug]-[nestedSlug] from pathname
                      testBankNestedMatch = pathname.match(/^\/(.+)-(.+)$/);
                      if (testBankNestedMatch && !parentSubPageId) {
                        // Fallback: try to extract from pathname if metadata not available
                        nestedSubPageId = testBankNestedMatch[1];
                        parentSubPageId = testBankNestedMatch[2];
                      }
                    }

                    if (
                      isTestBankNestedSubPage &&
                      (parentSubPageId || testBankNestedMatch)
                    ) {
                      if (!parentSubPageId && testBankNestedMatch) {
                        nestedSubPageId = testBankNestedMatch[1];
                        parentSubPageId = testBankNestedMatch[2];
                      }

                      // Find the parent sub-page to get its actual name and slug
                      const parentSubPage = nursingTestBankSubPages.find(
                        (subPage) => {
                          const subPageId = subPage.id || subPage.subPageId;
                          const subPageSlug = subPage.slug || subPageId;
                          return (
                            subPageId === parentSubPageId ||
                            subPageSlug === parentSubPageId
                          );
                        }
                      );
                      const parentSubPageName =
                        parentSubPage?.pageName ||
                        parentSubPage?.hero?.title ||
                        null;
                      const parentSubPageSlug =
                        parentSubPage?.slug || parentSubPageId;

                      // Try to find nested sub-page name from cache
                      const cacheKey = `test-bank-${parentSubPageId}`;
                      const nestedSubPages =
                        nestedSubPagesCache[cacheKey] || [];
                      const nestedSubPage = nestedSubPages.find((nsp: any) => {
                        const nspId = nsp.id || nsp.nestedSubPageId;
                        const nspSlug = nsp.slug || nspId;
                        return (
                          nspId === nestedSubPageId ||
                          nspSlug === nestedSubPageId
                        );
                      });
                      const nestedSubPageName =
                        nestedSubPage?.pageName ||
                        nestedSubPage?.hero?.title ||
                        nestedSubPage?.title ||
                        null;

                      // Load nested sub-pages if not in cache
                      if (!nestedSubPagesCache[cacheKey] && parentSubPageId) {
                        import("@/lib/firestore-operations").then(
                          ({ getNursingTestBankNestedSubPages }) => {
                            getNursingTestBankNestedSubPages(
                              parentSubPageId
                            ).then((result) => {
                              if (result.success && result.data) {
                                setNestedSubPagesCache((prev) => ({
                                  ...prev,
                                  [cacheKey]: result.data || [],
                                }));
                              }
                            });
                          }
                        );
                      }

                      // Show skeleton loader if we don't have all data
                      if (!parentSubPageName || !nestedSubPageName) {
                        return (
                          <>
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
                              href="/nursing-test-bank"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Test Bank
                            </Link>
                            {Array.from({ length: 2 }).map((_, i) => (
                              <React.Fragment key={i}>
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
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              </React.Fragment>
                            ))}
                          </>
                        );
                      }

                      return (
                        <>
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
                            href="/nursing-test-bank"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Test Bank
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
                            href={`/${parentSubPageSlug}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {parentSubPageName}
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
                          <span className="font-medium">
                            {nestedSubPageName}
                          </span>
                        </>
                      );
                    }

                    // Check if it's a page ending in -exam (e.g., /hesi-a2-exam, /teas-exam)
                    // This must be checked BEFORE test bank patterns
                    const examPageMatch = pathname.match(
                      /^\/([^-]+(?:-[^-]+)*)-exam$/
                    );
                    if (examPageMatch) {
                      const subPageId = examPageMatch[1];
                      const cachedMetadata = pageMetadataCache[subPageId];

                      // If metadata is not loaded yet, show loading state
                      if (!cachedMetadata) {
                        return null;
                      }

                      const pageType = cachedMetadata.type;
                      const pillarId = cachedMetadata.pillarId;
                      const pageName = cachedMetadata.pageName || null;

                      // Handle type = "sub" with pillarId = "nursing-test-bank"
                      // Home > Nursing Test Bank > [Page Name]
                      if (
                        pageType === "sub" &&
                        pillarId === "nursing-test-bank"
                      ) {
                        // Show skeleton loader if we don't have page name
                        if (!pageName) {
                          return (
                            <>
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
                                href="/nursing-test-bank"
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                Nursing Test Bank
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
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            </>
                          );
                        }
                        return (
                          <>
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
                              href="/nursing-test-bank"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Test Bank
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
                            <span className="font-medium">{pageName}</span>
                          </>
                        );
                      }

                      // Handle type = "nested" (4 elements: Home > Nursing Test Bank > [Parent] > [Nested])
                      if (
                        pageType === "nested" &&
                        pillarId === "nursing-test-bank"
                      ) {
                        const parentId = cachedMetadata.parentId;
                        // Find parent sub-page
                        const parentSubPage = nursingTestBankSubPages.find(
                          (sp) => {
                            const spId = sp.id || sp.subPageId;
                            const spSlug = sp.slug || spId;
                            return spId === parentId || spSlug === parentId;
                          }
                        );
                        const parentSubPageName =
                          parentSubPage?.pageName ||
                          parentSubPage?.hero?.title ||
                          null;
                        const parentSubPageSlug =
                          parentSubPage?.slug || parentId;

                        // Load nested sub-pages if not in cache (for future use)
                        const cacheKey = `test-bank-${parentId}`;
                        if (!nestedSubPagesCache[cacheKey] && parentId) {
                          import("@/lib/firestore-operations").then(
                            ({ getNursingTestBankNestedSubPages }) => {
                              getNursingTestBankNestedSubPages(parentId).then(
                                (result) => {
                                  if (result.success && result.data) {
                                    setNestedSubPagesCache((prev) => ({
                                      ...prev,
                                      [cacheKey]: result.data || [],
                                    }));
                                  }
                                }
                              );
                            }
                          );
                        }

                        // Show skeleton loader if we don't have all data
                        if (!parentSubPageName || !pageName) {
                          return (
                            <>
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
                                href="/nursing-test-bank"
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                Nursing Test Bank
                              </Link>
                              {Array.from({ length: 2 }).map((_, i) => (
                                <React.Fragment key={i}>
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
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </React.Fragment>
                              ))}
                            </>
                          );
                        }

                        return (
                          <>
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
                              href="/nursing-test-bank"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Test Bank
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
                              href={`/${parentSubPageSlug}-test-bank`}
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              {parentSubPageName}
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
                            <span className="font-medium">{pageName}</span>
                          </>
                        );
                      }

                      // Handle type = "quiz" with pillarId != "nursing-test-bank"
                      // Home > [PillarPageName] > [Current Page Name]
                      if (
                        pageType === "quiz" &&
                        pillarId &&
                        pillarId !== "nursing-test-bank"
                      ) {
                        const pillarPage = pillarPages.find(
                          (p) => p.id === pillarId
                        );
                        const pillarPageName =
                          pillarPage?.pageName ||
                          formatBreadcrumbLabel(pillarId);

                        return (
                          <>
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
                              href={`/${pillarId}`}
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              {pillarPageName}
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
                            <span className="font-medium">{pageName}</span>
                          </>
                        );
                      }
                    }

                    // Check if it's a regular test bank sub-page (pattern: /[subPageId]-test-bank)
                    // Make sure this doesn't match nested sub-pages (which have two hyphens before -test-bank)
                    const testBankSubPageMatch =
                      pathname.match(/^\/(.+)-test-bank$/);
                    // Exclude nested sub-pages (they have pattern: /[nested]-[parent]-test-bank)
                    const isNotNestedSubPage =
                      testBankSubPageMatch &&
                      !pathname.match(/^\/[^-]+-[^-]+-test-bank$/);

                    if (testBankSubPageMatch && isNotNestedSubPage) {
                      const subPageId = testBankSubPageMatch[1];
                      const subPage = nursingTestBankSubPages.find((sp) => {
                        const spId = sp.id || sp.subPageId;
                        const spSlug = sp.slug || spId;
                        // Match by ID or slug (case-insensitive)
                        return (
                          (spId &&
                            spId.toLowerCase() === subPageId.toLowerCase()) ||
                          (spSlug &&
                            spSlug.toLowerCase() === subPageId.toLowerCase())
                        );
                      });
                      // Use pageName first, then hero.title
                      const subPageName =
                        subPage?.pageName || subPage?.hero?.title || null;

                      // Show skeleton loader if we don't have page name
                      if (!subPageName) {
                        return (
                          <>
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
                              href="/nursing-test-bank"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Test Bank
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
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </>
                        );
                      }

                      return (
                        <>
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
                            href="/nursing-test-bank"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Test Bank
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
                          <span className="font-medium">{subPageName}</span>
                        </>
                      );
                    }

                    // Check if it's a regular exit exam sub-page (pattern: /nursing-exit-exam/[subPageId])
                    const exitExamSubPageMatch = pathname.match(
                      /^\/nursing-exit-exam\/(.+)$/
                    );
                    if (exitExamSubPageMatch) {
                      const subPageId = exitExamSubPageMatch[1];
                      const subPage = nursingExitExamSubPages.find((sp) => {
                        const spId = sp.id || sp.subPageId;
                        return spId === subPageId || sp.slug === subPageId;
                      });
                      const subPageName =
                        subPage?.pageName || subPage?.hero?.title || null;

                      // Show skeleton loader if we don't have page name
                      if (!subPageName) {
                        return (
                          <>
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
                              href="/nursing-exit-exam"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Exit Exam
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
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </>
                        );
                      }

                      return (
                        <>
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
                            href="/nursing-exit-exam"
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            Nursing Exit Exam
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
                          <span className="font-medium">{subPageName}</span>
                        </>
                      );
                    }

                    // Check document type from metadata cache FIRST (most reliable)
                    const pathSegmentsForMetadata = pathname
                      .split("/")
                      .filter((s) => s);
                    const pageSlugForMetadata = pathSegmentsForMetadata[0];
                    const cachedMetadataForCheck =
                      pageMetadataCache[pageSlugForMetadata];
                    const pageType = cachedMetadataForCheck?.type;
                    const pillarId = cachedMetadataForCheck?.pillarId;

                    // Check if it's an exit exam subpage by checking against exit exam subpages list
                    // This prevents exit exam pages from being incorrectly identified as entrance exam pages
                    const segments = pathname.split("/").filter((s) => s);
                    const firstSegment = segments[0];
                    const isExitExamSubPage = nursingExitExamSubPages.some(
                      (subPage) => {
                        const subPageId = subPage.id || subPage.subPageId;
                        const subPageSlug = subPage.slug || subPageId;
                        return (
                          subPageId === firstSegment ||
                          subPageSlug === firstSegment
                        );
                      }
                    );

                    // If metadata indicates it's an exit exam page OR it matches an exit exam subpage, skip entrance exam checks
                    if (pillarId === "nursing-exit-exam" || isExitExamSubPage) {
                      // Exit exam pages are handled earlier in the code, so skip this section
                      // This prevents exit exam pages from being incorrectly identified as entrance exam pages
                    } else {
                      // Check if it's a nursing-entrance-exam sub-page
                      // First check using the heuristic function
                      const isNursingPage = isNursingEntranceExamPage(pathname);

                      // Also check against loaded sub-pages for more reliable detection
                      // Use the segments already defined above
                      const firstSegment = segments[0];
                      // Strip -exam suffix for comparison since sub-page IDs don't have it
                      const firstSegmentWithoutExam = firstSegment.endsWith(
                        "-exam"
                      )
                        ? firstSegment.slice(0, -5)
                        : firstSegment;
                      const isNursingSubPage = nursingSubPages.some(
                        (subPage) => {
                          const subPageId = subPage.id || subPage.subPageId;
                          const subPageSlug = subPage.slug || subPageId;
                          // Compare with and without -exam suffix, and also check slug
                          return (
                            subPageId === firstSegment ||
                            subPageId === firstSegmentWithoutExam ||
                            subPageSlug === firstSegment ||
                            subPageSlug === firstSegmentWithoutExam
                          );
                        }
                      );

                      // Check if it's a quiz page based on document type
                      const isQuizPage =
                        pageType === "quiz" &&
                        pillarId === "nursing-entrance-exam";

                      // Check if it's a nested sub-page based on document type
                      const isNestedNursingSubPage =
                        pageType === "nested" &&
                        pillarId === "nursing-entrance-exam" &&
                        pathSegments.length === 1;

                      // If it's a nursing-entrance-exam page or sub-page
                      if (
                        isNursingPage ||
                        isNursingSubPage ||
                        isNestedNursingSubPage ||
                        isQuizPage
                      ) {
                        return (
                          <>
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
                              href="/nursing-entrance-exam"
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              Nursing Entrance Exam
                            </Link>
                            {/* Show sub-page breadcrumbs */}
                            {(() => {
                              // Handle quiz page breadcrumbs using metadata
                              if (isQuizPage && cachedMetadata) {
                                const parentSubPageId =
                                  cachedMetadata.subPageId;
                                const nestedSubPageId =
                                  cachedMetadata.nestedPageId;
                                const quizSlug =
                                  pathSegments[1] || cachedMetadata.quizId;
                                if (
                                  !parentSubPageId ||
                                  !nestedSubPageId ||
                                  !quizSlug
                                ) {
                                  return null;
                                }
                                const quizCacheKey = `${parentSubPageId}-${nestedSubPageId}-${quizSlug}`;

                                // Find the parent sub-page to get its actual name
                                const parentSubPage = nursingSubPages.find(
                                  (subPage) => {
                                    const subPageId =
                                      subPage.id || subPage.subPageId;
                                    return (
                                      subPageId === parentSubPageId ||
                                      subPageId === parentSubPageId + "-exam"
                                    );
                                  }
                                );
                                const parentSubPageName =
                                  parentSubPage?.pageName ||
                                  parentSubPage?.hero?.title ||
                                  null;

                                // Try to find nested sub-page name from cache
                                const cacheKey = `entrance-${parentSubPageId}`;
                                const nestedSubPages =
                                  nestedSubPagesCache[cacheKey] || [];
                                const nestedSubPage = nestedSubPages.find(
                                  (nsp: any) => {
                                    const nspId = nsp.id || nsp.nestedSubPageId;
                                    return nspId === nestedSubPageId;
                                  }
                                );
                                const nestedSubPageName =
                                  nestedSubPage?.pageName ||
                                  nestedSubPage?.hero?.title ||
                                  nestedSubPage?.title ||
                                  null;

                                // Load nested sub-pages if not in cache
                                if (
                                  !nestedSubPagesCache[cacheKey] &&
                                  parentSubPageId
                                ) {
                                  import("@/lib/firestore-operations").then(
                                    ({ getNestedSubPages }) => {
                                      getNestedSubPages(parentSubPageId).then(
                                        (result) => {
                                          if (result.success && result.data) {
                                            setNestedSubPagesCache((prev) => ({
                                              ...prev,
                                              [cacheKey]: result.data || [],
                                            }));
                                          }
                                        }
                                      );
                                    }
                                  );
                                }

                                // Load quiz data to get quiz name if not in cache
                                if (
                                  !quizNamesCache[quizCacheKey] &&
                                  parentSubPageId &&
                                  nestedSubPageId &&
                                  quizSlug
                                ) {
                                  const parentId =
                                    parentSubPage?.id ||
                                    parentSubPage?.subPageId ||
                                    parentSubPageId;
                                  import("@/lib/firestore-operations").then(
                                    ({ getNursingEntranceExamQuiz }) => {
                                      getNursingEntranceExamQuiz(
                                        parentId,
                                        nestedSubPageId,
                                        quizSlug
                                      ).then((result) => {
                                        if (result.success && result.data) {
                                          const quizData = result.data as any;
                                          const quizName =
                                            quizData.pageName ||
                                            quizData.hero?.title ||
                                            null;
                                          if (quizName) {
                                            setQuizNamesCache((prev) => ({
                                              ...prev,
                                              [quizCacheKey]: quizName,
                                            }));
                                          }
                                        }
                                      });
                                    }
                                  );
                                }

                                const displayQuizName =
                                  quizNamesCache[quizCacheKey] || null;
                                // Get slugs from route mapping cache
                                const parentMappingKey = `nursing-entrance-exam:${parentSubPageId}`;
                                const nestedMappingKey = `nursing-entrance-exam:${nestedSubPageId}`;
                                const parentRouteMapping =
                                  routeMappingCache[parentMappingKey] ||
                                  routeMappingCache[parentSubPage?.slug || ""];
                                const nestedRouteMapping =
                                  routeMappingCache[nestedMappingKey] ||
                                  routeMappingCache[nestedSubPage?.slug || ""];

                                const parentUrlSlug =
                                  parentRouteMapping?.slug ||
                                  parentSubPage?.slug ||
                                  parentSubPageId;
                                const nestedSubPageUrl =
                                  nestedRouteMapping?.slug ||
                                  nestedSubPage?.slug ||
                                  nestedSubPageId;

                                return (
                                  <>
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
                                      href={`/${parentUrlSlug}`}
                                      className="hover:text-blue-600 transition-colors font-medium"
                                    >
                                      {parentSubPageName}
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
                                      href={`/${nestedSubPageUrl}`}
                                      className="hover:text-blue-600 transition-colors font-medium"
                                    >
                                      {nestedSubPageName}
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
                                    <span className="font-medium">
                                      {displayQuizName}
                                    </span>
                                  </>
                                );
                              }

                              // Check if it's a nested sub-page using metadata
                              if (isNestedNursingSubPage && cachedMetadata) {
                                const parentSubPageId =
                                  cachedMetadata.subPageId;
                                const nestedSubPageId =
                                  cachedMetadata.nestedPageId;
                                if (!parentSubPageId || !nestedSubPageId) {
                                  return null;
                                }

                                // Find the parent sub-page to get its actual name
                                const parentSubPage = nursingSubPages.find(
                                  (subPage) => {
                                    const subPageId =
                                      subPage.id || subPage.subPageId;
                                    return (
                                      subPageId === parentSubPageId ||
                                      subPageId === parentSubPageId + "-exam"
                                    );
                                  }
                                );
                                const parentSubPageName =
                                  parentSubPage?.pageName ||
                                  parentSubPage?.hero?.title ||
                                  null;

                                // Try to find nested sub-page name from cache
                                const cacheKey = `entrance-${parentSubPageId}`;
                                const nestedSubPages =
                                  nestedSubPagesCache[cacheKey] || [];
                                const nestedSubPage = nestedSubPages.find(
                                  (nsp: any) => {
                                    const nspId = nsp.id || nsp.nestedSubPageId;
                                    return nspId === nestedSubPageId;
                                  }
                                );
                                const nestedSubPageName =
                                  nestedSubPage?.pageName ||
                                  nestedSubPage?.hero?.title ||
                                  nestedSubPage?.title ||
                                  null;

                                // Load nested sub-pages if not in cache
                                if (
                                  !nestedSubPagesCache[cacheKey] &&
                                  parentSubPageId
                                ) {
                                  import("@/lib/firestore-operations").then(
                                    ({ getNestedSubPages }) => {
                                      getNestedSubPages(parentSubPageId).then(
                                        (result) => {
                                          if (result.success && result.data) {
                                            setNestedSubPagesCache((prev) => ({
                                              ...prev,
                                              [cacheKey]: result.data || [],
                                            }));
                                          }
                                        }
                                      );
                                    }
                                  );
                                }

                                // Get slug from route mapping cache or sub-page data
                                const parentMappingKey = `nursing-entrance-exam:${parentSubPageId}`;
                                const parentRouteMapping =
                                  routeMappingCache[parentMappingKey] ||
                                  routeMappingCache[parentSubPage?.slug || ""];
                                const parentSubPageSlug =
                                  parentRouteMapping?.slug ||
                                  parentSubPage?.slug ||
                                  parentSubPageId;

                                // Show skeleton loader if we don't have all data
                                if (!parentSubPageName || !nestedSubPageName) {
                                  return (
                                    <>
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
                                        href="/nursing-entrance-exam"
                                        className="hover:text-blue-600 transition-colors font-medium"
                                      >
                                        Nursing Entrance Exam
                                      </Link>
                                      {Array.from({ length: 2 }).map((_, i) => (
                                        <React.Fragment key={i}>
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
                                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                        </React.Fragment>
                                      ))}
                                    </>
                                  );
                                }

                                return (
                                  <>
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
                                      href={`/${parentSubPageSlug}`}
                                      className="hover:text-blue-600 transition-colors font-medium"
                                    >
                                      {parentSubPageName}
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
                                    <span className="font-medium">
                                      {nestedSubPageName}
                                    </span>
                                  </>
                                );
                              }
                              // Regular sub-page - strip -exam suffix for display
                              let subPageId = pathname.replace("/", "");
                              if (subPageId.endsWith("-exam")) {
                                subPageId = subPageId.slice(0, -5);
                              }

                              // Find the sub-page to get its actual name
                              const subPage = nursingSubPages.find((sp) => {
                                const spId = sp.id || sp.subPageId;
                                return (
                                  spId === subPageId ||
                                  spId === subPageId + "-exam" ||
                                  sp.slug === subPageId
                                );
                              });
                              const subPageName =
                                subPage?.pageName ||
                                subPage?.hero?.title ||
                                null;

                              // Show skeleton loader if we don't have page name
                              if (!subPageName) {
                                return (
                                  <>
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
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                  </>
                                );
                              }

                              return (
                                <>
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
                                  <span className="font-medium">
                                    {subPageName}
                                  </span>
                                </>
                              );
                            })()}
                          </>
                        );
                      }
                    }

                    // Check for dynamic pages using page metadata (type-based breadcrumbs)
                    // This handles all dynamic pages across all pillar pages
                    const pathSegmentsForDynamic = pathname
                      .split("/")
                      .filter((s) => s);
                    if (pathSegmentsForDynamic.length === 1) {
                      const pageSlug = pathSegmentsForDynamic[0];
                      const cachedMetadata = pageMetadataCache[pageSlug];
                      // const currentRouteMapping = routeMappingCache[pageSlug];

                      // If metadata exists, use type-based breadcrumb logic
                      if (cachedMetadata) {
                        const pageType = cachedMetadata.type;
                        const pillarId = cachedMetadata.pillarId;
                        const pageName = cachedMetadata.pageName || null;

                        // Handle type = "sub" - Home > [PillarPageName] > [SubPageName]
                        if (pageType === "sub" && pillarId) {
                          const pillarPage = pillarPages.find(
                            (p) => p.id === pillarId
                          );
                          const pillarPageName =
                            pillarPage?.pageName ||
                            formatBreadcrumbLabel(pillarId);

                          // Show skeleton loader if we don't have page name
                          if (!pageName) {
                            return (
                              <>
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
                                  href={`/${pillarId}`}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {pillarPageName}
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
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              </>
                            );
                          }

                          return (
                            <>
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
                                href={`/${pillarId}`}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {pillarPageName}
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
                              <span className="font-medium">{pageName}</span>
                            </>
                          );
                        }

                        // Handle type = "nested" - Home > [PillarPageName] > [SubPageName] > [NestedPageName]
                        if (pageType === "nested" && pillarId) {
                          const pillarPage = pillarPages.find(
                            (p) => p.id === pillarId
                          );
                          const pillarPageName =
                            pillarPage?.pageName ||
                            formatBreadcrumbLabel(pillarId);

                          // Check if we have nested page breadcrumb data for nursing-entrance-exam
                          if (
                            pillarId === "nursing-entrance-exam" &&
                            nestedPageBreadcrumbData
                          ) {
                            // Show skeleton loader while loading
                            if (nestedPageBreadcrumbData.loading) {
                              return (
                                <>
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
                                    href={`/${pillarId}`}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {pillarPageName}
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
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
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
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </>
                              );
                            }

                            // Render breadcrumbs with fetched data
                            const parentUrl = `/${nestedPageBreadcrumbData.parentSubPageSlug}-exam`;
                            return (
                              <>
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
                                  href={`/${pillarId}`}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {pillarPageName}
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
                                  href={parentUrl}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {nestedPageBreadcrumbData.parentSubPageName}
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
                                <span className="font-medium">
                                  {nestedPageBreadcrumbData.nestedPageName}
                                </span>
                              </>
                            );
                          }

                          // Fallback to original logic for other pillar pages
                          const subPageId = cachedMetadata.subPageId;
                          const subPageMappingKey = `${pillarId}:${subPageId}`;
                          const subPageMapping =
                            routeMappingCache[subPageMappingKey];

                          let parentSubPageName: string | null = null;
                          let parentSubPageSlug = subPageId || "";

                          if (subPageMapping) {
                            parentSubPageSlug = (subPageMapping as any).slug;
                            if (pillarId === "nursing-test-bank") {
                              const parentSubPage =
                                nursingTestBankSubPages.find((sp) => {
                                  const spId = sp.id || sp.subPageId;
                                  return spId === subPageId;
                                });
                              parentSubPageName =
                                parentSubPage?.pageName ||
                                parentSubPage?.hero?.title ||
                                null;
                            } else if (pillarId === "nursing-exit-exam") {
                              const parentSubPage =
                                nursingExitExamSubPages.find((sp) => {
                                  const spId = sp.id || sp.subPageId;
                                  return spId === subPageId;
                                });
                              parentSubPageName =
                                parentSubPage?.pageName ||
                                parentSubPage?.hero?.title ||
                                null;
                            }
                          } else {
                            return null;
                          }

                          // Show skeleton loader if we don't have all data
                          if (!parentSubPageName || !cachedMetadata.pageName) {
                            return (
                              <>
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
                                  href={`/${pillarId}`}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {pillarPageName}
                                </Link>
                                {Array.from({ length: 2 }).map((_, i) => (
                                  <React.Fragment key={i}>
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
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                  </React.Fragment>
                                ))}
                              </>
                            );
                          }

                          let parentUrl = `/${parentSubPageSlug}`;
                          if (pillarId === "nursing-test-bank") {
                            parentUrl = `/${parentSubPageSlug}-test-bank`;
                          } else if (pillarId === "nursing-exit-exam") {
                            parentUrl = `/nursing-exit-exam/${parentSubPageSlug}`;
                          }

                          return (
                            <>
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
                                href={`/${pillarId}`}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {pillarPageName}
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
                                href={parentUrl}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {parentSubPageName}
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
                              <span className="font-medium">
                                {cachedMetadata.pageName}
                              </span>
                            </>
                          );
                        }

                        // Handle type = "topic" - Home > [PillarPageName] > [SubPageName] > [NestedPageName] > [TopicName]
                        if (pageType === "topic" && pillarId) {
                          const pillarPage = pillarPages.find(
                            (p) => p.id === pillarId
                          );
                          const pillarPageName =
                            pillarPage?.pageName ||
                            formatBreadcrumbLabel(pillarId);
                          const subPageId = cachedMetadata.subPageId;
                          const nestedPageId = cachedMetadata.nestedPageId;

                          // Get parent route mappings
                          const subPageMappingKey = `${pillarId}:${subPageId}`;
                          const nestedPageMappingKey = `${pillarId}:${nestedPageId}`;
                          const subPageMapping =
                            routeMappingCache[subPageMappingKey];
                          const nestedPageMapping =
                            routeMappingCache[nestedPageMappingKey];

                          let parentSubPageName: string | null = null;
                          let parentSubPageSlug = subPageId || "";
                          let nestedPageName: string | null = null;
                          let nestedPageSlug = nestedPageId || "";

                          if (subPageMapping) {
                            parentSubPageSlug = subPageMapping.slug;
                            // Get page name from loaded sub-pages
                            if (pillarId === "nursing-test-bank") {
                              const parentSubPage =
                                nursingTestBankSubPages.find((sp) => {
                                  const spId = sp.id || sp.subPageId;
                                  return spId === subPageId;
                                });
                              parentSubPageName =
                                parentSubPage?.pageName ||
                                parentSubPage?.hero?.title ||
                                null;
                            }
                          } else if (subPageId) {
                            // Load parent route mapping if not cached
                            import("firebase/firestore").then(
                              ({ collection, query, where, getDocs }) => {
                                import("@/lib/firebase").then(({ db }) => {
                                  const routeMappingsRef = collection(
                                    db,
                                    "routeMappings"
                                  );
                                  const subPageQuery = query(
                                    routeMappingsRef,
                                    where("pillarId", "==", pillarId),
                                    where("type", "==", "sub")
                                  );
                                  getDocs(subPageQuery).then((snapshot) => {
                                    const subPageDoc = snapshot.docs.find(
                                      (doc) => {
                                        const data = doc.data();
                                        return (
                                          data.refPath?.includes(
                                            `/subPages/${subPageId}`
                                          ) || data.subPageId === subPageId
                                        );
                                      }
                                    );
                                    if (subPageDoc) {
                                      setRouteMappingCache((prev) => ({
                                        ...prev,
                                        [subPageMappingKey]: subPageDoc.data(),
                                      }));
                                    }
                                  });
                                });
                              }
                            );
                          }

                          if (nestedPageMapping) {
                            nestedPageSlug = nestedPageMapping.slug;
                            nestedPageName =
                              formatBreadcrumbLabel(nestedPageSlug);
                          } else if (nestedPageId) {
                            // Load nested page route mapping if not cached
                            import("@/lib/firestore-operations").then(
                              ({ getRouteMappingById }) => {
                                getRouteMappingById({
                                  pillarId: pillarId,
                                  type: "nested",
                                  id: nestedPageId,
                                  subPageId: subPageId || null,
                                }).then((result) => {
                                  if (result.success && result.data) {
                                    setRouteMappingCache((prev) => ({
                                      ...prev,
                                      [nestedPageMappingKey]: result.data,
                                    }));
                                  }
                                });
                              }
                            );
                          }

                          // Determine URLs based on pillarId
                          let parentUrl = `/${parentSubPageSlug}`;
                          let nestedUrl = `/${parentSubPageSlug}-${nestedPageSlug}`;
                          if (pillarId === "nursing-test-bank") {
                            parentUrl = `/${parentSubPageSlug}-test-bank`;
                            nestedUrl = `/${nestedPageSlug}-${parentSubPageSlug}-test-bank`;
                          } else if (pillarId === "nursing-entrance-exam") {
                            parentUrl = `/${parentSubPageSlug}-exam`;
                            nestedUrl = `/${parentSubPageSlug}-${nestedPageSlug}-questions`;
                          } else if (pillarId === "nursing-exit-exam") {
                            // Exit exam: /[parentSlug] and /[nestedSlug] (nested slug already contains parent prefix)
                            parentUrl = `/${parentSubPageSlug}`;
                            nestedUrl = `/${nestedPageSlug}`;
                          }

                          return (
                            <>
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
                                href={`/${pillarId}`}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {pillarPageName}
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
                                href={parentUrl}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {parentSubPageName}
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
                                href={nestedUrl}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {nestedPageName}
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
                              <span className="font-medium">{pageName}</span>
                            </>
                          );
                        }

                        // Handle type = "quiz" - Home > [PillarPageName] > [SubPageName] > [NestedPageName] > [QuizName]
                        if (pageType === "quiz" && pillarId) {
                          const pillarPage = pillarPages.find(
                            (p) => p.id === pillarId
                          );
                          const pillarPageName =
                            pillarPage?.pageName ||
                            formatBreadcrumbLabel(pillarId);
                          // Check if we have quiz page breadcrumb data for nursing-entrance-exam
                          if (
                            (pillarId === "nursing-entrance-exam" ||
                              pillarId === "nursing-exit-exam" ||
                              pillarId === "nursing-test-bank") &&
                            quizPageBreadcrumbData
                          ) {
                            // Show skeleton loader while loading
                            if (quizPageBreadcrumbData.loading) {
                              return (
                                <>
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
                                    href={`/${pillarId}`}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {pillarPageName}
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
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
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
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
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
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </>
                              );
                            }
                            // Render breadcrumbs with fetched data
                            if (pillarId === "nursing-test-bank") {
                              // For nursing test bank: Home > Nursing Test Bank > Sub Page > Nested Page > Topic > Quiz
                              const parentUrl = `/${quizPageBreadcrumbData.parentSubPageSlug}`;
                              const nestedUrl = `/${quizPageBreadcrumbData.nestedPageSlug}`;
                              const topicUrl = `/${
                                quizPageBreadcrumbData.topicSlug || ""
                              }`;
                              return (
                                <>
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
                                    href={`/${pillarId}`}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {pillarPageName}
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
                                    href={parentUrl}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {quizPageBreadcrumbData.parentSubPageName}
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
                                    href={nestedUrl}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {quizPageBreadcrumbData.nestedPageName}
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
                                    href={topicUrl}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {quizPageBreadcrumbData.topicName}
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
                                  <span className="font-medium">
                                    {quizPageBreadcrumbData.quizName}
                                  </span>
                                </>
                              );
                            } else {
                              // For entrance/exit exam: Home > Category > Sub Page > Nested Page > Quiz
                              // Use slugs directly from route mapping cache (same pattern for both)
                              const parentUrl = `/${quizPageBreadcrumbData.parentSubPageSlug}`;
                              const nestedUrl = `/${quizPageBreadcrumbData.nestedPageSlug}`;

                              return (
                                <>
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
                                    href={`/${pillarId}`}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {pillarPageName}
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
                                    href={parentUrl}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {quizPageBreadcrumbData.parentSubPageName}
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
                                    href={nestedUrl}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {quizPageBreadcrumbData.nestedPageName}
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
                                  <span className="font-medium">
                                    {quizPageBreadcrumbData.quizName}
                                  </span>
                                </>
                              );
                            }
                          }

                          // Fallback to original logic for other pillar pages
                          const subPageId = cachedMetadata.subPageId;
                          const nestedPageId = cachedMetadata.nestedPageId;
                          const topicId = cachedMetadata.topicId;
                          const quizId = cachedMetadata.quizId;
                          const pathSegments = pathname
                            .split("/")
                            .filter((s) => s);
                          const quizSlug =
                            pathSegments[1] || quizId || pathSegments[0];

                          const subPageMappingKey = `${pillarId}:${subPageId}`;
                          const nestedPageMappingKey = `${pillarId}:${nestedPageId}`;
                          const topicMappingKey = topicId
                            ? `${pillarId}:${topicId}`
                            : null;
                          const subPageMapping =
                            routeMappingCache[subPageMappingKey];
                          const nestedPageMapping =
                            routeMappingCache[nestedPageMappingKey];
                          const topicMapping = topicMappingKey
                            ? routeMappingCache[topicMappingKey]
                            : null;

                          // Try to get actual names from loaded data, don't use formatted slugs
                          let parentSubPageName: string | null = null;
                          let parentSubPageSlug = subPageId || "";
                          const nestedPageName: string | null = null;
                          let nestedPageSlug = nestedPageId || "";
                          const topicName: string | null = null;
                          let topicSlug = topicId || "";
                          let displayQuizName: string | null = null;

                          if (subPageMapping) {
                            parentSubPageSlug = subPageMapping.slug;
                            if (pillarId === "nursing-exit-exam") {
                              const parentSubPage =
                                nursingExitExamSubPages.find((sp) => {
                                  const spId = sp.id || sp.subPageId;
                                  return spId === subPageId;
                                });
                              parentSubPageName =
                                parentSubPage?.pageName ||
                                parentSubPage?.hero?.title ||
                                null;
                            } else if (pillarId === "nursing-test-bank") {
                              const parentSubPage =
                                nursingTestBankSubPages.find((sp) => {
                                  const spId = sp.id || sp.subPageId;
                                  return spId === subPageId;
                                });
                              parentSubPageName =
                                parentSubPage?.pageName ||
                                parentSubPage?.hero?.title ||
                                null;
                            }
                          }

                          if (nestedPageMapping) {
                            nestedPageSlug = nestedPageMapping.slug;
                            // Don't set nestedPageName from mapping, only from actual data
                          }

                          if (topicMapping) {
                            topicSlug = topicMapping.slug;
                            // Don't set topicName from mapping, only from actual data
                          }

                          // Check if we have quiz name in cache
                          if (quizSlug && subPageId && nestedPageId) {
                            const quizCacheKey =
                              pillarId === "nursing-test-bank"
                                ? `${subPageId}-${nestedPageId}-${topicId}-${quizSlug}`
                                : `${subPageId}-${nestedPageId}-${quizSlug}`;
                            displayQuizName =
                              quizNamesCache[quizCacheKey] || null;
                          }

                          // If we don't have actual names, show skeleton loader
                          const hasAllData =
                            parentSubPageName &&
                            nestedPageName &&
                            (pillarId !== "nursing-test-bank" || topicName) &&
                            displayQuizName;

                          if (!hasAllData) {
                            // Show skeleton loader
                            const skeletonCount =
                              pillarId === "nursing-test-bank" ? 5 : 4;
                            return (
                              <>
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
                                  href={`/${pillarId}`}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {pillarPageName}
                                </Link>
                                {Array.from({ length: skeletonCount }).map(
                                  (_, i) => (
                                    <React.Fragment key={i}>
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
                                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                    </React.Fragment>
                                  )
                                )}
                              </>
                            );
                          }

                          const parentUrl = `/${parentSubPageSlug}`;
                          const nestedUrl = `/${parentSubPageSlug}-${nestedPageSlug}`;
                          const topicUrl = topicSlug ? `/${topicSlug}` : "";
                          // For exit exam, URLs follow the same pattern (no prefix/suffix needed)
                          // parentUrl: /[parentSlug]
                          // nestedUrl: /[parentSlug]-[nestedSlug]

                          // For nursing test bank quiz pages, show: Home > Nursing Test Bank > Sub Page > Nested Page > Topic > Quiz
                          if (pillarId === "nursing-test-bank" && topicId) {
                            return (
                              <>
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
                                  href={`/${pillarId}`}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {pillarPageName}
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
                                  href={parentUrl}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {parentSubPageName}
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
                                  href={nestedUrl}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {nestedPageName}
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
                                {topicUrl && topicName ? (
                                  <Link
                                    href={topicUrl}
                                    className="hover:text-blue-600 transition-colors font-medium"
                                  >
                                    {topicName}
                                  </Link>
                                ) : (
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                )}
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
                                {displayQuizName ? (
                                  <span className="font-medium">
                                    {displayQuizName}
                                  </span>
                                ) : (
                                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                )}
                              </>
                            );
                          }

                          // For other quiz pages (entrance/exit exam)
                          return (
                            <>
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
                                href={`/${pillarId}`}
                                className="hover:text-blue-600 transition-colors font-medium"
                              >
                                {pillarPageName}
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
                              {parentSubPageName ? (
                                <Link
                                  href={parentUrl}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {parentSubPageName}
                                </Link>
                              ) : (
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              )}
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
                              {nestedPageName ? (
                                <Link
                                  href={nestedUrl}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {nestedPageName}
                                </Link>
                              ) : (
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              )}
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
                              {displayQuizName ? (
                                <span className="font-medium">
                                  {displayQuizName}
                                </span>
                              ) : (
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              )}
                            </>
                          );
                        }
                      }
                    }

                    // For other pages, check if it's a pillar page or service page
                    const otherSegments = pathname.split("/").filter((s) => s);
                    if (otherSegments.length === 0) return null;

                    // Check if it's a pillar page (e.g., /nursing, /teas)
                    // IMPORTANT: Exclude nursing-entrance-exam, nursing-exit-exam, and nursing-test-bank
                    // as they are handled above
                    const otherFirstSegment = otherSegments[0];
                    if (
                      otherFirstSegment === "nursing-entrance-exam" ||
                      otherFirstSegment === "nursing-exit-exam" ||
                      otherFirstSegment === "nursing-test-bank"
                    ) {
                      return null;
                    }
                    const pillarPage = pillarPages.find(
                      (p) => p.id === otherFirstSegment
                    );

                    if (pillarPage) {
                      // It's a pillar page or its service page
                      const pillarPageName =
                        pillarPage.pageName ||
                        formatBreadcrumbLabel(pillarPage.id);

                      if (otherSegments.length === 1) {
                        // Just the pillar page
                        return (
                          <>
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
                            <span className="font-medium">
                              {pillarPageName}
                            </span>
                          </>
                        );
                      } else if (otherSegments.length === 2) {
                        // Pillar page > Service page (e.g., /nursing/community-health)
                        const categoryId = otherSegments[1];
                        const categories =
                          pillarCategories[pillarPage.id] || [];
                        const category = categories.find((cat: any) => {
                          const catId = cat.servicePageId || cat.id;
                          return catId === categoryId;
                        });
                        const categoryName =
                          category?.hero?.title ||
                          category?.pageName ||
                          formatBreadcrumbLabel(categoryId);

                        return (
                          <>
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
                              href={`/${otherFirstSegment}`}
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              {pillarPageName}
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
                            <span className="font-medium">{categoryName}</span>
                          </>
                        );
                      }
                    }

                    // For simple pages like /teas, /how-it-works, /about, etc.
                    const pageNameMap: Record<string, string> = {
                      teas: "TEAS",
                      "how-it-works": "How It Works",
                      about: "About",
                      prices: "Prices",
                      faqs: "FAQs",
                      contact: "Contact",
                      dashboard: "Dashboard",
                      profile: "Profile",
                      referrals: "Referrals",
                      payments: "Payments",
                    };

                    const pageName =
                      pageNameMap[otherFirstSegment] ||
                      formatBreadcrumbLabel(otherFirstSegment);

                    return (
                      <>
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
                        <span className="font-medium">{pageName}</span>
                      </>
                    );
                  })()}
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
          );
        })()}

        {/* Main content with padding for mobile header */}
        <main className="md:pt-0 pt-16">{children}</main>
        <Footer />
      </div>
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}

function LayoutWithoutSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header showLogo={true} />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}

export default function Layout({ children, showSidebar }: LayoutProps) {
  const pathname = usePathname();
  const [sidebarEnabled, setSidebarEnabled] = useState<boolean | null>(null);

  // Determine if sidebar should be shown based on pathname
  useEffect(() => {
    // If explicitly set, use that value
    if (showSidebar !== undefined) {
      setSidebarEnabled(showSidebar);
      return;
    }

    // Exclude these routes from showing sidebar
    const excludedRoutes = [
      "/", // Homepage
      "/login",
      "/register",
      "/forgot-password",
    ];

    // Check if pathname starts with excluded routes
    if (excludedRoutes.includes(pathname)) {
      setSidebarEnabled(false);
      return;
    }

    // Exclude blog pages
    if (pathname.startsWith("/blog")) {
      setSidebarEnabled(false);
      return;
    }

    // Exclude admin panel
    if (pathname.startsWith("/admin")) {
      setSidebarEnabled(false);
      return;
    }

    // Show sidebar for all other pages
    setSidebarEnabled(true);
  }, [pathname, showSidebar]);

  // Show loading state or default to showing sidebar during hydration
  if (sidebarEnabled === null) {
    // Default to showing sidebar during initial render to avoid hydration mismatch
    return (
      <SidebarProvider>
        <LayoutWithSidebar>{children}</LayoutWithSidebar>
      </SidebarProvider>
    );
  }

  if (sidebarEnabled) {
    return (
      <SidebarProvider>
        <LayoutWithSidebar>{children}</LayoutWithSidebar>
      </SidebarProvider>
    );
  }

  return <LayoutWithoutSidebar>{children}</LayoutWithoutSidebar>;
}
