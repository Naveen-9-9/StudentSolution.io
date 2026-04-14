"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Flame, Star, ChevronRight, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Tool } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SpecialText } from "@/components/ui/special-text";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [trendingTools, setTrendingTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<{ _id: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  // Interactive Hero Mesh Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById("hero-section")?.getBoundingClientRect();
      if (rect) {
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [toolsRes, categoriesRes] = await Promise.all([
          fetchApi("/tools?limit=6"),
          fetchApi("/search/categories")
        ]);

        if (toolsRes.success) {
          setTools(toolsRes.data.tools);
        }
        if (categoriesRes.success && categoriesRes.data.categories) {
          const mappedCats = categoriesRes.data.categories.map((c: { name: string; count: number }) => ({
            _id: c.name,
            count: c.count
          }));
          setCategories(mappedCats);
        }
      } catch (error) {
        console.error("Failed to fetch home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTrending = async () => {
      try {
        setTrendingLoading(true);
        const res = await fetchApi("/tools/trending?limit=6");
        if (res.success) {
          setTrendingTools(res.data.tools);
        }
      } catch (error) {
        console.error("Failed to fetch trending tools:", error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchData();
    fetchTrending();
  }, []);

  const handleUpvote = async (toolId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (upvotingIds.has(toolId)) return;

    try {
      setUpvotingIds(prev => new Set(prev).add(toolId));
      const res = await fetchApi(`/tools/${toolId}/upvote`, {
        method: "POST"
      });

      if (res.success) {
        const updateList = (list: Tool[]) => list.map(tool => 
          tool._id === toolId ? { 
            ...tool, 
            upvoteCount: res.data.upvoteCount,
            hasUpvoted: res.data.upvoted 
          } : tool
        );
        setTools(prev => updateList(prev));
        setTrendingTools(prev => updateList(prev));
      }
    } catch (error) {
      console.error("Upvote failed:", error);
    } finally {
      setUpvotingIds(prev => {
        const next = new Set(prev);
        next.delete(toolId);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-12 md:gap-24 pb-16 md:pb-32">
      <section id="hero-section" className="relative pt-20 md:pt-32 pb-12 md:pb-20 overflow-hidden px-4 sm:px-6">
        {/* Cinematic Hero Mesh - Localized Intensity */}
        <div className="absolute inset-0 -z-10 bg-background">
          <motion.div 
            style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
            className="absolute top-0 left-0 w-[1000px] h-[1000px] rounded-full bg-primary/20 blur-[120px] opacity-40 mix-blend-screen transition-opacity"
          />
          <motion.div 
            style={{ x: springX, y: springY, translateX: "-30%", translateY: "-30%" }}
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[100px] opacity-30 mix-blend-screen transition-opacity delay-75"
          />
        </div>

        <div className="w-full relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-full bg-foreground/5 border border-foreground/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4 backdrop-blur-3xl shadow-2xl">
              <Sparkles size={14} className="fill-primary" /> The Ultimate Student Toolkit
            </div>
            
            <motion.h1 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-6 sm:mb-8 font-display"
            >
              <motion.span
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="block"
              >
                Master Your
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500 italic drop-shadow-sm block"
              >
                Academic Success.
              </motion.span>
            </motion.h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground/70 max-w-4xl mx-auto mb-10 sm:mb-16 leading-relaxed font-medium px-2">
              Join thousands of students discovering and sharing the <span className="text-foreground font-bold">community-verified</span> tools that turn complex hurdles into simple solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-10 sm:mb-16 max-w-4xl mx-auto relative px-2 sm:px-4"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 blur-2xl opacity-20 pointer-events-none" />
            <SearchBar />
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            <div className="flex items-center gap-3"><TrendingUp size={16} /> Community Ranked</div>
            <div className="flex items-center gap-3"><ShieldCheck size={16} /> Verified Tools</div>
            <div className="flex items-center gap-3"><Zap size={16} /> Instant Discovery</div>
          </div>
        </div>
      </section>

      {/* 🔥 Trending Today Section */}
      <section className="w-full relative px-6 overflow-hidden">
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                <Flame size={12} className="fill-primary" /> Hot now
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-none">Trending Today</h2>
              <p className="text-muted-foreground font-medium text-lg">Most active community resources in the last 24 hours.</p>
            </div>
            <Link href="/search?sortBy=popular" className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-5 transition-all group p-4 border border-primary/20 rounded-2xl bg-primary/5">
              Live Feed <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {trendingLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="min-w-[340px] md:min-w-[400px] h-64 rounded-[48px]" />
              ))
            ) : trendingTools.length > 0 ? (
              trendingTools.map((tool, idx) => (
                <motion.div 
                  key={tool._id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[280px] sm:min-w-[320px] md:min-w-[400px] snap-center group"
                >
                  <Link href={`/tools/${tool._id}`} className="block relative h-full">
                    <div className="glass p-5 sm:p-8 rounded-3xl sm:rounded-[48px] border-primary/10 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500 relative overflow-hidden h-full">
                       {/* Subtle Shine */}
                       <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                          <div className="flex items-start justify-between">
                             <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary py-1 px-3 bg-primary/10 rounded-lg">{tool.category.replace('-', ' ')}</span>
                                  {idx === 0 && <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500 py-1 px-3 bg-yellow-500/10 rounded-lg flex items-center gap-1"><Flame size={8} /> #1 HOT</span>}
                                </div>
                                <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{tool.name}</h3>
                             </div>
                             <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                                <ChevronRight size={20} />
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/5 text-yellow-500 rounded-lg border border-yellow-400/10">
                                   <Star size={10} className="fill-yellow-500" />
                                   <span className="text-xs font-black">{tool.averageRating || "5.0"}</span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{tool.reviewCount} Reviews</div>
                             </div>
                             <div className="flex items-center gap-2 text-primary font-black">
                                <ThumbsUp size={14} className="fill-primary/20" />
                                <span className="text-sm tracking-tighter">{tool.upvoteCount}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
                <div className="w-full py-16 glass rounded-[40px] text-center border-dashed border-2 border-primary/20">
                    <p className="text-muted-foreground font-black tracking-widest text-xs uppercase">Observation Queue Cleared.</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full px-6 w-full">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-3">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                <Zap size={12} className="fill-blue-500" /> Fast Browse
              </div>
            <h2 className="text-4xl font-black tracking-tight text-foreground leading-none">Explore Categories</h2>
            <p className="text-muted-foreground font-medium text-lg">Specialized toolkits for every student challenge.</p>
          </div>
          <Link href="/search" className="hidden sm:flex items-center gap-2 text-primary text-sm font-black hover:gap-3 transition-all">
            See all toolkit branches <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-28 rounded-[32px] border animate-pulse bg-white/5" />
            ))
          ) : Array.isArray(categories) ? (
            categories.slice(0, 12).map((cat, idx) => {
              const categoryStyles: Record<string, { bg: string, border: string, text: string, iconBg: string, glow: string }> = {
                "pdf-converter": { bg: "hover:bg-cat-pdf/10", border: "hover:border-cat-pdf/40", text: "group-hover:text-cat-pdf", iconBg: "group-hover:bg-cat-pdf", glow: "bg-cat-pdf" },
                "ppt-maker": { bg: "hover:bg-cat-presentation/10", border: "hover:border-cat-presentation/40", text: "group-hover:text-cat-presentation", iconBg: "group-hover:bg-cat-presentation", glow: "bg-cat-presentation" },
                "api": { bg: "hover:bg-cat-api/10", border: "hover:border-cat-api/40", text: "group-hover:text-cat-api", iconBg: "group-hover:bg-cat-api", glow: "bg-cat-api" },
                "file-converter": { bg: "hover:bg-cat-file-converter/10", border: "hover:border-cat-file-converter/40", text: "group-hover:text-cat-file-converter", iconBg: "group-hover:bg-cat-file-converter", glow: "bg-cat-file-converter" },
                "productivity": { bg: "hover:bg-cat-productivity/10", border: "hover:border-cat-productivity/40", text: "group-hover:text-cat-productivity", iconBg: "group-hover:bg-cat-productivity", glow: "bg-cat-productivity" },
                "education": { bg: "hover:bg-cat-education/10", border: "hover:border-cat-education/40", text: "group-hover:text-cat-education", iconBg: "group-hover:bg-cat-education", glow: "bg-cat-education" },
                "ai": { bg: "hover:bg-cat-ai/10", border: "hover:border-cat-ai/40", text: "group-hover:text-cat-ai", iconBg: "group-hover:bg-cat-ai", glow: "bg-cat-ai" },
                "artificial-intelligence": { bg: "hover:bg-cat-ai/10", border: "hover:border-cat-ai/40", text: "group-hover:text-cat-ai", iconBg: "group-hover:bg-cat-ai", glow: "bg-cat-ai" },
              };
              
              const styles = categoryStyles[cat._id.toLowerCase()] || { bg: "hover:bg-primary/10", border: "hover:border-primary/40", text: "group-hover:text-primary", iconBg: "group-hover:bg-primary", glow: "bg-primary" };
              
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    href={`/search?category=${cat._id.toLowerCase()}`}
                    className={cn(
                      "flex items-center justify-between p-5 sm:p-8 rounded-2xl sm:rounded-[38px] glass border-foreground/5 transition-all duration-300 group overflow-hidden relative",
                      styles.bg, styles.border
                    )}
                  >
                    <div className="relative z-10 space-y-1">
                      <h4 className={cn("text-lg font-black text-foreground capitalize transition-colors duration-300 tracking-tight", styles.text)}>
                        {cat._id.replace('-', ' ')}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em]">{cat.count} Resources</p>
                    </div>
                    <div className={cn("p-4 rounded-2xl bg-white/5 transition-all duration-300 relative z-10 group-hover:rotate-45 group-hover:text-white shadow-xl", styles.iconBg)}>
                      <ArrowRight size={18} />
                    </div>
                    {/* Subtle Glow Backdrop */}
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-[0.15] blur-xl transition-all duration-500", styles.glow)} />
                  </Link>
                </motion.div>
              );
            })
          ) : null}
        </div>
      </section>

      {/* Featured Tools Grid */}
      <section className="relative px-6">
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-2">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                <Star size={12} className="fill-indigo-500" /> Expert Choice
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-none">Curated Picks</h2>
              <p className="text-muted-foreground font-medium text-lg">Top-rated resources verified by our community.</p>
            </div>
            <Link href="/search?sortBy=popular" className="text-[10px] p-5 glass rounded-2xl font-black uppercase tracking-[0.2em] text-primary hover:text-white hover:bg-primary transition-all">
              Launch Global Search
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-[48px]" />
              ))
            ) : !isAuthenticated ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="col-span-full py-16 md:py-32 text-center glass border-primary/20 rounded-3xl sm:rounded-[60px] flex flex-col items-center justify-center space-y-8 sm:space-y-10 px-4 sm:px-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="bg-primary/20 w-32 h-32 rounded-[40px] flex items-center justify-center text-primary shadow-2xl animate-float">
                  <User className="w-16 h-16" />
                </div>
                <div className="max-w-xl space-y-4">
                  <h3 className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter leading-none">Member Access Only</h3>
                  <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                    Unlock the full potential of our community. Join thousand of students discovering 50+ specialized tools, reviews, and social rewards.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg justify-center">
                  <Link href="/auth/login" className="flex-1 bg-primary text-primary-foreground font-black px-10 py-6 rounded-[28px] uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl shadow-primary/40 block text-sm">
                    Authenticate
                  </Link>
                  <Link href="/auth/register" className="flex-1 glass text-foreground font-black px-10 py-6 rounded-[28px] uppercase tracking-widest hover:bg-secondary/20 transition-all block text-sm border-border/20">
                    Create Identity
                  </Link>
                </div>
              </motion.div>
            ) : Array.isArray(tools) && tools.length > 0 ? (
              tools.map((tool, idx) => (
                <motion.div
                  key={tool._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ToolCard
                    tool={tool}
                    onUpvote={handleUpvote}
                    isUpvoting={upvotingIds.has(tool._id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass border-dashed border-2 rounded-[60px] border-primary/10">
                <Sparkles size={40} className="mx-auto text-primary/20 mb-6" />
                <p className="text-muted-foreground font-black tracking-widest text-[10px] uppercase">Observation Queue Cleared.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
