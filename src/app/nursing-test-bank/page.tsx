"use client";

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function NursingTestBankPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-gray-50 to-gray-50">
        {/* Hero Section */}
        <section className="py-14 pb-10">
          <div className="w-full px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 mb-4">
                  <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-indigo-100 text-[0.7rem]">
                    ★
                  </span>
                  RN And LPN Nursing Test Banks
                </div>
                <h1 className="text-[2.2rem] lg:text-[2.7rem] leading-[1.1] tracking-[-0.04em] mb-3 text-slate-900 font-bold">
                  Nursing Test Banks For <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">RN</span> And <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">LPN</span> — ATI And HESI
                </h1>
                <p className="text-[0.98rem] text-gray-600 max-w-[32rem] mb-6 font-normal">
                  Build exam confidence with structured RN and LPN nursing test
                  banks for ATI and HESI. Fundamentals to Critical Care, all in
                  one place, without chasing random PDFs or outdated question
                  sets.
                </p>

                <div className="flex flex-wrap gap-3 mb-6 text-xs">
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <div className="w-[7px] h-[7px] rounded-full bg-green-500"></div>
                    RN And LPN Test Banks For ATI And HESI
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <span>📚</span>
                    Fundamentals To Critical Care In One Dashboard
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <span>📊</span>
                    Subject Level Analytics Across All Banks
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                  <Link
                    href="/register"
                    className="rounded-full px-6 py-3 text-sm border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/50 flex items-center gap-2 hover:brightness-105 transition-all"
                  >
                    <span className="text-[1.05rem] translate-y-[1px]">➤</span>
                    Explore RN Nursing Test Bank
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full px-5 py-3 text-sm border border-slate-300 bg-white/95 text-gray-900 font-medium flex items-center gap-2 hover:bg-white transition-all"
                  >
                    <span className="text-base opacity-75">⟲</span>
                    View LPN Nursing Test Bank
                  </Link>
                </div>

                <p className="text-xs text-gray-400 font-normal">
                  <strong className="text-gray-600 font-semibold">One login.</strong> Switch between RN ATI, RN HESI, LPN ATI, and LPN HESI test banks without losing progress.
                </p>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-indigo-50 via-white to-gray-50 rounded-[2rem] p-6 shadow-lg border border-slate-300 overflow-hidden">
                  <div className="absolute -top-10 -right-6 w-[140px] h-[140px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-15 blur-[0.5px]"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Nursing Test Bank Snapshot
                      </div>
                      <div className="rounded-full px-2 py-1 bg-green-50 border border-green-300 text-xs text-green-800">
                        Study Streak · 7 Days
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          RN Test Bank
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          82%
                        </div>
                        <div className="text-xs text-gray-600">
                          Strong In Fundamentals And Med Surg
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          LPN Test Bank
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          78%
                        </div>
                        <div className="text-xs text-gray-600">
                          Pharm And Mental Health Improving
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          Questions Answered
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          540
                        </div>
                        <div className="text-xs text-gray-600">
                          Last 7 Days Across All Banks
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          Strongest Subject
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          Maternal–Newborn
                        </div>
                        <div className="text-xs text-gray-600">
                          Above Target For Both RN And LPN
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-3">
                      <div>Overall Test Bank Mastery</div>
                      <div className="flex-1 h-1 rounded-full bg-gray-300 overflow-hidden ml-3">
                        <div className="h-full w-[63%] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RN & LPN Test Bank Hubs Section */}
        <section className="py-9 pb-6">
          <div className="w-full px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Choose Your Nursing Test Bank
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                Separate RN And LPN Test Banks For ATI And HESI
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                NursingMocks gives you dedicated RN and LPN test banks for ATI
                and HESI. Each pathway has the same core subjects, but the
                difficulty, wording, and mix of questions match the level you
                are actually studying for.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RN Test Bank Card */}
              <article className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-lg overflow-hidden">
                <div className="absolute -top-9 -right-6 w-[110px] h-[110px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-14 blur-[0.5px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Nursing Test Bank · RN
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                      ATI RN & HESI RN
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    RN Nursing Test Bank Hub
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use one RN test bank hub to move between ATI RN and HESI RN
                    style questions without losing your stats. Every question is
                    tagged by subject so you can see exactly where your RN
                    knowledge stands.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📝</span>
                      ATI RN & HESI RN Question Styles
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📚</span>
                      From Fundamentals To Critical Care
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>🎯</span>
                      Subject Level Mastery Tracking
                    </div>
                  </div>

                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    RN Subjects Covered
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      RN Fundamentals, RN Pharmacology, RN Health Assessment, RN
                      Pathophysiology, RN Nutrition.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      RN Medical-Surgical Nursing, RN Maternal-Newborn Nursing,
                      RN Pediatric Nursing.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      RN Mental Health Nursing, RN Community Health Nursing, RN
                      Gerontology, RN Critical Care Nursing.
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        Best For RN Programs Using ATI Or HESI
                      </strong>
                      <span>
                        Switch between ATI RN and HESI RN banks while keeping a
                        single RN analytics view.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/45 flex items-center gap-2"
                      >
                        <span>Open RN Nursing Test Bank</span>
                        <span>➜</span>
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border border-slate-300 bg-white text-gray-900 flex items-center gap-2"
                      >
                        <span className="opacity-70">📁</span>
                        View RN Subjects And Sets
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* LPN Test Bank Card */}
              <article className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-lg overflow-hidden">
                <div className="absolute -top-9 -right-6 w-[110px] h-[110px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-14 blur-[0.5px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Nursing Test Bank · LPN
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                      ATI LPN & HESI LPN
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    LPN Nursing Test Bank Hub
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Prepare for LPN exams with ATI LPN and HESI LPN test banks
                    that cover the same core subjects as RN, tuned to the way
                    LPN programs frame content and evaluate safe practice.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📊</span>
                      LPN Subject Performance Reports
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>⏳</span>
                      Short Sets And Full Length Blocks
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>🔁</span>
                      Weak Area Question Loops
                    </div>
                  </div>

                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    LPN Subjects Covered
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      LPN Fundamentals, LPN Pharmacology, LPN Health Assessment,
                      LPN Pathophysiology, LPN Nutrition.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      LPN Medical-Surgical Nursing, LPN Maternal-Newborn
                      Nursing, LPN Pediatric Nursing.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      LPN Mental Health Nursing, LPN Community Health Nursing,
                      LPN Gerontology, LPN Critical Care Nursing.
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        Best For LPN Programs Using ATI Or HESI
                      </strong>
                      <span>
                        Keep ATI LPN and HESI LPN practice together so you
                        always know how your overall LPN prep looks.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/45 flex items-center gap-2"
                      >
                        <span>Open LPN Nursing Test Bank</span>
                        <span>➜</span>
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border border-slate-300 bg-white text-gray-900 flex items-center gap-2"
                      >
                        <span className="opacity-70">👁</span>
                        View LPN Subjects And Sets
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="py-9 pb-6">
          <div className="w-full px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                What You Get With NursingMocks
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                One Test Bank Platform For RN And LPN
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                Instead of juggling different logins, you can move between RN
                ATI, RN HESI, LPN ATI, and LPN HESI test banks in one dashboard.
                Same layout, same analytics, different pathways.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🧪
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Blueprint Aware Question Banks
                </h3>
                <p className="text-xs text-gray-600">
                  Questions are grouped by subject and exam style, so when you
                  open RN Pharmacology for ATI or LPN Med-Surg for HESI, you are
                  practising in a way that still feels connected to real school
                  assessments.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🎯
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Subject Level Feedback
                </h3>
                <p className="text-xs text-gray-600">
                  Track accuracy across RN Fundamentals, RN Critical Care, LPN
                  Pediatrics, and more. The goal is not just to pass one exam,
                  but to actually see which subjects are quietly carrying you
                  and which need another round.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  📈
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  RN And LPN Analytics In One View
                </h3>
                <p className="text-xs text-gray-600">
                  If you are bridging from LPN to RN or supporting classmates at
                  different levels, you can keep RN and LPN analytics separate,
                  but visible from the same homepage, instead of buried in
                  different tools.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🧭
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Guided Review Paths
                </h3>
                <p className="text-xs text-gray-600">
                  Use guided paths when you want a simple "start here" button
                  for each subject, or build your own sequence by stacking the
                  exact RN or LPN topics that feel rusty this week.
                </p>
              </article>
            </div>

            {/* RN vs LPN Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                  RN Nursing Test Bank
                </div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  RN Level Practice For ATI And HESI
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  The RN test bank is built for students who are expected to
                  think at a registered nurse scope. Questions lean into complex
                  scenarios, delegation, and critical care elements while still
                  covering fundamentals, pharmacology, and community health.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Use ATI RN and HESI RN filters without changing platforms or
                    accounts.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Drill RN subjects like Med-Surg, Critical Care,
                    Maternal-Newborn, and Pediatrics with targeted sets.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    See RN specific analytics so you know whether your advanced
                    content is actually improving.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Revisit missed RN questions as a separate pool to check if
                    your second attempt really reflects new learning.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                  LPN Nursing Test Bank
                </div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  LPN Level Practice That Feels Manageable
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  The LPN test bank matches the way practical nursing programs
                  test knowledge: solid fundamentals, safe decision making, and
                  clear questions that still expect you to connect
                  pathophysiology, assessment, and basic pharm.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Move between ATI LPN and HESI LPN style questions with the
                    same subject layout.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Focus on LPN versions of Medical-Surgical, Maternal-Newborn,
                    Pediatrics, Mental Health, and more.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Use short sets when you are studying between shifts and
                    longer blocks when you want a full mock exam feel.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Build a quiet habit of checking rationales, not just answer
                    letters, so test days feel less like a surprise.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-300 bg-gray-50 text-xs text-gray-700">
              <strong className="text-gray-900 font-semibold">
                One Account, Four Core Nursing Test Banks.
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  RN ATI and RN HESI test banks share the same subject map, so
                  it is easy to see how different exam styles test the same
                  concepts.
                </div>
                <div>
                  LPN ATI and LPN HESI banks mirror the RN subject list, tuned
                  to LPN level expectations and wording.
                </div>
                <div>
                  If you change programs or transition from LPN to RN, your
                  practice history and subject familiarity come with you instead
                  of starting over from zero.
                </div>
              </div>
            </div>

            {/* Structure Map Section */}
            <div className="mt-7 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div className="max-w-[60%]">
                  <h2 className="text-lg font-semibold mb-1 text-slate-900">
                    RN And LPN Nursing Test Bank Structure
                  </h2>
                  <p className="text-sm text-gray-600">
                    Here is how the NursingMocks test bank is organised behind
                    the scenes so you can map it into your own menus and pages.
                    Each level clearly separates RN from LPN and ATI from HESI,
                    with a brief description for every subject.
                  </p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  RN & LPN Subject Map
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                {/* RN Column */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold mb-3 text-gray-900">
                    RN Nursing Test Bank
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <div className="font-semibold text-gray-900 mb-2">
                        ATI RN Nursing Test Bank
                      </div>
                      <ul className="space-y-3 pl-4">
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Fundamentals
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Core nursing concepts, safety, hygiene, mobility, and
                            basic skills that show up in almost every RN course.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Pharmacology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Drug classes, side effects, interactions, and safe
                            medication administration at the RN scope.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Health Assessment
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Head to toe assessment, vital signs, focused
                            assessments, and recognising normal versus abnormal
                            findings.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Pathophysiology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            How disease changes body systems, and how those
                            changes guide RN priorities and interventions.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Nutrition
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Basic nutrition, therapeutic diets, enteral feeding,
                            and supporting patients with special dietary needs.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Medical-Surgical Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Adult acute and chronic conditions, prioritising care,
                            and evidence based med surg interventions.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Maternal-Newborn Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Pregnancy, labor, postpartum care, and newborn
                            assessment from an RN perspective.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Pediatric Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Growth and development, common childhood illnesses,
                            and age specific RN nursing care.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Mental Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Psychiatric disorders, therapeutic communication,
                            crisis care, and maintaining safety for patients and
                            staff.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Community Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Public health, epidemiology basics, and caring for
                            individuals, families, and communities outside the
                            hospital.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Gerontology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Normal aging, chronic conditions in older adults, and
                            protecting safety and independence.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Critical Care Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            High acuity patients, hemodynamic monitoring,
                            ventilators, and rapid RN decision making in
                            intensive settings.
                          </div>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <div className="font-semibold text-gray-900 mb-2">
                        HESI RN Nursing Test Bank
                      </div>
                      <ul className="space-y-3 pl-4">
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Fundamentals
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Safety, infection control, basic procedures, and HESI
                            style questions on foundational RN care.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Pharmacology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Medication calculations, high alert drugs, adverse
                            reactions, and teaching points for patients.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Health Assessment
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Assessment findings that matter for HESI exams,
                            including red flag symptoms and focused assessments.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Pathophysiology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Disease processes and how they connect to signs,
                            symptoms, and lab changes on HESI style stems.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Nutrition
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Nutrition questions that link diagnoses, lab values,
                            and appropriate diet choices for RN patients.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Medical-Surgical Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Complex med surg scenarios involving priorities,
                            delegation, and safety across body systems.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Maternal-Newborn Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            High risk pregnancy, fetal monitoring strips,
                            postpartum complications, and newborn adaptations.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Pediatric Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Childhood illnesses, vaccine schedules, and family
                            centred care questions at the RN level.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Mental Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Mood, thought, and behaviour disorders with HESI
                            style distractors that test therapeutic responses.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Community Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Screening, prevention, outbreak response, and
                            teaching in school, clinic, and home settings.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Gerontology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Polypharmacy, fall risk, cognition changes, and
                            chronic condition management for older adults.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            RN Critical Care Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            ICU style questions on shock, respiratory failure,
                            arrhythmias, and rapid intervention choices.
                          </div>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* LPN Column */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold mb-3 text-gray-900">
                    LPN Nursing Test Bank
                  </div>
                  <ul className="space-y-4">
                    <li>
                      <div className="font-semibold text-gray-900 mb-2">
                        ATI LPN Nursing Test Bank
                      </div>
                      <ul className="space-y-3 pl-4">
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Fundamentals
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Basic nursing care, vital signs, hygiene, and safety
                            tasks that fit the LPN role on the care team.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Pharmacology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Medication names, common side effects, dosage
                            awareness, and safe administration within LPN
                            practice.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Health Assessment
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Focused assessments, monitoring, and reporting
                            changes to the RN or provider promptly.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Pathophysiology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Simplified disease processes that help explain why
                            certain LPN interventions are needed.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Nutrition
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Basic nutrition, intake and output, and helping
                            patients follow diet plans ordered by the provider.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Medical-Surgical Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Common adult conditions and safe bedside care,
                            including monitoring and reporting priorities.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Maternal-Newborn Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Supporting pregnancy, postpartum, and newborn care
                            tasks that fall within LPN responsibilities.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Pediatric Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Basic paediatric care, growth expectations, and
                            recognising when to notify the RN or provider.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Mental Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Everyday mental health support, therapeutic
                            communication, and maintaining safety in LPN
                            settings.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Community Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Caring for patients in clinics, long term care, and
                            home health with a focus on practical teaching.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Gerontology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Daily care for older adults, recognising subtle
                            changes, and preventing complications.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Critical Care Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Stable tasks and monitoring in higher acuity areas
                            while collaborating closely with RNs.
                          </div>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <div className="font-semibold text-gray-900 mb-2">
                        HESI LPN Nursing Test Bank
                      </div>
                      <ul className="space-y-3 pl-4">
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Fundamentals
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Safety, infection control, and basic procedures
                            tested in HESI style questions for practical
                            nursing.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Pharmacology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Common medications, expected effects, and when an LPN
                            should hold or question an order.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Health Assessment
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Recognising early changes, documenting clearly, and
                            reporting findings in HESI type scenarios.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Pathophysiology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Simpler HESI stems that link disease, signs, and
                            appropriate LPN level responses.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Nutrition
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Questions about diet teaching, intake, and monitoring
                            nutrition related lab trends.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Medical-Surgical Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Bedside LPN care for common medical and surgical
                            patients, with a focus on safety.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Maternal-Newborn Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Assisting with routine maternal and newborn care and
                            spotting early warning signs.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Pediatric Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            HESI style paediatric questions that test basic care,
                            comfort, and family teaching.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Mental Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Everyday mental health scenarios, boundaries, and
                            safe LPN interventions.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Community Health Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Practical nursing roles in clinics, schools, and
                            long term care on HESI exams.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Gerontology
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Long term care scenarios that emphasise skin,
                            mobility, cognition, and comfort.
                          </div>
                        </li>
                        <li>
                          <div className="font-semibold text-sm text-gray-900">
                            LPN Critical Care Nursing
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Questions that show how LPNs safely support higher
                            acuity patients under RN supervision.
                          </div>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-14">
          <div className="w-full px-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-300">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 items-start md:items-center">
                <div className="max-w-[60%]">
                  <h2 className="text-lg font-semibold mb-1 text-slate-900">
                    Compare RN And LPN Nursing Test Banks
                  </h2>
                  <p className="text-sm text-gray-600">
                    Whether you are an LPN student, an RN student, or bridging
                    between the two, this comparison shows how the NursingMocks
                    test banks stay aligned while respecting each pathway.
                  </p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-300">
                  RN Vs LPN Test Banks
                </div>
              </div>

              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      RN Nursing Test Bank
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      LPN Nursing Test Bank
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white even:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900 w-[40%]">
                      ATI And HESI Support
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ ATI RN And HESI RN
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ ATI LPN And HESI LPN
                    </td>
                  </tr>
                  <tr className="bg-white even:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Subjects Covered
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ All 12 RN Subjects
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ All 12 LPN Subjects
                    </td>
                  </tr>
                  <tr className="bg-white even:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Difficulty Level
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ RN Scope And Complexity
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ LPN Scope With Safe Practice Focus
                    </td>
                  </tr>
                  <tr className="bg-white even:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Analytics View
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ RN Specific Dashboards
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ LPN Specific Dashboards
                    </td>
                  </tr>
                  <tr className="bg-white even:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Short And Long Practice Sets
                    </td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                  </tr>
                  <tr className="bg-white even:bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Bridge Friendly Structure
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Helps When Moving From LPN To RN
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Mirrors RN Topics For Future Transition
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs text-gray-600 mt-3">
                RN and LPN test banks share the same subject map, which helps
                you line everything up cleanly in your menus while still keeping
                each pathway separate for grading, analytics, and study plans.
              </p>
            </div>
          </div>
        </section>

        {/* Article Section */}
        <section className="py-14">
          <div className="w-full px-6">
            <article className="p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Real-World Nursing Test Bank Strategy
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    How To Use RN And LPN Test Banks Without Burning Out
                  </h3>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                  RN & LPN Study Guide
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.95fr] gap-6 text-sm text-gray-700">
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="mb-3">
                      Most nursing students do not sit down with a plan that
                      says, "Today I will conquer all of Med-Surg." Real life
                      looks more like spare pockets of time between shifts, labs
                      that run long, and group chat messages about which unit
                      test is next. In the middle of that noise, it is easy to
                      fall into random scrolling instead of focused,
                      subject-based practice.
                    </p>
                    <p className="mb-3">
                      NursingMocks is built to turn those small gaps into useful
                      RN or LPN test bank sessions. You can open RN
                      Pharmacology, LPN Fundamentals, or any other subject and
                      know that every question you answer feeds into the right
                      analytics bucket. Instead of a messy pile of screenshots
                      and printed quizzes, you get a running record of what you
                      have actually practised.
                    </p>
                    <p>
                      A typical week might include ten RN Med-Surg questions
                      before class, a short block of LPN Nutrition questions
                      after a lab, and a weekend review session that mixes in
                      older subjects you have not touched in a while. None of
                      those sessions needs to be perfect; they just need to be
                      honest. When you miss a question, you slow down, read the
                      rationale, and let the explanation do some of the heavy
                      lifting.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="mb-3">
                      Over time, patterns begin to show. Maybe your RN
                      Pathophysiology accuracy climbs whenever you spend time in
                      RN Health Assessment, or your LPN Mental Health scores
                      jump after a week of consistent fundamentals practice. The
                      dashboard acts like a quiet observer that notices those
                      shifts even on weeks when you feel tired and unsure.
                    </p>
                    <span className="inline-block mt-3 px-2 py-1 rounded-lg bg-green-50 text-green-800 text-xs font-medium">
                      Short Sessions, Long Programs
                    </span>
                    <p className="mt-3 mb-3">
                      Nursing is a long program, and the goal is not to sprint
                      through a giant question bank in one weekend. Ten to
                      fifteen focused questions with honest review will often
                      help more than fifty rushed guesses. Because your RN and
                      LPN history stays organised, you can return to older
                      questions months later and see whether your thinking has
                      changed.
                    </p>
                    <p>
                      By the time big assessments or exit exams arrive, your
                      test bank history tells a clear story: which subjects you
                      have touched, which you have avoided, and where your
                      strengths quietly live. You are not relying on a single
                      lucky exam day to prove your knowledge; you have months of
                      small, steady practice behind you.
                    </p>
                  </div>
                </div>

                <aside className="relative rounded-xl bg-gradient-to-br from-indigo-50 via-white to-gray-50 p-4 border border-indigo-200 shadow-lg overflow-hidden">
                  <div className="absolute bottom-8 -right-9 w-[120px] h-[120px] rounded-full bg-gradient-radial from-indigo-200 via-purple-600 to-indigo-600 opacity-24 blur-[0.5px]"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold mb-2 text-gray-900">
                      A Simple Routine For RN And LPN Test Banks
                    </h4>
                    <p className="text-xs text-gray-700 mb-3">
                      You do not need a complicated schedule app to use RN and
                      LPN test banks well. Many students stick to a three step
                      rhythm that can survive long shifts and unpredictable
                      weeks.
                    </p>
                    <ul className="text-xs mb-3 space-y-3">
                      <li className="pb-3 border-b border-dashed border-slate-300">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 1 · Pick One Subject Per Week
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Choose a single RN or LPN subject to feature
                        </strong>
                        For example, RN Pharmacology or LPN Med-Surg. Make that
                        subject the one you touch first whenever you have ten
                        minutes, even if you still dip into other areas.
                      </li>
                      <li className="pb-3 border-b border-dashed border-slate-300">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 2 · Mix ATI And HESI Styles
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Alternate between ATI and HESI banks
                        </strong>
                        If your program uses ATI now but will use HESI later, or
                        vice versa, switch styles inside the same subject so
                        question wording never feels completely new.
                      </li>
                      <li>
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 3 · Review The Dashboard Once A Week
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Use data to choose the next subject
                        </strong>
                        Look for the lowest accuracy bar in your RN or LPN view.
                        That subject becomes next week's priority. This keeps the
                        plan simple while slowly closing gaps.
                      </li>
                    </ul>
                    <div className="text-xs text-gray-600 mt-3">
                      Repeating this pattern across a semester builds a steady
                      familiarity with your RN or LPN curriculum. Instead of
                      guessing what to study next, your own test bank history
                      quietly answers that question for you.
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-14">
          <div className="w-full px-6">
            <div className="text-center mb-10">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Nursing Test Bank Questions
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-slate-900">
                RN And LPN Nursing Test Bank FAQ
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                These short answers cover how the NursingMocks test banks work
                for RN and LPN students using ATI and HESI. You can grow this
                into a full knowledge base page later.
              </p>
            </div>

            <div className="max-w-[800px] mx-auto">
              <div className="space-y-3">
                {/* FAQ Item 1 */}
                <div
                  className={`rounded-2xl border border-gray-300 bg-white overflow-hidden transition-all ${
                    openFaqIndex === 0 ? "shadow-md" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleFaqToggle(0)}
                    className="w-full border-none bg-transparent p-3 flex justify-between items-center text-left cursor-pointer text-sm text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-600">
                        Q
                      </div>
                      <span>
                        Is This An Official ATI Or HESI Nursing Test Bank?
                      </span>
                    </div>
                    <span
                      className={`text-base text-gray-400 transition-transform ${
                        openFaqIndex === 0
                          ? "rotate-90 text-indigo-600"
                          : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      openFaqIndex === 0
                        ? "max-h-[220px] pb-3"
                        : "max-h-0 pb-0"
                    }`}
                  >
                    <div className="px-3 text-sm text-gray-600">
                      No. NursingMocks is an independent practice platform. The
                      RN and LPN test banks are designed to feel similar in style
                      and difficulty to ATI and HESI assessments, but they do
                      not copy or reproduce official questions.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div
                  className={`rounded-2xl border border-gray-300 bg-white overflow-hidden transition-all ${
                    openFaqIndex === 1 ? "shadow-md" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleFaqToggle(1)}
                    className="w-full border-none bg-transparent p-3 flex justify-between items-center text-left cursor-pointer text-sm text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-600">
                        Q
                      </div>
                      <span>How Do I Switch Between RN And LPN Test Banks?</span>
                    </div>
                    <span
                      className={`text-base text-gray-400 transition-transform ${
                        openFaqIndex === 1
                          ? "rotate-90 text-indigo-600"
                          : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      openFaqIndex === 1
                        ? "max-h-[220px] pb-3"
                        : "max-h-0 pb-0"
                    }`}
                  >
                    <div className="px-3 text-sm text-gray-600">
                      Your dashboard lets you switch between RN and LPN views
                      with a simple toggle. Within each view you can then filter
                      by ATI or HESI and choose the subject you want to
                      practise, such as RN Med-Surg or LPN Mental Health.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div
                  className={`rounded-2xl border border-gray-300 bg-white overflow-hidden transition-all ${
                    openFaqIndex === 2 ? "shadow-md" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleFaqToggle(2)}
                    className="w-full border-none bg-transparent p-3 flex justify-between items-center text-left cursor-pointer text-sm text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-600">
                        Q
                      </div>
                      <span>
                        Can I Use The LPN Test Bank If I Am Planning To Bridge
                        To RN?
                      </span>
                    </div>
                    <span
                      className={`text-base text-gray-400 transition-transform ${
                        openFaqIndex === 2
                          ? "rotate-90 text-indigo-600"
                          : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      openFaqIndex === 2
                        ? "max-h-[220px] pb-3"
                        : "max-h-0 pb-0"
                    }`}
                  >
                    <div className="px-3 text-sm text-gray-600">
                      Yes. The LPN test bank mirrors the RN subject list, which
                      makes it easier to transition later. When you eventually
                      move into RN level practice, you will recognise the
                      subject structure even though the difficulty increases.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 4 */}
                <div
                  className={`rounded-2xl border border-gray-300 bg-white overflow-hidden transition-all ${
                    openFaqIndex === 3 ? "shadow-md" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleFaqToggle(3)}
                    className="w-full border-none bg-transparent p-3 flex justify-between items-center text-left cursor-pointer text-sm text-gray-900 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-600">
                        Q
                      </div>
                      <span>How Many Questions Should I Do Per Day?</span>
                    </div>
                    <span
                      className={`text-base text-gray-400 transition-transform ${
                        openFaqIndex === 3
                          ? "rotate-90 text-indigo-600"
                          : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      openFaqIndex === 3
                        ? "max-h-[220px] pb-3"
                        : "max-h-0 pb-0"
                    }`}
                  >
                    <div className="px-3 text-sm text-gray-600">
                      There is no single correct number. Many students aim for
                      ten to twenty focused RN or LPN questions on busier days,
                      then add longer sessions when time allows. The important
                      part is reviewing rationales and watching how your subject
                      scores move, not hitting a perfect daily question count.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
