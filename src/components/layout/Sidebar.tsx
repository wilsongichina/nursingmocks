"use client";

import { useState, useEffect, useRef } from "react";
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
// Import static sidebar data generated at build time
// This will be replaced with actual data during build
import { sidebarData as staticSidebarData } from "@/lib/data/sidebar-data";

interface SidebarData {
  pillarPages: PillarPage[];
  teasCategories: string[];
  pillarCategories: Record<string, Category[]>;
}

interface SidebarProps {
  className?: string;
  initialData?: SidebarData | null;
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

export default function Sidebar({ className = "", initialData = null }: SidebarProps) {
  const { isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } =
    useSidebar();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  
  // Use static data from build time, or initialData prop, or empty arrays (no loading state)
  const staticData = staticSidebarData || initialData;
  
  // Initialize state with static data immediately (no loading state)
  // Convert readonly arrays to mutable arrays for useState
  const [pillarPages, setPillarPages] = useState<PillarPage[]>(
    staticData?.pillarPages ? [...staticData.pillarPages] : []
  );
  const [teasCategories, setTeasCategories] = useState<string[]>(
    staticData?.teasCategories ? [...staticData.teasCategories] : []
  );
  const [pillarCategories, setPillarCategories] = useState<
    Record<string, Category[]>
  >(
    staticData?.pillarCategories
      ? Object.fromEntries(
          Object.entries(staticData.pillarCategories).map(([key, value]) => [
            key,
            [...value],
          ])
        )
      : {}
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand sections based on current pathname
  useEffect(() => {
    // Data is available immediately from static build, no need to wait
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
  }, [pathname, pillarPages, teasCategories]);

  const dashboardItems = [
    { label: "Profile", href: "/profile", icon: "profile", color: "purple" },
    {
      label: "Referrals",
      href: "/referrals",
      icon: "referrals",
      color: "green",
    },
    {
      label: "Payments & Subscription",
      href: "/payments",
      icon: "payments",
      color: "blue",
    },
  ];

  // Icon component with rounded square background
  const IconWithBackground = ({
    icon,
    color,
    size = "w-8 h-8",
  }: {
    icon: string;
    color: string;
    size?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
    };

    const iconColor =
      colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    const renderIcon = () => {
      switch (icon) {
        case "dashboard":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          );
        case "teas":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case "pillar":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          );
        case "progress":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          );
        case "profile":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          );
        case "referrals":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          );
        case "payments":
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          );
        case "logout":
          return (
            <svg
              className="w-5 h-5"
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
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={`${size} ${iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        {renderIcon()}
      </div>
    );
  };

  useEffect(() => {
    // If static data is available, skip loading (data is already available at build time)
    if (staticData) {
      return;
    }

    // Only load from Firestore if static data is not available (fallback for development)
    const loadData = async () => {
      try {

        // Try to load from static JSON file first (generated at build time)
        try {
          const response = await fetch("/data/sidebar-data.json");
          if (response.ok) {
            const staticData = await response.json();
            setPillarPages(staticData.pillarPages || []);
            setTeasCategories(staticData.teasCategories || []);
            setPillarCategories(staticData.pillarCategories || {});
            return;
          }
        } catch {
          // If static file doesn't exist or fails, fall back to Firestore
          console.log(
            "Static sidebar data not found, fetching from Firestore..."
          );
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
      }
    };

    loadData();
  }, [initialData]);

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

  const mobileSidebarRef = useRef<HTMLElement>(null);

  // Close mobile menu when clicking on a link
  useEffect(() => {
    if (isMobileMenuOpen && mobileSidebarRef.current) {
      const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
      };

      const links = mobileSidebarRef.current.querySelectorAll("a");
      links.forEach((link) => {
        link.addEventListener("click", handleLinkClick);
      });

      return () => {
        links.forEach((link) => {
          link.removeEventListener("click", handleLinkClick);
        });
      };
    }
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const sidebarContent = (
    <>
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
                      ? "bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Dashboard"
                >
                  <IconWithBackground
                    icon="dashboard"
                    color="blue"
                    size="w-8 h-8"
                  />
                </Link>
              ) : (
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive("/dashboard") ||
                      isActive("/profile") ||
                      isActive("/referrals") ||
                      isActive("/payments")
                        ? "bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 flex-1"
                    >
                      <IconWithBackground
                        icon="dashboard"
                        color="blue"
                        size="w-8 h-8"
                      />
                      <span
                        className={`text-sm font-medium ${
                          isActive("/dashboard") ||
                          isActive("/profile") ||
                          isActive("/referrals") ||
                          isActive("/payments")
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        Dashboard
                      </span>
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
                    <ul className="ml-4 mt-1 space-y-1 pl-2">
                      {dashboardItems.map((item) => {
                        const itemActive = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                itemActive
                                  ? "bg-blue-50"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span
                                className={
                                  itemActive ? "text-blue-600" : "text-gray-400"
                                }
                              >
                                •
                              </span>
                              <span
                                className={`font-medium ${
                                  itemActive ? "text-blue-600" : "text-gray-600"
                                }`}
                              >
                                {item.label}
                              </span>
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

          {/* Separator after Dashboard */}
          {currentUser && !isCollapsed && (
            <li className="px-3 py-2">
              <div className="border-t border-gray-200"></div>
            </li>
          )}

          {/* Pillar Pages Section - Show for all users */}
          <>
              {/* TEAS (Special Case) */}
              {teasCategories.length > 0 && (
                <li>
                  {isCollapsed ? (
                    <Link
                      href="/teas"
                      className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive("/teas")
                          ? "bg-purple-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title="TEAS"
                    >
                      <IconWithBackground
                        icon="teas"
                        color="purple"
                        size="w-8 h-8"
                      />
                    </Link>
                  ) : (
                    <div>
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive("/teas")
                            ? "bg-purple-50"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Link
                          href="/teas"
                          className="flex items-center gap-3 flex-1"
                        >
                          <IconWithBackground
                            icon="teas"
                            color="purple"
                            size="w-8 h-8"
                          />
                          <span
                            className={`text-sm font-medium ${
                              isActive("/teas")
                                ? "text-purple-600"
                                : "text-gray-700"
                            }`}
                          >
                            TEAS
                          </span>
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
                        <ul className="ml-4 mt-1 space-y-1 pl-2">
                          {teasCategories.map((categoryId) => {
                            const categoryActive =
                              pathname === `/${categoryId}`;
                            return (
                              <li key={categoryId}>
                                <Link
                                  href={`/${categoryId}`}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    categoryActive
                                      ? "bg-purple-50"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  <span
                                    className={
                                      categoryActive
                                        ? "text-purple-600"
                                        : "text-gray-400"
                                    }
                                  >
                                    •
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      categoryActive
                                        ? "text-purple-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {formatCategoryName(categoryId)}
                                  </span>
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

              {/* Separator after TEAS */}
              {teasCategories.length > 0 && !isCollapsed && (
                <li className="px-3 py-2">
                  <div className="border-t border-gray-200"></div>
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
                            ? "bg-green-50"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        title={getPillarPageName(pillarPage)}
                      >
                        <IconWithBackground
                          icon="pillar"
                          color="green"
                          size="w-8 h-8"
                        />
                      </Link>
                    ) : (
                      <div>
                        <div
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            pillarActive
                              ? "bg-green-50"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Link
                            href={`/${pillarPage.id}`}
                            className="flex items-center gap-3 flex-1"
                          >
                            <IconWithBackground
                              icon="pillar"
                              color="green"
                              size="w-8 h-8"
                            />
                            <span
                              className={`text-sm font-medium ${
                                pillarActive
                                  ? "text-green-600"
                                  : "text-gray-700"
                              }`}
                            >
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
                          <ul className="ml-4 mt-1 space-y-1 pl-2">
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
                                        ? "bg-green-50"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span
                                      className={
                                        categoryActive
                                          ? "text-green-600"
                                          : "text-gray-400"
                                      }
                                    >
                                      •
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        categoryActive
                                          ? "text-green-600"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {category.hero?.title ||
                                        formatCategoryName(categoryId)}
                                    </span>
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

          {/* Separator after Pillar Pages */}
          {!isCollapsed &&
            (teasCategories.length > 0 || pillarPages.length > 0) && (
              <li className="px-3 py-2">
                <div className="border-t border-gray-200"></div>
              </li>
            )}

          {/* Loading State - Removed: Data is now available immediately from static build */}

          {/* Progress Reports - Only show if logged in */}
          {currentUser && (
            <li>
              {isCollapsed ? (
                <Link
                  href="/progress-reports"
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive("/progress-reports")
                      ? "bg-orange-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Progress Reports"
                >
                  <IconWithBackground
                    icon="progress"
                    color="orange"
                    size="w-8 h-8"
                  />
                </Link>
              ) : (
                <Link
                  href="/progress-reports"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive("/progress-reports")
                      ? "bg-orange-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconWithBackground
                    icon="progress"
                    color="orange"
                    size="w-8 h-8"
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive("/progress-reports")
                        ? "text-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    Progress Reports
                  </span>
                </Link>
              )}
            </li>
          )}

          {/* Separator after Progress Reports */}
          {currentUser && !isCollapsed && (
            <li className="px-3 py-2">
              <div className="border-t border-gray-200"></div>
            </li>
          )}
        </ul>
      </nav>

      {/* Login/Register or Logout Button */}
      <div className="border-t border-gray-200 p-4 mt-auto bg-gray-50">
        {currentUser ? (
          // Logout Button - Only show if user is logged in
          <>
            {isCollapsed ? (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-200 shadow-sm"
                title="Logout"
                aria-label="Logout"
              >
                <IconWithBackground icon="logout" color="red" size="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-200 shadow-sm"
              >
                <IconWithBackground icon="logout" color="red" size="w-8 h-8" />
                <span className="text-sm font-semibold text-red-600">
                  Logout
                </span>
              </button>
            )}
          </>
        ) : (
          // Login/Register Buttons - Only show if user is not logged in
          <div className="space-y-2">
            {isCollapsed ? (
              <>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-200 shadow-sm"
                  title="Login"
                  aria-label="Login"
                >
                  <IconWithBackground
                    icon="profile"
                    color="blue"
                    size="w-8 h-8"
                  />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-200 shadow-sm"
                >
                  <span className="text-sm font-semibold text-blue-600">
                    Login
                  </span>
                </Link>
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all duration-200 shadow-sm"
                >
                  <span className="text-sm font-semibold text-white">
                    Register
                  </span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-[60] flex-col ${className} ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        style={{ overflow: "visible" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[70] md:hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - reuse same content but always full width */}
      <aside
        ref={mobileSidebarRef}
        className={`md:hidden fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out z-[80] flex-col w-64 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
        style={{ overflow: "visible" }}
      >
        {/* Add close button overlay on mobile */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
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
          </button>
        </div>
        {/* Render same sidebar content - mobile always shows full width */}
        {sidebarContent}
      </aside>
    </>
  );
}
