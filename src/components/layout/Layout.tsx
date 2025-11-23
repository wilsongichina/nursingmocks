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
  if (excludedRoutes.some((route) => {
    // Exact match
    if (normalizedPath === route) return true;
    // Path starts with route followed by a slash (e.g., /hesi-a2/...)
    if (normalizedPath.startsWith(route + "/")) return true;
    return false;
  })) {
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
  const [quizNamesCache, setQuizNamesCache] = useState<
    Record<string, string>
  >({});
  const [breadcrumbDataLoaded, setBreadcrumbDataLoaded] = useState(false);

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

  // Load quiz names for breadcrumbs when pathname changes
  useEffect(() => {
    const loadQuizName = async () => {
      const pathSegments = pathname.split("/").filter((s) => s);
      const isQuizPage =
        pathSegments.length === 2 &&
        pathSegments[0].endsWith("-questions");
      
      if (isQuizPage && nursingSubPages.length > 0) {
        const nestedMatch = pathSegments[0].match(/^(.+)-(.+)-questions$/);
        if (nestedMatch) {
          const parentSubPageId = nestedMatch[1];
          const nestedSubPageId = nestedMatch[2];
          const quizSlug = pathSegments[1];
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
            const parentId = parentSubPage.id || parentSubPage.subPageId || parentSubPageId;
            const {
              getNursingEntranceExamQuiz,
            } = await import("@/lib/firestore-operations");
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
        }
      }
    };

    loadQuizName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, nursingSubPages]);

  // Reload test bank sub-pages when navigating to test bank pages to ensure fresh data
  useEffect(() => {
    const isTestBankPage =
      pathname === "/nursing-test-bank" ||
      pathname.match(/^\/.+-test-bank$/) ||
      pathname.match(/^\/.+-.+-test-bank$/) ||
      pathname.match(/^\/.+-.+-.+-test-bank$/) ||
      // Also match topic pattern: [nestedSubPageId]-[parentSubPageId]-[topicId]
      (pathname.match(/^\/(.+)-(.+)-(.+)$/) &&
        !pathname.match(/^\/(.+)-(.+)-test-bank$/) &&
        !pathname.match(/^\/(.+)-(.+)-exit-exam$/) &&
        !pathname.match(/^\/(.+)-(.+)-questions$/));

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
  }, [pathname, nursingTestBankSubPages.length]);

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
      <Sidebar />
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
                      // Determine number of breadcrumb items based on pathname
                      const pathSegments = pathname.split("/").filter((s) => s);
                      let skeletonCount = 1; // At least one (the main category)
                      
                      // Check for quiz pages (Home > Category > Parent > Nested > Quiz = 4 items)
                      const isQuizPage = pathSegments.length === 2 && (
                        pathSegments[0].endsWith("-questions") ||
                        pathSegments[0].endsWith("-exit-exam")
                      );
                      
                      // Check for nested sub-pages (Home > Category > Parent > Nested = 3 items)
                      const isNestedSubPage = pathSegments.length === 1 && (
                        pathname.match(/^\/.+-.+-questions$/) ||
                        pathname.match(/^\/.+-.+-exit-exam$/) ||
                        pathname.match(/^\/.+-.+-test-bank$/)
                      );
                      
                      // Check for regular sub-pages (Home > Category > SubPage = 2 items)
                      const isRegularSubPage = pathSegments.length === 1 && !isNestedSubPage;
                      
                      if (isQuizPage) {
                        skeletonCount = 4; // Home > Category > Parent > Nested > Quiz
                      } else if (isNestedSubPage) {
                        skeletonCount = 3; // Home > Category > Parent > Nested
                      } else if (isRegularSubPage) {
                        skeletonCount = 2; // Home > Category > SubPage
                      }
                      
                      // Render skeleton loaders
                      return (
                        <>
                          {Array.from({ length: skeletonCount }).map((_, index) => (
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
                          ))}
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

                    // Check if it's an exit exam quiz page FIRST (pattern: /{nested}-{parent}-exit-exam/{quizSlug})
                    const pathSegmentsForExitExam = pathname.split("/").filter((s) => s);
                    const isExitExamQuizPage =
                      pathSegmentsForExitExam.length === 2 &&
                      pathSegmentsForExitExam[0].endsWith("-exit-exam");
                    const exitExamQuizNestedMatch = isExitExamQuizPage
                      ? pathSegmentsForExitExam[0].match(/^(.+)-(.+)-exit-exam$/)
                      : null;

                    // Check if it's an exit exam nested sub-page (pattern: [nestedSubPageId]-[parentSubPageId]-exit-exam)
                    const exitExamNestedMatch = pathname.match(
                      /^\/(.+)-(.+)-exit-exam$/
                    );
                    const isExitExamNestedSubPage =
                      exitExamNestedMatch &&
                      !isExitExamQuizPage && // Exclude exit exam quiz pages
                      nursingExitExamSubPages.some((subPage) => {
                        const subPageId = subPage.id || subPage.subPageId;
                        const parentId = exitExamNestedMatch[2]; // parentSubPageId is the second group
                        return subPageId === parentId;
                      });

                    // Handle exit exam quiz page breadcrumbs
                    if (isExitExamQuizPage && exitExamQuizNestedMatch) {
                      const nestedSubPageId = exitExamQuizNestedMatch[1];
                      const parentSubPageId = exitExamQuizNestedMatch[2];
                      const quizSlug = pathSegmentsForExitExam[1];
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
                        formatBreadcrumbLabel(parentSubPageId);

                      // Try to find nested sub-page name from cache or use formatted ID
                      const cacheKey = `exit-${parentSubPageId}`;
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
                        formatBreadcrumbLabel(nestedSubPageId);

                      // Load nested sub-pages if not in cache
                      if (
                        !nestedSubPagesCache[cacheKey] &&
                        parentSubPageId
                      ) {
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

                      // Load quiz data to get quiz name if not in cache
                      if (!quizNamesCache[quizCacheKey] && parentSubPageId && nestedSubPageId && quizSlug) {
                        const parentId = parentSubPage?.id || parentSubPage?.subPageId || parentSubPageId;
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
                            });
                          }
                        );
                      }

                      const displayQuizName = quizNamesCache[quizCacheKey] || formatBreadcrumbLabel(quizSlug);
                      const nestedSubPageUrl = `/${nestedSubPageId}-${parentSubPageId}-exit-exam`;
                      const parentSubPageUrl = `/nursing-exit-exam/${parentSubPageId}`;

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
                            href={parentSubPageUrl}
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
                            href={nestedSubPageUrl}
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

                    if (isExitExamNestedSubPage && exitExamNestedMatch) {
                      const nestedSubPageId = exitExamNestedMatch[1];
                      const parentSubPageId = exitExamNestedMatch[2];

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
                        formatBreadcrumbLabel(parentSubPageId);

                      // Try to find nested sub-page name from cache or use formatted ID
                      const cacheKey = `exit-${parentSubPageId}`;
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
                        formatBreadcrumbLabel(nestedSubPageId);

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
                            href={`/nursing-exit-exam/${parentSubPageId}`}
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

                    // Check if it's a test bank topic (pattern: [nestedSubPageId]-[parentSubPageId]-[topicId])
                    // First check if it's not a nested sub-page (doesn't end with -test-bank)
                    // Also exclude other known patterns: -questions, -exit-exam
                    const testBankNestedMatchForTopic = pathname.match(
                      /^\/(.+)-(.+)-test-bank$/
                    );
                    const exitExamNestedMatchForTopic = pathname.match(
                      /^\/(.+)-(.+)-exit-exam$/
                    );
                    const entranceExamNestedMatchForTopic = pathname.match(
                      /^\/(.+)-(.+)-questions$/
                    );
                    const testBankTopicMatch =
                      !testBankNestedMatchForTopic &&
                      !exitExamNestedMatchForTopic &&
                      !entranceExamNestedMatchForTopic &&
                      pathname.match(/^\/(.+)-(.+)-(.+)$/);

                    // Check if it could be a test bank topic
                    // If data is loaded, verify the parent sub-page exists
                    // If data is not loaded yet, we'll still try to render (data will load async)
                    let isTestBankTopic = false;
                    if (testBankTopicMatch) {
                      if (nursingTestBankSubPages.length > 0) {
                        // Data is loaded, verify it's a test bank topic
                        isTestBankTopic = nursingTestBankSubPages.some(
                          (subPage) => {
                            const subPageId = subPage.id || subPage.subPageId;
                            const subPageSlug = subPage.slug || subPageId;
                            const parentId = testBankTopicMatch[2]; // parentSubPageId is the second group
                            return (
                              subPageId === parentId || subPageSlug === parentId
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
                      // Pattern: [nestedSubPageId]-[parentSubPageId]-[topicId]
                      const nestedSubPageId = testBankTopicMatch[1];
                      const parentSubPageId = testBankTopicMatch[2];
                      const topicId = testBankTopicMatch[3];

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
                        formatBreadcrumbLabel(parentSubPageId);
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
                        formatBreadcrumbLabel(nestedSubPageId);

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
                        formatBreadcrumbLabel(topicId);

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
                          <Link
                            href={`/${
                              nestedSubPage?.slug || nestedSubPageId
                            }-${parentSubPageSlug}-test-bank`}
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

                    // Check if it's a test bank nested sub-page (pattern: [nestedSubPageId]-[parentSubPageId]-test-bank)
                    const testBankNestedMatch = pathname.match(
                      /^\/(.+)-(.+)-test-bank$/
                    );
                    const isTestBankNestedSubPage =
                      testBankNestedMatch &&
                      nursingTestBankSubPages.some((subPage) => {
                        const subPageId = subPage.id || subPage.subPageId;
                        const subPageSlug = subPage.slug || subPageId;
                        const parentId = testBankNestedMatch[2]; // parentSubPageId is the second group
                        return (
                          subPageId === parentId || subPageSlug === parentId
                        );
                      });

                    if (isTestBankNestedSubPage && testBankNestedMatch) {
                      const nestedSubPageId = testBankNestedMatch[1];
                      const parentSubPageId = testBankNestedMatch[2];

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
                        formatBreadcrumbLabel(parentSubPageId);
                      const parentSubPageSlug =
                        parentSubPage?.slug || parentSubPageId;

                      // Try to find nested sub-page name from cache or use formatted ID
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
                        formatBreadcrumbLabel(nestedSubPageId);

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
                          <span className="font-medium">
                            {nestedSubPageName}
                          </span>
                        </>
                      );
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
                      // Use pageName first, then hero.title, then formatted label
                      const subPageName =
                        subPage?.pageName ||
                        subPage?.hero?.title ||
                        formatBreadcrumbLabel(subPageId);

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
                        subPage?.pageName ||
                        subPage?.hero?.title ||
                        formatBreadcrumbLabel(subPageId);

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

                    // For nursing-entrance-exam pages
                    // Check if it's the main page
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

                    // Check if it's a nursing-entrance-exam sub-page
                    // First check using the heuristic function
                    const isNursingPage = isNursingEntranceExamPage(pathname);

                    // Also check against loaded sub-pages for more reliable detection
                    const segments = pathname.split("/").filter((s) => s);
                    const firstSegment = segments[0];
                    // Strip -exam suffix for comparison since sub-page IDs don't have it
                    const firstSegmentWithoutExam = firstSegment.endsWith(
                      "-exam"
                    )
                      ? firstSegment.slice(0, -5)
                      : firstSegment;
                    const isNursingSubPage = nursingSubPages.some((subPage) => {
                      const subPageId = subPage.id || subPage.subPageId;
                      const subPageSlug = subPage.slug || subPageId;
                      // Compare with and without -exam suffix, and also check slug
                      return (
                        subPageId === firstSegment ||
                        subPageId === firstSegmentWithoutExam ||
                        subPageSlug === firstSegment ||
                        subPageSlug === firstSegmentWithoutExam
                      );
                    });

                    // Check if it's an entrance exam quiz page (pattern: /{parent}-{nested}-questions/{quizSlug})
                    // This must be checked before nested sub-page check
                    const pathSegments = pathname.split("/").filter((s) => s);
                    const isQuizPage =
                      pathSegments.length === 2 &&
                      pathSegments[0].endsWith("-questions");
                    const quizNestedMatch = isQuizPage
                      ? pathSegments[0].match(/^(.+)-(.+)-questions$/)
                      : null;

                    // Check if it's a nested sub-page (has -questions pattern, but only 1 segment)
                    const nestedMatch = pathname.match(
                      /^\/(.+)-(.+)-questions$/
                    );
                    const isNestedNursingSubPage =
                      nestedMatch &&
                      !isQuizPage && // Exclude quiz pages
                      nursingSubPages.some((subPage) => {
                        const subPageId = subPage.id || subPage.subPageId;
                        const parentId = nestedMatch[1];
                        // Compare with and without -exam suffix (nested URLs don't have -exam)
                        return subPageId === parentId;
                      });

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
                            // Handle quiz page breadcrumbs
                            if (isQuizPage && quizNestedMatch) {
                              const parentSubPageId = quizNestedMatch[1];
                              const nestedSubPageId = quizNestedMatch[2];
                              const quizSlug = pathSegments[1];
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
                                formatBreadcrumbLabel(parentSubPageId);

                              // Try to find nested sub-page name from cache or use formatted ID
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
                                formatBreadcrumbLabel(nestedSubPageId);

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
                              if (!quizNamesCache[quizCacheKey] && parentSubPageId && nestedSubPageId && quizSlug) {
                                const parentId = parentSubPage?.id || parentSubPage?.subPageId || parentSubPageId;
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
                                    });
                                  }
                                );
                              }

                              const displayQuizName = quizNamesCache[quizCacheKey] || formatBreadcrumbLabel(quizSlug);
                              const parentUrlSlug = parentSubPageId.endsWith("-exam")
                                ? parentSubPageId
                                : `${parentSubPageId}-exam`;
                              const nestedSlug = nestedSubPage?.slug || nestedSubPageId;
                              const nestedSubPageUrl = `/${parentSubPageId}-${nestedSlug}-questions`;

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
                                    href={nestedSubPageUrl}
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

                            // Check if it's a nested sub-page (has -questions pattern, but not a quiz page)
                            if (nestedMatch && !isQuizPage) {
                              const parentSubPageId = nestedMatch[1];
                              const nestedSubPageId = nestedMatch[2];

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
                                formatBreadcrumbLabel(parentSubPageId);

                              // Try to find nested sub-page name from cache or use formatted ID
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
                                formatBreadcrumbLabel(nestedSubPageId);

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
                                    href={`/${
                                      parentSubPageId.endsWith("-exam")
                                        ? parentSubPageId
                                        : `${parentSubPageId}-exam`
                                    }`}
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
                              formatBreadcrumbLabel(subPageId);

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

                    // For other pages, check if it's a pillar page or service page
                    const otherSegments = pathname.split("/").filter((s) => s);
                    if (otherSegments.length === 0) return null;

                    // Check if it's a pillar page (e.g., /nursing, /teas)
                    const otherFirstSegment = otherSegments[0];
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
