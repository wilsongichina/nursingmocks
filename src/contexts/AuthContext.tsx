"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserDocumentOnRegister } from "@/lib/user-document-firestore";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    programType: string
  ) => Promise<void>;
  loginWithGoogle: (options?: { programType?: string }) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const recordingLoginForUid = useRef<string | null>(null);

  async function recordLoginEvent(user: User) {
    if (typeof window === "undefined") return;
    if (recordingLoginForUid.current === user.uid) return;
    recordingLoginForUid.current = user.uid;

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/users/login-event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Login event request failed with ${response.status}`);
      }
    } catch (error) {
      console.warn("Login event could not be recorded", error);
    } finally {
      if (recordingLoginForUid.current === user.uid) {
        recordingLoginForUid.current = null;
      }
    }
  }

  function register(
    email: string,
    password: string,
    name: string,
    programType: string
  ) {
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (userCredential) => {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        const normalizedProgram = programType.trim();
        await ensureUserDocumentOnRegister(userCredential.user, {
          fullName: name,
          focusAreas: [normalizedProgram],
        });
      }
    );
  }

  function login(email: string, password: string, rememberMe: boolean = true) {
    // Set persistence based on remember me checkbox
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    return setPersistence(auth, persistence).then(() => {
      return signInWithEmailAndPassword(auth, email, password).then(() => {
        // onAuthStateChanged records the login event after Firebase confirms the session.
      });
    });
  }

  function logout() {
    return signOut(auth);
  }

  function loginWithGoogle(options?: { programType?: string }) {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then(async (credential) => {
      const u = credential.user;
      const fullName =
        u.displayName?.trim() || u.email?.split("@")[0] || "";
      const normalizedProgram = options?.programType?.trim();
      await ensureUserDocumentOnRegister(u, {
        fullName,
        providerOverride: "google",
        focusAreas: normalizedProgram ? [normalizedProgram] : undefined,
      });
      return credential;
    });
  }

  async function resetPassword(email: string) {
    const response = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "Could not send password reset email");
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        void recordLoginEvent(user);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

