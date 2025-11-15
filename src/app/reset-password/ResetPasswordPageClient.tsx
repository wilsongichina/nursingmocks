"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ResetPasswordForm from "@/components/ui/ResetPasswordForm";

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Redirect to home if user is already logged in
    if (!loading && currentUser) {
      router.push("/");
    }
  }, [currentUser, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render reset password page if user is logged in (will redirect)
  if (currentUser) {
    return null;
  }

  return (
    <Layout>
      {/* Reset Password Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Login", href: "/login" },
                { label: "Reset Password" },
              ]}
              className="text-gray-600"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600">
                Enter your new password below to complete the reset process.
              </p>
            </div>
            <Suspense
              fallback={
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </section>
    </Layout>
  );
}

