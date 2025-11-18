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

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
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

  function register(email: string, password: string, name: string) {
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (userCredential) => {
        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: name,
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
        // User is signed in, onAuthStateChanged will update currentUser
      });
    });
  }

  function logout() {
    return signOut(auth);
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
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

