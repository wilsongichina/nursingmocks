"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import LoginForm from "@/components/ui/LoginForm";

export default function LoginPageClient() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (!loading && currentUser) {
      router.push("/dashboard");
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

  // Don't render login page if user is logged in (will redirect)
  if (currentUser) {
    return null;
  }

  return (
    <Layout>
      {/* Login Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Login" }]}
              className="text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Welcome Content */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Secure Login
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Welcome Back to{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TEAS Gurus
                  </span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sign in to access your personalized study materials, track your
                  progress, and continue your journey to TEAS exam success.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-green-600"
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
                    <div>
                      <p className="font-medium text-gray-900">Access Study Materials</p>
                      <p className="text-sm text-gray-600">
                        Get instant access to practice tests and study guides
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-green-600"
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
                    <div>
                      <p className="font-medium text-gray-900">Track Your Progress</p>
                      <p className="text-sm text-gray-600">
                        Monitor your performance and improvement over time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-green-600"
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
                    <div>
                      <p className="font-medium text-gray-900">Expert Support</p>
                      <p className="text-sm text-gray-600">
                        Connect with tutors and get personalized guidance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                  <p className="text-gray-600">
                    Enter your credentials to access your account
                  </p>
                </div>
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

