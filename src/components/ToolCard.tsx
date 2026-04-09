"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpCircle, 
  ExternalLink, 
  Info, 
  Star, 
  MessageSquare, 
  Tag as TagIcon, 
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Bookmark
} from "lucide-react";
import { Tool } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import CollectionModal from "./CollectionModal";
import ToolInfoModal from "./ToolInfoModal";
import { useState } from "react";

interface ToolCardProps {
  tool: Tool;
  onUpvote: (id: string) => void;
  isUpvoting: boolean;
}

export default function ToolCard({ tool, onUpvote, isUpvoting }: ToolCardProps) {
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Map database category names to Phase 3 design tokens
  const catToken = tool.category.toLowerCase();
  
  const categoryStyles: Record<string, { accent: string, text: string, bgAlpha: string, border: string, glow: string, badgeBg: string }> = {
    "pdf-converter": { accent: "cat-pdf", text: "text-cat-pdf", bgAlpha: "bg-cat-pdf/10", border: "border-cat-pdf/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.7_0.2_300/0.15)]", badgeBg: "bg-cat-pdf/10" },
    "ppt-maker": { accent: "cat-presentation", text: "text-cat-presentation", bgAlpha: "bg-cat-presentation/10", border: "border-cat-presentation/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.74_0.14_30/0.15)]", badgeBg: "bg-cat-presentation/10" },
    "api": { accent: "cat-api", text: "text-cat-api", bgAlpha: "bg-cat-api/10", border: "border-cat-api/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.75_0.15_180/0.15)]", badgeBg: "bg-cat-api/10" },
    "file-converter": { accent: "cat-file-converter", text: "text-cat-file-converter", bgAlpha: "bg-cat-file-converter/10", border: "border-cat-file-converter/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.7_0.18_250/0.15)]", badgeBg: "bg-cat-file-converter/10" },
    "productivity": { accent: "cat-productivity", text: "text-cat-productivity", bgAlpha: "bg-cat-productivity/10", border: "border-cat-productivity/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.68_0.18_190/0.15)]", badgeBg: "bg-cat-productivity/10" },
    "education": { accent: "cat-education", text: "text-cat-education", bgAlpha: "bg-cat-education/10", border: "border-cat-education/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.72_0.16_210/0.15)]", badgeBg: "bg-cat-education/10" },
    "ai": { accent: "cat-ai", text: "text-cat-ai", bgAlpha: "bg-cat-ai/10", border: "border-cat-ai/30", glow: "shadow-[0_20px_40px_-15px_oklch(0.65_0.22_280/0.15)]", badgeBg: "bg-cat-ai/10" },
    "other": { accent: "primary", text: "text-primary", bgAlpha: "bg-primary/10", border: "border-primary/30", glow: "shadow-[0_20px_40px_-15px_var(--primary)/0.15]", badgeBg: "bg-primary/10" }
  };

  const style = categoryStyles[catToken] || categoryStyles.other;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative"
    >
      {/* Premium Tool Card Body */}
      <div 
        onClick={() => window.open(tool.url, "_blank")}
        className={cn(
          "cursor-pointer overflow-hidden rounded-[32px] p-1 transition-all duration-500",
          "bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-border/20 dark:border-white/5 shadow-xl dark:shadow-2xl group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]",
          `hover:border-l-4 group-hover:${style.border}`
        )}
      >
        <div className={cn(
          "relative p-7 flex flex-col h-full space-y-6 rounded-[28px] transition-all duration-500",
          "group-hover:bg-gradient-to-br group-hover:from-white/50 group-hover:to-transparent dark:group-hover:from-white/5 dark:group-hover:to-transparent"
        )}>
          {/* Top Row: Category & Rating */}
          <div className="flex items-center justify-between">
            <span className={cn(
               "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors",
               style.bgAlpha, style.text
            )}>
              <TagIcon size={10} /> {tool.category.replace("-", " ")}
            </span>
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/20 dark:border-white/10 shadow-sm transition-all group-hover:scale-110 group-hover:border-yellow-400/50">
              <Star size={12} className="fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <span className="text-xs font-black text-foreground">
                {tool.averageRating?.toFixed(1) || "5.0"}
              </span>
            </div>
          </div>

          {/* Middle: Content */}
          <div className="flex-1">
            <h3 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-2 font-display">
              {tool.name}
              <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm font-medium text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Bottom Row: Stats & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-border/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <TrendingUp size={16} />
                <span className="text-sm font-black tracking-tight">{tool.upvoteCount || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare size={16} />
                <span className="text-sm font-bold tracking-tight">{tool.reviewCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInfoModalOpen(true);
                }}
                className="p-3 rounded-2xl bg-secondary/50 text-secondary-foreground hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
              >
                <Info size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBookmarkModalOpen(true);
                }}
                className="p-3 rounded-2xl bg-primary/5 text-primary hover:bg-primary/20 transition-all border border-primary/10"
              >
                <Bookmark size={18} />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote(tool._id);
                }}
                disabled={isUpvoting}
                className={cn(
                  "px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-lg flex items-center gap-2.5",
                  isUpvoting 
                    ? "bg-primary/20 text-primary cursor-wait" 
                    : tool.hasUpvoted
                      ? "bg-primary/20 text-primary border border-primary/40 shadow-primary/30"
                      : "bg-primary text-white hover:shadow-primary/40"
                )}
              >
                <ArrowUpCircle size={18} className={cn(tool.hasUpvoted && "fill-primary")} />
                {isUpvoting ? "Voting" : tool.hasUpvoted ? "Upvoted" : "Upvote"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Hover "Glow" Backdrop */}
      <div className={cn(
        "absolute -inset-2 rounded-[40px] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 -z-10",
        style.glow
      )} />
      
      {/* Premium Tooltip: Only shown on hover/large screens */}
      <div className="hidden lg:block">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            whileHover={{ opacity: 1, scale: 1, x: 0 }}
            className="absolute top-0 -right-4 translate-x-full w-72 p-1 opacity-0 pointer-events-none group-hover:pointer-events-auto z-50"
          >
            <div className="glass p-8 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-primary/20 space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Insight</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Top Benefit</p>
                  <p className="text-sm font-bold text-foreground">Advanced student-focused features and community ranking.</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Shared By</p>
                  <Link 
                    href={`/profile/${tool.submittedBy?._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 mt-1 group/user hover:opacity-80 transition-opacity"
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover/user:scale-110 transition-transform">
                      <UserIcon size={12} />
                    </div>
                    <span className="text-xs font-bold text-foreground capitalize group-hover/user:text-primary transition-colors underline decoration-primary/20 underline-offset-4">{tool.submittedBy?.name || "Community"}</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Popular Tags</p>
                <div className="flex flex-wrap gap-2">
                  {(tool.tags || ["Student", "Productivity", "Essential"]).map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-black uppercase">#{tag}</span>
                  ))}
                </div>
              </div>
              
              <Link 
                href={`/tools/${tool._id}`}
                className="flex items-center justify-between w-full p-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all group/btn"
              >
                View Reviews <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <CollectionModal
        tool={tool}
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
      />

      <ToolInfoModal
        tool={tool}
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </motion.div>
  );
}
