"use client";

import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useState } from "react";

export default function NursingExitExamPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
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
                  Trusted Nursing Exit Exam Prep
                </div>
                <h1 className="text-[2.2rem] lg:text-[2.7rem] leading-[1.1] tracking-[-0.04em] mb-3 text-slate-900 font-bold">
                  Nursing Exit Exams For{" "}
                  <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ATI Comprehensive Predictor
                  </span>{" "}
                  And{" "}
                  <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    HESI Exit Exam
                  </span>
                </h1>
                <p className="text-[0.98rem] text-gray-600 max-w-[32rem] mb-6 font-normal">
                  When your program is watching your ATI Comprehensive Predictor
                  and HESI Exit scores, you need practice that feels serious but
                  still fits around clinicals, shifts, and everything else on
                  your plate.
                </p>

                <div className="flex flex-wrap gap-3 mb-6 text-xs">
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <div className="w-[7px] h-[7px] rounded-full bg-green-500"></div>
                    Built Around ATI And HESI Exit Blueprints
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <span>⏱</span>
                    Timed Comprehensive And Review Sessions
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <span>📊</span>
                    NCLEX Style Analytics For Every Attempt
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                  <Link
                    href="/register"
                    className="rounded-full px-6 py-3 text-sm border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/50 flex items-center gap-2 hover:brightness-105 transition-all"
                  >
                    <span className="text-[1.05rem] translate-y-[1px]">➤</span>
                    Start ATI Comprehensive Predictor Practice
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full px-5 py-3 text-sm border border-slate-300 bg-white/95 text-gray-900 font-medium flex items-center gap-2 hover:bg-white transition-all"
                  >
                    <span className="text-base opacity-75">⟲</span>
                    Explore HESI Exit Exam Sets
                  </Link>
                </div>

                <p className="text-xs text-gray-400 font-normal">
                  <strong className="text-gray-600 font-semibold">One exit exam hub.</strong>{" "}
                  Track ATI Comprehensive Predictor and HESI Exit in one place
                  instead of guessing from scattered quizzes.
                </p>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-indigo-50 via-white to-gray-50 rounded-[2rem] p-6 shadow-lg border border-slate-300 overflow-hidden">
                  <div className="absolute -top-10 -right-6 w-[140px] h-[140px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-15 blur-[0.5px]"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Exit Exam Snapshot
                      </div>
                      <div className="rounded-full px-2 py-1 bg-green-50 border border-green-300 text-xs text-green-800">
                        Study Streak · 5 Days
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          ATI Comprehensive Predictor
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          76%
                        </div>
                        <div className="text-xs text-gray-600">
                          Med Surg And Fundamentals Are Climbing
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          HESI Exit Exam
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          72%
                        </div>
                        <div className="text-xs text-gray-600">
                          Pharm Questions Still Need Work
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          Questions Answered
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          365
                        </div>
                        <div className="text-xs text-gray-600">
                          Last 7 Days Across Both Exit Exams
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          Strongest Area
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          Maternal–Newborn
                        </div>
                        <div className="text-xs text-gray-600">
                          Consistent Above Target Performance
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-3">
                      <div>Exit Exam Readiness</div>
                      <div className="flex-1 h-1 rounded-full bg-gray-300 overflow-hidden ml-3">
                        <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Exit Exam Section */}
        <section className="py-9 pb-6">
          <div className="w-full px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Choose Your Nursing Exit Exam
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                Focus On ATI Comprehensive Predictor Or HESI Exit — Or Both
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                Some schools use ATI Comprehensive Predictor, others use HESI
                Exit, and a few use both. NursingMocks lets you prepare for each
                exam with its own sets, while keeping everything inside a single
                clean dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ATI Comprehensive Predictor Card */}
              <article className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-lg overflow-hidden">
                <div className="absolute -top-9 -right-6 w-[110px] h-[110px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-14 blur-[0.5px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Nursing Exit Exam · ATI
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                      School Predictor Focus
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    ATI Comprehensive Predictor Practice Hub
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Build confidence before your official ATI Comprehensive
                    Predictor attempt with NCLEX style questions that cover the
                    full program, not just one unit test.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📝</span>
                      Comprehensive Predictor Style Exams
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📚</span>
                      Question Banks For All Major Content Areas
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>🎯</span>
                      Performance Bands And Focus Areas
                    </div>
                  </div>

                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    What You Can Practice
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Comprehensive sets that mix fundamentals, med surg,
                      pharmacology, mental health, and more.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Scenario based questions that feel close to NCLEX style
                      decision making.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Timed mini predictors that show how your pacing feels
                      before school scheduled exams.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Review Mode sessions where you slow down, reread the stem,
                      and study rationales in detail.
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        Best For Programs Using ATI Comprehensive Predictor
                      </strong>
                      <span>
                        Use full length practice when you want a dress rehearsal,
                        and shorter blocks when time is tight.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/45 flex items-center gap-2"
                      >
                        <span>Start ATI Predictor Practice</span>
                        <span>➜</span>
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border border-slate-300 bg-white text-gray-900 flex items-center gap-2"
                      >
                        <span className="opacity-70">👁</span>
                        View ATI Predictor Question Sets
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* HESI Exit Card */}
              <article className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-lg overflow-hidden">
                <div className="absolute -top-9 -right-6 w-[110px] h-[110px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-14 blur-[0.5px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Nursing Exit Exam · HESI
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                      NCLEX Readiness Signal
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    HESI Exit Exam Practice Hub
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Prepare for the HESI Exit Exam with practice that mirrors the
                    mix of med surg, pharm, pediatrics, mental health, and
                    priority style questions your school cares about.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📊</span>
                      Content Area Performance Reports
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>⏳</span>
                      Timed Comprehensive Sessions
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>🔁</span>
                      Weak Area Question Loops
                    </div>
                  </div>

                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    What You Can Practice
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Mixed HESI style exams that reflect the balance of content
                      in a typical exit exam.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Priority, delegation, and safety questions written with
                      NCLEX level thinking in mind.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Focused blocks on tricky areas such as pharmacology, med
                      surg, and mental health.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Rationales that explain why distractors are wrong, not just
                      which option is correct.
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        Best For Students Sitting A HESI Exit Exam
                      </strong>
                      <span>
                        Watch how your scores move over time instead of judging
                        yourself by one rough practice day.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/45 flex items-center gap-2"
                      >
                        <span>Start HESI Exit Practice</span>
                        <span>➜</span>
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border border-slate-300 bg-white text-gray-900 flex items-center gap-2"
                      >
                        <span className="opacity-70">📁</span>
                        View HESI Exit Question Sets
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
                One Prep Platform For Both Exit Exams
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                Whether your program leans on ATI Comprehensive Predictor, HESI
                Exit, or a mix of internal exams, your practice, analytics, and
                review notes stay under one roof so you can actually see the
                story of your progress.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🧪
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Comprehensive Style Practice Exams
                </h3>
                <p className="text-xs text-gray-600">
                  Use long form practice exams that mix content the way real exit
                  exams do. No more guessing how you perform when med surg,
                  pharm, pediatrics, and mental health show up in the same block
                  of questions.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🎯
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Content Area And Category Feedback
                </h3>
                <p className="text-xs text-gray-600">
                  Questions are tagged by content area and by skill, so you can
                  see whether missed items are about knowledge gaps, reading the
                  stem too fast, or struggling with prioritisation style
                  questions.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  📈
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Exit Exam Analytics Dashboard
                </h3>
                <p className="text-xs text-gray-600">
                  Track your average performance on ATI Comprehensive Predictor
                  style sets and HESI Exit practice separately. Spot slow but
                  steady gains rather than judging yourself from one rough exam
                  day.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🧭
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Guided Review Before Test Day
                </h3>
                <p className="text-xs text-gray-600">
                  Use guided plans when you want a clear countdown to exit exam
                  week, or build your own path by drilling only the topics that
                  dip below your personal target score.
                </p>
              </article>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                  ATI Comprehensive Predictor
                </div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  ATI Exit Practice That Respects Your Time
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  By the time the ATI Comprehensive Predictor appears on your
                  calendar, you are usually juggling preceptorship hours, last
                  assignments, and real life. NursingMocks is designed to give
                  you serious practice without demanding a full afternoon every
                  time you log in.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    ATI style comprehensive sets you can run on days when you
                    want a full exam feel.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Shorter blocks for moments when you only have twenty or
                    thirty minutes to spare.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Content breakdowns that show which areas are moving toward
                    your goal range.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Clear explanations that connect rationales back to core
                    nursing concepts, not just test tricks.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                  HESI Exit Exam
                </div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  HESI Exit Practice Built Around NCLEX Readiness
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  Many students describe the HESI Exit as a general rehearsal for
                  NCLEX. The questions inside NursingMocks lean into that idea,
                  so every practice block pulls double duty: stronger chances on
                  the exit score your school requires and more comfort with
                  NCLEX style stems.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    HESI style questions that reward careful reading and safe
                    decision making.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Mixed content that reflects the way real patients rarely bring
                    one textbook chapter at a time.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Targeted sets on common sticking points like pharm, med surg,
                    and mental health.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Review sessions where you focus on why an answer is safe, not
                    just whether it is correct.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-300 bg-gray-50 text-xs text-gray-700">
              <strong className="text-gray-900 font-semibold">
                One Nursing Exit Account, Two Major Predictors Of NCLEX Success.
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  Use ATI Comprehensive Predictor style practice to see how your
                  program level knowledge holds together before the school
                  scheduled exam.
                </div>
                <div>
                  Switch into HESI Exit practice without creating a new account
                  or losing your prior analytics and review history.
                </div>
                <div>
                  Treat NursingMocks as your central space for exit exam
                  preparation so you are not jumping between random quizzes and
                  trying to make sense of the results on your own.
                </div>
              </div>
            </div>

            {/* Article Section */}
            <article className="mt-7 p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Real-World Nursing Exit Strategy
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    How To Balance ATI Comprehensive Predictor And HESI Exit Prep
                  </h3>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                  ATI & HESI Exit Study Guide
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.95fr] gap-6 text-sm text-gray-700">
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="mb-3">
                      The months before a nursing exit exam rarely feel quiet.
                      There are clinical days, preceptorship shifts, group
                      projects that refuse to schedule themselves, and life
                      outside school that still expects your attention. In the
                      middle of all this, someone mentions the ATI Comprehensive
                      Predictor date or HESI Exit schedule and suddenly your
                      brain is juggling one more countdown.
                    </p>
                    <p className="mb-3">
                      Most students do not want another textbook; they want to
                      know whether all the content they have lived through can
                      hold up when an exam mixes it together. NursingMocks leans
                      into that. You log in, choose ATI Comprehensive Predictor
                      or HESI Exit, and each practice block adds to the same exit
                      dashboard. You can see which days felt rough, which
                      subjects quietly improved, and where you keep making the
                      same small mistake.
                    </p>
                    <p>
                      A typical week might include one longer comprehensive set
                      on your day off and two or three shorter sessions slotted
                      around shifts. Twenty questions before you leave for
                      clinical, fifteen questions while dinner cooks, a review of
                      missed pharm items before bed. None of these moments looks
                      heroic on its own, but together they slowly push your
                      predictor style scores upward.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="mb-3">
                      Over time, patterns start to show up. Maybe your scores
                      rise whenever you mix med surg and fundamentals in the same
                      block, but dip whenever priority questions appear. Maybe
                      HESI Exit style questions expose a blind spot in mental
                      health scenarios that never felt obvious during class.
                      Instead of guessing what to fix, your dashboard quietly
                      points at the areas that need one more focused round.
                    </p>
                    <span className="inline-block mt-3 px-2 py-1 rounded-lg bg-green-50 text-green-800 text-xs font-medium">
                      Small Sessions, Real Exit Gains
                    </span>
                    <p className="mt-3 mb-3">
                      Ten solid questions with honest review usually beat fifty
                      rushed guesses. NursingMocks keeps track of which items you
                      struggled with, so you can circle back to them later,
                      re-answer with fresh eyes, and see whether you really
                      understood the rationale this time. That feedback loop is
                      where most exit exam progress actually happens.
                    </p>
                    <p>
                      By the time your ATI Comprehensive Predictor or HESI Exit
                      date arrives, the goal is not to feel fearless. The goal is
                      to feel familiar with the way these questions move. You
                      recognise the style, you know which content areas deserve
                      extra attention during the morning review, and you have a
                      clear record of the work you already put in instead of
                      hoping a last minute cram will carry everything for you.
                    </p>
                  </div>
                </div>

                <aside className="relative rounded-xl bg-gradient-to-br from-indigo-50 via-white to-gray-50 p-4 border border-indigo-200 shadow-lg overflow-hidden">
                  <div className="absolute bottom-8 -right-9 w-[120px] h-[120px] rounded-full bg-gradient-radial from-indigo-200 via-purple-600 to-indigo-600 opacity-24 blur-[0.5px]"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold mb-2 text-gray-900">
                      A Simple Routine That Works For Exit Exams
                    </h4>
                    <p className="text-xs text-gray-700 mb-3">
                      You do not need a complex colour coded planner to move your
                      exit scores in the right direction. Many students follow a
                      three step rhythm that is simple enough to repeat even on
                      busy weeks.
                    </p>
                    <ul className="text-xs mb-3 space-y-3">
                      <li className="pb-3 border-b border-dashed border-slate-300">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 1 · Set A Baseline
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Run one ATI Predictor or HESI Exit style set
                        </strong>
                        Do not worry about the number at the top. Use this first
                        attempt to see where you naturally slow down, which
                        content feels rusty, and how the questions are written.
                      </li>
                      <li className="pb-3 border-b border-dashed border-slate-300">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 2 · Pick One Focus Area At A Time
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Spend a few days on the lowest scoring content block
                        </strong>
                        If med surg or pharm sits at the bottom of your
                        dashboard, make that the first area you tackle with
                        shorter, targeted practice blocks and deliberate review
                        of rationales.
                      </li>
                      <li>
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 3 · Mix Comprehensive Sets Back In
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Alternate focused practice with mixed exams
                        </strong>
                        Once the weak area begins to climb, run another
                        comprehensive set. This shows whether the new
                        understanding holds up when everything is mixed together
                        the way real exit exams do.
                      </li>
                    </ul>
                    <div className="text-xs text-gray-600 mt-3">
                      Repeating this cycle for several weeks builds a quiet kind
                      of confidence. You are not hoping the exam goes well; you
                      can see the specific places where your ATI Comprehensive
                      Predictor and HESI Exit style scores have already shifted.
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-9 pb-6">
          <div className="w-full px-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div className="max-w-[60%]">
                  <h2 className="text-lg font-semibold mb-1 text-slate-900">
                    Compare ATI Comprehensive Predictor And HESI Exit Exam Prep
                  </h2>
                  <p className="text-sm text-gray-600">
                    Unsure which exit exam your school will rely on, or preparing
                    for both? This quick comparison shows how NursingMocks
                    supports each exam while keeping your analytics easy to read.
                  </p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ATI Predictor Vs HESI Exit
                </div>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      ATI Comprehensive Predictor
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      HESI Exit Exam
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="p-2 font-medium text-gray-900 w-[40%]">
                      Comprehensive Practice Exams
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Full Program Style Sets
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Mixed Content Exit Sets
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-900">
                      Content Area Question Banks
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Fundamentals, Med Surg, Pharm, More
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Med Surg, Pharm, Mental Health, Pediatrics, Etc.
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      NCLEX Style Rationales
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Focus On Safe Decisions
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Emphasis On Safety And Priorities
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-900">
                      Timed Exam Mode
                    </td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Review Mode With Explanations
                    </td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-900">
                      Exit Exam Specific Study Plans
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ ATI Predictor Focused Plans
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ HESI Exit Focused Plans
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs text-gray-600 mt-3">
                You can activate either exam or both inside the same
                subscription. Scores stay in separate sections of your dashboard
                so you always know where you stand for each exit exam.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-9 pb-6">
          <div className="w-full px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Nursing Exit Exam Questions
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                ATI Comprehensive Predictor And HESI Exit FAQ
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                These answers cover how NursingMocks fits around the exit exams
                your school uses. You can always expand this into a longer
                knowledge base later if you need more detail.
              </p>
            </div>

            <div className="max-w-[800px] mx-auto space-y-3">
              {[
                {
                  question:
                    "Is This The Same As Taking The Official ATI Or HESI Exit Exam?",
                  answer:
                    "No. NursingMocks is an independent practice platform. The questions are built to feel similar in style, pacing, and difficulty, but they are not the same items you will see on your school's official ATI Comprehensive Predictor or HESI Exit exam.",
                },
                {
                  question:
                    "Can I Use This Even If I Am Not Sure Which Exit Exam My School Uses?",
                  answer:
                    "Yes. Many students start by practising with both ATI Predictor style sets and HESI Exit style sets, then narrow down once the program confirms which exam they will sit. Your scores and history remain separate so you can track progress for each option.",
                },
                {
                  question:
                    "Does A Good Practice Score Guarantee I Will Pass My Exit Exam?",
                  answer:
                    "No practice platform can guarantee a particular outcome, but seeing steady improvement on comprehensive style sets is usually a good sign that your content knowledge and test habits are moving in the right direction. The goal is to reduce surprises on exam day, not to promise a specific score.",
                },
                {
                  question:
                    "When Should I Start Preparing For ATI Comprehensive Predictor Or HESI Exit?",
                  answer:
                    "Some students begin light practice a few months before their scheduled exit exam, others wait until the date is officially posted. A common pattern is to start with shorter sets during the term and add longer comprehensive practice in the final weeks, when you want to see how everything holds together.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border border-gray-200 bg-white overflow-hidden ${
                    openFaqIndex === index ? "shadow-md" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full border-none bg-transparent p-3 flex justify-between items-center text-left text-sm text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border border-slate-300 flex items-center justify-center text-xs text-gray-600">
                        Q
                      </div>
                      <span>{faq.question}</span>
                    </div>
                    <span
                      className={`text-base text-gray-400 transition-transform ${
                        openFaqIndex === index
                          ? "rotate-90 text-indigo-600"
                          : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      openFaqIndex === index
                        ? "max-h-[220px] pb-3"
                        : "max-h-0 pb-0"
                    }`}
                  >
                    <div className="px-3 text-xs text-gray-600">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
