"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  className?: string;
  showLogo?: boolean;
}

export default function Header({
  className = "",
  showLogo = true,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const companyItems = [
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Prices", href: "/prices" },
    { label: "FAQ", href: "/faqs" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const isCompanyActive = () => {
    return companyItems.some((item) => isActive(item.href));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyDropdownOpen(false);
      }
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
    <header
      className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {showLogo ? (
            <div className="flex items-center">
              <Link href="/" aria-label="TEAS Gurus Home">
                <Image
                  src="/teas-gurus-logo.png"
                  alt="TEAS Gurus Logo"
                  width={150}
                  height={40}
                  className="h-10 w-auto "
                  priority
                />
              </Link>
            </div>
          ) : (
            <div className="w-[150px]"></div>
          )}
          <nav
            className={`hidden md:flex space-x-8 ${
              !showLogo ? "flex-1 justify-center" : ""
            }`}
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Home */}
            <Link
              href="/"
              className="relative font-bold transition-all duration-300 group text-gray-700"
            >
              Home
              {/* Active and hover underline */}
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                  isActive("/")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></div>
            </Link>

            {/* TEAS */}
            <Link
              href="/teas"
              className="relative font-bold transition-all duration-300 group text-gray-700"
            >
              TEAS
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                  isActive("/teas")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></div>
            </Link>

            {/* Hesi A2 */}
            <Link
              href="/hesi-a2"
              className="relative font-bold transition-all duration-300 group text-gray-700"
            >
              Hesi A2
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                  isActive("/hesi-a2")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></div>
            </Link>

            {/* Nursing */}
            <Link
              href="/nursing"
              className="relative font-bold transition-all duration-300 group text-gray-700"
            >
              Nursing
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                  isActive("/nursing")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></div>
            </Link>

            {/* Company Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsCompanyDropdownOpen(true)}
              onMouseLeave={() => setIsCompanyDropdownOpen(false)}
            >
              <button
                className={`relative font-bold transition-all duration-300 group text-gray-700 flex items-center ${
                  isCompanyActive() ? "text-blue-600" : ""
                }`}
              >
                Company
                <svg
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isCompanyDropdownOpen ? "rotate-180" : ""
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
                {/* Active and hover underline */}
                <div
                  className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                    isCompanyActive()
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></div>
              </button>

              {/* Dropdown Menu */}
              {isCompanyDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {companyItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`block px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Blog */}
            <Link
              href="/blog"
              className="relative font-bold transition-all duration-300 group text-gray-700"
            >
              Blog
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                  isActive("/blog")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></div>
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className="relative font-bold transition-all duration-300 group text-gray-700"
            >
              Contact
              <div
                className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                  isActive("/contact")
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></div>
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentUser.displayName
                      ? currentUser.displayName.charAt(0).toUpperCase()
                      : currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <span>{currentUser.displayName || currentUser.email}</span>
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
            ) : (
              <>
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
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Home
              </Link>

              {/* TEAS */}
              <Link
                href="/teas"
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/teas")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                TEAS
              </Link>

              {/* Hesi A2 */}
              <Link
                href="/hesi-a2"
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/hesi-a2")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Hesi A2
              </Link>

              {/* Nursing */}
              <Link
                href="/nursing"
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/nursing")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Nursing
              </Link>

              {/* Company Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setIsCompanyDropdownOpen(!isCompanyDropdownOpen)
                  }
                  className={`w-full text-left px-3 py-2 font-medium transition-colors flex items-center justify-between ${
                    isCompanyActive()
                      ? "text-blue-600 bg-blue-50 rounded-lg"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <span>Company</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isCompanyDropdownOpen ? "rotate-180" : ""
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
                {isCompanyDropdownOpen && (
                  <div className="pl-4 mt-1 space-y-1">
                    {companyItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsCompanyDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                            active
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Blog */}
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/blog")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Blog
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/contact")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Contact
              </Link>

              {currentUser ? (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-6 py-3 font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-6 py-3 font-medium text-gray-700 hover:text-blue-600 border border-gray-300 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full gradient-button text-white px-6 py-3 rounded-lg font-bold text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
