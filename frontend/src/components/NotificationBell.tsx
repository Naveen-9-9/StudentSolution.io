"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, MessageSquare, ThumbsUp, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { type Notification } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadNotifications = async () => {
      try {
        const res = await fetchApi("/notifications?limit=15");
        if (res.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();

    // Setup SSE for real-time updates
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const streamUrl = `${baseUrl}/notifications/stream`;
    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') return;
        
        // Add new notification and update count
        setNotifications(prev => [data, ...prev].slice(0, 15));
        setUnreadCount(prev => prev + 1);
        
        // Play subtle sound or trigger toast (optional)
        console.log("New notification received:", data);
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      eventSource.close();
    };

    const interval = setInterval(loadNotifications, 60000); // Fallback poll every 60s
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case "new_review": return <MessageSquare size={16} className="text-blue-500" />;
      case "tool_approved": return <ShieldCheck size={16} className="text-emerald-500" />;
      case "tool_upvoted": return <ThumbsUp size={16} className="text-primary" />;
      default: return <Bell size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-foreground hover:bg-foreground/5 transition-colors relative"
      >
        <Bell size={22} strokeWidth={2.5} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background"
            />
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-background rounded-2xl shadow-xl overflow-hidden z-50 border border-foreground/10"
          >
            <div className="flex items-center justify-between p-4 border-b border-foreground/5 bg-background/50">
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-semibold tracking-wider text-primary hover:text-primary-foreground transition-colors py-1 px-3 bg-primary/10 hover:bg-primary rounded-full cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                    <Bell size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-foreground/5">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => !notif.read && markAsRead(notif._id)}
                      className={cn(
                        "p-4 flex gap-3 transition-colors hover:bg-foreground/5 cursor-pointer",
                        !notif.read ? "bg-primary/5" : "opacity-75"
                      )}
                    >
                      <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-foreground/5">
                           {getIconForType(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                           <span className="text-xs text-muted-foreground">
                             {formatDistanceToNow(new Date(notif.createdAt || Date.now()), { addSuffix: true })}
                           </span>
                           {notif.relatedTool && (
                              <Link 
                                href={`/search?category=${encodeURIComponent(notif.relatedTool.category || '')}`} 
                                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide"
                                onClick={(e) => {
                                  if (!notif.read) markAsRead(notif._id);
                                }}
                              >
                                View
                              </Link>
                           )}
                        </div>
                      </div>
                      {!notif.read && (
                        <div className="shrink-0 flex items-center">
                           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
