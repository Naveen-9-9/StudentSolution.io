"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { fetchApi, API_URL } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  avatarId?: string;
  themePreference?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  setTokensAndUser: (accessToken: string, refreshToken: string, userData?: User) => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const hasSyncedTheme = useRef(false);

  const { setTheme } = useTheme();

  useEffect(() => {
    // Apply compound theme from user preference (e.g., "dark-ruby")
    // Only sync from user object once per session/login to avoid "fighting" with manual selection
    if (user?.themePreference && !hasSyncedTheme.current) {
      const [mode, accent] = user.themePreference.split("-");
      
      // Set base mode (light/dark/system)
      setTheme(mode || "system");

      // Handle accent pulse class on body
      const body = document.body;
      body.classList.remove("theme-violet", "theme-emerald", "theme-ruby", "theme-amber");
      if (accent) {
        body.classList.add(`theme-${accent}`);
      }
      
      hasSyncedTheme.current = true;
    }
  }, [user?.themePreference, setTheme, user?.id]);

  useEffect(() => {
    // Only check initial auth state once per session
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await fetchApi("/auth/me");
          if (res.success && res.data && res.data.user) {
            setUser(res.data.user);
          } else {
            // Invalid token
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } catch (error: unknown) {
          console.warn("Session expired or invalid token. Clearing local storage.", (error as Error)?.message);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    // Sync UI with failed refresh events from the API client
    const handleForcedLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const loginWithGoogle = useCallback(() => {
    // Redirect to backend Google OAuth initiation route
    window.location.href = `${API_URL}/auth/google`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    hasSyncedTheme.current = false;
  }, []);

  const setTokensAndUser = useCallback(async (accessToken: string, refreshToken: string, userData?: User) => {
    // Store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    if (userData) {
      setUser(userData);
      return;
    }

    // Fetch user details if not provided (e.g., from Google OAuth)
    try {
      const res = await fetchApi("/auth/me");
      if (res.success && res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        throw new Error("Invalid user data in response");
      }
    } catch (error) {
      console.error("Failed to fetch user after setting tokens:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const res = await fetchApi("/auth/me", {
        method: "PUT",
        body: data
      });
      if (res.success && res.data && res.data.user) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithGoogle,
    logout,
    setTokensAndUser,
    updateProfile
  }), [user, isLoading, loginWithGoogle, logout, setTokensAndUser, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
