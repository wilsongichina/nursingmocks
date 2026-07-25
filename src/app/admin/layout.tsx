"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuthorization } from "@/hooks/useAdminAuthorization";
import { AdminLoadingState, AdminTopBar } from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";

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
      <SidebarProvider>
        <div className="min-h-screen overflow-x-hidden bg-white">
          <AdminSidebar />
          <div className="transition-all duration-300 md:ml-64">
            <AdminTopBar
              breadcrumbs={[
                { label: "Admin", href: "/admin" },
                { label: "Checking Admin Access" },
              ]}
            />
            <main className="admin-workspace">
              <div className="admin-content flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <AdminLoadingState
                  title="Checking Admin Access"
                  description="Verifying your Firebase authentication and admin permissions."
                />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="admin-auth-screen">
        <div className="admin-auth-card">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-blue-700 text-2xl font-bold">A</span>
            </div>
            <h1 className="admin-section-title mb-2">
              Admin Sign In
            </h1>
            <p className="admin-body">
              Sign in with your Firebase admin email and password.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="user-label mb-2 block"
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
                className="admin-field"
                placeholder="admin@example.com"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="user-label mb-2 block"
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
                className="admin-field"
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
              />
            </div>

            {loginError && (
              <div className="user-alert user-alert-error">
                <span className="user-alert-icon" aria-hidden="true">!</span>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="admin-auth-screen">
        <div className="admin-auth-card">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h1 className="admin-section-title mb-2">
              Access Denied
            </h1>
            <p className="admin-body mb-6">
              Your account is signed in, but it does not have the Firebase
              admin claim required to access this area.
            </p>
            <Link
              href="/dashboard"
              className="admin-button-primary"
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
      <div className="admin-auth-screen">
        <div className="admin-auth-card">
          <div className="text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-amber-700 text-2xl font-bold">!</span>
            </div>
            <h1 className="admin-section-title mb-2">
              Email Login Required
            </h1>
            <p className="admin-body mb-6">
              Admin access requires Firebase email and password sign-in. Sign
              out, then sign in again from this admin page.
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="admin-button-primary"
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
      <div className="admin-auth-screen">
        <div className="admin-auth-card text-center">
          <h1 className="admin-section-title mb-2">
            Could Not Verify Access
          </h1>
          <p className="admin-body mb-6">
            {error || "Admin authorization could not be verified."}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="admin-button-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      {/* Main Content */}
      <main className="admin-root-main">
        {children}
      </main>
    </div>
  );
}
