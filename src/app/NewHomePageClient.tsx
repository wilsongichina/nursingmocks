"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NewHeader from "@/components/layout/NewHeader";
import NewFooter from "@/components/layout/NewFooter";
import FloatingWhatsAppButton from "@/components/ui/FloatingWhatsAppButton";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What are you preparing for first?",
    options: [
      "ATI TEAS Entrance Exam",
      "HESI A2 Entrance Exam",
      "ATI or HESI Nursing Practice Tests (class tests)",
      "LPN or RN Nursing Exit Exam"
    ]
  },
  {
    id: 2,
    question: "How soon is your exam?",
    options: [
      "Less than 2 weeks",
      "2-4 weeks",
      "1-3 months",
      "Just exploring"
    ]
  },
  {
    id: 3,
    question: "What's your biggest challenge right now?",
    options: [
      "Understanding questions",
      "Managing time",
      "Weak subject areas",
      "Test anxiety"
    ]
  },
  {
    id: 4,
    question: "How do you prefer to study?",
    options: [
      "Full-Length Practice Tests",
      "Short skill-based quizzes",
      "Review explanations only",
      "A mix of everything"
    ]
  }
];

export default function NewHomePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [_answers, setAnswers] = useState<Record<number, string>>({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const router = useRouter();
  const { currentUser } = useAuth();

  // Redirect to signup if quiz is complete and user is not logged in
  useEffect(() => {
    if (isQuizComplete && !currentUser) {
      router.push("/register");
    }
  }, [isQuizComplete, currentUser, router]);

  const handleOptionSelect = (option: string) => {
    const questionId = QUIZ_QUESTIONS[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: option }));

    // Move to next question
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      setIsQuizComplete(true);
    }
  };

  const handleResetQuiz = () => {
    setIsQuizComplete(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9fafb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Inter',sans-serif]">
      <NewHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] border-b border-[#e5e7eb]">
        <main className="public-page-container">
          <section className="grid grid-cols-1 items-start gap-6 py-9 pb-8 sm:py-[52px] sm:pb-[40px] lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            <div>
              <div className="text-[13px] uppercase tracking-[0.16em] text-[#6d28d9] mb-[10px] flex gap-[10px] items-center flex-wrap">
                <span className="px-[10px] py-1 rounded-full border border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]">
                  ATI TEAS, HESI A2, Nursing Practice Tests
                </span>
                <span>From Entrance to Exit Exams</span>
              </div>
              <h1 className="text-[clamp(34px,4.2vw,44px)] leading-[1.08] mb-3 text-[#111827] font-bold">
                Get Organized for Your <span className="text-[#4f46e5]">ATI TEAS</span>, HESI A2, Nursing Practice Tests &amp; Exit Exams.
              </h1>
              <p className="text-[15px] text-[#6b7280] max-w-[580px] mb-[22px]">
                NursingMocks gives you realistic TEAS and HESI questions, structured Nursing Practice Tests for LPN &amp; RN,
                and Nursing Exit Exam Practice so you can move through nursing school with one prep hub.
              </p>
              <div className="flex flex-wrap gap-[10px] mb-4">
                <Link
                  href="#exam-modules"
                  className="rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center gap-1.5"
                >
                  Explore Nursing Exam Modules
                </Link>
              </div>
              <div className="text-[13px] text-[#6b7280]">
                <strong className="text-[#111827]">We Cover:</strong> Nursing Practice Tests (LPN &amp; RN, ATI &amp; HESI), Nursing Exit Exams, Nursing Entrance Exams (ATI TEAS &amp; HESI A2)
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[430px] bg-white rounded-[22px] p-[18px] pb-4 shadow-[0_18px_45px_rgba(15,23,42,0.09)] border border-[#e5e7eb] flex flex-col gap-[10px]">
                <div className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full bg-[#ecfdf3] border border-[#bbf7d0] text-[11px] text-[#166534] uppercase tracking-[0.16em]">
                  3-Minute Quiz
                </div>
                <h3 className="text-[16px] mt-0.5 text-[#111827]" style={{ fontWeight: 600 }}>Find Your Best NursingMocks Path</h3>
                <p className="text-[13px] text-[#6b7280] -mt-1">
                  Answer a few quick questions and we'll suggest where to start: TEAS, HESI A2, Nursing Practice Tests, or Exit Exams.
                </p>

                {!isQuizComplete && (
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">
                      Question {currentQuestionIndex + 1} Of {totalQuestions}
                    </div>
                    <div className="text-[14px] text-[#111827] mb-2" style={{ fontWeight: 500 }}>
                      {currentQuestion.question}
                    </div>
                    <div className="flex flex-col gap-1.5 mb-1.5">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(option)}
                          className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-[10px] py-[7px] text-[13px] text-left cursor-pointer transition-all text-[#111827] hover:border-[#6366f1] hover:bg-[#eef2ff] hover:text-[#111827]"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#6b7280]">
                      <div className="flex gap-1 items-center">
                        {QUIZ_QUESTIONS.map((_, index) => (
                          <div
                            key={index}
                            className={`w-[7px] h-[7px] rounded-full ${
                              index <= currentQuestionIndex
                                ? "bg-[#4f46e5]"
                                : "bg-[#e5e7eb]"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span>~3 minutes total</span>
                    </div>
                  </div>
                )}

                {isQuizComplete && (
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">
                      Quiz Complete!
                    </div>
                    <div className="text-[14px] text-[#111827] mb-2" style={{ fontWeight: 500 }}>
                      Thank you for completing the quiz!
                    </div>
                    <p className="text-[13px] text-[#6b7280] mb-3">
                      Based on your answers, we recommend exploring our comprehensive study materials for your nursing journey.
                    </p>
                    <button
                      onClick={handleResetQuiz}
                      className="mt-2 w-full justify-center rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      Take Quiz Again
                    </button>
                    <Link
                      href="#exam-modules"
                      className="mt-2 w-full justify-center rounded-full px-4 py-[9px] text-[14px] border border-[#6366f1] bg-[#6366f1] text-white hover:bg-[#4f46e5] hover:border-[#4f46e5] transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      Explore Study Modules
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-[#e5e7ff] via-[#f9fafb] to-[#f9fafb] border-b border-[#e5e7eb]" style={{ background: 'radial-gradient(circle at top left, #e5e7ff 0, #f9fafb 40%, #f9fafb 100%)' }}>
        <section className="public-page-container py-8 pb-9">
          <div className="text-center mb-4">
            <h2 className="text-[22px] mb-1 text-[#111827]">Proven Results For Real Nursing Students</h2>
            <p className="text-[13px] text-[#6b7280] max-w-[640px] mx-auto">
              NursingMocks is built to support you across every ATI &amp; HESI stage - from ATI TEAS or HESI A2, through ATI/HESI Nursing Practice Tests,
              all the way to Nursing Exit Exams for LPN and RN programs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-[18px]">
            <article className="relative bg-gradient-to-br from-white to-[#eef2ff] rounded-[18px] p-3.5 pb-3 border border-[#d9e0ff] shadow-[0_14px_30px_rgba(129,140,248,0.16)] overflow-hidden">
              <div className="absolute -top-[22px] -right-[22px] w-20 h-20 rounded-full bg-gradient-radial from-[#c7d2fe] to-transparent opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, #c7d2fe 0, transparent 60%)' }}></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Practice questions</div>
                <div className="text-[18px] mt-1 text-[#111827]" style={{ fontWeight: 600 }}>17,000+ items</div>
                <div className="text-xs text-[#6b7280] mt-1">Nursing-style TEAS, HESI, Nursing Practice Tests &amp; exit exam questions.</div>
              </div>
            </article>
            <article className="relative bg-gradient-to-br from-white to-[#eef2ff] rounded-[18px] p-3.5 pb-3 border border-[#d9e0ff] shadow-[0_14px_30px_rgba(129,140,248,0.16)] overflow-hidden">
              <div className="absolute -top-[22px] -right-[22px] w-20 h-20 rounded-full bg-gradient-radial from-[#c7d2fe] to-transparent opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, #c7d2fe 0, transparent 60%)' }}></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Exam types</div>
                <div className="text-[18px] mt-1 text-[#111827]" style={{ fontWeight: 600 }}>3 major paths</div>
                <div className="text-xs text-[#6b7280] mt-1">Nursing Practice Tests, Nursing Exit Exams, Nursing Entrance Exams.</div>
              </div>
            </article>
            <article className="relative bg-gradient-to-br from-white to-[#eef2ff] rounded-[18px] p-3.5 pb-3 border border-[#d9e0ff] shadow-[0_14px_30px_rgba(129,140,248,0.16)] overflow-hidden">
              <div className="absolute -top-[22px] -right-[22px] w-20 h-20 rounded-full bg-gradient-radial from-[#c7d2fe] to-transparent opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, #c7d2fe 0, transparent 60%)' }}></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Tracks</div>
                <div className="text-[18px] mt-1 text-[#111827]" style={{ fontWeight: 600 }}>LPN &amp; RN</div>
                <div className="text-xs text-[#6b7280] mt-1">ATI &amp; HESI coverage for both pathways.</div>
              </div>
            </article>
            <article className="relative bg-gradient-to-br from-white to-[#eef2ff] rounded-[18px] p-3.5 pb-3 border border-[#d9e0ff] shadow-[0_14px_30px_rgba(129,140,248,0.16)] overflow-hidden">
              <div className="absolute -top-[22px] -right-[22px] w-20 h-20 rounded-full bg-gradient-radial from-[#c7d2fe] to-transparent opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, #c7d2fe 0, transparent 60%)' }}></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Score growth</div>
                <div className="text-[18px] mt-1 text-[#111827]" style={{ fontWeight: 600 }}>+12-18 points</div>
                <div className="text-xs text-[#6b7280] mt-1">Typical TEAS score gain after consistent practice.</div>
              </div>
            </article>
          </div>
        </section>
      </div>

      {/* Main Content - Programs Section */}
      <main className="public-page-container">
        <section id="programs" className="mt-2 rounded-3xl px-4 py-[34px] sm:px-5 sm:pt-[38px]" style={{ background: 'radial-gradient(circle at top left, #eef2ff 0, #ffffff 60%, #f9fafb 100%)', boxShadow: '0 16px 40px rgba(148, 163, 253, 0.18)' }}>
          <div className="mb-[18px] flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-[3px]">
              <span className="text-[12px] uppercase tracking-[0.14em] text-[#a5b4fc]" style={{ fontWeight: 500 }}>Programs</span>
              <h2 className="text-[22px] text-[#111827]">Nursing Exams We Cover</h2>
            </div>
            <p className="text-[13px] text-[#6b7280] max-w-[440px]">
              Choose where you are in the nursing journey. We organize content into Nursing Practice Tests, nursing exit exams, and
              Nursing Entrance Exams (ATI TEAS &amp; HESI A2) so you always know what to focus on.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Program Card 1 */}
            <article className="relative bg-white rounded-[20px] border border-[#dfe3ff] p-4 pb-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] flex flex-col gap-[10px] overflow-hidden">
              <div className="absolute inset-0 rounded-[20px] border-l-4 border-[#6366f1] opacity-90 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#6366f1]">Nursing Practice Tests</div>
                <h3 className="text-[17px] text-[#111827]" style={{ fontWeight: 600 }}>LPN &amp; RN Question Banks</h3>
                <p className="text-[13px] text-[#6b7280]">
                  Practice with module-tagged ATI &amp; HESI questions that match your classroom quizzes and proctored tests.
                </p>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">LPN</div>
                    <div className="program-links">
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">ATI - LPN Nursing Practice Tests</strong>
                        <small className="text-[11px] text-[#6b7280]">Fundamentals, med-surg, pharm &amp; more</small>
                      </Link>
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">HESI - LPN Nursing Practice Tests</strong>
                        <small className="text-[11px] text-[#6b7280]">Core modules &amp; practice sets</small>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">RN</div>
                    <div className="program-links">
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">ATI - RN Nursing Practice Tests</strong>
                        <small className="text-[11px] text-[#6b7280]">Predictor-style question groups</small>
                      </Link>
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">HESI - RN Nursing Practice Tests</strong>
                        <small className="text-[11px] text-[#6b7280]">RN modules &amp; review sets</small>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-[12px] text-[#6b7280] gap-2 flex-wrap">
                  <span><strong className="text-[#111827]">Use this for:</strong> weekly tests &amp; unit exams</span>
                  <Link href="/nursing-test-bank" className="rounded-full px-2.5 py-1 text-[11px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
                    Browse all Nursing Practice Tests
                  </Link>
                </div>
              </div>
            </article>

            {/* Program Card 2 */}
            <article className="relative bg-white rounded-[20px] border border-[#dfe3ff] p-4 pb-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] flex flex-col gap-2.5 overflow-hidden">
              <div className="absolute inset-0 rounded-[20px] border-l-4 border-[#6366f1] opacity-90 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#6366f1]">Nursing Exit Exams</div>
                <h3 className="text-[17px] text-[#111827]" style={{ fontWeight: 600 }}>Capstone Exam Practice</h3>
                <p className="text-[13px] text-[#6b7280]">
                  Use RN and LPN exit-exam style tests to rehearse timing, question mix, and difficulty before your final.
                </p>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">LPN</div>
                    <div className="program-links">
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">ATI - LPN Exit Exams</strong>
                        <small className="text-[11px] text-[#6b7280]">End-of-program blueprints</small>
                      </Link>
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">HESI - LPN Exit Exams</strong>
                        <small className="text-[11px] text-[#6b7280]">Exit-style mock exams</small>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">RN</div>
                    <div className="program-links">
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">ATI - RN Exit Exams</strong>
                        <small className="text-[11px] text-[#6b7280]">Comprehensive predictor-style sets</small>
                      </Link>
                      <Link href="#" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">HESI - RN Exit Exams</strong>
                        <small className="text-[11px] text-[#6b7280]">Exit readiness practice</small>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-[#6b7280] gap-2 flex-wrap">
                  <span><strong className="text-[#111827]">Use this for:</strong> final semester &amp; graduation</span>
                  <Link href="/nursing-exit-exams" className="rounded-full px-2.5 py-1 text-[11px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
                    View Nursing Exit Exam Prep
                  </Link>
                </div>
              </div>
            </article>

            {/* Program Card 3 */}
            <article className="relative bg-white rounded-[20px] border border-[#dfe3ff] p-4 pb-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] flex flex-col gap-2.5 overflow-hidden">
              <div className="absolute inset-0 rounded-[20px] border-l-4 border-[#6366f1] opacity-90 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#6366f1]">Nursing Entrance Exams</div>
                <h3 className="text-[17px] text-[#111827]" style={{ fontWeight: 600 }}>Get Into Your Nursing Program</h3>
                <p className="text-[13px] text-[#6b7280]">
                  Focused practice for ATI TEAS and HESI A2, with subject breakdowns and realistic question styles.
                </p>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">ATI</div>
                    <div className="program-links">
                      <Link href="/ati-teas-practice-test" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">ATI TEAS</strong>
                        <small className="text-[11px] text-[#6b7280]">Reading, math, science, English</small>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">HESI A2</div>
                    <div className="program-links">
                      <Link href="/hesi-a2-practice-test" className="flex flex-col gap-0.5 p-1.5 mb-1.5 rounded-xl bg-[#f3f4ff] border border-[#e0e7ff] text-[13px] text-[#3730a3] hover:bg-[#eef2ff] hover:border-[#6366f1] hover:-translate-y-[1px] transition-all">
                        <strong className="font-semibold">HESI A2</strong>
                        <small className="text-[11px] text-[#6b7280]">Vocab, math, A&amp;P, grammar, biology</small>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-[#6b7280] gap-2 flex-wrap">
                  <span><strong className="text-[#111827]">Use this for:</strong> nursing school admission</span>
                  <Link href="/nursing-entrance-exams" className="rounded-full px-2.5 py-1 text-[11px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center">
                    Start Nursing Entrance Exam Prep
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-[#f3f4ff] to-[#f9fafb] border-t border-b border-[#e5e7eb] mt-8">
          <section className="py-[34px]">
            <div className="mb-4">
              <div className="flex flex-col gap-[3px]">
                <span className="text-[12px] uppercase tracking-[0.14em] text-[#a5b4fc]" style={{ fontWeight: 500 }}>Simple process</span>
                <h2 className="text-[22px] text-[#111827]">How NursingMocks Works</h2>
              </div>
              <p className="text-[13px] text-[#6b7280] max-w-[440px] mt-2">
                Instead of juggling different TEAS, HESI, Nursing Practice Tests, and Nursing Exit Exam resources, you move through one flow that keeps everything connected.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
              {[
                { num: "1", title: "Pick Your Path", text: "Start with where you are: ATI TEAS, HESI A2, Nursing Practice Tests (LPN/RN, ATI/HESI), or Nursing Exit Exams." },
                { num: "2", title: "Take a Diagnostic", text: "Use a TEAS or HESI-style test to see your baseline and identify which subjects and skills need attention." },
                { num: "3", title: "Practice with Feedback", text: "Work through Nursing Practice Tests and Entrance/Exit practice with explanations so you know why answers are right or wrong." },
                { num: "4", title: "Simulate the Real Exam", text: "Finish with full-length exams that mimic the real timing and pressure for TEAS, HESI A2, or Nursing Exit Exams." },
              ].map((step) => (
                <article key={step.num} className="bg-[#f9fafb] rounded-[14px] p-3.5 pb-3 border border-[#e5e7eb] text-[13px]">
                  <div className="w-6 h-6 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[12px] mb-1.5 text-[#4b5563] bg-white">
                    {step.num}
                  </div>
                  <div className="mb-1 text-[13px] text-[#111827]" style={{ fontWeight: 600 }}>{step.title}</div>
                  <p className="text-[12px] text-[#6b7280]">{step.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Why Students Choose Section */}
        <section className="pt-10">
          <div className="mb-[18px] flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-[3px]">
              <span className="text-[12px] uppercase tracking-[0.14em] text-[#a5b4fc]" style={{ fontWeight: 500 }}>What you get</span>
              <h2 className="text-[22px] text-[#111827]">Why Students Choose NursingMocks</h2>
            </div>
            <p className="text-[13px] text-[#6b7280] max-w-[440px]">
              These are the concrete advantages NursingMocks gives you compared to generic TEAS books or scattered question screenshots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] mt-2">
            {[
              {
                icon: "📚",
                title: "High-quality nursing questions",
                text: "Every question is written to feel like ATI or HESI: nursing-focused stems, realistic distractors, and exam-level difficulty.",
                list: [
                  "Modeled on ATI TEAS & HESI A2 blueprints and Nursing Practice Tests topics.",
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
                  "Shift between Nursing Entrance Exams, Nursing Practice Tests, and Nursing Exit Exams without losing your focus areas.",
                  "Create short daily blocks (20-40 minutes) that target one clear goal at a time.",
                ],
              },
            ].map((item, idx) => (
              <article key={idx} className="bg-white rounded-[20px] p-4 pb-3.5 border border-[#e5e7eb] text-[13px] shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center mb-2 text-[16px] text-[#4f46e5]">
                  {item.icon}
                </div>
                <div className="mb-1 text-[#111827]" style={{ fontWeight: 600 }}>{item.title}</div>
                <p className="text-[#4b5563] text-[13px] mb-1.5">{item.text}</p>
                <ul className="m-0 pl-4 text-[#6b7280] text-[12px]">
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
          <div>
            <div className="mb-3.5 flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-1 text-[22px]">
                <span className="text-[12px] uppercase tracking-[0.14em] text-[#a5b4fc]" style={{ fontWeight: 500 }}>Exam experiences</span>
                <h2 className="text-[#111827]">Start With The Module That Matches You Right Now</h2>
              </div>
              <p className="text-[13px] text-[#6b7280] max-w-[420px]">
                Nursing Entrance Exams, Nursing Practice Tests, and Nursing Exit Exams all live under one roof.
                Choose where you are today - you can always move between modules later.
              </p>
            </div>

            {/* Entrance Exams Group */}
            <div className="mt-[18px]">
              <h3 className="text-[14px] uppercase tracking-[0.16em] text-[#9ca3af] mb-2.5 font-medium">
                Nursing Entrance Exams, ATI TEAS &amp; HESI A2
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ATI TEAS Card */}
                <article className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#86efac] bg-[#ecfdf3] text-[#166534] text-[11px] mb-2">
                      Free to start, no credit card
                    </div>
                    <h2 className="text-[18px] mb-1.5 text-[#111827]" style={{ fontWeight: 600 }}>ATI TEAS 7 - Full-Length Practice Test</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Take a TEAS practice exam that feels like the real thing: timing, subject breakdown,
                      and nursing-style questions. Use it as your baseline before you build a TEAS study plan.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Reading, 45 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Math, 38 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Science, 50 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">English, 37 questions</span>
                    </div>
                    <Link
                      href="/ati-teas/practice-test-free"
                      className="mb-1 rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Start Free ATI TEAS Practice Test
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      Your score report tells you whether to focus on TEAS reading, math, science, or English first.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-[12px] shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-[12px]">
                      <span>Score projection after practice</span>
                      <span className="text-[11px]">Target: 78%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[72%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-[12px]">
                      <span>Strength: <strong>English &amp; usage</strong></span>
                      <span className="text-[11px]">Needs work: <strong>science - A&amp;P</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Main idea &amp; detail</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Ratios &amp; proportions</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Body systems</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Punctuation &amp; grammar</span>
                    </div>
                  </aside>
                </article>

                {/* HESI A2 Card */}
                <article className="bg-gradient-to-br from-[#eff6ff] to-[#eef2ff] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#fed7aa] bg-[#fffbeb] text-[#9a3412] text-[11px] mb-2">
                      Entrance Exam, HESI A2
                    </div>
                    <h2 className="text-[18px] mb-1.5 text-[#111827]" style={{ fontWeight: 600 }}>HESI A2 - Full-Length Entrance Exam</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Practice the HESI A2 with questions that mirror the real exam: vocab-heavy reading,
                      straightforward math, and A&amp;P basics built for pre-nursing students.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Vocabulary, 50 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Math, 45 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Reading, 47 questions</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">A&amp;P / biology, 40 questions</span>
                    </div>
                    <Link
                      href="/hesi-a2/diagnostic-practice-test"
                      className="mb-1 rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Start HESI A2 Diagnostic
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      See which HESI sections (vocab, math, reading, A&amp;P, biology) are most likely to hold you back.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-[12px] shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-[12px]">
                      <span>Estimated readiness</span>
                      <span className="text-[11px]">Target: 75%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[70%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-[12px]">
                      <span>Strong: <strong>math</strong></span>
                      <span className="text-[11px]">Focus: <strong>vocabulary</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Prefixes &amp; suffixes</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Word relationships</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Fractions &amp; ratios</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Reading details</span>
                    </div>
                  </aside>
                </article>
              </div>
            </div>

            {/* Exit Exams Group */}
            <div className="mt-[18px]">
              <h3 className="text-[14px] uppercase tracking-[0.16em] text-[#9ca3af] mb-2.5 font-medium">
                Nursing Exit Exams, ATI Predictor &amp; HESI Exit
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ATI Predictor Card */}
                <article className="bg-gradient-to-br from-[#fdf2ff] to-[#fef9c3] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#fed7aa] bg-[#fffbeb] text-[#9a3412] text-[11px] mb-2">
                      RN &amp; LPN
                    </div>
                    <h2 className="text-[18px] mb-1.5 text-[#111827]" style={{ fontWeight: 600 }}>ATI Comprehensive Predictor-Style Practice</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Run full-length ATI predictor simulations so you can rehearse pacing, question mix, and stamina
                      before the real end-of-program exam.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e5e7eb] text-[#111827]">RN Predictor Practice Tests</span>
                      <span className="px-2 py-1 rounded-full bg-[#e5e7eb] text-[#111827]">LPN Predictor Practice Tests</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">Mixed-Content Nursing Exams</span>
                    </div>
                    <Link
                      href="/nursing-exit-exams/ati-comprehensive-predictor-practice-tests"
                      className="mb-1 rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Practice ATI Predictor Exams
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      Use predictor-style reports to see where med-surg, pharm, or fundamentals are pulling your score down.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-[12px] shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-[12px]">
                      <span>Exit readiness trend</span>
                      <span className="text-[11px]">Goal: consistent 78%+</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[75%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-[12px]">
                      <span>Stronger: <strong>fundamentals</strong></span>
                      <span className="text-[11px]">Focus: <strong>pharmacology</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Safety &amp; infection control</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Dosage calculations</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Prioritization</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Delegation</span>
                    </div>
                  </aside>
                </article>

                {/* HESI Exit Card */}
                <article className="bg-gradient-to-br from-[#eef2ff] to-[#fdf2ff] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#86efac] bg-[#ecfdf3] text-[#166534] text-[11px] mb-2">
                      Capstone, HESI Exit
                    </div>
                    <h2 className="text-[18px] mb-1.5 text-[#111827]" style={{ fontWeight: 600 }}>HESI Exit Exam-Style Practice</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Prepare for your HESI Exit Exam with NCLEX-style items grouped into realistic practice tests
                      for both LPN and RN programs.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">RN Exit Practice Tests</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">LPN Exit Practice Tests</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">NCLEX-Style Item Formats</span>
                    </div>
                    <Link
                      href="/nursing-exit-exams/hesi-exit-practice-tests"
                      className="mb-1 rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Start HESI Exit Practice
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      Get used to long stems, priority questions, and the pressure of a single capstone score.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-[12px] shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-[12px]">
                      <span>Exit benchmark progress</span>
                      <span className="text-[11px]">Goal: &gt; 900 HESI score</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[75%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-[12px]">
                      <span>Better: <strong>psych &amp; OB</strong></span>
                      <span className="text-[11px]">Focus: <strong>med-surg</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Priority &amp; delegation</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Pharm &amp; side effects</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Fluid &amp; electrolytes</span>
                    </div>
                  </aside>
                </article>
              </div>
            </div>

            {/* Nursing Practice Tests Group */}
            <div className="mt-[18px]">
              <h3 className="text-[14px] uppercase tracking-[0.16em] text-[#9ca3af] mb-2.5 font-medium">
                Nursing Practice Tests, ATI &amp; HESI, RN &amp; LPN
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <article className="bg-gradient-to-br from-[#ecfdf3] to-[#eef2ff] rounded-3xl p-[18px] border border-[#e0e7ff] grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px] items-center shadow-[0_18px_40px_rgba(129,140,248,0.22)]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#86efac] bg-[#ecfdf3] text-[#166534] text-[11px] mb-2">
                      Class tests &amp; proctored exams
                    </div>
                    <h2 className="text-[18px] mb-1.5 text-[#111827]" style={{ fontWeight: 600 }}>RN &amp; LPN Nursing Practice Tests</h2>
                    <p className="text-[13px] text-[#4b5563] mb-2.5 max-w-[520px]">
                      Drill ATI and HESI question banks sorted by program (RN/LPN) and by module, so your practice actually
                      matches the fundamentals, med-surg, pharm and maternal-newborn tests you see in class.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2.5">
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">RN, ATI fundamentals, med-surg, pharm</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">RN, HESI fundamentals, med-surg, psych</span>
                      <span className="px-2 py-1 rounded-full bg-[#e0e7ff] text-[#312e81]">LPN, ATI/HESI core modules</span>
                    </div>
                    <Link
                      href="/nursing-test-bank"
                      className="mb-1 rounded-full px-4 py-[9px] text-[14px] border border-[#d1d5db] bg-transparent text-[#374151] hover:bg-[#111827] hover:border-[#111827] hover:text-[#f9fafb] transition-all inline-flex items-center justify-center"
                    >
                      Browse all Nursing Practice Tests
                    </Link>
                    <div className="text-[11px] text-[#4b5563] mt-1">
                      Pick your track (RN or LPN), then choose ATI or HESI modules: fundamentals, med-surg, pharmacology,
                      maternal-newborn, pediatrics, mental health and more.
                    </div>
                  </div>
                  <aside className="bg-white rounded-[18px] p-3.5 border border-[#e0e7ff] text-[12px] shadow-[0_10px_30px_rgba(129,140,248,0.18)]">
                    <div className="flex justify-between mb-1.5 text-[#4b5563] text-[12px]">
                      <span>Module coverage</span>
                      <span className="text-[11px]">12+ core topics</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden mb-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#8b5cf6] w-[65%]"></div>
                    </div>
                    <div className="flex justify-between mb-1 text-[#4b5563] text-[12px]">
                      <span>Best for: <strong>weekly quizzes</strong></span>
                      <span className="text-[11px]">Also: <strong>proctored ATI/HESI</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6b7280]">
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Fundamentals</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Med-surg</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Pharmacology</span>
                      <span className="px-[7px] py-[3px] rounded-full border border-[#e5e7eb] bg-[#f9fafb]">Maternal-newborn</span>
                    </div>
                  </aside>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section pt-10 pb-10 bg-[#f9fafb] border-t border-b border-[#e5e7eb] mt-10">
          <div className="max-w-[920px] mx-auto w-[94%]">
            <div className="text-center mb-[26px]">
              <h2 className="m-0 mb-2.5 text-[clamp(28px,4vw,34px)] text-[#111827]" style={{ fontWeight: 700 }}>
                ATI TEAS, HESI A2, Nursing Practice Tests &amp; Exit Questions - In One Place
              </h2>
              <p className="m-0 text-[15px] leading-relaxed text-[#6b7280] max-w-[640px] mx-auto">
                NursingMocks is designed for busy nursing students who want less guessing and more clarity.
                These answers cover the most common questions we hear from ATI TEAS, HESI A2, LPN/RN Nursing Practice Tests, and nursing exit exam students.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <details className="bg-white rounded-2xl border border-[#e5e7eb] p-3.5 px-5 shadow-[0_8px_18px_rgba(15,23,42,0.03)] [&[open]_summary_>_div:last-child]:rotate-180 [&[open]_summary_>_div:last-child]:bg-[#111827] [&[open]_summary_>_div:last-child]:text-[#f9fafb] [&[open]_summary_>_div:last-child]:border-[#111827]">
                <summary className="cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden">
                  <div className="faq-question-text text-[15px] font-semibold text-[#111827] flex-1">
                    Do I Get Access To All Exams Or Just One Module?
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#d1d5db] flex items-center justify-center text-[12px] text-[#6b7280] flex-shrink-0 transition-all duration-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="mt-3 pt-2 border-t border-[#e5e7eb] text-[14px] leading-[1.7] text-[#6b7280]">
                  <p className="m-0 mb-2.5">
                    It depends on the plan you choose. Some students only need ATI TEAS or HESI A2 right now,
                    while others want Nursing Practice Tests and Nursing Exit Exam support as well. We offer single-module options
                    (for example, TEAS-only) and broader access plans that cover multiple exam types.
                  </p>
                  <p className="m-0">
                    If you are not sure which option fits, start with Nursing Entrance Exam Prep (TEAS or HESI A2),
                    then upgrade later when you move into Nursing Practice Tests or Nursing Exit Exams.
                  </p>
                </div>
              </details>

              <details className="bg-white rounded-2xl border border-[#e5e7eb] p-3.5 px-5 shadow-[0_8px_18px_rgba(15,23,42,0.03)] [&[open]_summary_>_div:last-child]:rotate-180 [&[open]_summary_>_div:last-child]:bg-[#111827] [&[open]_summary_>_div:last-child]:text-[#f9fafb] [&[open]_summary_>_div:last-child]:border-[#111827]">
                <summary className="cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden">
                  <div className="faq-question-text text-[15px] font-semibold text-[#111827] flex-1">
                    How Close Are These Questions To ATI &amp; HESI Exams?
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#d1d5db] flex items-center justify-center text-[12px] text-[#6b7280] flex-shrink-0 transition-all duration-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="mt-3 pt-2 border-t border-[#e5e7eb] text-[14px] leading-[1.7] text-[#6b7280]">
                  <p className="m-0 mb-2.5">
                    Our questions are written to mirror ATI TEAS, HESI A2, ATI Nursing Practice Tests, HESI specialty exams,
                    and common patterns on Nursing Exit Exams. We study official blueprints, review educator guides,
                    and listen to feedback from nursing students who sit for these exams.
                  </p>
                  <p className="m-0">
                    While we are not affiliated with ATI or HESI, our goal is for you to feel like you "have seen this style before"
                    when you sit down in front of the real exam.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <div>
          <div className="my-[34px] bg-[#111827] rounded-[22px] p-4 px-[18px] pb-3.5 text-[#f9fafb] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 text-[13px]">
            <div>
              <strong className="text-[16px]">Ready to Make Your Nursing Exams Less Chaotic?</strong>
              <div>Pick your first module - TEAS, HESI A2, Nursing Practice Tests, or Nursing Exit Exams - and start practicing in under five minutes.</div>
            </div>
            <Link href="/pricing" className="rounded-full px-4 py-[9px] text-[14px] border border-[#f9fafb] bg-[#f9fafb] text-[#111827] hover:brightness-105 transition-all inline-flex items-center justify-center">
              View Plans &amp; Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <NewFooter />

      {/* Floating buttons */}
      <FloatingWhatsAppButton />
    </div>
  );
}

