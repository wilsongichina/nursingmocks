"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Prices", href: "/prices" },
    { label: "FAQ", href: "/faqs" },
    { label: "Contact", href: "/contact" },
  ];

  const servicesItems = [
    { label: "Math", href: "/services/math" },
    { label: "Science", href: "/services/science" },
    { label: "English", href: "/services/english" },
    { label: "Reading", href: "/services/reading" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
          <nav
            className="hidden md:flex space-x-8"
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

            {/* Services Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <div className="flex items-center">
                <Link
                  href="/services"
                  className="relative font-bold transition-all duration-300 text-gray-700 flex items-center hover:text-blue-600"
                >
                  Services
                  {/* Active and hover underline */}
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
                </Link>
                <button
                  className="ml-1 p-1 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  aria-label="Toggle services dropdown"
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
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

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
                  isServicesOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="py-2">
                  {servicesItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Other Navigation Items */}
            {navItems.slice(1).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative font-bold transition-all duration-300 group text-gray-700"
                >
                  {item.label}
                  {/* Active and hover underline */}
                  <div
                    className={`absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700 transform transition-transform duration-300 ${
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></div>
                </Link>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/contact"
              className="gradient-button text-white px-6 py-2 rounded-lg font-bold"
            >
              Get a Free Quote
            </Link>
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
                className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                  isActive("/")
                    ? "text-blue-600 bg-blue-50 rounded-lg"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Home
              </Link>

              {/* Mobile Services Dropdown */}
              <div>
                <div className="flex items-center justify-between">
                  <Link
                    href="/services"
                    className="flex-1 text-left px-3 py-2 font-medium text-gray-700 hover:text-blue-600"
                  >
                    Services
                  </Link>
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className="px-3 py-2 text-gray-700 hover:text-blue-600"
                    aria-label="Toggle services dropdown"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isServicesOpen ? "rotate-180" : ""
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
                {isServicesOpen && (
                  <div className="pl-4 space-y-1">
                    {servicesItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Navigation Items */}
              {navItems.slice(1).map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                      active
                        ? "text-blue-600 bg-blue-50 rounded-lg"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200 mt-4">
                <Link
                  href="/contact"
                  className="w-full gradient-button text-white px-6 py-3 rounded-lg font-bold"
                >
                  Get a Free Quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
