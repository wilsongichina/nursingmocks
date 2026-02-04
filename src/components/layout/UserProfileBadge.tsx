"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function UserProfileBadge() {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const router = useRouter();
  const { currentUser, logout } = useAuth();
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

  if (!currentUser) {
    return null;
  }

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/dashboard");
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  return (
    <div className="relative" ref={userDropdownRef}>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUsernameClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.displayName
                ? currentUser.displayName.charAt(0).toUpperCase()
                : currentUser.email?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">
              {currentUser.displayName || currentUser.email}
            </span>
          </button>
          <button
            onClick={handleChevronClick}
            className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            aria-label="Toggle user menu"
          >
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
        </div>

        {isUserDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.displayName || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser.email}
              </p>
            </div>
            <button
              onClick={() => {
                router.push("/dashboard");
                setIsUserDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
    </div>
  );
}
