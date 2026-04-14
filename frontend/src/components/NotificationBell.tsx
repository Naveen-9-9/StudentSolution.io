"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;

  return (
    <button className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-foreground hover:bg-foreground/5 transition-colors relative">
      <Bell size={22} strokeWidth={2.5} />
    </button>
  );
}
