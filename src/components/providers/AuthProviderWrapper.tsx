"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/AuthContext";
import { shouldDeferAuthForPublicPath } from "@/lib/public-route-performance";

const FirebaseAuthProvider = dynamic(
  () => import("@/contexts/AuthProviderClient"),
  {
    ssr: false,
  }
);

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const deferAuthForPublicPath = shouldDeferAuthForPublicPath(pathname);

  const publicAuthValue = useMemo<AuthContextType>(
    () => ({
      currentUser: null,
      loading: false,
      login: async () => {
        throw new Error("Authentication is not loaded on this public page.");
      },
      register: async () => {
        throw new Error("Authentication is not loaded on this public page.");
      },
      loginWithGoogle: async () => {
        throw new Error("Authentication is not loaded on this public page.");
      },
      logout: async () => {
        throw new Error("Authentication is not loaded on this public page.");
      },
      resetPassword: async () => {
        throw new Error("Authentication is not loaded on this public page.");
      },
    }),
    []
  );

  if (deferAuthForPublicPath) {
    return (
      <AuthContext.Provider value={publicAuthValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

