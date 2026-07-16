"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Verify the action code from the URL
    const verifyCode = async () => {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");
      
      if (mode && mode !== "resetPassword") {
        setError("This reset page can only process password reset links.");
        setIsVerifying(false);
        setIsValidCode(false);
        return;
      }

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
      } catch (err: unknown) {
        const authError = err as { code?: string; message?: string };
        let errorMessage = "Invalid or expired reset link. Please request a new password reset.";
        
        if (authError.code === "auth/expired-action-code") {
          errorMessage = "This password reset link has expired. Please request a new one.";
        } else if (authError.code === "auth/invalid-action-code") {
          errorMessage = "Invalid reset link. Please request a new password reset.";
        } else if (authError.message) {
          errorMessage = authError.message;
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
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

      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      let errorMessage = "An error occurred. Please try again.";
      
      if (authError.code === "auth/expired-action-code") {
        errorMessage = "This password reset link has expired. Please request a new one.";
      } else if (authError.code === "auth/invalid-action-code") {
        errorMessage = "Invalid reset link. Please request a new password reset.";
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (authError.message) {
        errorMessage = authError.message;
      }
      
      setError(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="mt-6 grid gap-3">
        <p className="user-card-title">Verifying reset link</p>
        <div className="user-skeleton h-12 w-full" />
        <div className="user-skeleton h-12 w-full" />
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="mt-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[rgba(220,38,38,0.22)] bg-[rgba(220,38,38,0.08)] text-[#b91c1c]">
          <XCircle className="h-7 w-7" />
        </div>
        <h2 className="user-section-title mt-4">Invalid Reset Link</h2>
        <p className="user-body-sm mt-2">{error}</p>
        <Link
          href="/forgot-password"
          className="user-button-primary mt-5 w-full"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[rgba(43,170,96,0.22)] bg-[rgba(43,170,96,0.1)] text-[#15803d]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="user-section-title mt-4">Password Reset Successful</h2>
        <p className="user-body-sm mt-2">
          Your password has been successfully reset. You will be redirected to the login page shortly.
        </p>
        <Link
          href="/login"
          className="user-button-primary mt-5 w-full"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
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

      <label className="user-control" htmlFor="password">
        <span className="user-label mb-1">New Password</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
            minLength={8}
            className="user-field pr-12"
            placeholder="Enter your new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#64748b] transition hover:text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#6a5cff]/30"
            aria-label={showPassword ? "Hide new password" : "Show new password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <span className="user-feedback mt-1">
          Password must be at least 8 characters long.
        </span>
      </label>

      <label className="user-control" htmlFor="confirmPassword">
        <span className="user-label mb-1">Confirm New Password</span>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            required
            minLength={8}
            className="user-field pr-12"
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#64748b] transition hover:text-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#6a5cff]/30"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="user-button-primary w-full gap-2"
      >
        {isSubmitting ? "Resetting Password..." : "Reset Password"}
      </button>

      <div className="user-detail-surface p-3 text-center">
        <p className="user-helper">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#4338ca] hover:underline"
          >
            Back to Sign In
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

