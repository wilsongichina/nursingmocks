"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./Header";
import NewFooter from "./NewFooter";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import UserProfileBadge from "./UserProfileBadge";
import FloatingWhatsAppButton from "../ui/FloatingWhatsAppButton";
import TawkToChat from "../ui/TawkToChat";
import MobileBreadcrumb from "../ui/MobileBreadcrumb";

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
  const [nursingTestBankSubPages, setNursingTestBankSubPages] = useState<any[]>(
    []
  );
  // Simplified breadcrumb state for nursing-entrance-exam and nursing-exit-exam
  const [breadcrumbData, setBreadcrumbData] = useState<{
    pillarName: string;
    pillarId: string;
    items: Array<{
      name: string;
      slug: string;
      url: string;
    }>;
    loading: boolean;
  } | null>(null);

  // Load pillar pages and categories for breadcrumbs
  useEffect(() => {
    const loadBreadcrumbData = async () => {
      try {
        const { getAllPillarPages, getAllPillarServicePages } = await import(
          "@/lib/firestore-operations"
        );
        const pillarPagesResult = await getAllPillarPages();
        if (pillarPagesResult.success && pillarPagesResult.data) {
          setPillarPages(pillarPagesResult.data);

          // Load categories for each pillar page
          const categoriesByPillar: Record<string, any[]> = {};
          for (const pillarPage of pillarPagesResult.data) {
            if (
              pillarPage.id === "nursing-entrance-exam" ||
              pillarPage.id === "nursing-exit-exam" ||
              pillarPage.id === "nursing-test-bank"
            ) {
              // Skip these as they're handled separately in breadcrumb loading
              continue;
            }
            const result = await getAllPillarServicePages(pillarPage.id);
            if (result.success && result.data) {
              categoriesByPillar[pillarPage.id] = result.data;
            }
          }
          setPillarCategories(categoriesByPillar);
        }
      } catch (error) {
        console.error("Error loading breadcrumb data:", error);
      }
    };

    loadBreadcrumbData();
  }, []);

  // Universal breadcrumb loading using refPath for all pillar pages
  // No caching - always fetches fresh data from Firebase on every pathname change
  // Works for: nursing-entrance-exam, nursing-exit-exam, and nursing-test-bank
  useEffect(() => {
    const loadBreadcrumbs = async () => {
      // Clear previous breadcrumb data immediately to avoid stale data
      setBreadcrumbData(null);

      const pathSegments = pathname.split("/").filter((s) => s);

      // Excluded routes that don't need breadcrumbs
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

      if (excludedRoutes.includes(pathname) || pathname.startsWith("/admin")) {
        setBreadcrumbData(null);
        return;
      }

      // Helper function to get pillar name
      const getPillarName = (pillarId: string): string => {
        switch (pillarId) {
          case "nursing-entrance-exam":
            return "Nursing Entrance Exam";
          case "nursing-exit-exam":
            return "Nursing Exit Exam";
          case "nursing-test-bank":
            return "Nursing Test Bank";
          case "knowledge-base":
            return "Knowledge Base";
          default:
            return formatBreadcrumbLabel(pillarId);
        }
      };

      // Handle knowledge-base routes
      if (pathname.startsWith("/knowledge-base/")) {
        const subPageSlug = pathSegments[1]; // Get the subPage slug
        if (subPageSlug) {
          setBreadcrumbData({
            pillarName: "Knowledge Base",
            pillarId: "knowledge-base",
            items: [],
            loading: true,
          });

          try {
            const { getPageBySlug, getKbArticleBySlug } = await import("@/lib/firestore-operations");
            const pageResult = await getPageBySlug(subPageSlug);
            let pageData: any = null;
            let pillarId: string = "nursing-entrance-exam";
            
            // If getPageBySlug found the page, use it
            if (pageResult.success && pageResult.data) {
              pageData = pageResult.data;
              // Get pillarId from the result
              pillarId = (pageResult as any).pillarId || pageData.pillarId || "nursing-entrance-exam";
            } else {
              // Fallback: try to find in knowledgeBase collection
              const kbResult = await getKbArticleBySlug(subPageSlug);
              if (kbResult.success && kbResult.data) {
                pageData = kbResult.data;
                pillarId = pageData.pillarId || "nursing-entrance-exam";
              }
            }
            
            if (pageData) {
              const pageName =
                pageData.pageName ||
                pageData.hero?.title ||
                pageData.title ||
                pageData.heading ||
                formatBreadcrumbLabel(subPageSlug);
              
              const pillarName = getPillarName(pillarId);

              setBreadcrumbData({
                pillarName: pillarName,
                pillarId: pillarId,
                items: [
                  {
                    name: pageName,
                    slug: subPageSlug,
                    url: `/knowledge-base/${subPageSlug}`,
                  },
                ],
                loading: false,
              });
            } else {
              // If page not found, default to nursing-entrance-exam
              const pillarName = getPillarName(pillarId);
              
              setBreadcrumbData({
                pillarName: pillarName,
                pillarId: pillarId,
                items: [
                  {
                    name: formatBreadcrumbLabel(subPageSlug),
                    slug: subPageSlug,
                    url: `/knowledge-base/${subPageSlug}`,
                  },
                ],
                loading: false,
              });
            }
          } catch (error) {
            console.error("Error loading knowledge-base page:", error);
            // Default to nursing-entrance-exam on error
            const pillarId = "nursing-entrance-exam";
            const pillarName = getPillarName(pillarId);
            
            setBreadcrumbData({
              pillarName: pillarName,
              pillarId: pillarId,
              items: [
                {
                  name: formatBreadcrumbLabel(subPageSlug),
                  slug: subPageSlug,
                  url: `/knowledge-base/${subPageSlug}`,
                },
              ],
              loading: false,
            });
          }
          return;
        }
      }

      // Handle main pillar pages
      if (
        pathname === "/nursing-entrance-exam" ||
        pathname === "/nursing-exit-exam" ||
        pathname === "/nursing-test-bank" ||
        pathname === "/knowledge-base"
      ) {
        const pillarId = pathname.substring(1); // Remove leading slash
        const pillarName = getPillarName(pillarId);
        setBreadcrumbData({
          pillarName,
          pillarId,
          items: [],
          loading: false,
        });
        return;
      }

      // Get route mapping by slug
      const pageSlug = pathSegments[0];
      const { getRouteMappingBySlugOnly, getPageByContentPath } = await import(
        "@/lib/firestore-operations"
      );

      const routeMappingResult = await getRouteMappingBySlugOnly(pageSlug);

      // If no route mapping found, check if it's a KB article
      if (!routeMappingResult.success || !routeMappingResult.data) {
        const { getKbArticleBySlug } = await import("@/lib/firestore-operations");
        const kbArticleResult = await getKbArticleBySlug(pageSlug);
        
        if (kbArticleResult.success && kbArticleResult.data) {
          const kbArticleData = kbArticleResult.data as any;
          const kbPillarId = kbArticleData.pillarId || "nursing-entrance-exam";
          
          // Only handle the three nursing pillar pages
          if (
            kbPillarId !== "nursing-entrance-exam" &&
            kbPillarId !== "nursing-exit-exam" &&
            kbPillarId !== "nursing-test-bank"
          ) {
            setBreadcrumbData(null);
            return;
          }
          
          const kbPillarName = getPillarName(kbPillarId);
          const breadcrumbItems: Array<{
            name: string;
            slug: string;
            url: string;
          }> = [];
          
          // Check if KB article has a parent sub page
          const parentId = kbArticleData.parentId || kbArticleData.parentSubPageId;
          if (parentId) {
            const subPageRefPath = `pillarPages/${kbPillarId}/subPages/${parentId}`;
            const subPageResult = await getPageByContentPath(subPageRefPath);
            
            if (subPageResult.success && subPageResult.data) {
              const subPageData = subPageResult.data as any;
              const subPageSlug = subPageData.slug || parentId;
              const subPageName =
                subPageData.pageName ||
                subPageData.hero?.title ||
                formatBreadcrumbLabel(parentId);
              
              breadcrumbItems.push({
                name: subPageName,
                slug: subPageSlug,
                url: `/${subPageSlug}`,
              });
            }
          }
          
          // Add the KB article itself
          const articleName =
            kbArticleData.pageName ||
            kbArticleData.hero?.title ||
            formatBreadcrumbLabel(pageSlug);
          const articleSlug = kbArticleData.slug || pageSlug;
          
          breadcrumbItems.push({
            name: articleName,
            slug: articleSlug,
            url: `/${articleSlug}`,
          });
          
          setBreadcrumbData({
            pillarName: kbPillarName,
            pillarId: kbPillarId,
            items: breadcrumbItems,
            loading: false,
          });
          return;
        }
        
        setBreadcrumbData(null);
        return;
      }

      const mapping = routeMappingResult.data as any;
      const pillarId = mapping.pillarId;

      // Only handle the three nursing pillar pages
      if (
        pillarId !== "nursing-entrance-exam" &&
        pillarId !== "nursing-exit-exam" &&
        pillarId !== "nursing-test-bank"
      ) {
        setBreadcrumbData(null);
        return;
      }

      const pillarName = getPillarName(pillarId);
      const refPath = mapping.refPath;

      if (!refPath) {
        setBreadcrumbData(null);
        return;
      }

      setBreadcrumbData({
        pillarName,
        pillarId,
        items: [],
        loading: true,
      });

      try {
        const breadcrumbItems: Array<{
          name: string;
          slug: string;
          url: string;
        }> = [];

        // Handle knowledge base articles
        if (refPath.startsWith("knowledgeBase/")) {
          // Get KB article data
          const kbArticleResult = await getPageByContentPath(refPath);
          
          if (kbArticleResult.success && kbArticleResult.data) {
            const kbArticleData = kbArticleResult.data as any;
            const parentId = kbArticleData.parentId || kbArticleData.parentSubPageId;
            
            // If KB article has a parent sub page, add it to breadcrumbs
            if (parentId) {
              const subPageRefPath = `pillarPages/${pillarId}/subPages/${parentId}`;
              const subPageResult = await getPageByContentPath(subPageRefPath);
              
              if (subPageResult.success && subPageResult.data) {
                const subPageData = subPageResult.data as any;
                const subPageSlug = subPageData.slug || parentId;
                const subPageName =
                  subPageData.pageName ||
                  subPageData.hero?.title ||
                  formatBreadcrumbLabel(parentId);
                
                breadcrumbItems.push({
                  name: subPageName,
                  slug: subPageSlug,
                  url: `/${subPageSlug}`,
                });
              }
            }
            
            // Add the KB article itself as the last breadcrumb
            const articleName =
              kbArticleData.pageName ||
              kbArticleData.hero?.title ||
              formatBreadcrumbLabel(pageSlug);
            const articleSlug = kbArticleData.slug || mapping.slug || pageSlug;
            
            breadcrumbItems.push({
              name: articleName,
              slug: articleSlug,
              url: `/${articleSlug}`,
            });
            
            setBreadcrumbData({
              pillarName,
              pillarId,
              items: breadcrumbItems,
              loading: false,
            });
            return;
          }
        }

        // Parse refPath to extract parent IDs
        // Format: pillarPages/{pillarId}/subPages/{subPageId}/nestedSubPages/{nestedSubPageId}/topics/{topicId}/quizzes/{quizId}
        const pathParts = refPath.split("/");

        let subPageId: string | null = null;
        let nestedSubPageId: string | null = null;

        // Get subPageId (index 3)
        if (pathParts.length >= 4 && pathParts[2] === "subPages") {
          const currentSubPageId = pathParts[3];
          subPageId = currentSubPageId;
          const subPageRefPath = `pillarPages/${pillarId}/subPages/${currentSubPageId}`;

          // Get page data to get the slug from the document
          const subPageResult = await getPageByContentPath(subPageRefPath);

          if (subPageResult.success && subPageResult.data) {
            const subPageData = subPageResult.data as any;
            const currentSubPageSlug = subPageData.slug || currentSubPageId;

            const subPageName =
              subPageData.pageName ||
              subPageData.hero?.title ||
              formatBreadcrumbLabel(currentSubPageId);

            breadcrumbItems.push({
              name: subPageName,
              slug: currentSubPageSlug,
              url: `/${currentSubPageSlug}`,
            });
          }
        }

        // Get nestedSubPageId (index 5)
        if (
          pathParts.length >= 6 &&
          pathParts[4] === "nestedSubPages" &&
          subPageId
        ) {
          const currentNestedSubPageId = pathParts[5];
          nestedSubPageId = currentNestedSubPageId;
          const nestedSubPageRefPath = `pillarPages/${pillarId}/subPages/${subPageId}/nestedSubPages/${currentNestedSubPageId}`;

          // Get page data to get the slug from the document
          const nestedSubPageResult = await getPageByContentPath(
            nestedSubPageRefPath
          );

          if (nestedSubPageResult.success && nestedSubPageResult.data) {
            const nestedSubPageData = nestedSubPageResult.data as any;
            const currentNestedSubPageSlug =
              nestedSubPageData.slug || currentNestedSubPageId;

            const nestedSubPageName =
              nestedSubPageData.pageName ||
              nestedSubPageData.hero?.title ||
              nestedSubPageData.title ||
              formatBreadcrumbLabel(currentNestedSubPageId);

            breadcrumbItems.push({
              name: nestedSubPageName,
              slug: currentNestedSubPageSlug,
              url: `/${currentNestedSubPageSlug}`,
            });
          }
        }

        // Get topicId (index 7) if it's a topic page (for nursing-test-bank)
        if (
          pathParts.length >= 8 &&
          pathParts[6] === "topics" &&
          subPageId &&
          nestedSubPageId
        ) {
          const topicId = pathParts[7];
          const topicRefPath = `pillarPages/${pillarId}/subPages/${subPageId}/nestedSubPages/${nestedSubPageId}/topics/${topicId}`;

          // Get page data to get the slug from the document
          const topicResult = await getPageByContentPath(topicRefPath);
          if (topicResult.success && topicResult.data) {
            const topicData = topicResult.data as any;
            const topicSlug = topicData.slug || topicId;
            const topicName =
              topicData.pageName ||
              topicData.hero?.title ||
              topicData.title ||
              formatBreadcrumbLabel(topicId);

            breadcrumbItems.push({
              name: topicName,
              slug: topicSlug,
              url: `/${topicSlug}`,
            });
          }
        }

        // Get quizId (index 7 or 9) if it's a quiz page
        const quizIndex = pathParts.findIndex(
          (part: string) => part === "quizzes"
        );
        if (quizIndex !== -1 && pathParts.length > quizIndex + 1) {
          const quizId = pathParts[quizIndex + 1];
          const quizRefPath = refPath;
          const quizResult = await getPageByContentPath(quizRefPath);

          if (quizResult.success && quizResult.data) {
            const quizData = quizResult.data as any;
            const quizName =
              quizData.pageName ||
              quizData.hero?.title ||
              formatBreadcrumbLabel(quizId);
            const quizSlug = quizData.slug || mapping.slug || pageSlug;

            breadcrumbItems.push({
              name: quizName,
              slug: quizSlug,
              url: `/${quizSlug}`,
            });
          }
        } else {
          // For non-quiz pages (sub, nested, or topic), add the current page if not already added
          const currentPageResult = await getPageByContentPath(refPath);
          if (currentPageResult.success && currentPageResult.data) {
            const currentPageData = currentPageResult.data as any;
            const currentPageName =
              currentPageData.pageName ||
              currentPageData.hero?.title ||
              currentPageData.title ||
              formatBreadcrumbLabel(pageSlug);
            const currentPageSlug =
              currentPageData.slug || mapping.slug || pageSlug;

            // Only add if it's not already the last item (to avoid duplicates)
            const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
            if (!lastItem || lastItem.name !== currentPageName) {
              breadcrumbItems.push({
                name: currentPageName,
                slug: currentPageSlug,
                url: `/${currentPageSlug}`,
              });
            }
          }
        }

        setBreadcrumbData({
          pillarName,
          pillarId,
          items: breadcrumbItems,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading breadcrumbs:", error);
        setBreadcrumbData({
          pillarName,
          pillarId,
          items: [],
          loading: false,
        });
      }
    };

    loadBreadcrumbs();
  }, [pathname]);

  // Reload test bank sub-pages when navigating to test bank pages to ensure fresh data
  useEffect(() => {
    const isTestBankPage = pathname === "/nursing-test-bank";

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

  // Old page metadata loading logic removed - now using refPath directly for nursing-entrance-exam and nursing-exit-exam

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
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      Close
                    </span>
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
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">
                      Menu
                    </span>
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
                  </>
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
                    // Handle nursing-entrance-exam and nursing-exit-exam with simplified refPath-based logic
                    if (breadcrumbData) {
                      if (breadcrumbData.loading) {
                        // Show skeleton loader
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
                              href={`/${breadcrumbData.pillarId}`}
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              {breadcrumbData.pillarName}
                            </Link>
                            {Array.from({
                              length: breadcrumbData.items.length || 2,
                            }).map((_, i) => (
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

                      // Render breadcrumbs with data
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
                            href={`/${breadcrumbData.pillarId}`}
                            className="hover:text-blue-600 transition-colors font-medium"
                          >
                            {breadcrumbData.pillarName}
                          </Link>
                          {breadcrumbData.items.map((item, index) => (
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
                              {index === breadcrumbData.items.length - 1 ? (
                                <span className="font-medium">{item.name}</span>
                              ) : (
                                <Link
                                  href={item.url}
                                  className="hover:text-blue-600 transition-colors font-medium"
                                >
                                  {item.name}
                                </Link>
                              )}
                            </React.Fragment>
                          ))}
                        </>
                      );
                    }

                    // All old complex breadcrumb logic removed
                    // Now handled by universal refPath-based logic above using breadcrumbData state
                    // Works for: nursing-entrance-exam, nursing-exit-exam, and nursing-test-bank

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

        {/* Mobile Breadcrumb */}
        {(() => {
          // Generate breadcrumb items for mobile
          const getMobileBreadcrumbItems = (): Array<{
            name: string;
            url?: string;
          }> => {
            const items: Array<{ name: string; url?: string }> = [];

            // Excluded routes that don't need breadcrumbs
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
            ];

            if (
              excludedRoutes.includes(pathname) ||
              pathname.startsWith("/admin")
            ) {
              return [];
            }

            // Always start with Home
            items.push({ name: "Home", url: "/" });

            // For dynamic pages with breadcrumbData
            if (breadcrumbData && !breadcrumbData.loading) {
              // Add pillar page
              items.push({
                name: breadcrumbData.pillarName,
                url: `/${breadcrumbData.pillarId}`,
              });

              // Add breadcrumb items
              breadcrumbData.items.forEach((item) => {
                items.push({
                  name: item.name,
                  url: item.url,
                });
              });
            } else {
              // For static pages, generate from pathname
              const pathSegments = pathname.split("/").filter((s) => s);
              if (pathSegments.length > 0) {
                // Map common static pages
                const pageNameMap: Record<string, string> = {
                  contact: "Contact",
                  prices: "Prices",
                  about: "About",
                  "how-it-works": "How It Works",
                  faqs: "FAQs",
                  teas: "TEAS",
                  "hesi-a2": "HESI A2",
                  nursing: "Nursing",
                  "terms-and-conditions": "Terms and Conditions",
                  "privacy-policy": "Privacy Policy",
                  "money-back-guarantee": "Money Back Guarantee",
                  guarantees: "Guarantees",
                };

                pathSegments.forEach((segment, index) => {
                  const isLast = index === pathSegments.length - 1;
                  const pageName =
                    pageNameMap[segment] || formatBreadcrumbLabel(segment);
                  const url = isLast ? undefined : `/${segment}`;

                  items.push({
                    name: pageName,
                    url: url,
                  });
                });
              }
            }

            return items;
          };

          const mobileBreadcrumbItems = getMobileBreadcrumbItems();

          if (mobileBreadcrumbItems.length === 0) {
            return null;
          }

          return (
            <MobileBreadcrumb
              items={mobileBreadcrumbItems}
              className="sticky top-16 z-40"
            />
          );
        })()}

        {/* Main content with padding for mobile header */}
        <main className="md:pt-0 pt-16">{children}</main>
        <NewFooter />
      </div>
      <FloatingWhatsAppButton />
      <TawkToChat />
    </div>
  );
}

function LayoutWithoutSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Generate breadcrumb items for static pages
  const getMobileBreadcrumbItems = (): Array<{
    name: string;
    url?: string;
  }> => {
    const items: Array<{ name: string; url?: string }> = [];

    // Excluded routes that don't need breadcrumbs
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
    ];

    if (excludedRoutes.includes(pathname) || pathname.startsWith("/admin")) {
      return [];
    }

    // Always start with Home
    items.push({ name: "Home", url: "/" });

    // For static pages, generate from pathname
    const pathSegments = pathname.split("/").filter((s) => s);
    if (pathSegments.length > 0) {
      // Map common static pages
      const pageNameMap: Record<string, string> = {
        contact: "Contact",
        prices: "Prices",
        about: "About",
        "how-it-works": "How It Works",
        faqs: "FAQs",
        teas: "TEAS",
        "hesi-a2": "HESI A2",
        nursing: "Nursing",
        "terms-and-conditions": "Terms and Conditions",
        "privacy-policy": "Privacy Policy",
        "money-back-guarantee": "Money Back Guarantee",
        guarantees: "Guarantees",
      };

      pathSegments.forEach((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        const pageName = pageNameMap[segment] || formatBreadcrumbLabel(segment);
        const url = isLast ? undefined : `/${segment}`;

        items.push({
          name: pageName,
          url: url,
        });
      });
    }

    return items;
  };

  const mobileBreadcrumbItems = getMobileBreadcrumbItems();

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo={true} />
      {/* Mobile Breadcrumb */}
      {mobileBreadcrumbItems.length > 0 && (
        <MobileBreadcrumb
          items={mobileBreadcrumbItems}
          className="sticky top-16 z-40"
        />
      )}
      <main>{children}</main>
      <NewFooter />
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
      "/contact",
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
