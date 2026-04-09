"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Trash2,
  ThumbsUp,
  Bookmark,
  FolderLock,
  ChevronRight,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ToolSubmission {
  _id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  upvoteCount: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);
  const [pendingQueue, setPendingQueue] = useState<ToolSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'me' | 'moderation' | 'kits' | 'saved'>('me');
  const [collections, setCollections] = useState<{ _id: string; name: string; description?: string; toolCount?: number }[]>([]);
  const [savedTools, setSavedTools] = useState<any[]>([]);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      // My Submissions
      const res = await fetchApi("/tools/me");
      if (res.success) {
        setSubmissions(res.data.tools);
      }

      // If Admin, fetch Queue
      if (isAdmin) {
        const queueRes = await fetchApi("/tools/pending");
        if (queueRes.success) {
          setPendingQueue(queueRes.data.tools);
        }
      }

      // My Collections
      const collectionsRes = await fetchApi("/collections/me");
      if (collectionsRes.success) {
        setCollections(collectionsRes.data.collections);
      }

      // My Saved Tools
      const savedToolsRes = await fetchApi("/collections/me/tools");
      if (savedToolsRes.success) {
        setSavedTools(savedToolsRes.data.tools);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStatusUpdate = async (toolId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetchApi(`/tools/${toolId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      if (res.success) {
        // Refresh local data
        setPendingQueue(prev => prev.filter(t => t._id !== toolId));
        // If it was my own tool, it might've updated too
        if (submissions.find(s => s._id === toolId)) {
          setSubmissions(prev => prev.map(s => s._id === toolId ? { ...s, status } : s));
        }
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
           <Loader2 className="animate-spin" size={32} />
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Synchronizing Headquarters...</p>
      </div>
    );
  }

  const stats = [
    { label: "My Shares", value: submissions.length, icon: Plus, color: "text-primary" },
    { label: "Approved Tools", value: submissions.filter(s => s.status === 'approved').length, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Upvote Reach", value: submissions.reduce((acc, s) => acc + s.upvoteCount, 0), icon: TrendingUp, color: "text-indigo-400" },
    { label: "My Kits", value: collections.length, icon: Bookmark, color: "text-yellow-500" },
    { label: "Admin Status", value: isAdmin ? "Active" : "Standard", icon: ShieldCheck, color: isAdmin ? "text-primary" : "text-muted-foreground" },
  ];


  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetchApi("/auth/resend-verification", { method: "POST" });
      if (res.success) setResendStatus("Check your inbox — fresh signature link dispatched.");
    } catch {
      setResendStatus("Dispatch failed. Try again in a few minutes.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full px-6 py-12">
      {/* Verification Banner */}
      <AnimatePresence>
        {user && !user.isVerified && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mb-12 overflow-hidden"
          >
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary animate-pulse shr-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-primary">Identity Unverified</h4>
                  <p className="text-xs font-medium text-muted-foreground">Limited access enabled. Verify your email to unlock all community features.</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <button 
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {resending ? <Loader2 className="animate-spin" size={14} /> : "Resend Signature Link"}
                </button>
                {resendStatus && <span className="text-[9px] font-bold text-primary italic">{resendStatus}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <LayoutDashboard size={12} /> Personal Headquarters
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            {isAdmin ? "Admin Console" : "My Dashboard"}
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-xl">
            {isAdmin 
              ? "Oversee the community, moderate tool submissions, and monitor growth metrics." 
              : "Track your contributions, manage submissions, and see community feedback."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/tools/submit" className="px-8 py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={20} /> Share New Tool
          </Link>
          <button 
            onClick={() => { logout(); router.push("/"); }}
            className="p-5 glass rounded-[24px] text-muted-foreground hover:text-destructive transition-all"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-8 rounded-[32px] border-primary/10"
          >
            <stat.icon size={24} className={cn("mb-6", stat.color)} />
            <div className="text-4xl font-black mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Switch for Admins */}
      {isAdmin && (
        <div className="flex gap-4 p-2 glass rounded-2xl w-fit mb-12">
          <button 
            onClick={() => setActiveTab('me')}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'me' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary"
            )}
          >
            My Activity
          </button>
          <button 
            onClick={() => setActiveTab('moderation')}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'moderation' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary"
            )}
          >
            Moderation Queue 
            {pendingQueue.length > 0 && (
              <span className="bg-destructive text-white text-[8px] px-1.5 py-0.5 rounded-full">{pendingQueue.length}</span>
            )}
          </button>
        </div>
      )}

      {/* Main Tabs Selection (Non-Admin or Global) */}
      {!isAdmin && (
         <div className="flex gap-4 p-2 glass rounded-2xl w-fit mb-12">
            <button 
              onClick={() => setActiveTab('me')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'me' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary"
              )}
            >
              My Activity
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'saved' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary"
              )}
            >
              Saved Tools ({savedTools.length})
            </button>
            <button 
              onClick={() => setActiveTab('kits')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'kits' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary"
              )}
            >
              My Kits ({collections.length})
            </button>
         </div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Feed Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'me' ? (
              <motion.div key="me" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-2xl font-black tracking-tight">Recent Submissions</h3>
                  <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Discovery Hub</Link>
                </div>
                
                <div className="space-y-4">
                  {submissions.length > 0 ? (
                    submissions.map((submission, idx) => (
                      <ToolListItem key={submission._id} submission={submission} idx={idx} />
                    ))
                  ) : (
                    <EmptyState type="submissions" />
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'saved' ? (
                <motion.div key="saved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black tracking-tight">Saved Tools</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{savedTools.length} TOOLS</p>
                    </div>
                    
                    <div className="space-y-4">
                        {savedTools.length > 0 ? (
                            savedTools.map((tool, idx) => (
                                <SavedToolItem key={tool._id} tool={tool} idx={idx} />
                            ))
                        ) : (
                            <EmptyState type="saved" />
                        )}
                    </div>
                </motion.div>
            ) : activeTab === 'kits' ? (
                <motion.div key="kits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black tracking-tight">Curated Kits</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{collections.length} FOLDERS</p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                        {collections.length > 0 ? (
                            collections.map((collection, idx) => (
                                <CollectionListItem key={collection._id} collection={collection} idx={idx} />
                            ))
                        ) : (
                            <div className="col-span-full">
                                <EmptyState type="kits" />
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
              <motion.div key="moderation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-2xl font-black tracking-tight">Moderation Queue</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{pendingQueue.length} PENDING ITEMS</span>
                </div>
                
                <div className="space-y-4">
                  {pendingQueue.length > 0 ? (
                    pendingQueue.map((item, idx) => (
                      <ModerationItem key={item._id} item={item} idx={idx} onUpdate={handleStatusUpdate} />
                    ))
                  ) : (
                    <EmptyState type="queue" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Profile & Community */}
        <div className="space-y-8">
           <div className="glass p-10 rounded-[40px] border-primary/20 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-primary/40">
                  {user?.name?.[0]}
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight leading-tight">{user?.name}</h4>
                  <p className="text-sm font-medium text-muted-foreground capitalize">{user?.role} Access</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/10">
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">Account Since</span>
                    <span className="text-xs font-black text-foreground">Mar 2026</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">Global Rank</span>
                    <span className="text-xs font-black text-primary">Explorer</span>
                 </div>
              </div>

              <button className="w-full py-4 glass rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all group">
                <Settings size={14} className="group-hover:rotate-90 transition-transform" /> Edit Credentials
              </button>
           </div>

           <div className={cn(
             "glass p-10 rounded-[40px] border-primary/20 relative overflow-hidden",
             isAdmin ? "bg-primary/5" : "bg-emerald-500/5 border-emerald-500/20"
           )}>
               <div className="relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                    isAdmin ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {isAdmin ? <ShieldAlert size={24} /> : <ThumbsUp size={24} />}
                  </div>
                  <h4 className="text-xl font-black mb-2">{isAdmin ? "Admin Security" : "Community Help"}</h4>
                  <p className="text-sm font-medium text-muted-foreground/80 mb-6">
                    {isAdmin ? "You are maintaining community quality standards and safety." : "Your shared tools helped 120+ students this week."}
                  </p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ToolListItem({ submission, idx }: { submission: ToolSubmission, idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
      className="glass p-6 rounded-[32px] border-primary/5 hover:border-primary/20 transition-all group"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text shadow-inner transition-colors",
            submission.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
            submission.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
          )}>
            {submission.status === 'approved' ? <CheckCircle2 size={20} /> : 
             submission.status === 'pending' ? <Clock size={20} /> : <XCircle size={20} />}
          </div>
          <div>
            <h4 className="text-lg font-black group-hover:text-primary transition-colors">{submission.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{submission.category}</span>
              <div className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <Link href={`/tools/${submission._id}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95">
          <ExternalLink size={20} />
        </Link>
      </div>
    </motion.div>
  );
}

function ModerationItem({ item, idx, onUpdate }: { item: ToolSubmission, idx: number, onUpdate: (id: string, status: 'approved' | 'rejected') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
      className="glass p-6 rounded-[32px] border-primary/10 hover:border-primary/30 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-xl font-black text-foreground">{item.name}</h4>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">{item.category}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => onUpdate(item._id, 'rejected')}
             className="px-6 py-3 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
           >
             <Trash2 size={14} /> Reject
           </button>
           <button 
             onClick={() => onUpdate(item._id, 'approved')}
             className="px-6 py-3 rounded-2xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
           >
             <CheckCircle2 size={14} /> Approve
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ type }: { type: 'submissions' | 'queue' | 'kits' | 'saved' }) {
  return (
    <div className="p-12 glass rounded-[40px] text-center border-dashed border-2 border-primary/10">
      <Sparkles size={40} className="mx-auto text-primary/40 mb-6" />
      <p className="text-muted-foreground font-black uppercase tracking-widest text-sm mb-8">
        {type === 'submissions' ? "No tools shared yet." : 
         type === 'queue' ? "Queue is fully cleared!" :
         type === 'kits' ? "You haven't curated any kits yet." :
         "No saved tools yet."}
      </p>
      {type === 'submissions' && (
        <Link href="/tools/submit" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
          <Plus size={16} /> Share Your First Tool
        </Link>
      )}
      {type === 'kits' && (
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
          <Bookmark size={16} /> Discover Tools to Save
        </Link>
      )}
      {type === 'saved' && (
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
          <Bookmark size={16} /> Explore Tools to Save
        </Link>
      )}
    </div>
  );
}

interface Collection {
  _id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  toolCount?: number;
}

function CollectionListItem({ collection, idx }: { collection: Collection; idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="glass p-8 rounded-[40px] border-primary/5 hover:border-primary/20 transition-all group flex flex-col justify-between h-full space-y-8"
        >
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text shadow-inner",
                        collection.isPublic ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                    )}>
                        {collection.isPublic ? <Globe size={24} /> : <FolderLock size={24} />}
                    </div>
                    {collection.isPublic ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Public Hub</span>
                    ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-white/5 px-3 py-1 rounded-full">Private Vault</span>
                    )}
                </div>
                
                <div className="space-y-2">
                    <h4 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors capitalize">{collection.name}</h4>
                    <p className="text-sm font-medium text-muted-foreground/60 line-clamp-2">
                        {collection.description || "A curated kit of student-verified academic resources."}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-primary/5">
                <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">{collection.toolCount || 0} Tools</div>
                </div>
                <button className="p-3 rounded-xl bg-white/5 text-muted-foreground hover:text-primary transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>
        </motion.div>
    );
}

function SavedToolItem({ tool, idx }: { tool: any; idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="glass p-6 rounded-[32px] border-primary/5 hover:border-primary/20 transition-all group"
        >
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner">
                        <Sparkles size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black group-hover:text-primary transition-colors truncate">{tool.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{tool.category}</span>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                                <ThumbsUp size={12} /> {tool.upvoteCount || 0}
                            </span>
                        </div>
                    </div>
                </div>
                <Link href={`/tools/${tool._id}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95 flex-shrink-0">
                    <ExternalLink size={20} />
                </Link>
            </div>
        </motion.div>
    );
}
