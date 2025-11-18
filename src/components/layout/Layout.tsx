"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
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
  if (excludedRoutes.some((route) => normalizedPath.startsWith(route))) {
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

  // Load pillar pages and categories for breadcrumbs
  useEffect(() => {
    const loadBreadcrumbData = async () => {
      try {
        const {
          getAllPillarPages,
          getAllPillarServicePages,
          getNursingEntranceExamSubPages,
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
                      // Compare with and without -exam suffix
                      return (
                        subPageId === firstSegment ||
                        subPageId === firstSegmentWithoutExam
                      );
                    });

                    // Check if it's a nested sub-page (has -questions pattern)
                    const nestedMatch = pathname.match(
                      /^\/(.+)-(.+)-questions$/
                    );
                    const isNestedNursingSubPage =
                      nestedMatch &&
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
                      isNestedNursingSubPage
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
                            // Check if it's a nested sub-page (has -questions pattern)
                            if (nestedMatch) {
                              const parentSubPageId = nestedMatch[1];
                              const nestedSubPageId = nestedMatch[2];
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
                                    {formatBreadcrumbLabel(parentSubPageId)}
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
                                    {formatBreadcrumbLabel(nestedSubPageId)}
                                  </span>
                                </>
                              );
                            }
                            // Regular sub-page - strip -exam suffix for display
                            let subPageId = pathname.replace("/", "");
                            if (subPageId.endsWith("-exam")) {
                              subPageId = subPageId.slice(0, -5);
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
                                  {formatBreadcrumbLabel(subPageId)}
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

  // Determine if sidebar should be shown based on pathname
  const shouldShowSidebar = () => {
    // If explicitly set, use that value
    if (showSidebar !== undefined) {
      return showSidebar;
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
      return false;
    }

    // Exclude blog pages
    if (pathname.startsWith("/blog")) {
      return false;
    }

    // Exclude admin panel
    if (pathname.startsWith("/admin")) {
      return false;
    }

    // Show sidebar for all other pages
    return true;
  };

  const sidebarEnabled = shouldShowSidebar();

  if (sidebarEnabled) {
    return (
      <SidebarProvider>
        <LayoutWithSidebar>{children}</LayoutWithSidebar>
      </SidebarProvider>
    );
  }

  return <LayoutWithoutSidebar>{children}</LayoutWithoutSidebar>;
}
