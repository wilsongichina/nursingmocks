"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { CheckCircle2, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PROGRAM_TYPE_OPTIONS } from "@/lib/program-type";
import GoogleMark from "@/components/ui/GoogleMark";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <div className={`user-page min-h-screen ${inter.className}`}>
        <main className="user-page-container flex min-h-screen items-center justify-center py-10">
          <section className="user-card w-full max-w-xl p-6">
            <p className="user-card-title">Loading registration</p>
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

  if (
    currentUser &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem("showingRegisterSuccess")
  ) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  async function sendWelcomeEmail(token?: string) {
    try {
      const emailResponse = await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send welcome email");
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }
  }

  function showRegisterSuccess() {
    sessionStorage.setItem("showingRegisterSuccess", "true");
    setSuccess(true);

    setTimeout(() => {
      sessionStorage.removeItem("showingRegisterSuccess");
      router.push("/dashboard");
    }, 2000);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.program
      ) {
        setError("Please fill in all required fields, including Exam Type.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.terms) {
        setError("Please agree to the Terms & Conditions and Privacy Policy.");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }

      await register(formData.email, formData.password, formData.name, formData.program);
      const idToken = await (await import("@/lib/firebase")).auth.currentUser?.getIdToken();
      await sendWelcomeEmail(idToken);
      showRegisterSuccess();
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      let errorMessage = "An error occurred. Please try again.";

      if (authError.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (authError.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled.";
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }

      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    if (!formData.program) {
      setError("Please select your Exam Type before continuing with Google.");
      return;
    }
    if (!formData.terms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    setIsGoogleLoading(true);

    try {
      const userCredential = await loginWithGoogle({ programType: formData.program });
      const idToken = await userCredential.user.getIdToken();
      await sendWelcomeEmail(idToken);
      showRegisterSuccess();
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      let errorMessage = "An error occurred with Google sign-up. Please try again.";

      if (authError.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up popup was closed. Please try again.";
      } else if (authError.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (authError.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email. Please sign in instead.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }

      setError(errorMessage);
      console.error("Google sign-up error:", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`user-page min-h-screen ${inter.className}`}>
        <main className="user-page-container flex min-h-screen items-center justify-center py-10">
          <section className="user-card w-full max-w-xl p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[rgba(43,170,96,0.22)] bg-[rgba(43,170,96,0.1)] text-sm font-black text-[#15803d]">
              ok
            </div>
            <p className="user-eyebrow mt-5">Account Created</p>
            <h1 className="user-page-title mt-2">Registration Successful</h1>
            <p className="user-body-sm mx-auto mt-3 max-w-md">
              Welcome to NursingMocks. We are taking you to your dashboard now.
            </p>
            <div className="user-alert user-alert-success mt-5 text-left" role="status">
              <span className="user-alert-icon" aria-hidden="true">ok</span>
              <div>
                <p className="user-card-title">Profile ready</p>
                <p className="user-helper mt-1">Your selected Exam Focus has been saved.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`user-page min-h-screen ${inter.className}`}>
      <main className="user-page-container grid min-h-[100svh] items-start gap-5 py-5 sm:py-8 lg:min-h-screen lg:items-center lg:grid-cols-[minmax(0,1fr)_minmax(380px,500px)]">
        <section className="user-page-header order-2 lg:order-1">
          <div className="user-page-header-copy">
            <p className="user-eyebrow inline-flex items-center gap-2">
              <span className="user-accent-dot" />
              Secure Registration
            </p>
            <h1 className="user-page-title mt-3">Create Your NursingMocks Account</h1>
            <p className="user-body mt-4 max-w-2xl">
              Choose your Exam Focus, create your account, and keep ATI TEAS 7, HESI A2, Nursing Test Bank, and Nursing Exit Exams in one dashboard.
            </p>
          </div>

          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3">
            {[
              { title: "Pick an Exam Focus", text: "Start with ATI TEAS 7, HESI A2, Nursing Test Bank, or Nursing Exit Exams." },
              { title: "Track Progress", text: "Keep practice activity and results connected to one account." },
              { title: "Manage Access", text: "Review plans, payments, and enabled exam areas." },
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
            <UserPlus className="h-6 w-6" />
          </div>
          <div className="mt-4 text-center">
            <h2 className="user-section-title">Sign Up</h2>
            <p className="user-body-sm mt-1">Create your account and select your Exam Focus.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {error && (
              <div className="user-alert user-alert-error" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Registration Issue</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            <label className="user-control">
              <span className="user-label mb-1">Full Name</span>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="user-field"
                placeholder="Enter your full name"
                required
              />
            </label>

            <label className="user-control">
              <span className="user-label mb-1">Email Address</span>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="user-field"
                placeholder="you@example.com"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="user-control">
                <span className="user-label mb-1">Password</span>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="user-field pr-12"
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#64748b] transition hover:bg-[#eef2ff] hover:text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#6a5cff]/30"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="user-control">
                <span className="user-label mb-1">Confirm Password</span>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="user-field pr-12"
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#64748b] transition hover:bg-[#eef2ff] hover:text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#6a5cff]/30"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            </div>

            <label className="user-control">
              <span className="user-label mb-1">Exam Type</span>
              <select
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                required
                className="user-field"
              >
                <option value="" disabled>
                  Select Exam Type
                </option>
                {PROGRAM_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="user-helper flex items-start gap-2">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-[#d9deea] text-[#6a5cff] focus:ring-[#6a5cff]"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms-and-conditions" className="font-bold text-[#4338ca] hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-bold text-[#4338ca] hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="user-button-primary w-full gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
              <span className="h-px bg-[#edf0f7]" />
              <span>or</span>
              <span className="h-px bg-[#edf0f7]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting || isGoogleLoading}
              className="user-button-secondary w-full gap-2"
            >
              {isGoogleLoading ? (
                "Loading..."
              ) : (
                <>
                  <GoogleMark />
                  <span>Sign Up with Google</span>
                </>
              )}
            </button>

            <div className="user-detail-surface flex items-start gap-3 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4338ca]" />
              <p className="user-helper">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#4338ca] hover:underline">
                  Sign in
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
