"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

export default function ForgotPasswordPageClient() {
  const router = useRouter();
  const { currentUser, loading, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      router.push("/");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className={`user-page min-h-screen ${inter.className}`}>
        <main className="user-page-container flex min-h-screen items-center justify-center py-10">
          <section className="user-card w-full max-w-xl p-6">
            <p className="user-card-title">Loading password reset</p>
            <div className="mt-4 grid gap-3">
              <div className="user-skeleton h-5 w-2/3" />
              <div className="user-skeleton h-4 w-full" />
              <div className="user-skeleton h-4 w-3/4" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (currentUser) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!email) {
        setError("Please enter your email address.");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
      }

      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      let errorMessage = "An error occurred. Please try again.";

      if (authError.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (authError.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }

      setError(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={`user-page min-h-screen ${inter.className}`}>
        <main className="user-page-container flex min-h-screen items-center justify-center py-10">
          <section className="user-card w-full max-w-xl p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[rgba(43,170,96,0.22)] bg-[rgba(43,170,96,0.1)] text-[#15803d]">
              <MailCheck className="h-7 w-7" />
            </div>
            <p className="user-eyebrow mt-5">Reset Email Sent</p>
            <h1 className="user-page-title mt-2">Check Your Email</h1>
            <p className="user-body-sm mx-auto mt-3 max-w-md">
              If an account exists for <span className="font-bold text-[#0f172a]">{email}</span>, we sent a password reset link.
            </p>
            <div className="user-alert user-alert-success mt-5 text-left" role="status">
              <span className="user-alert-icon" aria-hidden="true">ok</span>
              <div>
                <p className="user-card-title">Next step</p>
                <p className="user-helper mt-1">Open the email and follow the link to choose a new password. You can also check spam or request another link after a few minutes.</p>
              </div>
            </div>
            <Link href="/login" className="user-button-primary mt-5 w-full gap-2">
              Back to Sign In
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`user-page min-h-screen ${inter.className}`}>
      <main className="user-page-container grid min-h-[100svh] items-start gap-5 py-5 sm:py-8 lg:min-h-screen lg:items-center lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <section className="user-page-header order-2 lg:order-1">
          <div className="user-page-header-copy">
            <p className="user-eyebrow inline-flex items-center gap-2">
              <span className="user-accent-dot" />
              Password Reset
            </p>
            <h1 className="user-page-title mt-3">Reset Your NursingMocks Password</h1>
            <p className="user-body mt-4 max-w-2xl">
              Enter the email connected to your NursingMocks account. We will send a secure reset link so you can return to ATI TEAS 7, HESI A2, Nursing Test Bank, or Nursing Exit Exams.
            </p>
          </div>

          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3">
            {[
              { title: "Secure Reset", text: "Reset links are sent only to the email on your account." },
              { title: "Progress Stays Saved", text: "Your exam access, dashboard, and practice history remain unchanged." },
              { title: "Quick Return", text: "Choose a new password, then continue studying from your dashboard." },
            ].map((item) => (
              <div key={item.title} className="user-detail-surface p-4">
                <CheckCircle2 className="h-5 w-5 text-[#15803d]" />
                <h2 className="user-card-title mt-3">{item.title}</h2>
                <p className="user-helper mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="user-card order-1 p-4 sm:p-6 lg:order-2">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.07)] text-[#4338ca]">
            <MailCheck className="h-6 w-6" />
          </div>
          <div className="mt-4 text-center">
            <h2 className="user-section-title">Forgot Password</h2>
            <p className="user-body-sm mt-1">Send a password reset link to your email.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {error && (
              <div className="user-alert user-alert-error" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Reset Issue</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            <label className="user-control">
              <span className="user-label mb-1">Email Address</span>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className="user-field"
                placeholder="you@example.com"
                required
              />
              <span className="user-feedback mt-1">
                Use the same email address you used to create your NursingMocks account.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="user-button-primary w-full gap-2"
            >
              <MailCheck className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="user-detail-surface flex items-start gap-3 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4338ca]" />
              <p className="user-helper">
                Remember your password?{" "}
                <Link href="/login" className="font-bold text-[#4338ca] hover:underline">
                  Back to Sign In
                </Link>
                .
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
