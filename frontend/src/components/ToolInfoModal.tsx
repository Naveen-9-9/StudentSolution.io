"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Star,
  ExternalLink,
  Tag as TagIcon,
  MessageSquare,
  ThumbsUp,
  Loader2,
  Sparkles,
  ChevronRight,
  User as UserIcon,
  Zap,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { Tool } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Review {
  _id: string;
  text: string;
  rating: number;
  userId: { _id: string; name: string };
  createdAt: string;
  upvoteCount: number;
}

interface ToolInfoModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
}

export default function ToolInfoModal({ tool, isOpen, onClose }: ToolInfoModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchReviews();
    } else {
      setReviews([]); // Clear on close
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, tool._id]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchApi(`/comments/tools/${tool._id}?limit=3&rating_only=true`);
      if (res.success) {
        setReviews(res.data.comments || []);
      }
    } catch {
      setError("Insights stream interrupted");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with extreme blur and pulse */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-[9998] cursor-crosshair"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-xl glass-adaptive rounded-[60px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] border border-primary/20 flex flex-col max-h-[85vh] pointer-events-auto overflow-hidden relative"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

              {/* Header Container */}
              <div className="p-10 pb-6 relative flex-shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-8 right-8 p-3 text-muted-foreground hover:text-foreground transition-all rounded-2xl hover:bg-foreground/10 group active:scale-90"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                      <Zap size={24} className="fill-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Resource Intelligence</span>
                      <h2 className="text-3xl font-black tracking-tighter leading-none text-foreground">{tool.name}</h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-primary/10 text-primary border border-primary/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <TagIcon size={12} /> {tool.category?.replace(/-/g, " ")}
                    </span>
                    <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-500 px-4 py-2 rounded-xl border border-yellow-400/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                      <Star size={14} className="fill-yellow-500" />
                      <span className="text-sm font-black">{tool.averageRating?.toFixed(1) || "5.0"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-xl border border-foreground/5">
                      <ThumbsUp size={12} className="text-muted-foreground/60" />
                      <span className="text-sm font-black">{tool.upvoteCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area — Scrollable */}
              <div className="px-10 pb-10 space-y-10 overflow-y-auto no-scrollbar flex-1">
                {/* Visual Separator */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />

                {/* Description Grid */}
                <div className="grid md:grid-cols-12 gap-8 items-start">
                   <div className="md:col-span-8 space-y-4">
                      <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed italic">
                        &quot;{tool.description}&quot;
                      </p>
                      <div className="flex flex-col gap-2 pt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Verified Registry</span>
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={() => {
                            localStorage.setItem(`tool_launched_${tool._id}`, "true");
                          }}
                          className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline truncate"
                        >
                          <ExternalLink size={12} /> {tool.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                   </div>
                   <div className="md:col-span-4 p-5 rounded-3xl bg-foreground/[0.03] border border-foreground/5 flex flex-col items-center justify-center text-center gap-2">
                      <Layout size={24} className="text-primary/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Tool ID</span>
                      <span className="text-[9px] font-mono text-primary/60">{tool._id.slice(-8).toUpperCase()}</span>
                   </div>
                </div>

                {/* Insights Stream */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Community Sentiment</h3>
                    </div>
                    {tool.reviewCount > 3 && (
                      <span className="text-[9px] font-black text-primary uppercase">+{tool.reviewCount - 3} More</span>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 bg-foreground/[0.02] rounded-[32px] border border-dashed border-foreground/10">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Feedback...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((review, idx) => (
                        <motion.div
                          key={review._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-6 rounded-[32px] bg-foreground/[0.03] border border-foreground/5 hover:border-primary/20 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                               <UserIcon size={16} />
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center justify-between">
                                  <span className="text-sm font-black text-foreground">{review.userId?.name || "Member"}</span>
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 text-yellow-500 rounded-lg">
                                    <Star size={10} className="fill-yellow-500" />
                                    <span className="text-[10px] font-black">{review.rating}.0</span>
                                  </div>
                               </div>
                               <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-2 italic">
                                 &quot;{review.text}&quot;
                               </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-foreground/[0.02] rounded-[32px] border border-dashed border-foreground/10">
                      <Sparkles size={32} className="mx-auto text-primary/20 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">No Verified Insights Found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Command Footer */}
              <div className="p-8 pb-10 flex flex-col gap-4">
                <Link
                  href={`/tools/${tool._id}`}
                  onClick={onClose}
                  className="group relative flex items-center justify-center gap-3 w-full p-6 rounded-[28px] bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Access Full Intelligence <ChevronRight size={18} />
                </Link>
                <div className="flex justify-center">
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                     <ShieldCheckIcon /> Community Verified Protocol v1.4
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

function ShieldCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
