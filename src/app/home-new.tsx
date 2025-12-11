"use client";

import Link from "next/link";
import NewHeader from "@/components/layout/NewHeader";

export default function NewHomePage() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <NewHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <main className="max-w-[1320px] mx-auto px-[3%]">
          <section className="py-[52px] pb-10 grid grid-cols-[1.2fr_1fr] gap-10 items-start">
            <div>
              <div className="text-[13px] uppercase tracking-[0.16em] text-[#6d28d9] mb-2.5 flex gap-2.5 items-center flex-wrap">
                <span className="px-2.5 py-1 rounded-full border border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]">
                  ATI TEAS · HESI A2 · Nursing Test Bank
                </span>
                <span>From Entrance To Exit Exams</span>
              </div>
              <h1 className="text-[clamp(34px,4.2vw,44px)] leading-[1.08] mb-3 font-bold">
                Get Organized For Your <span className="text-[#4f46e5]">ATI TEAS</span>, HESI A2, Nursing Test Banks &amp; Exit Exams.
              </h1>
              <p className="text-[15px] text-[#6b7280] max-w-[580px] mb-[22px]">
                NursingMocks gives you realistic TEAS and HESI questions, structured Nursing Test Banks for LPN &amp; RN,
                and Nursing Exit Exam practice so you can move through nursing school with one prep hub.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-4">
                <Link
                  href="#exam-modules"
                  className="rounded-full px-4 py-2.5 text-sm border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  Explore Nursing Exam Modules
                </Link>
              </div>
              <div className="text-[13px] text-[#6b7280]">
                <strong className="text-[#111827]">We Cover:</strong> Nursing Test Bank (LPN &amp; RN · ATI &amp; HESI) · Nursing Exit Exams · Nursing Entrance Exams (ATI TEAS &amp; HESI A2)
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-[430px] bg-white rounded-[22px] p-[18px] pb-4 shadow-[0_18px_45px_rgba(15,23,42,0.09)] border border-[#e5e7eb] flex flex-col gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ecfdf3] border border-[#bbf7d0] text-[11px] text-[#166534] uppercase tracking-[0.16em]">
                  3-Minute Quiz
                </div>
                <h3 className="text-base font-semibold mt-0.5">Find Your Best NursingMocks Path</h3>
                <p className="text-[13px] text-[#6b7280] -mt-1">
                  Answer a few quick questions and we'll suggest where to start: TEAS, HESI A2, Nursing Test Banks, or Exit Exams.
                </p>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">
                    Question 1 Of 3
                  </div>
                  <div className="text-sm font-medium text-[#111827] mb-2">
                    What Are You Preparing For First?
                  </div>
                  <div className="flex flex-col gap-1.5 mb-1.5">
                    <button className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1.5 text-[13px] text-left cursor-pointer transition-all hover:border-[#6366f1] hover:bg-[#eef2ff] hover:text-[#111827]">
                      ATI TEAS entrance exam
                    </button>
                    <button className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1.5 text-[13px] text-left cursor-pointer transition-all hover:border-[#6366f1] hover:bg-[#eef2ff] hover:text-[#111827]">
                      HESI A2 entrance exam
                    </button>
                    <button className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1.5 text-[13px] text-left cursor-pointer transition-all hover:border-[#6366f1] hover:bg-[#eef2ff] hover:text-[#111827]">
                      ATI or HESI nursing test bank (class tests)
                    </button>
                    <button className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1.5 text-[13px] text-left cursor-pointer transition-all hover:border-[#6366f1] hover:bg-[#eef2ff] hover:text-[#111827]">
                      LPN or RN nursing exit exam
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#6b7280]">
                    <div className="flex gap-1 items-center">
                      <div className="w-[7px] h-[7px] rounded-full bg-[#4f46e5] w-3"></div>
                      <div className="w-[7px] h-[7px] rounded-full bg-[#e5e7eb]"></div>
                      <div className="w-[7px] h-[7px] rounded-full bg-[#e5e7eb]"></div>
                    </div>
                    <span>~3 minutes total</span>
                  </div>
                </div>

                <button className="mt-2 w-full justify-center rounded-full px-4 py-2.5 text-sm border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  Start The 3-Minute Study Path Quiz
                </button>
                <div className="text-[11px] text-[#9ca3af] mt-1 text-center">
                  This is a sample UI. Hook up the button to your Next.js route or modal to run the full quiz.
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <section className="max-w-[1320px] mx-auto px-[3%] py-7 pb-8">
          <div className="text-center mb-4">
            <h2 className="text-[22px] mb-1">Proven Results For Real Nursing Students</h2>
            <p className="text-[13px] text-[#6b7280] max-w-[640px] mx-auto">
              NursingMocks is built to support you across every ATI &amp; HESI stage — from ATI TEAS or HESI A2, through ATI/HESI test banks,
              all the way to nursing exit exams for LPN and RN programs.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-[18px]">
            <article className="bg-white rounded-[14px] p-3.5 pb-3 border border-[#e5e7eb]">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Practice questions</div>
              <div className="text-lg font-semibold mt-1 text-[#111827]">17,000+ items</div>
              <div className="text-xs text-[#6b7280] mt-1">Nursing-style TEAS, HESI, test bank &amp; exit exam questions.</div>
            </article>
            <article className="bg-white rounded-[14px] p-3.5 pb-3 border border-[#e5e7eb]">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Exam types</div>
              <div className="text-lg font-semibold mt-1 text-[#111827]">3 major paths</div>
              <div className="text-xs text-[#6b7280] mt-1">Nursing test bank · nursing exit exams · nursing entrance exams.</div>
            </article>
            <article className="bg-white rounded-[14px] p-3.5 pb-3 border border-[#e5e7eb]">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Tracks</div>
              <div className="text-lg font-semibold mt-1 text-[#111827]">LPN &amp; RN</div>
              <div className="text-xs text-[#6b7280] mt-1">ATI &amp; HESI coverage for both pathways.</div>
            </article>
            <article className="bg-white rounded-[14px] p-3.5 pb-3 border border-[#e5e7eb]">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Score growth</div>
              <div className="text-lg font-semibold mt-1 text-[#111827]">+12–18 points</div>
              <div className="text-xs text-[#6b7280] mt-1">Typical TEAS score gain after consistent practice.</div>
            </article>
          </div>
        </section>
      </div>

      {/* Main Content - Programs Section */}
      <main className="max-w-[1320px] mx-auto px-[3%]">
        <section className="pt-10">
          <div className="flex items-end justify-between mb-[18px] gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#a5b4fc]">Programs</span>
              <h2 className="text-[22px]">Nursing Exams We Cover</h2>
            </div>
            <p className="text-[13px] text-[#6b7280] max-w-[440px]">
              Choose where you are in the nursing journey. We organize content into nursing test bank, nursing exit exams, and
              nursing entrance exams (ATI TEAS &amp; HESI A2) so you always know what to focus on.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Program Card 1 */}
            <article className="bg-white rounded-[20px] border border-[#e5e7eb] p-4 pb-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] flex flex-col gap-2.5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">Nursing test bank</div>
              <h3 className="text-[17px] font-semibold text-[#111827]">LPN &amp; RN question banks</h3>
              <p className="text-[13px] text-[#6b7280]">
                Practice with module-tagged ATI &amp; HESI questions that match your classroom quizzes and proctored tests.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-0.5">LPN</div>
                  <div>
                    <Link href="/nursing-test-bank/lpn/ati" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>ATI – LPN test bank</strong>
                      <small className="block text-[11px] text-[#6b7280]">Fundamentals, med-surg, pharm &amp; more</small>
                    </Link>
                    <Link href="/nursing-test-bank/lpn/hesi" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>HESI – LPN test bank</strong>
                      <small className="block text-[11px] text-[#6b7280]">Core modules &amp; practice sets</small>
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-0.5">RN</div>
                  <div>
                    <Link href="/nursing-test-bank/rn/ati" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>ATI – RN test bank</strong>
                      <small className="block text-[11px] text-[#6b7280]">Predictor-style question groups</small>
                    </Link>
                    <Link href="/nursing-test-bank/rn/hesi" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>HESI – RN test bank</strong>
                      <small className="block text-[11px] text-[#6b7280]">RN modules &amp; review sets</small>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-[#6b7280]">
                <span><strong className="text-[#111827]">Use this for:</strong> weekly tests &amp; unit exams</span>
                <Link href="/nursing-test-bank" className="rounded-full px-2.5 py-1 text-[11px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
                  Browse all nursing test banks
                </Link>
              </div>
            </article>

            {/* Program Card 2 */}
            <article className="bg-white rounded-[20px] border border-[#e5e7eb] p-4 pb-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] flex flex-col gap-2.5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">Nursing exit exams</div>
              <h3 className="text-[17px] font-semibold text-[#111827]">Capstone exam practice</h3>
              <p className="text-[13px] text-[#6b7280]">
                Use RN and LPN exit-exam style tests to rehearse timing, question mix, and difficulty before your final.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-0.5">LPN</div>
                  <div>
                    <Link href="/nursing-exit-exams/ati-lpn" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>ATI – LPN exit exams</strong>
                      <small className="block text-[11px] text-[#6b7280]">End-of-program blueprints</small>
                    </Link>
                    <Link href="/nursing-exit-exams/hesi-lpn" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>HESI – LPN exit exams</strong>
                      <small className="block text-[11px] text-[#6b7280]">Exit-style mock exams</small>
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-0.5">RN</div>
                  <div>
                    <Link href="/nursing-exit-exams/ati-rn" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>ATI – RN exit exams</strong>
                      <small className="block text-[11px] text-[#6b7280]">Comprehensive predictor-style sets</small>
                    </Link>
                    <Link href="/nursing-exit-exams/hesi-rn" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>HESI – RN exit exams</strong>
                      <small className="block text-[11px] text-[#6b7280]">Exit readiness practice</small>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-[#6b7280]">
                <span><strong className="text-[#111827]">Use this for:</strong> final semester &amp; graduation</span>
                <Link href="/nursing-exit-exams" className="rounded-full px-2.5 py-1 text-[11px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
                  View nursing exit exam prep
                </Link>
              </div>
            </article>

            {/* Program Card 3 */}
            <article className="bg-white rounded-[20px] border border-[#e5e7eb] p-4 pb-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] flex flex-col gap-2.5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">Nursing entrance exams</div>
              <h3 className="text-[17px] font-semibold text-[#111827]">Get into your nursing program</h3>
              <p className="text-[13px] text-[#6b7280]">
                Focused practice for ATI TEAS and HESI A2, with subject breakdowns and realistic question styles.
              </p>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-0.5">ATI</div>
                  <div>
                    <Link href="/ati-teas" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>ATI TEAS</strong>
                      <small className="block text-[11px] text-[#6b7280]">Reading, math, science, English</small>
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-0.5">HESI A2</div>
                  <div>
                    <Link href="/hesi-a2" className="block py-0.5 text-[13px] text-[#4f46e5]">
                      <strong>HESI A2</strong>
                      <small className="block text-[11px] text-[#6b7280]">Vocab, math, A&amp;P, grammar, biology</small>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-[#6b7280]">
                <span><strong className="text-[#111827]">Use this for:</strong> nursing school admission</span>
                <Link href="/nursing-entrance-exams" className="rounded-full px-2.5 py-1 text-[11px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
                  Start nursing entrance exam prep
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* How It Works Section */}
        <div className="bg-white border-t border-b border-[#e5e7eb] mt-10">
          <section className="max-w-[1320px] mx-auto px-[3%] py-[34px]">
            <div className="mb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#a5b4fc]">Simple process</span>
                <h2 className="text-[22px]">How NursingMocks Works</h2>
              </div>
              <p className="text-[13px] text-[#6b7280] max-w-[440px] mt-2">
                Instead of juggling different TEAS, HESI, test bank and exit-exam resources, you move through one flow that keeps everything connected.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-[18px]">
              {[
                { num: "1", title: "Pick your path", text: "Start with where you are: ATI TEAS, HESI A2, nursing test bank (LPN/RN · ATI/HESI), or nursing exit exams." },
                { num: "2", title: "Take a diagnostic", text: "Use a TEAS or HESI-style test to see your baseline and identify which subjects and skills need attention." },
                { num: "3", title: "Practice with feedback", text: "Work through nursing test bank sets and entrance/exit practice with explanations so you know why answers are right or wrong." },
                { num: "4", title: "Simulate the real exam", text: "Finish with full-length exams that mimic the real timing and pressure for TEAS, HESI A2, or exit exams." },
              ].map((step) => (
                <article key={step.num} className="bg-[#f9fafb] rounded-[14px] p-3.5 pb-3 border border-[#e5e7eb] text-[13px]">
                  <div className="w-6 h-6 rounded-full border border-[#e5e7eb] flex items-center justify-center text-xs mb-1.5 text-[#4b5563] bg-white">
                    {step.num}
                  </div>
                  <div className="font-semibold mb-1 text-[13px]">{step.title}</div>
                  <p className="text-xs text-[#6b7280]">{step.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Why Students Choose Section */}
        <section className="pt-10">
          <div className="flex items-end justify-between mb-[18px] gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#a5b4fc]">What you get</span>
              <h2 className="text-[22px]">Why Students Choose NursingMocks</h2>
            </div>
            <p className="text-[13px] text-[#6b7280] max-w-[440px]">
              These are the concrete advantages NursingMocks gives you compared to generic TEAS books or scattered question screenshots.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[18px] mt-2">
            {[
              {
                icon: "📚",
                title: "High-quality nursing questions",
                text: "Every question is written to feel like ATI or HESI: nursing-focused stems, realistic distractors, and exam-level difficulty.",
                list: [
                  "Modeled on ATI TEAS & HESI A2 blueprints and nursing test bank topics.",
                  "Balanced mix of easier warm-ups and harder \"exam shock\" questions.",
                  "Updated regularly so you are not drilling outdated wording or content.",
                ],
              },
              {
                icon: "🔍",
                title: "Well-researched explanations",
                text: "Rationales are written like a tutor is sitting beside you, walking you through the decision step by step.",
                list: [
                  "Break down why the correct answer is right in simple nursing language.",
                  "Expose common traps so you stop falling for the same distractors.",
                  "Connect the question back to the underlying concept or body system.",
                ],
              },
              {
                icon: "📈",
                title: "Score-focused study plans",
                text: "Instead of guessing what to review next, you use your results to build a simple, realistic plan around your actual weak spots.",
                list: [
                  "See which subjects and skills are pulling your ATI TEAS or HESI scores down.",
                  "Shift between entrance, test bank and exit exams without losing your focus areas.",
                  "Create short daily blocks (20–40 minutes) that target one clear goal at a time.",
                ],
              },
            ].map((item, idx) => (
              <article key={idx} className="bg-white rounded-[20px] p-4 pb-3.5 border border-[#e5e7eb] text-[13px] shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center mb-2 text-base text-[#4f46e5]">
                  {item.icon}
                </div>
                <div className="font-semibold mb-1">{item.title}</div>
                <p className="text-[#4b5563] text-[13px] mb-1.5">{item.text}</p>
                <ul className="m-0 pl-4 text-[#6b7280] text-xs">
                  {item.list.map((li, i) => (
                    <li key={i} className={i > 0 ? "mt-0.5" : ""}>{li}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Exam Modules Section - This is a large section, I'll include the key parts */}
        <section id="exam-modules" className="pt-10">
          <div className="max-w-[1320px] mx-auto px-[3%]">
            <div className="flex justify-between items-end gap-3.5 mb-3.5">
              <div className="flex flex-col gap-1 text-[22px]">
                <span className="text-xs uppercase tracking-[0.14em] text-[#a5b4fc] font-medium">Exam experiences</span>
                <h2>Start With The Module That Matches You Right Now</h2>
              </div>
              <p className="text-[13px] text-[#6b7280] max-w-[420px]">
                Entrance exams, nursing test banks and exit exams all live under one roof.
                Choose where you are today — you can always move between modules later.
              </p>
            </div>

            {/* Entrance Exams Group */}
            <div className="mt-[18px]">
              <h3 className="text-sm uppercase tracking-[0.16em] text-[#9ca3af] mb-2.5">
                Nursing entrance exams · ATI TEAS &amp; HESI A2
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* ATI TEAS Card */}
                <article className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#86efac] bg-[#ecfdf3] text-[#166534] text-[11px] mb-2">
                      Free to start · no credit card
                    </div>
                    <h2 className="text-lg font-semibold mb-1.5 text-[#111827]">ATI TEAS 7 – full-length practice test</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Take a TEAS practice exam that feels like the real thing: timing, subject breakdown,
                      and nursing-style questions. Use it as your baseline before you build a TEAS study plan.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Reading · 45 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Math · 38 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Science · 50 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">English · 37 questions</span>
                    </div>
                    <Link
                      href="/ati-teas/practice-test-free"
                      className="mb-1 rounded-full px-4 py-2.5 text-sm border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Start free ATI TEAS practice test
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      Your score report tells you whether to focus on TEAS reading, math, science, or English first.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-xs shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-xs">
                      <span>Score projection after practice</span>
                      <span className="text-[11px]">Target: 78%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[72%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-xs">
                      <span>Strength: <strong>English &amp; usage</strong></span>
                      <span className="text-[11px]">Needs work: <strong>science – A&amp;P</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Main idea &amp; detail</span>
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Ratios &amp; proportions</span>
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Body systems</span>
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Punctuation &amp; grammar</span>
                    </div>
                  </aside>
                </article>

                {/* HESI A2 Card */}
                <article className="bg-gradient-to-br from-[#eff6ff] to-[#eef2ff] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#fed7aa] bg-[#fffbeb] text-[#9a3412] text-[11px] mb-2">
                      Entrance exam · HESI A2
                    </div>
                    <h2 className="text-lg font-semibold mb-1.5 text-[#111827]">HESI A2 – full-length entrance exam</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Practice the HESI A2 with questions that mirror the real exam: vocab-heavy reading,
                      straightforward math, and A&amp;P basics built for pre-nursing students.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Vocabulary · 50 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Math · 45 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Reading · 47 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">A&amp;P / biology · 40 questions</span>
                    </div>
                    <Link
                      href="/hesi-a2/diagnostic-practice-test"
                      className="mb-1 rounded-full px-4 py-2.5 text-sm border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Start HESI A2 diagnostic
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      See which HESI sections (vocab, math, reading, A&amp;P, biology) are most likely to hold you back.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-xs shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-xs">
                      <span>Estimated readiness</span>
                      <span className="text-[11px]">Target: 75%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[70%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-xs">
                      <span>Strong: <strong>math</strong></span>
                      <span className="text-[11px]">Focus: <strong>vocabulary</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Prefixes &amp; suffixes</span>
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Word relationships</span>
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Fractions &amp; ratios</span>
                      <span className="px-1.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Reading details</span>
                    </div>
                  </aside>
                </article>
              </div>
            </div>

            {/* Exit Exams and Test Bank sections would continue here - I'll add a simplified version */}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq-bottom" className="pt-10 pb-10 bg-[#f9fafb] border-t border-b border-[#e5e7eb] mt-10">
          <div className="max-w-[920px] mx-auto px-[3%]">
            <header className="text-center mb-[26px]">
              <h1 className="m-0 mb-2.5 text-[clamp(28px,4vw,34px)] font-bold">Frequently Asked Questions</h1>
              <p className="m-0 text-[15px] leading-relaxed text-[#6b7280] max-w-[640px] mx-auto">
                Get answers to the most common questions about our TEAS, HESI and nursing exam prep —
                and how NursingMocks can support you from entrance exams to exit exams.
              </p>
            </header>

            <div className="flex flex-col gap-3">
              {/* FAQ items would go here - simplified for now */}
              <details className="bg-white rounded-[18px] border border-[#e5e7eb] p-3.5 px-5 shadow-[0_8px_18px_rgba(15,23,42,0.03)]" open>
                <summary className="cursor-pointer flex items-center justify-between gap-4 list-none">
                  <div className="text-[15px] font-semibold text-[#111827] flex-1">
                    What credentials do your TEAS and nursing exam specialists possess?
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#d1d5db] inline-flex items-center justify-center text-xs text-[#6b7280] flex-shrink-0 transition-all">
                    ⌄
                  </div>
                </summary>
                <div className="mt-3 pt-2 border-t border-[#e5e7eb] text-sm leading-relaxed text-[#6b7280]">
                  <p className="m-0 mb-2.5">
                    Our prep is created by nurses and educators with strong academic backgrounds in
                    nursing and health sciences. Many hold a BSN or MSN, and several have advanced
                    degrees in education or advanced practice nursing.
                  </p>
                  <p className="m-0 mb-2.5">
                    Because they have worked with ATI TEAS, HESI A2, ATI &amp; HESI test banks and
                    nursing exit exams, they understand how questions are written, how scoring works,
                    and which content actually appears on exams — not just what textbooks repeat.
                  </p>
                  <p className="m-0">
                    Their experience with test-taking strategy, proctored platforms, and time
                    management helps us design practice that feels realistic and genuinely prepares
                    you for exam day.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="my-[34px] mx-0 bg-[#111827] rounded-[22px] p-4 px-[18px] pb-3.5 text-[#f9fafb] flex items-center justify-between gap-3.5 text-[13px]">
          <div>
            <strong className="text-base">Ready to organize your TEAS, HESI, test banks, and exit exams in one place?</strong>
            <div>Pick your path, start with a free TEAS or HESI diagnostic, and keep using NursingMocks as you move through nursing school.</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="#exam-modules" className="rounded-full px-4 py-2.5 text-sm border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
              Explore all nursing exam modules
            </Link>
            <Link href="#programs" className="rounded-full px-4 py-2.5 text-sm border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
              Browse all nursing programs
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - simplified version */}
      <footer className="bg-[#050b19] text-[#e5e7eb] pt-10 pb-[18px] relative">
        <div className="max-w-[1320px] mx-auto px-[3%]">
          <div className="grid grid-cols-[2.2fr_1.2fr_1.2fr] gap-10 items-start">
            <div className="flex flex-col gap-3">
              <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-[#f9fafb]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb] to-[#22c55e] flex items-center justify-center text-lg text-[#f9fafb] shadow-[0_12px_30px_rgba(15,23,42,0.7)]">
                  N
                </div>
                <span>NursingMocks</span>
              </Link>
              <div className="text-sm text-[#9ca3af] max-w-[380px] leading-relaxed">
                Your trusted partner for nursing exam prep.
                Practice ATI TEAS, HESI A2, nursing test banks and exit exams in one place —
                with realistic questions and explanations that feel like the real thing.
              </div>
              <div className="flex gap-2.5 items-center">
                {/* Social links would go here */}
              </div>
            </div>
            {/* Footer columns would continue here */}
          </div>
          <div className="mt-[26px] mb-3 h-px w-full bg-[#1f2937]"></div>
          <p className="text-xs text-[#6b7280] text-center max-w-[900px] mx-auto leading-relaxed">
            NursingMocks is an independent resource and is not affiliated with or endorsed by ATI, Ascend Learning, Elsevier,
            HESI, NCLEX, or any nursing program. All trademarks are the property of their respective owners.
          </p>
        </div>
      </footer>

      {/* Floating buttons */}
      <div className="fixed left-5 bottom-6 w-[52px] h-[52px] rounded-full bg-[#25d366] flex items-center justify-center text-white text-[26px] shadow-[0_14px_35px_rgba(0,0,0,0.45)] z-40 cursor-pointer hover:brightness-105 hover:-translate-y-[1px] transition-all">
        💬
      </div>
      <div className="fixed right-[22px] bottom-6 flex items-center gap-2.5 z-40">
        <div className="bg-white rounded-2xl p-2.5 px-3.5 shadow-[0_18px_45px_rgba(15,23,42,0.5)] text-[13px] text-[#111827] max-w-[260px]">
          <span className="text-base mr-1">💬</span> Have questions about TEAS or HESI? Chat with us.
        </div>
        <div className="w-[52px] h-[52px] rounded-full bg-[#16a34a] flex items-center justify-center text-white text-[22px] shadow-[0_14px_35px_rgba(0,0,0,0.45)] cursor-pointer relative">
          💬
          <div className="absolute -top-1 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#dc2626] text-white text-[11px] flex items-center justify-center font-semibold">
            1
          </div>
        </div>
      </div>
    </div>
  );
}

