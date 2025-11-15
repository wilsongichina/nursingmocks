"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);

  useEffect(() => {
    // Verify the action code from the URL
    const verifyCode = async () => {
      const oobCode = searchParams.get("oobCode");
      
      if (!oobCode) {
        setError("Invalid or missing reset link. Please request a new password reset.");
        setIsVerifying(false);
        setIsValidCode(false);
        return;
      }

      try {
        // Verify the password reset code
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true);
      } catch (err: any) {
        let errorMessage = "Invalid or expired reset link. Please request a new password reset.";
        
        if (err.code === "auth/expired-action-code") {
          errorMessage = "This password reset link has expired. Please request a new one.";
        } else if (err.code === "auth/invalid-action-code") {
          errorMessage = "Invalid reset link. Please request a new password reset.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setIsValidCode(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const oobCode = searchParams.get("oobCode");
      
      if (!oobCode) {
        setError("Invalid reset link. Please request a new password reset.");
        setIsSubmitting(false);
        return;
      }

      // Confirm the password reset
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.code === "auth/expired-action-code") {
        errorMessage = "This password reset link has expired. Please request a new one.";
      } else if (err.code === "auth/invalid-action-code") {
        errorMessage = "Invalid reset link. Please request a new password reset.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while verifying code
  if (isVerifying) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verifying reset link...</p>
      </div>
    );
  }

  // Show error if code is invalid
  if (!isValidCode) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Invalid Reset Link
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          href="/forgot-password"
          className="inline-block gradient-button text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-gray-600 mb-4">
          Your password has been successfully reset. You will be redirected to the login page shortly.
        </p>
        <Link
          href="/login"
          className="inline-block gradient-button text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Show reset password form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          New Password
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
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
            placeholder="Enter your new password"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Password must be at least 6 characters long.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Confirm New Password
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
            placeholder="Confirm your new password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
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
            Resetting Password...
          </span>
        ) : (
          "Reset Password"
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
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

