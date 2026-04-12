"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { user, updateProfile, isAuthenticated } = useAuth();
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const toggleTheme = async () => {
    // Current themePreference is "mode-accent"
    const currentFull = user?.themePreference || (theme === "system" ? resolvedTheme : theme) || "system";
    const [_, currentAccent] = currentFull.split("-");

    const nextMode = (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) ? "light" : "dark";
    
    // Combine with existing accent
    const newTheme = currentAccent ? `${nextMode}-${currentAccent}` : nextMode;
    
    setTheme(nextMode);
    
    // Apply accent class to body immediately
    const body = document.body;
    body.classList.remove("theme-violet", "theme-emerald", "theme-ruby", "theme-amber");
    if (currentAccent) {
      body.classList.add(`theme-${currentAccent}`);
    }

    // Persist to DB if logged in
    if (isAuthenticated) {
      await updateProfile({ themePreference: newTheme });
    }
  };

  if (!mounted) {
    return <div className="fixed bottom-1.5 sm:bottom-auto sm:top-5 right-5 z-[100] w-[50px] h-[50px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-1.5 sm:bottom-auto sm:top-5 right-5 z-[100] p-3.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all group"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {currentTheme === "dark" ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={20} className="text-primary fill-primary/20" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={20} className="text-yellow-500 fill-yellow-500/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10 bg-gradient-to-br from-primary/20 to-transparent" />
    </button>
  );
}
