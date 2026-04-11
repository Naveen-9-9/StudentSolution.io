"use client";

import { NavBar, NavItem } from "./ui/tubelight-navbar";
import { Home, Search, Trophy } from "lucide-react";
import Link from "next/link";
import UserProfile from "./UserProfile";

export default function GlobalNavbar() {
  const navItems: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    { name: "Discovery", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 p-4 md:p-6 z-[60]">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase group-hover:scale-105 transition-transform">
            StudentSolution<span className="text-cyber-gradient">.ai</span>
          </span>
        </Link>
      </div>

      <NavBar items={navItems} className="mb-0 sm:pt-6" />

      <div className="fixed top-0 right-0 p-4 md:p-6 z-[60]">
        <UserProfile />
      </div>
    </>
  );  
}
