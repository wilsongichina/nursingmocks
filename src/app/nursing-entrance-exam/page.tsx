"use client";

import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useState } from "react";

export default function NursingEntranceExamPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-gray-50 to-gray-50">
        {/* Hero Section */}
        <section className="py-14 pb-10">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 mb-4">
                  <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-indigo-100 text-[0.7rem]">
                    ★
                  </span>
                  Trusted Nursing Entrance Prep
                </div>
                <h1 className="text-[2.2rem] lg:text-[2.7rem] leading-[1.1] tracking-[-0.04em] mb-3 text-slate-900 font-bold">
                  Nursing Entrance Exams For{" "}
                  <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ATI TEAS
                  </span>{" "}
                  And{" "}
                  <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    HESI A2
                  </span>
                </h1>
                <p className="text-[0.98rem] text-gray-600 max-w-[32rem] mb-6 font-normal">
                  Walk into test day knowing exactly what to expect. Build
                  confidence with realistic ATI TEAS and HESI A2 questions,
                  full-length exams, and skill-by-skill feedback tailored to
                  nursing students.
                </p>

                <div className="flex flex-wrap gap-3 mb-6 text-xs">
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <div className="w-[7px] h-[7px] rounded-full bg-green-500"></div>
                    Updated For Current ATI TEAS And HESI A2 Blueprints
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <span>⏱</span>
                    Timed Exam And Review Modes
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-400/65 flex items-center gap-2 text-gray-900">
                    <span>📊</span>
                    Skill Analytics For Every Subject
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                  <Link
                    href="/register"
                    className="rounded-full px-6 py-3 text-sm border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/50 flex items-center gap-2 hover:brightness-105 transition-all"
                  >
                    <span className="text-[1.05rem] translate-y-[1px]">➤</span>
                    Start ATI TEAS Prep
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full px-5 py-3 text-sm border border-slate-300 bg-white/95 text-gray-900 font-medium flex items-center gap-2 hover:bg-white transition-all"
                  >
                    <span className="text-base opacity-75">⟲</span>
                    Explore HESI A2 Practice
                  </Link>
                </div>

                <p className="text-xs text-gray-400 font-normal">
                  <strong className="text-gray-600 font-semibold">One login.</strong> Switch
                  between ATI TEAS and HESI A2 without losing your progress.
                </p>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-indigo-50 via-white to-gray-50 rounded-[2rem] p-6 shadow-lg border border-slate-300 overflow-hidden">
                  <div className="absolute -top-10 -right-6 w-[140px] h-[140px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-15 blur-[0.5px]"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Entrance Exam Snapshot
                      </div>
                      <div className="rounded-full px-2 py-1 bg-green-50 border border-green-300 text-xs text-green-800">
                        Study Streak · 6 Days
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          ATI TEAS
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          72%
                        </div>
                        <div className="text-xs text-gray-600">
                          Reading And Math Are Improving
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          HESI A2
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          68%
                        </div>
                        <div className="text-xs text-gray-600">
                          Vocabulary Needs More Practice
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          Questions Answered
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          420
                        </div>
                        <div className="text-xs text-gray-600">
                          Last 7 Days Across Both Exams
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-2xl p-3 border border-gray-200">
                        <div className="text-[0.7rem] uppercase tracking-wider text-gray-400 mb-1">
                          Strongest Area
                        </div>
                        <div className="text-lg font-bold mb-1 text-gray-900">
                          Anatomy
                        </div>
                        <div className="text-xs text-gray-600">
                          Above 80% Accuracy
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-3">
                      <div>Entrance Exam Readiness</div>
                      <div className="flex-1 h-1 rounded-full bg-gray-300 overflow-hidden ml-3">
                        <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Exam Section */}
        <section className="py-9 pb-6">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Choose Your Nursing Entrance Exam
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                Focus On ATI TEAS Or HESI A2 — Or Both
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                Build separate study plans for ATI TEAS and HESI A2 while
                keeping all your stats in one clean dashboard. Switch exams in a
                click without starting over.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ATI TEAS Card */}
              <article className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-lg overflow-hidden">
                <div className="absolute -top-9 -right-6 w-[110px] h-[110px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-14 blur-[0.5px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Entrance Exam · ATI TEAS
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300">
                      Most Popular
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    ATI TEAS 7 Practice Hub
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Walk through every section with question sets that feel like
                    the real exam: Reading, Math, Science, and English and
                    Language Usage.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📝</span>
                      Full-Length TEAS Practice Exams
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📚</span>
                      Section Banks For Every Subject
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>🎯</span>
                      Skill Mastery Tags On Each Question
                    </div>
                  </div>

                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    What You Can Practice
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Reading passages with main idea, inference, and detail
                      questions.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      ATI TEAS Math skills: ratios, proportions, conversions,
                      and word problems.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Science topics including human anatomy, physiology, and
                      scientific reasoning.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Grammar, punctuation, and word choice under English and
                      Language Usage.
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        Best For Students Applying To ATI TEAS Schools
                      </strong>
                      <span>
                        Use Review Mode to see explanations, then Exam Mode to
                        simulate test day.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/45 flex items-center gap-2"
                      >
                        <span>Start TEAS Practice</span>
                        <span>➜</span>
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border border-slate-300 bg-white text-gray-900 flex items-center gap-2"
                      >
                        <span className="opacity-70">👁</span>
                        View TEAS Question Sets
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              {/* HESI A2 Card */}
              <article className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-lg overflow-hidden">
                <div className="absolute -top-9 -right-6 w-[110px] h-[110px] rounded-full bg-gradient-radial from-indigo-100 via-indigo-200 to-indigo-600 opacity-14 blur-[0.5px]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Entrance Exam · HESI A2
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900">
                    HESI A2 Practice Hub
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Prepare for the seven core HESI A2 subjects with targeted
                    practice and skill analytics built around nursing entrance
                    requirements.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>📊</span>
                      Section Performance Skills
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>⏳</span>
                      Timed And Untimed Exams
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      <span>🔁</span>
                      Smart Question Review
                    </div>
                  </div>

                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    What You Can Practice
                  </div>
                  <ul className="text-sm text-gray-700 mb-4 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Reading comprehension with health-focused passages.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Vocabulary and general knowledge built around medical
                      terms.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Grammar and sentence structure for nursing-level writing.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Math skills for dosage, ratios, and conversions.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0">•</span>
                      Biology, Anatomy and Physiology, and Chemistry
                      foundations.
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <strong className="font-semibold text-gray-900">
                        Best For Students Taking HESI A2 Entrance Exams
                      </strong>
                      <span>
                        Track every subject separately so you know where to
                        spend your study time.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-gray-50 font-semibold shadow-lg shadow-indigo-500/45 flex items-center gap-2"
                      >
                        <span>Start HESI A2 Practice</span>
                        <span>➜</span>
                      </Link>
                      <Link
                        href="/register"
                        className="text-xs px-4 py-2 rounded-full border border-slate-300 bg-white text-gray-900 flex items-center gap-2"
                      >
                        <span className="opacity-70">📁</span>
                        View HESI Question Sets
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
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                What You Get With NursingMocks
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                One Prep Platform For Both Entrance Exams
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                Whether you are sitting ATI TEAS, HESI A2, or both, your
                practice, stats, and streaks stay in one place. No more juggling
                multiple apps or losing progress between different nursing
                entrance exam prep tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🧪
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Realistic Practice Exams
                </h3>
                <p className="text-xs text-gray-600">
                  Full length practice tests for both ATI TEAS and HESI A2 with
                  question styles, timing, and difficulty that feel close to the
                  actual entrance exam. Use Exam Mode when you want a timed
                  session and Review Mode when you want to slow down and read
                  the explanations.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🎯
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Skill Level Feedback
                </h3>
                <p className="text-xs text-gray-600">
                  Every item is tagged by skill, not just by subject. When you
                  miss an ATI TEAS math question, you see if it was a ratio
                  issue, a conversion problem, or a data interpretation error.
                  The same idea applies to HESI A2 reading comprehension,
                  vocabulary, and grammar questions.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  📈
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Entrance Exam Analytics
                </h3>
                <p className="text-xs text-gray-600">
                  Track your average scores, accuracy by subject, and study
                  streak across ATI TEAS and HESI A2 in one analytics view. You
                  can quickly see whether you are closer to test ready for the
                  ATI TEAS reading section or the HESI A2 math section.
                </p>
              </article>
              <article className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-base text-indigo-700 mb-3">
                  🧭
                </div>
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Guided Study Paths
                </h3>
                <p className="text-xs text-gray-600">
                  Use guided plans when you want a structured route to test day,
                  or build your own path by drilling only your weak areas.
                  NursingMocks adapts to students who are focused on ATI TEAS
                  prep, HESI A2 prep, or a combination of both entrance exams.
                </p>
              </article>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                  ATI TEAS Entrance Exam
                </div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  ATI TEAS Practice That Feels Familiar On Test Day
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  Many students search for ATI TEAS practice tests and end up
                  with random questions that do not match the official blueprint.
                  Inside NursingMocks, ATI TEAS questions are grouped by section
                  so you can move naturally from Reading to Math, then to Science
                  and English and Language Usage. The goal is to help you
                  recognize the patterns you will see on ATI TEAS test day, not
                  to overwhelm you with disconnected trivia.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Reading passages that mirror the length and tone of real ATI
                    TEAS passages.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    ATI TEAS Math questions covering ratios, proportions,
                    measurements, and word problems.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Science practice with human anatomy, physiology, and
                    scientific reasoning skills.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    English and Language Usage items that focus on punctuation,
                    spelling, and word choice.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                  HESI A2 Entrance Exam
                </div>
                <h3 className="text-sm font-semibold mb-2 text-gray-900">
                  HESI A2 Practice Built For Nursing Students
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  If your nursing program uses the HESI A2 entrance exam, you can
                  switch to a full HESI A2 practice environment without changing
                  platforms. NursingMocks includes Reading Comprehension,
                  Vocabulary and General Knowledge, Grammar, Basic Math Skills,
                  Biology, Anatomy and Physiology, and Chemistry practice written
                  with nursing students in mind.
                </p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Health-focused Reading passages that train you for HESI A2
                    Reading Comprehension questions.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Vocabulary sets that blend everyday language with common
                    medical prefixes and suffixes.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Grammar and sentence structure questions that improve your
                    written communication.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    HESI A2 Math questions that prepare you for dosage
                    calculations and conversion-style problems.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-300 bg-gray-50 text-xs text-gray-700">
              <strong className="text-gray-900 font-semibold">
                One Nursing Entrance Account, Two Major Exams.
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  Use ATI TEAS practice exams when your program requires the ATI
                  TEAS test, then keep your score history even if you later add
                  HESI A2.
                </div>
                <div>
                  Switch into HESI A2 prep without losing your existing
                  analytics, streaks, or completed ATI TEAS question sets.
                </div>
                <div>
                  Treat NursingMocks as your central home for all nursing
                  entrance exam practice, instead of spreading your study time
                  across multiple disconnected tools.
                </div>
              </div>
            </div>

            {/* Article Section */}
            <article className="mt-7 p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Real-World Nursing Entrance Strategy
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    How To Use One Platform To Balance ATI TEAS And HESI A2 Prep
                  </h3>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                  ATI TEAS & HESI A2 Study Guide
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.95fr] gap-6 text-sm text-gray-700">
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="mb-3">
                      Most students do not start ATI TEAS or HESI A2 prep with a
                      perfect plan. You hear a date from an advisor, look at your
                      work schedule, and suddenly there is a countdown on your
                      phone and a stack of notes in front of you. The hardest
                      part is not finding questions; it is keeping all of your
                      entrance exam practice organised so you can see what is
                      working and what still needs attention.
                    </p>
                    <p className="mb-3">
                      NursingMocks is built around that problem. You log in once,
                      choose ATI TEAS or HESI A2, and every question you answer
                      feeds back into a single entrance exam dashboard. Instead
                      of guessing whether your reading score is improving, you
                      can see it move week by week. Instead of wondering why math
                      feels harder this month, you see exactly which skills have
                      slipped.
                    </p>
                    <p>
                      A typical week might start with a full ATI TEAS Reading set
                      in Review Mode. You read the passages, answer the
                      questions, then slow down and walk through the
                      explanations. Two days later, you are on shift at work and
                      squeeze in fifteen HESI A2 Grammar questions during a
                      break. The sessions are short, but they stack. By Friday
                      evening the dashboard already reflects your effort.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="mb-3">
                      When everything lives inside one platform, patterns start to
                      appear. You may notice that your ATI TEAS Science accuracy
                      rises whenever you spend time on HESI A2 Anatomy and
                      Physiology, or that a week of focused TEAS Math practice
                      quietly improves your HESI A2 dosage questions. The goal is
                      not to grind endlessly, but to use the data to decide what
                      deserves your next thirty minutes.
                    </p>
                    <span className="inline-block mt-3 px-2 py-1 rounded-lg bg-green-50 text-green-800 text-xs font-medium">
                      Short Sessions, Long-Term Gain
                    </span>
                    <p className="mt-3 mb-3">
                      Ten questions while the kettle boils, another ten on the
                      bus, and a single timed mini exam on the weekend can move
                      your ATI TEAS and HESI A2 scores more than one long,
                      stressed-out cram night. Because NursingMocks keeps your
                      history for both exams, you can come back to tricky items
                      later, re-take sets, and check whether your second attempt
                      really matches what you learned.
                    </p>
                    <p>
                      Over time, this slow but steady rhythm makes the entrance
                      exam feel less like a wall and more like another shift you
                      know how to handle. You recognise the question styles. You
                      know roughly how long each section takes you. And instead
                      of hoping you have practised enough, you can open your
                      dashboard and see the story of your ATI TEAS and HESI A2
                      preparation written in numbers.
                    </p>
                  </div>
                </div>

                <aside className="relative rounded-xl bg-gradient-to-br from-indigo-50 via-white to-gray-50 p-4 border border-indigo-200 shadow-lg overflow-hidden">
                  <div className="absolute bottom-8 -right-9 w-[120px] h-[120px] rounded-full bg-gradient-radial from-indigo-200 via-purple-600 to-indigo-600 opacity-24 blur-[0.5px]"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold mb-2 text-gray-900">
                      A Simple Routine That Works For Both Exams
                    </h4>
                    <p className="text-xs text-gray-700 mb-3">
                      You do not need a complicated schedule to make progress.
                      Many students follow a simple three-step rhythm that fits
                      around busy clinical and work days and still moves ATI TEAS
                      and HESI A2 scores in the right direction.
                    </p>
                    <ul className="text-xs mb-3 space-y-3">
                      <li className="pb-3 border-b border-dashed border-slate-300">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 1 · Warm Up In Review Mode
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Start with 10–15 ATI TEAS or HESI A2 questions
                        </strong>
                        Read each explanation, even for the questions you got
                        right. This is where you spot small habits, like
                        misreading units or rushing the last sentence of a
                        passage.
                      </li>
                      <li className="pb-3 border-b border-dashed border-slate-300">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 2 · Test Yourself In Exam Mode
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Once or twice a week, run a timed mixed set
                        </strong>
                        Combine sections from your chosen exam and let the clock
                        run. The goal is not a perfect score; it is learning how
                        your pacing feels when time pressure is real.
                      </li>
                      <li>
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
                          Step 3 · Check The Entrance Dashboard
                        </div>
                        <strong className="text-gray-900 font-semibold block mb-1">
                          Use the data to pick tomorrow's focus
                        </strong>
                        Look at which subject dipped during the week. If HESI A2
                        Math or ATI TEAS Science slipped, make that area the
                        first thing you touch in your next short study block.
                      </li>
                    </ul>
                    <div className="text-xs text-gray-600 mt-3">
                      When you repeat this pattern for several weeks, your
                      preparation for both ATI TEAS and HESI A2 becomes less
                      about cramming and more about building a steady, predictable
                      habit that leads to genuine test-day confidence.
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-9 pb-6">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div className="max-w-[60%]">
                  <h2 className="text-lg font-semibold mb-1 text-slate-900">
                    Compare ATI TEAS And HESI A2 Entrance Prep
                  </h2>
                  <p className="text-sm text-gray-600">
                    Not sure which exam you will take? Use this quick comparison
                    to understand how NursingMocks supports both ATI TEAS and
                    HESI A2 so you can pick the right path.
                  </p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ATI TEAS Vs HESI A2
                </div>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      ATI TEAS
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-900 text-xs uppercase tracking-wider">
                      HESI A2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="p-2 font-medium text-gray-900 w-[40%]">
                      Full-Length Practice Exams
                    </td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-gray-900">
                      Section Question Banks
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ Reading, Math, Science, English
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ All Seven HESI Subjects
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 font-medium text-gray-900">
                      Skill Tags And Analytics
                    </td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
                    <td className="p-2 text-green-600 font-semibold">✓</td>
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
                      Entrance Exam-Specific Study Plans
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ ATI TEAS Plans
                    </td>
                    <td className="p-2 text-green-600 font-semibold">
                      ✓ HESI A2 Plans
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs text-gray-600 mt-3">
                You can activate either exam or both within the same subscription.
                Your dashboard keeps scores separate so you always know your
                readiness for each nursing entrance exam.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-9 pb-6">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-7">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Entrance Exam Questions
              </div>
              <h2 className="text-2xl tracking-tight mb-2 text-slate-900">
                ATI TEAS And HESI A2 Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-600 max-w-[32rem] mx-auto">
                These quick answers cover how NursingMocks works with ATI TEAS
                and HESI A2. You can always add more detail later inside your
                knowledge base.
              </p>
            </div>

            <div className="max-w-[800px] mx-auto space-y-3">
              {[
                {
                  question: "Can I Practice ATI TEAS And HESI A2 At The Same Time?",
                  answer:
                    "Yes. You can switch between ATI TEAS and HESI A2 from the same account. Each exam has its own question sets, skill tags, and analytics. Your scores stay separate so you can see progress for every entrance exam you plan to sit.",
                },
                {
                  question:
                    "How Close Are The Questions To The Real Entrance Exams?",
                  answer:
                    "The questions are designed to mirror the style, wording, and difficulty of actual ATI TEAS and HESI A2 items without copying them. The goal is to train your brain to recognize patterns, not to memorize exact questions.",
                },
                {
                  question: "Do I Get Explanations For Every Question?",
                  answer:
                    "In Review Mode you can see correct answers and explanations for ATI TEAS and HESI A2 questions. This helps you understand the reasoning behind the answer instead of just memorizing letters.",
                },
                {
                  question:
                    "What If I Am Not Sure Which Entrance Exam My School Uses?",
                  answer:
                    "Many programs clearly list ATI TEAS or HESI A2 on their admissions page. If you are still unsure, you can prepare using both exam hubs inside NursingMocks until you confirm which test your nursing school prefers.",
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
                        ? "max-h-[200px] pb-3"
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
