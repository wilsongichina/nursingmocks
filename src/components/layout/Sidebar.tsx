"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllPillarPages,
  getAllPillarServicePages,
  getAllPages,
} from "@/lib/firestore-operations";

interface SidebarProps {
  className?: string;
}

interface PillarPage {
  id: string;
  pageName?: string;
  [key: string]: any;
}

interface Category {
  id: string;
  servicePageId?: string;
  [key: string]: any;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [pillarPages, setPillarPages] = useState<PillarPage[]>([]);
  const [teasCategories, setTeasCategories] = useState<string[]>([]);
  const [pillarCategories, setPillarCategories] = useState<
    Record<string, Category[]>
  >({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Auto-expand sections based on current pathname
  useEffect(() => {
    if (isLoading) return; // Wait for data to load

    setExpandedItems((prev) => {
      const newSet = new Set(prev);

      // Check if we're on dashboard or any dashboard sub-page
      if (
        pathname === "/dashboard" ||
        pathname === "/profile" ||
        pathname === "/referrals" ||
        pathname === "/payments"
      ) {
        newSet.add("dashboard");
      }

      // Check if we're on TEAS main page
      if (pathname === "/teas") {
        newSet.add("teas");
      }

      // Check if we're on a TEAS category page (categories that don't belong to any pillar page)
      if (pathname.startsWith("/") && pathname !== "/") {
        const pathSegment = pathname.split("/")[1];
        if (teasCategories.includes(pathSegment)) {
          newSet.add("teas");
        }
      }

      // Check if we're on any pillar page or its categories
      pillarPages.forEach((pillarPage) => {
        if (pathname.startsWith(`/${pillarPage.id}`)) {
          newSet.add(pillarPage.id);
        }
      });

      // Auto-expand TEAS if no other main tab is expanded (except dashboard)
      // Check if any pillar page is expanded
      const hasPillarPageExpanded = pillarPages.some((pillarPage) =>
        newSet.has(pillarPage.id)
      );
      const hasTeasExpanded = newSet.has("teas");

      // If no pillar pages are expanded and TEAS is not already expanded,
      // and TEAS has categories, then auto-expand TEAS
      // (Dashboard being expanded doesn't prevent TEAS from auto-expanding)
      if (
        !hasPillarPageExpanded &&
        !hasTeasExpanded &&
        teasCategories.length > 0
      ) {
        newSet.add("teas");
      }

      return newSet;
    });
  }, [pathname, pillarPages, isLoading, teasCategories]);

  const dashboardItems = [
    { label: "Profile", href: "/profile", icon: "👤" },
    { label: "Referrals", href: "/referrals", icon: "👥" },
    { label: "Payments & Subscription", href: "/payments", icon: "💳" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Try to load from static JSON file first (generated at build time)
        try {
          const response = await fetch("/data/sidebar-data.json");
          if (response.ok) {
            const staticData = await response.json();
            setPillarPages(staticData.pillarPages || []);
            setTeasCategories(staticData.teasCategories || []);
            setPillarCategories(staticData.pillarCategories || {});
            setIsLoading(false);
            return;
          }
        } catch {
          // If static file doesn't exist or fails, fall back to Firestore
          console.log("Static sidebar data not found, fetching from Firestore...");
        }

        // Fallback: Fetch all pillar pages, all pages (categories), and pillar service pages from Firestore
        const [pillarPagesResult, allPagesResult] = await Promise.all([
          getAllPillarPages(),
          getAllPages(),
        ]);

        if (!pillarPagesResult.success || !allPagesResult.success) {
          console.error("Failed to load data");
          return;
        }

        const allPillarPages = pillarPagesResult.data || [];
        const allCategories = Object.keys(allPagesResult.data || {});

        // Get all categories that belong to pillar pages
        const pillarPageCategoryIds = new Set<string>();
        const categoriesByPillar: Record<string, Category[]> = {};

        // Fetch categories for each pillar page
        for (const pillarPage of allPillarPages) {
          const result = await getAllPillarServicePages(pillarPage.id);
          if (result.success && result.data) {
            const categories = result.data.map((service: any) => ({
              id: service.servicePageId || service.id,
              servicePageId: service.servicePageId || service.id,
              ...service,
            }));
            categoriesByPillar[pillarPage.id] = categories;

            // Track which categories belong to pillar pages
            categories.forEach((cat: Category) => {
              const categoryId = cat.servicePageId || cat.id;
              if (categoryId) {
                pillarPageCategoryIds.add(categoryId);
              }
            });
          }
        }

        // Categories that don't belong to any pillar page go to TEAS
        const teasCats = allCategories.filter(
          (cat) => !pillarPageCategoryIds.has(cat)
        );

        setPillarPages(allPillarPages);
        setTeasCategories(teasCats);
        setPillarCategories(categoriesByPillar);
      } catch (error) {
        console.error("Error loading pillar pages and categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatCategoryName = (id: string) => {
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPillarPageName = (pillarPage: PillarPage) => {
    return (
      pillarPage.pageName ||
      pillarPage.id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-[60] flex-col ${className} ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ overflow: "visible" }}
    >
      {/* Logo Section */}
      <div
        className={`relative flex items-center border-b border-gray-200 h-16 ${
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
        style={{ overflow: "visible" }}
      >
        {!isCollapsed ? (
          <Link href="/" aria-label="TEAS Gurus Home" className="flex-shrink-0">
            <Image
              src="/teas-gurus-logo.png"
              alt="TEAS Gurus Logo"
              width={150}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        ) : (
          <Link
            href="/"
            aria-label="TEAS Gurus Home"
            className="flex-shrink-0 flex items-center justify-center"
          >
            <Image
              src="/favicon.png"
              alt="TEAS Gurus Logo"
              width={40}
              height={40}
              className="h-10 w-auto max-w-10 rounded object-contain"
              priority
            />
          </Link>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-[70] flex items-center justify-center"
            aria-label="Expand sidebar"
            style={{
              width: "32px",
              height: "32px",
              right: "-16px",
              padding: "6px",
            }}
          >
            <svg
              className="w-5 h-5 text-gray-600 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={`space-y-1 ${isCollapsed ? "px-2" : "px-2"}`}>
          {/* Dashboard Section - Only show if logged in */}
          {currentUser && (
            <li>
              {isCollapsed ? (
                <Link
                  href="/dashboard"
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard") ||
                    isActive("/profile") ||
                    isActive("/referrals") ||
                    isActive("/payments")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  title="Dashboard"
                >
                  <span className="text-xl">📊</span>
                </Link>
              ) : (
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive("/dashboard") ||
                      isActive("/profile") ||
                      isActive("/referrals") ||
                      isActive("/payments")
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 flex-1"
                    >
                      <span className="text-xl flex-shrink-0">📊</span>
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpand("dashboard");
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      aria-label="Toggle dashboard menu"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedItems.has("dashboard") ? "rotate-90" : ""
                        }`}
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
                    </button>
                  </div>
                  {expandedItems.has("dashboard") && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                      {dashboardItems.map((item) => {
                        const itemActive = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                itemActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </li>
          )}

          {/* Pillar Pages Section - Show for all users */}
          {!isLoading && (
            <>
              {/* TEAS (Special Case) */}
              {teasCategories.length > 0 && (
                <li>
                  {isCollapsed ? (
                    <Link
                      href="/teas"
                      className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive("/teas")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      }`}
                      title="TEAS"
                    >
                      <span className="text-xl">📚</span>
                    </Link>
                  ) : (
                    <div>
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive("/teas")
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        }`}
                      >
                        <Link
                          href="/teas"
                          className="flex items-center gap-3 flex-1"
                        >
                          <span className="text-xl flex-shrink-0">📚</span>
                          <span className="text-sm font-medium">TEAS</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpand("teas");
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label="Toggle TEAS menu"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedItems.has("teas") ? "rotate-90" : ""
                            }`}
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
                        </button>
                      </div>
                      {expandedItems.has("teas") && (
                        <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                          {teasCategories.map((categoryId) => {
                            const categoryActive =
                              pathname === `/${categoryId}`;
                            return (
                              <li key={categoryId}>
                                <Link
                                  href={`/${categoryId}`}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    categoryActive
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  {formatCategoryName(categoryId)}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              )}

              {/* Other Pillar Pages */}
              {pillarPages.map((pillarPage) => {
                const categories = pillarCategories[pillarPage.id] || [];
                if (categories.length === 0) return null;

                const pillarActive = pathname.startsWith(`/${pillarPage.id}`);
                const isExpanded = expandedItems.has(pillarPage.id);

                return (
                  <li key={pillarPage.id}>
                    {isCollapsed ? (
                      <Link
                        href={`/${pillarPage.id}`}
                        className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          pillarActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        }`}
                        title={getPillarPageName(pillarPage)}
                      >
                        <span className="text-xl">📖</span>
                      </Link>
                    ) : (
                      <div>
                        <div
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            pillarActive
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          }`}
                        >
                          <Link
                            href={`/${pillarPage.id}`}
                            className="flex items-center gap-3 flex-1"
                          >
                            <span className="text-xl flex-shrink-0">📖</span>
                            <span className="text-sm font-medium">
                              {getPillarPageName(pillarPage)}
                            </span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpand(pillarPage.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            aria-label={`Toggle ${getPillarPageName(
                              pillarPage
                            )} menu`}
                          >
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
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
                          </button>
                        </div>
                        {isExpanded && (
                          <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                            {categories.map((category) => {
                              const categoryId =
                                category.servicePageId || category.id;
                              const categoryActive =
                                pathname === `/${pillarPage.id}/${categoryId}`;
                              return (
                                <li key={categoryId}>
                                  <Link
                                    href={`/${pillarPage.id}/${categoryId}`}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                      categoryActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {category.hero?.title ||
                                      formatCategoryName(categoryId)}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </>
          )}

          {/* Loading State */}
          {!isCollapsed && isLoading && (
            <li className="px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            </li>
          )}

          {/* Progress Reports - Only show if logged in */}
          {currentUser && (
            <li>
              {isCollapsed ? (
                <Link
                  href="/progress-reports"
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive("/progress-reports")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  title="Progress Reports"
                >
                  <span className="text-xl">📈</span>
                </Link>
              ) : (
                <Link
                  href="/progress-reports"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive("/progress-reports")
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">📈</span>
                  <span className="text-sm font-medium">Progress Reports</span>
                  {isActive("/progress-reports") && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button - Only show if user is logged in */}
      {currentUser && (
        <div className="border-t border-gray-200 p-4 mt-auto">
          {isCollapsed ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              title="Logout"
              aria-label="Logout"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
