"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfileBadge from "./UserProfileBadge";

export default function NewHeader() {
  const _pathname = usePathname();
  const router = useRouter();
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[rgba(248,250,252,0.9)] to-[rgba(248,250,252,0.7)] backdrop-blur-[24px] border-b border-[rgba(148,163,184,0.18)]">
      <div className="public-page-container">
        <div
          className="flex items-center justify-between py-3 sm:py-[0.9rem] gap-4"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="NursingMocks home">
              <Image
                src="/nursing-mocks-logo.png"
                alt="NursingMocks Logo"
                width={150}
                height={40}
                className="h-8 w-auto max-w-[168px] object-contain sm:h-9"
                priority
              />
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul
              className="flex gap-[1.7rem] items-center"
              style={{ fontSize: "0.9rem" }}
            >
              {/* Nursing Entrance Exams */}
              <li
                className="relative"
                onMouseEnter={() => setHoveredDropdown("entrance")}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 py-[0.35rem] font-medium text-[#111827] no-underline uppercase tracking-[0.08em] hover:text-[#4f46e5] transition-colors"
                  style={{ fontSize: "0.8rem", padding: "0.35rem 0" }}
                >
                  Nursing Entrance Exams{" "}
                  <span
                    className="opacity-60 translate-y-[1px]"
                    style={{ fontSize: "0.7rem" }}
                  >
                    v
                  </span>
                </Link>
                {hoveredDropdown === "entrance" && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute top-full left-0 right-0 h-[0.6rem]" />
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 min-w-[520px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] pt-[0.6rem] opacity-100 pointer-events-auto transition-all border border-[rgba(148,163,184,0.25)] translate-y-[0.2rem]"
                      style={{
                        padding: "0.75rem",
                        paddingTop: "calc(0.6rem + 0.75rem)",
                      }}
                    >
                      <div
                        className="grid grid-cols-2 gap-4"
                        style={{ padding: "0.4rem 0.4rem 0.15rem" }}
                      >
                        {/* ATI TEAS Column */}
                        <div>
                          <div
                            className="uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]"
                            style={{ fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            ATI TEAS
                          </div>
                          <ul className="list-none">
                            <li>
                              <Link
                                href="/ati-teas/reading"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Reading
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/ati-teas/math"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Math
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/ati-teas/science"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Science
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/ati-teas/english-and-language-usage"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                English and Language Usage
                              </Link>
                            </li>
                          </ul>
                        </div>

                        {/* HESI A2 Column */}
                        <div>
                          <div
                            className="uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]"
                            style={{ fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            HESI A2
                          </div>
                          <ul className="list-none">
                            <li>
                              <Link
                                href="/hesi-a2/reading-comprehension"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Reading Comprehension
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/hesi-a2/vocabulary-and-general-knowledge"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Vocabulary & General Knowledge
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/hesi-a2/grammar"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Grammar
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/hesi-a2/basic-math-skills"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Basic Math Skills
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/hesi-a2/biology"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Biology
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/hesi-a2/anatomy-and-physiology"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Anatomy & Physiology
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/hesi-a2/chemistry"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                Chemistry
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </li>

              {/* Nursing Practice Tests */}
              <li
                className="relative"
                onMouseEnter={() => setHoveredDropdown("testbank")}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-[#111827] no-underline uppercase tracking-[0.08em] hover:text-[#4f46e5] transition-colors"
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.35rem 0",
                    fontWeight: 500,
                  }}
                >
                  Nursing Practice Tests{" "}
                  <span
                    className="opacity-60 translate-y-[1px]"
                    style={{ fontSize: "0.7rem" }}
                  >
                    v
                  </span>
                </Link>
                {hoveredDropdown === "testbank" && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute top-full left-0 right-0 h-[0.6rem]" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[520px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-3 pt-[calc(0.6rem+0.75rem)] opacity-100 pointer-events-auto transition-all border border-[rgba(148,163,184,0.25)] translate-y-[0.2rem]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-[0.4rem] pb-[0.15rem]">
                          <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]">
                            RN Practice Tests
                          </div>
                          <ul className="list-none">
                            <li>
                              <Link
                                href="/nursing-test-bank/rn/ati"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                ATI RN Practice Tests
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/nursing-test-bank/rn/hesi"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                HESI RN Practice Tests
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="p-[0.4rem] pb-[0.15rem]">
                          <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]">
                            LPN Practice Tests
                          </div>
                          <ul className="list-none">
                            <li>
                              <Link
                                href="/nursing-test-bank/lpn/ati"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                ATI LPN Practice Tests
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/nursing-test-bank/lpn/hesi"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                HESI LPN Practice Tests
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </li>

              {/* Nursing Exit Exams */}
              <li
                className="relative"
                onMouseEnter={() => setHoveredDropdown("exit")}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-[#111827] no-underline uppercase tracking-[0.08em] hover:text-[#4f46e5] transition-colors"
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.35rem 0",
                    fontWeight: 500,
                  }}
                >
                  Nursing Exit Exams{" "}
                  <span
                    className="opacity-60 translate-y-[1px]"
                    style={{ fontSize: "0.7rem" }}
                  >
                    v
                  </span>
                </Link>
                {hoveredDropdown === "exit" && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute top-full left-0 right-0 h-[0.6rem]" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[520px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-3 pt-[calc(0.6rem+0.75rem)] opacity-100 pointer-events-auto transition-all border border-[rgba(148,163,184,0.25)] translate-y-[0.2rem]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-[0.4rem] pb-[0.15rem]">
                          <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]">
                            RN
                          </div>
                          <ul className="list-none">
                            <li>
                              <Link
                                href="/nursing-exit-exams/ati-comprehensive-predictor"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                ATI Comprehensive Predictor
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/nursing-exit-exams/hesi-exit-exam"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                HESI Exit Exam
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="p-[0.4rem] pb-[0.15rem]">
                          <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]">
                            LPN
                          </div>
                          <ul className="list-none">
                            <li>
                              <Link
                                href="/nursing-exit-exams/ati-lpn"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                ATI Exit Exams
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/nursing-exit-exams/hesi-lpn"
                                className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                                style={{
                                  padding: "0.28rem 0.3rem",
                                  fontSize: "0.83rem",
                                }}
                              >
                                HESI Exit Exams
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </li>

              {/* Company */}
              <li
                className="relative"
                onMouseEnter={() => setHoveredDropdown("company")}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-[#111827] no-underline uppercase tracking-[0.08em] hover:text-[#4f46e5] transition-colors"
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.35rem 0",
                    fontWeight: 500,
                  }}
                >
                  Company{" "}
                  <span
                    className="opacity-60 translate-y-[1px]"
                    style={{ fontSize: "0.7rem" }}
                  >
                    v
                  </span>
                </Link>
                {hoveredDropdown === "company" && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div className="absolute top-full left-0 right-0 h-[0.6rem]" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[260px] bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-3 pt-[calc(0.6rem+0.75rem)] opacity-100 pointer-events-auto transition-all border border-[rgba(148,163,184,0.25)] translate-y-[0.2rem]">
                      <div className="p-[0.4rem] pb-[0.15rem]">
                        <ul className="list-none">
                          <li>
                            <Link
                              href="/pricing"
                              className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                              style={{
                                padding: "0.28rem 0.3rem",
                                fontSize: "0.83rem",
                              }}
                            >
                              Pricing
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/contact"
                              className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                              style={{
                                padding: "0.28rem 0.3rem",
                                fontSize: "0.83rem",
                              }}
                            >
                              Contact Us
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/privacy-policy"
                              className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                              style={{
                                padding: "0.28rem 0.3rem",
                                fontSize: "0.83rem",
                              }}
                            >
                              Privacy Policy
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/terms-and-conditions"
                              className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                              style={{
                                padding: "0.28rem 0.3rem",
                                fontSize: "0.83rem",
                              }}
                            >
                              Terms &amp; Conditions
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/money-back-guarantee"
                              className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors"
                              style={{
                                padding: "0.28rem 0.3rem",
                                fontSize: "0.83rem",
                              }}
                            >
                              Money-Back Guarantee
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </li>
            </ul>
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-[0.7rem]">
            {currentUser ? (
              <UserProfileBadge />
            ) : (
              <Link
                href="/register"
                className="rounded-full border-none bg-gradient-to-br from-[#4f46e5] to-[#a855f7] text-[#f9fafb] no-underline shadow-[0_15px_35px_rgba(79,70,229,0.45)] hover:brightness-105 hover:-translate-y-[1px] transition-all"
                style={{
                  padding: "0.45rem 1.05rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#111827] hover:bg-[#eef2ff] hover:text-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe] transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Mobile Menu */}
          <div className="lg:hidden border-t border-[rgba(148,163,184,0.18)] bg-white fixed left-0 right-0 top-[65px] overflow-y-auto z-50" style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)' }}>
            <div className="public-page-container py-4">
            <nav className="space-y-1">
              {/* Mobile CTA / Profile Badge */}
              <div className="border-b border-[rgba(148,163,184,0.1)] pb-3 mb-3">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentUser.displayName
                          ? currentUser.displayName.charAt(0).toUpperCase()
                          : currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-xs text-[#6b7280] truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block text-[#dc2626] no-underline rounded-[0.4rem] hover:bg-[#fef2f2] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center rounded-full border-none bg-gradient-to-br from-[#4f46e5] to-[#a855f7] text-[#f9fafb] no-underline shadow-[0_15px_35px_rgba(79,70,229,0.45)] hover:brightness-105 transition-all py-2.5 px-4"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Get Started
                  </Link>
                )}
              </div>

              {/* Nursing Entrance Exams */}
              <div className="border-b border-[rgba(148,163,184,0.1)] pb-3 mb-3">
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#111827] mb-2">
                  Nursing Entrance Exams
                </div>
                <div className="space-y-1">
                  <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-1 mt-2">
                    ATI TEAS
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/ati-teas/reading"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Reading
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ati-teas/math"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Math
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ati-teas/science"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Science
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ati-teas/english-and-language-usage"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        English and Language Usage
                      </Link>
                    </li>
                  </ul>
                  <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-1 mt-3">
                    HESI A2
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/hesi-a2/reading-comprehension"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Reading Comprehension
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesi-a2/vocabulary-and-general-knowledge"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Vocabulary & General Knowledge
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesi-a2/grammar"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Grammar
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesi-a2/basic-math-skills"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Basic Math Skills
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesi-a2/biology"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Biology
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesi-a2/anatomy-and-physiology"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Anatomy & Physiology
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesi-a2/chemistry"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        Chemistry
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Nursing Practice Tests */}
              <div className="border-b border-[rgba(148,163,184,0.1)] pb-3 mb-3">
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#111827] mb-2">
                  Nursing Practice Tests
                </div>
                <div className="space-y-1">
                  <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-1 mt-2">
                    RN Practice Tests
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/nursing-test-bank/rn/ati"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        ATI RN Practice Tests
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/nursing-test-bank/rn/hesi"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        HESI RN Practice Tests
                      </Link>
                    </li>
                  </ul>
                  <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-1 mt-3">
                    LPN Practice Tests
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/nursing-test-bank/lpn/ati"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        ATI LPN Practice Tests
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/nursing-test-bank/lpn/hesi"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        HESI LPN Practice Tests
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Nursing Exit Exams */}
              <div className="border-b border-[rgba(148,163,184,0.1)] pb-3 mb-3">
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#111827] mb-2">
                  Nursing Exit Exams
                </div>
                <div className="space-y-1">
                  <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-1 mt-2">
                    RN
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/nursing-exit-exams/ati-comprehensive-predictor"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        ATI Comprehensive Predictor
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/nursing-exit-exams/hesi-exit-exam"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        HESI Exit Exam
                      </Link>
                    </li>
                  </ul>
                  <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-1 mt-3">
                    LPN
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        href="/nursing-exit-exams/ati-lpn"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        ATI Exit Exams
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/nursing-exit-exams/hesi-lpn"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                        style={{ fontSize: "0.83rem" }}
                      >
                        HESI Exit Exams
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Company */}
              <div className="border-b border-[rgba(148,163,184,0.1)] pb-3 mb-3">
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#111827] mb-2">
                  Company
                </div>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      href="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                      style={{ fontSize: "0.83rem" }}
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                      style={{ fontSize: "0.83rem" }}
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                      style={{ fontSize: "0.83rem" }}
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-and-conditions"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                      style={{ fontSize: "0.83rem" }}
                    >
                      Terms &amp; Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/money-back-guarantee"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-[#0f172a] no-underline rounded-[0.4rem] hover:bg-[#f3f4ff] hover:text-[#4338ca] transition-colors py-1.5 px-2"
                      style={{ fontSize: "0.83rem" }}
                    >
                      Money-Back Guarantee
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
