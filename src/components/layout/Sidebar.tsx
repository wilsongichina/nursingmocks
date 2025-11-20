"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllPillarPages,
  getAllPillarServicePages,
  getAllPages,
  getNursingEntranceExamSubPages,
  getNestedSubPages,
  getNursingExitExamSubPages,
  getNursingExitExamNestedSubPages,
  getNursingTestBankSubPages,
  getNursingTestBankNestedSubPages,
} from "@/lib/firestore-operations";
import { useRouter } from "next/navigation";

// Icon components for dashboard-style cards
const LaptopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

// Icon components for popup modal
const BookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const FlaskIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const ABCIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
  >
    {/* Letter A - Centered */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.5 17.5L6.5 13.5L7.5 17.5"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 15.5H7" />

    {/* Letter B - Centered */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 12.5V17.5" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 12.5H12C12.7 12.5 13.2 13 13.2 13.6C13.2 14.2 12.7 14.7 12 14.7H10.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 14.7H12C12.7 14.7 13.2 15.2 13.2 15.8C13.2 16.4 12.7 16.9 12 16.9H10.5"
    />

    {/* Letter C - Centered */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.5C15.7 12.5 15 13.1 15 13.8V16.2C15 16.9 15.7 17.5 16.5 17.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.8 12.8C18.1 13 18.2 13.3 18.2 13.6"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.8 17.2C18.1 17 18.2 16.7 18.2 16.4"
    />
  </svg>
);

interface SidebarData {
  pillarPages: PillarPage[];
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

export default function Sidebar({
  className = "",
  initialData = null,
}: SidebarProps) {
  const { isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } =
    useSidebar();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  // Initialize state - always start empty, will be populated from Firestore
  const [pillarPages, setPillarPages] = useState<PillarPage[]>(
    initialData?.pillarPages ? [...initialData.pillarPages] : []
  );
  const [pillarCategories, setPillarCategories] = useState<
    Record<string, Category[]>
  >(
    initialData?.pillarCategories
      ? Object.fromEntries(
          Object.entries(initialData.pillarCategories).map(([key, value]) => [
            key,
            [...value],
          ])
        )
      : {}
  );
  // Initialize expandedItems with all pillar pages expanded by default
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    // Add nursing-exit-exam and nursing-test-bank to expanded items by default
    initialSet.add("nursing-exit-exam");
    initialSet.add("nursing-test-bank");
    // Add all pillar page IDs to the set if initial data is available
    if (initialData?.pillarPages) {
      initialData.pillarPages.forEach((page: PillarPage) => {
        initialSet.add(page.id);
      });
    }
    return initialSet;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubPage, setSelectedSubPage] = useState<{
    id: string;
    name: string;
    parentPillarId: string;
    slug?: string;
  } | null>(null);
  const [nestedSubPages, setNestedSubPages] = useState<any[]>([]);
  const [loadingNested, setLoadingNested] = useState(false);
  const router = useRouter();

  // Auto-expand sections based on current pathname
  useEffect(() => {
    // Data is available immediately from static build, no need to wait
    setExpandedItems((prev) => {
      const newSet = new Set(prev);

      // Expand nursing-exit-exam and nursing-test-bank by default
      newSet.add("nursing-exit-exam");
      newSet.add("nursing-test-bank");

      // Expand all pillar pages by default
      pillarPages.forEach((pillarPage) => {
        newSet.add(pillarPage.id);
      });

      // Check if we're on dashboard or any dashboard sub-page
      if (
        pathname === "/dashboard" ||
        pathname === "/profile" ||
        pathname === "/referrals" ||
        pathname === "/payments"
      ) {
        newSet.add("dashboard");
      }

      // Removed TEAS section - no longer exists

      // Keep pillar pages expanded (already added above)
      // The pathname-based expansion is handled above for all pillar pages

      return newSet;
    });
  }, [pathname, pillarPages, pillarCategories]);

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
      teal: "bg-teal-100 text-teal-600",
      indigo: "bg-indigo-100 text-indigo-600",
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
        case "exit-exam":
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case "test-bank":
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          );
        case "entrance-exam":
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
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14v9M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
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
    // If initialData is provided, use it and skip Firestore loading
    if (initialData) {
      setPillarPages(initialData.pillarPages || []);
      setPillarCategories(initialData.pillarCategories || {});
      return;
    }

    // Try to load from static JSON file first
    const loadStaticData = async () => {
      try {
        const response = await fetch("/data/sidebar-data.json");
        if (response.ok) {
          const staticData = await response.json();
          if (staticData.pillarPages && staticData.pillarCategories) {
            setPillarPages(staticData.pillarPages);
            setPillarCategories(staticData.pillarCategories);
            console.log("[Sidebar] Loaded static data from sidebar-data.json");
            return true;
          }
        }
      } catch (error) {
        console.warn("[Sidebar] Could not load static data, falling back to Firestore:", error);
      }
      return false;
    };

    // Load data - try static first, then Firestore
    const loadData = async () => {
      const staticLoaded = await loadStaticData();
      if (staticLoaded) {
        // Static data loaded successfully, no need to load from Firestore
        return;
      }

      // Fallback to Firestore if static data not available
      try {
        const [pillarPagesResult, allPagesResult] = await Promise.all([
          getAllPillarPages(),
          getAllPages(),
        ]);

        if (!pillarPagesResult.success || !allPagesResult.success) {
          console.error("Failed to load data");
          return;
        }

        const allPillarPages = pillarPagesResult.data || [];
        const categoriesByPillar: Record<string, Category[]> = {};

        // Fetch categories for each pillar page
        for (const pillarPage of allPillarPages) {
          if (pillarPage.id === "nursing-entrance-exam") {
            const result = await getNursingEntranceExamSubPages();
            if (result.success && result.data) {
              const categories = result.data.map((subPage: any) => ({
                id: subPage.id || subPage.subPageId,
                servicePageId: subPage.id || subPage.subPageId,
                ...subPage,
              }));
              categoriesByPillar[pillarPage.id] = categories;
            }
          } else if (pillarPage.id === "nursing-exit-exam") {
            const result = await getNursingExitExamSubPages();
            if (result.success && result.data) {
              const categories = result.data.map((subPage: any) => ({
                id: subPage.id || subPage.subPageId,
                servicePageId: subPage.id || subPage.subPageId,
                ...subPage,
              }));
              categoriesByPillar[pillarPage.id] = categories;
            }
          } else if (pillarPage.id === "nursing-test-bank") {
            const result = await getNursingTestBankSubPages();
            if (result.success && result.data) {
              const categories = result.data.map((subPage: any) => ({
                id: subPage.id || subPage.subPageId,
                servicePageId: subPage.id || subPage.subPageId,
                ...subPage,
              }));
              categoriesByPillar[pillarPage.id] = categories;
            }
          } else {
            const result = await getAllPillarServicePages(pillarPage.id);
            if (result.success && result.data) {
              const categories = result.data.map((service: any) => ({
                id: service.servicePageId || service.id,
                servicePageId: service.servicePageId || service.id,
                ...service,
              }));
              categoriesByPillar[pillarPage.id] = categories;
            }
          }
        }

        setPillarPages(allPillarPages);
        setPillarCategories(categoriesByPillar);

        // Expand all pillar pages by default when data is loaded
        setExpandedItems((prev) => {
          const newSet = new Set(prev);
          newSet.add("nursing-exit-exam");
          newSet.add("nursing-test-bank");
          allPillarPages.forEach((page: PillarPage) => {
            newSet.add(page.id);
          });
          return newSet;
        });
      } catch (error) {
        console.error("Error loading pillar pages and categories from Firestore:", error);
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

  const handleSubPageClick = async (
    e: React.MouseEvent,
    categoryId: string,
    categoryName: string,
    parentPillarId: string,
    categorySlug?: string
  ) => {
    e.preventDefault();
    setSelectedSubPage({
      id: categoryId,
      name: categoryName,
      parentPillarId,
      slug: categorySlug,
    });
    setLoadingNested(true);
    setIsModalOpen(true);

    try {
      const result = await getNestedSubPages(categoryId);
      if (result.success && result.data) {
        setNestedSubPages(result.data);
      } else {
        setNestedSubPages([]);
      }
    } catch (error) {
      console.error("Error loading nested sub-pages:", error);
      setNestedSubPages([]);
    } finally {
      setLoadingNested(false);
    }
  };

  const handleNestedSubPageClick = (
    nestedSubPage: any,
    parentSubPageId: string
  ) => {
    const nestedPageId =
      nestedSubPage.slug || nestedSubPage.id || nestedSubPage.nestedSubPageId;
    // Get parent slug from selectedSubPage (prefer slug over id) or use parentSubPageId
    const parentSlug =
      selectedSubPage?.slug || selectedSubPage?.id || parentSubPageId;

    // Check if this is for exit exam, test bank, or entrance exam
    const isExitExam = selectedSubPage?.parentPillarId === "nursing-exit-exam";
    const isTestBank = selectedSubPage?.parentPillarId === "nursing-test-bank";

    if (isTestBank) {
      // Test bank URL pattern: /{nestedPageId}-{parentSlug}-test-bank
      const nestedSubPageUrl = `/${nestedPageId}-${parentSlug}-test-bank`;
      router.push(nestedSubPageUrl);
    } else if (isExitExam) {
      // Exit exam URL pattern: /{nestedPageId}-{parentSlug}-exit-exam
      const nestedSubPageUrl = `/${nestedPageId}-${parentSlug}-exit-exam`;
      router.push(nestedSubPageUrl);
    } else {
      // Entrance exam URL pattern: /{parentSlug}-{nestedPageId}-questions
      // Remove -exam suffix if present for nested sub-page URLs
      const parentUrlSlug = parentSlug.endsWith("-exam")
        ? parentSlug.slice(0, -5)
        : parentSlug;
      const nestedSubPageUrl = `/${parentUrlSlug}-${nestedPageId}-questions`;
      router.push(nestedSubPageUrl);
    }

    setIsModalOpen(false);
    setSelectedSubPage(null);
    setNestedSubPages([]);
  };

  const handleExitExamSubPageClick = async (
    e: React.MouseEvent,
    categoryId: string,
    categoryName: string,
    categorySlug?: string
  ) => {
    e.preventDefault();
    setSelectedSubPage({
      id: categoryId,
      name: categoryName,
      parentPillarId: "nursing-exit-exam",
      slug: categorySlug,
    });
    setLoadingNested(true);
    setIsModalOpen(true);

    try {
      const result = await getNursingExitExamNestedSubPages(categoryId);
      if (result.success && result.data) {
        setNestedSubPages(result.data);
      } else {
        setNestedSubPages([]);
      }
    } catch (error) {
      console.error("Error loading nested sub-pages:", error);
      setNestedSubPages([]);
    } finally {
      setLoadingNested(false);
    }
  };

  const handleTestBankSubPageClick = async (
    e: React.MouseEvent,
    categoryId: string,
    categoryName: string,
    categorySlug?: string
  ) => {
    e.preventDefault();
    setSelectedSubPage({
      id: categoryId,
      name: categoryName,
      parentPillarId: "nursing-test-bank",
      slug: categorySlug,
    });
    setLoadingNested(true);
    setIsModalOpen(true);

    try {
      const result = await getNursingTestBankNestedSubPages(categoryId);
      if (result.success && result.data) {
        setNestedSubPages(result.data);
      } else {
        setNestedSubPages([]);
      }
    } catch (error) {
      console.error("Error loading nested sub-pages:", error);
      setNestedSubPages([]);
    } finally {
      setLoadingNested(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubPage(null);
    setNestedSubPages([]);
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
            {/* All Pillar Pages */}
            {(() => {
              // Define the desired order: 1. Entrance Exam, 2. Test Bank, 3. Exit Exam
              const pillarPageOrder = [
                "nursing-entrance-exam",
                "nursing-test-bank",
                "nursing-exit-exam"
              ];
              
              // Filter pillar pages that have categories and sort them
              const validPillarPages = pillarPages
                .filter((page) => (pillarCategories[page.id] || []).length > 0)
                .sort((a, b) => {
                  const indexA = pillarPageOrder.indexOf(a.id);
                  const indexB = pillarPageOrder.indexOf(b.id);
                  // If both are in the order array, sort by their position
                  if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                  }
                  // If only one is in the order array, prioritize it
                  if (indexA !== -1) return -1;
                  if (indexB !== -1) return 1;
                  // If neither is in the order array, maintain original order
                  return 0;
                });
              
              return validPillarPages.map((pillarPage, index) => {
                const categories = pillarCategories[pillarPage.id] || [];

                // Determine active state based on pillar page type
                let pillarActive: boolean;
                if (pillarPage.id === "nursing-entrance-exam") {
                  pillarActive =
                    pathname.startsWith(`/${pillarPage.id}`) ||
                    (pathname.match(/^\/.+-exam$/) && !pathname.endsWith("-exit-exam")) ||
                    pathname.match(/^\/.+-.+-questions$/);
                } else if (pillarPage.id === "nursing-exit-exam") {
                  pillarActive =
                    pathname === "/nursing-exit-exam" ||
                    pathname.startsWith("/nursing-exit-exam/") ||
                    pathname.match(/^\/.+-.+-exit-exam$/);
                } else if (pillarPage.id === "nursing-test-bank") {
                  pillarActive =
                    pathname === "/nursing-test-bank" ||
                    pathname.startsWith("/nursing-test-bank/") ||
                    pathname.match(/^\/.+-.+-test-bank$/);
                } else {
                  pillarActive = pathname.startsWith(`/${pillarPage.id}`);
                }

                const isExpanded = expandedItems.has(pillarPage.id);

                // Determine icon and color based on pillar page type
                let iconType: string;
                let iconColor: string;
                let activeBgColor: string;
                let activeTextColor: string;

                if (pillarPage.id === "nursing-entrance-exam") {
                  iconType = "entrance-exam";
                  iconColor = "purple";
                  activeBgColor = "bg-purple-50";
                  activeTextColor = "text-purple-600";
                } else if (pillarPage.id === "nursing-exit-exam") {
                  iconType = "exit-exam";
                  iconColor = "teal";
                  activeBgColor = "bg-teal-50";
                  activeTextColor = "text-teal-600";
                } else if (pillarPage.id === "nursing-test-bank") {
                  iconType = "test-bank";
                  iconColor = "indigo";
                  activeBgColor = "bg-indigo-50";
                  activeTextColor = "text-indigo-600";
                } else {
                  iconType = "pillar";
                  iconColor = "green";
                  activeBgColor = "bg-green-50";
                  activeTextColor = "text-green-600";
                }

                return (
                  <React.Fragment key={pillarPage.id}>
                    <li>
                    {isCollapsed ? (
                      <Link
                        href={`/${pillarPage.id}`}
                        className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          pillarActive ? activeBgColor : "text-gray-700"
                        }`}
                        title={getPillarPageName(pillarPage)}
                      >
                        <IconWithBackground
                          icon={iconType}
                          color={iconColor}
                          size="w-8 h-8"
                        />
                      </Link>
                    ) : (
                      <div>
                        <div
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            pillarActive ? activeBgColor : "text-gray-700"
                          }`}
                        >
                          <Link
                            href={`/${pillarPage.id}`}
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={(e) => {
                              // Don't prevent default - allow navigation
                              e.stopPropagation();
                            }}
                          >
                            <IconWithBackground
                              icon={iconType}
                              color={iconColor}
                              size="w-8 h-8"
                            />
                            <span
                              className={`text-sm font-medium cursor-pointer ${
                                pillarActive
                                  ? activeTextColor
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
                            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
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
                              // Get category ID and slug
                              const categoryId =
                                category.id || category.subPageId || category.servicePageId;
                              const categorySlug = category.slug || categoryId;

                              // Determine URL based on pillar page type
                              let subPageUrl: string;
                              let categoryActive: boolean;

                              if (pillarPage.id === "nursing-entrance-exam") {
                                // For nursing-entrance-exam: /{slug}-exam or /{slug}
                                subPageUrl = `/${
                                  categorySlug.endsWith("-exam")
                                    ? categorySlug
                                    : `${categorySlug}-exam`
                                }`;
                                categoryActive =
                                  pathname === subPageUrl ||
                                  pathname === `/${categorySlug}` ||
                                  pathname === `/${categorySlug}-exam` ||
                                  pathname.match(
                                    new RegExp(`^/${categorySlug}-.+-questions$`)
                                  );
                              } else if (pillarPage.id === "nursing-exit-exam") {
                                // For nursing-exit-exam: /nursing-exit-exam/{slug} or /{nested}-{parent}-exit-exam
                                subPageUrl = `/nursing-exit-exam/${categorySlug}`;
                                categoryActive =
                                  pathname === subPageUrl ||
                                  pathname.startsWith(subPageUrl + "/") ||
                                  pathname.match(
                                    new RegExp(`^/.+-${categorySlug}-exit-exam$`)
                                  );
                              } else if (pillarPage.id === "nursing-test-bank") {
                                // For nursing-test-bank: /{slug}-test-bank or /{nested}-{parent}-test-bank
                                subPageUrl = `/${categorySlug}-test-bank`;
                                categoryActive =
                                  pathname === subPageUrl ||
                                  pathname.match(
                                    new RegExp(`^/.+-${categorySlug}-test-bank$`)
                                  ) ||
                                  pathname.match(
                                    new RegExp(`^/${categorySlug}-.+-test-bank$`)
                                  );
                              } else {
                                // For other pillar pages: /{pillarPage.id}/{categoryId}
                                subPageUrl = `/${pillarPage.id}/${categoryId}`;
                                categoryActive =
                                  pathname === subPageUrl ||
                                  pathname.startsWith(subPageUrl + "/");
                              }

                              const categoryName =
                                category.pageName ||
                                category.hero?.title ||
                                formatCategoryName(categoryId);

                              // Determine which handler to use based on pillar page
                              const handleClick = (e: React.MouseEvent) => {
                                if (pillarPage.id === "nursing-exit-exam") {
                                  handleExitExamSubPageClick(
                                    e,
                                    categoryId,
                                    categoryName,
                                    categorySlug
                                  );
                                } else if (pillarPage.id === "nursing-test-bank") {
                                  handleTestBankSubPageClick(
                                    e,
                                    categoryId,
                                    categoryName,
                                    categorySlug
                                  );
                                } else {
                                  handleSubPageClick(
                                    e,
                                    categoryId,
                                    categoryName,
                                    pillarPage.id,
                                    categorySlug
                                  );
                                }
                              };

                              return (
                                <li key={categoryId}>
                                  <button
                                    onClick={handleClick}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left cursor-pointer ${
                                      categoryActive
                                        ? activeBgColor
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span
                                      className={`cursor-pointer ${
                                        categoryActive
                                          ? activeTextColor
                                          : "text-gray-400"
                                      }`}
                                    >
                                      •
                                    </span>
                                    <span
                                      className={`font-medium cursor-pointer ${
                                        categoryActive
                                          ? activeTextColor
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {categoryName}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                  {/* Separator after each pillar page (except the last one) */}
                  {index < validPillarPages.length - 1 && !isCollapsed && (
                    <li key={`separator-${pillarPage.id}`} className="px-3 py-2">
                      <div className="border-t border-gray-200"></div>
                    </li>
                  )}
                </React.Fragment>
                );
              });
            })()}
          </>

          {/* Separator after all Pillar Pages */}
          {!isCollapsed && pillarPages.length > 0 && (
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

      {/* Modal for Nested Sub-Pages */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedSubPage?.name || "Select a Page"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingNested ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : nestedSubPages.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {nestedSubPages.map((nestedSubPage: any, index: number) => {
                    const nestedPageId =
                      nestedSubPage.id || nestedSubPage.nestedSubPageId;
                    const nestedPageName =
                      nestedSubPage.pageName ||
                      nestedSubPage.hero?.title ||
                      nestedSubPage.title ||
                      nestedPageId;
                    const parentSubPageId = selectedSubPage?.id || "";

                    // Color variants for icons and text (rotating based on index)
                    const iconColorVariants = [
                      {
                        iconBg: "bg-purple-500",
                        numberColor: "text-purple-600",
                      },
                      { iconBg: "bg-blue-500", numberColor: "text-blue-600" },
                      {
                        iconBg: "bg-orange-500",
                        numberColor: "text-orange-600",
                      },
                      { iconBg: "bg-green-500", numberColor: "text-green-600" },
                      { iconBg: "bg-teal-500", numberColor: "text-teal-600" },
                      {
                        iconBg: "bg-indigo-500",
                        numberColor: "text-indigo-600",
                      },
                      { iconBg: "bg-pink-500", numberColor: "text-pink-600" },
                      { iconBg: "bg-cyan-500", numberColor: "text-cyan-600" },
                    ];

                    // Get icon based on page name (for popup modal only)
                    const getModalIcon = (
                      pageName: string,
                      cardIndex: number
                    ) => {
                      const nameLower = pageName.toLowerCase();
                      if (nameLower.includes("reading")) {
                        return {
                          icon: <BookIcon className="w-6 h-6 text-white" />,
                          iconBg: "bg-purple-500",
                          numberColor: "text-purple-600",
                        };
                      } else if (nameLower.includes("math")) {
                        return {
                          icon: (
                            <CalculatorIcon className="w-6 h-6 text-white" />
                          ),
                          iconBg: "bg-blue-500",
                          numberColor: "text-blue-600",
                        };
                      } else if (nameLower.includes("science")) {
                        return {
                          icon: <FlaskIcon className="w-6 h-6 text-white" />,
                          iconBg: "bg-orange-500",
                          numberColor: "text-orange-600",
                        };
                      } else if (nameLower.includes("english")) {
                        return {
                          icon: <ABCIcon className="w-6 h-6 text-white" />,
                          iconBg: "bg-green-500",
                          numberColor: "text-green-600",
                        };
                      }
                      // Default fallback - use index-based color
                      const iconColor =
                        iconColorVariants[cardIndex % iconColorVariants.length];
                      return {
                        icon: <LaptopIcon className="w-6 h-6 text-white" />,
                        iconBg: iconColor.iconBg,
                        numberColor: iconColor.numberColor,
                      };
                    };

                    const config = getModalIcon(nestedPageName, index);
                    const questionCount = nestedSubPage.questionCount || "0";

                    return (
                      <div
                        key={nestedPageId}
                        onClick={() =>
                          handleNestedSubPageClick(
                            nestedSubPage,
                            parentSubPageId
                          )
                        }
                        className="bg-white rounded-lg shadow-sm p-6 hover:bg-gray-50 transition-all duration-200 w-full sm:w-[calc(50%-0.5rem)] max-w-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {nestedPageName}
                            </p>
                            <p
                              className={`text-3xl font-bold ${config.numberColor}`}
                            >
                              {questionCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Questions Available
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-gray-400"
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
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No nested sub-pages available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
