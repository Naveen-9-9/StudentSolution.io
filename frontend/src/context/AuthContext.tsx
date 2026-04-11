"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

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
  }, []);

  const setTokensAndUser = useCallback(async (accessToken: string, refreshToken: string, userData?: User) => {
    // Store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    if (userData) {
      // Use provided user data directly
      setUser(userData);
      return;
    }

    // Fetch user details if not provided (e.g., from Google OAuth)
    try {
      const res = await fetchApi("/auth/me");
      if (res.success && res.data && res.data.user) {
        const fetchedUserData: User = {
          id: res.data.user.id || res.data.user._id,
          email: res.data.user.email,
          name: res.data.user.name,
          role: res.data.user.role,
          isVerified: res.data.user.isVerified,
          bio: res.data.user.bio,
          socialLinks: res.data.user.socialLinks,
          avatarId: res.data.user.avatarId,
          themePreference: res.data.user.themePreference
        };
        setUser(fetchedUserData);
      } else {
        throw new Error("Invalid user data in response");
      }
    } catch (error) {
      console.error("Failed to fetch user after setting tokens:", error);
      // Clear tokens if API call fails - token might be invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw error; // Re-throw so caller can handle it
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithGoogle,
    logout,
    setTokensAndUser,
  }), [user, isLoading, loginWithGoogle, logout, setTokensAndUser]);

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
