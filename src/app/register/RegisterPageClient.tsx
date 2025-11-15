"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RegisterForm from "@/components/ui/RegisterForm";

export default function RegisterPageClient() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Only redirect if user is already logged in and not showing success message
    // Check sessionStorage to see if we're showing a success message
    if (
      !loading &&
      currentUser &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem("showingRegisterSuccess")
    ) {
      // Small delay to allow any success message to show
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
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

  // Don't render register page if user is logged in and not showing success (will redirect)
  if (
    currentUser &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem("showingRegisterSuccess")
  ) {
    return null;
  }

  return (
    <Layout>
      {/* Register Section */}
      <section className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Register" }]}
              className="text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Benefits Content */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Join Thousands of Students
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Start Your{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    TEAS Journey
                  </span>{" "}
                  Today
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Create your free account and unlock access to expert study
                  materials, practice tests, and personalized exam preparation
                  support.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
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
                      <p className="font-medium text-gray-900">
                        Expert Study Materials
                      </p>
                      <p className="text-sm text-gray-600">
                        Access comprehensive practice tests and study guides
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
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
                      <p className="font-medium text-gray-900">
                        Personalized Learning
                      </p>
                      <p className="text-sm text-gray-600">
                        Get customized study plans tailored to your needs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
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
                      <p className="font-medium text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-600">
                        Get help whenever you need it from our expert team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4">
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Join TEAS Gurus and start your exam preparation journey
                  </p>
                </div>
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
