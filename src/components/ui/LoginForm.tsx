"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Firebase authentication with remember me
      await login(formData.email, formData.password, formData.rememberMe);

      // Mark that we're showing success message to prevent auto-redirect
      sessionStorage.setItem("showingLoginSuccess", "true");

      // Show success message
      setSuccess(true);

      // Redirect to dashboard after showing success message
      setTimeout(() => {
        sessionStorage.removeItem("showingLoginSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      // Handle Firebase auth errors
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
      // Mark that we're showing success message to prevent auto-redirect
      sessionStorage.setItem("showingLoginSuccess", "true");
      setSuccess(true);
      // Redirect to dashboard after showing success message
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
      <div className="user-card p-5 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[rgba(43,170,96,0.22)] bg-[rgba(43,170,96,0.1)] text-sm font-black text-[#15803d]">
          ok
        </div>
        <p className="user-eyebrow mt-4">Signed in</p>
        <h2 className="user-section-title mt-2">Login successful</h2>
        <p className="user-body-sm mt-2">
          Welcome back. We are taking you to your dashboard now.
        </p>
        <div className="user-alert user-alert-success mt-5 text-left" role="status">
          <span className="user-alert-icon" aria-hidden="true">ok</span>
          <div>
            <p className="user-card-title">Account verified</p>
            <p className="user-helper mt-1">Your study dashboard will open automatically.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 block text-sm text-gray-700"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isGoogleLoading}
        className="w-full gradient-button text-white px-6 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
      >
        {isGoogleLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
}
