"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfileBadge from "./UserProfileBadge";

export default function NewHeader() {
  const _pathname = usePathname();
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const { currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[rgba(248,250,252,0.9)] to-[rgba(248,250,252,0.7)] backdrop-blur-[24px] border-b border-[rgba(148,163,184,0.18)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          className="flex items-center justify-between py-[0.9rem] gap-4"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/teas-gurus-logo.png"
                alt="TEAS Gurus Logo"
                width={150}
                height={40}
                className="h-9 w-auto object-contain"
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
                    ▾
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

              {/* Nursing Test Bank */}
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
                  Nursing Test Bank{" "}
                  <span
                    className="opacity-60 translate-y-[1px]"
                    style={{ fontSize: "0.7rem" }}
                  >
                    ▾
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
                            RN Test Banks
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
                                ATI RN Test Bank
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
                                HESI RN Test Bank
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="p-[0.4rem] pb-[0.15rem]">
                          <div className="text-[0.75rem] font-bold uppercase tracking-[0.09em] text-[#9ca3af] mb-[0.2rem]">
                            LPN Test Banks
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
                                ATI LPN Test Bank
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
                                HESI LPN Test Bank
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
                    ▾
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
                    ▾
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
                              Privacy policy
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
                              Terms &amp; conditions
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
                              Money-back guarantee
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
              className="text-[#111827] hover:text-[#4f46e5] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
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
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
