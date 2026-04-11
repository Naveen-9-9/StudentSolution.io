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
  User as UserIcon
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

  // SSR safety — portal requires document
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll + fetch reviews
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchReviews();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, tool._id]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchApi(`/comments/tools/${tool._id}?limit=5`);
      if (res.success) {
        setReviews(res.data.comments || []);
      }
    } catch {
      setError("Could not load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const categoryStyles: Record<string, { text: string; bgAlpha: string }> = {
    "pdf-converter": { text: "text-cat-pdf", bgAlpha: "bg-cat-pdf/10" },
    "ppt-maker": { text: "text-cat-presentation", bgAlpha: "bg-cat-presentation/10" },
    "api": { text: "text-cat-api", bgAlpha: "bg-cat-api/10" },
    "file-converter": { text: "text-cat-file-converter", bgAlpha: "bg-cat-file-converter/10" },
    "productivity": { text: "text-cat-productivity", bgAlpha: "bg-cat-productivity/10" },
    "education": { text: "text-cat-education", bgAlpha: "bg-cat-education/10" },
    "ai": { text: "text-cat-ai", bgAlpha: "bg-cat-ai/10" },
    "other": { text: "text-primary", bgAlpha: "bg-primary/10" }
  };

  const catToken = tool.category?.toLowerCase() || "other";
  const style = categoryStyles[catToken] || categoryStyles.other;

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] cursor-pointer"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-lg glass rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] pointer-events-auto"
            >
              {/* Header */}
              <div className="p-10 border-b border-primary/10 relative flex-shrink-0">
                <div className="absolute top-8 right-8">
                  <button
                    onClick={onClose}
                    className="p-3 text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-primary mb-4">
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tool Insights</span>
                </div>

                <h2 className="text-3xl font-black tracking-tight leading-tight pr-12">{tool.name}</h2>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider",
                    style.bgAlpha, style.text
                  )}>
                    <TagIcon size={10} /> {tool.category?.replace(/-/g, " ")}
                  </span>

                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-black text-foreground">
                      {tool.averageRating?.toFixed(1) || "5.0"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ThumbsUp size={12} />
                    <span className="text-xs font-black">{tool.upvoteCount || 0}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare size={12} />
                    <span className="text-xs font-black">{tool.reviewCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Body — scrollable */}
              <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1 min-h-0">
                {/* Description */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black text-primary hover:underline break-all"
                  >
                    <ExternalLink size={12} />
                    {tool.url}
                  </a>
                </div>

                {/* Submitted By */}
                {tool.submittedBy && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Shared By</p>
                    <Link
                      href={`/profile/${tool.submittedBy?._id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity group/user"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover/user:scale-110 transition-transform">
                        <UserIcon size={14} />
                      </div>
                      <span className="text-sm font-bold text-foreground capitalize group-hover/user:text-primary transition-colors">
                        {tool.submittedBy?.name || "Community"}
                      </span>
                    </Link>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Popular Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(tool.tags || ["Student", "Productivity", "Essential"]).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Community Reviews
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Insights...</p>
                    </div>
                  ) : error ? (
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-destructive">{error}</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="grid gap-3">
                      {reviews.map((review) => (
                        <motion.div
                          key={review._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={10}
                                      className={cn(
                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                  {review.userId?.name || "Anonymous"}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                                {review.text}
                              </p>
                            </div>
                            {review.upvoteCount > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground/40 flex-shrink-0">
                                <ThumbsUp size={10} />
                                <span className="text-[9px] font-black">{review.upvoteCount}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MessageSquare size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No reviews yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-black/20 border-t border-white/5 flex-shrink-0">
                <Link
                  href={`/tools/${tool._id}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all"
                >
                  View Full Details <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
