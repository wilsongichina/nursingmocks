"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GoogleMark from "@/components/ui/GoogleMark";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

function getSafeReturnPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/dashboard";
  }

  return returnTo;
}

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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (
      !loading &&
      currentUser &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem("showingLoginSuccess")
    ) {
      const timer = setTimeout(() => {
        router.push(getSafeReturnPath());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className={`user-page min-h-screen ${inter.className}`}>
        <main className="user-page-container flex min-h-screen items-center justify-center py-10">
          <section className="user-card w-full max-w-xl p-6">
            <p className="user-card-title">Loading sign in</p>
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
    !sessionStorage.getItem("showingLoginSuccess")
  ) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const showLoginSuccess = () => {
    sessionStorage.setItem("showingLoginSuccess", "true");
    setSuccess(true);

    setTimeout(() => {
      sessionStorage.removeItem("showingLoginSuccess");
      router.push(getSafeReturnPath());
    }, 2000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields.");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
      }

      await login(formData.email, formData.password, formData.rememberMe);
      showLoginSuccess();
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      let errorMessage = "An error occurred. Please try again.";

      if (authError.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (authError.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (authError.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      } else if (authError.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (authError.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (authError.message) {
        errorMessage = authError.message;
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
      showLoginSuccess();
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      let errorMessage = "An error occurred with Google sign-in. Please try again.";

      if (authError.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (authError.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (authError.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email. Please sign in with your email and password.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }

      setError(errorMessage);
      console.error("Google sign-in error:", err);
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
            <p className="user-eyebrow mt-5">Signed in</p>
            <h1 className="user-page-title mt-2">Login successful</h1>
            <p className="user-body-sm mx-auto mt-3 max-w-md">
              Welcome back. We are taking you to your dashboard now.
            </p>
            <div className="user-alert user-alert-success mt-5 text-left" role="status">
              <span className="user-alert-icon" aria-hidden="true">ok</span>
              <div>
                <p className="user-card-title">Account verified</p>
                <p className="user-helper mt-1">Your study dashboard will open automatically.</p>
              </div>
            </div>
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
              Secure Login
            </p>
            <h1 className="user-page-title mt-3">Welcome back to NursingMocks</h1>
            <p className="user-body mt-4 max-w-2xl">
              Sign in to continue your exam practice, manage your access, and keep your study dashboard up to date.
            </p>
          </div>

          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3">
            {[
              { title: "My Exams", text: "Open your selected exam areas and previews." },
              { title: "Progress", text: "Return to results and completed attempts." },
              { title: "Payments", text: "Review access and transaction records." },
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
            <UserRound className="h-6 w-6" />
          </div>
          <div className="mt-4 text-center">
            <h2 className="user-section-title">Sign in</h2>
            <p className="user-body-sm mt-1">Enter your account details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {error && (
              <div className="user-alert user-alert-error" role="alert">
                <span className="user-alert-icon" aria-hidden="true">x</span>
                <div>
                  <p className="user-card-title">Sign in failed</p>
                  <p className="user-helper mt-1">{error}</p>
                </div>
              </div>
            )}

            <label className="user-control">
              <span className="user-label mb-1">Email address</span>
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
                  placeholder="Enter your password"
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="user-helper inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[#d9deea] text-[#6a5cff] focus:ring-[#6a5cff]"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-bold text-[#4338ca] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="user-button-primary w-full gap-2"
            >
              <LockKeyhole className="h-4 w-4" />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
              <span className="h-px bg-[#edf0f7]" />
              <span>or</span>
              <span className="h-px bg-[#edf0f7]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
              className="user-button-secondary w-full gap-2"
            >
              {isGoogleLoading ? (
                "Loading..."
              ) : (
                <>
                  <GoogleMark />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <div className="user-detail-surface flex items-start gap-3 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4338ca]" />
              <p className="user-helper">
                New here?{" "}
                <Link href="/register" className="font-bold text-[#4338ca] hover:underline">
                  Create an account
                </Link>{" "}
                to choose your exam focus.
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
