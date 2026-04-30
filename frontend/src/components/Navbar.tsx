"use client";

import { useState, useEffect } from "react";
import { NavBar, NavItem } from "./ui/tubelight-navbar";
import { Home, Search, Trophy, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserProfile from "./UserProfile";
import NotificationBell from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";


export default function GlobalNavbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navItems: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    { name: "Discovery", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
    ...(isAuthenticated ? [{ name: "AI Support", url: "/support", icon: Bot }] : []),
  ];

  return (
    <>
      {/* ─── Global Floating Navbar ─── */}
      <NavBar items={navItems} />

      {/* ─── Scroll Fade Mask (Prevents Text Overlap) ─── */}
      <div className="hidden md:block fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-[40] pointer-events-none" />

      {/* ─── Desktop Header Items (Logo) ─── */}
      <div className="hidden md:flex fixed top-0 left-0 p-4 md:p-6 z-[60]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-border/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Image 
              src="/logo.png" 
              alt="StudentSolution Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase">
            StudentSolution<span className="text-primary">.ai</span>
          </span>
        </Link>
      </div>

      {/* ─── Desktop Header Items (Actions) ─── */}
      <div className="hidden md:flex fixed top-0 right-0 p-4 md:p-6 z-[60] items-center gap-3">
        <NotificationBell />
        <UserProfile />
      </div>

      {/* ─── Mobile Header Bar (Always Top) ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-foreground/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg border border-border/10 shadow-sm">
            <Image 
              src="/logo.png" 
              alt="SS Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground font-display uppercase">
            SS<span className="text-primary">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserProfile />
        </div>
      </div>
    </>
  );
}
