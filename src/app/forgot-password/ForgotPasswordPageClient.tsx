"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
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
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f9fafb_55%)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mb-4"></div>
          <p className="text-[#6b7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!email) {
        setError("Please enter your email address");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f9fafb_55%)]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-[#22c55e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
            Check Your Email
          </h2>
          <p className="text-[#6b7280] mb-4">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-[#9ca3af] mb-6">
            Please check your inbox and click on the link to reset your password.
            If you don't see the email, check your spam folder.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white px-6 py-3 font-semibold hover:brightness-105 transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            font-family: ${inter.style.fontFamily} !important;
          }
        `
      }} />
      <div 
        className={`min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f9fafb_55%)] ${inter.className} text-[#0f172a] flex items-center`} 
        style={{ 
          fontFamily: inter.style.fontFamily,
        }}
      >
        <main className="max-w-[1160px] w-full mx-auto px-6 py-8 pb-12 grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-10 items-center" style={{ padding: '32px 24px 48px' }}>
          {/* LEFT HERO */}
          <section>
            <div className="inline-flex items-center gap-2 px-[14px] py-1 rounded-full bg-[#eef2ff] border border-[#e0e7ff] text-[12px] text-[#4338ca] mb-6">
              <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] flex items-center justify-center text-white text-[14px]">
                🔐
              </div>
              <span>Password Reset</span>
            </div>

            <h1 className="text-[38px] leading-[1.08] mb-[14px] tracking-[-0.03em] font-bold">
              Reset Your <span className="bg-gradient-to-br from-[#2563eb] to-[#a855f7] bg-clip-text text-transparent">NursingMocks</span> Password
            </h1>
            <p className="text-[15px] text-[#6b7280] max-w-[460px] mb-7">
              Forgot your password? No problem. Enter the email you use for TEAS, HESI, nursing test banks, or exit exam practice and we'll send a secure reset link.
            </p>

            <ul className="list-none flex flex-col gap-4 text-[14px]">
              <li className="flex gap-[10px] items-start">
                <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold mb-0.5 text-[#0f172a]">Secure Reset</div>
                  <div className="text-[#6b7280]">
                    We only send reset links to verified email addresses connected to your NursingMocks account.
                  </div>
                </div>
              </li>

              <li className="flex gap-[10px] items-start">
                <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold mb-0.5 text-[#0f172a]">No Progress Lost</div>
                  <div className="text-[#6b7280]">
                    Your TEAS, HESI, RN/LPN test bank, and exit exam history stays saved — only your password changes.
                  </div>
                </div>
              </li>

              <li className="flex gap-[10px] items-start">
                <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold mb-0.5 text-[#0f172a]">Takes Just A Minute</div>
                  <div className="text-[#6b7280]">
                    Check your inbox, click the link, and choose a new password to get back to studying.
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* RIGHT CARD */}
          <section className="bg-white rounded-[32px] shadow-[0_26px_70px_rgba(15,23,42,0.15)] border border-[#e5e7f5]" style={{ padding: '32px 34px 30px' }}>
            <div className="w-[54px] h-[54px] rounded-[20px] bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] flex items-center justify-center text-white text-[26px] mx-auto mb-[18px]">
              ✉️
            </div>

            <div className="text-center mb-[22px]">
              <h2 className="text-[24px] font-bold mb-1 text-[#0f172a]">Forgot Password</h2>
              <p className="text-[14px] text-[#6b7280]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-[18px]">
                <label htmlFor="email" className="block text-[13px] font-semibold mb-1.5 text-[#111827]">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]">
                    @
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f3f4ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.22)]"
                    placeholder="you@example.com"
                    required
                    style={{ color: '#0f172a' }}
                  />
                </div>
                <p className="text-[12px] text-[#9ca3af] mt-1 pl-1">
                  Make sure this is the same email you used when creating your NursingMocks account.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-[13px] px-4 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] border-none text-white text-[15px] font-semibold cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="mt-5 text-[13px] text-center text-[#6b7280]">
                Remember your password?{" "}
                <Link href="/login" className="text-[#2563eb] no-underline font-medium">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </section>
        </main>
      </div>
    </>
  );
}
