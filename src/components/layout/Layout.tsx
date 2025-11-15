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

function LayoutWithSidebar({ children }: { children: ReactNode }) {
  const { isCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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
              className="flex-shrink-0"
            >
              <Image
                src="/teas-gurus-logo.png"
                alt="TEAS Gurus Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
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

        {/* Desktop: Only show header if user is not logged in */}
        {!currentUser && (
          <div className="hidden md:block">
            <Header showLogo={false} />
          </div>
        )}
        {/* Desktop: Show profile badge if user is logged in */}
        {currentUser && (
          <div className="hidden md:block">
            <UserProfileBadge />
          </div>
        )}

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
