"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { subscribeUserDocument } from "@/lib/user-document-firestore";
import type { UserDocument } from "@/types/user-document";

const PROTECTED_EXACT_PATHS = new Set([
  "/dashboard",
  "/profile",
  "/progress-reports",
  "/referrals",
]);

function requiresOnboarding(pathname: string) {
  if (PROTECTED_EXACT_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/dashboard/")) return true;
  if (pathname.startsWith("/progress-reports/")) return true;
  if (pathname.startsWith("/referrals/")) return true;

  // Practice pages are readable to visitors according to the existing access
  // rules, but signed-in users should finish setup before using study tools.
  return pathname.includes("practice-test");
}

export default function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null | undefined>(undefined);

  const shouldGuard = useMemo(() => {
    if (pathname === "/onboarding") return false;
    if (pathname.startsWith("/admin")) return false;
    return requiresOnboarding(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!currentUser || !shouldGuard) {
      setUserDoc(undefined);
      return;
    }

    return subscribeUserDocument(
      currentUser.uid,
      (doc) => setUserDoc(doc),
      () => setUserDoc(null)
    );
  }, [currentUser, shouldGuard]);

  useEffect(() => {
    if (loading || !currentUser || !shouldGuard || userDoc === undefined) return;
    if (!hasCompletedOnboarding(userDoc)) {
      router.replace(`/onboarding?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, loading, pathname, router, shouldGuard, userDoc]);

  if (loading || !currentUser || !shouldGuard) return <>{children}</>;
  if (userDoc === undefined) return <>{children}</>;
  if (!hasCompletedOnboarding(userDoc)) {
    return (
      <div className="min-h-[40vh] bg-[#f6f7fb] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#e4e7f2] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6a5cff]">Account setup required</p>
          <h1 className="mt-2 text-2xl font-bold text-[#111827]">Finish onboarding to unlock this page.</h1>
          <p className="mt-2 text-sm text-[#64748b]">You are being redirected to the guided setup wizard.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
