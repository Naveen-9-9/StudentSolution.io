"use client";

import { useState, useEffect } from "react";
import { NavBar, NavItem } from "./ui/tubelight-navbar";
import { Home, Search, Trophy, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserProfile from "./UserProfile";
import NotificationBell from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GlobalNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    { name: "Discovery", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
  ];

  const mobileNavLinks = [
    { name: "Home", url: "/", icon: Home },
    { name: "Discovery", url: "/search", icon: Search },
    { name: "Ranking", url: "/leaderboard", icon: Trophy },
  ];

  return (
    <>
      {/* ─── Desktop Navbar ─── */}
      <div className="hidden md:flex fixed top-0 left-0 p-4 md:p-6 z-[60]">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase group-hover:scale-105 transition-transform">
            StudentSolution<span className="text-cyber-gradient">.ai</span>
          </span>
        </Link>
      </div>

      <div className="hidden md:block">
        <NavBar items={navItems} className="mb-0 sm:pt-6" />
      </div>

      <div className="hidden md:flex fixed top-0 right-0 p-4 md:p-6 z-[60] items-center gap-3">
        <NotificationBell />
        <UserProfile />
      </div>

      {/* ─── Mobile Header Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-foreground/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-foreground font-display uppercase">
            SS<span className="text-cyber-gradient">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ─── Mobile Slide-Out Drawer ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-72 z-[80] bg-background/95 backdrop-blur-2xl border-l border-foreground/10 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-foreground/5">
                <span className="text-sm font-black tracking-tight text-foreground font-display uppercase">
                  Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 py-4 px-3">
                {mobileNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.url === "/" ? pathname === "/" : pathname.startsWith(link.url);
                  return (
                    <Link
                      key={link.name}
                      href={link.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all mb-1",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                      )}
                    >
                      <Icon size={20} strokeWidth={2} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile at bottom */}
              <div className="p-5 border-t border-foreground/5">
                <UserProfile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
