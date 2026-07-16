"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PROGRAM_TYPE_OPTIONS } from "@/lib/program-type";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    program: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Basic validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.program
      ) {
        setError("Please fill in all fields, including exam type");
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

      // Password validation
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsSubmitting(false);
        return;
      }

      // Password match validation
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      // Firebase authentication
      await register(formData.email, formData.password, formData.name, formData.program);

      // Send welcome email (don't block on failure)
      try {
        const idToken = await (await import("@/lib/firebase")).auth.currentUser?.getIdToken();
        const emailResponse = await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({}),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send welcome email");
        }
      } catch (emailError) {
        // Don't fail registration if email fails
        console.error("Error sending welcome email:", emailError);
      }

      // Mark that we're showing success message to prevent auto-redirect
      sessionStorage.setItem("showingRegisterSuccess", "true");

      setSuccess(true);
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        sessionStorage.removeItem("showingRegisterSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      // Handle Firebase auth errors
      let errorMessage = "An error occurred. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled.";
      } else if (err.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
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
    if (!formData.program) {
      setError("Please select your exam type before continuing with Google");
      return;
    }
    const termsEl = document.getElementById("terms") as HTMLInputElement | null;
    if (!termsEl?.checked) {
      setError("Please agree to the Terms and Conditions and Privacy Policy");
      return;
    }
    setIsGoogleLoading(true);

    try {
      const userCredential = await loginWithGoogle({ programType: formData.program });
      const user = userCredential.user;

      // Send welcome email for Google sign-up (don't block on failure)
      if (user) {
        const userEmail = user.email || "";

        if (userEmail) {
          try {
            const idToken = await user.getIdToken();
            const emailResponse = await fetch("/api/send-welcome-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({}),
            });

            if (!emailResponse.ok) {
              console.error("Failed to send welcome email");
            }
          } catch (emailError) {
            // Don't fail registration if email fails
            console.error("Error sending welcome email:", emailError);
          }
        }
      }

      // Mark that we're showing success message to prevent auto-redirect
      sessionStorage.setItem("showingRegisterSuccess", "true");
      setSuccess(true);
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        sessionStorage.removeItem("showingRegisterSuccess");
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      let errorMessage =
        "An error occurred with Google sign-up. Please try again.";

      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up popup was closed. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "An account already exists with this email. Please sign in instead.";
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
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registration Successful! 🎉
        </h2>
        <p className="text-gray-600 mb-4">
          Your account has been created successfully. Welcome to TEAS Gurus!
          Redirecting to dashboard...
        </p>
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
          htmlFor="name"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Full Name
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
            placeholder="Enter your full name"
          />
        </div>
      </div>

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
            placeholder="Create a password (min. 8 characters)"
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
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Confirm Password
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="program"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Exam Type <span className="text-red-600">*</span>
        </label>
        <select
          id="program"
          name="program"
          value={formData.program}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
        >
          <option value="" disabled>
            Select exam type
          </option>
          {PROGRAM_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
          I agree to the{" "}
          <Link
            href="/terms-and-conditions"
            className="text-blue-600 hover:text-blue-500"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-blue-600 hover:text-blue-500"
          >
            Privacy Policy
          </Link>
        </label>
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
            Creating Account...
          </span>
        ) : (
          "Create Account"
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
        onClick={handleGoogleSignUp}
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
            Sign up with Google
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
}
