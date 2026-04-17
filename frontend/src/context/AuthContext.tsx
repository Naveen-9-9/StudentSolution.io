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
  setTokensAndUser: (accessToken?: string, refreshToken?: string, userData?: User) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const hasSyncedTheme = useRef(false);
  const authChannel = useRef<BroadcastChannel | null>(null);

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
      // Skip initial background check if we are in the middle of a token exchange handshake
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("code") || window.location.pathname === "/auth/success") {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetchApi("/auth/me");
        if (res.success && res.data && res.data.user) {
          setUser(res.data.user);
        }
      } catch (error: unknown) {
        // Not logged in or session expired
        console.log("No active session found.");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Initialize BroadcastChannel for cross-tab sync
    const channel = new BroadcastChannel("auth_sync");
    authChannel.current = channel;

    channel.onmessage = (event) => {
      if (event.data === "login") {
        initAuth();
      } else if (event.data === "logout") {
        setUser(null);
        hasSyncedTheme.current = false;
      }
    };

    return () => {
      channel.close();
    };
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

  const logout = useCallback(async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    setUser(null);
    hasSyncedTheme.current = false;
    authChannel.current?.postMessage("logout");
  }, []);

  const setTokensAndUser = useCallback(async (accessToken?: string, refreshToken?: string, userData?: User) => {
    if (userData) {
      setUser(userData);
      authChannel.current?.postMessage("login");
      return;
    }

    // Fetch user details if not provided (e.g., from Google OAuth exchange)
    try {
      const res = await fetchApi("/auth/me");
      if (res.success && res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        throw new Error("Invalid user data in response");
      }
    } catch (error) {
      console.error("Failed to fetch user after auth success:", error);
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
