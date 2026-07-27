"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole, Stethoscope } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  completeUserOnboarding,
  subscribeUserDocument,
  updateUserOnboardingProgress,
} from "@/lib/user-document-firestore";
import {
  ONBOARDING_EXAM_TYPES,
  hasCompletedOnboarding,
  isOnboardingExamType,
  onboardingExamLabel,
  onboardingStepForProfile,
  type OnboardingExamType,
} from "@/lib/onboarding";
import type { UserDocument } from "@/types/user-document";

type Step = 1 | 2 | 3;

const ONBOARDING_STEPS = [
  { step: 1 as const, label: "Exam" },
  { step: 2 as const, label: "Date" },
  { step: 3 as const, label: "Confirm" },
];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

const ONBOARDING_COMPLETE_PATH = "/dashboard/my-exams";

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [docLoading, setDocLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [selectedExam, setSelectedExam] = useState<OnboardingExamType | "">("");
  const [examDate, setExamDate] = useState("");
  const [notScheduled, setNotScheduled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const examDateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (!currentUser) return;
    setDocLoading(true);
    let cancelled = false;

    const completeRegistrationIfNeeded = async () => {
      try {
        const token = await currentUser.getIdToken();
        await fetch("/api/users/complete-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fullName: currentUser.displayName || currentUser.email?.split("@")[0] || "" }),
        });
      } catch (completionError) {
        console.warn("Registration completion check failed", completionError);
      }
    };

    const unsubscribe = subscribeUserDocument(
      currentUser.uid,
      (doc) => {
        if (cancelled) return;
        if (!doc) {
          void completeRegistrationIfNeeded();
          return;
        }
        setUserDoc(doc);
        setDocLoading(false);
      },
      () => {
        if (!cancelled) setDocLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!userDoc) return;
    if (hasCompletedOnboarding(userDoc)) {
      router.replace(ONBOARDING_COMPLETE_PATH);
      return;
    }

    const profile = userDoc.profile;
    const savedExam = profile?.primary_exam_type;
    setStep(onboardingStepForProfile(userDoc));
    setSelectedExam(isOnboardingExamType(savedExam) ? savedExam : "");
    setExamDate(profile?.exam_date || "");
    setNotScheduled(profile?.exam_not_scheduled === true);
  }, [router, userDoc]);

  const progress = useMemo(() => {
    return Math.round((step / 3) * 100);
  }, [step]);

  const selectedExamDetails = useMemo(() => {
    return ONBOARDING_EXAM_TYPES.find((exam) => exam.value === selectedExam) ?? null;
  }, [selectedExam]);

  const canContinue =
    step === 1
      ? Boolean(selectedExam)
      : step === 2
        ? Boolean(examDate || notScheduled)
        : Boolean(selectedExam && (examDate || notScheduled));

  async function goToStep(nextStep: Step) {
    if (!currentUser) return;
    setError("");
    setSaving(true);
    try {
      await updateUserOnboardingProgress(currentUser.uid, {
        step: nextStep,
        primaryExamType: selectedExam || null,
        examDate: notScheduled ? null : examDate || null,
        examNotScheduled: notScheduled,
      });
      setStep(nextStep);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save onboarding progress.");
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (!canContinue) {
      setError(step === 1 ? "Select an exam type before continuing." : "Choose an exam date or select not scheduled.");
      return;
    }
    if (step < 3) {
      await goToStep((step + 1) as Step);
    }
  }

  async function handleStartStudying() {
    if (!currentUser || !selectedExam) return;
    if (!isOnboardingExamType(selectedExam)) {
      setError("Select a valid exam type.");
      return;
    }
    if (!notScheduled && !examDate) {
      setError("Choose an exam date or select not scheduled.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await completeUserOnboarding(currentUser.uid, {
        primaryExamType: selectedExam,
        examDate: notScheduled ? null : examDate,
        examNotScheduled: notScheduled,
      });
      router.replace(ONBOARDING_COMPLETE_PATH);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not complete onboarding.");
    } finally {
      setSaving(false);
    }
  }

  function openExamDatePicker() {
    if (notScheduled) return;
    const input = examDateInputRef.current;
    if (!input) return;
    input.focus();
    input.showPicker?.();
  }

  if (loading || docLoading || !currentUser) {
    return (
      <Layout showSidebar={false}>
        <main className="user-page min-h-screen">
          <div className="user-page-container flex min-h-[100svh] items-center justify-center py-6 sm:py-10">
            <section className="user-card w-full max-w-xl p-5 sm:p-6">
              <p className="user-card-title">Preparing your setup</p>
              <div className="mt-4 grid gap-3">
                <div className="user-skeleton h-5 w-2/3" />
                <div className="user-skeleton h-4 w-full" />
                <div className="user-skeleton h-4 w-3/4" />
              </div>
            </section>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={false}>
      <main className="user-page min-h-screen">
        <div className="user-page-container flex min-h-[100svh] items-start justify-center py-5 sm:items-center sm:py-8 lg:min-h-screen">
          <section className="w-full max-w-3xl">
            <header className="user-page-header pb-4 text-center sm:pb-5">
              <div className="user-page-header-copy mx-auto">
                <p className="user-eyebrow inline-flex items-center justify-center gap-2">
                  <span className="user-accent-dot" />
                  Account Setup
                </p>
                <h1 className="user-page-title mt-2">Set Up Your Study Plan</h1>
                <p className="user-body-sm mx-auto mt-3 max-w-2xl">
                  Choose your exam focus and expected date so your dashboard starts with the right practice tools.
                </p>
              </div>
            </header>

            <div className="user-card overflow-hidden">
              <div className="border-b border-[#e3e5f0] bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="user-label">Step {step} of 3</p>
                    <p className="user-card-title mt-1">
                      {step === 1 ? "Choose your exam" : step === 2 ? "Set your timeline" : "Review your setup"}
                    </p>
                  </div>
                  <span className="user-pill user-pill-amber inline-flex w-fit items-center gap-2">
                    <LockKeyhole className="h-4 w-4" />
                    Setup required
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2" aria-label={`Onboarding progress ${progress}%`}>
                    {ONBOARDING_STEPS.map((item) => {
                      const isActive = item.step === step;
                      const isComplete = item.step < step;
                      return (
                        <div key={item.step} className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                              isActive || isComplete
                                ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                                : "border-[#d8dcec] bg-white text-[#64748b]"
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="h-4 w-4" /> : item.step}
                          </span>
                          <span className={`hidden truncate text-sm font-semibold sm:block ${isActive ? "text-[#0f172a]" : "text-[#64748b]"}`}>
                            {item.label}
                          </span>
                          {item.step < 3 ? <span className={`h-px min-w-3 flex-1 ${isComplete ? "bg-[#4f46e5]" : "bg-[#d8dcec]"}`} /> : null}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8ebf4]">
                    <div className="h-full rounded-full bg-[#4f46e5]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {error ? (
                  <div className="user-alert user-alert-error mb-5" role="alert">
                    <span className="user-alert-icon" aria-hidden="true">x</span>
                    <p className="user-helper">{error}</p>
                  </div>
                ) : null}

                <div className="mx-auto max-w-2xl">
                  {step === 1 ? (
                    <section className="text-center">
                      <h2 className="user-section-title">Choose an exam type</h2>
                      <p className="user-helper mx-auto mt-1 max-w-xl">This personalizes your dashboard and study recommendations.</p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {ONBOARDING_EXAM_TYPES.map((exam) => {
                          const selected = selectedExam === exam.value;
                          return (
                            <button
                              key={exam.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                setSelectedExam(exam.value);
                                setError("");
                              }}
                              className={`user-choice min-h-[144px] w-full text-left transition sm:min-h-[156px] ${
                                selected
                                  ? "border-[#4f46e5] bg-[#eef2ff] shadow-[0_0_0_3px_rgba(79,70,229,0.16)]"
                                  : ""
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  selected ? "bg-[#4f46e5] text-white" : "bg-[#eef2ff] text-[#4f46e5]"
                                }`}
                              >
                                {selected ? <CheckCircle2 className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                              </span>
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="user-card-title block">{exam.label}</span>
                                  {selected ? <span className="user-pill user-pill-purple">Selected</span> : null}
                                </span>
                                <span className="user-helper mt-1 block">{exam.description}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {step === 2 ? (
                    <section>
                      <div className="text-center">
                        <h2 className="user-section-title">Choose an exam date</h2>
                        <p className="user-helper mx-auto mt-1 max-w-xl">Use your expected date. You can update it later from profile settings.</p>
                      </div>
                      <div className="mx-auto mt-5 grid max-w-xl gap-4">
                        <label
                          className="user-control user-detail-surface cursor-pointer p-4"
                          onClick={openExamDatePicker}
                        >
                          <span className="user-label">Expected Exam Date</span>
                          <input
                            ref={examDateInputRef}
                            type="date"
                            min={todayIsoDate()}
                            value={examDate}
                            disabled={notScheduled}
                            onChange={(event) => {
                              setExamDate(event.target.value);
                              setNotScheduled(false);
                              setError("");
                            }}
                            className="user-field mt-2 disabled:cursor-not-allowed"
                          />
                          <span className="user-helper mt-2 block">Select the date from your browser calendar.</span>
                        </label>
                        <label className={`user-choice cursor-pointer ${notScheduled ? "border-[#4f46e5] bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.12)]" : ""}`}>
                          <input
                            type="checkbox"
                            checked={notScheduled}
                            onChange={(event) => {
                              setNotScheduled(event.target.checked);
                              if (event.target.checked) setExamDate("");
                              setError("");
                            }}
                          />
                          <span>
                            <span className="user-card-title block">I have not scheduled my exam yet.</span>
                            <span className="user-helper mt-1 block">Your dashboard will still be personalized without a date.</span>
                          </span>
                        </label>
                      </div>
                    </section>
                  ) : null}

                  {step === 3 ? (
                    <section>
                      <div className="text-center">
                        <h2 className="user-section-title">Confirm your setup</h2>
                        <p className="user-helper mx-auto mt-1 max-w-xl">Review your selections before unlocking your dashboard.</p>
                      </div>
                      <div className="user-feature-surface mx-auto mt-5 max-w-xl p-4 sm:p-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="user-detail-surface bg-white p-4">
                            <p className="user-label">Selected Exam Type</p>
                            <p className="user-card-title mt-1">{selectedExamDetails?.label || onboardingExamLabel(selectedExam)}</p>
                            {selectedExamDetails ? <p className="user-helper mt-2">{selectedExamDetails.description}</p> : null}
                          </div>
                          <div className="user-detail-surface bg-white p-4">
                            <p className="user-label">Exam Date</p>
                            <p className="user-card-title mt-1">{notScheduled ? "Not scheduled" : examDate || "Not selected"}</p>
                            <p className="user-helper mt-2">You can update this from profile settings later.</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#e3e5f0] bg-white px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
                <button
                  type="button"
                  onClick={() => setStep((previous) => Math.max(1, previous - 1) as Step)}
                  disabled={saving || step === 1}
                  className="user-button-secondary min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Back
                </button>
                {step === 3 ? (
                  <button
                    type="button"
                    onClick={handleStartStudying}
                    disabled={saving || !canContinue}
                    className="user-button-primary min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving ? "Saving..." : "Start Studying"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={saving || !canContinue}
                    className="user-button-primary min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving ? "Saving..." : "Continue"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
