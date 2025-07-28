"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { markUserAsFirstTime, clearUserSessionData } from "../utils/tourUtils";
import {
  authService,
  User as AuthUser,
  AuthResponse,
} from "../lib/auth-service";

// Use the production User interface from auth service
type User = AuthUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signInWithGoogle: (accountType?: string) => Promise<{ isNewUser: boolean }>;
  signInWithGoogleToken: (token: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During build time, return a default context to prevent errors
    if (typeof window === 'undefined') {
      return {
        user: null,
        loading: false,
        signIn: async () => {},
        signUp: async () => {},
        signInWithGoogle: async () => ({ isNewUser: false }),
        signInWithGoogleToken: async () => ({ isNewUser: false }),
        logout: async () => {},
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Backend API base URL
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:56223";

  // Check for existing session on mount using production auth service
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await authService.verifySession();

        if (user) {
          setUser({
            ...user,
            uid: user.id.toString(), // For compatibility
          });
        } else if (error) {
          console.warn("Session verification failed:", error);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);

      if (result.success && result.data) {
        setUser({
          ...result.data.user,
          uid: result.data.user.id.toString(), // For compatibility
        });
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, {
        firstName: userData?.firstName || userData?.name || email.split("@")[0],
        lastName: userData?.lastName || "User",
        phone: userData?.phone || "",
        company: userData?.company || "",
      });

      if (result.success && result.data) {
        setUser({
          ...result.data.user,
          uid: result.data.user.id.toString(), // For compatibility
        });

        // Mark as first-time user for tour
        markUserAsFirstTime();
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (accountType?: string) => {
    setLoading(true);
    try {
      // For now, we'll simulate Google sign-in by creating a demo account
      // In production, you would integrate with Google OAuth
      const demoEmail = `demo.${Date.now()}@bitebase.ai`;
      const demoPassword = "demo123456";

      await signUp(demoEmail, demoPassword, {
        name: "Demo User",
        role: accountType || "user",
      });

      return { isNewUser: true };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogleToken = async (token: string) => {
    setLoading(true);
    try {
      const result = await authService.signInWithGoogle(token);

      if (result.success && result.data) {
        setUser({
          ...result.data.user,
          uid: result.data.user.id.toString(), // For compatibility
        });

        // For new users, mark as first-time for tour
        const isNewUser =
          new Date((result.data.user as any).created_at || "").getTime() >
          Date.now() - 24 * 60 * 60 * 1000;

        if (isNewUser) {
          markUserAsFirstTime();
        }

        return { isNewUser };
      } else {
        throw new Error(result.error || "Google authentication failed");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);

      // Clear user session data on logout
      clearUserSessionData();

      // Redirect to auth page after logout
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout request fails, clear local state
      setUser(null);
      clearUserSessionData();
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGoogleToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}