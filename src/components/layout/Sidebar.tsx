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
  countNestedPageQuestions,
  countTopicQuestions,
  getNursingTestBankTopics,
} from "@/lib/firestore-operations";
import { useRouter } from "next/navigation";

// Icon components for dashboard-style cards
const _LaptopIcon = ({ className }: { className?: string }) => (
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
const _BookIcon = ({ className }: { className?: string }) => (
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

const _CalculatorIcon = ({ className }: { className?: string }) => (
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

const _FlaskIcon = ({ className }: { className?: string }) => (
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

const _ABCIcon = ({ className }: { className?: string }) => (
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

const examPillarIds = [
  "nursing-entrance-exam",
  "nursing-test-bank",
  "nursing-exit-exam",
];

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
  // Keep Nursing Entrance Exams open by default; other exam pillars start closed.
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    initialSet.add("nursing-entrance-exam");
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

      examPillarIds.forEach((pillarId) => {
        if (pillarId !== "nursing-entrance-exam") {
          newSet.delete(pillarId);
        }
      });
      newSet.add("nursing-entrance-exam");

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

  const mainItems = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard", color: "blue" },
    { label: "My Exams", href: "/dashboard/my-exams", icon: "test-bank", color: "indigo" },
    {
      label: "Results & Progress",
      href: "/progress-reports",
      icon: "progress",
      color: "orange",
    },
  ];

  const accountItems = [
    { label: "Profile", href: "/profile", icon: "profile", color: "purple" },
    {
      label: "Billing & Subscription",
      href: "/payments",
      icon: "payments",
      color: "blue",
    },
    {
      label: "Referrals",
      href: "/referrals",
      icon: "referrals",
      color: "green",
    },
    {
      label: "Help & Support",
      href: "/contact",
      icon: "support",
      color: "teal",
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
        case "support":
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
                d="M8.228 9c.549-1.165 1.72-2 3.272-2 1.933 0 3.5 1.343 3.5 3 0 1.307-.973 2.418-2.333 2.83-.724.219-1.167.853-1.167 1.503V15m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
        console.warn(
          "[Sidebar] Could not load static data, falling back to Firestore:",
          error
        );
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
        console.error(
          "Error loading pillar pages and categories from Firestore:",
          error
        );
      }
    };

    loadData();
  }, [initialData]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (examPillarIds.includes(itemId)) {
          examPillarIds.forEach((pillarId) => newSet.delete(pillarId));
        }
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
    const sectionLabels: Record<string, string> = {
      "nursing-entrance-exam": "Nursing Entrance Exams",
      "nursing-test-bank": "Nursing Test Bank",
      "nursing-exit-exam": "Nursing Exit Exams",
    };
    if (sectionLabels[pillarPage.id]) {
      return sectionLabels[pillarPage.id];
    }
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
        // Fetch question counts for nested pages
        const nestedPagesWithCounts = await Promise.all(
          result.data.map(async (nestedPage: any) => {
            const nestedPageSlug = nestedPage.slug || nestedPage.id;
            const questionCount = await countNestedPageQuestions(
              parentPillarId as "nursing-entrance-exam",
              categoryId,
              nestedPageSlug
            );
            return {
              ...nestedPage,
              questionCount,
            };
          })
        );
        setNestedSubPages(nestedPagesWithCounts);
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

  const _handleNestedSubPageClick = async (
    nestedSubPage: any,
    parentSubPageId: string
  ) => {
    // Get parent slug from selectedSubPage (prefer slug over id) or use parentSubPageId
    const parentSlug =
      selectedSubPage?.slug || selectedSubPage?.id || parentSubPageId;

    // Check if this is for exit exam, test bank, or entrance exam
    const isExitExam = selectedSubPage?.parentPillarId === "nursing-exit-exam";
    const isTestBank = selectedSubPage?.parentPillarId === "nursing-test-bank";
    const pillarId = selectedSubPage?.parentPillarId || "nursing-entrance-exam";

    // Try to get route mapping slug for the nested sub-page (most reliable)
    let nestedSubPageUrl: string | null = null;
    const nestedPageId = nestedSubPage.id || nestedSubPage.nestedSubPageId;

    try {
      const { getRouteMappingById } = await import(
        "@/lib/firestore-operations"
      );
      const routeMappingResult = await getRouteMappingById({
        pillarId: pillarId,
        type: "nested",
        id: nestedPageId,
        subPageId: parentSubPageId,
      });

      if (routeMappingResult.success && routeMappingResult.data) {
        const mapping = routeMappingResult.data as any;
        if (mapping.slug) {
          // Use the route mapping slug directly (this is the final URL slug)
          nestedSubPageUrl = `/${mapping.slug}`;
        }
      }
    } catch (error) {
      console.warn("Error getting route mapping for nested sub-page:", error);
    }

    // If route mapping not found, construct URL based on pillar page type
    if (!nestedSubPageUrl) {
      const nestedPageSlug =
        nestedSubPage.slug || nestedSubPage.id || nestedSubPage.nestedSubPageId;

      if (isTestBank) {
        // Test bank URL pattern: /{nestedPageSlug}-{parentSlug}-test-bank
        // Note: nestedPageSlug might already contain parent prefix, but we need the full format
        nestedSubPageUrl = `/${nestedPageSlug}-${parentSlug}-test-bank`;
      } else if (isExitExam) {
        // Exit exam: nested slug already contains parent prefix, so just use the nested slug
        // The nested slug format is: {parentSlug}-{nestedBaseSlug}
        nestedSubPageUrl = `/${nestedPageSlug}`;
      } else {
        // Entrance exam URL pattern: /{parentSlug}-{nestedBaseSlug}-questions
        // Extract nested base slug if nested slug contains parent prefix
        let nestedBaseSlug = nestedPageSlug;
        if (nestedPageSlug.startsWith(parentSlug + "-")) {
          nestedBaseSlug = nestedPageSlug.substring(parentSlug.length + 1);
        }
        // Remove -exam suffix if present for nested sub-page URLs
        const parentUrlSlug = parentSlug.endsWith("-exam")
          ? parentSlug.slice(0, -5)
          : parentSlug;
        nestedSubPageUrl = `/${parentUrlSlug}-${nestedBaseSlug}-questions`;
      }
    }

    router.push(nestedSubPageUrl);
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
        // Fetch question counts for nested pages
        const nestedPagesWithCounts = await Promise.all(
          result.data.map(async (nestedPage: any) => {
            const nestedPageSlug = nestedPage.slug || nestedPage.id;
            const questionCount = await countNestedPageQuestions(
              "nursing-exit-exam",
              categoryId,
              nestedPageSlug
            );
            return {
              ...nestedPage,
              questionCount,
            };
          })
        );
        setNestedSubPages(nestedPagesWithCounts);
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
        // Fetch question counts for nested pages (test bank nested pages have topics, so count through topics)
        const nestedPagesWithCounts = await Promise.all(
          result.data.map(async (nestedPage: any) => {
            const nestedPageSlug = nestedPage.slug || nestedPage.id;
            // For test bank, we need to count questions through topics
            const topicsResult = await getNursingTestBankTopics(
              categoryId,
              nestedPageSlug
            );
            let totalCount = 0;
            if (topicsResult.success && topicsResult.data) {
              for (const topic of topicsResult.data) {
                const topicSlug = topic.slug || topic.id;
                const count = await countTopicQuestions(
                  categoryId,
                  nestedPageSlug,
                  topicSlug
                );
                totalCount += count;
              }
            }
            return {
              ...nestedPage,
              questionCount: totalCount,
            };
          })
        );
        setNestedSubPages(nestedPagesWithCounts);
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
          <Link href="/" aria-label="NursingMocks Home" className="flex-shrink-0">
            <Image
              src="/nursing-mocks-logo.png"
              alt="NursingMocks Logo"
              width={150}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        ) : (
          <Link
            href="/"
            aria-label="NursingMocks Home"
            className="flex-shrink-0 flex items-center justify-center"
          >
            <Image
              src="/favicon.png"
              alt="NursingMocks Logo"
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
          {/* Main Section - Only show if logged in */}
          {currentUser && (
            <>
              {!isCollapsed && (
                <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Main
                </li>
              )}
              {mainItems.map((item) => {
                const itemActive = item.href.includes("#")
                  ? false
                  : isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isCollapsed ? "justify-center px-3" : "gap-3 px-3"
                      } py-2.5 rounded-lg transition-all duration-200 ${
                        itemActive
                          ? "bg-blue-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={item.label}
                    >
                      <IconWithBackground
                        icon={item.icon}
                        color={item.color}
                        size="w-8 h-8"
                      />
                      {!isCollapsed && (
                        <span
                          className={`text-sm font-medium ${
                            itemActive ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </>
          )}

          {/* Separator after Main */}
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
                "nursing-exit-exam",
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

                // Active state removed - no longer highlighting selected pages
                const pillarActive = false;

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
                            pillarActive ? activeBgColor : "text-gray-900"
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
                              pillarActive ? activeBgColor : "text-gray-900"
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
                                    : "text-gray-900"
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
                            <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                              {categories.map((category) => {
                                // Get category ID and slug
                                const categoryId =
                                  category.id ||
                                  category.subPageId ||
                                  category.servicePageId;
                                const categorySlug =
                                  category.slug || categoryId;

                                // Active state removed - no longer highlighting selected pages
                                const categoryActive = false;

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
                                  } else if (
                                    pillarPage.id === "nursing-test-bank"
                                  ) {
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
                                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left cursor-pointer ${
                                        categoryActive
                                          ? activeBgColor
                                          : "text-gray-900 hover:bg-gray-50"
                                      }`}
                                    >
                                      <span
                                        className={`hidden cursor-pointer ${
                                          categoryActive
                                            ? activeTextColor
                                            : "text-gray-900"
                                        }`}
                                      >
                                        •
                                      </span>
                                      <span
                                        className={`font-medium cursor-pointer ${
                                          categoryActive
                                            ? activeTextColor
                                            : "text-gray-900"
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
                      <li
                        key={`separator-${pillarPage.id}`}
                        className="px-3 py-2"
                      >
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

          {/* Account Section - Only show if logged in */}
          {currentUser && (
            <>
              {!isCollapsed && (
                <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Account
                </li>
              )}
              {accountItems.map((item) => {
                const itemActive = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isCollapsed ? "justify-center px-3" : "gap-3 px-3"
                      } py-2.5 rounded-lg transition-all duration-200 ${
                        itemActive
                          ? "bg-blue-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={item.label}
                    >
                      <IconWithBackground
                        icon={item.icon}
                        color={item.color}
                        size="w-8 h-8"
                      />
                      {!isCollapsed && (
                        <span
                          className={`text-sm font-medium ${
                            itemActive ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </>
          )}

          {/* Separator after Account */}
          {currentUser && !isCollapsed && (
            <li className="px-3 py-2">
              <div className="border-t border-gray-200"></div>
            </li>
          )}

          {/* Loading State - Removed: Data is now available immediately from static build */}

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
          isCollapsed ? "w-20" : "w-72"
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
        className={`md:hidden fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out z-[80] flex-col w-72 max-w-[85vw] ${
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
          style={{
            background:
              "radial-gradient(circle at top, rgba(15, 23, 42, 0.26), rgba(15, 23, 42, 0.6))",
          }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[20px] shadow-[0_20px_45px_rgba(15,23,42,0.22)] border border-[rgba(148,163,184,0.25)] w-full max-w-[840px] p-[14px] sm:p-4 relative max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 1rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-[3px]">
                <div className="inline-flex items-center px-2 py-[2px] rounded-full bg-[rgba(106,92,255,0.06)] text-[#6a5cff] text-[10px] uppercase tracking-[0.09em] font-semibold">
                  {selectedSubPage?.parentPillarId === "nursing-entrance-exam"
                    ? "ATI"
                    : selectedSubPage?.parentPillarId === "nursing-exit-exam"
                    ? "Exit Exam"
                    : "Test Bank"}{" "}
                  · Question Pools
                </div>
                <div className="text-base font-bold text-[#202437] tracking-[0.01em]">
                  {selectedSubPage?.name || "Select a Page"}
                </div>
                <div className="text-xs text-[#7a819c]">
                  Quickly select a subject, then choose Review Mode, Exam Mode,
                  or view all sets.
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-[26px] h-[26px] rounded-full border border-[#d1d5db] inline-flex items-center justify-center bg-white cursor-pointer text-[#a0a5bf] text-base transition-all duration-[180ms] flex-shrink-0 hover:bg-[#f5f6fb] hover:text-[#202437] hover:-translate-y-[1px]"
                aria-label="Close modal"
                type="button"
              >
                ×
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              {loadingNested ? (
                <div className="col-span-1 md:col-span-2 flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6a5cff]"></div>
                </div>
              ) : nestedSubPages.length > 0 ? (
                nestedSubPages.map((nestedSubPage: any, _index: number) => {
                  const nestedPageId =
                    nestedSubPage.id || nestedSubPage.nestedSubPageId;
                  const nestedPageName =
                    nestedSubPage.pageName ||
                    nestedSubPage.hero?.title ||
                    nestedSubPage.title ||
                    nestedPageId;
                  const _parentSubPageId = selectedSubPage?.id || "";
                  const nameLower = nestedPageName.toLowerCase();

                  // Get subject info
                  const getSubjectInfo = () => {
                    if (nameLower.includes("math")) {
                      return {
                        tag: "M1",
                        title: `${selectedSubPage?.name || ""} Math Questions`,
                        subtitle: "Numbers, ratios, percentages",
                        color: "text-[#2563eb]",
                        colorClass: "count-math",
                      };
                    } else if (nameLower.includes("reading")) {
                      return {
                        tag: "R1",
                        title: `${
                          selectedSubPage?.name || ""
                        } Reading Questions`,
                        subtitle: "Passages, inference, main idea",
                        color: "text-[#a855f7]",
                        colorClass: "count-read",
                      };
                    } else if (nameLower.includes("science")) {
                      return {
                        tag: "S1",
                        title: `${
                          selectedSubPage?.name || ""
                        } Science Questions`,
                        subtitle: "A&P, biology, chemistry",
                        color: "text-[#f97316]",
                        colorClass: "count-sci",
                      };
                    } else if (nameLower.includes("english")) {
                      return {
                        tag: "E1",
                        title: `${
                          selectedSubPage?.name || ""
                        } English Questions`,
                        subtitle: "Grammar, spelling, punctuation",
                        color: "text-[#16a34a]",
                        colorClass: "count-eng",
                      };
                    } else if (nameLower.includes("all")) {
                      return {
                        tag: "A1",
                        title: `${selectedSubPage?.name || ""} All Subjects`,
                        subtitle: "Mixed-section practice",
                        color: "text-[#6a5cff]",
                        colorClass: "count-math",
                      };
                    }
                    // Default
                    return {
                      tag: undefined,
                      title: nestedPageName,
                      subtitle: "",
                      color: "text-[#6a5cff]",
                      colorClass: "count-math",
                    };
                  };

                  const subjectInfo = getSubjectInfo();
                  const questionCount = nestedSubPage.questionCount || 0;

                  // Get nested page URL (using same logic as handleNestedSubPageClick)
                  // For Link href, we'll use the constructed URL (route mapping lookup is async)
                  const pillarId =
                    selectedSubPage?.parentPillarId || "nursing-entrance-exam";
                  const isExitExam = pillarId === "nursing-exit-exam";
                  const isTestBank = pillarId === "nursing-test-bank";
                  const parentSlug =
                    selectedSubPage?.slug || selectedSubPage?.id || "";
                  const nestedPageSlug =
                    nestedSubPage.slug || nestedSubPage.id || nestedPageId;

                  let nestedPageUrl = "#";
                  if (isTestBank) {
                    nestedPageUrl = `/${nestedPageSlug}-${parentSlug}-test-bank`;
                  } else if (isExitExam) {
                    nestedPageUrl = `/${nestedPageSlug}`;
                  } else {
                    // Entrance exam
                    let nestedBaseSlug = nestedPageSlug;
                    if (nestedPageSlug.startsWith(parentSlug + "-")) {
                      nestedBaseSlug = nestedPageSlug.substring(
                        parentSlug.length + 1
                      );
                    }
                    const parentUrlSlug = parentSlug.endsWith("-exam")
                      ? parentSlug.slice(0, -5)
                      : parentSlug;
                    nestedPageUrl = `/${parentUrlSlug}-${nestedBaseSlug}-questions`;
                  }

                  // Ensure we have a valid URL
                  if (!nestedPageUrl || nestedPageUrl === "/") {
                    nestedPageUrl = "#";
                  }

                  return (
                    <div
                      key={nestedPageId}
                      className="w-full bg-white rounded-[14px] border border-[#e4e6ef] shadow-[0_10px_24px_rgba(15,23,42,0.06)] p-[10px] flex items-center gap-[10px] relative"
                    >
                      {/* Tag */}
                      {subjectInfo.tag && (
                        <div className="absolute top-[6px] right-[9px] px-[7px] py-[1px] rounded-full text-[10px] font-semibold bg-[rgba(106,92,255,0.06)] text-[#6a5cff]">
                          {subjectInfo.tag}
                        </div>
                      )}

                      {/* Left: Count Circle */}
                      <div className="flex flex-col items-center min-w-[80px]">
                        <div
                          className={`w-[50px] h-[50px] rounded-full bg-[radial-gradient(circle_at_30%_0,rgba(106,92,255,0.16),rgba(106,92,255,0.04))] border border-dashed border-[rgba(148,163,184,0.45)] flex items-center justify-center text-lg font-bold ${subjectInfo.color}`}
                        >
                          {questionCount.toLocaleString()}
                        </div>
                        <div className="mt-[3px] text-[9px] text-[#a0a5bf] uppercase tracking-[0.08em] text-center">
                          Questions Available
                        </div>
                      </div>

                      {/* Dashed Line */}
                      <div className="w-[1px] h-[56px] border-r border-dashed border-[#e4e6ef] flex-shrink-0"></div>

                      {/* Right: Content */}
                      <div className="flex-1 flex flex-col gap-1 pr-[26px] min-w-0">
                        <div className="text-sm font-bold text-[#202437] whitespace-nowrap overflow-hidden text-ellipsis">
                          {subjectInfo.title}
                        </div>
                        {subjectInfo.subtitle && (
                          <div className="text-[11px] text-[#7a819c] whitespace-nowrap overflow-hidden text-ellipsis">
                            {subjectInfo.subtitle}
                          </div>
                        )}

                        {/* Mode Buttons */}
                        <div className="flex flex-col items-center gap-1 mt-[2px]">
                          <Link
                            href={`${nestedPageUrl}?mode=review`}
                            onClick={closeModal}
                            className="w-[78%] px-[10px] py-[6px] rounded-full inline-flex justify-center items-center text-[11.5px] font-medium bg-[#f3f4ff] text-[#202437] cursor-pointer leading-[1.1] hover:bg-[#e7e5ff] transition-colors no-underline"
                          >
                            <span className="w-[7px] h-[7px] rounded-full bg-[#16a34a] mr-[6px] flex-shrink-0"></span>
                            Review Mode
                          </Link>
                          <Link
                            href={`${nestedPageUrl}?mode=exam`}
                            onClick={closeModal}
                            className="w-[78%] px-[10px] py-[6px] rounded-full inline-flex justify-center items-center text-[11.5px] font-medium bg-[#f3f4ff] text-[#202437] cursor-pointer leading-[1.1] hover:bg-[#e7e5ff] transition-colors no-underline"
                          >
                            <span className="w-[7px] h-[7px] rounded-full bg-[#2563eb] mr-[6px] flex-shrink-0"></span>
                            Exam Mode
                          </Link>
                          <Link
                            href={nestedPageUrl}
                            onClick={closeModal}
                            className="w-[78%] px-[10px] py-[6px] rounded-full inline-flex justify-center items-center text-[11.5px] font-medium bg-[rgba(106,92,255,0.10)] text-[#6a5cff] cursor-pointer leading-[1.1] hover:bg-[rgba(106,92,255,0.15)] transition-colors no-underline"
                          >
                            <span className="w-[7px] h-[7px] rounded-full bg-[#6a5cff] mr-[6px] flex-shrink-0"></span>
                            View All Sets
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 text-center py-12">
                  <p className="text-[#7a819c]">
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
