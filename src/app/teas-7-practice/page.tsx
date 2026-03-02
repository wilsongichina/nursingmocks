"use client";

import { useState } from "react";

export default function Teas7PracticePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I access the 11 modules after purchase?",
      answer:
        "After checkout, you receive access instructions and a link where the 11 modules are available online.",
    },
    {
      question: "Is this a one-time purchase or a subscription?",
      answer:
        "This is a one-time purchase. You receive the 10-modules bundle after checkout.",
    },
    {
      question: "What exactly is included in the 11 modules?",
      answer:
        "Ten preparation modules covering TEAS 7 Reading, Math, Science, and English. Use them sequentially or as targeted study blocks.",
    },
    {
      question: "Can I study on my phone?",
      answer:
        "Yes. The link works on mobile and laptop, so you can study wherever you're comfortable.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f2fe] via-[#f3f4f6] to-[#f9fafb]">
      <main className="pb-16 sm:pb-28 max-w-7xl mx-auto px-5 sm:px-6">
        {/* 1) HERO SECTION */}
        <section className="pt-14 pb-10 sm:pt-14 sm:pb-10">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              {/* Hero Left */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(79,70,229,0.06)] border border-[rgba(79,70,229,0.18)] text-xs text-[#4338ca] mb-3.5">
                  <span className="w-[18px] h-[18px] rounded-full bg-[#eef2ff] flex items-center justify-center text-[0.7rem]">
                    ★
                  </span>
                  TEAS 7 Online Access
                </div>

                <h1 className="text-[clamp(2.2rem,3vw,2.7rem)] leading-[1.1] tracking-[-0.04em] mb-3 text-[#020617]">
                  TEAS 7 Practice Questions for Nursing Exam Preparation{" "}
                  <span className="bg-gradient-to-br from-[#4f46e5] to-[#a855f7] bg-clip-text text-transparent">
                    11 Study modules
                  </span>
                </h1>

                <p className="text-[0.98rem] text-[#6b7280] max-w-[32rem] mb-5.5">
                  You're purchasing <strong>11 TEAS 7 exam preparation study modules</strong> designed for nursing students
                  who want structured coverage across Reading, Math, Science, and English & Language Usage.
                  Access is provided online via link access.
                </p>

                <div className="flex flex-wrap gap-2.5 mb-6 text-[0.8rem] text-black">
                  <div className="px-2.75 py-1 rounded-full bg-white border border-[rgba(148,163,184,0.65)] inline-flex items-center gap-1.25">
                    <div className="w-[7px] h-[7px] rounded-full bg-[#22c55e]"></div>
                    Built for focused TEAS 7 prep
                  </div>
                  <div className="px-2.75 py-1 rounded-full bg-white border border-[rgba(148,163,184,0.65)] inline-flex items-center gap-1.25">
                    <span>📁</span>
                    11 complete modules
                  </div>
                  <div className="px-2.75 py-1 rounded-full bg-white border border-[rgba(148,163,184,0.65)] inline-flex items-center gap-1.25">
                    <span>🔒</span>
                    One-time purchase
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4" id="buy">
                  <a
                    href="https://stan.store/YOURSTORELINK"
                    className="rounded-full px-5.5 py-3 text-[0.9rem] border-none bg-gradient-to-br from-[#4f46e5] to-[#a855f7] text-[#f9fafb] font-semibold no-underline shadow-[0_18px_40px_rgba(79,70,229,0.5)] inline-flex items-center gap-1.5 whitespace-nowrap hover:brightness-105 transition-all"
                    data-cta="buy"
                  >
                    <span className="text-[1.05rem] translate-y-px">➤</span>
                    Buy All 11 modules (Stan Store) - $99
                  </a>
                  <a
                    href="#preview"
                    className="rounded-full px-5 py-2.75 text-[0.9rem] border border-[rgba(148,163,184,0.7)] bg-[rgba(255,255,255,0.95)] text-[#111827] font-medium no-underline inline-flex items-center gap-1.25 whitespace-nowrap hover:bg-white transition-colors"
                    data-cta="preview"
                  >
                    <span className="text-base opacity-75">👁</span>
                    See What's Inside
                  </a>
                </div>

                <p className="text-[0.78rem] text-[#9ca3af]">
                  <strong className="text-[#4b5563] font-semibold">Instant access.</strong> Study at your own pace and use alongside your course materials.
                </p>
              </div>

              {/* Hero Right Card */}
              <div className="relative">
                <div className="bg-gradient-to-br from-[#eef2ff] via-white to-[#f9fafb] rounded-[2rem] p-5.5 sm:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] relative overflow-hidden border border-[rgba(148,163,184,0.35)]">
                  {/* Decorative cloud */}
                  <div className="absolute -top-10 -right-6 w-[140px] h-[140px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#eef2ff,#c7d2fe,#4f46e5)] opacity-15 blur-[0.5px]"></div>

                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="text-[0.9rem] font-semibold text-[#111827]">
                      What You Receive
                    </div>
                    <div className="rounded-full px-2.5 py-1 bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.35)] text-[0.75rem] text-[#166534]">
                      11 modules Included
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="bg-[rgba(255,255,255,0.9)] rounded-[1rem] p-2.5 border border-[rgba(209,213,219,0.9)]">
                      <div className="text-[0.7rem] uppercase tracking-[0.08em] text-[#9ca3af] mb-0.25">
                        Reading
                      </div>
                      <div className="text-[1.1rem] font-bold mb-0.2 text-[#111827]">
                        modules Coverage
                      </div>
                      <div className="text-[0.75rem] text-[#6b7280]">
                        Passages, inference, details
                      </div>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.9)] rounded-[1rem] p-2.5 border border-[rgba(209,213,219,0.9)]">
                      <div className="text-[0.7rem] uppercase tracking-[0.08em] text-[#9ca3af] mb-0.25">
                        Math
                      </div>
                      <div className="text-[1.1rem] font-bold mb-0.2 text-[#111827]">
                        modules Coverage
                      </div>
                      <div className="text-[0.75rem] text-[#6b7280]">
                        Ratios, conversions, word problems
                      </div>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.9)] rounded-[1rem] p-2.5 border border-[rgba(209,213,219,0.9)]">
                      <div className="text-[0.7rem] uppercase tracking-[0.08em] text-[#9ca3af] mb-0.25">
                        Science
                      </div>
                      <div className="text-[1.1rem] font-bold mb-0.2 text-[#111827]">
                        modules Coverage
                      </div>
                      <div className="text-[0.75rem] text-[#6b7280]">
                        A&P + core concepts
                      </div>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.9)] rounded-[1rem] p-2.5 border border-[rgba(209,213,219,0.9)]">
                      <div className="text-[0.7rem] uppercase tracking-[0.08em] text-[#9ca3af] mb-0.25">
                        English
                      </div>
                      <div className="text-[1.1rem] font-bold mb-0.2 text-[#111827]">
                        modules Coverage
                      </div>
                      <div className="text-[0.75rem] text-[#6b7280]">
                        Grammar, punctuation, usage
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-[0.78rem] text-[#6b7280] relative z-10">
                    <div>TEAS 7 Coverage Map</div>
                    <div className="h-1.25 rounded-full bg-[rgba(209,213,219,0.7)] overflow-hidden flex-1 ml-3">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#4f46e5] to-[#a855f7]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2) PREVIEW SECTION */}
        <section className="py-8.75 sm:py-9" id="preview">
          <div className="w-full">
            <div className="text-center mb-7">
              <div className="text-[0.78rem] uppercase tracking-[0.16em] text-[#9ca3af] mb-1.5">
                Preview
              </div>
              <h2 className="text-2xl tracking-[-0.03em] mb-1.5 text-[#020617]">
                See Our TEAS Preparation in Action
              </h2>
              <p className="text-[0.95rem] text-[#6b7280] max-w-[32rem] mx-auto">
                This is what nursing students care about: how the modules are structured and what kind of coverage
                you're getting across the 11 modules.
              </p>
            </div>

            <div className="bg-[#f9fafb] rounded-[1.5rem] p-5.5 sm:p-6 border border-[rgba(209,213,219,0.8)]">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div className="max-w-[60%] sm:max-w-none">
                  <h3 className="text-[1.1rem] font-semibold mb-0.5 text-[#020617]">
                    Preview the Structure Before You Buy
                  </h3>
                  <p className="text-[0.87rem] text-[#6b7280]">
                    Before you purchase, here's exactly what you receive and how the bundle is organised.
                  </p>
                </div>
                <div className="text-[0.78rem] px-3 py-1 rounded-full bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] whitespace-nowrap">
                  TEAS 7 Study modules Preview
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="rounded-[1.2rem] border border-dashed border-[rgba(148,163,184,0.85)] bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] flex flex-col gap-1.5">
                  <strong className="text-[0.9rem] text-[#111827] font-semibold">
                    TEAS 7 Study modules Bundle (11 modules)
                  </strong>
                  <ul className="mt-1.5 ml-4.5 space-y-1.5">
                    <li className="text-[0.82rem] text-[#6b7280]">
                      <b className="text-[#111827] font-semibold">modules format:</b> modules 1 → modules 11 (clearly labelled)
                    </li>
                    <li className="text-[0.82rem] text-[#6b7280]">
                      <b className="text-[#111827] font-semibold">Each modules includes:</b> Reading + Math + Science + English
                    </li>
                    <li className="text-[0.82rem] text-[#6b7280]">
                      <b className="text-[#111827] font-semibold">Purpose:</b> build familiarity with TEAS-style questions and section flow
                    </li>
                    <li className="text-[0.82rem] text-[#6b7280]">
                      <b className="text-[#111827] font-semibold">Best use:</b> start at modules 1 and progress, or target weak sections first
                    </li>
                  </ul>
                </div>

                <div className="rounded-[1.2rem] border border-dashed border-[rgba(148,163,184,0.85)] bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] flex flex-col gap-1.5">
                  <strong className="text-[0.9rem] text-[#111827] font-semibold">
                    Access & Delivery
                  </strong>
                  <ul className="mt-1.5 ml-4.5 space-y-1.5">
                    <li className="text-[0.82rem] text-[#6b7280]">
                      <b className="text-[#111827] font-semibold">Instant access</b> after checkout (Stan Store)
                    </li>
                    <li className="text-[0.82rem] text-[#6b7280]">
                      Delivered online (Study online)
                    </li>
                    <li className="text-[0.82rem] text-[#6b7280]">
                      Works on <b className="text-[#111827] font-semibold">phone + laptop</b>
                    </li>
                    <li className="text-[0.82rem] text-[#6b7280]">
                      <b className="text-[#111827] font-semibold">One-time purchase</b> (no subscription)
                    </li>
                  </ul>
                </div>

                <div className="rounded-[1.2rem] border border-dashed border-[rgba(148,163,184,0.85)] bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] flex flex-col gap-1.5">
                  <strong className="text-[0.9rem] text-[#111827] font-semibold">
                    Good to know
                  </strong>
                  <span className="text-[0.82rem] text-[#6b7280]">
                    Keep your link saved so you can return to the modules anytime during your prep.
                  </span>
                </div>
              </div>

              <p className="text-[0.78rem] text-[#6b7280] mt-2.75">
                NursingMocks is an independent educational resource. ATI TEAS® is a registered trademark of its owner and is not affiliated with this site.
              </p>
            </div>
          </div>
        </section>

        {/* 3) HOW IT WORKS */}
        <section className="py-8.75 sm:py-9" id="how">
          <div className="w-full">
            <div className="text-center mb-7">
              <div className="text-[0.78rem] uppercase tracking-[0.16em] text-[#9ca3af] mb-1.5">
                Checkout Flow
              </div>
              <h2 className="text-2xl tracking-[-0.03em] mb-1.5 text-[#020617]">
                How It Works
              </h2>
              <p className="text-[0.95rem] text-[#6b7280] max-w-[32rem] mx-auto">
                A simple purchase-to-access flow. You buy once, receive access, and study through the 11 modules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  1
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  Buy on Stan Store
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  Tap the purchase button and complete secure checkout through Stan Store.
                </p>
              </article>

              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  2
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  Get Instant Access
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  After payment, you receive access instructions immediately and can open the modules online.
                </p>
              </article>

              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  3
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  Study Through 11 modules
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  Use the modules to study with structure: start from modules 1 and progress forward,
                  or focus on weak areas section-by-section.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 4) WHY CHOOSE */}
        <section className="py-8.75 sm:py-9">
          <div className="w-full">
            <div className="text-center mb-7">
              <div className="text-[0.78rem] uppercase tracking-[0.16em] text-[#9ca3af] mb-1.5">
                Why This Bundle
              </div>
              <h2 className="text-2xl tracking-[-0.03em] mb-1.5 text-[#020617]">
                Why Choose Our Services
              </h2>
              <p className="text-[0.95rem] text-[#6b7280] max-w-[32rem] mx-auto">
                This is a premium, organized TEAS 7 prep bundle. The point is not "more PDFs".
                The point is buying a modules system that feels intentional and exam-focused.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  🎯
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  Structured Coverage
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  Each modules is built to feel like a real preparation session, not a random dump of questions.
                  That structure supports confidence and reduces "I don't know what to study" stress.
                </p>
              </article>

              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  🧠
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  Built to feel like what students see on exam day
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  Designed around common TEAS-style framing: reading evidence,
                  applied math, concept-based science, and clear grammar logic.
                </p>
              </article>

              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  📦
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  11 modules = Real Volume
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  You're buying a full bundle that supports repeat study across weeks:
                  review, practice, reinforce, and re-check.
                </p>
              </article>

              <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                  🔒
                </div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                  One-Time Purchase
                </h3>
                <p className="text-[0.86rem] text-[#6b7280]">
                  No monthly fees. Buy once and keep access to the study modules through your delivery link.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 5) PREPARE WITH CONFIDENCE */}
        <section className="py-8.75 sm:py-9">
          <div className="w-full">
            <div className="bg-[#f9fafb] rounded-[1.5rem] p-5.5 sm:p-6 border border-[rgba(209,213,219,0.8)]">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div className="max-w-full sm:max-w-[60%]">
                  <h2 className="text-[1.1rem] font-semibold mb-0.5 text-[#020617]">
                    Prepare With Confidence
                  </h2>
                  <p className="text-[0.87rem] text-[#6b7280]">
                    Many nursing students struggle because preparation is scattered: random questions, unclear focus,
                    and no structure. These modules help by giving you a repeatable system you can follow.
                  </p>
                </div>
                <div className="text-[0.78rem] px-3 py-1 rounded-full bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] whitespace-nowrap">
                  Confidence Builder
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="rounded-[1.2rem] border border-dashed border-[rgba(148,163,184,0.85)] bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] flex flex-col gap-1.5">
                  <strong className="text-[0.9rem] text-[#111827] font-semibold">
                    Study With Direction
                  </strong>
                  <span className="text-[0.82rem] text-[#6b7280]">
                    Stop guessing what to do next — move through a modules system.
                  </span>
                </div>
                <div className="rounded-[1.2rem] border border-dashed border-[rgba(148,163,184,0.85)] bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] flex flex-col gap-1.5">
                  <strong className="text-[0.9rem] text-[#111827] font-semibold">
                    Reduce Exam-Day Pressure
                  </strong>
                  <span className="text-[0.82rem] text-[#6b7280]">
                    Recognizing question patterns can make the experience feel more manageable.
                  </span>
                </div>
                <div className="rounded-[1.2rem] border border-dashed border-[rgba(148,163,184,0.85)] bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] flex flex-col gap-1.5">
                  <strong className="text-[0.9rem] text-[#111827] font-semibold">
                    Repeat & Reinforce
                  </strong>
                  <span className="text-[0.82rem] text-[#6b7280]">
                    Cycle through the modules across weeks to strengthen retention.
                  </span>
                </div>
              </div>

              <p className="text-[0.78rem] text-[#6b7280] mt-2.75">
                If your exam date is close: run modules 1–3 quickly to expose weak areas, then
                cycle modules 4–11 with deeper review. The goal is clarity and repetition.
              </p>
            </div>
          </div>
        </section>

        {/* 6) UPDATED FOR TEAS 7 */}
        <section className="py-8.75 sm:py-9">
          <div className="w-full">
            <div className="text-center mb-7">
              <div className="text-[0.78rem] uppercase tracking-[0.16em] text-[#9ca3af] mb-1.5">
                Bundle Details
              </div>
              <h2 className="text-2xl tracking-[-0.03em] mb-1.5 text-[#020617]">
                Updated for the Current TEAS 7 Test Format
              </h2>
              <p className="text-[0.95rem] text-[#6b7280] max-w-[32rem] mx-auto">
                This section answers the common questions nursing students ask:
                "What exactly is inside?" and "How do I use the modules effectively?"
              </p>
            </div>

            <div className="bg-[#f9fafb] rounded-[1.5rem] p-5.5 sm:p-6 border border-[rgba(209,213,219,0.8)]">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-start sm:items-center">
                <div className="max-w-full sm:max-w-[60%]">
                  <h3 className="text-[1.1rem] font-semibold mb-0.5 text-[#020617]">
                    What's Inside the 11 modules
                  </h3>
                  <p className="text-[0.87rem] text-[#6b7280]">
                    You get a complete preparation bundle covering the four TEAS 7 areas.
                    Use it as a full study plan or as a targeted reinforcement system.
                  </p>
                </div>
                <div className="text-[0.78rem] px-3 py-1 rounded-full bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe] whitespace-nowrap">
                  10-modules Bundle
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                    📖
                  </div>
                  <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                    Reading Coverage
                  </h3>
                  <p className="text-[0.86rem] text-[#6b7280]">
                    Main ideas, supporting details, inference, purpose/tone, and evidence-based selection
                    — aligned with TEAS-style passage logic.
                  </p>
                </article>

                <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                    ➗
                  </div>
                  <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                    Math Coverage
                  </h3>
                  <p className="text-[0.86rem] text-[#6b7280]">
                    Ratios, proportions, measurement/conversions, and applied word problems.
                    Built to feel like what students see on exam day.
                  </p>
                </article>

                <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                    🧬
                  </div>
                  <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                    Science Coverage
                  </h3>
                  <p className="text-[0.86rem] text-[#6b7280]">
                    Anatomy & physiology emphasis plus core scientific reasoning concepts.
                    Designed for understanding, not trivia memorization.
                  </p>
                </article>

                <article className="bg-white rounded-[1.2rem] p-4 border border-[rgba(209,213,219,0.9)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="w-8 h-8 rounded-[0.9rem] bg-[#eef2ff] flex items-center justify-center text-base text-[#4338ca] mb-2.5">
                    ✍️
                  </div>
                  <h3 className="text-[0.95rem] font-semibold mb-1 text-[#111827]">
                    English Coverage
                  </h3>
                  <p className="text-[0.86rem] text-[#6b7280]">
                    Grammar rules, punctuation, sentence clarity, and word usage patterns.
                    Designed to sharpen accuracy in common TEAS-style language questions.
                  </p>
                </article>
              </div>

              <p className="text-[0.78rem] text-[#6b7280] mt-2.75">
                After purchase, you'll receive access instructions and your access link.
              </p>
            </div>
          </div>
        </section>

        {/* 7) FAQ */}
        <section className="py-8.75 sm:py-9" id="faq">
          <div className="w-full">
            <div className="text-center mb-7">
              <div className="text-[0.78rem] uppercase tracking-[0.16em] text-[#9ca3af] mb-1.5">
                FAQ
              </div>
              <h2 className="text-2xl tracking-[-0.03em] mb-1.5 text-[#020617]">
                Frequently Asked Questions
              </h2>
              <p className="text-[0.95rem] text-[#6b7280] max-w-[32rem] mx-auto">
                Quick answers for nursing students before checkout.
              </p>
            </div>

            <div className="max-w-[800px] mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-[1rem] border border-[rgba(209,213,219,0.9)] bg-white mb-2.75 overflow-hidden ${
                    openFaq === index ? "open" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full border-none bg-transparent px-3.5 py-3 flex justify-between items-center text-left cursor-pointer text-[0.9rem] text-[#111827]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[18px] h-[18px] rounded-full border border-[rgba(148,163,184,0.8)] flex items-center justify-center text-[0.75rem] text-[#6b7280]">
                        Q
                      </div>
                      <span>{faq.question}</span>
                    </div>
                    <span
                      className={`text-base transition-transform duration-150 text-[#9ca3af] ${
                        openFaq === index ? "rotate-90 text-[#4f46e5]" : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      openFaq === index
                        ? "max-h-[240px] pb-3.5"
                        : "max-h-0 pb-0"
                    }`}
                  >
                    <div className="px-3.5 text-[0.86rem] text-[#6b7280]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8) FINAL CTA */}
        <section className="py-8.75 sm:py-9">
          <div className="w-full">
            <div className="bg-gradient-to-br from-[#eef2ff] via-white to-[#f9fafb] rounded-[2rem] border border-[rgba(209,213,219,0.9)] shadow-[0_16px_40px_rgba(15,23,42,0.06)] p-5.5 sm:p-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 items-center overflow-hidden relative">
              {/* Decorative cloud */}
              <div className="absolute top-auto bottom-[-40px] right-[-30px] w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#c7d2fe,#a855f7,#4f46e5)] opacity-18 blur-[0.5px]"></div>

              <div className="relative z-10">
                <div className="text-[1.15rem] font-bold text-[#020617] mb-0.5">
                  Ready to Start Your TEAS 7 Prep?
                </div>
                <div className="text-[0.9rem] text-[#4b5563]">
                  Get the full <strong>10-modules TEAS 7 bundle</strong> and study with a clear, repeatable system.
                  One-time purchase through Stan Store — instant access after checkout.
                </div>
              </div>
              <div className="flex gap-2.5 justify-start lg:justify-end flex-wrap relative z-10">
                <a
                  href="https://stan.store/YOURSTORELINK"
                  className="rounded-full px-5.5 py-3 text-[0.9rem] border-none bg-gradient-to-br from-[#4f46e5] to-[#a855f7] text-[#f9fafb] font-semibold no-underline shadow-[0_18px_40px_rgba(79,70,229,0.5)] inline-flex items-center gap-1.5 whitespace-nowrap hover:brightness-105 transition-all"
                  data-cta="buy"
                >
                  <span className="text-[1.05rem] translate-y-px">➤</span>
                  Buy All 11 modules - $99
                </a>
                <a
                  href="#preview"
                  className="rounded-full px-5 py-2.75 text-[0.9rem] border border-[rgba(148,163,184,0.7)] bg-[rgba(255,255,255,0.95)] text-[#111827] font-medium no-underline inline-flex items-center gap-1.25 whitespace-nowrap hover:bg-white transition-colors"
                  data-cta="preview"
                >
                  <span className="text-base opacity-75">👁</span>
                  Preview First
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Fixed CTA */}
      <div className="sm:hidden fixed left-0 right-0 bottom-0 z-[999] bg-[rgba(248,250,252,0.92)] backdrop-blur-[18px] border-t border-[rgba(148,163,184,0.22)] px-3.5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex gap-2.5 flex-nowrap">
            <a
              href="https://stan.store/YOURSTORELINK"
              className="rounded-full px-4 py-2.75 text-[0.9rem] border-none bg-gradient-to-br from-[#4f46e5] to-[#a855f7] text-[#f9fafb] font-semibold no-underline shadow-[0_18px_40px_rgba(79,70,229,0.5)] inline-flex items-center gap-1.5 whitespace-nowrap hover:brightness-105 transition-all"
              data-cta="buy"
            >
              <span className="text-[1.05rem] translate-y-px">➤</span>
              Buy All 11 modules - $99
            </a>
            <a
              href="#preview"
              className="rounded-full px-4 py-2.75 text-[0.9rem] border border-[rgba(148,163,184,0.7)] bg-[rgba(255,255,255,0.95)] text-[#111827] font-medium no-underline inline-flex items-center gap-1.25 whitespace-nowrap hover:bg-white transition-colors"
              data-cta="preview"
            >
              <span className="text-base opacity-75">👁</span>
              Preview First
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

