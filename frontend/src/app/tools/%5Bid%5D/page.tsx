"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  User as UserIcon,
  Calendar,
  Send,
  Loader2,
  Star,
  Sparkles,
  Zap,
  Info,
  Reply,
  Flag
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Tool, Comment, CommentPagination } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const StarSelector = ({ rating, onChange, disabled }: { rating: number, onChange: (r: number) => void, disabled?: boolean }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && onChange(star)}
          onClick={() => onChange(star)}
          className={cn(
            "transition-all duration-200 p-1",
            disabled ? "cursor-default" : "hover:scale-125 hover:rotate-12",
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30 fill-transparent hover:text-yellow-400/50"
          )}
        >
          <Star size={24} strokeWidth={2.5} />
        </button>
      ))}
      <span className="ml-3 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
        {rating > 0 ? `${rating} / 5 Rating` : "Select a Score"}
      </span>
    </div>
  );
};

function CommentItem({ 
  comment, 
  onReply, 
  onUpvote, 
  isUpvoting,
  level = 0 
}: { 
  comment: Comment; 
  onReply: (parentId: string, userName: string) => void;
  onUpvote: (commentId: string) => void;
  isUpvoting: boolean;
  level?: number;
}) {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.userId._id;

  return (
    <motion.div 
      initial={{ opacity: 0, x: level > 0 ? 20 : 0, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={cn(
        "relative",
        level > 0 ? "ml-8 md:ml-12 mt-6" : "py-8 first:pt-0 border-b border-white/5 last:border-0"
      )}
    >
      {level > 0 && (
         <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent rounded-full" />
      )}

      <div className="flex items-start gap-4 md:gap-6">
        <div className="relative group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <UserIcon size={level > 0 ? 16 : 20} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background border-2 border-primary/20 rounded-full" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-black text-sm md:text-base text-foreground tracking-tight">{comment.userId.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              {isAuthor && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-md border border-primary/20 shadow-sm animate-pulse">YOU</span>
              )}
            </div>
            
            {comment.rating && level === 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-500 rounded-xl border border-yellow-400/20">
                <Star size={10} className="fill-yellow-500" />
                <span className="text-xs font-black">{comment.rating}.0</span>
              </div>
            )}
          </div>

          <div className="glass p-5 md:p-6 rounded-[28px] border-white/5 hover:border-primary/10 transition-all duration-300">
             <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium">
               {comment.text}
             </p>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <button 
              onClick={() => onUpvote(comment._id)}
              disabled={isUpvoting}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                isUpvoting ? "opacity-50" : "hover:text-primary text-muted-foreground/60 active:scale-95"
              )}
            >
              <ThumbsUp size={14} className={isUpvoting ? "animate-bounce" : ""} />
              {comment.upvoteCount} Helpful
            </button>
            
            {level === 0 && (
              <button 
                onClick={() => onReply(comment._id, comment.userId.name)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-all active:scale-95"
              >
                <Reply size={14} />
                Reply
              </button>
            )}

            <button className="text-muted-foreground/30 hover:text-destructive transition-colors ml-auto">
               <Flag size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              onReply={onReply} 
              onUpvote={onUpvote}
              isUpvoting={isUpvoting}
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchToolData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchApi(`/tools/${id}`);
        if (res.success) {
          setTool(res.data.tool);
        }
      } catch (error) {
        console.error("Tool fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToolData();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchComments = async (page = 1) => {
    try {
      setIsCommentsLoading(true);
      const res = await fetchApi(`/comments/tools/${id}?page=${page}&limit=20`);
      if (res.success) {
        setComments(res.data.comments);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Comments fetch error:", error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleToolUpvote = async () => {
    if (!isAuthenticated) return router.push("/auth/login");
    try {
      const res = await fetchApi(`/tools/${id}/upvote`, { method: "POST" });
      if (res.success && tool) {
        setTool({ 
          ...tool, 
          upvoteCount: res.data.upvoteCount,
          hasUpvoted: res.data.upvoted 
        });
      }
    } catch (error) {
       console.error("Tool upvote failed:", error);
    }
  };

  const handleCommentUpvote = async (commentId: string) => {
    if (!isAuthenticated) return router.push("/auth/login");
    if (upvotingIds.has(commentId)) return;
    
    try {
      setUpvotingIds(prev => new Set(prev).add(commentId));
      const res = await fetchApi(`/comments/${commentId}/upvote`, { method: "POST" });
      if (res.success) {
        setComments(prev => {
          const updateRecursive = (list: Comment[]): Comment[] => {
            return list.map(c => {
              if (c._id === commentId) return { ...c, upvoteCount: res.data.upvoteCount };
              if (c.replies) return { ...c, replies: updateRecursive(c.replies) };
              return c;
            });
          };
          return updateRecursive(prev);
        });
      }
    } finally {
      setUpvotingIds(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push("/auth/login");
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetchApi(`/comments/tools/${id}`, {
        method: "POST",
        body: JSON.stringify({
          text: commentText.trim(),
          rating: replyTo ? null : (rating || null), // Only reviews get ratings
          parentId: replyTo?.id || null
        })
      });

      if (res.success) {
        setCommentText("");
        setRating(0);
        setReplyTo(null);
        fetchComments(); // Refresh list to show new comment and stats
        
        // Refresh tool stats if a rating was given
        if (!replyTo && rating > 0) {
           const toolRes = await fetchApi(`/tools/${id}`);
           if (toolRes.success) setTool(toolRes.data.tool);
        }
      }
    } catch (error) {
      console.error("Comment post error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Analyzing Resource...</p>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
          <Info size={40} />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Resource Not Found</h2>
        <Link href="/" className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Navigation & Action Header */}
      <div className="sticky top-20 z-40 px-6 pt-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
          <Link href="/" className="flex items-center gap-3 px-5 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
            Hub
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleToolUpvote}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all",
                tool.hasUpvoted 
                  ? "bg-primary/20 text-primary border border-primary/20" 
                  : "bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <ThumbsUp size={18} className={cn(tool.hasUpvoted && "fill-primary")} /> {tool.upvoteCount}
            </button>
            <a 
              href={tool.url} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-foreground text-background px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Launch <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Tool Hero Section */}
          <section className="relative glass p-10 md:p-16 rounded-[48px] border-primary/20 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
               <div className="flex-1 space-y-8">
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                      <Zap size={12} className="fill-primary" /> {tool.category.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-500 px-4 py-2 rounded-xl border border-yellow-400/20">
                      <Star size={14} className="fill-yellow-500" />
                      <span className="text-xs font-black tracking-tight">{tool.averageRating || "5.0"} REVIEWS</span>
                    </div>
                  </div>

                  <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none text-foreground">{tool.name}</h1>
                  
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <UserIcon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Verified Share</span>
                        <span className="text-sm font-black text-foreground">{tool.submittedBy?.name || 'Community Member'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Added Hub</span>
                        <span className="text-sm font-black text-foreground">{new Date(tool.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
               </div>
               
               <div className="w-full md:w-72 space-y-6">
                  <div className="glass p-8 rounded-[32px] border-primary/10 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Resource Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Popularity</span>
                        <span className="text-sm font-black text-primary flex items-center gap-1.5"><TrendingIcon /> Highly Rated</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Status</span>
                        <span className="text-sm font-black text-emerald-500">Live Resource</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Discussion Header */}
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <MessageSquare size={12} /> Live Discussion
                  </div>
                  <h2 className="text-5xl font-black tracking-tight leading-none">Community Reviews</h2>
                  <p className="text-muted-foreground font-medium text-lg">Share your expert insight or ask questions to the community.</p>
               </div>
               
               <div className="flex items-center gap-4 bg-muted/20 px-6 py-4 rounded-[28px] border border-white/5">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-foreground">{tool.averageRating || "5.0"}</span>
                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Aggregate score</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col items-start">
                    <span className="text-2xl font-black text-foreground">{pagination?.total || 0}</span>
                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Contributions</span>
                  </div>
               </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Write Review Column */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="sticky top-32 glass p-10 rounded-[40px] border-primary/20 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px]" />
                  
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-3">
                        <Sparkles className="text-primary" size={20} />
                        <h3 className="text-xl font-black tracking-tight">
                          {replyTo ? `Replying to ${replyTo.name}` : "Submit Your Review"}
                        </h3>
                     </div>

                     <form onSubmit={handleCommentSubmit} className="space-y-6">
                        {!replyTo && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Your Experience Scale</label>
                            <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                              <StarSelector rating={rating} onChange={setRating} disabled={!isAuthenticated || isSubmitting} />
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Observation Detail</label>
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={isAuthenticated ? (replyTo ? "Type your reply..." : "What makes this tool great for students?") : "Please sign in to join the conversation"}
                            disabled={!isAuthenticated || isSubmitting}
                            className="w-full bg-white/5 border border-border/40 rounded-3xl p-6 text-base font-bold placeholder:font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none min-h-[160px] resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-4">
                          <button
                            type="submit"
                            disabled={!isAuthenticated || !commentText.trim() || isSubmitting}
                            className="w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                          >
                            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (replyTo ? "Post Reply" : "Post Review")}
                            {!isSubmitting && <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                          </button>
                          
                          {replyTo && (
                             <button
                               type="button"
                               onClick={() => { setReplyTo(null); setCommentText(""); }}
                               className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors text-center"
                             >
                               Cancel Global Post
                             </button>
                          )}

                          {!isAuthenticated && (
                             <p className="text-[10px] font-black uppercase tracking-widest text-destructive text-center py-2 bg-destructive/10 rounded-xl px-4 animate-pulse">
                               Only registered members can contribute.
                             </p>
                          )}
                        </div>
                     </form>
                  </div>
                </div>
              </div>

              {/* Comments Feed Column */}
              <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
                <AnimatePresence mode="wait">
                  {isCommentsLoading && comments.length === 0 ? (
                    <div className="space-y-8">
                      {[...Array(3)].map((_, i) => (
                         <div key={i} className="h-48 glass rounded-[40px] border-dashed border-2 animate-pulse bg-white/5" />
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <motion.div 
                      key="feed"
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {comments.map((comment) => (
                        <CommentItem 
                          key={comment._id} 
                          comment={comment} 
                          onReply={(id, name) => {
                             setReplyTo({ id, name });
                             window.scrollTo({ top: document.querySelector('form')?.offsetTop ? document.querySelector('form')!.offsetTop - 200 : 0, behavior: 'smooth' });
                          }} 
                          onUpvote={handleCommentUpvote}
                          isUpvoting={upvotingIds.has(comment._id)}
                        />
                      ))}
                      
                      {pagination && pagination.pages > 1 && (
                        <div className="pt-12 flex justify-center">
                          <button 
                            onClick={() => fetchComments(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="px-10 py-5 glass rounded-[24px] text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:hidden"
                          >
                            Unload More Contributions
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="p-20 glass rounded-[60px] text-center border-dashed border-2 border-primary/20 bg-white/5">
                      <Sparkles size={48} className="mx-auto text-primary/40 mb-8" />
                      <h4 className="text-2xl font-black mb-4">First Interaction Window</h4>
                      <p className="text-muted-foreground font-medium mb-12">This resource has no community observations yet. Be the first to analyze it.</p>
                      <button 
                        onClick={() => window.scrollTo({ top: document.querySelector('form')?.offsetTop ? document.querySelector('form')!.offsetTop - 200 : 0, behavior: 'smooth' })}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                      >
                         Draft First Analysis
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

function TrendingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
