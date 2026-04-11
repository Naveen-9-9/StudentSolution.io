"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Calendar,
  Loader2,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  TrendingUp,
  Award,
  Globe,
  Share2,
  ThumbsUp,
  Star
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Tool, UserProfile } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ToolCard from "@/components/ToolCard";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToolsLoading, setIsToolsLoading] = useState(true);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchApi(`/users/${id}/profile`);
        if (res.success) {
          setProfile(res.data.profile);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserTools = async () => {
      try {
        setIsToolsLoading(true);
        // Using the updated getTools logic that supports submittedBy filtering
        const res = await fetchApi(`/tools?submittedBy=${id}&limit=20`);
        if (res.success) {
          setTools(res.data.tools);
        }
      } catch (error) {
        console.error("Tools fetch error:", error);
      } finally {
        setIsToolsLoading(false);
      }
    };

    fetchProfileData();
    fetchUserTools();
  }, [id]);

  const handleUpvote = async (toolId: string) => {
    if (!isAuthenticated) return router.push("/auth/login");
    if (upvotingIds.has(toolId)) return;
    
    try {
      setUpvotingIds(prev => new Set(prev).add(toolId));
      const res = await fetchApi(`/tools/${toolId}/upvote`, { method: "POST" });
      if (res.success) {
        setTools(prev => prev.map(t => t._id === toolId ? { ...t, upvoteCount: res.data.upvoteCount } : t));
      }
    } finally {
      setUpvotingIds(prev => {
        const next = new Set(prev);
        next.delete(toolId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Decrypting Identity...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
          <Info size={40} />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Identity Not Found</h2>
        <p className="text-muted-foreground text-center max-w-xs font-medium">The user you are looking for does not exist in our community records.</p>
        <Link href="/" className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Navigation Header */}
      <div className="sticky top-20 z-40 px-6 pt-4 pointer-events-none">
        <div className="w-full flex items-center justify-between pointer-events-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 px-5 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button className="flex items-center gap-3 px-5 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
            <Share2 size={16} /> Share Profile
          </button>
        </div>
      </div>

      <div className="w-full px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Profile Hero Section */}
          <section className="relative glass p-10 md:p-16 rounded-[60px] border-primary/20 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12 text-center md:text-left">
               {/* Avatar Sphere */}
               <div className="relative group">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-[56px] glass border-2 border-primary/30 flex items-center justify-center text-primary shadow-2xl relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                    <UserIcon size={id === "admin" ? 64 : 80} className="group-hover:translate-y-2 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-background border-4 border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-xl">
                    <ShieldCheck size={24} />
                  </div>
               </div>

               <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                        <Award size={12} className="fill-primary" /> Verified Student
                      </span>
                      {profile.impactScore > 500 && (
                        <span className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-yellow-500/20">
                          <FlameIcon /> Top 1% Contributor
                        </span>
                      )}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-foreground">{profile.name}</h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground/60">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Calendar size={16} /> Member since {new Date(profile.registeredAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Globe size={16} /> Student Community
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-primary/20 to-transparent w-full" />

                  {/* Stats Quick Grid */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-12">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Impact Score</span>
                        <div className="text-3xl font-black text-primary tracking-tighter">{profile.impactScore.toLocaleString()} pts</div>
                     </div>
                     <div className="w-px h-10 bg-white/5 hidden md:block" />
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Tools Shared</span>
                        <div className="text-3xl font-black text-foreground tracking-tighter">{profile.totalTools} Shared</div>
                     </div>
                     <div className="w-px h-10 bg-white/5 hidden md:block" />
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Positive Impact</span>
                        <div className="text-3xl font-black text-foreground tracking-tighter">+{profile.totalUpvotes} Stars</div>
                     </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Detailed Contributions Section */}
          <div className="grid lg:grid-cols-12 gap-12">
             {/* Left Column: Achievement Badges */}
             <div className="lg:col-span-4 space-y-10">
                <div className="glass p-10 rounded-[48px] border-primary/10 space-y-8">
                   <div className="flex items-center gap-3">
                      <Award className="text-primary" size={24} />
                      <h3 className="text-xl font-black tracking-tight">Identity Badges</h3>
                   </div>
                   
                   <div className="space-y-4">
                      {profile.totalTools > 0 && (
                        <div className="flex items-center gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-colors">
                           <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                              <Zap size={24} className="fill-primary" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">Verified Contributor</p>
                              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Shared {profile.totalTools} resources</p>
                           </div>
                        </div>
                      )}
                      
                      {profile.totalUpvotes > 10 && (
                        <div className="flex items-center gap-4 p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 group hover:bg-indigo-500/10 transition-colors">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                              <TrendingUp size={24} />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-black text-foreground group-hover:text-indigo-400 transition-colors">Rising Star</p>
                              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Received 10+ stars</p>
                           </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 p-5 rounded-3xl bg-secondary/20 border border-secondary/10 opacity-40">
                         <div className="w-12 h-12 rounded-2xl bg-secondary/30 flex items-center justify-center text-secondary-foreground">
                            <Star size={24} />
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-black text-foreground">Top Reviewer</p>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Locked Achievement</p>
                         </div>
                      </div>
                   </div>

                   <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                      View Advanced Records
                   </button>
                </div>

                {/* Community Interaction Card */}
                <div className="glass p-10 rounded-[48px] border-primary/10 relative overflow-hidden group">
                   <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-[40px] transition-transform duration-700 group-hover:scale-150" />
                   <div className="relative z-10 space-y-6">
                      <h4 className="text-3xl font-black tracking-tighter">Community Engagement</h4>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        {profile.name} is an active member of our student ecosystem. Every contribution helps fellow students succeed.
                      </p>
                      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                         <ThumbsUp size={16} className="text-primary" />
                         <span className="text-xs font-black uppercase tracking-widest">{profile.totalUpvotes} community votes received</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Contributions Feed */}
             <div className="lg:col-span-8 space-y-12">
                 <div className="flex items-end justify-between px-4">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={12} /> Contributions Feed
                      </div>
                      <h2 className="text-5xl font-black tracking-tight leading-none">Resource Toolkit</h2>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{tools.length} Tools Shared</div>
                 </div>

                 <AnimatePresence mode="wait">
                  {isToolsLoading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                       {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-80 glass rounded-[48px] border-dashed border-2 animate-pulse bg-white/5" />
                       ))}
                    </div>
                  ) : tools.length > 0 ? (
                    <motion.div 
                      key="feed"
                      className="grid md:grid-cols-2 gap-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {tools.map((tool) => (
                        <ToolCard 
                          key={tool._id} 
                          tool={tool} 
                          onUpvote={() => handleUpvote(tool._id)}
                          isUpvoting={upvotingIds.has(tool._id)}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="p-20 glass rounded-[60px] text-center border-dashed border-2 border-primary/20 bg-white/5 space-y-8">
                      <Zap size={48} className="mx-auto text-primary/40" />
                      <div className="space-y-4">
                        <h4 className="text-2xl font-black">No Shared Tools Yet</h4>
                        <p className="text-muted-foreground font-medium max-w-sm mx-auto">This contributor has not shared any public resources with the community yet.</p>
                      </div>
                    </div>
                  )}
                 </AnimatePresence>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.204 1.15-3.004Z" />
    </svg>
  );
}
