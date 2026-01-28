"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

export default function LoginPageClient() {
  const router = useRouter();
  const { currentUser, loading, login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Only redirect if user is already logged in and not showing success message
    if (
      !loading &&
      currentUser &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem("showingLoginSuccess")
    ) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, router]);

  // Show loading state while checking auth
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

  // Don't render login page if user is logged in and not showing success (will redirect)
  if (
    currentUser &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem("showingLoginSuccess")
  ) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      await login(formData.email, formData.password, formData.rememberMe);

      sessionStorage.setItem("showingLoginSuccess", "true");
      setSuccess(true);

      setTimeout(() => {
        sessionStorage.removeItem("showingLoginSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";

      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      sessionStorage.setItem("showingLoginSuccess", "true");
      setSuccess(true);
      setTimeout(() => {
        sessionStorage.removeItem("showingLoginSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      let errorMessage = "An error occurred with Google sign-in. Please try again.";
      
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email. Please sign in with your email and password.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Google sign-in error:", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f9fafb_55%)]">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-[#22c55e]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
            Login Successful! 🎉
          </h2>
          <p className="text-[#6b7280] mb-4">
            Welcome back! Redirecting to dashboard...
          </p>
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
        className={`min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,#f9fafb_55%)] ${inter.className} text-[#0f172a]`} 
        style={{ 
          fontFamily: inter.style.fontFamily,
        }}
      >
      <main className="max-w-[1160px] mx-auto px-6 py-8 pb-10 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10 items-center" style={{ padding: '32px 24px 40px' }}>
        {/* LEFT HERO */}
        <section>
          <div className="inline-flex items-center gap-2 px-[14px] py-1 rounded-full bg-[#eef2ff] border border-[#e0e7ff] text-[12px] text-[#4338ca] mb-[22px]">
            <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-white text-[14px]">
              🔒
            </div>
            <span>Secure Login</span>
          </div>

          <h1 className="text-[40px] leading-[1.08] mb-[14px] tracking-[-0.03em] font-bold text-[#0f172a]">
            Welcome Back to <span className="bg-gradient-to-br from-[#2563eb] to-[#a855f7] bg-clip-text text-transparent">NursingMocks</span>
          </h1>

          <p className="text-[15px] text-[#6b7280] max-w-[460px] mb-[30px]">
            Sign in to access your personalised TEAS, HESI, RN/LPN nursing test banks, and exit exam study materials.
          </p>

          <ul className="list-none flex flex-col gap-4">
            <li className="flex gap-[10px] text-[14px]">
              <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-0.5 text-[#0f172a]">Access Study Materials</div>
                <div className="text-[#6b7280]">
                  Get instant access to TEAS & HESI practice, RN/LPN test banks, and exit exam prep.
                </div>
              </div>
            </li>

            <li className="flex gap-[10px] text-[14px]">
              <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-0.5 text-[#0f172a]">Track Your Progress</div>
                <div className="text-[#6b7280]">
                  Monitor your accuracy, strengths, and weak areas over time.
                </div>
              </div>
            </li>

            <li className="flex gap-[10px] text-[14px]">
              <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-0.5 text-[#0f172a]">Expert Support</div>
                <div className="text-[#6b7280]">
                  Get personalised help whenever you need it.
                </div>
              </div>
            </li>
          </ul>
        </section>

        {/* RIGHT CARD */}
        <section className="bg-white rounded-[32px] shadow-[0_26px_70px_rgba(15,23,42,0.15)] border border-[#e5e7f5]" style={{ padding: '32px 34px 30px' }}>
          <div className="w-[54px] h-[54px] rounded-[20px] bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] flex items-center justify-center text-white text-[26px] mx-auto mb-[18px]">
            👤
          </div>

          <div className="text-center mb-[22px]">
            <h2 className="text-[24px] font-bold mb-1 text-[#0f172a]">Sign In</h2>
            <p className="text-[#6b7280] text-[14px]">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-[13px] font-semibold mb-1.5 text-[#0f172a]">
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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f3f4ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.22)]"
                  placeholder="you@example.com"
                  required
                  style={{ color: '#0f172a' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-[13px] font-semibold mb-1.5 text-[#0f172a]">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]">
                  🔒
                </span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f3f4ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.22)]"
                  placeholder="Enter your password"
                  required
                  style={{ color: '#0f172a' }}
                />
              </div>
            </div>

            <div className="text-right mb-4 text-[13px]">
              <Link
                href="/forgot-password"
                className="text-[#2563eb] no-underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#6b7280] mb-[18px]">
              <input
                type="checkbox"
                id="remember"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full py-[13px] px-4 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] border-none text-white text-[15px] font-semibold cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center gap-[10px] my-[22px] mb-4 text-[#9ca3af] text-[12px]">
              <div className="flex-1 h-px bg-[#e5e7eb]"></div>
              <span>Or continue with</span>
              <div className="flex-1 h-px bg-[#e5e7eb]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
              className="w-full py-[10px] px-4 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center gap-[10px] cursor-pointer text-[14px] text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {isGoogleLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-[18px]"
                  />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <div className="mt-[18px] text-[13px] text-center text-[#6b7280]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#2563eb] no-underline font-medium">
                Sign up here
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
    </>
  );
}
