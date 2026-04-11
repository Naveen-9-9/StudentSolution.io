"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Loader2,
  Award,
  ArrowUpCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user: {
    _id: string;
    name: string;
  };
  toolCount: number;
  upvoteCount: number;
  impactScore: number;
}

interface GlobalStats {
  totalTools: number;
  totalUpvotes: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [lbRes, statsRes] = await Promise.all([
          fetchApi("/users/leaderboard"),
          fetchApi("/users/stats")
        ]);

        if (lbRes.success) {
          setLeaderboard(lbRes.data.leaderboard);
        }
        if (statsRes.success) {
          setStats(statsRes.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Calculating Global Influence...</p>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen pb-32">
      {/* Global Impact Header */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
         {/* Background Elements */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        
        <div className="w-full text-center space-y-8">
           <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl"
           >
              <Trophy size={14} className="fill-primary" /> Global Hall of Fame
           </motion.div>
           
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 italic">Rockstars.</span>
           </h1>
           
           <p className="text-lg md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed font-medium">
              Celebrating the students who drive discovery, verify solutions, and accelerate success for everyone in the ecosystem.
           </p>

           {/* Site Stats */}
           <div className="flex flex-wrap items-center justify-center gap-12 pt-12">
              <div className="text-center group">
                 <div className="text-4xl md:text-6xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                    {stats?.totalTools.toLocaleString() || "0"}
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2">Verified Resources</div>
              </div>
              <div className="w-px h-12 bg-white/5 hidden md:block" />
              <div className="text-center group">
                 <div className="text-4xl md:text-6xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                    {(stats?.totalUpvotes || 0).toLocaleString()}
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2">Community Stars</div>
              </div>
              <div className="w-px h-12 bg-white/5 hidden md:block" />
              <div className="text-center group">
                 <div className="text-4xl md:text-6xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                    {((stats?.totalUpvotes || 0) * 1.5).toFixed(0)}
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2">Study Hours Saved</div>
              </div>
           </div>
        </div>
      </section>

      <div className="w-full px-6 space-y-24">
        {/* The Podium: Top 3 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative">
           {topThree.map((entry, idx) => (
              <motion.div
                key={entry.user._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                className={cn(
                  "relative group",
                  idx === 0 ? "md:order-2 md:-translate-y-12" : idx === 1 ? "md:order-1" : "md:order-3"
                )}
              >
                 <Link href={`/profile/${entry.user._id}`} className="block h-full cursor-pointer">
                    <div className={cn(
                      "glass p-12 rounded-[60px] border-primary/20 hover:border-primary/50 transition-all duration-500 relative overflow-hidden group h-full flex flex-col items-center text-center space-y-8",
                      idx === 0 ? "bg-primary/10 border-primary/40 shadow-[0_50px_100px_-20px_rgba(var(--primary-oklch),0.2)]" : "bg-white/5"
                    )}>
                       {/* Light Glow Shine */}
                       <div className="absolute inset-x-0 -top-px h-32 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                       {/* Trophy Rank Badge */}
                       <div className={cn(
                         "w-20 h-20 rounded-[32px] flex items-center justify-center text-2xl font-black shadow-2xl relative z-10 transition-all duration-500 group-hover:scale-110",
                         idx === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-500/30" :
                         idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white" :
                         "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                       )}>
                          {idx === 0 ? <Crown size={32} /> : idx + 1}
                       </div>

                       <div className="space-y-2 relative z-10">
                          <h3 className="text-3xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{entry.user.name}</h3>
                          <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
                             <Zap size={14} className="text-primary animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest leading-none">{entry.impactScore.toLocaleString()} Impact Points</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-8 w-full pt-8 border-t border-primary/10 relative z-10">
                          <div className="space-y-1">
                             <div className="text-2xl font-black text-foreground">{entry.toolCount}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Shared</div>
                          </div>
                          <div className="space-y-1">
                             <div className="text-2xl font-black text-foreground">{entry.upvoteCount}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Upvotes</div>
                          </div>
                       </div>

                       <div className="pt-4 w-full relative z-10">
                          <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] group-hover:gap-4 transition-all">
                             View Identity <ChevronRight size={14} />
                          </div>
                       </div>
                    </div>
                 </Link>
                 {/* Premium Background Decoration for #1 */}
                 {idx === 0 && (
                   <div className="absolute -inset-4 bg-primary/20 blur-[80px] -z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 )}
              </motion.div>
           ))}
        </section>

        {/* Community Rankings Table */}
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp size={12} /> Rising Talents
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Community Rankings</h2>
              </div>
              <p className="text-muted-foreground font-medium text-lg">Detailed stats for the top community contributors.</p>
           </div>

           <div className="glass rounded-[48px] border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-white/5 border-b border-white/5">
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Rank</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Student</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 hidden md:table-cell">Resources</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 hidden md:table-cell">Recognition</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Impact Score</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Profile</th>
                       </tr>
                    </thead>
                    <tbody>
                       {remaining.map((entry, idx) => (
                          <motion.tr 
                            key={entry.user._id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="border-b border-white/5 hover:bg-primary/5 transition-colors group cursor-pointer"
                            onClick={() => router.push(`/profile/${entry.user._id}`)}
                          >
                             <td className="px-10 py-8">
                                <span className="text-2xl font-black text-muted-foreground/40">#{idx + 4}</span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary font-black group-hover:bg-primary/20 transition-colors">
                                      {entry.user.name[0]}
                                   </div>
                                   <span className="text-lg font-black text-foreground capitalize group-hover:text-primary transition-colors underline decoration-primary/10 underline-offset-8 decoration-2">{entry.user.name}</span>
                                </div>
                             </td>
                             <td className="px-10 py-8 hidden md:table-cell">
                                <div className="text-lg font-black text-foreground">{entry.toolCount} Shared</div>
                             </td>
                             <td className="px-10 py-8 hidden md:table-cell">
                                <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                   <ArrowUpCircle size={14} className="text-primary" />
                                   {entry.upvoteCount} Upvotes
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black">
                                   <Sparkles size={12} className="fill-primary" /> {entry.impactScore.toLocaleString()}
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="p-3 rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary transition-colors hover:scale-110 active:scale-95">
                                   <ChevronRight size={20} />
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </tbody>
                 </table>
                 
                 {remaining.length === 0 && (
                    <div className="py-32 text-center space-y-6">
                       <Award size={48} className="mx-auto text-primary/20" />
                       <p className="text-muted-foreground font-black tracking-widest text-[10px] uppercase">Join the Hall of Fame today.</p>
                       <Link href="/tools/submit" className="inline-block px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-primary/40 shadow-2xl transition-all">
                          Start Contributing
                       </Link>
                    </div>
                 )}
              </div>
           </div>
        </section>

        {/* Achievement Criteria Banner */}
        <section className="glass p-12 md:p-20 rounded-[60px] border-primary/20 relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 -z-10 group-hover:opacity-60 transition-opacity" />
           <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-center md:text-left">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">How is Impact Calculated?</h2>
                 <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                    Our community-driven algorithm rewards both quality and quantity. We value resources that students actually use and approve.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                    <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                       <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-xl">+50</div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Per Shared Tool</p>
                          <p className="text-sm font-bold text-foreground">Verified & Approved</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl">+10</div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Per Upvote</p>
                          <p className="text-sm font-bold text-foreground">Community Recognition</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="relative flex items-center justify-center">
                 <div className="w-64 h-64 md:w-80 md:h-80 bg-primary/10 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse">
                    <Award size={120} className="text-primary opacity-40" />
                 </div>
                 {/* Rotating Glow */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full animate-spin-slow opacity-30" />
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

