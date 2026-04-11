"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User, 
  ChevronDown,
  LogIn,
  UserPlus,
  Settings,
  ShieldCheck,
  Palette,
  Globe,
  Github,
  Linkedin,
  Twitter
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_MAP: Record<string, any> = {
  "default-1": User,
  "default-2": ShieldCheck,
  "default-3": Palette,
  "default-4": Globe,
  "default-5": Github,
  "default-6": Linkedin,
  "default-7": Twitter,
  "default-8": Settings,
};

export default function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const SelectedAvatar = user?.avatarId ? AVATAR_MAP[user.avatarId] || User : User;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link 
          href="/auth/login"
          className="px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground transition-all hover:bg-white/5"
        >
          Sign In
        </Link>
        <Link 
          href="/auth/register"
          className="px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-black/10 dark:bg-card/20 border border-white/10 backdrop-blur-xl hover:bg-white/5 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
          <SelectedAvatar size={18} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[11px] font-black uppercase tracking-widest text-foreground truncate max-w-[100px]">
            {user?.name}
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            {user?.role}
          </p>
        </div>
        <ChevronDown 
          size={14} 
          className={cn("text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full right-0 mt-3 w-64 glass p-2 rounded-[24px] border border-primary/20 shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-4 border-b border-primary/10 mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Account</p>
              <p className="text-sm font-black text-foreground truncate">{user?.email}</p>
            </div>

            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-foreground/80 hover:text-primary transition-all group"
              >
                <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
              </Link>

              <Link
                href="/tools/submit"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-foreground/80 hover:text-primary transition-all group"
              >
                <PlusCircle size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Submit Tool</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-foreground/80 hover:text-primary transition-all group"
              >
                <Settings size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Settings</span>
              </Link>
            </div>

            <div className="mt-2 pt-2 border-t border-primary/10">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all group"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
