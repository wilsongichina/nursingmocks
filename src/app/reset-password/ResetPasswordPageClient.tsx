"use client";

import { Suspense } from "react";
import { Inter } from "next/font/google";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ResetPasswordForm from "@/components/ui/ResetPasswordForm";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

export default function ResetPasswordPageClient() {
  const { loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className={`user-page min-h-screen ${inter.className}`}>
        <main className="user-page-container flex min-h-screen items-center justify-center py-10">
          <section className="user-card w-full max-w-xl p-6">
            <p className="user-card-title">Loading password reset</p>
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

  return (
    <div className={`user-page min-h-screen ${inter.className}`}>
      <main className="user-page-container flex min-h-[100svh] items-start justify-center py-5 sm:items-center sm:py-8 lg:min-h-screen">
        <section className="user-card w-full max-w-xl p-4 sm:p-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.07)] text-[#4338ca]">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="mt-4 text-center">
            <p className="user-eyebrow">Password Reset</p>
            <h1 className="user-page-title mt-2">Choose a New Password</h1>
            <p className="user-body-sm mx-auto mt-2 max-w-md">
              Enter and confirm your new NursingMocks password to complete the reset process.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="mt-6 grid gap-3">
                <div className="user-skeleton h-5 w-2/3" />
                <div className="user-skeleton h-12 w-full" />
                <div className="user-skeleton h-12 w-full" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

