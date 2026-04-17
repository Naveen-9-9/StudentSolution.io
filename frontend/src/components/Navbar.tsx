"use client";

import { useState, useEffect } from "react";
import { NavBar, NavItem } from "./ui/tubelight-navbar";
import { Home, Search, Trophy, MessageSquare, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserProfile from "./UserProfile";
import NotificationBell from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GlobalNavbar() {
  const pathname = usePathname();


  const navItems: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    { name: "Discovery", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
    { name: "AI Support", url: "/support", icon: Bot },
  ];

  const mobileNavLinks = [
    { name: "Home", url: "/", icon: Home },
    { name: "Discovery", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
    { name: "AI Support", url: "/support", icon: Bot },
  ];

  return (
    <>
      {/* ─── Global Floating Navbar ─── */}
      <NavBar items={navItems} />

      {/* ─── Desktop Header Items (Logo) ─── */}
      <div className="hidden md:flex fixed top-0 left-0 p-4 md:p-6 z-[60]">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase group-hover:scale-105 transition-transform">
            StudentSolution<span className="text-cyber-gradient">.ai</span>
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
          <span className="text-lg font-black tracking-tight text-foreground font-display uppercase">
            SS<span className="text-cyber-gradient">.ai</span>
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
