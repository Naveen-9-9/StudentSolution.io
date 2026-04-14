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
  Loader2,
  Star,
  Sparkles,
  Zap,
  Info,
  Reply,
  Flag,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Edit2,
  Trash2
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Tool, Comment, CommentPagination } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReviewForm from "@/components/ReviewForm";

function CommentItem({ 
  comment, 
  onReply, 
  onEdit,
  onDelete,
  onUpvote, 
  upvotingIds,
  level = 0 
}: { 
  comment: Comment; 
  onReply: (parentId: string, userName: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onUpvote: (commentId: string) => void;
  upvotingIds: Set<string>;
  level?: number;
}) {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.userId?._id;
  const isUpvoting = upvotingIds.has(comment._id);

  return (
    <motion.div 
      initial={{ opacity: 0, x: level > 0 ? 20 : 0, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={cn(
        "relative",
        level > 0 ? "ml-8 md:ml-12 mt-6" : "py-10 first:pt-0 border-b border-foreground/5 last:border-0"
      )}
    >
      {level > 0 && (
         <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent rounded-full" />
      )}

      <div className="flex items-start gap-4 md:gap-6">
        <div className="relative group">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner transition-transform group-hover:scale-110">
            <UserIcon size={level > 0 ? 16 : 24} />
          </div>
          {isAuthor && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full shadow-lg" />}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-black text-sm md:text-lg text-foreground tracking-tight">{comment.userId?.name || "Deleted User"}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {isAuthor && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/20">Author</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {comment.rating && level === 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-500 rounded-xl border border-yellow-400/20 shadow-sm">
                  <Star size={12} className="fill-yellow-500" />
                  <span className="text-xs font-black">{comment.rating}.0</span>
                </div>
              )}
              {isAuthor && (
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(comment)} className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-foreground/5 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => onDelete(comment._id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-foreground/5 rounded-lg"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          </div>

          <div className="glass-adaptive p-6 md:p-8 rounded-[32px] border-foreground/5 hover:border-primary/20 transition-all duration-500 bg-foreground/[0.02] group/box">
             <p className="text-sm md:text-base text-foreground/90 whitespace-pre-wrap leading-relaxed font-medium">
               {comment.text}
             </p>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <button 
              onClick={() => onUpvote(comment._id)}
              disabled={isUpvoting}
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-3 py-2 rounded-xl hover:bg-primary/5",
                isUpvoting ? "opacity-50" : "hover:text-primary text-muted-foreground/60 active:scale-95"
              )}
            >
              <ThumbsUp size={14} className={isUpvoting ? "animate-bounce" : ""} />
              {comment.upvoteCount} Helpful
            </button>
            
            {level === 0 && (
              <button 
                onClick={() => onReply(comment._id, comment.userId.name)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-all active:scale-95 px-3 py-2 rounded-xl hover:bg-primary/5"
              >
                <Reply size={14} />
                Reply
              </button>
            )}

            <button className="text-muted-foreground/30 hover:text-destructive transition-colors ml-auto p-2">
               <Flag size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              onReply={onReply} 
              onEdit={onEdit}
              onDelete={onDelete}
              onUpvote={onUpvote}
              upvotingIds={upvotingIds}
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
  const { isAuthenticated, user } = useAuth();
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  
  const [hasUsed, setHasUsed] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  useEffect(() => {
    // Check if tool has been 'used' (launched)
    const launched = localStorage.getItem(`tool_launched_${id}`);
    if (launched === "true") {
      setHasUsed(true);
    }

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

  const markAsUsed = () => {
    setHasUsed(true);
    localStorage.setItem(`tool_launched_${id}`, "true");
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
        const updateRecursive = (list: Comment[]): Comment[] => {
          return list.map(c => {
            if (c._id === commentId) return { ...c, upvoteCount: res.data.upvoteCount };
            if (c.replies) return { ...c, replies: updateRecursive(c.replies) };
            return c;
          });
        };
        setComments(prev => updateRecursive(prev));
      }
    } finally {
      setUpvotingIds(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this contribution?")) return;
    try {
      const res = await fetchApi(`/comments/${commentId}`, { method: "DELETE" });
      if (res.success) {
        fetchComments();
      }
    } catch (error) {
      console.error("Delete failed:", error);
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
        <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
          <Link href="/" className="flex items-center gap-3 px-5 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4" /> Hub
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
              onClick={markAsUsed}
              className="bg-foreground text-background px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Launch Tool <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Tool Hero Section */}
          <section className="relative glass-adaptive p-10 md:p-20 rounded-[60px] border-primary/20 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 space-y-12">
               <div className="space-y-8">
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-primary/10">
                      <Zap size={12} className="fill-primary" /> {tool.category.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-500 px-4 py-2 rounded-xl border border-yellow-400/20">
                      <Star size={14} className="fill-yellow-500" />
                      <span className="text-xs font-black tracking-tight">{tool.averageRating?.toFixed(1) || "5.0"} RATING</span>
                    </div>
                    {hasUsed && (
                      <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-emerald-500/10">
                        <CheckCircle2 size={12} /> Tool Activated
                      </span>
                    )}
                  </div>

                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-foreground">{tool.name}</h1>
                  
                  <p className="text-xl md:text-3xl text-muted-foreground font-medium leading-relaxed max-w-4xl">
                    {tool.description}
                  </p>
               </div>

               <div className="grid md:grid-cols-3 gap-12 pt-12 border-t border-foreground/5">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                      <ShieldCheck size={20} />
                      <h3 className="text-sm font-black uppercase tracking-widest">How it Works</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {tool.howItWorks || "This community-verified resource offers specialized educational assistance. Launch to discover its full integration capabilities."}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <Zap size={20} />
                      <h3 className="text-sm font-black uppercase tracking-widest">Key Features</h3>
                    </div>
                    <ul className="space-y-3">
                      {(tool.features && tool.features.length > 0 ? tool.features : ["Advanced Algorithms", "Student Dashboard", "Cloud Export"]).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                          <CheckCircle2 size={14} className="text-emerald-500/50" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-blue-500">
                      <CreditCard size={20} />
                      <h3 className="text-sm font-black uppercase tracking-widest">Pricing Matrix</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5">
                        <p className="text-[10px] font-black uppercase text-secondary-foreground/40 mb-1">Free Tier</p>
                        <p className="text-sm font-bold">{tool.pricing?.freeTrial || "Lifetime access to core tools"}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <p className="text-[10px] font-black uppercase text-primary/60 mb-1">Premium Plan</p>
                        <p className="text-sm font-bold">{tool.pricing?.premiumPlan || "Unlock advanced AI features"}</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Reviews Section */}
            <section className="lg:col-span-7 space-y-12">
               <div className="flex items-end justify-between px-2">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                      <MessageSquare size={12} /> Community Feed
                    </div>
                    <h2 className="text-5xl font-black tracking-tight leading-none">Global Insights</h2>
                  </div>
               </div>

               <AnimatePresence mode="wait">
                  {isCommentsLoading && comments.length === 0 ? (
                    <div className="space-y-8">
                      {[...Array(3)].map((_, i) => (
                         <div key={i} className="h-48 glass rounded-[40px] border-dashed border-2 animate-pulse bg-foreground/5" />
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
                          onReply={(id, name) => setReplyTo({ id, name })} 
                          onEdit={(c) => setEditingComment(c)}
                          onDelete={handleDeleteComment}
                          onUpvote={handleCommentUpvote}
                          upvotingIds={upvotingIds}
                        />
                      ))}
                      
                      {pagination && pagination.pages > 1 && pagination.page < pagination.pages && (
                        <div className="pt-12 text-center">
                          <button 
                            onClick={() => fetchComments(pagination.page + 1)}
                            className="px-10 py-5 glass rounded-[24px] text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
                          >
                            Load More Observations
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="p-20 glass-adaptive rounded-[60px] text-center border-dashed border-2 border-primary/20 bg-foreground/5">
                      <Sparkles size={48} className="mx-auto text-primary/40 mb-8" />
                      <h4 className="text-2xl font-black mb-4">Observation Required</h4>
                      <p className="text-muted-foreground font-medium">Be the first to provide a community verification for this tool.</p>
                    </div>
                  )}
               </AnimatePresence>
            </section>

            {/* Sticky Interaction Sidebar */}
            <aside className="lg:col-span-5">
               <div className="sticky top-40 space-y-8">
                  {isAuthenticated ? (
                    hasUsed || replyTo || editingComment ? (
                       <ReviewForm 
                          toolId={id} 
                          initialData={editingComment ? { _id: editingComment._id, text: editingComment.text, rating: editingComment.rating || 0 } : undefined}
                          onSuccess={() => {
                            setReplyTo(null);
                            setEditingComment(null);
                            fetchComments();
                          }}
                          onCancel={() => {
                            setReplyTo(null);
                            setEditingComment(null);
                          }}
                       />
                    ) : (
                       <div className="glass p-10 rounded-[48px] border-primary/20 text-center space-y-8 bg-primary/5 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-20 h-20 bg-primary/20 rounded-[24px] mx-auto flex items-center justify-center text-primary mb-6 shadow-xl group-hover:scale-110 transition-transform">
                             <Lock size={32} />
                          </div>
                          <div className="space-y-3">
                             <h3 className="text-2xl font-black tracking-tight">Review Locked</h3>
                             <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                               To ensure high-quality community feedback, you must launch and interact with this tool before providing a rating.
                             </p>
                          </div>
                          <button 
                             onClick={() => {
                               window.open(tool.url, "_blank");
                               markAsUsed();
                             }}
                             className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                          >
                             Experience Tool <ChevronRight size={18} />
                          </button>
                       </div>
                    )
                  ) : (
                    <div className="glass p-10 rounded-[48px] border-foreground/10 text-center space-y-8 bg-foreground/5">
                      <div className="w-20 h-20 bg-foreground/5 rounded-[24px] mx-auto flex items-center justify-center text-muted-foreground mb-6 shadow-inner">
                         <UserIcon size={32} />
                      </div>
                      <div className="space-y-3">
                         <h3 className="text-2xl font-black tracking-tight">Identify Yourself</h3>
                         <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                            Join our curated community to share your expert insights and earn social authority.
                         </p>
                      </div>
                      <Link 
                         href="/auth/login"
                         className="w-full glass py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-foreground/10 transition-all block"
                      >
                         Sign in to Contribute
                      </Link>
                    </div>
                  )}
                  
                  {/* Community Credits / Info */}
                  <div className="glass p-8 rounded-[38px] border-foreground/5 space-y-6">
                     <div className="flex items-center gap-3">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Community Guidelines</h4>
                     </div>
                     <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                        Ensure your reviews are descriptive and helpful. High-quality contributions increase your global impact score and unlock premium badges.
                     </p>
                  </div>
               </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
