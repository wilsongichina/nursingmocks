"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type AdminAuthorizationStatus =
  | "loading"
  | "unauthenticated"
  | "invalid-provider"
  | "not-admin"
  | "authorized"
  | "error";

interface AdminAuthorizationState {
  status: AdminAuthorizationStatus;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminAuthorization(): AdminAuthorizationState {
  const { currentUser, loading } = useAuth();
  const [status, setStatus] = useState<AdminAuthorizationStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const checkAdminClaim = useCallback(async () => {
    if (loading) {
      setStatus("loading");
      setError(null);
      return;
    }

    if (!currentUser) {
      setStatus("unauthenticated");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const tokenResult = await currentUser.getIdTokenResult(true);
      if (tokenResult.signInProvider !== "password") {
        setStatus("invalid-provider");
        return;
      }

      if (tokenResult.claims.admin === true) {
        setStatus("authorized");
        return;
      }

      setStatus("not-admin");
    } catch (claimError) {
      console.error("Failed to verify admin authorization.", claimError);
      setStatus("error");
      setError("We could not verify your admin access. Please try again.");
    }
  }, [currentUser, loading]);

  useEffect(() => {
    let cancelled = false;

    async function runCheck() {
      await checkAdminClaim();
    }

    if (!cancelled) {
      void runCheck();
    }

    return () => {
      cancelled = true;
    };
  }, [checkAdminClaim]);

  return {
    status,
    error,
    refresh: checkAdminClaim,
  };
}
