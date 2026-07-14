"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuthorization } from "@/hooks/useAdminAuthorization";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function getAdminLoginError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      return "Invalid email or password.";
    }

    if (error.code === "auth/invalid-email") {
      return "Enter a valid email address.";
    }

    if (error.code === "auth/user-disabled") {
      return "This account has been disabled.";
    }

    if (error.code === "auth/too-many-requests") {
      return "Too many failed attempts. Please try again later.";
    }
  }

  return "Admin sign-in failed. Please try again.";
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { login, logout } = useAuth();
  const { status, error, refresh } = useAdminAuthorization();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setLoginError("Enter your admin email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLoginError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedEmail, password, true);
      setPassword("");
      await refresh();
    } catch (adminLoginError) {
      setLoginError(getAdminLoginError(adminLoginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Checking admin access
          </h1>
          <p className="text-gray-600">
            Verifying your Firebase authentication and admin claim.
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-blue-700 text-2xl font-bold">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Sign In
            </h1>
            <p className="text-gray-600">
              Sign in with your Firebase admin email and password.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLoginError("");
                }}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="admin@example.com"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError("");
                }}
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
              />
            </div>

            {loginError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (status === "not-admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              Your account is signed in, but it does not have the Firebase
              admin claim required to access this area.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "invalid-provider") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200">
          <div className="text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-amber-700 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Login Required
            </h1>
            <p className="text-gray-600 mb-6">
              Admin access requires Firebase email and password sign-in. Sign
              out, then sign in again from this admin page.
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Could Not Verify Access
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Admin authorization could not be verified."}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
