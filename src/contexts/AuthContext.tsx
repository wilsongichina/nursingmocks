"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
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

  async function recordLoginEvent(user: User) {
    try {
      const token = await user.getIdToken();
      await fetch("/api/users/login-event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.warn("Login event could not be recorded", error);
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
        await recordLoginEvent(userCredential.user);
      }
    );
  }

  function login(email: string, password: string, rememberMe: boolean = true) {
    // Set persistence based on remember me checkbox
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    return setPersistence(auth, persistence).then(() => {
      return signInWithEmailAndPassword(auth, email, password).then(async (credential) => {
        await recordLoginEvent(credential.user);
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
      await recordLoginEvent(u);
      return credential;
    });
  }

  function resetPassword(email: string) {
    // Get the current domain (works for both development and production)
    const getActionCodeSettings = () => {
      if (typeof window !== 'undefined') {
        // Use the current origin (works for both localhost and production)
        const baseUrl = window.location.origin;
        return {
          url: `${baseUrl}/reset-password`,
          handleCodeInApp: false,
        };
      }
      // Fallback for SSR
      return {
        url: 'https://teasgurus.com/reset-password',
        handleCodeInApp: false,
      };
    };

    return sendPasswordResetEmail(auth, email, getActionCodeSettings());
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
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

