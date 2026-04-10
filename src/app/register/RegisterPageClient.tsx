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

export default function RegisterPageClient() {
  const router = useRouter();
  const { currentUser, loading, register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    program: "",
    terms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (
      !loading &&
      currentUser &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem("showingRegisterSuccess")
    ) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
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

  if (
    currentUser &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem("showingRegisterSuccess")
  ) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
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
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (!formData.terms) {
        setError("Please agree to the Terms & Conditions and Privacy Policy");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.program
      );

      try {
        const emailResponse = await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send welcome email");
        }
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      sessionStorage.setItem("showingRegisterSuccess", "true");
      setSuccess(true);

      setTimeout(() => {
        sessionStorage.removeItem("showingRegisterSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const userCredential = await loginWithGoogle();
      const user = userCredential.user;

      if (user) {
        const userName = user.displayName || user.email?.split("@")[0] || "User";
        const userEmail = user.email || "";

        if (userEmail) {
          try {
            const emailResponse = await fetch("/api/send-welcome-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: userName,
                email: userEmail,
              }),
            });

            if (!emailResponse.ok) {
              console.error("Failed to send welcome email");
            }
          } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
          }
        }
      }

      sessionStorage.setItem("showingRegisterSuccess", "true");
      setSuccess(true);

      setTimeout(() => {
        sessionStorage.removeItem("showingRegisterSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      let errorMessage = "An error occurred with Google sign-up. Please try again.";

      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up popup was closed. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email. Please sign in instead.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Google sign-up error:", err);
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
            Registration Successful! 🎉
          </h2>
          <p className="text-[#6b7280] mb-4">
            Your account has been created successfully. Welcome to NursingMocks! Redirecting to dashboard...
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
        <main className="max-w-[1120px] mx-auto px-6 py-8 pb-10 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-center" style={{ padding: '32px 24px 40px' }}>
          {/* LEFT SIDE */}
          <section>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef2ff] border border-[#e0e7ff] text-[12px] text-[#4338ca] mb-[22px]">
              <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-[11px]">
                🔒
              </div>
              <span>Secure Sign Up</span>
            </div>

            <h1 className="text-[36px] leading-[1.1] mb-1.5 font-bold">
              Create Your <span className="bg-gradient-to-br from-[#2563eb] to-[#a855f7] bg-clip-text text-transparent">NursingMocks</span> Account
            </h1>
            <p className="text-[18px] font-semibold text-[#111827] mb-[14px]">
              TEAS · HESI · Nursing Test Banks · Nursing Exit Exams
            </p>
            <p className="text-[15px] text-[#6b7280] max-w-[480px] mb-[28px]">
              Join to unlock personalised TEAS and HESI practice, RN and LPN nursing test banks, and focused prep for ATI and HESI exit exams — all under one login.
            </p>

            <ul className="list-none flex flex-col gap-[14px]">
              <li className="flex gap-[10px] items-start text-[14px]">
                <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold mb-0.5 text-[#0f172a]">Centralise All Your Exam Prep</div>
                  <div className="text-[#6b7280]">
                    Keep TEAS, HESI A2, nursing test bank practice, and nursing exit exam results together instead of scattered across different tools.
                  </div>
                </div>
              </li>

              <li className="flex gap-[10px] items-start text-[14px]">
                <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold mb-0.5 text-[#0f172a]">Track Progress Across Every Module</div>
                  <div className="text-[#6b7280]">
                    Watch how your scores move over time for entrance exams, RN and LPN test banks, and ATI or HESI exit exams in one dashboard.
                  </div>
                </div>
              </li>

              <li className="flex gap-[10px] items-start text-[14px]">
                <div className="w-[22px] h-[22px] rounded-full bg-[#ecfdf3] text-[#22c55e] flex items-center justify-center text-[13px] mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold mb-0.5 text-[#0f172a]">Study That Follows Your Program</div>
                  <div className="text-[#6b7280]">
                    Whether you are starting with TEAS, deep in RN test banks, or gearing up for a predictor or exit exam, your account grows with you.
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* RIGHT SIDE CARD */}
          <section className="bg-white rounded-[32px] shadow-[0_24px_60px_rgba(15,23,42,0.18)] border border-[#e5e7f9]" style={{ padding: '32px 32px 30px' }}>
            <div className="w-[52px] h-[52px] rounded-[20px] bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] flex items-center justify-center text-white text-[26px] mb-[18px]">
              👤
            </div>

            <h2 className="text-[24px] font-bold mb-1 text-[#0f172a]">Sign Up</h2>
            <p className="text-[14px] text-[#6b7280] mb-6">
              Create your account to start practising for TEAS, HESI, RN and LPN nursing test banks, and ATI or HESI exit exams.
            </p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="name" className="block text-[13px] font-semibold mb-1.5 text-[#111827]">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]">
                    👤
                  </span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f5f7ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                    placeholder="Enter your full name"
                    required
                    style={{ color: '#0f172a' }}
                  />
                </div>
              </div>

              <div className="mb-4">
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
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f5f7ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                    placeholder="you@example.com"
                    required
                    style={{ color: '#0f172a' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[14px] mb-4">
                <div>
                  <label htmlFor="password" className="block text-[13px] font-semibold mb-1.5 text-[#111827]">
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
                      className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f5f7ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                      placeholder="Create a password"
                      required
                      style={{ color: '#0f172a' }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-[13px] font-semibold mb-1.5 text-[#111827]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]">
                      🔒
                    </span>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full py-[11px] px-[14px] pl-[38px] rounded-full border border-[#e5e7eb] bg-[#f5f7ff] text-[14px] text-[#0f172a] placeholder:text-[#9ca3af] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                      placeholder="Re-enter password"
                      required
                      style={{ color: '#0f172a' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="program" className="block text-[13px] font-semibold mb-1.5 text-[#111827]">
                  Program Type (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]">
                    🎓
                  </span>
                  <select
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full py-[11px] px-[14px] pl-[38px] pr-8 rounded-full border border-[#e5e7eb] bg-[#f5f7ff] text-[14px] text-[#0f172a] outline-none focus:bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                    style={{ color: '#0f172a' }}
                  >
                    <option value="">Select your program</option>
                    <option value="teas">Pre-Nursing · TEAS Entrance</option>
                    <option value="hesi">Pre-Nursing · HESI A2 Entrance</option>
                    <option value="rn-testbank">RN Program · Nursing Test Bank</option>
                    <option value="lpn-testbank">LPN / LVN Program · Nursing Test Bank</option>
                    <option value="exit-ati">RN / LPN · ATI Exit / Predictor Prep</option>
                    <option value="exit-hesi">RN / LPN · HESI Exit Exam Prep</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[13px] text-[#6b7280] mb-4 mt-1">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4"
                />
                <span>
                  I agree to the <Link href="/terms-and-conditions" className="text-[#2563eb] no-underline font-medium">Terms & Conditions</Link> and{" "}
                  <Link href="/privacy-policy" className="text-[#2563eb] no-underline font-medium">Privacy Policy</Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-br from-[#2563eb] to-[#4f46e5] border-none text-white text-[15px] font-semibold cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              <div className="flex items-center gap-[10px] my-5 mb-4 text-[#9ca3af] text-[12px]">
                <div className="flex-1 h-px bg-[#e5e7eb]"></div>
                <span>Or continue with</span>
                <div className="flex-1 h-px bg-[#e5e7eb]"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px]"
                    />
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              <div className="mt-[18px] text-[13px] text-center text-[#6b7280]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2563eb] no-underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </section>
        </main>
      </div>
    </>
  );
}
