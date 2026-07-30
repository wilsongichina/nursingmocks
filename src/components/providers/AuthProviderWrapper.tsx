"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AuthContext,
  type AuthContextType,
} from "@/contexts/AuthContext";
import {
  shouldDeferAuthForPublicPath,
  shouldLazyLoadAuthForPublicPath,
} from "@/lib/public-route-performance";

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
  const lazyLoadAuthForPublicPath = shouldLazyLoadAuthForPublicPath(pathname);
  const [loadLazyAuth, setLoadLazyAuth] = useState(false);

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

  useEffect(() => {
    if (!lazyLoadAuthForPublicPath) {
      setLoadLazyAuth(false);
      return;
    }

    const windowWithIdle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const handle =
      windowWithIdle.requestIdleCallback?.(() => setLoadLazyAuth(true), {
        timeout: 2500,
      }) ?? window.setTimeout(() => setLoadLazyAuth(true), 1800);

    return () => {
      if (windowWithIdle.cancelIdleCallback && typeof handle === "number") {
        windowWithIdle.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, [lazyLoadAuthForPublicPath]);

  if (deferAuthForPublicPath) {
    return (
      <AuthContext.Provider value={publicAuthValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  if (lazyLoadAuthForPublicPath && !loadLazyAuth) {
    return (
      <AuthContext.Provider value={publicAuthValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <FirebaseAuthProvider showChildrenWhileLoading={lazyLoadAuthForPublicPath}>
      {children}
    </FirebaseAuthProvider>
  );
}

