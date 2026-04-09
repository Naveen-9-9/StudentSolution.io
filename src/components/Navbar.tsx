"use client";

import { NavBar, NavItem } from "./ui/tubelight-navbar";
import { Home, Search, PlusCircle, LogIn, UserPlus, LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function GlobalNavbar() {
  const { isAuthenticated, logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    { name: "Search", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
  ];

  if (isAuthenticated) {
    navItems.push(
      { name: "Submit", url: "/tools/submit", icon: PlusCircle },
      { name: "Sign Out", url: "#", icon: LogOut, action: logout }
    );
  } else {
    navItems.push(
      { name: "Sign In", url: "/auth/login", icon: LogIn },
      { name: "Register", url: "/auth/register", icon: UserPlus }
    );
  }

  return <NavBar items={navItems} className="mb-0 sm:pt-6" />;
}
